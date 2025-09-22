---
title: Frontend
cSpell:ignore: typeof
---

O frontend é responsável por fornecer uma interface para usuários, bem como uma API
utilizada pela interface ou outros clientes. A aplicação é baseada em
[Next.JS](https://nextjs.org/) para fornecer uma interface web React e rotas de API.

[Código fonte do frontend](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/frontend/)

## Instrumentação do Servidor

É recomendado usar um módulo Node requerido ao iniciar sua aplicação Node.js
para inicializar o SDK e auto-instrumentação. Ao inicializar
o SDK Node.js do OpenTelemetry, você opcionalmente especifica quais bibliotecas de auto-instrumentação
aproveitar, ou fazer uso da função `getNodeAutoInstrumentations()`
que inclui os frameworks mais populares. O
arquivo `utils/telemetry/Instrumentation.js` contém todo o código necessário para
inicializar o SDK e auto-instrumentação baseado em variáveis de ambiente padrão do
[OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/)
para exportação OTLP, atributos de recurso e nome do serviço.

```javascript
const FrontendTracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  let resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: NEXT_PUBLIC_OTEL_SERVICE_NAME,
  });
  const detectedResources = detectResourcesSync({
    detectors: [browserDetector],
  });
  resource = resource.merge(detectedResources);

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new SessionIdProcessor(),
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url:
            NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
            'http://localhost:4318/v1/traces',
        }),
        {
          scheduledDelayMillis: 500,
        },
      ),
    ],
  });

  const contextManager = new ZoneContextManager();

  provider.register({
    contextManager,
    propagator: new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            span.setAttribute('app.synthetic_request', IS_SYNTHETIC_REQUEST);
          },
        },
      }),
    ],
  });
};
```

Módulos Node requeridos são carregados usando o argumento de linha de comando `--require`.
Isso pode ser feito na seção `scripts.start` do `package.json` e iniciando
a aplicação usando `npm start`.

```json
"scripts": {
  "start": "node --require ./Instrumentation.js server.js",
},
```

## Rastreamentos

### Exceções de Span e status

Você pode usar a função `recordException` do objeto span para criar um evento de span
com o stack trace completo de um erro tratado. Ao registrar uma exceção também
certifique-se de definir o status do span adequadamente. Você pode ver isso no bloco
catch da função `NextApiHandler` no
arquivo `utils/telemetry/InstrumentationMiddleware.ts`.

```typescript
span.recordException(error as Exception);
span.setStatus({ code: SpanStatusCode.ERROR });
```

### Criar novos spans

Novos spans podem ser criados e iniciados usando
`Tracer.startSpan("spanName", options)`. Várias opções podem ser usadas para especificar
como o span pode ser criado.

- `root: true` criará um novo trace, definindo este span como a raiz.
- `links` são usados para especificar links para outros spans (mesmo dentro de outro trace)
  que devem ser referenciados.
- `attributes` são pares chave/valor adicionados a um span, tipicamente usados para
  contexto da aplicação.

```typescript
span = tracer.startSpan(`HTTP ${method}`, {
  root: true,
  kind: SpanKind.SERVER,
  links: [{ context: syntheticSpan.spanContext() }],
  attributes: {
    'app.synthetic_request': true,
    [SEMATTRS_HTTP_TARGET]: target,
    [SEMATTRS_HTTP_STATUS_CODE]: response.statusCode,
    [SEMATTRS_HTTP_METHOD]: method,
    [SEMATTRS_HTTP_USER_AGENT]: headers['user-agent'] || '',
    [SEMATTRS_HTTP_URL]: `${headers.host}${url}`,
    [SEMATTRS_HTTP_FLAVOR]: httpVersion,
  },
});
```

## Instrumentação do Navegador

A interface web que o frontend fornece também é instrumentada para
navegadores web. A instrumentação OpenTelemetry é incluída como parte do componente App do Next.js
em `pages/_app.tsx`. Aqui a instrumentação é importada e inicializada.

```typescript
import FrontendTracer from '../utils/telemetry/FrontendTracer';

if (typeof window !== 'undefined') FrontendTracer();
```

O arquivo `utils/telemetry/FrontendTracer.ts` contém código para inicializar um
TracerProvider, estabelecer uma exportação OTLP, registrar propagadores de contexto de trace,
e registrar bibliotecas de auto-instrumentação específicas para web. Como o navegador
enviará dados para um Coletor OpenTelemetry que provavelmente estará em um
domínio separado, cabeçalhos CORS também são configurados adequadamente.

Como parte das mudanças para carregar o atributo `synthetic_request` para
os serviços de backend, a função de configuração `applyCustomAttributesOnSpan`
foi adicionada à lógica de atributos de span personalizados da biblioteca `instrumentation-fetch`
dessa forma cada span do lado do navegador incluirá isso.

```typescript
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const FrontendTracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  const provider = new WebTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
    }),
    spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())],
  });

  const contextManager = new ZoneContextManager();

  provider.register({
    contextManager,
    propagator: new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            span.setAttribute('app.synthetic_request', 'false');
          },
        },
      }),
    ],
  });
};

export default FrontendTracer;
```

## Métricas

TBD

## Logs

TBD

## Baggage

O Baggage do OpenTelemetry é utilizado no frontend para verificar se a requisição é
sintética (do gerador de carga). Requisições sintéticas forçarão a criação
de um novo trace. O span raiz do novo trace conterá muitos dos mesmos
atributos que um span de requisição HTTP instrumentado.

Para determinar se um item de Baggage está definido, você pode aproveitar a API `propagation`
para analisar o cabeçalho Baggage, e aproveitar a API `baggage` para obter ou definir entradas.

```typescript
const baggage = propagation.getBaggage(context.active());
if (baggage?.getEntry("synthetic_request")?.value == "true") {...}
```
