---
title: Agent-to-gateway deployment pattern
linkTitle: Agent-to-gateway pattern
description:
  Learn why and how to create a Collector deployment that combines agents and
  gateways
weight: 100
---

[Agents](/docs/collector/deploy/agent/) and
[gateways](/docs/collector/deploy/gateway/) solve different problems. By
combining them in your deployment, you can create an observability architecture
that addresses the following issues:

- Separation of concerns: Avoid placing complex configuration and processing
  logic on every machine or in every node. Agent configurations stay small and
  focused, while central processors handle the heavier collection tasks.
- Scalable cost control: Make better sampling and batching decisions in gateways
  that can receive telemetry from multiple agents. Gateways can see the full
  picture, including complete traces, and can be independently scaled.
- Security and stability: Send telemetry over local networks from agents to
  gateways. Gateways become a stable egress point that can handle retries and
  manage credentials.

The following diagram shows an architecture for a combined agent-to-gateway
deployment:

- Use Collectors running in the agent deployment pattern (running on each host,
  similar to Kubernetes DaemonSets) to collect telemetry from services running
  on the host as well as the host's own telemetry, such as host metrics and
  scraped logs.
- Use Collectors running in the gateway deployment pattern to process data, such
  as filtering, sampling, and exporting to backends.

![gateway](otel-gateway-arch.svg)

This combined deployment pattern is necessary when you use components in your
Collector that either must be unique per host or consume information that is
available only on the same host where the application runs:

- Receivers like the
  [`hostmetricsreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)
  or
  [`filelogreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)
  must be unique per host instance. Running multiple instances of these
  receivers on the same host results in duplicate data.

- Processors like the
  [`resourcedetectionprocessor`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)
  add information about the host where both the Collector and the application
  are running. Running the processor in a Collector on a separate machine from
  the application results in incorrect data.
