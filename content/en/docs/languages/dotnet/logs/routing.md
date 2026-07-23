---
title: Routing logs to different destinations
linkTitle: Routing
description:
  Learn how to route logs from a single ILogger to different OTLP destinations
  using a custom processor.
weight: 55
---

This guide shows how to route logs from a **single `ILogger`** to different OTLP
endpoints using a custom processor. It follows the
[Routing](/docs/specs/otel/logs/supplementary-guidelines/#routing) pattern
described in the OpenTelemetry specification supplementary guidelines.

## Why route logs?

In some scenarios, you want all application code to use the same `ILogger`
pipeline, yet send certain logs to one backend and the rest to another. For
example:

- Logs from **payment** components should go to a dedicated collector endpoint
  (`OTLP2`).
- All other logs should go to the default endpoint (`OTLP1`).

If your application can instead create multiple `ILoggerFactory` instances and
have callers pick the appropriate one, consider using a
[dedicated logging pipeline](../dedicated-pipeline/) instead.

## How it works

The routing decision is made at the processor level by inspecting the
`CategoryName` of each `LogRecord`. A custom processor checks whether the
category name starts with a configured prefix and forwards the record to the
appropriate export pipeline:

```text
ILogger (single pipeline)
   |
   v
LoggerProvider
   |
   v
RoutingProcessor (custom)
   +-- CategoryName starts with prefix --> ExportProcessor -> OtlpLogExporter (OTLP2)
   +-- otherwise --------------------------> ExportProcessor -> OtlpLogExporter (OTLP1)
```

1. Two `OtlpLogExporter` instances are created, each pointing at a different
   endpoint.
2. Each exporter is wrapped in a `BatchLogRecordExportProcessor`.
3. A custom `RoutingProcessor` extends `BaseProcessor<LogRecord>` and overrides
   `OnEnd`. It checks if the log record's `CategoryName` starts with a
   configured prefix to decide which inner processor receives the record.
4. The routing processor is registered on the `LoggerProvider` via
   `AddProcessor`.

## Implementation

### The custom routing processor

The `RoutingProcessor` inspects each log record's `CategoryName` and forwards it
to one of two inner processors. It also delegates `ForceFlush`, `Shutdown`, and
`Dispose` so that both export pipelines are properly drained and cleaned up:

```csharp
using OpenTelemetry;
using OpenTelemetry.Logs;

internal sealed class RoutingProcessor : BaseProcessor<LogRecord>
{
    private readonly string categoryPrefix;
    private readonly BaseProcessor<LogRecord> defaultProcessor;
    private readonly BaseProcessor<LogRecord> paymentProcessor;

    public RoutingProcessor(
        string categoryPrefix,
        BaseProcessor<LogRecord> defaultProcessor,
        BaseProcessor<LogRecord> paymentProcessor)
    {
        this.categoryPrefix = categoryPrefix ?? throw new ArgumentNullException(nameof(categoryPrefix));
        this.defaultProcessor = defaultProcessor ?? throw new ArgumentNullException(nameof(defaultProcessor));
        this.paymentProcessor = paymentProcessor ?? throw new ArgumentNullException(nameof(paymentProcessor));
    }

    public override void OnEnd(LogRecord data)
    {
        if (data.CategoryName?.StartsWith(this.categoryPrefix, StringComparison.Ordinal) == true)
        {
            this.paymentProcessor.OnEnd(data);
        }
        else
        {
            this.defaultProcessor.OnEnd(data);
        }
    }

    protected override bool OnForceFlush(int timeoutMilliseconds)
    {
        var result1 = this.defaultProcessor.ForceFlush(timeoutMilliseconds);
        var result2 = this.paymentProcessor.ForceFlush(timeoutMilliseconds);
        return result1 && result2;
    }

    protected override bool OnShutdown(int timeoutMilliseconds)
    {
        var result1 = this.defaultProcessor.Shutdown(timeoutMilliseconds);
        var result2 = this.paymentProcessor.Shutdown(timeoutMilliseconds);
        return result1 && result2;
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            this.defaultProcessor.Dispose();
            this.paymentProcessor.Dispose();
        }

        base.Dispose(disposing);
    }
}
```

### Registering the routing processor on the LoggerProvider

Register the routing processor on the `LoggerProvider`. Both loggers below share
the same `ILoggerFactory` and `LoggerProvider` pipeline, but their log records
are routed to different OTLP destinations based on category name:

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;

// Create two OTLP exporters pointing at different destinations.
var otlpExporter1 = new OtlpLogExporter(new OtlpExporterOptions
{
    Endpoint = new Uri("http://localhost:4317"), // OTLP destination 1
});

var otlpExporter2 = new OtlpLogExporter(new OtlpExporterOptions
{
    Endpoint = new Uri("http://localhost:4318"), // OTLP destination 2
});

// Wrap each exporter in a BatchLogRecordExportProcessor.
var defaultExportProcessor = new BatchLogRecordExportProcessor(otlpExporter1);
var paymentExportProcessor = new BatchLogRecordExportProcessor(otlpExporter2);

// Build the routing processor. Logs whose category name starts with
// "Payment." are sent to OTLP2; everything else goes to OTLP1.
var routingProcessor = new RoutingProcessor(
    categoryPrefix: "Payment.",
    defaultProcessor: defaultExportProcessor,
    paymentProcessor: paymentExportProcessor);

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddProcessor(routingProcessor);

        // Optional: also add a console exporter so you can see all logs locally.
        logging.AddConsoleExporter();
    });
});

// Both loggers share the same ILoggerFactory / LoggerProvider pipeline.
var orderLogger = loggerFactory.CreateLogger("Order.Processing");
var paymentLogger = loggerFactory.CreateLogger("Payment.Processing");

orderLogger.LogInformation("Processing order {OrderId}.", "ORD-001");     // --> OTLP1
paymentLogger.LogInformation("Processing payment {PaymentId}.", "PAY-001"); // --> OTLP2
orderLogger.LogInformation("Order {OrderId} completed.", "ORD-001");      // --> OTLP1

// Dispose logger factory before the application ends.
// This will flush the remaining logs and shutdown the logging pipeline.
loggerFactory.Dispose();
```

## Key considerations

- **Routing condition is evaluated per log record.** Keep the logic fast -- it
  runs synchronously on every log emit.
- **Lifecycle management.** Make sure the routing processor delegates
  `ForceFlush`, `Shutdown`, and `Dispose` to all inner processors so that every
  export pipeline is properly drained and cleaned up.
- **Single pipeline.** Because there is a single `ILoggerFactory` and
  `LoggerProvider`, this approach works well with dependency injection where
  components are not aware of multiple loggers.

## Further reading

- Full runnable example in the OpenTelemetry .NET repository:
  [`docs/logs/routing`](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/docs/logs/routing)
- [Routing](/docs/specs/otel/logs/supplementary-guidelines/#routing) in the
  OpenTelemetry specification supplementary guidelines
- [Setting up a dedicated logging pipeline](../dedicated-pipeline/) — an
  alternative when your application can use multiple `ILoggerFactory` instances
