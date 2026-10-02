---
title: チェックアウトサービス
linkTitle: チェックアウト
aliases: [checkoutservice]
default_lang_commit: 7333fc19a0fc19b5aae57f2aae72861f76cbae3e
# prettier-ignore
cSpell:ignore: fatalf otelgrpc otelsarama otlpmetricgrpc otlptracegrpc sarama sdkmetric sdktrace
---

このサービスはユーザーからのチェックアウト注文を処理する役割を担います。
チェックアウトサービスは注文を処理するために他の多くのサービスを呼び出します。

[チェックアウトサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/checkout/)

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

OpenTelemetry SDK は `main` から `initTracerProvider` 関数を使用して初期化されます。

```go
func initTracerProvider() *sdktrace.TracerProvider {
    ctx := context.Background()

    exporter, err := otlptracegrpc.New(ctx)
    if err != nil {
        log.Fatal(err)
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

すべてのスパンがエクスポートされることを保証するため、サービスのシャットダウン時に `TracerProvider.Shutdown()` を呼び出す必要があります。
このサービスでは main の遅延関数の一部としてこの呼び出しを行います。

```go
tp := initTracerProvider()
defer func() {
    if err := tp.Shutdown(context.Background()); err != nil {
        log.Printf("Error shutting down tracer provider: %v", err)
    }
}()
```

### gRPC 自動計装の追加 {#adding-grpc-auto-instrumentation}

このサービスは gRPC リクエストを受信し、main 関数で gRPC サーバー作成の一部として計装されます。

```go
var srv = grpc.NewServer(
    grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
```

このサービスはいくつかの送信 gRPC 呼び出しを発行し、gRPC クライアントを計装でラップすることですべて計装されます。

```go
func createClient(ctx context.Context, svcAddr string) (*grpc.ClientConn, error) {
    return grpc.DialContext(ctx, svcAddr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
    )
}
```

### Kafka（Sarama）自動計装の追加 {#adding-kafka--sarama--auto-instrumentation}

このサービスは処理結果を Kafka トピックに書き込み、その後他のマイクロサービスによって処理されます。
Kafka クライアントを計装するには、Producer の作成後にラップする必要があります。

```go
saramaConfig := sarama.NewConfig()
producer, err := sarama.NewAsyncProducer(brokers, saramaConfig)
if err != nil {
    return nil, err
}
producer = otelsarama.WrapAsyncProducer(saramaConfig, producer)
```

### 自動計装されたスパンへの属性の追加 {#add-attributes-to-auto-instrumented-spans}

自動計装されたコードの実行中に、コンテキストから現在のスパンを取得できます。

```go
span := trace.SpanFromContext(ctx)
```

スパンへの属性の追加は、スパンオブジェクトの `SetAttributes` を使用して行います。
`PlaceOrder` 関数ではいくつかの属性がスパンに追加されます。

```go
span.SetAttributes(
    attribute.String("app.order.id", orderID.String()), shippingTrackingAttribute,
    attribute.Float64("app.shipping.amount", shippingCostFloat),
    attribute.Float64("app.order.amount", totalPriceFloat),
    attribute.Int("app.order.items.count", len(prep.orderItems)),
)
```

### スパンイベントの追加 {#add-span-events}

スパンイベントの追加は、スパンオブジェクトの `AddEvent` を使用して行います。
`PlaceOrder` 関数ではいくつかのスパンイベントが追加されます。
属性を伴うイベントもあれば、そうでないものもあります。

属性なしのスパンイベントの追加:

```go
span.AddEvent("prepared")
```

属性付きのスパンイベントの追加:

```go
span.AddEvent("charged",
    trace.WithAttributes(attribute.String("app.payment.transaction.id", txID)))
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

すべてのレコードがエクスポートされることを保証するため、サービスのシャットダウン時に `MeterProvider.Shutdown()` を呼び出す必要があります。
このサービスでは main の遅延関数の一部としてこの呼び出しを行います。

```go
mp := initMeterProvider()
defer func() {
    if err := mp.Shutdown(context.Background()); err != nil {
        log.Printf("Error shutting down meter provider: %v", err)
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

これらのアプローチの使用方法を記載したドキュメントは、[手動計装](/docs/languages/go/instrumentation/)ドキュメントの[ログ](/docs/languages/go/instrumentation/#logs)セクションにあります。

チェックアウトサービスはログを Collector に直接送信し、ログブリッジを使用して `slog` ロギングパッケージにブリッジし、構造化ログを出力します。

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

すべてのログがエクスポートされることを保証するため、サービスの終了時に `LoggerProvider.Shutdown()` を呼び出します。
このサービスでは `main` の遅延関数の一部としてこの呼び出しを行います。

```go
lp := initLoggerProvider()
defer func() {
	if err := lp.Shutdown(context.Background()); err != nil {
		logger.Error(fmt.Sprintf("Logger Provider Shutdown: %v", err))
	}
	logger.Info("Shutdown logger provider")
}()
```

### ロギング機能 {#logging-functionality}

このサービスは gRPC 呼び出しを使用して Collector にログを送信します。
ログは `slog` パッケージを使用して構造化されたフォーマットで出力されます。

まず、ロガーを初期化します。

```go
logger   *slog.Logger
logger = otelslog.NewLogger("checkout")
```

ロガーに送信する前に出力をフォーマットするために `fmt.Sprintf` を使用していることに注意してください。

```go
logger.Info(fmt.Sprintf("order confirmation email sent to %q", req.Email))
logger.Warn(fmt.Sprintf("failed to send order confirmation to %q: %+v", req.Email, err))
logger.Error(fmt.Sprintf("Error shutting down logger provider: %v", err))
```

`slog` を使用する利点は、出力に追加の属性を付与できることです。
次の例では `orderID`、`shippingCost`、`totalPrice` などのいくつかの属性を付与しています。
これにより、ログ出力の一部としてこれらを確認・解析できるようになり、Grafana で別々のカラムとして表示しやすくなります。

```go
logger.LogAttrs(
    ctx,
    slog.LevelInfo, "order placed",
    slog.String("app.order.id", orderID.String()),
    slog.Float64("app.shipping.amount", shippingCostFloat),
    slog.Float64("app.order.amount", totalPriceFloat),
    slog.Int("app.order.items.count", len(prep.orderItems)),
    slog.String("app.shipping.tracking.id", shippingTrackingID),
)
```
