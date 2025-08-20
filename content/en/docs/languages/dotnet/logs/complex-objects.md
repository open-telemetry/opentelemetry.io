---
title: Logging complex objects
linkTitle: Complex objects
description: Learn how to log complex objects with OpenTelemetry .NET
weight: 20
# prettier-ignore
cSpell:ignore: BrandName CompanyName Contoso FoodRecallNotice Listeria monocytogenes ProductDescription ProductType RecallReasonDescription
---

In the
[Getting Started with OpenTelemetry .NET Logs - Console](/docs/languages/dotnet/logs/getting-started-console/)
guide, we learned how to log primitive data types. This guide will show you how
to log complex objects.

## Complex object logging in .NET

Complex object logging was introduced in .NET 8.0 through the
[`LogPropertiesAttribute`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.logpropertiesattribute).
This attribute and the corresponding code generation logic are provided by an
extension package called
[`Microsoft.Extensions.Telemetry.Abstractions`](https://www.nuget.org/packages/Microsoft.Extensions.Telemetry.Abstractions/).

## Prerequisites

- Complete the
  [Getting Started with Console](/docs/languages/dotnet/logs/getting-started-console/)
  tutorial.

## Implementation steps

### 1. Install the required package

Install the `Microsoft.Extensions.Telemetry.Abstractions` package:

```shell
dotnet add package Microsoft.Extensions.Telemetry.Abstractions
```

### 2. Define a complex data type

Create a struct to represent your complex object:

```csharp
public struct FoodRecallNotice
{
    public string? BrandName { get; set; }
    public string? ProductDescription { get; set; }
    public string? ProductType { get; set; }
    public string? RecallReasonDescription { get; set; }
    public string? CompanyName { get; set; }
}
```

### 3. Create a logger extension method with LogPropertiesAttribute

Define an extension method for your logger that uses the Define an extension
method to `ILogger` that uses the

```csharp
using Microsoft.Extensions.Logging;

internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Critical)]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        [LogProperties(OmitReferenceName = true)] in FoodRecallNotice foodRecallNotice);
}
```

The `[LogProperties(OmitReferenceName = true)]` attribute instructs the source
generator to:

- Include all properties of the `FoodRecallNotice` as individual log attributes
- Omit the reference name (the parameter name) from the attribute keys

### 4. Log the complex object

Create an instance of your complex object and log it:

```csharp
// Create a complex object
var foodRecallNotice = new FoodRecallNotice
{
    BrandName = "Contoso",
    ProductDescription = "Salads",
    ProductType = "Food & Beverages",
    RecallReasonDescription = "due to a possible health risk from Listeria monocytogenes",
    CompanyName = "Contoso Fresh Vegetables, Inc.",
};

// Log the complex object
logger.FoodRecallNotice(foodRecallNotice);
```

### 5. Run the application

Run the application, for example using `dotnet run`, and you should see the log
output on the console:

```text
LogRecord.Timestamp:               2024-01-12T19:01:16.0604084Z
LogRecord.CategoryName:            Program
LogRecord.Severity:                Fatal
LogRecord.SeverityText:            Critical
LogRecord.FormattedMessage:
LogRecord.Body:
LogRecord.Attributes (Key:Value):
    CompanyName: Contoso Fresh Vegetables, Inc.
    RecallReasonDescription: due to a possible health risk from Listeria monocytogenes
    ProductType: Food & Beverages
    ProductDescription: Salads
    BrandName: Contoso
LogRecord.EventId:                 252550133
LogRecord.EventName:               FoodRecallNotice
```

Notice that each property of the `FoodRecallNotice` object appears as a separate
attribute in the log record.

## LogPropertiesAttribute options

The `LogPropertiesAttribute` provides several options to control how properties
are included in logs:

- **OmitReferenceName**: When set to `true`, the parameter name is omitted from
  attribute keys. In the example above, attribute keys are just the property
  names (for example, "BrandName") rather than "foodRecallNotice.BrandName".

- **IncludeProperties**: Used to specify which properties should be included. If
  not specified, all properties are included.

- **ExcludeProperties**: Used to specify which properties should be excluded
  from logging.

- **IncludeSensitive**: When set to `true`, properties marked with `[Sensitive]`
  attribute are included in logs. The default is `false`.

## Complete example

Here's a complete example that puts everything together:

```csharp
using System;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;

// Complex object definition
public struct FoodRecallNotice
{
    public string? BrandName { get; set; }
    public string? ProductDescription { get; set; }
    public string? ProductType { get; set; }
    public string? RecallReasonDescription { get; set; }
    public string? CompanyName { get; set; }
}

// Logger extension method
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Critical)]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        [LogProperties(OmitReferenceName = true)] in FoodRecallNotice foodRecallNotice);
}

// Main program
class Program
{
    static void Main(string[] args)
    {
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

        // Create a complex object
        var foodRecallNotice = new FoodRecallNotice
        {
            BrandName = "Contoso",
            ProductDescription = "Salads",
            ProductType = "Food & Beverages",
            RecallReasonDescription = "due to a possible health risk from Listeria monocytogenes",
            CompanyName = "Contoso Fresh Vegetables, Inc.",
        };

        // Log the complex object
        logger.FoodRecallNotice(foodRecallNotice);

        Console.WriteLine("Press any key to exit");
        Console.ReadKey();
    }
}
```

## Learn more

- [Microsoft.Extensions.Logging.LogPropertiesAttribute](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.logpropertiesattribute)
- [Microsoft.Extensions.Telemetry.Abstractions](https://github.com/dotnet/extensions/blob/main/src/Libraries/Microsoft.Extensions.Telemetry.Abstractions/README.md)
- [Log Correlation in OpenTelemetry .NET](/docs/languages/dotnet/logs/correlation/)
- [OpenTelemetry Logs Data Model](/docs/specs/otel/logs/data-model/)
