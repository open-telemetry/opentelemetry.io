---
title: Getting Started
weight: 10
default_lang_commit: a790e3cf91025305c683047b181120ab6bbae3de
# prettier-ignore
cSpell:ignore: ctrl_c eprintln LogExporter MetricExporter OnceLock rolldice SdkLoggerProvider SdkMeterProvider SdkTracerProvider SpanExporter tokio tracing
---

このページでは、Rust で OpenTelemetry を使い始める方法を紹介します。

シンプルな Rust アプリケーションを計装し、[トレース][traces]、[メトリクス][metrics]、[ログ][logs] がコンソールに出力されるようにする方法を学びます。

## 前提条件 {#prerequisites}

ローカル環境に以下がインストールされていることを確認してください。

- [Rust](https://www.rust-lang.org/)
- [Cargo](https://doc.rust-lang.org/cargo/)

## アプリケーション例 {#example-application}

以下の例では、基本的な [hyper](https://hyper.rs/) アプリケーションを使用します。
hyper を使用していなくても問題ありません。OpenTelemetry Rust は、Actix Web や Tide などの他の HTTP 実装でも使用できます。
サポートされているフレームワーク向けのライブラリの完全な一覧については、[レジストリ](/ecosystem/registry/?component=instrumentation&language=rust)を参照してください。

より高度な例については、[例](/docs/languages/rust/examples/)を参照してください。

### 依存関係 {#dependencies}

まず、新しいディレクトリで `cargo new dice_server` を使って実行ファイルを作成し、`Cargo.toml` ファイルに以下の内容を追加します。

```toml
[package]
name = "dice_server"
version = "0.1.0"
edition = "2021"

[dependencies]
hyper = { version = "1", features = ["full"] }
tokio = { version = "1", features = ["full"] }
http-body-util = "0.1"
hyper-util = { version = "0.1", features = ["full"] }
rand = "0.9.0"
```

### HTTP サーバーを作成して起動する {#create-and-launch-an-http-server}

`main.rs` を以下のように変更します。

```rust
use std::convert::Infallible;
use std::net::SocketAddr;

use http_body_util::Full;
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::Method;
use hyper::{Request, Response};
use hyper_util::rt::TokioIo;
use rand::Rng;
use tokio::net::TcpListener;

async fn roll_dice(_: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    let random_number = rand::rng().random_range(1..=6);
    Ok(Response::new(Full::new(Bytes::from(
        random_number.to_string(),
    ))))
}

async fn handle(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    match (req.method(), req.uri().path()) {
        (&Method::GET, "/rolldice") => roll_dice(req).await,
        _ => Ok(Response::builder()
            .status(404)
            .body(Full::new(Bytes::from("Not Found")))
            .unwrap()),
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));

    let listener = TcpListener::bind(addr).await?;

    loop {
        let (stream, _) = listener.accept().await?;

        let io = TokioIo::new(stream);

        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(io, service_fn(handle))
                .await
            {
                eprintln!("Error serving connection: {:?}", err);
            }
        });
    }
}
```

次のコマンドでアプリケーションをビルドして実行し、Web ブラウザで <http://localhost:8080/rolldice> を開いて動作していることを確認します。

```console
$ cargo run
...
Listening on 127.0.0.1:8080
```

## 計装 {#instrumentation}

ここでは、サンプルアプリに OpenTelemetry の計装を追加する方法を示します。
自分のアプリケーションを使用している場合も、それに沿って進められます。コードは多少異なるかもしれません。

### 依存関係を追加する {#add-dependencies}

OpenTelemetry Rust SDK の [`opentelemetry`](https://crates.io/crates/opentelemetry)、OpenTelemetry の Stdout エクスポーターである [`opentelemetry-stdout`](https://crates.io/crates/opentelemetry-stdout)、そしてログ用のブリッジである [`opentelemetry-appender-tracing`](https://crates.io/crates/opentelemetry-appender-tracing) の依存関係を `Cargo.toml` に追加します。

```toml
opentelemetry = { version = "{{% version-from-registry otel-rust %}}", features = ["metrics"] }
opentelemetry_sdk = { version = "{{% version-from-registry otel-rust-sdk %}}", features = ["trace", "metrics", "logs"] }
opentelemetry-stdout = { version = "{{% version-from-registry exporter-rust-stdout %}}", features = ["trace", "metrics", "logs"] }
opentelemetry-appender-tracing = "{{% version-from-registry otel-rust %}}"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["registry", "env-filter"] }
```

### 計装済みの完全なアプリケーション {#complete-instrumented-application}

`main.rs` を以下の完全に計装されたバージョンに置き換えます。
以下のセクションでは、各シグナルが何を追加するのかを説明します。

```rust
use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::OnceLock;

use http_body_util::Full;
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::Method;
use hyper::{Request, Response};
use hyper_util::rt::TokioIo;
use opentelemetry::global::{self, BoxedTracer};
use opentelemetry::trace::{Span, SpanKind, Status, Tracer};
use opentelemetry::KeyValue;
use opentelemetry_appender_tracing::layer::OpenTelemetryTracingBridge;
use opentelemetry_sdk::logs::SdkLoggerProvider;
use opentelemetry_sdk::metrics::SdkMeterProvider;
use opentelemetry_sdk::trace::SdkTracerProvider;
use opentelemetry_stdout::{LogExporter, MetricExporter, SpanExporter};
use rand::Rng;
use tokio::net::TcpListener;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

// --- Metrics: counter stored once for reuse across requests ---
static ROLL_COUNTER: OnceLock<opentelemetry::metrics::Counter<u64>> = OnceLock::new();

fn get_roll_counter() -> &'static opentelemetry::metrics::Counter<u64> {
    ROLL_COUNTER.get_or_init(|| {
        global::meter("dice_server")
            .u64_counter("dice.rolls")
            .with_description("The number of rolls by roll value")
            .build()
    })
}

// --- Application handlers ---
async fn roll_dice(_: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    let random_number = rand::rng().random_range(1..=6);

    // Metrics: record each roll
    get_roll_counter().add(1, &[KeyValue::new("roll.value", random_number as i64)]);

    // Logs: emit a structured log event via the tracing bridge
    tracing::info!(name: "roll_dice", roll.value = random_number, message = "Player rolled the dice");

    Ok(Response::new(Full::new(Bytes::from(
        random_number.to_string(),
    ))))
}

async fn handle(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    // Traces: create a server span for each incoming request
    let tracer = get_tracer();
    let mut span = tracer
        .span_builder(format!("{} {}", req.method(), req.uri().path()))
        .with_kind(SpanKind::Server)
        .start(tracer);

    match (req.method(), req.uri().path()) {
        (&Method::GET, "/rolldice") => roll_dice(req).await,
        _ => {
            span.set_status(Status::Ok);
            Ok(Response::builder()
                .status(404)
                .body(Full::new(Bytes::from("Not Found")))
                .unwrap())
        }
    }
}

// --- Traces: global tracer accessor ---
fn get_tracer() -> &'static BoxedTracer {
    static TRACER: OnceLock<BoxedTracer> = OnceLock::new();
    TRACER.get_or_init(|| global::tracer("dice_server"))
}

// --- Provider initialization ---
fn init_tracer_provider() -> SdkTracerProvider {
    let provider = SdkTracerProvider::builder()
        .with_simple_exporter(SpanExporter::default())
        .build();
    global::set_tracer_provider(provider.clone());
    provider
}

fn init_meter_provider() -> SdkMeterProvider {
    let provider = SdkMeterProvider::builder()
        .with_periodic_exporter(MetricExporter::default())
        .build();
    global::set_meter_provider(provider.clone());
    provider
}

fn init_logger_provider() -> SdkLoggerProvider {
    SdkLoggerProvider::builder()
        .with_simple_exporter(LogExporter::default())
        .build()
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));

    // Initialize providers and hold on to them for shutdown
    let tracer_provider = init_tracer_provider();
    let meter_provider = init_meter_provider();
    let logger_provider = init_logger_provider();

    // Logs: wire the tracing bridge so tracing::info! etc. go to OTel
    let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
    tracing_subscriber::registry()
        .with(otel_layer)
        .init();

    let listener = TcpListener::bind(addr).await?;
    tracing::info!("Listening on {addr}");

    loop {
        tokio::select! {
            Ok((stream, _)) = listener.accept() => {
                let io = TokioIo::new(stream);
                tokio::task::spawn(async move {
                    if let Err(err) = http1::Builder::new()
                        .serve_connection(io, service_fn(handle))
                        .await
                    {
                        eprintln!("Error serving connection: {:?}", err);
                    }
                });
            }
            _ = tokio::signal::ctrl_c() => {
                break;
            }
        }
    }

    // Flush and shutdown all providers before exit
    if let Err(err) = tracer_provider.shutdown() {
        eprintln!("Error shutting down tracer provider: {err:?}");
    }
    if let Err(err) = meter_provider.shutdown() {
        eprintln!("Error shutting down meter provider: {err:?}");
    }
    if let Err(err) = logger_provider.shutdown() {
        eprintln!("Error shutting down logger provider: {err:?}");
    }

    Ok(())
}
```

サーバーを起動します。

```sh
$ cargo run
...
Listening on 127.0.0.1:8080
```

### トレース {#traces}

トレースは `handle()` で追加されます。
受信した HTTP リクエストごとに、グローバルプロバイダーから取得した `Tracer` を使って **サーバースパン** が作成されます。

```rust
let mut span = tracer
    .span_builder(format!("{} {}", req.method(), req.uri().path()))
    .with_kind(SpanKind::Server)
    .start(tracer);
```

`init_tracer_provider()` は stdout エクスポーターを備えた `SdkTracerProvider` を構築し、グローバルに設定したうえで、終了時に `main()` が `.shutdown()` を呼び出せるようにそれを返します。

<http://localhost:8080/rolldice> にリクエストを送信すると、コンソールにスパンが出力されます。

<details>
<summary>出力例</summary>

```txt
Spans
Resource
         ->  telemetry.sdk.version=String(Static("0.28.0"))
         ->  service.name=String(Static("unknown_service"))
         ->  telemetry.sdk.language=String(Static("rust"))
         ->  telemetry.sdk.name=String(Static("opentelemetry"))
Span #0
        Instrumentation Scope
                Name         : "dice_server"

        Name        : GET /rolldice
        TraceId     : 9f03de7cf14780bd54b95d7095332107
        SpanId      : 9faed88b3f9ed699
        TraceFlags  : TraceFlags(1)
        ParentSpanId: 0000000000000000
        Kind        : Server
        Start time: 2025-03-11 00:47:26.687497
        End time: 2025-03-11 00:47:26.687653
        Status: Unset
```

</details>

### メトリクス {#metrics}

`dice.rolls` という名前の `u64_counter` が（`OnceLock` を介して）一度だけ作成され、`roll_dice()` の中でインクリメントされます。

```rust
get_roll_counter().add(1, &[KeyValue::new("roll.value", random_number as i64)]);
```

`init_meter_provider()` は定期的な stdout エクスポーターを備えた `SdkMeterProvider` を構築します。
しばらくすると、カウンターが出力されるのが確認できます。

<details>
<summary>出力例</summary>

```txt
Metrics
Resource
         ->  service.name=String(Static("unknown_service"))
         ->  telemetry.sdk.language=String(Static("rust"))
         ->  telemetry.sdk.name=String(Static("opentelemetry"))
         ->  telemetry.sdk.version=String(Static("0.28.0"))
Metric #0
        Instrumentation Scope
                Name         : "dice_server"

        Name        : dice.rolls
        Description : The number of rolls by roll value
        Unit        :
        Type        : Sum
              Value: 1
              Attributes:
                   ->  roll.value: Int(3)
              Value: 2
              Attributes:
                   ->  roll.value: Int(5)
```

</details>

### ログ {#logs}

OpenTelemetry Rust は、独自のエンドユーザー向けロギング API を提供していません。
そのかわりに、既存の Rust のロギングフレームワークを OpenTelemetry のデータモデルへとブリッジします。
推奨されるアプローチでは、[`tracing`](https://crates.io/crates/tracing) クレートを [`opentelemetry-appender-tracing`](https://crates.io/crates/opentelemetry-appender-tracing) ブリッジと組み合わせて使用します。

`init_logger_provider()` は stdout エクスポーターを備えた `SdkLoggerProvider` を構築します。
`main()` の中で `OpenTelemetryTracingBridge` が `tracing_subscriber` のスタックに組み込まれ、`tracing::info!`（やその他のレベル）の呼び出しがすべて OTel のログパイプラインへ転送されます。

```rust
let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
tracing_subscriber::registry()
    .with(otel_layer)
    .init();
```

`roll_dice()` の中では、構造化されたログイベントが出力されます。

```rust
tracing::info!(name: "roll_dice", roll.value = random_number, message = "Player rolled the dice");
```

スパンやメトリクスとともに、ログレコードがコンソールに表示されるようになります。

<details>
<summary>出力例</summary>

```txt
Logs
Resource
         ->  service.name=String(Static("unknown_service"))
         ->  telemetry.sdk.language=String(Static("rust"))
         ->  telemetry.sdk.name=String(Static("opentelemetry"))
         ->  telemetry.sdk.version=String(Static("0.28.0"))
Log #0
        Instrumentation Scope
                Name         : "dice_server"

        Timestamp   : 2025-03-11 00:47:26.687497
        Severity    : Info
        Body        : Player rolled the dice
        Attributes:
             ->  roll.value: Int(3)
```

</details>

## 次のステップ {#what-next}

さらに学ぶには、以下を参照してください。

- [API & SDK](/docs/languages/rust/api/) リファレンスを参照する
- 他の[例](/docs/languages/rust/examples/)を試す

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
