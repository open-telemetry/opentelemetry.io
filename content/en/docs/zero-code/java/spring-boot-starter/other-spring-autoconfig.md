---
title: Other Spring autoconfiguration
weight: 70
cSpell:ignore: autoconfigurations
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Instead of using the OpenTelemetry Spring starter, you can use the OpenTelemetry
Zipkin starter.

## Zipkin starter

OpenTelemetry Zipkin Exporter Starter is a starter package that includes the
`opentelemetry-api`, `opentelemetry-sdk`, `opentelemetry-extension-annotations`,
`opentelemetry-logging-exporter`, `opentelemetry-spring-boot-autoconfigurations`
and spring framework starters required to setup distributed tracing. It also
provides the
[opentelemetry-exporters-zipkin](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/zipkin)
artifact and corresponding exporter autoconfiguration.

If an exporter is present in the classpath during runtime and a spring bean of
the exporter is missing from the spring application context, an exporter bean is
initialized and added to a simple span processor in the active tracer provider.
Check out the implementation
[here](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/OpenTelemetryAutoConfiguration.java).

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-zipkin</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}")
}
```

{{% /tab %}} {{< /tabpane>}}

### Configurations

| Property                       | Default Value | ConditionalOnClass   |
| ------------------------------ | ------------- | -------------------- |
| `otel.exporter.zipkin.enabled` | true          | `ZipkinSpanExporter` |
