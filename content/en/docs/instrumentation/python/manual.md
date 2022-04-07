---
title: Manual Instrumentation
linkTitle: Manual
weight: 3
---

Manual instrumentation is the process of adding observability code to your
application.

## Initializing tracing

To start tracing, you'll need to initialize a `TracerProvider`.

First, ensure you have the API and SDK packages:

```
pip install opentelemetry-api
pip install opentelemetry-sdk
```

Next, initialize a `TracerProvider` and set it for your app:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
)

provider = TracerProvider()
processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)
```

With a call to `get_tracer`, you can create spans.

## Creating spans

To create a span, you'll typically want it to be started as the current span.

```python
with tracer.start_as_current_span("span-name") as span:
    # do some work that 'span' will track

    # When the 'while' block goes out of scope, 'span' is closed for you
```

You can also use `start_span` to create a span without making it the current
span. This is usually done to track concurrent or asynchronous operations.

## Creating nested spans

If you have a distinct sub-operation you'd like to track as a part of another
one, you can create spans to represent the relationship:

```python
with tracer.start_as_current_span("parent") as parent:
    # do some work that 'parent' tracks

    # Create a nested span to track nested work
    with tracer.start_as_current_span("child") as child:
        # do some work that 'child' tracks

        # the nested span is closed when it's out of scope

    # This span is also closed when it goes out of scope
```

When you view spans in a trace visualization tool, `child` will be tracked as a
nested span under `parent`.

## Get the current span

Sometimes it's helpful to access whatever the current span is at a point in time
so that you can enrich it with more information.

```python
from opentelemetry import trace

current_span = trace.get_current_span()
# enrich 'current_span' with some information
```

## Add attributes to a span

Attributes let you attach key/value pairs to a span so it carries more
information about the current operation that it's tracking.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.set_attribute("operation.value", 1)
current_span.set_attribute("operation.name", "Saying hello!")
current_span.set_attribute("operation.other-stuff", [1, 2, 3])
```

## Adding events

AN event is a human-readable message on a span that represents "something
happening" during its lifetime. You can think of it as a primitive log.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.add_event("Gonna try it!")

# Do the thing

current_span.add_event("Did it!")
```

## Adding links

A span can be created with zero or more span links that causally link it to
another span. A link needs a span context to be created.

```python
from opentelemetry import trace

ctx = trace.get_current_span().get_span_context()

link_from_current = trace.Link(ctx)

with tracer.start_as_current_span("new-span", links=[link_from_current]) as new_span:
    # do something that 'new_span' tracks

    # The link in 'new_span' casually associated it with the previous one,
    # but it is not a child span.
```

## Set span status

A status can be set on a span, typically used to specify that a span has not
completed successfully - `StatusCode.ERROR`. In rare scenarios, you could
override the Error status with `StatusCode.OK`, but don’t set `StatusCode.OK` on
successfully-completed spans.

The status can be set at any time before the span is finished:

```python
from opentelemetry import trace

current_span = trace.get_current_span()

try:
    # something that might fail
except:
    current_span.set_status(StatusCode.ERROR)
```

## Record exceptions in spans

It can be a good idea to record exceptions when they happen. It’s recommended to
do this in conjunction with setting [span status](#set-span-status).

```python
from opentelemetry import trace

current_span = trace.get_current_span()

try:
    # something that might fail

# Consider catching a more specific exception in your code
except Exception as ex:
    current_span.set_status(StatusCode.ERROR)
    current_span.record_exception(ex)
```
