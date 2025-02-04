---
title: Quarkus instrumentation
linkTitle: Quarkus
---

## Quarkus OpenTelemetry instrumentation

[Quarkus](https://quarkus.io/) is an open source framework designed to help
software developers build efficient cloud native applications both with JVM and
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
- The same instrumentations can be used with JVM and native image applications, where the OpenTelemetry Java agent doesn't work.

Quarkus can also be instrumented with the
[OpenTelemetry Java agent](../agent/) but only with a JVM.

## Getting started

To enable OpenTelemetry in your Quarkus application, add the
`quarkus-opentelemetry` extension dependency to your project.

{{< tabpane >}} {{< tab header="Maven (`pom.xml`)" lang=Maven >}}

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-opentelemetry</artifactId>
</dependency>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
implementation("io.quarkus:quarkus-opentelemetry")
```

{{% /tab %}} {{< /tabpane>}}

Only the **tracing** signal will be enabled by default. To enable **metrics**
and **logs**, you need to add the following configuration to your
`application.properties` file:

```properties
quarkus.otel.metrics.enabled=true
quarkus.otel.logs.enabled=true
```

OpenTelemetry logging is available after Quarkus 3.16.0.

The remaining configurations are available in the
[Quarkus OpenTelemetry configuration reference](https://quarkus.io/guides/opentelemetry#configuration-reference).

{{% alert title="Note" color="info" %}}

You can also use the [Java agent](../../agent) to instrument your Quarkus
application in a JVM.

{{% /alert %}}

## Additional Documentation

The Quarkus documentation provides in-depth information on how to use Quarkus
with OpenTelemetry.

- [Using OpenTelemetry guide](https://quarkus.io/guides/opentelemetry), the
  general reference including all
  **[configurations](https://quarkus.io/guides/opentelemetry#configuration-reference)**.
- [Using OpenTelemetry Tracing](https://quarkus.io/guides/opentelemetry-tracing),
  the guide on how to **trace** your Quarkus application.
- [Using OpenTelemetry Metrics](https://quarkus.io/guides/opentelemetry-metrics),
  the guide about OpenTelemetry **metrics** on Quarkus applications.
- [Using OpenTelemetry Logs](https://quarkus.io/guides/opentelemetry-logging),
  the guide about OpenTelemetry **logs** on Quarkus applications.
