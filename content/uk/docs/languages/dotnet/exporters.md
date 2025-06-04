---
title: Експортери
weight: 50
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

{{% docs/languages/exporters/intro %}}

### Залежності {#otlp-dependencies}

Якщо ви хочете надсилати телеметричні дані на точку доступу OTLP (наприклад, [OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) або [Prometheus](#prometheus)), ви можете вибрати між двома різними протоколами для транспортування ваших даних:

- HTTP/protobuf
- gRPC

Почніть з встановлення пакунка [`OpenTelemetry.Exporter.OpenTelemetryProtocol`](https://www.nuget.org/packages/OpenTelemetry.Exporter.OpenTelemetryProtocol/) як залежності для вашого проєкту:

```sh
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

Якщо ви використовуєте ASP.NET Core, встановіть також пакунок [`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting):

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

### Використання {#usage}

#### ASP.NET Core

Налаштуйте експортери у своїх службах ASP.NET Core:

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

Це стандартно надсилатиме телеметрію за допомогою gRPC на <http://localhost:4317>, щоб налаштувати це для використання HTTP та формату protobuf, ви можете додати опції таким чином:

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

#### Non-ASP.NET Core

Налаштуйте експортер під час створення `TracerProvider`, `MeterProvider` або
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

Використовуйте змінні середовища для встановлення значень, таких як заголовки та URL точки для доступу для промислового використання.

## Консоль {#console}

### Залежності {#dependencies}

Консольний експортер корисний для розробки та налагодження, і є найпростішим для налаштування. Почніть з встановлення пакунка [`OpenTelemetry.Exporter.Console`](https://www.nuget.org/packages/OpenTelemetry.Exporter.Console/) як залежності для вашого проєкта:

```sh
dotnet add package OpenTelemetry.Exporter.Console
```

Якщо ви використовуєте ASP.NET Core, встановіть також пакунок [`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting):

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

### Використання {#console-usage}

#### ASP.NET Core {#console-usage-asp-net-core}

Налаштуйте експортер у своїх службах ASP.NET Core:

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

#### Non-ASP.NET Core {#console-usage-non-asp-net-core}

Налаштуйте експортер під час створення `TracerProvider`, `MeterProvider` або
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

### Залежності {#prometheus-dependencies}

Встановіть [пакунок експортера](https://www.nuget.org/packages/OpenTelemetry.Exporter.Prometheus.AspNetCore) як залежність для вашого застосунку:

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.AspNetCore --version {{% version-from-registry exporter-dotnet-prometheus-aspnetcore %}}
```

Якщо ви використовуєте ASP.NET Core, встановіть також пакунок [`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting):

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

### Використання {#prometheus-usage}

#### ASP.NET Core {#prometheus-asp-net-core-usage}

Налаштуйте експортер у своїх службах ASP.NET Core:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics.AddPrometheusExporter());
```

Потім вам потрібно додати точку доступу, щоб Prometheus міг сканувати ваш сайт. Ви можете зробити це за допомогою розширення `IAppBuilder` таким чином:

```csharp
var builder = WebApplication.CreateBuilder(args);

// .. Setup

var app = builder.Build();

app.UseOpenTelemetryPrometheusScrapingEndpoint();

await app.RunAsync();
```

#### Non-ASP.NET Core {#prometheus-non-asp-net-core-usage}

{{% alert color="warning" title="Попередження" %}}

Цей компонент призначений для внутрішнього циклу розробки, немає планів зробити його готовим до промислового використання. Промислові середовища повинні використовувати [`OpenTelemetry.Exporter.Prometheus.AspNetCore`](#prometheus-asp-net-core-usage), або комбінацію [`OpenTelemetry.Exporter.OpenTelemetryProtocol`](#aspnet-core) та [OpenTelemetry Collector](/docs/collector).

{{% /alert %}}

Для застосунків, які не використовують ASP.NET Core, ви можете використовувати версію `HttpListener`, яка доступна в [іншому пакунку](https://www.nuget.org/packages/OpenTelemetry.Exporter.Prometheus.HttpListener):

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.HttpListener --version {{% version-from-registry exporter-dotnet-prometheus-httplistener %}}
```

Потім це налаштовується безпосередньо на `MeterProviderBuilder`:

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(MyMeter.Name)
    .AddPrometheusHttpListener(
        options => options.UriPrefixes = new string[] { "http://localhost:9464/" })
    .Build();
```

Нарешті, зареєструйте проміжне програмне забезпечення для сканування Prometheus за допомогою методу розширення `UseOpenTelemetryPrometheusScrapingEndpoint` на `IApplicationBuilder` :

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseOpenTelemetryPrometheusScrapingEndpoint();
```

Для більш детальної інформації про налаштування експортера Prometheus див. [OpenTelemetry.Exporter.Prometheus.AspNetCore](https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Exporter.Prometheus.AspNetCore/README.md).

{{% include "exporters/zipkin-setup.md" %}}

### Залежності {#zipkin-dependencies}

Щоб надсилати ваші дані трасування до [Zipkin](https://zipkin.io/), встановіть [пакунок експортера](https://www.nuget.org/packages/OpenTelemetry.Exporter.Zipkin) як залежність для вашого застосунку:

```shell
dotnet add package OpenTelemetry.Exporter.Zipkin
```

Якщо ви використовуєте ASP.NET Core, встановіть також пакунок [`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting):

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

### Використання {#zipkin-usage}

#### ASP.NET Core {#zipkin-asp-net-core-usage}

Налаштуйте експортер у своїх службах ASP.NET Core:

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

#### Non-ASP.NET Core {#zipkin-non-asp-net-core-usage}

Налаштуйте експортер під час створення постачальника трасування:

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    // The rest of your setup code goes here
    .AddZipkinExporter(options =>
    {
        options.Endpoint = new Uri("your-zipkin-uri-here");
    })
    .Build();
```
