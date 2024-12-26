---
title: Інструментування
aliases:
  - /docs/languages/js/api/tracing
  - manual
weight: 30
description: Інструментування для OpenTelemetry JavaScript
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: dicelib Millis rolldice
---

{{% include instrumentation-intro %}}

> [!NOTE]
>
> На цій сторінці ви дізнаєтеся, як можна додати трасування, метрики та логи до вашого коду _вручну_. Але ви не обмежені використанням лише одного виду інструментування: використовуйте [автоматичне інструментування](/docs/zero-code/js/), щоб почати, а потім збагачуйте свій код ручним інструментуванням за потреби.
>
> Також, для бібліотек, від яких залежить ваш код, вам не потрібно писати код інструментування самостійно, оскільки вони можуть мати вбудовану підтримку OpenTelemetry _нативно_ або ви можете скористатися [бібліотеками інструментування](/docs/languages/js/libraries/).

## Підготовка демонстраційного застосунку {#example-app}

Ця сторінка використовує модифіковану версію демонстраційного застосунку з [Початку роботи](/docs/languages/js/getting-started/nodejs/), щоб допомогти вам дізнатися про ручне інструментування.

Вам не обовʼязково використовувати демонстраційний застосунок: якщо ви хочете інструментувати свій власний застосунок або бібліотеку, дотримуйтесь інструкцій тут, щоб адаптувати процес до свого коду.

### Залежності {#example-app-dependencies}

Створіть порожній файл NPM `package.json` у новій директорії:

```shell
npm init -y
```

Далі, встановіть залежності Express.

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

Щоб підкреслити різницю між інструментуванням _бібліотеки_ та окремого _застосунку_, розділіть кидання кубиків на _файл бібліотеки_, який потім буде імпортовано як залежність у _файл застосунку_.

Створіть _файл бібліотеки_ з назвою `dice.ts` (або `dice.js`, якщо ви не використовуєте TypeScript) і додайте до нього наступний код:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

Створіть _файл застосунку_ з назвою `app.ts` (або `app.js`, якщо не використовуєте TypeScript) і додайте до нього наступний код:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res.status(400).send("Параметр запиту 'rolls' відсутній або не є числом.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Очікування запитів на http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');
const { rollTheDice } = require('./dice.js');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res.status(400).send("Параметр запиту 'rolls' відсутній або не є числом.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Очікування запитів на http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

Щоб переконатися, що все працює, запустіть застосунок за допомогою наступної команди та відкрийте <http://localhost:8080/rolldice?rolls=12> у вашому вебоглядачі.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Очікування запитів на http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## Налаштування ручного інструментування {#manual-instrumentation-setup}

### Залежності {#dependencies}

Встановіть пакунки OpenTelemetry API:

```shell
npm install @opentelemetry/api @opentelemetry/resources @opentelemetry/semantic-conventions
```

### Ініціалізація SDK {#initialize-the-sdk}

> [!NB] Якщо ви інструментуєте бібліотеку, **пропустіть цей крок**.

Якщо ви інструментуєте Node.js застосунок, встановіть [OpenTelemetry SDK для Node.js](https://www.npmjs.com/package/@opentelemetry/sdk-node):

```shell
npm install @opentelemetry/sdk-node
```

Перед тим, як будь-який інший модуль у вашому застосунку буде завантажено, ви повинні ініціалізувати SDK. Якщо ви не ініціалізуєте SDK або зробите це занадто пізно, будуть надані no-op реалізації для будь-якої бібліотеки, яка отримує трасувальник або метр з API.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'yourServiceName',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

Для налагодження та локальної розробки наступний приклад експортує телеметрію до консолі. Після того, як ви завершите налаштування ручного інструментування, вам потрібно налаштувати відповідний експортер для [експорту телеметричних даних застосунку](/docs/languages/js/exporters/) до одного або більше бекендів телеметрії.

Приклад також налаштовує обовʼязковий стандартний атрибут SDK `service.name`, який містить логічну назву сервісу, та необовʼязковий (але дуже рекомендований!) атрибут `service.version`, який містить версію API або реалізації сервісу.

Існують альтернативні методи налаштування атрибутів ресурсу. Для отримання додаткової інформації дивіться [Ресурси](/docs/languages/js/resources/).

> [!NOTE]
>
> Наступні приклади, що використовують `--import instrumentation.ts` (TypeScript), вимагають Node.js v20 або новішої версії. Якщо ви використовуєте Node.js v18, будь ласка, використовуйте приклад JavaScript.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

Це базове налаштування поки що не впливає на ваш застосунок. Вам потрібно додати код для [трасування](#traces), [метрик](#metrics) та/або [логів](#logs).

Ви можете зареєструвати бібліотеки інструментування з OpenTelemetry SDK для Node.js, щоб генерувати телеметричні дані для ваших залежностей. Для отримання додаткової інформації дивіться [Бібліотеки](/docs/languages/js/libraries/).

## Трасування {#traces}

### Ініціалізація трасування {#initialize-tracing}

> [!NB] Якщо ви інструментуєте бібліотеку, **пропустіть цей крок**.

Щоб увімкнути [трасування](/docs/concepts/signals/traces/) у вашому застосунку, вам потрібно мати ініціалізований [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider), який дозволить вам створювати [`Tracer`](/docs/concepts/signals/traces/#tracer).

Якщо `TracerProvider` не створено, OpenTelemetry API для трасування використовуватимуть no-op реалізацію і не генеруватимуть дані. Як пояснено далі, змініть файл `instrumentation.ts` (або `instrumentation.js`), щоб включити весь код ініціалізації SDK у Node та оглядачі.

#### Node.js

Якщо ви дотримувалися інструкцій для [ініціалізації SDK](#initialize-the-sdk) вище, у вас вже налаштовано `TracerProvider`. Ви можете продовжити з [отриманням трасувальника](#acquiring-a-tracer).

#### Оглядач {#browser}

{{% include browser-instrumentation-warning %}}

Спочатку переконайтеся, що у вас є правильні пакунки:

```shell
npm install @opentelemetry/sdk-trace-web
```

Далі, оновіть `instrumentation.ts` (або `instrumentation.js`), щоб містити весь код ініціалізації SDK у ньому:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  defaultResource,
  resourceFromAttributes,
} = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const {
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
```

{{% /tab %}} {{< /tabpane >}}

Вам потрібно буде зібрати цей файл разом з вашим вебзастосунком, щоб мати можливість використовувати трасування у всьому вашому вебзастосунку.

Це поки що не впливає на ваш застосунок: вам потрібно [створити відрізки](#create-spans), щоб ваш застосунок генерував телеметрію.

#### Вибір правильного процесора відрізків {#picking-the-right-span-processor}

Стандартно, Node SDK використовує `BatchSpanProcessor`, і цей процесор відрізків також обрано у прикладі Web SDK. `BatchSpanProcessor` обробляє відрізки пакетами перед їх експортом. Це зазвичай правильний процесор для використання в застосунку.

На відміну від цього, `SimpleSpanProcessor` обробляє відрізки у міру їх створення. Це означає, що якщо ви створите 5 відрізків, кожен з них буде оброблено та експортовано перед створенням наступного відрізка в коді. Це може бути корисно в сценаріях, коли ви не хочете ризикувати втратити пакет, або якщо ви експериментуєте з OpenTelemetry у розробці. Однак це також може мати значні накладні витрати, особливо якщо відрізки експортуються мережею — кожного разу, коли викликається створення відрізка, він буде оброблений та відправлений через мережу перед тим, як виконання вашого застосунку зможе продовжитися.

У більшості випадків, дотримуйтесь використання `BatchSpanProcessor` замість `SimpleSpanProcessor`.

### Отримання трасувальника {#acquiring-a-tracer}

У будь-якому місці вашого застосунку, де ви пишете код ручного трасування, слід викликати `getTracer`, щоб отримати трасувальника. Наприклад:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
//...

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// Тепер ви можете використовувати 'tracer' для трасування!
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
//...

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// Тепер ви можете використовувати 'tracer' для трасування!
```

{{% /tab %}} {{< /tabpane >}}

Значення `instrumentation-scope-name` та `instrumentation-scope-version` повинні унікально ідентифікувати [Область інструментування](/docs/concepts/instrumentation-scope/), таку як назва пакунка, модуля або класу. Хоча імʼя є обовʼязковим, версія все ще рекомендується, незважаючи на те, що вона є необовʼязковою.

Зазвичай рекомендується викликати `getTracer` у вашому застосунку, коли це потрібно, а не експортувати екземпляр `tracer` до решти вашого застосунку. Це допомагає уникнути складніших проблем із завантаженням застосунку, коли залучені інші необхідні залежності.

У випадку [демонстраційного застосунку](#example-app) є два місця, де можна отримати трасувальник з відповідною Областю інструментування:

По-перше, у _файлі застосунку_ `app.ts` (або `app.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts {hl_lines=[6]}
/*app.ts*/
import { trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res.status(400).send("Параметр запиту 'rolls' відсутній або не є числом.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Очікування запитів на http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js {hl_lines=[6]}
/*app.js*/
const { trace } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res.status(400).send("Параметр запиту 'rolls' відсутній або не є числом.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Очікування запитів на http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

По-друге, у _файлі бібліотеки_ `dice.ts` (або `dice.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts {hl_lines=[4]}
/*dice.ts*/
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```ts {hl_lines=[4]}
/*dice.js*/
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

### Створення відрізків {#create-spans}

Тепер, коли у вас є [трасувальники](/docs/concepts/signals/traces/#tracer), ви можете створювати [відрізки](/docs/concepts/signals/traces/#spans).

API OpenTelemetry JavaScript надає два методи, які дозволяють створювати відрізки:

- [`tracer.startSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Tracer.html#startspan): Починає новий відрізок без встановлення його в контекст.
- [`tracer.startActiveSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Tracer.html#startactivespan): Починає новий відрізок і викликає задану функцію зворотного виклику, передаючи їй створений відрізок як перший аргумент. Новий відрізок встановлюється в контекст, і цей контекст активується на час виклику функції.

У більшості випадків ви хочете використовувати останній (`tracer.startActiveSpan`), оскільки він піклується про встановлення відрізка та його контексту активним.

Нижче наведено приклад створення активного відрізка.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { trace, type Span } from '@opentelemetry/api';

/* ... */

export function rollTheDice(rolls: number, min: number, max: number) {
  // Створіть відрізок. Відрізок повинен бути закритий.
  return tracer.startActiveSpan('rollTheDice', (span: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // Обовʼязково закрийте відрізок!
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  // Створіть відрізок. Відрізок повинен бути закритий.
  return tracer.startActiveSpan('rollTheDice', (span) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // Обовʼязково закрийте відрізок!
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

Якщо ви дотримувалися інструкцій, використовуючи [демонстраційний застосунок](#example-app) до цього моменту, ви можете скопіювати код вище у ваш файл бібліотеки `dice.ts` (або `dice.js`). Тепер ви повинні побачити відрізки, що надходять з вашого застосунку.

Запустіть ваш застосунок наступним чином, а потім надішліть йому запити, відвідавши <http://localhost:8080/rolldice?rolls=12> за допомогою вашого вебоглядача або `curl`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

Через деякий час ви повинні побачити відрізки, надруковані в консолі за допомогою `ConsoleSpanExporter`, щось на зразок цього:

```js
{
  resource: {
    attributes: {
      'service.name': 'dice-server',
      'service.version': '0.1.0',
      // ...
    }
  },
  instrumentationScope: { name: 'dice-lib', version: undefined, schemaUrl: undefined },
  traceId: '30d32251088ba9d9bca67b09c43dace0',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'rollTheDice',
  id: 'cc8a67c2d4840402',
  kind: 0,
  timestamp: 1756165206470000,
  duration: 35.584,
  attributes: {},
  status: { code: 0 },
  events: [],
  links: []
}
```

### Створення вкладених відрізків {#creating-nested-spans}

Вкладені [відрізки](/docs/concepts/signals/traces/#spans) дозволяють відстежувати роботу, яка є вкладеною за своєю природою. Наприклад, функція `rollOnce()` нижче представляє вкладену операцію. Наступний приклад створює вкладений відрізок, який відстежує `rollOnce()`:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  // Створіть відрізок. Відрізок повинен бути закритий.
  return tracer.startActiveSpan('rollTheDice', (parentSpan: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // Обовʼязково закрийте відрізок!
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

function rollTheDice(rolls, min, max) {
  // Створіть відрізок. Відрізок повинен бути закритий.
  return tracer.startActiveSpan('rollTheDice', (parentSpan) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // Обовʼязково закрийте відрізок!
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

Цей код створює дочірній відрізок для кожного _roll_, який має ID `parentSpan` як їхній батьківський ID:

```js
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ...
  },
  name: 'rollOnce:0',
  id: '36423bc1ce7532b0',
  timestamp: 1756165362215000,
  duration: 85.667,
  // ...
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ...
  },
  name: 'rollOnce:1',
  id: 'ed9bbba2264d6872',
  timestamp: 1756165362215000,
  duration: 16.834,
  // ...
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: undefined,
  name: 'rollTheDice',
  id: '38691692d6bc3395',
  timestamp: 1756165362214000,
  duration: 1022.209,
  // ...
}
```

### Створення незалежних відрізків {#creating-independent-spans}

Попередні приклади показали, як створити активний відрізок. У деяких випадках ви захочете створити неактивні відрізки, які є братами і сестрами один одного, а не вкладеними.

```js
const doWork = () => {
  const span1 = tracer.startSpan('work-1');
  // виконайте деяку роботу
  const span2 = tracer.startSpan('work-2');
  // виконайте ще трохи роботи
  const span3 = tracer.startSpan('work-3');
  // виконайте ще більше роботи

  span1.end();
  span2.end();
  span3.end();
};
```

У цьому прикладі `span1`, `span2` та `span3` є братами і сестрами і жоден з них не вважається поточним активним відрізком. Вони мають одного батька, а не вкладені один в одного.

Це розташування може бути корисним, якщо у вас є одиниці роботи, які згруповані разом, але концептуально незалежні одна від одної.

### Отримання поточного відрізка {#get-the-current-span}

Іноді корисно зробити щось з поточним/активним [відрізком](/docs/concepts/signals/traces/#spans) у певний момент виконання програми.

```js
const activeSpan = opentelemetry.trace.getActiveSpan();

// зробіть щось з активним відрізком, за бажанням закінчіть його, якщо це підходить для вашого випадку використання.
```

### Отримання відрізка з контексту {#get-a-span-from-context}

Також може бути корисно отримати [відрізок](/docs/concepts/signals/traces/#spans) з даного контексту, який не обовʼязково є активним відрізком.

```js
const ctx = getContextFromSomewhere();
const span = opentelemetry.trace.getSpan(ctx);

// зробіть щось з отриманим відрізком, за бажанням закінчіть його, якщо це підходить для вашого випадку використання.
```

### Атрибути {#attributes}

[Атрибути](/docs/concepts/signals/traces/#attributes) дозволяють вам прикріплювати пари ключ/значення до [`Span`](/docs/concepts/signals/traces/#spans), щоб він містив більше інформації про поточну операцію, яку він відстежує.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // Додайте атрибут до відрізка
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // Додайте атрибут до відрізка
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

Ви також можете додати атрибути до відрізка під час його створення:

```javascript
tracer.startActiveSpan(
  'app.new-span',
  { attributes: { attribute1: 'value1' } },
  (span) => {
    // виконайте деяку роботу...

    span.end();
  },
);
```

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollTheDice(rolls: number, min: number, max: number) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span: Span) => {
      /* ... */
    },
  );
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span) => {
      /* ... */
    },
  );
}
```

{{% /tab %}} {{< /tabpane >}}

#### Семантичні атрибути {#semantic-attributes}

Існують семантичні домовленості для відрізків, що представляють операції у відомих протоколах, таких як HTTP або виклики бази даних. Семантичні домовленості для цих відрізків визначені в специфікації [Семантичні домовленості трасування](/docs/specs/semconv/general/trace/). У простому прикладі цього посібника можна використовувати атрибути вихідного коду.

Спочатку додайте семантичні домовленості як залежність до вашого застосунку:

```shell
npm install --save @opentelemetry/semantic-conventions
```

Додайте наступне до верхньої частини вашого файлу застосунку:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} from '@opentelemetry/semantic-conventions';
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} = require('@opentelemetry/semantic-conventions');
```

{{% /tab %}} {{< /tabpane >}}

Нарешті, ви можете оновити ваш файл, щоб включити семантичні атрибути:

```javascript
const doWork = () => {
  tracer.startActiveSpan('app.doWork', (span) => {
    span.setAttribute(ATTR_CODE_FUNCTION_NAME, 'doWork');
    span.setAttribute(ATTR_CODE_FILE_PATH, __filename);

    // Виконайте деяку роботу...

    span.end();
  });
};
```

### Події відрізків {#span-events}

[Подія відрізка](/docs/concepts/signals/traces/#span-events) — це повідомлення, яке може прочитати людина, на [`Span`](/docs/concepts/signals/traces/#spans), що представляє дискретну подію без тривалості, яку можна відстежити за допомогою одного відбитку часу. Ви можете думати про це як про примітивний лог.

```js
span.addEvent('Виконання чогось');

const result = doWork();
```

Ви також можете створювати події відрізків з додатковими [атрибутами](/docs/concepts/signals/traces/#attributes):

```js
span.addEvent('деякий лог', {
  'log.severity': 'error',
  'log.message': 'Дані не знайдено',
  'request.id': requestId,
});
```

### Посилання відрізків {#span-links}

[`Span`ʼи](/docs/concepts/signals/traces/#spans) можуть бути створені з нульовою або більшою кількістю [`Link`ʼів](/docs/concepts/signals/traces/#span-links) до інших відрізків, які є повʼязаними. Загальний сценарій — це кореляція одного або більше трасувань з поточним відрізком.

```js
const someFunction = (spanToLinkFrom) => {
  const options = {
    links: [
      {
        context: spanToLinkFrom.spanContext(),
      },
    ],
  };

  tracer.startActiveSpan('app.someFunction', options, (span) => {
    // Виконайте деяку роботу...

    span.end();
  });
};
```

### Статус відрізка {#span-status}

{{% include "span-status-preamble" %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Помилка',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Помилка',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{< /tabpane >}}

### Запис помилок {#recordings-exceptions}

Може бути гарною ідеєю записувати помилки, коли вони трапляються. Рекомендується робити це разом з встановленням [статусу відрізка](#span-status).

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ...

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{< /tabpane >}}

### Використання `sdk-trace-base` та ручне поширення контексту відрізка {#using-sdk-trace-base-and-manually-propagating-span-context}

У деяких випадках ви можете не мати можливості або не бажати використовувати SDK Node.js або Web SDK. Найбільша різниця, окрім коду ініціалізації, полягає в тому, що вам доведеться вручну встановлювати відрізки як активні в поточному контексті, щоб мати можливість створювати вкладені відрізки.

#### Ініціалізація трасування з `sdk-trace-base` {#initializing-tracing-with-sdk-trace-base}

Ініціалізація трасування схожа на те, як ви б робили це з Node.js або Web SDK.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // Налаштуйте обробник відрізків для надсилання відрізків експортеру
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// Це те, до чого ми матимемо доступ у всьому коді інструментування
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} = require('@opentelemetry/core');
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // Налаштуйте обробник відрізків надсилання відрізків до експортера
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// Це те, до чого ми матимемо доступ у всьому коді інструментування
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{< /tabpane >}}

Як і в інших прикладах у цьому документі, це експортує трасувальник, який ви можете використовувати у всьому застосунку.

#### Створення вкладених відрізків з `sdk-trace-base` {#creating-nested-spans-with-sdk-trace-base}

Щоб створити вкладені відрізки, вам потрібно встановити поточний (батьківський) відрізок як активний відрізок у поточному контексті. Не намагайтеся використовувати `startActiveSpan`, оскільки він не зробить це за вас.

```javascript
const mainWork = () => {
  const parentSpan = tracer.startSpan('main');

  for (let i = 0; i < 3; i += 1) {
    doWork(parentSpan, i);
  }

  // Обовʼязково закрийте батьківський відрізок!
  parentSpan.end();
};

const doWork = (parent, i) => {
  // Щоб створити дочірній відрізок, нам потрібно позначити поточний (батьківський) відрізок як активний відрізок у контексті, а потім використовувати отриманий контекст для створення дочірнього відрізка.
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent,
  );
  const span = tracer.startSpan(`doWork:${i}`, undefined, ctx);

  // імітуйте деяку випадкову роботу.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // порожньо
  }

  // Обовʼязково закрийте цей дочірній відрізок! Якщо ви цього не зробите, він продовжить відстежувати роботу за межами 'doWork'!
  span.end();
};
```

Усі інші API поводяться однаково, коли ви використовуєте `sdk-trace-base` порівняно з SDK Node.js або Web SDK.

## Метрики {#metrics}

[Метрики](/docs/concepts/signals/metrics) обʼєднують окремі вимірювання в агрегати та створюють дані, які є постійними як функція навантаження системи. Агрегати не мають деталей, необхідних для діагностики низькорівневих проблем, але доповнюють відрізки, допомагаючи виявляти тенденції та надаючи телеметрію часу виконання застосунку.

### Ініціалізація метрик {#initialize-metrics}

> [!NB] Якщо ви інструментуєте бібліотеку, **пропустіть цей крок**.

Щоб увімкнути [метрики](/docs/concepts/signals/metrics/) у вашому застосунку, вам потрібно мати ініціалізований [`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider), який дозволить вам створювати [`Meter`](/docs/concepts/signals/metrics/#meter).

Якщо `MeterProvider` не створено, OpenTelemetry API для метрик використовуватимуть no-op реалізацію і не генеруватимуть дані. Як пояснено далі, змініть файл `instrumentation.ts` (або `instrumentation.js`), щоб включити весь код ініціалізації SDK у Node та оглядачі.

#### Node.js {#initialize-metrics-nodejs}

Якщо ви дотримувалися інструкцій для [ініціалізації SDK](#initialize-the-sdk) вище, у вас вже налаштовано `MeterProvider`. Ви можете продовжити з [отриманням meter](#acquiring-a-meter).

##### Ініціалізація метрик з `sdk-metrics` {#initialize-metrics-with-sdk-metrics}

У деяких випадках ви можете не мати можливості або не бажати використовувати [повний OpenTelemetry SDK для Node.js](https://www.npmjs.com/package/@opentelemetry/sdk-node). Це також вірно, якщо ви хочете використовувати OpenTelemetry JavaScript в оглядачі.

Якщо так, ви можете ініціалізувати метрики за допомогою пакунка `@opentelemetry/sdk-metrics`:

```shell
npm install @opentelemetry/sdk-metrics
```

Якщо ви не створили його для трасування, створіть окремий файл `instrumentation.ts` (або `instrumentation.js`), який містить весь код ініціалізації SDK:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  // Стандартно 60000 мс (60 секунд). Встановлено на 10 секунд лише для демонстраційних цілей.
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Встановіть цей MeterProvider як глобальний для застосунку, що інструментується.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const {
  defaultResource,
  resourceFromAttributes,
} = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // Стандартно 60000 мс (60 секунд). Встановлено на 10 секунд лише для демонстраційних цілей.
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Встановіть цей MeterProvider як глобальний для застосунку, що інструментується.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{< /tabpane >}}

Вам потрібно буде `--import` цей файл під час запуску вашого застосунку, наприклад:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

Тепер, коли `MeterProvider` налаштовано, ви можете отримати `Meter`.

### Отримання Meter {#acquiring-a-meter}

У будь-якому місці вашого застосунку, де ви маєте вручну інструментований код, ви можете викликати `getMeter`, щоб отримати meter. Наприклад:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';

const myMeter = opentelemetry.metrics.getMeter(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// Тепер ви можете використовувати 'meter' для створення інструментів!
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// Тепер ви можете використовувати 'meter' для створення інструментів!
```

{{% /tab %}} {{< /tabpane >}}

Значення `instrumentation-scope-name` та `instrumentation-scope-version` повинні унікально ідентифікувати [Область інструментування](/docs/concepts/instrumentation-scope/), таку як назва пакунку, модуля або класу. Хоча імʼя є обовʼязковим, версія все ще рекомендується, незважаючи на те, що вона є необовʼязковою.

Зазвичай рекомендується викликати `getMeter` у вашому застосунку, коли це потрібно, а не експортувати екземпляр meter до решти вашого застосунку. Це допомагає уникнути складніших проблем із завантаженням застосунку, коли залучені інші необхідні залежності.

У випадку [демонстраційного застосунку](#example-app) є два місця, де можна отримати meter з відповідною Областю інструментування:

По-перше, у _файлі застосунку_ `app.ts` (або `app.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import { metrics, trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res.status(400).send("Параметр запиту 'rolls' відсутній або не є числом.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Очікування запитів на http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const { trace, metrics } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res.status(400).send("Параметр запиту 'rolls' відсутній або не є числом.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Очікування запитів на http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

По-друге, у _файлі бібліотеки_ `dice.ts` (або `dice.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
import { trace, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const { trace, metrics } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

Тепер, коли у вас є [meters](/docs/concepts/signals/metrics/#meter), ви можете створювати [інструменти вимірювання](/docs/concepts/signals/metrics/#metric-instruments).

### Використання лічильників {#using-counters}

Лічильники можна використовувати для вимірювання невідʼємного, значення, що зростає.

У випадку нашого [демонстраційного застосунку](#example-app) ми можемо використовувати це для підрахунку, як часто кидають кубик:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min: number, max: number) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min, max) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

{{% /tab %}} {{< /tabpane >}}

### Використання лічильників UpDown {#using-updown-counters}

Лічильники UpDown можуть збільшуватися і зменшуватися, дозволяючи вам спостерігати за кумулятивним значенням, яке зростає або зменшується.

```js
const counter = myMeter.createUpDownCounter('events.counter');

//...

counter.add(1);

//...

counter.add(-1);
```

### Використання гістограм {#using-histograms}

Гістограми використовуються для вимірювання розподілу значень з часом.

Наприклад, ось як ви можете повідомити про розподіл часу відповіді для маршруту API з Express:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import express from 'express';

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // виконайте деяку роботу в виклику API

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Запишіть тривалість операції завдання
  histogram.record(executionTime);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const express = require('express');

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // виконайте деяку роботу в виклику API

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Запишіть тривалість операції завдання
  histogram.record(executionTime);
});
```

{{% /tab %}} {{< /tabpane >}}

### Використання спостережуваних (асинхронних) лічильників {#using-observable-async-counters}

Спостережувані лічильники можна використовувати для вимірювання додаткового, невідʼємного, значення, яке зростає монотонно.

```js
const events = [];

const addEvent = (name) => {
  events.push(name);
};

const counter = myMeter.createObservableCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//... виклики до addEvent
```

### Використання спостережуваних (асинхронних) лічильників UpDown {#using-observable-async-updown-counters}

Спостережувані лічильники UpDown можуть збільшуватися і зменшуватися, дозволяючи вам вимірювати додаткове, невідʼємне, кумулятивне значення, яке зростає не-монотонно.

```js
const events = [];

const addEvent = (name) => {
  events.push(name);
};

const removeEvent = () => {
  events.pop();
};

const counter = myMeter.createObservableUpDownCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//... виклики до addEvent та removeEvent
```

### Використання спостережуваних (асинхронних) датчиків {#using-observable-async-gauges}

Спостережувані датчики (Gauge) слід використовувати для вимірювання неадитивних значень.

```js
let temperature = 32;

const gauge = myMeter.createObservableGauge('temperature.gauge');

gauge.addCallback((result) => {
  result.observe(temperature);
});

//... змінна temperature змінюється датчиком
```

### Опис інструментів {#describing-instruments}

Коли ви створюєте інструменти, такі як лічильники, гістограми тощо, ви можете надати їм опис.

```js
const httpServerResponseDuration = myMeter.createHistogram(
  'http.server.duration',
  {
    description: 'Розподіл часу відповіді HTTP сервера',
    unit: 'мілісекунди',
    valueType: ValueType.INT,
  },
);
```

У JavaScript кожен тип конфігурації означає наступне:

- `description` — опис інструменту, який може прочитати людина
- `unit` — Опис одиниці вимірювання, яку значення призначене представляти. Наприклад, `мілісекунди` для вимірювання тривалості або `байти` для підрахунку кількості байтів.
- `valueType` — Тип числового значення, що використовується у вимірюваннях.

Зазвичай рекомендується описувати кожен інструмент, який ви створюєте.

### Додавання атрибутів {#adding-attributes}

Ви можете додавати атрибути до метрик, коли вони генеруються.

```js
const counter = myMeter.createCounter('my.counter');

counter.add(1, { 'some.optional.attribute': 'some value' });
```

### Налаштування переглядів метрик {#configuring-metric-views}

Перегляд метрик надає розробникам можливість налаштовувати метрики, які експортуються SDK метрик.

#### Селектори {#selectors}

Щоб створити перегляд, спочатку потрібно вибрати цільовий інструмент. Наступні селектори є дійсними для метрик:

- `instrumentType`
- `instrumentName`
- `meterName`
- `meterVersion`
- `meterSchemaUrl`

Вибір за `instrumentName` (типу string) підтримує шаблони, тому ви можете вибрати всі інструменти, використовуючи `*`, або вибрати всі інструменти, назва яких починається з `http`, використовуючи `http*`.

#### Приклади {#examples}

Фільтруйте атрибути на всіх типах метрик:

```js
const limitAttributesView = {
  // експортуйте лише атрибут 'environment'
  attributeKeys: ['environment'],
  // застосуйте перегляд до всіх інструментів
  instrumentName: '*',
};
```

Видаліть усі інструменти з назвою meter `pubsub`:

```js
const dropView = {
  aggregation: { type: AggregationType.DROP },
  meterName: 'pubsub',
};
```

Визначте явні розміри кошиків для гістограми з назвою `http.server.duration`:

```js
const histogramView = {
  aggregation: {
    type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
    options: { boundaries: [0, 1, 5, 10, 15, 20, 25, 30] },
  },
  instrumentName: 'http.server.duration',
  instrumentType: InstrumentType.HISTOGRAM,
};
```

#### Прикріплення до постачальника meter {#attaching-to-meter-provider}

Після того, як перегляди налаштовані, прикріпіть їх до відповідного постачальника meter:

```js
const meterProvider = new MeterProvider({
  views: [limitAttributesView, dropView, histogramView],
});
```

## Логи {#logs}

API та SDK для логів наразі розробляються.

## Наступні кроки {#next-steps}

Вам також потрібно налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/js/exporters) до одного або більше бекендів телеметрії.
