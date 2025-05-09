---
title: Exporters
aliases: [exporting_data]
weight: 50
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

## Console

The console exporter is useful for development and debugging tasks, and is the
simplest to set up.

### Console traces

The
[`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace)
package contains an implementation of the console trace exporter.

### Console metrics

The
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric)
package contains an implementation of the console metrics exporter.

### Console logs (Experimental) {#console-logs}

The
[`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog)
package contains an implementation of the console log exporter.

## OTLP

To send trace data to an OTLP endpoint (like the [collector](/docs/collector) or
Jaeger >= v1.35.0) you'll want to configure an OTLP exporter that sends to your
endpoint.

### OTLP traces over HTTP

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)
contains an implementation of the OTLP trace exporter using HTTP with binary
protobuf payloads.

### OTLP traces over gRPC

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc)
contains an implementation of OTLP trace exporter using gRPC.

### Jaeger

To try out the OTLP exporter, since v1.35.0 you can run
[Jaeger](https://www.jaegertracing.io/) as an OTLP endpoint and for trace
visualization in a Docker container:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### OTLP metrics over HTTP

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp)
contains an implementation of OTLP metrics exporter using HTTP with binary
protobuf payloads.

### OTLP metrics over gRPC

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc)
contains an implementation of OTLP metrics exporter using gRPC.

### OTLP logs over HTTP (Experimental)

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp)
contains an implementation of OTLP logs exporter using HTTP with binary protobuf
payloads.

### OTLP logs over gRPC (Experimental)

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc)
contains an implementation of OTLP logs exporter using gRPC.

## Prometheus (Experimental)

A Prometheus exporter is used to report metrics via Prometheus scrape HTTP
endpoint.

[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus)
contains an implementation of Prometheus metrics exporter.

To learn more on how to use the Prometheus exporter, try the
[prometheus example](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)
