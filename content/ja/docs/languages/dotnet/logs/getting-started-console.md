---
title: 5分で始める OpenTelemetry .NET ログ - コンソールアプリケーション
linkTitle: コンソール
description: .NET コンソールアプリケーションで OpenTelemetry ログを使用する方法を学ぶ
weight: 10
default_lang_commit: f1a074a1d8dc390c2abcac98ad671f38d0c73d88
# prettier-ignore
cSpell:ignore: brandName companyName Contoso Listeria monocytogenes productDescription recallReasonDescription
---

このガイドでは、コンソールアプリケーションで OpenTelemetry .NET ログをわずか数分で使い始める方法を紹介します。

## 前提条件 {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) がコンピューターにインストールされていること

## コンソールアプリケーションの作成 {#creating-a-console-application}

新しいコンソールアプリケーションを作成して実行します。

```shell
dotnet new console --output getting-started
cd getting-started
dotnet run
```

次のような出力が表示されるはずです。

```text
Hello World!
```

## OpenTelemetry ログの追加 {#adding-opentelemetry-logs}

OpenTelemetry Console Exporter パッケージをインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

`Program.cs` ファイルを次のコードに更新します。

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;

// OpenTelemetry を使用してロガーファクトリーを作成する
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options =>
    {
        options.AddConsoleExporter();
    });
});

// ロガーインスタンスを取得する
var logger = loggerFactory.CreateLogger<Program>();

// シンプルなメッセージをログに記録する
logger.LogInformation("Hello from OpenTelemetry .NET Logs!");

// 構造化データを使ってログを記録する
logger.FoodPriceChanged("artichoke", 9.99);

// より複雑な例をログに記録する
logger.FoodRecallNotice(
    "Food & Beverages",
    "Contoso",
    "Salads",
    "Contoso Fresh Vegetables, Inc.",
    "due to a possible health risk from Listeria monocytogenes");

// 構造化ロギングのための拡張メソッドを定義する
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);

    [LoggerMessage(LogLevel.Critical, "A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).")]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        string productType,
        string brandName,
        string productDescription,
        string companyName,
        string recallReasonDescription);
}
```

アプリケーションを再度実行すると（`dotnet run` を使用）、コンソールにログ出力が表示されるはずです。

```text
LogRecord.Timestamp:               2023-09-15T06:07:03.5502083Z
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

LogRecord.Timestamp:               2023-09-15T06:07:03.5683511Z
LogRecord.CategoryName:            Program
LogRecord.Severity:                Fatal
LogRecord.SeverityText:            Critical
LogRecord.Body:                    A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).
LogRecord.Attributes (Key:Value):
    brandName: Contoso
    productDescription: Salads
    productType: Food & Beverages
    recallReasonDescription: due to a possible health risk from Listeria monocytogenes
    companyName: Contoso Fresh Vegetables, Inc.
    OriginalFormat (a.k.a Body): A `{productType}` recall notice was published for `{brandName} {productDescription}` produced by `{companyName}` ({recallReasonDescription}).
LogRecord.EventId:                 1338249384
LogRecord.EventName:               FoodRecallNotice
```

おめでとうございます！
これで OpenTelemetry を使用してログを収集できるようになりました。

## 仕組み {#how-it-works}

このプログラムは、[`LoggerFactory`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.iloggerfactory) インスタンスを生成してロギングパイプラインを作成し、OpenTelemetry を[ロギングプロバイダー](https://docs.microsoft.com/dotnet/core/extensions/logging-providers)として追加しています。

OpenTelemetry SDK は、デモ用にログをコンソールにエクスポートする `ConsoleExporter` で設定されています。
本番環境では、かわりに [OTLP Exporter](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol) などの他のエクスポーターを使用すべきです。

`LoggerFactory` インスタンスは [`ILogger`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger) インスタンスの作成に使用され、この `ILogger` が実際のロギングを行います。

.NET のロギングのベストプラクティスに従い、[コンパイル時のロギングソース生成](https://docs.microsoft.com/dotnet/core/extensions/logger-message-generator)が使用されています。
これにより、高パフォーマンスで構造化されたロギングと型チェックされたパラメーターが実現されます。

## 依存性の注入との併用 {#using-with-dependency-injection}

[依存性の注入（DI）](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection)で `ILogger` を使用するアプリケーション（たとえば、[ASP.NET Core](https://learn.microsoft.com/aspnet/core) や [.NET Worker](https://learn.microsoft.com/dotnet/core/extensions/workers)）では、新しい `LoggerFactory` インスタンスを作成してまったく新しいロギングパイプラインを構築するのではなく、DI のロギングパイプラインに OpenTelemetry を[ロギングプロバイダー](https://docs.microsoft.com/dotnet/core/extensions/logging-providers)として追加するのが一般的です。

詳しくは [ASP.NET Core の入門チュートリアル](/docs/languages/dotnet/logs/getting-started-aspnetcore/)を参照してください。

## さらに詳しく {#learn-more}

- [C# と .NET でのロギング](https://learn.microsoft.com/dotnet/core/extensions/logging)
- [複雑なオブジェクトのロギング](/docs/languages/dotnet/logs/complex-objects/)
- [ログの相関](/docs/languages/dotnet/logs/correlation/)
