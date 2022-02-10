---
title: Logs
description: Getting Started with OpenTelemetry .NET Logging
weight: 2
---

1. Install the required packages

    ```console
    dotnet add package Microsoft.Extensions.Logging
    dotnet add package --prerelease OpenTelemetry.Exporter.Console
    ```

1. Update `Program.cs` with the following

    {{< highlight csharp "linenos=true" >}}
using Microsoft.Extensions.Logging;
using OpenTelemetry.Logs;

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options => options
        .AddConsoleExporter());
});

var logger = loggerFactory.CreateLogger<Program>();
logger.LogInformation("Hello from {name} {price}.", "tomato", 2.99);
{{< /highlight >}}

1. Run the application

    ```console
    dotnet run
    ```

1. You should see output similar to the following

    ```text
    LogRecord.TraceId:            00000000000000000000000000000000
    LogRecord.SpanId:             0000000000000000
    LogRecord.Timestamp:          2020-11-13T23:50:33.5764463Z
    LogRecord.EventId:            0
    LogRecord.CategoryName:       Program
    LogRecord.LogLevel:           Information
    LogRecord.TraceFlags:         None
    LogRecord.State:              Hello from tomato 2.99.
    ```

## What this program does

The program uses the [`ILogger`][1] API to log a formatted string with a
[severity level][2] of `Information`. OpenTelemetry captures this and sends it
to `ConsoleExporter`.

[1]: <https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger>
[2]: <https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.loglevel>
