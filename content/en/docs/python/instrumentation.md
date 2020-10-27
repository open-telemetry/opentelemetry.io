---
title: "Instrumentation"
weight: 3
---

This guide will cover creating and annotating spans, creating and annotating metrics, how to pass context, and a guide to automatic instrumentation for python. In the following this guide will use the following sample app:

```python
def doWork():
    print("work", end='')
    for y in range(40):
        print(".", end='')
    print()

for x in range(10):
    doWork()
```

# Creating Spans

As you have learned in the previous [Getting Started](../getting_started/) guide you need a TracerProvider and an Exporter. Install the dependencies and add them to head of your application code to get started:

```shell
pip3 install opentelemetry-api opentelemetry-sdk
```

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    ConsoleSpanExporter,
    SimpleExportSpanProcessor,
)
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    SimpleExportSpanProcessor(ConsoleSpanExporter())
)
```

Next, initialize the OpenTelemetry APIs to use the BasicTracerProvider bindings.
This registers the tracer provider with the OpenTelemetry API as the global tracer provider.
This means when you call API methods like `opentelemetry.trace.getTracer`, they will use this tracer provider.
If you do not register a global tracer provider, instrumentation which calls these methods will receive no-op implementations:

```python
tracer = trace.get_tracer(__name__)
```

Add a first span to the sample application. Modify your code like the following:

```javascript
// Create a span. A span must be closed.
with tracer.start_as_current_span("parent"):
  for x in range(10):
    doWork()
```

Run your application and you will see traces being exported to the console:

```json
{
    "name": "parent",
    "context": {
        "trace_id": "0xd6074b273efa3ff895bc8023e734f66f",
        "span_id": "0x949d607cf1c7eb5a",
        "trace_state": "{}"
    },
    "kind": "SpanKind.INTERNAL",
    "parent_id": null,
    "start_time": "2020-10-27T10:40:36.563841Z",
    "end_time": "2020-10-27T10:40:36.564250Z",
    "status": {
        "canonical_code": "OK"
    },
    "attributes": {},
    "events": [],
    "links": [],
    "resource": {
        "telemetry.sdk.language": "python",
        "telemetry.sdk.name": "opentelemetry",
        "telemetry.sdk.version": "0.14b0"
    }
}
```

Add further spans into the `doWork` method:

```python
def doWork():
    with tracer.start_as_current_span("child"):
      print("work", end='')
      for y in range(40):
          print(".", end='')
      print()
```

Invoking your application once again will give you a list of traces being exported.

## Attributes

Attributes can be used to describe your spans. Attributes can be added to a span at any time before the span is finished:

```javascript
def doWork():
    with tracer.start_as_current_span("child", attributes={ "attribute1": "value1"}) as span:
      print("work", end='')
      for y in range(40):
          print(".", end='')
      print()
      span.set_attribute("attribute2", "value2")
```

### Semantic Attributes

There are semantic conventions for spans representing operations in well-known protocols like HTTP or database calls. Semantic conventions for these spans are defined in the specification at [Trace Semantic Conventions](https://github.com/open-telemetry/opentelemetry-specification/tree/master/specification/trace/semantic_conventions). In the simple example of this guide the source code attributes can be used:

```python
def doWork():
    with tracer.start_as_current_span("child", attributes={ "code.function": "doWork"}) as span:
      print("work", end='')
      for y in range(40):
          print(".", end='')
      print()
      span.set_attribute("code.filepath", __file__)
```

## Events

# Creating Metrics

As the metrics API remains unstable, metrics documentation can be deferred

# Propagators and Context

# Automatic Instrumentation

If this is available, then this section should cover:

- Configuring automatic instrumentation for the language
- Examples of creating new child spans from AI parents
- List of libraries supported for automatic instrumentation
- How to create new automatic instrumentation, possibly?
