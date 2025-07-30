---
title: Початок роботи
weight: 10
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: eprintln println rolldice tokio
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry в Rust.

Ви дізнаєтесь, як можна інструментувати простий застосунок на Rust, таким чином, щоб [трейси][] виводилися в консоль.

## Передумови {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- [Rust](https://www.rust-lang.org/)
- [Cargo](https://doc.rust-lang.org/cargo/)

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [hyper](https://hyper.rs/). Якщо ви не використовуєте hyper, це не проблема, ви можете використовувати OpenTelemetry Rust з іншими HTTP-реалізаціями, такими як Actix Web і Tide. Для повного списку бібліотек для підтримуваних фреймворків, дивіться [реєстр](/ecosystem/registry/?component=instrumentation&language=rust).

Для складніших прикладів дивіться [приклади](/docs/languages/rust/examples/).

### Залежності {#dependencies}

Для початку створіть виконуваний файл за допомогою `cargo new dice_server` у новій теці і додайте наступний вміст до файлу `Cargo.toml`:

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

### Створення та запуск HTTP-сервера {#create-and-launch-an-http-server}

Змініть `main.rs` наступним чином:

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

Зберіть і запустіть застосунок за допомогою наступної команди, потім відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```console
$ cargo run
...
Listening on 127.0.0.1:8080
```

## Інструментування {#instrumentation}

Щоб додати OpenTelemetry до вашого застосунку, оновіть `Cargo.toml` з залежностями для OpenTelemetry Rust SDK [`opentelemetry`](https://crates.io/crates/opentelemetry) та OpenTelemetry
Stdout Exporter [`opentelemetry-stdout`](https://crates.io/crates/opentelemetry-stdout):

```toml
opentelemetry = "{{% version-from-registry otel-rust %}}"
opentelemetry_sdk = "{{% version-from-registry otel-rust-sdk %}}"
opentelemetry-stdout = { version = "{{% version-from-registry exporter-rust-stdout %}}", features = ["trace"] }
```

Оновіть файл `main.rs` кодом для ініціалізації трейсера та для виведення відрізків при виклику функції `handle`:

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
use opentelemetry_sdk::trace::SdkTracerProvider;
use opentelemetry_stdout::SpanExporter;
use rand::Rng;
use tokio::net::TcpListener;

async fn roll_dice(_: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    let random_number = rand::rng().random_range(1..=6);
    Ok(Response::new(Full::new(Bytes::from(
        random_number.to_string(),
    ))))
}

async fn handle(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
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

fn get_tracer() -> &'static BoxedTracer {
    static TRACER: OnceLock<BoxedTracer> = OnceLock::new();
    TRACER.get_or_init(|| global::tracer("dice_server"))
}

fn init_tracer_provider() {
    let provider = SdkTracerProvider::builder()
        .with_simple_exporter(SpanExporter::default())
        .build();
    global::set_tracer_provider(provider);
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));

    let listener = TcpListener::bind(addr).await?;
    init_tracer_provider();

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

Запустіть сервер знову:

```sh
$ cargo run
...
Listening on 127.0.0.1:8080
```

Коли ви надішлете запит на сервер за адресою <http://localhost:8080/rolldice>, ви побачите, що відрізок виводиться в консоль:

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

## Що далі? {#what-next}

Для більшого:

- Ознайомтеся з [API та SDK](/docs/languages/rust/api/) довідкою
- Спробуйте інші [приклади](/docs/languages/rust/examples/).

[трейси]: /docs/concepts/signals/traces/
