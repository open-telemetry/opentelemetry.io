---
title: Маршрутизація логів до різних пунктів призначення
linkTitle: Маршрутизація
description: Дізнайтеся, як маршрутизувати логи з одного `ILogger` до різних OTLP пунктів призначення за допомогою власного процесора.
weight: 55
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
---

Цей посібник показує, як маршрутизувати логи з **одного `ILogger`** до різних OTLP пунктів призначення за допомогою власного процесора. Він слідує шаблону [Routing](/docs/specs/otel/logs/supplementary-guidelines/#routing), описаному в додаткових рекомендаціях специфікації OpenTelemetry.

## Чому варто маршрутизувати логи? {#why-route-logs}

У деяких сценаріях ви хочете, щоб весь код застосунку використовував одну конвеєрну лінію `ILogger`, але певні логи надсилалися до одного бекенду, а решта — до іншого. Наприклад:

- Логи з компонентів **payment** повинні надсилатися до спеціальної точки доступу колектора (`OTLP2`).
- Всі інші логи повинні надсилатися до стандартної точки доступу (`OTLP1`).

Якщо ваш застосунок може створювати кілька екземплярів `ILoggerFactory` і дозволяти викликам обирати відповідний, розгляньте можливість використання [спеціальної конвеєрної лінії логування](../dedicated-pipeline/) замість цього.

## Як це працює {#how-it-works}

Рішення про маршрутизацію приймається на рівні процесора шляхом перевірки `CategoryName` кожного `LogRecord`. Власний процесор перевіряє, чи починається імʼя категорії з налаштованого префікса, і пересилає запис до відповідного експортного конвеєра:

```text
ILogger (один конвеєр)
   |
   v
LoggerProvider
   |
   v
RoutingProcessor (власний процесор)
   +-- CategoryName запускається з префіксом --> ExportProcessor -> OtlpLogExporter (OTLP2)
   +-- інакше ---------------------------------> ExportProcessor -> OtlpLogExporter (OTLP1)
```

1. Створюються два екземпляри `OtlpLogExporter`, кожен з яких вказує на різну точку доступу.
2. Кожен екземпляр експортера обгортається в `BatchLogRecordExportProcessor`.
3. Власний `RoutingProcessor` розширює `BaseProcessor<LogRecord>` і перевизначає метод `OnEnd`. Він перевіряє, чи починається `CategoryName` запису журналу з налаштованого префікса, щоб визначити, який внутрішній процесор отримає запис.
4. Процесор маршрутизації реєструється в `LoggerProvider` через `AddProcessor`.

## Реалізація {#implementation}

### Власний процесор маршрутизації {#the-custom-routing-processor}

Власний `RoutingProcessor` перевіряє `CategoryName` кожного запису журналу і пересилає його до одного з двох внутрішніх процесорів. Він також делегує виклики `ForceFlush`, `Shutdown` та `Dispose`, щоб обидва експортні конвеєри були належним чином очищені та завершені:

```csharp
using OpenTelemetry;
using OpenTelemetry.Logs;

internal sealed class RoutingProcessor : BaseProcessor<LogRecord>
{
    private readonly string categoryPrefix;
    private readonly BaseProcessor<LogRecord> defaultProcessor;
    private readonly BaseProcessor<LogRecord> paymentProcessor;

    public RoutingProcessor(
        string categoryPrefix,
        BaseProcessor<LogRecord> defaultProcessor,
        BaseProcessor<LogRecord> paymentProcessor)
    {
        this.categoryPrefix = categoryPrefix ?? throw new ArgumentNullException(nameof(categoryPrefix));
        this.defaultProcessor = defaultProcessor ?? throw new ArgumentNullException(nameof(defaultProcessor));
        this.paymentProcessor = paymentProcessor ?? throw new ArgumentNullException(nameof(paymentProcessor));
    }

    public override void OnEnd(LogRecord data)
    {
        if (data.CategoryName?.StartsWith(this.categoryPrefix, StringComparison.Ordinal) == true)
        {
            this.paymentProcessor.OnEnd(data);
        }
        else
        {
            this.defaultProcessor.OnEnd(data);
        }
    }

    protected override bool OnForceFlush(int timeoutMilliseconds)
    {
        var result1 = this.defaultProcessor.ForceFlush(timeoutMilliseconds);
        var result2 = this.paymentProcessor.ForceFlush(timeoutMilliseconds);
        return result1 && result2;
    }

    protected override bool OnShutdown(int timeoutMilliseconds)
    {
        var result1 = this.defaultProcessor.Shutdown(timeoutMilliseconds);
        var result2 = this.paymentProcessor.Shutdown(timeoutMilliseconds);
        return result1 && result2;
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            this.defaultProcessor.Dispose();
            this.paymentProcessor.Dispose();
        }

        base.Dispose(disposing);
    }
}
```

### Реєстрування процесора маршрутизації в LoggerProvider {#registering-the-routing-processor-on-the-loggerprovider}

Реєстрування процесора маршрутизації в `LoggerProvider`. Обидва логери нижче використовують той самий `ILoggerFactory` та конвеєр `LoggerProvider`, але їхні записи журналу спрямовуються до різних OTLP-цілей залежно від назви категорії:

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;

// Створимо два OTLP-експортери, спрямовані на різні цілі.
var otlpExporter1 = new OtlpLogExporter(new OtlpExporterOptions
{
    Endpoint = new Uri("http://localhost:4317"), // OTLP ціль 1
});

var otlpExporter2 = new OtlpLogExporter(new OtlpExporterOptions
{
    Endpoint = new Uri("http://localhost:4318"), // OTLP ціль 2
});

// Огорнемо кожен експортер у BatchLogRecordExportProcessor.
var defaultExportProcessor = new BatchLogRecordExportProcessor(otlpExporter1);
var paymentExportProcessor = new BatchLogRecordExportProcessor(otlpExporter2);

// Створимо процесор маршрутизації. Логи, чиї назви категорій починаються з
// "Payment.", надсилаються до OTLP2; все інше йде до OTLP1.
var routingProcessor = new RoutingProcessor(
    categoryPrefix: "Payment.",
    defaultProcessor: defaultExportProcessor,
    paymentProcessor: paymentExportProcessor);

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddProcessor(routingProcessor);

        // Опціонально: також додайте консольний експортер, щоб бачити всі логи локально.
        logging.AddConsoleExporter();
    });
});

// Обидва логери використовують той самий ILoggerFactory / конвеєр LoggerProvider.
var orderLogger = loggerFactory.CreateLogger("Order.Processing");
var paymentLogger = loggerFactory.CreateLogger("Payment.Processing");

orderLogger.LogInformation("Processing order {OrderId}.", "ORD-001");     // --> OTLP1
paymentLogger.LogInformation("Processing payment {PaymentId}.", "PAY-001"); // --> OTLP2
orderLogger.LogInformation("Order {OrderId} completed.", "ORD-001");      // --> OTLP1

// Звільніть ресурси фабрики логерів перед завершенням роботи програми.
// Це призведе до скидання залишкових логів і завершення конвеєра логування.
loggerFactory.Dispose();
```

## Основні моменти {#key-considerations}

- **Умова маршрутизації оцінюється для кожного запису логу.** Тримайте логіку швидкою — вона виконується синхронно при кожному виклику логу.
- **Управління життєвим циклом.** Переконайтеся, що процесор маршрутизації делегує `ForceFlush`, `Shutdown` та `Dispose` всім внутрішнім процесорам, щоб кожен експортний конвеєр був належним чином очищений і завершений.
- **Один конвеєр.** Оскільки існує лише один `ILoggerFactory` та `LoggerProvider`, цей підхід добре працює з впровадженням залежностей, де компоненти не знають про наявність кількох логерів.

## Додаткова література {#further-reading}

- Повний приклад, який можна запустити, у репозиторії OpenTelemetry .NET: [`docs/logs/routing`](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/docs/logs/routing)
- [Маршрутизація](/docs/specs/otel/logs/supplementary-guidelines/#routing) у додаткових керівництвах специфікації OpenTelemetry
- [Налаштування виділеного конвеєра логування](../dedicated-pipeline/) — альтернатива, коли ваш застосунок може використовувати кілька екземплярів `ILoggerFactory`
