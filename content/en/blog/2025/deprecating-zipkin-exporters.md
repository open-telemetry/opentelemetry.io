---
title: Deprecating Zipkin Exporter
linkTitle: Deprecating Zipkin Exporter
date: 2025-12-01
author: >-
  [Liudmila Molkova](https://github.com/lmolkova) (Grafana Labs)
sig: Specification
issue: https://github.com/open-telemetry/opentelemetry-specification/pull/4715
cSpell:ignore: Liudmila Molkova
---

The OpenTelemetry project is deprecating the Zipkin exporter specification in
favor of
[Zipkin's OTLP ingestion support](https://github.com/openzipkin-contrib/zipkin-otel).

Thank you to all Zipkin contributors for helping OpenTelemetry reach this
milestone!

After analyzing usage patterns across language ecosystems, we've observed that
the community has strongly gravitated toward OTLP, with Zipkin exporters seeing
limited adoption — in several languages, even less than the already-deprecated
Jaeger exporter. Combined with minimal user engagement on related issues and the
availability of alternatives, we believe this is the right time to sunset Zipkin
exporters in OTel SDKs.

## Timeline and migration path

- **Specification deprecation**: Effective from December 2025.
- **SDK support**: Existing stable Zipkin exporters will continue to receive
  security patches and critical bug fixes until at least **December 2026**,
  following the
  [SDK stability guarantees](/docs/specs/otel/versioning-and-stability/#sdk-support).
- **New SDKs**: Implementing a Zipkin exporter is not required for new language
  SDKs.

## What should users do?

If you're currently using a Zipkin exporter, you have two migration paths:

- **Switch to OTLP** (recommended): Configure your application to send traces
  using OTLP and enable
  [Zipkin's OTLP ingestion support](https://github.com/openzipkin-contrib/zipkin-otel).
- **Use the Collector**: Route your OTLP data through the OpenTelemetry
  Collector with its
  [Zipkin exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/exporter/zipkinexporter?from_branch=main).

## Questions?

Reach out in the
[#otel-specification](https://cloud-native.slack.com/archives/C01N7PP1THC)
channel on CNCF Slack or create an issue in the
[opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification)
repository.
