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

First, create your basic ASP.NET Core site:

```shell
dotnet new mvc
```

Next, Add the Core OpenTelemetry packages

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

Now let's add the automatic instrumentation packages for ASP.NET Core. This will
give us some automatic spans for each HTTP request to our app.

```shell
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
```

_Note that as the Semantic Conventions for attribute names are not currently
stable the instrumentation package is currently not in a released state. That
doesn't mean that the functionality itself is not stable. This means that you
need to use the `--prerelease` flag, or install a specific version of the
package_

### Setup

Next, we need to add OpenTelemetry to our Service Collection in `Program.cs` so
that it's listening correctly.

```csharp
using System.Diagnostics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// .. other setup

builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
        tracerProviderBuilder
            .AddSource(DiagnosticsConfig.ActivitySource.Name)
            .ConfigureResource(resource => resource
                .AddService(DiagnosticsConfig.ServiceName))
            .AddAspNetCoreInstrumentation()
            .AddConsoleExporter());

// ... other setup

public static class DiagnosticsConfig
{
    public const string ServiceName = "MyService";
    public static ActivitySource ActivitySource = new ActivitySource(ServiceName);
}
```

At this stage, you should be able to run your site, and see a Console output
similar to this:

Note: an `Activity` in .NET is analogous to a Span in OpenTelemetry terminology

<details>
<summary>View example output</summary>

```
Activity.TraceId:            54d084eba205a7a39398df4642be8f4a
Activity.SpanId:             aca5e39a86a17d59
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: Microsoft.AspNetCore
Activity.DisplayName:        /
Activity.Kind:               Server
Activity.StartTime:          2023-02-21T12:19:28.2499974Z
Activity.Duration:           00:00:00.3106744
Activity.Tags:
    net.host.name: localhost
    net.host.port: 5123
    http.method: GET
    http.scheme: http
    http.target: /
    http.url: http://localhost:5123/
    http.flavor: 1.1
    http.user_agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.50
    http.status_code: 200
Resource associated with Activity:
    service.name: MyService
    service.instance.id: 2c7ca153-e460-4643-b550-7c08487a4c0c
```

</details>

### Manual Instrumentation

Next, add [tracing](/docs/concepts/signals/traces/#tracing-in-opentelemetry) via
the `System.Diagnostics` API.

Paste the following code into your `HomeController`'s `Index` action:

```csharp
public IActionResult Index()
{
    // Track work inside of the request
    using var activity = DiagnosticsConfig.Source.StartActivity("SayHello");
    activity?.SetTag("foo", 1);
    activity?.SetTag("bar", "Hello, World!");
    activity?.SetTag("baz", new int[] { 1, 2, 3 });

    return View();
}
```

When you run the app and navigate to the `/hello` route, you'll see output about
[spans](/docs/concepts/signals/traces/#spans-in-opentelemetry) similar to the
following:

<details>
<summary>View example output</summary>

```text
Activity.TraceId:            47d25efc8b5e9184ce57e692f5f65465
Activity.SpanId:             bb864adcf4592f54
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       acbff23f5ad721ff
Activity.ActivitySourceName: MyService
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2023-02-21T12:27:41.9596458Z
Activity.Duration:           00:00:00.0005683
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1,2,3]
Resource associated with Activity:
    service.name: MyService
    service.instance.id: 2b07a9ca-29c4-4e01-b0ed-929184b32192
```

</details>

You'll notice the `Activity` objects from ASP.NET Core alongside the `Activity`
we created manually in our controller action.

### Metrics

Next we'll add the ASP.NET Core automatically generated metrics to the app.

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;

var builder = WebApplication.CreateBuilder(args);

// .. other setup

builder.Services.AddOpenTelemetry()
    .WithTracing(/*  .. tracing setup */ )
    .WithMetrics(metricsProviderBuilder =>
        metricsProviderBuilder
            .ConfigureResource(resource => resource
                .AddService(DiagnosticsConfig.ServiceName))
            .AddAspNetCoreInstrumentation()
            .AddConsoleExporter());

// .. other setup
```

If you run your application now, you'll see a series of metrics output to the
console. like this.

<details>
<summary>View example output</summary>

```
Export http.server.duration, Measures the duration of inbound HTTP requests., Unit: ms, Meter: OpenTelemetry.Instrumentation.AspNetCore/1.0.0.0
(2023-02-21T12:38:57.0187781Z, 2023-02-21T12:44:16.9651349Z] http.flavor: 1.1 http.method: GET http.route: {controller=Home}/{action=Index}/{id?} http.scheme: http http.status_code: 200 net.host.name: localhost net.host.port: 5123 Histogram
Value: Sum: 373.4504 Count: 1 Min: 373.4504 Max: 373.4504
(-Infinity,0]:0
(0,5]:0
(5,10]:0
(10,25]:0
(25,50]:0
(50,75]:0
(75,100]:0
(100,250]:0
(250,500]:1
(500,750]:0
(750,1000]:0
(1000,2500]:0
(2500,5000]:0
(5000,7500]:0
(7500,10000]:0
(10000,+Infinity]:0

```

</details>

### Manual Metrics

Next, add some manual metrics to the app. This will initialize a
[Meter](/docs/concepts/signals/metrics) to create a counter in code.

```csharp
var builder = WebApplication.CreateBuilder(args);

// .. other setup

builder.Services.AddOpenTelemetry()
    .WithTracing(/*  .. tracing setup */ )
    .WithMetrics(metricsProviderBuilder =>
        metricsProviderBuilder
            .AddMeter(DiagnosticsConfig.Meter.Name)
			// .. more metrics
             );

public static class DiagnosticsConfig
{
    public const string ServiceName = "MyService";

    // .. other config

    public static Meter Meter = new(ServiceName);
    public static Counter<long> RequestCounter =
        Meter.CreateCounter<long>("app.request_counter");
}

```

Now we can increment the counter in our `Index` action.

```csharp
    public IActionResult Index()
    {
        // do other stuff

        DiagnosticsConfig.RequestCounter.Add(1,
            new("Action", nameof(Index)),
            new("Controller", nameof(HomeController)));

        return View();
    }
```

You'll notice here that we're also adding Tags (OpenTelemetry Attributes) to our request counter that
distinguishes it from other requests. You should now see an output like this.

<details>
<summary>View example output</summary>

```
Export app.request_counter, Meter: MyService
(2023-02-21T13:11:28.7265324Z, 2023-02-21T13:11:48.7074259Z] Action: Index Controller: HomeController LongSum
Value: 1
```

</details>

Tip: if you comment out the `.AddAspNetCoreInstrumentation()` line in
`Program.cs` you'll be able to see the output better.

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
docker run -p 4317:4317 \
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
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
        tracerProviderBuilder
             // .. other config
            .AddOtlpExporter())
    .WithMetrics(metricsProviderBuilder =>
        metricsProviderBuilder
            // .. other config
            .AddOtlpExporter());
```

By default, it will send spans to `localhost:4317`, which is what the collector
is listening on if you've followed the step above.

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
