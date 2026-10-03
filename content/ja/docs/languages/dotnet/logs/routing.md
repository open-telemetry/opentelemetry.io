---
title: 異なる送信先へのログのルーティング
linkTitle: ルーティング
description: カスタムプロセッサーを使用して、単一の ILogger から異なる OTLP 送信先にログをルーティングする方法を学ぶ。
weight: 55
default_lang_commit: 49a4a61076ca6c7369666e858be884cd157f7d3c
---

このガイドでは、カスタムプロセッサーを使用して、**単一の `ILogger`** から異なる OTLP エンドポイントにログをルーティングする方法を説明します。
これは、OpenTelemetry 仕様の補足ガイドラインに記載されている[ルーティング](/docs/specs/otel/logs/supplementary-guidelines/#routing)パターンに従っています。

## なぜログをルーティングするのか {#why-route-logs}

一部のシナリオでは、すべてのアプリケーションコードで同じ `ILogger` パイプラインを使用しつつ、特定のログを一方のバックエンドに送り、残りを別のバックエンドに送りたい場合があります。
たとえば、以下のようなケースです。

- **決済**コンポーネントからのログは、専用の Collector エンドポイント（`OTLP2`）に送信する。
- その他のすべてのログは、デフォルトのエンドポイント（`OTLP1`）に送信する。

アプリケーションが複数の `ILoggerFactory` インスタンスを作成して、呼び出し元に適切なものを選ばせることができる場合は、かわりに[専用パイプライン](../dedicated-pipeline/)の使用を検討してください。

## 仕組み {#how-it-works}

ルーティングの判断は、各 `LogRecord` の `CategoryName` を検査することで、プロセッサーレベルで行われます。
カスタムプロセッサーは、カテゴリ名が設定された接頭辞で始まるかどうかを確認し、適切なエクスポートパイプラインにレコードを転送します。

```text
ILogger (single pipeline)
   |
   v
LoggerProvider
   |
   v
RoutingProcessor (custom)
   +-- CategoryName starts with prefix --> ExportProcessor -> OtlpLogExporter (OTLP2)
   +-- otherwise --------------------------> ExportProcessor -> OtlpLogExporter (OTLP1)
```

1. 2つの `OtlpLogExporter` インスタンスが作成され、それぞれ異なるエンドポイントを指します。
2. 各エクスポーターは `BatchLogRecordExportProcessor` でラップされます。
3. カスタムの `RoutingProcessor` は `BaseProcessor<LogRecord>` を拡張し、`OnEnd` をオーバーライドします。
   ログレコードの `CategoryName` が設定された接頭辞で始まるかどうかを確認し、どの内部プロセッサーにレコードを渡すかを決定します。
4. ルーティングプロセッサーは `AddProcessor` を介して `LoggerProvider` に登録されます。

## 実装 {#implementation}

### カスタムルーティングプロセッサー {#the-custom-routing-processor}

`RoutingProcessor` は各ログレコードの `CategoryName` を検査し、2つの内部プロセッサーのいずれかに転送します。
また、`ForceFlush`、`Shutdown`、`Dispose` を委譲して、両方のエクスポートパイプラインが適切にドレインおよびクリーンアップされるようにします。

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

### LoggerProvider へのルーティングプロセッサーの登録 {#registering-the-routing-processor-on-the-loggerprovider}

`LoggerProvider` にルーティングプロセッサーを登録します。
以下の両方のロガーは同じ `ILoggerFactory` と `LoggerProvider` パイプラインを共有しますが、ログレコードはカテゴリ名に基づいて異なる OTLP 送信先にルーティングされます。

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;

// 異なる送信先を指す2つの OTLP エクスポーターを作成する。
var otlpExporter1 = new OtlpLogExporter(new OtlpExporterOptions
{
    Endpoint = new Uri("http://localhost:4317"), // OTLP 送信先 1
});

var otlpExporter2 = new OtlpLogExporter(new OtlpExporterOptions
{
    Endpoint = new Uri("http://localhost:4318"), // OTLP 送信先 2
});

// 各エクスポーターを BatchLogRecordExportProcessor でラップする。
var defaultExportProcessor = new BatchLogRecordExportProcessor(otlpExporter1);
var paymentExportProcessor = new BatchLogRecordExportProcessor(otlpExporter2);

// ルーティングプロセッサーを構築する。カテゴリ名が
// "Payment." で始まるログは OTLP2 に送信され、それ以外は OTLP1 に送信される。
var routingProcessor = new RoutingProcessor(
    categoryPrefix: "Payment.",
    defaultProcessor: defaultExportProcessor,
    paymentProcessor: paymentExportProcessor);

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddProcessor(routingProcessor);

        // オプション: コンソールエクスポーターも追加して、すべてのログをローカルで確認できるようにする。
        logging.AddConsoleExporter();
    });
});

// 両方のロガーは同じ ILoggerFactory / LoggerProvider パイプラインを共有する。
var orderLogger = loggerFactory.CreateLogger("Order.Processing");
var paymentLogger = loggerFactory.CreateLogger("Payment.Processing");

orderLogger.LogInformation("Processing order {OrderId}.", "ORD-001");     // --> OTLP1
paymentLogger.LogInformation("Processing payment {PaymentId}.", "PAY-001"); // --> OTLP2
orderLogger.LogInformation("Order {OrderId} completed.", "ORD-001");      // --> OTLP1

// アプリケーション終了前にロガーファクトリーを破棄する。
// これにより、残りのログがフラッシュされ、ロギングパイプラインがシャットダウンされる。
loggerFactory.Dispose();
```

## 主な考慮事項 {#key-considerations}

- **ルーティング条件はログレコードごとに評価される。**
  ロジックは高速に保つこと——すべてのログ出力時に同期的に実行されます。
- **ライフサイクル管理。**
  ルーティングプロセッサーが `ForceFlush`、`Shutdown`、`Dispose` をすべての内部プロセッサーに委譲し、すべてのエクスポートパイプラインが適切にドレインおよびクリーンアップされるようにしてください。
- **単一パイプライン。**
  単一の `ILoggerFactory` と `LoggerProvider` があるため、このアプローチはコンポーネントが複数のロガーを意識しない依存性注入と相性が良いです。

## 参考情報 {#further-reading}

- OpenTelemetry .NET リポジトリの完全な実行可能サンプル:
  [`docs/logs/routing`](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/docs/logs/routing)
- OpenTelemetry 仕様の補足ガイドラインにおける[ルーティング](/docs/specs/otel/logs/supplementary-guidelines/#routing)
- [専用パイプライン](../dedicated-pipeline/)の設定——アプリケーションが複数の `ILoggerFactory` インスタンスを使用できる場合の代替手段
