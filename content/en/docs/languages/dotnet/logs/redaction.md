---
title: Log redaction
linkTitle: Redaction
description: Learn how to implement log redaction for sensitive data
weight: 60
---

This guide demonstrates how to implement redaction for sensitive information in
your OpenTelemetry .NET logs. Redaction is an important practice for protecting
sensitive data like personally identifiable information (PII), credentials, and
other confidential information.

## Why redact logs?

Redacting sensitive information from logs is crucial for:

1. **Compliance**: Meeting regulatory requirements like GDPR, HIPAA, or PCI DSS
2. **Security**: Preventing exposure of sensitive data in log files or log
   management systems
3. **Privacy**: Protecting user privacy by removing personally identifiable
   information (PII)
4. **Risk reduction**: Minimizing the impact of potential log data breaches

## Implementing a basic redaction processor

OpenTelemetry allows you to create custom processors that can modify log records
before they're exported. Here's how to create a basic redaction processor:

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

This processor checks each log attribute value and replaces any that contain the
string "<secret>" with "**_REDACTED_**".

## Using the redaction processor

To use the redaction processor, add it to your OpenTelemetry logging
configuration:

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry.Logs;

// Assume MyRedactionProcessor is defined elsewhere
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
// Message will be redacted by MyRedactionProcessor
logger.FoodPriceChanged("", 9.99);

loggerFactory.Dispose();
```

When you run this code, any log attribute containing "<secret>" will be redacted
in the output.

## Advanced redaction strategies

In real-world applications, you'll want more sophisticated redaction strategies,
either through the SDK or OTel Collector processors.

Here are some approaches that use the SDK:

### 1. Pattern matching with regular expressions

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

### 2. Field-based redaction

You may want to redact specific field names regardless of their content:

```csharp
public KeyValuePair<string, object?> this[int index]
{
    get
    {
        var item = this.state[index];

        // Redact sensitive fields by name
        var sensitiveFields = new[] { "password", "ssn", "creditcard", "api_key" };
        if (sensitiveFields.Any(field => item.Key.Contains(field, StringComparison.OrdinalIgnoreCase)))
        {
            return new KeyValuePair<string, object?>(item.Key, "***REDACTED***");
        }

        return item;
    }
}
```

### 3. Partial redaction

For some data types, you might want to show part of the value:

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
                // Show first character of the username and the domain
                var redactedEmail = $"{parts[0][0]}***@{parts[1]}";
                return new KeyValuePair<string, object?>(item.Key, redactedEmail);
            }
        }

        return item;
    }
}
```

## Integration with ASP.NET Core

For ASP.NET Core applications, you can integrate your redaction processor:

```csharp
builder.Services.AddOpenTelemetry()
    .WithLogging(logging =>
    {
        logging.AddProcessor(new MyRedactionProcessor());
        logging.AddConsoleExporter();
    });
```

## Learn more

- [Regular Expressions in .NET](https://learn.microsoft.com/dotnet/standard/base-types/regular-expressions)
