---
title: Exporters
aliases: [exporting_data]
weight: 50
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
# prettier-ignore
cSpell:ignore: autoexport otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp sdkmetric sdktrace stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

## Configuração automática de exporters com variáveis de ambiente {#automatic-exporter-configuration-with-environment-variables}

Você pode utilizar o pacote
[`go.opentelemetry.io/contrib/exporters/autoexport`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport)
para configurar exporters automaticamente utilizando as
[variáveis de ambiente padrão do OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/).

Este pacote fornece funções de fábrica que leem as variáveis de ambiente de
**seleção de exporter** para selecionar e inicializar o exporter apropriado em
tempo de execução:

| Função                                                                                                   | Variável de ambiente    | Descrição                   |
| -------------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------- |
| [`NewSpanExporter`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewSpanExporter) | `OTEL_TRACES_EXPORTER`  | Cria um exporter de rastros |
| [`NewMetricReader`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewMetricReader) | `OTEL_METRICS_EXPORTER` | Cria um leitor de métricas  |
| [`NewLogExporter`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewLogExporter)   | `OTEL_LOGS_EXPORTER`    | Cria um exporter de logs    |

Os valores suportados para as variáveis de seleção são `otlp` (padrão) e `none`.
Para `OTEL_METRICS_EXPORTER`, `prometheus` também é suportado. Uma vez que um
exporter é selecionado, sua configuração (endpoint, cabeçalhos, tempo limite,
protocolo, etc.) é lida a partir das
[variáveis de ambiente padrão do exporter OTLP](/docs/languages/sdk-configuration/otlp-exporter/)
pelo pacote do exporter OTLP subjacente.

Exemplo de uso:

```go
import (
	"context"

	"go.opentelemetry.io/contrib/exporters/autoexport"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func main() {
	ctx := context.Background()

	// Create trace exporter using environment variables
	spanExporter, err := autoexport.NewSpanExporter(ctx)
	if err != nil {
		// handle error
	}

	// Create trace provider with the exporter
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(spanExporter),
	)

	// Create metric reader using environment variables
	metricReader, err := autoexport.NewMetricReader(ctx)
	if err != nil {
		// handle error
	}

	// Create meter provider with the reader
	meterProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(metricReader),
	)
}
```

> [!NOTE]
>
> Os pacotes padrão de exporters OTLP (`otlptracegrpc`, `otlptracehttp`, etc.)
> já leem a maioria das variáveis de ambiente OTLP, como
> `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`,
> `OTEL_EXPORTER_OTLP_TIMEOUT` e `OTEL_EXPORTER_OTLP_COMPRESSION`.
>
> O pacote `autoexport` adiciona suporte às **variáveis de seleção de exporter**
> (`OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER`, `OTEL_LOGS_EXPORTER`), que
> escolhem _qual_ implementação de exporter utilizar. Essa separação mantém os
> binários menores, pois não inclui dependências de exporters (como gRPC), a
> menos que sejam importadas explicitamente.
>
> Observe também que `OTEL_SDK_DISABLED` ainda não é suportada pelo SDK de Go.

Para uma visão geral completa de quais variáveis de ambiente são suportadas pelo
SDK de Go e pelos pacotes contrib, consulte a
[matriz de conformidade da especificação do OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

## Console

O exportador do console é útil para tarefas de desenvolvimento e depuração, e é
o mais simples de configurar.

### Rastros no Console {#console-traces}

O pacote
[`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace)
possui uma implementação do Exporter de Rastros para o console.

### Métricas no Console {#console-metrics}

O pacote
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric)
possui uma implementação do Exporter de Métricas para o console.

### Logs no Console (Experimental) {#console-logs}

O pacote
[`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog)
possui uma implementação do Exporter de Logs para o console.

## OTLP

Para enviar dados de rastreamento para um endpoint OTLP (como o
[collector](/docs/collector) ou Jaeger >= v1.35.0), você precisará configurar um
Exporter OTLP que envie os dados para o seu endpoint.

### Rastros OTLP via HTTP {#otlp-traces-over-http}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)
possui uma implementação do Exporter de Rastros OTLP utilizando o protocolo HTTP
com payloads binários protobuf.

### Rastros OTLP via gRPC {#otlp-traces-over-grpc}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc)
possui uma implementação do Exporter de Rastros OTLP utilizando o protocolo
gRPC.

### Jaeger

Para testar o exportador OTLP, a partir da versão v1.35.0 você pode executar o
[Jaeger](https://www.jaegertracing.io/) como um endpoint OTLP e visualizar os
rastros em um contêiner Docker:

```shell
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/jaeger:latest
```

### Métricas OTLP via HTTP {#otlp-metrics-over-http}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp)
possui uma implementação do Exporter de Métricas OTLP utilizando o protocolo
HTTP com payloads binários protobuf.

### Métricas OTLP via gRPC {#otlp-metrics-over-grpc}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc)
possui uma implementação do Exporter de Métricas OTLP utilizando o protocolo
gRPC.

### Logs OTLP via HTTP (Experimental) {#otlp-logs-over-http-experimental}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp)
possui uma implementação do Exporter de Logs OTLP utilizando o protocolo HTTP
com payloads binários protobuf.

### Logs OTLP via gRPC (Experimental) {#otlp-logs-over-grpc-experimental}

O pacote
[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc)
possui uma implementação do Exporter de Logs OTLP utilizando o protocolo gRPC.

## Prometheus (Experimental)

O Exporter do Prometheus é utilizado para reportar métricas através do
_scraping_ realizado pelo Prometheus em um endpoint HTTP.

O pacote
[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus)
possui uma implementação do Exporter de Métricas do Prometheus.

Para saber mais sobre como usar o Exporter do Prometheus, veja o
[exemplo do prometheus](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)
