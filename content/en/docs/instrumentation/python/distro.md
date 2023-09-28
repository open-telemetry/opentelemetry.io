---
cSpell:ignore: configurator distro distros loglevel
title: OpenTelemetry Distro
linkTitle: Distro
weight: 110
---

In order to make using OpenTelemetry and auto-instrumentation as quick as
possible without sacrificing flexibility, OpenTelemetry distros provide a
mechanism to automatically configure some of the more common options for users.
By harnessing their power, users of OpenTelemetry can configure the components
as they need. The `opentelemetry-distro` package provides some defaults to users
looking to get started, it configures:

- the SDK TracerProvider
- a BatchSpanProcessor
- the OTLP `SpanExporter` to send data to an OpenTelemetry Collector

The package also provides a starting point for anyone interested in producing an
alternative distro. The interfaces implemented by the package are loaded by the
auto-instrumentation via the `opentelemetry_distro` and
`opentelemetry_configurator` entry points to configure the application before
any other code is executed.

In order to automatically export data from OpenTelemetry to the OpenTelemetry
collector, installing the package will set up all the required entry points.

```sh
pip install opentelemetry-distro[otlp] opentelemetry-instrumentation
```

Start the Collector locally to see data being exported. Write the following
file:

```yaml
# /tmp/otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  # NOTE: Prior to v0.86.0 use `logging` and `loglevel: debug`
  #       instead of `debug` and `verbosity: detailed`
  debug:
    verbosity: detailed
processors:
  batch:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
      processors: [batch]
```

Then start the Docker container:

```sh
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

The following code will create a span with no configuration.

```python
# no_configuration.py
from opentelemetry import trace

with trace.get_tracer("my.tracer").start_as_current_span("foo"):
    with trace.get_tracer("my.tracer").start_as_current_span("bar"):
        print("baz")
```

Lastly, run the `no_configuration.py` with the auto-instrumentation:

```sh
opentelemetry-instrument python no_configuration.py
```

The resulting span will appear in the output from the collector and look similar
to this:

```nocode
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.1.0)
     -> service.name: STRING(unknown_service)
InstrumentationLibrarySpans #0
InstrumentationLibrary __main__
Span #0
    Trace ID       : db3c99e5bfc50ef8be1773c3765e8845
    Parent ID      : 0677126a4d110cb8
    ID             : 3163b3022808ed1b
    Name           : bar
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2021-05-06 22:54:51.23063 +0000 UTC
    End time       : 2021-05-06 22:54:51.230684 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Span #1
    Trace ID       : db3c99e5bfc50ef8be1773c3765e8845
    Parent ID      :
    ID             : 0677126a4d110cb8
    Name           : foo
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2021-05-06 22:54:51.230549 +0000 UTC
    End time       : 2021-05-06 22:54:51.230706 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
```
