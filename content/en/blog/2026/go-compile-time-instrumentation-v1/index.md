---
title: >-
  Announcing v1 of OpenTelemetry Go Compile-Time Instrumentation
linkTitle: Go Compile-Time Instrumentation v1
date: 2026-07-16
author: '[Kemal Akkoyun](https://github.com/kakkoyun) (Datadog)'
issue: 10670
sig: Go Compile-Time Instrumentation
# prettier-ignore
cSpell:ignore: Akkoyun Azhar Cabify Castañé Dario Haibin Martinez Momin otelc toolexec Xabier
---

If you write Java, Python, Node.js, or .NET, you have been able to add
OpenTelemetry to an application without editing its code for years: attach an
agent at startup and telemetry starts flowing. Go has been the exception. A Go
program compiles to a single static binary with no runtime to hook into at
startup, so Go developers have had to instrument by hand or reach for an
out-of-process eBPF agent.

That gap is closing. The OpenTelemetry community is announcing the first stable
release of
[OpenTelemetry Go Compile-Time Instrumentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation).
When we [announced this SIG](/blog/2025/go-compile-time-instrumentation/) at the
start of 2025, Alibaba and Datadog joined forces to build one unified,
vendor-neutral way to instrument Go at build time. v1 is that project's first
stable release.

If you build and run Go services, you can change a single line in how you build
your binary or container image and get OpenTelemetry traces and metrics for your
application and its dependencies, with no code changes. For a platform engineer
or an SRE, that means you can add observability to services across your fleet
without waiting for every team to instrument their own code.

## What is Go Compile-Time Instrumentation?

Go compiles to a single static binary, which has long made automatic
instrumentation harder than in interpreted languages. This project hooks into
the standard Go toolchain during the build (through its `-toolexec` mechanism)
and injects OpenTelemetry instrumentation into your code, its dependencies, and
the standard library as they are compiled. There is no separate agent and
nothing to attach at runtime.

For you, that means telemetry with no source-code changes: the instrumentation
is compiled directly into your binary. Your application code stays free of
instrumentation concerns, and you get coverage for third-party libraries you
don't own.

## Key capabilities in v1

- **Zero-code instrumentation**: instrument an application and its dependencies
  without manual code changes.
- **Compile-time injection, no added runtime overhead**: instrumentation is
  built into the binary instead of attached at runtime.
- **Third-party and standard-library coverage**: instrument dependencies and
  standard-library packages you don't own.
- **Supported instrumentations in v1**: common libraries and frameworks
  including `net/http`, `database/sql`, gRPC, Redis, and Go runtime metrics,
  with more added regularly. See the
  [supported libraries](/docs/zero-code/go/compile-time/supported-libraries/)
  for the full, current list.
- **Rule-based and extensible**: add support for new libraries through the SIG's
  instrumentation-rule format. See the
  [instrumentation guide](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v1.0.0/docs/instrument-guide.md)
  and the
  [rules reference](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v1.0.0/docs/rules.md).
- **Semantic-convention compliance**: emitted telemetry follows current
  OpenTelemetry semantic conventions.
- **CI/CD friendly**: run the tool at development time or drop it into your
  build pipeline.

## Getting started

The project ships a command-line tool called `otelc` that wraps the standard Go
toolchain. The change to your build is a single line: run `otelc go build` where
you used to run `go build`. Everything after `go` is forwarded to the toolchain,
so the rest of your build stays the same, and the same swap works in a container
build. By default, `otelc` discovers the supported libraries in your module and
instruments them automatically, with no configuration and no code changes.

To install `otelc`, build your application through it, and see the telemetry it
produces, follow the
[getting-started guide](/docs/zero-code/go/compile-time/getting-started/). For
everything else — configuration, supported libraries, and troubleshooting — see
the
[compile-time instrumentation documentation](/docs/zero-code/go/compile-time/).

## When should you use it?

If you write or operate Go services, you now have three complementary ways to
get OpenTelemetry telemetry, and compile-time instrumentation is the third
option promised in the founding post:

- **Compile-time instrumentation (this project)**: best when you can rebuild the
  application and want no code changes, no added runtime overhead, and coverage
  of dependencies and the standard library.
- **eBPF instrumentation
  ([OpenTelemetry eBPF Instrumentation, or OBI](/docs/zero-code/obi/))**: best
  when you can't rebuild the binary, or want zero-code, multi-language
  instrumentation from outside the process.
- **Manual instrumentation with the
  [OpenTelemetry Go API](/docs/languages/go/)**: best for custom spans and
  domain-specific telemetry, and it composes with the other two.

v1 ships a focused set of instrumentations rather than the full breadth of the
Go ecosystem, and coverage will grow with each release. If a library you depend
on isn't covered yet, you can add a rule for it or combine compile-time
instrumentation with manual spans. The three approaches above solve overlapping
problems in different ways, so we're working with the OBI and Go SIGs on
follow-up posts that compare them in more depth.

## What's next

v1 covers the core of the compile-time approach. Our priorities from here:

- **More instrumentations**: broaden coverage across popular Go libraries and
  frameworks so more applications work the moment you swap in `otelc`.
- **Registry-based discovery**: use the existing
  [OpenTelemetry Registry](/ecosystem/registry/) to discover and distribute
  instrumentations, so you can pick up support for new libraries without waiting
  for a new `otelc` release.
- **Performance**: keep driving down both build-time and runtime cost.
- **Adoption and awareness**: invest in docs, examples, and outreach so teams
  know the tool exists and how to fit it into their build.

## Get involved

Compile-time instrumentation is v1, and the best way to shape where it goes next
is to use it and get involved.

- **Try it and tell us how it went.** Add `otelc` to a build and share what
  worked and what didn't in the project's
  [GitHub discussions and issues](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation).
  Real-world feedback drives the roadmap.
- **Instrument a library you use.** Coverage grows through the SIG's rule
  format; the
  [instrumentation guide](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v1.0.0/docs/instrument-guide.md)
  walks through adding one.
- **Join the SIG.** Find us in
  [#otel-go-compile-instrumentation](https://cloud-native.slack.com/archives/C088D8GSSSF)
  on the CNCF Slack and at our SIG meetings.

## Acknowledgments

Reaching v1 is a milestone for the whole Go Compile-Time Instrumentation SIG.
Thank you to the maintainers who drove the release through to stable, including
[Xabier Martinez](https://github.com/txabman42) (Cabify),
[Yi Yang](https://github.com/y1yang0) (Alibaba),
[Haibin Zhang](https://github.com/NameHaibinZhang) (Alibaba), and
[Dario Castañé](https://github.com/darccio) (Datadog), along with everyone who
contributed code, rules, documentation, and feedback.

A special thank-you to [Azhar Momin](https://github.com/amazingakai), who joined
the project through the
[LFX Mentorship program](https://mentorship.lfx.linuxfoundation.org/project/3e530f5c-12f3-4321-836a-39de799a4d15)
and has become one of its most active contributors and an approver.
