---
title: "Tracing"
---

This page contains documentation for OpenTelemetry .NET.

**Note**: OpenTelemetry .NET is in _alpha_ and should not be deployed to production systems.

# Quick Start

1. Install OpenTelemetry via [NuGet](https://www.nuget.org/packages/OpenTelemetry) along with an exporter such as [Zipkin](https://www.nuget.org/packages/OpenTelemetry.Exporter.Zipkin) or [Jaeger](https://www.nuget.org/packages/OpenTelemetry.Exporter.Jaeger).
2. Create a `Tracer` through the `TracerFactory`, as shown:
```csharp
var tracerFactory = TracerFactory.Create(
                                  builder => builder.AddProcessorPipeline(
                                  c => c.SetExporter(new JaegerTraceExporter(jaegerOptions))));
```
3. Get a reference to your `Tracer` from the `TracerFactory` using the `GetTracer()` method.
4. Start a span, then add attributes or events to it as desired, as seen here:
```csharp
using (tracer.StartActiveSpan("test", out var span))
{
  span.SetAttribute("custom-attribute", 219);
  span.AddEvent("hello world");
}
// the span will automatically complete when it goes out of scope here.
```

You can find more exporters and examples of how to use them [here](https://github.com/open-telemetry/opentelemetry-dotnet/tree/master/samples/Exporters).

See the [README](https://github.com/open-telemetry/opentelemetry-dotnet/blob/master/README.md) for the most up-to-date information on configuring and using OpenTelemetry .NET.

# API Reference

Please see the [GitHub Repository](https://github.com/open-telemetry/opentelemetry-dotnet) for more information on the API.
