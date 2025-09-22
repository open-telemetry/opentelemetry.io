---
title: Serviço de Catálogo de Produtos
linkTitle: Catálogo de Produtos
aliases: [productcatalogservice]
# prettier-ignore
cSpell:ignore: fatalf otelcodes otelgrpc otlpmetricgrpc otlptracegrpc sdkmetric sdktrace sprintf
---

Este serviço é responsável por retornar informações sobre produtos. O serviço
pode ser usado para obter todos os produtos, pesquisar por produtos específicos, ou retornar detalhes
sobre qualquer produto individual.

[Código fonte do serviço de catálogo de produtos](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/product-catalog/)

## Rastreamentos

### Inicializando Rastreamento

O SDK do OpenTelemetry é inicializado a partir de `main` usando a função `initTracerProvider`.

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

Você deve chamar `TracerProvider.Shutdown()` quando seu serviço for encerrado para
garantir que todos os spans sejam exportados. Este serviço faz essa chamada como parte de uma
função diferida em main

```go
tp := InitTracerProvider()
defer func() {
    if err := tp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Tracer Provider Shutdown: %v", err)
    }
}()
```

### Adicionando auto-instrumentação gRPC

Este serviço recebe requisições gRPC, que são instrumentadas na função main
como parte da criação do servidor gRPC.

```go
srv := grpc.NewServer(
    grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
```

Este serviço fará chamadas gRPC de saída, que são todas instrumentadas
envolvendo o cliente gRPC com instrumentação.

```go
func createClient(ctx context.Context, svcAddr string) (*grpc.ClientConn, error) {
    return grpc.DialContext(ctx, svcAddr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
    )
}
```

### Adicionar atributos a spans auto-instrumentados

Dentro da execução de código auto-instrumentado você pode obter o span atual do
contexto.

```go
span := trace.SpanFromContext(ctx)
```

Adicionar atributos a um span é realizado usando `SetAttributes` no objeto
span. Na função `GetProduct` um atributo para o ID do produto é adicionado ao
span.

```go
span.SetAttributes(
    attribute.String("app.product.id", req.Id),
)
```

### Definir status do span

Este serviço pode capturar e tratar uma condição de erro baseada em uma feature flag. Em
uma condição de erro, o status do span é definido adequadamente usando `SetStatus` no
objeto span. Você pode ver isso na função `GetProduct`.

```go
msg := fmt.Sprintf("Error: ProductCatalogService Fail Feature Flag Enabled")
span.SetStatus(otelcodes.Error, msg)
```

### Adicionar eventos de span

Adicionar eventos de span é realizado usando `AddEvent` no objeto span. Na
função `GetProduct` um evento de span é adicionado quando uma condição de erro é tratada,
ou quando um produto é encontrado com sucesso.

```go
span.AddEvent(msg)
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

Você deve chamar `initMeterProvider.Shutdown()` quando seu serviço for encerrado para
garantir que todos os registros sejam exportados. Este serviço faz essa chamada como parte de uma
função diferida em main.

```go
mp := initMeterProvider()
defer func() {
    if err := mp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Error shutting down meter provider: %v", err)
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

O serviço Product Catalog envia os logs diretamente para o Coletor e usa uma
ponte de log para enviar seus logs, fazendo ponte para o pacote de logging `slog`, que
produz logs estruturados.

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
logger = otelslog.NewLogger("product-catalog")
```

Note o uso de `fmt.Sprintf` para formatar a saída antes de ser enviada para o
logger:

```go
logger.Info("Loading Product Catalog...")
logger.Info(fmt.Sprintf("Product Catalog reload interval: %d", interval))
logger.Error(fmt.Sprintf("Error shutting down meter provider: %v", err))
```

A vantagem de usar `slog` é a capacidade de anexar atributos adicionais à
saída. O seguinte exemplo anexa os atributos `product.name` e `product.id`.
Isso torna possível visualizar e analisar estes como parte da saída do log e facilita visualizá-los como colunas separadas
no Grafana:

```go
logger.LogAttrs(
	ctx,
	slog.LevelInfo, "Product Found",
	slog.String("app.product.name", found.Name),
	slog.String("app.product.id", req.Id),
)
```
