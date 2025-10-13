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

{{% include "exporters/prometheus-setup.md" %}}

## Dependencies {#prometheus-dependencies}

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

## Usage {#prometheus-usage}

### ASP.NET Core {#prometheus-asp-net-core-usage}

Configure the exporter in your ASP.NET Core services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics.AddPrometheusExporter());
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

### Non-ASP.NET Core {#prometheus-non-asp-net-core-usage}

{{% alert color="warning" title="Warning" %}}

This component is intended for dev inner-loop, there is no plan to make it
production ready. Production environments should use
[`OpenTelemetry.Exporter.Prometheus.AspNetCore`](#prometheus-asp-net-core-usage),
or a combination of
[`OpenTelemetry.Exporter.OpenTelemetryProtocol`](#aspnet-core) and
[OpenTelemetry Collector](/docs/collector).

{{% /alert %}}

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

Finally, register the Prometheus scraping middleware using the
`UseOpenTelemetryPrometheusScrapingEndpoint` extension method on
`IApplicationBuilder` :

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseOpenTelemetryPrometheusScrapingEndpoint();
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
