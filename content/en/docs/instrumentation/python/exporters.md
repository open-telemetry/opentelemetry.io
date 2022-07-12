---
title: Exporters
weight: 4
---

In order to visualize and analyze your telemetry you will need to use an exporter.

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

Use a [`PeriodicExportingMetricReader`][pemr] to periodically print metrics to the console.
`PeriodicExportingMetricReader` can be configured to export at a different interval, change the
[temporality](/docs/reference/specification/metrics/datamodel/#temporality) for each instrument
kind, or change the default aggregation for each instrument kind.

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

To send data to an OTLP endpoint or the [OpenTelemetry
Collector](/docs/collector/getting-started/), you'll want to configure an OTLP
exporter that sends to your endpoint.

First, install an OTLP exporter:

```console
$ pip install opentelemetry-exporter-otlp-proto-grpc
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

If you'd prefer to use [OTLP/HTTP](/docs/reference/specification/protocol/otlp/#otlphttp) with
the binary-encoded Protobuf format, you can install the package:

```console
$ pip install opentelemetry-exporter-otlp-proto-http
```

And replace the import declarations with the following:

```python
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
```

There is not currently an OTLP/HTTP metric exporter.

## Jaeger

If you are using [Jaeger](https://www.jaegertracing.io/) to visualize trace
data, you'll need to set it up first. This is how to run it in a docker
container:

```console
$ docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 14250:14250 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

Next, install the Jaeger exporter package:

```console
$ pip install opentelemetry-exporter-jaeger
```

Then you can configure the exporter when initializing tracing:

```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(jaeger_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Merrily go about tracing!
```

### Using Thrift

If you'd prefer to use Thrift as the protocol, you can install the package:

```console
$ pip install opentelemetry-exporter-jaeger-thrift
```

And replace the `JaegerExporter` import declaration with the following:

```python
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
```

## Zipkin

If you are using [Zipkin](https://zipkin.io/) to visualize trace data, you'll
need to set it up first. This is how to run it in a docker container:

```console
$ docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Next, install the Zipkin exporter package:

```console
$ pip install opentelemetry-exporter-zipkin-proto-http
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

```console
$ pip install opentelemetry-exporter-zipkin-json
```

And replace the `ZipkinExporter` import declaration with the following:

```python
from opentelemetry.exporter.zipkin.json import ZipkinExporter
```

## Prometheus

If you are using [Prometheus](https://prometheus.io/) to collect metrics data, you'll need to
set it up first.

First create a config file:
```console
$ cat > prometheus.yml <<EOF
scrape_configs:
  - job_name: 'otel-python-demo'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:8000']
EOF
```

Then start the Prometheus server in Docker:
```console
$ docker run -d --rm \
    --network=host \
    -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

Next, install the Prometheus exporter package:

```console
$ pip install opentelemetry-exporter-prometheus
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

[pemr]: https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.export.html#opentelemetry.sdk.metrics.export.PeriodicExportingMetricReader
