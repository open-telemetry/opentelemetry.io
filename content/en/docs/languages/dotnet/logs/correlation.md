---
title: Log correlation
linkTitle: Correlation
description: Learn how to correlate logs with traces in OpenTelemetry .NET
weight: 30
---

This guide explains how logs can be correlated with traces in OpenTelemetry
.NET.

## Logging data model support for correlation

The
[OpenTelemetry Logging Data Model](/docs/specs/otel/logs/data-model/#trace-context-fields)
defines fields which allow a log to be correlated with a span (`Activity` in
.NET). The fields `TraceId` and `SpanId` allow a log to be correlated to the
corresponding `Activity`.

## Automatic correlation in OpenTelemetry .NET

In OpenTelemetry .NET SDK, there is no user action required to enable
correlation. The SDK automatically enables logs to `Activity` correlation by
populating the fields `TraceId`, `SpanId`, and `TraceFlags` from the active
activity (that is, `Activity.Current`), if one exists.

## Example

Here's a simple example showing how to emit logs within the context of an active
`Activity`:

```csharp
using System;
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Create a logger factory with OpenTelemetry
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options =>
    {
        options.AddConsoleExporter();
    });
});

// Create a tracer provider
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();

// Get a logger instance
var logger = loggerFactory.CreateLogger<Program>();

// Create an activity source
var activitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");

// Start an activity
using (var activity = activitySource.StartActivity("SayHello"))
{
    // Log within the activity context
    logger.FoodPriceChanged("artichoke", 9.99);
}

// Define extension methods for structured logging
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);
}
```

Running the application will show the following output on the console:

```text
LogRecord.Timestamp:               2024-01-26T17:55:39.2273475Z
LogRecord.TraceId:                 aed89c3b250fb9d8e16ccab1a4a9bbb5
LogRecord.SpanId:                  bd44308753200c58
LogRecord.TraceFlags:              Recorded
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

Activity.TraceId:            aed89c3b250fb9d8e16ccab1a4a9bbb5
Activity.SpanId:             bd44308753200c58
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: MyCompany.MyProduct.MyLibrary
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2024-01-26T17:55:39.2223849Z
Activity.Duration:           00:00:00.0361682
...
```

As you can see, the `LogRecord` automatically has the `TraceId` and `SpanId`
fields matching those from the `Activity`. This happens because the log was
created within the context of an active `Activity`.

In the
[Getting Started with Console](/docs/languages/dotnet/logs/getting-started-console/)
guide, the logging was done outside of an `Activity` context, so these
correlation fields in the `LogRecord` were not populated.

## Web applications

In web applications like ASP.NET Core, all the logs done within the context of a
request are automatically correlated to the `Activity` representing the incoming
request, making it easy to find all logs related to a specific request.

## Benefits of log correlation

Log correlation provides several benefits:

1. **Unified view**: You can see logs and traces together in a unified view in
   your observability tool.
2. **Context enrichment**: Logs are enriched with trace context, making them
   more informative.
3. **Troubleshooting**: Quickly find all logs related to a specific trace when
   debugging issues.
4. **Performance analysis**: Understand what affects the performance of your
   application.

## Learn more

- [OpenTelemetry .NET Tracing API](/docs/languages/dotnet/traces-api/)
- [OpenTelemetry Specification - Logs Data Model](/docs/specs/otel/logs/data-model/)
