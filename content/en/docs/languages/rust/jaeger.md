---
title: Export to Jaeger
linkTitle: Export to Jaeger
description: Learn how to export traces to Jaeger with OpenTelemetry Rust
weight: 20
# prettier-ignore
cSpell:ignore: Gantt OnceLock SdkTracerProvider SpanExporter tokio tonic
---

This guide shows you how to instrument a Rust application with OpenTelemetry
[traces][] and export them to [Jaeger](https://www.jaegertracing.io/) for
visualization and analysis.

If you are new to OpenTelemetry in Rust, start with
[Getting Started](/docs/languages/rust/getting-started/), which emits telemetry
to the console. This guide builds on those concepts by sending traces to a real
backend over [OTLP](/docs/specs/otlp/).

## Prerequisites

Ensure that you have the following installed locally:

- [Rust](https://www.rust-lang.org/) and
  [Cargo](https://doc.rust-lang.org/cargo/)
- [Docker](https://docs.docker.com/get-docker/), to run Jaeger locally

## Creating the application

Create a new executable and change into the new directory:

```shell
cargo new jaeger-demo
cd jaeger-demo
```

Add the OpenTelemetry dependencies to your `Cargo.toml`:

```toml
[dependencies]
opentelemetry = "{{% version-from-registry otel-rust %}}"
opentelemetry_sdk = { version = "{{% version-from-registry otel-rust-sdk %}}", features = ["trace"] }
opentelemetry-otlp = { version = "{{% version-from-registry exporter-rust-otlp %}}", features = ["grpc-tonic"] }
tokio = { version = "1", features = ["full"] }
```

Replace the contents of `src/main.rs` with the following:

```rust
use opentelemetry::global;
use opentelemetry::trace::{TraceContextExt, Tracer};
use opentelemetry::KeyValue;
use opentelemetry_otlp::SpanExporter;
use opentelemetry_sdk::trace::SdkTracerProvider;
use opentelemetry_sdk::Resource;
use std::sync::OnceLock;
use std::time::Duration;

fn get_resource() -> Resource {
    static RESOURCE: OnceLock<Resource> = OnceLock::new();
    RESOURCE
        .get_or_init(|| Resource::builder().with_service_name("DemoApp").build())
        .clone()
}

fn init_traces() -> SdkTracerProvider {
    let exporter = SpanExporter::builder()
        .with_tonic()
        .build()
        .expect("Failed to create span exporter");
    SdkTracerProvider::builder()
        .with_resource(get_resource())
        .with_batch_exporter(exporter)
        .build()
}

#[tokio::main]
async fn main() {
    let tracer_provider = init_traces();
    global::set_tracer_provider(tracer_provider.clone());
    let tracer = global::tracer("my-application");

    tracer.in_span("Main operation", |cx| {
        let span = cx.span();
        span.set_attribute(KeyValue::new("operation.name", "demo"));

        // Simulate some work
        std::thread::sleep(Duration::from_millis(200));

        tracer.in_span("Sub operation", |cx| {
            let span = cx.span();
            span.set_attribute(KeyValue::new("operation.type", "processing"));

            // Simulate sub-operation work
            std::thread::sleep(Duration::from_millis(50));

            span.add_event("Processing completed", vec![]);
        });
    });

    tracer_provider
        .shutdown()
        .expect("Failed to shutdown tracer provider");
}
```

## Starting Jaeger

Jaeger natively supports OTLP for receiving trace data. Start it in a Docker
container, exposing the web UI on port `16686` and the OTLP gRPC endpoint on
port `4317`:

```shell
docker run --rm --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  jaegertracing/all-in-one:latest
```

Verify that the Jaeger UI is available at
[http://localhost:16686](http://localhost:16686).

## Running the application

With Jaeger running, run the application:

```shell
cargo run
```

By default, the OTLP exporter sends data to `http://localhost:4317`, which is
the OTLP endpoint exposed by Jaeger. The application:

1. Initializes a `TracerProvider` with the OTLP exporter.
2. Creates a parent span (`Main operation`) and a child span (`Sub operation`).
3. Flushes the spans to Jaeger on shutdown.

## Viewing traces in Jaeger

1. Open [http://localhost:16686](http://localhost:16686) and refresh.
2. Select `DemoApp` from the **Service** dropdown.
3. Click **Find Traces**.

Click a trace to open the trace details view, which shows the span hierarchy and
timing as a Gantt chart. You'll see the `Main operation` span containing the
`Sub operation` span, along with their attributes and events.

## Understanding the code

### Resource

A [resource](/docs/concepts/resources/) identifies the entity producing
telemetry. Here it sets the service name, which appears as `DemoApp` in the
Jaeger **Service** dropdown:

```rust
Resource::builder().with_service_name("DemoApp").build()
```

### Exporter and provider

`init_traces()` builds an OTLP span exporter using the gRPC (`tonic`) transport
and registers it with an `SdkTracerProvider` that uses a batch span processor:

```rust
let exporter = SpanExporter::builder()
    .with_tonic()
    .build()
    .expect("Failed to create span exporter");
SdkTracerProvider::builder()
    .with_resource(get_resource())
    .with_batch_exporter(exporter)
    .build()
```

Calling `global::set_tracer_provider(...)` makes the provider available
application-wide through `global::tracer(...)`.

### Spans

Spans are created with the `Tracer`. Nesting `in_span` calls establishes the
parent/child relationship that Jaeger renders as a trace:

```rust
tracer.in_span("Main operation", |cx| {
    // ...
    tracer.in_span("Sub operation", |cx| {
        // ...
    });
});
```

### Shutdown

Because the batch processor exports spans asynchronously, call `shutdown()`
before the program exits to flush any pending spans to Jaeger:

```rust
tracer_provider.shutdown().expect("Failed to shutdown tracer provider");
```

## Cleanup

Stop the Jaeger container when you're done:

```shell
docker stop jaeger
```

## What next?

- Configure the [exporters](/docs/languages/rust/exporters/) for other backends.
- Send traces through the [OpenTelemetry Collector](/docs/collector/) instead of
  directly to a backend.
- Consult the [API & SDK](/docs/languages/rust/api/) reference.

[traces]: /docs/concepts/signals/traces/
