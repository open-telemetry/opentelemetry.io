---
title: Export to Jaeger
linkTitle: Export to Jaeger
description: Learn how to export traces to Jaeger with OpenTelemetry .NET
weight: 30
cSpell:ignore: Gantt OTLP
---

This guide will show you how to export OpenTelemetry .NET traces to Jaeger for
visualization and analysis.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed on your computer
- [Jaeger](https://www.jaegertracing.io/download/) downloaded (this guide covers
  installation)
- Familiarity with basic OpenTelemetry concepts (see
  [Getting Started with Console](/docs/languages/dotnet/traces/getting-started-console/))

## Creating a .NET application with OTLP export

Create a new console application:

```shell
dotnet new console --output getting-started-jaeger
cd getting-started-jaeger
```

Install the required OpenTelemetry packages:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Instrumentation.Http
```

Update the `Program.cs` file with the following code:

```csharp
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace GettingStartedJaeger;

internal static class Program
{
    private static readonly ActivitySource MyActivitySource = new("OpenTelemetry.Demo.Jaeger");

    public static async Task Main()
    {
        using var tracerProvider = Sdk.CreateTracerProviderBuilder()
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
                serviceName: "DemoApp",
                serviceVersion: "1.0.0"))
            .AddSource("OpenTelemetry.Demo.Jaeger")
            .AddHttpClientInstrumentation()
            .AddConsoleExporter()
            .AddOtlpExporter()
            .Build();

        using var parent = MyActivitySource.StartActivity("JaegerDemo");

        using (var client = new HttpClient())
        {
            using (var slow = MyActivitySource.StartActivity("SomethingSlow"))
            {
                await client.GetStringAsync(new Uri("https://httpstat.us/200?sleep=1000")).ConfigureAwait(false);
                await client.GetStringAsync(new Uri("https://httpstat.us/200?sleep=1000")).ConfigureAwait(false);
            }

            using (var fast = MyActivitySource.StartActivity("SomethingFast"))
            {
                await client.GetStringAsync(new Uri("https://httpstat.us/301")).ConfigureAwait(false);
            }
        }
    }
}
```

When you run this application, it will output traces to the console through the
`ConsoleExporter` and also attempt to send traces to Jaeger using the
`OtlpExporter`. Since Jaeger isn't set up yet, those traces will initially be
dropped.

## Setting up Jaeger

Jaeger is an open source distributed tracing system that helps monitor and
troubleshoot microservices-based applications.

### Installing and running Jaeger

1. Download Jaeger from the
   [official download page](https://www.jaegertracing.io/download/).
2. Extract it to a location on your machine.
3. Run the Jaeger all-in-one executable with OTLP enabled:

```shell
./jaeger-all-in-one --collector.otlp.enabled
```

This starts:

- Jaeger UI (`http://localhost:16686`)
- Jaeger collector with OTLP receiver (`http://localhost:4317`)
- Jaeger query service and other components

### Viewing traces in Jaeger

1. Open a web browser and navigate to
   [http://localhost:16686](http://localhost:16686)
2. Run your .NET application
3. In the Jaeger UI:
   - Select "DemoApp" from the "Service" dropdown
   - Click "Find Traces"

You should see your application's traces in the Jaeger UI. Click on a trace to
see the detailed Gantt chart view of all spans in the trace.

## Understanding the code

### Trace provider configuration

The application configures OpenTelemetry with:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: "DemoApp",
        serviceVersion: "1.0.0"))
    .AddSource("OpenTelemetry.Demo.Jaeger")
    .AddHttpClientInstrumentation()
    .AddConsoleExporter()
    .AddOtlpExporter()
    .Build();
```

This code:

1. Sets up a resource with service name and version
2. Registers our activity source
3. Adds automatic instrumentation for HttpClient
4. Configures console and OTLP exporters

### Activity creation

The application creates spans using the ActivitySource:

```csharp
private static readonly ActivitySource MyActivitySource = new("OpenTelemetry.Demo.Jaeger");

// Create a parent span
using var parent = MyActivitySource.StartActivity("JaegerDemo");

// Create child spans
using (var slow = MyActivitySource.StartActivity("SomethingSlow"))
{
    // Operations inside this block will be part of the "SomethingSlow" span
}
```

### Trace export flow

The trace data flows through the following components:

1. Application creates spans using ActivitySource
2. TracerProvider collects and processes spans
3. OTLP Exporter sends spans to Jaeger through the OTLP protocol
4. Jaeger stores and allows you to query and visualize the traces

## Production usage

For production use, you should remove the Console Exporter and only use the OTLP
Exporter:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: "DemoApp",
        serviceVersion: "1.0.0"))
    .AddSource("OpenTelemetry.Demo.Jaeger")
    .AddHttpClientInstrumentation()
    // Remove Console Exporter
    // .AddConsoleExporter()
    .AddOtlpExporter()
    .Build();
```

You can also remove the Console Exporter package:

```shell
dotnet remove package OpenTelemetry.Exporter.Console
```

## Learn more

- [Jaeger Tracing](https://www.jaegertracing.io/)
- [OTLP Exporter for OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol)
- [OpenTelemetry Tracing Specification](/docs/specs/otel/trace/api/)
