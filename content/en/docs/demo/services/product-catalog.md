---
title: Product Catalog Service
linkTitle: Product Catalog
aliases: [productcatalogservice]
# prettier-ignore
cSpell:ignore: fatalf otelcodes otelgrpc otlpmetricgrpc otlptracegrpc sdkmetric sdktrace sprintf
---

This service is responsible to return information about products. The service
can be used to get all products, search for specific products, or return details
about any single product.

[Product Catalog service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/product-catalog/)

## Traces

### Initializing Tracing

The OpenTelemetry SDK is initialized from `main` using the `initTracerProvider`
function.

```go
func initTracerProvider() *sdktrace.TracerProvider {
    ctx := context.Background()

    exporter, err := otlptracegrpc.New(ctx)
    if err != nil {
        log.Fatalf("OTLP Trace gRPC Creation: %v", err)
    }
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(initResource()),
    )
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
    return tp
}
```

You should call `TracerProvider.Shutdown()` when your service is shutdown to
ensure all spans are exported. This service makes that call as part of a
deferred function in main

```go
tp := InitTracerProvider()
defer func() {
    if err := tp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Tracer Provider Shutdown: %v", err)
    }
}()
```

### Adding gRPC auto-instrumentation

This service receives gRPC requests, which are instrumented in the main function
as part of the gRPC server creation.

```go
srv := grpc.NewServer(
    grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
```

This service will issue outgoing gRPC calls, which are all instrumented by
wrapping the gRPC client with instrumentation.

```go
func createClient(ctx context.Context, svcAddr string) (*grpc.ClientConn, error) {
    return grpc.DialContext(ctx, svcAddr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
    )
}
```

### Add attributes to auto-instrumented spans

Within the execution of auto-instrumented code you can get current span from
context.

```go
span := trace.SpanFromContext(ctx)
```

Adding attributes to a span is accomplished using `SetAttributes` on the span
object. In the `GetProduct` function an attribute for the product ID is added to
the span.

```go
span.SetAttributes(
    attribute.String("app.product.id", req.Id),
)
```

### Setting span status

This service can catch and handle an error condition based on a feature flag. In
an error condition, the span status is set accordingly using `SetStatus` on the
span object. You can see this in the `GetProduct` function.

```go
msg := fmt.Sprintf("Error: ProductCatalogService Fail Feature Flag Enabled")
span.SetStatus(otelcodes.Error, msg)
```

### Add span events

Adding span events is accomplished using `AddEvent` on the span object. In the
`GetProduct` function a span event is added when an error condition is handled,
or when a product is successfully found.

```go
span.AddEvent(msg)
```

## Metrics

### Initializing Metrics

The OpenTelemetry SDK is initialized from `main` using the `initMeterProvider`
function.

```go
func initMeterProvider() *sdkmetric.MeterProvider {
    ctx := context.Background()

    exporter, err := otlpmetricgrpc.New(ctx)
    if err != nil {
        log.Fatalf("new otlp metric grpc exporter failed: %v", err)
    }

    mp := sdkmetric.NewMeterProvider(sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter)))
    global.SetMeterProvider(mp)
    return mp
}
```

You should call `initMeterProvider.Shutdown()` when your service is shutdown to
ensure all records are exported. This service makes that call as part of a
deferred function in main.

```go
mp := initMeterProvider()
defer func() {
    if err := mp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Error shutting down meter provider: %v", err)
    }
}()
```

### Adding golang runtime auto-instrumentation

Golang runtime is instrumented in the main function

```go
err := runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second))
if err != nil {
    log.Fatal(err)
}
```

## Logs

You can send your logs to the OpenTelemetry Collector in two ways:

- Directly to the Collector
- Through a file or `stdout`

You can find documentation specifying how to use both these approaches in the
[Logs](/docs/languages/go/instrumentation/#logs) section of the
[Manual Instrumentation](/docs/languages/go/instrumentation/) documentation.

The Product Catalog service sends the logs directly to the Collector, and uses a
log bridge to send its logs, bridging to the `slog` logging package, which
outputs structured logs.

## LoggerProvider initialization

The OpenTelemetry SDK is initialized from `main` using the `initLoggerProvider`
function.

```go
ctx := context.Background()

logExporter, err := otlploggrpc.New(ctx)
if err != nil {
	return nil
}

loggerProvider := sdklog.NewLoggerProvider(
	sdklog.WithProcessor(sdklog.NewBatchProcessor(logExporter)),
)
global.SetLoggerProvider(loggerProvider)

return loggerProvider
```

Call `LoggerProvider.Shutdown()` when your service is down to ensure all logs
are exported. This service makes that call as part of a deferred function in
`main`:

```go
lp := initLoggerProvider()
defer func() {
	if err := lp.Shutdown(context.Background()); err != nil {
		logger.Error(fmt.Sprintf("Logger Provider Shutdown: %v", err))
	}
	logger.Info("Shutdown logger provider")
}()
```

### Logging functionality

This service sends logs to the Collector using gRPC calls. The logs are output
in a structured format using the `slog` package.

First, initialize the logger:

```go
logger   *slog.Logger
logger = otelslog.NewLogger("product-catalog")
```

Note the use of `fmt.Sprintf` to format the output before it's sent to the
logger:

```go
logger.Info("Loading Product Catalog...")
logger.Info(fmt.Sprintf("Product Catalog reload interval: %d", interval))
logger.Error(fmt.Sprintf("Error shutting down meter provider: %v", err))
```

The advantage of using `slog` is the ability to attach additional attributes to
the output. The following example attaches the `product.name` and `product.id`
attributes. This makes it possible to view and parse these as part of the log
output and makes it easier to view them as separate columns in Grafana:

```go
logger.LogAttrs(
	ctx,
	slog.LevelInfo, "Product Found",
	slog.String("app.product.name", found.Name),
	slog.String("app.product.id", req.Id),
)
```
