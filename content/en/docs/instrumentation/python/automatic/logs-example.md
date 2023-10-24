---
title: Logs Auto-Instrumentation Example
linkTitle: Logs Example
weight: 20
# prettier-ignore
cSpell:ignore: distro instrumentor mkdir MSIE Referer Starlette uninstrumented virtualenv
---

This page demonstrates how to use Python logs auto-instrumentation in
OpenTelemetry.

Unlike Traces and Metrics, there is no equivalent Logs API. There is only an
SDK. For Python, you use the Python `logger` library, and then the OTel SDK
attaches an OTLP handler to the root logger, turning the Python logger into an
OTLP logger. One way to accomplish this is documented in the logs example in
[OpenTelemetry Python repository][].

Another way this is accomplished is through Python's support for
auto-instrumentation of logs. The example below is based on the logs example in
[OpenTelemetry Python repository][].

> There is a logs bridge API; however, it is different from the Traces and
> Metrics API, because it's not used by application developers to create logs.
> Instead, they would use this bridge API to setup log appenders in the standard
> language-specific logging libraries. More information can be found
> [here](/docs/specs/otel/logs/bridge-api).

Start by creating the examples directory and the example Python file:

```sh
mkdir python-logs-example
cd python-logs-example
touch example.py
```

Paste the following contents into `example.py`:

```python
import logging

from opentelemetry import trace

tracer = trace.get_tracer_provider().get_tracer(__name__)

# Trace context correlation
with tracer.start_as_current_span("foo"):
    # Do something
    current_span = trace.get_current_span()
    current_span.add_event("This is a span event")
    logging.getLogger().error("This is a log message")
```

Grab a copy of the OTel Collector configuration from
[here](https://github.com/open-telemetry/opentelemetry-python/blob/main/docs/examples/logs/otel-collector-config.yaml),
and save it to `python-logs-example/otel-collector-config.yaml`

## Prepare

Execute the following example, we recommend using a virtual environment to do
so. Run the following commands to prepare for logs auto-instrumentation:

```sh
mkdir python_logs_example
virtualenv python_logs_example
source python_logs_example/bin/activate
```

## Install

The following commands install the appropriate packages. The
`opentelemetry-distro` package depends on a few others, like `opentelemetry-sdk`
for custom instrumentation of your own code and `opentelemetry-instrumentation`
which provides several commands that help automatically instrument a program.

```sh
pip install opentelemetry-distro
pip install opentelemetry-exporter-otlp
```

The examples that follow send instrumentation results to the console. Learn more
about installing and configuring the
[OpenTelemetry Distro](/docs/instrumentation/python/distro) to send telemetry to
other destinations, like an OpenTelemetry Collector.

> **Note**: To use automatic instrumentation through `opentelemetry-instrument`,
> you must configure it via environment variables or the command line. The agent
> creates a telemetry pipeline that cannot be modified other than through these
> means. If you need more customization for your telemetry pipelines, then you
> need to forego the agent and import the OpenTelemetry SDK and instrumentation
> libraries into your code and configure them there. You may also extend
> automatic instrumentation by importing the OpenTelemetry API. For more
> details, see the [API reference][].

## Execute

This section guides you through the process of executing an automatically
instrumented logs.

Open up a new terminal window and start the OTel Collector:

```sh
docker run -it --rm -p 4317:4317 -p 4318:4318 \
  -v $(pwd)/otel-collector-config.yaml:/etc/otelcol-config.yml \
  --name otelcol \
  otel/opentelemetry-collector-contrib:0.76.1 \
  "--config=/etc/otelcol-config.yml"
```

Open up another terminal and run the Python program:

```sh
source python_logs_example/bin/activate

export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
  --traces_exporter console,otlp \
  --metrics_exporter console,otlp \
  --logs_exporter console,otlp \
  --service_name python-logs-example \
  python $(pwd)/example.py
```

Sample output:

```text
...
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope __main__
Span #0
    Trace ID       : 389d4ac130a390d3d99036f9cd1db75e
    Parent ID      :
    ID             : f318281c4654edc5
    Name           : foo
    Kind           : Internal
    Start time     : 2023-08-18 17:04:05.982564 +0000 UTC
    End time       : 2023-08-18 17:04:05.982667 +0000 UTC
    Status code    : Unset
    Status message :
Events:
SpanEvent #0
     -> Name: This is a span event
     -> Timestamp: 2023-08-18 17:04:05.982586 +0000 UTC

...

ScopeLogs #0
ScopeLogs SchemaURL:
InstrumentationScope opentelemetry.sdk._logs._internal
LogRecord #0
ObservedTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-08-18 17:04:05.982605056 +0000 UTC
SeverityText: ERROR
SeverityNumber: Error(17)
Body: Str(This is a log message)
Attributes:
     -> otelSpanID: Str(f318281c4654edc5)
     -> otelTraceID: Str(389d4ac130a390d3d99036f9cd1db75e)
     -> otelTraceSampled: Bool(true)
     -> otelServiceName: Str(python-logs-example)
Trace ID: 389d4ac130a390d3d99036f9cd1db75e
Span ID: f318281c4654edc5
...
```

Note that the Span Event and the Log both have the same SpanID
(`f318281c4654edc5`). The logging SDK appends the SpanID of the current Span to
any logged events to improve the ability to correlate telemetry.

[api reference]:
  https://opentelemetry-python.readthedocs.io/en/latest/index.html
[OpenTelemetry Python repository]:
  https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/logs
