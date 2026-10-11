---
title: 複雑なオブジェクトのログ
linkTitle: 複雑なオブジェクト
description: OpenTelemetry .NET で複雑なオブジェクトをログに記録する方法を学びます
weight: 20
default_lang_commit: 49a4a61076ca6c7369666e858be884cd157f7d3c
# prettier-ignore
cSpell:ignore: BrandName CompanyName Contoso FoodRecallNotice Listeria monocytogenes ProductDescription ProductType RecallReasonDescription
---

[Getting Started with OpenTelemetry .NET Logs - Console](/docs/languages/dotnet/logs/getting-started-console/) ガイドでは、プリミティブなデータ型をログに記録する方法を学びました。
このガイドでは、複雑なオブジェクトをログに記録する方法を紹介します。

## .NET での複雑なオブジェクトのログ {#complex-object-logging-in-net}

複雑なオブジェクトのログは、.NET 8.0 で [`LogPropertiesAttribute`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.logpropertiesattribute) を通じて導入されました。
この属性と対応するコード生成ロジックは、[`Microsoft.Extensions.Telemetry.Abstractions`](https://www.nuget.org/packages/Microsoft.Extensions.Telemetry.Abstractions/) という拡張パッケージによって提供されています。

## 前提条件 {#prerequisites}

- [Getting Started with Console](/docs/languages/dotnet/logs/getting-started-console/) チュートリアルを完了していること。

## 実装手順 {#implementation-steps}

### 1. 必要なパッケージのインストール {#1-install-the-required-package}

`Microsoft.Extensions.Telemetry.Abstractions` パッケージをインストールします。

```shell
dotnet add package Microsoft.Extensions.Telemetry.Abstractions
```

### 2. 複雑なデータ型の定義 {#2-define-a-complex-data-type}

複雑なオブジェクトを表す構造体を作成します。

```csharp
public struct FoodRecallNotice
{
    public string? BrandName { get; set; }
    public string? ProductDescription { get; set; }
    public string? ProductType { get; set; }
    public string? RecallReasonDescription { get; set; }
    public string? CompanyName { get; set; }
}
```

### 3. LogPropertiesAttribute を使用したロガー拡張メソッドの作成 {#3-create-a-logger-extension-method-with-logpropertiesattribute}

`ILogger` に対して拡張メソッドを定義します。

```csharp
using Microsoft.Extensions.Logging;

internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Critical)]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        [LogProperties(OmitReferenceName = true)] in FoodRecallNotice foodRecallNotice);
}
```

`[LogProperties(OmitReferenceName = true)]` 属性は、ソースジェネレーターに以下を指示します。

- `FoodRecallNotice` のすべてのプロパティを個別のログ属性として含める
- 属性キーから参照名（パラメーター名）を省略する

### 4. 複雑なオブジェクトのログ記録 {#4-log-the-complex-object}

複雑なオブジェクトのインスタンスを作成し、ログに記録します。

```csharp
// 複雑なオブジェクトを作成
var foodRecallNotice = new FoodRecallNotice
{
    BrandName = "Contoso",
    ProductDescription = "Salads",
    ProductType = "Food & Beverages",
    RecallReasonDescription = "due to a possible health risk from Listeria monocytogenes",
    CompanyName = "Contoso Fresh Vegetables, Inc.",
};

// 複雑なオブジェクトをログに記録
logger.FoodRecallNotice(foodRecallNotice);
```

### 5. アプリケーションの実行 {#5-run-the-application}

たとえば `dotnet run` を使用してアプリケーションを実行すると、コンソールに以下のようなログ出力が表示されます。

```text
LogRecord.Timestamp:               2024-01-12T19:01:16.0604084Z
LogRecord.CategoryName:            Program
LogRecord.Severity:                Fatal
LogRecord.SeverityText:            Critical
LogRecord.FormattedMessage:
LogRecord.Body:
LogRecord.Attributes (Key:Value):
    CompanyName: Contoso Fresh Vegetables, Inc.
    RecallReasonDescription: due to a possible health risk from Listeria monocytogenes
    ProductType: Food & Beverages
    ProductDescription: Salads
    BrandName: Contoso
LogRecord.EventId:                 252550133
LogRecord.EventName:               FoodRecallNotice
```

`FoodRecallNotice` オブジェクトの各プロパティが、ログレコード内の個別の属性として表示されていることに注目してください。

## LogPropertiesAttribute のオプション {#logpropertiesattribute-options}

`LogPropertiesAttribute` には、プロパティがログにどのように含まれるかを制御するいくつかのオプションがあります。

- **OmitReferenceName**: `true` に設定すると、属性キーからパラメーター名が省略されます。
  上の例では、属性キーは「foodRecallNotice.BrandName」ではなく、プロパティ名のみ（たとえば「BrandName」）になっています。

- **IncludeProperties**: どのプロパティを含めるかを指定するために使用します。
  指定しない場合、すべてのプロパティが含まれます。

- **ExcludeProperties**: ログから除外するプロパティを指定するために使用します。

- **IncludeSensitive**: `true` に設定すると、`[Sensitive]` 属性でマークされたプロパティがログに含まれます。
  デフォルトは `false` です。

## 完全な例 {#complete-example}

すべてをまとめた完全な例を以下に示します。

```csharp
using System;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;

// 複雑なオブジェクトの定義
public struct FoodRecallNotice
{
    public string? BrandName { get; set; }
    public string? ProductDescription { get; set; }
    public string? ProductType { get; set; }
    public string? RecallReasonDescription { get; set; }
    public string? CompanyName { get; set; }
}

// ロガー拡張メソッド
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Critical)]
    public static partial void FoodRecallNotice(
        this ILogger logger,
        [LogProperties(OmitReferenceName = true)] in FoodRecallNotice foodRecallNotice);
}

// メインプログラム
class Program
{
    static void Main(string[] args)
    {
        // OpenTelemetry を使用してロガーファクトリを作成
        using var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddOpenTelemetry(options =>
            {
                options.AddConsoleExporter();
            });
        });

        // ロガーインスタンスを取得
        var logger = loggerFactory.CreateLogger<Program>();

        // 複雑なオブジェクトを作成
        var foodRecallNotice = new FoodRecallNotice
        {
            BrandName = "Contoso",
            ProductDescription = "Salads",
            ProductType = "Food & Beverages",
            RecallReasonDescription = "due to a possible health risk from Listeria monocytogenes",
            CompanyName = "Contoso Fresh Vegetables, Inc.",
        };

        // 複雑なオブジェクトをログに記録
        logger.FoodRecallNotice(foodRecallNotice);

        Console.WriteLine("Press any key to exit");
        Console.ReadKey();
    }
}
```

## さらに学ぶ {#learn-more}

- [Microsoft.Extensions.Logging.LogPropertiesAttribute](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.logpropertiesattribute)
- [Microsoft.Extensions.Telemetry.Abstractions](https://github.com/dotnet/extensions/blob/main/src/Libraries/Microsoft.Extensions.Telemetry.Abstractions/README.md)
- [Log Correlation in OpenTelemetry .NET](/docs/languages/dotnet/logs/correlation/)
- [OpenTelemetry Logs Data Model](/docs/specs/otel/logs/data-model/)
