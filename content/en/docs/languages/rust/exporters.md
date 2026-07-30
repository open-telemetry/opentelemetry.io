---
title: Exporters
weight: 50
---

{{% docs/languages/exporters/intro %}}

## OTLP endpoint

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to use an exporter crate, such as
[opentelemetry-otlp](https://crates.io/crates/opentelemetry-otlp):

For example, you can update the [Getting Started](../getting-started/) dice
server by adding the new dependency:

```toml
[dependencies]
opentelemetry-otlp = { version = "{{% version-from-registry exporter-rust-otlp %}}", features = ["grpc-tonic"] }
```

Next, update `init_tracer_provider` in `dice_server.rs` to configure the
exporter to point at an OTLP endpoint:

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

To try out the OTLP exporter quickly, you can run Jaeger in a docker container.
Jaeger natively supports OTLP, so you only need to expose the web UI (`16686`)
and the OTLP gRPC endpoint (`4317`):

```shell
docker run -d --rm --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  jaegertracing/jaeger:latest
```

By default, the OTLP exporter sends data to `http://localhost:4317`, which
matches the OTLP gRPC endpoint exposed by Jaeger above, so no additional
endpoint configuration is needed.

Make requests on
[http://localhost:8080/rolldice](http://localhost:8080/rolldice), then view the
traces in Jaeger:

1. Open [http://localhost:16686](http://localhost:16686) and refresh.
2. Select `dice_server` from the **Service** dropdown.
3. Click **Find Traces**.

Click a trace to open the trace details view, which shows the span hierarchy and
timing as a Gantt chart.

When you're done, stop the Jaeger container:

```shell
docker stop jaeger
```
