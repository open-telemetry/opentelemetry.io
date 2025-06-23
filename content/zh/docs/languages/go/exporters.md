---
title: 导出器（Exporters）
aliases: [exporting_data]
weight: 50
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp stdoutlog stdouttrace
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

{{% docs/languages/exporters/intro %}}

## 控制台{#console}

控制台导出器适用于开发和调试任务，是最简单的设置方式。

### 控制台 traces{#console-traces}

The
[`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace)
包含了控制台 trace （链路追踪）导出器的实现。

### 控制台 metrics{#console-metrics}

The
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric)
包含了控制台 metrics （指标）导出器的实现。

### 控制台 logs (Experimental) {#console-logs}

The
[`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog)
包含了控制台 logs （日志）导出器的实现。

## OTLP

若要将 Trace 数据发送到 OTLP 端点（例如 [collector](/docs/collector) 或者
Jaeger >= v1.35.0），你需要配置一个 OTLP 导出器（exporter），将数据发送到你的端点。

### 使用 HTTP 的 OTLP traces

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)
提供了使用 HTTP（二进制 protobuf 负载）实现的 OTLP traces 导出器（exporter）。

### OTLP traces over gRPC

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc)
提供了使用 gRPC 实现的 OTLP trace 导出器（exporter）。

### Jaeger

如果想要尝试 OTLP 导出器（exporter），从 v1.35.0 开始，你可以以 OTLP 端点方式运行
[Jaeger](https://www.jaegertracing.io/)，并且在 docker 容器中运行进行 trace 可视化。

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### 使用 HTTP 的 OTLP metrics

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp)
提供了使用 HTTP（二进制 protobuf 负载）实现的 OTLP metric 导出器（exporter）。

### 使用 gRPC 的 OTLP Metric

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc)
提供了使用 gRPC 实现的 OTLP metric 导出器（exporter）。

### 使用 HTTP 的 OTLP 日志（Experimental）

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp)
提供了使用 HTTP（二进制 protobuf 负载）实现的 OTLP 日志导出器（exporter）。

### 使用 gRPC 的 OTLP 日志（Experimental）

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc)
提供了使用 gRPC 实现的 OTLP 日志导出器（exporter）。

## Prometheus (Experimental)

Prometheus 导出器（exporter）通过 Prometheus 抓取 HTTP 端点来报告指标。

[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus)
提供了 Prometheus 指标导出器（exporter）的实现。

有关如何使用 Prometheus 导出器的更多信息，请查看
[prometheus example](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)
