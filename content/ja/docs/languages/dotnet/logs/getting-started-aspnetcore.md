---
title: ログ入門 - ASP.NET Core
linkTitle: ASP.NET Core
description: ASP.NET Core アプリケーションで OpenTelemetry ログを使用する方法を学びましょう
weight: 20
default_lang_commit: 49a4a61076ca6c7369666e858be884cd157f7d3c
cSpell:ignore: aspnetcoreapp
---

このガイドでは、ASP.NET Core アプリケーションで OpenTelemetry .NET ログを使い始める方法を紹介します。

## 前提条件 {#prerequisites}

- コンピュータに [.NET SDK](https://dotnet.microsoft.com/download) がインストールされていること

## ASP.NET Core アプリケーションの作成 {#creating-an-aspnet-core-application}

新しい ASP.NET Core Web アプリケーションを作成します。

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## OpenTelemetry ログの追加 {#adding-opentelemetry-logs}

必要な OpenTelemetry パッケージをインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

`Program.cs` ファイルを次のコードで更新します。

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;

var builder = WebApplication.CreateBuilder(args);

// 説明目的のみで、デフォルトの .NET ログプロバイダーを無効化します。
// このデモでは、詳細な OpenTelemetry コンソールエクスポーターを使用するため、
// コンソールログプロバイダーを削除します。ほとんどの開発および本番環境では
// デフォルトのコンソールプロバイダーで十分であり、これらのプロバイダーを
// クリアする必要はありません。
builder.Logging.ClearProviders();

// WithLogging 拡張メソッドを呼び出して OpenTelemetry ログプロバイダーを追加します。
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(builder.Environment.ApplicationName))
    .WithLogging(logging => logging
        /* 注意: ConsoleExporter はデモ目的でのみ使用しています。本番環境では
           ConsoleExporter を他のエクスポーター（たとえば OTLP Exporter）に
           置き換えてください。 */
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

## アプリケーションの実行 {#running-the-application}

アプリケーションを実行します。

```shell
dotnet run
```

コンソールに表示された URL（たとえば `http://localhost:5000`）にブラウザでアクセスします。

コンソールに次のようなログ出力が表示されるはずです。

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

おめでとうございます！
ASP.NET Core アプリケーションで OpenTelemetry を使用してログを収集できるようになりました。

## 仕組み {#how-it-works}

### デフォルトのログプロバイダーの置き換え {#replacing-default-logging-providers}

デモ目的で、サンプルではデフォルトの .NET ログプロバイダーをクリアし、OpenTelemetry のコンソール出力をより分かりやすく表示します。

```csharp
// 説明目的のみで、デフォルトの .NET ログプロバイダーを無効化します。
// このデモでは、詳細な OpenTelemetry コンソールエクスポーターを使用するため、
// コンソールログプロバイダーを削除します。ほとんどの開発および本番環境では
// デフォルトのコンソールプロバイダーで十分であり、これらのプロバイダーを
// クリアする必要はありません。
builder.Logging.ClearProviders();
```

実際のアプリケーションでは、通常デフォルトのプロバイダーを維持したまま、OpenTelemetry をそれらと併用します。

### OpenTelemetry ログの追加 {#adding-opentelemetry-logging}

アプリケーションは `AddOpenTelemetry()` 拡張メソッドを使用して OpenTelemetry を設定します。

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(builder.Environment.ApplicationName))
    .WithLogging(logging => logging
        .AddConsoleExporter());
```

このコードは以下のことを行います。

1. OpenTelemetry をサービスコレクションに追加します
2. リソース情報（サービス名など）を設定します
3. `WithLogging()` 拡張メソッドでログを設定します
4. コンソールエクスポーターを追加して、ログをコンソールに出力します

### ログのための依存性注入の使用 {#using-dependency-injection-for-logging}

ASP.NET Core はログのための組み込みの依存性注入を提供します。
サンプルではこれを使用して、リクエストハンドラーにロガーを注入します。

```csharp
app.MapGet("/", (ILogger<Program> logger) =>
{
    logger.FoodPriceChanged("artichoke", 9.99);

    return "Hello from OpenTelemetry Logs!";
});
```

`ILogger<Program>` パラメーターはフレームワークによって自動的に注入され、ログにはカテゴリ名 "Program" が含まれます。

### LoggerMessage ソース生成の使用 {#using-loggermessage-source-generation}

サンプルでは、高性能な構造化ログのために[コンパイル時ログソース生成](https://docs.microsoft.com/dotnet/core/extensions/logger-message-generator)を使用しています。

```csharp
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Starting the app...")]
    public static partial void StartingApp(this ILogger logger);

    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);
}
```

このアプローチには以下の特徴があります。

- 文字列補間よりも優れたパフォーマンスを提供します。
- ログパラメーターの型安全性を保証します。
- 名前付きパラメーターを持つ構造化ログを生成します。
- `LogRecord` に `EventName` を自動的に生成します。
-

## さらに学ぶ {#learn-more}

- [コンソールでの入門](/docs/languages/dotnet/logs/getting-started-console/)
- [ログの相関](/docs/languages/dotnet/logs/correlation/)
- [ASP.NET Core のログ](https://learn.microsoft.com/aspnet/core/fundamentals/logging/)
