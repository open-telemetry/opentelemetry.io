---
title: Використання бібліотек інструментування
linkTitle: Бібліотеки
weight: 40
description: Як інструментувати бібліотеки, від яких залежить застосунок
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

{{% docs/languages/libraries-intro "js" %}}

## Використання бібліотек інструментування {#use-instrumentation-libraries}

Якщо бібліотека не постачається з OpenTelemetry з коробки, ви можете використовувати [бібліотеки інструментування](/docs/specs/otel/glossary/#instrumentation-library) для генерації телеметричних даних для бібліотеки або фреймворку.

Наприклад, [бібліотека інструментування для Express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express) автоматично створюватиме [відрізки](/docs/concepts/signals/traces/#spans) на основі вхідних HTTP-запитів.

### Налаштування {#setup}

Кожна бібліотека інструментування є пакунком NPM. Наприклад, ось як ви можете встановити бібліотеки інструментування [instrumentation-express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express) та [instrumentation-http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http) для інструментування вхідного та вихідного HTTP-трафіку:

```sh
npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
```

OpenTelemetry JavaScript також визначає метапакунки [auto-instrumentation-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node) та [auto-instrumentation-web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web), які обʼєднують усі бібліотеки інструментування для Node.js або веб в один пакунок. Це зручний спосіб додати автоматично згенеровану телеметрію для всіх ваших бібліотек з мінімальними зусиллями:

{{< tabpane text=true >}}

{{% tab Node.js %}}

```shell
npm install --save @opentelemetry/auto-instrumentations-node
```

{{% /tab %}}

{{% tab Browser %}}

```shell
npm install --save @opentelemetry/auto-instrumentations-web
```

{{% /tab %}} {{< /tabpane >}}

Зверніть увагу, що використання цих метапакунків збільшує розмір вашого графа залежностей. Використовуйте окремі бібліотеки інструментування, якщо ви точно знаєте, які з них вам потрібні.

### Реєстрація {#registration}

Після встановлення необхідних бібліотек інструментування зареєструйте їх в OpenTelemetry SDK для Node.js. Якщо ви слідували [Початку роботи](/docs/languages/js/getting-started/nodejs/), ви вже використовуєте метапакунки. Якщо ви слідували інструкціям [для ініціалізації SDK для ручного інструментування](/docs/languages/js/instrumentation/#initialize-tracing), оновіть ваш `instrumentation.ts` (або `instrumentation.js`) наступним чином:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // Це реєструє всі пакунки інструментування
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  //Це реєструє всі пакунки інструментування
  instrumentations: [getNodeAutoInstrumentations()]
});
```

{{% /tab %}}

{{< /tabpane >}}

Щоб вимкнути окремі бібліотеки інструментування, ви можете застосувати наступну зміну:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // Це реєструє всі пакунки інструментування
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start()
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  // Це реєструє всі пакунки інструментування
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});
```

{{% /tab %}}

{{< /tabpane >}}

Щоб завантажити лише окремі бібліотеки інструментування, замініть `[getNodeAutoInstrumentations()]` на список тих, які вам потрібні:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // Інструментування Express очікує інструментування HTTP рівня
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});

sdk.start()
```

{{% /tab %}} {{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // Інструментування Express очікує інструментування HTTP рівня
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});
```

{{% /tab %}}

{{< /tabpane >}}

### Конфігурація {#configuration}

Деякі бібліотеки інструментування пропонують додаткові параметри конфігурації.

Наприклад, [інструментування Express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express#express-instrumentation-options) пропонує способи ігнорування вказаних проміжних програм або збагачення відрізків, створених автоматично,
за допомогою хука запиту:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
import { Span } from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions';
import {
  ExpressInstrumentation,
  ExpressLayerType,
  ExpressRequestInfo,
} from '@opentelemetry/instrumentation-express';

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span: Span, info: ExpressRequestInfo) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(ATTR_HTTP_REQUEST_METHOD, info.request.method);
      span.setAttribute(ATTR_URL_FULL, info.request.baseUrl);
    }
  },
});
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_URL_FULL,
} = require('@opentelemetry/semantic-conventions');
const {
  ExpressInstrumentation,
  ExpressLayerType,
} = require('@opentelemetry/instrumentation-express');

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span, info) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(ATTR_HTTP_REQUEST_METHOD, info.request.method);
      span.setAttribute(ATTR_URL_FULL, info.request.baseUrl);
    }
  },
});
```

{{% /tab %}}

{{< /tabpane >}}

Вам потрібно буде звернутися до документації кожної бібліотеки інструментування для
розширеної конфігурації.

### Доступні бібліотеки інструментування {#available-instrumentation-libraries}

Ви можете знайти список доступних інструментів в [реєстрі](/ecosystem/registry/?language=js&component=instrumentation).

## Інструментування бібліотеки нативно {#instrument-a-library-natively}

Якщо ви хочете додати нативне інструментування до вашої бібліотеки, вам слід ознайомитися з
наступною документацією:

- Сторінка концепції [Бібліотеки](/docs/concepts/instrumentation/libraries/) надає вам уявлення про те, коли інструментувати та що інструментувати
- [Ручне інструментування](/docs/languages/js/instrumentation/) надає вам необхідні приклади коду для створення трас, метрик і логів для вашої бібліотеки
- [Посібник з реалізації інструментування](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md) для Node.js та оглядача містить найкращі практики для створення інструментування бібліотек.

## Створення бібліотеки інструментування {#create-an-instrumentation-library}

Хоча наявність спостережуваності з коробки для застосунку є кращим способом, це не завжди можливо або бажано. У таких випадках ви можете створити бібліотеку інструментування, яка буде впроваджувати виклики інструментування, використовуючи механізми, такі як обгортання інтерфейсів, підписка на специфічні для бібліотеки зворотні виклики або перетворення наявної телеметрії в модель OpenTelemetry.

Щоб створити таку бібліотеку, дотримуйтесь [Посібника з реалізації інструментування](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md) для Node.js та оглядача.
