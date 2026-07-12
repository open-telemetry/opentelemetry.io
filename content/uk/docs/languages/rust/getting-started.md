---
title: Початок роботи
weight: 10
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
# prettier-ignore
cSpell:ignore: ctrl_c eprintln LogExporter MetricExporter OnceLock rolldice SdkLoggerProvider SdkMeterProvider SdkTracerProvider SpanExporter tokio tracing
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry в Rust.

Ви дізнаєтесь, як можна інструментувати простий застосунок на Rust, таким чином, щоб [трейси][traces], [метрики][metrics] та [логи][logs] виводилися в консоль.

## Передумови {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- [Rust](https://www.rust-lang.org/)
- [Cargo](https://doc.rust-lang.org/cargo/)

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [hyper](https://hyper.rs/). Якщо ви не використовуєте hyper, це не проблема, ви можете використовувати OpenTelemetry Rust з іншими HTTP-реалізаціями, такими як Actix Web і Tide. Для повного списку бібліотек для підтримуваних фреймворків, дивіться [реєстр](/ecosystem/registry/?component=instrumentation&language=rust).

Для складніших прикладів дивіться [приклади](/docs/languages/rust/examples/).

### Залежності {#dependencies}

Для початку створіть виконуваний файл за допомогою `cargo new dice_server` у новій теці і додайте наступний вміст до файлу `Cargo.toml`:

```toml
[package]
name = "dice_server"
version = "0.1.0"
edition = "2021"

[dependencies]
hyper = { version = "1", features = ["full"] }
tokio = { version = "1", features = ["full"] }
http-body-util = "0.1"
hyper-util = { version = "0.1", features = ["full"] }
rand = "0.9.0"
```

### Створення та запуск HTTP-сервера {#create-and-launch-an-http-server}

Змініть `main.rs` наступним чином:

```rust
use std::convert::Infallible;
use std::net::SocketAddr;

use http_body_util::Full;
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::Method;
use hyper::{Request, Response};
use hyper_util::rt::TokioIo;
use rand::Rng;
use tokio::net::TcpListener;

async fn roll_dice(_: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    let random_number = rand::rng().random_range(1..=6);
    Ok(Response::new(Full::new(Bytes::from(
        random_number.to_string(),
    ))))
}

async fn handle(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    match (req.method(), req.uri().path()) {
        (&Method::GET, "/rolldice") => roll_dice(req).await,
        _ => Ok(Response::builder()
            .status(404)
            .body(Full::new(Bytes::from("Not Found")))
            .unwrap()),
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));

    let listener = TcpListener::bind(addr).await?;

    loop {
        let (stream, _) = listener.accept().await?;

        let io = TokioIo::new(stream);

        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(io, service_fn(handle))
                .await
            {
                eprintln!("Error serving connection: {:?}", err);
            }
        });
    }
}
```

Зберіть і запустіть застосунок за допомогою наступної команди, потім відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```console
$ cargo run
...
Listening on 127.0.0.1:8080
```

## Інструментування {#instrumentation}

Тепер ми покажемо, як додати інструментування OpenTelemetry до прикладного застосунку. Якщо ви використовуєте власний застосунок, ви можете слідувати цим крокам — ваш код може трохи відрізнятися.

### Додавання залежностей {#add-dependencies}

Оновіть `Cargo.toml` з залежностями для OpenTelemetry Rust SDK [`opentelemetry`](https://crates.io/crates/opentelemetry), OpenTelemetry Stdout Exporter [`opentelemetry-stdout`](https://crates.io/crates/opentelemetry-stdout) та залежностями мосту [`opentelemetry-appender-tracing`](https://crates.io/crates/opentelemetry-appender-tracing) для логів:

```toml
opentelemetry = { version = "{{% version-from-registry otel-rust %}}", features = ["metrics"] }
opentelemetry_sdk = { version = "{{% version-from-registry otel-rust-sdk %}}", features = ["trace", "metrics", "logs"] }
opentelemetry-stdout = { version = "{{% version-from-registry exporter-rust-stdout %}}", features = ["trace", "metrics", "logs"] }
opentelemetry-appender-tracing = "{{% version-from-registry otel-rust %}}"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["registry", "env-filter"] }
```

### Повністю інструментований застосунок {#complete-instrumented-application}

Замініть `main.rs` на наступну повністю інструментовану версію. Розділи нижче пояснюють, що додає кожен сигнал:

```rust
use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::OnceLock;

use http_body_util::Full;
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::Method;
use hyper::{Request, Response};
use hyper_util::rt::TokioIo;
use opentelemetry::global::{self, BoxedTracer};
use opentelemetry::trace::{Span, SpanKind, Status, Tracer};
use opentelemetry::KeyValue;
use opentelemetry_appender_tracing::layer::OpenTelemetryTracingBridge;
use opentelemetry_sdk::logs::SdkLoggerProvider;
use opentelemetry_sdk::metrics::SdkMeterProvider;
use opentelemetry_sdk::trace::SdkTracerProvider;
use opentelemetry_stdout::{LogExporter, MetricExporter, SpanExporter};
use rand::Rng;
use tokio::net::TcpListener;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

// --- Метрики: лічильник зберігається один раз для повторного використання у запитах ---
static ROLL_COUNTER: OnceLock<opentelemetry::metrics::Counter<u64>> = OnceLock::new();

fn get_roll_counter() -> &'static opentelemetry::metrics::Counter<u64> {
    ROLL_COUNTER.get_or_init(|| {
        global::meter("dice_server")
            .u64_counter("dice.rolls")
            .with_description("The number of rolls by roll value")
            .build()
    })
}

// --- Обробники застосунку ---
async fn roll_dice(_: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    let random_number = rand::rng().random_range(1..=6);

    // Метрики: запис кожного кидка
    get_roll_counter().add(1, &[KeyValue::new("roll.value", random_number as i64)]);

    // Логи: створення структурованого лог-події через місток tracing
    tracing::info!(name: "roll_dice", roll.value = random_number, message = "Player rolled the dice");

    Ok(Response::new(Full::new(Bytes::from(
        random_number.to_string(),
    ))))
}

async fn handle(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    // Трейси: створення серверного спану для кожного вхідного запиту
    let tracer = get_tracer();
    let mut span = tracer
        .span_builder(format!("{} {}", req.method(), req.uri().path()))
        .with_kind(SpanKind::Server)
        .start(tracer);

    match (req.method(), req.uri().path()) {
        (&Method::GET, "/rolldice") => roll_dice(req).await,
        _ => {
            span.set_status(Status::Ok);
            Ok(Response::builder()
                .status(404)
                .body(Full::new(Bytes::from("Not Found")))
                .unwrap())
        }
    }
}

// --- Трейси: глобальний доступ до трейсера ---
fn get_tracer() -> &'static BoxedTracer {
    static TRACER: OnceLock<BoxedTracer> = OnceLock::new();
    TRACER.get_or_init(|| global::tracer("dice_server"))
}

// --- Ініціалізація провайдерів ---
fn init_tracer_provider() -> SdkTracerProvider {
    let provider = SdkTracerProvider::builder()
        .with_simple_exporter(SpanExporter::default())
        .build();
    global::set_tracer_provider(provider.clone());
    provider
}

fn init_meter_provider() -> SdkMeterProvider {
    let provider = SdkMeterProvider::builder()
        .with_periodic_exporter(MetricExporter::default())
        .build();
    global::set_meter_provider(provider.clone());
    provider
}

fn init_logger_provider() -> SdkLoggerProvider {
    SdkLoggerProvider::builder()
        .with_simple_exporter(LogExporter::default())
        .build()
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));

    // Ініціалізація провайдерів та збереження їх для завершення роботи
    let tracer_provider = init_tracer_provider();
    let meter_provider = init_meter_provider();
    let logger_provider = init_logger_provider();

    // Логи: підключення містка tracing, щоб tracing::info! тощо йшли до OTel
    let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
    tracing_subscriber::registry()
        .with(otel_layer)
        .init();

    let listener = TcpListener::bind(addr).await?;
    tracing::info!("Listening on {addr}");

    loop {
        tokio::select! {
            Ok((stream, _)) = listener.accept() => {
                let io = TokioIo::new(stream);
                tokio::task::spawn(async move {
                    if let Err(err) = http1::Builder::new()
                        .serve_connection(io, service_fn(handle))
                        .await
                    {
                        eprintln!("Error serving connection: {:?}", err);
                    }
                });
            }
            _ = tokio::signal::ctrl_c() => {
                break;
            }
        }
    }

    // Перед завершенням роботи: скидання та завершення всіх провайдерів
    if let Err(err) = tracer_provider.shutdown() {
        eprintln!("Error shutting down tracer provider: {err:?}");
    }
    if let Err(err) = meter_provider.shutdown() {
        eprintln!("Error shutting down meter provider: {err:?}");
    }
    if let Err(err) = logger_provider.shutdown() {
        eprintln!("Error shutting down logger provider: {err:?}");
    }

    Ok(())
}
```

Запустіть сервер:

```sh
$ cargo run
...
Listening on 127.0.0.1:8080
```

### Трейси {#traces}

Трасування додається в `handle()`. Для кожного вхідного HTTP-запиту створюється **серверний відрізок** за допомогою `Tracer`, отриманого з глобального провайдера:

```rust
let mut span = tracer
    .span_builder(format!("{} {}", req.method(), req.uri().path()))
    .with_kind(SpanKind::Server)
    .start(tracer);
```

`init_tracer_provider()` створює `SdkTracerProvider` з експортером stdout, встановлює його глобально і повертає, щоб `main()` міг викликати `.shutdown()` при виході.

Коли ви надішлете запит на <http://localhost:8080/rolldice>, ви побачите відрізок, виведений у консоль:

<details>
<summary>Переглянути приклад виводу</summary>

```txt
Spans
Resource
         ->  telemetry.sdk.version=String(Static("0.28.0"))
         ->  service.name=String(Static("unknown_service"))
         ->  telemetry.sdk.language=String(Static("rust"))
         ->  telemetry.sdk.name=String(Static("opentelemetry"))
Span #0
        Instrumentation Scope
                Name         : "dice_server"

        Name        : GET /rolldice
        TraceId     : 9f03de7cf14780bd54b95d7095332107
        SpanId      : 9faed88b3f9ed699
        TraceFlags  : TraceFlags(1)
        ParentSpanId: 0000000000000000
        Kind        : Server
        Start time: 2025-03-11 00:47:26.687497
        End time: 2025-03-11 00:47:26.687653
        Status: Unset
```

</details>

### Метрики {#metrics}

Змінна типу `u64_counter` з іменем `dice.rolls` створюється один раз (за допомогою `OnceLock`) і інкрементується у функції `roll_dice()`:

```rust
get_roll_counter().add(1, &[KeyValue::new("roll.value", random_number as i64)]);
```

`init_meter_provider()` створює `SdkMeterProvider` з періодичним stdout експортером. Після короткого інтервалу ви побачите, як лічильник буде виведений:

<details>
<summary>Переглянути приклад виводу</summary>

```txt
Metrics
Resource
         ->  service.name=String(Static("unknown_service"))
         ->  telemetry.sdk.language=String(Static("rust"))
         ->  telemetry.sdk.name=String(Static("opentelemetry"))
         ->  telemetry.sdk.version=String(Static("0.28.0"))
Metric #0
        Instrumentation Scope
                Name         : "dice_server"

        Name        : dice.rolls
        Description : The number of rolls by roll value
        Unit        :
        Type        : Sum
              Value: 1
              Attributes:
                   ->  roll.value: Int(3)
              Value: 2
              Attributes:
                   ->  roll.value: Int(5)
```

</details>

### Логи {#logs}

OpenTelemetry Rust не надає власного API для кінцевого користувача для логування. Натомість він інтегрує наявні фреймворки логування Rust у модель даних OpenTelemetry. Рекомендований підхід використовує crate [`tracing`](https://crates.io/crates/tracing) разом з містком [`opentelemetry-appender-tracing`](https://crates.io/crates/opentelemetry-appender-tracing).

`init_logger_provider()` створює `SdkLoggerProvider` з експортером stdout. У `main()`, `OpenTelemetryTracingBridge` підключається до стеку `tracing_subscriber`, щоб будь-який виклик `tracing::info!` (або іншого рівня) був перенаправлений до конвеєру логів OTel:

```rust
let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
tracing_subscriber::registry()
    .with(otel_layer)
    .init();
```

У `roll_dice()`, створюється структурований лог-подія:

```rust
tracing::info!(name: "roll_dice", roll.value = random_number, message = "Player rolled the dice");
```

Разом з відрізком і метрикою, ви тепер побачите записи логів у консолі:

<details>
<summary>Переглянути приклад виводу</summary>

```txt
Logs
Resource
         ->  service.name=String(Static("unknown_service"))
         ->  telemetry.sdk.language=String(Static("rust"))
         ->  telemetry.sdk.name=String(Static("opentelemetry"))
         ->  telemetry.sdk.version=String(Static("0.28.0"))
Log #0
        Instrumentation Scope
                Name         : "dice_server"

        Timestamp   : 2025-03-11 00:47:26.687497
        Severity    : Info
        Body        : Player rolled the dice
        Attributes:
             ->  roll.value: Int(3)
```

</details>

## Що далі? {#what-next}

Для більшого:

- Ознайомтеся з [API та SDK](/docs/languages/rust/api/) довідкою
- Спробуйте інші [приклади](/docs/languages/rust/examples/).

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
