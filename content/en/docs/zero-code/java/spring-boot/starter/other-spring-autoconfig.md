---
title: Other Spring autoconfiguration options
description:
  Spring autoconfigurations without the OpenTelemetry Spring starter
cSpell:ignore: autoconfigurations
weight: 70
---

Instead of using the OpenTelemetry Spring starter, you can use the OpenTelemetry
autoconfiguration features with an annotation or the Zipkin starter.

## Spring support

Autoconfiguration is natively supported by Spring Boot applications. To enable
these features in "vanilla" use `@EnableOpenTelemetry` to complete a component
scan of this package.

```java
import io.opentelemetry.instrumentation.spring.autoconfigure.EnableOpenTelemetry;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableOpenTelemetry
public class OpenTelemetryConfig {}
```

## Zipkin starter

OpenTelemetry Zipkin Exporter Starter is a starter package that includes the
opentelemetry-api, opentelemetry-sdk, opentelemetry-extension-annotations,
opentelemetry-logging-exporter, opentelemetry-spring-boot-autoconfigurations and
spring framework starters required to setup distributed tracing. It also
provides the
[opentelemetry-exporters-zipkin](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/zipkin)
artifact and corresponding exporter autoconfiguration. Check out
[opentelemetry-spring-boot-autoconfigure](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/README.md#features)
for the list of supported libraries and features.

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

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

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


