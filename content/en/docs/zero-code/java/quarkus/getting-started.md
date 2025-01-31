---
title: Getting started with Quarkus
weight: 20
---

To enable OpenTelemetry in your Quarkus application, add the
`quarkus-opentelemetry` extension dependency to your project.

{{< tabpane >}} {{< tab header="Maven (`pom.xml`)" lang=Maven >}}

````xml

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-opentelemetry</artifactId>
</dependency>
````

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
application in JVM mode. For the pros and cons, see
[Java zero-code instrumentation](..).

{{% /alert %}}
