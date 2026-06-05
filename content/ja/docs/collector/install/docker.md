---
title: Dockerでコレクターをインストールする
linkTitle: Docker
weight: 100
default_lang_commit: c88a006471f039334aed7990736e089a62b33f94
---

以下のコマンドを使用して、Docker イメージをプルし、コンテナでコレクターを実行します。
`{{% param vers %}}`は、実行したいコレクターのバージョンに置き換えてください。

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker pull otel/opentelemetry-collector:{{% param vers %}}
docker run otel/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{% param vers %}}
docker run ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

作業ディレクトリからカスタム構成ファイルを読み込むには、ファイルをボリュームとしてマウントします。

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

## Docker Compose {#docker-compose}

既存の `docker-compose.yaml` ファイルに OpenTelemetry Collector を追加することもできます。

```yaml
otel-collector:
  image: otel/opentelemetry-collector
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
  ports:
    - 1888:1888 # pprof拡張
    - 8888:8888 # コレクターのPrometheusメトリクス
    - 8889:8889 # Prometheusエクスポーターのメトリクス
    - 13133:13133 # health_check拡張
    - 4317:4317 # OTLP gRPCレシーバー
    - 4318:4318 # OTLP httpレシーバー
    - 55679:55679 # zpages拡張
```

`otel-collector-config.yaml` ファイルは Collector の起動に必要です。
詳しくは [Collector の設定](/docs/collector/configuration/)を参照してください。

以下は、受信したすべてのテレメトリーをログに出力する最小限の Collector 設定です。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```
