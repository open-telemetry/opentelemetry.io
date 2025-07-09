---
default_lang_commit: 8a5b880c16d49257a147c2c3ec4a6ef6fcee8e20
---

将遥测数据发送到 [OpenTelemetry Collector](/docs/collector/)，以确保其被正确导出。
在生产环境中使用 Collector 是最佳实践。若要可视化你的遥测数据，可将其导出到后端系统，例如
[Jaeger](https://jaegertracing.io/)、[Zipkin](https://zipkin.io/)、
[Prometheus](https://prometheus.io/)，或某个[特定厂商的](/ecosystem/vendors/)后端。

{{ if $name }}

## 可用的导出器 {#available-exporters}

镜像仓库中包含一份 [{{ $name }} 可用导出器的列表][reg]。

{{ end }}

{{ if not $name }}

镜像仓库中包含[按语言分类的导出器列表][reg]。

{{ end }}

在所有导出器中，[OpenTelemetry 协议 (OTLP)][OTLP] 导出器是以 OpenTelemetry 数据模型为基础设计的，
能够无信息丢失地输出 OTel 数据。此外，许多处理遥测数据的工具都支持 OTLP
（例如 [Prometheus]、[Jaeger] 和大多数[厂商][vendors]），在你需要时为你提供高度的灵活性。
若要了解更多关于 OTLP 的信息，请参阅 [OTLP 规范][OTLP]。

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]: https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver
[reg]: </ecosystem/registry/?component=exporter&language={{ $lang }}>
[vendors]: /ecosystem/vendors/

{{ if $name }}

本页面介绍了主要的 OpenTelemetry {{ $name }} 导出器以及如何进行配置。

{{ end }}

{{ if $zeroConfigPageExists }}

{{% alert title=注意 %}}

如果你使用了[零代码自动插桩](</docs/zero-code/{{ $langIdAsPath }}>)，
你可以参考[配置指南](</docs/zero-code/{{ $langIdAsPath }}/configuration/>)来了解如何设置导出器。

{{% /alert %}}

{{ end }}

{{ if $supportsOTLP }}

## OTLP

### Collector 设置 {#collector-setup}

{{% alert title=注意 %}}

如果你已经配置好 OTLP Collector 或后端，可以跳过此部分，
直接[设置应用的 OTLP 导出器依赖](#otlp-dependencies)。

{{% /alert %}}

为测试和验证你的 OTLP 导出器，你可以运行一个 Docker 容器形式的 Collector，将遥测数据直接输出到控制台。

在一个空目录下创建名为 `collector-config.yaml` 的文件，并添加以下内容：

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

然后运行以下命令，在 Docker 容器中启动 Collector：

```shell
docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
```

现在，这个 Collector 已能通过 OTLP 接收遥测数据。
之后你可能需要配置 Collector，将遥测数据发送到你的可观测性后端。

{{ end }}
