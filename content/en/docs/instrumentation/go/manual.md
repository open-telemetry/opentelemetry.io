---
title: Manual Instrumentation
linkTitle: Manual
aliases:
  - /docs/instrumentation/go/instrumentation
  - /docs/instrumentation/go/manual_instrumentation
weight: 30
description: Manual instrumentation for OpenTelemetry Go
cSpell:ignore: fatalf otlptrace sdktrace sighup
---

{{% docs/instrumentation/manual-intro %}}

## Setup

## Traces

### Getting a Tracer

To create spans, you'll need to acquire or initialize a tracer first.

Ensure you have the right packages installed:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/trace \
  go.opentelemetry.io/otel/sdk \
```

Then initialize an exporter, resources, tracer provider, and finally a tracer.

```go
package app

import (
	"context"
	"fmt"
	"log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer

func newExporter(ctx context.Context)  /* (someExporter.Exporter, error) */ {
	// Your preferred exporter: console, jaeger, zipkin, OTLP, etc.
}

func newTraceProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// Ensure default SDK resources and the required service name are set.
	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("ExampleService"),
		),
	)

	if err != nil {
		panic(err)
	}

	return sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(r),
	)
}

func main() {
	ctx := context.Background()

	exp, err := newExporter(ctx)
	if err != nil {
		log.Fatalf("failed to initialize exporter: %v", err)
	}

	// Create a new tracer provider with a batch span processor and the given exporter.
	tp := newTraceProvider(exp)

	// Handle shutdown properly so nothing leaks.
	defer func() { _ = tp.Shutdown(ctx) }()

	otel.SetTracerProvider(tp)

	// Finally, set the tracer that can be used for this package.
	tracer = tp.Tracer("ExampleService")
}
```

You can now access `tracer` to manually instrument your code.

### Creating Spans

Spans are created by tracers. If you don't have one initialized, you'll need to
do that.

To create a span with a tracer, you'll also need a handle on a `context.Context`
instance. These will typically come from things like a request object and may
already contain a parent span from an [instrumentation library][].

```go
func httpHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "hello-span")
	defer span.End()

	// do some work to track with hello-span
}
```

In Go, the `context` package is used to store the active span. When you start a
span, you'll get a handle on not only the span that's created, but the modified
context that contains it.

Once a span has completed, it is immutable and can no longer be modified.

### Get the current span

To get the current span, you'll need to pull it out of a `context.Context` you
have a handle on:

```go
// This context needs contain the active span you plan to extract.
ctx := context.TODO()
span := trace.SpanFromContext(ctx)

// Do something with the current span, optionally calling `span.End()` if you want it to end
```

This can be helpful if you'd like to add information to the current span at a
point in time.

### Create nested spans

You can create a nested span to track work in a nested operation.

If the current `context.Context` you have a handle on already contains a span
inside of it, creating a new span makes it a nested span. For example:

```go
func parentFunction(ctx context.Context) {
	ctx, parentSpan := tracer.Start(ctx, "parent")
	defer parentSpan.End()

	// call the child function and start a nested span in there
	childFunction(ctx)

	// do more work - when this function ends, parentSpan will complete.
}

func childFunction(ctx context.Context) {
	// Create a span to track `childFunction()` - this is a nested span whose parent is `parentSpan`
	ctx, childSpan := tracer.Start(ctx, "child")
	defer childSpan.End()

	// do work here, when this function returns, childSpan will complete.
}
```

Once a span has completed, it is immutable and can no longer be modified.

### Span Attributes

Attributes are keys and values that are applied as metadata to your spans and
are useful for aggregating, filtering, and grouping traces. Attributes can be
added at span creation, or at any other time during the lifecycle of a span
before it has completed.

```go
// setting attributes at creation...
ctx, span = tracer.Start(ctx, "attributesAtCreation", trace.WithAttributes(attribute.String("hello", "world")))
// ... and after creation
span.SetAttributes(attribute.Bool("isTrue", true), attribute.String("stringAttr", "hi!"))
```

Attribute keys can be precomputed, as well:

```go
var myKey = attribute.Key("myCoolAttribute")
span.SetAttributes(myKey.String("a value"))
```

#### Semantic Attributes

Semantic Attributes are attributes that are defined by the [OpenTelemetry
Specification][] in order to provide a shared set of attribute keys across
multiple languages, frameworks, and runtimes for common concepts like HTTP
methods, status codes, user agents, and more. These attributes are available in
the `go.opentelemetry.io/otel/semconv/v1.21.0` package.

For details, see [Trace semantic conventions][].

### Events

An event is a human-readable message on a span that represents "something
happening" during it's lifetime. For example, imagine a function that requires
exclusive access to a resource that is under a mutex. An event could be created
at two points - once, when we try to gain access to the resource, and another
when we acquire the mutex.

```go
span.AddEvent("Acquiring lock")
mutex.Lock()
span.AddEvent("Got lock, doing work...")
// do stuff
span.AddEvent("Unlocking")
mutex.Unlock()
```

A useful characteristic of events is that their timestamps are displayed as
offsets from the beginning of the span, allowing you to easily see how much time
elapsed between them.

Events can also have attributes of their own -

```go
span.AddEvent("Cancelled wait due to external signal", trace.WithAttributes(attribute.Int("pid", 4328), attribute.String("signal", "SIGHUP")))
```

### Set span status

A status can be set on a span, typically used to specify that there was an error
in the operation a span is tracking - .`Error`.

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operationThatCouldFail()
if err != nil {
	span.SetStatus(codes.Error, "operationThatCouldFail failed")
}
```

By default, the status for all spans is `Unset`. In rare cases, you may also
wish to set the status to `Ok`. This should generally not be necessary, though.

### Record errors

If you have an operation that failed and you wish to capture the error it
produced, you can record that error.

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operationThatCouldFail()
if err != nil {
	span.SetStatus(codes.Error, "operationThatCouldFail failed")
	span.RecordError(err)
}
```

It is highly recommended that you also set a span's status to `Error` when using
`RecordError`, unless you do not wish to consider the span tracking a failed
operation as an error span. The `RecordError` function does **not**
automatically set a span status when called.

### Propagators and Context

Traces can extend beyond a single process. This requires _context propagation_,
a mechanism where identifiers for a trace are sent to remote processes.

In order to propagate trace context over the wire, a propagator must be
registered with the OpenTelemetry API.

```go
import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/propagation"
)
...
otel.SetTextMapPropagator(propagation.TraceContext{})
```

> OpenTelemetry also supports the B3 header format, for compatibility with
> existing tracing systems (`go.opentelemetry.io/contrib/propagators/b3`) that
> do not support the W3C TraceContext standard.

After configuring context propagation, you'll most likely want to use automatic
instrumentation to handle the behind-the-scenes work of actually managing
serializing the context.

## Metrics

To start [metrics](/docs/concepts/signals/metrics), you'll need to have an
initialized `MeterProvider` that lets you create a `Meter`. `Meter`s let you
create `Instrument`s that you can use to create different kinds of metrics.
OpenTelemetry Go currently supports the following `Instrument`s:

- Counter, a synchronous instrument which supports non-negative increments
- Asynchronous Counter, a asynchronous instrument which supports non-negative
  increments
- Histogram, a synchronous instrument which supports arbitrary values that are
  statistically meaningful, such as histograms, summaries or percentile
- Asynchronous Gauge, an asynchronous instrument which supports non-additive
  values, such as room temperature
- UpDownCounter, a synchronous instrument which supports increments and
  decrements, such as number of active requests
- Asynchronous UpDownCounter, an asynchronous instrument which supports
  increments and decrements

For more on synchronous and asynchronous instruments, and which kind is best
suited for your use case, see
[Supplementary Guidelines](/docs/specs/otel/metrics/supplementary-guidelines/).

If a `MeterProvider` is not created either by an instrumentation library or
manually, the OpenTelemetry Metrics API will use a no-op implementation and fail
to generate data.

Here you can find more detailed package documentation for:

- Metrics API: [`go.opentelemetry.io/otel/metric`][]
- Metrics SDK: [`go.opentelemetry.io/otel/sdk/metric`][]

### Initialize Metrics

{{% alert color="info" %}} If you’re instrumenting a library, skip this step.
{{% /alert %}}

To enable [metrics](/docs/concepts/signals/metrics/) in your app, you'll need to
have an initialized
[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider) that will let
you create a [`Meter`](/docs/concepts/signals/metrics/#meter).

If a `MeterProvider` is not created, the OpenTelemetry APIs for metrics will use
a no-op implementation and fail to generate data. Therefore, you have modify the
source code to include the SDK initialization code using the following packages:

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/metric`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`][]

Ensure you have the right Go modules installed:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/stdout/stdoutmetric \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/metric
```

Then initialize a resources, metrics exporter and provider:

```go
package main

import (
	"context"
	"log"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

func main() {
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	meterProvider, err := newMeterProvider(res)
	if err != nil {
		panic(err)
	}

	// Set the global meter provider.
	otel.SetMeterProvider(meterProvider)

	// Handle shutdown properly so nothing leaks.
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(resource.Default(),
		resource.NewWithAttributes(semconv.SchemaURL,
			semconv.ServiceName("dice"),
			semconv.ServiceVersion("0.1.0"),
		))
}

func newMeterProvider(res *resource.Resource) (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New()
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(metric.NewPeriodicReader(metricExporter,
			// Default is 1m. Set to 3s for demonstrative purposes.
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
```

Now that a `MeterProvider` is configured, you can acquire a `Meter`.

### Acquiring a Meter

Anywhere in your application where you have manually instrumented code you can
call [`otel.Meter`](https://pkg.go.dev/go.opentelemetry.io/otel#Meter) to
acquire a meter. For example:

```go
import "go.opentelemetry.io/otel"

var meter = otel.Meter("my-service-meter")
```

### Synchronous and asynchronous instruments

OpenTelemetry instruments are either synchronous or asynchronous (observable).

Synchronous instruments take a measurement when they are called. The measurement
is done as another call during program execution, just like any other function
call. Periodically, the aggregation of these measurements is exported by a
configured exporter. Because measurements are decoupled from exporting values,
an export cycle may contain zero or multiple aggregated measurements.

Asynchronous instruments, on the other hand, provide a measurement at the
request of the SDK. When the SDK exports, a callback that was provided to the
instrument on creation is invoked. This callback provides the SDK with a
measurement that is immediately exported. All measurements on asynchronous
instruments are performed once per export cycle.

Asynchronous instruments are useful in several circumstances, such as:

- When updating a counter is not computationally cheap, and thus you don't want
  the currently executing thread to have to wait for that measurement
- Observations need to happen at frequencies unrelated to program execution
  (i.e., they cannot be accurately measured when tied to a request lifecycle)
- There is no value from knowing the precise timestamp of increments

In cases like these, it's often better to observe a cumulative value directly,
rather than aggregate a series of deltas in post-processing (the synchronous
example).

### Using Counters

Counters can by used to measure a non-negative, increasing value.

For example, here's how you might report a number of calls for an HTTP handler:

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	apiCounter, err := meter.Int64UpDownCounter(
		"api.counter",
		metric.WithDescription("Number of API calls."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		apiCounter.Add(r.Context(), 1)

		// do some work in an API call
	})
}
```

### Using UpDown Counters

UpDown counters can increment and decrement, allowing you to observe a
cumulative value that goes up or down.

For example, here's how you might report a number of items of some collection:

```go
import (
	"context"

	"go.opentelemetry.io/otel/metric"
)

var itemsCounter metric.Int64UpDownCounter

func init() {
	var err error
	itemsCounter, err = meter.Int64UpDownCounter(
		"events.counter",
		metric.WithDescription("Number of events."),
		metric.WithUnit("{event}"),
	)
	if err != nil {
		panic(err)
	}
}

func addItem() {
	// code that adds an item to the collection

	itemsCounter.Add(context.Background(), 1)
}

func removeItem() {
	// code that removes an item from the collection

	itemsCounter.Add(context.Background(), -1)
}
```

### Using Histograms

Histograms are used to measure a distribution of values over time.

For example, here's how you might report a distribution of response times for an
HTTP handler:

```go
import (
	"net/http"
	"time"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	histogram, err := meter.Float64Histogram(
		"task.duration",
		metric.WithDescription("The duration of task execution."),
		metric.WithUnit("s"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// do some work in an API call

		duration := time.Since(start)
		histogram.Record(r.Context(), duration.Seconds())
	})
}
```

### Using Observable (Async) Counters

Observable counters can be used to measure an additive, non-negative,
monotonically increasing value.

For example, here's how you might report time since the application started:

```go
import (
	"context"
	"time"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	start := time.Now()
	if _, err := meter.Float64ObservableCounter(
		"uptime",
		metric.WithDescription("The duration since the application started."),
		metric.WithUnit("s"),
		metric.WithFloat64Callback(func(_ context.Context, o metric.Float64Observer) error {
			o.Observe(float64(time.Since(start).Seconds()))
			return nil
		}),
	); err != nil {
		panic(err)
	}
}
```

### Using Observable (Async) UpDown Counters

Observable UpDown counters can increment and decrement, allowing you to measure
an additive, non-negative, non-monotonically increasing cumulative value.

For example, here's how you might report some database metrics:

```js
import (
	"context"
	"database/sql"

	"go.opentelemetry.io/otel/metric"
)

// registerDBMetrics registers asynchronous metics for the provided db.
// Make sure to unregister metric.Registration before closing the provided db.
func registerDBMetrics(db *sql.DB, meter metric.Meter, poolName string) (metric.Registration, error) {
	max, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.max",
		metric.WithDescription("The maximum number of open connections allowed."),
		metric.WithUnit("{connection}"),
	)
	if err != nil {
		return nil, err
	}

	waitTime, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.wait_time",
		metric.WithDescription("The time it took to obtain an open connection from the pool."),
		metric.WithUnit("ms"),
	)
	if err != nil {
		return nil, err
	}

	reg, err := meter.RegisterCallback(
		func(_ context.Context, o metric.Observer) error {
			stats := db.Stats()
			o.ObserveInt64(max, int64(stats.MaxOpenConnections))
			o.ObserveInt64(waitTime, int64(stats.WaitDuration))
			return nil
		},
		max,
		waitTime,
	)
	if err != nil {
		return nil, err
	}
	return reg, nil
}
```

### Using Observable (Async) Gauges

Observable Gauges should be used to measure non-additive values.

For example, here's how you might report memory usage of the heap objects used
in application:

```go
import (
	"context"
	"runtime"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	if _, err := meter.Int64ObservableGauge(
		"memory.heap",
		metric.WithDescription(
			"Memory usage of the allocated heap objects.",
		),
		metric.WithUnit("By"),
		metric.WithInt64Callback(func(_ context.Context, o metric.Int64Observer) error {
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			o.Observe(int64(m.HeapAlloc))
			return nil
		}),
	); err != nil {
		panic(err)
	}
}
```

### Adding attributes

You can add Attributes to using
[`WithAttributeSet`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributeSet)
or
[`WithAttributes`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributes)
option.

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

func init() {
	apiCounter, err := meter.Int64UpDownCounter(
		"api.finished.counter",
		metric.WithDescription("Number of finished API calls."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// do some work in an API call and set the response HTTP status code

		apiCounter.Add(r.Context(), 1,
			metric.WithAttributes(semconv.HTTPStatusCode(statusCode)))
	})
}
```

## Logs

The logs API is currently unstable, documentation TBA.

## Next Steps

You’ll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/go/exporters) to one or more
telemetry backends.

[opentelemetry specification]: /docs/specs/otel/
[trace semantic conventions]: /docs/specs/otel/trace/semantic_conventions/
[instrumentation library]: ../libraries/
[`go.opentelemetry.io/otel`]: https://pkg.go.dev/go.opentelemetry.io/otel
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric
[`go.opentelemetry.io/otel/metric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/metric
[`go.opentelemetry.io/otel/sdk/metric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric
[`go.opentelemetry.io/otel/sdk/resource`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/sdk/resource
