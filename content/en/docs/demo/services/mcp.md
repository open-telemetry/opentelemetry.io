---
title: MCP Service
linkTitle: MCP
aliases: [mcpservice]
cSpell:ignore: fastmcp httpx jlowin
---

The MCP service exposes the OpenTelemetry Astronomy Shop demo's tools over the
[Model Context Protocol](https://modelcontextprotocol.io/). It runs a
[FastMCP](https://github.com/jlowin/fastmcp) server that lets the
[Agent service](../agent/) (or any other MCP-compatible client) discover and
invoke shop operations such as listing products, managing carts, and checking
out.

[MCP service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/mcp/)

## Overview

- Runtime: Python 3.14
- MCP framework: [FastMCP](https://github.com/jlowin/fastmcp) (built on top of
  `mcp`)
- Transport: HTTP streamable transport at `/mcp`
- Observability: Traceloop SDK and OpenTelemetry OTLP export, with `httpx`
  auto-instrumentation
- Default port: `8011`

The service starts from `run.py`, initializes Traceloop instrumentation,
instruments the `httpx` client, and launches the FastMCP server in a worker
thread.

## Exposed MCP tools

The MCP server registers the Astronomy Shop tools defined in
`src/shared/tools.py` (copied into the image at build time). Each tool calls the
frontend HTTP API through `APPLICATION_ENDPOINT`.

| Tool                                                | Description                             |
| --------------------------------------------------- | --------------------------------------- |
| `list_products`                                     | Lists available products.               |
| `get_product(product_id)`                           | Gets details for a specific product.    |
| `get_ads(category)`                                 | Fetches promotional ads for a category. |
| `get_recommendations(product_id)`                   | Returns product recommendations.        |
| `add_to_cart(user_id, product_id, quantity)`        | Adds an item to a user's cart.          |
| `get_cart(user_id)`                                 | Retrieves a user's cart.                |
| `empty_cart(user_id)`                               | Empties a user's cart.                  |
| `checkout(checkout_person)`                         | Performs checkout for a user's cart.    |
| `get_supported_currencies()`                        | Lists supported currencies.             |
| `get_shipping_quote(items, currency_code, address)` | Returns a shipping quote.               |

MCP clients connect to the streamable HTTP endpoint:

```text
http://${MCP_ENDPOINT}:${MCP_PORT}/mcp
```

## Traces

This service uses the [Traceloop SDK](https://www.traceloop.com/) layered on top
of OpenTelemetry. `run.py` initializes Traceloop with the application name `mcp`
and the OTLP endpoint from `OTEL_EXPORTER_OTLP_ENDPOINT` (defaulting to
`localhost:4317`).

The `HTTPXClientInstrumentor` is enabled so that outbound calls to the frontend
(made by the shop tools) are traced. Export endpoints, resource attributes, and
service name are set through OpenTelemetry environment variables. In Docker
Compose, telemetry is sent to the local OpenTelemetry Collector and the service
name is set to `mcp`.

## Configuration

The service is configured with environment variables. Values can be supplied
through Docker Compose, `.env`, `.env.override`, or the local shell environment.

| Variable                      | Default                    | Description                                                                                           |
| ----------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `MCP_PORT`                    | `8011`                     | Port used by the FastMCP HTTP server.                                                                 |
| `MCP_ENDPOINT`                | `mcp` in Compose           | Service hostname used by other demo services (e.g. `agent`).                                          |
| `APPLICATION_ENDPOINT`        | `frontend:8080` in Compose | Frontend/API endpoint used by the shop tools.                                                         |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `localhost:4317`           | OTLP endpoint used by Traceloop/OpenTelemetry. In Compose this points to the OpenTelemetry Collector. |
| `OTEL_EXPORTER_OTLP_INSECURE` | unset                      | Set to `true` in Compose for insecure local OTLP export.                                              |
| `OTEL_RESOURCE_ATTRIBUTES`    | inherited                  | Additional OpenTelemetry resource attributes (Compose adds `service.criticality=low`).                |
| `OTEL_SERVICE_NAME`           | `AstronomyShopAgentMCP`    | Service name used in telemetry.                                                                       |

### Docker Compose configuration

In `compose.agent.yaml`, the service is named `mcp` and is built from
`src/mcp/Dockerfile`. It depends on the `agent` service. The `agent` service
enables MCP usage via:

```text
MCP_ENABLED=True
MCP_ENDPOINT=mcp
MCP_PORT=8011
```

When `MCP_ENABLED=True` on the agent side, the agent loads its tools from this
MCP service instead of using its own built-in tools.

## Local development

From `src/mcp`, install dependencies. Because the service imports the shop tools
from the shared source tree (the Dockerfile copies `src/shared/tools.py` into
`src/mcp_server/`), make the same file available locally before running:

```sh
pip install -r src/mcp/requirements.txt
cp src/shared/tools.py src/mcp/src/mcp_server/tools.py

cd src/mcp
MCP_PORT=8011 \
APPLICATION_ENDPOINT=localhost:8080 \
OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317 \
python run.py
```

The MCP endpoint will be available at `http://localhost:8011/mcp`.

You can verify the server is reachable with any MCP client. A quick smoke test
using `curl` against the streamable HTTP transport:

```sh
curl -i http://localhost:8011/mcp
```

A 4xx response with MCP-specific headers indicates the server is up; full
interaction requires a proper MCP client (such as the `agent` service with
`MCP_ENABLED=True`, or `langchain_mcp_adapters`).
