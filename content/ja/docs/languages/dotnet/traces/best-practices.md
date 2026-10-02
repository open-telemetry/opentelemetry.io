---
title: ベストプラクティス
linkTitle: ベストプラクティス
description: OpenTelemetry .NET でトレースを使用する際のベストプラクティスを学びます
weight: 120
default_lang_commit: f60f406894f94169947ecbd236b933ee4008354c
---

以下のベストプラクティスに従って、OpenTelemetry .NET のトレースを最大限に活用しましょう。

## パッケージバージョン {#package-version}

使用している .NET ランタイムのバージョンに関わらず、[System.Diagnostics.DiagnosticSource](https://www.nuget.org/packages/System.Diagnostics.DiagnosticSource/) パッケージの最新の安定バージョンに含まれる [System.Diagnostics.Activity](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity) API を使用してください。

- [OpenTelemetry .NET SDK](/docs/languages/dotnet/) の最新安定バージョンを使用している場合、`System.Diagnostics.DiagnosticSource` パッケージのバージョンについて心配する必要はありません。
  パッケージの依存関係を通じてすでに管理されています。
- .NET ランタイムチームは `System.Diagnostics.DiagnosticSource` のメジャーバージョンアップ時にも後方互換性について高い基準を維持しているため、互換性の懸念はありません。

## トレース API {#tracing-api}

### ActivitySource {#activitysource}

[`System.Diagnostics.ActivitySource`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activitysource) を頻繁に作成することは避けてください。
`ActivitySource` は比較的コストが高く、アプリケーション全体で再利用することを想定しています。
ほとんどのアプリケーションでは、static readonly フィールドとしてモデル化するか、依存性注入を通じてシングルトンとして扱えます。

[`ActivitySource.Name`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activitysource.name) には、ドット区切りの [アッパーキャメルケース](https://en.wikipedia.org/wiki/Camel_case) を使用してください。
多くの場合、完全修飾クラス名を使用するのがよい選択です。
たとえば次のように行います。

```csharp
static readonly ActivitySource MyActivitySource = new("MyCompany.MyProduct.MyLibrary");
```

### Activity {#activity}

パフォーマンスを向上させるため、[タグの設定](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.settag)の前に [`Activity.IsAllDataRequested`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.isalldatarequested) を確認してください。

```csharp
using (var activity = MyActivitySource.StartActivity("SayHello"))
{
    if (activity != null && activity.IsAllDataRequested == true)
    {
        activity.SetTag("http.url", "http://www.mywebsite.com");
    }
}
```

[属性の設定](/docs/specs/otel/trace/api/#set-attributes)には [Activity.SetTag](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.settag) を使用してください。

アクティビティを適切に終了または停止してください。
これは `using` ステートメントを使って暗黙的に行うことができ、この方法が推奨されます。
明示的に [Activity.Dispose](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.dispose) または [Activity.Stop](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.stop) を呼び出すこともできます。

> [!NOTE]
>
> まだ終了/停止されていないアクティビティはエクスポートされません。

ループ内で [Activity.AddEvent](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.addevent) を呼び出すことは避けてください。
アクティビティは数百や数千のイベントを扱うようには設計されていません。
より適切なモデルは[相関ログ](/docs/languages/dotnet/logs/correlation/)や [Activity.Links](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.links) を使用することです。
たとえば次のコードのように行います。

> [!WARNING]
>
> 以下のコードは `Activity.Events` を正しくモデル化しておらず、ユーザビリティとパフォーマンスの問題が発生する可能性が非常に高いです。

```csharp
private static async Task Test()
{
    Activity activity = Activity.Current;

    while (true)
    {
        activity.AddEvent(new ActivityEvent("Processing background task."));
        await Task.Delay(1000);
    }
}
```

## TracerProvider の管理 {#tracerprovider-management}

`TracerProvider` インスタンスを頻繁に作成することは避けてください。
`TracerProvider` は比較的コストが高く、アプリケーション全体で再利用することを想定しています。
ほとんどのアプリケーションでは、プロセスごとに1つの `TracerProvider` インスタンスで十分です。

`TracerProvider` インスタンスを自分で作成する場合は、そのライフサイクルを管理してください。

一般的なルールとして以下が挙げられます。

- [依存性注入（DI）](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection)を使用するアプリケーション（たとえば [ASP.NET Core](https://learn.microsoft.com/aspnet/core) や [.NET Worker](https://learn.microsoft.com/dotnet/core/extensions/workers)）を構築している場合、ほとんどのケースでは `TracerProvider` インスタンスを作成し、DI にそのライフサイクルを管理させるべきです。
  詳しくは [Getting Started with OpenTelemetry .NET Traces in 5 Minutes - ASP.NET Core Application](/docs/languages/dotnet/traces/getting-started-aspnetcore/) チュートリアルを参照してください。
- DI を使用しないアプリケーションを構築している場合は、`TracerProvider` インスタンスを作成し、ライフサイクルを明示的に管理してください。
  詳しくは [Getting Started with OpenTelemetry .NET Traces in 5 Minutes - Console Application](/docs/languages/dotnet/traces/getting-started-console/) チュートリアルを参照してください。
- アプリケーション終了前に `TracerProvider` インスタンスを破棄し忘れると、適切なフラッシュが行われないためアクティビティがドロップされる可能性があります。
- `TracerProvider` インスタンスを早すぎるタイミングで破棄すると、それ以降のアクティビティは収集されません。

## 相関 {#correlation}

OpenTelemetry では、トレースは自動的に[ログと相関](/docs/languages/dotnet/logs/best-practices/#log-correlation)され、[エグザンプラー](/docs/languages/dotnet/metrics/exemplars/)を通じて[メトリクスと相関](/docs/languages/dotnet/metrics/best-practices/#metrics-correlation)させることもできます。

### 手動でのアクティビティの作成 {#manually-creating-activities}

[入門ガイド](/docs/languages/dotnet/traces/getting-started-console/)で示したように、`Activity` を手動で作成するのは非常に簡単です。
そのため、アクティビティを過剰に作成してしまいがちです（たとえば、各メソッド呼び出しに対して作成するなど）。
コストが高いだけでなく、アクティビティが多すぎるとトレースの可視化も難しくなります。
`Activity` を手動で作成するかわりに、[ASP.NET Core](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/main/src/OpenTelemetry.Instrumentation.AspNetCore/README.md) や [HttpClient](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/main/src/OpenTelemetry.Instrumentation.Http/README.md) などの計装ライブラリを活用できるか確認してください。
これらのライブラリは `Activity` を作成してタグ（属性）を設定するだけでなく、プロセス境界を越えたコンテキストの伝搬や復元も処理します。

計装ライブラリが生成した `Activity` に必要な情報が不足している場合は、新しいアクティビティを作成するのではなく、既存の `Activity` にその情報を追加することが一般的に推奨されます。

### 静的なタグをリソースとしてモデル化する {#modelling-static-tags-as-resource}

`MachineName` や `Environment` など、プロセスのライフタイム全体を通じて静的なタグは、各 `Activity` に追加するのではなく、`Resource` としてモデル化すべきです。

## トレースが欠落する一般的な問題 {#common-issues-that-lead-to-missing-traces}

以下は、トレースが欠落する一般的な問題です。

- `Activity` の作成に使用される `ActivitySource` が `TracerProvider` に追加されていない。
  `AddSource` メソッドを使用して、指定した `ActivitySource` からのアクティビティを有効にしてください。
- `TracerProvider` が早すぎるタイミングで破棄されている。
  トレースを収集するためには、`TracerProvider` インスタンスがアクティブな状態に保たれている必要があります。
  一般的なアプリケーションでは、1つの TracerProvider がアプリケーション起動時に構築され、アプリケーション終了時に破棄されます。
  ASP.NET Core アプリケーションの場合は、`OpenTelemetry.Extensions.Hosting` パッケージの `AddOpenTelemetry` メソッドと `WithTraces` メソッドを使用して `TracerProvider` を正しくセットアップしてください。
