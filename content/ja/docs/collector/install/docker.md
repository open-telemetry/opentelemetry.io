---
title: Dockerでコレクターをインストールする
linkTitle: Docker
weight: 100
default_lang_commit: 065ae35400c045c61d49556d79abe3a04033bedf
---

## Docker {#docker}

以下のコマンドはDockerイメージをプルし、コレクターをコンテナ内で実行します。
`{{% param vers %}}` を実行したいコレクターのバージョンに置き換えてください。

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

作業ディレクトリからカスタム設定ファイルを読み込むには、そのファイルをボリュームとしてマウントします。

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

以下の例のように、既存の `docker-compose.yaml` ファイルにOpenTelemetryコレクターを追加できます。

```yaml
otel-collector:
  image: otel/opentelemetry-collector
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
  ports:
    - 1888:1888 # pprof extension
    - 8888:8888 # Prometheus metrics exposed by the Collector
    - 8889:8889 # Prometheus exporter metrics
    - 13133:13133 # health_check extension
    - 4317:4317 # OTLP gRPC receiver
    - 4318:4318 # OTLP http receiver
    - 55679:55679 # zpages extension
```
