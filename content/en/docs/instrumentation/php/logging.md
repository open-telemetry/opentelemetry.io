---
title: Logging
weight: 10
---

## Introduction

As logging is a mature and well-established function, the
[OpenTelemetry approach](/docs/concepts/signals/logs/)
is a little different for this signal.

The OpenTelemetry logger is not designed to be used directly, but rather to be
integrated into existing logging libraries as a handler. In this way you can
choose to have some or all of your application logs sent to an
OpenTelemetry-compatible service such as the [collector](/docs/collector/).

## Setup

Loggers must be obtained from a `LoggerProvider`, and log records must be
emitted via an `EventLogger`:

```php
<?php
$loggerProvider = new LoggerProvider(
    new SimpleLogsProcessor(
        new ConsoleExporter()
    )
);
$logger = $loggerProvider->getLogger('demo', '1.0', 'http://schema.url', true, [/*attributes*/]);
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

## Examples

The
[monolog-otel-integration example](https://github.com/open-telemetry/opentelemetry-php/blob/main/examples/logs/features/monolog-otel-integration.php)
demonstrates using the popular Monolog logger to send some logs to a stream (in
their usual format), as well as sending some logs to an OpenTelemetry collector.
