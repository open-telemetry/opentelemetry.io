---
title: Manual Instrumentation
linkTitle: Manual
weight: 20
description: Manual instrumentation for OpenTelemetry Python
cSpell:ignore: millis ottrace textmap
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/instrumentation/manual-intro %}}

## Setup

First, ensure you have the API and SDK packages:

```shell
pip install opentelemetry-api
pip install opentelemetry-sdk
```

## Traces

### Acquire Tracer

To start tracing, you'll need to initialize a
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) and
optionally set it as the global default.

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

# Sets the global default tracer provider
trace.set_tracer_provider(provider)

# Creates a tracer from the global tracer provider
tracer = trace.get_tracer("my.tracer.name")
```

### Creating spans

To create a [span](/docs/concepts/signals/traces/#spans), you'll typically want
it to be started as the current span.

```python
def do_work():
    with tracer.start_as_current_span("span-name") as span:
        # do some work that 'span' will track
        print("doing some work...")
        # When the 'with' block goes out of scope, 'span' is closed for you
```

You can also use `start_span` to create a span without making it the current
span. This is usually done to track concurrent or asynchronous operations.

### Creating nested spans

If you have a distinct sub-operation you'd like to track as a part of another
one, you can create [spans](/docs/concepts/signals/traces/#spans) to represent
the relationship:

```python
def do_work():
    with tracer.start_as_current_span("parent") as parent:
        # do some work that 'parent' tracks
        print("doing some work...")
        # Create a nested span to track nested work
        with tracer.start_as_current_span("child") as child:
            # do some work that 'child' tracks
            print("doing some nested work...")
            # the nested span is closed when it's out of scope

        # This span is also closed when it goes out of scope
```

When you view spans in a trace visualization tool, `child` will be tracked as a
nested span under `parent`.

### Creating spans with decorators

It's common to have a single [span](/docs/concepts/signals/traces/#spans) track
the execution of an entire function. In that scenario, there is a decorator you
can use to reduce code:

```python
@tracer.start_as_current_span("do_work")
def do_work():
    print("doing some work...")
```

Use of the decorator is equivalent to creating the span inside `do_work()` and
ending it when `do_work()` is finished.

To use the decorator, you must have a `tracer` instance available global to your
function declaration.

If you need to add [attributes](#add-attributes-to-a-span),
[events](#adding-events), or [links](#adding-links) then it's less convenient to
use a decorator.

### Get the current span

Sometimes it's helpful to access whatever the current
[span](/docs/concepts/signals/traces/#spans) is at a point in time so that you
can enrich it with more information.

```python
from opentelemetry import trace

current_span = trace.get_current_span()
# enrich 'current_span' with some information
```

### Add attributes to a span

[Attributes](/docs/concepts/signals/traces/#attributes) let you attach key/value
pairs to a [span](/docs/concepts/signals/traces/#spans) so it carries more
information about the current operation that it's tracking.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.set_attribute("operation.value", 1)
current_span.set_attribute("operation.name", "Saying hello!")
current_span.set_attribute("operation.other-stuff", [1, 2, 3])
```

### Add semantic attributes

[Semantic Attributes](/docs/specs/semconv/general/trace/) are pre-defined
[Attributes](/docs/concepts/signals/traces/#attributes) that are well-known
naming conventions for common kinds of data. Using Semantic Attributes lets you
normalize this kind of information across your systems.

To use Semantic Attributes in Python, ensure you have the semantic conventions
package:

```shell
pip install opentelemetry-semantic-conventions
```

Then you can use it in code:

```python
from opentelemetry import trace
from opentelemetry.semconv.trace import SpanAttributes

// ...

current_span = trace.get_current_span()
current_span.set_attribute(SpanAttributes.HTTP_METHOD, "GET")
current_span.set_attribute(SpanAttributes.HTTP_URL, "https://opentelemetry.io/")
```

### Adding events

An [event](/docs/concepts/signals/traces/#span-events) is a human-readable
message on a [span](/docs/concepts/signals/traces/#spans) that represents
"something happening" during its lifetime. You can think of it as a primitive
log.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.add_event("Gonna try it!")

# Do the thing

current_span.add_event("Did it!")
```

### Adding links

A [span](/docs/concepts/signals/traces/#spans) can be created with zero or more
span [links](/docs/concepts/signals/traces/#span-links) that causally link it to
another span. A link needs a span context to be created.

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("span-1"):
    # Do something that 'span-1' tracks.
    ctx = trace.get_current_span().get_span_context()
    link_from_span_1 = trace.Link(ctx)

with tracer.start_as_current_span("span-2", links=[link_from_span_1]):
    # Do something that 'span-2' tracks.
    # The link in 'span-2' is causally associated it with the 'span-1',
    # but it is not a child span.
    pass
```

### Set span status

A [status](/docs/concepts/signals/traces/#span-status) can be set on a
[span](/docs/concepts/signals/traces/#spans), typically used to specify that a
span has not completed successfully - `StatusCode.ERROR`. In rare scenarios, you
could override the Error status with `StatusCode.OK`, but don’t set
`StatusCode.OK` on successfully-completed spans.

The status can be set at any time before the span is finished:

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # something that might fail
except:
    current_span.set_status(Status(StatusCode.ERROR))
```

### Record exceptions in spans

It can be a good idea to record exceptions when they happen. It’s recommended to
do this in conjunction with setting [span status](#set-span-status).

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # something that might fail

# Consider catching a more specific exception in your code
except Exception as ex:
    current_span.set_status(Status(StatusCode.ERROR))
    current_span.record_exception(ex)
```

### Change the default propagation format

By default, OpenTelemetry Python will use the following propagation formats:

- W3C Trace Context
- W3C Baggage

If you have a need to change the defaults, you can do so either via environment
variables or in code:

#### Using Environment Variables

You can set the `OTEL_PROPAGATORS` environment variable with a comma-separated
list. Accepted values are:

- `"tracecontext"`: W3C Trace Context
- `"baggage"`: W3C Baggage
- `"b3"`: B3 Single
- `"b3multi"`: B3 Multi
- `"jaeger"`: Jaeger
- `"xray"`: AWS X-Ray (third party)
- `"ottrace"`: OT Trace (third party)
- `"none"`: No automatically configured propagator.

The default configuration is equivalent to
`OTEL_PROPAGATORS="tracecontext,baggage"`.

#### Using SDK APIs

Alternatively, you can change the format in code.

For example, if you need to use Zipkin's B3 propagation format instead, you can
install the B3 package:

```shell
pip install opentelemetry-propagator-b3
```

And then set the B3 propagator in your tracing initialization code:

```python
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.b3 import B3Format

set_global_textmap(B3Format())
```

Note that environment variables will override what's configured in code.

### Further Reading

- [Trace Concepts](/docs/concepts/signals/traces/)
- [Trace Specification](/docs/specs/otel/overview/#tracing-signal)
- [Python Trace API Documentation](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html)
- [Python Trace SDK Documentation](https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.html)

## Metrics

To start collecting metrics, you'll need to initialize a
[`MeterProvider`](/docs/specs/otel/metrics/api/#meterprovider) and optionally
set it as the global default.

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import (
    ConsoleMetricExporter,
    PeriodicExportingMetricReader,
)

metric_reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
provider = MeterProvider(metric_readers=[metric_reader])

# Sets the global default meter provider
metrics.set_meter_provider(provider)

# Creates a meter from the global meter provider
meter = metrics.get_meter("my.meter.name")
```

### Creating and using synchronous instruments

Instruments are used to make measurements of your application.
[Synchronous instruments](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments)
are used inline with application/business processing logic, like when handling a
request or calling another service.

First, create your instrument. Instruments are generally created once at the
module or class level and then used inline with business logic. This example
uses a [Counter](/docs/specs/otel/metrics/api/#counter) instrument to count the
number of work items completed:

```python
work_counter = meter.create_counter(
    "work.counter", unit="1", description="Counts the amount of work done"
)
```

Using the Counter's [add operation](/docs/specs/otel/metrics/api/#add), the code
below increments the count by one, using the work item's type as an attribute.

```python
def do_work(work_item):
    # count the work being doing
    work_counter.add(1, {"work.type": work_item.work_type})
    print("doing some work...")
```

### Creating and using asynchronous instruments

[Asynchronous instruments](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments)
give the user a way to register callback functions, which are invoked on demand
to make measurements. This is useful to periodically measure a value that cannot
be instrumented directly. Async instruments are created with zero or more
callbacks which will be invoked during metric collection. Each callback accepts
options from the SDK and returns its observations.

This example uses an
[Asynchronous Gauge](/docs/specs/otel/metrics/api/#asynchronous-gauge)
instrument to report the current config version provided by a configuration
server by scraping an HTTP endpoint. First, write a callback to make
observations:

```python
from typing import Iterable
from opentelemetry.metrics import CallbackOptions, Observation


def scrape_config_versions(options: CallbackOptions) -> Iterable[Observation]:
    r = requests.get(
        "http://configserver/version_metadata", timeout=options.timeout_millis / 10**3
    )
    for metadata in r.json():
        yield Observation(
            metadata["version_num"], {"config.name": metadata["version_num"]}
        )
```

Note that OpenTelemetry will pass options to your callback containing a timeout.
Callbacks should respect this timeout to avoid blocking indefinitely. Finally,
create the instrument with the callback to register it:

```python
meter.create_observable_gauge(
    "config.version",
    callbacks=[scrape_config_versions],
    description="The active config version for each configuration",
)
```

### Further Reading

- [Metrics Concepts](/docs/concepts/signals/metrics/)
- [Metrics Specification](/docs/specs/otel/metrics/)
- [Python Metrics API Documentation](https://opentelemetry-python.readthedocs.io/en/latest/api/metrics.html)
- [Python Metrics SDK Documentation](https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.html)

## Logs

The logs API & SDK are currently under development.

## Next Steps

You’ll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/python/exporters) to one or
more telemetry backends.
