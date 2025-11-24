---
title: Product Reviews Service
linkTitle: Product Reviews
aliases: [productreviewsservice]
cSpell:ignore: cpython instrumentor NOTSET productreviewsservice
---

This service is responsible for returning product reviews and answering
questions about a specific product based on the product description and reviews.

It uses an OpenAI-compatible LLM to answer the end-users question about a
specific product.

The product reviews are stored in the database (PostgreSQL).

[Product Reviews service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/product-reviews/)

## LLM Configuration

By default, this service uses a mock LLM that adheres to the OpenAI API format.
This can be substituted for an actual OpenAI LLM by populating the following
environment variables in the `.env.override` file:

```text
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=<replace with API key>
```

## Auto-instrumentation

This Python based service, makes use of the OpenTelemetry auto-instrumentor for
Python, accomplished by leveraging the `opentelemetry-instrument` Python wrapper
to run the scripts. This can be done in the `ENTRYPOINT` command for the
service's `Dockerfile`.

```dockerfile
ENTRYPOINT [ "opentelemetry-instrument", "python", "product_reviews_server.py" ]
```

## Traces

### Initializing Tracing

The OpenTelemetry SDK is initialized in the `__main__` code block. This code
will create a tracer provider, and establish a Span Processor to use. Export
endpoints, resource attributes, and service name are automatically set by the
OpenTelemetry auto instrumentor based on environment variables.

```python
tracer = trace.get_tracer_provider().get_tracer("product-reviews")
```

### Add attributes to auto-instrumented spans

Within the execution of auto-instrumented code you can get current span from
context.

```python
span = trace.get_current_span()
```

Adding attributes to a span is accomplished using `set_attribute` on the span
object. In the `get_product_reviews` function an attribute is added to the span
to capture the product ID that was passed into the request:

```python
span.set_attribute("app.product.id", request_product_id)
```

### Create new spans

New spans can be created and placed into active context using
`start_as_current_span` from an OpenTelemetry Tracer object. When used in
conjunction with a `with` block, the span will automatically be ended when the
block ends execution. This is done in the `get_product_reviews` function.

```python
with tracer.start_as_current_span("get_product_reviews") as span:
```

## Metrics

### Initializing Metrics

The OpenTelemetry SDK is initialized in the `__main__` code block. This code
will create a meter provider. Export endpoints, resource attributes, and service
name are automatically set by the OpenTelemetry auto instrumentor based on
environment variables.

```python
meter = metrics.get_meter_provider().get_meter("product-reviews")
```

### Custom metrics

The following custom metrics are currently available:

- `app_product_review_counter`: Cumulative count of # product reviews returned
  by the service
- `app_ai_assistant_counter`: Cumulative count of # total number questions sent
  to the product AI Assistant

### Auto-instrumented metrics

The following metrics are available through auto-instrumentation, courtesy of
the `opentelemetry-instrumentation-system-metrics`, which is installed as part
of `opentelemetry-bootstrap` on building the product reviews service Docker
image:

- `runtime.cpython.cpu_time`
- `runtime.cpython.memory`
- `runtime.cpython.gc_count`

## Logs

### Initializing logs

The OpenTelemetry SDK is initialized in the `__main__` code block. The following
code creates a logger provider with a batch processor, an OTLP log exporter, and
a logging handler. Finally, it creates a logger for use throughout the
application.

```python
logger_provider = LoggerProvider(
    resource=Resource.create(
        {
            'service.name': service_name,
        }
    ),
)
set_logger_provider(logger_provider)
log_exporter = OTLPLogExporter(insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(log_exporter))
handler = LoggingHandler(level=logging.NOTSET, logger_provider=logger_provider)

logger = logging.getLogger('main')
logger.addHandler(handler)
```

### Create log records

Create logs using the logger. Examples can be found in the
`get_ai_assistant_response` function.

```python
logger.info(f"Model wants to call {len(tool_calls)} tool(s)")
```

As you can see, after the initialization, log records can be created in the same
way as in standard Python. OpenTelemetry libraries automatically add a trace ID
and span ID for each log record and, in this way, enable correlating logs and
traces.

### Notes

Logs for Python are still experimental, and some changes can be expected. The
implementation in this service follows the
[Python log example](https://github.com/open-telemetry/opentelemetry-python/blob/stable/docs/examples/logs/example.py).
