---
Title: "Project Status"
---
OpenTelemetry is in **alpha** at this time. You can find more details about the level of
support for OpenTelemetry features in each language by clicking on its progress bar.

Generally, we anticipate to release a **beta** by the end of 2019, and **v1** in the first quarter of 2020.

# Current SIG Progress
{{< progress_chart >}}

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
