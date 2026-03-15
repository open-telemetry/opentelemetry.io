---
title: Експортери
aliases: [exporting_data]
weight: 50
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: autoexport otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp sdkmetric sdktrace stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

## Автоматична конфігурація експортера за допомогою змінних середовища {#automatic-exporter-configuration-with-environment-variables}

Ви можете використовувати пакунок [`go.opentelemetry.io/contrib/exporters/autoexport`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport) для автоматичної конфігурації експортерів за допомогою [стандартних змінних середовища OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/).

Цей пакунок надає функції фабрики, які зчитують змінні середовища **селектора експортера** для вибору та ініціалізації відповідного експортера під час виконання:

| Функція                                                                                                  | Змінна середовища       | Опис                       |
| -------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------- |
| [`NewSpanExporter`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewSpanExporter) | `OTEL_TRACES_EXPORTER`  | Створює експорт трасування |
| [`NewMetricReader`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewMetricReader) | `OTEL_METRICS_EXPORTER` | Створює читача метрик      |
| [`NewLogExporter`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewLogExporter)   | `OTEL_LOGS_EXPORTER`    | Створює експорт журналів   |

Підтримувані значення для змінних селектора — `otlp` (стандартно) та `none`. Для `OTEL_METRICS_EXPORTER` також підтримується `prometheus`. Після вибору експортера його конфігурація (точка доступу, заголовки, час очікування, протокол тощо) зчитується з стандартних [змінних середовища експортера OTLP](/docs/languages/sdk-configuration/otlp-exporter/) базовим пакунком експорту OTLP.

Приклад використання:

```go
import (
	"context"

	"go.opentelemetry.io/contrib/exporters/autoexport"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func main() {
	ctx := context.Background()

	// Створити експортер трасування за допомогою змінних середовища
	spanExporter, err := autoexport.NewSpanExporter(ctx)
	if err != nil {
		// обробка помилок
	}

	// Створити постачальника трасування з експортером
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(spanExporter),
	)

	// Створити читача метрик за допомогою змінних середовища
	metricReader, err := autoexport.NewMetricReader(ctx)
	if err != nil {
		// обробка помилок
	}

	// Створити постачальника метрик з читачем
	meterProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(metricReader),
	)
}
```

{{% alert title="Примітка" color="info" %}}

Стандартні пакунки експортера OTLP (`otlptracegrpc`, `otlptracehttp` тощо) вже читають більшість змінних середовища OTLP, таких як `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`, `OTEL_EXPORTER_OTLP_TIMEOUT` та `OTEL_EXPORTER_OTLP_COMPRESSION`.

Пакунок `autoexport` додає підтримку **змінних селектора експортера** (`OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER`, `OTEL_LOGS_EXPORTER`), які вибирають, _яку_ реалізацію експортера використовувати. Це розділення дозволяє зменшити розмір бінарних файлів, оскільки залежності експортера (наприклад, gRPC) не обʼєднуються, якщо їх явно не імпортувати.

Також зверніть увагу, що `OTEL_SDK_DISABLED` наразі не підтримується Go SDK.

{{% /alert %}}

Повний перелік змінних середовища, що підтримуються Go SDK та пакунками contrib, див. у [матриці відповідності специфікаціям OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

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
