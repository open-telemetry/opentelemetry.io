---
title: Chatbot Service
linkTitle: Chatbot
aliases: [chatbotservice]
cSpell:ignore: chatbotservice Gradio httpx
---

The Chatbot service provides a browser-based chat UI for the Astronomy Shop. It
is built with [Gradio](https://www.gradio.app/) and forwards user messages to
the [Agent service](../agent/), displaying the agent's replies. When the demo is
running, the chat UI is available through the frontend proxy at
<http://localhost:8080/chatbot/>.

[Chatbot service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/chatbot/)

The service is written in Python, uses Gradio for the UI and the `requests`
client to call the Agent service, and listens on port `7860` by default
(`CHATBOT_PORT`).

## Instrumentation

The Chatbot configures the OpenTelemetry SDK manually in `run.py`: it creates a
`TracerProvider` with the service name, exports spans over OTLP/gRPC with a
`BatchSpanProcessor`, and enables the `requests` and `httpx` instrumentation
libraries so outbound calls to the Agent service are traced automatically.

```python
provider = TracerProvider(resource=resource)
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
trace.set_tracer_provider(provider)

RequestsInstrumentor().instrument()
HTTPXClientInstrumentor().instrument()
```

Because the Agent and MCP services are also instrumented, a message typed into
the chatbot produces a single distributed trace that spans the chatbot, the
agent, its LLM calls, and the shop services the agent invokes.

## Configuration

| Variable            | Default    | Description                                           |
| ------------------- | ---------- | ----------------------------------------------------- |
| `CHATBOT_PORT`      | `7860`     | Port for the Gradio server.                           |
| `CHATBOT_ROOT_PATH` | `/chatbot` | Root path used when served behind the frontend proxy. |
| `AGENT_ENDPOINT`    | `agent`    | Hostname of the Agent service.                        |
| `AGENT_PORT`        | `8010`     | Port of the Agent service.                            |
