---
title: OpenTelemetry Accepted Elastic's PHP Distro Donation
linkTitle: Elastic PHP Distro Donation
date: 2026-03-17
author: >-
  [Pawel Filipczak](https://github.com/intuibase) (Elastic)
draft: true
issue: https://github.com/open-telemetry/opentelemetry.io/issues/9434
sig: OpenTelemetry PHP
cSpell:ignore: Filipczak Pawel
---

The OpenTelemetry community accepted the donation of the OpenTelemetry PHP
Distro project. This post summarizes what the donation enables, how it relates
to existing PHP instrumentation paths, and where contributors can help next.

## Why this donation matters

OpenTelemetry gives us a common observability standard, but PHP adoption can
still be difficult in environments with strict operational constraints. Common
blockers include:

- Restricted or hardened systems where native extensions cannot be built during
  deployment.
- Runtime images that are not rebuilt frequently.
- Operational workflows that rely on OS package managers.

The PHP Distro addresses these constraints by focusing on an operations-first
installation model.

## What the PHP Distro provides

The project combines native and PHP runtime components into a single deployment
path for production environments. Current capabilities include:

- Prebuilt native extension and loader artifacts.
- Runtime/bootstrap logic for auto-instrumentation.
- Packaging support for `deb`, `rpm`, and `apk`.
- OTLP protobuf serialization without requiring `ext-protobuf`.
- Inferred spans and URL grouping features for better visibility.
- OpAMP integration support.

For teams running PHP `8.1` through `8.4`, this can reduce adoption friction
compared with custom build pipelines.

## Relationship to existing PHP instrumentation

The distro is intended to coexist with existing OpenTelemetry PHP approaches,
not replace them.

- Distro path: package-managed, operations-first rollout with minimal code
  changes.
- Composer-centric path: manual control and portability where application-level
  packaging is preferred.

Choosing between them depends on your deployment model, security constraints,
and ownership of runtime packaging.

## Practical rollout checklist

Before broad production rollout, validate:

- Runtime compatibility across PHP versions and SAPIs (`php-fpm`, `mod_php`,
  CLI).
- Package format and architecture support in your Linux distributions.
- Telemetry quality (span completeness, naming, exporter behavior).
- Operational safety (restart and rollback procedures, version pinning).

A lightweight validation matrix across representative services can help avoid
rework later.

## Current status and next topics

The project has reached a major milestone and is moving toward a first beta
release. Active follow-up topics include:

- Class and namespace shadowing to reduce dependency collisions.
- Declarative configuration support.
- PHP `8.5` compatibility.
- Central configuration capabilities aligned with OpenTelemetry policy work.
- Ongoing alignment between upstream OpenTelemetry distro work and vendor distributions built on top of it.

## How to contribute

If you want to help:

- Test the distro in real environments and share compatibility findings.
- Report installation and runtime issues in
  [`opentelemetry-php-distro` repository](https://github.com/open-telemetry/opentelemetry-php-distro).
- Propose documentation improvements for deployment, migration, and
  troubleshooting.
- Join OpenTelemetry PHP and relevant SIG discussions to align roadmap and user
  guidance.

You can also review the donation context and discussion in
[open-telemetry/community issue #2846](https://github.com/open-telemetry/community/issues/2846).
