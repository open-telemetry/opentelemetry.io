---
title: Початок роботи з логами — Консоль
linkTitle: Консоль
description: Дізнайтеся, як використовувати OpenTelemetry Logs у .NET Console
weight: 10
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
# prettier-ignore
cSpell:ignore: brandName companyName Contoso Listeria monocytogenes OTLP productDescription recallReasonDescription
---

Цей посібник покаже вам, як за лічені хвилини розпочати роботу з OpenTelemetry .NET Logs у консольному застосунку.

## Попередні вимоги {#prerequisites}

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

## Додавання логів OpenTelemetry {#adding-opentelemetry-logs}

Встановіть пакунок OpenTelemetry Console Exporter:

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

Оновіть файл `Program.cs` наступним кодом:

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;

// Створіть фабрику логерів з OpenTelemetry
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options =>
    {
        options.AddConsoleExporter();
    });
});

// Отримайте екземпляр логера
var logger = loggerFactory.CreateLogger<Program>();

// Записати просте повідомлення
logger.LogInformation("Hello from OpenTelemetry .NET Logs!");

// Записати з структурованими даними
logger.FoodPriceChanged("artichoke", 9.99);

// Записати більш складний приклад
logger.FoodRecallNotice(
    "Food & Beverages",
    "Contoso",
    "Salads",
    "Contoso Fresh Vegetables, Inc.",
    "due to a possible health risk from Listeria monocytogenes");

// Визначте методи розширення для структурованого журналювання
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);

    [LoggerMessage(LogLevel.Critical, "A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).")]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        string productType,
        string brandName,
        string productDescription,
        string companyName,
        string recallReasonDescription);
}
```

Запустіть застосунок знову (за допомогою `dotnet run`) і ви побачите вихідні дані журналу в консолі:

```text
LogRecord.Timestamp:               2023-09-15T06:07:03.5502083Z
LogRecord.CategoryName:            Program
LogRecord.Severity:                Info
LogRecord.SeverityText:            Information
LogRecord.Body:                    Food `{name}` price changed to `{price}`.
LogRecord.Attributes (Key:Value):
    name: artichoke
    price: 9.99
    OriginalFormat (a.k.a Body): Food `{name}` price changed to `{price}`.
LogRecord.EventId:                 344095174
LogRecord.EventName:               FoodPriceChanged

...

LogRecord.Timestamp:               2023-09-15T06:07:03.5683511Z
LogRecord.CategoryName:            Program
LogRecord.Severity:                Fatal
LogRecord.SeverityText:            Critical
LogRecord.Body:                    A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).
LogRecord.Attributes (Key:Value):
    brandName: Contoso
    productDescription: Salads
    productType: Food & Beverages
    recallReasonDescription: due to a possible health risk from Listeria monocytogenes
    companyName: Contoso Fresh Vegetables, Inc.
    OriginalFormat (a.k.a Body): A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).
LogRecord.EventId:                 1338249384
LogRecord.EventName:               FoodRecallNotice
```

Вітаємо! Тепер ви збираєте логи за допомогою OpenTelemetry.

## Як це працює {#how-it-works}

Застосунок створює конвеєр журналювання, створюючи екземпляр
[`LoggerFactory`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.iloggerfactory), з OpenTelemetry, доданим як [постачальник журналювання](https://docs.microsoft.com/dotnet/core/extensions/logging-providers).

OpenTelemetry SDK налаштовано з `ConsoleExporter`, щоб експортувати логи в консоль для демонстраційних цілей. Для промислового використання слід використовувати інші експортери, такі як [OTLP Exporter](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol).

Екземпляр `LoggerFactory` використовується для створення екземпляра [`ILogger`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger), який використовується для фактичного журналювання.

Дотримуючись найкращих практик журналювання .NET, було використано [генерацію виходу журналу під час компіляції](https://docs.microsoft.com/dotnet/core/extensions/logger-message-generator), яка забезпечує високу продуктивність, структуроване журналювання та перевірені параметри типу.

## Використання з інʼєкцією залежностей {#using-with-dependency-injection}

Для застосунків, які використовують `ILogger` з [інʼєкцією залежностей (DI)](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection) (наприклад, [ASP.NET Core](https://learn.microsoft.com/aspnet/core) та [.NET Worker](https://learn.microsoft.com/dotnet/core/extensions/workers)), загальною практикою є додавання OpenTelemetry як [постачальника журналювання](https://docs.microsoft.com/dotnet/core/extensions/logging-providers) до конвеєра журналювання DI, а не налаштування абсолютно нового конвеєра журналювання шляхом створення нового екземпляра `LoggerFactory`.

Дивіться посібник [Вступ до ASP.NET Core](/docs/languages/dotnet/logs/getting-started-aspnetcore/), щоб дізнатися більше.

## Дізнайтеся більше {#learn-more}

- [Logging in C# and .NET](https://learn.microsoft.com/dotnet/core/extensions/logging)
- [Логування комплексних обʼєктів](/docs/languages/dotnet/logs/complex-objects/)
- [Кореляція логів](/docs/languages/dotnet/logs/correlation/)
