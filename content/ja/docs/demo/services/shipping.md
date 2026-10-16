---
title: 配送サービス
linkTitle: 配送
aliases: [shippingservice]
default_lang_commit: e31e3b1556ecbcbc2f9a09cad6518f0eea32dd63
cSpell:ignore: sdktrace
---

このサービスは、チェックアウトサービスからリクエストされた際に、料金やトラッキング情報を含む配送情報を提供する役割を担います。

配送サービスは [Actix Web](https://actix.rs/) と、ログのための [Tracing](https://tracing.rs/)、および OpenTelemetry ライブラリを使用して構築されています。
その他のサブ依存関係はすべて `Cargo.toml` に含まれています。

フレームワークやランタイムによっては、補足として [Rust のドキュメント](/docs/languages/rust/)を参照することを検討してください。
見積もりリクエストとトラッキング ID において、非同期および同期のスパンの例をそれぞれ確認できます。

[配送サービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/shipping/)

## 計装 {#instrumentation}

OpenTelemetry SDK は `telemetry_conf` ファイルで設定されています。

デフォルトのリソース検出器に加えて `OS` と `Process` 検出器を使用してリソースを作成するための関数 `get_resource()` が実装されています。

```rust
fn get_resource() -> Resource {
    let detectors: Vec<Box<dyn ResourceDetector>> = vec![
        Box::new(OsResourceDetector),
        Box::new(ProcessResourceDetector),
    ];

    Resource::builder().with_detectors(&detectors).build()
}
```

`get_resource()` を用意することで、この関数をすべてのプロバイダー初期化にわたって複数回呼び出すことができます。

### トレーサープロバイダーの初期化 {#initializing-tracer-provider}

```rust
fn init_tracer_provider() {
    global::set_text_map_propagator(TraceContextPropagator::new());

    let tracer_provider = opentelemetry_sdk::trace::SdkTracerProvider::builder()
        .with_resource(get_resource())
        .with_batch_exporter(
            opentelemetry_otlp::SpanExporter::builder()
                .with_tonic()
                .build()
                .expect("Failed to initialize tracing provider"),
        )
        .build();

    global::set_tracer_provider(tracer_provider);
}
```

### メータープロバイダーの初期化 {#initializing-meter-provider}

```rust
fn init_meter_provider() -> opentelemetry_sdk::metrics::SdkMeterProvider {
    let meter_provider = opentelemetry_sdk::metrics::SdkMeterProvider::builder()
        .with_resource(get_resource())
        .with_periodic_exporter(
            opentelemetry_otlp::MetricExporter::builder()
                .with_temporality(opentelemetry_sdk::metrics::Temporality::Delta)
                .with_tonic()
                .build()
                .expect("Failed to initialize metric exporter"),
        )
        .build();
    global::set_meter_provider(meter_provider.clone());

    meter_provider
}
```

### ロガープロバイダーの初期化 {#initializing-logger-provider}

ログについては、配送サービスは Tracing を使用しているため、tracing クレートから OpenTelemetry へログをブリッジするために `OpenTelemetryTracingBridge` が使用されています。

```rust
fn init_logger_provider() {
    let logger_provider = opentelemetry_sdk::logs::SdkLoggerProvider::builder()
        .with_resource(get_resource())
        .with_batch_exporter(
            opentelemetry_otlp::LogExporter::builder()
                .with_tonic()
                .build()
                .expect("Failed to initialize logger provider"),
        )
        .build();

    let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
    let filter_otel = EnvFilter::new("info");
    let otel_layer = otel_layer.with_filter(filter_otel);

    tracing_subscriber::registry().with(otel_layer).init();
}
```

### 計装の初期化 {#instrumentation-initialization}

トレース、メトリクス、ログのプロバイダーを初期化する関数を定義した後、パブリック関数 `init_otel()` が作成されます。

```rust
pub fn init_otel() -> Result<()> {
    init_logger_provider();
    init_tracer_provider();
    init_meter_provider();
    Ok(())
}
```

この関数はすべての初期化関数を呼び出し、すべてが正常に開始された場合に `OK(())` を返します。

`init_otel()` 関数は `main` で呼び出されます。

```rust
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    match init_otel() {
        Ok(_) => {
            info!("Successfully configured OTel");
        }
        Err(err) => {
            panic!("Couldn't start OTel: {0}", err);
        }
    };

    [...]

}
```

### 計装の設定 {#instrumentation-configuration}

プロバイダーの設定と初期化が完了したため、配送サービスはサーバーサイドおよびクライアントサイドの設定中にアプリケーションを計装するために [`opentelemetry-instrumentation-actix-web` クレート](https://crates.io/crates/opentelemetry-instrumentation-actix-web)を使用します。

#### サーバーサイド {#server-side}

サーバーは `RequestTracing` と `RequestMetrics` でラップされ、リクエストを受信した際にトレースとメトリクスが自動的に作成されます。

```rust
HttpServer::new(|| {
    App::new()
        .wrap(RequestTracing::new())
        .wrap(RequestMetrics::default())
        .service(get_quote)
        .service(ship_order)
})
```

#### クライアントサイド {#client-side}

別のサービスにリクエストを送信する際、`trace_request()` が呼び出しに追加されます。

```rust
let mut response = client
    .post(quote_service_addr)
    .trace_request()
    .send_json(&reqbody)
    .await
    .map_err(|err| anyhow::anyhow!("Failed to call quote service: {err}"))?;
```

### 手動計装 {#manual-instrumentation}

`opentelemetry-instrumentation-actix-web` クレートを使用すると、前のセクションで説明したコマンドを追加することで、サーバーサイドとクライアントサイドの計装が可能になります。

デモでは、自動的に作成されたスパンを手動で拡張する方法と、アプリケーションで手動のメトリクスを作成する方法も紹介しています。

#### 手動スパン {#manual-spans}

次のスニペットでは、現在のアクティブなスパンにスパンイベントとスパン属性を追加して拡張しています。

```rust
Ok(get_active_span(|span| {
    let q = create_quote_from_float(f);
    span.add_event(
        "Received Quote".to_string(),
        vec![KeyValue::new("app.shipping.cost.total", format!("{}", q))],
    );
    span.set_attribute(KeyValue::new("app.shipping.cost.total", format!("{}", q)));
    q
}))
```

#### 手動メトリクス {#manual-metrics}

配送リクエストに含まれるアイテム数をカウントするためのカスタムメトリクスカウンターが作成されます。

```rust
let meter = global::meter("otel_demo.shipping.quote");
let counter = meter.u64_counter("app.shipping.items_count").build();
counter.add(count as u64, &[]);
```

### ログ {#logs}

配送サービスはログインターフェイスとして Tracing を使用しているため、Tracing のログを OpenTelemetry のログにブリッジするために `opentelemetry-appender-tracing` クレートを使用しています。

アペンダーは[ロガープロバイダーの初期化](#initializing-logger-provider)時に、次の 2 行ですでに設定されています。

```rust
let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
tracing_subscriber::registry().with(otel_layer).init();
```

これにより、通常どおり Tracing を使用できます。
たとえば次のようになります。

```rust
info!(
    name = "SendingQuoteValue",
    quote.dollars = quote.dollars,
    quote.cents = quote.cents,
    message = "Sending Quote"
);
```

`opentelemetry-appender-tracing` クレートがログエントリに OpenTelemetry のコンテキストを追加し、最終的にエクスポートされたログには設定されたすべてのリソース属性と `TraceContext` 情報が含まれます。
