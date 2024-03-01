---
title: Exporters
weight: 50
---

{{% docs/languages/exporters/intro dotnet %}}

### Dependencies {#otlp-dependencies}

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

### Usage

#### ASP.NET Core

Configure the exporters in your ASP.NET Core services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithTracing(b =>
  {
    b.AddOtlpExporter()
    // The rest of your setup code goes here too
  })
  .WithMetrics(metrics => {
    metrics.AddOtlpExporter
    // The rest of your setup code goes here
  });

builder.Logging
  .AddOpenTelemetry(logging => {
        logging.AddOtlpExporter()
  });
```

This will, by default, send telemetry using gRPC to <http://localhost:4317>, to
customize this to use HTTP and the protobuf format, you can add options like
this:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithTracing(b => {
    b
    .AddOtlpExporter(opt =>
    {
        opt.Endpoint = new Uri("your-endpoint-here/v1/traces");
        opt.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    // The rest of your setup code goes here too
  })
  .WithMetrics(metrics => metrics
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("your-endpoint-here/v1/metrics");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    // The rest of your setup code goes here too
  });

builder.Logging
  .AddOpenTelemetry(logging => {
        logging.AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("your-endpoint-here/v1/logs");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        })
  });
```

#### Non-ASP.NET Core

Configure the exporter when creating a `TracerProvider`, `MeterProvider` or
`LoggerFactory`:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddOtlpExporter(opt =>
    {
        opt.Endpoint = new Uri("your-endpoint-here/v1/traces");
        opt.Protocol = OtlpExportProtocol.HttpProtobuf;
    })

    // Other setup code, like setting a resource goes here too

    .Build();

using var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("your-endpoint-here/v1/metrics");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })

    // Other setup code, like setting a resource goes here too

    .Build();

using var loggerFactory = LoggerFactory.Create(builder =>
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

### Dependencies

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

### Usage {#console-usage}

#### ASP.NET Core {#console-usage-asp-net-core}

Configure the exporter in your ASP.NET Core services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing.AddConsoleExporter()
        // The rest of your setup code goes here too
    })
    .WithMetrics(metrics =>
        metrics.AddConsoleExporter()
        // The rest of your setup code goes here too
    });

builder.Logging.AddOpenTelemetry(logging => {
        logging.AddConsoleExporter()
  });
```

#### Non-ASP.NET Core {#console-usage-non-asp-net-core}

Configure the exporter when creating a `TracerProvider`, `MeterProvider` or
`LoggerFactory`:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddConsoleExporter()

    // Other setup code, like setting a resource goes here too

    .Build();

using var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddConsoleExporter()

    // Other setup code, like setting a resource goes here too

    .Build();

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddConsoleExporter()
    });
});
```

{{% docs/languages/exporters/jaeger %}}

{{% docs/languages/exporters/prometheus-setup %}}

### Dependencies {#prometheus-dependencies}

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

### Usage {#prometheus-usage}

#### ASP.NET Core {#prometheus-asp-net-core-usage}

Configure the exporter in your ASP.NET Core services:

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

#### Non-ASP.NET Core {#prometheus-non-asp-net-core-usage}

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

Further details on configuring the Prometheus exporter can be found
[here](https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Exporter.Prometheus.AspNetCore/README.md).

{{% docs/languages/exporters/zipkin-setup %}}

### Dependencies {#zipkin-dependencies}

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

### Usage {#zipkin-usage}

#### ASP.NET Core {#zipkin-asp-net-core-usage}

Configure the exporter in your ASP.NET Core services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing.AddZipkinExporter(options =>
        {
            options.Endpoint = new Uri("your-zipkin-uri-here");
        })
        // The rest of your setup code goes here too
    });
```

#### Non-ASP.NET Core {#zipkin-non-asp-net-core-usage}

Configure the exporter when creating a tracer provider:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddZipkinExporter(options =>
    {
        options.Endpoint = new Uri("your-zipkin-uri-here");
    })

    // Other setup code, like setting a resource goes here too

    .Build();
```
