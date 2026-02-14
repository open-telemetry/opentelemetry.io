---
title: Декларативна конфігурація
linkTitle: Декларативна конфігурація
weight: 30
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

Декларативна конфігурація використовує файл YAML замість змінних середовища.

Цей підхід корисний, коли:

- У вас є багато параметрів конфігурації для налаштування.
- Ви хочете використовувати параметри конфігурації, які недоступні як змінні середовища.

> [!WARNING]
>
> title="Попередження" %}} Декларативна конфігурація є експериментальною.

## Підтримувані мови {#supported-languages}

Наступні SDK OpenTelemetry підтримують декларативну конфігурацію:

- [Java](/docs/zero-code/java/agent/declarative-configuration/)

Детальнішу інформацію див. у [Матриці відповідності](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration)

## Початок роботи {#getting-started}

1. Збережіть наступний файл конфігурації як `otel-config.yaml`.
2. Встановіть зміну оточення `OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/otel-config.yaml`

Рекомендований файл конфігурації:

```yaml
file_format: '1.0-rc.1'

resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development:
    detectors:
      - service: # буде додавати "service.instance.id" та "service.name" з OTEL_SERVICE_NAME

propagator:
  composite:
    - tracecontext:
    - baggage:

tracer_provider:
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
