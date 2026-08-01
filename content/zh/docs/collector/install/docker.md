---
title: 使用 Docker 安装 Collector
linkTitle: Docker
weight: 100
default_lang_commit: 4f007739e0f0fc0b178b8dae457ef06c1c9a5757
---

以下命令将拉取一个 Docker 镜像并在容器中运行 Collector。
请将 `{{% param vers %}}` 替换为你想运行的 Collector 版本。

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

如果需要从当前工作目录加载自定义配置文件，可以将该文件挂载为一个卷：

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

## Docker Compose

你也可以将 OpenTelemetry Collector 添加到现有的 `docker-compose.yaml` 文件中：

```yaml
otel-collector:
  image: otel/opentelemetry-collector
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
  ports:
    - 1888:1888 # pprof 扩展
    - 8888:8888 # Collector 暴露的 Prometheus 指标
    - 8889:8889 # Prometheus exporter 指标
    - 13133:13133 # health_check 扩展
    - 4317:4317 # OTLP gRPC 接收器
    - 4318:4318 # OTLP HTTP 接收器
    - 55679:55679 # zpages 扩展
```

`otel-collector-config.yaml` 文件是 Collector 启动所必需的。
更多信息请参见 [Collector 配置](/docs/collector/configuration/)。

下面是一个最小化的 Collector 配置示例，用于记录所有接收到的遥测数据：

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
