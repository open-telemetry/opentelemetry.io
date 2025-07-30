---
title: Сервіс оформлення замовлення
linkTitle: Оформлення замовлення
aliases: [checkoutservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
# prettier-ignore
cSpell:ignore: fatalf otelgrpc otelsarama otlpmetricgrpc otlptracegrpc sarama sdkmetric sdktrace
---

Цей сервіс відповідає за обробку замовлення користувача. Сервіс оформлення замовлення викликає багато інших сервісів для обробки замовлення.

[Сирці сервісу оформлення замовлення](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/checkout/)

## Трейси {#traces}

### Ініціалізація трасування {#initializing-tracing}

SDK OpenTelemetry ініціалізується з `main` за допомогою функції `initTracerProvider`.

```go
func initTracerProvider() *sdktrace.TracerProvider {
    ctx := context.Background()

    exporter, err := otlptracegrpc.New(ctx)
    if err != nil {
        log.Fatal(err)
    }
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(initResource()),
    )
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
    return tp
}
```

Ви повинні викликати `TracerProvider.Shutdown()`, коли ваш сервіс вимикається, щоб забезпечити експорт всіх відрізків. Цей сервіс викликає цю функцію як частину відкладеної функції в main.

```go
tp := initTracerProvider()
defer func() {
    if err := tp.Shutdown(context.Background()); err != nil {
        log.Printf("Error shutting down tracer provider: %v", err)
    }
}()
```

### Додавання автоматичної інструменталізації gRPC {#adding-grpc-auto-instrumentation}

Цей сервіс отримує запити gRPC, які інструментуються в функції main як частина створення сервера gRPC.

```go
var srv = grpc.NewServer(
    grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
```

Цей сервіс буде здійснювати кілька вихідних викликів gRPC, які всі інструментуються шляхом обгортання клієнта gRPC інструменталізацією.

```go
func createClient(ctx context.Context, svcAddr string) (*grpc.ClientConn, error) {
    return grpc.DialContext(ctx, svcAddr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
    )
}
```

### Додавання автоматичної інструменталізації Kafka (Sarama) {#adding-kafka-sarama-auto-instrumentation}

Цей сервіс буде записувати оброблені результати в тему Kafka, яка потім буде оброблена іншими мікросервісами. Щоб інструментувати клієнта Kafka, продюсер повинен бути обгорнутий після його створення.

```go
saramaConfig := sarama.NewConfig()
producer, err := sarama.NewAsyncProducer(brokers, saramaConfig)
if err != nil {
    return nil, err
}
producer = otelsarama.WrapAsyncProducer(saramaConfig, producer)
```

### Додавання атрибутів до автоматично інструментованих відрізків {#add-attributes-to-auto-instrumented-spans}

Під час виконання автоматично інструментованого коду ви можете отримати поточний відрізок з контексту.

```go
span := trace.SpanFromContext(ctx)
```

Додавання атрибутів до відрізка здійснюється за допомогою `SetAttributes` на обʼєкті відрізка. У функції `PlaceOrder` до відрізка додається кілька атрибутів.

```go
span.SetAttributes(
    attribute.String("app.order.id", orderID.String()), shippingTrackingAttribute,
    attribute.Float64("app.shipping.amount", shippingCostFloat),
    attribute.Float64("app.order.amount", totalPriceFloat),
    attribute.Int("app.order.items.count", len(prep.orderItems)),
)
```

### Додавання подій до відрізків {#add-span-events}

Додавання подій до відрізків здійснюється за допомогою `AddEvent` на обʼєкті відрізка. У функції `PlaceOrder` додається кілька подій відрізка. Деякі події мають додаткові атрибути, інші — ні.

Додавання події відрізка без атрибутів:

```go
span.AddEvent("prepared")
```

Додавання події відрізка з додатковими атрибутами:

```go
span.AddEvent("charged",
    trace.WithAttributes(attribute.String("app.payment.transaction.id", txID)))
```

## Метрики {#metrics}

### Ініціалізація метрик {#initializing-metrics}

SDK OpenTelemetry ініціалізується з `main` за допомогою функції `initMeterProvider`.

```go
func initMeterProvider() *sdkmetric.MeterProvider {
    ctx := context.Background()

    exporter, err := otlpmetricgrpc.New(ctx)
    if err != nil {
        log.Fatalf("new otlp metric grpc exporter failed: %v", err)
    }

    mp := sdkmetric.NewMeterProvider(sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter)))
    global.SetMeterProvider(mp)
    return mp
}
```

Ви повинні викликати `MeterProvider.Shutdown()`, коли ваш сервіс вимикається, щоб забезпечити експорт всіх записів. Цей сервіс викликає цю функцію як частину відкладеної функції в main.

```go
mp := initMeterProvider()
defer func() {
    if err := mp.Shutdown(context.Background()); err != nil {
        log.Printf("Error shutting down meter provider: %v", err)
    }
}()
```

### Додавання автоматичної інструменталізації Golang runtime {#adding-golang-runtime-auto-instrumentation}

Golang runtime інструментуються у функції main.

```go
err := runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second))
if err != nil {
    log.Fatal(err)
}
```

## Логи {#logs}

TBD
