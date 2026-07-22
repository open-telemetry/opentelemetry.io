---
title: MCP Service
linkTitle: MCP
aliases: [mcpservice]
cSpell:ignore: HTTPX mcpservice
---

The MCP service exposes the Astronomy Shop's operations as tools over the
[Model Context Protocol](https://modelcontextprotocol.io/), so the
[Agent service](../agent/) — or any other MCP-compatible client — can discover
and invoke them. It runs a [FastMCP](https://github.com/jlowin/fastmcp) server
with an HTTP streamable transport at `/mcp`, on port `8011` by default
(`MCP_PORT`).

[MCP service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/mcp/)

The tools it registers — listing products, fetching recommendations and ads,
managing carts, checking out, and getting shipping quotes — are the shared shop
tools in `src/shared/tools.py`. Each tool calls the frontend HTTP API configured
by `APPLICATION_ENDPOINT` (`frontend:8080` in Compose).

## Instrumentation

Like the [Agent](../agent/), the MCP service is instrumented with the
[Traceloop SDK](https://www.traceloop.com/docs/openllmetry) and exports over
OTLP. It also enables the HTTPX instrumentation so the outbound calls its tools
make to the frontend are captured as child spans:

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "mcp"),
    api_endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "localhost:4317"),
)

HTTPXClientInstrumentor().instrument()
```

When the agent runs with `MCP_ENABLED=True`, it loads its tools from this
service instead of using its own built-in tools.
