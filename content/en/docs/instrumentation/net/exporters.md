---
title: Exporters
weight: 4
---

In order to visualize and analyze your [traces](/docs/concepts/signals/traces/)
and metrics, you will need to export them to a backend.

## Console exporter

The console exporter is useful for development and debugging tasks, and is the
simplest to set up.

```
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry().WithTracing(b =>
{
    b.AddConsoleExporter()
    // The rest of your setup code goes here too
});
```

Otherwise, configure the exporter when creating a tracer provider:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddConsoleExporter()

    // Other setup code, like setting a resource goes here too

    .Build();
```

## OTLP endpoint

To send trace data to an OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to configure an OTLP exporter that sends to your endpoint.

```
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Extensions.Hosting
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithTracing(b =>
  {
    b.AddOtlpExporter()
    // The rest of your setup code goes here too
  });
```

This will, by default, send traces using gRPC to http://localhost:4317, to
customize this to use Http and the ProtoBuf format, you can add options like
this:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithTracing(b =>
{
    b
    .AddOtlpExporter(opt =>
    {
        opt.Endpoint = new Uri("your-endpoint-here");
        opt.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    // The rest of your setup code goes here too
});
```

Otherwise, configure the exporter when creating a tracer provider:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddOtlpExporter(opt =>
    {
        opt.Endpoint = new Uri("your-endpoint-here");
        opt.Protocol = OtlpExportProtocol.HttpProtobuf;
    })

    // Other setup code, like setting a resource goes here too

    .Build();
```

Use environment variables to set values like headers and an endpoint URL for
production.

### Note for .NET Core 3.1 and below and gRPC

Note: Versions below .NET 6 are not officially supported by
opentelemetry-dotnet, therefore this section is here to help, but may not work
as the library progresses.

If you're not using ASP.NET Core gRPC and you are running on .NET Core 3.x,
you'll need to add the following at application startup

```csharp
AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
```

If you are using .NET 5 or higher, the previous code sample is not required.

### Jaeger

To try out the OTLP exporter, you can run
[Jaeger](https://www.jaegertracing.io/) as an OTLP endpoint and for trace
visualization in a docker container:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

## Zipkin

If you are using [Zipkin](https://zipkin.io/) to visualize trace data, you'll
need to set it up first. This is how to run it in a docker container:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Next, install the Zipkin exporter package:

```shell
dotnet add package OpenTelemetry.Exporter.Zipkin
dotnet add package OpenTelemetry.Extensions.Hosting
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(b =>
    {
        b.AddZipkinExporter(o =>
        {
            o.Endpoint = new Uri("your-zipkin-uri-here");
        })
        // The rest of your setup code goes here too
    });
```

Otherwise, configure the exporter when creating a tracer provider:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddZipkinExporter(o =>
    {
        o.Endpoint = new Uri("your-zipkin-uri-here");
    })

    // Other setup code, like setting a resource goes here too

    .Build();
```

## Prometheus (Experimental)

**\*Note:** this is experimental and dependent on the OpenTelemetry
specification to be made stable before it will be a released package. For now,
we recommend using the OTLP exporter and using the OpenTelemetry Collector to
send metrics to Prometheus\*

If you're using Prometheus to visualize metrics data, you'll need to set it up
first. Here's how to do it using a docker container:

First, you'll need a `prometheus.yml` file to configure your Prometheus backend,
such as the following:

```yml
global:
  scrape_interval: 1s
  evaluation_interval: 1s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: [localhost:9090]
```

Next, run the following docker command to set up Prometheus:

```shell
docker run \
    -p 9090:9090 \
    -v ${PWD}/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

Next, install the Prometheus exporter:

### ASP.NET

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.AspNetCore --version 1.4.0-rc.4
dotnet add package OpenTelemetry.Extensions.Hosting
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithMetrics(b => b.AddPrometheusExporter());
```

You'll then need to add the endpoint so that Prometheus can scrape your site.
You can do this using the `IAppBuilder` extension like this:

```csharp
var builder = WebApplication.CreateBuilder(args);

// .. Setup

var app = builder.Build();

app.UseOpenTelemetryPrometheusScrapingEndpoint();

await app.RunAsync();
```

### Non-ASP.NET Core

For applications not using ASP.NET Core, you can use the `HttpListner` version
which is available in a different package:

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.HttpListener --version 1.4.0-rc.4
```

Then this is setup directly on the `MeterProviderBuilder`:

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(MyMeter.Name)
    .AddPrometheusHttpListener(
        options => options.UriPrefixes = new string[] { "http://localhost:9090/" })
    .Build();
```

Finally, register the Prometheus scraping middleware using the
`UseOpenTelemetryPrometheusScrapingEndpoint` extension method on
`IApplicationBuilder` :

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseOpenTelemetryPrometheusScrapingEndpoint();
```

Further details on configuring the Prometheus exporter can be found
[here](https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Exporter.Prometheus.AspNetCore/README.md).

## Next steps

To ensure you're getting the most data as easily as possible, install
[instrumentation libraries](/docs/instrumentation/net/libraries) to generate
observability data.

Additionally, enriching your codebase with
[manual instrumentation](/docs/instrumentation/net/manual) gives you customized
observability data.

You can also check the
[automatic instrumentation for .NET](/docs/instrumentation/net/automatic), which
is currently in beta.
