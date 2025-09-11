---
title: Логування комплексних обʼєктів
linkTitle: Комплексні обʼєкти
description: Дізнайтеся, як вести логи комплексних обʼєктів за допомогою OpenTelemetry .NET
weight: 20
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
# prettier-ignore
cSpell:ignore: BrandName CompanyName Contoso FoodRecallNotice Listeria monocytogenes ProductDescription ProductType RecallReasonDescription
---

У посібнику [Початок роботи з OpenTelemetry .NET Logs — Консоль](/docs/languages/dotnet/logs/getting-started-console/) ми дізналися, як реєструвати примітивні типи даних. У цьому посібнику ви дізнаєтеся, як реєструвати комплексі обʼєкти.

## Логування комплексних обʼєктів у .NET {#complex-object-logging-in-net}

Логування комплексних обʼєктів було запроваджене в .NET 8.0 через атрибут [`LogPropertiesAttribute`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.logpropertiesattribute). Цей атрибут та відповідна логіка генерації коду надаються пакунком розширенням [`Microsoft.Extensions.Telemetry.Abstractions`](https://www.nuget.org/packages/Microsoft.Extensions.Telemetry.Abstractions/).

## Попередні вимоги {#prerequisites}

- Ознайомитись з посібником [Початок роботи з Консоллю](/docs/languages/dotnet/logs/getting-started-console/) навчальний посібник.

## Кроки реалізації {#implementation-steps}

### 1. Встановіть необхідний пакунок {#1-install-the-required-package}

Встановіть пакунок `Microsoft.Extensions.Telemetry.Abstractions`:

```shell
dotnet add package Microsoft.Extensions.Telemetry.Abstractions
```

### 2. Визначте комплексний тип даних {#2-define-a-complex-data-type}

Створіть структуру для представлення вашого комплексного обʼєкта:

```csharp
public struct FoodRecallNotice
{
    public string? BrandName { get; set; }
    public string? ProductDescription { get; set; }
    public string? ProductType { get; set; }
    public string? RecallReasonDescription { get; set; }
    public string? CompanyName { get; set; }
}
```

### 3. Створіть метод розширення для логера з атрибутом LogProperties {#3-create-a-logger-extension-method-with-logpropertiesattribute}

Визначте метод розширення для вашого логера, який використовує атрибут `LogProperties`.

```csharp
using Microsoft.Extensions.Logging;

internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Critical)]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        [LogProperties(OmitReferenceName = true)] in FoodRecallNotice foodRecallNotice);
}
```

Атрибут `[LogProperties(OmitReferenceName = true)]` вказує генератору джерела:

- Включити всі властивості `FoodRecallNotice` як окремі атрибути журналу
- Опустити імʼя посилання (імʼя параметра) з ключів атрибутів

### 4. Логування комплексного обʼєкта {#4-log-the-complex-object}

Створіть екземпляр вашого комплексного обʼєкта та зареєструйте його:

```csharp
// Створіть комплексний обʼєкт
var foodRecallNotice = new FoodRecallNotice
{
    BrandName = "Contoso",
    ProductDescription = "Salads",
    ProductType = "Food & Beverages",
    RecallReasonDescription = "due to a possible health risk from Listeria monocytogenes",
    CompanyName = "Contoso Fresh Vegetables, Inc.",
};

// Логування комплексного обʼєкта
logger.FoodRecallNotice(foodRecallNotice);
```

### 5. Запустіть програму {#5-run-the-application}

Запустіть програму, наприклад, за допомогою `dotnet run`, і ви повинні побачити вивід журналу в консолі:

```text
LogRecord.Timestamp:               2024-01-12T19:01:16.0604084Z
LogRecord.CategoryName:            Program
LogRecord.Severity:                Fatal
LogRecord.SeverityText:            Critical
LogRecord.FormattedMessage:
LogRecord.Body:
LogRecord.Attributes (Key:Value):
    CompanyName: Contoso Fresh Vegetables, Inc.
    RecallReasonDescription: due to a possible health risk from Listeria monocytogenes
    ProductType: Food & Beverages
    ProductDescription: Salads
    BrandName: Contoso
LogRecord.EventId:                 252550133
LogRecord.EventName:               FoodRecallNotice
```

Зверніть увагу, що кожна властивість обʼєкта `FoodRecallNotice` відображається як окремий атрибут у записі журналу.

## Параметри LogPropertiesAttribute {#logpropertiesattribute-options}

Атрибут `LogPropertiesAttribute` надає кілька параметрів для контролю того, як властивості включаються до журналів:

- **OmitReferenceName**: Коли встановлено в `true`, імʼя параметра опускається з ключів атрибутів. У наведеному вище прикладі ключі атрибутів — це просто імена властивостей (наприклад, "BrandName"), а не "foodRecallNotice.BrandName".

- **IncludeProperties**: Використовується для вказівки, які властивості слід включити. Якщо не вказано, всі властивості включаються.

- **ExcludeProperties**: Використовується для вказівки, які властивості слід виключити з журналювання.

- **IncludeSensitive**: Коли встановлено в `true`, властивості, позначені атрибутом `[Sensitive]`, включаються до журналів. Стандартне значення — `false`.

## Повний приклад {#complete-example}

Ось повний приклад, який обʼєднує все:

```csharp
using System;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;

// Визначення комплексного обʼєкта
public struct FoodRecallNotice
{
    public string? BrandName { get; set; }
    public string? ProductDescription { get; set; }
    public string? ProductType { get; set; }
    public string? RecallReasonDescription { get; set; }
    public string? CompanyName { get; set; }
}

// Метод розширення Logger
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Critical)]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        [LogProperties(OmitReferenceName = true)] in FoodRecallNotice foodRecallNotice);
}

// Головна програма
class Program
{
    static void Main(string[] args)
    {
        // Створіть фабрику логів з OpenTelemetry
        using var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddOpenTelemetry(options =>
            {
                options.AddConsoleExporter();
            });
        });

        // Отримайте екземпляр логера
        var logger = loggerFactory.CreateLogger<Program>();

        // Створіть комплексний обʼєкт
        var foodRecallNotice = new FoodRecallNotice
        {
            BrandName = "Contoso",
            ProductDescription = "Salads",
            ProductType = "Food & Beverages",
            RecallReasonDescription = "due to a possible health risk from Listeria monocytogenes",
            CompanyName = "Contoso Fresh Vegetables, Inc.",
        };

        // Записати комплексний обʼєкт
        logger.FoodRecallNotice(foodRecallNotice);

        Console.WriteLine("Press any key to exit");
        Console.ReadKey();
    }
}
```

## Дізнайтеся більше {#learn-more}

- [Microsoft.Extensions.Logging.LogPropertiesAttribute](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.logpropertiesattribute)
- [Microsoft.Extensions.Telemetry.Abstractions](https://github.com/dotnet/extensions/blob/main/src/Libraries/Microsoft.Extensions.Telemetry.Abstractions/README.md)
- [Кореляція логів OpenTelemetry .NET](/docs/languages/dotnet/logs/correlation/)
- [Модель даних логів OpenTelemetry](/docs/specs/otel/logs/data-model/)
