---
title: Експортери
aliases: [exporting_data]
weight: 50
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp promhttp stdoutlog stdouttrace
---

{{% uk/docs/languages/exporters/intro go %}}

## Консоль {#console}

Консольний експортер корисний для розробки та налагодження, і є найпростішим у налаштуванні.

### Консольні трасування {#console-trace}

Пакунок [`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace) містить реалізацію консольного експортера трасування.

Ось як можна створити експортер зі стандартною конфігурацією:

```go
import (
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/sdk/trace"
)

func newExporter() (trace.SpanExporter, error) {
	return stdouttrace.New()
}
```

### Консольні метрики {#console-metrics}

Пакунок [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric) містить реалізацію консольного експортера метрик.

Ось як можна створити експортер зі стандартною конфігурацією:

```go
import (
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter() (metric.Exporter, error) {
	return stdoutmetric.New()
}
```

### Консольні логи (Експериментально) {#console-logs}

Пакунок [`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog) містить реалізацію консольного експортера логів.

Ось як можна створити експортер зі стандартною конфігурацією:

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

Щоб відправити дані трасування на точку доступу OTLP (наприклад, [колектор](/docs/collector) або Jaeger >= v1.35.0), вам потрібно налаштувати OTLP експортер, який відправляє дані на вашу точку доступу.

### OTLP трасування через HTTP {#otlp-trace-over-http}

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp) містить реалізацію OTLP експортера трасування з використанням HTTP з бінарними protobuf навантаженнями.

Ось як можна створити експортер зі стандартною конфігурацією:

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

### OTLP трасування через gRPC {#otlp-trace-over-grpc}

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc) містить реалізацію OTLP експортера трасування з використанням gRPC.

Ось як можна створити експортер зі стандартною конфігурацією:

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

Щоб спробувати OTLP експортер, з версії v1.35.0 ви можете запустити [Jaeger](https://www.jaegertracing.io/) як точку доступу OTLP для візуалізації трасування в Docker контейнері:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### OTLP метрики через HTTP {#otlp-metrics-over-http}

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp) містить реалізацію OTLP експортера метрик з використанням HTTP з бінарними protobuf навантаженнями.

Ось як можна створити експортер зі стандартною конфігурацією:

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

### OTLP метрики через gRPC {#otlp-metrics-over-grpc}

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc) містить реалізацію OTLP експортера метрик з використанням gRPC.

Ось як можна створити експортер зі стандартною конфігурацією:

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

## Prometheus (Експериментально) {#prometheus-experimental}

Експортер Prometheus використовується для звітування метрик через HTTP кінцеву точку збору Prometheus.

[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus) містить реалізацію експортера метрик Prometheus.

Ось як можна створити експортер (який також є читачем метрик) зі стандартною конфігурацією:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/prometheus"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter(ctx context.Context) (metric.Reader, error) {
	// prometheus.DefaultRegisterer використовується стандартно
	// щоб метрики були доступні через promhttp.Handler.
	return prometheus.New()
}
```

Щоб дізнатися більше про використання експортера Prometheus, спробуйте [приклад prometheus](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)

### OTLP логи через HTTP (Експериментально) {#otlp-logs-over-http-experimental}

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp) містить реалізацію OTLP експортера логів з використанням HTTP з бінарними protobuf навантаженнями.

Ось як можна створити експортер зі стандартною конфігурацією:

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

### OTLP логи через gRPC (Експериментально) {#otlp-logs-over-grpc-experimental}

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc) містить реалізацію OTLP експортера логів з використанням gRPC.

Ось як можна створити експортер зі стандартною конфігурацією:

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
