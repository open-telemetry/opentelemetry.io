---
title: Chatbot Service
linkTitle: Chatbot
aliases: [chatbotservice]
cSpell:ignore: gradio httpx
---

The Chatbot service provides a browser-based chat UI for the OpenTelemetry
Astronomy Shop demo. It uses [Gradio](https://www.gradio.app/) to render the
interface and forwards user messages to the [Agent service](./agent.md).

[Chatbot service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/chatbot/)

## Overview

- Runtime: Python 3.11
- UI framework: Gradio
- HTTP client: Requests
- Observability: OpenTelemetry traces exported with OTLP/gRPC
- Default port: `7860`, exposed outside Docker at
  `http://localhost:8080/chatbot/`

The service starts from `run.py`, configures OpenTelemetry tracing, creates a
`ChatAgentUI`, and launches a Gradio `ChatInterface`. When running, the chatbot
UI is available at [http://localhost:8080/chatbot/](http://localhost:8080/chatbot/).

## How it works

1. A user submits a message in the Gradio chat UI.
2. The chatbot sends a request to the Agent service at:

   ```text
   http://${AGENT_ENDPOINT}:${AGENT_PORT}/prompt
   ```

3. The Agent service returns a response object.
4. The chatbot displays the final message from the response in the UI.

Request body sent to the Agent service:

```json
{
  "message": "List available products",
  "session_id": "<gradio-session-id>",
  "history": []
}
```

The `history` field carries past interactions with the agent in the same
session, and is an empty list for the first request.

### Default requests

To omit the requirement of LLM access, a limited number of requests have
pre-defined responses. Requests users can try out are:

1. Show all available products in the store.
2. What currencies are supported by the Astronomy Shop?
3. What current promotions are available on binoculars?

## Traces

`run.py` configures a `TracerProvider` with the service name from
`OTEL_SERVICE_NAME`, defaulting to `chatbot`. Export endpoints and resource
attributes are set through OpenTelemetry environment variables.

The service instruments outbound HTTP calls made with `requests` and `httpx`,
so calls from the chatbot to the Agent service are captured as spans. Spans are
exported through `opentelemetry-exporter-otlp-proto-grpc` to the configured OTLP
endpoint. In Docker Compose, telemetry is sent to the local OpenTelemetry
Collector.

## Configuration

The service is configured with environment variables. Values can be supplied
through Docker Compose, `.env`, `.env.override`, or the local shell environment.

| Variable | Default | Description |
| --- | --- | --- |
| `CHATBOT_ENDPOINT` | `0.0.0.0` | Host/interface where the Gradio server binds. |
| `CHATBOT_HOST` | `chatbot` in `.env` | Hostname used by other services, such as the frontend proxy. |
| `CHATBOT_PORT` | `7860` | Port used by the Gradio server. |
| `CHATBOT_ROOT_PATH` | empty, `/chatbot` in `.env` | Root path used when the UI is served behind the frontend proxy. |
| `AGENT_ENDPOINT` | `0.0.0.0` in code, `agent` in `.env` | Hostname of the Agent service. |
| `AGENT_PORT` | `8010` | Port of the Agent service. |
| `AGENT_CHAT_INTERFACE_TIMEOUT` | `300` | Timeout, in seconds, for calls from the chatbot to the Agent service. |
| `OTEL_SERVICE_NAME` | `chatbot` in Compose | Service name used in telemetry. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `otel-collector` | OTLP endpoint used by the OpenTelemetry exporter. In Compose this points to the OpenTelemetry Collector. |
| `OTEL_RESOURCE_ATTRIBUTES` | inherited | Additional OpenTelemetry resource attributes. |

### Docker Compose configuration

In `docker-compose.yml`, the service is named `chatbot` and is built from
`src/chatbot/Dockerfile`. It depends on the `agent` service. The frontend proxy
receives `CHATBOT_HOST` and `CHATBOT_PORT`, so the chatbot can be exposed
through the demo UI, usually under `/chatbot`.

## Local development

From the repository root, install dependencies. Run the Agent service first,
then start the chatbot:

```sh
pip install -r src/chatbot/requirements.txt

cd src/chatbot
CHATBOT_PORT=7860 \
AGENT_ENDPOINT=localhost \
AGENT_PORT=8010 \
python run.py
```

Open the UI at `http://localhost:7860`. If running behind the frontend proxy,
set `CHATBOT_ROOT_PATH=/chatbot`.
