---
title: Початок роботи з трейсами — ASP.NET Core
linkTitle: ASP.NET Core
description: Дізнайтеся, як використовувати трейсинг OpenTelemetry у застосунку ASP.NET Core
weight: 20
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: aspnetcoreapp
---

Цей посібник покаже вам, як почати роботу з трейсами OpenTelemetry .NET у застосунку ASP.NET Core.

## Передумови {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) встановлений на вашому компʼютері

## Створення застосунку ASP.NET Core {#creating-an-aspnet-core-application}

Створіть новий веб-застосунок ASP.NET Core:

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## Додавання трейсів OpenTelemetry {#adding-opentelemetry-traces}

Встановіть необхідні пакунки OpenTelemetry:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

Оновіть файл `Program.cs` наступним кодом:

```csharp
using System.Diagnostics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Налаштування OpenTelemetry з трасуванням та автозапуском.
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter());

var app = builder.Build();

app.MapGet("/", () => $"Hello World! OpenTelemetry Trace: {Activity.Current?.Id}");

app.Run();
```

## Запуск застосунку {#running-the-application}

Запустіть застосунок:

```shell
dotnet run
```

Перейдіть за URL-адресою, показаною в консолі (наприклад, `http://localhost:5000`).

Ви повинні побачити вихідні дані трасування в консолі, подібні до:

```text
Activity.TraceId:            c28f7b480d5c7dfc30cfbd80ad29028d
Activity.SpanId:             27e478bbf9fdec10
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: Microsoft.AspNetCore
Activity.DisplayName:        GET /
Activity.Kind:               Server
Activity.StartTime:          2024-07-04T13:03:37.3318740Z
Activity.Duration:           00:00:00.3693734
Activity.Tags:
    server.address: localhost
    server.port: 5154
    http.request.method: GET
    url.scheme: https
    url.path: /
    network.protocol.version: 2
    user_agent.original: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36
    http.route: /
    http.response.status_code: 200
Resource associated with Activity:
    service.name: getting-started-aspnetcore
    service.instance.id: a388466b-4969-4bb0-ad96-8f39527fa66b
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.9.0
```

Вітаємо! Тепер ви збираєте трейси за допомогою OpenTelemetry у вашій програмі ASP.NET Core.

## Як це працює {#how-it-works}

### Реєстрація OpenTelemetry {#opentelemetry-registration}

Застосунок реєструє служби OpenTelemetry, використовуючи контейнер інʼєкції залежностей, наданий ASP.NET Core:

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter());
```

Цей код:

1. Додає OpenTelemetry до колекції служб за допомогою `AddOpenTelemetry()`
2. Налаштовує ресурс з інформацією про службу за допомогою `ConfigureResource()`
3. Налаштовує збір трейсів за допомогою `WithTracing()`
4. Додає автоматичну інструментацію для ASP.NET Core за допомогою `AddAspNetCoreInstrumentation()`
5. Налаштовує експортер консолі для виводу трейсів до консолі

### Інструментація ASP.NET Core {#aspnet-core-instrumentation}

Метод `AddAspNetCoreInstrumentation()` автоматично створює трейси для
HTTP-запитів, включаючи:

- Тривалість запиту
- HTTP-метод, маршрут і код статусу
- Інформацію про мережу
- User agent

Ці трейси збираються без необхідності додаткового коду у ваших контролерах або проміжному ПЗ.

### Доступ до поточної активності {#accessing-the-current-activity}

У OpenTelemetry .NET клас `Activity` представляє "Span" специфікації OpenTelemetry. У нашому прикладі ми отримуємо доступ до поточної активності, щоб включити її ID у відповідь:

```csharp
app.MapGet("/", () => $"Hello World! OpenTelemetry Trace: {Activity.Current?.Id}");
```

Це дозволяє побачити ідентифікатор трасування в оглядачі та співвіднести його з трасуваннями у вашій системі моніторингу.

## Дізнайтесь більше {#learn-more}

- [Початок роботи з консоллю](/docs/languages/dotnet/traces/getting-started-console/)
- [Початок роботи з Jaeger](/docs/languages/dotnet/traces/jaeger/)
- [Вступ до OpenTelemetry .NET Tracing API](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Api#introduction-to-opentelemetry-net-tracing-api)
