---
title: Manual Instrumentation
linkTitle: Manual
weight: 3
---

Manual instrumentation is the process of adding observability code to your application.

## A note on terminology

.NET is different from other languages/runtimes that support OpenTelemetry.
Tracing is implemented by the [System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics)
API, repurposing older constructs like `ActivitySource` and `Activity` to
be OpenTelemetry-compliant under the covers.

However, there are parts of the OpenTelemetry API and terminology that .NET
developers must still know to be able to instrument their applications.

## Initializing tracing

There are two main ways to initialize tracing, depending on if you're using
a console app or something that's ASP.NET Core-based.

### Console app

To start tracing in a console app, you need to create a tracer provider.

First, ensure that you have the right packages:

```
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Exporter.Console
```

And then use code like this at the beginning of your program, during any important
startup operations.

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

// ...

var serviceName = "MyServiceName";
var serviceVersion "1.0.0";

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

//...
```

This is also where you can configure instrumentation libraries.

Note that this sample uses the Console Exporter. If you are exporting to another endpoint,
you'll have to use a different exporter.

### ASP.NET Core

To start tracing in an ASP.NET Core-based app, use the OpenTelemetry extensions for ASP.NET Core setup.

First, ensure that you have the right packages:

```
dotnet add package OpenTelemetry --prerelease
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
dotnet add package OpenTelemetry.Exporter.Console --prerelease
```

And then configure it in your ASP.NET Core startup routine where you have access to an `IServiceCollection`.

```csharp
using System.Diagnostics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Define some important constants and the activity source
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

// Configure important OpenTelemetry settings, the console exporter, and automatic instrumentation
builder.Services.AddOpenTelemetryTracing(b =>
{
    b
    .AddConsoleExporter()
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
});
```

This is also where you can configure instrumentation libraries.

Note that this sample uses the Console Exporter. If you are exporting to another endpoint,
you'll have to use a different exporter.

## Seting up an ActivitySource