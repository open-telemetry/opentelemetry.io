---
title: Getting Started
description: Get up and running with OpenTelemetry for PHP.
aliases: [/docs/instrumentation/php/getting_started]
---

In this page you'll learn how to export traces to the console.

First, install the OpenTelemetry SDK:

```console
$ composer require open-telemetry/opentelemetry
```

This example uses the `ConsoleSpanExporter`, which prints Spans to stdout. A
Span typically represents a single unit of work. A Trace is a grouping of Spans.

```php
<?php

declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';

use OpenTelemetry\SDK\Trace\SpanProcessor\ConsoleSpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

echo 'Starting ConsoleSpanExporter' . PHP_EOL;

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor(
        new ConsoleSpanExporter()
    )
);

$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');

$rootSpan = $tracer->spanBuilder('root')->startSpan();
$rootSpan->activate();

try {
    $span1 = $tracer->spanBuilder('foo')->startSpan();
    $span1->activate();
    try {
        $span2 = $tracer->spanBuilder('bar')->startSpan();
        echo 'OpenTelemetry welcomes PHP' . PHP_EOL;
    } finally {
        $span2->end();
    }
} finally {
    $span1->end();
}
$rootSpan->end();
```

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
