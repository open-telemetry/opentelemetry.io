---
title: Agent Service
linkTitle: Agent
cSpell:ignore: fastapi httpx langchain langgraph openai
---

This service provides the AI assistant for the demo. It exposes a FastAPI
endpoint that accepts a user prompt, routes it through a LangGraph ReAct agent,
and calls the shop's APIs through built-in tools or through tools loaded from
the [MCP service](../mcp/).

[Agent service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/agent/)

## LLM Configuration

By default, this service replays recorded LLM responses so that the demo runs
without a live model. To use a real OpenAI-compatible LLM, populate the
following environment variables in the `.env.override` file:

```text
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
API_KEY=<replace with API key>
USE_VCR=False
```

## Instrumentation libraries

This service is not started through the `opentelemetry-instrument` wrapper. The
`Dockerfile` runs the script directly, and instrumentation is set up in code:

```dockerfile
CMD ["python", "run.py"]
```

In `run.py`, the [Traceloop SDK](https://www.traceloop.com/) initializes the
OpenTelemetry SDK and enables its bundle of generative-AI instrumentation
libraries. The HTTPX instrumentation is then enabled explicitly:

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "agent"),
)

HTTPXClientInstrumentor().instrument()
```

The FastAPI instrumentation is applied once the application object exists, in
`start_servers`:

```python
FastAPIInstrumentor.instrument_app(agent.app)
```

Together these produce spans without any manual span creation:

- `opentelemetry-instrumentation-fastapi` — server spans for requests to
  `POST /prompt`.
- `opentelemetry-instrumentation-httpx` — client spans for outbound calls, both
  to the LLM API and to the frontend API used by the shop tools.
- Traceloop's bundle, in particular `opentelemetry-instrumentation-langchain`,
  `opentelemetry-instrumentation-openai` and `opentelemetry-instrumentation-mcp`
  — spans for the LangChain and LangGraph steps, the LLM invocations, and MCP
  tool calls when `MCP_ENABLED=True`.

## Traces

### Initializing Tracing

`Traceloop.init()` creates a tracer provider with a batch span processor and an
OTLP exporter, and registers it as the global tracer provider. The
instrumentation libraries above therefore share a single export pipeline.

The export endpoint is taken from `TRACELOOP_BASE_URL` rather than
`OTEL_EXPORTER_OTLP_ENDPOINT`, and Traceloop appends `/v1/traces` to it. In
Docker Compose this points at the OpenTelemetry Collector's OTLP/HTTP port. The
`app_name` argument becomes the `service.name` resource attribute, and
additional resource attributes are read from `OTEL_RESOURCE_ATTRIBUTES`.

### Create new spans

The `run_agent` method is wrapped in Traceloop's `@workflow` decorator, which
starts a span for the whole agent run. The LLM and tool spans created by the
instrumentation libraries become children of it:

```python
@workflow(name="astronomy_shop_agent_workflow")
async def run_agent(self, input_prompt, history: List[Dict] | None = None):
```

This produces a span named `astronomy_shop_agent_workflow`. Because a single
prompt can trigger several reasoning and tool-calling turns, this span is what
groups one end-to-end agent run together.

Beyond this decorator, the service does not use the OpenTelemetry tracing API
directly: it does not create spans with `start_as_current_span`, and it does not
enrich spans using `set_attribute`.

### Prompt and completion content

The bundled generative-AI instrumentations follow the OpenTelemetry
[generative AI semantic conventions](/docs/specs/semconv/gen-ai/) and record
prompts and completions as span attributes, `gen_ai.input.messages` and
`gen_ai.output.messages`. Set `TRACELOOP_TRACE_CONTENT=false` to keep prompt and
completion content out of the exported spans.

## Metrics

### Initializing Metrics

`Traceloop.init()` also configures metrics, unless
`TRACELOOP_METRICS_ENABLED=false` is set. It creates a meter provider with a
periodic exporting metric reader and registers it globally, so the metrics
emitted by the FastAPI and HTTPX instrumentation libraries are exported.

### Custom metrics

This service does not define custom metrics. It does not obtain a meter or
create any instruments of its own.

## Logs

The service configures the Python standard library logger only:

```python
logging.basicConfig(level=logging.INFO)
```

Traceloop's log export is disabled by default, and the service does not set up a
`LoggerProvider` or a `LoggingHandler`. Log records are written to stdout and
collected by the container runtime instead of being exported over OTLP, so they
are not correlated with traces. See the
[log coverage matrix](../../telemetry-features/log-coverage/).

For the full list of environment variables and troubleshooting steps, see the
[service README](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/agent#readme).
