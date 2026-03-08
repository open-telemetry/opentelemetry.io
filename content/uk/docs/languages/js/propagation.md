---
title: Поширення
description: Поширення контексту для JS SDK
weight: 65
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: rolldice
---

{{% docs/languages/propagation %}}

## Автоматичне поширення контексту {#automatic-context-propagation}

[Бібліотеки інструментування](../libraries/) такі як [`@opentelemetry/instrumentation-http`](https://www.npmjs.com/package/@opentelemetry/instrumentation-http) або [`@opentelemetry/instrumentation-express`](https://www.npmjs.com/package/@opentelemetry/instrumentation-express) поширюють контекст між сервісами за вас.

Якщо ви слідували [Посібнику з початку роботи](../getting-started/nodejs), ви можете створити клієнтський застосунок, який запитує точку доступу `/rolldice`.

> [!NOTE]
>
> Ви можете поєднати цей приклад із демонстраційним застосунком з Посібника з початку роботи будь-якою іншою мовою. Кореляція працює між застосунками, написаними різними мовами, без будь-яких відмінностей.

Почніть зі створення нової теки з назвою `dice-client` та встановлення необхідних залежностей:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
npm install -D tsx  # інструмент для безпосереднього запуску файлів TypeScript (.ts) за допомогою node
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
```

{{% /tab %}} {{< /tabpane >}}

Далі створіть новий файл з назвою `client.ts` (або `client.js`) з наступним вмістом:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/* client.ts */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

import { request } from 'undici';

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json: any) => console.log(json));
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/* instrumentation.mjs */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

const { request } = require('undici');

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json) => console.log(json));
});
```

{{% /tab %}} {{% /tabpane %}}

Переконайтеся, що у вас запущена інструментована версія `app.ts` (або `app.js`) з [Посібника з початку роботи](../getting-started/nodejs) в одному терміналі:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx --import ./instrumentation.ts app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --import ./instrumentation.mjs app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Запустіть другий термінал і виконайте `client.ts` (або `client.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```shell
npx tsx client.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```shell
node client.js
```

{{% /tab %}} {{< /tabpane >}}

Обидва термінали повинні виводити деталі відрізків в консоль. Вивід клієнта виглядає подібно до наступного:

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET',
  id: '6f64ce484217a7bf',
  kind: 2,
  timestamp: 1718875320295000,
  duration: 19836.833,
  attributes: {
    'url.full': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

Зверніть увагу на traceId (`cccd19c3a2d10e589f01bfe2dc896dc2`) та ID (`6f64ce484217a7bf`). Обидва можна знайти у виводі клієнта також:

```javascript {hl_lines=["6,9"]}
{
  resource: {
    attributes: {
      // ...
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: {
    traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
    spanId: '6f64ce484217a7bf',
    traceFlags: 1,
    isRemote: true
  },
  traceState: undefined,
  name: 'GET /rolldice',
  id: '027c5c8b916d29da',
  kind: 1,
  timestamp: 1718875320310000,
  duration: 3894.792,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

Ваш клієнтський та серверний застосунки успішно повідомляють про підключені відрізки. Якщо ви відправите обидва до бекенду зараз, візуалізація покаже цю залежність для вас.

## Ручне поширення контексту {#manual-context-propagation}

У деяких випадках неможливо автоматично поширювати контекст, як описано в попередньому розділі. Можливо, немає бібліотеки інструментування, яка відповідає бібліотеці, яку ви використовуєте для звʼязку між сервісами. Або у вас можуть бути вимоги, які ці бібліотеки не можуть виконати, навіть якщо вони існують.

Коли вам потрібно вручну поширювати контекст, ви можете використовувати [API контексту](/docs/languages/js/context).

### Загальний приклад {#generic-example}

Наступний загальний приклад демонструє, як ви можете вручну поширювати контекст трасування.

Спочатку, на сервісі, що відправляє, вам потрібно буде зробити інʼєкцію поточного `context`:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// Сервіс, що відправляє
import { context, propagation, trace } from '@opentelemetry/api';

// Визначте інтерфейс для вихідного обʼєкта, який буде містити інформацію про трасування.
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// Створіть вихідний обʼєкт, який відповідає цьому інтерфейсу.
const output: Carrier = {};

// Сереалізуйте traceparent та tracestate з контексту у
// вихідний обʼєкт.
//
// Цей приклад використовує активний контекст трасування, але ви можете
// використовувати будь-який контекст, який підходить для вашого сценарію.
propagation.inject(context.active(), output);

// Витягніть значення traceparent та tracestate з вихідного обʼєкта.
const { traceparent, tracestate } = output;

// Ви можете передати дані traceparent та tracestate
// через будь-який механізм, який ви використовуєте для пропагації
// між сервісами.
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// Сервіс, що надсилає
const { context, propagation } = require('@opentelemetry/api');
const output = {};

// Сереалізуйте traceparent та tracestate з контексту у
// вихідний обʼєкт.
//
// Цей приклад використовує активний контекст трасування, але ви можете
// використовувати будь-який контекст, який підходить для вашого сценарію.
propagation.inject(context.active(), output);

const { traceparent, tracestate } = output;
// Ви можете передати дані traceparent та tracestate
// через будь-який механізм, який ви використовуєте для пропагації
// між сервісами.
```

{{% /tab %}} {{< /tabpane >}}

На сервісі, що приймає, вам потрібно буде витягти `context` (наприклад, з розібраних HTTP заголовків) і потім встановити їх як поточний контекст трасування.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// Сервіс, що приймає
import {
  type Context,
  propagation,
  trace,
  Span,
  context,
} from '@opentelemetry/api';

// Визначте інтерфейс для вхідного обʼєкта, який включає 'traceparent' та 'tracestate'.
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// Припустимо, що "input" є обʼєктом з ключами 'traceparent' та 'tracestate'.
const input: Carrier = {};

// Витягує дані 'traceparent' та 'tracestate' у контекстний обʼєкт.
//
// Ви можете потім вважати цей контекст активним для ваших
// трасувань.
let activeContext: Context = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span: Span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// Встановіть створений спан як активний у десереалізованому контексті.
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// Сервіс, що приймає
import { context, propagation, trace } from '@opentelemetry/api';

// Припустимо, що "input" є обʼєктом з ключами 'traceparent' та 'tracestate'
const input = {};

// Витягує дані 'traceparent' та 'tracestate' у контекстний обʼєкт.
//
// Ви можете потім вважати цей контекст активним для ваших
// трасувань.
let activeContext = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// Встановіть створений спан як активний у десереалізованому контексті.
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{< /tabpane >}}

З цього моменту, коли у вас є десереалізований активний контекст, ви можете створювати відрізки, які будуть частиною того ж трасування з іншого сервісу.

Ви також можете використовувати [API контексту](/docs/languages/js/context) для модифікації або встановлення десереалізованого контексту іншими способами.

### Приклад з власним протоколом {#custom-protocol-example}

Звичайний випадок, коли вам потрібно вручну поширювати контекст, це коли ви використовуєте власний протокол між сервісами для звʼязку. Наступний приклад використовує базовий текстовий TCP протокол для надсилання сереалізованого обʼєкта від одного сервісу до іншого.

Почніть зі створення нової теки з назвою `propagation-example` та ініціалізуйте її залежностями наступним чином:

```shell
npm init -y
npm install @opentelemetry/api @opentelemetry/sdk-node
```

Далі створіть файли `client.js` та `server.js` з наступним вмістом:

```javascript
// client.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('client');

// Підключення до сервера
const client = net.createConnection({ port: 8124 }, () => {
  // Відправка сереалізованого обʼєкта на сервер
  let span = tracer.startActiveSpan('send', { kind: 1 }, (span) => {
    const output = {};
    propagation.inject(context.active(), output);
    const { traceparent, tracestate } = output;

    const objToSend = { key: 'value' };

    if (traceparent) {
      objToSend._meta = { traceparent, tracestate };
    }

    client.write(JSON.stringify(objToSend), () => {
      client.end();
      span.end();
    });
  });
});
```

```javascript
// server.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('server');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const message = data.toString();
    // Розбір JSON обʼєкта, отриманого від клієнта
    try {
      const json = JSON.parse(message);
      let activeContext = context.active();
      if (json._meta) {
        activeContext = propagation.extract(context.active(), json._meta);
        delete json._meta;
      }
      span = tracer.startSpan('receive', { kind: 1 }, activeContext);
      trace.setSpan(activeContext, span);
      console.log('Розібраний JSON:', json);
    } catch (e) {
      console.error('Помилка розбору JSON:', e.message);
    } finally {
      span.end();
    }
  });
});

// Прослуховування на порту 8124
server.listen(8124, () => {
  console.log('Сервер слухає на порту 8124');
});
```

Запустіть перший термінал для запуску сервера:

```console
$ node server.js
Сервер слухає на порту 8124
```

Потім у другому терміналі запустіть клієнт:

```shell
node client.js
```

Клієнт повинен завершити роботу негайно, а сервер повинен вивести наступне:

```text
Розібраний JSON: { key: 'value' }
```

Оскільки приклад до цього моменту взяв залежність лише від OpenTelemetry API, всі виклики до нього є [no-op інструкціями](<https://en.wikipedia.org/wiki/NOP_(code)>) і клієнт та сервер поводяться так, ніби OpenTelemetry не використовується.

> [!IMPORTANT]
>
> Це особливо важливо, якщо ваш серверний та клієнтський код є бібліотеками, оскільки вони повинні використовувати лише OpenTelemetry API. Щоб зрозуміти чому, прочитайте [сторінку концепції про те, як додати інструментування до вашої бібліотеки](/docs/concepts/instrumentation/libraries/).

Щоб увімкнути OpenTelemetry та побачити поширення контексту в дії, створіть додатковий файл з назвою `instrumentation.js` з наступним вмістом:

```javascript
// instrumentation.mjs
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

sdk.start();
```

Використовуйте цей файл для запуску як сервера, так і клієнта, з увімкненим інструментуванням:

```console
$ node --import ./instrumentation.mjs server.js
Сервер слухає на порту 8124
```

та

```shell
node --import ./instrumentation.mjs client.js
```

Після того, як клієнт відправив дані на сервер і завершив роботу, ви повинні побачити відрізки у виводі консолі обох терміналів.

Вивід для клієнта виглядає наступним чином:

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: undefined,
  traceState: undefined,
  name: 'send',
  id: '92f125fa335505ec',
  kind: 1,
  timestamp: 1718879823424000,
  duration: 1054.583,
  // ...
}
```

Вивід для сервера виглядає наступним чином:

```javascript {hl_lines=[7,8]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: '92f125fa335505ec',
  traceState: undefined,
  name: 'receive',
  id: '53da0c5f03cb36e5',
  kind: 1,
  timestamp: 1718879823426000,
  duration: 959.541,
  // ...
}
```

Подібно до [ручного прикладу](#manual-context-propagation) відрізки підключені за допомогою `traceId` та `id`/`parentId`.

## Наступні кроки {#next-steps}

Щоб дізнатися більше про поширення, прочитайте [Специфікацію API поширювачів](/docs/specs/otel/context/api-propagators/).
