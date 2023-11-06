---
title: Exporters
weight: 50
cSpell:ignore: chrono millis ostream
---

{{% docs/instrumentation/exporters-intro rust %}}

## OTLP endpoint

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to use an exporter crate, such as `opentelemetry_otlp`:

```toml
[dependencies]
opentelemetry-otlp = { version = "0.13", features = ["default"] }
```

Next, configure the exporter to point at an OTLP endpoint. For example you can
update `init_tracer` in `dice_server.rs` from the
[Getting Started](../getting-started/) like the following:

```rust
fn init_tracer() {
    match SpanExporter::new_tonic(ExportConfig::default(), TonicConfig::default()) {
        Ok(exporter) => {
            global::set_text_map_propagator(TraceContextPropagator::new());
            let provider = TracerProvider::builder()
                .with_simple_exporter(exporter)
                .build();
            global::set_tracer_provider(provider);
        },
        Err(why) => panic!("{:?}", why)
    }

}
```

To try out the `OTLPTraceExporter` quickly, you can run Jaeger in a docker
container:

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
