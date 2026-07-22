---
title: OpenTelemetry PHP Distro
linkTitle: PHP Distro
description: >-
  Production-ready, zero-code OpenTelemetry instrumentation for PHP, delivered
  as native Linux packages.
weight: 35
cSpell:ignore: apk rpm
---

OpenTelemetry PHP Distro is a production-focused distribution for instrumenting
PHP applications with OpenTelemetry.

Many PHP environments are hard to instrument with a Composer-only workflow
(locked-down hosts, limited build tooling, or strict deployment pipelines).
OpenTelemetry PHP Distro focuses on those production realities:

- Install via OS package (`deb`, `rpm`, `apk`)
- Restart PHP process
- Start sending telemetry

No application code changes are required for common setups.

## What is included

The distro combines:

- Native PHP extension and loader (`.so` artifacts)
- PHP runtime/bootstrap logic
- Auto-instrumentation dependencies for popular libraries and frameworks
- Packaging scripts for Linux distributions

## Key features

- Native OS packages for `deb`, `rpm`, and `apk` workflows
- Automatic bootstrap and auto-instrumentation after installation
- Background telemetry sending (non-blocking)
- Inferred spans and automatic root span creation
- URL grouping for transaction root spans
- Native OTLP protobuf serialization (no separate `ext-protobuf` requirement)
- Support for PHP `8.1` to `8.4`

## Relationship to other OTel PHP projects

OpenTelemetry PHP Distro is complementary to `opentelemetry-php` and
`opentelemetry-php-instrumentation`.

- Choose the distro when you want package-managed, production-first, zero-code
  onboarding.
- Choose Composer-centric instrumentation when you need maximum manual control
  or platform flexibility.

## Quick start

1. Install the distro package for your platform (`deb`, `rpm`, or `apk`).
2. Set `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS`.
3. Restart your PHP process and verify traces in your backend.

See the [setup guide](getting-started/setup/) for full instructions.
