---
title: Quarkus
linkTitle: Quarkus
---

[Quarkus](https://quarkus.io/) is an open-source framework designed to help software developers build efficient cloud-native applications both in JVM and native modes.

Quarkus uses extensions to provide optimized support for a wide range of libraries.
The [Quarkus OpenTelemetry extension](https://quarkus.io/guides/opentelemetry) provides:
* Automatic instrumentation
* OpenTelemetry SDK autoconfiguration, supporting almost all system properties defined for the [OpenTelemetry SDK](https://opentelemetry.io/docs/languages/java/configuration/)
* [Vert.x](https://vertx.io/) based OTLP exporter
* Can be used in JVM and native mode (where the Java agent doesn't work)

The Quarkus can also be instrumented with the [OpenTelemetry Java agent](../agent) but only on JVM mode.
