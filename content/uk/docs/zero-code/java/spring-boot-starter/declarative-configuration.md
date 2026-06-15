---
title: Декларативна конфігурація
weight: 25
default_lang_commit: 1b2e54f4c38d9f6ad394ac352529580a11cc29a8
cSpell:ignore: Customizer Dotel
---

Декларативна конфігурація використовує схему [декларативної конфігурації OpenTelemetry](/docs/languages/sdk-configuration/declarative-configuration/) всередині вашого `application.yaml`.

Цей підхід корисний, коли:

- У вас багато параметрів конфігурації для налаштування
- Ви хочете використовувати параметри конфігурації, які недоступні через `application.properties` або `application.yaml`
- Ви хочете використовувати той самий формат конфігурації, що й [Java агент](/docs/zero-code/java/agent/declarative-configuration/)

> [!WARNING]
>
> Декларативна конфігурація є експериментальною.

## Підтримувані версії {#supported-versions}

Декларативна конфігурація підтримується у **OpenTelemetry Spring Boot starter версії 2.26.0 і пізніших**.

## Початок роботи {#getting-started}

Додайте `otel.file_format: "1.0"` (або поточну чи бажану версію) до вашого `application.yaml`, щоб увімкнути декларативну конфігурацію:

```yaml
otel:
  file_format: '1.0'

  resource:
    detection/development:
      detectors:
        - service:
    attributes:
      - name: service.name
        value: my-spring-app

  propagator:
    composite:
      - tracecontext:
      - baggage:

  tracer_provider:
    processors:
      - batch:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:http://localhost:4318/v1/traces}

  meter_provider:
    readers:
      - periodic:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:http://localhost:4318/v1/metrics}

  logger_provider:
    processors:
      - batch:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:http://localhost:4318/v1/logs}
```

Зверніть увагу, що `${VAR:default}` використовує двокрапку (синтаксис Spring), а не `${VAR:-default}`, який використовується у YAML-файлі агента.

## Перетворення наявної конфігурації {#convert-your-existing-configuration}

{{< uk/dc-converter source="spring" >}}

## Зіставлення параметрів конфігурації {#mapping-of-configuration-options}

Наступні правила описують, як параметри конфігурації `application.properties` / `application.yaml` відповідають їх еквівалентам у декларативній конфігурації:

### Увімкнення/вимкнення інструменталізації {#instrumentation-enabledisable}

У декларативній конфігурації увімкнення/вимкнення інструменталізації використовує централізовані списки замість окремих властивостей. Назва інструменталізації використовує `_` (snake_case), а не `-` (kebab-case).

| Властивості                                           | Декларативна конфігурація                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `otel.instrumentation.jdbc.enabled=true`              | `otel.distribution.spring_starter.instrumentation.enabled: [jdbc]`              |
| `otel.instrumentation.logback-appender.enabled=false` | `otel.distribution.spring_starter.instrumentation.disabled: [logback_appender]` |
| `otel.instrumentation.common.default-enabled=false`   | `otel.distribution.spring_starter.instrumentation.default_enabled: false`       |

Приклад:

```yaml
otel:
  distribution:
    spring_starter:
      instrumentation:
        default_enabled: false
        enabled:
          - jdbc
          - spring_web
        disabled:
          - logback_appender
```

### Конфігурація інструменталізації {#instrumentation-configuration}

Параметри конфігурації під `otel.instrumentation.*` (крім увімкнення/вимкнення) відповідають `otel.instrumentation/development.java.*`:

1. Видаліть префікс `otel.instrumentation.`
2. Для кожного сегмента: замініть `-` на `_`
3. Розмістіть під `otel.instrumentation/development.java.`
4. Суфікс `/development` у ключі вказує на експериментальну функцію (див. метод `translateName` у `ConfigPropertiesBackedDeclarativeConfigProperties` для зворотного відображення)

Приклад:

| Властивості                                                         | Декларативна конфігурація                                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `otel.instrumentation.logback-appender.experimental-log-attributes` | `otel.instrumentation/development.java.logback_appender.experimental_log_attributes/development` |

Деякі параметри мають спеціальні відображення, які не відповідають стандартному алгоритму:

| Властивості                                                             | Декларативна конфігурація                                                                          |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `otel.instrumentation.common.db-statement-sanitizer.enabled`            | `otel.instrumentation/development.java.common.database.statement_sanitizer.enabled`                |
| `otel.instrumentation.http.client.capture-request-headers`              | `otel.instrumentation/development.general.http.client.request_captured_headers`                    |
| `otel.instrumentation.http.client.capture-response-headers`             | `otel.instrumentation/development.general.http.client.response_captured_headers`                   |
| `otel.instrumentation.http.server.capture-request-headers`              | `otel.instrumentation/development.general.http.server.request_captured_headers`                    |
| `otel.instrumentation.http.server.capture-response-headers`             | `otel.instrumentation/development.general.http.server.response_captured_headers`                   |
| `otel.instrumentation.http.client.emit-experimental-telemetry`          | `otel.instrumentation/development.java.common.http.client.emit_experimental_telemetry/development` |
| `otel.instrumentation.http.server.emit-experimental-telemetry`          | `otel.instrumentation/development.java.common.http.server.emit_experimental_telemetry/development` |
| `otel.instrumentation.http.known-methods`                               | `otel.instrumentation/development.java.common.http.known_methods`                                  |
| `otel.instrumentation.messaging.experimental.receive-telemetry.enabled` | `otel.instrumentation/development.java.common.messaging.receive_telemetry/development.enabled`     |
| `otel.jmx.enabled`                                                      | `otel.instrumentation/development.java.jmx.enabled`                                                |

Розділ `instrumentation/development` має дві групи верхнього рівня:

- `general.*` — Крос-мовна конфігурація (HTTP заголовки, стабільність семантичних конвенцій)
- `java.*` — Конфігурація інструментування, специфічна для Java

### Вимкнення SDK {#disable-the-sdk}

| Властивості              | Декларативна конфігурація |
| ------------------------ | ------------------------- |
| `otel.sdk.disabled=true` | `otel.disabled: true`     |

### Конфігурація SDK {#sdk-configuration}

Конфігурація на рівні SDK (експортери, пропагатори, ресурси) слідує стандартній [схемі декларативної конфігурації](/docs/languages/sdk-configuration/declarative-configuration/) безпосередньо під `otel:`, як показано в прикладі [Початок роботи](#getting-started).

## Відмінності від декларативної конфігурації агента {#differences-from-agent-declarative-configuration}

| Аспект                    | Агент                                                    | Spring Boot starter                                           |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Розташування конфігурації | Окремий файл (`-Dotel.config.file=...`)                  | Всередині `application.yaml`                                  |
| Синтаксис змінних         | `${VAR:-default}` (подвійна двокрапка)                   | `${VAR:default}` (одинарна двокрапка, Spring)                 |
| Профілі                   | Не підтримується                                         | Профілі Spring працюють нормально                             |
| Увімкнення/вимкнення      | `distribution.javaagent.instrumentation.*`               | `distribution.spring_starter.instrumentation.*`               |
| Зазвичай увімкнено        | `distribution.javaagent.instrumentation.default_enabled` | `distribution.spring_starter.instrumentation.default_enabled` |

## Перевизначення змінних середовища {#environment-variable-overrides}

Гнучка система привʼязки Spring дозволяє замінити будь-яку частину декларативної конфігурації YAML за допомогою змінних середовища:

```shell
# Перевизначення скалярного значення в instrumentation/development
OTEL_INSTRUMENTATION/DEVELOPMENT_JAVA_FOO_STRING_KEY=new_value

# Перевизначення елемента списку за індексом (наприклад, endpoint експортера)
OTEL_TRACER_PROVIDER_PROCESSORS_0_BATCH_EXPORTER_OTLP_HTTP_ENDPOINT=http://custom:4318/v1/traces
```

Правила: великі літери, заміна `.` на `_`, залишати `/` без змін (наприклад `INSTRUMENTATION/DEVELOPMENT`), використовувати `_0_`, `_1_` для індексів списку.

Це стандартна функція Spring — вона працює для будь-якого ключа в `application.yaml`.

## Формат тривалості {#duration-format}

Декларативна конфігурація **підтримує тривалості лише в мілісекундах** (наприклад, `5000` для 5 секунд). Ви отримаєте помилку, якщо використаєте рядок тривалості, такий як `5s`.

## Програмна конфігурація {#programmatic-configuration}

З декларативною конфігурацією, `AutoConfigurationCustomizerProvider` (див. [Програмна конфігурація](../programmatic-configuration/)) замінюється на `DeclarativeConfigurationCustomizerProvider`. Компоненти, такі як експортера відрізків, використовують API `ComponentProvider`. Дивіться розділ [Розширення API](/docs/zero-code/java/agent/declarative-configuration/) для Агента для деталей та прикладів — ті ж API застосовуються до Spring Boot starter.
