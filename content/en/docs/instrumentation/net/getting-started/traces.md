---
title: Traces
description: Getting Started with OpenTelemetry .NET Tracing
weight: 3
code_block_from__path_base: content-modules/opentelemetry-dotnet/examples/
---

Install the required packages

```console
dotnet add package --prerelease OpenTelemetry
dotnet add package --prerelease OpenTelemetry.Exporter.Console
```

Update `Program.cs` with the following

{{% code_block_from file="ProgramTraces.cs" from="15" show-file=false %}}

Run the application

```console
dotnet run
```

You should see output similar to the following

{{% code_block_from file="ProgramTraces.cs" lang="text" from="1" to="13" show-file=false %}}


## What this program does

The program creates an `ActivitySource` which represents an
[OpenTelemetry Tracer][1]. The `ActivitySource` instance is used to start an
`Activity` which represents an [OpenTelemetry Span][2]. An OpenTelemetry
[TracerProvider][3] is configured to subscribe to the `Activity`s from the
source `MyCompany.MyProduct.MyLibrary`, and export it to `ConsoleExporter`.


[1]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#tracer>
[2]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#span>
[3]: <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#tracerprovider>
