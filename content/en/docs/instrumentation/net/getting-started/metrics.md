---
title: Metrics
description: Getting Started with OpenTelemetry .NET Metrics
weight: 4
code_block_from__path_base: content-modules/opentelemetry-dotnet/examples/
---

Install the required packages

```console
dotnet add package --prerelease OpenTelemetry
dotnet add package --prerelease OpenTelemetry.Exporter.Console
```

Update `Program.cs` with the following

{{% code_block_from file="ProgramMetrics.cs" from="8" %}}

Run the application

```console
dotnet run
```

You should see output similar to the following

{{% code_block_from file="ProgramMetrics.cs" lang="text" from="1" to="6" %}}


## What this program does

The program creates a [Meter][1] instance named `MyCompany.MyProduct.MyLibrary`
and then creates a [Counter][2] instrument from it. This counter is used to
report several metric measurements. An OpenTelemetry [MeterProvider][3] is
configured to subscribe to instruments from the Meter
`MyCompany.MyProduct.MyLibrary`, and aggregate the measurements in-memory. The
pre-aggregated metrics are exported to a `ConsoleExporter`.


## Implementation Special Note

Metrics in OpenTelemetry .NET is a somewhat unique implementation of the
OpenTelemetry project, as most of the Metrics API are incorporated directly
into the .NET runtime itself. From a high level, what this means is that you
can instrument your application by simply depending on
`System.Diagnostics.DiagnosticSource` package.


[1]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md#meter>
[2]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md#counter>
[3]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md#meterprovider>
