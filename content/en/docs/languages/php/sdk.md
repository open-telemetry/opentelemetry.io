---
title: SDK
weight: 100
cSpell:ignore: healthcheck
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
        Clock::getDefault(),
        2048, //max queue size
        5000, //scheduled delay millis
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

The SDK can be automatically configured and globally registered as part of
composer autoloading. The only requirement for this is that you set
`OTEL_PHP_AUTOLOAD_ENABLED=true`. The configuration can be provided in different
ways:

### Environment configuration

Environment variables (or the corresponding `php.ini` setting) can provide any
required/non-standard configuration as set out in
[SDK configuration](/docs/languages/sdk-configuration/).

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

$tracer = OpenTelemetry\API\Globals::tracerProvider()->getTracer('name', 'version', 'schema.url', [/*attributes*/]);
$meter = OpenTelemetry\API\Globals::meterProvider()->getMeter('name', 'version', 'schema.url', [/*attributes*/]);
```

### Declarative configuration

PHP supports OpenTelemetry's experimental
[Declarative Configuration](/docs/specs/otel/configuration/#declarative-configuration),
where the SDK can be configured through a YAML file.

To enable this, set `OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/config.yaml` where
`config.yaml` is a file which conforms to the declarative configuration schema,
for example:

`config.yaml`:

```yaml
file_format: '0.4'
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/traces
resource:
  attributes:
    - name: service.name
      value: ${OTEL_SERVICE_NAME}
    - name: service.namespace
      value: my_service_namespace
```

```shell
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/config.yaml
php example.php
```

The existence of `OTEL_EXPERIMENTAL_CONFIG_FILE` will cause the autoloader to
attempt to configure with the provided config file, and other environment
variables will be ignored.

### Excluded URLs

You can disable SDK autoloading if the request URL matches a regular expression.
Matching an excluded URL prevents any telemetry from being generated or
exported. You can use this feature in a shared-nothing PHP runtime like Apache
or NGINX, for requests such as health checks.

For example, the following configuration turns off telemetry for requests such
as `https://site/client/123/info` and `https://site/xyz/healthcheck`:

```shell
OTEL_PHP_EXCLUDED_URLS="client/.*/info,healthcheck"
```

## Configuration

The PHP SDK supports most of the available
[configuration options](/docs/languages/sdk-configuration/). For conformance
details, see the
[compliance matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

There are also a number of PHP-specific configurations:

| Name                                   | Default value | Values                                                                                | Example                      | Description                                                                                  |
| -------------------------------------- | ------------- | ------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| `OTEL_PHP_TRACES_PROCESSOR`            | `batch`       | `batch`, `simple`                                                                     | `simple`                     | Span processor selection                                                                     |
| `OTEL_PHP_DETECTORS`                   | `all`         | `env`, `host`, `os`, `process`, `process_runtime`, `sdk`, `sdk_provided`, `container` | `env,os,process`             | Resource detector selection                                                                  |
| `OTEL_PHP_AUTOLOAD_ENABLED`            | `false`       | `true`, `false`                                                                       | `true`                       | Enable/disable SDK autoloading                                                               |
| `OTEL_PHP_LOG_DESTINATION`             | `default`     | `error_log`, `stderr`, `stdout`, `psr3`, `none`                                       | `stderr`                     | Where internal errors and warnings will be sent                                              |
| `OTEL_PHP_INTERNAL_METRICS_ENABLED`    | `false`       | `true`, `false`                                                                       | `true`                       | Whether the SDK should emit metrics about its internal state (for example, batch processors) |
| `OTEL_PHP_DISABLED_INSTRUMENTATIONS`   | `[]`          | Instrumentation names, or `all`                                                       | `psr15,psr18`                | Disable one or more installed auto-instrumentations                                          |
| `OTEL_PHP_EXCLUDED_URLS`               | ``            | Comma-delimited regular expression patterns                                           | `client/.*/info,healthcheck` | Do not load the SDK if request URL matches one of the supplied regular expressions           |
| `OTEL_PHP_DEBUG_SCOPES_DISABLED`       | `false`       | `true`, `false`                                                                       | `true`                       | Turn on or off scope detachment debugging.                                                   |
| `OTEL_PHP_EXPERIMENTAL_AUTO_ROOT_SPAN` | `false`       | `true`, `false`                                                                       | `true`                       | Start a root span during composer autoloading                                                |

Configurations can be provided as environment variables, or via `php.ini` (or a
file included by `php.ini`)

{{% alert title="Boolean values in php.ini" %}} Boolean values in `php.ini`
should be protected by double-quoting them, for example `"true"` or `"false"`,
so that PHP doesn't convert them to numbers {{% /alert %}}

```ini
OTEL_PHP_AUTOLOAD_ENABLED="true"
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317
```
