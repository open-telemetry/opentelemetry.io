---
title: Quote Service
linkTitle: Quote
aliases: [quoteservice]
cSpell:ignore: getquote
---

This service is responsible for calculating shipping costs, based on the number
of items to be shipped. The quote service is called from Shipping Service via
HTTP.

The Quote Service is implemented using the Slim framework and php-di for
managing the Dependency Injection.

The PHP instrumentation may vary when using a different framework.

[Quote service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/quote/)

## Traces

### Initializing Tracing

In this demo, the OpenTelemetry SDK has been automatically created as part of
SDK autoloading, which happens as part of composer autoloading.

This is enabled by setting the environment variable
`OTEL_PHP_AUTOLOAD_ENABLED=true`.

```php
require __DIR__ . '/../vendor/autoload.php';
```

There are multiple ways to create or obtain a `Tracer`, in this example we
obtain one from the global tracer provider which was initialized above, as part
of SDK autoloading:

```php
$tracer = Globals::tracerProvider()->getTracer('manual-instrumentation');
```

### Manually creating spans

Creating a span manually can be done via a `Tracer`. The span will be default be
a child of the active span in the current execution context:

```php
$span = Globals::tracerProvider()
    ->getTracer('manual-instrumentation')
    ->spanBuilder('calculate-quote')
    ->setSpanKind(SpanKind::KIND_INTERNAL)
    ->startSpan();
/* calculate quote */
$span->end();
```

### Add span attributes

You can obtain the current span using `OpenTelemetry\API\Trace\Span`.

```php
$span = Span::getCurrent();
```

Adding attributes to a span is accomplished using `setAttribute` on the span
object. In the `calculateQuote` function 2 attributes are added to the
`childSpan`.

```php
$childSpan->setAttribute('app.quote.items.count', $numberOfItems);
$childSpan->setAttribute('app.quote.cost.total', $quote);
```

### Add span events

Adding span events is accomplished using `addEvent` on the span object. In the
`getquote` route span events are added. Some events have additional attributes,
others do not.

Adding a span event without attributes:

```php
$span->addEvent('Received get quote request, processing it');
```

Adding a span event with additional attributes:

```php
$span->addEvent('Quote processed, response sent back', [
    'app.quote.cost.total' => $payload
]);
```

## Metrics

In this demo, metrics are emitted by the batch trace and logs processors. The
metrics describe the internal state of the processor, such as number of exported
spans or logs, the queue limit, and queue usage.

You can enable metrics by setting the environment variable
`OTEL_PHP_INTERNAL_METRICS_ENABLED` to `true`.

A manual metric is also emitted, which counts the number of quotes generated,
including an attribute for the number of items.

A counter is created from the globally configured Meter Provider, and is
incremented each time a quote is generated:

```php
static $counter;
$counter ??= Globals::meterProvider()
    ->getMeter('quotes')
    ->createCounter('quotes', 'quotes', 'number of quotes calculated');
$counter->add(1, ['number_of_items' => $numberOfItems]);
```

Metrics accumulate and are exported periodically based on the value configured
in `OTEL_METRIC_EXPORT_INTERVAL`.

## Logs

The quote service emits a log message after a quote is calculated. The Monolog
logging package is configured with a
[Logs Bridge](/docs/concepts/signals/logs/#log-appender--bridge) which converts
Monolog logs into the OpenTelemetry format. Logs sent to this logger will be
exported via the globally configured OpenTelemetry logger.
