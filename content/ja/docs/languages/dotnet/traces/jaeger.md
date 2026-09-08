---
title: Jaeger へのエクスポート
linkTitle: Jaeger へのエクスポート
description: OpenTelemetry .NET でトレースを Jaeger にエクスポートする方法を学ぶ
weight: 30
default_lang_commit: b46e1d9874418b7fc01373ca0c02b46a7c2f2a3d
---

このガイドでは、OpenTelemetry .NET のトレースを Jaeger にエクスポートして可視化・分析する方法を説明します。

## 前提条件 {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) がコンピューターにインストールされていること
- [Jaeger](https://www.jaegertracing.io/download/) がダウンロードされていること（このガイドでインストール方法を説明します）
- OpenTelemetry の基本的な概念に精通していること（[コンソールで始める](/docs/languages/dotnet/traces/getting-started-console/)を参照）

## OTLP エクスポートを使用した .NET アプリケーションの作成 {#creating-a-net-application-with-otlp-export}

新しいコンソールアプリケーションを作成します。

```shell
dotnet new console --output getting-started-jaeger
cd getting-started-jaeger
```

必要な OpenTelemetry パッケージをインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Instrumentation.Http
```

`Program.cs` ファイルを以下のコードで更新します。

```csharp
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace GettingStartedJaeger;

internal static class Program
{
    private static readonly ActivitySource MyActivitySource = new("OpenTelemetry.Demo.Jaeger");

    public static async Task Main()
    {
        using var tracerProvider = Sdk.CreateTracerProviderBuilder()
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
                serviceName: "DemoApp",
                serviceVersion: "1.0.0"))
            .AddSource("OpenTelemetry.Demo.Jaeger")
            .AddHttpClientInstrumentation()
            .AddConsoleExporter()
            .AddOtlpExporter()
            .Build();

        using var parent = MyActivitySource.StartActivity("JaegerDemo");

        using (var client = new HttpClient())
        {
            using (var slow = MyActivitySource.StartActivity("SomethingSlow"))
            {
                await client.GetStringAsync(new Uri("https://httpstat.us/200?sleep=1000")).ConfigureAwait(false);
                await client.GetStringAsync(new Uri("https://httpstat.us/200?sleep=1000")).ConfigureAwait(false);
            }

            using (var fast = MyActivitySource.StartActivity("SomethingFast"))
            {
                await client.GetStringAsync(new Uri("https://httpstat.us/301")).ConfigureAwait(false);
            }
        }
    }
}
```

このアプリケーションを実行すると、`ConsoleExporter` を通じてトレースがコンソールに出力され、同時に `OtlpExporter` を使用して Jaeger へのトレース送信も試みます。
Jaeger がまだセットアップされていないため、それらのトレースは最初はドロップされます。

## Jaeger のセットアップ {#setting-up-jaeger}

Jaeger はオープンソースの分散トレーシングシステムで、マイクロサービスベースのアプリケーションの監視とトラブルシュートに役立ちます。

### Jaeger のインストールと起動 {#installing-and-running-jaeger}

1. [公式ダウンロードページ](https://www.jaegertracing.io/download/)から Jaeger をダウンロードします。
2. マシン上の任意の場所に展開します。
3. OTLP を有効にして Jaeger の all-in-one 実行ファイルを起動します。

```shell
./jaeger-all-in-one --collector.otlp.enabled
```

これにより以下が起動します。

- Jaeger UI（`http://localhost:16686`）
- OTLP レシーバー付き Jaeger コレクター（`http://localhost:4317`）
- Jaeger クエリサービスおよびその他のコンポーネント

### Jaeger でトレースを表示する {#viewing-traces-in-jaeger}

1. Web ブラウザを開き、[http://localhost:16686](http://localhost:16686) にアクセスします。
2. .NET アプリケーションを実行します。
3. Jaeger UI で以下を行います。
   - 「Service」ドロップダウンから「DemoApp」を選択します。
   - 「Find Traces」をクリックします。

Jaeger UI にアプリケーションのトレースが表示されるはずです。
トレースをクリックすると、トレース内のすべてのスパンの詳細なガントチャートビューが表示されます。

## コードの理解 {#understanding-the-code}

### トレーサープロバイダーの設定 {#trace-provider-configuration}

アプリケーションは以下のように OpenTelemetry を設定します。

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: "DemoApp",
        serviceVersion: "1.0.0"))
    .AddSource("OpenTelemetry.Demo.Jaeger")
    .AddHttpClientInstrumentation()
    .AddConsoleExporter()
    .AddOtlpExporter()
    .Build();
```

このコードは以下を行います。

1. サービス名とバージョンを持つリソースをセットアップします。
2. アクティビティソースを登録します。
3. HttpClient の自動計装を追加します。
4. コンソールと OTLP のエクスポーターを設定します。

### アクティビティの作成 {#activity-creation}

アプリケーションは ActivitySource を使用してスパンを作成します。

```csharp
private static readonly ActivitySource MyActivitySource = new("OpenTelemetry.Demo.Jaeger");

// 親スパンを作成する
using var parent = MyActivitySource.StartActivity("JaegerDemo");

// 子スパンを作成する
using (var slow = MyActivitySource.StartActivity("SomethingSlow"))
{
    // このブロック内の操作は "SomethingSlow" スパンの一部になる
}
```

### トレースのエクスポートフロー {#trace-export-flow}

トレースデータは以下のコンポーネントを通じて流れます。

1. アプリケーションが ActivitySource を使用してスパンを作成します。
2. TracerProvider がスパンを収集し処理します。
3. OTLP エクスポーターが OTLP プロトコルを通じてスパンを Jaeger に送信します。
4. Jaeger がトレースを保存し、クエリと可視化を可能にします。

## 本番環境での使用 {#production-usage}

本番環境では、コンソールエクスポーターを削除して OTLP エクスポーターのみを使用してください。

```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: "DemoApp",
        serviceVersion: "1.0.0"))
    .AddSource("OpenTelemetry.Demo.Jaeger")
    .AddHttpClientInstrumentation()
    // コンソールエクスポーターを削除
    // .AddConsoleExporter()
    .AddOtlpExporter()
    .Build();
```

コンソールエクスポーターのパッケージも削除できます。

```shell
dotnet remove package OpenTelemetry.Exporter.Console
```

## さらに学ぶ {#learn-more}

- [Jaeger Tracing](https://www.jaegertracing.io/)
- [OpenTelemetry .NET 用 OTLP エクスポーター](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol)
- [OpenTelemetry トレーシング仕様](/docs/specs/otel/trace/api/)
