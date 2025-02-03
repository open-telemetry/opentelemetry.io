---
title: Quarkus instrumentation
linkTitle: Quarkus
---

[Quarkus](https://quarkus.io/) is an open source framework designed to help
software developers build efficient cloud-native applications both with JVM and
Quarkus native image applications.

Quarkus uses extensions to provide optimized support for a wide range of
libraries. The
[Quarkus OpenTelemetry extension](https://quarkus.io/guides/opentelemetry)
provides:

- Out of the box instrumentation
- OpenTelemetry SDK autoconfiguration, supporting almost all system properties
  defined for the
  [OpenTelemetry SDK](https://opentelemetry.io/docs/languages/java/configuration/)
- [Vert.x](https://vertx.io/) based OTLP exporter
- The same instrumentations can be used with JVM and native image applications (where the OpenTelemetry Java agent doesn't work).

The Quarkus can also be instrumented with the
[OpenTelemetry Java agent](../agent) but only with a JVM.
