---
title: Agent Service
linkTitle: Agent
aliases: [agentservice]
cSpell:ignore:
  langgraph langchain litellm traceloop fastmcp uvicorn gradio vcr cassettes
  ChatOpenAI
---

The Agent service provides an AI assistant for the OpenTelemetry Astronomy Shop
demo. It exposes a FastAPI HTTP endpoint that accepts user prompts, routes them
through a LangGraph ReAct agent, and uses either built-in shop tools or
MCP-provided tools to interact with the demo application.

[Agent service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/agent/)

## Overview

- Runtime: Python 3.14
- Web framework: FastAPI served by Uvicorn
- Agent framework: LangChain and LangGraph prebuilt components
- LLM client: `langchain_openai.ChatOpenAI`, with support for non-OpenAI models
  via the LiteLLM client
- Observability: Traceloop SDK and OpenTelemetry OTLP export
- Optional tool source: Model Context Protocol (MCP)
- Default port: `8010`

The service starts from `run.py`, initializes Traceloop instrumentation, creates
an `Agent`, and launches a FastAPI server.

## Service API

### `POST /prompt`

Submits a prompt to the agent.

Request body:

```json
{
  "message": "List available products",
  "history": []
}
```

Response body:

```json
{
  "response": {
    "messages": []
  }
}
```

The exact response shape is produced by the LangGraph agent invocation.

## Traces

This service uses the [Traceloop SDK](https://www.traceloop.com/) layered on top
of OpenTelemetry to instrument the agent's LLM and tool calls. `run.py`
initializes Traceloop with the application name `agent` and the OTLP endpoint
from `OTEL_EXPORTER_OTLP_ENDPOINT` (defaulting to `localhost:4317`).

The `run_agent` method is decorated as a Traceloop workflow, which produces a
span named:

```text
astronomy_shop_agent_workflow
```

Traceloop automatically captures spans for LLM invocations and tool executions
within the workflow. Export endpoints, resource attributes, and service name are
set through OpenTelemetry environment variables. In Docker Compose, telemetry is
sent to the local OpenTelemetry Collector and the service name is set to
`agent`.

## Tools

### Built-in tools

When `MCP_ENABLED` is `False`, the agent uses built-in tools from
`src/shared/tools.py`:

- `get_ads(category)` - fetches promotional ads.
- `list_products()` - lists available products.
- `get_product(product_id)` - gets product details.
- `add_to_cart(user_id, product_id, quantity)` - adds an item to a user's cart.
- `get_cart(user_id)` - retrieves a user's cart.
- `empty_cart(user_id)` - empties a user's cart.
- `checkout(checkout_person)` - performs checkout for a user's cart.
- `get_supported_currencies()` - lists supported currencies.
- `get_recommendations(product_id)` - gets product recommendations.
- `get_shipping_quote(items, currency_code, address)` - gets a shipping quote.

These tools call the frontend API through `APPLICATION_ENDPOINT`.

### MCP tool mode

When `MCP_ENABLED=True`, the service connects to the [MCP service](../mcp/) at:

```text
http://${MCP_ENDPOINT}:${MCP_PORT}/mcp
```

Tools are loaded dynamically using
`langchain_mcp_adapters.tools.load_mcp_tools`. In this mode, the built-in tools
are not used.

## Configuration

The service is configured with environment variables. Values can be supplied
through Docker Compose, `.env`, `.env.override`, or the local shell environment.

| Variable                      | Default                             | Description                                                                                                        |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `AGENT_PORT`                  | `8010`                              | Port used by the FastAPI/Uvicorn server.                                                                           |
| `AGENT_ENDPOINT`              | `agent` in Compose                  | Service hostname used by other demo services.                                                                      |
| `GRAPH_RECURSION_LIMIT`       | `25`                                | Recursion limit read by the agent implementation.                                                                  |
| `APPLICATION_ENDPOINT`        | `localhost:8080`                    | Frontend/API endpoint used by built-in shop tools. In Compose this is usually `frontend:8080`.                     |
| `LLM_BASE_URL`                | unset                               | Base URL for the OpenAI-compatible LLM API.                                                                        |
| `LLM_MODEL`                   | `default`                           | Model name passed to the LLM client.                                                                               |
| `API_KEY`                     | unset                               | API key for the configured LLM provider.                                                                           |
| `LLM_TLS_VERIFY`              | `True`                              | Enables TLS certificate verification for LLM HTTP calls. Set to `False` only for trusted development environments. |
| `USE_VCR`                     | `False`                             | Enables replay/recording through VCR cassettes for LLM requests.                                                   |
| `MCP_ENABLED`                 | `False`                             | Enables tool loading from the MCP service when set to `True`.                                                      |
| `MCP_ENDPOINT`                | `0.0.0.0` in code, `mcp` in Compose | Hostname for the MCP service.                                                                                      |
| `MCP_PORT`                    | `8011`                              | Port for the MCP service.                                                                                          |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `localhost:4317`                    | OTLP endpoint used by Traceloop/OpenTelemetry. In Compose this points to the OpenTelemetry Collector.              |
| `OTEL_EXPORTER_OTLP_INSECURE` | unset                               | Set to `true` in Compose for insecure local OTLP export.                                                           |
| `OTEL_RESOURCE_ATTRIBUTES`    | inherited                           | Additional OpenTelemetry resource attributes.                                                                      |
| `OTEL_SERVICE_NAME`           | `AstronomyShopAgent`                | Service name used in telemetry.                                                                                    |

Do not commit real API keys. Prefer local overrides or secret management for
`API_KEY`. Note that the VCR file is created using `LLM_MODEL` and is case
sensitive.

### Docker Compose configuration

In `compose.agent.yaml`, the service is named `agent` and is built from
`src/agent/Dockerfile`. The Compose configuration enables MCP by default for
this service with:

```text
MCP_ENABLED=True
MCP_ENDPOINT=mcp
MCP_PORT=8011
```

## VCR fixtures

The `fixtures/vcr_cassettes` directory is used when `USE_VCR=True`. Cassette
names are derived from the configured model name by replacing `/` with `_` and
appending `_cassette.yaml`. This mode is useful for deterministic development
and tests that should not call the live LLM API.

## Local development

From the repository root, install dependencies and run the service:

```sh
pip install -r src/agent/requirements.txt

cd src/agent
AGENT_PORT=8010 \
APPLICATION_ENDPOINT=localhost:8080 \
LLM_BASE_URL=<llm-base-url> \
LLM_MODEL=<model-name> \
API_KEY=<api-key> \
python run.py
```

To run the agent in MCP mode with `MCP_ENABLED=True`, see the
[MCP service](../mcp/) documentation.

You can test the endpoint with:

```sh
curl -X POST http://localhost:8010/prompt \
  -H 'Content-Type: application/json' \
  -d '{"message":"List products in the shop","history":[]}'
```
