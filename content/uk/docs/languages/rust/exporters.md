---
title: Експортери
weight: 50
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
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

fn init_tracer_provider() {
    let exporter = SpanExporter::builder()
        .with_tonic()
        .build()
        .expect("Failed to create span exporter");
    let provider = SdkTracerProvider::builder()
        .with_resource(Resource::builder().with_service_name("dice_server").build())
        .with_batch_exporter(exporter)
        .build();
    global::set_text_map_propagator(TraceContextPropagator::new());
    global::set_tracer_provider(provider);
}
```

Щоб швидко спробувати `OTLPTraceExporter`, ви можете запустити Jaeger у контейнері Docker:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

Робіть запити на [http://localhost:8080/rolldice](http://localhost:8080/rolldice) і перевіряйте трейси на Jaeger на [http://localhost:16686](http://localhost:16686)
