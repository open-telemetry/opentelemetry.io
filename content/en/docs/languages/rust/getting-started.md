---
title: Getting Started
cSpell:ignore: eprintln println rolldice tokio
weight: 10
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

To begin, create a file `Cargo.toml` in a new directory and add the following
content:

```toml
[package]
name = "dice_server"
version = "0.1.0"
edition = "2021"
publish = false

[[bin]]
name = "dice_server"
path = "dice_server.rs"
doc = false

[dependencies]
hyper = { version = "1.2", features = ["full"] }
hyper-util = { version = "0.1.3", features = ["tokio"] }
tokio = { version = "1.29", features = ["full"] }
rand = { version = "0.8" }
```

### Create and launch an HTTP Server

In that same folder, create a file called `dice_server.rs` and add the following
code to the file:

```rust
use hyper_util::rt::TokioIo;
use hyper::body::Incoming;
use hyper::http::{Request, Response, Result, Method, StatusCode};
use hyper::service::service_fn;
use rand::Rng;
use std::net::SocketAddr;
use tokio::net::TcpListener;

async fn handle(req: Request<Incoming>) -> Result<Response<String>> {
    match (req.method(), req.uri().path()) {
        (&Method::GET, "/rolldice") => {
            let random_number = rand::thread_rng().gen_range(1..7);
            Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "text/plain")
                .body(random_number.to_string())
        }
        _ => {
            Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body("Not Found".to_string())
        }
    }
}

#[tokio::main]
async fn main() {
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    let listener = TcpListener::bind(addr).await.expect("Failed to acquire 127.0.0.1:8080 - is it already in use?");
    println!("Listening on {addr}");
    loop {
        let (stream, _) = listener.accept().await.expect("Failed to accept connection.");
        let io = TokioIo::new(stream);
        tokio::spawn(async move {
            if let Err(err) = hyper::server::conn::http1::Builder::new()
                .serve_connection(io, service_fn(handle))
                .await
            {
                eprintln!("Error: {err}");
            }
        });
    }
}
```

Build and run the application with the following command, then open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```console
$ cargo run --bin dice_server
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
opentelemetry = { version = "{{% version-from-registry otel-rust %}}" }
opentelemetry_sdk = { version = "{{% version-from-registry otel-rust %}}" }
opentelemetry-stdout = { version = "{{% version-from-registry exporter-rust-stdout %}}", features = ["trace"] }
```

Update the `dice_server.rs` file with code to initialize a tracer and to emit
spans when the `handle` function is called:

```rust
use hyper_util::rt::TokioIo;
use hyper::body::Incoming;
use hyper::http::{Request, Response, Result, Method, StatusCode};
use hyper::service::service_fn;
use rand::Rng;
use std::net::SocketAddr;
use tokio::net::TcpListener;

use opentelemetry::global::ObjectSafeSpan;
use opentelemetry::trace::{SpanKind, Status};
use opentelemetry_sdk::{trace::TracerProvider, propagation::TraceContextPropagator};
use opentelemetry::{global, trace::Tracer};
use opentelemetry_stdout::SpanExporter;

async fn handle(req: Request<Incoming>) -> Result<Response<String>> {
    let tracer = global::tracer("dice_server");

    let mut span = tracer
        .span_builder(format!("{} {}", req.method(), req.uri().path()))
        .with_kind(SpanKind::Server)
        .start(&tracer);

    match (req.method(), req.uri().path()) {
        (&Method::GET, "/rolldice") => {
            let random_number = rand::thread_rng().gen_range(1..7);
            span.set_status(Status::Ok);
            Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "text/plain")
                .body(random_number.to_string())
        }
        _ => {
            span.set_status(Status::error("Not Found"));
            Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body("Not Found".to_string())
        }
    }
}

fn init_tracer() {
    global::set_text_map_propagator(TraceContextPropagator::new());
    let provider = TracerProvider::builder()
        .with_simple_exporter(SpanExporter::default())
        .build();
    global::set_tracer_provider(provider);
}

#[tokio::main]
async fn main() {
    init_tracer();
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    let listener = TcpListener::bind(addr).await.expect("Failed to acquire 127.0.0.1:8080 - is it already in use?");
    println!("Listening on {addr}");
    loop {
        let (stream, _) = listener.accept().await.expect("Failed to accept connection.");
        let io = TokioIo::new(stream);
        tokio::spawn(async move {
            if let Err(err) = hyper::server::conn::http1::Builder::new()
                .serve_connection(io, service_fn(handle))
                .await
            {
                eprintln!("Error: {err}");
            }
        });
    }
}
```

Start your server again:

```sh
$ cargo run --bin dice_server
...
Listening on 127.0.0.1:8080
```

When you send a request to the server at <http://localhost:8080/rolldice>,
you'll see a span being emitted to the console (output is pretty printed for
convenience):

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          {
            "key": "service.name",
            "value": {
              "stringValue": "unknown_service"
            }
          }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "dice_server"
          },
          "spans": [
            {
              "attributes": [],
              "droppedAttributesCount": 0,
              "droppedEventsCount": 0,
              "droppedLinksCount": 0,
              "endTimeUnixNano": 1691076354768034000,
              "kind": 2,
              "name": "GET /rolldice",
              "parentSpanId": "",
              "spanId": "27e1d7d8e44a63c5",
              "startTimeUnixNano": 1691076354768025000,
              "status": {
                "code": 2
              },
              "traceId": "adfe9d364ee19610adde517d722167ca"
            }
          ]
        }
      ]
    }
  ]
}
```

## What next?

For more:

- Consult the [API & SDK](/docs/languages/rust/api/) reference
- Try other [examples](/docs/languages/rust/examples/).

[traces]: /docs/concepts/signals/traces/
