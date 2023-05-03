---
title: Logging
weight: 10
---

As logging is a mature and well-established function, the
[OpenTelemetry approach](/docs/concepts/signals/logs/) is a little different for
this signal.

The OpenTelemetry logger is not designed to be used directly, but rather to be
integrated into existing logging libraries as a handler. In this way, you can
choose to have some or all of your application logs sent to an
OpenTelemetry-compatible service such as the [collector](/docs/collector/).

## Setup

You get a logger from a `LoggerProvider`. Log records get emitted via an
`EventLogger`:

```php
<?php
$loggerProvider = new LoggerProvider(
    new SimpleLogsProcessor(
        new ConsoleExporter()
    )
);
$logger = $loggerProvider->getLogger('demo', '1.0', 'http://schema.url', [/*attributes*/]);
$eventLogger = new EventLogger($logger, 'my-domain');
```

Once configured, a `LogRecord` can be created and sent via the event logger's
`logEvent`method:

```php
$record = (new LogRecord('hello world'))
    ->setSeverityText('INFO')
    ->setAttributes([/*attributes*/]);

$eventLogger->logEvent('foo', $record);
```

## Integrations for 3rd-party logging libraries

### Monolog

We provide a
[monolog handler](https://packagist.org/packages/open-telemetry/opentelemetry-logger-monolog)
which can be used to send monolog logs to an OpenTelemetry-capable receiver:

```shell
composer require open-telemetry/opentelemetry-logger-monolog
```

```php
$loggerProvider = new LoggerProvider(/*params*/);

$handler = new \OpenTelemetry\Contrib\Logs\Monolog\Handler(
    $loggerProvider,
    \Psr\Log\LogLevel::ERROR,
);
$logger = new \Monolog\Logger('example', [$handler]);

$logger->info('hello, world');
$logger->error('oh no', [
    'foo' => 'bar',
    'exception' => new \Exception('something went wrong'),
]);

$loggerProvider->shutdown();
```
