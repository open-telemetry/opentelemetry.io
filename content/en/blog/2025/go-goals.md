---
title: OpenTelemetry Go 2025 Goals
linkTitle: Go 2025 Goals
date: 2025-01-22
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk)
sig: SIG Go
# prettier-ignore
cSpell:ignore: codeboten dashpole dmathieu otelhttp otellogr otellogrus otelslog otelzap otelzerolog pellared Yahn
---

As we kick off 2025, the
[OpenTelemetry Go](https://github.com/open-telemetry/opentelemetry-go) team has
come together to set a roadmap for the year. Our focus is on driving the
OpenTelemetry Go project forward while strengthening its integration with the
broader OpenTelemetry ecosystem.

## Goals

Here's an overview of our goals, their expected timelines, and the key
contributors supporting each initiative.

### New Semantic Conventions (Weaver)

- Priority: First quarter goal
- Tracking Issue:
  [#5668](https://github.com/open-telemetry/opentelemetry-go/issues/5668)
- Sponsor: [@MrAlias](https://github.com/MrAlias)

Semantic conventions are foundational to OpenTelemetry and the cornerstone of
data quality across the ecosystem. The OpenTelemetry community has recently
updated the tooling used to generate these conventions into usable code by
introducing the [weaver](https://github.com/open-telemetry/weaver) project. We
plan to integrate this new tooling into the OpenTelemetry Go project and provide
updates to the latest versions of semantic conventions.

### SDK Self-Observability Signals

- Priority: Yearly goal
- Tracking Issue:
  [#2547](https://github.com/open-telemetry/opentelemetry-go/issues/2547)
- Sponsor: [@dashpole](https://github.com/dashpole)

This goal aims to enhance the observability of the OpenTelemetry Go SDK itself.
We plan to add metrics about the tracing portions of the SDK as a first step,
but hope to expand this with more signals measuring all areas of the SDK.
Unified semantic conventions across all OpenTelemetry languages will play a
critical role in achieving this objective.

### Go Runtime Metrics Stabilization

- Priority: Yearly goal
- Tracking Issue:
  [#5655](https://github.com/open-telemetry/opentelemetry-go-contrib/issues/5655)
- Sponsor: [@dashpole](https://github.com/dashpole)

Recently, the Go team
[updated runtime metrics within the Go language](https://github.com/golang/go/issues/67120).
These updates have been
[codified in OpenTelemetry semantic conventions](https://github.com/open-telemetry/semantic-conventions/pull/981),
and are provided as opt-in metrics in the
[`runtime` package](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/runtime#pkg-overview).
The Go SIG plans to gather community feedback and transition these metrics to an
opt-out model, allowing better observability of Go runtimes.

### Logs API Stability

- Priority: Yearly goal
- Tracking Project:
  [Go: Logs (GA)](https://github.com/orgs/open-telemetry/projects/43)
- Sponsor: [@pellared](https://github.com/pellared)

Stabilizing the Logs API is crucial for providing a logging solution that aligns
with OpenTelemetry’s overarching goals. Currently, a non-stable "beta"
implementation of this API is provided in the
[`log` package](https://pkg.go.dev/go.opentelemetry.io/otel/log), along with
many bridges to popular logging packages:

- [`otellogr`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otellogr)
- [`otellogrus`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otellogrus)
- [`otelslog`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otelslog)
- [`otelzap`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otelzap)
- [`otelzerolog`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otelzerolog)

The Go SIG plans to continue its effort in developing the upstream
specification. Work to stabilize the OpenTelemetry Go implementation depends on
this upstream development, including the addition of Events.

### `otelhttp` Stabilization

- Priority: Yearly goal
- Tracking Project:
  [Go: HTTP Semconv Migration](https://github.com/orgs/open-telemetry/projects/87)
- Sponsor: [@dmathieu](https://github.com/dmathieu)

Stabilizing the
[`otelhttp` instrumentation package](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp)
will ensure seamless HTTP observability and improved integration with the
OpenTelemetry ecosystem. Before this can be accomplished, the instrumentation
needs to be upgraded to use the latest stable version of semantic conventions.
Currently, the `otelhttp` package supports duplicating semantic conventions as
we transition to the newer version. We plan to finish supporting this
duplication in all HTTP instrumentation, and then transition to an opt-out model
for the latest semantic conventions in all instrumentation packages.

### File-Based Configuration

- Priority: Yearly goal
- Tracking Label:
  [File-Based Configuration](https://github.com/open-telemetry/opentelemetry-go-contrib/labels/area%3A%20config)
- Sponsors: [@MrAlias](https://github.com/MrAlias)
  [@codeboten](https://github.com/codeboten)

This effort focuses on enabling configuration of the SDK with YAML and JSON
files, making it easier for users to adopt and customize OpenTelemetry without
relying solely on environment variables or code changes. Currently, the
[`config` package](https://pkg.go.dev/go.opentelemetry.io/contrib/config)
provides and implementation of this feature. As
[file-based configuration is stabilized upstream in the specification](https://github.com/orgs/open-telemetry/projects/38),
we plan to keep `config` up-to-date with these changes and provide feedback to
its development.

## Wrapping Up

The OpenTelemetry Go team has an ambitious but focused set of goals for 2025.
These initiatives will enhance the observability landscape, improve developer
experience, and strengthen the integration of OpenTelemetry within the broader
ecosystem. We’re excited to work with the community to bring these goals to
fruition!

We want to hear from you! Let us know what is missing or what you would like to
see prioritized by commenting on
[our tracking GitHub issue](https://github.com/open-telemetry/opentelemetry-go/issues/6175).

If you'd like to participate in any of our efforts and become a contributor to
the OpenTelemetry Go SIG, join our weekly SIG meetings on Thursday alternating
between 09:00 PT and 10:00 PT and our channel
[#otel-go](https://cloud-native.slack.com/archives/C01NPAXACKT) on
[CNCF Slack](https://slack.cncf.io).
