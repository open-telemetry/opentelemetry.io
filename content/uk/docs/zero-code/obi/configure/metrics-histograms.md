---
title: Налаштування гістограм метрик OBI для Prometheus та OpenTelemetry
linkTitle: Гістограми метрик
description: Налаштуйте гістограми метрик для Prometheus та OpenTelemetry, а також виберіть, чи використовувати нативні гістограми та експоненціальні гістограми.
weight: 60
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
---

Ви можете налаштувати гістограми метрик OBI для Prometheus та OpenTelemetry. Ви також можете вибрати, чи використовувати нативні гістограми та експоненціальні гістограми.

## Перевизначення сегментів гістограм {#override-histogram-buckets}

Ви можете перевизначити межі сегментів гістограм для експортерів метрик OpenTelemetry та Prometheus, встановивши параметр конфігурації YAML `buckets`:

Секція YAML: `otel_metrics_export.buckets`

Наприклад:

```yaml
otel_metrics_export:
  buckets:
    duration_histogram: [0, 1, 2]
```

| YAML                 | Тип         |
| -------------------- | ----------- |
| `duration_histogram` | `[]float64` |

Встановіть межі сегментів для метрик, повʼязаних із тривалістю запитів. Зокрема:

- `http.server.request.duration` (OTel) / `http_server_request_duration_seconds`
  (Prometheus)
- `http.client.request.duration` (OTel) / `http_client_request_duration_seconds`
  (Prometheus)
- `rpc.server.duration` (OTel) / `rpc_server_duration_seconds` (Prometheus)
- `rpc.client.duration` (OTel) / `rpc_client_duration_seconds` (Prometheus)

Якщо ви залишите значення не встановленим, OBI використовує стандартні межі сегментів з [семантичних домовленостей OpenTelemetry](/docs/specs/semconv/http/http-metrics/):

```text
0, 0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10
```

Секція YAML: `prometheus_export.buckets`

```yaml
prometheus_export:
  buckets:
    request_size_histogram: [0, 10, 20, 22]
    response_size_histogram: [0, 10, 20, 22]
```

| YAML                      | Тип         |
| ------------------------- | ----------- |
| `request_size_histogram`  | `[]float64` |
| `response_size_histogram` | `[]float64` |

Встановіть межі сегментів для метрик, повʼязаних із розмірами запитів та відповідей:

- `http.server.request.body.size` (OTel) / `http_server_request_body_size_bytes`
  (Prometheus)
- `http.client.request.body.size` (OTel) / `http_client_request_body_size_bytes`
  (Prometheus)
- `http.server.response.body.size` (OTel) /
  `http_server_response_body_size_bytes` (Prometheus)
- `http.client.response.body.size` (OTel) /
  `http_client_response_body_size_bytes` (Prometheus)

Якщо ви залишите значення не встановленим, OBI використовує стандартні межі сегментів:

```text
0, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192
```

Ці стандартні значення нестабільні і можуть змінитися, якщо семантичні домовленості Prometheus або OpenTelemetry рекомендують інші межі сегментів.

## Використання нативних гістограм та експоненціальних гістограм {#use-native-histograms-and-exponential-histograms}

Для Prometheus ви можете увімкнути [нативні гістограми](https://prometheus.io/docs/concepts/metric_types/#histogram), увімкнувши функцію [`native-histograms`](https://prometheus.io/docs/prometheus/latest/feature_flags/#native-histograms) у вашому колекторі Prometheus.

Для OpenTelemetry ви можете використовувати [експоненціальні гістограми](/docs/specs/otel/metrics/data-model/#exponentialhistogram) для попередньо визначених гістограм замість того, щоб визначати сегменти вручну. Встановіть стандартну змінну середовища [OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION](/docs/specs/otel/metrics/sdk_exporters/otlp/#additional-environment-variable-configuration). Дивіться розділ `histogram_aggregation` у розділі [OTel metrics exporter](../export-data/) для отримання додаткової інформації.
