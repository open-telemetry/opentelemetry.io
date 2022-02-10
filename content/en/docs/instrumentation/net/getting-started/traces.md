---
title: Traces
description: Getting Started with OpenTelemetry .NET Tracing
weight: 3
---

1. Install the required packages

    ```console
    dotnet add package --prerelease OpenTelemetry
    dotnet add package --prerelease OpenTelemetry.Exporter.Console
    ```

1. Update `Program.cs` with the following

    {{< highlight csharp "linenos=true" >}}
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;

private static readonly ActivitySource MyActivitySource = new("MyCompany.MyProduct.MyLibrary");

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetSampler(new AlwaysOnSampler())
    .AddSource(MyActivitySource.Name)
    .AddConsoleExporter()
    .Build();

using var activity = MyActivitySource.StartActivity("SayHello")
activity?.SetTag("foo", 1);
activity?.SetTag("bar", "Hello, World!");
activity?.SetTag("baz", new int[] { 1, 2, 3 });
{{< /highlight >}}

1. Run the application

    ```console
    dotnet run
    ```

1. You should see output similar to the following

    ```text
    Activity.Id:          00-8389584945550f40820b96ce1ceb9299-745239d26e408342-01
    Activity.DisplayName: SayHello
    Activity.Kind:        Internal
    Activity.StartTime:   2020-08-12T15:59:10.4461835Z
    Activity.Duration:    00:00:00.0066039
    Activity.TagObjects:
        foo: 1
        bar: Hello, World!
        baz: [1, 2, 3]
    Resource associated with Activity:
        service.name: unknown_service:getting-started
    ```

## What this program does

The program creates an `ActivitySource` which represents an
[OpenTelemetry Tracer][1]. The `ActivitySource` instance is used to start an
`Activity` which represents an [OpenTelemetry Span][2]. An OpenTelemetry
[TracerProvider][3] is configured to subscribe to the `Activity`s from the
source `MyCompany.MyProduct.MyLibrary`, and export it to `ConsoleExporter`.

[1]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#tracer>
[2]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#span>
[3]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#tracerprovider>
