---
title: Сервіс доставки
linkTitle: Доставка
aliases: [shippingservice]
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
cSpell:ignore: sdktrace
---

Цей сервіс відповідає за надання інформації про доставку, включаючи ціни та інформацію про відстеження, коли це запитується з сервісу оформлення замовлення.

Сервіс доставки побудований в основному з використанням [Actix Web](https://actix.rs/), [Tracing](https://tracing.rs/) для логів та бібліотек/компонентів OpenTelemetry. Всі інші залежності включені в `Cargo.toml`.

Залежно від вашого фреймворку та середовища виконання, ви можете розглянути можливість звернення до [документації Rust](/docs/languages/rust/) для додаткової інформації. Ви знайдете приклади асинхронних та синхронних відрізків у запитах котирувань та ідентифікаторах відстеження відповідно.

[Сирці сервісу доставки](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/shipping/)

## Інструментування {#instrumentation}

OpenTelemetry SDK налаштовується у файлі `telemetry_conf`.

Для створення ресурсу реалізовано функцію `get_resource()`, яка використовує стандартні детектори ресурсів (Resource Detector), а також детектори `OS` та `Process`:

```rust
fn get_resource() -> Resource {
    let detectors: Vec<Box<dyn ResourceDetector>> = vec![
        Box::new(OsResourceDetector),
        Box::new(ProcessResourceDetector),
    ];

    Resource::builder().with_detectors(&detectors).build()
}
```

За допомогою `get_resource()` функцію можна викликати декілька разів у всіх ініціалізаціях провайдера.

### Ініціалізація провайдера Tracer {#initializing-tracer-provider}

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

### Ініціалізація провайдера Meter {#initializing-meter-provider}

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

### Ініціалізація провайдера Logger {#initializing-logger-provider}

Для логів сервіс доставки використовує Tracing, тому `OpenTelemetryTracingBridge`
використовується для мосту логів з бібліотеки трасування до OpenTelemetry.

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

### Ініціалізація інструментування {#instrumentation-initialization}

Після визначення функцій для ініціалізації провайдерів для Трейсів, Метрик і Логів створюється загальнодоступна функція `init_otel()`:

```rust
pub fn init_otel() -> Result<()> {
    init_logger_provider();
    init_tracer_provider();
    init_meter_provider();
    Ok(())
}
```

Ця функція викликає всі ініціалізатори і повертає `OK(())`, якщо все запускається правильно.

Потім викликається функція `init_otel()` на `main`:

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

### Конфігурація інструментування {#instrumentation-configuration}

Після налаштування та ініціалізації провайдерів, Shipping використовує [`opentelemetry-instrumentation-actix-web` crate](https://crates.io/crates/opentelemetry-instrumentation-actix-web) для інструменталізації застосунку під час конфігурації на стороні сервера та на стороні клієнта.

#### На боці сервера {#server-side}

Сервер обгорнутий у `RequestTracing` та `RequestMetrics`, щоб автоматично створювати Traces та Metrics під час отримання запитів:

```rust
HttpServer::new(|| {
    App::new()
        .wrap(RequestTracing::new())
        .wrap(RequestMetrics::default())
        .service(get_quote)
        .service(ship_order)
})
```

#### На боці клієнта {#client-side}

При виконанні запиту до іншого сервісу до виклику додається `trace_request()`:

```rust
let mut response = client
    .post(quote_service_addr)
    .trace_request()
    .send_json(&reqbody)
    .await
    .map_err(|err| anyhow::anyhow!("Failed to call quote service: {err}"))?;
```

### Ручне інструментування {#manual-instrumentation}

`opentelemetry-instrumentation-actix-web` crate дозволяє нам інструментувати серверну та клієнтську сторони, додаючи команди, згадані в попередньому розділі.

У демо ми також показуємо, як вручну покращити автоматично створені відрізки та як створити ручні метрики в застосунку.

#### Ручні відрізки {#manual-spans}

У наступному фрагменті активний відрізок покращується подією відрізка та атрибутом відрізка:

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

#### Ручні метрики {#manual-metrics}

Створюється власний лічильник метрик для підрахунку кількості елементів у запиті на доставку:

```rust
let meter = global::meter("otel_demo.shipping.quote");
let counter = meter.u64_counter("app.shipping.items_count").build();
counter.add(count as u64, &[]);
```

### Логи {#logs}

Оскільки сервіс доставки використовує Tracing як інтерфейс для логів, він використовує crate `opentelemetry-appender-tracing` для мосту між логами Tracing та логами OpenTelemetry.

Appender вже був налаштований під час [ініціалізації провайдера логів](#initializing-logger-provider) з наступними двома рядками:

```rust
let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
tracing_subscriber::registry().with(otel_layer).init();
```

З цим на місці, ми можемо використовувати Tracing так, як зазвичай, наприклад:

```rust
info!(
    name = "SendingQuoteValue",
    quote.dollars = quote.dollars,
    quote.cents = quote.cents,
    message = "Sending Quote"
);
```

Crate `opentelemetry-appender-tracing` відповідає за додавання контексту OpenTelemetry до запису логу а кінцевий експортований лог містить усі налаштовані атрибути ресурсу та інформацію `TraceContext`.
