---
title: メトリクス計装
linkTitle: 計装
description: OpenTelemetry .NET で利用できるさまざまな種類のメトリクス計装について学ぶ
weight: 50
default_lang_commit: 669d1a40e56ed2dd914d48340b31e16a83610d40
cSpell:ignore: updowncounter
---

このガイドでは、OpenTelemetry .NET で利用できるさまざまな種類のメトリクス計装と、それらの効果的な使い方について説明します。

## メトリクス計装を理解する {#understanding-metric-instruments}

OpenTelemetry は、さまざまな種類のデータを測定するために複数の計装タイプを提供しています。

| 計装タイプ             | 動作                       | 一般的なユースケース             |
| ---------------------- | -------------------------- | -------------------------------- |
| カウンター             | 単調増加する値             | リクエスト数、エラー数           |
| アップダウンカウンター | 増減可能な値               | キューサイズ、アクティブ接続数   |
| ヒストグラム           | 記録された値の分布         | リクエスト時間、レスポンスサイズ |
| ゲージ                 | 特定の時点における値の観測 | CPU 使用率、メモリ使用率         |

## カウンター {#counter}

カウンターは、時間の経過とともに合計され、減少しない値を記録します。
リクエスト数、完了した操作、エラー数など、増加のみするメトリクスに適しています。

### カウンターの作成 {#creating-a-counter}

```csharp
using System.Diagnostics.Metrics;

// Meter を作成する
var meter = new Meter("MyCompany.MyProduct", "1.0.0");

// カウンターを作成する
var requestCounter = meter.CreateCounter<long>("request_counter", "requests", "Counts the number of requests");
```

### 測定値の記録 {#recording-measurements}

```csharp
// 1 ずつ増加させる
requestCounter.Add(1);

// 属性付きで増加させる
requestCounter.Add(1, new("endpoint", "/api/users"), new("method", "GET"));
```

## アップダウンカウンター {#updowncounter}

アップダウンカウンターは、増減可能な値を記録し、特定の時点での現在値を表します。
キューサイズ、アクティブ接続数、リソースプールの使用状況などの追跡に便利です。

### アップダウンカウンターの作成 {#creating-an-updowncounter}

```csharp
// アップダウンカウンターを作成する
var activeConnectionsCounter = meter.CreateUpDownCounter<int>("active_connections", "connections", "Number of active connections");
```

### アップダウンカウンターの測定値を記録する {#recording-updowncounter-measurements}

```csharp
// 1 ずつ増加させる
activeConnectionsCounter.Add(1);

// 1 ずつ減少させる
activeConnectionsCounter.Add(-1);

// 属性付き
activeConnectionsCounter.Add(1, new("pool", "worker"), new("region", "west"));
```

## ヒストグラム {#histogram}

ヒストグラムは、値の分布を記録し、件数、合計、最小値、最大値、パーセンタイルなどの統計情報を取得します。
時間、サイズ、その他の分布する値の測定に適しています。

### ヒストグラムの作成 {#creating-a-histogram}

```csharp
// ヒストグラムを作成する
var requestDurationHistogram = meter.CreateHistogram<double>("request_duration", "ms", "Request duration in milliseconds");
```

### ヒストグラムの測定値を記録する {#recording-histogram-measurements}

```csharp
// 時間を記録する
requestDurationHistogram.Record(213.5);

// 属性付き
requestDurationHistogram.Record(42.3, new("endpoint", "/api/users"), new("method", "GET"));
```

## オブザーバブル計装 {#observable-instruments}

オブザーバブル計装を使用すると、コード内で直接記録するのではなく、メトリクスの収集時にオンデマンドで測定値を収集できます。
定期的にサンプリングするほうが適しているメトリクスに便利です。

### オブザーバブルカウンター {#observable-counter}

```csharp
// オブザーバブルカウンターを作成する
meter.CreateObservableCounter("processed_items_total", () =>
{
    // 内部状態から現在のカウントを返す
    return new Measurement<long>(GetCurrentProcessedCount(), new("queue", "default"));
}, "items", "Total number of processed items");
```

### オブザーバブルアップダウンカウンター {#observable-updowncounter}

```csharp
// オブザーバブルアップダウンカウンターを作成する
meter.CreateObservableUpDownCounter("active_tasks", () =>
{
    // 内部状態から現在の値を返す
    return new[]
    {
        new Measurement<int>(GetHighPriorityTaskCount(), new("priority", "high")),
        new Measurement<int>(GetLowPriorityTaskCount(), new("priority", "low"))
    };
}, "tasks", "Current number of active tasks");
```

### オブザーバブルゲージ {#observable-gauge}

```csharp
// オブザーバブルゲージを作成する
meter.CreateObservableGauge("cpu_usage", () =>
{
    // 現在の CPU 使用率を取得する
    return new Measurement<double>(GetCurrentCpuUsage());
}, "%", "Current CPU usage percentage");
```

## オブザーバブルな測定値のバッチ処理 {#batching-observable-measurements}

複数の計装に対して複数の測定値を返すコールバックを登録することもできます。

```csharp
// 複数のオブザーバブル計装に対して単一のコールバックを登録する
var observableCounter = meter.CreateObservableCounter<long>("my_observable_counter", "items");
var observableGauge = meter.CreateObservableGauge<double>("my_observable_gauge", "%");

meter.RegisterObservableCallback(observableInstruments =>
{
    // カウンターの値を記録する
    observableInstruments.Observe(observableCounter, 42, new("type", "product_a"));

    // ゲージの値を記録する
    observableInstruments.Observe(observableGauge, 12.3, new("resource", "cpu"));
}, observableCounter, observableGauge);
```

## 単位と説明 {#unit-and-description}

計装を作成する際には、単位と説明を指定することがベストプラクティスです。

```csharp
// 単位と説明を指定する
var requestSizeHistogram = meter.CreateHistogram<long>(
    name: "http.request.size",
    unit: "By",  // バイト
    description: "Size of HTTP request in bytes"
);
```

一般的な単位は以下のとおりです。

- 時間: `ms`（ミリ秒）、`s`（秒）、`min`（分）
- バイト: `By`（バイト）、`KiBy`（キビバイト）、`MiBy`（メビバイト）
- 件数: 通常は単位なし、または `requests` のような特定の単位を使用

## ベストプラクティス {#best-practices}

1. **適切な計装を選択する** - 測定するメトリクスの動作に最も適した計装タイプを選択してください
2. **意味のある名前を使用する** - メトリクス名には[セマンティック規約](/docs/specs/semconv/)に従ってください
3. **説明的な属性を追加する** - 測定対象のさまざまな側面を区別するために属性を使用してください
4. **カーディナリティに注意する** - 一意な属性の組み合わせが多すぎるとパフォーマンスの問題を引き起こす可能性があります
5. **計装を再利用する** - 計装は一度作成し、アプリケーション全体で再利用してください
6. **単位と説明を提供する** - オブザーバビリティを向上させるために、常に単位と説明を指定してください

## さらに学ぶ {#learn-more}

- [OpenTelemetry メトリクス計装仕様](/docs/specs/otel/metrics/api/#instrument)
- [.NET Metrics API](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation)
