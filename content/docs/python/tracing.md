---
title: "Tracing"
---

This page contains documentation for OpenTelemetry Python.

# Quick Start

**Please note** that this library is currently in *alpha*, and shouldn't be used in production environments.

The API and SDK packages are available on PyPI, and can installed via `pip`:

```bash
pip install opentelemetry-api
pip install opentelemetry-sdk
```

From there, you should be able to use opentelemetry as per the following:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerSource
from opentelemetry.sdk.trace.export import ConsoleSpanExporter
from opentelemetry.sdk.trace.export import SimpleExportSpanProcessor

trace.set_preferred_tracer_source_implementation(lambda T: TracerSource())
trace.tracer_source().add_span_processor(
    SimpleExportSpanProcessor(ConsoleSpanExporter())
)
tracer = trace.get_tracer(__name__)
with tracer.start_as_current_span("foo"):
    with tracer.start_as_current_span("bar"):
        with tracer.start_as_current_span("baz"):
            print("Hello world from OpenTelemetry Python!")
```

Running the code will output trace information to the console:

```bash
Hello world from OpenTelemetry Python!
Span(name="baz", context=SpanContext(trace_id=0xa1d5d85f3751e579d3fb1d6ba369fa9e, span_id=0x90b06c276c8baf02, trace_state={}), kind=SpanKind.INTERNAL, parent=Span(name="bar", context=SpanContext(trace_id=0xa1d5d85f3751e579d3fb1d6ba369fa9e, span_id=0x0724307563ed8af8, trace_state={})), start_time=2020-03-05T20:12:50.579048Z, end_time=2020-03-05T20:12:50.579073Z)
Span(name="bar", context=SpanContext(trace_id=0xa1d5d85f3751e579d3fb1d6ba369fa9e, span_id=0x0724307563ed8af8, trace_state={}), kind=SpanKind.INTERNAL, parent=Span(name="foo", context=SpanContext(trace_id=0xa1d5d85f3751e579d3fb1d6ba369fa9e, span_id=0xddadf519247d5d05, trace_state={})), start_time=2020-03-05T20:12:50.579032Z, end_time=2020-03-05T20:12:50.579142Z)
Span(name="foo", context=SpanContext(trace_id=0xa1d5d85f3751e579d3fb1d6ba369fa9e, span_id=0xddadf519247d5d05, trace_state={}), kind=SpanKind.INTERNAL, parent=None, start_time=2020-03-05T20:12:50.579000Z, end_time=2020-03-05T20:12:50.579195Z)
```

# API Reference

See the [API documentation](https://open-telemetry.github.io/opentelemetry-python/) for more detail, and the [opentelemetry-example-app](https://github.com/open-telemetry/opentelemetry-python/blob/master/examples/opentelemetry-example-app/README.rst) for a complete example.
