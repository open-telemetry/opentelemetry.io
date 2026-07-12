---
title: Експортери
weight: 50
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
сSpell:ignore: Ганта
---

{{% docs/languages/exporters/intro %}}

## Точка доступу OTLP {#otlp-endpoint}

Щоб надіслати дані трасування до точки доступу OTLP (наприклад, до [collector](/docs/collector) або Jaeger), вам потрібно використовувати crate exporter, такий як
[opentelemetry-otlp](https://crates.io/crates/opentelemetry-otlp):

Наприклад, ви можете оновити сервер кубиків з [Початку роботи](../getting-started/), додавши нову залежність:

```toml
[dependencies]
opentelemetry-otlp = { version = "{{% version-from-registry exporter-rust-otlp %}}", features = ["grpc-tonic"] }
```

Далі, оновіть `init_tracer_provider` у `dice_server.rs`, щоб налаштувати експортер на вказівку на точку доступу до OTLP:

```rust
use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::OnceLock;

use http_body_util::Full;
use hyper::{Method, Request, Response, body::Bytes, server::conn::http1, service::service_fn};
use hyper_util::rt::TokioIo;
use opentelemetry::global::{self, BoxedTracer};
use opentelemetry::trace::{Span, SpanKind, Status, Tracer};
use opentelemetry_otlp::SpanExporter;
use opentelemetry_sdk::{Resource, propagation::TraceContextPropagator, trace::SdkTracerProvider};
use rand::Rng;
use tokio::net::TcpListener;

// ...

fn init_tracer_provider() -> SdkTracerProvider {
    let exporter = SpanExporter::builder()
        .with_tonic()
        .build()
        .expect("Failed to create span exporter");
    let provider = SdkTracerProvider::builder()
        .with_resource(Resource::builder().with_service_name("dice_server").build())
        .with_batch_exporter(exporter)
        .build();
    global::set_text_map_propagator(TraceContextPropagator::new());
    global::set_tracer_provider(provider.clone());
    provider
}
```

Щоб швидко спробувати експортер OTLP, ви можете запустити Jaeger у контейнері Docker. Jaeger нативно підтримує OTLP, тому вам потрібно лише відкрити веб-інтерфейс (`16686`) та точку доступу OTLP gRPC (`4317`):

```shell
docker run -d --rm --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  jaegertracing/all-in-one:latest
```

Зазвичай експортер OTLP надсилає дані на `http://localhost:4317`, що відповідає точці доступу OTLP gRPC, відкритій Jaeger вище, тому додаткова конфігурація точки доступу не потрібна.

Робіть запити на [http://localhost:8080/rolldice](http://localhost:8080/rolldice), потім перегляньте трейси в Jaeger:

1. Відкрийте [http://localhost:16686](http://localhost:16686) та оновіть сторінку.
2. Виберіть `dice_server` зі списку **Service**.
3. Натисніть **Find Traces**.

Натисніть на трейс, щоб відкрити детальний перегляд, який показує ієрархію відрізків та час у вигляді діаграми Ганта.

Коли закінчите, зупиніть контейнер Jaeger:

```shell
docker stop jaeger
```
