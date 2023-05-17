---
title: Metrics
weight: 20
---

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

## Setup

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
observable/async meter, you provide one ore more callback functions. The
callback functions will be called by a periodic exporting metric reader, for
example based on an event-loop timer. The callback(s) are responsible for
returning the latest data for the meter.

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

## Readers

Currently we only have an `ExportingReader`, which is an implementation of the
[periodic exporting metric reader](/docs/specs/otel/metrics/sdk/#periodic-exporting-metricreader).
When its `collect()` method is called, all associated asynchronous meters are
observed, and metrics pushed to the exporter.
