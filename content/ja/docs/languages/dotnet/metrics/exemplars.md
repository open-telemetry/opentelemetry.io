---
title: エグゼンプラーの使用
linkTitle: エグゼンプラー
description: OpenTelemetry .NET でエグゼンプラーを使用してメトリクスとトレースをリンクする方法を学ぶ
weight: 40
default_lang_commit: 86f0b7d243c8b1a6ac0e7ad57532c7a84b96d03c
---

[エグゼンプラー](/docs/specs/otel/metrics/sdk/#exemplar)は、集約データのサンプルデータポイントです。
一般的な集約に対して、具体的なコンテキストを提供します。
一般的なユースケースの1つは、メトリクスをトレース（およびログ）に相関させる機能を得ることです。

このガイドでは、OpenTelemetry .NET でエグゼンプラーを使用してメトリクスとトレースを接続する方法を、Prometheus、Jaeger、Grafana を使って説明します。

## エグゼンプラーとは {#what-are-exemplars}

エグゼンプラーは、集約されたメトリクスの一部である個々の測定値を表します。
エグゼンプラーを使用すると、以下のことが可能になります。

- 測定値が取得された時点でアクティブだったトレースにメトリクスをリンクする
- 集約されたメトリクス内の外れ値や興味深いデータポイントを特定する
- 関連するトレースを調査して、メトリクスの変化の原因をより深く理解する

## このガイドで使用するコンポーネント {#components-used-in-this-guide}

- **OpenTelemetry .NET SDK**: アプリケーションの計装
- **Prometheus**: エグゼンプラーをサポートするメトリクスバックエンド
- **Jaeger**: 分散トレーシングバックエンド
- **Grafana**: メトリクスとトレースをクエリし、エグゼンプラーを使用してそれらの間をナビゲートする UI

## セットアップ {#setup}

### Jaeger のインストールと実行 {#install-and-run-jaeger}

1. Jaeger の[最新のバイナリディストリビューション](https://www.jaegertracing.io/download/)をダウンロードする
2. ローカルディレクトリに展開する
3. `jaeger-all-in-one(.exe)` 実行ファイルを実行する:

```shell
./jaeger-all-in-one --collector.otlp.enabled
```

### Prometheus のインストールと実行 {#install-and-run-prometheus}

1. Prometheus の[最新リリース](https://prometheus.io/download/)をダウンロードする
2. ローカルディレクトリに展開する
3. 必要なフィーチャーフラグを指定して Prometheus を実行する:

```shell
./prometheus --enable-feature=exemplar-storage --web.enable-otlp-receiver
```

### Grafana のインストールと設定 {#install-and-configure-grafana}

1. [OS 固有の手順](https://grafana.com/docs/grafana/latest/setup-grafana/installation/#supported-operating-systems)に従って Grafana をインストールする
2. Grafana サーバーを起動する
3. ブラウザで [http://localhost:3000/](http://localhost:3000/) を開く
4. デフォルトの認証情報（admin/admin）でログインする
5. データソースを設定する:

#### Jaeger データソース {#jaeger-data-source}

1. Configuration > Data sources に移動する
2. Jaeger データソースを追加する
3. "URL" を `http://localhost:16686/` に設定する
4. "Save & test" をクリックする

#### Prometheus データソース {#prometheus-data-source}

1. Configuration > Data sources に移動する
2. Prometheus データソースを追加する
3. "URL" を `http://localhost:9090` に設定する
4. "Exemplars" の下で、"Internal link" を有効にする
5. "Data source" を `Jaeger` に、"Label name" を `trace_id` に設定する
6. "Save & test" をクリックする

## アプリケーションの計装 {#instrument-your-application}

以下は、OpenTelemetry を使用して .NET アプリケーションを計装し、エグゼンプラーを有効にする方法の例です:

```csharp
using System;
using System.Diagnostics;
using System.Threading;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// サービス情報を含むリソースを作成する
var resource = ResourceBuilder.CreateDefault()
    .AddService(serviceName: "exemplars-demo", serviceVersion: "1.0.0");

// トレーサープロバイダーを作成する
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(resource)
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddOtlpExporter(options => options.Endpoint = new Uri("http://localhost:4317"))
    .Build();

// エグゼンプラーをサポートするメータープロバイダーを作成する
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .SetResourceBuilder(resource)
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .SetExemplarFilter(ExemplarFilterType.TraceBased)  // トレースベースのエグゼンプラーを有効にする
    .AddOtlpExporter(options => options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp"))
    .Build();

// アクティビティソースとメーターを作成する
var activitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");
var meter = new Meter("MyCompany.MyProduct.MyLibrary");

// 測定値を記録するためのヒストグラム計装を作成する
var histogram = meter.CreateHistogram<double>("MyHistogram", unit: "ms", description: "Example histogram");

var random = new Random();

// サンプルデータを生成する
for (int i = 0; i < 100; i++)
{
    // アクティビティ（スパン）を開始する
    using (var activity = activitySource.StartActivity("ProcessData"))
    {
        // アクティビティに属性を追加する
        activity?.SetTag("iteration", i);

        // 作業をシミュレートする
        var value = random.NextDouble() * 100;
        Thread.Sleep((int)value);

        // 測定値を記録する - ExemplarFilterType.TraceBased を設定し
        // アクティブなアクティビティがあるため、トレースコンテキストを含む
        // エグゼンプラーが含まれる
        histogram.Record(value);
    }

    // イテレーション間でスリープする
    Thread.Sleep(100);
}

Console.WriteLine("Application running and sending data. Press any key to exit.");
Console.ReadKey();

// アプリケーション終了前にプロバイダーを破棄する。
// これにより、残りのテレメトリーがフラッシュされ、パイプラインがシャットダウンされる。
meterProvider.Dispose();
tracerProvider.Dispose();
```

## Grafana でのエグゼンプラーの表示 {#viewing-exemplars-in-grafana}

1. Grafana を開き、Explore に移動する
2. データソースとして Prometheus を選択する
3. `MyHistogram_bucket` メトリクスをクエリする
4. "Exemplars" オプションをオンにしてクエリを更新する

エグゼンプラーは、メトリクスチャート上にひし形のドットとして表示されます。
エグゼンプラーをクリックすると、以下の詳細が表示されます:

- 測定値が記録されたタイムスタンプ
- 生の値
- トレースコンテキスト（trace_id）

trace_id の横にある "Query with Jaeger" をクリックすると、関連するトレースを表示でき、その特定の測定値が取得された時点で何が起きていたのかを把握できます。

## OpenTelemetry .NET でのエグゼンプラーの仕組み {#how-exemplars-work-in-opentelemetry-net}

`SetExemplarFilter(ExemplarFilterType.TraceBased)` で SDK を設定すると、SDK はアクティブなスパンのコンテキスト内で発生するメトリクスの測定値にトレース情報（トレース ID、スパン ID）を付与します。
これにより、メトリクスバックエンドはこれらのエグゼンプラーを保存し、対応するトレースにリンクできるようになります。

デフォルトでは、すべての測定値がエグゼンプラーとして保存されるわけではありません（それは非効率です）。
バックエンドは通常、どの測定値をエグゼンプラーとして保存するかを決定するためにサンプリング戦略を使用します。

エグゼンプラーには別の計装 API は必要ありません。
通常の `System.Diagnostics.Metrics` の計装 API を引き続き使用してください。
エグゼンプラーフィルタリングが有効でバックエンドがサポートしている場合、SDK とエクスポートパスがエグゼンプラーを自動的に付与します。
通常の API の使用方法については、[メトリクス API](/docs/languages/dotnet/metrics-api/) を参照してください。

## エグゼンプラーと View ベースの属性フィルタリング {#exemplars-and-view-based-attribute-filtering}

> [!IMPORTANT] `TagKeys` を制限する（または `View` で属性を削除する）と、**集約されたメトリクス**ストリームからは属性が削除されますが、同じ計装に対して記録されたエグゼンプラーからは属性が削除**されません**。
> 削除された属性は、エグゼンプラー上で _filtered tags_ として保持されます。
>
> 属性を削除する目的が**データの秘匿化**（たとえば、機密データを含む属性の削除）である場合、エグゼンプラーが有効な状態では `View` だけでは**不十分**です。
> エグゼンプラーを完全に無効にするにはデフォルトの `ExemplarFilterType.AlwaysOff` を維持するか、カスタムの `ExemplarFilter` / `ExemplarReservoir` を設定してどの測定値をサンプリングするかを制御してください。
> 対応する仕様の明確化については、[opentelemetry-specification#5073](https://github.com/open-telemetry/opentelemetry-specification/pull/5073) を参照してください。

## さらに学ぶ {#learn-more}

- [OpenTelemetry エグゼンプラー仕様](/docs/specs/otel/metrics/sdk/#exemplar)
- [Prometheus エグゼンプラー](https://prometheus.io/docs/prometheus/latest/feature_flags/#exemplars-storage)
- [Jaeger Tracing](https://www.jaegertracing.io/)
- [Grafana エグゼンプラードキュメント](https://grafana.com/docs/grafana/latest/fundamentals/exemplars/)
