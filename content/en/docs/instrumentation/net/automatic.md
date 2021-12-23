--
title: Using instrumentation libraries
weight: 3
linkTitle: Libraries
--

.NET does not support truly automatic instrumentation like other languages today. Instead, you'll need to depend on
[instrumentation libraries](https://opentelemetry.io/docs/reference/specification/glossary/#instrumentation-library)
that generate telemetry data for a particular instrumented library.

For example, the instrumentation library for ASP.NET Core will automatically create spans that track inbound requests
once you configure it in your app/service.

## Setup

Each instrumentation library is a NuGet package, and installing them is typically done like so:

```
dotnet add package OpenTelemetry.Instrumentation.{library-name-or-type}
```

It is typically then registered at application startup time, such as when creating a TracerProvider.

## Example with ASP.NET Core and HttpClient

As an example, here's how you can automatically instrument inbound and output requests from an ASP.NET Core app.

First, get the appropriate packages:

```console
dotnet add package OpenTelemetry --prerelease
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
dotnet add package OpenTelemetry.Exporter.Console --prerelease
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
dotnet add package OpenTelemetry.Instrumentation.Http --prerelease
```

Next, configure each instrumentation library at startup and use them!

```csharp
using System.Diagnostics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Define some important constants and the activity source
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

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
    .AddAspNetCoreInstrumentation();
});

var app = builder.Build();

var httpClient = new HttpClient();

app.MapGet("/hello", async () =>
{
    var html = await httpClient.GetStringAsync("https://example.com/");
    if (string.IsNullOrWhiteSpace(html))
    {
        return "Hello, World!";
    }
    else
    {
        return "Hello, World!";
    }
});

app.Run();
```

When you run this code and access the `/hello` endpoint, it will:

* Start a new trace
* Automatically generate a span representing the request made to the endpoint
* Automatically generate a child span representing the HTTP GET made to `https://example.com/`

## Next steps

After you have observability generated automatically with instrumentation libraries, you may want to add
[manual instrumentation]({{< relref "manual" >}}) to collect custom telemetry data.
