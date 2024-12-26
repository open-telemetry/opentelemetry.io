---
title: Node.js
description: Отримайте телеметрію для вашого застосунку менш ніж за 5 хвилин!
aliases: [/docs/js/getting_started/nodejs]
weight: 10
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: autoinstrumentations rolldice
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у Node.js.

Ви дізнаєтеся, як інструментувати як [трейси][], так і [метрики][] та як логувати їх у консоль.

> [!NOTE]
>
> Бібліотека логування OpenTelemetry для Node.js все ще знаходиться в розробці, тому приклад для неї не надається нижче. Докладні відомості про статус див. у розділі [Статус і релізи](/docs/languages/js/#status-and-releases).

## Попередні вимоги {#prerequisites}

Переконайтеся, що у вас встановлено наступне локально:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), якщо ви будете використовувати TypeScript.

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [Express](https://expressjs.com/). Якщо ви не використовуєте Express, це нормально — ви можете використовувати OpenTelemetry JavaScript з іншими веб-фреймворками, такими як Koa та Nest.JS. Для повного списку бібліотек для підтримуваних фреймворків дивіться [реєстр](/ecosystem/registry/?component=instrumentation&language=js).

Для складніших прикладів дивіться [приклади](/docs/languages/js/examples/).

### Залежності {#dependencies}

Для початку створіть порожній `package.json` у новій теці:

```shell
npm init -y
```

Далі встановіть залежності Express.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm install express @types/express
npm install -D tsx  # інструмент для безпосереднього запуску файлів TypeScript (.ts) за допомогою node
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

Створіть файл з назвою `app.ts` (або `app.js`, якщо не використовуєте TypeScript) та додайте до нього наступний код:

{{% tabpane text=true %}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { Express } from 'express';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Слухаємо запити на http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Слухаємо запити на http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% /tabpane %}}

Запустіть застосунок за допомогою наступної команди та відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx app.ts
Слухаємо запити на http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Слухаємо запити на http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## Інструментування {#instrumentation}

Нижче показано, як встановити, ініціалізувати та запустити застосунок, інструментований за допомогою OpenTelemetry.

### Додаткові залежності {#additional-dependencies}

Спочатку встановіть Node SDK та пакунок автоінструментування.

Node SDK дозволяє ініціалізувати OpenTelemetry з кількома стандартними конфігураціями, які підходять для більшості випадків використання.

Пакунок `auto-instrumentations-node` встановлює бібліотеки інструментування, які автоматично створюватимуть відрізки, що відповідають викликам коду в бібліотеках. У цьому випадку він надає інструментування для Express, дозволяючи демонстраційному застосунку автоматично створювати відрізки для кожного вхідного запиту.

```shell
npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
```

Щоб знайти всі модулі автоінструментування, ви можете подивитися [реєстр](/ecosystem/registry/?language=js&component=instrumentation).

### Налаштування {#setup}

Налаштування та конфігурація інструментування повинні бути виконані _до_ вашого коду застосунку. Один з інструментів, який часто використовується для цього завдання, це прапорець [--import](https://nodejs.org/api/cli.html#--importmodule).

Створіть файл з назвою `instrumentation.ts` (або `instrumentation.mjs`, якщо не використовуєте TypeScript), який міститиме ваш код налаштування інструментування.

> [!NOTE]
>
> Наступні приклади використання `--import instrumentation.ts` (TypeScript) вимагають Node.js v.20 або новішої версії. Якщо ви використовуєте Node.js v.18, будь ласка, скористайтеся прикладом JavaScript.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## Запуск інструментованого застосунку {#run-the-instrumented-application}

Тепер ви можете запустити ваш застосунок, як зазвичай, але ви можете використовувати прапорець `--import`, щоб завантажити інструментування перед кодом застосунку. Переконайтеся, що у вас немає інших прапорців `--import` або `--require`, що викликають конфлікти, таких як `--require @opentelemetry/auto-instrumentations-node/register` у вашій змінній середовища `NODE_OPTIONS`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx --import ./instrumentation.ts app.ts
Слухаємо запити на http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --import ./instrumentation.mjs app.js
Слухаємо запити на http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі та перезавантажте сторінку кілька разів. Через деякий час ви повинні побачити відрізки, надруковані в консолі за допомогою `ConsoleSpanExporter`.

<details>
<summary>Переглянути приклад виводу</summary>

```js
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // ... some resource attributes elided ...
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-express',
    version: '0.52.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: {
    traceId: '61e8960c349ca2a3a51289e050fd3b82',
    spanId: '631b666604f933bc',
    traceFlags: 1,
    traceState: undefined
  },
  traceState: undefined,
  name: 'request handler - /rolldice',
  id: 'd8fcc05ac4f60c99',
  kind: 0,
  timestamp: 1755719307779000,
  duration: 2801.5,
  attributes: {
    'http.route': '/rolldice',
    'express.name': '/rolldice',
    'express.type': 'request_handler'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // ... some resource attributes elided ...
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-http',
    version: '0.203.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET /rolldice',
  id: '631b666604f933bc',
  kind: 1,
  timestamp: 1755719307777000,
  duration: 4705.75,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    'http.host': 'localhost:8080',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.scheme': 'http',
    'http.target': '/rolldice',
    'http.user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 8080,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 63067,
    'http.status_code': 200,
    'http.status_text': 'OK',
    'http.route': '/rolldice'
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

</details>

Згенерований відрізок відстежує тривалість запиту до маршруту `/rolldice`.

Надішліть ще кілька запитів до точки доступу. Через деякий час ви побачите метрики у виводі консолі, такі як наступні:

<details>
<summary>Переглянути приклад виводу</summary>

```yaml
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'Вимірює тривалість вхідних HTTP-запитів.',
    unit: 'ms',
    valueType: 1,
    advice: {}
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 200,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719307, 782000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.439792,
        max: 5.775,
        sum: 15.370167,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 5, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 6
      }
    },
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 304,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719433, 609000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.39575,
        max: 1.39575,
        sum: 1.39575,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 1
      }
    }
  ]
}
{
  descriptor: {
    name: 'nodejs.eventloop.utilization',
    type: 'OBSERVABLE_GAUGE',
    description: 'Використання циклу подій',
    unit: '1',
    valueType: 1,
    advice: {}
  },
  dataPointType: 2,
  dataPoints: [
    {
      attributes: {},
      startTime: [ 1755719362, 939000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: 0.00843049454565211
    }
  ]
}
{
  descriptor: {
    name: 'v8js.gc.duration',
    type: 'HISTOGRAM',
    description: 'Вимірює тривалість збору сміття за типом, один з major, minor, incremental або weakcb.',
    unit: 's',
    valueType: 1,
    advice: { explicitBucketBoundaries: [ 0.01, 0.1, 1, 10 ] }
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: { 'v8js.gc.type': 'minor' },
      startTime: [ 1755719303, 5000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0005120840072631835,
        max: 0.0022552499771118163,
        sum: 0.006526499509811401,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 6, 0, 0, 0, 0 ] },
        count: 6
      }
    },
    {
      attributes: { 'v8js.gc.type': 'incremental' },
      startTime: [ 1755719310, 812000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0003403329849243164,
        max: 0.0012867081165313721,
        sum: 0.0016270411014556885,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    },
    {
      attributes: { 'v8js.gc.type': 'major' },
      startTime: [ 1755719310, 830000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0025888750553131105,
        max: 0.005744750022888183,
        sum: 0.008333625078201293,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    }
  ]
}
```

</details>

## Наступні кроки {#next-steps}

Збагачуйте ваше інструментування, згенероване автоматично, [ручним інструментуванням](/docs/languages/js/instrumentation) вашого власного коду. Це дозволить вам отримати налаштовані дані спостереження.

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/js/exporters) до одного або кількох бекендів телеметрії.

Якщо ви хочете дослідити складніший приклад, подивіться на [Демо OpenTelemetry](/docs/demo/), яке включає основану на JavaScript [службу оплати](/docs/demo/services/payment/) та основану на TypeScript [службу фронтенду](/docs/demo/services/frontend/).

## Розвʼязання проблем {#troubleshooting}

Щось пішло не так? Ви можете увімкнути діагностичне логування, щоб перевірити, чи OpenTelemetry ініціалізовано правильно:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Для розвʼязання проблем встановіть рівень логування на DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Для розвʼязання проблем встановіть рівень логування на DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[трейси]: /docs/concepts/signals/traces/
[метрики]: /docs/concepts/signals/metrics/
