---
title: Metric instruments
linkTitle: Instruments
description:
  Learn about the different types of metric instruments available in
  OpenTelemetry .NET
weight: 50
cSpell:ignore: kibibytes mebibytes updowncounter
---

This guide explains the different types of metric instruments available in
OpenTelemetry .NET and how to use them effectively.

## Understanding metric instruments

OpenTelemetry provides several types of instruments to measure different kinds
of data:

| Instrument Type | Behavior                                           | Typical Use Cases                 |
| --------------- | -------------------------------------------------- | --------------------------------- |
| Counter         | Monotonically increasing value                     | Request counts, error counts      |
| UpDownCounter   | Value that can increase or decrease                | Queue size, active connections    |
| Histogram       | Distribution of recorded values                    | Request durations, response sizes |
| Gauge           | Observation of a value at a specific point in time | CPU usage, memory usage           |

## Counter

A Counter records a value that is summed over time and never decreases. It's
ideal for metrics that only increase, such as request counts, completed
operations, or error counts.

### Creating a counter

```csharp
using System.Diagnostics.Metrics;

// Create a meter
var meter = new Meter("MyCompany.MyProduct", "1.0.0");

// Create a counter
var requestCounter = meter.CreateCounter<long>("request_counter", "requests", "Counts the number of requests");
```

### Recording measurements

```csharp
// Increment by 1
requestCounter.Add(1);

// Increment with attributes
requestCounter.Add(1, new("endpoint", "/api/users"), new("method", "GET"));
```

## UpDownCounter

An UpDownCounter records a value that can both increase and decrease,
representing a current value at a given time. It's useful for tracking values
like queue sizes, active connections, or resource pool usage.

### Creating an UpDownCounter

```csharp
// Create an up-down counter
var activeConnectionsCounter = meter.CreateUpDownCounter<int>("active_connections", "connections", "Number of active connections");
```

### Recording UpDownCounter measurements

```csharp
// Increment by 1
activeConnectionsCounter.Add(1);

// Decrement by 1
activeConnectionsCounter.Add(-1);

// With attributes
activeConnectionsCounter.Add(1, new("pool", "worker"), new("region", "west"));
```

## Histogram

A Histogram records a distribution of values, capturing statistics like count,
sum, min, max, and percentiles. It's ideal for measuring durations, sizes, and
other distributed values.

### Creating a histogram

```csharp
// Create a histogram
var requestDurationHistogram = meter.CreateHistogram<double>("request_duration", "ms", "Request duration in milliseconds");
```

### Recording histogram measurements

```csharp
// Record a duration
requestDurationHistogram.Record(213.5);

// With attributes
requestDurationHistogram.Record(42.3, new("endpoint", "/api/users"), new("method", "GET"));
```

## Observable instruments

Observable instruments allow you to collect measurements on-demand when metrics
are collected rather than recording them directly in your code. This is useful
for metrics that are better sampled periodically.

### Observable counter

```csharp
// Create an observable counter
meter.CreateObservableCounter("processed_items_total", () =>
{
    // Return the current count from some internal state
    return new Measurement<long>(GetCurrentProcessedCount(), new("queue", "default"));
}, "items", "Total number of processed items");
```

### Observable UpDownCounter

```csharp
// Create an observable up-down counter
meter.CreateObservableUpDownCounter("active_tasks", () =>
{
    // Return current values from internal state
    return new[]
    {
        new Measurement<int>(GetHighPriorityTaskCount(), new("priority", "high")),
        new Measurement<int>(GetLowPriorityTaskCount(), new("priority", "low"))
    };
}, "tasks", "Current number of active tasks");
```

### Observable gauge

```csharp
// Create an observable gauge
meter.CreateObservableGauge("cpu_usage", () =>
{
    // Get current CPU usage percentage
    return new Measurement<double>(GetCurrentCpuUsage());
}, "%", "Current CPU usage percentage");
```

## Batching observable measurements

You can also register a callback that returns multiple measurements for multiple
instruments:

```csharp
// Register a single callback for multiple observable instruments
var observableCounter = meter.CreateObservableCounter<long>("my_observable_counter", "items");
var observableGauge = meter.CreateObservableGauge<double>("my_observable_gauge", "%");

meter.RegisterObservableCallback(observableInstruments =>
{
    // Record a value for the counter
    observableInstruments.Observe(observableCounter, 42, new("type", "product_a"));

    // Record a value for the gauge
    observableInstruments.Observe(observableGauge, 12.3, new("resource", "cpu"));
}, observableCounter, observableGauge);
```

## Unit and description

When creating instruments, it's a good practice to specify the unit and
description:

```csharp
// Specify unit and description
var requestSizeHistogram = meter.CreateHistogram<long>(
    name: "http.request.size",
    unit: "By",  // bytes
    description: "Size of HTTP request in bytes"
);
```

Common units include:

- Time: `ms` (milliseconds), `s` (seconds), `min` (minutes)
- Bytes: `By` (bytes), `KiBy` (kibibytes), `MiBy` (mebibytes)
- Count: Typically unitless, or use specific units like `requests`

## Best practices

1. **Choose the right instrument** - Select the instrument type that best
   matches the behavior of the metric you're measuring
2. **Use meaningful names** - Follow
   [semantic conventions](/docs/specs/semconv/) for metric names
3. **Add descriptive attributes** - Use attributes to distinguish between
   different aspects of what you're measuring
4. **Be mindful of cardinality** - Too many unique attribute combinations can
   cause performance issues
5. **Reuse instruments** - Create instruments once and reuse them throughout
   your application
6. **Provide units and descriptions** - Always specify units and descriptions
   for better observability

## Learn more

- [OpenTelemetry Metric Instruments Specification](/docs/specs/otel/metrics/api/#instrument)
- [.NET Metrics API](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation)
