---
title: Node.js
description: Отримайте телеметрію для вашого застосунку менш ніж за 5 хвилин!
aliases: [/docs/js/getting_started/nodejs]
weight: 10
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
cSpell:ignore: autoinstrumentations KHTML rolldice
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у Node.js.

Ви дізнаєтеся, як інструментувати як [трейси][], так і [метрики][] та як логувати їх у консоль.

{{% alert title="Примітка" %}} Бібліотека логування OpenTelemetry для Node.js все ще знаходиться в розробці, тому приклад для неї не надається нижче. Докладні відомості про статус див. у розділі [Статус і релізи](/docs/languages/js/#status-and-releases).{{% /alert %}}

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
npm install typescript \
  ts-node \
  @types/node \
  express \
  @types/express

# ініціалізуйте typescript
npx tsc --init
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
$ npx ts-node app.ts
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

Налаштування та конфігурація інструментування повинні бути виконані _до_ вашого коду застосунку. Один з інструментів, який часто використовується для цього завдання, це прапорець [--require](https://nodejs.org/api/cli.html#-r---require-module).

Створіть файл з назвою `instrumentation.ts` (або `instrumentation.js`, якщо не використовуєте TypeScript), який міститиме ваш код налаштування інструментування.

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
/*instrumentation.js*/
// Потрібні залежності
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');

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

Тепер ви можете запустити ваш застосунок, як зазвичай, але ви можете використовувати прапорець `--require`, щоб завантажити інструментування перед кодом застосунку. Переконайтеся, що у вас немає інших прапорців `--require`, що викликають конфлікти, таких як `--require @opentelemetry/auto-instrumentations-node/register` у вашій змінній середовища `NODE_OPTIONS`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node --require ./instrumentation.ts app.ts
Слухаємо запити на http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --require ./instrumentation.js app.js
Слухаємо запити на http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі та перезавантажте сторінку кілька разів. Через деякий час ви повинні побачити відрізки, надруковані в консолі за допомогою `ConsoleSpanExporter`.

<details>
<summary>Переглянути приклад виводу</summary>

```json
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "middleware - query",
  "id": "41a27f331c7bfed3",
  "kind": 0,
  "timestamp": 1624982589722992,
  "duration": 417,
  "attributes": {
    "http.route": "/",
    "express.name": "query",
    "express.type": "middleware"
  },
  "status": { "code": 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "middleware - expressInit",
  "id": "e0ed537a699f652a",
  "kind": 0,
  "timestamp": 1624982589725778,
  "duration": 673,
  "attributes": {
    "http.route": "/",
    "express.name": "expressInit",
    "express.type": "middleware"
  },
  "status": { code: 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "request handler - /",
  "id": "8614a81e1847b7ef",
  "kind": 0,
  "timestamp": 1624982589726941,
  "duration": 21,
  "attributes": {
    "http.route": "/",
    "express.name": "/",
    "express.type": "request_handler"
  },
  "status": { code: 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": undefined,
  "name": "GET /",
  "id": "f0b7b340dd6e08a7",
  "kind": 1,
  "timestamp": 1624982589720260,
  "duration": 11380,
  "attributes": {
    "http.url": "http://localhost:8080/",
    "http.host": "localhost:8080",
    "net.host.name": "localhost",
    "http.method": "GET",
    "http.route": "",
    "http.target": "/",
    "http.user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "http.flavor": "1.1",
    "net.transport": "ip_tcp",
    "net.host.ip": "::1",
    "net.host.port": 8080,
    "net.peer.ip": "::1",
    "net.peer.port": 61520,
    "http.status_code": 304,
    "http.status_text": "NOT MODIFIED"
  },
  "status": { "code": 1 },
  "events": []
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
    description: 'вимірює тривалість вхідних HTTP запитів',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'вимірює тривалість вихідних HTTP запитів',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'Кількість зʼєднань, які наразі знаходяться у стані, зазначеному атрибутом "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
}
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'вимірює тривалість вхідних HTTP запитів',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'вимірює тривалість вихідних HTTP запитів',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'Кількість зʼєднань, які наразі знаходяться у стані, зазначеному атрибутом "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
}
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'вимірює тривалість вхідних HTTP запитів',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'вимірює тривалість вихідних HTTP запитів',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN COUNTER',
    description: 'Кількість зʼєднань, які наразі знаходяться у стані, зазначеному атрибутом "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
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
/*instrumentation.js*/
// Потрібні залежності
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api);

// Для виррозвʼязанняішення проблем встановіть рівень логування на DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[трейси]: /docs/concepts/signals/traces/
[метрики]: /docs/concepts/signals/metrics/
