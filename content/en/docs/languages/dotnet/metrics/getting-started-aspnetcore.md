---
title: Getting started with metrics - ASP.NET Core
linkTitle: ASP.NET Core
description:
  Learn how to use OpenTelemetry Metrics in an ASP.NET Core application
weight: 20
cSpell:ignore: aspnetcoreapp
---

This guide will show you how to get started with OpenTelemetry .NET Metrics in
an ASP.NET Core application in just a few minutes.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed on your computer

## Creating an ASP.NET Core application

Create a new ASP.NET Core web application:

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## Adding OpenTelemetry metrics

Install the required OpenTelemetry packages:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

Update the `Program.cs` file with the following code:

```csharp
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;

var builder = WebApplication.CreateBuilder(args);

// Configure OpenTelemetry with metrics and auto-start.
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter((exporterOptions, metricReaderOptions) =>
        {
            metricReaderOptions.PeriodicExportingMetricReaderOptions.ExportIntervalMilliseconds = 1000;
        }));

var app = builder.Build();

app.MapGet("/", () => $"Hello from OpenTelemetry Metrics!");

app.Run();
```

## Running the application

Run the application:

```shell
dotnet run
```

Browse to the URL shown in the console (for example, `http://localhost:5000`).

You should see metrics output in the console similar to:

```text
Export http.server.duration, Measures the duration of inbound HTTP requests., Unit: ms, Meter: OpenTelemetry.Instrumentation.AspNetCore/1.0.0.0
(2023-04-11T21:49:43.6915232Z, 2023-04-11T21:50:50.6564690Z) http.flavor: 1.1 http.method: GET http.route: / http.scheme: http http.status_code: 200 net.host.name: localhost net.host.port: 5000 Histogram
Value: Sum: 3.5967 Count: 11 Min: 0.073 Max: 2.5539
(-Infinity,0]:0
(0,5]:11
(5,10]:0
(10,25]:0
(25,50]:0
(50,75]:0
(75,100]:0
(100,250]:0
(250,500]:0
(500,750]:0
(750,1000]:0
(1000,2500]:0
(2500,5000]:0
(5000,7500]:0
(7500,10000]:0
(10000,+Infinity]:0
```

Congratulations! You are now collecting metrics from your ASP.NET Core
application using OpenTelemetry.

## How it works

### OpenTelemetry registration

The application registers OpenTelemetry services using the dependency injection
container provided by ASP.NET Core:

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter((exporterOptions, metricReaderOptions) =>
        {
            metricReaderOptions.PeriodicExportingMetricReaderOptions.ExportIntervalMilliseconds = 1000;
        }));
```

This code:

1. Adds OpenTelemetry to the service collection with `AddOpenTelemetry()`
2. Configures a resource with service information using `ConfigureResource()`
3. Sets up metrics collection with `WithMetrics()`
4. Adds automatic instrumentation for ASP.NET Core with
   `AddAspNetCoreInstrumentation()`
5. Configures the console exporter to export metrics every second

### ASP.NET Core instrumentation

The `AddAspNetCoreInstrumentation()` method automatically collects HTTP request
metrics, including:

- Request durations
- HTTP method, route, and status code
- Network information

These metrics are collected without requiring any additional code in your
controllers or middleware.

## Learn more

- [Getting Started with Console](/docs/languages/dotnet/metrics/getting-started-console/)
- [Getting Started with Prometheus and Grafana](/docs/languages/dotnet/metrics/getting-started-prometheus-grafana/)
- [Learning More About Instruments](/docs/languages/dotnet/metrics/instruments/)
