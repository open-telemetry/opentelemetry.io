---
title: Налаштування спеціалізованого конвеєра логування
linkTitle: Спеціалізований конвеєр
description: Дізнайтеся, як налаштувати спеціалізований конвеєр логування для конкретних логів
weight: 50
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: appsettings dedicatedLogger IConfiguration
---

У цьому посібнику показано, як створити спеціальний конвеєр реєстрації для конкретних логів, які потрібно надсилати в інше місце призначення, ніж звичайні логи програми.

## Чому слід використовувати спеціалізований конвеєр? {#why-use-a-dedicated-pipeline}

Існує кілька сценаріїв, коли ви можете захотіти використовувати спеціалізований конвеєр логування:

1. **Логи безпеки**: Надсилання логів, повʼязаних з безпекою, до спеціалізованої системи управління безпекою та подіями (SIEM).
2. **Аудиторські логи**: Надсилання логів аудиту до системи зберігання, що відповідає вимогам.
3. **Логи доступу**: Відокремлення логів доступу користувачів від логів програми.
4. **Налагодження**: Надсилання детальних логів налагодження до окремого місця призначення під час усунення несправностей.

Серед іншого, спеціалізований конвеєр дозволяє вам:

- Використовувати різні процесори та експортери для конкретних логів.
- Контролювати політики зберігання логів незалежно.
- Керувати правами доступу окремо.
- Оптимізувати продуктивність, надсилаючи лише відповідні логи до кожної системи.

## Створення спеціалізованого конвеєра логування {#creating-a-dedicated-logging-pipeline}

Щоб створити спеціалізований конвеєр логування, вам потрібно:

1. Створити інтерфейс для спеціалізованого логера.
2. Реалізувати провайдер логера для цього інтерфейсу.
3. Налаштувати OpenTelemetry для цього провайдера.
4. Зареєструвати служби спеціалізованого логування.

Давайте розглянемо повний приклад:

### Крок 1: Визначте інтерфейс спеціалізованого логера{#step-1-define-the-dedicated-logger-interface}

Спочатку створіть інтерфейс для вашого спеціалізованого логера:

```csharp
namespace DedicatedLogging
{
    // Інтерфейс маркера для розрізнення спеціальних логерів
    public interface IDedicatedLogger
    {
    }

    // Загальний спеціалізований логер (відповідає тому ж шаблону, що й ILogger<T>)
    public interface IDedicatedLogger<T> : IDedicatedLogger, ILogger<T>
    {
    }
}
```

### Крок 2: Впровадження провайдера логера{#step-2-implement-the-logger-provider}

Далі створіть реалізацію вашого спеціалізованого логера:

```csharp
namespace DedicatedLogging
{
    internal class DedicatedLogger<T> : IDedicatedLogger<T>
    {
        private readonly ILogger<T> _logger;

        public DedicatedLogger(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<T>();
        }

        // Методи реалізації ILogger
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => _logger.BeginScope(state);
        public bool IsEnabled(LogLevel logLevel) => _logger.IsEnabled(logLevel);
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            => _logger.Log(logLevel, eventId, state, exception, formatter);
    }
}
```

### Крок 3: Створіть методи розширення для конфігурації{#step-3-create-extension-methods-for-configuration}

Створіть методи розширення для реєстрації ваших служб спеціалізованого логування:

```csharp
namespace DedicatedLogging
{
    public static class DedicatedLoggingExtensions
    {
        public static IServiceCollection AddDedicatedLogging(
            this IServiceCollection services,
            IConfiguration? configuration = null,
            Action<OpenTelemetryLoggerOptions>? configure = null)
        {
            // Створити спеціальний LoggerFactory для спеціального конвеєра логування
            services.AddSingleton<ILoggerFactory>(sp =>
            {
                var factory = LoggerFactory.Create(builder =>
                {
                    // Додати OpenTelemetry як провайдер логування
                    builder.AddOpenTelemetry(options =>
                    {
                        // Застосувати конфігурацію, якщо вона надана
                        if (configuration != null)
                        {
                            options.SetResourceBuilder(
                                ResourceBuilder.CreateDefault()
                                    .AddService(configuration["ServiceName"] ?? "dedicated-logging-service"));
                        }

                        // Застосувати власну конфігурацію, якщо вона надана
                        configure?.Invoke(options);
                    });
                });

                return factory;
            });

            // Зареєструвати спеціальний логер
            services.AddTransient(typeof(IDedicatedLogger<>), typeof(DedicatedLogger<>));

            return services;
        }
    }
}
```

### Крок 4: Використання спеціального логера у вашій програмі{#step-4-use-the-dedicated-logger-in-your-application}

Тепер ви можете використовувати свій спеціальний логер у вашій програмі ASP.NET Core:

```csharp
using DedicatedLogging;
using OpenTelemetry.Logs;

var builder = WebApplication.CreateBuilder(args);

// Налаштування основного конвеєра для загальних логів додатків
builder.Services.AddOpenTelemetry()
    .WithLogging(logging =>
    {
        logging.AddConsoleExporter();
        // Налаштування для вашого основного місця призначення логування
    });

// Налаштування вторинного конвеєра для спеціальних логів
builder.Services.AddDedicatedLogging(
    builder.Configuration.GetSection("DedicatedLogging"),
    logging =>
    {
        logging.AddConsoleExporter();
        // Налаштування по-іншому для вашого спеціального місця призначення логування
        // Наприклад:
        // logging.AddOtlpExporter(o => o.Endpoint = new Uri("https://security-logs.example.com"));
    });

var app = builder.Build();

app.MapGet("/", (HttpContext context, ILogger<Program> logger, IDedicatedLogger<Program> dedicatedLogger) =>
{
    // Стандартний лог записується в основний конвеєр
    logger.LogInformation("Standard application log");

    // Спеціальний лог записується в спеціальний конвеєр
    dedicatedLogger.LogInformation("Request initiated from {IpAddress}",
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown");

    return "Hello from OpenTelemetry Logs!";
});

app.Run();
```

### Крок 5: Використання методів реєстрації, що генеруються джерелом{#step-5-using-source-generated-logging-methods}

Для кращої продуктивності ви можете використовувати атрибут `LoggerMessage` для генерації методів логування:

```csharp
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);

    [LoggerMessage(LogLevel.Information, "Request initiated from `{ipAddress}`.")]
    public static partial void RequestInitiated(this IDedicatedLogger logger, string ipAddress);
}
```

## Конфігурація {#configuration}

Ви можете налаштувати спеціальний конвеєр логування через `appsettings.json`:

```json
{
  "DedicatedLogging": {
    "ServiceName": "security-logs",
    "ExportEndpoint": "https://security-logs.example.com",
    "BatchSize": 512
  }
}
```

Потім вкажіть цю конфігурацію у вашому стартовому коді:

```csharp
builder.Services.AddDedicatedLogging(
    builder.Configuration.GetSection("DedicatedLogging"),
    logging =>
    {
        var config = builder.Configuration.GetSection("DedicatedLogging");
        var endpoint = config["ExportEndpoint"];

        if (!string.IsNullOrEmpty(endpoint))
        {
            logging.AddOtlpExporter(o =>
            {
                o.Endpoint = new Uri(endpoint);
            });
        }
    });
```

## Дізнайтеся більше {#learn-more}

- [ASP.NET Core Dependency Injection](https://learn.microsoft.com/aspnet/core/fundamentals/dependency-injection)
- [OpenTelemetry Configuration](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry)
- [High-performance logging in .NET](https://learn.microsoft.com/dotnet/core/extensions/logger-message-generator)
