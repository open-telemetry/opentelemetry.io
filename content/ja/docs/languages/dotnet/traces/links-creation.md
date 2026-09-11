---
title: トレース間のリンク作成
linkTitle: リンク
description: OpenTelemetry .NET でトレース間のリンクを作成する方法を学ぶ
weight: 50
default_lang_commit: 12862017e85a7b88fbd194241af00f4dbd4ee75c
cSpell:ignore: activitycontext nestedActivity
---

このガイドでは、OpenTelemetry .NET でトレース間のリンクを作成する方法を説明します。
リンクは、ファンアウト操作、バッチ処理、異なるトレース間での関連するアクティビティの相関付けに役立ちます。

## トレースリンクとは {#what-are-trace-links}

OpenTelemetry において、リンクを使用すると、関連しているが直接的な親子関係を持たないスパン（.NET ではアクティビティ）間の接続を確立できます。
これは、異なるトレースの一部である可能性のある複数の操作を相関付ける必要がある分散システムで特に役立ちます。

リンクを使用する一般的なシナリオは以下のとおりです。

- **ファンアウト操作**: 単一のリクエストが複数の並列操作をトリガーする場合
- **バッチ処理**: 複数の受信リクエストが単一のバッチで処理される場合
- **非同期処理**: 操作が異なるトレース間で非同期に処理される場合
- **サービス間の相関**: 異なるサービス間で関連する操作を接続する場合

## 既存のアクティビティへのリンク作成 {#creating-links-to-existing-activities}

以下の例は、既存のアクティビティにリンクする新しいルートアクティビティを作成する方法を示しています。

```csharp
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;

// アクティビティソースを作成
var activitySource = new ActivitySource("MyCompany.MyApplication");

// OpenTelemetry を設定
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyApplication")
    .AddConsoleExporter()
    .Build();

// 親アクティビティを開始
using (var orchestratingActivity = activitySource.StartActivity("OrchestratingActivity"))
{
    orchestratingActivity?.SetTag("operation", "main-process");

    // 複数の操作にリンク付きアクティビティでファンアウト
    await DoFanoutAsync(activitySource, 3);

    // 元のアクティビティで処理を継続
    using (var nestedActivity = activitySource.StartActivity("WrapUp"))
    {
        nestedActivity?.SetTag("status", "completed");
    }
}

// リンク付きの新しいルートアクティビティを作成するメソッド
async Task DoFanoutAsync(ActivitySource source, int operationCount)
{
    // 後で復元するために現在のアクティビティを保存
    var previous = Activity.Current;

    // リンク用に現在のアクティビティのコンテキストを取得
    var activityContext = Activity.Current!.Context;
    var links = new List<ActivityLink>
    {
        new ActivityLink(activityContext),
    };

    var tasks = new List<Task>();

    // 元のアクティビティにリンクする複数の新しいルートアクティビティを作成
    for (int i = 0; i < operationCount; i++)
    {
        int operationIndex = i;

        var task = Task.Run(() =>
        {
            // 新しいルートアクティビティを作成するために現在のアクティビティを null に設定
            Activity.Current = null;

            // 元のアクティビティへのリンクを持つ新しいルートアクティビティを作成
            using var newRootActivity = source.StartActivity(
                ActivityKind.Internal,
                name: $"FannedOutActivity {operationIndex + 1}",
                links: links);

            // この操作の処理を実行...
        });

        tasks.Add(task);
    }

    // すべてのファンアウト操作の完了を待機
    await Task.WhenAll(tasks);

    // 元のアクティビティコンテキストを復元
    Activity.Current = previous;
}
```

## 出力の理解 {#understanding-the-output}

このコードを実行すると、出力に複数のアクティビティが表示されます。

1. `OrchestratingActivity`（元のアクティビティ）の1つのトレース
2. 各 `FannedOutActivity` に対する複数の独立したトレース
3. 各 `FannedOutActivity` は `OrchestratingActivity` へのリンクを持つ

出力は以下のようになります。

```text
Activity.TraceId:            5ce4d8ad4926ecdd0084681f46fa38d9
Activity.SpanId:             8f9e9441f0789f6e
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: MyCompany.MyApplication
Activity.DisplayName:        FannedOutActivity 1
Activity.Kind:               Internal
Activity.StartTime:          2023-10-17T01:24:40.4957326Z
Activity.Duration:           00:00:00.0008656
Activity.Links:
    2890476acefb53b93af64a0d91939051 16b83c1517629363
```

このアクティビティには以下が含まれていることに注目してください。

- 新しいトレース ID（`5ce4d8ad4926ecdd0084681f46fa38d9`）
- 元のアクティビティのトレース ID とスパン ID へのリンク（`2890476acefb53b93af64a0d91939051 16b83c1517629363`）

## リンクを使用するタイミング {#when-to-use-links}

以下のシナリオでリンクの使用を検討してください。

1. **高カーディナリティ操作**: 単一の操作が数千のスパンを生成する場合、リンク付きの個別のトレースを作成すると、可視化と分析がより管理しやすくなります。

2. **並列処理**: アイテムを並列に処理し、元のリクエストとの接続を維持しながら各アイテムの処理を独立して追跡したい場合。

3. **非同期ワークフロー**: 操作が非同期に発生し、同じトレースのライフタイム内に完了しない可能性がある場合。

## リンク使用のトレードオフ {#tradeoffs-of-using-links}

リンクは柔軟性を提供しますが、いくつかの考慮事項があります。

- **複数のトレース**: 単一のまとまったトレースのかわりに、複数の関連するトレースが生成されます。
- **可視化の複雑さ**: 一部のオブザーバビリティツールでは、リンクされたトレースの可視化のサポートが限定的な場合があります。
- **分析の複雑さ**: リンクされたトレース間でデータを分析するには、より複雑なクエリが必要になります。

## ベストプラクティス {#best-practices}

1. **意味のあるアクティビティ名を使用する**: リンクされた各アクティビティの目的を示す明確な名前を選択してください。
2. **コンテキストタグを追加する**: アクティビティがリンクされている理由を特定するのに役立つタグを含めてください。
3. **元のコンテキストを復元する**: リンクされたアクティビティを作成した後は、必ず元の Activity.Current を復元してください。
4. **控えめに使用する**: トレースデータの断片化を避けるため、必要な場合にのみ新しいルートアクティビティを作成してください。

## 詳細情報 {#learn-more}

- [OpenTelemetry 仕様: スパン間のリンク](/docs/specs/otel/overview/#links-between-spans)
- [Activity Creation Options](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Api#activity-creation-options)
