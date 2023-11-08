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

## OTLP

### Collector Setup

{{% alert title="Note" color="info" %}}

If you have a OTLP collector or backend already set up, you can skip this
section and [setup the OTLP exporter dependencies](#otlp-dependencies) for your
application.

{{% /alert %}}

To try out and verify your OTLP exporters, you can run the collector in a docker
container that writes telemetry directly to the console.

In an empty directory, create a file called `collector-config.yaml` with the
following content:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Now run the collector in a docker container:

```shell
docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
```

This collector is now able to accept telemetry via OTLP. Later you may want to
[configure the collector](/docs/collector/configuration) to send your telemetry
to your observability backend.

### Dependencies {#otlp-dependencies}

If you want to send telemetry data to an OTLP endpoint (like the
[OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) or
[Prometheus](#prometheus)), you can choose between two different protocols to
transport your data:

- [HTTP/protobuf](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)
- [gRPC](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

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

### Usage

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
resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

traceProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="<traces-endpoint>/v1/traces"))
traceProvider.add_span_processor(processor)
trace.set_tracer_provider(traceProvider)

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
resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

traceProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="your-endpoint-here"))
traceProvider.add_span_processor(processor)
trace.set_tracer_provider(traceProvider)

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
resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

traceProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(ConsoleSpanExporter())
traceProvider.add_span_processor(processor)
trace.set_tracer_provider(traceProvider)

reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
meterProvider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(meterProvider)
```

{% alert title="Note" color="note" %}

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

{% /alert %}

## Jaeger

[Jaeger](https://www.jaegertracing.io/) natively supports OTLP to receive trace
data. You can run Jaeger in a docker container with the UI accessible on port
16686 and OTLP enabled on ports 4137 and 4138:

```shell
docker run --rm \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

Now following the instruction to setup the [OTLP exporters](#otlp-dependencies).

## Prometheus

To send your metric data to [Prometheus](https://prometheus.io/), you can either
[enable Prometheus' OTLP Receiver](https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver)
and use the [OTLP exporter](#otlp) or you can use the `PrometheusExporter`.

### Backend Setup {#prometheus-setup}

{{% alert title="Note" color="info" %}}

If you have Prometheus or a Prometheus-compatible backend already set up, you
can skip this section and setup the [Prometheus](#prometheus-dependencies) or
[OTLP](#otlp-dependencies) exporter dependencies for your application.

{{% /alert %}}

You can run [Prometheus](https://prometheus.io) in a docker container,
accessible on port `9090` by following these instructions:

Create a file called `prometheus.yml` with the following content:

```yaml
scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
```

Run Prometheus in a docker container with the UI accessible on port `9090`:

```shell
docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --enable-feature=otlp-write-receive
```

{{% alert title="Note" color="info" %}}

When using Prometheus' OTLP Receiver, make sure that you set the OTLP endpoint
for metrics in your application to `http://localhost:9090/api/v1/otlp`.

Not all docker environments support `host.docker.internal`. In some cases you
may need to replace `host.docker.internal` with `localhost` or the IP address of
your machine.

{{% /alert %}}

### Dependencies {#prometheus-dependencies}

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
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

# Service name is required for most backends
resource = Resource(attributes={
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

## Zipkin

### Backend Setup {#zipkin-setup}

{{% alert title="Note" color="info" %}}

If you have Zipkin or a Zipkin-compatible backend already set up, you can skip
this section and setup the [Zipkin exporter dependencies](#zipkin-dependencies)
for your application.

{{% /alert %}}

You can run [Zipkin](https://zipkin.io/) on in a Docker container by executing
the following command:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

### Dependencies {#zipkin-dependencies}

To send your trace data to [Zipkin](https://zipkin.io/), , you can choose
between two different protocols to transport your data:

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

resource = Resource(attributes={
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

resource = Resource(attributes={
    SERVICE_NAME: "your-service-name"
})

zipkin_exporter = ZipkinExporter(endpoint="http://localhost:9411/api/v2/spans")

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(zipkin_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
```

{{% /tab %}} {{< /tabpane >}}

## Other available exporters

There are many other exporters available. For a list of available exporters, see
the [registry](/ecosystem/registry/?language=python&component=exporter).

Finally, you can also write your own exporter. For more information, see the
[SpanExporter Interface in the API documentation](https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.export.html#opentelemetry.sdk.trace.export.SpanExporter).

## Batching spans

For traces the OpenTelemetry SDK provides a set of default span processors, that
allow you to either emit spans one-by-one or batched. Using the
`BatchSpanProcessor` is recommended, but if you do not want to batch your spans,
you can use the `SimpleSpanProcessor` instead as follows:

```python
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

processor = SimpleSpanProcessor(OTLPSpanExporter(endpoint="your-endpoint-here"))
```
