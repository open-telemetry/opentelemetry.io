---
title: Налаштування внутрішнього репортера метрик OBI
linkTitle: Репортер внутрішніх метрик
description: Налаштуйте те, як опціональний репортер внутрішніх метрик звітує про метрики  щодо внутрішньої поведінки інструмента автоматичного інструментування у форматі Prometheus.
weight: 80
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
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

| YAML              | Змінна середовища                            | Тип    | Стандартно          | Підсумок                                                           |
| ----------------- | -------------------------------------------- | ------ | ------------------- | ------------------------------------------------------------------ |
| `exporter`        | `OTEL_EBPF_INTERNAL_METRICS_EXPORTER`        | string | `disabled`          | [Обирає репортера внутрішніх метрик.](#internal-metrics-exporter)  |
| `prometheus.port` | `OTEL_EBPF_INTERNAL_METRICS_PROMETHEUS_PORT` | int    | (unset)             | [HTTP порт для точки доступу Prometheus scrape.](#prometheus-port) |
| `prometheus.path` | `OTEL_EBPF_INTERNAL_METRICS_PROMETHEUS_PATH` | string | `/internal/metrics` | [Шлях HTTP-запиту для метрик Prometheus.](#prometheus-path)        |

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
