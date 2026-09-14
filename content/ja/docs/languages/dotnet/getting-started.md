---
title: はじめに
description: 5分以内にアプリのテレメトリーを取得しましょう！
weight: 8
default_lang_commit: ec40cad3a7ca79640aa6a6f97264fbbe0d00aa87
cSpell:ignore: ASPNETCORE rolldice
---

このページでは、.NET における OpenTelemetry の始め方を紹介します。

アプリケーションを自動的に計装する方法をお探しの場合は、[こちらのガイド](/docs/zero-code/dotnet/getting-started/)を参照してください。

シンプルな .NET アプリケーションに対して計装を行い、[トレース][traces]、[メトリクス][metrics]、[ログ][logs]をコンソールに出力する方法を学ぶことができます。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 8+

## アプリケーション例 {#example-application}

次の例では、基本的な [ASP.NET Core の Minimal API](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api) アプリケーションを使用しています。
ASP.NET Core の Minimal API を使用していなくても問題ありません。
OpenTelemetry .NET は他のフレームワークでも利用できます。
対応しているフレームワーク用ライブラリの一覧については、[レジストリ](/ecosystem/registry/?component=instrumentation&language=dotnet)をご覧ください。

より詳しい例については、[examples](/docs/languages/dotnet/examples/) をご覧ください。

### HTTP サーバーを作成して起動する {#create-and-launch-an-http-server}

まず、`dotnet-simple` という新しいディレクトリに環境をセットアップします。
そのディレクトリ内で、次のコマンドを実行してください。

```sh
dotnet new web
```

同じディレクトリ内で、`Program.cs` の内容を次のコードに置き換えてください。

```csharp
using System.Globalization;

using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string HandleRollDice([FromServices]ILogger<Program> logger, string? player)
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

int RollDice()
{
    return Random.Shared.Next(1, 7);
}

app.MapGet("/rolldice/{player?}", HandleRollDice);

app.Run();
```

`Properties` サブディレクトリ内で、`launchSettings.json` の内容を次のように置き換えてください。

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

次のコマンドでアプリケーションをビルドして実行し、ウェブブラウザーで <http://localhost:8080/rolldice> を開いて正しく動作していることを確認してください。

```sh
dotnet build
dotnet run
```

## 計装 {#instrumentation}

次に、テレメトリーを生成する [OpenTelemetry の NuGet パッケージ](https://www.nuget.org/profiles/OpenTelemetry)をインストールしてセットアップします。

1. パッケージを追加する

   ```sh
   dotnet add package OpenTelemetry.Extensions.Hosting
   dotnet add package OpenTelemetry.Instrumentation.AspNetCore
   dotnet add package OpenTelemetry.Exporter.Console
   ```

2. OpenTelemetry のコードをセットアップする

   Program.cs で、次の行を

   ```csharp
   var builder = WebApplication.CreateBuilder(args);
   var app = builder.Build();
   ```

   次のように置き換えてください。

   ```csharp
   using OpenTelemetry.Logs;
   using OpenTelemetry.Metrics;
   using OpenTelemetry.Resources;
   using OpenTelemetry.Trace;

   var builder = WebApplication.CreateBuilder(args);

   const string serviceName = "roll-dice";

   builder.Logging.AddOpenTelemetry(options =>
   {
       options
           .SetResourceBuilder(
               ResourceBuilder.CreateDefault()
                   .AddService(serviceName))
           .AddConsoleExporter();
   });
   builder.Services.AddOpenTelemetry()
         .ConfigureResource(resource => resource.AddService(serviceName))
         .WithTracing(tracing => tracing
             .AddAspNetCoreInstrumentation()
             .AddConsoleExporter())
         .WithMetrics(metrics => metrics
             .AddAspNetCoreInstrumentation()
             .AddConsoleExporter());

   var app = builder.Build();
   ```

3. **アプリケーション**をもう一度実行します。

   ```sh
   dotnet run
   ```

   `dotnet run` の出力を確認してください。

4. *別の*ターミナルから、`curl` を使ってリクエストを送信します。

   ```sh
   curl localhost:8080/rolldice
   ```

5. 約30秒後、サーバープロセスを停止します。

この時点で、サーバーとクライアントからのトレースとログの出力が表示されるはずです。
次のような内容が出力されます（読みやすくするために出力は折り返しています）。

<details>
<summary>トレースとログ</summary>

```log
LogRecord.Timestamp:               2023-10-23T12:13:30.2704325Z
LogRecord.TraceId:                 324333ec3bbca04ba7f4be4bf3618cb1
LogRecord.SpanId:                  e7d3814e31e504eb
LogRecord.TraceFlags:              Recorded
LogRecord.CategoryName:            Program
LogRecord.Severity:                Info
LogRecord.SeverityText:            Information
LogRecord.Body:                    Anonymous player is rolling the dice: {result}
LogRecord.Attributes (Key:Value):
    result: 1
    OriginalFormat (a.k.a Body): Anonymous player is rolling the dice: {result}

Resource associated with LogRecord:
service.name: roll-dice
service.instance.id: f20134f3-293f-4cb2-ace3-724b5571ca9a
telemetry.sdk.name: opentelemetry
telemetry.sdk.language: dotnet
telemetry.sdk.version: 1.6.0

Activity.TraceId:            324333ec3bbca04ba7f4be4bf3618cb1
Activity.SpanId:             e7d3814e31e504eb
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: Microsoft.AspNetCore
Activity.DisplayName:        /rolldice
Activity.Kind:               Server
Activity.StartTime:          2023-10-23T12:13:30.2163005Z
Activity.Duration:           00:00:00.0585187
Activity.Tags:
    net.host.name: 127.0.0.1
    net.host.port: 8080
    http.method: GET
    http.scheme: http
    http.target: /rolldice
    http.url: http://127.0.0.1:8080/rolldice
    http.flavor: 1.1
    http.user_agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.61
    http.status_code: 200
Resource associated with Activity:
    service.name: roll-dice
    service.instance.id: 36bfe322-51b8-4976-90fc-9186376d6ad0
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.6.0
```

</details>

また、サーバーを停止すると、収集されたすべてのメトリクスの出力が表示されるはずです（以下はサンプルの抜粋です）。

<details>
<summary>メトリクス</summary>

```log
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

さらに詳しく知りたい方へ。

- この例を別の[エクスポーター][exporter]で実行して、テレメトリーデータを送信してみましょう。
- ご自身のアプリで[自動計装](/docs/zero-code/dotnet/)を試してみましょう。
- [手動計装][manual instrumentation]について学び、さらに多くの[サンプル](/docs/languages/dotnet/examples/)を試してみましょう。
- [OpenTelemetry デモ](/docs/demo/)をご覧ください。
  .NET ベースの[カートサービス](/docs/demo/services/cart/)が含まれています。

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[exporter]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#exporters
[manual instrumentation]: ../instrumentation
