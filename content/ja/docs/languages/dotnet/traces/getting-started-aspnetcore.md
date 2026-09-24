---
title: トレースを始める - ASP.NET Core
linkTitle: ASP.NET Core
description: ASP.NET Core アプリケーションで OpenTelemetry トレースを使用する方法を学ぶ
weight: 20
default_lang_commit: d73b60c13553d891f005688578c9579fe21ac35e
cSpell:ignore: aspnetcoreapp
---

このガイドでは、ASP.NET Core アプリケーションで OpenTelemetry .NET トレースを始める方法を説明します。

## 前提条件 {#prerequisites}

- コンピューターに [.NET SDK](https://dotnet.microsoft.com/download) がインストールされていること

## ASP.NET Core アプリケーションの作成 {#creating-an-aspnet-core-application}

新しい ASP.NET Core Web アプリケーションを作成します。

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## OpenTelemetry トレースの追加 {#adding-opentelemetry-traces}

必要な OpenTelemetry パッケージをインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

`Program.cs` ファイルを次のコードで更新します。

```csharp
using System.Diagnostics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// トレースと自動起動で OpenTelemetry を設定する。
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter());

var app = builder.Build();

app.MapGet("/", () => $"Hello World! OpenTelemetry Trace: {Activity.Current?.Id}");

app.Run();
```

## アプリケーションの実行 {#running-the-application}

アプリケーションを実行します。

```shell
dotnet run
```

コンソールに表示される URL（たとえば `http://localhost:5000`）をブラウザで開きます。

コンソールに次のようなトレース出力が表示されるはずです。

```text
Activity.TraceId:            c28f7b480d5c7dfc30cfbd80ad29028d
Activity.SpanId:             27e478bbf9fdec10
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: Microsoft.AspNetCore
Activity.DisplayName:        GET /
Activity.Kind:               Server
Activity.StartTime:          2024-07-04T13:03:37.3318740Z
Activity.Duration:           00:00:00.3693734
Activity.Tags:
    server.address: localhost
    server.port: 5154
    http.request.method: GET
    url.scheme: https
    url.path: /
    network.protocol.version: 2
    user_agent.original: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36
    http.route: /
    http.response.status_code: 200
Resource associated with Activity:
    service.name: getting-started-aspnetcore
    service.instance.id: a388466b-4969-4bb0-ad96-8f39527fa66b
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.9.0
```

おめでとうございます！ASP.NET Core アプリケーションで OpenTelemetry を使用してトレースを収集できるようになりました。

## 仕組み {#how-it-works}

### OpenTelemetry の登録 {#opentelemetry-registration}

アプリケーションは、ASP.NET Core が提供する依存性注入コンテナを使用して OpenTelemetry サービスを登録します。

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter());
```

このコードは次の処理を行います。

1. `AddOpenTelemetry()` で OpenTelemetry をサービスコレクションに追加する
2. `ConfigureResource()` でサービス情報を含むリソースを設定する
3. `WithTracing()` でトレース収集をセットアップする
4. `AddAspNetCoreInstrumentation()` で ASP.NET Core の自動計装を追加する
5. コンソールエクスポーターを設定してトレースをコンソールに出力する

### ASP.NET Core の計装 {#aspnet-core-instrumentation}

`AddAspNetCoreInstrumentation()` メソッドは、HTTP リクエストのトレースを自動的に作成します。
これには次の情報が含まれます。

- リクエストの所要時間
- HTTP メソッド、ルート、ステータスコード
- ネットワーク情報
- ユーザーエージェント

これらのトレースは、コントローラーやミドルウェアに追加のコードを記述することなく収集されます。

### 現在の Activity へのアクセス {#accessing-the-current-activity}

OpenTelemetry .NET では、`Activity` クラスが OpenTelemetry 仕様の「スパン」に対応します。
この例では、レスポンスに ID を含めるために現在の Activity にアクセスしています。

```csharp
app.MapGet("/", () => $"Hello World! OpenTelemetry Trace: {Activity.Current?.Id}");
```

これにより、ブラウザでトレース ID を確認し、監視システム内のトレースと関連付けることができます。

## さらに学ぶ {#learn-more}

- [トレースを始める - コンソール](/docs/languages/dotnet/traces/getting-started-console/)
- [Jaeger へのエクスポート](/docs/languages/dotnet/traces/jaeger/)
- [Introduction to OpenTelemetry .NET Tracing API](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Api#introduction-to-opentelemetry-net-tracing-api)
