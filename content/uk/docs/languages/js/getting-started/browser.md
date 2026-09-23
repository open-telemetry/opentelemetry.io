---
title: Оглядач
aliases: [/docs/js/getting_started/browser]
description: Дізнайтеся, як додати OpenTelemetry до вашого застосунку в оглядачі.
weight: 20
default_lang_commit: f048ad97541439a7065511b689056e26aad62d23
---

{{% include browser-instrumentation-warning %}}

Хоча цей посібник використовує демонстраційний застосунок, наведений нижче, кроки для інструментування вашого власного застосунку повинні бути схожими.

## Попередні умови {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), якщо ви будете використовувати TypeScript.

## Приклад застосунку {#example-application}

Це дуже простий посібник, якщо ви хочете побачити складніші приклади, перейдіть до [examples/opentelemetry-web](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web).

Скопіюйте наступний файл в порожню теку і назвіть його `index.html`.

```html
<!doctype html>
<html lang="uk">
  <head>
    <meta charset="utf-8" />
    <title>Приклад інструментування завантаження документа</title>
    <base href="/" />
    <!--
      https://www.w3.org/TR/trace-context/
      Встановіть `traceparent` в HTML-шаблоні сервера. Він повинен бути
      динамічно згенерований на стороні сервера, щоб мати ідентифікатор трасування запиту сервера,
      ідентифікатор батьківського відрізка, який був встановлений на відрізку запиту сервера, і
      прапорці трасування для вказівки рішення сервера щодо вибірки
      (01 = вибрано, 00 = не вибрано).
      '{version}-{traceId}-{spanId}-{sampleDecision}'
    -->
    <meta
      name="traceparent"
      content="00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    Приклад використання Web Tracer з інструментуванням завантаження документа з
    експортером консолі та експортером колектора
  </body>
</html>
```

### Встановлення {#installation}

Щоб створювати трасування в оглядачі, вам знадобляться `@opentelemetry/sdk-trace-web`, та інструмент `@opentelemetry/instrumentation-document-load`:

```shell
npm init -y
npm install @opentelemetry/api \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/instrumentation-document-load \
  @opentelemetry/context-zone
```

### Ініціалізація та конфігурація {#initialization-and-configuration}

Якщо ви пишете на TypeScript, виконайте наступну команду:

```shell
tsc --init
```

Потім встановіть [parcel](https://parceljs.org/), який (серед іншого) дозволить вам працювати з TypeScript.

```shell
npm install --save-dev parcel
```

Створіть порожній файл коду з назвою `document-load` з розширенням `.ts` або `.js`, якщо це доречно, залежно від мови, яку ви обрали для написання вашого застосунку. Додайте наступний код до вашого HTML безпосередньо перед закривальним теґом `</body>`:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```html
<script type="module" src="document-load.ts"></script>
```

{{% /tab %}} {{% tab JavaScript %}}

```html
<script type="module" src="document-load.js"></script>
```

{{% /tab %}} {{< /tabpane >}}

Ми додамо трохи коду, який буде трасувати часи завантаження документа і виводити їх як OpenTelemetry Spans.

### Створення постачальника трасування {#create-a-tracer-provider}

Додайте наступний код до `document-load.ts|js`, щоб створити постачальника трасування, який забезпечує інструментування для трасування завантаження документа:

```js
/* файл document-load.ts|js - код однаковий для обох мов */
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider();

provider.register({
  // Зміна стандартного менеджера контексту на ZoneContextManager, підтримує асинхронні операції, необовʼязково
  contextManager: new ZoneContextManager(),
});

// Реєстрація інструментів
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

Тепер зберіть застосунок за допомогою parcel:

```shell
npx parcel index.html
```

та відкрийте вебсервер розробки (наприклад, за адресою `http://localhost:1234`), щоб перевірити, чи працює ваш код.

Поки що не буде виведення трасувань, для цього нам потрібно додати експортер.

### Створення експортера {#create-an-exporter}

У наступному прикладі ми будемо використовувати `ConsoleSpanExporter`, який виводить всі
відрізки в консоль.

Щоб візуалізувати та аналізувати ваші трасування, вам потрібно експортувати їх до системи трасування. Дотримуйтесь [цих інструкцій](../../exporters) для налаштування системи трасування та експортера.

Ви також можете використовувати `BatchSpanProcessor` для експорту відрізків пакетами, щоб більш ефективно використовувати ресурси.

Щоб експортувати трасування в консоль, змініть `document-load.ts|js`, щоб він відповідав наступному фрагменту коду:

```js
/* файл document-load.ts|js - код однаковий для обох мов */
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

provider.register({
  // Зміна стандартного менеджера контексту на ZoneContextManager, підтримує асинхронні операції, необовʼязково
  contextManager: new ZoneContextManager(),
});

// Реєстрація інструментів
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

Тепер знову зберіть ваш застосунок і відкрийте оглядач. У консолі інструментів розробника ви повинні побачити деякі трасування, що експортуються:

```json
{
  "traceId": "ab42124a3c573678d4d8b21ba52df3bf",
  "parentId": "cfb565047957cb0d",
  "name": "documentFetch",
  "id": "5123fc802ffb5255",
  "kind": 0,
  "timestamp": 1606814247811266,
  "duration": 9390,
  "attributes": {
    "component": "document-load",
    "http.response_content_length": 905
  },
  "status": {
    "code": 0
  },
  "events": [
    {
      "name": "fetchStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "domainLookupStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "domainLookupEnd",
      "time": [1606814247, 811266158]
    },
    {
      "name": "connectStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "connectEnd",
      "time": [1606814247, 811266158]
    },
    {
      "name": "requestStart",
      "time": [1606814247, 819101158]
    },
    {
      "name": "responseStart",
      "time": [1606814247, 819791158]
    },
    {
      "name": "responseEnd",
      "time": [1606814247, 820656158]
    }
  ]
}
```

### Додавання інструментування {#add-instrumentation}

Якщо ви хочете інструментувати Ajax-запити, взаємодії з користувачем (User Interactions) та інші, ви можете додати додаткові бібліотеки інструментації та зареєструвати їх для цього:

```sh
npm install @opentelemetry/instrumentation-user-interaction \
  @opentelemetry/instrumentation-xml-http-request \
```

```javascript
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});
```

## Мета-пакети для веб {#meta-packages-for-web}

Щоб використовувати найпоширеніші інструменти все в одному, ви можете просто використовувати [OpenTelemetry Meta Packages for Web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web)
