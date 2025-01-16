---
title: Alibaba and Datadog Join Forces on Go Compile-Time Instrumentation
linkTitle: Go Compile-Time Instrumentation
date: 2025-01-17
author: OpenTelemetry Governance Committee
---

Standards are only useful if they're widely adopted, and adoption is only
effective if the available tooling facilitates it. I imagine
[SI units](https://en.wikipedia.org/wiki/International_System_of_Units) would
not have been too popular when they were introduced if you had to build your own
scales to weigh things in Kilograms!

If you use [OpenTelemetry in Go](https://opentelemetry.io/docs/languages/go/),
you'll be familiar with the challenges of configuring instrumentation libraries
to automatically generate telemetry from well-known open source components. Due
to the compiled nature of the language, you currently have two options (unless
you want to "build your own scales", or the OTel equivalent):

- Use a separate binary that analyzes your Go process and attaches eBPF programs
  to hooks in your application (see
  [opentelemetry-go-instrumentation](https://github.com/open-telemetry/opentelemetry-go-instrumentation/)).
- Manually configure instrumentation libraries in your code (see an
  [example](https://opentelemetry.io/docs/languages/go/getting-started/#instrument-the-http-server)
  to instrument `net/http`).

For different reasons, it is possible that none of those options is viable, or
optimal, in your environment. However, things are about to change!

## Industry collaboration at the heart of open standards

Over the past few months, OpenTelemetry has received not one, but two donation
proposals from industry leaders to provide a solution to the problem described
above, and enable the use of zero-code, vendor-neutral, compile-time
instrumentation in Go applications. These are:

- Alibaba's
  [opentelemetry-go-auto-instrumentation](https://github.com/alibaba/opentelemetry-go-auto-instrumentation)
  (see
  [donation proposal](https://github.com/open-telemetry/community/issues/2344)).
- Datadog's [Orchestrion](https://github.com/datadog/orchestrion) (see
  [donation proposal](https://github.com/open-telemetry/community/issues/2497)).

We are really grateful to Alibaba and Datadog for these donation proposals. This
continues to demonstrate the convergence of the wider industry towards the
standards defined by OpenTelemetry.

The most exciting part of this announcement is that it won't be Alibaba's or
Datadog's solution that "wins". In the true spirit of open source collaboration,
these two organisations have decided to join forces and commit the necessary
resources to bootstrap a new
[Go Compile-Time Instrumentation SIG](https://github.com/open-telemetry/community/blob/main/projects/go-compile-instrumentation.md),
with the intention of providing a unified, vendor-neutral approach that picks
the best aspects of each solution and benefits the community as a whole.

This SIG will focus on:

- Developing compiler plugins or enhancements that inject instrumentation code
  automatically, ensuring minimal runtime performance overhead and compatibility
  with existing Go projects.
- Providing standardized instrumentation patterns aligned with OpenTelemetry and
  other monitoring frameworks.

We look forward to seeing this new SIG in operation, and cannot wait for the
fruits of this awesome collaboration!
