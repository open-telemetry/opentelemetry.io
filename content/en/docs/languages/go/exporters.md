---
title: Exporters
aliases: [exporting_data]
weight: 50
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp promhttp stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro go %}}

## Console

The console exporter is useful for development and debugging tasks, and is the
simplest to set up.

### Console traces

The
[`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace)
package contains an implementation of the console trace exporter.

Here's how you can create an exporter with default configuration:

```go
import (
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/sdk/trace"
)

func newExporter() (trace.SpanExporter, error) {
	return stdouttrace.New()
}
```

### Console metrics

The
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric)
package contains an implementation of the console metrics exporter.

Here's how you can create an exporter with default configuration:

```go
import (
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter() (metric.Exporter, error) {
	return stdoutmetric.New()
}
```

### Console logs (Experimental) {#console-logs}

The
[`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog)
package contains an implementation of the console log exporter.

Here's how you can create an exporter with default configuration:

```go
import (
	"go.opentelemetry.io/otel/exporters/stdout/stdoutlog"
	"go.opentelemetry.io/otel/sdk/log"
)

func newExporter() (log.Exporter, error) {
	return stdoutlog.New()
}
```

## OTLP

To send trace data to an OTLP endpoint (like the [collector](/docs/collector) or
Jaeger >= v1.35.0) you'll want to configure an OTLP exporter that sends to your
endpoint.

### OTLP traces over HTTP

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)
contains an implementation of the OTLP trace exporter using HTTP with binary
protobuf payloads.

Here's how you can create an exporter with default configuration:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/trace"
)

func newExporter(ctx context.Context) (trace.SpanExporter, error) {
	return otlptracehttp.New(ctx)
}
```

### OTLP traces over gRPC

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc)
contains an implementation of OTLP trace exporter using gRPC.

Here's how you can create an exporter with default configuration:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/trace"
)

func newExporter(ctx context.Context) (trace.SpanExporter, error) {
	return otlptracegrpc.New(ctx)
}
```

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

Here's how you can create an exporter with default configuration:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter(ctx context.Context) (metric.Exporter, error) {
	return otlpmetrichttp.New(ctx)
}
```

### OTLP metrics over gRPC

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc)
contains an implementation of OTLP metrics exporter using gRPC.

Here's how you can create an exporter with default configuration:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter(ctx context.Context) (metric.Exporter, error) {
	return otlpmetricgrpc.New(ctx)
}
```

## Prometheus (Experimental)

A Prometheus exporter is used to report metrics via Prometheus scrape HTTP
endpoint.

[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus)
contains an implementation of Prometheus metrics exporter.

Here's how you can create an exporter (which is also a metric reader) with
default configuration:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/prometheus"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter(ctx context.Context) (metric.Reader, error) {
	// prometheus.DefaultRegisterer is used by default
	// so that metrics are available via promhttp.Handler.
	return prometheus.New()
}
```

To learn more on how to use the Prometheus exporter, try the
[prometheus example](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)

### OTLP logs over HTTP (Experimental)

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp)
contains an implementation of OTLP logs exporter using HTTP with binary protobuf
payloads.

Here's how you can create an exporter with default configuration:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/sdk/log"
)

func newExporter(ctx context.Context) (log.Exporter, error) {
	return otlploghttp.New(ctx)
}
```

### OTLP logs over gRPC (Experimental)

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc)
contains an implementation of OTLP logs exporter using gRPC.

Here's how you can create an exporter with default configuration:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/sdk/log"
)

func newExporter(ctx context.Context) (log.Exporter, error) {
	return otlploggrpc.New(ctx)
}
```
