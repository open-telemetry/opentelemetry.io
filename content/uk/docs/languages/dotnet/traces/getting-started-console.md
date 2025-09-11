---
title: Початок роботи з трейсами — Консоль
linkTitle: Консоль
description: Дізнайтеся, як використовувати трейсинг OpenTelemetry у .NET Консольному застосунку
weight: 10
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: baz DiagnosticSource tracerprovider
---

Цей посібник покаже вам, як почати роботу з трейсами OpenTelemetry .NET у консольному застосунку всього за кілька хвилин.

## Передумови {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) встановлений на вашому компʼютері

## Створення консольного застосунку {#creating-a-console-application}

Створіть новий консольний застосунок і запустіть його:

```shell
dotnet new console --output getting-started
cd getting-started
dotnet run
```

Ви повинні побачити наступний результат:

```text
Hello World!
```

## Додавання трейсів OpenTelemetry {#adding-opentelemetry-traces}

Встановіть пакунок OpenTelemetry Console Exporter:

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

Оновіть файл `Program.cs` наступним кодом:

```csharp
using System;
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace GettingStarted
{
    class Program
    {
        // Визначте ActivitySource для створення активності з
        private static readonly ActivitySource MyActivitySource = new ActivitySource(
            "MyCompany.MyProduct.MyLibrary");

        static void Main(string[] args)
        {
            // Налаштуйте OpenTelemetry TracerProvider
            using var tracerProvider = Sdk.CreateTracerProviderBuilder()
                .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("getting-started"))
                .AddSource("MyCompany.MyProduct.MyLibrary")
                .AddConsoleExporter()
                .Build();

            // Запустіть активність (span) з деякими теґами (атрибутами)
            using (var activity = MyActivitySource.StartActivity("SayHello"))
            {
                // Встановіть деякі атрибути для активності
                activity?.SetTag("foo", 1);
                activity?.SetTag("bar", "Hello, World!");
                activity?.SetTag("baz", new int[] { 1, 2, 3 });

                // Встановіть статус активності
                activity?.SetStatus(ActivityStatusCode.Ok);

                // Виконайте деяку роботу...
                Console.WriteLine("Hello World!");
            }

            Console.WriteLine("Trace has been exported. Press any key to exit.");
            Console.ReadKey();
        }
    }
}
```

Запустіть застосунок знову (за допомогою `dotnet run`) і ви побачите вихідні дані трасування з консолі:

```text
Activity.TraceId:          d4a7d499698d62f0e2317a67abc559b6
Activity.SpanId:           a091d18fbe45bdf6
Activity.TraceFlags:       Recorded
Activity.ActivitySourceName: MyCompany.MyProduct.MyLibrary
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-03-30T19:42:33.5178011Z
Activity.Duration:    00:00:00.0097620
StatusCode : Ok
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1, 2, 3]
Resource associated with Activity:
    service.name: getting-started
```

Ви зараз збираєте трейси за допомогою OpenTelemetry.

## Як це працює {#how-it-works}

### ActivitySource (Tracer)

Програма створює `ActivitySource`, який представляє [OpenTelemetry Tracer](/docs/specs/otel/trace/api/#tracer):

```csharp
private static readonly ActivitySource MyActivitySource = new ActivitySource(
    "MyCompany.MyProduct.MyLibrary");
```

`ActivitySource` використовується для створення та запуску нових активностей.

### Activity (Span)

Екземпляр `ActivitySource` використовується для запуску `Activity`, яка представляє [OpenTelemetry Span](/docs/specs/otel/trace/api/#span). Ви можете встановити кілька тегів (атрибутів) на ньому та встановити його статус:

```csharp
using (var activity = MyActivitySource.StartActivity("SayHello"))
{
    activity?.SetTag("foo", 1);
    activity?.SetTag("bar", "Hello, World!");
    activity?.SetTag("baz", new int[] { 1, 2, 3 });
    activity?.SetStatus(ActivityStatusCode.Ok);
}
```

### TracerProvider

TracerProvider налаштований для підписки на активності з вказаного джерела та їх експорту:

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();
```

TracerProvider є центральним компонентом SDK OpenTelemetry. Він містить усі налаштування для трасування, такі як семплери, процесори, експортери тощо, і є дуже гнучким у налаштуванні.

## Конвеєр трасування {#tracing-pipeline}

Конвеєр трасування в OpenTelemetry .NET має такий потік:

1. ActivitySource створює Activities
2. TracerProvider отримує Activities
3. Processor обробляє Activities
4. Exporter експортує Activities до бекенду

## OpenTelemetry .NET та .NET Activity API {#opentelemetry-net-and-net-activity-api}

В OpenTelemetry .NET терміни `ActivitySource` і `Activity` використовуються замість `Tracer` і `Span` з специфікації OpenTelemetry. Це повʼязано з тим, що трасування в OpenTelemetry .NET реалізовано на основі вбудованої системи діагностики .NET.

Ви можете інструментувати свій застосунок, додаючи залежність від пакунка `System.Diagnostics.DiagnosticSource`, який надає класи `Activity` і `ActivitySource`, що представляють концепції OpenTelemetry [Span](/docs/specs/otel/trace/api/#span) і [Tracer](/docs/specs/otel/trace/api/#tracer) відповідно.

## Дізнатись більше {#learn-more}

- [Початок роботи з Jaeger](/docs/languages/dotnet/traces/jaeger/)
- [Повідомлення про винятки](/docs/languages/dotnet/traces/reporting-exceptions/)
- [Створення звʼязків між трейсами](/docs/languages/dotnet/traces/links-creation/)
