---
title: Cart Service
linkTitle: Cart
aliases: [/docs/demo/services/cartservice]
---

This service maintains items placed in the shopping cart by users. It interacts
with a Redis caching service for fast access to shopping cart data.

[Cart service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/cartservice/)

> **Note** OpenTelemetry for .NET uses the `System.Diagnostic` library as its
> API in lieu of the standard OpenTelemetry API.

## Traces

### Initializing Tracing

OpenTelemetry is configured in the .NET DI container. The `AddOpenTelemetry()`
builder method is used to configure desired instrumentation libraries, add
exporters, and set other options. Configuration of the exporter and resource
attributes is performed through environment variables.

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

Similar to configuring OpenTelemetry Traces, the .NET DI container requires a
call to `AddOpenTelemetry()`. This builder configures desired instrumentation
libraries, exporters, etc.

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

TBD
