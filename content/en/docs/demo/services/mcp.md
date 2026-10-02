---
title: MCP Service
linkTitle: MCP
cSpell:ignore: fastmcp httpx
---

This service exposes the shop's operations as tools over the
[Model Context Protocol](https://modelcontextprotocol.io/), so that the
[Agent service](../agent/) and other MCP-compatible clients can call them. Each
tool is a thin wrapper that calls the frontend API over HTTP.

[MCP service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/mcp/)

## Instrumentation libraries

This service is not started through the `opentelemetry-instrument` wrapper. The
`Dockerfile` runs the script directly, and instrumentation is set up in code:

```dockerfile
CMD ["python", "run.py"]
```

In `run.py`, the [Traceloop SDK](https://www.traceloop.com/) initializes the
OpenTelemetry SDK and enables its bundle of instrumentation libraries, including
`opentelemetry-instrumentation-mcp`. The HTTPX instrumentation is then enabled
explicitly:

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "mcp"),
)

HTTPXClientInstrumentor().instrument()
```

This combination covers both sides of the service without any manual span
creation:

- `opentelemetry-instrumentation-mcp` — spans for inbound MCP tool calls handled
  by the FastMCP server.
- `opentelemetry-instrumentation-httpx` — client spans for the outbound HTTP
  calls each tool makes to the frontend API.

Because the agent and this service are instrumented with the same MCP
instrumentation, context propagates across the MCP transport, and a tool call
made by the agent appears in the same trace as the work this service performs.

## Traces

### Initializing Tracing

`Traceloop.init()` creates a tracer provider with a batch span processor and an
OTLP exporter, and registers it as the global tracer provider, so the
instrumentation libraries above share a single export pipeline.

The export endpoint is taken from `TRACELOOP_BASE_URL` rather than
`OTEL_EXPORTER_OTLP_ENDPOINT`, and Traceloop appends `/v1/traces` to it. In
Docker Compose this points at the OpenTelemetry Collector's OTLP/HTTP port. The
`app_name` argument becomes the `service.name` resource attribute, and
additional resource attributes are read from `OTEL_RESOURCE_ATTRIBUTES`.

### Create new spans

This service creates no spans of its own. Tools are registered with the FastMCP
server and are left unwrapped, so all spans come from the instrumentation
libraries:

```python
self.mcp.tool("add_to_cart")(tools.add_to_cart)
```

The service does not use the OpenTelemetry tracing API directly: it does not
call `start_as_current_span`, and it does not enrich spans using
`set_attribute`.

## Metrics

### Initializing Metrics

`Traceloop.init()` also configures metrics, unless
`TRACELOOP_METRICS_ENABLED=false` is set. It creates a meter provider with a
periodic exporting metric reader and registers it globally, so the metrics
emitted by the HTTPX instrumentation library are exported.

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
[service README](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/mcp#readme).
