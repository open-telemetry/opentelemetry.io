---
title: カスタムトレースとメトリクスの作成
linkTitle: カスタム計装
description: .NET 自動計装を使用したカスタムトレースとメトリクス。
weight: 30
default_lang_commit: 2b88c43e50fb99c601ededa24b1f3a461fef9ac0
cSpell:ignore: meterprovider tracerprovider
---

自動計装は `TracerProvider` と `MeterProvider` を構成するため、独自の手動計装を追加できます。
自動計装と手動計装の両方を使用することで、アプリケーション、クライアント、フレームワークのロジックと機能をより的確に計装できます。

## トレース {#traces}

カスタムトレースを手動で作成するには、以下の手順に従ってください。

1. プロジェクトに `System.Diagnostics.DiagnosticSource` の依存関係を追加します。

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="8.0.0" />
   ```

2. `ActivitySource` インスタンスを作成します。

   ```csharp
   private static readonly ActivitySource RegisteredActivity = new ActivitySource("Examples.ManualInstrumentations.Registered");
   ```

3. `Activity` を作成します。
   必要に応じてタグを設定します。

   ```csharp
   using (var activity = RegisteredActivity.StartActivity("Main"))
   {
      activity?.SetTag("foo", "bar1");
      // Main アクティビティのロジック
   }
   ```

4. OpenTelemetry.AutoInstrumentation に `ActivitySource` を登録するには、環境変数 `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES` を設定します。
   値は `Examples.ManualInstrumentations.Registered` または接頭辞全体を登録する `Examples.ManualInstrumentations.*` のいずれかに設定できます。

> [!WARNING]
>
> `NonRegistered.ManualInstrumentations` の `ActivitySource` に対して作成された `Activity` は、OpenTelemetry 自動計装では処理されません。

## メトリクス {#metrics}

カスタムメトリクスを手動で作成するには、以下の手順に従ってください。

1. プロジェクトに `System.Diagnostics.DiagnosticSource` の依存関係を追加します。

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="8.0.0" />
   ```

2. `Meter` インスタンスを作成します。

   ```csharp
   using var meter = new Meter("Examples.Service", "1.0");
   ```

3. 計装を作成します。

   ```csharp
   var successCounter = meter.CreateCounter<long>("srv.successes.count", description: "Number of successful responses");
   ```

4. 計装の値を更新します。
   必要に応じてタグを設定します。

   ```csharp
   successCounter.Add(1, new KeyValuePair<string, object?>("tagName", "tagValue"));
   ```

5. OpenTelemetry.AutoInstrumentation に `Meter` を登録するには、環境変数 `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES` を設定します。

   ```bash
   OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES=Examples.Service
   ```

   値は `Examples.Service` または接頭辞全体を登録する `Examples.*` のいずれかに設定できます。

## 参考資料 {#further-reading}

- [OpenTelemetry.io の .NET 手動計装ドキュメント](/docs/languages/dotnet/instrumentation#setting-up-an-activitysource)
