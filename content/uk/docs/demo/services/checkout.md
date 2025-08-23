---
title: Сервіс оформлення замовлення
linkTitle: Оформлення замовлення
aliases: [checkoutservice]
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
# prettier-ignore
cSpell:ignore: fatalf loggerprovider otelgrpc otelsarama otlpmetricgrpc otlptracegrpc sarama sdkmetric sdktrace
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

Ви можете надсилати свої логи до OpenTelemetry Collector двома способами:

- Безпосередньо до Collectorʼа
- Через файл або `stdout`

Ви можете знайти документацію, що описує, як використовувати обидва ці підходи в розділі [Логи](/docs/languages/go/instrumentation/#logs) документації [Ручне інструментування](/docs/languages/go/instrumentation/).

Сервіс Checkout надсилає логи безпосередньо до Collector і використовує міст для надсилання своїх логів, який зʼєднує їх з пакетом логування `slog`, що виводить структуровані логи.

## Ініціалізація LoggerProvider {#loggerprovider-initialization}

SDK OpenTelemetry ініціалізується з `main` за допомогою функції `initLoggerProvider`.

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

Викличте `LoggerProvider.Shutdown()`, коли ваш сервіс не працює, щоб переконатися, що всі журнали експортовані. Цей сервіс виконує цей виклик як частину відкладеної функції в `main`:

```go
lp := initLoggerProvider()
defer func() {
	if err := lp.Shutdown(context.Background()); err != nil {
		logger.Error(fmt.Sprintf("Logger Provider Shutdown: %v", err))
	}
	logger.Info("Shutdown logger provider")
}()
```

### Функція логування {#logging-functionality}

Цей сервіс надсилає логи до Collector за допомогою викликів gRPC. Логи виводяться у структурованому форматі за допомогою пакунка `slog`.

Спочатку ініціалізуйте логер:

```go
logger   *slog.Logger
logger = otelslog.NewLogger("checkout")
```

Зверніть увагу на використання `fmt.Sprintf` для форматування виводу перед його надсиланням до логера:

```go
logger.Info(fmt.Sprintf("order confirmation email sent to %q", req.Email))
logger.Warn(fmt.Sprintf("failed to send order confirmation to %q: %+v", req.Email, err))
logger.Error(fmt.Sprintf("Error shutting down logger provider: %v", err))
```

Перевага використання `slog` полягає в можливості прикріплювати додаткові атрибути до виводу. Наступний приклад прикріплює кілька атрибутів, таких як `orderID`, `shippingCost` і `totalPrice`. Це робить можливим перегляд і розбір цих атрибутів як частини виводу журналу та спрощує їх перегляд як окремих стовпців у Grafana:

```go
logger.LogAttrs(
    ctx,
    slog.LevelInfo, "order placed",
    slog.String("app.order.id", orderID.String()),
    slog.Float64("app.shipping.amount", shippingCostFloat),
    slog.Float64("app.order.amount", totalPriceFloat),
    slog.Int("app.order.items.count", len(prep.orderItems)),
    slog.String("app.shipping.tracking.id", shippingTrackingID),
)
```
