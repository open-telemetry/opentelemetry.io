---
title: Shipping Service
linkTitle: Shipping
aliases: [shippingservice]
cSpell:ignore: sdktrace
---

This service is responsible for providing shipping information including pricing
and tracking information, when requested from Checkout Service.

Shipping service is built with [Actix Web](https://actix.rs/),
[Tracing](https://tracing.rs/) for logs and OpenTelemetry Libraries. All other
sub-dependencies are included in `Cargo.toml`.

Depending on your framework and runtime, you may consider consulting
[Rust docs](/docs/languages/rust/) to supplement. You'll find examples of async
and sync spans in quote requests and tracking IDs respectively.

[Shipping service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/shipping/)

## Instrumentation

The OpenTelemetry SDK is configured in the `telemetry_conf` file.

A function `get_resource()` is implemented to create a Resource using the
default Resource Detectors plus `OS` and `Process` detectors:

```rust
fn get_resource() -> Resource {
    let detectors: Vec<Box<dyn ResourceDetector>> = vec![
        Box::new(OsResourceDetector),
        Box::new(ProcessResourceDetector),
    ];

    Resource::builder().with_detectors(&detectors).build()
}
```

With `get_resource()` in place, the function can be called multiple times across
all providers initialization.

### Initializing Tracer Provider

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

### Initializing Meter Provider

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

### Initializing Logger Provider

For logs, as the Shipping service uses Tracing, the `OpenTelemetryTracingBridge`
is used to bridge logs from the tracing crate to OpenTelemetry.

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

### Instrumentation Initialization

After defining the functions to initialize the providers for Traces, Metrics and
Logs, a public function `init_otel()` is create:

```rust
pub fn init_otel() -> Result<()> {
    init_logger_provider();
    init_tracer_provider();
    init_meter_provider();
    Ok(())
}
```

This function basically calls all initializers and returns `OK(())` if
everything starts properly.

The `init_otel()` function is then called on `main`:

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

### Instrumentation Configuration

Now that the providers are configured and initialized, when configuring server
side and client side, Shipping takes advantage of the
[`opentelemetry-instrumentation-actix-web` crate](https://crates.io/crates/opentelemetry-instrumentation-actix-web)
to instrument the application.

#### Server Side

To have Traces and Metrics automatically created when receiving requests, it is
only required to wrap the server with `RequestTracing` and `RequestMetrics`:

```rust
HttpServer::new(|| {
    App::new()
        .wrap(RequestTracing::new())
        .wrap(RequestMetrics::default())
        .service(get_quote)
        .service(ship_order)
})
```

#### Client Side

When making a request to another service, it is only required to add
`trace_request()` to the call:

```rust
let mut response = client
    .post(quote_service_addr)
    .trace_request()
    .send_json(&reqbody)
    .await
    .map_err(|err| anyhow::anyhow!("Failed to call quote service: {err}"))?;
```

### Manual Instrumentation

The `opentelemetry-instrumentation-actix-web` crate allows us to instrument
server and client side by simply adding the commands mentioned in the previous
section.

In the Demo we also demonstrate how to manually enhance automatically created
spans and, hot to create manual metrics on the application.

#### Manual Spans

In the following snippet, the current active span is enhanced with a span event
and a span attribute:

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

#### Manual Metrics

A custom metric counter is created to count how many items are in the shipping
request:

```rust
let meter = global::meter("otel_demo.shipping.quote");
let counter = meter.u64_counter("app.shipping.items_count").build();
counter.add(count as u64, &[]);
```

### Logs

As the Shipping service is using Tracing as log interface it takes advantage of
the `opentelemetry-appender-tracing` crate to bridge Tracing logs into
OpenTelemetry logs.

The appender was already configured during the
[initialization of the logger provider](#initializing-logger-provider), with the
following two lines:

```rust
let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
tracing_subscriber::registry().with(otel_layer).init();
```

With that in place, we can simply use Tracing as we would normally, eg:

```rust
info!(
    name = "SendingQuoteValue",
    quote.dollars = quote.dollars,
    quote.cents = quote.cents,
    message = "Sending Quote"
);
```

The `opentelemetry-appender-tracing` crate takes care of adding OpenTelemetry
context to the log entry, and the final exported log contains all resource
attributes configured and `TraceContext` information.
