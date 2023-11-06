---
title: Cart Service
linkTitle: Cart
aliases: [cartservice]
---

This service maintains items placed in the shopping cart by users. It interacts
with a Redis caching service for fast access to shopping cart data.

[Cart service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/cartservice/)

> **Note** OpenTelemetry for .NET uses the `System.Diagnostic.DiagnosticSource`
> library as its API instead of the standard OpenTelemetry API for Traces and
> Metrics. `Microsoft.Extensions.Logging.Abstractions` library is used for Logs.

## Traces

### Initializing Tracing

OpenTelemetry is configured in the .NET dependency injection container. The
`AddOpenTelemetry()` builder method is used to configure desired instrumentation
libraries, add exporters, and set other options. Configuration of the exporter
and resource attributes is performed through environment variables.

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddDetector(new ContainerResourceDetector());

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithTracing(tracerBuilder => tracerBuilder
        .AddRedisInstrumentation(
            cartStore.GetConnection(),
            options => options.SetVerboseDatabaseStatements = true)
        .AddAspNetCoreInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());
```

### Add attributes to auto-instrumented spans

Within the execution of auto-instrumented code you can get current span
(activity) from context.

```cs
var activity = Activity.Current;
```

Adding attributes (tags in .NET) to a span (activity) is accomplished using
`SetTag` on the activity object. In the `AddItem` function from
`services/CartService.cs` several attributes are added to the auto-instrumented
span.

```cs
activity?.SetTag("app.user.id", request.UserId);
activity?.SetTag("app.product.quantity", request.Item.Quantity);
activity?.SetTag("app.product.id", request.Item.ProductId);
```

### Add span events

Adding span (activity) events is accomplished using `AddEvent` on the activity
object. In the `GetCart` function from `services/CartService.cs` a span event is
added.

```cs
activity?.AddEvent(new("Fetch cart"));
```

## Metrics

### Initializing Metrics

Similar to configuring OpenTelemetry Traces, the .NET dependency injection
container requires a call to `AddOpenTelemetry()`. This builder configures
desired instrumentation libraries, exporters, etc.

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddDetector(new ContainerResourceDetector());

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithMetrics(meterBuilder => meterBuilder
        .AddRuntimeInstrumentation()
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());
```

## Logs

Logs are configured in the .NET dependency injection container on
`LoggingBuilder` level by calling `AddOpenTelemetry()`. This builder configures
desired options, exporters, etc.

```cs
builder.Logging
    .AddOpenTelemetry(options => options.AddOtlpExporter());
```
