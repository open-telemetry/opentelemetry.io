---
title: Manual Instrumentation
linkTitle: Manual
weight: 3
---

**Libraries** that want to export telemetry data using OpenTelemetry MUST only
depend on the `opentelemetry-api` package and should never configure or depend
on the OpenTelemetry SDK. The SDK configuration must be provided by
**Applications** which should also depend on the `opentelemetry-sdk` package, or
any other implementation of the OpenTelemetry API. This way, libraries will
obtain a real implementation only if the user application is configured for it.
For more details, check out the [Library Guidelines].

## Setup

The first step is to get a handle to an instance of the `OpenTelemetry`
interface.

If you are an application developer, you need to configure an instance of the
`OpenTelemetry SDK` as early as possible in your application. This can be done
using the `Sdk::builder()` method. The returned `SdkBuilder` instance gets the
providers related to the signals, tracing and metrics, in order to build the
`OpenTelemetry` instance.

You can build the providers by using the `TracerProvider::builder()` and
`MeterProvider::builder()` methods. It is also strongly recommended to define a
`Resource` instance as a representation of the entity producing the telemetry;
in particular the `service.name` attribute is the most important piece of
telemetry source-identifying info.

### Example

```php
<?php
$resource = ResourceInfoFactory::defaultResource();
$transport = (new GrpcTransportFactory())->create('http://collector:4317' . OtlpUtil::method(Signals::TRACE));
$exporter = new SpanExporter($transport);

$reader = new ExportingReader(
    new MetricExporter(
        PsrTransportFactory::discover()->create('http://collector:4318/v1/metrics', 'application/x-protobuf')
    ),
    ClockFactory::getDefault()
);

$meterProvider = MeterProvider::builder()
    ->setResource($resource)
    ->addReader($reader)
    ->build();

$tracerProvider = TracerProvider::builder()
    ->addSpanProcessor(
        (new BatchSpanProcessorBuilder($spanExporter))
            ->setMeterProvider($meterProvider)
            ->build()
    )
    ->setResource($resource)
    ->setSampler(new ParentBased(new AlwaysOnSampler()))
    ->build();

Sdk::builder()
    ->setTracerProvider($tracerProvider)
    ->setMeterProvider($meterProvider)
    ->setPropagator(TraceContextPropagator::getInstance())
    ->setAutoShutdown(true)
    ->buildAndRegisterGlobal();

$instrumentation = new CachedInstrumentation('example');
$tracer = $instrumentation->tracer();
```

## Acquiring a Tracer

To do [Tracing](/docs/concepts/signals/traces/) you'll need to acquire a
[`Tracer`](/docs/concepts/signals/traces/#tracer).

**Note:** Methods of the OpenTelemetry SDK should never be called.

First, a `Tracer` must be acquired, which is responsible for creating spans and
interacting with the [Context](#context-propagation). A tracer is acquired by
using the OpenTelemetry API specifying the name and version of the [library
instrumenting][instrumentation library] the [instrumented library] or
application to be monitored. More information is available in the specification
chapter [Obtaining a Tracer].

```php
$tracer = Globals::tracerProvider()->getTracer('instrumentation-library-name', '1.0.0');
```

Important: the "name" and optional version of the tracer are purely
informational. All `Tracer`s that are created by a single `OpenTelemetry`
instance will interoperate, regardless of name.

### Create Spans

To create [Spans](/docs/concepts/signals/traces/#spans-in-opentelemetry), you
only need to specify the name of the span. The start and end time of the span is
automatically set by the OpenTelemetry SDK.

```php
$span = $tracer->spanBuilder("my span")->startSpan();

// Make the span the current span
try {
  $scope = $span->activate();
  // In this scope, the span is the current/active span
} finally {
    $span->end();
    $scope->detach();
}
```

It's required to call `end()` to end the span, and you must `detach` the active
scope if you have activated it.

### Create nested Spans

Most of the time, we want to correlate
[spans](/docs/concepts/signals/traces/#spans-in-opentelemetry) for nested
operations. OpenTelemetry supports tracing within processes and across remote
processes. For more details how to share context between remote processes, see
[Context Propagation](#context-propagation).

For a method `a` calling a method `b`, the spans could be manually linked in the
following way:

```php

  $parentSpan = $tracer->spanBuilder("parent")->startSpan();
  $scope = $parentSpan->activate();
  try {
    $child = $tracer->spanBuilder("child")->startSpan();
    //do stuff
    $child->end();
  } finally {
    $parentSpan->end();
    $scope->detach();
  }
```

### Get the current span

Sometimes it's helpful to do something with the current/active
[span](/docs/concepts/signals/traces/#spans-in-opentelemetry) at a particular
point in program execution.

```php
$span = OpenTelemetry\API\Trace\Span::getCurrent();
```

And if you want the current span for a particular `Context` object:

```php
$span = OpenTelemetry\API\Trace\Span::fromContext($context);
```

### Span Attributes

In OpenTelemetry [spans](/docs/concepts/signals/traces/#spans-in-opentelemetry)
can be created freely and it's up to the implementor to annotate them with
attributes specific to the represented operation.
[Attributes](/docs/concepts/signals/traces/#attributes) provide additional
context on a span about the specific operation it tracks, such as results or
operation properties.

```php
$span = $tracer->spanBuilder("/resource/path")->setSpanKind(SpanKind::CLIENT)->startSpan();
$span->setAttribute("http.method", "GET");
$span->setAttribute("http.url", (string) $url);
```

### Create Spans with events

[Spans](/docs/concepts/signals/traces/#spans-in-opentelemetry) can be annotated
with named events (called
[Span Events](/docs/concepts/signals/traces/#span-events)) that can carry zero
or more [Span Attributes](#span-attributes), each of which itself is a key:value
map paired automatically with a timestamp.

```php
$span->addEvent("Init");
...
$span->addEvent("End");
```

```php
$eventAttributes = Attributes::create([
    "key" => "value",
    "result" => 3.14159;
]);
$span->addEvent("End Computation", $eventAttributes);
```

### Create Spans with links

A [Span](/docs/concepts/signals/traces/#spans-in-opentelemetry) may be linked to
zero or more other Spans that are causally related via a
[Span Link](/docs/concepts/signals/traces/#span-links). Links can be used to
represent batched operations where a Span was initiated by multiple initiating
Spans, each representing a single incoming item being processed in the batch.

```php
$span = $tracer->spanBuilder("span-with-links")
        ->addLink($parentSpan1->getContext())
        ->addLink($parentSpan2->getContext())
        ->addLink($parentSpan3->getContext())
        ->addLink($remoteSpanContext)
    ->startSpan();
```

For more details how to read context from remote processes, see
[Context Propagation](#context-propagation).

### Set span status and record exceptions

A [status](/docs/concepts/signals/traces/#span-status) can be set on a
[span](/docs/concepts/signals/traces/#spans-in-opentelemetry), typically used to
specify that a span has not completed successfully - `SpanStatus::ERROR`. In
rare scenarios, you could override the `Error` status with `Ok`, but don't set
`Ok` on successfully-completed spans.

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with setting span status.

The status can be set at any time before the span is finished:

```php
$span = $tracer->spanBuilder("my-span")->startSpan();
$scope = $span->activate();
try {
  // do something
} catch (Throwable $t) {
  $span->setStatus(StatusCode::STATUS_ERROR, "Something bad happened!");
  $span->recordException($t); //This will capture things like the current stack trace in the span.
  throw $t;
} finally {
  $span->end(); // Cannot modify span after this call
  $scope->detach();
}
```

#### Sampler

It is not always feasible to trace and export every user request in an
application. In order to strike a balance between observability and expenses,
traces can be sampled.

The OpenTelemetry SDK offers four samplers out of the box:

- [AlwaysOnSampler] which samples every trace regardless of upstream sampling
  decisions.
- [AlwaysOffSampler] which doesn't sample any trace, regardless of upstream
  sampling decisions.
- [ParentBased] which uses the parent span to make sampling decisions, if
  present.
- [TraceIdRatioBased] which samples a configurable percentage of traces, and
  additionally samples any trace that was sampled upstream.

Additional samplers can be provided by implementing
`OpenTelemetry\SDK\Trace\SamplerInterrace`.

```php
$tracerProvider = TracerProvider::builder()
  ->setSampler(new AlwaysOnSampler())
  //or
  ->setSampler(new AlwaysOffSampler())
  //or
  ->setSampler(new TraceIdRatioBasedSampler(0.5))
  ->build();
```

#### Span Processor

Different Span processors are offered by OpenTelemetry. The
`SimpleSpanProcessor` immediately forwards ended spans to the exporter, while
the `BatchSpanProcessor` batches them and sends them in bulk.

```php
$tracerProvider = TracerProvider::builder()
  ->addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporterFactory()->create()))
  ->build();
```

#### Transports

All exporters require a `Transport`, which is responsible for the sending of
telemetry data from an exporter:

- `PsrTransport` - uses a PSR18 client to send data over HTTP
- `StreamTransport` - uses a stream to send data
- `GrpcTransport` - uses gRPC to send protobuf-encoded data

#### Exporter

Span processors are initialized with an exporter which is responsible for
sending the telemetry data to a particular backend:

- `InMemory`: keeps the data in memory, useful for testing and debugging.
- `Console`: sends the data to a stream such as `stdout` or `stderr`
- `Zipkin`: prepares and sends the collected telemetry data to a Zipkin backend
  via the Zipkin APIs.
- Logging Exporter: saves the telemetry data into log streams.
- OpenTelemetry Protocol Exporter: sends the data in OTLP format to the
  [OpenTelemetry Collector] or other OTLP receivers. The underlying `Transport`
  can send:
  - protobuf over http
  - protobuf over grpc
  - json over http

## Logging and Error Handling

OpenTelemetry can be configured to use a PSR-3 logger to log information about
OpenTelemetry, including errors and warnings about misconfigurations or failures
exporting data:

```php
$logger = new Psr3Logger(LogLevel::INFO);
LoggerHolder::set($logger);
```

For more fine-grained control and special case handling, custom handlers and
filters can be applied to the logger (if the logger offers this ability).
