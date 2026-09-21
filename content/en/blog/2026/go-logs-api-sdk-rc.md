---
title: OpenTelemetry Go Logs API and SDK reach release candidate status
linkTitle: OTel Go Logs API and SDK reach RC
date: 2026-08-31
author: '[Robert Pająk](https://github.com/pellared) (Splunk)'
issue: 11476
sig: SIG Go
cSpell:ignore: logtest Pająk
---

OpenTelemetry Go `v1.47.0-rc.1` is here. This release promotes the Logs API and
SDK to release candidate (RC), the final stage before we provide stable v1
compatibility guarantees. We believe the design is ready, and now we need the
community to test it in real applications and integrations before those
guarantees take effect.

## What is included in the release candidate?

The RC covers these two modules:

- `go.opentelemetry.io/otel/log`
- `go.opentelemetry.io/otel/sdk/log`

These modules move from `v0.22.0`, with beta stability, to `v1.47.0-rc.1`. The
version aligns them with the other stable OpenTelemetry Go modules, which share
a coordinated version number. The log exporters and `logtest` modules remain
experimental and are not covered by this RC's stability scope.

The release also adds `Logger`, `GetLoggerProvider`, and `SetLoggerProvider` to
the root `go.opentelemetry.io/otel` package. The equivalent APIs in
`go.opentelemetry.io/otel/log/global` are now deprecated. This brings global
logger access in line with the patterns already used for tracers and meters.

See the [release candidate release][rc-release] for the complete release notes.

## The journey to release candidate

Work on the current design began in late 2023 with a [Logs API and bridge
prototype][api-prototype]. The prototype included benchmarks and early bridges,
which let us test both the shape and the cost of the API before committing to
it.

The [first Logs API alpha][api-alpha] followed in February 2024, and the [first
Logs SDK alpha][sdk-alpha] arrived in April. In May 2024, we published the
[first beta release of the API and SDK together][beta-release]. Since then, we
have continued to follow the evolving OpenTelemetry Logs specification,
broadened the API from its original bridge-focused use case to direct use, and
refined record representation, processing, limits, lifecycle behavior, and
performance. Recent changes included adopting the common [`attribute.Value` and
`attribute.KeyValue` types][shared-attributes] across signals and [redesigning
the `BatchProcessor`][batch-redesign] for safer behavior under exporter
backpressure.

That long beta period was intentional. Logging is often on an application's
hottest paths, and an API becomes much harder to correct after it is stable. We
wanted enough time to learn from implementations and integrations rather than
rush the compatibility promise.

## What guided the design?

We aimed to make the API and SDK specification-compliant, robust, and as
efficient as possible, while keeping them familiar to anyone who has used the
OpenTelemetry Go trace or metrics APIs.

- **Specification compliance:** The public abstractions and behavior are
  designed to implement the OpenTelemetry Logs API and SDK specifications,
  including concurrency, context correlation, record limits, and processor and
  exporter lifecycle requirements.
- **Robustness:** The `BatchProcessor` uses a bounded queue and keeps log
  emission from waiting for exporter I/O. The SDK also defines explicit flush
  and shutdown semantics.
- **Performance:** Records and hot-path operations are designed to reduce heap
  allocations and garbage-collection pressure. The SDK is optimized for the
  common configuration of an OTLP exporter with a batch processor.
- **Familiarity:** Providers, instrumentation scopes, options, processors,
  exporters, and global access follow patterns established by the Trace and
  Metrics APIs, so the Logs API should feel like another part of the same Go SDK
  rather than a separate logging framework.

The decisions and tradeoffs are documented in the [Logs API design
document][api-design] and [Logs SDK design document][sdk-design]. These
documents also record alternatives we considered and explain choices such as the
record representation, attribute handling, extensibility, and batching model.

## Try the RC

Update the following modules to the release candidate:

```sh
go get go.opentelemetry.io/otel@v1.47.0-rc.1
go get go.opentelemetry.io/otel/log@v1.47.0-rc.1
go get go.opentelemetry.io/otel/sdk/log@v1.47.0-rc.1
```

Then exercise the paths that matter in your environment: direct API use, logging
bridges, custom processors or exporters, high-volume workloads, attribute
limits, and application shutdown.

## Please report problems now

If you encounter any problems, please [open a new issue][new-issue] in the
OpenTelemetry Go repository. Include the RC version, your Go version, a minimal
reproducer when possible, and what you expected to happen.

**Feedback period:** We will wait at least 14 days after this post is published
before stabilizing the Logs API and SDK. If significant findings require another
RC, we will restart the 14-day feedback period when that RC is published. This
gives the community time to validate any substantial changes before
stabilization.

This feedback window matters. Once we stabilize the Logs API and SDK, our
[versioning policy][versioning] commits us to compatibility throughout the v1
line. Outside its documented exceptions, we will no longer be able to fix
problems by making breaking API changes within v1; an incompatible correction
would have to wait for a new major version. If an API shape, behavior, extension
point, or performance characteristic does not work for your use case, now is the
time to tell us.

After evaluating the feedback, we will make any necessary RC updates and then
move the Logs API and SDK to stable. Thank you to everyone who has contributed
designs, implementations, reviews, benchmarks, integrations, and feedback along
the way.

[api-design]:
  https://github.com/open-telemetry/opentelemetry-go/blob/73b17d449376ccd8420f84fc8d5d4435ad44e0d6/log/DESIGN.md
[api-alpha]:
  https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.24.0
[api-prototype]: https://github.com/open-telemetry/opentelemetry-go/pull/4725
[batch-redesign]: https://github.com/open-telemetry/opentelemetry-go/pull/8620
[beta-release]:
  https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.27.0
[new-issue]:
  https://github.com/open-telemetry/opentelemetry-go/issues/new/choose
[rc-release]:
  https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.47.0-rc.1
[sdk-design]:
  https://github.com/open-telemetry/opentelemetry-go/blob/73b17d449376ccd8420f84fc8d5d4435ad44e0d6/sdk/log/DESIGN.md
[sdk-alpha]: https://github.com/open-telemetry/opentelemetry-go/pull/5260
[shared-attributes]:
  https://github.com/open-telemetry/opentelemetry-go/pull/8490
[versioning]:
  https://github.com/open-telemetry/opentelemetry-go/blob/73b17d449376ccd8420f84fc8d5d4435ad44e0d6/VERSIONING.md
