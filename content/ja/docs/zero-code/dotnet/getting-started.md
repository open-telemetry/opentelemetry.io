---
title: はじめに
description: 5分以内にアプリケーションのテレメトリーを取得しましょう！
weight: 5
default_lang_commit: b8a25353c25d781a375b51f354011248a8140113
cSpell:ignore: ASPNETCORE rolldice
---

このページでは、OpenTelemetry .NET 自動計装を使い始める方法を説明します。

アプリケーションを手動で計装する方法を探している場合は、[こちらのガイド](/docs/languages/dotnet/getting-started)を参照してください。

シンプルな .NET アプリケーションを自動的に計装し、[トレース][traces]、[メトリクス][metrics]、[ログ][logs]をコンソールに出力する方法を学びます。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6以上

## サンプルアプリケーション {#example-application}

以下の例では、基本的な [ASP.NET Core の Minimal API](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api) アプリケーションを使用します。
ASP.NET Core を使用していなくても問題ありません。OpenTelemetry .NET 自動計装はそのまま利用できます。

より詳細な例については、[サンプル](/docs/languages/dotnet/examples/)を参照してください。

### HTTP サーバーの作成と起動 {#create-and-launch-an-http-server}

まず、`dotnet-simple` という新しいディレクトリに環境をセットアップします。
そのディレクトリ内で、以下のコマンドを実行してください。

```sh
dotnet new web
```

同じディレクトリ内で、`Program.cs` の内容を以下のコードに置き換えてください。

```csharp
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var logger = app.Logger;

int RollDice()
{
    return Random.Shared.Next(1, 7);
}

string HandleRollDice(string? player)
{
    var result = RollDice();

    if (string.IsNullOrEmpty(player))
    {
        logger.LogInformation("Anonymous player is rolling the dice: {result}", result);
    }
    else
    {
        logger.LogInformation("{player} is rolling the dice: {result}", player, result);
    }

    return result.ToString(CultureInfo.InvariantCulture);
}

app.MapGet("/rolldice/{player?}", HandleRollDice);

app.Run();
```

`Properties` サブディレクトリ内で、`launchSettings.json` の内容を以下に置き換えてください。

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:8080",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

以下のコマンドでアプリケーションをビルドして実行し、ウェブブラウザーで <http://localhost:8080/rolldice> を開いて動作を確認してください。

```sh
dotnet build
dotnet run
```

## 計装 {#instrumentation}

次に、[OpenTelemetry .NET 自動計装](../)を使用して、起動時にアプリケーションを計装します。
[.NET 自動計装を設定する][configure .NET Automatic Instrumentation]方法はいくつかありますが、以下の手順では Unix シェルまたは PowerShell スクリプトを使用します。

> **Note**: PowerShell コマンドには管理者権限が必要です。

1. `opentelemetry-dotnet-instrumentation` リポジトリの [Releases][] からインストールスクリプトをダウンロードします。

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   $module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
   $download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
   Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing
   ```

   {{% /tab %}} {{< /tabpane >}}

2. 以下のスクリプトを実行して、開発環境用の自動計装をダウンロードします。

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   ./otel-dotnet-auto-install.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   Import-Module $download_path
   Install-OpenTelemetryCore
   ```

   {{% /tab %}} {{< /tabpane >}}

3. [コンソールエクスポーター][console exporter]を指定する変数を設定してエクスポートし、シェルやターミナル環境に適した表記法を使用して、その他の必要な環境変数を設定するスクリプトを実行します。
   ここでは bash 系シェルと PowerShell の表記法を示します。

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   export OTEL_TRACES_EXPORTER=console \
     OTEL_METRICS_EXPORTER=console \
     OTEL_LOGS_EXPORTER=console
     OTEL_SERVICE_NAME=RollDiceService
   . $HOME/.otel-dotnet-auto/instrument.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   $env:OTEL_TRACES_EXPORTER="console"
   $env:OTEL_METRICS_EXPORTER="console"
   $env:OTEL_LOGS_EXPORTER="console"
   Register-OpenTelemetryForCurrentSession -OTelServiceName "RollDiceService"
   ```

   {{% /tab %}} {{< /tabpane >}}

4. **アプリケーション**をもう一度実行します。

   ```sh
   dotnet run
   ```

   `dotnet run` の出力に注目してください。

5. *別の*ターミナルから、`curl` を使用してリクエストを送信します。

   ```sh
   curl localhost:8080/rolldice
   ```

6. 約30秒後、サーバープロセスを停止します。

この時点で、以下のようなトレースとログの出力がサーバーとクライアントから表示されるはずです（読みやすいように出力は折り返されています）。

<details>
<summary>トレースとログ</summary>

```log
LogRecord.Timestamp:               2023-08-14T06:44:53.9279186Z
LogRecord.TraceId:                 3961d22b5f90bf7662ad4933318743fe
LogRecord.SpanId:                  93d5fcea422ff0ac
LogRecord.TraceFlags:              Recorded
LogRecord.CategoryName:            simple-dotnet
LogRecord.LogLevel:                Information
LogRecord.StateValues (Key:Value):
    result: 1
    OriginalFormat (a.k.a Body): Anonymous player is rolling the dice: {result}

Resource associated with LogRecord:
service.name: simple-dotnet
telemetry.auto.version: 0.7.0
telemetry.sdk.name: opentelemetry
telemetry.sdk.language: dotnet
telemetry.sdk.version: 1.4.0.802

info: simple-dotnet[0]
      Anonymous player is rolling the dice: 1
Activity.TraceId:            3961d22b5f90bf7662ad4933318743fe
Activity.SpanId:             93d5fcea422ff0ac
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: OpenTelemetry.Instrumentation.AspNetCore
Activity.DisplayName:        /rolldice
Activity.Kind:               Server
Activity.StartTime:          2023-08-14T06:44:53.9278162Z
Activity.Duration:           00:00:00.0049754
Activity.Tags:
    net.host.name: localhost
    net.host.port: 8080
    http.method: GET
    http.scheme: http
    http.target: /rolldice
    http.url: http://localhost:8080/rolldice
    http.flavor: 1.1
    http.user_agent: curl/8.0.1
    http.status_code: 200
Resource associated with Activity:
    service.name: simple-dotnet
    telemetry.auto.version: 0.7.0
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.4.0.802
```

</details>

また、サーバーを停止すると、収集されたすべてのメトリクスの出力が表示されるはずです（以下はサンプルの抜粋です）。

<details>
<summary>メトリクス</summary>

```log
Export process.runtime.dotnet.gc.collections.count, Number of garbage collections that have occurred since process start., Meter: OpenTelemetry.Instrumentation.Runtime/1.1.0.2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen2 LongSum
Value: 2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen1 LongSum
Value: 2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen0 LongSum
Value: 6

...

Export http.client.duration, Measures the duration of outbound HTTP requests., Unit: ms, Meter: OpenTelemetry.Instrumentation.Http/1.0.0.0
(2023-08-14T06:12:06.2661140Z, 2023-08-14T06:12:23.7750388Z] http.flavor: 1.1 http.method: POST http.scheme: https http.status_code: 200 net.peer.name: dc.services.visualstudio.com Histogram
Value: Sum: 1330.4766000000002 Count: 5 Min: 50.0333 Max: 465.7936
(-Infinity,0]:0
(0,5]:0
(5,10]:0
(10,25]:0
(25,50]:0
(50,75]:2
(75,100]:0
(100,250]:0
(250,500]:3
(500,750]:0
(750,1000]:0
(1000,2500]:0
(2500,5000]:0
(5000,7500]:0
(7500,10000]:0
(10000,+Infinity]:0
```

</details>

## 次のステップ {#what-next}

詳細については、以下を参照してください。

- エクスポーター、サンプラー、リソースなどを設定するには、[設定とオプション](../configuration)を参照してください
- [利用可能な計装](../instrumentations)のリストを確認してください
- 自動計装と手動計装を組み合わせたい場合は、[カスタムトレースとメトリクスの作成](/docs/zero-code/dotnet/custom/)方法を確認してください
- 問題が発生した場合は、[トラブルシューティングガイド](../troubleshooting)を確認してください

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[configure .NET Automatic Instrumentation]: ../configuration
[console exporter]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#internal-logs
[releases]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases
