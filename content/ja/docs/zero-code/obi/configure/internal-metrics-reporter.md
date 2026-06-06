---
title: OBI 内部メトリクスレポーターを設定する
linkTitle: 内部メトリクスレポーター
description: オプションの内部メトリクスレポーターコンポーネントが、自動計装ツールの内部動作に関するメトリクスを Prometheus 形式でレポートする方法を設定する
weight: 80
default_lang_commit: f7dab5cfc4d44a8c788b7e02d07ec1e1d84e3845
---

YAML セクション: `internal_metrics`

このコンポーネントは、自動計装ツールの動作に関する内部メトリクスをレポートします。
これらのメトリクスは [Prometheus](https://prometheus.io/) または [OpenTelemetry](/) を使用してエクスポートできます。

Prometheus でメトリクスをエクスポートするには、`internal_metrics` セクションで `exporter` を `prometheus` に設定します。
次に、`prometheus` サブセクションで `port` を設定します。

OpenTelemetry でメトリクスをエクスポートするには、`internal_metrics` セクションで `exporter` を `otel` に設定します。
次に、`otel_metrics_export` でエンドポイントを設定します。

例:

```yaml
internal_metrics:
  exporter: prometheus
  prometheus:
    port: 6060
    path: /internal/metrics
```

## 設定の概要 {#configuration-summary}

| YAML              | 環境変数                                     | 型     | デフォルト          | 概要                                                                       |
| ----------------- | -------------------------------------------- | ------ | ------------------- | -------------------------------------------------------------------------- |
| `exporter`        | `OTEL_EBPF_INTERNAL_METRICS_EXPORTER`        | string | `disabled`          | [内部メトリクスのエクスポーターを選択します。](#internal-metrics-exporter) |
| `prometheus.port` | `OTEL_EBPF_INTERNAL_METRICS_PROMETHEUS_PORT` | int    | (未設定)            | [Prometheus スクレイプエンドポイントの HTTP ポート。](#prometheus-port)    |
| `prometheus.path` | `OTEL_EBPF_INTERNAL_METRICS_PROMETHEUS_PATH` | string | `/internal/metrics` | [Prometheus メトリクスの HTTP クエリパス。](#prometheus-path)              |

---

## 内部メトリクスのエクスポーター {#internal-metrics-exporter}

内部メトリクスのエクスポーターを設定します。
`disabled`、`prometheus`、`otel` のいずれかを使用できます。

---

## Prometheus ポート {#prometheus-port}

Prometheus スクレイプエンドポイントの HTTP ポートを設定します。
未設定または 0 に設定した場合、OBI は Prometheus エンドポイントを開かず、メトリクスをレポートしません。

[`prometheus_export.port`](../export-data/#prometheus-exporter-component) と同じ値を使用すること(両方のメトリクスファミリーは同じ HTTP サーバーを共有しますが、異なるパスを使用します)も、別の値を使用すること(OBI は異なるメトリクスファミリーのために 2 つの HTTP サーバーを開きます)もできます。

---

## Prometheus パス {#prometheus-path}

Prometheus メトリクスを取得するための HTTP クエリパスを設定します。

[`prometheus_export.port`](../export-data/#prometheus-exporter-component) と `internal_metrics.prometheus.port` が同じ値を使用する場合、`internal_metrics.prometheus.path` を `prometheus_export.path` とは異なる値に設定してメトリクスファミリーを分離するか、同じ値を使用して両方のメトリクスファミリーを同じスクレイプエンドポイントにまとめることができます。
