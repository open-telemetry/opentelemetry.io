---
title: Checkout Service
linkTitle: Checkout
aliases: [checkoutservice]
# prettier-ignore
cSpell:ignore: otelc otelslog sarama
---

This service is responsible to process a checkout order from the user. The
checkout service will call many other services in order to process an order. It
is instrumented at compile time with `otelc`, the OpenTelemetry Go compile-time
instrumentation tool.

[Checkout service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/checkout/)

## Instrumentation approach

This service shows how to instrument a Go application at compile time with
[`otelc`](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation),
the OpenTelemetry Go compile-time instrumentation tool. The
[Product Catalog service](product-catalog.md) is the other Go service in the
demo. It sets up the OpenTelemetry SDK manually, so together the two services
demo both instrumentation modes for Go: `otelc` and manual SDK instantiation.

The Checkout service Dockerfile builds the binary with `go tool otelc go build`
instead of `go build`. At compile time `otelc`:

- Initializes the OpenTelemetry SDK, and shuts it down when the process exits.
  The service has no `initTracerProvider`, `initMeterProvider`,
  `initLoggerProvider` or resource setup code, and no deferred `Shutdown()`
  calls.
- Instruments the gRPC server and clients, and the `net/http` client.
- Registers the Go runtime metrics.
- Adds trace and span IDs to `log/slog` output.

`otelc` is declared as a `tool` dependency in the service `go.mod`. The
instrumentation is configured through the standard `OTEL_*` environment
variables, such as `OTEL_EXPORTER_OTLP_ENDPOINT`.

The code that `otelc` does not replace remains in the service: the OpenTelemetry
API calls that create custom spans, add attributes and events, and the log
bridge described in [Logs](#logs).

## Traces

### Instrumenting gRPC and HTTP

The gRPC server, the outgoing gRPC clients and the outgoing HTTP client need no
instrumentation code. `otelc` instruments them at compile time, so the server
and the clients are created without any OpenTelemetry option or wrapper:

```go
srv := grpc.NewServer()
```

```go
svc.httpClient = &http.Client{}
```

### Creating spans with the OpenTelemetry API

Instrumenting with `otelc` doesn't prevent you from creating your own spans. The
service gets a tracer from the global tracer provider, which `otelc` sets up
when the process starts.

```go
tracer = otel.Tracer("checkout")
```

Spans are then created with `tracer.Start`. This is how the service creates the
`prepareOrderItemsAndShippingQuoteFromCart` span and the Kafka producer span:

```go
ctx, span := tracer.Start(ctx, "prepareOrderItemsAndShippingQuoteFromCart")
defer span.End()
```

The Kafka producer is not instrumented by `otelc`. The service creates the
producer span and injects the trace context in the Kafka message headers itself,
using the global propagator.

### Add attributes to spans

Within the execution of instrumented code you can get the current span from
context.

```go
span := trace.SpanFromContext(ctx)
```

Adding attributes to a span is accomplished using `SetAttributes` on the span
object. In the `PlaceOrder` function several attributes are added to the span.

```go
span.SetAttributes(
    attribute.String("demo.order.id", orderID.String()),
    attribute.Float64("demo.shipping.amount", shippingCostFloat),
    attribute.Float64("demo.order.amount", totalPriceFloat),
    attribute.Int("demo.order.items.count", len(prep.orderItems)),
    shippingTrackingAttribute,
)
```

### Add span events

Adding span events is accomplished using `AddEvent` on the span object. In the
`PlaceOrder` function several span events are added. Some events have additional
attributes, others do not.

Adding a span event without attributes:

```go
span.AddEvent("prepared")
```

Adding a span event with additional attributes:

```go
span.AddEvent("charged",
    trace.WithAttributes(attribute.String("demo.payment.transaction.id", txID)))
```

## Metrics

The service has no metrics setup code. `otelc` initializes the meter provider
and registers the Go runtime metrics at compile time, so the service doesn't
call `runtime.Start()` or `MeterProvider.Shutdown()`.

## Logs

You can send your logs to the OpenTelemetry Collector in two ways:

- Directly to the Collector
- Through a file or `stdout`

You can find documentation specifying how to use both these approaches in the
[Logs](/docs/languages/go/instrumentation/#logs) section of the
[Manual Instrumentation](/docs/languages/go/instrumentation/) documentation.

The Checkout service sends the logs directly to the Collector, and uses a log
bridge to send its logs, bridging to the `slog` logging package, which outputs
structured logs.

The log bridge is still required with `otelc`. The `otelc` `log/slog`
instrumentation only adds the trace and span IDs to the log output, it doesn't
export logs over OTLP. See
[opentelemetry-go-compile-instrumentation#1414](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/issues/1414).

### Logging functionality

The logs are output in a structured format using the `slog` package.

First, initialize the logger:

```go
logger *slog.Logger
logger = otelslog.NewLogger("checkout")
slog.SetDefault(logger)
```

Note the use of `fmt.Sprintf` to format the output before it's sent to the
logger:

```go
logger.Info(fmt.Sprintf("starting to listen on tcp: %q", lis.Addr().String()))
logger.Error(fmt.Sprintf("Failed to write message: %v", errMsg.Err))
```

The advantage of using `slog` is the ability to attach additional attributes to
the output. The following example attaches a few attributes such as the order
ID, shipping cost and total price. This makes it possible to view and parse
these as part of the log output and makes it easier to view them as separate
columns in Grafana:

```go
logger.LogAttrs(
    ctx,
    slog.LevelInfo, "order placed",
    slog.String("demo.order.id", orderID.String()),
    slog.Float64("demo.shipping.amount", shippingCostFloat),
    slog.Float64("demo.order.amount", totalPriceFloat),
    slog.Int("demo.order.items.count", len(prep.orderItems)),
    slog.String("demo.shipping.tracking.id", shippingTrackingID),
)
```
