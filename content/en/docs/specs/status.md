---
title: Specification Status Summary
linkTitle: Status
aliases: [/docs/specs/otel/status]
weight: -10
---

OpenTelemetry is developed on a signal by signal basis. Tracing, metrics,
baggage, and logging are examples of signals. Signals are built on top of
context propagation, a shared mechanism for correlating data across distributed
systems.

Each signal consists of four [core components](/docs/concepts/components/):

- APIs
- SDKs
- [OpenTelemetry Protocol](/docs/specs/otlp/) (OTLP)
- [Collector](/docs/collector/)

Signals also have contrib components, an ecosystem of plugins and
instrumentation. All instrumentation shares the same semantic conventions, to
ensure that they produce the same data when observing common operations, such as
HTTP requests.

To learn more about signals and components, see the OTel specification
[Overview](/docs/specs/otel/overview/).

## Component Lifecycle

Components follow a development lifecycle: Draft, Experimental, Stable,
Deprecated, Removed.

- **Draft** components are under design, and have not been added to the
  specification.
- **Experimental** components are released and available for beta testing.
- **Stable** components are backward compatible and covered under long term
  support.
- **Deprecated** components are stable but may eventually be removed.

For complete definitions of lifecycles and long term support, see
[Versioning and stability](/docs/specs/otel/versioning-and-stability/).

## Current Status

The following is a high level status report for currently available signals.
Note that while the OpenTelemetry clients conform to a shared specification,
they are developed independently.

Checking the current status for each client in the README of its
[GitHub repository](https://github.com/open-telemetry) is recommended. Client
support for specific features can be found in the
[specification compliance tables](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

Note that, for each of the following sections, the **Collector** status is the
same as the **Protocol** status.

### [Tracing][]

- {{% spec_status "API" "otel/trace/api" "Status" %}}
- {{% spec_status "SDK" "otel/trace/sdk" "Status" %}}
- {{% spec_status "Protocol" "otlp" "Status" %}}
- Notes:
  - The tracing specification is now completely stable, and covered by long term
    support.
  - The tracing specification is still extensible, but only in a backwards
    compatible manner.
  - OpenTelemetry clients are versioned to v1.0 once their tracing
    implementation is complete.

### [Metrics][]

- {{% spec_status "API" "otel/metrics/api" "Status" %}}
- {{% spec_status "SDK" "otel/metrics/sdk" "Status" %}}
- {{% spec_status "Protocol" "otlp" "Status" %}}
- Notes:
  - OpenTelemetry Metrics is currently under active development.
  - The data model is stable and released as part of the OTLP protocol.
  - Experimental support for metric pipelines is available in the Collector.
  - Collector support for Prometheus is under development, in collaboration with
    the Prometheus community.

### [Baggage][]

- {{% spec_status "API" "otel/baggage/api" "Status" %}}
- **SDK:** stable
- **Protocol:** N/A
- Notes:
  - OpenTelemetry Baggage is now completely stable.
  - Baggage is not an observability tool, it is a system for attaching arbitrary
    keys and values to a transaction, so that downstream services may access
    them. As such, there is no OTLP or Collector component to baggage.

### [Logging][]

- {{% spec_status "Bridge API" "otel/logs/bridge-api" "Status" %}}
- {{% spec_status "SDK" "otel/logs/sdk" "Status" %}}
- {{% spec_status "Event API" "otel/logs/event-api" "Status" %}}
- {{% spec_status "Protocol" "otlp" "Status" %}}
- Notes:
  - The [logs data model][] is released as part of the OpenTelemetry Protocol.
  - Log processing for many data formats has been added to the Collector, thanks
    to the donation of Stanza to the OpenTelemetry project.
  - The OpenTelemetry Log Bridge API allows for writing appenders which bridge
    logs from existing log frameworks into OpenTelemetry. The Logs Bridge API is
    not meant to be called directly by end users. Log appenders are under
    development in many languages.
  - The OpenTelemetry Log SDK is the standard implementation of the Log Bridge
    API. Applications configure the SDK to indicate how logs are processed and
    exported (e.g. using OTLP).
  - The OpenTelemetry Event API allows log records to be emitted which conform
    to the [event semantic conventions][]. In contrast to the Log Bridge API,
    the Event API is intended to be called by end users. The Event API is under
    active development.

[baggage]: /docs/specs/otel/baggage/
[event semantic conventions]: /docs/specs/semconv/general/logs/
[logging]: /docs/specs/otel/logs/
[logs data model]: /docs/specs/otel/logs/data-model/
[metrics]: /docs/specs/otel/metrics/
[tracing]: /docs/specs/otel/trace/
