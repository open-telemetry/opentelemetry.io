---
title: Конфігурація
description: Опції конфігурації для OpenTelemetry PHP Distro.
weight: 1
# prettier-ignore
cSpell:ignore: ComponentProvider keypass opentelemetry-php-contrib stderr syslog yaml автоінструментаційні автоінструментації серіалізатор
default_lang_commit: be35d47dc1ad8f2c4d3607927a14e9c4cb2d2102
---

OpenTelemetry PHP Distro підтримує стандартну конфігурацію OpenTelemetry PHP SDK та специфічні для distro опції.

## Метод конфігурації {#configuration-methods}

Налаштуйте через змінні середовища, доступні для PHP-процесів:

- `OTEL_*` для стандартних опцій OpenTelemetry
- `OTEL_PHP_*` для специфічних для distro опцій

Приклад:

```sh
export OTEL_EXPORTER_OTLP_ENDPOINT="https://your-endpoint:443/"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <token>"
export OTEL_PHP_LOG_LEVEL_STDERR="INFO"
```

## Опції OpenTelemetry {#opentelemetry-options}

Distro підтримує стандартні опції OpenTelemetry PHP SDK.

| Опція                                   | Стандартно              | Допустимі значення               | Опис                                             |
| --------------------------------------- | ----------------------- | -------------------------------- | ------------------------------------------------ |
| `OTEL_EXPORTER_OTLP_ENDPOINT`           | `http://localhost:4318` | URL                              | URL точки доступу OTLP                           |
| `OTEL_EXPORTER_OTLP_HEADERS`            | (порожньо)              | `key=value,key2=value2`          | Заголовки OTLP запиту                            |
| `OTEL_EXPORTER_OTLP_INSECURE`           | `false`                 | `true` or `false`                | Вимкнути TLS перевірку (тільки для тестування)   |
| `OTEL_EXPORTER_OTLP_CERTIFICATE`        | (порожньо)              | Шлях у файловій системі (PEM)    | Шлях до CA сертифіката для OTLP TLS              |
| `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` | (порожньо)              | Шлях у файловій системі (PEM)    | Клієнтський сертифікат для OTLP mTLS             |
| `OTEL_EXPORTER_OTLP_CLIENT_KEY`         | (порожньо)              | Шлях у файловій системі (PEM)    | Клієнтський ключ для OTLP mTLS                   |
| `OTEL_EXPORTER_OTLP_CLIENT_KEYPASS`     | (порожньо)              | String                           | Пароль для зашифрованого клієнтського ключу OTLP |
| `OTEL_SERVICE_NAME`                     | `unknown_service`       | String                           | Значення атрибуту ресурсу `service.name`         |
| `OTEL_RESOURCE_ATTRIBUTES`              | (порожньо)              | `key=value,key2=value2`          | Атрибути ресурсу                                 |
| `OTEL_TRACES_SAMPLER`                   | `parentbased_always_on` | Імʼя семплера                    | Семплер трейсів                                  |
| `OTEL_TRACES_SAMPLER_ARG`               | (порожньо)              | String/number                    | Аргумент семплера                                |
| `OTEL_LOG_LEVEL`                        | `info`                  | `error`, `warn`, `info`, `debug` | Рівень внутрішнього логу SDK                     |

## Специфічні для Distro опції (`OTEL_PHP_*`) {#distro-specific-options-otel_php_}

Усі опції `OTEL_PHP_*` можна встановити як змінні середовища або в `php.ini`.

Для `php.ini` використовуйте префікс `opentelemetry_distro.` та імена опцій у нижньому регістрі.

Приклад:

```sh
export OTEL_PHP_ENABLED=true
```

```ini
opentelemetry_distro.enabled=true
```

### Загальна конфігурація {#general-configuration}

| Опція                                                | Стандартно | Допустимі значення | Опис                                                                                                                       |
| ---------------------------------------------------- | ---------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PHP_ENABLED`                                   | `true`     | `true` or `false`  | Увімкнути автоматичний bootstrap                                                                                           |
| `OTEL_PHP_OPENTELEMETRY_EXTENSION_EMULATION_ENABLED` | `true`     | `true` or `false`  | Увімкнути реєстрацію емульованих `opentelemetry` розширень, дозволяючи автоінструментації працювати без `opentelemetry.so` |
| `OTEL_PHP_NATIVE_OTLP_SERIALIZER_ENABLED`            | `true`     | `true` or `false`  | Увімкнути нативний серіалізатор OTLP protobuf                                                                              |

### Асинхронне надсилання даних {#asynchronous-data-sending}

| Опція                                       | Стандартно | Допустимі значення                     | Опис                                       |
| ------------------------------------------- | ---------- | -------------------------------------- | ------------------------------------------ |
| `OTEL_PHP_ASYNC_TRANSPORT`                  | `true`     | `true` or `false`                      | Увімкнути фонову передачу телеметрії       |
| `OTEL_PHP_ASYNC_TRANSPORT_SHUTDOWN_TIMEOUT` | `30s`      | Тривалість (`ms`, `s`, `m`)            | Тайм-аут очищення при завершенні           |
| `OTEL_PHP_MAX_SEND_QUEUE_SIZE`              | `2MB`      | Integer з опціональним `B`, `MB`, `GB` | Макс. розмір асинхронного буфера на worker |

### Логування {#logging}

| Опція                       | Стандартно | Допустимі значення                                              | Опис                           |
| --------------------------- | ---------- | --------------------------------------------------------------- | ------------------------------ |
| `OTEL_PHP_LOG_FILE`         | (порожньо) | Шлях у файловій системі                                         | Шлях до файлу виводу логів     |
| `OTEL_PHP_LOG_LEVEL_FILE`   | `OFF`      | `OFF`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `TRACE` | Рівень логу файлового sink     |
| `OTEL_PHP_LOG_LEVEL_STDERR` | `OFF`      | `OFF`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `TRACE` | Рівень логу stderr sink        |
| `OTEL_PHP_LOG_LEVEL_SYSLOG` | `OFF`      | `OFF`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `TRACE` | Рівень логу syslog sink        |
| `OTEL_PHP_LOG_FEATURES`     | (порожньо) | `FEATURE=LEVEL,...`                                             | Рівні логу для окремих функцій |

### Відрізок транзакції {#transaction-span}

| Опція                                   | Стандартно | Допустимі значення        | Опис                                 |
| --------------------------------------- | ---------- | ------------------------- | ------------------------------------ |
| `OTEL_PHP_TRANSACTION_SPAN_ENABLED`     | `true`     | `true` or `false`         | Авто кореневий відрізок для web SAPI |
| `OTEL_PHP_TRANSACTION_SPAN_ENABLED_CLI` | `true`     | `true` or `false`         | Авто кореневий відрізок для CLI      |
| `OTEL_PHP_TRANSACTION_URL_GROUPS`       | (порожньо) | Comma-separated wildcards | Патерни групування URL               |

### Інструментування на основі атрибутів {#attribute-based-instrumentation}

| Опція                         | Стандартно | Допустимі значення | Опис                                                                                                                                                                                             |
| ----------------------------- | ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OTEL_PHP_ATTR_HOOKS_ENABLED` | `false`    | `true` or `false`  | Вмикає створення відрізків на основі атрибутів `#[WithSpan]` / `#[SpanAttribute]`. Див. [Інструментування на основі атрибутів](/docs/zero-code/php/distro/reference/attribute-instrumentation/). |

### Міст залежностей з областями видимості {#scoped-dependencies-bridge}

| Опція                                 | Стандартно | Допустимі значення | Опис                                                                                                                                                                                                                                               |
| ------------------------------------- | ---------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PHP_SCOPED_DEPS_BRIDGE_ENABLED` | `false`    | `true` or `false`  | Дозволяє власному використанню OpenTelemetry застосунком спільно використовувати runtime distro (провайдер трейсерів, контекст) так, щоб його відрізки приєднувалися до трейсів distro. Див. [нотатку нижче](#scoped-dependencies-bridge-interop). |

### Виведені відрізки {#inferred-spans}

| Опція                                        | Стандартно | Допустимі значення          | Опис                                    |
| -------------------------------------------- | ---------- | --------------------------- | --------------------------------------- |
| `OTEL_PHP_INFERRED_SPANS_ENABLED`            | `false`    | `true` or `false`           | Увімкнути виведені відрізки             |
| `OTEL_PHP_INFERRED_SPANS_REDUCTION_ENABLED`  | `true`     | `true` or `false`           | Зменшує послідовні дубльовані фрейми    |
| `OTEL_PHP_INFERRED_SPANS_STACKTRACE_ENABLED` | `true`     | `true` or `false`           | Додає stacktrace до виведених відрізків |
| `OTEL_PHP_INFERRED_SPANS_SAMPLING_INTERVAL`  | `50ms`     | Тривалість (`ms`, `s`, `m`) | Інтервал вибірки stacktrace             |
| `OTEL_PHP_INFERRED_SPANS_MIN_DURATION`       | `0`        | Тривалість (`ms`, `s`, `m`) | Мін. тривалість виведеного відрізка     |

### Централізована конфігурація (OpAMP) {#central-configuration-opamp}

| Опція                               | Стандартно | Допустимі значення                             | Опис                                                                                                                |
| ----------------------------------- | ---------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PHP_OPAMP_ENDPOINT`           | (порожньо) | HTTP/HTTPS URL, що закінчується на `/v1/opamp` | Точка доступу OpAMP                                                                                                 |
| `OTEL_PHP_OPAMP_HEADERS`            | (порожньо) | `key=value,key2=value2`                        | OpAMP заголовки запиту                                                                                              |
| `OTEL_PHP_OPAMP_HEARTBEAT_INTERVAL` | `30s`      | Тривалість (`ms`, `s`, `m`)                    | Інтервал між повідомленнями heartbeat, відправленими на OpAMP сервер.                                               |
| `OTEL_PHP_OPAMP_POLLING_INTERVAL`   | `30s`      | Тривалість (`ms`, `s`, `m`)                    | Інтервал, за яким агент опитує OpAMP сервер на наявність оновленої конфігурації. Незалежно від heartbeat інтервалу. |
| `OTEL_PHP_OPAMP_SEND_TIMEOUT`       | `10s`      | Тривалість (`ms`, `s`, `m`)                    | OpAMP тайм-аут надсилання                                                                                           |
| `OTEL_PHP_OPAMP_SEND_MAX_RETRIES`   | `3`        | Integer >= 0                                   | Кількість повторних спроб                                                                                           |
| `OTEL_PHP_OPAMP_SEND_RETRY_DELAY`   | `10s`      | Тривалість (`ms`, `s`, `m`)                    | Затримка повторної спроби                                                                                           |
| `OTEL_PHP_OPAMP_INSECURE`           | `false`    | `true` or `false`                              | Вимкнути TLS перевірку (тільки для тестування)                                                                      |
| `OTEL_PHP_OPAMP_CERTIFICATE`        | (порожньо) | Шлях у файловій системі (PEM)                  | Шлях до CA сертифіката для OpAMP TLS                                                                                |
| `OTEL_PHP_OPAMP_CLIENT_CERTIFICATE` | (порожньо) | Шлях у файловій системі (PEM)                  | Шлях до клієнтського сертифіката для OpAMP mTLS                                                                     |
| `OTEL_PHP_OPAMP_CLIENT_KEY`         | (порожньо) | Шлях у файловій системі (PEM)                  | Шлях до клієнтського ключа для OpAMP mTLS                                                                           |
| `OTEL_PHP_OPAMP_CLIENT_KEYPASS`     | (порожньо) | String                                         | Пароль для зашифрованого клієнтського ключа                                                                         |

### Можливість підтримки {#supportability}

| Опція                          | Стандартно | Допустимі значення | Опис                                                                                                                                                 |
| ------------------------------ | ---------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PHP_SCOPED_DEPS_ENABLED` | `true`     | `true` or `false`  | Керує тим, чи використовує distro scoped (namespace-prefixed) або оригінальні залежності. Див. [нотатку нижче](#scoped-dependencies-bridge-interop). |

## Нотатки {#notes}

- Фонова передача працює з режимом OTLP HTTP/protobuf.
- `OTEL_PHP_AUTOLOAD_ENABLED` примусово увімкнено distro runtime.
- Пакунок distro включає множинні залежності (OpenTelemetry SDK, різні автоінструментаційні пакунки та їх транзитивні залежності). Щоб уникнути конфліктів простору імен з власними залежностями застосунку, distro зазвичай використовує **scoped** (namespace-prefixed) залежності. Щоб повернутися до unscoped залежностей, встановіть `OTEL_PHP_SCOPED_DEPS_ENABLED=false`.

### Залежності з обмеженим обсягом взаємодії {#scoped-dependencies-bridge-interop}

Стандартно OpenTelemetry runtime distro є **scoped**: його класи живуть під унікальним префіксом простору імен, окремого від стандартних класів `OpenTelemetry\*`, які застосунок встановив би через Composer. Як результат, власне використання OpenTelemetry застосунком виконується для окремого runtime і його відрізки а ні експортуються, а ні підключені до трейсів distro.

Встановлення `OTEL_PHP_SCOPED_DEPS_BRIDGE_ENABLED=true` створює міст між двома: до того, як автозавантажувач Composer застосунку запуститься, distro реєструє псевдоніми класів, що зіставляють unscoped `OpenTelemetry\*` API зі своєю scoped реалізацією. Власне використання OpenTelemetry додатком тоді прозоро використовує tracer provider та контекст distro, тому його відрізки експортуються та коректно батьківські в межах трейсів distro.

Ця опція не має ефекту, коли scoping вимкнено (`OTEL_PHP_SCOPED_DEPS_ENABLED=false`): без scoping distro вже використовує unscoped `OpenTelemetry\*` класи, тому спільне використання відбувається без якогось мосту.

## Файлова конфігурація (декларативна) {#file-based-configuration-declarative}

Як альтернативу змінним середовища, ви можете налаштувати SDK, використовуючи YAML файл конфігурації, встановивши змінну середовища `OTEL_CONFIG_FILE`:

```sh
export OTEL_CONFIG_FILE=/path/to/otel-config.yaml
```

Коли `OTEL_CONFIG_FILE` встановлено:

- SDK читає всю конфігурацію з YAML файлу замість окремих змінних середовища `OTEL_*`.
- Підставлення змінних середовища (`${MY_VAR:-default}`) підтримується всередині YAML файлу.
- Централізована конфігурація (OpAMP) автоматично вимкнена — конфігурація на основі файлів та віддалена конфігурація є взаємовиключними.
- Специфічні для distro опції (`OTEL_PHP_*`) продовжують працювати, оскільки вони є нативними опціями розширення, незалежними від SDK.

### Distro ресурс-детектор {#distro-resource-detector}

Distro надає `distro` ресурс-детектор, що додає `telemetry.distro.name` та `telemetry.distro.version` атрибути ресурсу. Щоб активувати його у файловій конфігурації, додайте його до секції `resource.detection/development.detectors`:

```yaml
file_format: '1.0-rc.2'

resource:
  attributes:
    - name: service.name
      value: my-service
  detection/development:
    detectors:
      - distro: {}

propagator:
  composite:
    - tracecontext:
    - baggage:

tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/traces

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/metrics

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/logs
```

Для повної YAML схеми див. [OpenTelemetry Configuration Schema](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/schema-docs.md).

### Обмеження {#limitations}

- Центральна конфігурація (OpAMP) недоступна, якщо активна конфігурація на основі файлів.
- Ресурс-детектори, зареєстровані через `Registry::registerResourceDetector()` (наприклад, хмарні провайдери детекторів з `opentelemetry-php-contrib`) не активуються автоматично. Вони мають надавати `ComponentProvider` і бути явно перелічені у секції YAML `resource.detection/development.detectors`.
