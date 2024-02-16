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

Start by installing the respective exporter package as a dependency for your
project:

```sh
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Extensions.Hosting
```

### Usage

If you're using ASP.NET Core, configure the exporters in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithTracing(b =>
  {
    b.AddOtlpExporter()
    // The rest of your setup code goes here too
  })
  .WithMetrics(b => {
    b.AddOtlpExporter
    // The rest of your setup code goes here
  });

builder.Logging
  .AddOpenTelemetry(options => {
        options.AddOtlpExporter()
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
  .WithMetrics(b => {
    b
    .AddOtlpExporter(opt =>
    {
        opt.Endpoint = new Uri("your-endpoint-here/v1/metrics");
        opt.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    // The rest of your setup code goes here too
  });

builder.Logging
  .AddOpenTelemetry(options => {
        options.AddOtlpExporter(opt =>
        {
            opt.Endpoint = new Uri("your-endpoint-here/v1/logs");
            opt.Protocol = OtlpExportProtocol.HttpProtobuf;
        })
  });
```

Otherwise, configure the exporter when creating a tracer provider:

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
    .AddOtlpExporter(opt =>
    {
        opt.Endpoint = new Uri("your-endpoint-here/v1/metrics");
        opt.Protocol = OtlpExportProtocol.HttpProtobuf;
    })

    // Other setup code, like setting a resource goes here too

    .Build();

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options =>
    {
        options.AddOtlpExporter(opt =>
        {
            opt.Endpoint = new Uri("your-endpoint-here/v1/logs");
            opt.Protocol = OtlpExportProtocol.HttpProtobuf;
        })
    });
});
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

## Console

The console exporter is useful for development and debugging tasks, and is the
simplest to set up.

```sh
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

If you're using ASP.NET Core, configure the exporter in your ASP.NET Core
services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(b =>
    {
        b.AddConsoleExporter()
        // The rest of your setup code goes here too
    })
    .WithMetrics(b =>
        b.AddConsoleExporter()
        // The rest of your setup code goes here too
    });

builder.Logging
  .AddOpenTelemetry(options => {
        options.AddConsoleExporter()
  });
```

Otherwise, configure the exporter when creating a tracer provider:

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
    builder.AddOpenTelemetry(options =>
    {
        options.AddConsoleExporter()
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
