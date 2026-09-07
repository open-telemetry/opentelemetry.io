---
title: Getting started for Ops
linkTitle: Ops
---

# Operations Getting Started

OpenTelemetry can be used by operations and platform engineers to collect telemetry from applications, services, hosts, containers, and other infrastructure.

A typical operations workflow looks like this:

**Identify telemetry sources → decide whether you need a Collector → design the pipeline → deploy the Collector → configure the pipeline → connect telemetry sources → export telemetry → monitor and troubleshoot**

## 1. Identify your telemetry sources

Start by identifying where your telemetry comes from.

Typical sources include:

* Instrumented applications.
* Applications using automatic instrumentation.
* Servers and virtual machines.
* Containers.
* Kubernetes workloads.
* Cloud services.
* Databases.
* Network and infrastructure components.

Determine which signals you need to collect:

* Traces.
* Metrics.
* Logs.
* Profiles.

You do not need to collect every signal from every source. Start with the telemetry that addresses your immediate observability requirements.

## 2. Decide whether you need an OpenTelemetry Collector

The OpenTelemetry Collector provides a vendor-neutral way to receive, process, and export telemetry.

You may not need a Collector for a simple application that can export telemetry directly to your observability backend.

A Collector becomes increasingly useful when you need to:

* Collect telemetry from multiple applications or systems.
* Send telemetry to multiple destinations.
* Transform or filter telemetry.
* Centralize telemetry configuration.
* Add processing between applications and observability backends.
* Reduce the number of application-to-backend connections.
* Separate application instrumentation from backend-specific configuration.

For more information, see [What is the OpenTelemetry Collector?](../collector/).

## 3. Understand the telemetry pipeline

At its simplest, an OpenTelemetry Collector pipeline follows this model:

**Receive → Process → Export**

### Receive

Receivers accept telemetry from applications, agents, or other systems.

### Process

Processors modify, filter, enrich, or otherwise process telemetry before it is exported.

### Export

Exporters send telemetry to an observability backend or another destination.

A Collector configuration can contain different pipelines for different signals.

For example, traces and metrics may use different receivers, processors, and exporters depending on your environment.

See [Collector components](../collector/components/) for more information.

## 4. Choose a deployment architecture

The Collector can be deployed in different ways depending on your environment.

### Agent

An agent runs close to the application or infrastructure that generates telemetry.

This approach can be useful when telemetry needs to be collected locally before being forwarded elsewhere.

### Gateway

A gateway provides a centralized Collector service that receives telemetry from multiple sources.

This can simplify centralized processing, routing, and export.

### Agent to gateway

Larger environments can combine the two approaches.

Local agents collect telemetry and forward it to one or more centralized gateways.

The appropriate architecture depends on factors such as:

* The number of applications and hosts.
* Network topology.
* Telemetry volume.
* Reliability requirements.
* Security requirements.
* Processing requirements.
* Operational ownership.

See [Deploying the Collector](../collector/deploy/) for deployment options.

## 5. Configure the Collector

A Collector configuration defines how telemetry moves through the pipeline.

At a high level, configuration determines:

* What telemetry the Collector receives.
* How telemetry is processed.
* Where telemetry is exported.
* Which pipelines are used for traces, metrics, and logs.

Start with the simplest configuration that meets your requirements.

Once the basic pipeline is working, add processing, filtering, routing, batching, or additional destinations as needed.

## 6. Connect applications and infrastructure

After the Collector is running, configure your telemetry sources to send data to it.

Applications may use:

* Language-specific OpenTelemetry SDKs.
* Automatic instrumentation.
* Existing OpenTelemetry integrations.

Infrastructure and other systems may use:

* OpenTelemetry receivers.
* Agents.
* Exporters.
* Existing telemetry protocols supported by the Collector.

Your applications and infrastructure do not necessarily need to know which observability backend ultimately receives the telemetry.

The Collector can provide the separation between telemetry generation and telemetry storage or analysis.

## 7. Secure the telemetry pipeline

Telemetry can contain information about your applications, users, systems, and infrastructure.

Consider security requirements throughout the pipeline.

Depending on your environment, you may need to configure:

* Authentication.
* Authorization.
* Encryption in transit.
* Network access controls.
* Sensitive-data filtering.
* Attribute removal or transformation.
* Secure credentials and secrets management.

Review your organization's security and privacy requirements before sending telemetry to external systems.

## 8. Monitor the telemetry pipeline

The telemetry pipeline itself needs to be observable.

A Collector can generate internal telemetry that helps you understand how the Collector is operating.

Monitor areas such as:

* Telemetry throughput.
* Errors.
* Dropped data.
* Queue sizes.
* Resource consumption.
* Export failures.
* Receiver and exporter health.

If telemetry suddenly stops appearing in your backend, investigate the entire path:

**Telemetry source → Collector receiver → Collector processing → Collector exporter → destination**

This makes it easier to determine where the problem is occurring.

<!-- This is the [getting-started](..) page for you if:

- You run a set of applications in production.
- Your goal is to get telemetry out of them without touching their code.
- You want to collect traces, metrics, and logs from several services and send
  them off to your observability backend.

OpenTelemetry can help you! To accomplish your goal of getting telemetry out of
applications without touching their code, we recommend that you learn the
following:

- [What is OpenTelemetry?](../../what-is-opentelemetry/)
- [How can I instrument applications without touching their code?](../../concepts/instrumentation/zero-code/)
- [How can I set up a collector?](../../collector/)
- [How can I get automation for Kubernetes with the OpenTelemetry Operator?](../../platforms/kubernetes/operator/)

If you are looking for a set of applications to try things out, you will find
our official [OpenTelemetry demo](/ecosystem/demo/) useful. -->
