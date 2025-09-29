---
title: Getting started with metrics - Console
linkTitle: Console
description:
  Learn how to use OpenTelemetry Metrics in a .NET Console application
weight: 10
cSpell:ignore: DiagnosticSource LongSum MyFruitCounter
---

This guide will show you how to get started with OpenTelemetry .NET Metrics in a
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

## Adding OpenTelemetry metrics

Install the OpenTelemetry Console Exporter package:

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

Update the `Program.cs` file with the following code:

```csharp
using System;
using System.Diagnostics.Metrics;
using OpenTelemetry;
using OpenTelemetry.Metrics;

// Define a meter
private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");

// Create a counter instrument
private static readonly Counter<long> MyFruitCounter = MyMeter.CreateCounter<long>("MyFruitCounter", "fruit", "Counts fruit by name and color");

// Configure the OpenTelemetry MeterProvider
using var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();

// Record some measurements
MyFruitCounter.Add(1, new("name", "apple"), new("color", "red"));
MyFruitCounter.Add(2, new("name", "lemon"), new("color", "yellow"));
MyFruitCounter.Add(1, new("name", "lemon"), new("color", "yellow"));
MyFruitCounter.Add(2, new("name", "apple"), new("color", "green"));
MyFruitCounter.Add(5, new("name", "apple"), new("color", "red"));
MyFruitCounter.Add(4, new("name", "lemon"), new("color", "yellow"));

Console.WriteLine("Press any key to exit");
Console.ReadKey();
```

Run the application again (using `dotnet run`) and you should see the metric
output from the console (metrics will be seen once the program ends), similar to
shown below:

```text
Export MyFruitCounter, Meter: MyCompany.MyProduct.MyLibrary/1.0
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:red name:apple LongSum
Value: 6
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:yellow name:lemon LongSum
Value: 7
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:green name:apple LongSum
Value: 2
```

Congratulations! You are now collecting metrics using OpenTelemetry.

## How it works

### Meter

The program creates a [Meter](/docs/specs/otel/metrics/api/#meter) instance
named "MyCompany.MyProduct.MyLibrary". A Meter is the entry point to create
metric instruments.

```csharp
private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");
```

### Counter instrument

It then creates a [Counter](/docs/specs/otel/metrics/api/#counter) instrument
from the Meter. A Counter is used to measure a non-decreasing value.

```csharp
private static readonly Counter<long> MyFruitCounter = MyMeter.CreateCounter<long>("MyFruitCounter");
```

### Recording measurements

The counter is used to report several metric measurements with different
attribute combinations:

```csharp
MyFruitCounter.Add(1, new("name", "apple"), new("color", "red"));
```

### MeterProvider configuration

An OpenTelemetry MeterProvider is configured to:

1. Subscribe to instruments from the specified Meter
2. Export the metrics to the console

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();
```

The MeterProvider aggregates the measurements in-memory with a default
cardinality limit of 2000 combinations of attributes.

## Handling high cardinality metrics

If you need to collect metrics with cardinality higher than the default limit of
2000, you can customize the cardinality limit:

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddView(instrumentName: "MyFruitCounter", new MetricStreamConfiguration { CardinalityLimit = 10 })
    .AddConsoleExporter()
    .Build();
```

## Metrics pipeline

The metrics pipeline in OpenTelemetry .NET follows this flow:

1. Instruments record measurements
2. MeterProvider receives and aggregates measurements
3. MetricReader reads aggregated metrics
4. Exporter exports metrics to a backend

## Special note about OpenTelemetry .NET

Metrics in OpenTelemetry .NET is a somewhat unique implementation, as most of
the [Metrics API](/docs/specs/otel/metrics/api/) is implemented by the .NET
runtime itself. From a high level, this means you can instrument your
application by simply depending on the `System.Diagnostics.DiagnosticSource`
package.

## Learn more

- [Getting Started with Prometheus and Grafana](/docs/languages/dotnet/metrics/getting-started-prometheus-grafana/)
- [Learning More About Instruments](/docs/languages/dotnet/metrics/instruments/)
- [Using Exemplars](/docs/languages/dotnet/metrics/exemplars/)
