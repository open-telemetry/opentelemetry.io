---
title: 専用のロギングパイプラインの設定
linkTitle: 専用パイプライン
description: 特定のログ用に専用のロギングパイプラインを設定する方法を学ぶ
weight: 50
default_lang_commit: 7333fc19a0fc19b5aae57f2aae72861f76cbae3e
cSpell:ignore: appsettings dedicatedLogger IConfiguration
---

このガイドでは、通常のアプリケーションログとは異なる送信先に送る必要がある特定のログのために、専用のロギングパイプラインを作成する方法を説明します。

## なぜ専用パイプラインを使うのか {#why-use-a-dedicated-pipeline}

専用のロギングパイプラインを使いたいシナリオがいくつかあります。

1. **セキュリティログ**: セキュリティ関連のログを専用のセキュリティ情報イベント管理（SIEM）システムに送信する。
2. **監査ログ**: 監査ログをコンプライアンスに準拠したストレージシステムに送信する。
3. **アクセスログ**: ユーザーアクセスログをアプリケーションログから分離する。
4. **デバッグ**: トラブルシューティング中に詳細なデバッグログを別の送信先に送る。

専用パイプラインを使うと、とりわけ次のことが可能になります。

- 特定のログに異なるプロセッサーやエクスポーターを適用する。
- ログの保持ポリシーを独立して制御する。
- アクセス権限を個別に管理する。
- 各システムに関連するログのみを送信してパフォーマンスを最適化する。

## 専用ロギングパイプラインの作成 {#creating-a-dedicated-logging-pipeline}

専用のロギングパイプラインを作成するには、次の手順が必要です。

1. 専用のロガーインターフェイスを作成する。
2. このインターフェイスのロガープロバイダーを実装する。
3. このプロバイダーの OpenTelemetry を設定する。
4. 専用のロギングサービスを登録する。

完全な例を順に見ていきましょう。

### ステップ1: 専用ロガーインターフェイスの定義 {#step-1-define-the-dedicated-logger-interface}

まず、専用ロガーのインターフェイスを作成します。

```csharp
namespace DedicatedLogging
{
    // 専用ロガーを区別するためのマーカーインターフェース
    public interface IDedicatedLogger
    {
    }

    // 汎用の専用ロガー（ILogger<T> と同じパターンに従う）
    public interface IDedicatedLogger<T> : IDedicatedLogger, ILogger<T>
    {
    }
}
```

### ステップ2: ロガープロバイダーの実装 {#step-2-implement-the-logger-provider}

次に、専用ロガーの実装を作成します。

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

        // ILogger の実装メソッド
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => _logger.BeginScope(state);
        public bool IsEnabled(LogLevel logLevel) => _logger.IsEnabled(logLevel);
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            => _logger.Log(logLevel, eventId, state, exception, formatter);
    }
}
```

### ステップ3: 設定用の拡張メソッドの作成 {#step-3-create-extension-methods-for-configuration}

専用ロギングサービスを登録するための拡張メソッドを作成します。

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
            // 専用ロギングパイプライン用の専用 LoggerFactory を作成する
            services.AddSingleton<ILoggerFactory>(sp =>
            {
                var factory = LoggerFactory.Create(builder =>
                {
                    // ロギングプロバイダーとして OpenTelemetry を追加する
                    builder.AddOpenTelemetry(options =>
                    {
                        // 設定が提供されている場合は適用する
                        if (configuration != null)
                        {
                            options.SetResourceBuilder(
                                ResourceBuilder.CreateDefault()
                                    .AddService(configuration["ServiceName"] ?? "dedicated-logging-service"));
                        }

                        // カスタム設定が提供されている場合は適用する
                        configure?.Invoke(options);
                    });
                });

                return factory;
            });

            // 専用ロガーを登録する
            services.AddTransient(typeof(IDedicatedLogger<>), typeof(DedicatedLogger<>));

            return services;
        }
    }
}
```

### ステップ4: アプリケーションでの専用ロガーの使用 {#step-4-use-the-dedicated-logger-in-your-application}

これで、ASP.NET Core アプリケーションで専用ロガーを使用できます。

```csharp
using DedicatedLogging;
using OpenTelemetry.Logs;

var builder = WebApplication.CreateBuilder(args);

// 一般的なアプリログ用のプライマリパイプラインを設定する
builder.Services.AddOpenTelemetry()
    .WithLogging(logging =>
    {
        logging.AddConsoleExporter();
        // プライマリのログ送信先向けに設定する
    });

// 専用ログ用のセカンダリパイプラインを設定する
builder.Services.AddDedicatedLogging(
    builder.Configuration.GetSection("DedicatedLogging"),
    logging =>
    {
        logging.AddConsoleExporter();
        // 専用のログ送信先向けに異なる設定を行う
        // 例:
        // logging.AddOtlpExporter(o => o.Endpoint = new Uri("https://security-logs.example.com"));
    });

var app = builder.Build();

app.MapGet("/", (HttpContext context, ILogger<Program> logger, IDedicatedLogger<Program> dedicatedLogger) =>
{
    // プライマリパイプラインに書き込まれる標準ログ
    logger.LogInformation("Standard application log");

    // 専用パイプラインに書き込まれる専用ログ
    dedicatedLogger.LogInformation("Request initiated from {IpAddress}",
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown");

    return "Hello from OpenTelemetry Logs!";
});

app.Run();
```

### ステップ5: ソース生成ロギングメソッドの使用 {#step-5-using-source-generated-logging-methods}

パフォーマンスを向上させるために、`LoggerMessage` 属性を使用してロギングメソッドを生成できます。

```csharp
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);

    [LoggerMessage(LogLevel.Information, "Request initiated from `{ipAddress}`.")]
    public static partial void RequestInitiated(this IDedicatedLogger logger, string ipAddress);
}
```

## 設定 {#configuration}

専用のロギングパイプラインは `appsettings.json` で設定できます。

```json
{
  "DedicatedLogging": {
    "ServiceName": "security-logs",
    "ExportEndpoint": "https://security-logs.example.com",
    "BatchSize": 512
  }
}
```

次に、この設定をスタートアップコードでバインドします。

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

## 詳しくはこちら {#learn-more}

- [ASP.NET Core の依存性注入](https://learn.microsoft.com/aspnet/core/fundamentals/dependency-injection)
- [OpenTelemetry の設定](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry)
- [.NET での高パフォーマンスロギング](https://learn.microsoft.com/dotnet/core/extensions/logger-message-generator)
