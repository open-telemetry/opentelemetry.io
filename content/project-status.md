---
Title: "Project Status"
---

OpenTelemetry implementations are currently in **pre-release** status. This page tracks the overall release milestones as we move towards full releases for each language SIG. You can find more details about the milestones at [this link](https://github.com/open-telemetry/opentelemetry-specification/blob/master/milestones.md)

# Current SIG Progress
{{< progress_chart >}}
<sub>Click a progress bar in the above chart to go to that SIGs repository.</sub>

# Status Definitions

When we refer to an alpha, beta, or release, what do we mean? This section defines these terms.

## Alpha

* APIs: Metrics, Tracing, Context.
  * These APIs do not need to match the latest version of the specification.
  * A baggage API is not required.
* OpenTracing/OpenCensus Shims
  * 'First pass' of support.
  * There may be bugs or edge cases that aren't handled.
* Exporters
  * Jaeger exporter for traces.
  * Prometheus exporter for metrics.
* Documentation
  * API Documentation
  * A quickstart guide in the README.
  * A project status section in the README.

## Beta

* APIs: Metrics, Tracing, Context.
  * These APIs match the latest version of the specification.
* OpenTracing/OpenCensus Shims
  * These have been tested and validated against common use cases and popular instrumentation libraries.
* Exporters
  * Jaeger and Prometheus exporters have been tested and profiled.
  * Other exporters may exist with their own stability/performance guarantees.
* Documentation
  * API, Quick Start, and comprehensive usage examples are available.

## Release Candidate
