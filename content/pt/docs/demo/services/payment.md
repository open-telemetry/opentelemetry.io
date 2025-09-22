---
title: Serviço de Pagamento
linkTitle: Pagamento
aliases: [paymentservice]
cSpell:ignore: nanos
---

Este serviço é responsável por processar pagamentos com cartão de crédito para pedidos. Ele
retornará um erro se o cartão de crédito for inválido ou o pagamento não puder ser
processado.

[Código fonte do serviço de pagamento](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/payment/)

## Inicializando OpenTelemetry

É recomendado `require` a aplicação Node.js usando um arquivo inicializador que
inicializa o SDK e auto-instrumentação. Ao inicializar o
SDK Node.js do OpenTelemetry nesse módulo, você opcionalmente especifica quais
bibliotecas de auto-instrumentação aproveitar, ou fazer uso da
função `getNodeAutoInstrumentations()` que inclui os frameworks mais populares.
O exemplo abaixo de um arquivo inicializador (`opentelemetry.js`) contém todo o código
necessário para inicializar o SDK e auto-instrumentação baseado em variáveis de ambiente padrão do OpenTelemetry
para exportação OTLP, atributos de recurso e nome do serviço. Ele então `require`s sua aplicação em `./index.js` para iniciá-la uma vez
que o SDK esteja inicializado.

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-grpc');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const {
  alibabaCloudEcsDetector,
} = require('@opentelemetry/resource-detector-alibaba-cloud');
const {
  awsEc2Detector,
  awsEksDetector,
} = require('@opentelemetry/resource-detector-aws');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');
const { gcpDetector } = require('@opentelemetry/resource-detector-gcp');
const {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
} = require('@opentelemetry/resources');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    getNodeAutoInstrumentations({
      // only instrument fs if it is part of another trace
      '@opentelemetry/instrumentation-fs': {
        requireParentSpan: true,
      },
    }),
  ],
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  resourceDetectors: [
    containerDetector,
    envDetector,
    hostDetector,
    osDetector,
    processDetector,
    alibabaCloudEcsDetector,
    awsEksDetector,
    awsEc2Detector,
    gcpDetector,
  ],
});

sdk.start();
```

Você pode então usar `opentelemetry.js` para iniciar sua aplicação. Isso pode ser feito no
comando `ENTRYPOINT` para o `Dockerfile` do serviço.

```dockerfile
ENTRYPOINT [ "node", "--require", "./opentelemetry.js", "./index.js" ]
```

## Rastreamentos

### Adicionar atributos a spans auto-instrumentados

Dentro da execução de código auto-instrumentado você pode obter o span atual do
contexto.

```javascript
const span = opentelemetry.trace.getActiveSpan();
```

Adicionar atributos a um span é realizado usando `setAttributes` no objeto
span. Na função `chargeServiceHandler` um atributo é adicionado ao
span como um objeto anônimo (mapa) para o par chave/valor do atributo.

```javascript
span.setAttributes({
  'app.payment.amount': parseFloat(`${amount.units}.${amount.nanos}`),
});
```

### Exceções de Span e status

Você pode usar a função `recordException` do objeto span para criar um evento de span
com o stack trace completo de um erro tratado. Ao registrar uma exceção também
certifique-se de definir o status do span adequadamente. Você pode ver isso na
função `chargeServiceHandler`

```javascript
span.recordException(err);
span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
```

## Métricas

### Criando Medidores e Instrumentos

Medidores podem ser criados usando o pacote `@opentelemetry/api-metrics`. Você pode
criar medidores como visto abaixo, e então usar o medidor criado para criar
instrumentos.

```javascript
const { metrics } = require('@opentelemetry/api-metrics');

const meter = metrics.getMeter('payment');
const transactionsCounter = meter.createCounter('app.payment.transactions');
```

Medidores e Instrumentos devem permanecer. Isso significa que você deve obter um
Medidor ou um Instrumento uma vez, e então reutilizá-lo conforme necessário, se possível.

## Logs

TBD

## Baggage

O Baggage do OpenTelemetry é utilizado neste serviço para verificar se a requisição é
sintética (do gerador de carga). Requisições sintéticas não serão cobradas,
o que é indicado com um atributo de span. O arquivo `charge.js` que faz o
processamento real de pagamento, tem lógica para verificar o baggage.

```javascript
// verificar baggage para synthetic_request=true, e adicionar atributo charged adequadamente
const baggage = propagation.getBaggage(context.active());
if (
  baggage &&
  baggage.getEntry('synthetic_request') &&
  baggage.getEntry('synthetic_request').value == 'true'
) {
  span.setAttribute('app.payment.charged', false);
} else {
  span.setAttribute('app.payment.charged', true);
}
```
