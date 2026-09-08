---
title: トレースを始める - コンソール
linkTitle: コンソール
description: .NET コンソールアプリケーションで OpenTelemetry トレースを使用する方法を学びます
weight: 10
default_lang_commit: d18938b8ff4dfb2ed696f976815225f7ad8ed2a3
cSpell:ignore: baz DiagnosticSource tracerprovider
---

このガイドでは、コンソールアプリケーションで OpenTelemetry .NET トレースをわずか数分で使い始める方法を紹介します。

## 前提条件 {#prerequisites}

- コンピューターに [.NET SDK](https://dotnet.microsoft.com/download) がインストールされていること

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

## OpenTelemetry トレースの追加 {#adding-opentelemetry-traces}

OpenTelemetry コンソールエクスポーターパッケージをインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

`Program.cs` ファイルを次のコードに更新します。

```csharp
using System;
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace GettingStarted
{
    class Program
    {
        // アクティビティを作成するための ActivitySource を定義する
        private static readonly ActivitySource MyActivitySource = new ActivitySource(
            "MyCompany.MyProduct.MyLibrary");

        static void Main(string[] args)
        {
            // OpenTelemetry TracerProvider を設定する
            using var tracerProvider = Sdk.CreateTracerProviderBuilder()
                .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("getting-started"))
                .AddSource("MyCompany.MyProduct.MyLibrary")
                .AddConsoleExporter()
                .Build();

            // タグ（属性）を持つアクティビティ（スパン）を開始する
            using (var activity = MyActivitySource.StartActivity("SayHello"))
            {
                // アクティビティに属性を設定する
                activity?.SetTag("foo", 1);
                activity?.SetTag("bar", "Hello, World!");
                activity?.SetTag("baz", new int[] { 1, 2, 3 });

                // アクティビティのステータスを設定する
                activity?.SetStatus(ActivityStatusCode.Ok);

                // 何らかの処理を行う…
                Console.WriteLine("Hello World!");
            }

            Console.WriteLine("Trace has been exported. Press any key to exit.");
            Console.ReadKey();
        }
    }
}
```

（`dotnet run` を使用して）アプリケーションを再度実行すると、コンソールからトレース出力が表示されるはずです。

```text
Activity.TraceId:          d4a7d499698d62f0e2317a67abc559b6
Activity.SpanId:           a091d18fbe45bdf6
Activity.TraceFlags:       Recorded
Activity.ActivitySourceName: MyCompany.MyProduct.MyLibrary
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-03-30T19:42:33.5178011Z
Activity.Duration:    00:00:00.0097620
StatusCode : Ok
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1, 2, 3]
Resource associated with Activity:
    service.name: getting-started
```

これで OpenTelemetry を使用してトレースを収集できるようになりました。

## 仕組み {#how-it-works}

### ActivitySource（Tracer） {#activitysource-tracer}

このプログラムは [OpenTelemetry の Tracer](/docs/specs/otel/trace/api/#tracer) を表す `ActivitySource` を作成します。

```csharp
private static readonly ActivitySource MyActivitySource = new ActivitySource(
    "MyCompany.MyProduct.MyLibrary");
```

`ActivitySource` は新しいアクティビティを作成して開始するために使用されます。

### Activity（Span） {#activity-span}

`ActivitySource` インスタンスを使用して、[OpenTelemetry の Span](/docs/specs/otel/trace/api/#span) を表す `Activity` を開始します。
複数のタグ（属性）を設定し、ステータスを設定できます。

```csharp
using (var activity = MyActivitySource.StartActivity("SayHello"))
{
    activity?.SetTag("foo", 1);
    activity?.SetTag("bar", "Hello, World!");
    activity?.SetTag("baz", new int[] { 1, 2, 3 });
    activity?.SetStatus(ActivityStatusCode.Ok);
}
```

### TracerProvider {#tracerprovider}

TracerProvider は、指定されたソースからのアクティビティをサブスクライブしてエクスポートするように設定されます。

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();
```

TracerProvider は OpenTelemetry SDK の中核コンポーネントです。
サンプラー、プロセッサー、エクスポーターなど、トレースに関するすべての設定を保持し、高度にカスタマイズ可能です。

## トレースパイプライン {#tracing-pipeline}

OpenTelemetry .NET のトレースパイプラインは次のフローに従います。

1. ActivitySource がアクティビティを作成する
2. TracerProvider がアクティビティを受信する
3. プロセッサーがアクティビティを処理する
4. エクスポーターがアクティビティをバックエンドにエクスポートする

## OpenTelemetry .NET と .NET Activity API {#opentelemetry-net-and-net-activity-api}

OpenTelemetry .NET では、OpenTelemetry の仕様にある `Tracer` と `Span` のかわりに `ActivitySource` と `Activity` という用語が使用されます。
これは、OpenTelemetry .NET のトレースが .NET ランタイムの組み込み診断システムの上に実装されているためです。

`System.Diagnostics.DiagnosticSource` パッケージに依存することで、アプリケーションを計装できます。
このパッケージは、OpenTelemetry の [Span](/docs/specs/otel/trace/api/#span) と [Tracer](/docs/specs/otel/trace/api/#tracer) の概念をそれぞれ表す `Activity` クラスと `ActivitySource` クラスを提供します。

## さらに学ぶ {#learn-more}

- [Jaeger を使ったトレース入門](/docs/languages/dotnet/traces/jaeger/)
- [例外のレポート](/docs/languages/dotnet/traces/reporting-exceptions/)
- [トレース間のリンク作成](/docs/languages/dotnet/traces/links-creation/)
