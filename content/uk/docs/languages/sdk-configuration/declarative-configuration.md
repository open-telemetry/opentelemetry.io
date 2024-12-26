---
title: Декларативна конфігурація
linkTitle: Декларативна конфігурація
weight: 30
default_lang_commit: 1b2e54f4c38d9f6ad394ac352529580a11cc29a8
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/otel-config"?>

Декларативна конфігурація використовує файл YAML замість змінних середовища.

Цей підхід корисний, коли:

- У вас є багато параметрів конфігурації для налаштування.
- Ви хочете використовувати параметри конфігурації, які недоступні як змінні середовища.

> [!WARNING]
>
> Схема декларативної конфігурації є стабільною. Частини, які все ще експериментальні, мають суфікс `/development`. Підтримка декларативної конфігурації в різних реалізаціях все ще експериментальна.

## Підтримувані мови {#supported-languages}

Наступні SDK OpenTelemetry підтримують декларативну конфігурацію:

- [Java](/docs/zero-code/java/agent/declarative-configuration/)

Детальнішу інформацію див. у [Матриці відповідності](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration)

## Початок роботи {#getting-started}

1. Збережіть наступний файл конфігурації як `otel-config.yaml`.
2. Встановіть зміну оточення `OTEL_CONFIG_FILE=/path/to/otel-config.yaml`

Рекомендований файл конфігурації:

<!-- prettier-ignore-start -->
<?code-excerpt "examples/otel-getting-started.yaml"?>
```yaml
# otel-getting-started.yaml є хорошою відправною точкою для налаштування SDK, включаючи експорт на
# localhost через OTLP.
#
# ПРИМІТКА: За винятком синтаксису підстановки змінних середовища (тобто ${MY_ENV}), SDK ігнорують
# змінні середовища при інтерпретації файлів конфігурації. Це включає ігнорування всіх змінних середовища,
# визначених у https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/.
#
# Для документації схеми, включаючи обовʼязкові властивості, семантику, стандартну поведінку тощо,
# див. https://github.com/open-telemetry/opentelemetry-configuration/blob/main/schema-docs.md

file_format: "1.0"

resource:
  # Читання атрибутів ресурсу зі змінної середовища OTEL_RESOURCE_ATTRIBUTES.
  # Це добре узгоджується з OpenTelemetry Operator та іншими методами розгортання.
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development: # /development властивості можуть не підтримуватися у всіх SDK
    detectors:
      - service: # додасть "service.instance.id" та "service.name" зі змінної середовища OTEL_SERVICE_NAME
      - host:
      - process:
      - container:

propagator:
  composite:
    - tracecontext:
    - baggage:

# Читання точки доступу бекенду зі змінної середовища OTEL_EXPORTER_OTLP_ENDPOINT.
# Це добре узгоджується з OpenTelemetry Operator та іншими методами розгортання.

tracer_provider:
  sampler:
    parent_based:
      root:
        always_on:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/traces

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/metrics

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/logs
```
<!-- prettier-ignore-end -->

## Змінні середовища {#environment-variables}

- Декларативна конфігурація підтримує синтаксис для читання **змінних середовища**.
- Усі змінні середовища **ігноруються, якщо ви явно не додасте їх до файлу конфігурації**.

Наприклад, якщо ви встановите:

```shell
OTEL_RESOURCE_ATTRIBUTES=service.version=1.1,deployment.environment.name=staging
```

Наступна конфігурація створіть ресурс з `service.version=1.1` та `deployment.environment.name=staging`:

```yaml
resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
```

> [!WARNING]
>
> Всі змінні середовища ігноруються, якщо ви явно не додасте їх до файлу конфігурації.

## Конфігурація міграції {#migration-configuration}

Якщо ваша поточна конфігурація базується на змінних середовища, ви можете використовувати [конфігурацію міграції](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/otel-sdk-migration-config.yaml) як відправну точку для переходу на декларативну конфігурацію.

## Доступні параметри конфігурації {#available-config-options}

Повний перелік параметрів конфігурації можна знайти в [прикладі kitchen sink][otel-sdk-config.yaml].

[otel-sdk-config.yaml]: https://github.com/open-telemetry/opentelemetry-configuration/blob/v1.0.0-rc.1/examples/kitchen-sink.yaml

## Точка доступу для кожного окремого сигналу {#endpoint-per-signal}

Якщо у вас є різні точки доступу для трасування, метрик та логів, використовуйте наступну конфігурацію при використанні `otlp_http`:

| OTLP HTTP Exporter | Значення Endpoint                                                          |
| ------------------ | -------------------------------------------------------------------------- |
| Трейси             | `${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}`   |
| Метрики            | `${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}` |
| Логи               | `${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}`       |

## Експортер gRPC {#grpc-exporter}

Замість `otlp_http` ви також можете використовувати `otlp_grpc` для експорту через gRPC:

```yaml
otlp_grpc:
  endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4317}
```

## Атрибути ресурсів {#resource-attributes}

Рекомендований підхід до встановлення атрибутів ресурсів — через змінні середовища, оскільки він добре працює з інструментами, що встановлюють змінні середовища, такими як [OpenTelemetry Operator для Kubernetes](/docs/platforms/kubernetes/operator/).

Однак ви також можете встановити атрибути ресурсів безпосередньо у файлі конфігурації:

```yaml
resource:
  attributes:
    - name: service.name
      value: shopping_cart
    - name: deployment.environment.name
      value: staging
```
