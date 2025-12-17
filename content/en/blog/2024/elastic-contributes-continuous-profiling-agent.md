---
title: Elastic Contributes its Continuous Profiling Agent to OpenTelemetry
linkTitle: Elastic Contributes Profiling Agent
date: 2024-06-07
author: >
  [Bahubali Shetti](https://github.com/bshetti) (Elastic), [Alexander
  Wert](https://github.com/AlexanderWert) (Elastic), [Morgan
  McLean](https://github.com/mtwo) (Splunk), [Ryan
  Perry](https://github.com/Rperry2174) (Grafana)
issue: https://github.com/open-telemetry/community/issues/1918
sig: Profiling SIG
# prettier-ignore
cSpell:ignore: Bahubali Christos Dmitry Filimonov Geisendörfer Halliday Kalkanis Shetti
---

Following significant collaboration between
[Elastic](https://www.elastic.co/observability-labs/blog/elastic-donation-proposal-to-contribute-profiling-agent-to-opentelemetry)
and [OpenTelemetry's profiling community](/blog/2024/profiling/), which included
a thorough review process, we’re excited to announce that the OpenTelemetry
project has accepted
[Elastic's donation of its continuous profiling agent](https://github.com/open-telemetry/community/issues/1918).

This marks a significant milestone in establishing profiling as a core telemetry
signal in OpenTelemetry. Elastic’s [eBPF based](https://ebpf.io/) profiling
agent observes code across different programming languages and runtimes,
third-party libraries, kernel operations, and system resources with low CPU and
memory overhead in production. Both, SREs and developers can now benefit from
these capabilities: quickly identifying performance bottlenecks, maximizing
resource utilization, reducing carbon footprint, and optimizing cloud spend.

Elastic’s decision to contribute the project to OpenTelemetry was made to
accelerate OpenTelemetry’s mission and enable effective observability through
high-quality, portable telemetry. This collaboration also shows the commitment
to vendor neutrality and community-driven development enhancing the overall
profiling and observability ecosystems.

The donation happened through a great and constructive cooperation between
Elastic and the OpenTelemetry community. We look forward to jointly establishing
continuous profiling as an integral part of OpenTelemetry.

With today’s acceptance, Elastic’s continuous profiling agent will be
contributed to OpenTelemetry. This agent will now be jointly supported by both
Elastic’s team as well as a diverse set of official maintainers from different
companies:

- Dmitry Filimonov (Grafana Labs)
- Felix Geisendörfer (Datadog)
- Jonathan Halliday (Red Hat)
- Christos Kalkanis (Elastic)

## What is continuous profiling?

[Continuous profiling](https://www.cncf.io/blog/2022/05/31/what-is-continuous-profiling/)
is a technique used to understand the behavior of a software application by
collecting information about its execution over time. This includes tracking the
duration of function calls, memory usage, CPU usage, and other system resources
along with associated metadata.

## Benefits of Continuous Profiling

Traditional profiling solutions, typically used for one-off, development time
optimizations, can have significant drawbacks limiting adoption in production
environments:

- Significant cost and performance overhead due to code instrumentation
- Disruptive service restarts
- Inability to get visibility into third-party libraries

Continuous profiling, however, runs in the background with minimal overhead,
providing real-time, actionable insights without the need to replicate issues in
separate environments.

This allows SREs, DevOps, and developers to see how code affects performance and
cost, making code and infrastructure improvements easier.

## Contribution of comprehensive profiling abilities

The continuous profiling agent, that Elastic is donating, is
[based on eBPF](https://ebpf.io/) and by that a whole system, always-on solution
that observes code and third-party libraries, kernel operations, and other code
you don't own. It eliminates the need for code instrumentation
(run-time/bytecode), recompilation, or service restarts with low overhead, low
CPU (~1%), and memory usage in production environments.

The donated profiling agent facilitates identifying non-optimal code paths,
uncovering "unknown unknowns", and provides comprehensive visibility into the
runtime behavior of all applications. The continuous profiling agent provides
support for a wide range of runtimes and languages, such as:

- C/C++
- Rust
- Zig
- Go
- Java
- Python
- Ruby
- PHP
- Node.js / V8
- Perl
- .NET

## Benefits to OpenTelemetry

This contribution not only boosts the standardization of continuous profiling
for observability but also accelerates its adoption as a key signal in
OpenTelemetry. Customers benefit from a vendor-agnostic method of collecting
profiling data correlating it with existing signals, like tracing, metrics, and
logs, opening new potential for observability insights and a more efficient
troubleshooting experience.

### User benefits of OpenTelemetry Profiling

OpenTelemetry-based continuous profiling unlocks the following possibilities for
users:

- Continuous profiling data compliments the existing signals (traces, metrics
  and logs) by providing detailed, code-level insights on the services'
  behavior.

- Seamless correlation with other OpenTelemetry signals such as traces,
  increasing fidelity and investigatory depth.

- Estimate environmental impact: Combining profiling data with OpenTelemetry's
  resource information (i.e. resource attributes) allows to derive insights into
  the services' carbon footprint.

- Through a detailed breakdown of services' resource utilization, profiling data
  provides actionable information on performance optimization opportunities.

- Improved vendor neutrality: a vendor-agnostic eBPF-based profiling agent
  removes the need to rely on proprietary agents to collect profiling telemetry.

With these benefits, SREs, developers, and DevOps, can now manage the overall
application’s efficiency on the cloud while ensuring their engineering teams
optimize it.

As the next step, the OpenTelemetry profiling SIG, that Elastic is a part of,
will jointly work on integrating the donated agent into OpenTelemetry's
components ecosystem. We look forward to providing a fully integrated and usable
version of the new OpenTelemetry eBPF profiling agent to the users, soon.
