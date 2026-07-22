---
title: Agent Service
linkTitle: Agent
aliases: [agentservice]
cSpell:ignore: agentservice langchain openai Uvicorn
---

The Agent service provides an AI assistant for the Astronomy Shop. It exposes a
[FastAPI](https://fastapi.tiangolo.com/) HTTP endpoint (`POST /prompt`) that
routes user prompts through a [LangGraph](https://www.langchain.com/langgraph)
agent, which answers questions and performs shop operations using either
built-in tools or tools provided by the [MCP service](../mcp/).

[Agent service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/agent/)

The service is written in Python and uses:

- FastAPI served by Uvicorn for the HTTP API
- [LangChain](https://www.langchain.com/) and LangGraph for agent orchestration
- `langchain_openai.ChatOpenAI` as the LLM client, with support for non-OpenAI
  models through a LiteLLM-compatible endpoint

It listens on port `8010` by default (`AGENT_PORT`).

## Instrumentation

Unlike most demo services, the Agent is instrumented with the
[Traceloop SDK](https://www.traceloop.com/docs/openllmetry) (OpenLLMetry), which
builds on OpenTelemetry to capture generative-AI spans — prompts, completions,
token usage, and tool calls — following the OpenTelemetry
[generative AI semantic conventions](/docs/specs/semconv/gen-ai/). Traceloop is
initialized in `run.py` and exports over OTLP, and the outbound HTTP client is
instrumented so calls to the LLM and MCP service are traced:

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "agent"),
    api_endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "localhost:4317"),
)

HTTPXClientInstrumentor().instrument()
```

Incoming requests are traced with the OpenTelemetry FastAPI instrumentation:

```python
FastAPIInstrumentor.instrument_app(agent.app)
```

### Traces

The agent's top-level logic is wrapped in a Traceloop workflow, so each prompt
produces a single, well-named trace:

```python
@workflow(name="astronomy_shop_agent_workflow")
async def run_agent(self, input_prompt, history=None):
    ...
```

Within a workflow, Traceloop automatically records the LangChain and LangGraph
steps and the underlying LLM calls as child spans.

## Tools

The agent can operate in two modes:

- **Built-in tools** (`MCP_ENABLED=False`): the agent calls the Astronomy Shop
  tools defined in `src/shared/tools.py` directly.
- **MCP tools** (`MCP_ENABLED=True`, the default in Docker Compose): the agent
  loads its tools from the [MCP service](../mcp/) over the Model Context
  Protocol, using `langchain_mcp_adapters`.

Both modes reach the shop through the frontend API configured by
`APPLICATION_ENDPOINT` (`frontend:8080` in Compose).

## Configuration

The service is configured through environment variables (see the
[service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/agent/)
for the full list). The most relevant ones are:

| Variable               | Default                     | Description                                |
| ---------------------- | --------------------------- | ------------------------------------------ |
| `AGENT_PORT`           | `8010`                      | Port for the FastAPI/Uvicorn server.       |
| `APPLICATION_ENDPOINT` | `frontend:8080`             | Frontend API used by the shop tools.       |
| `LLM_BASE_URL`         | unset                       | Base URL of the OpenAI-compatible LLM API. |
| `LLM_MODEL`            | `default`                   | Model name passed to the LLM client.       |
| `API_KEY`              | unset                       | API key for the configured LLM provider.   |
| `MCP_ENABLED`          | `False` (`True` in Compose) | Load tools from the MCP service.           |

To avoid requiring live LLM access, the service ships canned responses for a
small set of demo prompts, such as "Show all available products in the store".
