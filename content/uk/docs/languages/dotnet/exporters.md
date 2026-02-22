---
title: Експортери
weight: 50
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

{{% docs/languages/exporters/intro %}}

## Залежності {#otlp-dependencies}

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

## Використання {#usage}

### ASP.NET Core

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

### Non-ASP.NET Core

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

У наступних розділах наведено докладні інструкції щодо налаштування експортера Prometheus, специфічні для .NET.

Існує два підходи до експорту метрик до Prometheus:

1. **Використання OTLP Exporter (Push)**: Передавайте метрики до Prometheus за допомогою протоколу OTLP. Для цього необхідно увімкнути [OTLP Receiver від Prometheus](https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver). Це рекомендований підхід для виробничих середовищ, оскільки він підтримує зразки та є стабільним.

2. **Використання Prometheus Exporter (Pull/Scrape)**: відкрийте в застосунку точку доступу з якої Prometheus може зчитувати. Це традиційний підхід Prometheus.

#### Використання OTLP Exporter (Push) {#prometheus-otlp}

Цей підхід використовує OTLP exporter для передачі метрик безпосередньо до точки доступу OTLP-приймача Prometheus. Рекомендується для робочих середовищ, оскільки підтримує зразки та використовує стабільний протокол OTLP.

##### Залежності {#prometheus-otlp-dependencies}

Встановіть пакунок [`OpenTelemetry.Exporter.OpenTelemetryProtocol`](https://www.nuget.org/packages/OpenTelemetry.Exporter.OpenTelemetryProtocol/) як залежність для вашого проєкту:

```sh
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

Якщо ви використовуєте ASP.NET Core, також встановіть пакунок [`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting):

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

##### Використання {#prometheus-otlp-usage}

###### ASP.NET Core {#prometheus-otlp-asp-net-core-usage}

Налаштуйте експортер OTLP для надсилання метрик до приймача Prometheus OTLP:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        // Решта вашого коду налаштування знаходиться тут
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp/v1/metrics");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        }));
```

###### Non-ASP.NET Core {#prometheus-otlp-non-asp-net-core-usage}

Налаштуйте експортер під час створення `MeterProvider`:

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    // Інший код налаштування, наприклад, налаштування ресурсу, також розміщується тут.
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp/v1/metrics");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    .Build();
```

{{% alert title=Примітка %}}

Переконайтеся, що Prometheus запущено з увімкненим приймачем OTLP:

```sh
./prometheus --web.enable-otlp-receiver
```

Або використовуючи Docker:

```sh
docker run -p 9090:9090 prom/prometheus --web.enable-otlp-receiver
```

{{% /alert %}}

#### Використання Prometheus Exporter (Pull/Scrape) {#prometheus-exporter}

Цей підхід експонує точку доступу метрик у вашій програмі (наприклад, `/metrics`), яку Prometheus регулярно сканує.

{{% alert color="warning" title="Попередження" %}}

Цей експортер ще перебуває в стадії розробки і не підтримує зразки. Для робочих середовищ рекомендуємо використовувати [підхід OTLP exporter](#prometheus-otlp).

{{% /alert %}}

##### Залежності {#prometheus-dependencies}

Встановіть [пакунок експортера](https://www.nuget.org/packages/OpenTelemetry.Exporter.Prometheus.AspNetCore) як залежність для вашого застосунку:

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.AspNetCore --version {{% version-from-registry exporter-dotnet-prometheus-aspnetcore %}}
```

Якщо ви використовуєте ASP.NET Core, встановіть також пакунок [`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting):

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

##### Використання {#prometheus-exporter-usage}

###### ASP.NET Core {#prometheus-exporter-asp-net-core-usage}

Налаштуйте експортер у своїх службах ASP.NET Core:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics.AddPrometheusExporter());
```

Потім вам потрібно буде зареєструвати програмне забезпечення Prometheus для збору даних, щоб Prometheus міг збирати дані з вашої програми. Використовуйте метод розширення `UseOpenTelemetryPrometheusScrapingEndpoint` на `IApplicationBuilder`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// ... Setup

var app = builder.Build();

app.UseOpenTelemetryPrometheusScrapingEndpoint();

await app.RunAsync();
```

Стандартно це експонує точку доступу метрик за адресою `/metrics`. Ви можете налаштувати шлях до точки доступу або використовувати функцію предиката для більш розширеної конфігурації:

```csharp
app.UseOpenTelemetryPrometheusScrapingEndpoint(
    context => context.Request.Path == "/internal/metrics"
        && context.Connection.LocalPort == 5067);
```

#### Non-ASP.NET Core {#prometheus-exporter-non-asp-net-core-usage}

> [!WARNING]
>
> Цей компонент призначений для внутрішнього циклу розробки, немає планів зробити його готовим до промислового використання. Промислові середовища повинні використовувати [`OpenTelemetry.Exporter.Prometheus.AspNetCore`](#prometheus-exporter-asp-net-core-usage), або комбінацію [`OpenTelemetry.Exporter.OpenTelemetryProtocol`](#aspnet-core) та [OpenTelemetry Collector](/docs/collector).

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

##### Конфігурація Prometheus (Scrape) {#prometheus-configuration-scrape}

При використанні експортера Prometheus (підхід pull/scrape) необхідно налаштувати Prometheus для зчитування даних з вашої програми. Додайте наступне до файлу `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'your-app-name'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:5000'] # Хост:порт вашої програми
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
