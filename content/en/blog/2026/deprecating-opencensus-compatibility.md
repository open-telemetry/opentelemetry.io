---
title: Deprecating OpenCensus compatibility requirements
linkTitle: Deprecating OpenCensus compatibility
date: 2026-06-23
author:
  '[Krishna Chaitanya Kalluri](https://github.com/Krishnachaitanyakc) (Meta)'
issue: https://github.com/open-telemetry/opentelemetry-specification/pull/5138
sig: Specification
cSpell:ignore: Chaitanya Kalluri Krishna
---

On June 12, 2026, the OpenTelemetry Specification project merged
[PR #5138](https://github.com/open-telemetry/opentelemetry-specification/pull/5138),
deprecating OpenCensus compatibility requirements in the specification.

This change updates the specification to match where the ecosystem already is:
[OpenCensus has been archived since July 31, 2023](/blog/2023/sunsetting-opencensus/),
and the OpenTelemetry shims for OpenCensus have provided a stable migration
bridge for more than three years.

This is a deprecation of specification requirements, not an immediate removal of
compatibility material and not a requirement to remove existing shim artifacts
right away.

## What is changing?

- OpenCensus compatibility requirements in the specification are deprecated.
- Implementing new OpenCensus compatibility is no longer required for new SDKs
  or implementations.
- Existing OpenCensus shims MAY continue to be supported for backwards
  compatibility during the deprecation period.
- New work should target native OpenTelemetry APIs, SDKs, and OTLP-based
  workflows instead of introducing new OpenCensus dependencies.

## Why now?

OpenCensus was archived in July 2023, and ecosystem adoption has converged
around native OpenTelemetry APIs and OTLP-based workflows. The project also has
precedent for this staged approach from prior deprecation work, including the
[2023 sunset of OpenCensus repositories](/blog/2023/sunsetting-opencensus/), the
[Zipkin exporter deprecation](/blog/2025/deprecating-zipkin-exporters/)
([spec PR #4715](https://github.com/open-telemetry/opentelemetry-specification/pull/4715)),
and the
[OpenTracing compatibility deprecation](/blog/2026/deprecating-opentracing-compatibility/)
([spec PR #4938](https://github.com/open-telemetry/opentelemetry-specification/pull/4938)).

## Timeline and policy

- **Specification deprecation**: effective as of **June 2026**.
- **Earliest specification removal**: **no earlier than June 2027**, as stated
  in the merged spec text.
- **Shim support**: existing OpenCensus shims will continue to receive
  maintenance for at least one year, following
  [OpenTelemetry's SDK stability guarantees](/docs/specs/otel/versioning-and-stability/#sdk-support).

## What should users do?

If you still depend on an OpenCensus shim, now is the right time to plan
migration to native OpenTelemetry APIs and SDKs.

Start by reviewing:

- [How to migrate to OpenTelemetry](/blog/2023/sunsetting-opencensus/#how-to-migrate-to-opentelemetry)
  from the 2023 sunset announcement.
- The
  [OpenCensus Compatibility specification — Migration path](/docs/specs/otel/compatibility/opencensus/#migration-path).
- The language-specific shims:
  [Go](https://github.com/open-telemetry/opentelemetry-go/tree/928d4f3726bf08e5be046752ebae169ad9f9376a/bridge/opencensus),
  [Java](https://github.com/open-telemetry/opentelemetry-java/tree/a5cd87f127cd8d4e5845bc1e29360f815a6f01c8/opencensus-shim),
  [JavaScript](https://github.com/open-telemetry/opentelemetry-js/tree/13a035bc695996cf4aec885fef7b9866f48bc555/experimental/packages/shim-opencensus),
  and
  [Python](https://github.com/open-telemetry/opentelemetry-python/tree/51c1d1888c4045b8296e088fa307738685321bf3/shim/opentelemetry-opencensus-shim).

## Closing

Deprecation here does not mean removing OpenCensus compatibility material
immediately. It is about codifying that new SDKs and instrumentations should
target native OpenTelemetry APIs and OTLP, and aligning the specification with
where the ecosystem already is.

Please share feedback or migration blockers on
[spec PR #5138](https://github.com/open-telemetry/opentelemetry-specification/pull/5138)
or the
[originating issue #5109](https://github.com/open-telemetry/opentelemetry-specification/issues/5109).
