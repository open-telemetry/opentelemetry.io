---
title: メトリクスを始める - ASP.NET Core
linkTitle: ASP.NET Core
description: ASP.NET Core アプリケーションで OpenTelemetry メトリクスを使う方法を学ぶ
weight: 20
default_lang_commit: dcb78a3aa2784ed071112b7bae3cf40e97032103
cSpell:ignore: aspnetcoreapp
---

このガイドでは、ASP.NET Core アプリケーションで OpenTelemetry .NET メトリクスを数分で始める方法を紹介します。

## 前提条件 {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) がコンピューターにインストールされていること

## ASP.NET Core アプリケーションの作成 {#creating-an-aspnet-core-application}

新しい ASP.NET Core ウェブアプリケーションを作成します。

```shell
dotnet new web -o aspnetcoreapp
cd aspnetcoreapp
```

## OpenTelemetry メトリクスの追加 {#adding-opentelemetry-metrics}

必要な OpenTelemetry パッケージをインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

`Program.cs` ファイルを以下のコードで更新します。

```csharp
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;

var builder = WebApplication.CreateBuilder(args);

// OpenTelemetry をメトリクスと自動起動で設定する。
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter((exporterOptions, metricReaderOptions) =>
        {
            metricReaderOptions.PeriodicExportingMetricReaderOptions.ExportIntervalMilliseconds = 1000;
        }));

var app = builder.Build();

app.MapGet("/", () => $"Hello from OpenTelemetry Metrics!");

app.Run();
```

## アプリケーションの実行 {#running-the-application}

アプリケーションを実行します。

```shell
dotnet run
```

コンソールに表示される URL（例: `http://localhost:5000`）にブラウザでアクセスします。

コンソールに以下のようなメトリクス出力が表示されるはずです。

```text
Export http.server.duration, Measures the duration of inbound HTTP requests., Unit: ms, Meter: OpenTelemetry.Instrumentation.AspNetCore/1.0.0.0
(2023-04-11T21:49:43.6915232Z, 2023-04-11T21:50:50.6564690Z) http.flavor: 1.1 http.method: GET http.route: / http.scheme: http http.status_code: 200 net.host.name: localhost net.host.port: 5000 Histogram
Value: Sum: 3.5967 Count: 11 Min: 0.073 Max: 2.5539
(-Infinity,0]:0
(0,5]:11
(5,10]:0
(10,25]:0
(25,50]:0
(50,75]:0
(75,100]:0
(100,250]:0
(250,500]:0
(500,750]:0
(750,1000]:0
(1000,2500]:0
(2500,5000]:0
(5000,7500]:0
(7500,10000]:0
(10000,+Infinity]:0
```

おめでとうございます！
これで OpenTelemetry を使用して ASP.NET Core アプリケーションからメトリクスを収集できるようになりました。

## 仕組み {#how-it-works}

### OpenTelemetry の登録 {#opentelemetry-registration}

アプリケーションは、ASP.NET Core が提供する依存性注入コンテナを使用して OpenTelemetry サービスを登録します。

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter((exporterOptions, metricReaderOptions) =>
        {
            metricReaderOptions.PeriodicExportingMetricReaderOptions.ExportIntervalMilliseconds = 1000;
        }));
```

このコードは以下を行います。

1. `AddOpenTelemetry()` でサービスコレクションに OpenTelemetry を追加する
2. `ConfigureResource()` でサービス情報を含むリソースを設定する
3. `WithMetrics()` でメトリクスの収集を設定する
4. `AddAspNetCoreInstrumentation()` で ASP.NET Core の自動計装を追加する
5. コンソールエクスポーターを毎秒メトリクスをエクスポートするように設定する

### ASP.NET Core の計装 {#aspnet-core-instrumentation}

`AddAspNetCoreInstrumentation()` メソッドは、以下を含む HTTP リクエストメトリクスを自動的に収集します。

- リクエストの持続時間
- HTTP メソッド、ルート、ステータスコード
- ネットワーク情報

これらのメトリクスは、コントローラーやミドルウェアに追加のコードを記述することなく収集されます。

## さらに学ぶ {#learn-more}

- [メトリクスを始める - コンソール](/docs/languages/dotnet/metrics/getting-started-console/)
- [Prometheus と Grafana へのエクスポート](/docs/languages/dotnet/metrics/getting-started-prometheus-grafana/)
- [メトリクス計装](/docs/languages/dotnet/metrics/instruments/)
