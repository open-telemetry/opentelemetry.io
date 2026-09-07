---
title: Load Generator
aliases: [loadgenerator]
# prettier-ignore
cSpell:ignore: gevent instrumentor instrumentors loadgenerator locustfile urllib
---

The load generator is based on the Python load testing framework
[Locust](https://locust.io). By default it will simulate users requesting
several different routes from the frontend.

[Load generator source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

## Traces

### Initializing Tracing

Since this service is a
[locustfile](https://docs.locust.io/en/stable/writing-a-locustfile.html), the
OpenTelemetry SDK is initialized after the import statements. This code will
create a tracer provider, and establish a Span Processor to use. Export
endpoints, resource attributes, and service name are automatically set using
[OpenTelemetry environment variables](/docs/specs/otel/configuration/sdk-environment-variables/).

```python
tracer_provider = TracerProvider()
trace.set_tracer_provider(tracer_provider)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(insecure=True)))
```

### Adding instrumentation libraries

To add instrumentation libraries you need to import the Instrumentors for each
library in your Python code. Locust uses the `Requests`, `URLLib3`, and `Jinja2`
libraries, so we will import their Instrumentors.

```python
from opentelemetry.instrumentation.jinja2 import Jinja2Instrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
```

The Instrumentors are initialized by calling `instrument()` directly, rather
than through `opentelemetry-instrument`, to avoid errors caused by Locust's use
of gevent monkey-patching.

```python
Jinja2Instrumentor().instrument()
RequestsInstrumentor().instrument()
URLLib3Instrumentor().instrument()
```

Once initialized, every Locust request made by this load generator will have its
own trace with a span for each of the `Requests` and `URLLib3` libraries.

### Manual spans

Each simulated user action (browsing a product, viewing the cart, checking out,
and so on) also gets its own manual span, created with
`tracer.start_as_current_span`. Attributes such as `demo.product.id`,
`demo.ad.category`, and `demo.cart.items.count` are attached where relevant.
These attributes are declared for `service.load_generator` in the
[telemetry schema](https://github.com/open-telemetry/opentelemetry-demo/blob/main/telemetry-schema/services/load_generator.yaml).

## Metrics

A `MeterProvider` is configured with a `PeriodicExportingMetricReader` and an
OTLP exporter. The `SystemMetricsInstrumentor` uses it to report process-level
system metrics (CPU, memory, and so on) for the load generator itself.

## Logs

A `LoggerProvider` batches and exports log records over OTLP. The standard
library's `logging` module is attached to it through a `LoggingHandler`, and
`LoggingInstrumentor` injects the active trace and span IDs into each log
record, so calls like `logging.info(...)` throughout the locustfile show up
correlated with their span.

## Baggage

OpenTelemetry Baggage is used by the load generator to indicate that its traces
are synthetically generated. This is done in the `on_start` function by creating
a context object containing the baggage items, and attaching that context for
all tasks run by the simulated user.

```python
ctx = baggage.set_baggage("session.id", session_id)
ctx = baggage.set_baggage("synthetic_request", "true", context=ctx)
context.attach(ctx)
```

The context is attached outside of any span's `with` block: attaching it inside
a span's context manager would cause that span's exit to detach the baggage as
well, silently discarding it for the rest of the user's session.

Baggage on its own doesn't mark the telemetry. Each backend service reads the
`synthetic_request` entry out of the incoming baggage and copies it onto its own
spans and log records as an attribute, and it is that attribute which records
whether the telemetry came from a synthetic flow. The frontend sets
`demo.synthetic_request`, while the checkout and payment services set
`user_agent.synthetic.type` to `test`. Because the marker ends up on the
telemetry itself, you can filter load-generator traffic in or out of any query
in your observability backend.
