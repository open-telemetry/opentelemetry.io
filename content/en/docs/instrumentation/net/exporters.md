---
title: Exporters
weight: 4
---

In order to visualize and analyze your
[traces](/docs/concepts/signals/traces/#tracing-in-opentelemetry) and metrics,
you will need to export them to a backend.

## Console exporter

The console exporter is useful for development and debugging tasks, and is the
simplest to set up.

```
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetryTracing(b =>
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
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetryTracing(b =>
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

### Using gRPC

You can also use gRPC to send your OTLP data. To do that, use the following:

```csharp
OtlpExportProtocol.Grpc
```

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
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
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
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetryTracing(b =>
{
    b
    .AddZipkinExporter(o =>
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

## Prometheus

If you're using Prometheus to visualize metrics data, you'll need to set it up
first. Here's how to do it using a docker container:

First, you'll need a `prometheus.yml` file to configure your Prometheus backend,
such as the following:

```yml
global:
  scrape_interval: 1s
  evaluation_interval: 1s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

Next, run the following docker command to set up Prometheus:

```shell
docker run \
    -p 9090:9090 \
    -v ${PWD}/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

Next, install the Prometheus exporter:

```
dotnet add package OpenTelemetry.Exporter.Prometheus
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetryMetrics(b =>
{
    b
    .AddPrometheusExporter(options =>
    {
        options.StartHttpListener = true;
        // Use your endpoint and port here
        options.HttpListenerPrefixes = new string[] { $"http://localhost:{9090}/" };
        options.ScrapeResponseCacheDurationMilliseconds = 0;
    })
    // The rest of your setup code goes here too
});
```

Otherwise, configure the exporter when creating a meter provider:

```csharp
using var tracerProvider = Sdk.CreateMeterProviderBuilder()
    .AddPrometheusExporter(options =>
    {
        options.StartHttpListener = true;
        // Use your endpoint and port here
        options.HttpListenerPrefixes = new string[] { $"http://localhost:{9090}/" };
        options.ScrapeResponseCacheDurationMilliseconds = 0;
    })

    // Other setup code, like setting a meter goes here

    .Build();
```

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
