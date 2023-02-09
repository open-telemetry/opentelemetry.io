---
title: Deployment
weight: 2
---

The OpenTelemetry Collector consists of a single binary and two primary
deployment methods:

- **Agent:** A Collector instance running with the application or on the same
  host as the application (e.g. binary, sidecar, or daemonset).
- **Gateway:** One or more Collector instances running as a standalone service
  (e.g. container or deployment) typically per cluster, data center or region.

## Agent

It is recommended to deploy the Agent on every host within an environment. In
doing so, the Agent is capable of receiving telemetry data (push and pull based)
as well as enhancing telemetry data with metadata such as custom tags or
infrastructure information. In addition, the Agent can offload responsibilities
that client instrumentation would otherwise need to handle including batching,
retry, encryption, compression and more.

## Gateway

Additionally, a Gateway cluster can be deployed in every cluster, data center,
or region. A Gateway cluster runs as a standalone service and can offer advanced
capabilities over the Agent including tail-based sampling. In addition, a
Gateway cluster can limit the number of egress points required to send data as
well as consolidate API token management. Each Collector instance in a Gateway
cluster operates independently so it is easy to scale the architecture based on
performance needs with a simple load balancer. If a gateway cluster is deployed,
it usually receives data from Agents deployed within an environment.
