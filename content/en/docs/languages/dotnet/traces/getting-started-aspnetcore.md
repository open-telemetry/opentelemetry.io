---
title: Getting started with traces - ASP.NET Core
linkTitle: ASP.NET Core
description:
  Learn how to use OpenTelemetry Traces in an ASP.NET Core application
weight: 20
cSpell:ignore: aspnetcoreapp
---

This guide will show you how to get started with OpenTelemetry .NET Traces in an
ASP.NET Core application.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed on your computer

## Creating an ASP.NET Core application

Create a new ASP.NET Core web application:

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## Adding OpenTelemetry traces

Install the required OpenTelemetry packages:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

Update the `Program.cs` file with the following code:

```csharp
using System.Diagnostics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Configure OpenTelemetry with tracing and auto-start.
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter());

var app = builder.Build();

app.MapGet("/", () => $"Hello World! OpenTelemetry Trace: {Activity.Current?.Id}");

app.Run();
```

## Running the application

Run the application:

```shell
dotnet run
```

Browse to the URL shown in the console (for example, `http://localhost:5000`).

You should see trace output in the console similar to:

```text
Activity.TraceId:            c28f7b480d5c7dfc30cfbd80ad29028d
Activity.SpanId:             27e478bbf9fdec10
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: Microsoft.AspNetCore
Activity.DisplayName:        GET /
Activity.Kind:               Server
Activity.StartTime:          2024-07-04T13:03:37.3318740Z
Activity.Duration:           00:00:00.3693734
Activity.Tags:
    server.address: localhost
    server.port: 5154
    http.request.method: GET
    url.scheme: https
    url.path: /
    network.protocol.version: 2
    user_agent.original: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36
    http.route: /
    http.response.status_code: 200
Resource associated with Activity:
    service.name: getting-started-aspnetcore
    service.instance.id: a388466b-4969-4bb0-ad96-8f39527fa66b
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.9.0
```

Congratulations! You are now collecting traces using OpenTelemetry in your
ASP.NET Core application.

## How it works

### OpenTelemetry registration

The application registers OpenTelemetry services using the dependency injection
container provided by ASP.NET Core:

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter());
```

This code:

1. Adds OpenTelemetry to the service collection with `AddOpenTelemetry()`
2. Configures a resource with service information using `ConfigureResource()`
3. Sets up trace collection with `WithTracing()`
4. Adds automatic instrumentation for ASP.NET Core with
   `AddAspNetCoreInstrumentation()`
5. Configures the console exporter to output traces to the console

### ASP.NET Core instrumentation

The `AddAspNetCoreInstrumentation()` method automatically creates traces for
HTTP requests, including:

- Request duration
- HTTP method, route, and status code
- Network information
- User agent

These traces are collected without requiring any additional code in your
controllers or middleware.

### Accessing the current activity

In OpenTelemetry .NET, the `Activity` class represents the OpenTelemetry
specification's "Span". In our example, we access the current Activity to
include its ID in the response:

```csharp
app.MapGet("/", () => $"Hello World! OpenTelemetry Trace: {Activity.Current?.Id}");
```

This allows you to see the trace ID in the browser and correlate it with the
traces in your monitoring system.

## Learn more

- [Getting Started with Console](/docs/languages/dotnet/traces/getting-started-console/)
- [Getting Started with Jaeger](/docs/languages/dotnet/traces/jaeger/)
- [Introduction to OpenTelemetry .NET Tracing API](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Api#introduction-to-opentelemetry-net-tracing-api)
