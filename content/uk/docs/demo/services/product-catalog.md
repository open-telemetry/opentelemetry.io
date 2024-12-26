---
title: Сервіс каталогу продуктів
linkTitle: Каталог продуктів
aliases: [productcatalogservice]
# prettier-ignore
cSpell:ignore: fatalf otelcodes otelgrpc otlpmetricgrpc otlptracegrpc sdkmetric sdktrace sprintf
---

Цей сервіс відповідає за повернення інформації про продукти. Сервіс може бути використаний для отримання всіх продуктів, пошуку конкретних продуктів або повернення деталей про будь-який окремий продукт.

[Сирці сервісу каталогу продуктів](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/productcatalogservice/)

## Трейси {#traces}

### Ініціалізація Трейсингу {#initializing-tracing}

OpenTelemetry SDK ініціалізується з `main` за допомогою функції `initTracerProvider`.

```go
func initTracerProvider() *sdktrace.TracerProvider {
    ctx := context.Background()

    exporter, err := otlptracegrpc.New(ctx)
    if err != nil {
        log.Fatalf("OTLP Trace gRPC Creation: %v", err)
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

Ви повинні викликати `TracerProvider.Shutdown()` при завершенні роботи вашого сервісу, щоб забезпечити експорт всіх відрізків. Цей сервіс викликає цю функцію як частину відкладеної функції в main.

```go
tp := InitTracerProvider()
defer func() {
    if err := tp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Tracer Provider Shutdown: %v", err)
    }
}()
```

### Додавання gRPC автоінструментування {#adding-grpc-auto-instrumentation}

Цей сервіс отримує gRPC запити, які інструментуються в функції main як частина створення gRPC сервера.

```go
srv := grpc.NewServer(
    grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
```

Цей сервіс буде здійснювати вихідні gRPC виклики, які всі інструментуються обгортанням gRPC клієнта інструментуванням.

```go
func createClient(ctx context.Context, svcAddr string) (*grpc.ClientConn, error) {
    return grpc.DialContext(ctx, svcAddr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
    )
}
```

### Додавання атрибутів до автоінструментованих відрізків {#add-attributes-to-auto-instrumented-spans}

В межах виконання автоінструментованого коду ви можете отримати поточний відрізок з контексту.

```go
span := trace.SpanFromContext(ctx)
```

Додавання атрибутів до відрізка здійснюється за допомогою `SetAttributes` на обʼєкті відрізка. У функції `GetProduct` атрибут для ID продукту додається до відрізка.

```go
span.SetAttributes(
    attribute.String("app.product.id", req.Id),
)
```

### Встановлення статусу відрізка {#setting-span-status}

Цей сервіс може захоплювати та обробляти помилки на основі прапорця функції. У випадку помилки статус відрізка встановлюється відповідно за допомогою `SetStatus` на обʼєкті відрізка. Ви можете побачити це у функції `GetProduct`.

```go
msg := fmt.Sprintf("Error: ProductCatalogService Fail Feature Flag Enabled")
span.SetStatus(otelcodes.Error, msg)
```

### Додавання подій до відрізка {#add-span-events}

Додавання подій до відрізка здійснюється за допомогою `AddEvent` на обʼєкті відрізка. У функції `GetProduct` подія відрізка додається, коли обробляється помилка, або коли продукт успішно знайдений.

```go
span.AddEvent(msg)
```

## Метрики {#metrics}

### Ініціалізація Метрик {#initializing-metrics}

OpenTelemetry SDK ініціалізується з `main` за допомогою функції `initMeterProvider`.

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

Ви повинні викликати `initMeterProvider.Shutdown()` при завершенні роботи вашого сервісу, щоб забезпечити експорт всіх записів. Цей сервіс викликає цю функцію як частину відкладеної функції в main.

```go
mp := initMeterProvider()
defer func() {
    if err := mp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Error shutting down meter provider: %v", err)
    }
}()
```

### Додавання автоінструментування Golang runtime {#adding-golang-runtime-auto-instrumentation}

Golang runtime інструментується у функції main.

```go
err := runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second))
if err != nil {
    log.Fatal(err)
}
```

## Логи {#logs}

TBD
