---
title: Getting started with logs - Console
linkTitle: Console
description: Learn how to use OpenTelemetry Logs in a .NET Console application
weight: 10
# prettier-ignore
cSpell:ignore: brandName companyName Contoso Listeria monocytogenes OTLP productDescription recallReasonDescription
---

This guide will show you how to get started with OpenTelemetry .NET Logs in a
console application in just a few minutes.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed on your computer

## Creating a console application

Create a new console application and run it:

```shell
dotnet new console --output getting-started
cd getting-started
dotnet run
```

You should see the following output:

```text
Hello World!
```

## Adding OpenTelemetry logs

Install the OpenTelemetry Console Exporter package:

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

Update the `Program.cs` file with the following code:

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;

// Create a logger factory with OpenTelemetry
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options =>
    {
        options.AddConsoleExporter();
    });
});

// Get a logger instance
var logger = loggerFactory.CreateLogger<Program>();

// Log a simple message
logger.LogInformation("Hello from OpenTelemetry .NET Logs!");

// Log with structured data
logger.FoodPriceChanged("artichoke", 9.99);

// Log a more complex example
logger.FoodRecallNotice(
    "Food & Beverages",
    "Contoso",
    "Salads",
    "Contoso Fresh Vegetables, Inc.",
    "due to a possible health risk from Listeria monocytogenes");

// Define extension methods for structured logging
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);

    [LoggerMessage(LogLevel.Critical, "A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).")]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        string productType,
        string brandName,
        string productDescription,
        string companyName,
        string recallReasonDescription);
}
```

Run the application again (using `dotnet run`) and you should see the log output
on the console:

```text
LogRecord.Timestamp:               2023-09-15T06:07:03.5502083Z
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

...

LogRecord.Timestamp:               2023-09-15T06:07:03.5683511Z
LogRecord.CategoryName:            Program
LogRecord.Severity:                Fatal
LogRecord.SeverityText:            Critical
LogRecord.Body:                    A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).
LogRecord.Attributes (Key:Value):
    brandName: Contoso
    productDescription: Salads
    productType: Food & Beverages
    recallReasonDescription: due to a possible health risk from Listeria monocytogenes
    companyName: Contoso Fresh Vegetables, Inc.
    OriginalFormat (a.k.a Body): A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).
LogRecord.EventId:                 1338249384
LogRecord.EventName:               FoodRecallNotice
```

Congratulations! You are now collecting logs using OpenTelemetry.

## How it works

The program creates a logging pipeline by instantiating a
[`LoggerFactory`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.iloggerfactory)
instance, with OpenTelemetry added as a
[logging provider](https://docs.microsoft.com/dotnet/core/extensions/logging-providers).

OpenTelemetry SDK is configured with a `ConsoleExporter` to export the logs to
the console for demonstration purposes. For production usage, other exporters
such as
[OTLP Exporter](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol)
should be used instead.

The `LoggerFactory` instance is used to create an
[`ILogger`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger)
instance, which is used to do the actual logging.

Following the .NET logging best practice,
[compile-time logging source generation](https://docs.microsoft.com/dotnet/core/extensions/logger-message-generator)
has been used, which delivers high performance, structured logging, and
type-checked parameters.

## Using with dependency injection

For applications which use `ILogger` with
[dependency injection (DI)](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection)
(for example, [ASP.NET Core](https://learn.microsoft.com/aspnet/core) and
[.NET Worker](https://learn.microsoft.com/dotnet/core/extensions/workers)), the
common practice is to add OpenTelemetry as a
[logging provider](https://docs.microsoft.com/dotnet/core/extensions/logging-providers)
to the DI logging pipeline, rather than set up a completely new logging pipeline
by creating a new `LoggerFactory` instance.

Refer to the
[Getting Started with ASP.NET Core](/docs/languages/dotnet/logs/getting-started-aspnetcore/)
tutorial to learn more.

## Learn more

- [Logging in C# and .NET](https://learn.microsoft.com/dotnet/core/extensions/logging)
- [Logging Complex Objects](/docs/languages/dotnet/logs/complex-objects/)
- [Log Correlation](/docs/languages/dotnet/logs/correlation/)
