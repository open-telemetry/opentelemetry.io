---
title: Exporters
aliases: [exporting_data]
weight: 50
default_lang_commit: 351727ae36f706eb80583ada2b589de263aa72c2
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

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
