---
title: Cookbook
---

This page is a cookbook for common scenarios.

## Create a new span

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)
with tracer.start_as_current_span("print") as span:
    print("foo")
    span.set_attribute("printed_string", "foo")
```

## Getting and modifying a span

```python
from opentelemetry import trace

current_span = trace.get_current_span()
current_span.set_attribute("hometown", "seattle")
```

## Create a nested span

```python
from opentelemetry import trace
import time

tracer = trace.get_tracer(__name__)

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
from opentelemetry import trace

tracer = trace.get_tracer(__name__)
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

Usually your application or serving framework will take care of propagating your trace context for you. But in some cases, you may need to save your trace context (with `.inject`) and restore it elsewhere (with `.extract`) yourself.

```python
from opentelemetry import trace, context
from opentelemetry.trace import NonRecordingSpan, SpanContext, TraceFlags
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Set up a simple processor to write spans out to the console so we can see what's happening.
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

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

tracer = trace.get_tracer(__name__)
with tracer.start_as_current_span("some-name") as span:
    span.set_attribute("key", "value")



another_tracer_provider = TracerProvider(
    resource=Resource.create({"service.name": "service2"})
)
another_tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

another_tracer = trace.get_tracer(__name__, tracer_provider=another_tracer_provider)
with another_tracer.start_as_current_span("name-here") as span:
    span.set_attribute("another-key", "another-value")
```

## Capture HTTP request and response headers

To capture [HTTP request and response headers][] as span attributes,
provide a comma-separated list of headers you want to collect via
the environment variables
`OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST` and
`OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE`, e.g.:

```console
$ export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST="Accept-Encoding,User-Agent,Referer"
$ export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE="Last-Modified,Content-Type"
$ opentelemetry-instrument --traces_exporter console python app.py
```

This is supported for the following framework instrumentations:

- Django
- Falcon
- FastAPI
- Pyramid
- Starlette
- Tornado
- WSGI

If those headers are available, they will be included in your span:

```json
{
    "attributes": {
        "http.request.header.user-agent": [
            "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)"
        ],
        "http.request.header.accept_encoding": [
            "gzip, deflate, br"
        ],
        "http.response.header.last_modified": [
            "2022-04-20 17:07:13.075765"
        ],
        "http.response.header.content_type": [
            "text/html; charset=utf-8"
        ]
    }
}
```

[HTTP request and response headers]:
    https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/http.md#http-request-and-response-headers
