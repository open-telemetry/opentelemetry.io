---
title: Початок роботи з логами — ASP.NET Core
linkTitle: ASP.NET Core
description: Дізнайтеся, як використовувати OpenTelemetry Logs в ASP.NET Core
weight: 20
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: aspnetcoreapp loggermessage
---

Цей посібник покаже вам, як почати роботу з OpenTelemetry .NET Logs в ASP.NET Core.

## Попередні вимоги {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) встановлений на вашому компʼютері

## Створення застосунку ASP.NET Core {#creating-an-aspnet-core-application}

Створіть новий вебзастосунок ASP.NET Core:

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## Додавання логів OpenTelemetry {#adding-opentelemetry-logs}

Встановіть необхідні пакунки OpenTelemetry:

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

Оновіть файл `Program.cs` наступним кодом:

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;

var builder = WebApplication.CreateBuilder(args);

// Тільки для навчальних цілей, вимкніть стандартні провайдери журналювання .NET.
// У цій демонстрації ми видаляємо провайдера журналювання консолі, щоб замість нього використовувати детальний
// експортер консолі OpenTelemetry. Для більшості сценаріїв розробки та промислової експлуатації
// стандартний провайдер консолі працює добре, і немає необхідності
// очищати ці провайдери.
builder.Logging.ClearProviders();

// Додати провайдер журналювання OpenTelemetry, викликавши розширення WithLogging.
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(builder.Environment.ApplicationName))
    .WithLogging(logging => logging
        /* Зверніть увагу: ConsoleExporter використовується лише для демонстраційних цілей. У виробничому
           середовищі ConsoleExporter слід замінити іншими експортерами
           (for example, OTLP Exporter). */
        .AddConsoleExporter());

var app = builder.Build();

app.MapGet("/", (ILogger<Program> logger) =>
{
    logger.FoodPriceChanged("artichoke", 9.99);

    return "Hello from OpenTelemetry Logs!";
});

app.Logger.StartingApp();

app.Run();

internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Starting the app...")]
    public static partial void StartingApp(this ILogger logger);

    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);
}
```

## Запуск застосунку {#running-the-application}

Запустіть застосунок:

```shell
dotnet run
```

Перейдіть за URL-адресою, вказаною в консолі (наприклад, `http://localhost:5000`).

Ви повинні побачити вихідні дані журналу в консолі, подібні до:

```text
LogRecord.Timestamp:               2023-09-06T22:59:17.9787564Z
LogRecord.CategoryName:            getting-started-aspnetcore
LogRecord.Severity:                Info
LogRecord.SeverityText:            Information
LogRecord.Body:                    Starting the app...
LogRecord.Attributes (Key:Value):
    OriginalFormat (a.k.a Body): Starting the app...
LogRecord.EventId:                 225744744
LogRecord.EventName:               StartingApp

...

LogRecord.Timestamp:               2023-09-06T23:00:46.1639248Z
LogRecord.TraceId:                 3507087d60ae4b1d2f10e68f4e40784a
LogRecord.SpanId:                  c51be9f19c598b69
LogRecord.TraceFlags:              None
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
```

Вітаємо! Тепер ви збираєте логи за допомогою OpenTelemetry у вашому застосунку ASP.NET Core.

## Як це працює {#how-it-works}

### Заміна стандартних провайдерів журналювання {#replacing-default-logging-providers}

Для демонстраційних цілей зразок очищає стандартні провайдери журналювання .NET, щоб краще продемонструвати вихідні дані консолі OpenTelemetry:

```csharp
// Тільки для навчальних цілей, вимкніть стандартні провайдери журналювання .NET.
// У цій демонстрації ми видаляємо провайдера журналювання консолі, щоб замість нього використовувати детальний
// експортер консолі OpenTelemetry. Для більшості сценаріїв розробки та промислового використання
// стандартний провайдер консолі працює добре, і немає необхідності
// очищати ці провайдери.
builder.Logging.ClearProviders();
```

У реальному застосуванні ви зазвичай зберігаєте стандартних постачальників і додаєте OpenTelemetry поряд з ними.

### Додавання логування OpenTelemetry {#adding-opentelemetry-logging}

Застосунок налаштовує OpenTelemetry за допомогою методу розширення `AddOpenTelemetry()`:

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(builder.Environment.ApplicationName))
    .WithLogging(logging => logging
        .AddConsoleExporter());
```

Цей код:

1. Додає OpenTelemetry до колекції служб
2. Налаштовує інформацію про ресурси (наприклад, назву служби)
3. Налаштовує ведення журналу за допомогою розширення `WithLogging()`
4. Додає консольний експортер для виведення журналів на консоль

### Використання інʼєкцій залежностей для журналювання {#using-dependency-injection-for-logging}

ASP.NET Core надає вбудовану інʼєкцію залежностей для журналювання. У зразку використовується це для впровадження логера в обробник запитів:

```csharp
app.MapGet("/", (ILogger<Program> logger) =>
{
    logger.FoodPriceChanged("artichoke", 9.99);

    return "Hello from OpenTelemetry Logs!";
});
```

Параметр `ILogger<Program>` автоматично вводиться фреймворком, і журнал буде містити назву категорії «Program».

### Використання генерації джерела LoggerMessage{#using-loggermessage-source-generation}

У зразку використовується [генерація джерела журналу під час компіляції](https://docs.microsoft.com/dotnet/core/extensions/logger-message-generator) для високопродуктивного структурованого журналу:

```csharp
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Starting the app...")]
    public static partial void StartingApp(this ILogger logger);

    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);
}
```

Цей підхід:

- Забезпечує кращу продуктивність, ніж інтерполяція рядків.
- Гарантує безпеку типів для параметрів журналу.
- Створює структуровані журнали з іменованими параметрами.
- Автоматично створює `EventName` у `LogRecord`.

## Дізнатись більше {#learn-more}

- [Початок роботи з консоллю](/docs/languages/dotnet/logs/getting-started-console/)
- [Кореляція логів](/docs/languages/dotnet/logs/correlation/)
- [Журналювання в ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/logging/)
