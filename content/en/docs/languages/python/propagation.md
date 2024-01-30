---
title: Propagation
description: Context propagation for the Python SDK
weight: 65
---

Propagation is the mechanism that moves data between services and processes.
Although not limited to tracing, it is what allows traces to build causal
information about a system across services that are arbitrarily distributed
across process and network boundaries.

## Manual W3C Trace Context Propagation

The following generic example demonstrates how you can propagate trace context
manually.

First, on the sending service, you'll need to inject the current `context`:

```python
from flask import Flask
import requests
from opentelemetry import trace, propagators, baggage
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.baggage.propagation import W3CBaggagePropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

@app.route('/')
def hello():
    with tracer.start_as_current_span("api1_span") as span:
        ctx = baggage.set_baggage("hello", "world")

        headers = {}
        W3CBaggagePropagator().inject(headers, ctx)
        TraceContextTextMapPropagator().inject(headers, ctx)
        print(headers)

        response = requests.get('http://127.0.0.1:5001/', headers=headers)
        return f"Hello from API 1! Response from API 2: {response.text}"

if __name__ == '__main__':
    app.run(port=5002)
```

On the receiving service, you'll need to extract `context` (for example, from
parsed HTTP headers) and then set them as the current trace context.

```python
from flask import Flask, request
from opentelemetry import trace, baggage
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.baggage.propagation import W3CBaggagePropagator

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

@app.route('/')
def hello():
    # Example: Log headers received in the request in API 2
    headers = dict(request.headers)
    print(f"Received headers: {headers}")
    carrier ={'traceparent': headers['Traceparent']}
    ctx = TraceContextTextMapPropagator().extract(carrier=carrier)
    print(f"Received context: {ctx}")

    b2 ={'baggage': headers['Baggage']}
    ctx2 = W3CBaggagePropagator().extract(b2, context=ctx)
    print(f"Received context2: {ctx2}")

    # Start a new span
    with tracer.start_span("api2_span", context=ctx2):
       # Use propagated context
        print(baggage.get_baggage('hello', ctx2))
        return "Hello from API 2!"

if __name__ == '__main__':
    app.run(port=5001)
```

From there, when you have a deserialized active context, you can create spans
that will be a part of the same trace from the other service.
