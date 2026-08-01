---
title: OBI の Prometheus と OpenTelemetry メトリクスヒストグラムを設定する
linkTitle: メトリクスヒストグラム
description: Prometheus と OpenTelemetry のメトリクスヒストグラムを設定し、ネイティブヒストグラムおよび指数ヒストグラムを使用するかを設定します。
weight: 60
default_lang_commit: fc509b751d6882b99824ea78a1dd8e638dd9055a
drifted_from_default: true
---

OBI の Prometheus および OpenTelemetry メトリクスヒストグラムを設定できます。
ネイティブヒストグラムや指数ヒストグラムを使用することも選択できます。

## ヒストグラムバケットの上書き {#override-histogram-buckets}

OpenTelemetry および Prometheus のメトリクスエクスポーターのヒストグラムバケット境界は、`buckets` YAML 設定オプションを設定することで上書きできます。

YAML セクション: `otel_metrics_export.buckets`

たとえば次のとおりです。

```yaml
otel_metrics_export:
  buckets:
    duration_histogram: [0, 1, 2]
```

| YAML                 | 型          |
| -------------------- | ----------- |
| `duration_histogram` | `[]float64` |

リクエスト時間に関するメトリクスのバケット境界を設定します。
具体的には次のとおりです。

- `http.server.request.duration` (OTel) / `http_server_request_duration_seconds` (Prometheus)
- `http.client.request.duration` (OTel) / `http_client_request_duration_seconds` (Prometheus)
- `rpc.server.duration` (OTel) / `rpc_server_duration_seconds` (Prometheus)
- `rpc.client.duration` (OTel) / `rpc_client_duration_seconds` (Prometheus)

値を未設定のままにした場合、OBI は [OpenTelemetry セマンティック規約](/docs/specs/semconv/http/http-metrics/) のデフォルトのバケット境界を使用します。

```text
0, 0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10
```

YAML セクション: `prometheus_export.buckets`

```yaml
prometheus_export:
  buckets:
    request_size_histogram: [0, 10, 20, 22]
    response_size_histogram: [0, 10, 20, 22]
```

| YAML                      | 型          |
| ------------------------- | ----------- |
| `request_size_histogram`  | `[]float64` |
| `response_size_histogram` | `[]float64` |

リクエストおよびレスポンスのサイズに関するメトリクスのバケット境界を設定します。

- `http.server.request.body.size` (OTel) / `http_server_request_body_size_bytes` (Prometheus)
- `http.client.request.body.size` (OTel) / `http_client_request_body_size_bytes` (Prometheus)
- `http.server.response.body.size` (OTel) / `http_server_response_body_size_bytes` (Prometheus)
- `http.client.response.body.size` (OTel) / `http_client_response_body_size_bytes` (Prometheus)

値を未設定のままにした場合、OBI は次のデフォルトのバケット境界を使用します。

```text
0, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192
```

これらのデフォルト値は UNSTABLE であり、Prometheus または OpenTelemetry セマンティック規約が異なるバケット境界を推奨するようになった場合、変更される可能性があります。

## ネイティブヒストグラムと指数ヒストグラムを使用する {#use-native-histograms-and-exponential-histograms}

Prometheus では、[Prometheus コレクターで `native-histograms` 機能を有効化](https://prometheus.io/docs/prometheus/latest/feature_flags/#native-histograms) することで [ネイティブヒストグラム](https://prometheus.io/docs/concepts/metric_types/#histogram) を有効にできます。

OpenTelemetry では、バケットを手動で定義するかわりに、事前定義されたヒストグラムに対して [指数ヒストグラム](/docs/specs/otel/metrics/data-model/#exponentialhistogram) を使用できます。
標準の [OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION](/docs/specs/otel/metrics/sdk_exporters/otlp/#additional-environment-variable-configuration) 環境変数を設定してください。
詳細は [OTel メトリクスエクスポーター](../export-data/) セクションの `histogram_aggregation` セクションを参照してください。
