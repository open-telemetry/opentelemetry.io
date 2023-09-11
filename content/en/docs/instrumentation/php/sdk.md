---
title: SDK
weight: 100
---

The OpenTelemetry SDK provides a working implementation of the API, and can be
set up and configured in a number of ways.

## Manual setup

Setting up an SDK manually gives you the most control over the SDK's
configuration:

```php
<?php
$exporter = new InMemoryExporter();
$meterProvider = new NoopMeterProvider();
$tracerProvider =  new TracerProvider(
    new BatchSpanProcessor(
        $exporter,
        ClockFactory::getDefault(),
        2048, //max queue size
        5000, //export timeout
        1024, //max batch size
        true, //auto flush
        $meterProvider
    )
);
```

## SDK Builder

The SDK builder provides a convenient interface to configure parts of the SDK.
However, it doesn't support all of the features that manual setup does.

```php
<?php

$spanExporter = new InMemoryExporter(); //mock exporter for demonstration purposes

$meterProvider = MeterProvider::builder()
    ->addReader(
        new ExportingReader(new MetricExporter((new StreamTransportFactory())->create(STDOUT, 'application/x-ndjson'), /*Temporality::CUMULATIVE*/))
    )
    ->build();

$tracerProvider = TracerProvider::builder()
    ->addSpanProcessor(
        (new BatchSpanProcessorBuilder($spanExporter))
            ->setMeterProvider($meterProvider)
            ->build()
    )
    ->build();

$loggerProvider = LoggerProvider::builder()
    ->addLogRecordProcessor(
        new SimpleLogsProcessor(
            (new ConsoleExporterFactory())->create()
        )
    )
    ->setResource(ResourceInfo::create(Attributes::create(['foo' => 'bar'])))
    ->build();

Sdk::builder()
    ->setTracerProvider($tracerProvider)
    ->setLoggerProvider($loggerProvider)
    ->setMeterProvider($meterProvider)
    ->setPropagator(TraceContextPropagator::getInstance())
    ->setAutoShutdown(true)
    ->buildAndRegisterGlobal();
```

## Autoloading

If all configuration comes from environment variables (or `php.ini`), you can
use SDK autoloading to automatically configure and globally register an SDK. The
only requirement for this is that you set `OTEL_PHP_AUTOLOAD_ENABLED=true`, and
provide any required/non-standard configuration as set out in
[sdk-configuration](/docs/concepts/sdk-configuration/).

For example:

```shell
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_EXPORTER_OTLP_PROTOCOL=grpc \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317 \
php example.php
```

```php
<?php
require 'vendor/autoload.php'; //sdk autoloading happens as part of composer initialization

$tracer = OpenTelemetry\API\Common\Instrumentation\Globals::tracerProvider()->getTracer('name', 'version', 'schema.url', [/*attributes*/]);
$meter = OpenTelemetry\API\Common\Instrumentation\Globals::meterProvider()->getTracer('name', 'version', 'schema.url', [/*attributes*/]);
```

SDK autoloading happens as part of the composer autoloader.

{{% alert title="Important" color="warning" %}}The batch span and log processors
emit metrics about their internal state, so ensure that you have a correctly
configured metrics exporter. Alternatively, you can disable metrics by setting
`OTEL_METRICS_EXPORTER=none`{{% /alert %}}

## Configuration

The PHP SDK supports most of the
[available configurations](/docs/concepts/sdk-configuration/). Our conformance
to the specification is listed in the
[spec compliance matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

There are also a number of PHP-specific configurations:

| Name                                 | Default value | Values                                                                                | Example          | Description                                         |
| ------------------------------------ | ------------- | ------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------- |
| `OTEL_PHP_TRACES_PROCESSOR`          | `batch`       | `batch`, simple                                                                       | `simple`         | Span processor selection                            |
| `OTEL_PHP_DETECTORS`                 | `all`         | `env`, `host`, `os`, `process`, `process_runtime`, `sdk`, `sdk_provided`, `container` | `env,os,process` | Resource detector selection                         |
| `OTEL_PHP_AUTOLOAD_ENABLED`          | `false`       | `true`, `false`                                                                       | `true`           | Enable/disable SDK autoloading                      |
| `OTEL_PHP_DISABLED_INSTRUMENTATIONS` | `[]`          | Instrumentation name(s)                                                               | `psr15,psr18`    | Disable one or more installed auto-instrumentations |

Configurations can be provided as environment variables, or via `php.ini` (or a
file included by `php.ini`)
