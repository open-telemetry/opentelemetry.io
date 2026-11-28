---
title: Cookbook
weight: 100
---

This page is a cookbook for common scenarios.

## Create a new span

```python
from opentelemetry import trace

tracer = trace.get_tracer("my.tracer")
with tracer.start_as_current_span("print") as span:
    print("foo")
    span.set_attribute("printed_string", "foo")
```

## Getting and modifying a span

```python
from opentelemetry import trace

current_span = trace.get_current_span()
current_span.set_attribute("hometown", "Seattle")
```

## Create a nested span

```python
from opentelemetry import trace
import time

tracer = trace.get_tracer("my.tracer")

# Create a new span to track some work
with tracer.start_as_current_span("parent"):
    time.sleep(1)

    # Create a nested span to track nested work
    with tracer.start_as_current_span("child"):
        time.sleep(2)
        # the nested span is closed when it's out of scope

    # Now the parent span is the current span again
    time.sleep(1)

    # This span is also closed when it goes out of scope
```

## Capturing baggage at different contexts

```python
from opentelemetry import trace, baggage

tracer = trace.get_tracer("my.tracer")
with tracer.start_as_current_span(name="root span") as root_span:
    parent_ctx = baggage.set_baggage("context", "parent")
    with tracer.start_as_current_span(
        name="child span", context=parent_ctx
    ) as child_span:
        child_ctx = baggage.set_baggage("context", "child")

print(baggage.get_baggage("context", parent_ctx))
print(baggage.get_baggage("context", child_ctx))
```

## Manually setting span context

Usually your application or serving framework will take care of propagating your
trace context for you. But in some cases, you may need to save your trace
context (with `.inject`) and restore it elsewhere (with `.extract`) yourself.

```python
from opentelemetry import trace, context
from opentelemetry.trace import NonRecordingSpan, SpanContext, TraceFlags
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Set up a simple processor to write spans out to the console so we can see what's happening.
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer("my.tracer")

# A TextMapPropagator works with any dict-like object as its Carrier by default. You can also implement custom getters and setters.
with tracer.start_as_current_span('first-trace'):
    carrier = {}
    # Write the current context into the carrier.
    TraceContextTextMapPropagator().inject(carrier)

# The below might be in a different thread, on a different machine, etc.
# As a typical example, it would be on a different microservice and the carrier would
# have been forwarded via HTTP headers.

# Extract the trace context from the carrier.
# Here's what a typical carrier might look like, as it would have been injected above.
carrier = {'traceparent': '00-a9c3b99a95cc045e573e163c3ac80a77-d99d251a8caecd06-01'}
# Then we use a propagator to get a context from it.
ctx = TraceContextTextMapPropagator().extract(carrier=carrier)

# Instead of extracting the trace context from the carrier, if you have a SpanContext
# object already you can get a trace context from it like this.
span_context = SpanContext(
    trace_id=2604504634922341076776623263868986797,
    span_id=5213367945872657620,
    is_remote=True,
    trace_flags=TraceFlags(0x01)
)
ctx = trace.set_span_in_context(NonRecordingSpan(span_context))

# Now there are a few ways to make use of the trace context.

# You can pass the context object when starting a span.
with tracer.start_as_current_span('child', context=ctx) as span:
    span.set_attribute('primes', [2, 3, 5, 7])

# Or you can make it the current context, and then the next span will pick it up.
# The returned token lets you restore the previous context.
token = context.attach(ctx)
try:
    with tracer.start_as_current_span('child') as span:
        span.set_attribute('evens', [2, 4, 6, 8])
finally:
    context.detach(token)
```

## Setting trace state and trace flags

The [trace state](https://www.w3.org/TR/trace-context/#tracestate-header) of a
span, which carries the vendor-specific `tracestate` header of
[W3C Trace Context](https://www.w3.org/TR/trace-context/), and its
[trace flags](https://www.w3.org/TR/trace-context/#trace-flags) are not
parameters of `start_span` or `start_as_current_span`. They are results of
starting a span, not inputs to it, so there are only two ways to set them:
inherit them from a valid parent span context, or have a sampler produce them.

A common mistake is to build a `Context` out of a plain dictionary of trace
fields. That does not work, because a `Context` is an opaque key-value mapping
whose keys are generated at run time rather than a record with `trace_id` and
`span_id` fields. Writing those names into it stores values that nothing reads,
and the span is started as a root span with an empty trace state.

### Inheriting trace state from a parent

To start a span under a parent that carries a trace state, wrap the parent span
context in a `NonRecordingSpan` and set it in a `Context`, as in
[Manually setting span context](#manually-setting-span-context):

```python
from opentelemetry import trace
from opentelemetry.context import Context
from opentelemetry.trace import NonRecordingSpan, SpanContext, TraceFlags, TraceState
from opentelemetry.sdk.trace import TracerProvider

trace.set_tracer_provider(TracerProvider())
tracer: trace.Tracer = trace.get_tracer("my.tracer")

# The trace and span IDs must be valid, that is, non-zero. A span context built
# from all-zero IDs is not valid, so the SDK ignores it, starts a root span and
# discards the trace state without raising an error.
parent_span_context: SpanContext = SpanContext(
    trace_id=0x0AF7651916CD43DD8448EB211C80319C,
    span_id=0x00F067AA0BA902B7,
    is_remote=True,
    trace_flags=TraceFlags(TraceFlags.SAMPLED),
    trace_state=TraceState([("vendor_key", "vendor_value")]),
)
ctx: Context = trace.set_span_in_context(NonRecordingSpan(parent_span_context))

with tracer.start_as_current_span("child", context=ctx) as span:
    # Prints: vendor_key=vendor_value
    print(span.get_span_context().trace_state.to_header())
```

Usually you do not build the parent span context by hand. A propagator does it
for you when it extracts the `traceparent` and `tracestate` headers of an
incoming request, as described in [Propagation](../propagation/).

### Adding an entry to a trace state

A `TraceState` is immutable, so `add`, `update` and `delete` return a new
instance instead of modifying the original. To contribute your own entry to an
incoming trace state, build a new span context from the one you received:

```python
from opentelemetry import trace
from opentelemetry.context import Context
from opentelemetry.trace import NonRecordingSpan, SpanContext, TraceState
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.sdk.trace import TracerProvider

trace.set_tracer_provider(TracerProvider())
tracer: trace.Tracer = trace.get_tracer("my.tracer")

carrier: dict[str, str] = {
    "traceparent": "00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01",
    "tracestate": "vendor_key=vendor_value",
}
incoming_ctx: Context = TraceContextTextMapPropagator().extract(carrier=carrier)
incoming: SpanContext = trace.get_current_span(incoming_ctx).get_span_context()

updated_trace_state: TraceState = incoming.trace_state.add("my_key", "my_value")

updated_span_context: SpanContext = SpanContext(
    trace_id=incoming.trace_id,
    span_id=incoming.span_id,
    is_remote=incoming.is_remote,
    trace_flags=incoming.trace_flags,
    trace_state=updated_trace_state,
)
updated_ctx: Context = trace.set_span_in_context(NonRecordingSpan(updated_span_context))

with tracer.start_as_current_span("child", context=updated_ctx) as span:
    # Prints: my_key=my_value,vendor_key=vendor_value
    print(span.get_span_context().trace_state.to_header())
```

New entries are placed first, as the W3C Trace Context specification requires.

### Setting trace state on a root span

A root span has no parent to inherit from, so the only way to give it a trace
state is a sampler: the SDK takes the trace state of every new span from the
`SamplingResult` that the sampler returns. Wrap the sampler you already use so
that it keeps its sampling decision and only supplies a trace state when there
is none:

```python
from collections.abc import Sequence

from opentelemetry import trace
from opentelemetry.context import Context
from opentelemetry.trace import Link, SpanKind, TraceState
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import ALWAYS_ON, ParentBased, Sampler, SamplingResult
from opentelemetry.util.types import Attributes


class TraceStateSeedingSampler(Sampler):
    """Delegates the sampling decision and seeds a trace state onto root spans."""

    def __init__(self, delegate: Sampler, seed: TraceState) -> None:
        self._delegate: Sampler = delegate
        self._seed: TraceState = seed

    def should_sample(
        self,
        parent_context: Context | None,
        trace_id: int,
        name: str,
        kind: SpanKind | None = None,
        attributes: Attributes = None,
        links: Sequence[Link] | None = None,
        trace_state: TraceState | None = None,
    ) -> SamplingResult:
        result: SamplingResult = self._delegate.should_sample(
            parent_context, trace_id, name, kind, attributes, links, trace_state
        )
        if result.trace_state:
            return result
        return SamplingResult(result.decision, result.attributes, self._seed)

    def get_description(self) -> str:
        return f"TraceStateSeedingSampler{{{self._delegate.get_description()}}}"


# Only the root sampler is wrapped, so spans that do have a parent keep
# inheriting the trace state of that parent.
provider: TracerProvider = TracerProvider(
    sampler=ParentBased(
        root=TraceStateSeedingSampler(ALWAYS_ON, TraceState([("vendor_key", "vendor_value")]))
    )
)
tracer: trace.Tracer = provider.get_tracer("my.tracer")

with tracer.start_as_current_span("root") as span:
    # Prints: vendor_key=vendor_value
    print(span.get_span_context().trace_state.to_header())
```

### Trace flags

You cannot set the `sampled` bit of a span you create. The SDK derives it from
the sampling decision: a span is marked as sampled if, and only if, the sampler
returns a sampling decision that records and samples it.

This means you control trace flags by choosing a sampler. The default sampler,
`ParentBased(root=ALWAYS_ON)`, honors the decision of a remote parent, so a
parent span context created with `TraceFlags(TraceFlags.SAMPLED)` as shown above
produces a sampled, recording child, and one created with
`TraceFlags(TraceFlags.DEFAULT)` produces a child that is neither. In both cases
the trace state is inherited, because inheriting a trace state does not depend
on the sampling decision.

## Using multiple tracer providers with different Resource

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor

# Global tracer provider which can be set only once
trace.set_tracer_provider(
    TracerProvider(resource=Resource.create({"service.name": "service1"}))
)
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer("tracer.one")
with tracer.start_as_current_span("some-name") as span:
    span.set_attribute("key", "value")



another_tracer_provider = TracerProvider(
    resource=Resource.create({"service.name": "service2"})
)
another_tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

another_tracer = trace.get_tracer("tracer.two", tracer_provider=another_tracer_provider)
with another_tracer.start_as_current_span("name-here") as span:
    span.set_attribute("another-key", "another-value")
```
