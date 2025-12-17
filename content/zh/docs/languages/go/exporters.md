---
title: 导出器
aliases: [exporting_data]
weight: 50
default_lang_commit: ff6f300f46ac9bfab574f2a73a0555fccb64fda9
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

## 控制台{#console}

控制台导出器适用于开发和调试任务，是最简单的设置方式。

### 控制台链路追踪{#console-traces}

[`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace)
该包实现了将链路（traces）数据输出到控制台的导出器（exporter）。

### 控制台指标{#console-metrics}

[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric)
该包实现了将指标（metrics）数据输出到控制台的导出器。

### 控制台日志 (Experimental) {#console-logs}

[`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog)
该包实现了将日志（logs）输出到控制台的导出器。

## OTLP{#otlp}

若你希望将 Trace 数据发送到 OTLP 端点（例如 [collector](/docs/collector) 或者
Jaeger >= v1.35.0），你需要配置一个 OTLP 导出器，将数据发送到对应地址。

### 基于 HTTP 的 OTLP 链路追踪{#otlp-traces-over-http}

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)
提供了使用 HTTP 协议，并以 protobuf 二进制格式作为载荷的 OTLP 链路导出器。

### 基于 gRPC 的 OTLP 链路追踪{#otlp-traces-over-grpc}

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc)
提供了使用 gRPC 实现的 OTLP 链路导出器（exporter）。

### Jaeger{#jaeger}

从 v1.35.0 开始，Jaeger 支持以 OTLP 端点形式运行。你可以通过以下方式在 Docker 容器中试用：
[Jaeger](https://www.jaegertracing.io/)，并能够实现链路追踪可视化。

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### 基于 HTTP 的 OTLP 指标{#otlp-metrics-over-http}

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp)
提供了使用 HTTP 协议，并以 protobuf 二进制格式作为载荷实现的 OTLP 指标导出器。

### 基于 gRPC 的 OTLP 指标{#otlp-metrics-over-grpc}

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc)
提供了使用 gRPC 实现的 OTLP metrica 指标导出器。

### 通过 HTTP 的 OTLP 日志（Experimental）{#otlp-logs-over-http-experimental}

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp)
提供了使用 HTTP 协议，并以 protobuf 二进制格式作为载荷实现的 OTLP 日志导出器。

### 通过 gRPC 的 OTLP 日志（Experimental）{#otlp-logs-over-grpc-experimental}

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc)
提供了使用 gRPC 实现的 OTLP 日志导出器。

## Prometheus (Experimental){#prometheus-experimental}

Prometheus 导出器通过 Prometheus 抓取 HTTP 端点来报告指标。

[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus)
提供了 Prometheus 指标导出器的实现。

有关如何使用 Prometheus 导出器的更多信息，请参考
[prometheus example](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)
