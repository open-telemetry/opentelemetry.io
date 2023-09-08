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
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
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
the `go.opentelemetry.io/otel/semconv/v1.12.0` package.

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
OpenTelemetry JavaScript currently supports the following `Instrument`s:

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

### Initialize Metrics

{{% alert color="info" %}} If you’re instrumenting a library, skip this step.
{{% /alert %}}

To enable [metrics](/docs/concepts/signals/metrics/) in your app, you'll need to
have an initialized
[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider) that will let
you create a [`Meter`](/docs/concepts/signals/metrics/#meter).

If a `MeterProvider` is not created, the OpenTelemetry APIs for metrics will use
a no-op implementation and fail to generate data. As explained next, modify the
`instrumentation.ts` (or `instrumentation.js`) file to include all the SDK
initialization code in Node and the browser.

#### Node.js {#initialize-metrics-nodejs}

If you followed the instructions to [initialize the SDK](#initialize-the-sdk)
above, you have a `MeterProvider` setup for you already. You can continue with
[acquiring a meter](#acquiring-a-meter).

##### Initializing metrics with `sdk-metrics`

In some cases you may not be able or may not want to use the
[full OpenTelemetry SDK for Node.js](https://www.npmjs.com/package/@opentelemetry/sdk-node).
This is also true if you want to use OpenTelemetry JavaScript in the browser.

If so, you can initialize tracing with the `@opentelemetry/sdk-metrics` package:

```shell
npm install @opentelemetry/sdk-metrics
```

If you have not created it for tracing already, create a separate
`instrumentation.ts` (or `instrumentation.js`) file that has all the SDK
initialization code in it:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'dice-server',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // Default is 60000ms (60 seconds). Set to 3 seconds for demonstrative purposes only.
  exportIntervalMillis: 3000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
});

myServiceMeterProvider.addMetricReader(metricReader);

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'service-name-here',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // Default is 60000ms (60 seconds). Set to 3 seconds for demonstrative purposes only.
  exportIntervalMillis: 3000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
});

myServiceMeterProvider.addMetricReader(metricReader);

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{< /tabpane >}}

You'll need to `--require` this file when you run your app, such as:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
ts-node --require ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --require ./instrumentation.js app.js
```

{{% /tab %}} {{< /tabpane >}}

Now that a `MeterProvider` is configured, you can acquire a `Meter`.

### Acquiring a Meter

Anywhere in your application where you have manually instrumented code you can
call `getMeter` to acquire a meter. For example:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';

const myMeter = opentelemetry.metrics.getMeter('my-service-meter');

// You can now use a 'meter' to create instruments!
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter('my-service-meter');

// You can now use a 'meter' to create instruments!
```

{{% /tab %}} {{< /tabpane >}}

It’s generally recommended to call `getMeter` in your app when you need it
rather than exporting the meter instance to the rest of your app. This helps
avoid trickier application load issues when other required dependencies are
involved.

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
example). Take note of the use of `observe` rather than `add` in the appropriate
code examples below.

### Using Counters

Counters can by used to measure a non-negative, increasing value.

```js
const counter = myMeter.createCounter('events.counter');

//...

counter.add(1);
```

### Using UpDown Counters

UpDown counters can increment and decrement, allowing you to observe a
cumulative value that goes up or down.

```js
const counter = myMeter.createUpDownCounter('events.counter');

//...

counter.add(1);

//...

counter.add(-1);
```

### Using Histograms

Histograms are used to measure a distribution of values over time.

For example, here's how you might report a distribution of response times for an
API route with Express:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import express from 'express';

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // do some work in an API call

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const express = require('express');

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // do some work in an API call

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});
```

{{% /tab %}} {{< /tabpane >}}

### Using Observable (Async) Counters

Observable counters can be used to measure an additive, non-negative,
monotonically increasing value.

```js
let events = [];

const addEvent = (name) => {
  events = append(events, name);
};

const counter = myMeter.createObservableCounter('events.counter');

counter.addCallback((result) => {
  result.observe(len(events));
});

//... calls to addEvent
```

### Using Observable (Async) UpDown Counters

Observable UpDown counters can increment and decrement, allowing you to measure
an additive, non-negative, non-monotonically increasing cumulative value.

```js
let events = [];

const addEvent = (name) => {
  events = append(events, name);
};

const removeEvent = () => {
  events.pop();
};

const counter = myMeter.createObservableUpDownCounter('events.counter');

counter.addCallback((result) => {
  result.observe(len(events));
});

//... calls to addEvent and removeEvent
```

### Using Observable (Async) Gauges

Observable Gauges should be used to measure non-additive values.

```js
let temperature = 32;

const gauge = myMeter.createObservableGauge('temperature.gauge');

gauge.addCallback((result) => {
  result.observe(temperature);
});

//... temperature variable is modified by a sensor
```

### Describing instruments

When you create instruments like counters, histograms, etc. you can give them a
description.

```js
const httpServerResponseDuration = myMeter.createHistogram(
  'http.server.duration',
  {
    description: 'A distribution of the HTTP server response times',
    unit: 'milliseconds',
    valueType: ValueType.INT,
  },
);
```

In JavaScript, each configuration type means the following:

- `description` - a human-readable description for the instrument
- `unit` - The description of the unit of measure that the value is intended to
  represent. For example, `milliseconds` to measure duration, or `bytes` to
  count number of bytes.
- `valueType` - The kind of numeric value used in measurements.

It's generally recommended to describe each instrument you create.

### Adding attributes

You can add Attributes to metrics when they are generated.

```js
const counter = myMeter.createCounter('my.counter');

counter.add(1, { 'some.optional.attribute': 'some value' });
```

### Configure Metric Views

A Metric View provides developers with the ability to customize metrics exposed
by the Metrics SDK.

#### Selectors

To instantiate a view, one must first select a target instrument. The following
are valid selectors for metrics:

- `instrumentType`
- `instrumentName`
- `meterName`
- `meterVersion`
- `meterSchemaUrl`

Selecting by `instrumentName` (of type string) has support for wildcards, so you
can select all instruments using `*` or select all instruments whose name starts
with `http` by using `http*`.

#### Examples

Filter attributes on all metric types:

```js
const limitAttributesView = new View({
  // only export the attribute 'environment'
  attributeKeys: ['environment'],
  // apply the view to all instruments
  instrumentName: '*',
});
```

Drop all instruments with the meter name `pubsub`:

```js
const dropView = new View({
  aggregation: new DropAggregation(),
  meterName: 'pubsub',
});
```

Define explicit bucket sizes for the Histogram named `http.server.duration`:

```js
const histogramView = new View({
  aggregation: new ExplicitBucketHistogramAggregation([
    0, 1, 5, 10, 15, 20, 25, 30,
  ]),
  instrumentName: 'http.server.duration',
  instrumentType: InstrumentType.HISTOGRAM,
});
```

#### Attach to meter provider

Once views have been configured, attach them to the corresponding meter
provider:

```js
const meterProvider = new MeterProvider({
  views: [limitAttributesView, dropView, histogramView],
});
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
