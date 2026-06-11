---
title: 'Call for Contributors: OpenTelemetry for Dart and Flutter'
linkTitle: 'CfC: OTel for Dart and Flutter'
date: 2026-06-23
draft: true # remove when published
author: >-
  [Michael Bushe](https://github.com/michaelbushe) (Mindful
  Software/Dartastic.io)
issue: 9902
sig: Governance Committee
cSpell:ignore: Bushe Dartastic dartastic
---

## Why OpenTelemetry for Dart and Flutter?

[Dart](https://dart.dev/) is a full-stack language and the language of
[Flutter](https://flutter.dev/), one of the most popular frameworks for building
cross-platform applications. Data shows over 20% of current app store
submissions are Flutter apps. Dart is null safe and type safe, compiles to fast
binaries, and is increasingly used for backend services as well. Yet Dart
remains the last top-15 programming language without an officially maintained
OpenTelemetry SDK. Earlier community implementations are no longer maintained,
leaving Dart and Flutter developers without a supported path to capture
telemetry from their servers and apps.

An actively developed implementation of the OpenTelemetry specification for Dart
already exists:
[dartastic_opentelemetry](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry)
and its standalone API package
[dartastic_opentelemetry_api](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry_api),
released under Apache 2.0 on
[pub.dev](https://pub.dev/packages/dartastic_opentelemetry). It supports traces,
metrics, and logs with OTLP/gRPC and OTLP/HTTP exporters across server, desktop,
mobile, and web targets.

## A Dart and Flutter SIG

The first step to making this an official part of OpenTelemetry is forming a
Dart and Flutter Special Interest Group (SIG). A
[project proposal](https://github.com/open-telemetry/community/pull/3517) to
bootstrap the SIG is under review, and a
[donation proposal](https://github.com/open-telemetry/community/issues/2718) for
the Dart API and SDK is open. Six maintainers across four sponsoring
organizations have committed so far — and the long-term success of an official
Dart SDK depends on growing that community further.

## Call for contributors

If you're interested in using OpenTelemetry in Dart or Flutter, we need your
help! We are looking for contributors who are willing to maintain the codebase,
participate in regular SIG meetings, and generally help drive the SDK forward.

If you're interested in becoming a contributor, or you know someone who might
be, please comment on the
[donation proposal](https://github.com/open-telemetry/community/issues/2718).

If you don't want to become a contributor but _do_ want to give feedback or try
the SDK out, check out the
[repository](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry) and
file an issue with your thoughts. All feedback helps the project at this stage.
