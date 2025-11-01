---
title: Propagation
description: Context propagation for the Python SDK
weight: 65
cSpell:ignore: sqlcommenter
---

Propagation is the mechanism that moves data between services and processes.
Although not limited to tracing, it is what allows traces to build causal
information about a system across services that are arbitrarily distributed
across process and network boundaries.

OpenTelemetry provides a text-based approach to propagate context to remote
services using the [W3C Trace Context](https://www.w3.org/TR/trace-context/)
HTTP headers.

## Automatic context propagation

Instrumentation libraries for popular Python frameworks and libraries, such as
Jinja2, Flask, Django, and Celery.propagate context across services for you.

{{% alert title="Note" %}}

Use instrumentation libraries to propagate context. Although it is possible to
propagate context manually, the Python auto-instrumentation and instrumentation
libraries are well-tested and easier to use.

{{% /alert %}}

## Manual context propagation

The following generic example shows how you can propagate trace context
manually.

First, on the sending service, inject the current `context`:

```python
from flask import Flask
import requests
from opentelemetry import trace, baggage
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

On the receiving service, extract `context`, for example, from parsed HTTP
headers, and then set them as the current trace context.

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
that are part of the same trace from the other service.

### sqlcommenter

Some Python instrumentations support sqlcommenter, which enriches database query
statements with contextual information. Queries made with sqlcommenter enabled
will have configurable key-value pairs appended to them. For example:

```sql
"select * from auth_users; /*traceparent=00-01234567-abcd-01*/"
```

This supports context propagation between database client and server when
database log records are enabled. For more information, see:

- [OpenTelemetry Python sqlcommenter example](https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/sqlcommenter/)
- [Semantic Conventions - Database Spans](/docs/specs/semconv/database/database-spans/#sql-commenter)
- [sqlcommenter](https://google.github.io/sqlcommenter/)

## Next steps

To learn more about propagation, see
[Propagators API](/docs/specs/otel/context/api-propagators/).
