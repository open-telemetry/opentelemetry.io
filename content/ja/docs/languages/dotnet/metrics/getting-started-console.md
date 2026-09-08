---
title: メトリクスを始める - コンソール
linkTitle: コンソール
description: .NET コンソールアプリケーションで OpenTelemetry メトリクスを使う方法を学ぶ
weight: 10
default_lang_commit: ca42643453f70a901336aa8f1582d298cc15f289
cSpell:ignore: DiagnosticSource LongSum MyFruitCounter
---

このガイドでは、.NET コンソールアプリケーションで OpenTelemetry .NET メトリクスを数分で始める方法を紹介します。

## 前提条件 {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) がコンピューターにインストールされていること

## コンソールアプリケーションの作成 {#creating-a-console-application}

新しいコンソールアプリケーションを作成して実行します。

```shell
dotnet new console --output getting-started
cd getting-started
dotnet run
```

以下のような出力が表示されるはずです。

```text
Hello World!
```

## OpenTelemetry メトリクスの追加 {#adding-opentelemetry-metrics}

OpenTelemetry Console Exporter パッケージをインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

`Program.cs` ファイルを以下のコードで更新します。

```csharp
using System;
using System.Diagnostics.Metrics;
using OpenTelemetry;
using OpenTelemetry.Metrics;

// メーターを定義する
private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");

// カウンター計装を作成する
private static readonly Counter<long> MyFruitCounter = MyMeter.CreateCounter<long>("MyFruitCounter", "fruit", "Counts fruit by name and color");

// OpenTelemetry MeterProvider を設定する
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();

// いくつかの計測を記録する
MyFruitCounter.Add(1, new("name", "apple"), new("color", "red"));
MyFruitCounter.Add(2, new("name", "lemon"), new("color", "yellow"));
MyFruitCounter.Add(1, new("name", "lemon"), new("color", "yellow"));
MyFruitCounter.Add(2, new("name", "apple"), new("color", "green"));
MyFruitCounter.Add(5, new("name", "apple"), new("color", "red"));
MyFruitCounter.Add(4, new("name", "lemon"), new("color", "yellow"));

Console.WriteLine("Press any key to exit");
Console.ReadKey();

// アプリケーションが終了する前に MeterProvider を破棄する。
// これにより、残りのメトリクスがフラッシュされ、メトリクスパイプラインがシャットダウンされる。
meterProvider.Dispose();
```

アプリケーションを再度実行すると（`dotnet run` を使用）、コンソールからメトリクスの出力が確認できます（メトリクスはプログラム終了時に表示されます）。
以下のような出力になります。

```text
Export MyFruitCounter, Meter: MyCompany.MyProduct.MyLibrary/1.0
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:red name:apple LongSum
Value: 6
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:yellow name:lemon LongSum
Value: 7
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:green name:apple LongSum
Value: 2
```

おめでとうございます！
これで OpenTelemetry を使用してメトリクスを収集できるようになりました。

## 仕組み {#how-it-works}

### Meter {#meter}

プログラムは「MyCompany.MyProduct.MyLibrary」という名前の [Meter](/docs/specs/otel/metrics/api/#meter) インスタンスを作成します。
Meter はメトリクス計装を作成するためのエントリーポイントです。

```csharp
private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");
```

### カウンター計装 {#counter-instrument}

次に、Meter から [Counter](/docs/specs/otel/metrics/api/#counter) 計装を作成します。
カウンターは、減少しない値を計測するために使用されます。

```csharp
private static readonly Counter<long> MyFruitCounter = MyMeter.CreateCounter<long>("MyFruitCounter");
```

### 計測の記録 {#recording-measurements}

カウンターは、異なる属性の組み合わせで複数のメトリクス計測を報告するために使用されます。

```csharp
MyFruitCounter.Add(1, new("name", "apple"), new("color", "red"));
```

### MeterProvider の設定 {#meterprovider-configuration}

OpenTelemetry MeterProvider は以下のように設定されます。

1. 指定した Meter からの計装をサブスクライブする
2. メトリクスをコンソールにエクスポートする

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();
```

MeterProvider は計測をメモリ内で集約し、デフォルトのカーディナリティ上限は属性の組み合わせ2000件です。

## 高カーディナリティメトリクスの処理 {#handling-high-cardinality-metrics}

デフォルトの上限である2000を超えるカーディナリティのメトリクスを収集する必要がある場合は、カーディナリティの上限をカスタマイズできます。

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddView(instrumentName: "MyFruitCounter", new MetricStreamConfiguration { CardinalityLimit = 10 })
    .AddConsoleExporter()
    .Build();
```

## メトリクスパイプライン {#metrics-pipeline}

OpenTelemetry .NET のメトリクスパイプラインは以下のフローに従います。

1. 計装が計測を記録する
2. MeterProvider が計測を受信し集約する
3. MetricReader が集約されたメトリクスを読み取る
4. エクスポーターがメトリクスをバックエンドにエクスポートする

## OpenTelemetry .NET に関する特記事項 {#special-note-about-opentelemetry-net}

OpenTelemetry .NET のメトリクスはやや独特な実装です。
[Metrics API](/docs/specs/otel/metrics/api/) の大部分が .NET ランタイム自体によって実装されているためです。
大まかに言えば、`System.Diagnostics.DiagnosticSource` パッケージに依存するだけで、アプリケーションを計装できるということです。

## さらに学ぶ {#learn-more}

- [Prometheus と Grafana へのエクスポート](/docs/languages/dotnet/metrics/getting-started-prometheus-grafana/)
- [メトリクス計装](/docs/languages/dotnet/metrics/instruments/)
- [エグゼンプラーの使用](/docs/languages/dotnet/metrics/exemplars/)
