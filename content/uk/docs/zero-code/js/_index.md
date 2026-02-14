---
title: Інструментування JavaScript без коду
linkTitle: JavaScript
description: Захоплюйте телеметрію з вашого застосунку без змін у вихідному коді
aliases: [/docs/languages/js/automatic]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Інструментування JavaScript без коду надає спосіб інструментувати будь-який застосунок Node.js та захоплювати телеметричні дані з багатьох популярних бібліотек і фреймворків без змін у коді.

## Налаштування {#setup}

Виконайте наступні команди для встановлення відповідних пакунків.

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/auto-instrumentations-node
```

Пакунки `@opentelemetry/api` та `@opentelemetry/auto-instrumentations-node` встановлюють API, SDK та інструменти інструментування.

## Налаштування модуля {#configuring-the-module}

Модуль має широкі можливості конфігурації.

Один з варіантів налаштування модуля — використання `env` для встановлення змінних середовища з CLI:

```shell
env OTEL_TRACES_EXPORTER=otlp OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=your-endpoint \
node --require @opentelemetry/auto-instrumentations-node/register app.js
```

Альтернативно, ви можете використовувати `export` для встановлення змінних середовища:

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_ENDPOINT="your-endpoint"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
export OTEL_SERVICE_NAME="your-service-name"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node app.js
```

Стандартно використовуються всі [детектори ресурсів](/docs/languages/js/resources/) SDK. Ви можете використовувати змінну середовища `OTEL_NODE_RESOURCE_DETECTORS` для включення лише певних детекторів або для повного їх відключення.

Щоб побачити повний спектр налаштувань, дивіться [Налаштування модуля](configuration).

## Підтримувані бібліотеки та фреймворки {#supported-libraries-and-frameworks}

Автоматично інструментуються багато популярних бібліотек Node.js. Для повного списку, дивіться [підтримувані інструментування](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/auto-instrumentations-node#supported-instrumentations).

## Розвʼязання проблем {#troubleshooting}

Ви можете встановити рівень логування, встановивши змінну середовища `OTEL_LOG_LEVEL` на одне з наступних значень:

- `none`
- `error`
- `warn`
- `info`
- `debug`
- `verbose`
- `all`

Стандартний рівень — `info`.

> [!NOTE]
>
> - У промисловому середовищі рекомендується встановити `OTEL_LOG_LEVEL` на `info`.
> - Логи завжди надсилаються до `console`, незалежно від середовища або рівня налагодження.
> - Логи налагодження надзвичайно детальні та можуть негативно вплинути на продуктивність вашого застосунку. Увімкніть налагодження лише за потреби.
