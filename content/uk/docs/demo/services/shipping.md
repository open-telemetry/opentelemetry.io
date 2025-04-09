---
title: Сервіс доставки
linkTitle: Доставка
aliases: [shippingservice]
cSpell:ignore: itemct oteldemo reqwest sdktrace semcov shiporder tokio
---

Цей сервіс відповідає за надання інформації про доставку, включаючи ціни та інформацію про відстеження, коли це запитується з сервісу оформлення замовлення.

Сервіс доставки побудований в основному з використанням Tonic, Reqwest та бібліотек/компонентів OpenTelemetry. Інші підзалежності включені в `Cargo.toml`.

Залежно від вашого фреймворку та середовища виконання, ви можете розглянути можливість звернення до [документації Rust](/docs/languages/rust/) для додаткової інформації. Ви знайдете приклади асинхронних та синхронних відрізків у запитах котирувань та ідентифікаторах відстеження відповідно.

`build.rs` підтримує розробку поза Docker, за наявності встановленого Rust. В іншому випадку, розгляньте можливість збірки з використанням `docker compose` для редагування/оцінки змін за потреби.

[Сирці сервісу доставки](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/shipping/)

## Трейси {#traces}

### Ініціалізація Трейсингу {#initializing-tracing}

SDK OpenTelemetry ініціалізується з `main`.

```rust
fn init_tracer() -> Result<sdktrace::Tracer, TraceError> {
    global::set_text_map_propagator(TraceContextPropagator::new());
    let os_resource = OsResourceDetector.detect(Duration::from_secs(0));
    let process_resource = ProcessResourceDetector.detect(Duration::from_secs(0));
    let sdk_resource = SdkProvidedResourceDetector.detect(Duration::from_secs(0));
    let env_resource = EnvResourceDetector::new().detect(Duration::from_secs(0));
    let telemetry_resource = TelemetryResourceDetector.detect(Duration::from_secs(0));
    opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(format!(
                    "{}{}",
                    env::var("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT")
                        .unwrap_or_else(|_| "http://otelcol:4317".to_string()),
                    "/v1/traces"
                )), // TODO: assume this ^ is true from config when opentelemetry crate > v0.17.0
                    // https://github.com/open-telemetry/opentelemetry-rust/pull/806 includes the environment variable.
        )
        .with_trace_config(
            sdktrace::config()
                .with_resource(os_resource.merge(&process_resource).merge(&sdk_resource).merge(&env_resource).merge(&telemetry_resource)),
        )
        .install_batch(opentelemetry::runtime::Tokio)
}
```

Відрізки та інші метрики створюються в цьому прикладі протягом асинхронних середовищ виконання `tokio`, знайдених у функціях сервера [`tonic`](https://github.com/hyperium/tonic/blob/master/examples/helloworld-tutorial.md#writing-our-server). Будьте уважні до асинхронного середовища виконання, [охоронців контексту](https://docs.rs/opentelemetry/latest/opentelemetry/struct.ContextGuard.html), та неможливості переміщення та клонування `spans` при відтворенні з цих зразків.

### Додавання gRPC інструментування {#adding-grpc-instrumentation}

Цей сервіс отримує gRPC запити, які інструментуються в проміжному програмному забезпеченні.

Кореневий відрізок запускається і передається як посилання в тому ж потоці до іншого замикання, де ми викликаємо `quote`.

```rust
    let tracer = global::tracer("shipping");
    let mut span = tracer.span_builder("oteldemo.ShippingService/GetQuote").with_kind(SpanKind::Server).start_with_context(&tracer, &parent_cx);
    span.set_attribute(semcov::trace::RPC_SYSTEM.string(RPC_SYSTEM_GRPC));

    span.add_event("Processing get quote request".to_string(), vec![]);

    let cx = Context::current_with_span(span);
    let q = match create_quote_from_count(itemct)
        .with_context(cx.clone())
        .await
//-> create_quote_from_count()...
    let f = match request_quote(count).await {
        Ok(float) => float,
        Err(err) => {
            let msg = format!("{}", err);
            return Err(tonic::Status::unknown(msg));
        }
    };

    Ok(get_active_span(|span| {
        let q = create_quote_from_float(f);
        span.add_event(
            "Received Quote".to_string(),
            vec![KeyValue::new("app.shipping.cost.total", format!("{}", q))],
        );
        span.set_attribute(KeyValue::new("app.shipping.items.count", count as i64));
        span.set_attribute(KeyValue::new("app.shipping.cost.total", format!("{}", q)));
        q
    }))
//<- create_quote_from_count()...
    cx.span().set_attribute(semcov::trace::RPC_GRPC_STATUS_CODE.i64(RPC_GRPC_STATUS_CODE_OK));
```

Зверніть увагу, що ми створюємо контекст навколо кореневого відрізка та надсилаємо клон до асинхронної функції create_quote_from_count(). Після завершення create_quote_from_count() ми можемо додати додаткові атрибути до кореневого відрізка за потреби.

Ви також можете помітити `attributes`, встановлені на відрізку в цьому прикладі, та `events`, що передаються аналогічно. З будь-яким дійсним вказівником `spans` (прикріпленим до контексту) API [OpenTelemetry](https://docs.rs/opentelemetry/0.17.0/opentelemetry/trace/struct.SpanRef.html) буде працювати.

### Додавання HTTP інструментування {#adding-http-instrumentation}

Дочірній _клієнтський_ відрізок також створюється для вихідного HTTP виклику до `quote` через клієнта `reqwest`. Цей відрізок поєднується з відповідним _серверним_ відрізком `quote`. Інструментування трейсингу реалізовано в проміжному програмному забезпеченні клієнта з використанням доступних бібліотек `reqwest-middleware`, `reqwest-tracing` та `tracing-opentelemetry`:

```rust
let reqwest_client = reqwest::Client::new();
let client = ClientBuilder::new(reqwest_client)
    .with(TracingMiddleware::<SpanBackendWithUrl>::new())
    .build();
```

### Додавання атрибутів до відрізка {#add-span-attributes}

За умови, що ви знаходитесь в тому ж потоці, або в контексті, переданому з потоку, що володіє відрізком, або `ContextGuard` знаходиться в області видимості, ви можете отримати активний відрізок за допомогою `get_active_span`. Ви можете знайти приклади всього цього в демонстрації, з контекстом, доступним у `shipping_service` для синхронного/асинхронного середовища виконання. Ви повинні звернутися до `quote.rs` та/або прикладу вище, щоб побачити контекст, переданий до асинхронного середовища виконання.

Нижче наведено фрагмент з `shiporder`, який утримує контекст та відрізок в області видимості. Це доречно у нашому випадку синхронного середовища виконання.

```rust
let parent_cx =
global::get_text_map_propagator(|prop| prop.extract(&MetadataMap(request.metadata())));
// у цьому випадку, створення ідентифікатора відстеження є тривіальним
// ми створимо відрізок та повʼязані події все в цій функції.
let tracer = global::tracer("shipping");
let mut span = tracer
    .span_builder("oteldemo.ShippingService/ShipOrder").with_kind(SpanKind::Server).start_with_context(&tracer, &parent_cx);
```

Ви повинні додати атрибути до відрізка в контексті за допомогою `set_attribute`, після чого слідує обʼєкт `KeyValue`, що містить ключ та значення.

```rust
let tid = create_tracking_id();
span.set_attribute(KeyValue::new("app.shipping.tracking.id", tid.clone()));
info!("Tracking ID Created: {}", tid);
```

### Додавання подій до відрізка {#add-span-events}

Додавання подій до відрізка здійснюється за допомогою `add_event` на обʼєкті відрізка. Обидва серверні маршрути, для `ShipOrderRequest` (синхронний) та `GetQuoteRequest` (асинхронний), мають події на відрізках. Атрибути тут не включені, але вони [прості для включення](https://docs.rs/opentelemetry/latest/opentelemetry/trace/trait.Span.html#method.add_event).

Додавання події до відрізка:

```rust
let tid = create_tracking_id();
span.set_attribute(KeyValue::new("app.shipping.tracking.id", tid.clone()));
info!("Tracking ID Created: {}", tid);
```

## Метрики {#metrics}

TBD

## Логи {#logs}

TBD
