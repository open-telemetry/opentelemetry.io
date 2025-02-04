---
title: Exporters
aliases: [exporting_data]
weight: 50
default_lang_commit: 07431d6e22a33faa6775f2c1f40aa122990dc214
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp promhttp stdoutlog stdouttrace
---

{{% pt/docs/languages/exporters/intro go %}}

## Console

O exportador do console é útil para tarefas de desenvolvimento e depuração, e é
o mais simples de configurar.

### Rastros no Console {#console-traces}

O pacote
[`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace)
possui uma implementação do Exporter de Rastros para o console.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/sdk/trace"
)

func newExporter() (trace.SpanExporter, error) {
	return stdouttrace.New()
}
```

### Métricas no Console {#console-metrics}

O pacote
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric)
possui uma implementação do Exporter de Métricas para o console.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter() (metric.Exporter, error) {
	return stdoutmetric.New()
}
```

### Logs no Console (Experimental) {#console-logs}

O pacote
[`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog)
possui uma implementação do Exporter de Logs para o console.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
	"go.opentelemetry.io/otel/exporters/stdout/stdoutlog"
	"go.opentelemetry.io/otel/sdk/log"
)

func newExporter() (log.Exporter, error) {
	return stdoutlog.New()
}
```

## OTLP

Para enviar dados de rastreamento para um endpoint OTLP (como o
[collector](/docs/collector) ou Jaeger >= v1.35.0), você precisará configurar um
Exporter OTLP que envie os dados para o seu endpoint.

### Rastros OTLP via HTTP {#otlp-traces-over-http}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)
possui uma implementação do Exporter de Rastros OTLP utilizando o protocolo HTTP
com payloads binários protobuf.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/trace"
)

func newExporter(ctx context.Context) (trace.SpanExporter, error) {
	return otlptracehttp.New(ctx)
}
```

### Rastros OTLP via gRPC {#otlp-traces-over-grpc}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc)
possui uma implementação do Exporter de Rastros OTLP utilizando o protocolo
gRPC.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
 	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/trace"
)

func newExporter(ctx context.Context) (trace.SpanExporter, error) {
	return otlptracegrpc.New(ctx)
}
```

### Jaeger

Para testar o exportador OTLP, a partir da versão v1.35.0 você pode executar o
[Jaeger](https://www.jaegertracing.io/) como um endpoint OTLP e visualizar os
rastros em um contêiner Docker:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### Métricas OTLP via HTTP {#otlp-metrics-over-http}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp)
possui uma implementação do Exporter de Métricas OTLP utilizando o protocolo
HTTP com payloads binários protobuf.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
 	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter(ctx context.Context) (metric.Exporter, error) {
	return otlpmetrichttp.New(ctx)
}
```

### Métricas OTLP via gRPC {#otlp-metrics-over-grpc}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc)
possui uma implementação do Exporter de Métricas OTLP utilizando o protocolo
gRPC.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
 	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter(ctx context.Context) (metric.Exporter, error) {
	return otlpmetricgrpc.New(ctx)
}
```

## Prometheus (Experimental)

O Exporter do Prometheus é utilizado para reportar métricas através do
_scraping_ realizado pelo Prometheus em um endpoint HTTP.

O pacote
[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus)
possui uma implementação do Exporter de Métricas do Prometheus.

Por exemplo, aqui está como é possível criar um Exporter (que também é um leitor
de métricas) com as configurações padrão:

```go
import (
 	"context"

	"go.opentelemetry.io/otel/exporters/prometheus"
	"go.opentelemetry.io/otel/sdk/metric"
)

func newExporter(ctx context.Context) (metric.Reader, error) {
	// prometheus.DefaultRegisterer é utilizado por padrão, de modo que
	// as métricas fiquem disponíveis via promhttp.Handler.
	return prometheus.New()
}
```

Para saber mais sobre como usar o Exporter do Prometheus, veja o
[exemplo do prometheus](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)

### Logs OTLP via HTTP (Experimental) {#otlp-logs-over-http-experimental}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp)
possui uma implementação do Exporter de Logs OTLP utilizando o protocolo HTTP
com payloads binários protobuf.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
 	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/sdk/log"
)

func newExporter(ctx context.Context) (log.Exporter, error) {
	return otlploghttp.New(ctx)
}
```

### Logs OTLP via gRPC (Experimental) {#otlp-logs-over-grpc-experimental}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc)
possui uma implementação do Exporter de Logs OTLP utilizando o protocolo gRPC.

Por exemplo, aqui está como é possível criar um Exporter com as configurações
padrão:

```go
import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/sdk/log"
)

func newExporter(ctx context.Context) (log.Exporter, error) {
	return otlploggrpc.New(ctx)
}
```
