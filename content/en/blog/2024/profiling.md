---
title: OpenTelemetry announces support for profiling
linkTitle: Profiling support
date: 2024-03-19
author: '[Austin Parker](https://github.com/austinlparker) (Honeycomb)'
aliases: [opentelemetry-announced-support-for-profiling]
cSpell:ignore: Alexandrov Alexey Dmitry Filimonov Geisendörfer Halliday
---

In 2023, OpenTelemetry announced that it achieved stability for
[logs, metrics, and traces](https://www.cncf.io/blog/2023/11/07/opentelemetry-at-kubecon-cloudnativecon-north-america-2023-update/).
While this was our initial goal at the formation of the project, fulfilling our
vision of enabling built-in observability for cloud native applications requires
us to continue evolving with the community. This year, we’re proud to announce
that exactly two years after the Profiling SIG was created at KubeCon +
CloudNativeCon Europe 2022 in Valencia, we’re taking a big step towards this
goal by merging a profiling data model OTEP and working towards a stable spec
and implementation this year!

This milestone for the OpenTelemetry profiling signal reflects a collaborative
effort within the profiling SIG, where dedicated input from a diverse range of
profiling vendors and end users has been pivotal. This includes substantial
contributions from community members such as:

- Felix Geisendörfer (Datadog)
- Alexey Alexandrov (Google)
- Dmitry Filimonov (Grafana Labs)
- Ryan Perry (Grafana Labs)
- Jonathan Halliday (Red Hat)

The SIG's collective endeavor has been focused on aligning on the most suitable
data format for profiling, evidenced by the active discussions and proposals
within the community.

Some previous milestones reached before this point have been:

- Establishing
  [profiling vision alignment](https://github.com/open-telemetry/oteps/pull/212)
  (August 2022)
- Proposing
  [v1 profiling data model](https://github.com/open-telemetry/oteps/pull/237)
  (September 2023)
- Proposing
  [v2 profiling data model](https://github.com/open-telemetry/oteps/pull/239)
  (November 2023)

These all have played a crucial role in shaping the direction and evolution of
OpenTelemetry's profiling capabilities. These community-led discussions and
contributions underscore the project's commitment to being inclusive and
collaboration, ensuring that a broad spectrum of insights and expertise is
leveraged to drive the development of OpenTelemetry.

## What is profiling?

Profiling is a method to dynamically inspect the behavior and performance of
application code at run-time. Continuous profiling gives insights into resource
utilization at a code-level and allows for this profiling data to be stored,
queried, and analyzed over time and across different attributes. It’s an
important technique for developers and performance engineers to understand
exactly what’s happening in their code. OpenTelemetry’s
[profiling signal](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/profiles/0239-profiles-data-model.md)
expands upon the work that has been done in this space and, as a first for the
industry, connects profiles with other telemetry signals from applications and
infrastructure. This allows developers and operators to correlate resource
exhaustion or poor user experience across their services with not just the
specific service or pod being impacted, but the function or line of code most
responsible for it.

We’re thrilled to see the embrace of this vision by the industry, with many
organizations coming together to help define the profiling signal. More
specifically, the following two donations are in play:

- Elastic has
  [pledged to donate](https://github.com/open-telemetry/community/issues/1918)
  their proprietary eBPF-based profiling agent [^1]
- Splunk has begun the process of
  [donating their .NET based profiler](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/pull/3196)

These are being donated to the project in order to accelerate the delivery and
implementation of OpenTelemetry profiling.

## What does this mean for users?

Profiles will support bi-directional links between themselves and other signals,
such as logs, metrics, and traces. You’ll be able to easily jump from resource
telemetry to a corresponding profile. For example:

- Metrics to profiles: You will be able to go from a spike in CPU usage or
  memory usage to the specific pieces of the code which are consuming that
  resource
- Traces to profiles: You will be able to understand not just the location of
  latency across your services, but when that latency is caused by pieces of the
  code it will be reflected in a profile attached to a trace or span
- Logs to profiles: Logs often give the context that something is wrong, but
  profiling will allow you to go from just tracking something (Out Of Memory
  errors, for example) to seeing exactly which parts of the code are using up
  memory resources

These are just a few and these links work the opposite direction as well, but
more generally profiling helps deliver on the promise of observability by making
it easier for users to query and understand an entire new dimension about their
applications with minimal additional code/effort.

## A community in motion

This work would not be possible without the dedicated contributors who work on
OpenTelemetry each day. We’ve recently passed a new milestone, with over 1000
unique developers contributing to the project each month, representing over 180
companies. Across our most popular repositories, OpenTelemetry sees over 30
million downloads a month[^2], and new open source projects are adopting our
standards at a regular pace, including
[Apache Kafka](https://cwiki.apache.org/confluence/display/KAFKA/KIP-714%3A+Client+metrics+and+observability),
and [dozens more](/ecosystem/integrations). We’re also deepening our
integrations with other open source projects in CNCF and out, such as
[OpenFeature](https://openfeature.dev) and
[OpenSearch](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/23611),
in addition to our existing integrations with Kubernetes, Thanos, Knative, and
many more.

2024 promises to be another big year for OpenTelemetry as we continue to
implement and stabilize our existing tracing, metrics, and log signals while
adding support for profiling, client-side RUM, and more. It’s a great time to
get involved! To learn more, check out the rest of the [website](/).

[^1]: Pending due diligence and review by the OpenTelemetry maintainers.

[^2]: According to public download statistics of our .NET, Java, and Python APIs
