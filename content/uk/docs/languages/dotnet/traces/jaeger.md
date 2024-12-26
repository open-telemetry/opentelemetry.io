---
title: Експорт до Jaeger
linkTitle: Експорт до Jaeger
description: Дізнайтеся, як експортувати трасування до Jaeger за допомогою OpenTelemetry .NET
weight: 30
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: OTLP
---

Цей посібник покаже вам, як експортувати трасування OpenTelemetry .NET до Jaeger для візуалізації та аналізу.

## Необхідні умови {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) встановлений на вашому компʼютері
- [Jaeger](https://www.jaegertracing.io/download/) завантажений (цей посібник охоплює установку)
- Ознайомлення з основними концепціями OpenTelemetry (див. [GПочаток роботи з консоллю](/docs/languages/dotnet/traces/getting-started-console/))

## Створення застосунку .NET з експортом OTLP{#creating-a-net-application-with-otlp-export}

Створіть новий консольний застосунок:

```shell
dotnet new console --output getting-started-jaeger
cd getting-started-jaeger
```

Встановіть необхідні пакунки OpenTelemetry:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Instrumentation.Http
```

Оновіть файл `Program.cs` наступним кодом:

```csharp
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace GettingStartedJaeger;

internal static class Program
{
    private static readonly ActivitySource MyActivitySource = new("OpenTelemetry.Demo.Jaeger");

    public static async Task Main()
    {
        using var tracerProvider = Sdk.CreateTracerProviderBuilder()
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
                serviceName: "DemoApp",
                serviceVersion: "1.0.0"))
            .AddSource("OpenTelemetry.Demo.Jaeger")
            .AddHttpClientInstrumentation()
            .AddConsoleExporter()
            .AddOtlpExporter()
            .Build();

        using var parent = MyActivitySource.StartActivity("JaegerDemo");

        using (var client = new HttpClient())
        {
            using (var slow = MyActivitySource.StartActivity("SomethingSlow"))
            {
                await client.GetStringAsync(new Uri("https://httpstat.us/200?sleep=1000")).ConfigureAwait(false);
                await client.GetStringAsync(new Uri("https://httpstat.us/200?sleep=1000")).ConfigureAwait(false);
            }

            using (var fast = MyActivitySource.StartActivity("SomethingFast"))
            {
                await client.GetStringAsync(new Uri("https://httpstat.us/301")).ConfigureAwait(false);
            }
        }
    }
}
```

Коли ви запускаєте цей застосунок, він виводить трейси в консоль за допомогою `ConsoleExporter`, а також намагається надіслати трейси до Jaeger за допомогою `OtlpExporter`. Оскільки Jaeger ще не налаштований, ці трейси спочатку будуть відкинуті.

## Налаштування Jaeger {#setting-up-jaeger}

Jaeger — це система розподіленого трасування з відкритим вихідним кодом, яка допомагає моніторити та усувати неполадки в мікросервісних застосунках.

### Встановлення та запуск Jaeger {#installing-and-running-jaeger}

1. Завантажте Jaeger з [офіційної сторінки завантаження](https://www.jaegertracing.io/download/).
2. Розпакуйте його в будь-яке місце на вашому компʼютері.
3. Запустіть виконуваний файл Jaeger all-in-one з увімкненим OTLP:

```shell
./jaeger-all-in-one --collector.otlp.enabled
```

Він запускає:

- Jaeger UI (`http://localhost:16686`)
- Колектор Jaeger з приймачем OTLP (`http://localhost:4317`)
- Служба запитів Jaeger та інші компоненти

### Перегляд трейсів у Jaeger {#viewing-traces-in-jaeger}

1. Відкрийте вебоглядач і перейдіть за адресою [http://localhost:16686](http://localhost:16686)
2. Запустіть свій .NET застосунок
3. У Jaeger UI:
   - Виберіть "DemoApp" зі списку "Service"
   - Натисніть "Find Traces"

Ви повинні побачити трейси вашого застосунку в Jaeger UI. Натисніть на трейс, щоб побачити детальний вигляд діаграми Гантта всіх відрізків у трейсі.

## Як працює код {#understanding-the-code}

### Налаштування провайдера трасування {#trace-provider-configuration}

Застосунок налаштовує OpenTelemetry за допомогою:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: "DemoApp",
        serviceVersion: "1.0.0"))
    .AddSource("OpenTelemetry.Demo.Jaeger")
    .AddHttpClientInstrumentation()
    .AddConsoleExporter()
    .AddOtlpExporter()
    .Build();
```

Цей код:

1. Налаштовує ресурс з імʼям служби та версією
2. Реєструє наше джерело активності
3. Додає автоматичну інструментацію для HttpClient
4. Налаштовує експортери консолі та OTLP

### Створення активності {#activity-creation}

Застосунок створює відрізки за допомогою ActivitySource:

```csharp
private static readonly ActivitySource MyActivitySource = new("OpenTelemetry.Demo.Jaeger");

// Створити батьківський відрізок
using var parent = MyActivitySource.StartActivity("JaegerDemo");

// Створити дочірні відрізки
using (var slow = MyActivitySource.StartActivity("SomethingSlow"))
{
    // Операції всередині цього блоку будуть частиною відрізку «SomethingSlow».
}
```

### Відстеження потоку експорту {#trace-export-flow}

Дані трасування проходять через такі компоненти:

1. Застосунок створює відрізки за допомогою ActivitySource
2. TracerProvider збирає та обробляє відрізки
3. OTLP Exporter надсилає відрізки до Jaeger через протокол OTLP
4. Jaeger зберігає та дозволяє вам запитувати і візуалізувати трасування

## Промислове використання {#production-usage}

Для промислового використання вам слід видалити експортер консолі та використовувати лише експортер OTLP:

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: "DemoApp",
        serviceVersion: "1.0.0"))
    .AddSource("OpenTelemetry.Demo.Jaeger")
    .AddHttpClientInstrumentation()
    // Вилучення Console Exporter
    // .AddConsoleExporter()
    .AddOtlpExporter()
    .Build();
```

Ви також можете видалити пакунок Console Exporter:

```shell
dotnet remove package OpenTelemetry.Exporter.Console
```

## Дізнайтесь більше {#learn-more}

- [Jaeger Tracing](https://www.jaegertracing.io/)
- [OTLP Exporter for OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol)
- [OpenTelemetry Tracing Specification](/docs/specs/otel/trace/api/)
