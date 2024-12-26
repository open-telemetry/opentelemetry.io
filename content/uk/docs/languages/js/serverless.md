---
title: Serverless
weight: 100
description: Інструментуйте свої безсерверні функції за допомогою OpenTelemetry JavaScript
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: otelwrapper новорозгорнуту
---

Цей посібник показує, як почати відстежувати безсерверні функції за допомогою бібліотек інструментування OpenTelemetry.

## AWS Lambda

> [!NOTE]
>
> Ви також можете автоматично інструментувати свої функції AWS Lambda за допомогою [наданих спільнотою шарів Lambda](/docs/platforms/faas/lambda-auto-instrument/).

Нижче показано, як використовувати обгортки Lambda з OpenTelemetry для інструментування функцій AWS Lambda вручну та надсилання трейсів до налаштованого бекенду.

Якщо вас цікавить досвід користувача plug and play, дивіться [шари OpenTelemetry Lambda](https://github.com/open-telemetry/opentelemetry-lambda).

### Залежності {#dependencies}

Спочатку створіть порожній `package.json`:

```sh
npm init -y
```

Потім встановіть необхідні залежності:

```sh
npm install \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation \
  @opentelemetry/sdk-trace-base \
  @opentelemetry/sdk-trace-node
```

### Код обгортки AWS Lambda {#aws-lambda-wrapper-code}

Цей файл містить всю логіку OpenTelemetry, яка дозволяє трейсинг. Збережіть наступний код як `lambda-wrapper.js`.

```javascript
/* lambda-wrapper.js */

const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: '<backend_url>',
  }),
);

const provider = new NodeTracerProvider({
  spanProcessors: [spanProcessor],
});

provider.register();

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-aws-lambda': {
        disableAwsContextPropagation: true,
      },
    }),
  ],
});
```

Замініть `<backend_url>` на URL вашого улюбленого бекенду, щоб експортувати всі трасування до нього. Якщо у вас ще немає налаштованого бекенду, ви можете поглянути на [Jaeger](https://www.jaegertracing.io/) або [Zipkin](https://zipkin.io/).

Зверніть увагу, що `disableAwsContextPropagation` встановлено у true. Причина цього в тому, що інструментування Lambda намагається стандартно використовувати заголовки контексту X-Ray, якщо активне трасування не ввімкнено для цієї функції, це призводить до не записаного контексту, що створює `NonRecordingSpan`.

Більше деталей можна знайти в [документації](https://www.npmjs.com/package/@opentelemetry/instrumentation-aws-lambda) з інструментування.
[.

### Обробник функцій AWS Lambda {#aws-lambda-function-handler}

Тепер, коли у вас є обгортка Lambda, створіть простий обробник, який служить функцією Lambda. Збережіть наступний код як `handler.js`.

```javascript
/* handler.js */

'use strict';

const https = require('https');

function getRequest() {
  const url = 'https://opentelemetry.io/';

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      reject(new Error(err));
    });
  });
}

exports.handler = async (event) => {
  try {
    const result = await getRequest();
    return {
      statusCode: result,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error.message,
    };
  }
};
```

### Розгортання {#deployment}

Існує кілька способів розгортання вашої функції Lambda:

- [AWS Console](https://aws.amazon.com/console/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Serverless Framework](https://github.com/serverless/serverless)
- [Terraform](https://github.com/hashicorp/terraform)

Тут ми будемо використовувати Serverless Framework, більше деталей можна знайти в [Посібнику з налаштування Serverless Framework](https://www.serverless.com/framework/docs/getting-started).

Створіть файл з назвою `serverless.yml`:

```yaml
service: lambda-otel-native
frameworkVersion: '3'
provider:
  name: aws
  runtime: nodejs14.x
  region: '<your-region>'
  environment:
    NODE_OPTIONS: --require lambda-wrapper
functions:
  lambda-otel-test:
    handler: handler.hello
```

Для правильного функціонування OpenTelemetry, `lambda-wrapper.js` повинен бути включений перед будь-яким іншим файлом: налаштування `NODE_OPTIONS` забезпечує це.

Зверніть увагу, якщо ви не використовуєте Serverless Framework для розгортання вашої функції Lambda, вам потрібно вручну додати цю змінну середовища за допомогою інтерфейсу користувача AWS Console.

Нарешті, виконайте наступну команду, щоб розгорнути проєкт на AWS:

```shell
serverless deploy
```

Тепер ви можете викликати новорозгорнуту функцію Lambda за допомогою інтерфейсу користувача AWS Console. Ви повинні побачити трасування, повʼязані з викликом функції Lambda.

### Відвідування бекенду {#visiting-the-backend}

Тепер ви повинні мати можливість переглядати трасування, створені OpenTelemetry з вашої функції Lambda у бекенді!

## GCP function

Нижче показано, як інструментувати [функцію](https://docs.cloud.google.com/run/docs/write-functions), що спрацьовує на HTTP-запити, за допомогою інтерфейсу користувача Google Cloud Platform (GCP).

### Створення функції {#creating-function}

Увійдіть до GCP і створіть або виберіть проєкт, де повинна бути розміщена ваша функція. У бічному меню перейдіть до _Serverless_ і виберіть _Cloud Functions_. Далі, натисніть _Create Function_, і виберіть [2nd generation](https://cloud.google.com/blog/products/serverless/cloud-functions-2nd-generation-now-generally-available) для вашого середовища, вкажіть імʼя функції та виберіть ваш регіон.

### Налаштування змінної середовища для otelwrapper {#setup-environment-variable-for-otelwrapper}

Якщо закрито, відкрийте меню _Runtime, build, connections and security settings_ і прокрутіть вниз і додайте змінну середовища `NODE_OPTIONS` зі значенням:

```shell
--require ./otelwrapper.js
```

### Вибір середовища виконання {#select-runtime}

На наступному екрані (_Code_), виберіть версію Node.js 16 для вашого середовища виконання.

### Створення обгортки OTel {#create-otel-wrapper}

Створіть новий файл з назвою `otelwrapper.js`, який буде використовуватися для інструментування вашого сервісу. Будь ласка, переконайтеся, що ви вказали `SERVICE_NAME` і встановили
`<address for your backend>`.

```javascript
/* otelwrapper.js */

const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const collectorOptions = {
  url: '<address for your backend>',
};

const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: '<your function name>',
  }),
  spanProcessors: [
    new BatchSpanProcessor(new OTLPTraceExporter(collectorOptions)),
  ],
});

provider.register();

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});
```

### Додавання залежностей пакунка {#add-package-dependencies}

Додайте наступне до вашого `package.json`:

```json
{
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/auto-instrumentations-node": "^0.56.1",
    "@opentelemetry/exporter-trace-otlp-http": "^0.200.0",
    "@opentelemetry/instrumentation": "^0.200.0",
    "@opentelemetry/sdk-trace-base": "^2.0.0",
    "@opentelemetry/sdk-trace-node": "^2.0.0",
    "@opentelemetry/resources": "^2.0.0",
    "@opentelemetry/semantic-conventions": "^2.0.0"
  }
}
```

### Додавання HTTP виклику до функції {#add-http-call-to-function}

Наступний код здійснює виклик на вебсайт OpenTelemetry, щоб продемонструвати вихідний виклик.

```javascript
/* index.js */
const functions = require('@google-cloud/functions-framework');
const https = require('https');

functions.http('helloHttp', (req, res) => {
  let url = 'https://opentelemetry.io/';
  https
    .get(url, (response) => {
      res.send(`Response ${response.body}!`);
    })
    .on('error', (e) => {
      res.send(`Error ${e}!`);
    });
});
```

### Бекенд {#backend}

Якщо ви запускаєте OTel collector у GCP VM, вам, ймовірно, потрібно [створити VPC access connector](https://cloud.google.com/vpc/docs/configure-serverless-vpc-access), щоб мати можливість надсилати трасування.

### Розгортання {#deploy}

Виберіть Розгорнути в інтерфейсі користувача та дочекайтеся готовності розгортання.

### Тестування {#testing}

Ви можете протестувати функцію за допомогою cloud shell з вкладки тестування.
