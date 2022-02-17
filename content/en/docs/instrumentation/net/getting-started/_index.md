---
title: Getting Started
weight: 2
code_block_from__path_base: content-modules/opentelemetry-dotnet/examples/
---

OpenTelemetry .NET is unique among OpenTelemetry implementations, as it is
integrated with the .NET `System.Diagnostics` library. At a high level, you can
think of OpenTelemetry for .NET as a bridge between the telemetry available
through `System.Diagnostics` and the greater OpenTelemetry ecosystem, such as
OpenTelemetry Protocol (OTLP) and the OpenTelemetry Collector.


## Installation

OpenTelemetry is available as a [NuGet package][1]. Install it with your
preferred package manager client.


## .NET

If using .NET Core, you can follow these getting started pages to manually
instrument your application

- [Logs]({{< relref "logs" >}})
- [Traces]({{< relref "traces" >}})
- [Metrics]({{< relref "metrics" >}})


## .NET Framework

If using .NET Framework, you can follow [this page]({{< relref "../netframework" >}}).


## ASP.NET Core

If using ASP.NET Core, follow this sample which demonstrates both automatic and
manual tracing.

Install the required packages

```console
dotnet add package --prerelease OpenTelemetry
dotnet add package --prerelease OpenTelemetry.Extensions.Hosting
dotnet add package --prerelease OpenTelemetry.Exporter.Console
dotnet add package --prerelease OpenTelemetry.Instrumentation.AspNetCore
dotnet add package --prerelease OpenTelemetry.Instrumentation.Http
dotnet add package --prerelease OpenTelemetry.Instrumentation.SqlClient
```

Update `Program.cs` with the following

{{% code_block_from file="ProgramAspNetTraces.cs" from="37" show-file=false %}}

Run the application and navigate to the `/hello` route. You should see
output similar to the following

{{% code_block_from file="ProgramAspNetTraces.cs" lang="text" from="1" to="35" show-file=false %}}


### What this program does

The program creates a web application with OpenTelemetry tracing. This output
has both the child span created to track work in the route, and an
automatically-created span that tracks the inbound ASP.NET Core request itself.


## Next Steps

To ensure you're getting the most data as easily as possible, install some
[instrumentation libraries]({{< relref "../automatic" >}}) to automatically
generate observability data.

Additionally, enriching your instrumentation generated automatically with
[manual instrumentation]({{< relref "../manual" >}}) of your own codebase
gets you customized observability data.

You’ll also want to configure an appropriate exporter to
[export your telemetry data]({{< relref "../exporters" >}}) to one or more
telemetry backends.


[1]: <https://www.nuget.org/packages/OpenTelemetry>
