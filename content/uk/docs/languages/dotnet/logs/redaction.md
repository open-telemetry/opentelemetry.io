---
title: Цензурування логів
linkTitle: Цензурування
description: Дізнайтеся, як реалізувати цензурування логів для чутливих даних
weight: 60
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
---

У цьому посібнику показано, як реалізувати цензурування конфіденційної інформації у ваших журналах OpenTelemetry .NET. Цензурування є важливою практикою для захисту конфіденційних даних, таких як інформація, що дозволяє ідентифікувати особу (PII), облікові дані та інша конфіденційна інформація.

## Чому важливо цензурувати логи? {#why-redact-logs}

Цензурування чутливої інформації з логів є важливим для:

1. **Дотримання вимог**: Дотримання нормативних вимог, таких як GDPR, HIPAA або PCI DSS
2. **Безпеки**: Запобігання витоку чутливих даних у файлах журналів або системах управління журналами
3. **Конфіденційності**: Захист конфіденційності користувачів шляхом видалення інформації, що дозволяє ідентифікувати особу (PII)
4. **Зниження ризиків**: Мінімізація впливу потенційних витоків даних журналів

## Реалізація базового процесора цензурування {#implementing-a-basic-redaction-processor}

OpenTelemetry дозволяє створювати власні процесори, які можуть змінювати записи журналів перед їх експортом. Ось як створити базовий процесор цензурування:

```csharp
using System.Collections;
using OpenTelemetry;
using OpenTelemetry.Logs;

internal sealed class MyRedactionProcessor : BaseProcessor<LogRecord>
{
    public override void OnEnd(LogRecord logRecord)
    {
        if (logRecord.Attributes != null)
        {
            logRecord.Attributes = new MyClassWithRedactionEnumerator(logRecord.Attributes);
        }
    }

    internal sealed class MyClassWithRedactionEnumerator : IReadOnlyList<KeyValuePair<string, object?>>
    {
        private readonly IReadOnlyList<KeyValuePair<string, object?>> state;

        public MyClassWithRedactionEnumerator(IReadOnlyList<KeyValuePair<string, object?>> state)
        {
            this.state = state;
        }

        public int Count => this.state.Count;

        public KeyValuePair<string, object?> this[int index]
        {
            get
            {
                var item = this.state[index];
                var entryVal = item.Value?.ToString();
                if (entryVal != null && entryVal.Contains("<secret>"))
                {
                    return new KeyValuePair<string, object?>(item.Key, "***REDACTED***");
                }

                return item;
            }
        }

        public IEnumerator<KeyValuePair<string, object?>> GetEnumerator()
        {
            for (var i = 0; i < this.Count; i++)
            {
                yield return this[i];
            }
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }
    }
}
```

Цей процесор перевіряє кожне значення атрибуту журналу і замінює всі, що містять рядок «<secret>», на «**_REDACTED_**».

## Використання процесора цензурування {#using-the-redaction-processor}

Щоб використовувати процесор цензурування, додайте його до конфігурації журналювання OpenTelemetry:

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry.Logs;

// Припустимо, що MyRedactionProcessor визначено в іншому місці.
// public class MyRedactionProcessor : BaseProcessor<LogRecord> { ... }

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddProcessor(new MyRedactionProcessor());
        logging.AddConsoleExporter();
    });
});

var logger = loggerFactory.CreateLogger<Program>();
// Повідомлення буде відредаговано MyRedactionProcessor
logger.FoodPriceChanged("", 9.99);

loggerFactory.Dispose();
```

При виконанні цього коду будь-який атрибут журналу, що містить "<secret>", буде вилучений з вихідних даних.

## Розширені стратегії цензурування {#advanced-redaction-strategies}

У реальних застосунках вам знадобляться більш складні стратегії цензурування, або через SDK, або через процесори OTel Collector.

Ось кілька підходів, які використовують SDK:

### 1. Відповідність шаблонам за допомогою регулярних виразів {#1-pattern-matching-with-regular-expressions}

```csharp
public KeyValuePair<string, object?> this[int index]
{
    get
    {
        var item = this.state[index];
        var entryVal = item.Value?.ToString();
        if (entryVal != null)
        {
            // Redact credit card numbers
            var redactedValue = Regex.Replace(
                entryVal,
                @"\b(?:\d{4}[-\s]?){3}\d{4}\b",
                "***CARD-REDACTED***");

            // Redact email addresses
            redactedValue = Regex.Replace(
                redactedValue,
                @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
                "***EMAIL-REDACTED***");

            if (redactedValue != entryVal)
            {
                return new KeyValuePair<string, object?>(item.Key, redactedValue);
            }
        }

        return item;
    }
}
```

### 2. Цензурування на основі полів {#2-field-based-redaction}

Ви можете захотіти відредагувати конкретні назви полів незалежно від їх вмісту:

```csharp
public KeyValuePair<string, object?> this[int index]
{
    get
    {
        var item = this.state[index];

        // Цензурування чутливих полів за назвою
        var sensitiveFields = new[] { "password", "ssn", "creditcard", "api_key" };
        if (sensitiveFields.Any(field => item.Key.Contains(field, StringComparison.OrdinalIgnoreCase)))
        {
            return new KeyValuePair<string, object?>(item.Key, "***REDACTED***");
        }

        return item;
    }
}
```

### 3. Часткове цензурування {#3-partial-redaction}

Для деяких типів даних ви можете захотіти показати частину значення:

```csharp
public KeyValuePair<string, object?> this[int index]
{
    get
    {
        var item = this.state[index];
        var entryVal = item.Value?.ToString();

        if (item.Key.Equals("email", StringComparison.OrdinalIgnoreCase) && entryVal != null)
        {
            var parts = entryVal.Split('@');
            if (parts.Length == 2)
            {
                // Показати перший символ імені користувача та домен
                var redactedEmail = $"{parts[0][0]}***@{parts[1]}";
                return new KeyValuePair<string, object?>(item.Key, redactedEmail);
            }
        }

        return item;
    }
}
```

## Інтеграція з ASP.NET Core {#integration-with-aspnet-core}

Для ASP.NET Core застосунків ви можете інтегрувати свій процесор цензурування:

```csharp
builder.Services.AddOpenTelemetry()
    .WithLogging(logging =>
    {
        logging.AddProcessor(new MyRedactionProcessor());
        logging.AddConsoleExporter();
    });
```

## Дізнайтеся більше {#learn-more}

- [Regular Expressions in .NET](https://learn.microsoft.com/dotnet/standard/base-types/regular-expressions)
