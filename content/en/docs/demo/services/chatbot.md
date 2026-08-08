---
title: Chatbot Service
linkTitle: Chatbot
cSpell:ignore: gradio httpx
---

This service provides the chat interface for the demo's AI assistant. It serves
a [Gradio](https://www.gradio.app/) web UI, forwards each user message to the
[Agent service](../agent/) over HTTP, and renders the reply. It is exposed
through the frontend proxy at `/chatbot`.

[Chatbot service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/chatbot/)

## Instrumentation libraries

This service is not started through the `opentelemetry-instrument` wrapper. The
`Dockerfile` runs the script directly, and instrumentation is set up in code:

```dockerfile
CMD ["python", "run.py"]
```

Unlike the [Agent](../agent/) and [MCP](../mcp/) services, this service uses the
OpenTelemetry SDK directly rather than the Traceloop SDK. Two HTTP client
instrumentation libraries are enabled:

```python
RequestsInstrumentor().instrument()
HTTPXClientInstrumentor().instrument()
```

The call to the agent is made with `requests`, so
`opentelemetry-instrumentation-requests` produces the client span for it and
injects the trace context into the outgoing request. This is what links the chat
interface to the agent, and in turn to the LLM and tool calls the agent makes.

The Gradio server itself is not instrumented, so incoming browser requests do
not produce server spans. Traces from this service begin at the outbound call to
the agent.

## Traces

### Initializing Tracing

Tracing is configured explicitly in `_configure_tracing`, which `run.py` calls
at import time. The code creates a tracer provider, adds a batch span processor
with an OTLP exporter, and registers the provider globally so that the
instrumentation libraries use it:

```python
def _configure_tracing() -> None:
    provider = TracerProvider()
    provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
    trace.set_tracer_provider(provider)

    RequestsInstrumentor().instrument()
    HTTPXClientInstrumentor().instrument()
```

The exporter is imported from
`opentelemetry.exporter.otlp.proto.http.trace_exporter`, so this service exports
over OTLP/HTTP. Docker Compose sets `OTEL_EXPORTER_OTLP_ENDPOINT` to the
OpenTelemetry Collector's OTLP/HTTP port for this service, whereas most other
demo services export over gRPC. Export endpoint, resource attributes, and
service name are all taken from the standard OpenTelemetry environment
variables.

### Create new spans

This service creates no spans of its own. It does not obtain a tracer, does not
call `start_as_current_span`, and does not enrich spans using `set_attribute`.
All of its spans come from the `requests` and HTTPX instrumentation libraries.

## Metrics

No meter provider is configured. The service imports only the trace exporter and
never calls `metrics.set_meter_provider`, so the metrics that the `requests` and
HTTPX instrumentation libraries can emit have nowhere to go and are not
exported. See the
[metric coverage matrix](../../telemetry-features/metric-coverage/).

## Logs

The service configures the Python standard library logger only:

```python
logging.basicConfig(level=logging.INFO)
```

Requests to the agent, and any errors, are logged through it in
`chat_with_agent`:

```python
logging.info(f"Sending request {payload} to Agent")
```

Because no `LoggerProvider` or `LoggingHandler` is set up, these records go to
stdout and are collected by the container runtime instead of being exported over
OTLP, so they are not correlated with traces. See the
[log coverage matrix](../../telemetry-features/log-coverage/).

For the full list of environment variables and troubleshooting steps, see the
[service README](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/chatbot#readme).