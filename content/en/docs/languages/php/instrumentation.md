---
title: Instrumentation
weight: 20
aliases: [manual]
description: Manual instrumentation for OpenTelemetry PHP
cSpell:ignore: guzzlehttp myapp
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro.md %}}

## Example app preparation {#example-app}

These instructions use a modified version of the example app from
[Getting Started](/docs/languages/php/getting-started/) to help you learn how to
instrument your PHP code.

If you want to instrument your own app or library, follow the instructions to
adapt the process to your own code.

### Dependencies {#example-app-dependencies}

In an empty directory, initialize a minimal `composer.json` file with the
following content:

```shell
composer init \
  --no-interaction \
  --require slim/slim:"^4" \
  --require slim/psr7:"^1" \
  --require monolog/monolog:"^3"
composer update
```

### Create and launch an HTTP Server

To highlight the difference between instrumenting a library and a standalone
app, split out the dice rolling into a library file, which then will be imported
as a dependency by the app file.

Create the library file named `dice.php` and add the following code to it:

```php
<?php
class Dice {

    private $tracer;

    function __construct() {
    }

    public function roll($rolls) {
        $result = [];
        for ($i = 0; $i < $rolls; $i++) {
            $result[] = $this->rollOnce();
        }
        return $result;
    }

    private function rollOnce() {
      $result = random_int(1, 6);
      return $result;
    }
}
```

Create the app file named `index.php` and add the following code to it:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Level;
use Monolog\Handler\StreamHandler;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');

$logger = new Logger('dice-server');
$logger->pushHandler(new StreamHandler('php://stdout', Level::INFO));

$app = AppFactory::create();

$dice = new Dice();

$app->get('/rolldice', function (Request $request, Response $response) use ($logger, $dice) {
    $params = $request->getQueryParams();
    if(isset($params['rolls'])) {
        $result = $dice->roll($params['rolls']);
        if (isset($params['player'])) {
          $logger->info("A player is rolling the dice.", ['player' => $params['player'], 'result' => $result]);
        } else {
          $logger->info("Anonymous player is rolling the dice.", ['result' => $result]);
        }
        $response->getBody()->write(json_encode($result));
    } else {
        $response->withStatus(400)->getBody()->write("Please enter a number of rolls");
    }
    return $response;
});

$app->run();
```

To ensure that it is working, run the application with the following command and
open <http://localhost:8080/rolldice?rolls=12> in your web browser.

```shell
php -S localhost:8080
```

## Instrumentation setup

### Dependencies

Install OpenTelemetry API packages:

```shell
composer require open-telemetry/api open-telemetry/sem-conv
```

### Initialize the SDK

{{% alert title="Note" %}} If you’re instrumenting a library, **skip this
step**. {{% /alert %}}

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

If you are an application developer, you need to configure an instance of the
`OpenTelemetry SDK` as early as possible in your application. Here we will use
the `Sdk::builder()` method, and we will globally register the providers.

You can build the providers by using the `TracerProvider::builder()`,
`LoggerProvider::builder()`, and `MeterProvider::builder()` methods.

In the case of the [example app](#example-app), create a file named
`instrumentation.php` with the following content:

```php
<?php

use OpenTelemetry\API\Globals;
use OpenTelemetry\API\Logs\EventLogger;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\API\Trace\Propagation\TraceContextPropagator;
use OpenTelemetry\Contrib\Otlp\LogsExporter;
use OpenTelemetry\Contrib\Otlp\MetricExporter;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use OpenTelemetry\SDK\Common\Export\Stream\StreamTransportFactory;
use OpenTelemetry\SDK\Logs\LoggerProvider;
use OpenTelemetry\SDK\Logs\Processor\SimpleLogRecordProcessor;
use OpenTelemetry\SDK\Metrics\MeterProvider;
use OpenTelemetry\SDK\Metrics\MetricReader\ExportingReader;
use OpenTelemetry\SDK\Resource\ResourceInfo;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;
use OpenTelemetry\SDK\Sdk;
use OpenTelemetry\SDK\Trace\Sampler\AlwaysOnSampler;
use OpenTelemetry\SDK\Trace\Sampler\ParentBased;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;
use OpenTelemetry\SemConv\Attributes\ServiceAttributes;
use OpenTelemetry\SemConv\Incubating\Attributes\DeploymentIncubatingAttributes;
use OpenTelemetry\SemConv\Incubating\Attributes\ServiceIncubatingAttributes;

require 'vendor/autoload.php';

$resource = ResourceInfoFactory::emptyResource()->merge(ResourceInfo::create(Attributes::create([
    ServiceIncubatingAttributes::SERVICE_NAMESPACE => 'demo',
    ServiceAttributes::SERVICE_NAME => 'test-application',
    ServiceAttributes::SERVICE_VERSION => '0.1',
    DeploymentIncubatingAttributes::DEPLOYMENT_ENVIRONMENT_NAME => 'development',
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
        new SimpleLogRecordProcessor($logExporter)
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

Include this code at the top of your application file `index.php`:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');
require('instrumentation.php');

// ...
```

For debugging and local development purposes, the example exports telemetry to
the console. After you have finished setting up manual instrumentation, you need
to configure an appropriate exporter to
[export the app's telemetry data](/docs/languages/php/exporters/) to one or more
telemetry backends.

The example also sets up the mandatory SDK default attribute `service.name`,
which holds the logical name of the service, and the optional, but highly
encouraged, attribute `service.version`, which holds the version of the service
API or implementation.

Alternative methods exist for setting up resource attributes. For more
information, see [Resources](/docs/languages/php/resources/).

#### Global Providers

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

### Initialize Tracing

{{% alert title="Note" %}} If you’re instrumenting a library, **skip this
step**. {{% /alert %}}

To enable [tracing](/docs/concepts/signals/traces/) in your app, you'll need to
have an initialized
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) that will let
you create a [`Tracer`](/docs/concepts/signals/traces/#tracer).

If a `TracerProvider` is not created, the OpenTelemetry APIs for tracing will
use a no-op implementation and fail to generate data.

If you followed the instructions to [initialize the SDK](#initialize-the-sdk)
above, you have a `TracerProvider` setup for you already. You can continue with
[acquiring a tracer](#acquiring-a-tracer).

### Acquiring a Tracer

Anywhere in your application where you write manual tracing code should call
`getTracer` to acquire a tracer. For example:

```php
$tracerProvider = Globals::tracerProvider();
$tracer = $tracerProvider->getTracer(
  'instrumentation-scope-name', //name (required)
  'instrumentation-scope-version', //version
  'http://example.com/my-schema', //schema url
  ['foo' => 'bar'] //attributes
);
```

The values of `instrumentation-scope-name` and `instrumentation-scope-version`
should uniquely identify the
[Instrumentation Scope](/docs/concepts/instrumentation-scope/), such as the
package, module or class name. While the name is required, the version is still
recommended despite being optional.

It's generally recommended to call `getTracer` in your app when you need it
rather than exporting the `tracer` instance to the rest of your app. This helps
avoid trickier application load issues when other required dependencies are
involved.

In the case of the [example app](#example-app), there are two places where a
tracer may be acquired with an appropriate Instrumentation Scope:

First, in the _application file_ `index.php`:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use OpenTelemetry\API\Globals;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');
require('instrumentation.php');

$tracerProvider = Globals::tracerProvider();
$tracer = $tracerProvider->getTracer(
  'dice-server',
  '0.1.0',
  'https://opentelemetry.io/schemas/1.24.0'
);

$logger = new Logger('dice-server');
$logger->pushHandler(new StreamHandler('php://stdout', Logger::INFO));

$app = AppFactory::create();

$dice = new Dice();

$app->get('/rolldice', function (Request $request, Response $response) use ($logger, $dice, $tracer) {
// ...
}
```

And second, in the _library file_ `dice.php`:

```php
<?php
use OpenTelemetry\API\Globals;
use OpenTelemetry\SemConv\TraceAttributes;

class Dice {

    private $tracer;

    function __construct() {
        $tracerProvider = Globals::tracerProvider();
        $this->tracer = $tracerProvider->getTracer(
          'dice-lib',
          '0.1.0',
          'https://opentelemetry.io/schemas/1.24.0'
        );
    }

    public function roll($rolls) {
        $result = [];
        for ($i = 0; $i < $rolls; $i++) {
            $result[] = $this->rollOnce();
        }
        return $result;
    }

    private function rollOnce() {
      $result = random_int(1, 6);
      return $result;
    }
}
```

### Create Spans

Now that you have [tracers](/docs/concepts/signals/traces/#tracer) initialized,
you can create [spans](/docs/concepts/signals/traces/#spans).

The code below illustrates how to create a span.

```php
<?php
public function roll($rolls) {
    $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
    $result = [];
    for ($i = 0; $i < $rolls; $i++) {
        $result[] = $this->rollOnce();
    }
    $span->end();
    return $result;
}
```

Note, that it's required to `end()` the span, otherwise it will not be exported.

If you followed the instructions using the [example app](#example-app) up to
this point, you can copy the code above in your library file `dice.php`. You
should now be able to see spans emitted from your app.

Start your app as follows, and then send it requests by visiting
<http://localhost:8080/rolldice?rolls=12> with your browser or `curl`.

```sh
php -S 8080 localhost
```

After a while, you should see the spans printed in the console by the
`SpanExporter`, something like this:

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          {
            "key": "service.namespace",
            "value": {
              "stringValue": "demo"
            }
          },
          {
            "key": "service.name",
            "value": {
              "stringValue": "test-application"
            }
          },
          {
            "key": "service.version",
            "value": {
              "stringValue": "0.1"
            }
          },
          {
            "key": "deployment.environment",
            "value": {
              "stringValue": "development"
            }
          }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "dice-lib",
            "version": "0.1.0"
          },
          "spans": [
            {
              "traceId": "007a1e7a89f21f98b600d288b7d65390",
              "spanId": "c32797fc72c252d2",
              "flags": 1,
              "name": "rollTheDice",
              "kind": 1,
              "startTimeUnixNano": "1706111239077485365",
              "endTimeUnixNano": "1706111239077735657",
              "status": {}
            }
          ],
          "schemaUrl": "https://opentelemetry.io/schemas/1.24.0"
        }
      ]
    }
  ]
}
```

### Create nested Spans

Nested [spans](/docs/concepts/signals/traces/#spans) let you track work that's
nested in nature. For example, the `rollOnce()` function below represents a
nested operation. The following sample creates a nested span that tracks
`rollOnce()`:

```php
private function rollOnce() {
    $parent = OpenTelemetry\API\Trace\Span::getCurrent();
    $scope = $parent->activate();
    try {
        $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
        $result = random_int(1, 6);
        $span->end();
    } finally {
        $scope->detach();
    }
    return $result;
}
```

You _must_ `detach` the active scope if you have activated it.

### Get the current span

In the example above, we retrieved the current span, using the following method:

```php
$span = OpenTelemetry\API\Trace\Span::getCurrent();
```

### Get a span from context

It can also be helpful to get the [span](/docs/concepts/signals/traces/#spans)
from a given context that isn't necessarily the active span.

```php
$span = OpenTelemetry\API\Trace\Span::fromContext($context);
```

### Span Attributes

[Attributes](/docs/concepts/signals/traces/#attributes) let you attach key/value
pairs to a [`Span`](/docs/concepts/signals/traces/#spans) so it carries more
information about the current operation that it's tracking.

```php
private function rollOnce() {
    $parent = OpenTelemetry\API\Trace\Span::getCurrent();
    $scope = $parent->activate();
    try {
        $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
        $result = random_int(1, 6);
        $span->setAttribute('dicelib.rolled', $result);
        $span->end();
    } finally {
        $scope->detach();
    }
    return $result;
}
```

#### Semantic Attributes

There are semantic conventions for spans representing operations in well-known
protocols like HTTP or database calls. Semantic conventions for these spans are
defined in the specification at
[Trace Semantic Conventions](/docs/specs/semconv/general/trace/). In the simple
example of this guide the source code attributes can be used.

First add the semantic conventions as a dependency to your application:

```shell
composer require open-telemetry/sem-conv
```

Add the following to the top of your file:

```php
use OpenTelemetry\SemConv\Attributes\CodeAttributes;
```

Finally, you can update your file to include semantic attributes:

```php
$span->setAttribute(CodeAttributes::CODE_FUNCTION_NAME, 'rollOnce');
$span->setAttribute(CodeAttributes::CODE_FILE_PATH, __FILE__);
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

{{% include "span-status-preamble.md" %}}

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

- `PsrTransport` - uses a PSR-18 client to send data over HTTP
- `StreamTransport` - uses a stream to send data (eg to file or `stdout`)
- `GrpcTransport` - uses gRPC to send protobuf-encoded data

### Exporter

See [Exporters](/docs/languages/php/exporters)

## Metrics

OpenTelemetry can be used to measure and record different types of metrics from
an application, which can then be
[pushed](/docs/specs/otel/metrics/sdk/#push-metric-exporter) to a metrics
service such as the OpenTelemetry Collector:

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

use OpenTelemetry\SDK\Metrics\MetricExporter\ConsoleMetricExporterFactory;
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
$reader = $meterProvider
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
use OpenTelemetry\SDK\Logs\Processor\SimpleLogRecordProcessor;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;

require 'vendor/autoload.php';

$exporter = new LogsExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$loggerProvider = LoggerProvider::builder()
    ->addLogRecordProcessor(new SimpleLogRecordProcessor($exporter))
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

### Integrations for third-party logging libraries

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

The `OTEL_PHP_LOG_DESTINATION` variable can be used to control log destination
or disable error logging completely. Valid values are `default`, `error_log`,
`stderr`, `stdout`, `psr3`, or `none`. `default` (or if the variable is not
set), will use `error_log` unless a PSR-3 logger is configured:

```php
$logger = new \Example\Psr3Logger(LogLevel::INFO);
\OpenTelemetry\API\LoggerHolder::set($logger);
```

For more fine-grained control and special case handling, custom handlers and
filters can be applied to the PSR-3 logger (if the logger offers this ability).

## Next steps

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/php/exporters) to one or more
telemetry backends.
