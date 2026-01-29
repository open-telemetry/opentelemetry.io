---
title: Exporters
weight: 50
---

{{% docs/languages/exporters/intro %}}

## Dependencies {#otlp-dependencies}

If you want to send telemetry data to an OTLP endpoint (like the
[OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) or
[Prometheus](#prometheus)), you can choose between two different protocols to
transport your data:

- HTTP/protobuf
- gRPC

Start by installing the
[`OpenTelemetry.Exporter.OpenTelemetryProtocol`](https://www.nuget.org/packages/OpenTelemetry.Exporter.OpenTelemetryProtocol/)
package as a dependency for your project:

```sh
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

If you're using ASP.NET Core install the
[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting)
package as well:

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

## Usage

### ASP.NET Core

Configure the exporters in your ASP.NET Core services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        // The rest of your setup code goes here
        .AddOtlpExporter())
    .WithMetrics(metrics => metrics
        // The rest of your setup code goes here
        .AddOtlpExporter());

builder.Logging.AddOpenTelemetry(logging => {
    // The rest of your setup code goes here
    logging.AddOtlpExporter();
});
```

This will, by default, send telemetry using gRPC to <http://localhost:4317>, to
customize this to use HTTP and the protobuf format, you can add options like
this:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        // The rest of your setup code goes here
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("your-endpoint-here/v1/traces");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        }))
    .WithMetrics(metrics => metrics
        // The rest of your setup code goes here
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("your-endpoint-here/v1/metrics");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        }));

builder.Logging.AddOpenTelemetry(logging => {
    // The rest of your setup code goes here
    logging.AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("your-endpoint-here/v1/logs");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    });
});
```

### Non-ASP.NET Core

Configure the exporter when creating a `TracerProvider`, `MeterProvider` or
`LoggerFactory`:

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    // Other setup code, like setting a resource goes here too
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("your-endpoint-here/v1/traces");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    .Build();

var meterProvider = Sdk.CreateMeterProviderBuilder()
    // Other setup code, like setting a resource goes here too
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("your-endpoint-here/v1/metrics");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("your-endpoint-here/v1/logs");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        })
    });
});
```

Use environment variables to set values like headers and an endpoint URL for
production.

## Console

## Dependencies

The console exporter is useful for development and debugging tasks, and is the
simplest to set up. Start by installing the
[`OpenTelemetry.Exporter.Console`](https://www.nuget.org/packages/OpenTelemetry.Exporter.Console/)
package as a dependency for your project:

```sh
dotnet add package OpenTelemetry.Exporter.Console
```

If you're using ASP.NET Core install the
[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting)
package as well:

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

## Usage {#console-usage}

### ASP.NET Core {#console-usage-asp-net-core}

Configure the exporter in your ASP.NET Core services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        // The rest of your setup code goes here
        .AddConsoleExporter()
    )
    .WithMetrics(metrics => metrics
        // The rest of your setup code goes here
        .AddConsoleExporter()
    );

builder.Logging.AddOpenTelemetry(logging => {
    // The rest of your setup code goes here
    logging.AddConsoleExporter();
});
```

### Non-ASP.NET Core {#console-usage-non-asp-net-core}

Configure the exporter when creating a `TracerProvider`, `MeterProvider` or
`LoggerFactory`:

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    // The rest of your setup code goes here
    .AddConsoleExporter()
    .Build();

var meterProvider = Sdk.CreateMeterProviderBuilder()
    // The rest of your setup code goes here
    .AddConsoleExporter()
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddConsoleExporter();
    });
});
```

{{% include "exporters/jaeger.md" %}}

## Prometheus

There are two approaches for exporting metrics to Prometheus:

1. **Using OTLP Exporter (Push)**: Push metrics to Prometheus using the OTLP
   protocol. This requires
   [Prometheus' OTLP Receiver](https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver)
   to be enabled. This is the recommended approach for production environments
   as it supports exemplars and is stable.

2. **Using Prometheus Exporter (Pull/Scrape)**: Expose a scraping endpoint in
   your application that Prometheus can scrape. This is the traditional
   Prometheus approach.

### Using OTLP Exporter (Push) {#prometheus-otlp}

This approach uses the OTLP exporter to push metrics directly to Prometheus'
OTLP receiver endpoint. This is recommended for production environments because
it supports exemplars and uses the stable OTLP protocol.

#### Dependencies {#prometheus-otlp-dependencies}

Install the
[`OpenTelemetry.Exporter.OpenTelemetryProtocol`](https://www.nuget.org/packages/OpenTelemetry.Exporter.OpenTelemetryProtocol/)
package as a dependency for your project:

```sh
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

If you're using ASP.NET Core install the
[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting)
package as well:

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

#### Usage {#prometheus-otlp-usage}

##### ASP.NET Core {#prometheus-otlp-asp-net-core-usage}

Configure the OTLP exporter to send metrics to Prometheus OTLP receiver:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        // The rest of your setup code goes here
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp/v1/metrics");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        }));
```

##### Non-ASP.NET Core {#prometheus-otlp-non-asp-net-core-usage}

Configure the exporter when creating a `MeterProvider`:

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    // Other setup code, like setting a resource goes here too
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp/v1/metrics");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    .Build();
```

{{% alert title=Note %}}

Make sure Prometheus is started with the OTLP receiver enabled:

```sh
./prometheus --web.enable-otlp-receiver
```

Or when using Docker:

```sh
docker run -p 9090:9090 prom/prometheus --web.enable-otlp-receiver
```

{{% /alert %}}

### Using Prometheus Exporter (Pull/Scrape) {#prometheus-exporter}

This approach exposes a metrics endpoint in your application (e.g., `/metrics`)
that Prometheus scrapes at regular intervals.

{{% alert color="warning" title="Warning" %}}

This exporter is still under development and doesn't support exemplars. For
production environments, consider using the
[OTLP exporter approach](#prometheus-otlp) instead.

{{% /alert %}}

#### Dependencies {#prometheus-dependencies}

Install the
[exporter package](https://www.nuget.org/packages/OpenTelemetry.Exporter.Prometheus.AspNetCore)
as a dependency for your application:

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.AspNetCore --version {{% version-from-registry exporter-dotnet-prometheus-aspnetcore %}}
```

If you're using ASP.NET Core install the
[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting)
package as well:

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

#### Usage {#prometheus-exporter-usage}

##### ASP.NET Core {#prometheus-exporter-asp-net-core-usage}

Configure the exporter in your ASP.NET Core services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics.AddPrometheusExporter());
```

You'll then need to register the Prometheus scraping middleware so that
Prometheus can scrape your application. Use the
`UseOpenTelemetryPrometheusScrapingEndpoint` extension method on
`IApplicationBuilder`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// ... Setup

var app = builder.Build();

app.UseOpenTelemetryPrometheusScrapingEndpoint();

await app.RunAsync();
```

By default, this exposes the metrics endpoint at `/metrics`. You can customize
the endpoint path or use a predicate function for more advanced configuration:

```csharp
app.UseOpenTelemetryPrometheusScrapingEndpoint(
    context => context.Request.Path == "/internal/metrics"
        && context.Connection.LocalPort == 5067);
```

##### Non-ASP.NET Core {#prometheus-exporter-non-asp-net-core-usage}

> [!WARNING]
>
> This component is intended for dev inner-loop, there is no plan to make it
> production ready. Production environments should use
> [`OpenTelemetry.Exporter.Prometheus.AspNetCore`](#prometheus-asp-net-core-usage),
> or a combination of
> [`OpenTelemetry.Exporter.OpenTelemetryProtocol`](#aspnet-core) and
> [OpenTelemetry Collector](/docs/collector).

For applications not using ASP.NET Core, you can use the `HttpListener` version
which is available in a
[different package](https://www.nuget.org/packages/OpenTelemetry.Exporter.Prometheus.HttpListener):

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.HttpListener --version {{% version-from-registry exporter-dotnet-prometheus-httplistener %}}
```

Then this is setup directly on the `MeterProviderBuilder`:

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(MyMeter.Name)
    .AddPrometheusHttpListener(
        options => options.UriPrefixes = new string[] { "http://localhost:9464/" })
    .Build();
```

#### Prometheus Configuration (Scrape)

When using the Prometheus exporter (pull/scrape approach), you need to configure
Prometheus to scrape your application. Add the following to your
`prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'your-app-name'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:5000'] # Your application's host:port
```

For more details on configuring the Prometheus exporter, see
[OpenTelemetry.Exporter.Prometheus.AspNetCore](https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Exporter.Prometheus.AspNetCore/README.md).

{{% include "exporters/zipkin-setup.md" %}}

## Dependencies {#zipkin-dependencies}

To send your trace data to [Zipkin](https://zipkin.io/), install the
[exporter package](https://www.nuget.org/packages/OpenTelemetry.Exporter.Zipkin)
as a dependency for your application:

```shell
dotnet add package OpenTelemetry.Exporter.Zipkin
```

If you're using ASP.NET Core install the
[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting)
package as well:

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

## Usage {#zipkin-usage}

### ASP.NET Core {#zipkin-asp-net-core-usage}

Configure the exporter in your ASP.NET Core services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        // The rest of your setup code goes here
        .AddZipkinExporter(options =>
        {
            options.Endpoint = new Uri("your-zipkin-uri-here");
        }));
```

### Non-ASP.NET Core {#zipkin-non-asp-net-core-usage}

Configure the exporter when creating a tracer provider:

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    // The rest of your setup code goes here
    .AddZipkinExporter(options =>
    {
        options.Endpoint = new Uri("your-zipkin-uri-here");
    })
    .Build();
```
