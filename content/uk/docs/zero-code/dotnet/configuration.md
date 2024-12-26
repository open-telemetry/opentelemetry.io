---
title: Конфігурація та налаштування
linkTitle: Конфігурація
aliases: [/docs/languages/net/automatic/config]
weight: 20
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: AZUREAPPSERVICE CLSID CORECLR dylib EXPORTЕР ILREWRITE LOGRECORD LOGС NETFX OPERATINGSYSTEM PROCESSRUNTIME SQLCLIENT UNHANDLEDEXCEPTION
---

## Методи конфігурації {#configuration-methods}

Ви можете застосувати або змінити налаштування конфігурації наступними способами, при цьому змінні середовища мають пріоритет над файлами `App.config` або `Web.config`:

1. Змінні середовища

   Змінні середовища є основним способом налаштування параметрів.

2. Файл `App.config` або `Web.config`

   Для застосунку, що працює на .NET Framework, ви можете використовувати файл веб-конфігурації (`web.config`) або файл конфігурації застосунку (`app.config`) для налаштування параметрів `OTEL_*`.

   ⚠️ Тільки налаштування, що починаються з `OTEL_`, можуть бути встановлені за допомогою `App.config` або `Web.config`. Однак наступні налаштування не підтримуються:
   - `OTEL_DOTNET_AUTO_HOME`
   - `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`
   - `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED`
   - `OTEL_DOTNET_AUTO_[TRACES|METRICS|LOGS]_INSTRUMENTATION_ENABLED`
   - `OTEL_DOTNET_AUTO_[TRACES|METRICS|LOGS]_{INSTRUMENTATION_ID}_INSTRUMENTATION_ENABLED`
   - `OTEL_DOTNET_AUTO_LOG_DIRECTORY`
   - `OTEL_LOG_LEVEL`
   - `OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`
   - `OTEL_DOTNET_AUTO_SQLCLIENT_NETFX_ILREWRITE_ENABLED`

   Приклад з налаштуванням `OTEL_SERVICE_NAME`:

   ```xml
   <configuration>
   <appSettings>
       <add key="OTEL_SERVICE_NAME" value="my-service-name" />
   </appSettings>
   </configuration>
   ```

3. Автоматичне визначення імені сервісу

   Якщо імʼя сервісу явно не налаштоване, воно буде згенероване автоматично. Це може бути корисно в деяких випадках.
   - Якщо застосунок розміщений на IIS у .NET Framework, це буде `SiteName\VirtualPath`, наприклад: `MySite\MyApp`
   - Якщо це не так, буде використано імʼя застосунку [entry Assembly](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly.getentryassembly?view=net-7.0).

Типово ми рекомендуємо використовувати змінні середовища для конфігурації. Однак, якщо налаштування підтримує це, то:

- використовуйте `Web.config` для налаштування ASP.NET застосунку (.NET Framework),
- використовуйте `App.config` для налаштування Windows Service (.NET Framework).

## Глобальні налаштування {#global-settings}

| Змінна середовища                    | Опис                                                                                                                                                                                                                                                | Стандартне значення | Статус                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_HOME`              | Місце встановлення.                                                                                                                                                                                                                                 |                     | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES` | Імена виконуваних файлів, які профайлер не може інструментувати. Підтримує кілька значень, розділених комами, наприклад: `ReservedProcess.exe,powershell.exe`. Якщо не встановлено, профайлер стандартно підключається до всіх процесів. \[1\]\[2\] |                     | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED` | Дозволяє можливість завершення процесу, коли автоматична інструментація не може бути виконана. Призначено для налагодження. Не слід використовувати в промисловому середовищі. \[1\]                                                                | `false`             | [Експериментальний](/docs/specs/otel/versioning-and-stability) |

\[1\] Якщо `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED` встановлено в `true`, то процеси, виключені з інструментації за допомогою `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`, завершаться замість продовження роботи.

\[2\] Зверніть увагу, що застосунки, запущені через `dotnet MyApp.dll`, мають імʼя процесу `dotnet` або `dotnet.exe`.

## Ресурси {#resources}

Ресурс — це незмінне представлення сутності, що генерує телеметрію. Дивіться [семантичні домовленості ресурсів](/docs/specs/semconv/resource/) для отримання додаткової інформації.

### Атрибути ресурсу {#resource-attributes}

| Змінна середовища          | Опис                                                                                                                                                                                                                  | Стандартне значення                                                                                                                                                 | Статус                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `OTEL_RESOURCE_ATTRIBUTES` | Пари ключ-значення, які використовуються як атрибути ресурсу. Дивіться [Resource SDK](/docs/specs/otel/resource/sdk#specifying-resource-information-via-an-environment-variable) для отримання додаткової інформації. | Дивіться [семантичні домовленості ресурсів](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value) для отримання додаткової інформації. | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SERVICE_NAME`        | Встановлює значення атрибуту ресурсу [`service.name`](/docs/specs/semconv/resource/#service). Якщо `service.name` вказано в `OTEL_RESOURCE_ATTRIBUTES`, значення `OTEL_SERVICE_NAME` має пріоритет.                   | Дивіться [Автоматичне визначення імені сервісу](#configuration-methods) у розділі Методи конфігурації.                                                              | [Стабільний](/docs/specs/otel/versioning-and-stability) |

### Детектори ресурсів {#resource-detectors}

| Змінна середовища                                | Опис                                                                                                                                                                                                     | Стандартне значення | Статус                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_RESOURCE_DETECTOR_ENABLED`     | Включає всі детектори ресурсів.                                                                                                                                                                          | `true`              | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_{0}_RESOURCE_DETECTOR_ENABLED` | Шаблон конфігурації для включення конкретного детектора ресурсу, де `{0}` - це верхній регістр ID детектора ресурсу, який ви хочете включити. Перевизначає `OTEL_DOTNET_AUTO_RESOURCE_DETECTOR_ENABLED`. | `true`              | [Експериментальний](/docs/specs/otel/versioning-and-stability) |

Наступні детектори ресурсів стандартно включені та активовані:

| ID                | Опис                            | Документація                                                                                                                                                                                                                               | Статус                                                         |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `AZUREAPPSERVICE` | Детектор Azure App Service      | [Документація детектора ресурсів Azure](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Azure-1.0.0-beta.9/src/OpenTelemetry.Resources.Azure/README.md)                                                      | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `CONTAINER`       | Детектор контейнерів            | [Документація детектора ресурсів контейнерів](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Container-1.0.0-beta.9/src/OpenTelemetry.Resources.Container/README.md) **Не підтримується на .NET Framework** | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `HOST`            | Детектор хосту                  | [Документація детектора ресурсів хосту](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Host-0.1.0-beta.3/src/OpenTelemetry.Resources.Host/README.md)                                                        | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OPERATINGSYSTEM` | Детектор операційної системи    | [Документація детектора ресурсів операційної системи](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.OperatingSystem-0.1.0-alpha.4/src/OpenTelemetry.Resources.OperatingSystem/README.md)                   | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `PROCESS`         | Детектор процесів               | [Документація детектора ресурсів процесів](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Process-0.1.0-beta.3/src/OpenTelemetry.Resources.Process/README.md)                                               | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `PROCESSRUNTIME`  | Детектор часу виконання процесу | [Документація детектора ресурсів часу виконання процесу](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.ProcessRuntime-0.1.0-beta.2/src/OpenTelemetry.Resources.ProcessRuntime/README.md)                   | [Експериментальний](/docs/specs/otel/versioning-and-stability) |

## Поширювачі {#propagators}

Поширювачі дозволяють застосункам обмінюватися контекстом. Дивіться [специфікацію OpenTelemetry](/docs/specs/otel/context/api-propagators) для отримання додаткової інформації.

| Змінна середовища  | Опис                                                                                                                                                                                                                                                                                                                               | Стандартне значення    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `OTEL_PROPAGATORS` | Список поширювачів, розділених комами. Підтримувані опції: `tracecontext`, `baggage`, `b3multi`, `b3`. Дивіться [специфікацію OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.14.0/specification/sdk-environment-variables.md#general-sdk-configuration) для отримання додаткової інформації. | `tracecontext,baggage` |

## Семплери {#samplers}

Семплери дозволяють контролювати потенційний шум і навантаження, що вводяться інструментацією OpenTelemetry, вибираючи, які трасування ви хочете збирати та експортувати. Дивіться [специфікацію OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration) для отримання додаткової інформації.

| Змінна середовища         | Опис                                                                     | Стандартне значення     | Статус                                                  |
| ------------------------- | ------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------- |
| `OTEL_TRACES_SAMPLER`     | Семплер, який буде використовуватися для трасувань \[1\]                 | `parentbased_always_on` | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_TRACES_SAMPLER_ARG` | Текстове значення, яке буде використовуватися як аргумент семплера \[2\] |                         | [Стабільний](/docs/specs/otel/versioning-and-stability) |

\[1\]: Підтримувані значення:

- `always_on`,
- `always_off`,
- `traceidratio`,
- `parentbased_always_on`,
- `parentbased_always_off`,
- `parentbased_traceidratio`.

\[2\]: Для семплерів `traceidratio` та `parentbased_traceidratio`: Ймовірність семплінгу, число в діапазоні [0..1], наприклад "0.25". Стандартно 1.0.

## Експортери {#exporters}

Експортери виводять телеметрію.

| Змінна середовища       | Опис                                                                                                | Стандартне значення | Статус                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------- |
| `OTEL_TRACES_EXPORTER`  | Список експортерів, розділених комами. Підтримувані опції: `otlp`, `zipkin` [1], `console`, `none`. | `otlp`              | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_METRICS_EXPORTER` | Список експортерів, розділених комами. Підтримувані опції: `otlp`, `prometheus`, `console`, `none`. | `otlp`              | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOGS_EXPORTER`    | Список експортерів, розділених комами. Підтримувані опції: `otlp`, `console`, `none`.               | `otlp`              | [Стабільний](/docs/specs/otel/versioning-and-stability) |

**[1]**: `zipkin` визнано застарілим і буде видалено у наступному релізі.

### Експортер трасувань {#traces-exporter}

| Змінна середовища                | Опис                                                                                  | Стандартне значення | Статус                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------- |
| `OTEL_BSP_SCHEDULE_DELAY`        | Інтервал затримки (в мілісекундах) між двома послідовними експортами.                 | `5000`              | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_EXPORT_TIMEOUT`        | Максимально допустимий час (в мілісекундах) для експорту даних                        | `30000`             | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_MAX_QUEUE_SIZE`        | Максимальний розмір черги.                                                            | `2048`              | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_MAX_EXPORT_BATCH_SIZE` | Максимальний розмір партії. Повинен бути меншим або рівним `OTEL_BSP_MAX_QUEUE_SIZE`. | `512`               | [Стабільний](/docs/specs/otel/versioning-and-stability) |

### Експортер метрик {#metrics-exporter}

| Змінна середовища             | Опис                                                             | Стандартне значення                                         | Статус                                                  |
| ----------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| `OTEL_METRIC_EXPORT_INTERVAL` | Інтервал часу (в мілісекундах) між початком двох спроб експорту. | `60000` для OTLP експорту, `10000` для консольного експорту | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_METRIC_EXPORT_TIMEOUT`  | Максимально допустимий час (в мілісекундах) для експорту даних.  | `30000` для OTLP експорту, немає для консольного експорту   | [Стабільний](/docs/specs/otel/versioning-and-stability) |

### Експортер логів {#logs-exporter}

| Змінна середовища                                 | Опис                                                       | Стандартне значення | Статус                                                         |
| ------------------------------------------------- | ---------------------------------------------------------- | ------------------- | -------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_LOGS_INCLUDE_FORMATTED_MESSAGE` | Чи слід встановлювати відформатоване повідомлення журналу. | `false`             | [Експериментальний](/docs/specs/otel/versioning-and-stability) |

### OTLP

**Статус**: [Стабільний](/docs/specs/otel/versioning-and-stability)

Щоб увімкнути експортер OTLP, встановіть змінну середовища `OTEL_TRACES_EXPORTER`/`OTEL_METRICS_EXPORTER`/`OTEL_LOGС_EXPORTЕР` на `otlp`.

Щоб налаштувати експортер OTLP за допомогою змінних середовища, дивіться [документацію експорту OTLP](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.15.0/src/OpenTelemetry.Exporter.OpenTelemetryProtocol#environment-variables). Важливі змінні середовища включають:

| Змінна середовища                                   | Опис                                                                                                                                                                                                         | Стандартне значення                                                                  | Статус                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                       | Цільова точка доступу для експортера OTLP. Дивіться [специфікацію OpenTelemetry](/docs/specs/otel/protocol/exporter/) для отримання додаткової інформації.                                                   | `http/protobuf`: `http://localhost:4318`, `grpc`: `http://localhost:4317`            | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`                | Еквівалентно `OTEL_EXPORTER_OTLP_ENDPOINT`, але застосовується тільки до трасувань.                                                                                                                          | `http/protobuf`: `http://localhost:4318/v1/traces`, `grpc`: `http://localhost:4317`  | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`               | Еквівалентно `OTEL_EXPORTER_OTLP_ENDPOINT`, але застосовується тільки до метрик.                                                                                                                             | `http/protobuf`: `http://localhost:4318/v1/metrics`, `grpc`: `http://localhost:4317` | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`                  | Еквівалентно `OTEL_EXPORTER_OTLP_ENDPOINT`, але застосовується тільки до логів.                                                                                                                              | `http/protobuf`: `http://localhost:4318/v1/logs`, `grpc`: `http://localhost:4317`    | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                       | Транспортний протокол експортера OTLP. Підтримувані значення: `grpc`, `http/protobuf`. [1]                                                                                                                   | `http/protobuf`                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`                | Еквівалентно `OTEL_EXPORTER_OTLP_PROTOCOL`, але застосовується тільки до трасувань.                                                                                                                          | `http/protobuf`                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`               | Еквівалентно `OTEL_EXPORTER_OTLP_PROTOCOL`, але застосовується тільки до метрик.                                                                                                                             | `http/protobuf`                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGС_PROTOCOL`                  | Еквівалентно `OTEL_EXPORTER_OTLP_PROTOCOL`, але застосовується тільки до логів.                                                                                                                              | `http/protobuf`                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TIMEOUT`                        | Максимальний час очікування (в мілісекундах) для обробки кожної партії на бекенді.                                                                                                                           | `10000` (10с)                                                                        | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`                 | Еквівалентно `OTEL_EXPORTER_OTLP_TIMEOUT`, але застосовується тільки до трасувань.                                                                                                                           | `10000` (10с)                                                                        | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`                | Еквівалентно `OTEL_EXPORTER_OTLP_TIMEOUT`, але застосовується тільки до метрик.                                                                                                                              | `10000` (10с)                                                                        | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGС_TIMEOUT`                   | Еквівалентно `OTEL_EXPORTER_OTLP_TIMEOUT`, але застосовується тільки до логів.                                                                                                                               | `10000` (10с)                                                                        | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_HEADERS`                        | Список додаткових HTTP-заголовків, розділених комами, які надсилаються з кожним експортом, наприклад: `Authorization=secret,X-Key=Value`.                                                                    |                                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS`                 | Еквівалентно `OTEL_EXPORTER_OTLP_HEADERS`, але застосовується тільки до трасувань.                                                                                                                           |                                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_HEADERS`                | Еквівалентно `OTEL_EXPORTER_OTLP_HEADERS`, але застосовується тільки до метрик.                                                                                                                              |                                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGС_HEADERS`                   | Еквівалентно `OTEL_EXPORTER_OTLP_HEADERS`, але застосовується тільки до логів.                                                                                                                               |                                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_CERTIFICATE`                    | Шлях до файлу сертифіката CA (в форматі PEM) використовується для верифікації сертифіката TLS сервера. \[3\]                                                                                                 |                                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE`             | Шлях до файлу сертифіката клієнта (в форматі PEM) для mTLS автентифікації. \[3\]                                                                                                                             |                                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_CLIENT_KEY`                     | Шлях до файлу сертифіката клієнта (в форматі PEM) для mTLS автентифікації. \[3\]                                                                                                                             |                                                                                      | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT`                 | Максимальний дозволений розмір значення атрибуту.                                                                                                                                                            | немає                                                                                | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_ATTRIBUTE_COUNT_LIMIT`                        | Максимальна кількість атрибутів для відрізка.                                                                                                                                                                | 128                                                                                  | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT`            | Максимальний дозволений розмір значення атрибуту. [Не застосовується для метрик.](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/metrics/sdk.md#attribute-limits). | немає                                                                                | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT`                   | Максимальна кількість атрибутів для відрізка. [Не застосовується для метрик.](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/metrics/sdk.md#attribute-limits).     | 128                                                                                  | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_EVENT_COUNT_LIMIT`                       | Максимальна кількість подій для відрізка.                                                                                                                                                                    | 128                                                                                  | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_LINK_COUNT_LIMIT`                        | Максимальна кількість посилань для відрізка.                                                                                                                                                                 | 128                                                                                  | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT`                  | Максимальна кількість атрибутів для події відрізка.                                                                                                                                                          | 128                                                                                  | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LINK_ATTRIBUTE_COUNT_LIMIT`                   | Максимальна кількість атрибутів для посилання відрізка.                                                                                                                                                      | 128                                                                                  | [Стабільний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT`       | Максимально допустимий розмір значення атрибута запису журналу.                                                                                                                                              | none                                                                                 | [Stable](/docs/specs/otel/versioning-and-stability)     |
| `OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT`              | MМаксимально допустима кількість атрибутів запису журналу.                                                                                                                                                   | 128                                                                                  | [Stable](/docs/specs/otel/versioning-and-stability)     |
| `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` | Темпоральність агрегації, яка використовується на основі типу інструменту. [2]                                                                                                                               | `cumulative`                                                                         | [Стабільний](/docs/specs/otel/versioning-and-stability) |

**[1]**: Міркування щодо `OTEL_EXPORTER_OTLP_PROTOCOL`:

- OpenTelemetry .NET Automatic Instrumentation стандартно використовує `http/protobuf`, що відрізняється від значення стандартно OpenTelemetry .NET SDK `grpc`.
- У .NET 8 і вище, застосунок повинен посилатися на [`Grpc.Net.Client`](https://www.nuget.org/packages/Grpc.Net.Client/) для використання протоколу експортера `grpc` OTLP. Наприклад, додавши `<PackageReference Include="Grpc.Net.Client" Version="2.65.0" />` до файлу `.csproj`.
- У .NET Framework протокол експортера `grpc` OTLP не підтримується.

**[2]**: Визнані (незалежно від регістру) значення для `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE`:

- `Cumulative`: Виберіть кумулятивну темпоральність агрегації для всіх типів інструментів.
- `Delta`: Виберіть темпоральність агрегації Delta для Counter, Asynchronous Counter та Histogram, виберіть кумулятивну агрегацію для UpDownCounter та асинхронного UpDownCounter.
- `LowMemory`: Ця конфігурація використовує темпоральність агрегації Delta для Synchronous Counter та Histogram та використовує кумулятивну темпоральність агрегації для Synchronous UpDownCounter, Asynchronous Counter та Asynchronous UpDownCounter.
  - ⚠️ Це значення, відоме з [специфікації](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.35.0/specification/metrics/sdk_exporters/otlp.md?plain=1#L48), не підтримується.

**[3]**: Міркування щодо конфігурації mTLS (mutual TLS):

- mTLS підтримується лише у .NET 8.0 і вище.
- Всі файли сертифікатів мають бути у форматі PEM.
- При використанні mTLS, `OTEL_EXPORTER_OTLP_ENDPOINT` має використовувати `https://`.
- mTLS не підтримується на .NET Framework.

### Prometheus

**Статус**: [Експериментальний](/docs/specs/otel/versioning-and-stability)

> [!WARNING]Попередження **Не використовуйте у промисловій експлуатації.**
>
> Експортер Prometheus призначений для внутрішнього циклу розробки. Середовища промислової експлуатації можуть використовувати комбінацію експортера OTLP з [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector-releases), який має [`otlp` приймач](https://github.com/open-telemetry/opentelemetry-collector/tree/v0.97.0/receiver/otlpreceiver) та [`prometheus` експортер](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.97.0/exporter/prometheusexporter).

Щоб увімкнути експортер Prometheus, встановіть змінну середовища `OTEL_METRICS_EXPORTER` на `prometheus`.

Експортер відкриває HTTP-кінець для метрик на `http://localhost:9464/metrics` і кешує відповіді протягом 300 мілісекунд.

Дивіться [документацію Prometheus Exporter HttpListener](https://github.com/open-telemetry/opentelemetry-dotnet/tree/coreunstable-1.15.0-beta.1/src/OpenTelemetry.Exporter.Prometheus.HttpListener) для отримання додаткової інформації.

### Zipkin

**Статус**: [Стабільний](/docs/specs/otel/versioning-and-stability)

Щоб увімкнути експортер Zipkin, встановіть змінну середовища `OTEL_TRACES_EXPORTER` на `zipkin`.

Щоб налаштувати експортер Zipkin за допомогою змінних середовища, дивіться [документацію експортера Zipkin](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.15.0/src/OpenTelemetry.Exporter.Zipkin#configuration-using-environment-variables). Важливі змінні середовища включають:

| Змінна середовища               | Опис       | Стандартне значення                  | Статус                                                  |
| ------------------------------- | ---------- | ------------------------------------ | ------------------------------------------------------- |
| `OTEL_EXPORTER_ZIPKIN_ENDPOINT` | URL Zipkin | `http://localhost:9411/api/v2/spans` | [Стабільний](/docs/specs/otel/versioning-and-stability) |

## Додаткові налаштування {#additional-settings}

| Змінна середовища                                   | Опис                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Стандартне значення | Статус                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_TRACES_ENABLED`                   | Вмикає трасування.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `true`              | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_OPENTRACING_ENABLED`              | Вмикає трасувальник OpenTracing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `false`             | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGS_ENABLED`                     | Вмикає логи.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `true`              | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_ENABLED`                  | Вмикає метрики.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `true`              | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`           | Вмикає автоматичне перенаправлення збірок, які використовуються автоматичною інструментацією на .NET Framework.                                                                                                                                                                                                                                                                                                                                                                                                 | `true`              | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES`        | Список додаткових імен `System.Diagnostics.ActivitySource`, розділених комами, які будуть додані до трасувальника при запуску. Використовуйте це для захоплення вручну інструментованих відрізків.                                                                                                                                                                                                                                                                                                              |                     | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_LEGACY_SOURCES` | Список додаткових імен джерел спадщини, розділених комами, які будуть додані до трасувальника при запуску. Використовуйте це для захоплення обʼєктів `System.Diagnostics.Activity`, створених без використання API `System.Diagnostics.ActivitySource`.                                                                                                                                                                                                                                                         |                     | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_FLUSH_ON_UNHANDLEDEXCEPTION`      | Контролює, чи слід очищати дані телеметрії, коли виникає подія [AppDomain.UnhandledException](https://docs.microsoft.com/en-us/dotnet/api/system.appdomain.unhandledexception). Встановіть значення `true`, якщо ви підозрюєте, що у вас виникає проблема з відсутніми даними телеметрії та також виникають необроблені винятки.                                                                                                                                                                                | `false`             | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES`       | Список додаткових імен `System.Diagnostics.Metrics.Meter`, розділених комами, які будуть додані до лічильника при запуску. Використовуйте це для захоплення вручну створених відрізків.                                                                                                                                                                                                                                                                                                                         |                     | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_PLUGINS`                          | Список втулків інструментації OTel SDK, розділених двокрапкою, вказаних з [assembly-qualified name](https://docs.microsoft.com/en-us/dotnet/api/system.type.assemblyqualifiedname?view=net-6.0#system-type-assemblyqualifiedname). _Примітка: Цей список повинен бути розділений двокрапкою, оскільки імена типів можуть містити коми._ Дивіться більше інформації про те, як писати плагіни на [plugins.md](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/plugins.md). |                     | [Експериментальний](/docs/specs/otel/versioning-and-stability) |

## RuleEngine

RuleEngine — це функція, яка перевіряє збірки OpenTelemetry API, SDK, інструментації та експортера на наявність непідтримуваних сценаріїв, забезпечуючи більшу стабільність автоматичної інструментації OpenTelemetry шляхом відступу замість аварійного завершення. Працює на .NET 8 і вище.

Увімкніть RuleEngine лише під час першого запуску застосунку або коли змінюється розгортання або оновлюється бібліотека автоматичної інструментації. Після перевірки немає необхідності повторно перевіряти правила при перезапуску застосунку.

| Змінна середовища                      | Опис               | Стандартне значення | Статус                                                         |
| -------------------------------------- | ------------------ | ------------------- | -------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_RULE_ENGINE_ENABLED` | Вмикає RuleEngine. | `true`              | [Експериментальний](/docs/specs/otel/versioning-and-stability) |

## Профайлер .NET CLR {#net-clr-profiler}

CLR використовує наступні змінні середовища для налаштування профайлера. Дивіться [Завантаження профайлера .NET Runtime](https://github.com/dotnet/runtime/blob/d8302cef7946be82775ba5b94a88ad8eee800714/docs/design/coreclr/profiling/Profiler%20Loading.md) для отримання додаткової інформації.

| Змінна середовища .NET Framework | Змінна середовища .NET     | Опис                                                                                                      | Необхідне значення                                                                                                                                                                                                                                                | Статус                                                         |
| -------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `COR_ENABLE_PROFILING`           | `CORECLR_ENABLE_PROFILING` | Вмикає профайлер.                                                                                         | `1`                                                                                                                                                                                                                                                               | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER`                   | `CORECLR_PROFILER`         | CLSID профайлера.                                                                                         | `{918728DD-259F-4A6A-AC2B-B85E1B658318}`                                                                                                                                                                                                                          | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH`              | `CORECLR_PROFILER_PATH`    | Шлях до профайлера.                                                                                       | `$INSTALL_DIR/linux-x64/OpenTelemetry.AutoInstrumentation.Native.so` для Linux glibc, `$INSTALL_DIR/linux-musl-x64/OpenTelemetry.AutoInstrumentation.Native.so` для Linux musl, `$INSTALL_DIR/osx-arm64/OpenTelemetry.AutoInstrumentation.Native.dylib` для macOS | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH_32`           | `CORECLR_PROFILER_PATH_32` | Шлях до 32-бітного профайлера. Шляхи, специфічні для розрядності, мають пріоритет над загальними шляхами. | `$INSTALL_DIR/win-x86/OpenTelemetry.AutoInstrumentation.Native.dll` для Windows                                                                                                                                                                                   | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH_64`           | `CORECLR_PROFILER_PATH_64` | Шлях до 64-бітного профайлера. Шляхи, специфічні для розрядності, мають пріоритет над загальними шляхами. | `$INSTALL_DIR/win-x64/OpenTelemetry.AutoInstrumentation.Native.dll` для Windows                                                                                                                                                                                   | [Експериментальний](/docs/specs/otel/versioning-and-stability) |

Налаштування OpenTelemetry .NET Automatic Instrumentation як профайлера .NET CLR є обовʼязковим для .NET Framework.

У .NET профайлер .NET CLR використовується тільки для інструментації байт-коду. Якщо прийнятна лише інструментація вихідного коду, ви можете скинути або видалити наступні змінні середовища:

```env
COR_ENABLE_PROFILING
COR_PROFILER
COR_PROFILER_PATH_32
COR_PROFILER_PATH_64
CORECLR_ENABLE_PROFILING
CORECLR_PROFILER
CORECLR_PROFILER_PATH
CORECLR_PROFILER_PATH_32
CORECLR_PROFILER_PATH_64
```

## .NET Runtime

У .NET необхідно встановити змінну середовища [`DOTNET_STARTUP_HOOKS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/host-startup-hook.md), якщо профайлер .NET CLR не використовується.

Змінні середовища [`DOTNET_ADDITIONAL_DEPS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/additional-deps.md) та [`DOTNET_SHARED_STORE`](https://docs.microsoft.com/en-us/dotnet/core/deploying/runtime-store) використовуються для помʼякшення конфліктів версій збірок у .NET.

| Змінна середовища        | Необхідне значення                                                   | Статус                                                         |
| ------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `DOTNET_STARTUP_HOOKS`   | `$INSTALL_DIR/net/OpenTelemetry.AutoInstrumentation.StartupHook.dll` | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `DOTNET_ADDITIONAL_DEPS` | `$INSTALL_DIR/AdditionalDeps`                                        | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `DOTNET_SHARED_STORE`    | `$INSTALL_DIR/store`                                                 | [Експериментальний](/docs/specs/otel/versioning-and-stability) |

Якщо використовується .NET CLR Profiler і змінна середовища [`DOTNET_STARTUP_HOOKS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/host-startup-hook.md) не встановлена, профайлер шукає `OpenTelemetry.AutoInstrumentation. StartupHook.dll` у відповідній теці відносно розташування файлу `OpenTelemetry.AutoInstrumentation.Native.dll`. Структура теки може відповідати структурі ZIP-архіву або структурі пакета NuGet (залежно від платформи або незалежно від неї). Якщо збірка запуску не знайдена, завантаження профайлера буде припинено.

## Внутрішні логи {#internal-logs}

Типові шляхи до тек внутрішніх логів:

- Windows: `%ProgramData%\OpenTelemetry .NET AutoInstrumentation\logs`
- Linux: `/var/log/opentelemetry/dotnet`
- macOS: `/var/log/opentelemetry/dotnet`

Якщо типові теки логів не можуть бути створені, інструментація використовує шлях до [тимчасової теки](https://docs.microsoft.com/en-us/dotnet/api/System.IO.Path.GetTempPath?view=net-6.0) поточного користувача.

| Змінна середовища                | Опис                                                                                                                | Стандартне значення                            | Статус                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_LOG_DIRECTORY` | Тека логів .NET Tracer.                                                                                             | _Дивіться попередню примітку про типові шляхи_ | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOG_LEVEL`                 | Рівень журналу SDK. (підтримувані значення: `none`,`error`,`warn`,`info`,`debug`)                                   | `info`                                         | [Стабільний](/docs/specs/otel/versioning-and-stability)        |
| `OTEL_DOTNET_AUTO_LOGGER`        | Синхронізація діагностичних журналів AutoInstrumentation (підтримувані значення: `none`,`file`,`console`)           | `file`                                         | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOG_FILE_SIZE` | Максимальний розмір (у байтах) одного файлу журналу, створеного за допомогою функції автоматичного інструментування | 10 485 760 (10 MB)                             | [Експериментальний](/docs/specs/otel/versioning-and-stability) |
