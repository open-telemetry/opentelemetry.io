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
from opentelemetry.context import Context
from opentelemetry.sdk.trace import Tracer
from opentelemetry.sdk.trace.export import ConsoleSpanExporter
from opentelemetry.sdk.trace.export import SimpleExportSpanProcessor

trace.set_preferred_tracer_implementation(lambda T: Tracer())
tracer = trace.tracer()
tracer.add_span_processor(
    SimpleExportSpanProcessor(ConsoleSpanExporter())
)
with tracer.start_as_current_span('foo'):
    with tracer.start_as_current_span('bar'):
        with tracer.start_as_current_span('baz'):
            print(Context)
```

Running the code will output trace information to the console:

```bash
AsyncRuntimeContext({'current_span': Span(name="baz", context=SpanContext(trace_id=0x6d9024f9b34a06d9e3051f9cd6a517f3, span_id=0x16d0105b895b3047, trace_state={}))})
Span(name="baz", context=SpanContext(trace_id=0x6d9024f9b34a06d9e3051f9cd6a517f3, span_id=0x16d0105b895b3047, trace_state={}), kind=SpanKind.INTERNAL, parent=Span(name="bar", context=SpanContext(trace_id=0x6d9024f9b34a06d9e3051f9cd6a517f3, span_id=0xbe35652b6fd923dd, trace_state={})), start_time=2019-11-04T22:18:45.777339Z, end_time=2019-11-04T22:18:45.777447Z)
Span(name="bar", context=SpanContext(trace_id=0x6d9024f9b34a06d9e3051f9cd6a517f3, span_id=0xbe35652b6fd923dd, trace_state={}), kind=SpanKind.INTERNAL, parent=Span(name="foo", context=SpanContext(trace_id=0x6d9024f9b34a06d9e3051f9cd6a517f3, span_id=0x771d1d72567a2c05, trace_state={})), start_time=2019-11-04T22:18:45.777303Z, end_time=2019-11-04T22:18:45.777598Z)
Span(name="foo", context=SpanContext(trace_id=0x6d9024f9b34a06d9e3051f9cd6a517f3, span_id=0x771d1d72567a2c05, trace_state={}), kind=SpanKind.INTERNAL, parent=None, start_time=2019-11-04T22:18:45.777260Z, end_time=2019-11-04T22:18:45.777780Z)
```

# API Reference

See the [API documentation](https://open-telemetry.github.io/opentelemetry-python/) for more detail, and the [opentelemetry-example-app](https://github.com/open-telemetry/opentelemetry-python/blob/master/examples/opentelemetry-example-app/README.rst) for a complete example.