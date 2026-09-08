---
title: カートサービス
linkTitle: カート
aliases: [cartservice]
default_lang_commit: 552bd64ff45ca252d1da0ca875abd1584a619d7f
---

このサービスはユーザーがショッピングカートに入れた商品を管理します。
ショッピングカートデータへの高速アクセスのために Valkey キャッシュサービスと連携します。

[カートサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/cart/)

> **Note** .NET 向け OpenTelemetry は、トレースとメトリクスに標準の OpenTelemetry API の代わりに `System.Diagnostic.DiagnosticSource` ライブラリを API として使用します。
> ログには `Microsoft.Extensions.Logging.Abstractions` ライブラリが使用されます。

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

OpenTelemetry は .NET の依存性注入コンテナで設定されます。
`AddOpenTelemetry()` ビルダーメソッドを使用して、目的の計装ライブラリの設定、エクスポーターの追加、その他のオプションの設定を行います。
エクスポーターとリソース属性の設定は環境変数を通じて行われます。

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithTracing(tracerBuilder => tracerBuilder
        .AddSource("OpenTelemetry.Demo.Cart")
        .AddRedisInstrumentation(
            options => options.SetVerboseDatabaseStatements = true)
        .AddAspNetCoreInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());
```

### 自動計装されたスパンへの属性の追加 {#add-attributes-to-auto-instrumented-spans}

自動計装されたコードの実行中に、コンテキストから現在のスパン（アクティビティ）を取得できます。

```cs
var activity = Activity.Current;
```

スパン（アクティビティ）への属性（.NET ではタグ）の追加は、アクティビティオブジェクトの `SetTag` を使用して行います。
`services/CartService.cs` の `AddItem` 関数では、自動計装されたスパンにいくつかの属性が追加されます。

```cs
activity?.SetTag("app.user.id", request.UserId);
activity?.SetTag("app.product.quantity", request.Item.Quantity);
activity?.SetTag("app.product.id", request.Item.ProductId);
```

### スパンイベントの追加 {#add-span-events}

スパン（アクティビティ）イベントの追加は、アクティビティオブジェクトの `AddEvent` を使用して行います。
`services/CartService.cs` の `GetCart` 関数ではスパンイベントが追加されます。

```cs
activity?.AddEvent(new("Fetch cart"));
```

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

OpenTelemetry トレースの設定と同様に、.NET の依存性注入コンテナは `AddOpenTelemetry()` の呼び出しを必要とします。
このビルダーで目的の計装ライブラリやエクスポーターなどを設定します。

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithMetrics(meterBuilder => meterBuilder
        .AddMeter("OpenTelemetry.Demo.Cart")
        .AddProcessInstrumentation()
        .AddRuntimeInstrumentation()
        .AddAspNetCoreInstrumentation()
        .SetExemplarFilter(ExemplarFilterType.TraceBased)
        .AddOtlpExporter());
```

### Exemplars {#exemplars}

[Exemplars](/docs/specs/otel/metrics/data-model/#exemplars) は、カートサービスでトレースベースの Exemplar フィルターを使用して設定されます。
これにより、OpenTelemetry SDK がメトリクスに Exemplar を付与できるようになります。

まず `CartActivitySource`、`Meter`、および2つの `Histogram` を作成します。
ヒストグラムは `AddItem` メソッドと `GetCart` メソッドのレイテンシーを追跡します。
これらはカートサービスにおける2つの重要なメソッドです。

ユーザーがカートに商品を追加するときや、チェックアウトに進む前にカートを表示するときに長時間待たされるべきではないため、これらの2つのメソッドはカートサービスにとって重要です。

```cs
private static readonly ActivitySource CartActivitySource = new("OpenTelemetry.Demo.Cart");
private static readonly Meter CartMeter = new Meter("OpenTelemetry.Demo.Cart");
private static readonly Histogram<long> addItemHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.add_item.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 500000, 600000, 700000, 800000, 900000, 1000000, 1100000 ]
    });
private static readonly Histogram<long> getCartHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.get_cart.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 300000, 400000, 500000, 600000, 700000, 800000, 900000 ]
    });
```

カートサービスが返すマイクロ秒単位の結果にはデフォルト値が適合しないため、カスタムバケット境界も定義されていることに注意してください。

変数が定義されたら、各メソッドの実行レイテンシーは次のように `StopWatch` で追跡されます。

```cs
var stopwatch = Stopwatch.StartNew();

(method logic)

addItemHistogram.Record(stopwatch.ElapsedTicks);
```

すべてを結びつけるには、トレースパイプラインで作成したソースを追加する必要があります。
（上記のスニペットにすでに含まれていますが、参照のためにここに記載します）:

```cs
.AddSource("OpenTelemetry.Demo.Cart")
```

そして、メトリクスパイプラインに `Meter` と `ExemplarFilter` を追加します。

```cs
.AddMeter("OpenTelemetry.Demo.Cart")
.SetExemplarFilter(ExemplarFilterType.TraceBased)
```

Exemplar を可視化するには、Grafana <http://localhost:8080/grafana> > Dashboards > Demo > Cart Service Exemplars に移動します。

Exemplar は95パーセンタイルチャート上に特別な「ダイヤモンド型のドット」として、またはヒートマップチャート上に小さな正方形として表示されます。
任意の Exemplar を選択するとそのデータが表示されます。
データには測定のタイムスタンプ、生の値、記録時のトレースコンテキストが含まれます。
`trace_id` を使用してトレーシングバックエンド（この場合は Jaeger）に移動できます。

![Cart Service Exemplars](exemplars.png)

## ログ {#logs}

ログは .NET の依存性注入コンテナで `LoggingBuilder` レベルで `AddOpenTelemetry()` を呼び出すことにより設定されます。
このビルダーで目的のオプションやエクスポーターなどを設定します。

```cs
builder.Logging
    .AddOpenTelemetry(options => options.AddOtlpExporter());
```
