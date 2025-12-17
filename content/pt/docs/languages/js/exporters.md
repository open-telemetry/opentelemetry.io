---
title: Exporters
weight: 50
default_lang_commit: f49ec57e5a0ec766b07c7c8e8974c83531620af3
description: Processe e exporte seus dados de telemetria
cSpell:ignore: csps
---

{{% docs/languages/exporters/intro %}}

## Dependências {#otlp-dependencies}

Caso queira enviar dados de telemetria para uma rota OTLP (como o
[OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) ou
[Prometheus](#prometheus)), é possível escolher entre três protocolos diferentes
para transportar seus dados:

- [HTTP/protobuf](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)
- [HTTP/JSON](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http)
- [gRPC](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

Comece instalando os respectivos pacotes exportadores como dependência do seu
projeto:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-proto \
  @opentelemetry/exporter-metrics-otlp-proto
```

{{% /tab %}} {{% tab "HTTP/JSON" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http
```

{{% /tab %}} {{% tab gRPC %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc
```

{{% /tab %}} {{< /tabpane >}}

## Uso com Node.js {#usage-with-nodejs}

Em seguida, configure o exportador para apontar para uma rota OTLP. Por exemplo,
você pode atualizar o arquivo `instrumentation.ts` (ou `instrumentation.js` caso
utilize JavaScript) do guia de
[Primeiros Passos](/docs/languages/js/getting-started/nodejs/) para exportar
rastros e métricas via OTLP (`http/protobuf`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // opcional - a URL padrão é http://localhost:4318/v1/traces
    url: '<sua-rota-otlp>/v1/traces',
    // opcional - coleção de cabeçalhos (headers) personalizados a serem enviados com cada requisição, vazio por padrão
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<sua-rota-otlp>/v1/metrics', // a URL é opcional e pode ser omitida - o padrão é http://localhost:4318/v1/metrics
      headers: {}, // um objeto opcional contendo cabeçalhos personalizados a serem enviados com cada requisição
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-proto');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // opcional - a URL padrão é http://localhost:4318/v1/traces
    url: '<sua-rota-otlp>/v1/traces',
    // opcional - coleção de cabeçalhos (headers) personalizados a serem enviados com cada requisição, vazio por padrão
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<sua-rota-otlp>/v1/metrics', // a URL é opcional e pode ser omitida - o padrão é http://localhost:4318/v1/metrics
      headers: {}, // um objeto opcional contendo cabeçalhos personalizados a serem enviados com cada requisição
      concurrencyLimit: 1, // um limite opcional para requisições pendentes
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## Uso no navegador {#usage-in-the-browser}

Ao utilizar o exportador OTLP em uma aplicação baseada em navegador, é
importante considerar:

1. Exportação via gRPC não é suportada
2. As [_Políticas de Segurança de Conteúdo_][Content Security Policies]
   (_Content Security Policies_, ou CSPs) do seu site podem bloquear as
   exportações
3. Os cabeçalhos de [_Compartilhamento de recursos com origens
   diferentes_][Cross-Origin Resource Sharing] (_Cross-Origin Resource Sharing_,
   ou CORS) podem não permitir que suas exportações sejam enviadas
4. Talvez seja necessário expor seu Collector publicamente na internet

Abaixo você encontrará instruções para escolher o exportador correto, configurar
CSPs e cabeçalhos CORS, e entender quais precauções você deve tomar ao expor seu
Collector.

### Usar exportador OTLP com HTTP/JSON ou HTTP/protobuf {#use-otlp-exporter-with-httpjson-or-httpprotobuf}

O [OpenTelemetry Collector Exporter com
gRPC][OpenTelemetry Collector Exporter with gRPC] funciona apenas com Node.js;
portanto, fica limitado ao uso do [OpenTelemetry Collector Exporter com
HTTP/JSON][OpenTelemetry Collector Exporter with HTTP/JSON] ou [OpenTelemetry
Collector Exporter com
HTTP/protobuf][OpenTelemetry Collector Exporter with HTTP/protobuf].

Certifique-se de que o destino do seu exportador (Collector ou _backend_ de
observabilidade) aceite `http/json` caso você esteja utilizando o [OpenTelemetry
Collector Exporter com
HTTP/JSON][OpenTelemetry Collector Exporter with HTTP/JSON], e que os dados
estejam sendo exportados para a rota correta, com a porta definida como 4318.

### Configurar CSPs {#configure-csps}

Caso seu site utilize Políticas de Segurança de Conteúdo (_Content Security
Policies_, ou CSPs), certifique-se de que o domínio da sua rota OTLP esteja
incluído. Caso a rota do Collector seja
`https://collector.example.com:4318/v1/traces`, adicione a seguinte diretiva:

```text
connect-src collector.example.com:4318/v1/traces
```

Caso sua CSP não inclua a rota OTLP, você verá uma mensagem de erro informando
que a requisição para sua rota está violando a diretiva CSP.

### Configurar cabeçalhos CORS {#configure-cors-headers}

Caso seu site e o Collector estejam hospedados em origens diferentes, seu
navegador pode bloquear as requisições enviadas ao Collector. É necessário
configurar cabeçalhos especiais para o Compartilhamento de Recursos com Origens
Diferentes (_Cross-Origin Resource Sharing_, ou CORS).

O OpenTelemetry Collector fornece [um recurso][a feature] para receptores
baseados em HTTP para adicionar os cabeçalhos necessários e permitir que o
receptor aceite rastros de um navegador web:

```yaml
receivers:
  otlp:
    protocols:
      http:
        include_metadata: true
        cors:
          allowed_origins:
            - https://foo.bar.com
            - https://*.test.com
          allowed_headers:
            - Example-Header
          max_age: 7200
```

### Expor seu Collector com segurança {#securely-expose-your-collector}

Para receber telemetria de uma aplicação web, é necessário permitir que os
navegadores dos seus usuários finais enviem dados para o seu Collector. Caso sua
aplicação web esteja acessível pela internet pública, também é necessário tornar
seu Collector acessível para todos.

É recomendado que o Collector não seja exposto diretamente, mas que você utilize
um _proxy_ reverso (NGINX, Apache HTTP Server, ...) na frente dele. O _proxy_
reverso pode cuidar do _SSL-offloading_, definir os cabeçalhos CORS corretos, e
muitas outras funcionalidades específicas para aplicações web.

Abaixo você encontra uma configuração inicial para o servidor NGINX:

```nginx
server {
    listen 80 default_server;
    server_name _;
    location / {
        # Take care of preflight requests
        if ($request_method = 'OPTIONS') {
             add_header 'Access-Control-Max-Age' 1728000;
             add_header 'Access-Control-Allow-Origin' 'nome.do.seu.website.exemplo.com' always;
             add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
             add_header 'Access-Control-Allow-Credentials' 'true' always;
             add_header 'Content-Type' 'text/plain charset=UTF-8';
             add_header 'Content-Length' 0;
             return 204;
        }

        add_header 'Access-Control-Allow-Origin' 'nome.do.seu.website.exemplo.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://collector:4318;
    }
}
```

## Console

Para depurar (_debug_) sua instrumentação ou visualizar valores localmente
durante o desenvolvimento, é possível utilizar exportadores que escrevem dados
de telemetria no console (_stdout_).

Se você seguiu o guia em
[Primeiros Passos](/docs/languages/js/getting-started/nodejs/) ou
[Instrumentação Manual](/docs/languages/js/instrumentation), você já tem o
exportador de console instalado.

O `ConsoleSpanExporter` está incluído no pacote
[`@opentelemetry/sdk-trace-node`](https://www.npmjs.com/package/@opentelemetry/sdk-trace-node),
e o `ConsoleMetricExporter` está incluído no pacote
[`@opentelemetry/sdk-metrics`](https://www.npmjs.com/package/@opentelemetry/sdk-metrics):

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

## Dependências {#prometheus-dependencies}

Instale o
[pacote do exportador](https://www.npmjs.com/package/@opentelemetry/exporter-prometheus)
como uma dependência para sua aplicação:

```shell
npm install --save @opentelemetry/exporter-prometheus
```

Atualize sua configuração do OpenTelemetry para utilizar o exportador e enviar
dados de telemetria para seu _backend_ Prometheus:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // opcional - padrão é 9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // opcional - padrão é 9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

Com a configuração acima, é possível acessar suas métricas em
<http://localhost:9464/metrics>. O Prometheus ou um OpenTelemetry Collector com
o receptor Prometheus podem coletar as métricas desta rota.

{{% include "exporters/zipkin-setup.md" %}}

## Dependências {#zipkin-dependencies}

Para enviar seus dados de rastros para o [Zipkin](https://zipkin.io/), é
possível utilizar o `ZipkinExporter`.

Instale o
[pacote do exportador](https://www.npmjs.com/package/@opentelemetry/exporter-zipkin)
como uma dependência para sua aplicação:

```shell
npm install --save @opentelemetry/exporter-zipkin
```

Atualize sua configuração do OpenTelemetry para utilizar o exportador e enviar
dados para seu _backend_ Zipkin:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

{{% include "exporters/outro.md" `https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-trace-base.SpanExporter.html` %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const sdk = new opentelemetry.NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

[content security policies]:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/
[cross-origin resource sharing]:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[opentelemetry collector exporter with grpc]:
  https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
[opentelemetry collector exporter with http/protobuf]:
  https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto
[opentelemetry collector exporter with http/json]:
  https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http
[a feature]:
  https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/confighttp/README.md
