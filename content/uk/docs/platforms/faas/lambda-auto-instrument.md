---
title: Автоматична інструменталізація Lambda
weight: 11
description: Автоматично інструментуйте ваші Lambda за допомогою OpenTelemetry
default_lang_commit: f048ad97541439a7065511b689056e26aad62d23
cSpell:ignore: Corretto
---

Спільнота OpenTelemetry надає окремі шари інструменталізації Lambda для наступних мов:

- Java
- JavaScript
- Python
- Ruby

Ці шари можна додати до вашої Lambda за допомогою порталу AWS для автоматичної інструменталізації вашого застосунку. Ці шари не включають Collector, який є обовʼязковим доповненням, якщо ви не налаштуєте зовнішній екземпляр Collector для надсилання ваших даних.

## Додайте ARN шару OTel Collector Lambda {#add-the-arn-of-the-otel-collector-lambda-layer}

Дивіться [керівництво по шару Collector Lambda](../lambda-collector/), щоб додати шар до вашого застосунку та налаштувати Collector. Ми рекомендуємо додати це спочатку.

## Вимоги до мови {#language-requirements}

{{< tabpane text=true >}} {{% tab Java %}}

Шар Lambda підтримує середовища виконання Java 8, 11 та 17 (Corretto). Для отримання додаткової інформації про підтримувані версії Java дивіться [документацію OpenTelemetry Java](/docs/languages/java/).

**Примітка:** Агент автоматичної інструменталізації Java знаходиться в шарі Lambda — Автоматична інструменталізація має значний вплив на час запуску в AWS Lambda, і вам зазвичай потрібно використовувати це разом з виділеним паралелізмом та запитами на розігрів, щоб обслуговувати ваші промислові запити без виклику тайм-аутів на початкових запитах під час ініціалізації.

Стандартно агент OTel Java в шарі спробує автоматично інструментувати весь код у вашому застосунку. Це може негативно вплинути на час холодного запуску Lambda.

Ми рекомендуємо вмикати автоматичну інструменталізацію лише для бібліотек/фреймворків, які використовуються вашим застосунком.

Щоб увімкнути лише конкретні інструменталізації, ви можете використовувати наступні змінні середовища:

- `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED`: якщо встановлено false, вимикає автоматичну інструменталізацію в шарі, вимагаючи увімкнення кожної інструменталізації окремо.
- `OTEL_INSTRUMENTATION_<NAME>_ENABLED`: встановіть true, щоб увімкнути автоматичну інструменталізацію для конкретної бібліотеки або фреймворку. Замініть `<NAME>` на інструменталізацію, яку ви хочете увімкнути. Для списку доступних інструменталізацій дивіться [Придушення конкретної інструменталізації агента][1].

  [1]: /docs/zero-code/java/agent/disable/#suppressing-specific-agent-instrumentation

Наприклад, щоб увімкнути автоматичну інструменталізацію лише для Lambda та AWS SDK, ви повинні встановити наступні змінні середовища:

```sh
OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false
OTEL_INSTRUMENTATION_AWS_LAMBDA_ENABLED=true
OTEL_INSTRUMENTATION_AWS_SDK_ENABLED=true
```

{{% /tab %}} {{% tab JavaScript %}}

Шар Lambda підтримує середовища виконання Node.js v18+. Для отримання додаткової інформації про підтримувані версії JavaScript та Node.js дивіться [документацію OpenTelemetry JavaScript](https://github.com/open-telemetry/opentelemetry-js).

{{% /tab %}} {{% tab Python %}}

Шар Lambda підтримує середовища виконання Python 3.9+. Для отримання додаткової інформації про підтримувані версії Python дивіться [документацію OpenTelemetry Python](https://github.com/open-telemetry/opentelemetry-python/blob/main/README.md#supported-runtimes) та пакет на [PyPi](https://pypi.org/project/opentelemetry-api/).

{{% /tab %}} {{% tab Ruby %}}

Шар Lambda підтримує середовища виконання Ruby 3.2 та 3.3. Для отримання додаткової інформації про підтримувані версії OpenTelemetry Ruby SDK та API дивіться [документацію OpenTelemetry Ruby](https://github.com/open-telemetry/opentelemetry-ruby/blob/main/README.md#compatibility) та пакет на [RubyGem](https://rubygems.org/search?query=opentelemetry).

{{% /tab %}} {{< /tabpane >}}

## Налаштуйте `AWS_LAMBDA_EXEC_WRAPPER` {#configure-aws_lambda_exec_wrapper}

Змініть точку входу вашого застосунку, встановивши `AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler` для Node.js, Java, Ruby чи Python. Ця скрипт-обгортка викликатиме ваш застосунок Lambda з застосованою автоматичною інструменталізацією.

## Додайте ARN шару інструменталізації Lambda {#add-the-arn-of-instrumentation-lambda-layer}

Щоб увімкнути автоматичну інструменталізацію OTel у вашій функції Lambda, вам потрібно додати та налаштувати шари інструменталізації та Collector, а потім увімкнути трасування.

1. Відкрийте функцію Lambda, яку ви маєте намір інструментувати, в консолі AWS.
2. У розділі Layers in Designer виберіть Add a layer.
3. У розділі specify an ARN вставте ARN шару, а потім виберіть Add.

Знайдіть [найновіший реліз шару інструменталізації](https://github.com/open-telemetry/opentelemetry-lambda/releases) для вашої мови та використовуйте його ARN після зміни теґу `<region>` на регіон, в якому знаходиться ваша Lambda.

Примітка: Шари Lambda є регіоналізованим ресурсом, тобто вони можуть використовуватися лише в регіоні, в якому вони опубліковані. Переконайтеся, що використовуєте шар в тому ж регіоні, що і ваші функції Lambda. Спільнота публікує шари у всіх доступних регіонах.

## Налаштуйте експортери SDK {#configure-your-sdk-exporters}

Стандартні експортери, які використовуються шарами Lambda, працюватимуть без змін, якщо є вбудований Collector з приймачами gRPC / HTTP. Змінні середовища не потрібно оновлювати. Однак, існують різні рівні підтримки протоколів та стандартних значень для кожної мови, які задокументовані нижче.

{{< tabpane text=true >}} {{% tab Java %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=grpc` підтримує: `grpc`, `http/protobuf` та `http/json` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`

{{% /tab %}} {{% tab JavaScript %}}

Змінна середовища `OTEL_EXPORTER_OTLP_PROTOCOL` не підтримується. Жорстко закодований експортер використовує протокол `http/protobuf` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{% tab Python %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` підтримує: `http/protobuf` та `http/json` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{% tab Ruby %}}

`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` підтримує: `http/protobuf` `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

{{% /tab %}} {{< /tabpane >}}

## Опублікуйте вашу Lambda {#publish-your-lambda}

Опублікуйте нову версію вашої Lambda, щоб розгорнути нові зміни та інструменталізацію.
