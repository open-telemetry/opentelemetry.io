---
title: Email Service
linkTitle: Email
aliases: [emailservice]
cSpell:ignore: sinatra
---

This service will send a confirmation email to the user when an order is placed.

[Email service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/email/)

## Initializing Tracing

You will need to require the core OpenTelemetry SDK and exporter Ruby gems, as
well as any gem that will be needed for auto-instrumentation libraries (ie:
Sinatra)

```ruby
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/sinatra"
```

The Ruby SDK uses OpenTelemetry standard environment variables to configure OTLP
export, resource attributes, and service name automatically. When initializing
the OpenTelemetry SDK, you will also specify which auto-instrumentation
libraries to leverage (ie: Sinatra)

```ruby
OpenTelemetry::SDK.configure do |c|
  c.use "OpenTelemetry::Instrumentation::Sinatra"
end
```

## Traces

### Add attributes to auto-instrumented spans

Within the execution of auto-instrumented code you can get current span from
context.

```ruby
current_span = OpenTelemetry::Trace.current_span
```

Adding multiple attributes to a span is accomplished using `add_attributes` on
the span object.

```ruby
current_span.add_attributes({
  "app.order.id" => data.order.order_id,
})
```

Adding only a single attribute can be accomplished using `set_attribute` on the
span object.

```ruby
span.set_attribute("app.email.recipient", data.email)
```

### Create new spans

New spans can be created and placed into active context using `in_span` from an
OpenTelemetry Tracer object. When used in conjunction with a `do..end` block,
the span will automatically be ended when the block ends execution.

```ruby
tracer = OpenTelemetry.tracer_provider.tracer('email')
tracer.in_span("send_email") do |span|
  # logic in context of span here
end
```

## Metrics

### Initializing Metrics

The OpenTelemetry Metrics SDK and OTLP metrics exporter are initialized at root
level in the `email_server.rb` file. You first need the `require` statements to
access them.

```ruby
require "opentelemetry-metrics-sdk"
require "opentelemetry-exporter-otlp-metrics"
```

The Ruby SDK uses OpenTelemetry standard environment variables to configure OTLP
export, resource attributes, and service name automatically. When initializing
the OpenTelemetry Metrics SDK, you also need to configure a meter provider and a
metric reader.

```ruby
otlp_metric_exporter = OpenTelemetry::Exporter::OTLP::Metrics::MetricsExporter.new
OpenTelemetry.meter_provider.add_metric_reader(otlp_metric_exporter)
meter = OpenTelemetry.meter_provider.meter("email")
```

With the meter provider you now have access to the meter, which can be used to
create a global metric (ie: `counter`).

```ruby
$confirmation_counter = meter.create_counter("app.confirmation.counter", unit: "1", description: "Counts the number of order confirmation emails sent")
```

### Custom metrics

The following custom metric is currently available:

- `app.confirmation.counter`: Cumulative count of number of order confirmation
  emails sent

## Logs

### Initializing logs

The OpenTelemetry Logs SDK and OTLP logs exporter are initialized at root level
in the `email_server.rb` file. You first need the `require` statements to access
them.

```ruby
require "opentelemetry-logs-sdk"
require "opentelemetry-exporter-otlp-logs"
```

The Ruby SDK uses OpenTelemetry standard environment variables to configure OTLP
export, resource attributes, and service name automatically. When initializing
the OpenTelemetry Logs SDK, you need a logger provider to create a global
logger.

```ruby
$logger = OpenTelemetry.logger_provider.logger(name: "email")
```

### Emitting structured logs

You can use the logger’s `on_emit` method to write structured logs. Include
`severity_text` (e.g., `INFO`, `ERROR`), a human-readable `body`, and
`app.email.recipient` attribute that may help querying the logs later.

```ruby
$logger.on_emit(
  timestamp: Time.now,
  severity_text: "INFO",
  body: "Order confirmation email sent",
  attributes: { "app.email.recipient" => data.email }
)
```
