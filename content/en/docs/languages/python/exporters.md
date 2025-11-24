---
title: Exporters
weight: 50
description: Process and export your telemetry data
cSpell:ignore: LOWMEMORY
---

{{% docs/languages/exporters/intro %}}

## Dependencies {#otlp-dependencies}

If you want to send telemetry data to an OTLP endpoint (like the
[OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) or
[Prometheus](#prometheus)), you can choose between two different protocols to
transport your data:

- [HTTP/protobuf](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)
- [gRPC](https://pypi.org/project/opentelemetry-exporter-otlp-proto-grpc/)

Start by installing the respective exporter packages as a dependency for your
project:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
pip install opentelemetry-exporter-otlp-proto-http
```

{{% /tab %}} {{% tab gRPC %}}

```shell
pip install opentelemetry-exporter-otlp-proto-grpc
```

{{% /tab %}} {{< /tabpane >}}

## Usage

Next, configure the exporter to point at an OTLP endpoint in your code.

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

## Console

To debug your instrumentation or see the values locally in development, you can
use exporters writing telemetry data to the console (stdout).

The `ConsoleSpanExporter` and `ConsoleMetricExporter` are included in the
`opentelemetry-sdk` package.

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

{{% alert title="Note" %}}

There are temporality presets for each instrumentation kind. These presets can
be set with the environment variable
`OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE`, for example:

```sh
export OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE="DELTA"
```

The default value for `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` is
`"CUMULATIVE"`.

The available values and their corresponding settings for this environment
variable are:

- `CUMULATIVE`
  - `Counter`: `CUMULATIVE`
  - `UpDownCounter`: `CUMULATIVE`
  - `Histogram`: `CUMULATIVE`
  - `ObservableCounter`: `CUMULATIVE`
  - `ObservableUpDownCounter`: `CUMULATIVE`
  - `ObservableGauge`: `CUMULATIVE`

- `DELTA`
  - `Counter`: `DELTA`
  - `UpDownCounter`: `CUMULATIVE`
  - `Histogram`: `DELTA`
  - `ObservableCounter`: `DELTA`
  - `ObservableUpDownCounter`: `CUMULATIVE`
  - `ObservableGauge`: `CUMULATIVE`

- `LOWMEMORY`
  - `Counter`: `DELTA`
  - `UpDownCounter`: `CUMULATIVE`
  - `Histogram`: `DELTA`
  - `ObservableCounter`: `CUMULATIVE`
  - `ObservableUpDownCounter`: `CUMULATIVE`
  - `ObservableGauge`: `CUMULATIVE`

Setting `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` to any other value
than `CUMULATIVE`, `DELTA` or `LOWMEMORY` will log a warning and set this
environment variable to `CUMULATIVE`.

{{% /alert %}}

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

## Dependencies {#prometheus-dependencies}

Install the
[exporter package](https://pypi.org/project/opentelemetry-exporter-prometheus/)
as a dependency for your application:

```sh
pip install opentelemetry-exporter-prometheus
```

Update your OpenTelemetry configuration to use the exporter and to send data to
your Prometheus backend:

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

# Start Prometheus client
start_http_server(port=9464, addr="localhost")
# Initialize PrometheusMetricReader which pulls metrics from the SDK
# on-demand to respond to scrape requests
reader = PrometheusMetricReader()
provider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(provider)
```

With the above you can access your metrics at <http://localhost:9464/metrics>.
Prometheus or an OpenTelemetry Collector with the Prometheus receiver can scrape
the metrics from this endpoint.

{{% include "exporters/zipkin-setup.md" %}}

## Dependencies {#zipkin-dependencies}

To send your trace data to [Zipkin](https://zipkin.io/), you can choose between
two different protocols to transport your data:

- [HTTP/protobuf](https://pypi.org/project/opentelemetry-exporter-zipkin-proto-http/)
- [Thrift](https://pypi.org/project/opentelemetry-exporter-zipkin-json/)

Install the exporter package as a dependency for your application:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
pip install opentelemetry-exporter-zipkin-proto-http
```

{{% /tab %}} {{% tab Thrift %}}

```shell
pip install opentelemetry-exporter-zipkin-json
```

{{% /tab %}} {{< /tabpane >}}

Update your OpenTelemetry configuration to use the exporter and to send data to
your Zipkin backend:

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
