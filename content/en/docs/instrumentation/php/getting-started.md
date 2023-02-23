---
title: Getting Started
description: Get up and running with OpenTelemetry for PHP.
aliases: [/docs/instrumentation/php/getting_started]
weight: 1
---

## Setup

Before you get started make sure that you have php and
[composer](https://getcomposer.org/download/) available in your shell:

```sh
php -v
composer -v
```

In an empty directory create a minimal composer.json file in your directory:

```json
{
  "require": {}
}
```

## Export to Console

In your directory create a file called `GettingStarted.php` with the following
content:

```php
<?php

declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\SDK\Trace\SpanExporter\ConsoleSpanExporterFactory;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

echo 'Starting ConsoleSpanExporter' . PHP_EOL;

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor(
        (new ConsoleSpanExporterFactory())->create()
    )
);

$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');

$rootSpan = $tracer->spanBuilder('root')->startSpan();
$rootScope = $rootSpan->activate();

try {
    $span1 = $tracer->spanBuilder('foo')->startSpan();
    $scope = $span1->activate();
    try {
        $span2 = $tracer->spanBuilder('bar')->startSpan();
        echo 'OpenTelemetry welcomes PHP' . PHP_EOL;
    } finally {
        $span2->end();
    }
} finally {
    $span1->end();
    $scope->detach();
}
$rootSpan->end();
$rootScope->detach();
```

To use the OpenTelemetry SDK for PHP you need packages that satisfy the
dependencies for `php-http/async-client-implementation` and
`psr/http-factory-implementation`, for example the Guzzle 7 HTTP Adapter
satisfies both:

```sh
composer require "php-http/guzzle7-adapter"
```

Now you can install the OpenTelemetry SDK:

```sh
composer require open-telemetry/opentelemetry
```

The example uses the `ConsoleSpanExporter`, which prints Spans to stdout. A Span
typically represents a single unit of work. A Trace is a grouping of Spans.

Run the script:

```console
$ php GettingStarted.php
Starting ConsoleSpanExporter
OpenTelemetry welcomes PHP
...
```

You'll see output similar to the following, which shows 3 spans within a single
trace:

```json
{
    "name": "bar",
    "context": {
        "trace_id": "e7bc999fb17f453c6e6445802ba1e558",
        "span_id": "24afe9c453481636",
        "trace_state": null
    },
    "parent_span_id": "c63030cc93c48641",
    "kind": "KIND_INTERNAL",
    "start": 1635373538696880128,
    "end": 1635373538697000960,
    "attributes": [],
    "status": {
        "code": "Unset",
        "description": ""
    },
    "events": []
}
{
    "name": "foo",
    "context": {
        "trace_id": "e7bc999fb17f453c6e6445802ba1e558",
        "span_id": "c63030cc93c48641",
        "trace_state": null
    },
    "parent_span_id": "4e6396224842fc15",
    "kind": "KIND_INTERNAL",
    "start": 1635373538696482048,
    "end": 1635373538700564992,
    "attributes": [],
    "status": {
        "code": "Unset",
        "description": ""
    },
    "events": []
}
{
    "name": "root",
    "context": {
        "trace_id": "e7bc999fb17f453c6e6445802ba1e558",
        "span_id": "4e6396224842fc15",
        "trace_state": null
    },
    "parent_span_id": "",
    "kind": "KIND_INTERNAL",
    "start": 1635373538691308032,
    "end": 1635373538700800000,
    "attributes": [],
    "status": {
        "code": "Unset",
        "description": ""
    },
    "events": []
}
```

## Export to collector

The next step is to modify the code to send spans to the collector via OTLP
instead of the console.

Next, using the `GettingStarted.php` from earlier, replace the console exporter
with an OTLP exporter:

```php
<?php

declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\HttpFactory;
use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanExporter\ConsoleSpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

echo 'Starting OTLP/http Exporter' . PHP_EOL;

$transport = (new OtlpHttpTransportFactory())->create('http://collector:4318/v1/traces', 'application/x-protobuf');
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor(
        $exporter
    )
);

$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');

$rootSpan = $tracer->spanBuilder('root')->startSpan();
$rootSpan->activate();

try {
    $span1 = $tracer->spanBuilder('foo')->startSpan();
    $scope = $span1->activate();
    try {
        $span2 = $tracer->spanBuilder('bar')->startSpan();
        echo 'OpenTelemetry welcomes PHP' . PHP_EOL;
    } finally {
        $span2->end();
    }
} finally {
    $span1->end();
    $scope->detach();
}
$rootSpan->end();
$rootScope->detach();
```

Run the PHP application:

```console
$ php GettingStarted.php
Starting OtlpHttpExporter
OpenTelemetry welcomes PHP
```

Now, telemetry will be exported to the collector process.
