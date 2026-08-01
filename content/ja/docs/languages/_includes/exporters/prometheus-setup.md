---
default_lang_commit: 8013aa5f0aae284fa343311981625be6dbb25e5b
---

## Prometheus {#prometheus}

メトリクスデータを [Prometheus](https://prometheus.io/) に送信するには、以下のいずれかの方法を使用できます。

- [Prometheus の OTLP レシーバーを有効にして](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver) [OTLP エクスポーター](#otlp)を使用する（ベストプラクティス）
- Prometheus エクスポーターを使用する。Prometheus エクスポーターは、メトリクスを収集しリクエストに応じて Prometheus テキスト形式にシリアライズする HTTP サーバーを起動する `MetricReader` です。

### バックエンドのセットアップ {#prometheus-setup}

Prometheus サーバーバックエンドを実行してメトリクスのスクレイピングを開始するには、[Prometheus 入門ガイド](https://prometheus.io/docs/prometheus/latest/getting_started/)を参照してください。

OTLP レシーバーを有効にするには、[OTLP レシーバーの有効化に関する Prometheus ガイド](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)を参照してください。
