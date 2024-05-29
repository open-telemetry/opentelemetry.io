---
title: Getting Started
description: Getting Started of the OpenTelemetry starter
weight: 20
# prettier-ignore
cSpell:ignore: autoconfigurations springboot
---

## OpenTelemetry Spring Boot starter

### Compatibility

The OpenTelemetry Spring Boot starter works with Spring Boot 2.0 and 3.0, and
Spring Boot native image applications. The
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)
repository contains an example of a Spring Boot Native image application
instrumented using the OpenTelemetry Spring Boot starter.

### Dependency management

A Bill of Material
([BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms))
ensures that versions of dependencies (including transitive ones) are aligned.

Importing the `opentelemetry-bom` and `opentelemetry-instrumentation-bom-alpha`
BOMs when using the OpenTelemetry starter is important to ensure version
alignment across all OpenTelemetry dependencies.

The following example shows how to import both BOMs using Maven:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-bom</artifactId>
            <version>{{% param vers.otel %}}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom-alpha</artifactId>
            <version>{{% param vers.instrumentation %}}-alpha</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

With Gradle and Spring Boot, you have
[two ways](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/)
to import a BOM.

You can use the Gradle’s native BOM support by adding `dependencies`:

```kotlin
import org.springframework.boot.gradle.plugin.SpringBootPlugin

plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
}

dependencies {
  implementation(platform(SpringBootPlugin.BOM_COORDINATES))
  implementation(platform("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}"))
  implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom-alpha:{{% param vers.instrumentation %}}-alpha"))
}
```

The other way with Gradle is to use the `io.spring.dependency-management` plugin
and to import the BOMs in `dependencyManagement`:

```kotlin
plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
  id("io.spring.dependency-management") version "1.1.0"
}

dependencyManagement {
  imports {
    mavenBom("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}")
    mavenBom("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom-alpha:{{% param vers.instrumentation %}}-alpha")
  }
}
```

{{% alert title="Note" color="info" %}}

Be careful not to mix up the different ways of configuring things with Gradle.
For example, don't use
`implementation(platform("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}"))`
with the `io.spring.dependency-management` plugin.

{{% /alert %}}

#### OpenTelemetry Starter dependency

Add the dependency given below to enable the OpenTelemetry starter.

The OpenTelemetry starter uses OpenTelemetry Spring Boot
[autoconfiguration](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration).

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```kotlin
dependencies {
	implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter")
}
```

{{% /tab %}} {{< /tabpane>}}

## Other solutions

Instead of using the OpenTelemetry Spring starter, you can use the OpenTelemetry
autoconfiguration features with an annotation or the Zipkin starter.

### Spring support

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

### Zipkin starter

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

#### Configurations

| Property                       | Default Value | ConditionalOnClass   |
| ------------------------------ | ------------- | -------------------- |
| `otel.exporter.zipkin.enabled` | true          | `ZipkinSpanExporter` |
