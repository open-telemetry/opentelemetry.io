---
title: Serviço de Checkout
linkTitle: Checkout
aliases: [checkoutservice]
# prettier-ignore
cSpell:ignore: fatalf otelgrpc otelsarama otlpmetricgrpc otlptracegrpc sarama sdkmetric sdktrace
---

Este serviço é responsável por processar um pedido de checkout do usuário. O
serviço de checkout chamará muitos outros serviços para processar um pedido.

[Código fonte do serviço de checkout](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/checkout/)

## Rastreamentos

### Inicializando Rastreamento

O SDK do OpenTelemetry é inicializado a partir de `main` usando a função `initTracerProvider`.

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

Você deve chamar `TracerProvider.Shutdown()` quando seu serviço for encerrado para
garantir que todos os spans sejam exportados. Este serviço faz essa chamada como parte de uma
função diferida em main

```go
tp := initTracerProvider()
defer func() {
    if err := tp.Shutdown(context.Background()); err != nil {
        log.Printf("Error shutting down tracer provider: %v", err)
    }
}()
```

### Adicionando auto-instrumentação gRPC

Este serviço recebe requisições gRPC, que são instrumentadas na função main
como parte da criação do servidor gRPC.

```go
var srv = grpc.NewServer(
    grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
```

Este serviço fará várias chamadas gRPC de saída, que são todas instrumentadas
envolvendo o cliente gRPC com instrumentação

```go
func createClient(ctx context.Context, svcAddr string) (*grpc.ClientConn, error) {
    return grpc.DialContext(ctx, svcAddr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
    )
}
```

### Adicionando auto-instrumentação Kafka (Sarama)

Este serviço escreverá os resultados processados em um tópico Kafka que será então
processado por outros microsserviços. Para instrumentar o cliente Kafka
o Producer deve ser envolvido após ter sido criado.

```go
saramaConfig := sarama.NewConfig()
producer, err := sarama.NewAsyncProducer(brokers, saramaConfig)
if err != nil {
    return nil, err
}
producer = otelsarama.WrapAsyncProducer(saramaConfig, producer)
```

### Adicionar atributos a spans auto-instrumentados

Dentro da execução de código auto-instrumentado você pode obter o span atual do
contexto.

```go
span := trace.SpanFromContext(ctx)
```

Adicionar atributos a um span é realizado usando `SetAttributes` no objeto
span. Na função `PlaceOrder` vários atributos são adicionados ao span.

```go
span.SetAttributes(
    attribute.String("app.order.id", orderID.String()), shippingTrackingAttribute,
    attribute.Float64("app.shipping.amount", shippingCostFloat),
    attribute.Float64("app.order.amount", totalPriceFloat),
    attribute.Int("app.order.items.count", len(prep.orderItems)),
)
```

### Adicionar eventos de span

Adicionar eventos de span é realizado usando `AddEvent` no objeto span. Na
função `PlaceOrder` vários eventos de span são adicionados. Alguns eventos têm atributos
adicionais, outros não.

Adicionando um evento de span sem atributos:

```go
span.AddEvent("prepared")
```

Adicionando um evento de span com atributos adicionais:

```go
span.AddEvent("charged",
    trace.WithAttributes(attribute.String("app.payment.transaction.id", txID)))
```

## Métricas

### Inicializando Métricas

O SDK do OpenTelemetry é inicializado a partir de `main` usando a função `initMeterProvider`.

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

Você deve chamar `MeterProvider.Shutdown()` quando seu serviço for encerrado para
garantir que todos os registros sejam exportados. Este serviço faz essa chamada como parte de uma
função diferida em main

```go
mp := initMeterProvider()
defer func() {
    if err := mp.Shutdown(context.Background()); err != nil {
        log.Printf("Error shutting down meter provider: %v", err)
    }
}()
```

### Adicionando auto-instrumentação de runtime golang

O runtime do Golang é instrumentado na função main

```go
err := runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second))
if err != nil {
    log.Fatal(err)
}
```

## Logs

Você pode enviar seus logs para o Coletor OpenTelemetry de duas maneiras:

- Diretamente para o Coletor
- Através de um arquivo ou `stdout`

Você pode encontrar documentação especificando como usar ambas essas abordagens na
seção [Logs](/docs/languages/go/instrumentation/#logs) da
documentação [Instrumentação Manual](/docs/languages/go/instrumentation/).

O serviço Checkout envia os logs diretamente para o Coletor e usa uma
ponte de log para enviar seus logs, fazendo ponte para o pacote de logging `slog`, que produz
logs estruturados.

## Inicialização do LoggerProvider

O SDK do OpenTelemetry é inicializado a partir de `main` usando a função `initLoggerProvider`.

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

Chame `LoggerProvider.Shutdown()` quando seu serviço estiver inativo para garantir que todos os logs
sejam exportados. Este serviço faz essa chamada como parte de uma função diferida em
`main`:

```go
lp := initLoggerProvider()
defer func() {
	if err := lp.Shutdown(context.Background()); err != nil {
		logger.Error(fmt.Sprintf("Logger Provider Shutdown: %v", err))
	}
	logger.Info("Shutdown logger provider")
}()
```

### Funcionalidade de logging

Este serviço envia logs para o Coletor usando chamadas gRPC. Os logs são produzidos
em um formato estruturado usando o pacote `slog`.

Primeiro, inicialize o logger:

```go
logger   *slog.Logger
logger = otelslog.NewLogger("checkout")
```

Note o uso de `fmt.Sprintf` para formatar a saída antes de ser enviada para o
logger:

```go
logger.Info(fmt.Sprintf("order confirmation email sent to %q", req.Email))
logger.Warn(fmt.Sprintf("failed to send order confirmation to %q: %+v", req.Email, err))
logger.Error(fmt.Sprintf("Error shutting down logger provider: %v", err))
```

A vantagem de usar `slog` é a capacidade de anexar atributos adicionais à
saída. O seguinte exemplo anexa alguns atributos como `orderID`,
`shippingCost` e `totalPrice`. Isso torna possível visualizar e analisar estes
como parte da saída do log e facilita visualizá-los como colunas separadas
no Grafana:

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
