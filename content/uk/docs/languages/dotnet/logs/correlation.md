---
title: Кореляція логів
linkTitle: Кореляція
description: Дізнайтеся, як корелювати логи з трейсами в OpenTelemetry .NET
weight: 30
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: Вебзастосунки вебзастосунках
---

У цьому посібнику пояснюється, як можна співвідносити логи з трейсами в OpenTelemetry .NET.

## Підтримка моделі даних журналювання для кореляції {#logging-data-model-support-for-correlation}

Модель даних журналювання OpenTelemetry визначає поля, які дозволяють корелювати лог з відрізком (`Activity` в .NET). Поля `TraceId` та `SpanId` дозволяють корелювати лог з відповідним `Activity`.

## Автоматична кореляція в OpenTelemetry .NET {#automatic-correlation-in-opentelemetry-net}

В OpenTelemetry .NET SDK не потрібно вживати жодних дій з боку користувача для активації кореляції. SDK автоматично активує кореляцію логів з `Activity`, заповнюючи поля `TraceId`, `SpanId` та `TraceFlags` з активної дії (тобто `Activity.Current`), якщо така існує.

## Приклад {#example}

Ось простий приклад, який демонструє, як генерувати логи в контексті активної `Activity`:

```csharp
using System;
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Створити фабрику логів за допомогою OpenTelemetry
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options =>
    {
        options.AddConsoleExporter();
    });
});

// Створити провайдер трасування
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();

// Отримати екземпляр логера
var logger = loggerFactory.CreateLogger<Program>();

// Створити джерело активності
var activitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");

// Розпочати активність
using (var activity = activitySource.StartActivity("SayHello"))
{
    // Логування в контексті активності
    logger.FoodPriceChanged("artichoke", 9.99);
}

// Визначте методи розширення для структурованого логування
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);
}
```

Запуск застосунку дасть наступний результат в консолі:

```text
LogRecord.Timestamp:               2024-01-26T17:55:39.2273475Z
LogRecord.TraceId:                 aed89c3b250fb9d8e16ccab1a4a9bbb5
LogRecord.SpanId:                  bd44308753200c58
LogRecord.TraceFlags:              Recorded
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

Activity.TraceId:            aed89c3b250fb9d8e16ccab1a4a9bbb5
Activity.SpanId:             bd44308753200c58
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: MyCompany.MyProduct.MyLibrary
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2024-01-26T17:55:39.2223849Z
Activity.Duration:           00:00:00.0361682
...
```

Як бачите, `LogRecord` автоматично має поля `TraceId` та `SpanId`, що відповідають полям з `Activity`. Це відбувається тому, що журнал було створено в контексті активної `Activity`.

У посібнику [Початок роботи з консоллю](/docs/languages/dotnet/logs/getting-started-console/) журнал створювався поза контекстом `Activity`, тому ці поля кореляції в `LogRecord` не заповнювалися.

## Вебзастосунки {#web-applications}

У вебзастосунках, таких як ASP.NET Core, всі журнали, створені в контексті запиту, автоматично корелюються з `Activity`, що представляє вхідний запит, що спрощує пошук усіх журналів, повʼязаних з конкретним запитом.

## Переваги кореляції логів {#benefits-of-log-correlation}

Кореляція логів має кілька переваг:

1. **Уніфікований вигляд**: Ви можете бачити журнали та трасування разом в уніфікованому вигляді у вашому інструменті спостереження.
2. **Збагачення контексту**: Журнали збагачуються контекстом трасування, що робить їх більш інформативними.
3. **Виправлення помилок**: Швидко знаходьте всі журнали, повʼязані з конкретним трейсом, під час пошуку розвʼязання проблем.
4. **Аналіз продуктивності**: Розумійте, що впливає на продуктивність вашого застосунку.

## Дізнайтесь більше {#learn-more}

- [OpenTelemetry .NET Tracing API](/docs/languages/dotnet/traces-api/)
- [Специфікація OpenTelemetry — Модель даних логів](/docs/specs/otel/logs/data-model/)
