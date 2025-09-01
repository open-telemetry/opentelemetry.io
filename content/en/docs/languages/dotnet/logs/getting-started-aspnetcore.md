---
title: Getting started with logs - ASP.NET Core
linkTitle: ASP.NET Core
description: Learn how to use OpenTelemetry Logs in an ASP.NET Core application
weight: 20
cSpell:ignore: aspnetcoreapp
---

This guide will show you how to get started with OpenTelemetry .NET Logs in an
ASP.NET Core application.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed on your computer

## Creating an ASP.NET Core application

Create a new ASP.NET Core web application:

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## Adding OpenTelemetry logs

Install the required OpenTelemetry packages:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

Update the `Program.cs` file with the following code:

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;

var builder = WebApplication.CreateBuilder(args);

// For instructional purposes only, disable the default .NET logging providers.
// We remove the console logging provider in this demo to use the verbose
// OpenTelemetry console exporter instead. For most development and production
// scenarios the default console provider works well and there is no need to
// clear these providers.
builder.Logging.ClearProviders();

// Add OpenTelemetry logging provider by calling the WithLogging extension.
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(builder.Environment.ApplicationName))
    .WithLogging(logging => logging
        /* Note: ConsoleExporter is used for demo purpose only. In production
           environment, ConsoleExporter should be replaced with other exporters
           (for example, OTLP Exporter). */
        .AddConsoleExporter());

var app = builder.Build();

app.MapGet("/", (ILogger<Program> logger) =>
{
    logger.FoodPriceChanged("artichoke", 9.99);

    return "Hello from OpenTelemetry Logs!";
});

app.Logger.StartingApp();

app.Run();

internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Starting the app...")]
    public static partial void StartingApp(this ILogger logger);

    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);
}
```

## Running the application

Run the application:

```shell
dotnet run
```

Browse to the URL shown in the console (for example, `http://localhost:5000`).

You should see log output in the console similar to:

```text
LogRecord.Timestamp:               2023-09-06T22:59:17.9787564Z
LogRecord.CategoryName:            getting-started-aspnetcore
LogRecord.Severity:                Info
LogRecord.SeverityText:            Information
LogRecord.Body:                    Starting the app...
LogRecord.Attributes (Key:Value):
    OriginalFormat (a.k.a Body): Starting the app...
LogRecord.EventId:                 225744744
LogRecord.EventName:               StartingApp

...

LogRecord.Timestamp:               2023-09-06T23:00:46.1639248Z
LogRecord.TraceId:                 3507087d60ae4b1d2f10e68f4e40784a
LogRecord.SpanId:                  c51be9f19c598b69
LogRecord.TraceFlags:              None
LogRecord.CategoryName:            Program
LogRecord.Severity:                Info
LogRecord.SeverityText:            Information
LogRecord.Body:                    Food `{name}` price changed to `{price}`.
LogRecord.Attributes (Key:Value):
    name: artichoke
    price: 9.99
    OriginalFormat (a.k.a Body): Food `{name}` price changed to `{price}`.
LogRecord.EventId:                 344095174
LogRecord.EventName:               FoodPriceChanged
```

Congratulations! You are now collecting logs using OpenTelemetry in your ASP.NET
Core application.

## How it works

### Replacing default logging providers

For demonstration purposes, the sample clears the default .NET logging providers
to better showcase the OpenTelemetry console output:

```csharp
// For instructional purposes only, disable the default .NET logging providers.
// We remove the console logging provider in this demo to use the verbose
// OpenTelemetry console exporter instead. For most development and production
// scenarios the default console provider works well and there is no need to
// clear these providers.
builder.Logging.ClearProviders();
```

In a real application, you would typically keep the default providers and add
OpenTelemetry alongside them.

### Adding OpenTelemetry logging

The application configures OpenTelemetry using the `AddOpenTelemetry()`
extension method:

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(builder.Environment.ApplicationName))
    .WithLogging(logging => logging
        .AddConsoleExporter());
```

This code:

1. Adds OpenTelemetry to the service collection
2. Configures resource information (like service name)
3. Sets up logging with the `WithLogging()` extension
4. Adds a console exporter to output logs to the console

### Using dependency injection for logging

ASP.NET Core provides built-in dependency injection for logging. The sample uses
this to inject a logger into the request handler:

```csharp
app.MapGet("/", (ILogger<Program> logger) =>
{
    logger.FoodPriceChanged("artichoke", 9.99);

    return "Hello from OpenTelemetry Logs!";
});
```

The `ILogger<Program>` parameter is automatically injected by the framework, and
the log will include the category name "Program".

### Using LoggerMessage source generation

The sample uses
[compile-time logging source generation](https://docs.microsoft.com/dotnet/core/extensions/logger-message-generator)
for high-performance structured logging:

```csharp
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Starting the app...")]
    public static partial void StartingApp(this ILogger logger);

    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);
}
```

This approach:

- Delivers better performance than string interpolation.
- Ensures type safety for log parameters.
- Produces structured logs with named parameters.
- Automatically produces `EventName` on `LogRecord`.
-

## Learn more

- [Getting Started with Console](/docs/languages/dotnet/logs/getting-started-console/)
- [Log Correlation](/docs/languages/dotnet/logs/correlation/)
- [Logging in ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/logging/)
