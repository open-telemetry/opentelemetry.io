---
title: Експортери
weight: 50
cSpell:ignore: chrono millis ostream
---

{{% uk/docs/languages/exporters/intro rust %}}

## Точка доступу OTLP {#otlp-endpoint}

Щоб відправити дані трасування до точки доступу OTLP (наприклад, до [collector](/docs/collector) або Jaeger), вам потрібно використовувати crate exporter, такий як
[opentelemetry-otlp](https://crates.io/crates/opentelemetry-otlp):

```toml
[dependencies]
opentelemetry-otlp = { version = "{{% version-from-registry exporter-rust-otlp %}}", features = ["default"] }
```

Далі, налаштуйте експортер для вказівки на точку доступу OTLP. Наприклад, ви можете оновити `init_tracer` у `dice_server.rs` з [Початку роботи](../getting-started/) наступним чином:

```rust
fn init_tracer() {
    // ...existing code...
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
