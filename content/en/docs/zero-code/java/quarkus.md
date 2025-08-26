---
title: Quarkus instrumentation
linkTitle: Quarkus
---

[Quarkus](https://quarkus.io/) is an open source framework designed to help
software developers build efficient cloud native applications both with JVM and
Quarkus native image applications.

Quarkus uses extensions to provide optimized support for a wide range of
libraries. The
[Quarkus OpenTelemetry extension](https://quarkus.io/guides/opentelemetry)
provides:

- Out of the box instrumentation
- OpenTelemetry SDK autoconfiguration, supporting almost all system properties
  defined for the [OpenTelemetry SDK](/docs/languages/java/configuration/)
- [Vert.x](https://vertx.io/) based OTLP exporter
- The same instrumentations can be used with native image applications, which
  are not supported by the OpenTelemetry Java agent.

{{% alert title="Note" color="secondary" %}}

Quarkus OpenTelemetry instrumentation is maintained and supported by Quarkus.
For details, see [Quarkus community support](https://quarkus.io/support/).

{{% /alert %}}

Quarkus can also be instrumented with the [OpenTelemetry Java agent](../agent/)
if you are not running a native image application.

## Getting started

To enable OpenTelemetry in your Quarkus application, add the
`quarkus-opentelemetry` extension dependency to your project.

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

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

Only the **tracing** signal is enabled by default. To enable **metrics** and
**logs**, add the following configuration to your `application.properties` file:

```properties
quarkus.otel.metrics.enabled=true
quarkus.otel.logs.enabled=true
```

OpenTelemetry logging is supported by Quarkus 3.16.0+.

For details concerning these and other configuration options, see
[OpenTelemetry configuration reference](https://quarkus.io/guides/opentelemetry#configuration-reference).

## Learn more

- [Using OpenTelemetry](https://quarkus.io/guides/opentelemetry), a general
  reference covering all
  [configuration](https://quarkus.io/guides/opentelemetry#configuration-reference)
  options
- Signal-specific guides for
  - [Tracing](https://quarkus.io/guides/opentelemetry-tracing)
  - [Metrics](https://quarkus.io/guides/opentelemetry-metrics)
  - [Logs](https://quarkus.io/guides/opentelemetry-logging)
