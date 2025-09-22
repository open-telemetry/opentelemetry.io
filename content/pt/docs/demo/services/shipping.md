---
title: Serviço de Envio
linkTitle: Envio
aliases: [shippingservice]
cSpell:ignore: sdktrace
---

Este serviço é responsável por fornecer informações de envio incluindo preços
e informações de rastreamento, quando solicitado do Serviço de Checkout.

O serviço de envio é construído com [Actix Web](https://actix.rs/),
[Tracing](https://tracing.rs/) para logs e Bibliotecas OpenTelemetry. Todas as outras
sub-dependências estão incluídas no `Cargo.toml`.

Dependendo do seu framework e runtime, você pode considerar consultar a
[documentação Rust](/docs/languages/rust/) para complementar. Você encontrará exemplos de spans
assíncronos e síncronos em requisições de cotação e IDs de rastreamento respectivamente.

[Código fonte do serviço de envio](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/shipping/)

## Instrumentação

O SDK do OpenTelemetry é configurado no arquivo `telemetry_conf`.

Uma função `get_resource()` é implementada para criar um Resource usando os
Detectores de Resource padrão mais detectores `OS` e `Process`:

```rust
fn get_resource() -> Resource {
    let detectors: Vec<Box<dyn ResourceDetector>> = vec![
        Box::new(OsResourceDetector),
        Box::new(ProcessResourceDetector),
    ];

    Resource::builder().with_detectors(&detectors).build()
}
```

Com `get_resource()` no lugar, a função pode ser chamada múltiplas vezes em
todas as inicializações de provedor.

### Inicializando Provedor de Tracer

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

### Inicializando Provedor de Medidor

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

### Inicializando Provedor de Logger

Para logs, o serviço de envio usa Tracing, então a `OpenTelemetryTracingBridge`
é usada para fazer ponte de logs da crate tracing para OpenTelemetry.

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

### Inicialização de Instrumentação

Após definir as funções para inicializar os provedores para Rastreamentos, Métricas e
Logs, uma função pública `init_otel()` é criada:

```rust
pub fn init_otel() -> Result<()> {
    init_logger_provider();
    init_tracer_provider();
    init_meter_provider();
    Ok(())
}
```

Esta função chama todos os inicializadores e retorna `OK(())` se tudo iniciar
adequadamente.

A função `init_otel()` é então chamada em `main`:

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

### Configuração de Instrumentação

Com os provedores agora configurados e inicializados, o Shipping usa a
[crate `opentelemetry-instrumentation-actix-web`](https://crates.io/crates/opentelemetry-instrumentation-actix-web)
para instrumentar a aplicação durante a configuração do lado do servidor e do cliente.

#### Lado do servidor

O servidor é envolvido com `RequestTracing` e `RequestMetrics` para
criar automaticamente Rastreamentos e Métricas ao receber requisições:

```rust
HttpServer::new(|| {
    App::new()
        .wrap(RequestTracing::new())
        .wrap(RequestMetrics::default())
        .service(get_quote)
        .service(ship_order)
})
```

#### Lado do cliente

Ao fazer uma requisição para outro serviço, `trace_request()` é adicionado à
chamada:

```rust
let mut response = client
    .post(quote_service_addr)
    .trace_request()
    .send_json(&reqbody)
    .await
    .map_err(|err| anyhow::anyhow!("Failed to call quote service: {err}"))?;
```

### Instrumentação manual

A crate `opentelemetry-instrumentation-actix-web` nos permite instrumentar
lado do servidor e do cliente adicionando os comandos mencionados na seção anterior.

No Demo também demonstramos como aprimorar manualmente spans criados automaticamente
e como criar métricas manuais na aplicação.

#### Spans manuais

No seguinte snippet, o span ativo atual é aprimorado com um evento de span
e um atributo de span:

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

#### Métricas manuais

Um contador de métrica personalizado é criado para contar quantos itens estão na
requisição de envio:

```rust
let meter = global::meter("otel_demo.shipping.quote");
let counter = meter.u64_counter("app.shipping.items_count").build();
counter.add(count as u64, &[]);
```

### Logs

Como o serviço de envio está usando Tracing como uma interface de log, ele usa a
crate `opentelemetry-appender-tracing` para fazer ponte de logs Tracing para logs OpenTelemetry.

O appender já foi configurado durante a
[inicialização do provedor de logger](#initializing-logger-provider), com as
seguintes duas linhas:

```rust
let otel_layer = OpenTelemetryTracingBridge::new(&logger_provider);
tracing_subscriber::registry().with(otel_layer).init();
```

Com isso no lugar, podemos usar Tracing como normalmente faríamos, por exemplo:

```rust
info!(
    name = "SendingQuoteValue",
    quote.dollars = quote.dollars,
    quote.cents = quote.cents,
    message = "Sending Quote"
);
```

A crate `opentelemetry-appender-tracing` cuida de adicionar contexto OpenTelemetry
à entrada de log, e o log final exportado contém todos os atributos de recurso
configurados e informações de `TraceContext`.
