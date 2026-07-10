---
title: >-
  Announcing v1 of OpenTelemetry Go Compile-Time Instrumentation
linkTitle: Go Compile-Time Instrumentation v1
date: 2026-12-31 # PLACEHOLDER: set to the v1 release day before publishing
author: '[Kemal Akkoyun](https://github.com/kakkoyun) (Datadog)'
issue: 10670
sig: Go Compile-Time Instrumentation
draft: true # remove only when Comms schedules publication
# prettier-ignore
cSpell:ignore: Akkoyun Azhar Cabify Castañé Dario GOFLAGS Haibin logrus Martinez Momin otelc slog toolexec Xabier
---

<!-- PUBLISH GATE: v1 is not cut yet (latest tag is v0.5.0, repo README still
     reads "Status: Development"). Before removing draft:true, confirm the v1
     release, flip every v0.5.0 link below to the v1 tag, and re-verify the
     supported-instrumentation list and getting-started commands against v1. -->

The OpenTelemetry community is announcing the first stable release of
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

<!-- Re-confirm this list against the v1 release notes before publishing.
     Current supported set is taken from pkg/instrumentation at v0.5.0. -->

- **Zero-code instrumentation**: instrument an application and its dependencies
  without manual code changes.
- **Compile-time injection, no added runtime overhead**: instrumentation is
  built into the binary instead of attached at runtime.
- **Third-party and standard-library coverage**: instrument dependencies and
  standard-library packages you don't own.
- **Supported instrumentations in v1**: `net/http`, `database/sql`, gRPC, Redis,
  MongoDB, Gin, Kubernetes `client-go`, Kafka, the OpenAI Go client, logging
  (`log`, `slog`, and logrus), and Go runtime metrics.
- **Rule-based and extensible**: add support for new libraries through the SIG's
  instrumentation-rule format. See the
  [instrumentation guide](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v0.5.0/docs/instrument-guide.md)
  and the
  [rules reference](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v0.5.0/docs/rules.md).
- **Semantic-convention compliance**: emitted telemetry follows current
  OpenTelemetry semantic conventions.
- **CI/CD friendly**: run the tool at development time or drop it into your
  build pipeline.

## Getting started

`otelc` is a drop-in wrapper around the Go toolchain. The change to your build
is a single line: run `otelc go build` where you used to run `go build`.
Everything after `go` is forwarded to the toolchain, so the rest of your build
stays the same.

<!-- AT V1: change the `@latest` in the install command below to the v1 tag
     (`@v1.0.0`) and flip the getting-started link from v0.5.0 to the v1 tag.
     `go install` is the intended install path. It requires the instrumentation
     bundle to ship inside the published module (decoupling tracked in
     open-telemetry/opentelemetry-go-compile-instrumentation#585); confirm that
     fix has landed and `go install` yields a working `otelc` before publishing.
     Do NOT fall back to a `make`-from-clone install per the author's decision. -->

Install it with `go install`:

```sh
go install go.opentelemetry.io/otelc/tool/cmd/otelc@latest
```

Then build your application through it:

```sh
otelc go build -o myapp .
```

If you'd rather not change your build command, run `otelc setup` once to prepare
the module, then point the Go toolchain at `otelc` through `GOFLAGS` and keep
running `go build` as usual:

<!-- PENDING FIX (issue #671): this setup + GOFLAGS drop-in is the chosen
     approach (the comment's "Case 2") and is being fixed for v1; today the
     toolexec step still mis-locates its work directory in the module cache.
     A setup-less drop-in (bare -toolexec, "Case 1") needs a larger refactor
     and is deferred. Re-test at v1 and remove this block if the fix hasn't
     landed by release.
     https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/issues/671 -->

```sh
otelc setup
export GOFLAGS="${GOFLAGS} '-toolexec=otelc toolexec'"
go build -o myapp .
```

By default, `otelc` discovers the supported libraries in your module and
instruments them automatically, with no configuration and no code changes. The
same swap works in a container build: install `otelc` in your build stage and
replace the `go build` line in your `Dockerfile` with `otelc go build`. For the
full walkthrough, see the
[getting-started guide](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v0.5.0/docs/getting-started.md).

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

Want to get involved? Find us on the
[GitHub repository](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation),
in
[#otel-go-compile-instrumentation](https://cloud-native.slack.com/archives/C088D8GSSSF)
on the CNCF Slack, and at our SIG meetings.
