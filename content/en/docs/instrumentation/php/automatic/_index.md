---
title: Automatic Instrumentation
linkTitle: Automatic
aliases:
- /docs/php/automatic_instrumentation
- /docs/instrumentation/php/automatic_instrumentation
  weight: 3
---

Automatic instrumentation with PHP requires at least PHP 8.0, and [an extension](https://github.com/open-telemetry/opentelemetry-php-instrumentation).
The extension allows developers code to hook into classes and methods, and execute userland code before and after.

## Setup

1. Install the extension via pickle or [php-extension-installer](https://github.com/mlocati/docker-php-extension-installer):
   ```console
   $ install-php-extensions open-telemetry/opentelemetry-php-instrumentation@main
   ```
2. Verify that the extension is installed and enabled:
   ```console
   $ php -m | grep  otel_instrumentation
   ```

## Zero-code auto-instrumentation

When used in conjunction with the OpenTelemetry SDK, you can use environment variables or php.ini to configure auto-instrumentation:

```sh
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=otlp \
OTEL_EXPORTER_OTLP_PROTOCOL=grpc \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317 \
OTEL_PROPAGATORS=baggage,tracecontext \
php myapp.php
```

## Manual setup for auto-instrumentation

```php
<?php
OpenTelemetry\API\Common\Instrumentation\Globals::registerInitializer(function (Configurator $configurator) {
    $propagator = TextMapPropagator::getInstance();
    $spanProcessor = new BatchSpanProcessor(/*params*/);
    $tracerProvider = (new TracerProviderBuilder())
        ->addSpanProcessor($spanProcessor)
        ->setSampler(new ParentBased(new AlwaysOnSampler());)
        ->build();

    ShutdownHandler::register([$tracerProvider, 'shutdown']);

    return $configurator
        ->withTracerProvider($tracerProvider)
        ->withPropagator($propagator);
});

//auto-instrumentation packages can now access the configured providers (or a no-op implementation) via `Globals` 
$tracerProvider = Globals::tracerProvider();
```

## Supported libraries, frameworks, application services, and JVMs

Auto-instrumentation has support for a number of existing PHP libraries.
For the full list, see [auto-instrumentation packages](https://packagist.org/search/?query=open-telemetry&tags=instrumentation).

## Next steps

After you have automatic instrumentation configured for your app or service, you
might want to add [manual
instrumentation](../manual) to collect custom telemetry data.
