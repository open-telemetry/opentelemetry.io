---
title: エクスポーター
weight: 50
default_lang_commit: bb23218b2ffc669eb538742e664dd7b52b55531e
---

{{% docs/languages/exporters/intro %}}

## 依存関係 {#otlp-dependencies}

テレメトリーデータを OTLP エンドポイント（[OpenTelemetry Collector](#collector-setup)、[Jaeger](#jaeger)、[Prometheus](#prometheus) など）に送信したい場合、データの転送に使用するプロトコルを2つから選べます。

- HTTP/protobuf
- gRPC

まず、プロジェクトの依存関係として [`OpenTelemetry.Exporter.OpenTelemetryProtocol`](https://www.nuget.org/packages/OpenTelemetry.Exporter.OpenTelemetryProtocol/) パッケージをインストールします。

```sh
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

ASP.NET Core を使用している場合は、[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting) パッケージもインストールしてください。

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

## 使い方 {#usage}

### ASP.NET Core {#aspnet-core}

ASP.NET Core サービスでエクスポーターを設定します。

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        // その他のセットアップコードはここに記述します
        .AddOtlpExporter())
    .WithMetrics(metrics => metrics
        // その他のセットアップコードはここに記述します
        .AddOtlpExporter());

builder.Logging.AddOpenTelemetry(logging => {
    // その他のセットアップコードはここに記述します
    logging.AddOtlpExporter();
});
```

デフォルトでは、gRPC を使用して <http://localhost:4317> にテレメトリーを送信します。
HTTP と protobuf フォーマットを使用するようにカスタマイズするには、次のようにオプションを追加します。

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        // その他のセットアップコードはここに記述します
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("your-endpoint-here/v1/traces");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        }))
    .WithMetrics(metrics => metrics
        // その他のセットアップコードはここに記述します
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("your-endpoint-here/v1/metrics");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        }));

builder.Logging.AddOpenTelemetry(logging => {
    // その他のセットアップコードはここに記述します
    logging.AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("your-endpoint-here/v1/logs");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    });
});
```

### 非 ASP.NET Core {#non-aspnet-core}

`TracerProvider`、`MeterProvider`、または `LoggerFactory` を作成する際にエクスポーターを設定します。

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    // リソースの設定など、その他のセットアップコードもここに記述します
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("your-endpoint-here/v1/traces");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    .Build();

var meterProvider = Sdk.CreateMeterProviderBuilder()
    // リソースの設定など、その他のセットアップコードもここに記述します
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("your-endpoint-here/v1/metrics");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("your-endpoint-here/v1/logs");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        })
    });
});
```

本番環境では、ヘッダーやエンドポイント URL などの値を設定するために環境変数を使用してください。

## コンソール {#console}

## 依存関係 {#dependencies}

コンソールエクスポーターは開発やデバッグのタスクに便利で、最もセットアップが簡単です。
まず、プロジェクトの依存関係として [`OpenTelemetry.Exporter.Console`](https://www.nuget.org/packages/OpenTelemetry.Exporter.Console/) パッケージをインストールします。

```sh
dotnet add package OpenTelemetry.Exporter.Console
```

ASP.NET Core を使用している場合は、[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting) パッケージもインストールしてください。

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

## 使い方 {#console-usage}

### ASP.NET Core {#console-usage-asp-net-core}

ASP.NET Core サービスでエクスポーターを設定します。

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        // その他のセットアップコードはここに記述します
        .AddConsoleExporter()
    )
    .WithMetrics(metrics => metrics
        // その他のセットアップコードはここに記述します
        .AddConsoleExporter()
    );

builder.Logging.AddOpenTelemetry(logging => {
    // その他のセットアップコードはここに記述します
    logging.AddConsoleExporter();
});
```

### 非 ASP.NET Core {#console-usage-non-asp-net-core}

`TracerProvider`、`MeterProvider`、または `LoggerFactory` を作成する際にエクスポーターを設定します。

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    // その他のセットアップコードはここに記述します
    .AddConsoleExporter()
    .Build();

var meterProvider = Sdk.CreateMeterProviderBuilder()
    // その他のセットアップコードはここに記述します
    .AddConsoleExporter()
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddConsoleExporter();
    });
});
```

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

以下のセクションでは、Prometheus エクスポーターの .NET 固有の設定手順を詳しく説明します。

メトリクスを Prometheus にエクスポートするには2つのアプローチがあります。

1. **OTLP エクスポーターの使用（プッシュ）**: OTLP プロトコルを使用してメトリクスを Prometheus にプッシュします。
   これには [Prometheus の OTLP レシーバー](https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver)を有効にする必要があります。
   このアプローチはエグゼンプラーをサポートし、安定しているため、本番環境に推奨されます。

2. **Prometheus エクスポーターの使用（プル/スクレイプ）**: アプリケーションに Prometheus がスクレイプできるスクレイピングエンドポイントを公開します。
   これは従来の Prometheus のアプローチです。

#### OTLP エクスポーターの使用（プッシュ） {#prometheus-otlp}

このアプローチは、OTLP エクスポーターを使用して Prometheus の OTLP レシーバーエンドポイントにメトリクスを直接プッシュします。
エグゼンプラーをサポートし、安定した OTLP プロトコルを使用するため、本番環境に推奨されます。

##### 依存関係 {#prometheus-otlp-dependencies}

プロジェクトの依存関係として [`OpenTelemetry.Exporter.OpenTelemetryProtocol`](https://www.nuget.org/packages/OpenTelemetry.Exporter.OpenTelemetryProtocol/) パッケージをインストールします。

```sh
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

ASP.NET Core を使用している場合は、[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting) パッケージもインストールしてください。

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

##### 使い方 {#prometheus-otlp-usage}

###### ASP.NET Core {#prometheus-otlp-asp-net-core-usage}

Prometheus の OTLP レシーバーにメトリクスを送信するように OTLP エクスポーターを設定します。

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        // その他のセットアップコードはここに記述します
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp/v1/metrics");
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        }));
```

###### 非 ASP.NET Core {#prometheus-otlp-non-asp-net-core-usage}

`MeterProvider` を作成する際にエクスポーターを設定します。

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    // リソースの設定など、その他のセットアップコードもここに記述します
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp/v1/metrics");
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
    })
    .Build();
```

> [!NOTE]
>
> OTLP レシーバーを有効にして Prometheus を起動してください。
>
> ```sh
> ./prometheus --web.enable-otlp-receiver
> ```
>
> Docker を使用する場合は次のようにします。
>
> ```sh
> docker run -p 9090:9090 prom/prometheus --web.enable-otlp-receiver
> ```

#### Prometheus エクスポーターの使用（プル/スクレイプ） {#prometheus-exporter}

このアプローチは、アプリケーション内にメトリクスエンドポイント（例: `/metrics`）を公開し、Prometheus が定期的にスクレイプします。

> [!WARNING]
>
> このエクスポーターはまだ開発中で、エグゼンプラーをサポートしていません。
> 本番環境では、代わりに [OTLP エクスポーターのアプローチ](#prometheus-otlp)の使用を検討してください。

##### 依存関係 {#prometheus-dependencies}

プロジェクトの依存関係として[エクスポーターパッケージ](https://www.nuget.org/packages/OpenTelemetry.Exporter.Prometheus.AspNetCore)をインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.AspNetCore --version {{% version-from-registry exporter-dotnet-prometheus-aspnetcore %}}
```

ASP.NET Core を使用している場合は、[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting) パッケージもインストールしてください。

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

##### 使い方 {#prometheus-exporter-usage}

###### ASP.NET Core {#prometheus-exporter-asp-net-core-usage}

ASP.NET Core サービスでエクスポーターを設定します。

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics.AddPrometheusExporter());
```

次に、Prometheus がアプリケーションをスクレイプできるように、Prometheus スクレイピングミドルウェアを登録する必要があります。
`IApplicationBuilder` の `UseOpenTelemetryPrometheusScrapingEndpoint` 拡張メソッドを使用します。

```csharp
var builder = WebApplication.CreateBuilder(args);

// ... セットアップ

var app = builder.Build();

app.UseOpenTelemetryPrometheusScrapingEndpoint();

await app.RunAsync();
```

デフォルトでは、メトリクスエンドポイントは `/metrics` で公開されます。
エンドポイントパスをカスタマイズしたり、述語関数を使用してより高度な設定を行うことができます。

```csharp
app.UseOpenTelemetryPrometheusScrapingEndpoint(
    context => context.Request.Path == "/internal/metrics"
        && context.Connection.LocalPort == 5067);
```

###### 非 ASP.NET Core {#prometheus-exporter-non-asp-net-core-usage}

> [!WARNING]
>
> このコンポーネントは開発時の内部ループ用であり、本番環境対応にする予定はありません。
> 本番環境では、[`OpenTelemetry.Exporter.Prometheus.AspNetCore`](#prometheus-exporter-asp-net-core-usage) を使用するか、[`OpenTelemetry.Exporter.OpenTelemetryProtocol`](#aspnet-core) と [OpenTelemetry Collector](/docs/collector) を組み合わせて使用してください。

ASP.NET Core を使用しないアプリケーションでは、別の[パッケージ](https://www.nuget.org/packages/OpenTelemetry.Exporter.Prometheus.HttpListener)で提供されている `HttpListener` バージョンを使用できます。

```shell
dotnet add package OpenTelemetry.Exporter.Prometheus.HttpListener --version {{% version-from-registry exporter-dotnet-prometheus-httplistener %}}
```

この場合、`MeterProviderBuilder` 上で直接セットアップします。

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(MyMeter.Name)
    .AddPrometheusHttpListener(
        options => options.UriPrefixes = new string[] { "http://localhost:9464/" })
    .Build();
```

##### Prometheus の設定（スクレイプ） {#prometheus-configuration-scrape}

Prometheus エクスポーター（プル/スクレイプアプローチ）を使用する場合、アプリケーションをスクレイプするように Prometheus を設定する必要があります。
`prometheus.yml` に以下を追加してください。

```yaml
scrape_configs:
  - job_name: 'your-app-name'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:5000'] # アプリケーションの host:port
```

Prometheus エクスポーターの設定の詳細については、[OpenTelemetry.Exporter.Prometheus.AspNetCore](https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Exporter.Prometheus.AspNetCore/README.md) を参照してください。

{{% include "exporters/zipkin-setup.md" %}}

## 依存関係 {#zipkin-dependencies}

トレースデータを [Zipkin](https://zipkin.io/) に送信するには、プロジェクトの依存関係として[エクスポーターパッケージ](https://www.nuget.org/packages/OpenTelemetry.Exporter.Zipkin)をインストールします。

```shell
dotnet add package OpenTelemetry.Exporter.Zipkin
```

ASP.NET Core を使用している場合は、[`OpenTelemetry.Extensions.Hosting`](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting) パッケージもインストールしてください。

```sh
dotnet add package OpenTelemetry.Extensions.Hosting
```

## 使い方 {#zipkin-usage}

### ASP.NET Core {#zipkin-asp-net-core-usage}

ASP.NET Core サービスでエクスポーターを設定します。

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        // その他のセットアップコードはここに記述します
        .AddZipkinExporter(options =>
        {
            options.Endpoint = new Uri("your-zipkin-uri-here");
        }));
```

### 非 ASP.NET Core {#zipkin-non-asp-net-core-usage}

トレーサープロバイダーを作成する際にエクスポーターを設定します。

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    // その他のセットアップコードはここに記述します
    .AddZipkinExporter(options =>
    {
        options.Endpoint = new Uri("your-zipkin-uri-here");
    })
    .Build();
```
