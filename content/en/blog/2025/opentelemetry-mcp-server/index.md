---
title: Building an MCP server for OpenTelemetry
author: >-
  [Pavol Loffay](https://github.com/pavolloffay) (Red Hat)
linkTitle: Collector MCP Server
issue: https://github.com/open-telemetry/opentelemetry.io/issues/8330
sig: SIG Collector
date: 2025-11-17
cSpell:ignore: mcp mdatagen OTTL pavolloffay
---

The OpenTelemetry Collector is powerful, but let's be honest: managing it in
production can be complex. You're juggling dozens of components, tracking
breaking changes across versions, and trying to optimize pipelines.

What if you could manage this complexity using natural language? What if you had
an assistant that truly understood your collector's configuration, versions, and
even its data?

This is the vision behind the new [OpenTelemetry Collector Model Context
Protocol (MCP) Server](https://github.com/pavolloffay/opentelemetry-mcp-server).
It is a third-party community MCP Server.

In short, the MCP server acts as an intelligent backend, or a "brain," that
exposes deep information about the Collector. When paired with an AI agent or
chatbot, it unlocks powerful, conversational management, simplifying both
deployment and day-two operations.

---

## What the MCP server knows and what you can do with it

The server's power comes from its deep understanding of the **JSON schema** for
every single Collector component. This allows it (and any AI agent using it) to
perform complex tasks.

Instead of just a list of commands, here’s what this _actually_ lets you do:

- **Validate Configurations:** Check if your component's YAML is valid _before_
  you deploy it.
- **Compare Versions:** Instantly see what's new, deprecated, or removed between
  any two Collector versions.
- **Audit Deprecations:** Scan your _live_ cluster to find any configurations
  using deprecated fields.
- **List All Components:** See every receiver, processor, and exporter available
  in a specific version.
- **Fetch Schemas & Docs:** Pull the exact configuration schema or even the
  official README for any component, on demand.
- **Get Version Lists:** Instantly get a complete list of all available
  Collector versions.

---

## Putting it into practice: Example conversations

The real magic happens when you connect an assistant (like Claude, ChatGPT, or a
custom internal bot) to the MCP server. Here are a few things you could ask it.

### Example 1: Compare collector versions

You need to upgrade from `0.138.0` to `0.139.0` and want to know what to watch
out for.

> **Your Prompt:** "Compare OpenTelemetry Collector version 0.138.0 and 0.139.0.
> Show which fields were added, removed or deprecated."

The agent, powered by MCP, fetches the changelogs and component lists for both
versions and gives you a clean summary:

> **AI Assistant's Response:** "Based on my analysis, here's the difference
> between v0.138.0 and v0.139.0:
>
> - **Component Changes:**
>   - **Removed:** The `ecs_task_observer` extension was removed.
>   - No changes to receivers, exporters, or processors.
> - **Deprecated Field Changes:**
>   - The `vpc_flow_log` field in the `awslogs_encoding` extension was
>     completely removed (it was deprecated in v0.138.0).
> - **Breaking Changes:**
>   - `receiver/sqlserver`: The `lookback_time` config now requires an 's'
>     suffix for seconds.
>   - `cmd/mdatagen`: `stability.level` is now a required field for metrics."

### Example 2: Audit a live Kubernetes cluster

You want to know if any of your collectors are using outdated configurations.

> **Your Prompt:** "Check if OpenTelemetry Collector (otelcol) custom resources
> in my cluster are using any deprecated collector configuration. If yes,
> suggest a migration."

The agent uses `kubectl` to find your running collectors (it found two, both on
v0.135.0) and then cross-references their components against the MCP server's
deprecated field database.

> **AI Assistant's Response:** "✅ **OpenTelemetry Collector Configuration
> Analysis Complete**
>
> Good news! 🎉 Your OpenTelemetry Collector configurations are **not** using
> any deprecated fields.
>
> I checked all your components (Jaeger, otlp, batch, k8sattributes, etc.) for
> version 0.135.0. While the `prometheus` exporter _does_ have a deprecated
> `add_metric_suffixes` field, your configuration isn't using it.
>
> **Recommendation:** No immediate action is required."

### Example 3: Generate and validate a new config

You need to set up log collection for your Kubernetes cluster.

> **Your Prompt:** "Show me an OpenTelemetry Collector configuration to collect
> logs from the Kubernetes cluster and then validate the config."

The agent identifies the right components (like `filelog` and `k8s_events`
receivers) and generates a new `ConfigMap` for you. More importantly, it then
**validates each part of that new config** against the MCP server's schema to
prove it's correct _before_ you apply it.

> **AI Assistant's Response:** "Here is a `ConfigMap` using the `filelog`,
> `k8s_events`, and `journald` receivers.
>
> I have also validated the configuration for each component against the
> v0.139.0 schema:
>
> - `otel - opentelemetry-collector-component-schema-validation (MCP)(type: "receiver", name: "filelog", ...)`
>   - `is valid: true, errors: []`
> - `otel - opentelemetry-collector-component-schema-validation (MCP)(type: "receiver", name: "k8s_events", ...)`
>   - `is valid: true, errors: []`
> - `otel - opentelemetry-collector-component-schema-validation (MCP)(type: "processor", name: "k8sattributes", ...)`
>   - `is valid: true, errors: []`
>
> This configuration is valid and ready to be deployed."

---

## What's next? From static config to live data profiling

The vast OpenTelemetry ecosystem offers so many opportunities to improve the
user experience with an MCP server. The work today is just the beginning. We see
the future breaking down into two categories:

### Static Configuration

This category covers more use cases for static configuration analysis:

- **OpenTelemetry Transformation Language (OTTL)**: Full validation and
  debugging for your OTTL statements.
- **Instrumentation Config**: Validation and assistance for auto-instrumentation
  configurations.

### Data profiling

This is where it gets really exciting. The MCP server could be extended to
understand the _data_ flowing through the collector, curating it for an AI agent
to provide recommendations. Imagine asking:

- "Can you **suggest a PII stripping configuration** based on my data?"
- "My trace data looks weird. Can you **identify instrumentation issues** like
  high-cardinality attributes or broken context propagation?"
- "**Adjust my sampling configuration** dynamically based on traffic."
- "**Which workload is emitting the most telemetry** data?"

---

## Join the conversation

The OpenTelemetry MCP server is more than just a validation tool; it's the first
step toward a simpler, more intelligent way of managing our observability
pipelines.

Today, it helps you validate configs, compare versions, and audit your
deployments. Tomorrow, it could be the engine that proactively optimizes your
entire telemetry stream.

But we need your help to build this future. Share your feedback: What use cases do you have?
What would you like to ask your Collector?

## References

- **OpenTelemetry MCP server:**
  [GitHub repository](https://github.com/pavolloffay/opentelemetry-mcp-server)
