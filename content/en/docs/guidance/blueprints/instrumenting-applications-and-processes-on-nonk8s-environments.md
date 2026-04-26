---
title: Instrumenting Infrastructure and Processes on Non-K8s Environments
linkTitle: Instrumenting Infrastructure and Processes on Non-K8s Environments
date: 2026-04-21
cSpell:ignore: ciukaj lukasz rollouts
author: Lukasz Ciukaj (Splunk)
---

## Summary

This blueprint outlines a strategic reference for Platform Engineering and SRE
teams operating in traditional virtual machine (VM), bare metal, and on-premises
environments, including scenarios where containers are run directly on an
operating system without an orchestrator like Kubernetes.

It addresses the friction often found when attempting to establish consistent
observability across heterogeneous infrastructure, legacy processes, and
containerized workloads.

By implementing the patterns in this blueprint, organizations can expect to
achieve the following outcomes:

- Out-of-the-box, high-quality telemetry for applications and services running
  in non-Kubernetes environments, including directly managed containers.
- Consistent lifecycle management for OpenTelemetry agents, together with
  standardized bootstrap and configuration patterns for SDK-based
  instrumentation.
- Unified observability across mixed infrastructure: VMs, bare metal, and
  containers without an orchestrator.
- Improved governance over telemetry signal quality, data enrichment, routing,
  and export pipelines.
- Reduced manual toil and cognitive load for developers and operators.

## Background

Many organizations maintain a blend of legacy infrastructure, VMs, bare metal
servers, and direct-to-runtime container deployments, in addition to or instead
of Kubernetes. These environments can be complex and often lack the automation
and standardization provided by orchestrators. Ensuring consistent, high-quality
observability in these scenarios is critical, yet frequently hampered by
fragmented tooling and manual processes.

The introduction of Open Agent Management Protocol (OpAMP) provides a
standardized, scalable way to remotely manage, configure, and monitor
OpenTelemetry agents across diverse infrastructure. In parallel, shared
libraries, pre-baked images, and centrally maintained configuration artifacts
can help standardize SDK-based instrumentation. Together, these approaches
reduce friction and improve reliability for both host-based and containerized
workloads.

## Common challenges

Organizations operating in non-Kubernetes environments typically face a distinct set of challenges that hinder effective
observability. Without built-in automation, standardization, and centralized
management, these setups find that ensuring consistent, high-quality telemetry across a diverse landscape of
infrastructure and applications can be complex and resource-intensive.

### 1. Fragmented instrumentation approaches

Without standardized deployment and management patterns, teams often adopt
different OpenTelemetry agents, SDKs, or exporters for host-based and
containerized workloads.

This leads to:

- **Inconsistent metadata:** Telemetry signals may lack standard resource
  attributes such as `service.name`, `host.id`, `host.name`, `container.id`, and
  `deployment.environment`, making cross-system correlation difficult.
- **Divergent instrumentation behavior:** Different teams may apply different
  defaults for sampling, propagation, resource detection, or export, producing
  uneven telemetry quality.
- **Manual configuration drift:** Host- and container-based agents frequently
  require manual configuration, resulting in drift and an increased risk of
  errors.

### 2. Limited automation for telemetry deployment and management

Instrumentation and agent deployment on VMs, bare metal, and directly run
containers is often manual or script-based, and ongoing configuration is
difficult to manage at scale. This decentralized, ad hoc approach typically
requires operators or developers to install, configure, and update OpenTelemetry
agents individually on each host or workload.

This leads to:

- **High toil:** New workloads or hosts require repeated, error-prone
  configuration steps.
- **Slow rollout and update cycles:** Updates to instrumentation or
  configuration are slow and difficult to propagate fleet-wide.
- **Operational risk:** Rollbacks, version control, and health monitoring are
  harder to perform consistently across the estate.

### 3. Siloed data processing and export

Data collection and export pipelines are often set up per application, per host,
or per team. In the absence of centralized management, individual teams may
independently configure telemetry agents, exporters, and data processing logic
for each workload or environment.

This leads to:

- **Duplicated effort:** Teams may duplicate data enrichment, filtering, and
  routing logic across environments.
- **Inconsistent policy enforcement:** Redaction, retry behavior, batching, and
  routing policies may vary between teams.
- **Lack of visibility:** Operations and governance teams lack unified control
  over what telemetry is collected and how it is processed or exported.

## General guidelines

To address the challenges described above, organizations should adopt a set of
strategic guidelines designed to streamline observability practices across
diverse environments. These guidelines provide a foundation for
standardizing instrumentation, automating agent management, and
ensuring consistent data quality. 

### 1. Centrally manage agent lifecycle while allowing controlled customization

<small>Challenges addressed: 1, 2</small>

Use OpAMP, where supported, to centrally manage OpenTelemetry agents running as
system services or service containers. Platform teams should own the baseline
agent distribution, required processors and exporters, security settings, health
reporting, and default resource detection behavior.

At the same time, organizations should explicitly define how
environment-specific or workload-specific customization is allowed. A practical
model is to use a **layered configuration approach**:

- A **platform-owned baseline** for mandatory defaults, security controls, and
  organization-wide processors/exporters.
- An **environment overlay** for differences such as endpoints, tenancy,
  deployment environment, or site-specific metadata.
- A **workload overlay** for approved variations such as opt-in receivers,
  additional resource attributes, or safe tuning parameters.

This creates a clear boundary between standardization and flexibility: teams can
extend approved parts of the configuration without creating one-off, unmanaged
deployments.

By implementing this guideline, organizations can expect to achieve:

- Automated, consistent telemetry configuration across all environments.
- Reduced manual errors and simplified onboarding for new workloads.
- Faster, safer upgrades and rollbacks of agent configurations.
- A controlled mechanism for local customization without sacrificing central
  governance.

### 2. Centralize telemetry collection and processing through an OpenTelemetry Collector Gateway layer

<small>Challenges addressed: 1, 3</small>

Deploy one or more OpenTelemetry Collector Gateways as central aggregation
points for telemetry data from hosts and directly managed containers. In
non-Kubernetes environments, these gateways can be deployed using several
patterns, depending on scale and operational model, including:

- Dedicated gateway VMs or bare metal hosts.
- A service pool behind a load balancer.
- Containerized gateway services running on general-purpose compute.
- Regional or site-local gateways for distributed environments.

By implementing this guideline, organizations can expect to achieve:

- Unified control over data processing, enrichment, and export pipelines.
- Simplified governance and easier implementation of organization-wide policies.
- Better resilience and scalability than per-host or per-application export
  topologies.
- Clear separation between local collection and centralized policy enforcement.

### 3. Standardize resource attribution and distribute reusable instrumentation building blocks

<small>Challenges addressed: 1</small>

Define an organization-wide telemetry contract for resource attribution and
ensure it is applied consistently across all workloads. This should not rely
only on documentation; it should be delivered through reusable building blocks
such as:

- Pre-baked agent images.
- Shared libraries or starter packages for SDK-based instrumentation.
- Standard startup wrappers or environment-variable conventions.
- Centrally maintained configuration snippets or templates.

At minimum, the standard resource model for non-Kubernetes environments should
cover:

- **Host:** `host.id`, `host.name`, `host.arch`
- **Device (where applicable):** `device.id` and other relevant device
  attributes
- **Process:** `process.pid`, `process.executable.name`, `process.command`
- **Process runtime:** `process.runtime.name`, `process.runtime.version`
- **Operating system:** `os.type`, `os.description`, `os.version`
- **Container (where applicable):** `container.id`
- **Service identity:** `service.name`, `service.version`,
  `deployment.environment`

Application telemetry should include at least `host.id` or `host.name` so that
application signals can be correlated with host- and infrastructure-level
telemetry.

By implementing this guideline, organizations can expect to achieve:

- Improved correlation and searchability of telemetry data across systems.
- Easier analysis and troubleshooting regardless of infrastructure type.
- Consistent metadata quality without requiring every team to reinvent
  instrumentation patterns.
- Faster adoption through reusable, supported building blocks.

## Implementation

Translating these guidelines into practice requires a combination of automation,
standardized tooling, and centralized management. The implementation steps below
are written as roadmap items, with checklist-style actions that organizations
can plan and execute in sequence.

### 1. Define a baseline telemetry contract and layered configuration model

<small>Guidelines supported: 1, 3</small>

Define the minimum required telemetry contract for the organization and document
which parts of agent and SDK configuration are centrally owned versus locally
customizable. This is the foundation for consistency at scale.

Checklist:

- Define the mandatory resource attributes and signal conventions that all
  workloads must emit.
- Define the baseline agent configuration, including exporters, authentication,
  TLS, health reporting, and default processors.
- Define the allowed extension points for environment-specific and
  workload-specific customization.
- Version all baseline and overlay configurations so they can be rolled out and
  rolled back safely.
- Publish ownership boundaries so teams know what they can and cannot modify.

Documentation:

- [OpAMP Specification](https://github.com/open-telemetry/opamp-spec)
- [OpenTelemetry Semantic Conventions](/docs/specs/semconv/)

### 2. Stand up an OpAMP Management Plane for agents

<small>Guidelines supported: 1</small>

Deploy a central OpAMP management service to manage agent configuration, status
reporting, health monitoring, and controlled rollouts for supported agents.

Checklist:

- Select the supported OpAMP-capable agent distributions.
- Stand up a central OpAMP server or management endpoint.
- Register agents and enable health/status reporting.
- Define rollout rings such as development, staging, and production.
- Define rollback procedures for failed updates or bad configurations.
- Monitor management-plane health and agent connectivity.

Documentation:

- [OpAMP Specification](https://github.com/open-telemetry/opamp-spec)
- [OpenTelemetry Collector Documentation](/docs/collector/)

### 3. Package and deploy standardized agents and SDK bootstrap artifacts

<small>Guidelines supported: 1, 3</small>

Use configuration management and image packaging to deliver supported telemetry
components consistently across hosts and containerized workloads.

Checklist:

- Package host-based agents as standard system services.
- Provide pre-baked images or service-container definitions for containerized
  deployments.
- Publish shared libraries, starter packages, or bootstrap wrappers for
  supported SDK languages.
- Standardize environment-variable and configuration-file conventions across
  environments.
- Validate that new workloads inherit the baseline configuration by default.

Documentation:

- [OpenTelemetry Collector Documentation](/docs/collector/)
- [OpenTelemetry Documentation](/docs/)

### 4. Deploy an OpenTelemetry Collector Gateway layer

<small>Guidelines supported: 2</small>

Deploy one or more OpenTelemetry Collector Gateways as the central processing
and export tier. Choose a topology appropriate for the environment, such as
dedicated VMs, service pools behind a load balancer, or regional gateway nodes.

Checklist:

- Select the gateway deployment topology for each environment.
- Define how local agents discover and connect to gateways.
- Configure processors for batching, memory protection, enrichment, retry, and
  routing.
- Separate lightweight ingest from heavier centralized processing where scale
  requires it.
- Define high-availability and failover behavior for gateways.
- Validate end-to-end routing to observability backends.

Documentation:

- [OpenTelemetry Collector Documentation](/docs/collector/)
- [OpenTelemetry Collector Configuration](/docs/collector/configuration/)

### 5. Enforce resource attribution and correlation standards

<small>Guidelines supported: 1, 3</small>

Ensure that all telemetry includes the required metadata for correlation across
infrastructure and application layers.

Checklist:

- Publish the minimum required resource attribute set for hosts, processes,
  runtimes, operating systems, and containers where applicable.
- Ensure application telemetry includes at least `host.id` or `host.name`.
- Enable resource detection and enrichment wherever supported.
- Validate emitted telemetry against the standard attribute contract.
- Add conformance checks to deployment pipelines or post-deployment validation
  steps.

Documentation:

- [OpenTelemetry Semantic Conventions](/docs/specs/semconv/)
- [OpenTelemetry Resource Semantic Conventions](/docs/specs/semconv/resource/)

### 6. Centralize governance, policy enforcement, and change management

<small>Guidelines supported: 2, 3</small>

Use the Collector Gateway layer and centrally owned configuration to enforce
organization-wide rules for processing, routing, and exporting telemetry.

Checklist:

- Define approved exporters and backend destinations.
- Centralize redaction, filtering, enrichment, and routing policies.
- Define standard retry, batching, and sampling policies.
- Establish an exception process for workloads that need non-default behavior.
- Review telemetry quality and policy compliance regularly.

Documentation:

- [OpenTelemetry Collector Documentation](/docs/collector/)
- [OpenTelemetry Semantic Conventions](/docs/specs/semconv/)

## Reference architectures

The patterns described above have been successfully implemented by the following
end-users:

_To be added soon._

Do you have an architecture for this blueprint implemented and documented?
Please share your experience or a link to your article by opening an issue in
the
[opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io/issues)
GitHub repository.
