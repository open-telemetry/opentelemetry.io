---
title: Сервіс оплати
linkTitle: Оплата
aliases: [paymentservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: nanos
---

Цей сервіс відповідає за обробку платежів кредитними картками для замовлень. Він поверне помилку, якщо кредитна картка недійсна або платіж не може бути оброблений.

[Сирці сервісу оплати](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/payment/)

## Ініціалізація OpenTelemetry {#initializing-opentelemetry}

Рекомендується `require` Node.js застосунок за допомогою файлу ініціалізації, який ініціалізує SDK та автоінструментування. При ініціалізації OpenTelemetry Node.js SDK у цьому модулі, ви можете опціонально вказати, які бібліотеки автоінструментування використовувати, або скористатися функцією `getNodeAutoInstrumentations()`, яка включає найпопулярніші фреймворки. Нижче наведено приклад файлу ініціалізації (`opentelemetry.js`), який містить весь код, необхідний для ініціалізації SDK та автоінструментування на основі стандартних змінних середовища OpenTelemetry для експорту OTLP, атрибутів ресурсів та назви сервісу. Потім він `require` ваш застосунок з `./index.js`, щоб запустити його після ініціалізації SDK.

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
      // інструментувати fs тільки якщо це частина іншого трасування
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

Потім ви можете використовувати `opentelemetry.js` для запуску вашого застосунку. Це можна зробити у команді `ENTRYPOINT` для `Dockerfile` сервісу.

```dockerfile
ENTRYPOINT [ "node", "--require", "./opentelemetry.js", "./index.js" ]
```

## Трейси {#traces}

### Додавання атрибутів до автоінструментованих відрізків {#add-attributes-to-auto-instrumented-spans}

Під час виконання автоінструментованого коду ви можете отримати поточний відрізок з контексту.

```javascript
const span = opentelemetry.trace.getActiveSpan();
```

Додавання атрибутів до відрізка здійснюється за допомогою функції `setAttributes` на обʼєкті відрізка. У функції `chargeServiceHandler` атрибут додається до відрізка як анонімний обʼєкт (map) для пари ключ/значення атрибута.

```javascript
span.setAttributes({
  'app.payment.amount': parseFloat(`${amount.units}.${amount.nanos}`),
});
```

### Виключення та статус відрізків {#span-exceptions-and-status}

Ви можете використовувати функцію `recordException` обʼєкта відрізка для створення події відрізка з повним стеком обробленої помилки. При записі виключення також обовʼязково встановіть статус відрізка відповідно. Ви можете побачити це у функції `chargeServiceHandler`

```javascript
span.recordException(err);
span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
```

## Метрики {#metrics}

### Створення лічильників та інструментів {#creating-meters-and-instruments}

Лічильники можуть бути створені за допомогою пакету `@opentelemetry/api-metrics`. Ви можете створити лічильники, як показано нижче, а потім використовувати створений лічильник для створення інструментів.

```javascript
const { metrics } = require('@opentelemetry/api-metrics');

const meter = metrics.getMeter('payment');
const transactionsCounter = meter.createCounter('app.payment.transactions');
```

Лічильники та інструменти повинні залишатися. Це означає, що ви повинні отримати лічильник або інструмент один раз, а потім використовувати його за потреби, якщо це можливо.

## Логи {#logs}

TBD

## Baggage

OpenTelemetry Baggage використовується у цьому сервісі для перевірки, чи є запит синтетичним (від генератора навантаження). Синтетичні запити не будуть оплачуватись, що вказується атрибутом відрізка. Файл `charge.js`, який виконує фактичну обробку платежів, має логіку для перевірки baggage.

```javascript
// перевірити baggage на synthetic_request=true та додати атрибут charged відповідно
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
