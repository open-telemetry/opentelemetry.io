---
title: 商品カタログサービス
linkTitle: 商品カタログ
aliases: [productcatalogservice]
default_lang_commit: 36a8a53c4a20a6d7a706539e9f3b4887327be781
# prettier-ignore
cSpell:ignore: fatalf otelcodes otelgrpc otlpmetricgrpc otlptracegrpc sdkmetric sdktrace sprintf
---

このサービスは、商品に関する情報を返す役割を担っています。
すべての商品の取得、特定の商品の検索、または個別の商品の詳細を返すために使用できます。

[商品カタログサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/product-catalog/)

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

OpenTelemetry SDK は `main` から `initTracerProvider` 関数を使用して初期化されます。

```go
func initTracerProvider() *sdktrace.TracerProvider {
    ctx := context.Background()

    exporter, err := otlptracegrpc.New(ctx)
    if err != nil {
        log.Fatalf("OTLP Trace gRPC Creation: %v", err)
    }
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(initResource()),
    )
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
    return tp
}
```

サービスのシャットダウン時には `TracerProvider.Shutdown()` を呼び出して、すべてのスパンがエクスポートされるようにしてください。
このサービスでは、main の遅延関数の一部としてこの呼び出しを行っています。

```go
tp := InitTracerProvider()
defer func() {
    if err := tp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Tracer Provider Shutdown: %v", err)
    }
}()
```

### gRPC 自動計装の追加 {#adding-grpc-auto-instrumentation}

このサービスは gRPC リクエストを受信しており、それらは main 関数で gRPC サーバーの作成時に計装されます。

```go
srv := grpc.NewServer(
    grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
```

このサービスは発信 gRPC 呼び出しも行い、それらはすべて gRPC クライアントを計装でラップすることで計装されます。

```go
func createClient(ctx context.Context, svcAddr string) (*grpc.ClientConn, error) {
    return grpc.DialContext(ctx, svcAddr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
    )
}
```

### 自動計装されたスパンへの属性の追加 {#add-attributes-to-auto-instrumented-spans}

自動計装されたコードの実行中に、コンテキストから現在のスパンを取得できます。

```go
span := trace.SpanFromContext(ctx)
```

スパンへの属性の追加は、スパンオブジェクトの `SetAttributes` を使用して行います。
`GetProduct` 関数では、商品 ID の属性がスパンに追加されます。

```go
span.SetAttributes(
    attribute.String("app.product.id", req.Id),
)
```

### スパンステータスの設定 {#setting-span-status}

このサービスは、フィーチャーフラグに基づいてエラー条件をキャッチして処理できます。
エラー条件の場合、スパンオブジェクトの `SetStatus` を使用してスパンステータスが適切に設定されます。
これは `GetProduct` 関数で確認できます。

```go
msg := fmt.Sprintf("Error: ProductCatalogService Fail Feature Flag Enabled")
span.SetStatus(otelcodes.Error, msg)
```

### スパンイベントの追加 {#add-span-events}

スパンイベントの追加は、スパンオブジェクトの `AddEvent` を使用して行います。
`GetProduct` 関数では、エラー条件が処理されたとき、または商品が正常に見つかったときにスパンイベントが追加されます。

```go
span.AddEvent(msg)
```

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

OpenTelemetry SDK は `main` から `initMeterProvider` 関数を使用して初期化されます。

```go
func initMeterProvider() *sdkmetric.MeterProvider {
    ctx := context.Background()

    exporter, err := otlpmetricgrpc.New(ctx)
    if err != nil {
        log.Fatalf("new otlp metric grpc exporter failed: %v", err)
    }

    mp := sdkmetric.NewMeterProvider(sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter)))
    global.SetMeterProvider(mp)
    return mp
}
```

サービスのシャットダウン時には `initMeterProvider.Shutdown()` を呼び出して、すべてのレコードがエクスポートされるようにしてください。
このサービスでは、main の遅延関数の一部としてこの呼び出しを行っています。

```go
mp := initMeterProvider()
defer func() {
    if err := mp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Error shutting down meter provider: %v", err)
    }
}()
```

### Goランタイム自動計装の追加 {#adding-golang-runtime-auto-instrumentation}

Goランタイムは main 関数で計装されます。

```go
err := runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second))
if err != nil {
    log.Fatal(err)
}
```

## ログ {#logs}

OpenTelemetry Collector にログを送信するには2つの方法があります。

- Collector に直接送信する
- ファイルまたは `stdout` を経由する

これら両方のアプローチの使用方法は、[手動計装](/docs/languages/go/instrumentation/)ドキュメントの[ログ](/docs/languages/go/instrumentation/#logs)セクションに記載されています。

商品カタログサービスはログを直接 Collector に送信し、ログブリッジを使用して `slog` ログパッケージにブリッジし、構造化ログを出力します。

## LoggerProvider の初期化 {#loggerprovider-initialization}

OpenTelemetry SDK は `main` から `initLoggerProvider` 関数を使用して初期化されます。

```go
ctx := context.Background()

logExporter, err := otlploggrpc.New(ctx)
if err != nil {
	return nil
}

loggerProvider := sdklog.NewLoggerProvider(
	sdklog.WithProcessor(sdklog.NewBatchProcessor(logExporter)),
)
global.SetLoggerProvider(loggerProvider)

return loggerProvider
```

サービスのシャットダウン時には `LoggerProvider.Shutdown()` を呼び出して、すべてのログがエクスポートされるようにしてください。
このサービスでは、`main` の遅延関数の一部としてこの呼び出しを行っています。

```go
lp := initLoggerProvider()
defer func() {
	if err := lp.Shutdown(context.Background()); err != nil {
		logger.Error(fmt.Sprintf("Logger Provider Shutdown: %v", err))
	}
	logger.Info("Shutdown logger provider")
}()
```

### ログ機能 {#logging-functionality}

このサービスは gRPC 呼び出しを使用して Collector にログを送信します。
ログは `slog` パッケージを使用して構造化された形式で出力されます。

まず、ロガーを初期化します。

```go
logger   *slog.Logger
logger = otelslog.NewLogger("product-catalog")
```

ロガーに送信する前に、出力をフォーマットするために `fmt.Sprintf` を使用していることに注目してください。

```go
logger.Info("Loading Product Catalog...")
logger.Info(fmt.Sprintf("Product Catalog reload interval: %d", interval))
logger.Error(fmt.Sprintf("Error shutting down meter provider: %v", err))
```

`slog` を使用する利点は、出力に追加の属性を付与できることです。
以下の例では `product.name` と `product.id` の属性を付与しています。
これにより、ログ出力の一部としてこれらを表示・解析でき、Grafana で個別のカラムとして表示しやすくなります。

```go
logger.LogAttrs(
	ctx,
	slog.LevelInfo, "Product Found",
	slog.String("app.product.name", found.Name),
	slog.String("app.product.id", req.Id),
)
```
