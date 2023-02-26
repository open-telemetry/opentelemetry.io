---
title: Getting Started
weight: 2
---

OpenTelemetry for .NET is unique among OpenTelemetry implementations, as it is
integrated with the .NET `System.Diagnostics` library. At a high level, you can
think of OpenTelemetry for .NET as a bridge between the telemetry available
through `System.Diagnostics` and the greater OpenTelemetry ecosystem, such as
OpenTelemetry Protocol (OTLP) and the OpenTelemetry Collector.

## ASP.NET Core

The following example demonstrates automatic and manual instrumentation via an
ASP.NET Core app.

First, install all the required packages:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
dotnet add package OpenTelemetry.Instrumentation.Http --prerelease
dotnet add package OpenTelemetry.Instrumentation.SqlClient --prerelease
```

Note that the `--prerelease` flag is required for all instrumentation packages
because they are all are pre-release.

This will also install the `OpenTelemetry` package.

### Tracing

Next, add [tracing](/docs/concepts/signals/traces/#tracing-in-opentelemetry) via
the `System.Diagnostics` API.

Paste the following code into your `Program.cs` file:

```csharp
using System.Diagnostics;

using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Define some important constants to initialize tracing with
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

// Configure important OpenTelemetry settings, the console exporter, and instrumentation library
builder.Services.AddOpenTelemetry().WithTracing(tracerProviderBuilder =>
{
    tracerProviderBuilder
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

When you run the app and navigate to the `/hello` route, you'll see output about
[spans](/docs/concepts/signals/traces/#spans-in-opentelemetry) similar to the
following:

<details>
<summary>View example output</summary>

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

</details>

This output has both the manually created span to track work in the route, and a
span created by the `OpenTelemetry.Instrumentation.AspNetCore` instrumentation
library that tracks the inbound ASP.NET Core request.

### Metrics

Next, add metrics to the app. This will initialize a
[Meter](/docs/concepts/signals/metrics) to create a counter in code. It also
configures automatic metrics instrumentation.

```csharp
using System.Diagnostics;
using System.Diagnostics.Metrics;

using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;

// Define some important constants to initialize tracing with
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

var MyActivitySource = new ActivitySource(serviceName);

var builder = WebApplication.CreateBuilder(args);

var appResourceBuilder = ResourceBuilder.CreateDefault()
    .AddService(serviceName: serviceName, serviceVersion: serviceVersion);

builder.Services.AddOpenTelemetry().WithTracing(tracerProviderBuilder =>
{
    tracerProviderBuilder
        .AddConsoleExporter()
        .AddSource(MyActivitySource.Name)
        .SetResourceBuilder(appResourceBuilder)
        .AddHttpClientInstrumentation()
        .AddAspNetCoreInstrumentation()
        .AddSqlClientInstrumentation();
});

var meter = new Meter(serviceName);
var counter = meter.CreateCounter<long>("app.request-counter");
builder.Services.AddOpenTelemetry().WithMetrics(metricProviderBuilder =>
{
    metricProviderBuilder
        .AddConsoleExporter()
        .AddMeter(meter.Name)
        .SetResourceBuilder(appResourceBuilder)
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation();
});

var app = builder.Build();

app.MapGet("/hello", () =>
{
    // Track work inside of the request
    using var activity = MyActivitySource.StartActivity("SayHello");
    activity?.SetTag("foo", 1);
    activity?.SetTag("bar", "Hello, World!");
    activity?.SetTag("baz", new int[] { 1, 2, 3 });

    // Up a counter for each request
    counter.Add(1);

    return "Hello, World!";
});

app.Run();
```

The output will be similar as with tracing, but now includes the request counter
and periodically exports a histogram of request times for each route.

<details>
<summary>View example output</summary>

```text
Activity.TraceId:            bdf32b90913015106be97242fbfca649
Activity.SpanId:             7dba8699cd7ae27c
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       c28199417929ae65
Activity.ActivitySourceName: MyCompany.MyProduct.MyService
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2022-11-16T06:09:37.7932050Z
Activity.Duration:           00:00:00.0018200
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1,2,3]
Resource associated with Activity:
    service.name: MyCompany.MyProduct.MyService
    service.version: 1.0.0
    service.instance.id: c1593668-d427-4e5d-a7a6-03c3dd4fa342

Activity.TraceId:            bdf32b90913015106be97242fbfca649
Activity.SpanId:             c28199417929ae65
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: OpenTelemetry.Instrumentation.AspNetCore
Activity.DisplayName:        /hello
Activity.Kind:               Server
Activity.StartTime:          2022-11-16T06:09:37.7878590Z
Activity.Duration:           00:00:00.0400410
Activity.Tags:
    http.host: localhost:7026
    http.method: GET
    http.scheme: https
    http.target: /hello
    http.url: https://localhost:7026/hello
    http.flavor: 1.1
    http.user_agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36
    http.status_code: 200
Resource associated with Activity:
    service.name: MyCompany.MyProduct.MyService
    service.version: 1.0.0
    service.instance.id: c1593668-d427-4e5d-a7a6-03c3dd4fa342

Export app.request-counter, Meter: MyCompany.MyProduct.MyService
(2022-11-16T06:09:04.2555860Z, 2022-11-16T06:09:44.2393710Z] LongSum
Value: 1

(2022-11-16T06:09:04.2574360Z, 2022-11-16T06:09:44.2393730Z] http.flavor: 1.1 http.host: localhost:7026 http.method: GET http.scheme: https http.status_code: 200 http.target: /hello Histogram
Value: Sum: 40.041 Count: 1
(-Infinity,0]:0
(0,5]:0
(0,10]:0
(0,25]:0
(0,50]:1
(0,75]:0
(0,100]:0
(0,250]:0
(0,500]:0
(0,750]:0
(0,1000]:0
(0,2500]:0
(0,5000]:0
(0,7500]:0
(0,10000]:0
(0,+Infinity]:0
```

</details>

## Send data to a collector

The [OpenTelemetry Collector](/docs/collector/getting-started/) is a vital
component of most production deployments. A collector is most beneficial in the
following situations, among others:

- A single telemetry sink shared by multiple services, to reduce overhead of
  switching exporters
- Aggregate traces across multiple services, running on multiple hosts
- A central place to process traces prior to exporting them to a backend

### Configure and run a local collector

First, save the following collector configuration code to a file in the `/tmp/`
directory:

```yaml
# /tmp/otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      http:
      grpc:
exporters:
  logging:
    loglevel: debug
processors:
  batch:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [logging]
      processors: [batch]
    metrics:
      receivers: [otlp]
      exporters: [logging]
      processors: [batch]
```

Then run the docker command to acquire and run the collector based on this
configuration:

```shell
docker run -p 4318:4318 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

You will now have an collector instance running locally.

### Modify the code to export spans via OTLP

The next step is to modify the code to send spans to the collector via OTLP
instead of the console.

First, add the following package:

```shell
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

Next, using the ASP.NET Core code from earlier, replace the console exporter
with an OTLP exporter:

```csharp
using System.Diagnostics;
using System.Diagnostics.Metrics;

using OpenTelemetry.Exporter;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Define some important constants to initialize tracing with
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";
var MyActivitySource = new ActivitySource(serviceName);

var builder = WebApplication.CreateBuilder(args);

var appResourceBuilder = ResourceBuilder.CreateDefault()
    .AddService(serviceName: serviceName, serviceVersion: serviceVersion);

// Configure to send data via the OTLP exporter.
// By default, it will send to port 4318, which the collector is listening on.
builder.Services.AddOpenTelemetry().WithTracing(tracerProviderBuilder =>
{
    tracerProviderBuilder
        .AddOtlpExporter(opt =>
        {
            opt.Protocol = OtlpExportProtocol.HttpProtobuf;
        })
        .AddSource(MyActivitySource.Name)
        .SetResourceBuilder(appResourceBuilder)
        .AddHttpClientInstrumentation()
        .AddAspNetCoreInstrumentation()
        .AddSqlClientInstrumentation();
});

var meter = new Meter(serviceName);
var counter = meter.CreateCounter<long>("app.request-counter");
builder.Services.AddOpenTelemetry().WithMetrics(metricProviderBuilder =>
{
    metricProviderBuilder
        .AddOtlpExporter(opt =>
        {
            opt.Protocol = OtlpExportProtocol.HttpProtobuf;
        })
        .AddMeter(meter.Name)
        .SetResourceBuilder(appResourceBuilder)
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation();
});

var app = builder.Build();

app.MapGet("/hello", () =>
{
    // Track work inside of the request
    using var activity = MyActivitySource.StartActivity("SayHello");
    activity?.SetTag("foo", 1);
    activity?.SetTag("bar", "Hello, World!");
    activity?.SetTag("baz", new int[] { 1, 2, 3 });

    // Up a counter for each request
    counter.Add(1);

    return "Hello, World!";
});

app.Run();
```

By default, it will send spans to `localhost:4318`, which is what the collector
is listening on.

### Run the application

Run the application like before:

```shell
dotnet run
```

Now, telemetry will be output by the collector process.

## Next steps

To ensure you're getting the most data as easily as possible, install
[instrumentation libraries](/docs/instrumentation/net/libraries) to generate
observability data.

Additionally, enriching your codebase with
[manual instrumentation](/docs/instrumentation/net/manual) gives you customized
observability data.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/net/exporters) to one or more
telemetry backends.

You can also check the
[automatic instrumentation for .NET](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation),
which is currently in beta.
