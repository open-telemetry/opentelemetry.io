---
title: ログの相関
linkTitle: 相関
description: OpenTelemetry .NET でログとトレースを相関させる方法を学ぶ
weight: 30
default_lang_commit: f1a074a1d8dc390c2abcac98ad671f38d0c73d88
---

このガイドでは、OpenTelemetry .NET でログとトレースを相関させる方法について説明します。

## ログデータモデルの相関サポート {#logging-data-model-support-for-correlation}

[OpenTelemetry ログデータモデル](/docs/specs/otel/logs/data-model/#trace-context-fields)は、ログをスパン（.NET では `Activity`）に相関付けるためのフィールドを定義しています。
`TraceId` と `SpanId` フィールドにより、ログを対応する `Activity` に相関付けることができます。

## OpenTelemetry .NET での自動相関 {#automatic-correlation-in-opentelemetry-net}

OpenTelemetry .NET SDK では、相関を有効にするためにユーザーが操作する必要はありません。
SDK は、アクティブなアクティビティ（つまり `Activity.Current`）が存在する場合、`TraceId`、`SpanId`、`TraceFlags` フィールドをそのアクティブなアクティビティから自動的に設定することで、ログと `Activity` の相関を自動的に有効にします。

## 例 {#example}

以下は、アクティブな `Activity` のコンテキスト内でログを出力する簡単な例です。

```csharp
using System;
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// OpenTelemetry を使用してロガーファクトリを作成
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options =>
    {
        options.AddConsoleExporter();
    });
});

// トレーサープロバイダーを作成
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();

// ロガーインスタンスを取得
var logger = loggerFactory.CreateLogger<Program>();

// アクティビティソースを作成
var activitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");

// アクティビティを開始
using (var activity = activitySource.StartActivity("SayHello"))
{
    // アクティビティのコンテキスト内でログを出力
    logger.FoodPriceChanged("artichoke", 9.99);
}

// 構造化ログのための拡張メソッドを定義
internal static partial class LoggerExtensions
{
    [LoggerMessage(LogLevel.Information, "Food `{name}` price changed to `{price}`.")]
    public static partial void FoodPriceChanged(this ILogger logger, string name, double price);
}
```

アプリケーションを実行すると、コンソールに以下の出力が表示されます。

```text
LogRecord.Timestamp:               2024-01-26T17:55:39.2273475Z
LogRecord.TraceId:                 aed89c3b250fb9d8e16ccab1a4a9bbb5
LogRecord.SpanId:                  bd44308753200c58
LogRecord.TraceFlags:              Recorded
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

Activity.TraceId:            aed89c3b250fb9d8e16ccab1a4a9bbb5
Activity.SpanId:             bd44308753200c58
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: MyCompany.MyProduct.MyLibrary
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2024-01-26T17:55:39.2223849Z
Activity.Duration:           00:00:00.0361682
...
```

ご覧のとおり、`LogRecord` には `Activity` のものと一致する `TraceId` と `SpanId` フィールドが自動的に設定されています。
これは、ログがアクティブな `Activity` のコンテキスト内で作成されたためです。

[5分で始める OpenTelemetry .NET ログ - コンソールアプリケーション](/docs/languages/dotnet/logs/getting-started-console/)ガイドでは、`Activity` コンテキストの外側でログが出力されたため、`LogRecord` のこれらの相関フィールドは設定されませんでした。

## ウェブアプリケーション {#web-applications}

ASP.NET Core のようなウェブアプリケーションでは、リクエストのコンテキスト内で出力されたすべてのログが、受信リクエストを表す `Activity` に自動的に相関付けられるため、特定のリクエストに関連するすべてのログを簡単に見つけることができます。

## ログ相関のメリット {#benefits-of-log-correlation}

ログの相関には以下のようなメリットがあります。

1. **統合ビュー**: オブザーバビリティツールでログとトレースを統合ビューで一緒に確認できます。
2. **コンテキストの付加**: ログにトレースコンテキストが付加され、より多くの情報を持つようになります。
3. **トラブルシューティング**: イシューのデバッグ時に、特定のトレースに関連するすべてのログをすばやく見つけることができます。
4. **パフォーマンス分析**: アプリケーションのパフォーマンスに影響を与えている要因を把握できます。

## さらに詳しく {#learn-more}

- [OpenTelemetry .NET トレース API リファレンス](/docs/languages/dotnet/traces-api/)
- [OpenTelemetry 仕様 - ログデータモデル](/docs/specs/otel/logs/data-model/)
