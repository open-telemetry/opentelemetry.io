---
title: Deprecating OpenTracing compatibility requirements
linkTitle: Deprecating OpenTracing compatibility
date: 2026-04-23
author: '[Amol Patil](https://github.com/adp2201)'
issue: 9385
sig: Specification
cSpell:ignore: Patil
---

On March 19, 2026, the OpenTelemetry Specification project merged
[PR #4938](https://github.com/open-telemetry/opentelemetry-specification/pull/4938),
deprecating OpenTracing compatibility requirements in the specification.

This change updates the specification to match where the ecosystem already is:
OpenTracing has been archived for years, and new integrations are expected to
use native OpenTelemetry APIs and SDKs instead of building on OpenTracing shim
requirements.

This is a deprecation of specification requirements, not an immediate removal of
compatibility material and not a requirement to remove existing shim artifacts
right away.

## What is changing?

- OpenTracing compatibility requirements in the specification are deprecated.
- Implementing new OpenTracing compatibility is no longer required for new SDKs
  or implementations.
- Existing OpenTracing shims can continue to be supported for backwards
  compatibility during the deprecation period.
- New work should target native OpenTelemetry APIs, SDKs, and OTLP-based
  workflows instead of introducing new OpenTracing dependencies.

## Why now?

OpenTracing itself has been archived for years, and ecosystem adoption has
converged around native OpenTelemetry APIs and OTLP-based workflows. The project
also has precedent for this staged approach from prior deprecation work, such as
Zipkin exporter deprecation in
[PR #4715](https://github.com/open-telemetry/opentelemetry-specification/pull/4715).

## Timeline and policy

- **Specification deprecation**: effective as of **March 2026**.
- **Earliest specification removal**: **no earlier than March 2027**, as stated
  in the merged spec text.

## What should users do?

If you still depend on an OpenTracing shim, now is the right time to plan
migration to native OpenTelemetry APIs and SDKs.

Start by reviewing:

- [Migrating from OpenTracing](/docs/compatibility/migration/opentracing/)
- [OpenTracing compatibility spec page](/docs/specs/otel/compatibility/opentracing/)
