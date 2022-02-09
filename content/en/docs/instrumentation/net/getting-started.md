---
title: Getting Started
weight: 2
---

OpenTelemetry for .NET is unique among OpenTelemetry implementations, as it is
integrated with the .NET `System.Diagnostics` library. At a high level, you can
think of OpenTelemetry for .NET as a bridge between the telemetry available
through `System.Diagnostics` and the greater OpenTelemetry ecosystem, such as
OpenTelemetry Protocol (OTLP) and the OpenTelemetry Collector. 

## Installation

OpenTelemetry is available as a [NuGet
package](https://www.nuget.org/packages/OpenTelemetry/). Install it with your
preferred package manager client.

For example, using the .NET CLI:

```console
dotnet add package OpenTelemetry
```

## Console application

The following sample demonstrates manual tracing via a console app.

First, install required packages:

```console
$ dotnet add package OpenTelemetry
$ dotnet add package OpenTelemetry.Exporter.Console
```

Next, paste the following code into your `Program.cs` file:

```csharp
using System.Diagnostics;

using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

// Define some important constants and the activity source
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

// Configure important OpenTelemetry settings and the console exporter
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

var MyActivitySource = new ActivitySource(serviceName);

using var activity = MyActivitySource.StartActivity("SayHello");
activity?.SetTag("foo", 1);
activity?.SetTag("bar", "Hello, World!");
activity?.SetTag("baz", new int[] { 1, 2, 3 });
```

The code will generate a single span like this:

```
Activity.Id:          00-cf0e89a41682d0cc7a132277da6a45d6-c714dd3b15e21378-01
Activity.ActivitySourceName: MyCompany.MyProduct.myService
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2021-12-20T23:48:02.0467598Z
Activity.Duration:    00:00:00.0008508
Activity.TagObjects:
    foo: 1
    bar: Hello, World!
    baz: [1, 2, 3]
Resource associated with Activity:
    service.name: MyCompany.MyProduct.myService
    service.version: 1.0.0
    service.instance.id: 20c891c2-94b4-4203-a960-93a22e837a32
```

This output matches the span created in the preceding code sample.

## ASP.NET Core

The following sample demonstrates automatic and manual tracing with ASP.NET
Core.

First, install requried packages:

```console
$ dotnet add package OpenTelemetry --prerelease
$ dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
$ dotnet add package OpenTelemetry.Exporter.Console --prerelease
$ dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
$ dotnet add package OpenTelemetry.Instrumentation.Http --prerelease
$ dotnet add package OpenTelemetry.Instrumentation.SqlClient --prerelease
```

Next, paste the following code into your `Program.cs` file:

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
    .AddAspNetCoreInstrumentation()
    .AddSqlClientInstrumentation();
});

var app = builder.Build();

var MyActivitySource = new ActivitySource(serviceName);

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
```

When you run the app and navigate to the `/hello` route, you'll see output
similar to the following:

```
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

This output has both the span created to track work in the route, and an
automatically-created span that tracks the inbound ASP.NET Core request itself.

## Next steps

To ensure you're getting the most data as easily as possible, install some
[instrumentation libraries]({{< relref "automatic" >}}) to automatically
generate observability data.

Additionally, enriching your instrumentation generated automatically with
[manual instrumentation]({{< relref "manual" >}}) of your own codebase gets you
customized observability data.

You'll also want to configure an appropriate exporter to [export your telemetry
data]({{< relref "exporters" >}}) to one or more telemetry backends.
