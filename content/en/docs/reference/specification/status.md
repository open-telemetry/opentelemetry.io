---
title: Specification Status Summary
linkTitle: Status
weight: 10
# Undo specification-section-wide page-meta parameter settings:
github_repo: &repo https://github.com/open-telemetry/opentelemetry.io
github_subdir:
path_base_for_github_subdir:
github_project_repo: *repo
---

OpenTelemetry is developed on a signal by signal basis. Tracing, metrics,
baggage, and logging are examples of signals. Signals are built on top of
context propagation, a shared mechanism for correlating data across distributed
systems.

Each signal consists of four [core components](/docs/concepts/components/):

- APIs
- SDKs
- [OpenTelemetry Protocol](/docs/reference/specification/protocol/) (OTLP)
- [Collector](/docs/collector/)

Signals also have contrib components, an ecosystem of plugins and
instrumentation. All instrumentation shares the same semantic conventions, to
ensure that they produce the same data when observing common operations, such as
HTTP requests.

To learn more about signals and components, see the specification
[Overview]({{< relref "/docs/reference/specification/overview" >}}).

## Component Lifecycle

Components follow a development lifecycle: Draft, Experimental, Stable,
Deprecated, Removed.

- **Draft** components are under design, and have not been added to the
  specification.
- **Experimental** components are released and available for beta testing.
- **Stable** components are backwards compatible and covered under long term
  support.
- **Deprecated** components are stable but may eventually be removed.

For complete definitions of lifecycles and long term support, see [Versioning
and
stability]({{< relref "/docs/reference/specification/versioning-and-stability" >}}).

## Current Status

The following is a high level status report for currently available signals.
Note that while the OpenTelemetry clients conform to a shared specification,
they are developed independently.

Checking the current status for each client in the README of its
[github repo](https://github.com/open-telemetry) is recommended. Client support
for specific features can be found in the
[specification compliance tables](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

Note that, for each of the following sections, the **Collector** status is the
same as the **Protocol** status.

### [Tracing][]

- {{% spec_status "API" "trace/api" "Status" %}}
- {{% spec_status "SDK" "trace/sdk" "Status" %}}
- {{% spec_status "Protocol" "protocol/otlp" "Tracing" %}}
- Notes:
  - The tracing specification is now completely stable, and covered by long term
    support.
  - The tracing specification is still extensible, but only in a backwards
    compatible manner.
  - OpenTelemetry clients are versioned to v1.0 once their tracing
    implementation is complete.

### [Metrics][]

- {{% spec_status "API" "metrics/api" "Status" %}}
- {{% spec_status "SDK" "metrics/sdk" "Status" %}}
- {{% spec_status "Protocol" "protocol/otlp" "Metrics" %}}
- Notes:
  - OpenTelemetry Metrics is currently under active development.
  - The data model is stable and released as part of the OTLP protocol.
  - Experimental support for metric pipelines is available in the Collector.
  - Collector support for Prometheus is under development, in collaboration with
    the Prometheus community.

### [Baggage][]

- {{% spec_status "API" "baggage/api" "Status" %}}
- **SDK:** stable
- **Protocol:** N/A
- Notes:
  - OpenTelemetry Baggage is now completely stable.
  - Baggage is not an observability tool, it is a system for attaching arbitrary
    keys and values to a transaction, so that downstream services may access
    them. As such, there is no OTLP or Collector component to baggage.

### [Logging][]

- **API:** draft
- **SDK:** draft
- {{% spec_status "Protocol" "protocol/otlp" "Logs" %}}
- Notes:
  - OpenTelemetry Logging is currently under active development.
  - The [logs data model][] is released as part of the OpenTelemetry Protocol.
  - Log processing for many data formats has been added to the Collector, thanks
    to the donation of Stanza to the OpenTelemetry project.
  - Log appenders are currently under development in many languages. Log
    appenders allow OpenTelemetry tracing data, such as trace and span IDs, to
    be appended to existing logging systems.
  - An OpenTelemetry logging SDK is currently under development. This allows
    OpenTelemetry clients to ingest logging data from existing logging systems,
    outputting logs as part of OTLP along with tracing and metrics.
  - An OpenTelemetry logging API is not currently under development. We are
    focusing first on integration with existing logging systems. When metrics is
    complete, focus will shift to development of an OpenTelemetry logging API.

[baggage]: /docs/reference/specification/baggage/
[logging]: /docs/reference/specification/logs/
[logs data model]: /docs/reference/specification/logs/data-model/
[metrics]: /docs/reference/specification/metrics/
[tracing]: /docs/reference/specification/trace/
