---
title: Конфігурація інструментування без коду
linkTitle: Конфігурація
description: Дізнайтеся, як налаштувати інструментування для Node.js без коду
aliases:
  - /docs/languages/js/automatic/configuration
  - /docs/languages/js/automatic/module-config
weight: 10
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: serviceinstance
---

Модуль має широкі можливості конфігурації за допомогою [змінних середовища](/docs/specs/otel/configuration/sdk-environment-variables/). Багато аспектів поведінки автоматичного інструментування можна налаштувати відповідно до ваших потреб, таких як детектори ресурсів, експортери, заголовки поширення контексту трасування та інше.

## Конфігурація SDK та експортера {#sdk-and-exporter-configuration}

[Конфігурацію SDK](/docs/languages/sdk-configuration/) та експортера можна налаштувати за допомогою змінних середовища.

## Конфігурація детектора ресурсів SDK {#sdk-resource-detector-configuration}

Стандартно модуль увімкне всі детектори ресурсів SDK. Ви можете використовувати змінну середовища `OTEL_NODE_RESOURCE_DETECTORS`, щоб увімкнути лише певні детектори або повністю їх вимкнути:

- `env`
- `host`
- `os`
- `process`
- `serviceinstance`
- `container`
- `alibaba`
- `aws`
- `azure`
- `gcp`
- `all` - увімкнути всі детектори ресурсів
- `none` - вимкнути виявлення ресурсів

Наприклад, щоб увімкнути лише детектори `env` та `host`, ви можете встановити:

```shell
OTEL_NODE_RESOURCE_DETECTORS=env,host
```

## Виключення бібліотек інструментування {#excluding-instrumentation-libraries}

Стандартно увімкнено всі [підтримувані бібліотеки інструментування](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/auto-instrumentations-node/README.md#supported-instrumentations), але ви можете використовувати змінні середовища, щоб увімкнути або вимкнути певні інструментування.

### Увімкнення певних інструментувань {#enabling-specific-instrumentations}

Використовуйте змінну середовища `OTEL_NODE_ENABLED_INSTRUMENTATIONS`, щоб увімкнути лише певні інструментування, надавши список імен бібліотек інструментування через кому без префіксу `@opentelemetry/instrumentation-`.

Наприклад, щоб увімкнути лише [@opentelemetry/instrumentation-http](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http) та [@opentelemetry/instrumentation-express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express) інструментування:

```shell
OTEL_NODE_ENABLED_INSTRUMENTATIONS="http,express"
```

### Вимкнення певних інструментувань {#disabling-specific-instrumentations}

Використовуйте змінну середовища `OTEL_NODE_DISABLED_INSTRUMENTATIONS`, щоб зберегти повний список увімкнених інструментувань і вимкнути лише певні інструментування, надавши список імен бібліотек інструментування через кому без префіксу `@opentelemetry/instrumentation-`.

Наприклад, щоб вимкнути лише [@opentelemetry/instrumentation-fs](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-fs) та
[@opentelemetry/instrumentation-grpc](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc) інструментування:

```shell
OTEL_NODE_DISABLED_INSTRUMENTATIONS="fs,grpc"
```

> [!NOTE]
>
> Якщо встановлені обидві змінні середовища, спочатку застосовується `OTEL_NODE_ENABLED_INSTRUMENTATIONS`, а потім до цього списку застосовується `OTEL_NODE_DISABLED_INSTRUMENTATIONS`. Тому, якщо те саме інструментування включено в обидва списки, це інструментування буде вимкнено.
