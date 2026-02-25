---
title: Exporters
aliases: [exporting_data]
weight: 50
# prettier-ignore
cSpell:ignore: autoexport otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp sdkmetric sdktrace stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

## Automatic Exporter Configuration with Environment Variables

You can use the
[`go.opentelemetry.io/contrib/exporters/autoexport`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport)
package to automatically configure exporters using
[standard OpenTelemetry environment variables](/docs/specs/otel/configuration/sdk-environment-variables/).

This package provides factory functions that read the **exporter selector**
environment variables to select and initialize the appropriate exporter at
runtime:

| Function | Environment variable | Description |
|----------|---------------------|-------------|
| [`NewSpanExporter`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewSpanExporter) | `OTEL_TRACES_EXPORTER` | Creates a trace exporter |
| [`NewMetricReader`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewMetricReader) | `OTEL_METRICS_EXPORTER` | Creates a metric reader |
| [`NewLogExporter`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewLogExporter) | `OTEL_LOGS_EXPORTER` | Creates a log exporter |

Supported values for each selector variable are `otlp` (default) and `none`.
Once an exporter is selected, its configuration (endpoint, headers, timeout,
protocol, etc.) is read from the standard
[OTLP exporter environment variables](/docs/languages/sdk-configuration/otlp-exporter/)
by the underlying OTLP exporter package.

Example usage:

```go
import (
	"context"

	"go.opentelemetry.io/contrib/exporters/autoexport"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func main() {
	ctx := context.Background()

	// Create trace exporter using environment variables
	spanExporter, err := autoexport.NewSpanExporter(ctx)
	if err != nil {
		// handle error
	}

	// Create trace provider with the exporter
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(spanExporter),
	)

	// Create metric reader using environment variables
	metricReader, err := autoexport.NewMetricReader(ctx)
	if err != nil {
		// handle error
	}

	// Create meter provider with the reader
	meterProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(metricReader),
	)
}
```

{{% alert title="Note" color="info" %}}

The standard OTLP exporter packages (`otlptracegrpc`, `otlptracehttp`, etc.)
already read most OTLP environment variables such as
`OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`,
`OTEL_EXPORTER_OTLP_TIMEOUT`, and `OTEL_EXPORTER_OTLP_COMPRESSION`.

The `autoexport` package adds support for the **exporter selector variables**
(`OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER`, `OTEL_LOGS_EXPORTER`) that
choose _which_ exporter implementation to use. This separation keeps binary
sizes smaller by not bundling exporter dependencies (like gRPC) unless
explicitly imported.

{{% /alert %}}

For a complete overview of which environment variables are supported by the Go
SDK and contrib packages, see the
[OpenTelemetry spec compliance matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

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
