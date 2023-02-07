---
title: Management
weight: 23
---

Please be sure to review the following documentation:

*  [Getting Started][otel-collector-getting-started] to understand how to
   install the OpenTelemetry collector.
*  [Configuration][otel-collector-configuration] for how to configure the 
   OpenTelemetry collector, setting up telemetry pipelines.

## Basics

Telemetry collection at scale requires us to come up with a structured approach
to manage agents. Typical agent management tasks (ordered from most common to
least common) include:

1. Querying the agent information and configuration. The agent information can
include its version, operating system related information, or capabilities.
The configuration of the agent refers to its telemetry collection setup,
for example, the OpenTelemetry collector [configuration][otel-collector-configuration].
1. Upgrading and downgrading agents and management of agent-specific packages,
including the base agent functionality and plugins.
1. Applying new configurations to agents. This might be required because of
changes in the environment or due to policy changes.
1. Health and performance monitoring of the agents, typically CPU and memory usage
and also agent-specific metrics, for example, the rate of processing or
backpressure-related information.
1. Connection management between a control plane and the agent such as
handling of TLS certificates (revocation and rotation).

Not every use case requires support for all of the above agent management tasks.
In the context of OpenTelemetry we aim for a dogfooding, so task 
_4. Health and performance monitoring_ is ideally done using OpenTelemetry.

## OpAMP
Observability vendors and cloud providers offer proprietary solutions for 
agent management. In the open source observability space, there is an emerging standard 
that you can use for agent management: Open Agent Management Protocol (OpAMP).

The [OpAMP specification][opamp-spec] (status: Beta) defines how to manage a 
fleet of telemetry data agents. These agents can be  [OpenTelemetry collectors][otel-collector] 
but you could also be using it for managing other agents, such as Fluent Bit or
Prometheus in agent mode or indeed a combination of different agents, forming
a fleet.

OpAMP is a client/server protocol that supports communication over HTTP and
over WebSockets:

* The **OpAMP server** is part of the control plane and acts as the orchestrator,
managing a fleet of telemetry agents.
* The **OpAMP client** us part of the data plane. The client side of OpAMP can
be implemented in-process, for example, as the case for [OpAMP support in the OpenTelemetry
collector][opamp-in-otel-collector]. The client side of OpAMP could alternatively
be implemented out-of-process. For this latter option, you can use a supervisor 
that takes care of the OpAMP specific communication with the OpAMP server and at 
the same time controls the telemetry agent, for example to apply a configuration
or to upgrade it. Note that the supervisor/telemetry communication
is not part of OpAMP.


## Other information

* [Using OpenTelemetry OpAMP to modify service telemetry on the go][blog-opamp-service-telemetry]
* [What is OpAMP & What is BindPlane][opamp-bindplane]

[otel-collector]: ../../collector/
[otel-collector-getting-started]: ../../collector/getting-started
[otel-collector-configuration]: ../../collector/configuration
[opamp-spec]: https://github.com/open-telemetry/opamp-spec/blob/main/specification.md
[opamp-in-otel-collector]: https://docs.google.com/document/d/1KtH5atZQUs9Achbce6LiOaJxLbksNJenvgvyKLsJrkc/edit#heading=h.ioikt02qpy5f
[blog-opamp-service-telemetry]: ../../../blog/2022/opamp/
[opamp-bindplane]: https://www.youtube.com/watch?v=N18z2dOJSd8
