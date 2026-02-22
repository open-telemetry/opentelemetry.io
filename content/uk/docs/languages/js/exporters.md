---
title: Експортери
weight: 50
description: Обробка та експорт ваших телеметричних даних
default_lang_commit: edc67aafea1ead97b94ed4054d2c3248a34b0389
cSpell:ignore: csps
---

{{% docs/languages/exporters/intro %}}

## Залежності {#otlp-dependencies}

Якщо ви хочете надсилати телеметричні дані на точку доступу OTLP (наприклад, [OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) або [Prometheus](#prometheus)), ви можете вибрати один з трьох різних протоколів для транспортування ваших даних:

- [HTTP/protobuf](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)
- [HTTP/JSON](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http)
- [gRPC](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

Почніть з встановлення відповідних пакунків експортерів як залежності для вашого проєкту:

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

## Використання з Node.js {#usage-with-nodejs}

Далі, налаштуйте експортер для вказівки на точку доступу OTLP. Наприклад, ви можете оновити файл `instrumentation.ts` (або `instrumentation.js`, якщо ви використовуєте JavaScript) з [Початка роботи](/docs/languages/js/getting-started/nodejs/) наступним чином для експорту трас і метрик через OTLP (`http/protobuf`):

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
    // необовʼязково - стандартно url http://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // необовʼязково - колекція користувацьких заголовків, які будуть відправлені з кожним запитом, стандартно порожня
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // url необовʼязковий і може бути пропущений - стандартно http://localhost:4318/v1/metrics
      headers: {}, // необовʼязковий обʼєкт, що містить користувацькі заголовки, які будуть відправлені з кожним запитом
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
    // необовʼязково - стандартно url http://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // необовʼязково - колекція користувацьких заголовків, які будуть відправлені з кожним запитом, стандартно порожня
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // url необовʼязковий і може бути пропущений - стандартно http://localhost:4318/v1/metrics
      headers: {}, // необовʼязковий обʼєкт, що містить користувацькі заголовки, які будуть відправлені з кожним запитом
      concurrencyLimit: 1, // необовʼязкове обмеження на кількість очікуючих запитів
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## Використання в оглядачі {#usage-in-the-browser}

Коли ви використовуєте OTLP експортер у застосунку оглядача, вам потрібно врахувати, що:

1. Використання gRPC для експорту не підтримується
2. [Політики безпеки вмісту][] (CSPs) вашого вебсайту можуть блокувати ваші експорти
3. [Заголовки Cross-Origin Resource Sharing][] (CORS) можуть не дозволяти вашим експортам бути надісланими
4. Вам може знадобитися експонувати ваш колектор для публічного інтернету

Нижче ви знайдете інструкції щодо використання правильного експортера, налаштування ваших CSPs і CORS заголовків та які запобіжні заходи потрібно вжити при відкритті вашого колектора.

### Використання OTLP експортера з HTTP/JSON або HTTP/protobuf {#use-otlp-exporter-with-httpjson-or-httpprotobuf}

[OpenTelemetry Collector Exporter з gRPC][] працює тільки з Node.js, тому ви обмежені використанням [OpenTelemetry Collector Exporter з HTTP/JSON][] або [OpenTelemetry Collector Exporter з HTTP/protobuf][].

Переконайтеся, що отримувач вашого експортера (колектор або бекенд спостереження) приймає `http/json`, якщо ви використовуєте [OpenTelemetry Collector Exporter з HTTP/JSON][], і що ви експортуєте ваші дані на правильну точку доступу з вашим портом, встановленим на 4318.

### Налаштування CSPs {#configure-csps}

Якщо ваш вебсайт використовує політики безпеки вмісту (CSPs), переконайтеся, що домен вашої точки доступу OTLP включений. Якщо ваша точка доступу колектора — `https://collector.example.com:4318/v1/traces`, додайте наступну директиву:

```text
connect-src collector.example.com:4318/v1/traces
```

Якщо ваш CSP не включає точку доступу OTLP, ви побачите повідомлення про помилку, що запит до вашої точки доступу порушує директиву CSP.

### Налаштування CORS заголовків {#configure-cors-headers}

Якщо ваш вебсайт і колектор розміщені на різних джерелах, ваш оглядач може блокувати запити, що виходять до вашого колектора. Вам потрібно налаштувати спеціальні заголовки для Cross-Origin Resource Sharing (CORS).

OpenTelemetry Collector надає [функцію][] для http-приймачів, щоб додати необхідні заголовки для дозволу приймачу приймати трасування з вебоглядачів:

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

### Безпечне експонування вашого колектора {#securely-expose-your-collector}

Щоб отримувати телеметрію від вебзастосунку, вам потрібно дозволити оглядачам ваших користувачів надсилати дані до вашого колектора. Якщо ваш вебзастосунок доступний з публічного інтернету, вам також потрібно зробити ваш колектор доступним для всіх.

Рекомендується не відкривати ваш колектор безпосередньо, а поставити зворотний проксі (NGINX, Apache HTTP Server, ...) перед ним. Зворотний проксі може займатися SSL-розвантаженням, встановленням правильних CORS заголовків та багатьма іншими функціями, специфічними для вебзастосунків.

Нижче ви знайдете конфігурацію для популярного вебсервера NGINX, щоб почати:

```nginx
server {
    listen 80 default_server;
    server_name _;
    location / {
        # Take care of preflight requests
        if ($request_method = 'OPTIONS') {
             add_header 'Access-Control-Max-Age' 1728000;
             add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
             add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
             add_header 'Access-Control-Allow-Credentials' 'true' always;
             add_header 'Content-Type' 'text/plain charset=UTF-8';
             add_header 'Content-Length' 0;
             return 204;
        }

        add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
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

## Консоль {#console}

Щоб налагодити ваше інструментування або побачити значення локально під час розробки, ви можете використовувати експортери, що записують телеметричні дані в консоль (stdout).

Якщо ви слідували настановам з [Початку роботи](/docs/languages/js/getting-started/nodejs/) або [Ручного інструментування](/docs/languages/js/instrumentation), ви вже встановили консольний експортер.

`ConsoleSpanExporter` включений в пакунок [`@opentelemetry/sdk-trace-node`](https://www.npmjs.com/package/@opentelemetry/sdk-trace-node), а `ConsoleMetricExporter` включений в пакунок [`@opentelemetry/sdk-metrics`](https://www.npmjs.com/package/@opentelemetry/sdk-metrics):

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

### Залежності {#prometheus-dependencies}

Встановіть [пакунок експортера](https://www.npmjs.com/package/@opentelemetry/exporter-prometheus) як залежність для вашого застосунку:

```shell
npm install --save @opentelemetry/exporter-prometheus
```

Оновіть вашу конфігурацію OpenTelemetry для використання експортера та надсилання даних до вашого Prometheus бекенду:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // необовʼязково - стандартно 9464
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
    port: 9464, // необовʼязково - стандартно 9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

З вищенаведеним ви можете отримати доступ до ваших метрик за адресою <http://localhost:9464/metrics>. Prometheus або OpenTelemetry Collector з приймачем Prometheus можуть зчитувати метрики з цієї точки доступу.

{{% include "exporters/zipkin-setup.md" %}}

### Залежності {#zipkin-dependencies}

Щоб надсилати ваші трасувальні дані до [Zipkin](https://zipkin.io/), ви можете використовувати
`ZipkinExporter`.

Встановіть [пакунок експортера](https://www.npmjs.com/package/@opentelemetry/exporter-zipkin)
як залежність для вашого застосунку:

```shell
npm install --save @opentelemetry/exporter-zipkin
```

Оновіть вашу конфігурацію OpenTelemetry для використання експортера та надсилання даних до вашого Zipkin бекенду:

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
```

{{% /tab %}} {{< /tabpane >}}

{{% include "exporters/outro.md" `https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-trace-base.SpanExporter.html` %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  spanProcessors: new SimpleSpanProcessor(exporter),
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
  spanProcessors: new SimpleSpanProcessor(exporter)
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

[політики безпеки вмісту]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/
[заголовки cross-origin resource sharing]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[opentelemetry collector exporter з grpc]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
[opentelemetry collector exporter з http/protobuf]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto
[opentelemetry collector exporter з http/json]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http
[функцію]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/confighttp/README.md
