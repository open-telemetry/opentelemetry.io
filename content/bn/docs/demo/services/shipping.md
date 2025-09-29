---
title: শিপিং সেবা
linkTitle: শিপিং
aliases: [shippingservice]
default_lang_commit: f92688f04b7162bd5ab6dbf7578bfb9e5c4263b2
cSpell:ignore: sdktrace
---

এই সার্ভিসটি চেকআউট সার্ভিসের রিকোয়েস্টে শিপিং সংক্রান্ত তথ্য, যেমন মূল্য এবং ট্র্যাকিং তথ্য প্রদান করে।

শিপিং সার্ভিসটি তৈরি করা হয়েছে [Actix Web](https://actix.rs/) ব্যবহার করে। লগিংয়ের জন্য [Tracing](https://tracing.rs/) এবং OpenTelemetry লাইব্রেরি ব্যবহার করা হয়েছে। অন্যান্য সব সাব-ডিপেনডেন্সি `Cargo.toml` ফাইলে অন্তর্ভুক্ত রয়েছে।

আপনার ব্যবহৃত ফ্রেমওয়ার্ক এবং রানটাইম অনুযায়ী, সহায়তার জন্য [Rust docs](/docs/languages/rust/) দেখতে পারেন। সেখানে আপনি কোটা রিকোয়েস্টে async spans এবং ট্র্যাকিং আইডিতে sync spans এর উদাহরণ পাবেন।

[শিপিং সার্ভিস সোর্স](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/shipping/)

## ইন্সট্রুমেন্টেশন {#instrumentation}

OpenTelemetry SDK `telemetry_conf` ফাইলে কনফিগার করা হয়েছে।

`get_resource()` নামের একটি ফাংশন তৈরি করা হয়েছে, যা ডিফল্ট রিসোর্স ডিটেক্টরের সাথে `OS` এবং `Process` ডিটেক্টর ব্যবহার করে একটি রিসোর্স তৈরি করে।

```rust
fn get_resource() -> Resource {
    let detectors: Vec<Box<dyn ResourceDetector>> = vec![
        Box::new(OsResourceDetector),
        Box::new(ProcessResourceDetector),
    ];

    Resource::builder().with_detectors(&detectors).build()
}
```

`get_resource()` যুক্ত করার পর, ফাংশনটি সব ধরনের প্রোভাইডার ইনিশিয়ালাইজেশনের সময় একাধিকবার কল করা যেতে পারে।

### ট্রেসার প্রোভাইডার ইনিশিয়ালাইজেশন {#initializing-tracer-provider}

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

### মিটার প্রোভাইডার ইনিশিয়ালাইজেশন {#initializing-meter-provider}

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

### লগার প্রোভাইডার ইনিশিয়ালাইজেশন {#initializing-logger-provider}

লগের জন্য শিপিং সার্ভিস ট্রেসিং ব্যবহার করে, তাই `OpenTelemetryTracingBridge` ব্যবহার করা হয়েছে যাতে ট্রেসিং ক্রেট থেকে লগগুলোকে OpenTelemetry-এর সাথে সংযুক্ত করা যায়।

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

### ইন্সট্রুমেন্টেশন ইনিশিয়ালাইজেশন {#initializing-instrumentation}

ট্রেস, মেট্রিক্স এবং লগের জন্য প্রোভাইডারগুলি ইনিশিয়ালাইজ করার জন্য ফাংশনগুলি  ডিফাইন করার পরে, একটি পাবলিক ফাংশন `init_otel()` তৈরি করা হয়েছে:

```rust
pub fn init_otel() -> Result<()> {
    init_logger_provider();
    init_tracer_provider();
    init_meter_provider();
    Ok(())
}
```

এই ফাংশনটি সব ইনিশিয়ালাইজার কল করে এবং সব কিছু ঠিকঠাক শুরু হলে `Ok(())` রিটার্ন করে।

এরপর `main` এ `init_otel()` ফাংশনটি কল করা হয়:

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

### ইন্সট্রুমেন্টেশন কনফিগারেশন {#instrumentation-configuration}

প্রোভাইডারগুলো কনফিগার এবং ইনিশিয়ালাইজ হওয়ার পরে, শিপিং সার্ভিস সার্ভার-সাইড এবং ক্লায়েন্ট-সাইড কনফিগারেশনের সময় অ্যাপ্লিকেশনকে ইন্সট্রুমেন্ট করার জন্য [`opentelemetry-instrumentation-actix-web` crate](https://crates.io/crates/opentelemetry-instrumentation-actix-web) ব্যবহার করে।

#### সার্ভার সাইড {#server-side}

সার্ভারটি `RequestTracing` এবং `RequestMetrics` দিয়ে র‍্যাপ করা হয়েছে, যাতে রিকোয়েস্ট পাওয়ার সময় স্বয়ংক্রিয়ভাবে ট্রেস এবং মেট্রিকস তৈরি হয়:

```rust
HttpServer::new(|| {
    App::new()
        .wrap(RequestTracing::new())
        .wrap(RequestMetrics::default())
        .service(get_quote)
        .service(ship_order)
})
```

#### ক্লায়েন্ট সাইড {#client-side}

যখন অন্য সার্ভিসে রিকোয়েস্ট পাঠানো হয়, তখন কলের সাথে `trace_request()` যোগ করা হয়:

```rust
let mut response = client
    .post(quote_service_addr)
    .trace_request()
    .send_json(&reqbody)
    .await
    .map_err(|err| anyhow::anyhow!("Failed to call quote service: {err}"))?;
```

### ম্যানুয়াল ইন্সট্রুমেন্টেশন {#manual-instrumentation}

পূর্ববর্তী সেকশনে উল্লিখিত কমান্ডগুলি যোগ করে `opentelemetry-instrumentation-actix-web` ক্রেটটি আমাদের সার্ভার এবং ক্লায়েন্ট সাইডে ইন্সট্রুমেন্ট করার অনুমতি দেয়।

এছাড়া ডেমোতে আমরা দেখাই কিভাবে স্বয়ংক্রিয়ভাবে তৈরি হওয়া স্প্যানগুলোকে ম্যানুয়ালি উন্নত করা যায় এবং অ্যাপ্লিকেশনে ম্যানুয়াল মেট্রিকস তৈরি করা যায়।

#### ম্যানুয়াল স্প্যান {#manual-spans}

নিম্নলিখিত কোড স্নিপেটে, বর্তমান অ্যাকটিভ স্প্যানটি একটি স্প্যান ইভেন্ট এবং একটি স্প্যান অ্যাট্রিবিউট দিয়ে উন্নত করা হয়েছে:

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

#### ম্যানুয়াল মেট্রিকস {#manual-metrics}

শিপিং রিকোয়েস্টে মোট কতটি আইটেম রয়েছে তা গণনা করার জন্য একটি কাস্টম মেট্রিক কাউন্টার তৈরি করা হয়েছে:

```rust
let meter = global::meter("otel_demo.shipping.quote");
let counter = meter.u64_counter("app.shipping.items_count").build();
counter.add(count as u64, &[]);
```

### লগ {#logs}

যেহেতু শিপিং সার্ভিস লগ ইন্টারফেস হিসেবে ট্রেসিং ব্যবহার করছে, এটি `opentelemetry-appender-tracing` ক্রেট ব্যবহার করে ট্রেসিং লগগুলোকে OpenTelemetry লগের সাথে সংযুক্ত করে।

এই অ্যাপেন্ডারটি ইতিমধ্যেই [লগার প্রোভাইডার ইনিশিয়ালাইজেশন](#initializing-logger-provider) সময় কনফিগার করা হয়েছে, নিম্নলিখিত দুইটি লাইনের মাধ্যমে:

```rust
let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
tracing_subscriber::registry().with(otel_layer).init();
```

এই কনফিগারেশনের পর, আমরা ট্রেসিং সাধারণভাবে যেমন ব্যবহার করতাম সেভাবেই ব্যবহার করতে পারি, উদাহরণস্বরূপ:

```rust
info!(
    name = "SendingQuoteValue",
    quote.dollars = quote.dollars,
    quote.cents = quote.cents,
    message = "Sending Quote"
);
```

`opentelemetry-appender-tracing` ক্রেটটি লগ এন্ট্রিতে OpenTelemetry কনটেক্সট যোগ করার কাজ করে, এবং চূড়ান্ত এক্সপোর্ট হওয়া লগে সব কনফিগার করা রিসোর্স অ্যাট্রিবিউট এবং `TraceContext` তথ্য অন্তর্ভুক্ত থাকে।
