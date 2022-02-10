---
title: Metrics
description: Getting Started with OpenTelemetry .NET Metrics
weight: 4
---

1. Install the required packages

    ```console
    dotnet add package --prerelease OpenTelemetry
    dotnet add package --prerelease OpenTelemetry.Exporter.Console
    ```

1. Update `Program.cs` with the following

    {{< highlight csharp "linenos=true" >}}
using System.Diagnostics.Metrics;
using OpenTelemetry;
using OpenTelemetry.Metrics;

private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");
private static readonly Counter<long> MyCounter = MyMeter.CreateCounter<long>("MyCounter");

using var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(MyMeter.Name)
    .AddConsoleExporter()
    .Build();

MyCounter.Add(1, new("name", "apple"), new("color", "red"));
MyCounter.Add(2, new("name", "lemon"), new("color", "yellow"));
MyCounter.Add(1, new("name", "lemon"), new("color", "yellow"));
MyCounter.Add(2, new("name", "apple"), new("color", "green"));
MyCounter.Add(5, new("name", "apple"), new("color", "red"));
MyCounter.Add(4, new("name", "lemon"), new("color", "yellow"));
{{< /highlight >}}

1. Run the application

    ```console
    dotnet run
    ```

1. You should see output similar to the following

    ```text
    Export MyCounter, Meter: MyCompany.MyProduct.MyLibrary/1.0
    (2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z] color:red name:apple LongSum Value: 6
    (2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z] color:yellow name:lemon LongSum Value: 7
    (2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z] color:green name:apple LongSum Value: 2
    ```

## What this program does

The program creates a [Meter][1] instance named `MyCompany.MyProduct.MyLibrary`
and then creates a [Counter][2] instrument from it. This counter is used to
report several metric measurements. An OpenTelemetry [MeterProvider][3] is
configured to subscribe to instruments from the Meter
`MyCompany.MyProduct.MyLibrary`, and aggregate the measurements in-memory. The
pre-aggregated metrics are exported to a `ConsoleExporter`.

[1]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md#meter>
[2]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md#counter>
[3]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md#meterprovider>
