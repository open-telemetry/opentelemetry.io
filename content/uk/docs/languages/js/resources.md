---
title: Ресурси
weight: 70
description: Додайте деталі про середовище вашого застосунку до вашої телеметрії
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: myhost SIGINT uuidgen WORKDIR
---

{{% docs/languages/resources-intro %}}

Нижче ви знайдете вступи про те, як налаштувати виявлення ресурсів за допомогою Node.js SDK.

## Налаштування {#setup}

Дотримуйтесь інструкцій з [Початок роботи - Node.js][], щоб у вас були файли `package.json`, `app.js` (або `app.ts`) та `instrumentation.mjs` (або `instrumentation.ts`).

## Виявлення ресурсів процесу та середовища {#process--environment-resource-detection}

З коробки, Node.js SDK виявляє [ресурси процесу та середовища процесу][] і бере атрибути зі змінної середовища `OTEL_RESOURCE_ATTRIBUTES`. Ви можете перевірити, що він виявляє, увімкнувши діагностичне логування у вашому файлі інструментування:

```javascript
// Для усунення несправностей встановіть рівень логу на DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

Запустіть застосунок з деякими значеннями, встановленими в `OTEL_RESOURCE_ATTRIBUTES`, наприклад, ми встановили `host.name`, щоб ідентифікувати [Хост][]:

```console
$ env OTEL_RESOURCE_ATTRIBUTES="host.name=localhost" \
  node --import ./instrumentation.mjs app.js
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: { 'host.name': 'localhost' } }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 12345,
    'process.executable.name': 'node',
    'process.command': '/app.js',
    'process.command_line': '/bin/node /app.js',
    'process.runtime.version': '16.17.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
...
```

## Додавання ресурсів за допомогою змінних середовища {#adding-resources-with-environment-variables}

У наведеному вище прикладі SDK виявив процес і також додав атрибут `host.name=localhost`, встановлений через змінну середовища автоматично.

Нижче ви знайдете інструкції щодо автоматичного виявлення ресурсів. Однак, ви можете зіткнутися з ситуацією, коли детектор для потрібного вам ресурсу не існує. У такому випадку використовуйте змінну середовища `OTEL_RESOURCE_ATTRIBUTES`, щоб додати все, що вам потрібно. Крім того, ви можете використовувати змінну середовища `OTEL_SERVICE_NAME`, щоб встановити значення атрибута ресурсу `service.name`. Наприклад, наступний скрипт додає [Сервіс][], [Хост][] та [ОС][] атрибути ресурсів:

```console
$ env OTEL_SERVICE_NAME="app.js" OTEL_RESOURCE_ATTRIBUTES="service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=${HOSTNAME},host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" \
  node --import ./instrumentation.mjs app.js
...
EnvDetector found resource. Resource {
  attributes: {
    'service.name': 'app.js',
    'service.namespace': 'tutorial',
    'service.version': '1.0',
    'service.instance.id': '46D99F44-27AB-4006-9F57-3B7C9032827B',
    'host.name': 'myhost',
    'host.type': 'arm64',
    'os.name': 'linux',
    'os.version': '6.0'
  }
}
...
```

## Додавання ресурсів у коді {#adding-resources-in-code}

Власні ресурси також можна налаштувати у вашому коді. `NodeSDK` надає опцію конфігурації, де ви можете їх встановити. Наприклад, ви можете оновити ваш файл інструментування наступним чином, щоб встановити атрибути `service.*`:

```javascript
...
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
...
const sdk = new opentelemetry.NodeSDK({
  ...
  resource: resourceFromAttributes({
    [ ATTR_SERVICE_NAME ]: "yourServiceName",
    [ ATTR_SERVICE_VERSION ]: "1.0",
  })
  ...
});
...
```

> [!NOTE]
>
> Якщо ви встановлюєте атрибути ресурсів через змінну середовища та код, значення, встановлені через змінну середовища, мають пріоритет.

## Виявлення ресурсів контейнера {#container-resources-detection}

Використовуйте ті ж самі налаштування (`package.json`, `app.js` та `instrumentation.mjs` з увімкненим налагодженням) та `Dockerfile` з наступним вмістом у тій самій теці:

```Dockerfile
FROM node:latest
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "--import", "./instrumentation.mjs", "app.js" ]
```

Щоб переконатися, що ви можете зупинити свій docker-контейнер за допомогою <kbd>Ctrl + C</kbd> (`SIGINT`), додайте наступне в кінець `app.js`:

```javascript
process.on('SIGINT', function () {
  process.exit();
});
```

Щоб автоматично виявити ID вашого контейнера, встановіть наступну додаткову залежність:

```sh
npm install @opentelemetry/resource-detector-container
```

Далі, оновіть ваш `instrumentation.mjs` наступним чином:

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');

// Для усунення несправностей встановіть рівень логу на DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  resourceDetectors: [containerDetector],
});

sdk.start();
```

Створіть свій docker-образ:

```sh
docker build . -t nodejs-otel-getting-started
```

Запустіть свій docker-контейнер:

```sh
$ docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': 'fffbeaf682f32ef86916f306ff9a7f88cc58048ab78f7de464da3c3201db5c54'
  }
}
```

Детектор витягнув `container.id` для вас. Однак ви можете помітити, що в цьому прикладі відсутні атрибути процесу та атрибути, встановлені через змінну середовища! Щоб вирішити це, коли ви встановлюєте список `resourceDetectors`, вам також потрібно вказати детектори `envDetector` та
`processDetector`:

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');
const { envDetector, processDetector } = require('@opentelemetry/resources');

// Для усунення несправностей встановіть рівень логу на DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  // Переконайтеся, що додали всі необхідні детектори тут!
  resourceDetectors: [envDetector, processDetector, containerDetector],
});

sdk.start();
```

Перебудуйте свій образ і знову запустіть свій контейнер:

```shell
docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: {} }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 1,
    'process.executable.name': 'node',
    'process.command': '/usr/src/app/app.js',
    'process.command_line': '/usr/local/bin/node /usr/src/app/app.js',
    'process.runtime.version': '18.9.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': '654d0670317b9a2d3fc70cbe021c80ea15339c4711fb8e8b3aa674143148d84e'
  }
}
...
```

## Наступні кроки {#next-steps}

До конфігурації можна додати більше детекторів ресурсів, наприклад, щоб отримати деталі про ваше [Хмарне][хмара] середовище або [Розгортання][]. Для отримання додаткової інформації дивіться [пакунки з назвою `resource-detector-*` у сховищі opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages).

[початок роботи - node.js]: /docs/languages/js/getting-started/nodejs/
[ресурси процесу та середовища процесу]: /docs/specs/semconv/resource/process/
[хост]: /docs/specs/semconv/resource/host/
[хмара]: /docs/specs/semconv/resource/cloud/
[розгортання]: /docs/specs/semconv/resource/deployment-environment/
[сервіс]: /docs/specs/semconv/resource/#service
[ос]: /docs/specs/semconv/resource/os/
