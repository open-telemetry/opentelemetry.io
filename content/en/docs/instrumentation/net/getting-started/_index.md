---
title: Getting Started
weight: 2
---

OpenTelemetry .NET is unique among OpenTelemetry implementations, as it is integrated with the .NET `System.Diagnostics` library. At a high level, you can think of OpenTelemetry for .NET as a bridge between the telemetry available through `System.Diagnostics` and the greater OpenTelemetry ecosystem, such as OpenTelemetry Protocol (OTLP) and the OpenTelemetry Collector. 

## Installation

OpenTelemetry is available as a [NuGet package][1]. Install it with your preferred package manager client.

## .NET Core

If using .NET Core, you can follow the pages in this section to manually instrument Logs, Traces, and Metrics.

## ASP.NET Core

The following sample demonstrates automatic and manual tracing with ASP.NET Core.

1. Install the required packages

    ```console
    dotnet add package --prerelease OpenTelemetry
    dotnet add package --prerelease OpenTelemetry.Extensions.Hosting
    dotnet add package --prerelease OpenTelemetry.Exporter.Console
    dotnet add package --prerelease OpenTelemetry.Instrumentation.AspNetCore
    dotnet add package --prerelease OpenTelemetry.Instrumentation.Http
    dotnet add package --prerelease OpenTelemetry.Instrumentation.SqlClient
    ```

1. Update `Program.cs` with the following

    {{< highlight csharp "linenos=true" >}}
using System.Diagnostics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Define some important constants and the activity source
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";
var MyActivitySource = new ActivitySource(serviceName);

var builder = WebApplication.CreateBuilder(args);

// Configure important OpenTelemetry settings, the console exporter, and automatic instrumentation
builder.Services.AddOpenTelemetryTracing(b =>
{
    b
    .AddConsoleExporter()
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddHttpClientInstrumentation()
    .AddAspNetCoreInstrumentation()
    .AddSqlClientInstrumentation();
});

var app = builder.Build();

app.MapGet("/hello", () =>
{
    // Track work inside of the request
    using var activity = MyActivitySource.StartActivity("SayHello");
    activity?.SetTag("foo", 1);
    activity?.SetTag("bar", "Hello, World!");
    activity?.SetTag("baz", new int[] { 1, 2, 3 });

    return "Hello, World!";
});

app.Run();
{{< /highlight >}}

1. Run the application and navigate to the `/hello` route. You should see output similar to the following

    ```text
    Activity.Id:          00-d72f7e51dd06b57211f415489df89b1c-c8a394817946316d-01
    Activity.ParentId:    00-d72f7e51dd06b57211f415489df89b1c-e1c9fde6c8f415ad-01
    Activity.ActivitySourceName: MyCompany.MyProduct.MyServiceActivity.DisplayName: SayHello
    Activity.Kind:        Internal
    Activity.StartTime:   2021-12-21T01:15:27.5712866Z
    Activity.Duration:    00:00:00.0000487
    Activity.TagObjects:
        foo: 1
        bar: Hello, World!
        baz: [1, 2, 3]
    Resource associated with Activity:
        service.name: MyCompany.MyProduct.MyService
        service.version: 1.0.0
        service.instance.id: 45aacfb0-e117-40cb-9d4d-9bcca661f6dd

    Activity.Id:          00-d72f7e51dd06b57211f415489df89b1c-e1c9fde6c8f415ad-01
    Activity.ActivitySourceName: OpenTelemetry.Instrumentation.AspNetCore
    Activity.DisplayName: /hello
    Activity.Kind:        Server
    Activity.StartTime:   2021-12-21T01:15:27.5384997Z
    Activity.Duration:    00:00:00.0429197
    Activity.TagObjects:
        http.host: localhost:7207
        http.method: GET
        http.target: /hello
        http.url: https://localhost:7207/hello
        http.user_agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36
        http.status_code: 200
        otel.status_code: UNSET
    Resource associated with Activity:
        service.name: MyCompany.MyProduct.MyService
        service.version: 1.0.0
        service.instance.id: 45aacfb0-e117-40cb-9d4d-9bcca661f6dd
    ```

### What this program does

This output has both the child span created to track work in the route, and an automatically-created span that tracks the inbound ASP.NET Core request itself.
<!-- TODO improve this explanation -->

## Next Steps

To ensure you're getting the most data as easily as possible, install some [instrumentation libraries]({{< relref "../automatic" >}}) to automatically
generate observability data.

Additionally, enriching your instrumentation generated automatically with [manual instrumentation]({{< relref "../manual" >}}) of your own codebase
gets you customized observability data.

You’ll also want to configure an appropriate exporter to [export your telemetry data]({{< relref "../exporters" >}}) to one or more telemetry backends.

[1]: <https://www.nuget.org/packages/OpenTelemetry>
