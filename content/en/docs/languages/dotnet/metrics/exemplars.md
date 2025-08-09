---
title: Using exemplars
linkTitle: Exemplars
description:
  Learn how to use exemplars to link metrics with traces in OpenTelemetry .NET
weight: 40
---

[Exemplars](/docs/specs/otel/metrics/sdk/#exemplar) are example data points for
aggregated data. They provide specific context to otherwise general
aggregations. One common use case is to gain the ability to correlate metrics to
traces (and logs).

This guide demonstrates how to use exemplars with OpenTelemetry .NET to connect
metrics and traces, using Prometheus, Jaeger, and Grafana.

## What are exemplars?

Exemplars represent individual measurements that are part of an aggregated
metric. They allow you to:

- Link metrics to traces that were active when the measurement was taken
- Identify outliers or interesting data points within aggregated metrics
- Better understand the causes of metric changes by exploring associated traces

## Components used in this guide

- **OpenTelemetry .NET SDK**: Instrumentation for your application
- **Prometheus**: Metrics backend that supports exemplars
- **Jaeger**: Distributed tracing backend
- **Grafana**: UI to query metrics and traces, and navigate between them using
  exemplars

## Setup

### Install and run Jaeger

1. Download the
   [latest binary distribution](https://www.jaegertracing.io/download/) of
   Jaeger
2. Extract it to a local directory
3. Run the `jaeger-all-in-one(.exe)` executable:

```shell
./jaeger-all-in-one --collector.otlp.enabled
```

### Install and run Prometheus

1. Download the [latest release](https://prometheus.io/download/) of Prometheus
2. Extract it to a local directory
3. Run Prometheus with the required feature flags:

```shell
./prometheus --enable-feature=exemplar-storage --web.enable-otlp-receiver
```

### Install and configure Grafana

1. Follow the
   [operating system specific instructions](https://grafana.com/docs/grafana/latest/setup-grafana/installation/#supported-operating-systems)
   to install Grafana
2. Start the Grafana server
3. Open [http://localhost:3000/](http://localhost:3000/) in your browser
4. Log in with the default credentials (admin/admin)
5. Configure data sources:

#### Jaeger data source

1. Navigate to Configuration > Data sources
2. Add a Jaeger data source
3. Set "URL" to `http://localhost:16686/`
4. Click "Save & test"

#### Prometheus data source

1. Navigate to Configuration > Data sources
2. Add a Prometheus data source
3. Set "URL" to `http://localhost:9090`
4. Under "Exemplars", enable "Internal link"
5. Set "Data source" to `Jaeger` and "Label name" to `trace_id`
6. Click "Save & test"

## Instrument your application

Here's an example of how to instrument a .NET application with OpenTelemetry,
enabling exemplars:

```csharp
using System;
using System.Diagnostics;
using System.Threading;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Create a resource with service information
var resource = ResourceBuilder.CreateDefault()
    .AddService(serviceName: "exemplars-demo", serviceVersion: "1.0.0");

// Create a tracer provider
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(resource)
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddOtlpExporter(options => options.Endpoint = new Uri("http://localhost:4317"))
    .Build();

// Create a meter provider with exemplar support
using var meterProvider = Sdk.CreateMeterProviderBuilder()
    .SetResourceBuilder(resource)
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .SetExemplarFilter(ExemplarFilterType.TraceBased)  // Enable trace-based exemplars
    .AddOtlpExporter(options => options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp"))
    .Build();

// Create activity source and meter
var activitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");
var meter = new Meter("MyCompany.MyProduct.MyLibrary");

// Create a histogram instrument for recording measurements
var histogram = meter.CreateHistogram<double>("MyHistogram", unit: "ms", description: "Example histogram");

var random = new Random();

// Generate sample data
for (int i = 0; i < 100; i++)
{
    // Start an activity (span)
    using (var activity = activitySource.StartActivity("ProcessData"))
    {
        // Add some attributes to the activity
        activity?.SetTag("iteration", i);

        // Simulate work
        var value = random.NextDouble() * 100;
        Thread.Sleep((int)value);

        // Record a measurement - this will include exemplar with trace context
        // because we set ExemplarFilterType.TraceBased and have an active activity
        histogram.Record(value);
    }

    // Sleep between iterations
    Thread.Sleep(100);
}

Console.WriteLine("Application running and sending data. Press any key to exit.");
Console.ReadKey();
```

## Viewing exemplars in Grafana

1. Open Grafana and navigate to Explore
2. Select Prometheus as the data source
3. Query the `MyHistogram_bucket` metric
4. Toggle on the "Exemplars" option and refresh the query

Exemplars will appear as diamond-shaped dots on the metric chart. When you click
on an exemplar, you'll see details including:

- The timestamp when the measurement was recorded
- The raw value
- The trace context (trace_id)

You can click on "Query with Jaeger" next to the trace_id to view the associated
trace, giving you insight into what was happening when that specific measurement
was taken.

## How exemplars work in OpenTelemetry .NET

When you configure the SDK with
`SetExemplarFilter(ExemplarFilterType.TraceBased)`, the SDK attaches trace
information (trace ID, span ID) to metric measurements that occur within the
context of an active span. This allows the metrics backend to store these
exemplars and link them back to the corresponding traces.

By default, not all measurements are stored as exemplars (that would be
inefficient). The backend typically uses sampling strategies to decide which
measurements to store as exemplars.

## Learn more

- [OpenTelemetry Exemplar Specification](/docs/specs/otel/metrics/sdk/#exemplar)
- [Prometheus Exemplars](https://prometheus.io/docs/prometheus/latest/feature_flags/#exemplars-storage)
- [Jaeger Tracing](https://www.jaegertracing.io/)
- [Grafana Exemplars Documentation](https://grafana.com/docs/grafana/latest/fundamentals/exemplars/)
