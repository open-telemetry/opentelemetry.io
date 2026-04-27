---
title: Експортери
weight: 50
description: Обробка та експорт ваших телеметричних даних
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: LOWMEMORY
---

{{% docs/languages/exporters/intro %}}

## Залежності {#otlp-dependencies}

Якщо ви хочете надсилати телеметричні дані на точку доступу OTLP (наприклад, [OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) або [Prometheus](#prometheus)), ви можете вибрати між двома різними протоколами для транспортування ваших даних:

- [HTTP/protobuf](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)
- [gRPC](https://pypi.org/project/opentelemetry-exporter-otlp-proto-grpc/)

Почніть з встановлення відповідних пакунків експортерів як залежності для вашого проєкту:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
pip install opentelemetry-exporter-otlp-proto-http
```

{{% /tab %}} {{% tab gRPC %}}

```shell
pip install opentelemetry-exporter-otlp-proto-grpc
```

{{% /tab %}} {{< /tabpane >}}

### Використання {#usage}

Далі налаштуйте експортер для вказівки на кінцеву точку OTLP у вашому коді.

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```python
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader

# Service name is required for most backends
resource = Resource.create(attributes={
    SERVICE_NAME: "your-service-name"
})

tracerProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="<traces-endpoint>/v1/traces"))
tracerProvider.add_span_processor(processor)
trace.set_tracer_provider(tracerProvider)

reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint="<traces-endpoint>/v1/metrics")
)
meterProvider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(meterProvider)
```

{{% /tab %}} {{% tab gRPC %}}

```python
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader

# Service name is required for most backends
resource = Resource.create(attributes={
    SERVICE_NAME: "your-service-name"
})

tracerProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="your-endpoint-here"))
tracerProvider.add_span_processor(processor)
trace.set_tracer_provider(tracerProvider)

reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint="localhost:5555")
)
meterProvider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(meterProvider)
```

{{% /tab %}} {{< /tabpane >}}

## Консоль {#console}

Щоб налагодити вашу інструментацію або побачити значення локально під час розробки, ви можете використовувати експортери, що записують телеметричні дані в консоль (stdout).

`ConsoleSpanExporter` та `ConsoleMetricExporter` включені в пакунок `opentelemetry-sdk`.

```python
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader, ConsoleMetricExporter

# Service name is required for most backends,
# and although it's not necessary for console export,
# it's good to set service name anyways.
resource = Resource.create(attributes={
    SERVICE_NAME: "your-service-name"
})

tracerProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(ConsoleSpanExporter())
tracerProvider.add_span_processor(processor)
trace.set_tracer_provider(tracerProvider)

reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
meterProvider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(meterProvider)
```

> [!NOTE]
>
> Існують пресети темпоральності для кожного виду інструментації. Ці пресети можуть бути встановлені за допомогою змінної середовища `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE`, наприклад:
>
> ```sh
> export OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE="DELTA"
> ```
>
> Стандартне значення для `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` — `"CUMULATIVE"`.
>
> Доступні значення та їх відповідні налаштування для цієї змінної середовища:
>
> - `CUMULATIVE`
>   - `Counter`: `CUMULATIVE`
>   - `UpDownCounter`: `CUMULATIVE`
>   - `Histogram`: `CUMULATIVE`
>   - `ObservableCounter`: `CUMULATIVE`
>   - `ObservableUpDownCounter`: `CUMULATIVE`
>   - `ObservableGauge`: `CUMULATIVE`
> - `DELTA`
>   - `Counter`: `DELTA`
>   - `UpDownCounter`: `CUMULATIVE`
>   - `Histogram`: `DELTA`
>   - `ObservableCounter`: `DELTA`
>   - `ObservableUpDownCounter`: `CUMULATIVE`
>   - `ObservableGauge`: `CUMULATIVE`
> - `LOWMEMORY`
>   - `Counter`: `DELTA`
>   - `UpDownCounter`: `CUMULATIVE`
>   - `Histogram`: `DELTA`
>   - `ObservableCounter`: `CUMULATIVE`
>   - `ObservableUpDownCounter`: `CUMULATIVE`
>   - `ObservableGauge`: `CUMULATIVE`
>
> Встановлення `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` на будь-яке інше значення, ніж `CUMULATIVE`, `DELTA` або `LOWMEMORY`, призведе до логування попередження та встановлення цієї змінної середовища на `CUMULATIVE`.

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

### Залежності {#prometheus-dependencies}

Встановіть [пакунок експортера](https://pypi.org/project/opentelemetry-exporter-prometheus/) як залежність для вашого застосунку:

```sh
pip install opentelemetry-exporter-prometheus
```

Оновіть вашу конфігурацію OpenTelemetry для використання експортера та надсилання даних до вашого бекенду Prometheus:

```python
from prometheus_client import start_http_server

from opentelemetry import metrics
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

# Service name is required for most backends
resource = Resource.create(attributes={
    SERVICE_NAME: "your-service-name"
})

# Запустіть клієнта Prometheus
start_http_server(port=9464, addr="localhost")
# Initialize PrometheusMetricReader which pulls metrics from the SDK
# on-demand to respond to scrape requests
reader = PrometheusMetricReader()
provider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(provider)
```

З вищенаведеним ви можете отримати доступ до ваших метрик за адресою <http://localhost:9464/metrics>. Prometheus або OpenTelemetry Collector з приймачем Prometheus можуть збирати метрики з цієї точки доступу.

{{% include "exporters/zipkin-setup.md" %}}

### Залежності {#zipkin-dependencies}

Щоб надсилати ваші дані трасування до [Zipkin](https://zipkin.io/), ви можете вибрати між двома різними протоколами для транспортування ваших даних:

- [HTTP/protobuf](https://pypi.org/project/opentelemetry-exporter-zipkin-proto-http/)
- [Thrift](https://pypi.org/project/opentelemetry-exporter-zipkin-json/)

Встановіть пакунок експортера як залежність для вашого застосунку:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
pip install opentelemetry-exporter-zipkin-proto-http
```

{{% /tab %}} {{% tab Thrift %}}

```shell
pip install opentelemetry-exporter-zipkin-json
```

{{% /tab %}} {{< /tabpane >}}

Оновіть вашу конфігурацію OpenTelemetry для використання експортера та надсилання даних до вашого бекенду Zipkin:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```python
from opentelemetry import trace
from opentelemetry.exporter.zipkin.proto.http import ZipkinExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

resource = Resource.create(attributes={
    SERVICE_NAME: "your-service-name"
})

zipkin_exporter = ZipkinExporter(endpoint="http://localhost:9411/api/v2/spans")

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(zipkin_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
```

{{% /tab %}} {{% tab Thrift %}}

```python
from opentelemetry import trace
from opentelemetry.exporter.zipkin.json import ZipkinExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

resource = Resource.create(attributes={
    SERVICE_NAME: "your-service-name"
})

zipkin_exporter = ZipkinExporter(endpoint="http://localhost:9411/api/v2/spans")

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(zipkin_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
```

{{% /tab %}} {{< /tabpane >}}

{{% include "exporters/outro.md" `https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.export.html#opentelemetry.sdk.trace.export.SpanExporter` %}}

```python
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

processor = SimpleSpanProcessor(OTLPSpanExporter(endpoint="your-endpoint-here"))
```
