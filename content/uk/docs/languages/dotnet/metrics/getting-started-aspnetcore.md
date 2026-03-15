---
title: Початок роботи з метриками — ASP.NET Core
linkTitle: ASP.NET Core
description: Дізнайтеся, як використовувати OpenTelemetry Metrics в ASP.NET Core застосунку
weight: 20
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: aspnetcoreapp
---

Цей посібник покаже вам, як почати роботу з OpenTelemetry .NET Metrics в ASP.NET Core застосунку всього за кілька хвилин.

## Попередні вимоги {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) встановлений на вашому компʼютері

## Створення ASP.NET Core застосунку {#creating-an-aspnet-core-application}

Створіть новий вебзастосунок ASP.NET Core:

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## Додавання метрик OpenTelemetry {#adding-opentelemetry-metrics}

Встановіть необхідні пакунки OpenTelemetry:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

Оновіть файл `Program.cs` наступним кодом:

```csharp
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;

var builder = WebApplication.CreateBuilder(args);

// Налаштуйте OpenTelemetry з метриками та автоматичним запуском.
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter((exporterOptions, metricReaderOptions) =>
        {
            metricReaderOptions.PeriodicExportingMetricReaderOptions.ExportIntervalMilliseconds = 1000;
        }));

var app = builder.Build();

app.MapGet("/", () => $"Hello from OpenTelemetry Metrics!");

app.Run();
```

## Запуск застосунку {#running-the-application}

Запустіть застосунок:

```shell
dotnet run
```

Перейдіть за URL-адресою, вказаною в консолі (наприклад, `http://localhost:5000`).

Ви повинні побачити вихідні дані метрик у консолі, подібні до:

```text
Export http.server.duration, Measures the duration of inbound HTTP requests., Unit: ms, Meter: OpenTelemetry.Instrumentation.AspNetCore/1.0.0.0
(2023-04-11T21:49:43.6915232Z, 2023-04-11T21:50:50.6564690Z) http.flavor: 1.1 http.method: GET http.route: / http.scheme: http http.status_code: 200 net.host.name: localhost net.host.port: 5000 Histogram
Value: Sum: 3.5967 Count: 11 Min: 0.073 Max: 2.5539
(-Infinity,0]:0
(0,5]:11
(5,10]:0
(10,25]:0
(25,50]:0
(50,75]:0
(75,100]:0
(100,250]:0
(250,500]:0
(500,750]:0
(750,1000]:0
(1000,2500]:0
(2500,5000]:0
(5000,7500]:0
(7500,10000]:0
(10000,+Infinity]:0
```

Вітаємо! Тепер ви збираєте метрики з вашого застосунку ASP.NET Core за допомогою OpenTelemetry.

## Як це працює {#how-it-works}

### Реєстрація OpenTelemetry {#opentelemetry-registration}

Застосунок реєструє служби OpenTelemetry, використовуючи контейнер з інʼєкцією залежностей, наданий ASP.NET Core:

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter((exporterOptions, metricReaderOptions) =>
        {
            metricReaderOptions.PeriodicExportingMetricReaderOptions.ExportIntervalMilliseconds = 1000;
        }));
```

Цей код:

1. Додає OpenTelemetry до колекції служб за допомогою `AddOpenTelemetry()`
2. Налаштовує ресурс з інформацією про службу за допомогою `ConfigureResource()`
3. Налаштовує збір метрик за допомогою `WithMetrics()`
4. Додає автоматичну інструментацію для ASP.NET Core за допомогою `AddAspNetCoreInstrumentation()`
5. Налаштовує консольний експортер для експорту метрик кожну секунду

### Інструментація ASP.NET Core {#aspnet-core-instrumentation}

Метод `AddAspNetCoreInstrumentation()` автоматично збирає метрики HTTP-запитів, включаючи:

- Тривалість запитів
- HTTP метод, маршрут та код статусу
- Інформація про мережу

Ці метрики збираються без необхідності додаткового коду у ваших контролерах або проміжному ПЗ.

## Дізнайтеся більше {#learn-more}

- [Початок роботи з Console](/docs/languages/dotnet/metrics/getting-started-console/)
- [Початок роботи з Prometheus та Grafana](/docs/languages/dotnet/metrics/getting-started-prometheus-grafana/)
- [Додаткова інформація про інструменти](/docs/languages/dotnet/metrics/instruments/)
