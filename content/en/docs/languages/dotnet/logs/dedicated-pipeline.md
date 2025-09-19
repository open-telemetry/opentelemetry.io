---
title: Setting up a dedicated logging pipeline
linkTitle: Dedicated pipeline
description: Learn how to set up a dedicated logging pipeline for specific logs
weight: 50
cSpell:ignore: dedicatedLogger IConfiguration
---

This guide demonstrates how to create a dedicated logging pipeline for specific
logs that need to be sent to a different destination than your regular
application logs.

## Why use a dedicated pipeline?

There are several scenarios where you might want to use a dedicated logging
pipeline:

1. **Security logs**: Sending security-related logs to a specialized security
   information and event management (SIEM) system.
2. **Audit logs**: Sending audit logs to a compliant storage system.
3. **Access logs**: Separating user access logs from application logs.
4. **Debugging**: Sending verbose debugging logs to a separate destination
   during troubleshooting.

Among other things, a dedicated pipeline allows you to:

- Apply different processors and exporters to specific logs.
- Control log retention policies independently.
- Manage access permissions separately.
- Optimize performance by sending only relevant logs to each system.

## Creating a dedicated logging pipeline

To create a dedicated logging pipeline, you need to:

1. Create a dedicated logger interface.
2. Implement a logger provider for this interface.
3. Configure OpenTelemetry for this provider.
4. Register the dedicated logging services.

Let's walk through a complete example:

### Step 1: Define the dedicated logger interface

First, create an interface for your dedicated logger:

```csharp
namespace DedicatedLogging
{
    // Marker interface to distinguish dedicated loggers
    public interface IDedicatedLogger
    {
    }

    // Generic dedicated logger (follows the same pattern as ILogger<T>)
    public interface IDedicatedLogger<T> : IDedicatedLogger, ILogger<T>
    {
    }
}
```

### Step 2: Implement the logger provider

Next, create the implementation of your dedicated logger:

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

        // ILogger implementation methods
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => _logger.BeginScope(state);
        public bool IsEnabled(LogLevel logLevel) => _logger.IsEnabled(logLevel);
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            => _logger.Log(logLevel, eventId, state, exception, formatter);
    }
}
```

### Step 3: Create extension methods for configuration

Create extension methods to register your dedicated logging services:

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
            // Create a dedicated LoggerFactory for the dedicated logging pipeline
            services.AddSingleton<ILoggerFactory>(sp =>
            {
                var factory = LoggerFactory.Create(builder =>
                {
                    // Add OpenTelemetry as the logging provider
                    builder.AddOpenTelemetry(options =>
                    {
                        // Apply configuration if provided
                        if (configuration != null)
                        {
                            options.SetResourceBuilder(
                                ResourceBuilder.CreateDefault()
                                    .AddService(configuration["ServiceName"] ?? "dedicated-logging-service"));
                        }

                        // Apply custom configuration if provided
                        configure?.Invoke(options);
                    });
                });

                return factory;
            });

            // Register the dedicated logger
            services.AddTransient(typeof(IDedicatedLogger<>), typeof(DedicatedLogger<>));

            return services;
        }
    }
}
```

### Step 4: Use the dedicated logger in your application

Now you can use your dedicated logger in your ASP.NET Core application:

```csharp
using DedicatedLogging;
using OpenTelemetry.Logs;

var builder = WebApplication.CreateBuilder(args);

// Set up primary pipeline for common app logs
builder.Services.AddOpenTelemetry()
    .WithLogging(logging =>
    {
        logging.AddConsoleExporter();
        // Configure for your primary logging destination
    });

// Set up secondary pipeline for dedicated logs
builder.Services.AddDedicatedLogging(
    builder.Configuration.GetSection("DedicatedLogging"),
    logging =>
    {
        logging.AddConsoleExporter();
        // Configure differently for your dedicated logging destination
        // For example:
        // logging.AddOtlpExporter(o => o.Endpoint = new Uri("https://security-logs.example.com"));
    });

var app = builder.Build();

app.MapGet("/", (HttpContext context, ILogger<Program> logger, IDedicatedLogger<Program> dedicatedLogger) =>
{
    // Standard log written to primary pipeline
    logger.LogInformation("Standard application log");

    // Dedicated log written to dedicated pipeline
    dedicatedLogger.LogInformation("Request initiated from {IpAddress}",
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown");

    return "Hello from OpenTelemetry Logs!";
});

app.Run();
```

### Step 5: Using source-generated logging methods

For better performance, you can use the `LoggerMessage` attribute to generate
logging methods:

```csharp
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);

    [LoggerMessage(LogLevel.Information, "Request initiated from `{ipAddress}`.")]
    public static partial void RequestInitiated(this IDedicatedLogger logger, string ipAddress);
}
```

## Configuration

You can configure the dedicated logging pipeline through `appsettings.json`:

```json
{
  "DedicatedLogging": {
    "ServiceName": "security-logs",
    "ExportEndpoint": "https://security-logs.example.com",
    "BatchSize": 512
  }
}
```

Then bind this configuration in your startup code:

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

## Learn more

- [ASP.NET Core Dependency Injection](https://learn.microsoft.com/aspnet/core/fundamentals/dependency-injection)
- [OpenTelemetry Configuration](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry)
- [High-performance logging in .NET](https://learn.microsoft.com/dotnet/core/extensions/logger-message-generator)
