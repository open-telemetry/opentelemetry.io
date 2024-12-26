---
title: Сервіс каталогу продуктів
linkTitle: Каталог продуктів
aliases: [productcatalogservice]
default_lang_commit: 10b2aa9fc1a8f434b6212dc453f01dd520b2f9e3
# prettier-ignore
cSpell:ignore: fatalf loggerprovider otelcodes otelgrpc otlpmetricgrpc otlptracegrpc sdkmetric sdktrace sprintf
---

Цей сервіс відповідає за повернення інформації про продукти. Сервіс може бути використаний для отримання всіх продуктів, пошуку конкретних продуктів або повернення деталей про будь-який окремий продукт.

[Сирці сервісу каталогу продуктів](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/product-catalog/)

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

You can send your logs to the OpenTelemetry Collector in two ways:

- Directly to the Collector
- Through a file or `stdout`

You can find documentation specifying how to use both these approaches in the
[Logs](/docs/languages/go/instrumentation/#logs) section of the
[Manual Instrumentation](/docs/languages/go/instrumentation/) documentation.

The Product Catalog service sends the logs directly to the Collector, and uses a
log bridge to send its logs, bridging to the `slog` logging package, which
outputs structured logs.

## Ініціалізація LoggerProvider {#loggerprovider-initialization}

OpenTelemetry SDK ініціалізується з `main` за допомогою функції `initLoggerProvider`.

```go
ctx := context.Background()

logExporter, err := otlploggrpc.New(ctx)
if err != nil {
	return nil
}

loggerProvider := sdklog.NewLoggerProvider(
	sdklog.WithProcessor(sdklog.NewBatchProcessor(logExporter)),
)
global.SetLoggerProvider(loggerProvider)

return loggerProvider
```

Зробіть виклик `LoggerProvider.Shutdown()`, коли ваш сервіс не працює, щоб переконатися, що всі журнали експортовано. Цей сервіс виконує цей виклик як частину відкладеної функції у `main`:

```go
lp := initLoggerProvider()
defer func() {
	if err := lp.Shutdown(context.Background()); err != nil {
		logger.Error(fmt.Sprintf("Logger Provider Shutdown: %v", err))
	}
	logger.Info("Shutdown logger provider")
}()
```

### Функціональність ведення журналу {#logging-functionality}

Цей сервіс надсилає логи до Collector за допомогою викликів gRPC. Логи виводяться у структурованому форматі за допомогою пакета `slog`.

Спочатку ініціалізуйте логер:

```go
logger   *slog.Logger
logger = otelslog.NewLogger("product-catalog")
```

Зверніть увагу на використання `fmt.Sprintf` для форматування виводу перед надсиланням до журналу:

```go
logger.Info("Loading Product Catalog...")
logger.Info(fmt.Sprintf("Product Catalog reload interval: %d", interval))
logger.Error(fmt.Sprintf("Error shutting down meter provider: %v", err))
```

Перевагою використання `log` є можливість додавання додаткових атрибутів до виводу. У наступному прикладі додано атрибути `product.name` та `product.id`. Це дозволяє переглядати і аналізувати їх як частину виводу журналу, а також полегшує їх перегляд як окремих стовпців у Grafana:

```go
logger.LogAttrs(
	ctx,
	slog.LevelInfo, "Product Found",
	slog.String("app.product.name", found.Name),
	slog.String("app.product.id", req.Id),
)
```
