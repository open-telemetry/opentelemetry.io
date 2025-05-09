---
title: Getting Started
weight: 10
cSpell:ignore: eprintln println rolldice tokio
---

This page will show you how to get started with OpenTelemetry in Rust.

You will learn how you can instrument a simple Rust application, in such a way
that [traces][] are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally:

- [Rust](https://www.rust-lang.org/)
- [Cargo](https://doc.rust-lang.org/cargo/)

## Example Application

The following example uses a basic [hyper](https://hyper.rs/) application. If
you are not using hyper, that's OK — you can use OpenTelemetry Rust with other
HTTP implementations as well, such as Actix Web and Tide. For a complete list of
libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=rust).

For more elaborate examples, see [examples](/docs/languages/rust/examples/).

### Dependencies

To begin, create an executable using `cargo new dice_server` in a new directory
and add the following content to the `Cargo.toml` file:

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

### Create and launch an HTTP Server

Modify `main.rs` to the following:

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

Build and run the application with the following command, then open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```console
$ cargo run
...
Listening on 127.0.0.1:8080
```

## Instrumentation

To add OpenTelemetry to your application, update the `Cargo.toml` with the
dependencies for the OpenTelemetry Rust SDK
[`opentelemetry`](https://crates.io/crates/opentelemetry) and the OpenTelemetry
Stdout Exporter
[`opentelemetry-stdout`](https://crates.io/crates/opentelemetry-stdout):

```toml
opentelemetry = "{{% version-from-registry otel-rust %}}"
opentelemetry_sdk = "{{% version-from-registry otel-rust-sdk %}}"
opentelemetry-stdout = { version = "{{% version-from-registry exporter-rust-stdout %}}", features = ["trace"] }
```

Update the `main.rs` file with code to initialize a tracer and to emit spans
when the `handle` function is called:

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

Start your server again:

```sh
$ cargo run
...
Listening on 127.0.0.1:8080
```

When you send a request to the server at <http://localhost:8080/rolldice>,
you'll see a span being emitted to the console:

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

## What next?

For more:

- Consult the [API & SDK](/docs/languages/rust/api/) reference
- Try other [examples](/docs/languages/rust/examples/).

[traces]: /docs/concepts/signals/traces/
