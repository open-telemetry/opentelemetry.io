---
title: Exporters
weight: 4
---

In order to visualize and analyze your telemetry you will need to use an exporter.

## Console exporter

The console exporter is useful for development and debugging tasks, and is the
simplest to set up.

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

## OTLP endpoint or Collector

To send data to an OTLP endpoint or the [OpenTelemetry
Collector](/docs/collector/getting-started/), you'll want to configure an OTLP
exporter that sends to your endpoint.

First, install an OTLP exporter:

```console
$ pip install opentelemetry-exporter-otlp-proto-http
```

Then you can use it when you initialize tracing:

```python
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
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

### Using gRPC

If you'd prefer to use gRPC, you can install the package:

```console
$ pip install opentelemetry-exporter-otlp-proto-grpc
```

And replace the `OTLPSpanExporter` import declaration with the following:

```python
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
```

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
