---
title: Automatic Instrumentation
linkTitle: Automatic
weight: 2
---

Automatic instrumentation with PHP requires at least PHP 8.0, and
[the opentelemetry PHP extension](https://github.com/open-telemetry/opentelemetry-php-instrumentation).
The extension allows developers code to hook into classes and methods, and
execute userland code before and after.

## Example

```php
<?php
OpenTelemetry\Instrumentation\hook(
    'class': DemoClass::class,
    'function': 'run',
    'pre': static function (DemoClass $demo, array $params, string $class, string $function, ?string $filename, ?int $lineno) use ($tracer) {
        static $instrumentation;
        $instrumentation ??= new CachedInstrumentation('example');
        $instrumentation->tracer()->spanBuilder($class)
            ->startSpan()
            ->activate();
    },
    'post': static function (DemoClass $demo, array $params, $returnValue, ?Throwable $exception) use ($tracer) {
        $scope = Context::storage()->scope();
        $scope->detach();
        $span = Span::fromContext($scope->context());
        if ($exception) {
            $span->recordException($exception);
            $span->setStatus(StatusCode::STATUS_ERROR);
        }
        $span->end();
    }
);

$demo = new DemoClass();
$demo->run();
```

Here, we provide `pre` and `post` functions, which are executed before and after
`DemoClass::run`. The `pre` function starts and activates a span, and the `post`
function ends it.

## Setup

1.  Install the extension via [pickle](https://github.com/FriendsOfPHP/pickle)
    or
    [php-extension-installer](https://github.com/mlocati/docker-php-extension-installer)
    (docker specific):

    - **pickle** can be used to install extensions that are available via
      http://pecl.php.net, however that's not the case for
      opentelemetry-php-instrumentation yet, so the only way for it is to
      install directly from source code. The following command line shows you
      how to do that using a specific version of the extension (1.0.0beta2 in
      this case):

      Installing from source requires proper development environment and few
      dependencies:

      {{< ot-tabs "Linux (apt)" "macOS (homebrew)">}}

      {{< ot-tab lang="shell">}} sudo apt-get install gcc make autoconf
      {{< /ot-tab >}}

      {{< ot-tab lang="shell">}} brew install gcc make autoconf {{< /ot-tab >}}

      {{< /ot-tabs >}}

      With your environment setup you can install the extension:

      ```sh
      php pickle.phar install --source https://github.com/open-telemetry/opentelemetry-php-instrumentation.git#1.0.0beta2
      ```

      Add the extension to your `php.ini` file:

      ```ini
      [Otel instrumentation]
      extension=otel_instrumentation.so
      ```

    - **php-extension-installer**
      ```sh
      install-php-extensions open-telemetry/opentelemetry-php-instrumentation@main
      ```

2.  Verify that the extension is installed and enabled:

    ```sh
    php -m | grep  otel_instrumentation
    ```

## Zero-code configuration for automatic instrumentation

When used in conjunction with the OpenTelemetry SDK, you can use environment
variables or `php.ini` to configure auto-instrumentation:

```sh
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=otlp \
OTEL_EXPORTER_OTLP_PROTOCOL=grpc \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317 \
OTEL_PROPAGATORS=baggage,tracecontext \
php myapp.php
```

## Manual setup for automatic instrumentation

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

//instrumentation libraries can access the configured providers (or a no-op implementation) via `Globals`
$tracer = Globals::tracerProvider()->getTracer('example');
//or, via CachedInstrumentation
$instrumentation = new CachedInstrumentation('example');
$tracerProvider = $instrumentation->tracer();
```

## Supported libraries and frameworks

Automatic Instrumentation comes with a number of instrumentation libraries for
commonly used PHP libraries. For the full list, see
[instrumentation libraries on packagist](https://packagist.org/search/?query=open-telemetry&tags=instrumentation).

## Next steps

After you have automatic instrumentation configured for your app or service, you
might want to add [manual instrumentation](../manual) to collect custom
telemetry data.
