---
title: 計装
weight: 36
aliases: [manual]
description: OpenTelemetry .NET の計装
default_lang_commit: 46b67485e928d406a3e5e74f024180d28583c84d
cSpell:ignore: dicelib rolldice
---

{{% include instrumentation-intro.md %}}

> [!NOTE]
>
> このページでは、トレース、メトリクス、ログをコードに手動で追加する方法を学びます。
> 計装の方法は1種類に限定されません。
> [自動計装](/docs/zero-code/dotnet/)を使って開始し、必要に応じて手動計装でコードを充実させることもできます。
>
> また、コードが依存しているライブラリについては、すでに計装されているか、それらのための[計装ライブラリ](/docs/languages/dotnet/libraries/)が存在する場合があるため、自分で計装コードを書く必要はありません。

## 用語に関する注意 {#a-note-on-terminology}

.NET は OpenTelemetry をサポートする他の言語やランタイムとは異なります。
[Tracing API](/docs/concepts/signals/traces/) は [System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics) API によって実装されており、`ActivitySource` や `Activity` といった既存のコンストラクトを再利用して、内部的に OpenTelemetry に準拠するようになっています。

しかし、.NET 開発者がアプリケーションを計装するために知っておく必要がある OpenTelemetry API と用語の部分があり、ここでは `System.Diagnostics` API とともにそれらを取り上げます。

`System.Diagnostics` API のかわりに OpenTelemetry API を使用したい場合は、[トレース用の OpenTelemetry API Shim のドキュメント](../shim)を参照してください。

## サンプルアプリの準備 {#example-app}

このページでは、手動計装について学ぶために、[はじめに](/docs/languages/dotnet/getting-started/)のサンプルアプリを修正したバージョンを使用します。

サンプルアプリを使う必要はありません。
自分のアプリやライブラリを計装したい場合は、ここに記載された手順を自分のコードに合わせて適用してください。

### 前提条件 {#example-app-prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

### HTTP サーバーの作成と起動 {#create-and-launch-an-http-server}

まず、`dotnet-otel-example` という新しいディレクトリに環境をセットアップします。
そのディレクトリ内で、次のコマンドを実行してください。

```shell
dotnet new web
```

ライブラリの計装とスタンドアロンアプリの計装の違いを明確にするために、サイコロを振る処理をライブラリファイルに分離し、アプリファイルから依存関係としてインポートします。

`Dice.cs` という名前のライブラリファイルを作成し、次のコードを追加してください。

```csharp
/*Dice.cs*/

public class Dice
{
    private int min;
    private int max;

    public Dice(int min, int max)
    {
        this.min = min;
        this.max = max;
    }

    public List<int> rollTheDice(int rolls)
    {
        List<int> results = new List<int>();

        for (int i = 0; i < rolls; i++)
        {
            results.Add(rollOnce());
        }

        return results;
    }

    private int rollOnce()
    {
        return Random.Shared.Next(min, max + 1);
    }
}
```

アプリファイル `DiceController.cs` を作成し、次のコードを追加してください。

```csharp
/*DiceController.cs*/

using Microsoft.AspNetCore.Mvc;
using System.Net;


public class DiceController : ControllerBase
{
    private ILogger<DiceController> logger;

    public DiceController(ILogger<DiceController> logger)
    {
        this.logger = logger;
    }

    [HttpGet("/rolldice")]
    public List<int> RollDice(string player, int? rolls)
    {
        if(!rolls.HasValue)
        {
            logger.LogError("Missing rolls parameter");
            throw new HttpRequestException("Missing rolls parameter", null, HttpStatusCode.BadRequest);
        }

        var result = new Dice(1, 6).rollTheDice(rolls.Value);

        if (string.IsNullOrEmpty(player))
        {
            logger.LogInformation("Anonymous player is rolling the dice: {result}", result);
        }
        else
        {
            logger.LogInformation("{player} is rolling the dice: {result}", player, result);
        }

        return result;
    }
}
```

Program.cs ファイルの内容を次のコードに置き換えてください。

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

`Properties` サブディレクトリ内の `launchSettings.json` の内容を次の内容に置き換えてください。

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

動作確認のために、次のコマンドでアプリケーションを実行し、ウェブブラウザで <http://localhost:8080/rolldice?rolls=12> を開いてください。

```sh
dotnet run
```

ブラウザウィンドウに12個の数字のリストが表示されるはずです。たとえば次のようになります。

```text
[5,6,5,3,6,1,2,5,4,4,2,4]
```

## 手動計装のセットアップ {#manual-instrumentation-setup}

### 依存関係 {#dependencies}

次の OpenTelemetry NuGet パッケージをインストールしてください。

[OpenTelemetry.Exporter.Console](https://www.nuget.org/packages/OpenTelemetry.Exporter.Console)

[OpenTelemetry.Extensions.Hosting](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting)

```sh
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

ASP.NET Core ベースのアプリケーションの場合は、AspNetCore 計装パッケージもインストールしてください。

[OpenTelemetry.Instrumentation.AspNetCore](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNetCore)

```sh
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

### SDK の初期化 {#initialize-the-sdk}

> [!NOTE]
>
> ライブラリを計装する場合、SDK を初期化する必要はありません。

OpenTelemetry SDK のインスタンスをアプリケーションのできるだけ早い段階で設定することが重要です。

サンプルアプリのような ASP.NET Core アプリで OpenTelemetry SDK を初期化するには、`Program.cs` の内容を次のコードに更新してください。

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// この名前は設定ファイルや定数ファイルなどから取得するのが理想的です。
var serviceName = "dice-server";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(
        serviceName: serviceName,
        serviceVersion: serviceVersion))
    .WithTracing(tracing => tracing
        .AddSource(serviceName)
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter())
    .WithMetrics(metrics => metrics
        .AddMeter(serviceName)
        .AddConsoleExporter());

builder.Logging.AddOpenTelemetry(options => options
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: serviceName,
        serviceVersion: serviceVersion))
    .AddConsoleExporter());

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

コンソールアプリで OpenTelemetry SDK を初期化する場合は、プログラムの冒頭、重要なスタートアップ処理の際に次のコードを追加してください。

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

//...

var serviceName = "MyServiceName";
var serviceVersion = "1.0.0";

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .ConfigureResource(resource =>
        resource.AddService(
          serviceName: serviceName,
          serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(serviceName)
    .AddConsoleExporter()
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddConsoleExporter();
    });
});

//...

tracerProvider.Dispose();
meterProvider.Dispose();
loggerFactory.Dispose();
```

デバッグとローカル開発のために、このサンプルではテレメトリーをコンソールにエクスポートしています。
手動計装のセットアップが完了したら、アプリのテレメトリーデータを1つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/dotnet/exporters/)するために、適切なエクスポーターを設定する必要があります。

このサンプルでは、サービスの論理名を保持する必須の SDK デフォルト属性 `service.name` と、オプションですが強く推奨される属性 `service.version`（サービスの API または実装のバージョンを保持する）も設定しています。
リソース属性を設定する別の方法もあります。
詳細については、[リソース](/docs/languages/dotnet/resources/)を参照してください。

コードを検証するために、アプリをビルドして実行してください。

```sh
dotnet build
dotnet run
```

## トレース {#traces}

### トレースの初期化 {#initialize-tracing}

> [!NOTE]
>
> ライブラリを計装する場合、TracerProvider を初期化する必要はありません。

アプリで[トレース](/docs/concepts/signals/traces/)を有効にするには、[`Tracer`](/docs/concepts/signals/traces/#tracer) を作成するための初期化済みの [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) が必要です。

`TracerProvider` が作成されていない場合、トレース用の OpenTelemetry API は no-op 実装を使用し、データを生成しません。

[SDK の初期化](#initialize-the-sdk)の手順に従った場合は、`TracerProvider` はすでにセットアップされています。
[ActivitySource のセットアップ](#setting-up-an-activitysource)に進んでください。

### ActivitySource のセットアップ {#setting-up-an-activitysource}

アプリケーションで手動トレースコードを書く場所には、[`ActivitySource`](/docs/concepts/signals/traces/#tracer) を設定する必要があります。
これにより [`Activity`](/docs/concepts/signals/traces/#spans) 要素を使用してオペレーションをトレースできるようになります。

通常、計装対象のアプリ/サービスごとに `ActivitySource` を一度定義することが推奨されますが、シナリオに合わせて複数の `ActivitySource` をインスタンス化することもできます。

サンプルアプリの場合、ActivitySource への参照を保持するカスタム型として新しいファイル `Instrumentation.cs` を作成します。

```csharp
using System.Diagnostics;

/// <summary>
/// ActivitySource の参照を保持するにはカスタム型を使用することが推奨されます。
/// これにより、DI コンテナ内の他のコンポーネントとの型の衝突を回避できます。
/// </summary>
public class Instrumentation : IDisposable
{
    internal const string ActivitySourceName = "dice-server";
    internal const string ActivitySourceVersion = "1.0.0";

    public Instrumentation()
    {
        this.ActivitySource = new ActivitySource(ActivitySourceName, ActivitySourceVersion);
    }

    public ActivitySource ActivitySource { get; }

    public void Dispose()
    {
        this.ActivitySource.Dispose();
    }
}
```

次に、Instrument オブジェクトを依存性注入として追加するために `Program.cs` を更新します。

```csharp
//...

// Instrumentation クラスを DI コンテナにシングルトンとして登録します。
builder.Services.AddSingleton<Instrumentation>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

アプリケーションファイル `DiceController.cs` でその activitySource インスタンスを参照し、同じ activitySource インスタンスをライブラリファイル `Dice.cs` にも渡します。

```csharp
/*DiceController.cs*/

using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net;

public class DiceController : ControllerBase
{
    private ILogger<DiceController> logger;

    private ActivitySource activitySource;

    public DiceController(ILogger<DiceController> logger, Instrumentation instrumentation)
    {
        this.logger = logger;
        this.activitySource = instrumentation.ActivitySource;
    }

    [HttpGet("/rolldice")]
    public List<int> RollDice(string player, int? rolls)
    {
        List<int> result = new List<int>();

        if (!rolls.HasValue)
        {
            logger.LogError("Missing rolls parameter");
            throw new HttpRequestException("Missing rolls parameter", null, HttpStatusCode.BadRequest);
        }

        result = new Dice(1, 6, activitySource).rollTheDice(rolls.Value);

        if (string.IsNullOrEmpty(player))
        {
            logger.LogInformation("Anonymous player is rolling the dice: {result}", result);
        }
        else
        {
            logger.LogInformation("{player} is rolling the dice: {result}", player, result);
        }

        return result;
    }
}
```

```csharp
/*Dice.cs*/

using System.Diagnostics;

public class Dice
{
    public ActivitySource activitySource;
    private int min;
    private int max;

    public Dice(int min, int max, ActivitySource activitySource)
    {
        this.min = min;
        this.max = max;
        this.activitySource = activitySource;
    }

    //...
}
```

### Activity の作成 {#create-activities}

[activitySource](/docs/concepts/signals/traces/#tracer) が初期化されたので、[Activity](/docs/concepts/signals/traces/#spans) を作成できます。

以下のコードは Activity を作成する方法を示しています。

```csharp
public List<int> rollTheDice(int rolls)
{
    List<int> results = new List<int>();

    // Activity の作成は、独立して測定する価値のあるオペレーションを実行するときのみ推奨されます。
    // Activity が多すぎると、Jaeger などのツールでの可視化が難しくなります。
    using (var myActivity = activitySource.StartActivity("rollTheDice"))
    {
        for (int i = 0; i < rolls; i++)
        {
            results.Add(rollOnce());
        }

        return results;
    }
}
```

ここまで[サンプルアプリ](#example-app)の手順に従っている場合は、上記のコードをライブラリファイル `Dice.cs` にコピーしてください。
これで、アプリから出力される Activity/スパンを確認できるはずです。

次のようにアプリを起動し、ブラウザまたは curl で <http://localhost:8080/rolldice?rolls=12> にリクエストを送信してください。

```sh
dotnet run
```

しばらくすると、`ConsoleExporter` によってコンソールにスパンが出力されるはずです。
たとえば次のようになります。

```json
Activity.TraceId:            841d70616c883db82b4ae4e11c728636
Activity.SpanId:             9edfe4d69b0d6d8b
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       39fcd105cf958377
Activity.ActivitySourceName: dice-server
Activity.DisplayName:        rollTheDice
Activity.Kind:               Internal
Activity.StartTime:          2024-04-10T15:24:00.3620354Z
Activity.Duration:           00:00:00.0144329
Resource associated with Activity:
    service.name: dice-server
    service.version: 1.0.0
    service.instance.id: 7a7a134f-3178-4ac6-9625-96df77cff8b4
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.7.0
```

### ネストされた Activity の作成 {#create-nested-activities}

ネストされた[スパン](/docs/concepts/signals/traces/#spans)を使うと、ネストされた性質の処理を追跡できます。
たとえば、以下の `rollOnce()` 関数はネストされたオペレーションを表します。
次のサンプルは `rollOnce()` を追跡するネストされたスパンを作成します。

```csharp
private int rollOnce()
{
    using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
      int result;

      result = Random.Shared.Next(min, max + 1);

      return result;
    }
}
```

トレース可視化ツールでスパンを表示すると、`rollOnce` の childActivity は `rollTheDice` Activity の下にネストされたオペレーションとして追跡されます。

### 現在の Activity の取得 {#get-the-current-activity}

プログラムの特定の時点で現在の Activity/スパンに対して何かを行うことが役立つ場合があります。

```csharp
var activity = Activity.Current;
```

### Activity タグ {#activity-tags}

タグ（[属性](/docs/concepts/signals/traces/#attributes)に相当するもの）を使用すると、[`Activity`](/docs/concepts/signals/traces/#spans) にキー/バリューペアを付加して、追跡中の現在のオペレーションに関するより多くの情報を持たせることができます。

```csharp
private int rollOnce()
{
  using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
      int result;

      result = Random.Shared.Next(min, max + 1);
      childActivity?.SetTag("dicelib.rolled", result);

      return result;
    }
}
```

### Activity へのイベントの追加 {#add-events-to-activities}

[スパン](/docs/concepts/signals/traces/#spans)には、名前付きイベント（[スパンイベント](/docs/concepts/signals/traces/#span-events)と呼ばれる）でアノテーションを付けることができます。
スパンイベントは0個以上の[スパン属性](#activity-tags)を持つことができ、それぞれがタイムスタンプと自動的にペアになるキー:バリューマップです。

```csharp
myActivity?.AddEvent(new("Init"));
...
myActivity?.AddEvent(new("End"));
```

```csharp
var eventTags = new ActivityTagsCollection
{
    { "operation", "calculate-pi" },
    { "result", 3.14159 }
};

activity?.AddEvent(new("End Computation", DateTimeOffset.Now, eventTags));
```

### リンク付きの Activity の作成 {#create-activities-with-links}

[スパン](/docs/concepts/signals/traces/#spans)は、因果関係のある0個以上の他のスパンに[スパンリンク](/docs/concepts/signals/traces/#span-links)を介してリンクできます。
リンクは、バッチ処理において、スパンが複数の開始スパンによって開始され、各開始スパンがバッチで処理される個々の受信項目を表す場合に使用できます。

```csharp
var links = new List<ActivityLink>
{
    new ActivityLink(activityContext1),
    new ActivityLink(activityContext2),
    new ActivityLink(activityContext3)
};

var activity = MyActivitySource.StartActivity(
    ActivityKind.Internal,
    name: "activity-with-links",
    links: links);
```

### Activity ステータスの設定 {#set-activity-status}

{{% include "span-status-preamble.md" %}}

例外が発生したときにそれを記録するのはよい方法です。
[スパンステータスの設定](/docs/specs/otel/trace/api/#set-status)と合わせて行うことが推奨されます。

```csharp
private int rollOnce()
{
    using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
        int result;

        try
        {
            result = Random.Shared.Next(min, max + 1);
            childActivity?.SetTag("dicelib.rolled", result);
        }
        catch (Exception ex)
        {
            childActivity?.SetStatus(ActivityStatusCode.Error, "Something bad happened!");
            childActivity?.AddException(ex);
            throw;
        }

        return result;
    }
}
```

## 次のステップ {#next-steps}

手動計装をセットアップした後は、[計装ライブラリ](../libraries/)の使用を検討してください。
計装ライブラリはその名の通り、使用しているライブラリを計装し、受信および送信 HTTP リクエストなどのスパン（Activity）を生成します。

また、アプリのテレメトリーデータを1つ以上のテレメトリーバックエンドに[エクスポート](../exporters/)するために、適切なエクスポーターを設定することも必要です。

[.NET の自動計装](/docs/zero-code/dotnet/)もチェックできます。
こちらは現在ベータ版です。
