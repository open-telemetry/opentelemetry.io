---
title: Початок роботи
weight: 10
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

Для початку створіть файл `Cargo.toml` у новій теці та додайте наступний вміст:

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
hyper = { version = "0.14", features = ["full"] }
tokio = { version = "1.29", features = ["full"] }
rand = { version = "0.8" }
```

### Створення та запуск HTTP-сервера {#create-and-launch-an-http-server}

У тій самій теці створіть файл з назвою `dice_server.rs` і додайте наступний код до файлу:

```rust
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server, Method, StatusCode};
use rand::Rng;
use std::{convert::Infallible, net::SocketAddr};

async fn handle(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let mut response = Response::new(Body::empty());

    match (req.method(), req.uri().path()) {
        (&Method::GET, "/rolldice") => {
            let random_number = rand::thread_rng().gen_range(1..7);
            *response.body_mut() = Body::from(random_number.to_string());
        }
        _ => {
            *response.status_mut() = StatusCode::NOT_FOUND;
        }
    };

    Ok(response)
}

#[tokio::main]
async fn main() {
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));

    let make_svc = make_service_fn(|_conn| async { Ok::<_, Infallible>(service_fn(handle)) });

    let server = Server::bind(&addr).serve(make_svc);

    println!("Listening on {addr}");
    if let Err(e) = server.await {
        eprintln!("server error: {e}");
    }
}
```

Зберіть і запустіть застосунок за допомогою наступної команди, потім відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```console
$ cargo run --bin dice_server
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

Оновіть файл `dice_server.rs` кодом для ініціалізації трасера та для виведення відрізків при виклику функції `handle`:

```rust
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Method, Request, Response, Server, StatusCode};
use rand::Rng;
use std::{convert::Infallible, net::SocketAddr};
use opentelemetry::global::ObjectSafeSpan;
use opentelemetry::trace::{SpanKind, Status};
use opentelemetry::{global, trace::Tracer};
use opentelemetry_sdk::propagation::TraceContextPropagator;
use opentelemetry_sdk::trace::TracerProvider;
use opentelemetry_stdout::SpanExporter;

async fn handle(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let mut response = Response::new(Body::empty());

    let tracer = global::tracer("dice_server");

    let mut span = tracer
        .span_builder(format!("{} {}", req.method(), req.uri().path()))
        .with_kind(SpanKind::Server)
        .start(&tracer);

    match (req.method(), req.uri().path()) {
        (&Method::GET, "/rolldice") => {
            let random_number = rand::thread_rng().gen_range(1..7);
            *response.body_mut() = Body::from(random_number.to_string());
            span.set_status(Status::Ok);
        }
        _ => {
            *response.status_mut() = StatusCode::NOT_FOUND;
            span.set_status(Status::error("Not Found"));
        }
    };

    Ok(response)
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

    let make_svc = make_service_fn(|_conn| async { Ok::<_, Infallible>(service_fn(handle)) });

    let server =
        Server::bind(&addr).serve(make_svc);

    println!("Listening on {addr}");
    if let Err(e) = server.await {
        eprintln!("server error: {e}");
    }
}
```

Запустіть сервер знову:

```sh
$ cargo run --bin dice_server
...
Listening on 127.0.0.1:8080
```

Коли ви відправите запит на сервер за адресою <http://localhost:8080/rolldice>, ви побачите, що відрізок виводиться в консоль (вивід відформатовано для зручності):

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

## Що далі? {#what-next}

Для більшого:

- Ознайомтеся з [API та SDK](/docs/languages/rust/api/) довідкою
- Спробуйте інші [приклади](/docs/languages/rust/examples/).

[трейси]: /docs/concepts/signals/traces/
