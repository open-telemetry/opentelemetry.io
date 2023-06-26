---
title: Manual Instrumentation
linkTitle: Manual
weight: 30
description: Manual instrumentation for OpenTelemetry PHP
---

{{% docs/instrumentation/manual-intro %}}

## Installation

The following shows how to install, initialize, and run an application
instrumented with OpenTelemetry.

To use the OpenTelemetry SDK for PHP you need packages that satisfy the
dependencies for `psr/http-client-implementation` and
`psr/http-factory-implementation`, for example the Guzzle 7 HTTP Adapter
satisfies both:

```sh
composer require "php-http/guzzle7-adapter"
```

Now you can install the OpenTelemetry SDK:

```sh
composer require open-telemetry/sdk
```

## Tracing

### Setup

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

It's important to run the tracer provider's `shutdown()` method when the PHP
process ends, to enable flushing of any enqueued telemetry. The shutdown process
is blocking, so consider running it in an async process. Otherwise, you can use
the `ShutdownHandler` to register the shutdown function as part of PHP's
shutdown process:

```php
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$tracerProvider, 'shutdown']);
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$meterProvider, 'shutdown']);
```

### Acquiring a Tracer

To do [Tracing](/docs/concepts/signals/traces/) you'll need to acquire a
[`Tracer`](/docs/concepts/signals/traces/#tracer).

First, a `Tracer` must be acquired, which is responsible for creating spans and
interacting with the [Context](../propagation/). A tracer is acquired by using
the OpenTelemetry API specifying the name and version of the
[library instrumenting](/docs/concepts/instrumentation/libraries/) the
instrumented library or application to be monitored. More information is
available in the specification chapter
[Obtaining a Tracer](/docs/specs/otel/trace/api/#tracerprovider).

```php
$tracer = Globals::tracerProvider()->getTracer('instrumentation-library-name', '1.0.0');
```

Important: the "name" and optional version of the tracer are purely
informational. All `Tracer`s that are created by a single `OpenTelemetry`
instance will interoperate, regardless of name.

### Create Spans

To create [Spans](/docs/concepts/signals/traces/#spans), you only need to
specify the name of the span. The start and end time of the span is
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
[spans](/docs/concepts/signals/traces/#spans) for nested operations.
OpenTelemetry supports tracing within processes and across remote processes. For
more details on how to share context between remote processes, see
[Context Propagation](../propagation/).

For a method `parent` calling a method `child`, the spans could be manually
linked in the following way:

```php

  $parentSpan = $tracer->spanBuilder("parent")->startSpan();
  $scope = $parentSpan->activate();
  try {
    $child = $tracer->spanBuilder("child")->startSpan();
    $child->end();
  } finally {
    $parentSpan->end();
    $scope->detach();
  }
```

### Get the current span

Sometimes it's helpful to do something with the current/active
[span](/docs/concepts/signals/traces/#spans) at a particular point in program
execution.

```php
$span = OpenTelemetry\API\Trace\Span::getCurrent();
```

And if you want the current span for a particular `Context` object:

```php
$span = OpenTelemetry\API\Trace\Span::fromContext($context);
```

### Span Attributes

In OpenTelemetry [spans](/docs/concepts/signals/traces/#spans) can be created
freely and it's up to the implementor to annotate them with attributes specific
to the represented operation.
[Attributes](/docs/concepts/signals/traces/#attributes) provide additional
context on a span about the specific operation it tracks, such as results or
operation properties.

```php
$span = $tracer->spanBuilder("/resource/path")->setSpanKind(SpanKind::CLIENT)->startSpan();
$span->setAttribute("http.method", "GET");
$span->setAttribute("http.url", (string) $url);
```

### Create Spans with events

[Spans](/docs/concepts/signals/traces/#spans) can be annotated with named events
(called [Span Events](/docs/concepts/signals/traces/#span-events)) that can
carry zero or more [Span Attributes](#span-attributes), each of which itself is
a key:value map paired automatically with a timestamp.

```php
$span->addEvent("Init");
...
$span->addEvent("End");
```

```php
$eventAttributes = Attributes::create([
    "operation" => "calculate-pi",
    "result" => 3.14159,
]);
$span->addEvent("End Computation", $eventAttributes);
```

### Create Spans with links

A [Span](/docs/concepts/signals/traces/#spans) may be linked to zero or more
other Spans that are causally related via a
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
[Context Propagation](../propagation/).

### Set span status and record exceptions

A [status](/docs/concepts/signals/traces/#span-status) can be set on a
[span](/docs/concepts/signals/traces/#spans), typically used to specify that a
span has not completed successfully - `SpanStatus::ERROR`. In rare scenarios,
you could override the `Error` status with `Ok`, but don't set `Ok` on
successfully-completed spans.

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
  //This will capture things like the current stack trace in the span.
  $span->recordException($t, ['exception.escaped' => true]);
  throw $t;
} finally {
  $span->end(); // Cannot modify span after this call
  $scope->detach();
}
```

### Sampler

It is not always feasible to trace and export every user request in an
application. In order to strike a balance between observability and expenses,
traces can be [sampled](/docs/concepts/sampling).

The OpenTelemetry SDK provides four samplers:

- `AlwaysOnSampler` which samples every trace regardless of upstream sampling
  decisions.
- `AlwaysOffSampler` which doesn't sample any trace, regardless of upstream
  sampling decisions.
- `TraceIdRatioBased` which samples a configurable percentage of traces, and
  additionally samples any trace that was sampled upstream.
- `ParentBased` which uses the parent span to make sampling decisions, if
  present. This sampler needs to be used in conjunction with a root sampler,
  which is used to determine if a root span (a span without a parent) should be
  sampled. The root sampler can be any of the other samplers.

<!-- prettier-ignore-start -->
{{< tabpane lang=php persistLang=false >}}
{{< tab "TraceId ratio-based" >}}
//trace 50% of requests
$sampler = new TraceIdRatioBasedSampler(0.5);
{{< /tab >}}
{{< tab "Always On" >}}
//always trace
$sampler = new AlwaysOnSampler();
{{< /tab >}}
{{< tab "Parent-based + ratio-based" >}}
//always sample if the parent is sampled, otherwise only sample 10% of spans
$sampler = new ParentBased(new TraceIdRatioBasedSampler(0.1));
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->

```php
$tracerProvider = TracerProvider::builder()
  ->setSampler($sampler)
  ->build();
```

Additional samplers can be provided by implementing
`OpenTelemetry\SDK\Trace\SamplerInterface`. An example of doing so would be to
make sampling decisions based on attributes set at span creation time.

### Span Processor

Different Span processors are offered by OpenTelemetry. The
`SimpleSpanProcessor` immediately forwards ended spans to the exporter, while
the `BatchSpanProcessor` batches them and sends them in bulk.

```php
$tracerProvider = TracerProvider::builder()
  ->addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporterFactory()->create()))
  ->build();
```

### Transports

All exporters require a `Transport`, which is responsible for the sending of
telemetry data from an exporter:

- `PsrTransport` - uses a PSR18 client to send data over HTTP
- `StreamTransport` - uses a stream to send data
- `GrpcTransport` - uses gRPC to send protobuf-encoded data

### Exporter

Span processors are initialized with an exporter which is responsible for
sending the telemetry data to a particular backend:

- `InMemory`: keeps the data in memory, useful for testing and debugging.
- `Console`: sends the data to a stream such as `stdout` or `stderr`
- `Zipkin`: prepares and sends the collected telemetry data to a Zipkin backend
  via the Zipkin APIs.
- Logging Exporter: sends the telemetry data to a PSR-3 logger.
- OpenTelemetry Protocol Exporter: sends the data in OTLP format to the
  [OpenTelemetry Collector](/docs/collector/) or other OTLP receivers. The
  underlying `Transport` can send:
  - protobuf over HTTP
  - protobuf over gRPC
  - JSON over HTTP

### Logging and Error Handling

OpenTelemetry can be configured to use a PSR-3 logger to log information about
OpenTelemetry, including errors and warnings about misconfigurations or failures
exporting data:

```php
$logger = new Psr3Logger(LogLevel::INFO);
LoggerHolder::set($logger);
```

If no PSR-3 logger is provided, error messages will instead be recorded via
`trigger_error` (at a level no higher than `E_USER_WARNING`).

For more fine-grained control and special case handling, custom handlers and
filters can be applied to the logger (if the logger offers this ability).

## Metrics

OpenTelemetry can be used to measure and record different types of metrics from
an application, which can then be
[pushed](/docs/specs/otel/metrics/sdk/#push-metric-exporter) to a metrics
service such as the OpenTelemetry collector:

- counter
- async counter
- histogram
- async gauge
- up/down counter
- async up/down counter

Meter types and usage are explained in the
[metrics concepts](/docs/concepts/signals/metrics/) documentation.

### Setup

First, create a `MeterProvider`:

```php
$reader = new ExportingReader((new ConsoleMetricExporterFactory())->create());

$meterProvider = MeterProvider::builder()
    ->addReader($reader)
    ->build();
```

You can now use the meter provider to retrieve meters.

### Synchronous meters

A synchronous meter must be manually adjusted as data changes:

```php
$up_down = $meterProvider
    ->getMeter('my_up_down')
    ->createUpDownCounter('queued', 'jobs', 'The number of jobs enqueued');
//jobs come in
$up_down->add(2);
//job completed
$up_down->add(-1);
//more jobs come in
$up_down->add(2);

$meterProvider->forceFlush();
```

Synchronous metrics are exported when `forceFlush()` and/or `shutdown()` are
called on the meter provider.

### Asynchronous meters

Async meters are `observable`, eg `ObservableGauge`. When registering an
observable/async meter, you provide one or more callback functions. The callback
functions will be called by a periodic exporting metric reader, for example
based on an event-loop timer. The callback(s) are responsible for returning the
latest data for the meter.

In this example, the callbacks are executed when `$reader->collect()` is
executed:

```php
$queue = [
    'job1',
    'job2',
    'job3',
];
$meterProvider
    ->getMeter('my_gauge')
    ->createObservableGauge('queued', 'jobs', 'The number of jobs enqueued')
    ->observe(static function (ObserverInterface $observer) use ($queue): void {
        $observer->observe(count($queue));
    });
$reader->collect();
```

### Readers

Currently we only have an `ExportingReader`, which is an implementation of the
[periodic exporting metric reader](/docs/specs/otel/metrics/sdk/#periodic-exporting-metricreader).
When its `collect()` method is called, all associated asynchronous meters are
observed, and metrics pushed to the exporter.

## Logging

As logging is a mature and well-established function, the
[OpenTelemetry approach](/docs/concepts/signals/logs/) is a little different for
this signal.

The OpenTelemetry logger is not designed to be used directly, but rather to be
integrated into existing logging libraries as a handler. In this way, you can
choose to have some or all of your application logs sent to an
OpenTelemetry-compatible service such as the [collector](/docs/collector/).

### Setup

You get a logger from a `LoggerProvider`. Log records get emitted via an
`EventLogger`:

```php
<?php
$loggerProvider = new LoggerProvider(
    new SimpleLogsProcessor(
        new ConsoleExporter()
    )
);
$logger = $loggerProvider->getLogger('demo', '1.0', 'http://schema.url', [/*attributes*/]);
$eventLogger = new EventLogger($logger, 'my-domain');
```

Once configured, a `LogRecord` can be created and sent via the event logger's
`logEvent`method:

```php
$record = (new LogRecord('hello world'))
    ->setSeverityText('INFO')
    ->setAttributes([/*attributes*/]);

$eventLogger->logEvent('foo', $record);
```

## Integrations for 3rd-party logging libraries

### Monolog

You can use the
[monolog handler](https://packagist.org/packages/open-telemetry/opentelemetry-logger-monolog)
to send monolog logs to an OpenTelemetry-capable receiver:

```shell
composer require open-telemetry/opentelemetry-logger-monolog
```

```php
$loggerProvider = new LoggerProvider(/*params*/);

$handler = new \OpenTelemetry\Contrib\Logs\Monolog\Handler(
    $loggerProvider,
    \Psr\Log\LogLevel::ERROR,
);
$logger = new \Monolog\Logger('example', [$handler]);

$logger->info('hello, world');
$logger->error('oh no', [
    'foo' => 'bar',
    'exception' => new \Exception('something went wrong'),
]);

$loggerProvider->shutdown();
```
