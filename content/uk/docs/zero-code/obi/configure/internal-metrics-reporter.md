---
title: Налаштування внутрішнього репортера метрик OBI
linkTitle: Репортер внутрішніх метрик
description: Налаштуйте те, як опціональний репортер внутрішніх метрик звітує про метрики  щодо внутрішньої поведінки інструмента автоматичного інструментування у форматі Prometheus.
weight: 80
default_lang_commit: f4cc67cd44fa9d9f23de8f5a121f15d7eea9b043
cSpell:ignore: висококардинальний
---

Секція YAML: `internal_metrics`

Цей компонент звітує про внутрішні метрики поведінки інструмента автоматичного інструментування. Ви можете експортувати ці метрики за допомогою [Prometheus](https://prometheus.io/) або [OpenTelemetry](/).

Щоб експортувати метрики за допомогою Prometheus, встановіть `exporter` на `prometheus` у секції `internal_metrics`. Потім встановіть `port` у підсекції `prometheus`.

Щоб експортувати метрики за допомогою OpenTelemetry, встановіть `exporter` на `otel` у секції `internal_metrics`. Потім встановіть кінцеву точку в `otel_metrics_export`.

Приклад:

```yaml
internal_metrics:
  exporter: prometheus
  prometheus:
    port: 6060
    path: /internal/metrics
```

## Підсумок конфігурації {#configuration-summary}

| YAML                        | Змінна середовища                                      | Тип     | Стандартно          | Підсумок                                                                 |
| --------------------------- | ------------------------------------------------------ | ------- | ------------------- | ------------------------------------------------------------------------ |
| `exporter`                  | `OTEL_EBPF_INTERNAL_METRICS_EXPORTER`                  | string  | `disabled`          | [Обирає репортера внутрішніх метрик.](#internal-metrics-exporter)        |
| `prometheus.port`           | `OTEL_EBPF_INTERNAL_METRICS_PROMETHEUS_PORT`           | int     | (unset)             | [HTTP порт для точки доступу Prometheus scrape.](#prometheus-port)       |
| `prometheus.path`           | `OTEL_EBPF_INTERNAL_METRICS_PROMETHEUS_PATH`           | string  | `/internal/metrics` | [Шлях HTTP-запиту для метрик Prometheus.](#prometheus-path)              |
| `avoided_services.disabled` | `OTEL_EBPF_INTERNAL_METRICS_AVOIDED_SERVICES_DISABLED` | boolean | `false`             | Вимикає метрику сервісів, яких слід уникати.                             |
| `avoided_services.limit`    | `OTEL_EBPF_INTERNAL_METRICS_AVOIDED_SERVICES_LIMIT`    | int     | `2000`              | Обмежує серії сервісів, яких слід уникати, включаючи серію переповнення. |

---

## Експортер внутрішніх метрик {#internal-metrics-exporter}

Встановіть експортер внутрішніх метрик. Ви можете використовувати `disabled`, `prometheus` або `otel`.

---

## Порт Prometheus {#prometheus-port}

Встановіть HTTP-порт для точки доступу Prometheus scrape. Якщо ви залишите його не встановленим або встановите в 0, OBI не відкриває точку доступу Prometheus і не звітує про метрики.

Ви можете використовувати те саме значення, що й [`prometheus_export.port`](../export-data/#prometheus-exporter-component) (обидва сімейства метрик ділять один і той же HTTP-сервер, але використовують різні шляхи), або використовувати інше значення (OBI відкриває два HTTP-сервери для різних сімейств метрик).

---

## Шлях Prometheus {#prometheus-path}

Встановіть HTTP-шлях запиту для отримання метрик Prometheus.

Якщо [`prometheus_export.port`](../export-data/#prometheus-exporter-component) і `internal_metrics.prometheus.port` використовують те саме значення, ви можете встановити `internal_metrics.prometheus.path` на інше значення, ніж `prometheus_export.path`, щоб зберегти сімейства метрик окремими, або використовувати те саме значення, щоб перерахувати обидва сімейства метрик в одній точці доступу.

## Кардинальність сервісів, яких слід уникати {#avoided-services-cardinality}

Метрика OTLP `obi.avoided.services` (`obi_avoided_services` у Prometheus) повідомляє про сервіси, для яких OBI уникав дублювання телеметрії після виявлення, що сервіс експортує дані OpenTelemetry безпосередньо. Серії включають імʼя сервісу, простір імен сервісу та сигнал, якого слід уникати (`metrics` або `traces`), але не висококардинальний ідентифікатор екземпляра сервісу.

`avoided_services.limit` обмежує кількість серій. Додаткові сервіси обʼєднуються в серію з `otel.metric.overflow=true` (Prometheus: `otel_metric_overflow="true"`). Встановіть ліміт на `0`, щоб використовувати стандартний ліміт кардинальності метрик OpenTelemetry SDK, або встановіть `disabled: true`, щоб пропустити цю метрику.
