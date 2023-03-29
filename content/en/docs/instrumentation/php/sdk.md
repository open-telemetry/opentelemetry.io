---
title: SDK
weight: 8
---

The OpenTelemetry SDK provides a working implementation of the API.

## Builder

You can use the SDK builder as a convenience over the methods introduced in [getting started](getting-started):

```php
<?php

use OpenTelemetry\API\Trace\Propagation\TraceContextPropagator;
use OpenTelemetry\SDK\Sdk;
use OpenTelemetry\SDK\Trace\Sampler\AlwaysOnSampler;
use OpenTelemetry\SDK\Trace\Sampler\ParentBased;
use OpenTelemetry\SDK\Trace\TracerProvider;

$spanExporter = new InMemoryExporter(); //mock exporter for demonstration purposes
$resource = ResourceInfoFactory::defaultResource();

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
```

## Autoloading

If all configuration comes from environment variables (or `php.ini`), you can use SDK
autoloading to automatically configure and globally register an SDK.
The only requirement for this is that you set `OTEL_PHP_AUTOLOAD_ENABLED=true`, and
any required configuration as set out in [sdk-configuration](/docs/concepts/sdk-configuration/).

For example:

```shell
export OTEL_PHP_AUTOLOAD_ENABLED=true \
       OTEL_EXPORTER_OTLP_PROTOCOL=grpc \
       OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317
php example.php
```

```php
<?php
require 'vendor/autoload.php'; //sdk autoloading happens as part of composer initialization

$tracer = OpenTelemetry\API\Common\Instrumentation\Globals::tracerProvider()->getTracer('name', 'version', 'schema.url', [/*attributes*/]);
$meter = OpenTelemetry\API\Common\Instrumentation\Globals::meterProvider()->getTracer('name', 'version', 'schema.url', [/*attributes*/]);
```

## Configuration

The PHP SDK supports most of the [available configurations](/docs/concepts/sdk-configuration/).

There are also a number of PHP-specific configurations:

| Name                                | Default value | Values                                                                | Example        | Description                                         |
|-------------------------------------|---------------|-----------------------------------------------------------------------|----------------|-----------------------------------------------------|
| OTEL_PHP_TRACES_PROCESSOR           | batch         | batch, simple                                                         | simple         | Span processor selection                            |
| OTEL_PHP_DETECTORS                  | all           | env, host, os, process, process_runtime, sdk, sdk_provided, container | env,os,process | Resource detector selection                         |
| OTEL_PHP_AUTOLOAD_ENABLED           | false         | true, false                                                           | true           | Enable/disable SDK autoloading                      |
| OTEL_PHP_DISABLED_INSTRUMENTATIONS  | []            | Instrumentation name(s)                                               | psr15,psr18    | Disable one or more installed auto-instrumentations |

Configurations can be provided as environment variables, or via `php.ini` (or a file included by `php.ini`)
