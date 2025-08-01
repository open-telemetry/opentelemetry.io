---
title: Експортери
aliases: [exporting_data]
weight: 50
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

## Консоль {#console}

Консольний експортер корисний для розробки та налагодження, і є найпростішим у налаштуванні.

### Консольні трасування {#console-trace}

Пакунок [`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace) містить реалізацію консольного експортера трасування.

### Консольні метрики {#console-metrics}

Пакунок [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric) містить реалізацію консольного експортера метрик.

### Консольні логи (Експериментально) {#console-logs}

Пакунок [`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog) містить реалізацію консольного експортера логів.

## OTLP

Щоб відправити дані трасування на точку доступу OTLP (наприклад, [колектор](/docs/collector) або Jaeger >= v1.35.0), вам потрібно налаштувати OTLP експортер, який відправляє дані на вашу точку доступу.

### OTLP трасування через HTTP {#otlp-trace-over-http}

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp) містить реалізацію OTLP експортера трасування з використанням HTTP з бінарними protobuf навантаженнями.

### OTLP трасування через gRPC {#otlp-trace-over-grpc}

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc) містить реалізацію OTLP експортера трасування з використанням gRPC.

### Jaeger

Щоб спробувати OTLP експортер, з версії v1.35.0 ви можете запустити [Jaeger](https://www.jaegertracing.io/) як точку доступу OTLP для візуалізації трасування в Docker контейнері:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### OTLP метрики через HTTP {#otlp-metrics-over-http}

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp) містить реалізацію OTLP експортера метрик з використанням HTTP з бінарними protobuf навантаженнями.

### OTLP метрики через gRPC {#otlp-metrics-over-grpc}

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc) містить реалізацію OTLP експортера метрик з використанням gRPC.

### OTLP логи через HTTP (Експериментально) {#otlp-logs-over-http-experimental}

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp) містить реалізацію експортера журналів OTLP за допомогою HTTP з двійковим корисним навантаженням protobuf.

### OTLP логи через gRPC (Експериментально) {#otlp-logs-over-grpc-experimental}

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc) містить реалізацію експортера журналів OTLP з використанням gRPC.

## Prometheus (Експериментально) {#prometheus-experimental}

Експортер Prometheus використовується для звітування метрик через HTTP кінцеву точку збору Prometheus.

[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus) містить реалізацію експортера метрик Prometheus.

Щоб дізнатися більше про використання експортера Prometheus, спробуйте [приклад prometheus](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)
