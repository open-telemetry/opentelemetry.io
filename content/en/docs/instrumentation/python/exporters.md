---
title: Exporters
weight: 50
cSpell:ignore: LOWMEMORY
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/instrumentation/exporters-intro python %}}

{{% alert title="Note" color="info" %}}

If you use the Python agent for
[automatic instrumentation](/docs/instrumentation/python/automatic) you can
learn how to setup exporters following the
[Agent Configuration Guide](/docs/instrumentation/python/automatic/agent-config/)

{{% /alert %}}

## Console exporter

The console exporter is useful for development and debugging tasks, and is the
simplest to set up.

### Trace

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

# Service name is required for most backends,
# and although it's not necessary for console export,
# it's good to set service name anyways.
resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Merrily go about tracing!
```

### Metrics

Use a [`PeriodicExportingMetricReader`][pemr] to periodically print metrics to
the console. `PeriodicExportingMetricReader` can be configured to export at a
different interval, change the
[temporality](/docs/specs/otel/metrics/data-model/#temporality) for each
instrument kind, or change the default aggregation for each instrument kind.

#### Temporality Presets

There are temporality presets for each instrumentation kind. These presets can
be set with the environment variable
`OTEL_EXPORTER_METRICS_TEMPORALITY_PREFERENCE`, for example:

```sh
export OTEL_EXPORTER_METRICS_TEMPORALITY_PREFERENCE="DELTA"
```

The default value for `OTEL_EXPORTER_METRICS_TEMPORALITY_PREFERENCE` is
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

Setting `OTEL_EXPORTER_METRICS_TEMPORALITY_PREFERENCE` to any other value than
`CUMULATIVE`, `DELTA` or `LOWMEMORY` will log a warning and set this environment
variable to `CUMULATIVE`.

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader, ConsoleMetricExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

# Service name is required for most backends,
# and although it's not necessary for console export,
# it's good to set service name anyways.
resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
provider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(provider)
```

## OTLP endpoint or Collector

To send data to an OTLP endpoint or the
[OpenTelemetry Collector](/docs/collector/getting-started/), you'll want to
configure an OTLP exporter that sends to your endpoint.

First, install an OTLP exporter:

```sh
pip install opentelemetry-exporter-otlp-proto-grpc
```

### Trace

```python
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Service name is required for most backends
resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="your-endpoint-here"))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Merrily go about tracing!
```

### Metrics

```python
from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

# Service name is required for most backends
resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint="localhost:5555")
)
provider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(provider)
```

### Using HTTP

If you'd prefer to use [OTLP/HTTP](/docs/specs/otlp/#otlphttp) with the
binary-encoded protobuf format, you can install the package:

```sh
pip install opentelemetry-exporter-otlp-proto-http
```

Next, replace the import declarations with the following:

```python
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
```

Finally, update your exporter endpoint if you're specifying it in code:

```python
OTLPSpanExporter(endpoint="<traces-endpoint>/v1/traces")
```

There is not currently an OTLP/HTTP metric exporter.

## Jaeger

[Jaeger](https://jaegertracing.io) natively supports OTLP. Follow the
instructions on
[setting up the OTLP exporter above](#otlp-endpoint-or-collector). You can then
run Jaeger in a docker container with the UI accessible on port 16686 and OTLP
enabled on ports 4137 and 4138:

```shell
docker run --rm \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

## Zipkin

If you are using [Zipkin](https://zipkin.io/) to visualize trace data, you'll
need to set it up first. This is how to run it in a docker container:

```sh
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Next, install the Zipkin exporter package:

```sh
pip install opentelemetry-exporter-zipkin-proto-http
```

Then you can configure the exporter when initializing tracing:

```python
from opentelemetry import trace
from opentelemetry.exporter.zipkin.proto.http import ZipkinExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

zipkin_exporter = ZipkinExporter(endpoint="http://localhost:9411/api/v2/spans")

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(zipkin_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# merrily go about tracing!
```

### Using JSON

If you'd prefer to use Thrift as the protocol, you can install the package:

```sh
pip install opentelemetry-exporter-zipkin-json
```

And replace the `ZipkinExporter` import declaration with the following:

```python
from opentelemetry.exporter.zipkin.json import ZipkinExporter
```

## Prometheus

If you are using [Prometheus](https://prometheus.io/) to collect metrics data,
you'll need to set it up first.

First create a config file:

```bash
cat > prometheus.yml <<EOF
scrape_configs:
  - job_name: 'otel-python-demo'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:8000']
EOF
```

Then start the Prometheus server in Docker:

```sh
docker run -d --rm \
    --network=host \
    -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

Next, install the Prometheus exporter package:

```sh
pip install opentelemetry-exporter-prometheus
```

Then you can configure the exporter when initializing metrics:

```python
from prometheus_client import start_http_server

from opentelemetry import metrics
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

# Service name is required for most backends
resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

# Start Prometheus client
start_http_server(port=8000, addr="localhost")
# Initialize PrometheusMetricReader which pulls metrics from the SDK
# on-demand to respond to scrape requests
reader = PrometheusMetricReader()
provider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(provider)
```

[pemr]:
  https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.export.html#opentelemetry.sdk.metrics.export.PeriodicExportingMetricReader
