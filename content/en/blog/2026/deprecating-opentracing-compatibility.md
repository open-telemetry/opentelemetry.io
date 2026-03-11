---
title: Deprecating OpenTracing compatibility requirements
linkTitle: Deprecating OpenTracing compatibility
date: 2026-03-11
author: '[Amol Patil](https://github.com/adp2201)'
draft: true
issue: 9385
sig: Specification
cSpell:ignore: Patil
---

The OpenTelemetry Specification project is deprecating OpenTracing
compatibility requirements in the specification, following discussion in
[issue #4849](https://github.com/open-telemetry/opentelemetry-specification/issues/4849)
and the Stage 1 change in
[PR #4938](https://github.com/open-telemetry/opentelemetry-specification/pull/4938).

This is a deprecation of specification requirements, not an immediate removal
of compatibility material or a mandate to remove existing shim artifacts.

## What is changing?

- OpenTracing compatibility requirements in the specification are deprecated.
- Implementing new OpenTracing compatibility is no longer required for new SDKs
  or implementations.
- Existing OpenTracing shims can continue to be supported for backwards
  compatibility during the deprecation period.

## Why now?

OpenTracing itself has been archived for years, and ecosystem adoption has
converged around native OpenTelemetry APIs and OTLP-based workflows. The project
also has precedent for this staged approach from prior deprecation work, such as
Zipkin exporter deprecation in
[PR #4715](https://github.com/open-telemetry/opentelemetry-specification/pull/4715).

## Timeline and policy

As of March 2026, the OpenTracing compatibility requirements are deprecated in
spec text.

Removal policy and timeline are intentionally handled in follow-up discussions,
with these principles guiding the process:

- clear migration guidance for users still on shims,
- explicit Technical Committee confirmation before removal, and
- support windows aligned with SDK stability guarantees (at least one year
  after artifact deprecation).

## What should users do?

If you still depend on an OpenTracing shim, now is the right time to plan
migration to native OpenTelemetry APIs and SDKs.

Start by reviewing:

- [Migrating from OpenTracing](/docs/migration/opentracing/)
- [OpenTracing compatibility spec page](/docs/specs/otel/compatibility/opentracing/)

## Questions and feedback

Please share feedback in the specification repository:

- [Issue #4849](https://github.com/open-telemetry/opentelemetry-specification/issues/4849)
- [PR #4938](https://github.com/open-telemetry/opentelemetry-specification/pull/4938)
