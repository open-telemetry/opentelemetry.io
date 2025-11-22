---
title: 代理
description: 为什么以及如何将信号发送到 Collector 并从 Collector 发送到后端
weight: 2
default_lang_commit: 82dc25ce2cc1c6b3b2bde68b5d25bd58e5ac49b3
drifted_from_default: true
cSpell:ignore: prometheusremotewrite
---

代理 Collect 部署模式既包含采用 [OpenTelemetry 协议（OTLP）][otlp]并通过
OpenTelemetry SDK [插桩][instrumentation]的各类应用，
也包含使用 OTLP 导出器将遥测信号发送到与应用一起运行的 [Collector][collector]
实例或与应用（例如边车或 DaemonSet）所在主机上的的其他 Collector。

每个客户端 SDK 或下游 Collector 都会配置一个 Collector 位置：

![去中心化 Collector 部署概念](../../img/otel-agent-sdk.svg)

1. 在应用中，SDK 被配置为将 OTLP 数据发送到 Collector。
2. Collector 被配置为将遥测数据发送到一个或多个后端。

## 示例 {#example}

代理 Collector 部署模式的一个具体示例可能如下所示：你使用 OpenTelemetry Java SDK
手动为一个 [Java 应用导出指标][instrument-java-metrics]进行插桩。在应用的上下文中，你将
`OTEL_METRICS_EXPORTER` 设置为 `otlp`（这是默认值），并为 [OTLP 导出器][otlp-exporter]配置
Collector 的地址，例如（在 Bash 或 `zsh` shell 中）：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

在 `collector.example.com:4318` 提供服务的 Collector 将被配置为：

{{< tabpane text=true >}} {{% tab Traces %}}

```yaml
receivers:
  otlp: # 应用发送链路数据的 OTLP 接收器
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  otlp/jaeger: # Jaeger 直接支持 OTLP
    endpoint: https://jaeger.example.com:4317

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Metrics %}}

```yaml
receivers:
  otlp: # 应用发送指标的 OTLP 接收器
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  prometheusremotewrite: # PRW 导出器，用于将指标导入到后端
    endpoint: https://prw.example.com/v1/api/remote_write

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheusremotewrite]
```

{{% /tab %}} {{% tab Logs %}}

```yaml
receivers:
  otlp: # 应用发送日志的 OTLP 接收器
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  file: # 文件导出器，用于将日志写入本地文件
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      processors: [batch]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

如果你想自己试一试，你可以查看端到端的 [Java][java-otlp-example] 或 [Python][py-otlp-example] 示例。

## 权衡 {#tradeoffs}

优点：

- 简单易上手
- 应用与 Collector 之间是一对一映射，清晰明了

缺点：

- 可扩展性有限（无论是人工还是负载方面）
- 灵活性不足

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]: https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]: https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
