---
title:
  Alibaba, Datadog, and Quesma Join Forces on Go Compile-Time Instrumentation
linkTitle: Go Compile-Time Instrumentation
date: 2025-01-24
author: OpenTelemetry Governance Committee
issue: https://github.com/open-telemetry/community/issues/2509
sig: Governance Committee
cSpell:ignore: instrgen quesma toolexec
---

Standards are only useful if they're widely adopted, and adoption is only
effective if the available tooling facilitates it. I imagine
[SI units](https://en.wikipedia.org/wiki/International_System_of_Units) would
not have been too popular when they were introduced if you had to build your own
scales to weigh things in Kilograms!

If you use [OpenTelemetry in Go](/docs/languages/go/), you'll be familiar with
the challenges of configuring instrumentation libraries to automatically
generate telemetry from well-known open source components. Due to the compiled
nature of the language, you currently have two options[^1]:

- Use a separate binary that analyzes your Go process and attaches eBPF programs
  to hooks in your application &mdash; see
  [opentelemetry-go-instrumentation](https://github.com/open-telemetry/opentelemetry-go-instrumentation/).
- Manually configure instrumentation libraries in your code, for example see
  [Instrument the HTTP server](/docs/languages/go/getting-started/#instrument-the-http-server).

For different reasons, it is possible that none of those options is viable, or
optimal, in your environment. However, things are about to change!

## Industry collaboration at the heart of open standards

Over the past few months, OpenTelemetry has received not one, but two donation
proposals from industry leaders to provide a solution to the problem described
above, and enable the use of zero-code, vendor-neutral, compile-time
instrumentation in Go applications. These are:

- Alibaba's
  [donation proposal](https://github.com/open-telemetry/community/issues/2344)
  of
  [opentelemetry-go-auto-instrumentation](https://github.com/alibaba/opentelemetry-go-auto-instrumentation)
- Datadog's
  [donation proposal](https://github.com/open-telemetry/community/issues/2497)
  of [Orchestrion](https://github.com/datadog/orchestrion)

We are very grateful to Alibaba and Datadog for these donation proposals. This
continues to demonstrate the convergence of the wider industry towards the
standards defined by OpenTelemetry.

Compile-time instrumentation leverages the standard Go toolchain’s `-toolexec`
mechanism to re-write Go source code before it is passed to the Go compiler,
adding instrumentation in all relevant places (including dependencies as well as
the Go standard library).

The most exciting part of this announcement is that it won't be Alibaba's or
Datadog's solution that "wins". In the true spirit of open source collaboration,
these two organizations have decided to join forces and commit the necessary
resources to bootstrap a new
[Go Compile-Time Instrumentation SIG](https://github.com/open-telemetry/community/blob/main/projects/go-compile-instrumentation.md),
with the intention of providing a unified, vendor-neutral approach that picks
the best aspects of each solution and benefits the community as a whole. They
will be supported with further contributions from Quesma, bringing in experience
on
[instrgen](https://github.com/open-telemetry/opentelemetry-go-contrib/blob/dafdad14b7858c7f491c8cb72e4bc7deaf9378e3/instrgen/README.md),
OpenTelemetry's initial experimental approach to provide Go compile-time
instrumentation based on `-toolexec` and which will be superseded as part of the
initial efforts of this SIG.

In the longer term, this SIG will focus on:

- Developing compiler plugins or enhancements that inject instrumentation code
  automatically, ensuring minimal runtime performance overhead and compatibility
  with existing Go projects.
- Providing standardized instrumentation patterns aligned with OpenTelemetry and
  other monitoring frameworks.

If you are interested in contributing, or you simply want to find out more,
here's some useful information about the SIG:

- GitHub repository:
  [opentelemetry-go-compile-instrumentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation)
- CNCF Slack:
  [#otel-go-compt-instr-sig](https://cloud-native.slack.com/archives/C088D8GSSSF)
- Meetings: Every other Thursday UTC: 08:00 – 09:00 (subscribe to
  [this Google Group](https://groups.google.com/a/opentelemetry.io/g/calendar-go)
  for calendar invites, or read more about
  [our community calendar](https://github.com/open-telemetry/community/?tab=readme-ov-file#calendar))

We look forward to seeing this new SIG in operation, and cannot wait for the
fruits of this awesome collaboration!

[^1]:
    Unless you want to "build your own scales", or the OTel equivalent, which is
    manually instrumenting third-party libraries.
