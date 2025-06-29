---
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

## Prometheus {#prometheus}

メトリクスデータを[Prometheus](https://prometheus.io/)に送信するには、[PrometheusのOTLPレシーバーを有効にして](https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver)[OTLPエクスポーター](#otlp)を使用するか、Prometheusエクスポーターを使用できます。
Prometheusエクスポーターは、メトリクスを収集しリクエストに応じてPrometheusテキスト形式にシリアライズするHTTPサーバーを起動する`MetricReader`です。

### バックエンドのセットアップ {#prometheus-setup}

{{% alert title=注意 %}}

すでにPrometheusまたはPrometheus互換のバックエンドをセットアップしている場合は、このセクションをスキップして、アプリケーション用の[Prometheus](#prometheus-dependencies)または[OTLP](#otlp-dependencies)エクスポーターの依存関係をセットアップしてください。

{{% /alert %}}

[Prometheus](https://prometheus.io)をDockerコンテナで実行し、ポート`9090`でアクセスできるようにするには、以下の手順に従ってください。

以下の内容で`prometheus.yml`というファイルを作成します。

```yaml
scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
```

UIがポート`9090`でアクセス可能なDockerコンテナでPrometheusを実行します。

```shell
docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --enable-feature=otlp-write-receive
```

{{% alert title=注意 %}}

PrometheusのOTLPレシーバーを使用する場合は、アプリケーションでメトリクス用のOTLPエンドポイントを`http://localhost:9090/api/v1/otlp`に設定してください。

すべてのDocker環境が`host.docker.internal`をサポートしているわけではありません。場合によっては、`host.docker.internal`を`localhost`またはマシンのIPアドレスに置き換える必要があるかもしれません。

{{% /alert %}}
