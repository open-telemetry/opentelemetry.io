---
title: Manual Instrumentation
linkTitle: Manual
weight: 30
description: Manual instrumentation for OpenTelemetry PHP
spelling: cSpell:ignore myapp autoload guzzlehttp
---

{{% docs/instrumentation/manual-intro %}}

## Installation

The following shows how to install, initialize, and run an application
instrumented with OpenTelemetry. Telemetry data will be displayed in the
console.

To use the OpenTelemetry SDK for PHP you need packages that satisfy the
dependencies for `psr/http-client-implementation` and
`psr/http-factory-implementation`. Here we will use Guzzle, which provides both:

```sh
composer require guzzlehttp/guzzle
```

Now you can install the OpenTelemetry SDK, and OTLP exporter:

```sh
composer require \
  open-telemetry/sdk \
  open-telemetry/exporter-otlp
```

## Setup

The first step is to get a handle to an instance of the `OpenTelemetry`
interface.

If you are an application developer, you need to configure an instance of the
`OpenTelemetry SDK` as early as possible in your application. Here we will use
the `Sdk::builder()` method, and we will globally register the providers.

You can build the providers by using the `TracerProvider::builder()`,
`LoggerProvider::builder()`, and `MeterProvider::builder()` methods. It is also
recommended to define a `Resource` instance as a representation of the entity
producing the telemetry; in particular the `service.name` attribute.

### Example

```php
<?php

use OpenTelemetry\API\Common\Instrumentation\Globals;
use OpenTelemetry\API\Logs\EventLogger;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\API\Trace\Propagation\TraceContextPropagator;
use OpenTelemetry\Contrib\Otlp\LogsExporter;
use OpenTelemetry\Contrib\Otlp\MetricExporter;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use OpenTelemetry\SDK\Common\Export\Stream\StreamTransportFactory;
use OpenTelemetry\SDK\Logs\LoggerProvider;
use OpenTelemetry\SDK\Logs\Processor\SimpleLogsProcessor;
use OpenTelemetry\SDK\Metrics\MeterProvider;
use OpenTelemetry\SDK\Metrics\MetricReader\ExportingReader;
use OpenTelemetry\SDK\Resource\ResourceInfo;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;
use OpenTelemetry\SDK\Sdk;
use OpenTelemetry\SDK\Trace\Sampler\AlwaysOnSampler;
use OpenTelemetry\SDK\Trace\Sampler\ParentBased;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;
use OpenTelemetry\SemConv\ResourceAttributes;

require 'vendor/autoload.php';

$resource = ResourceInfoFactory::emptyResource()->merge(ResourceInfo::create(Attributes::create([
    ResourceAttributes::SERVICE_NAMESPACE => 'demo',
    ResourceAttributes::SERVICE_NAME => 'test-application',
    ResourceAttributes::SERVICE_VERSION => '0.1',
    ResourceAttributes::DEPLOYMENT_ENVIRONMENT => 'development',
])));
$spanExporter = new SpanExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$logExporter = new LogsExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$reader = new ExportingReader(
    new MetricExporter(
        (new StreamTransportFactory())->create('php://stdout', 'application/json')
    )
);

$meterProvider = MeterProvider::builder()
    ->setResource($resource)
    ->addReader($reader)
    ->build();

$tracerProvider = TracerProvider::builder()
    ->addSpanProcessor(
        new SimpleSpanProcessor($spanExporter)
    )
    ->setResource($resource)
    ->setSampler(new ParentBased(new AlwaysOnSampler()))
    ->build();

$loggerProvider = LoggerProvider::builder()
    ->setResource($resource)
    ->addLogRecordProcessor(
        new SimpleLogsProcessor($logExporter)
    )
    ->build();

Sdk::builder()
    ->setTracerProvider($tracerProvider)
    ->setMeterProvider($meterProvider)
    ->setLoggerProvider($loggerProvider)
    ->setPropagator(TraceContextPropagator::getInstance())
    ->setAutoShutdown(true)
    ->buildAndRegisterGlobal();
```

Throughout the following examples we will usually obtain the globally registered
providers via `OpenTelemetry\API\Globals`:

```php
$tracerProvider = \OpenTelemetry\API\Globals::tracerProvider();
$meterProvider = \OpenTelemetry\API\Globals::meterProvider();
$loggerProvider = \OpenTelemetry\API\Globals::loggerProvider();
```

#### Shutdown

It's important that each provider's `shutdown()` method is run when the PHP
process ends, to enable flushing of any enqueued telemetry. In the above
example, this has been taken care of with `setAutoShutdown(true)`.

You can also use the `ShutdownHandler` to register each provider's shutdown
function as part of PHP's shutdown process:

```php
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$tracerProvider, 'shutdown']);
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$meterProvider, 'shutdown']);
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$loggerProvider, 'shutdown']);
```

## Traces

### Acquiring a Tracer

To do [Tracing](/docs/concepts/signals/traces/) you'll need to acquire a
[`Tracer`](/docs/concepts/signals/traces/#tracer).

A `Tracer` is responsible for creating spans and interacting with the
[Context](../propagation/). A tracer is acquired from a `TracerProvider`,
specifying the name and other (optional) identifying information about the
[library instrumenting](/docs/concepts/instrumentation/libraries/) the
instrumented library or application to be monitored.

More information is available in the specification chapter
[Obtaining a Tracer](/docs/specs/otel/trace/api/#tracerprovider).

```php
$tracerProvider = Globals::tracerProvider();
$tracer = $tracerProvider->getTracer(
  'instrumentation-library-name', //name (required)
  '1.0.0', //version
  'http://example.com/my-schema', //schema url
  ['foo' => 'bar'] //attributes
);
```

Important: the parameters used when acquiring a tracer are purely
informational - these values will be emitted as part of the scope of any
telemetry emitted by that tracer. All `Tracer`s that are created by a single
`OpenTelemetry` instance will interoperate, regardless of differences in these
parameters.

### Create Spans

To create [Spans](/docs/concepts/signals/traces/#spans), you only need to
specify the name of the span. The start and end time of the span is
automatically set by the OpenTelemetry SDK.

```php
$span = $tracer->spanBuilder("my span")->startSpan();
//do some work
$span->end();
```

It's required to `end()` the span, otherwise it will not be sent.

### Create nested Spans

Most of the time, we want to correlate
[spans](/docs/concepts/signals/traces/#spans) for nested operations.
OpenTelemetry supports tracing within processes and across remote processes. For
more details on how to share context between remote processes, see
[Context Propagation](../propagation/).

For a method `parent` calling a method `child`, we can relate the spans by
making the parent span active before creating the child span:

```php

  $parent = $tracer->spanBuilder("parent")->startSpan();
  $scope = $parent->activate();
  try {
    $child = $tracer->spanBuilder("child")->startSpan();
    $child->end();
  } finally {
    $parent->end();
    $scope->detach();
  }
```

You _must_ `detach` the active scope if you have activated it.

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
span has not completed successfully - `SpanStatus::ERROR`.

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with
[setting span status](/docs/specs/otel/trace/api/#set-status).

The status can be set at any time before the span is finished:

```php
$span = $tracer->spanBuilder("my-span")->startSpan();
try {
  // do something that could fail
  throw new \Exception('uh-oh');
} catch (\Throwable $t) {
  $span->setStatus(\OpenTelemetry\API\Trace\StatusCode::STATUS_ERROR, "Something bad happened!");
  //This will capture things like the current stack trace in the span.
  $span->recordException($t, ['exception.escaped' => true]);
  throw $t;
} finally {
  $span->end();
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
{{< tabpane lang=php >}}
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
the `BatchSpanProcessor` batches them and sends them periodically.

```php
$tracerProvider = TracerProvider::builder()
  ->addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporterFactory()->create()))
  ->build();
```

### Transports

All exporters require a `Transport`, which is responsible for the sending of
telemetry data:

- `PsrTransport` - uses a PSR18 client to send data over HTTP
- `StreamTransport` - uses a stream to send data (eg to file or `stdout`)
- `GrpcTransport` - uses gRPC to send protobuf-encoded data

### Exporter

Span processors are initialized with an exporter which is responsible for
sending the telemetry data to a particular backend:

- `InMemory`: keeps the data in memory, useful for testing and debugging.
- `Console`: sends the data to a stream such as `stdout` or `stderr`
- `Zipkin`: prepares and sends telemetry data to a Zipkin backend via the Zipkin
  APIs.
- Logging Exporter: sends the telemetry data to a PSR-3 logger.
- OpenTelemetry Protocol Exporter: sends the data in OTLP format to the
  [OpenTelemetry Collector](/docs/collector/) or other OTLP receivers. The
  following formats are supported:
  - protobuf over HTTP
  - protobuf over gRPC
  - JSON over HTTP

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
<?php

use OpenTelemetry\Contrib\Otlp\ConsoleMetricExporterFactory;
use OpenTelemetry\SDK\Metrics\MeterProvider;
use OpenTelemetry\SDK\Metrics\MetricReader\ExportingReader;

require 'vendor/autoload.php';

$reader = new ExportingReader((new ConsoleMetricExporterFactory())->create());

$meterProvider = MeterProvider::builder()
    ->addReader($reader)
    ->build();
```

### Synchronous meters

A synchronous meter must be manually adjusted as data changes:

```php
$up_down = $meterProvider
    ->getMeter('demo_meter')
    ->createUpDownCounter('queued', 'jobs', 'The number of jobs enqueued');
//jobs come in
$up_down->add(5);
//job completed
$up_down->add(-1);
//more jobs come in
$up_down->add(2);

$meterProvider->forceFlush();
```

Synchronous metrics are exported when `forceFlush()` or `shutdown()` are called
on the meter provider.

<details>
<summary>View output</summary>

```json
{
  "resourceMetrics": [
    {
      "resource": {},
      "scopeMetrics": [
        {
          "scope": { "name": "demo_meter" },
          "metrics": [
            {
              "name": "queued",
              "description": "The number of jobs enqueued",
              "unit": "jobs",
              "sum": {
                "dataPoints": [
                  {
                    "startTimeUnixNano": "1687332126443709851",
                    "timeUnixNano": "1687332126445544432",
                    "asInt": "6"
                  }
                ],
                "aggregationTemporality": "AGGREGATION_TEMPORALITY_DELTA"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

### Asynchronous meters

Async meters are `observable`, eg `ObservableGauge`. When registering an
observable/async meter, you provide one or more callback functions. The callback
functions will be called by a
[periodic exporting metric reader](/docs/specs/otel/metrics/sdk/#periodic-exporting-metricreader)
whenever its `collect()` method is called, for example based on an event-loop
timer. The callback(s) are responsible for returning the current data for the
meter.

In this example, the callbacks are executed every time that `$reader->collect()`
is executed:

```php
$queue = [
    'job1',
    'job2',
    'job3',
];
$meterProvider
    ->getMeter('demo_meter')
    ->createObservableGauge('queued', 'jobs', 'The number of jobs enqueued')
    ->observe(static function (ObserverInterface $observer) use (&$queue): void {
        $observer->observe(count($queue));
    });
$reader->collect();
array_pop($queue);
$reader->collect();
```

<details>
<summary>View output</summary>

```json
{"resourceMetrics":[{"resource":{},"scopeMetrics":[{"scope":{"name":"demo_meter"},"metrics":[{"name":"queued","description":"The number of jobs enqueued","unit":"jobs","gauge":{"dataPoints":[{"startTimeUnixNano":"1687331630161510994","timeUnixNano":"1687331630162989144","asInt":"3"}]}}]}]}]}
{"resourceMetrics":[{"resource":{},"scopeMetrics":[{"scope":{"name":"demo_meter"},"metrics":[{"name":"queued","description":"The number of jobs enqueued","unit":"jobs","gauge":{"dataPoints":[{"startTimeUnixNano":"1687331630161510994","timeUnixNano":"1687331631164759171","asInt":"2"}]}}]}]}]}
```

</details>

## Logs

As logging is a mature and well-established function, the
[OpenTelemetry approach](/docs/concepts/signals/logs/) is a little different for
this signal.

The OpenTelemetry logger is not designed to be used directly, but rather to be
integrated into existing logging libraries. In this way, you can choose to have
some or all of your application logs sent to an OpenTelemetry-compatible service
such as the [collector](/docs/collector/).

### Setup

First, we create a `LoggerProvider`:

```php
<?php

use OpenTelemetry\API\Logs\EventLogger;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\Contrib\Otlp\LogsExporter;
use OpenTelemetry\SDK\Common\Export\Stream\StreamTransportFactory;
use OpenTelemetry\SDK\Logs\LoggerProvider;
use OpenTelemetry\SDK\Logs\Processor\SimpleLogsProcessor;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;

require 'vendor/autoload.php';

$exporter = new LogsExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$loggerProvider = LoggerProvider::builder()
    ->addLogRecordProcessor(new SimpleLogsProcessor($exporter))
    ->setResource(ResourceInfoFactory::emptyResource())
    ->build();
```

### Logging events

An `EventLogger` can use a `Logger` to emit log events:

```php
$logger = $loggerProvider->getLogger('demo', '1.0', 'http://schema.url', [/*attributes*/]);
$eventLogger = new EventLogger($logger, 'my-domain');
$record = (new LogRecord('hello world'))
    ->setSeverityText('INFO')
    ->setAttributes([/*attributes*/]);

$eventLogger->logEvent('foo', $record);
```

<details>
<summary>View sample output</summary>

```json
{
  "resourceLogs": [
    {
      "resource": {},
      "scopeLogs": [
        {
          "scope": {
            "name": "demo",
            "version": "1.0"
          },
          "logRecords": [
            {
              "observedTimeUnixNano": "1687496730010009088",
              "severityText": "INFO",
              "body": {
                "stringValue": "hello world"
              },
              "attributes": [
                {
                  "key": "event.name",
                  "value": {
                    "stringValue": "foo"
                  }
                },
                {
                  "key": "event.domain",
                  "value": {
                    "stringValue": "my-domain"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

### Integrations for 3rd-party logging libraries

#### Monolog

You can use the
[monolog handler](https://packagist.org/packages/open-telemetry/opentelemetry-logger-monolog)
to send monolog logs to an OpenTelemetry-capable receiver. First, install the
monolog library and a handler:

```shell
composer require \
  monolog/monolog \
  open-telemetry/opentelemetry-logger-monolog
```

Following on from the logging example above:

```php
$handler = new \OpenTelemetry\Contrib\Logs\Monolog\Handler(
    $loggerProvider,
    \Psr\Log\LogLevel::ERROR,
);
$monolog = new \Monolog\Logger('example', [$handler]);

$monolog->info('hello, world');
$monolog->error('oh no', [
    'foo' => 'bar',
    'exception' => new \Exception('something went wrong'),
]);
```

<details>
<summary>View sample output</summary>

```json
{
  "resourceLogs": [
    {
      "resource": {},
      "scopeLogs": [
        {
          "scope": {
            "name": "monolog"
          },
          "logRecords": [
            {
              "timeUnixNano": "1687496945597429000",
              "observedTimeUnixNano": "1687496945598242048",
              "severityNumber": "SEVERITY_NUMBER_ERROR",
              "severityText": "ERROR",
              "body": {
                "stringValue": "oh no"
              },
              "attributes": [
                {
                  "key": "channel",
                  "value": {
                    "stringValue": "example"
                  }
                },
                {
                  "key": "context",
                  "value": {
                    "arrayValue": {
                      "values": [
                        {
                          "stringValue": "bar"
                        },
                        {
                          "arrayValue": {
                            "values": [
                              {
                                "stringValue": "Exception"
                              },
                              {
                                "stringValue": "something went wrong"
                              },
                              {
                                "intValue": "0"
                              },
                              {
                                "stringValue": "/usr/src/myapp/logging.php:31"
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

## Error Handling

By default, OpenTelemetry will log errors and warnings via PHP's
[`error_log`](https://www.php.net/manual/en/function.error-log.php) function.
The verbosity can be controlled or disabled via the `OTEL_LOG_LEVEL` setting.

Messages sent to `error_log` will be at a level no higher than `E_USER_WARNING`,
to avoid breaking applications.

You can optionally configure OpenTelemetry to instead log via a PSR-3 logger:

```php
$logger = new \Example\Psr3Logger(LogLevel::INFO);
\OpenTelemetry\API\LoggerHolder::set($logger);
```

For more fine-grained control and special case handling, custom handlers and
filters can be applied to the logger (if the logger offers this ability).

## Next steps

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/php/exporters) to one or more
telemetry backends.
