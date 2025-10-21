---
title: Getting started
weight: 20
cSpell:ignore: springboot
---

{{% alert title="Note" %}}

You can also use the [Java agent](../../agent) to instrument your Spring Boot
application. For the pros and cons, see [Java zero-code instrumentation](..).

{{% /alert %}}

## Compatibility

The OpenTelemetry Spring Boot starter works with Spring Boot 2.6+ and 3.1+, and
Spring Boot native image applications. The
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)
repository contains an example of a Spring Boot Native image application
instrumented using the OpenTelemetry Spring Boot starter.

## Dependency management

A Bill of Material
([BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms))
ensures that versions of dependencies (including transitive ones) are aligned.

To ensure version alignment across all OpenTelemetry dependencies, you must
import the `opentelemetry-instrumentation-bom` BOM when using the OpenTelemetry
starter.

{{% alert title="Note" %}}

When using Maven, import the OpenTelemetry BOMs before any other BOMs in your
project. For example, if you import the `spring-boot-dependencies` BOM, you have
to declare it after the OpenTelemetry BOMs.

Gradle selects the
[latest version](https://docs.gradle.org/current/userguide/dependency_resolution.html#2_perform_conflict_resolution)
of a dependency when multiple BOMs, so the order of BOMs is not important.

{{% /alert %}}

The following example shows how to import the OpenTelemetry BOMs using Maven:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom</artifactId>
            <version>{{% param vers.instrumentation %}}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

With Gradle and Spring Boot, you have two ways to import a BOM.

You can use the Gradle’s native BOM support by adding `dependencies`:

```kotlin
import org.springframework.boot.gradle.plugin.SpringBootPlugin

plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
}

dependencies {
  implementation(platform(SpringBootPlugin.BOM_COORDINATES))
  implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))
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
    mavenBom("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}")
  }
}
```

{{% alert title="Note" %}}

Be careful not to mix up the different ways of configuring things with Gradle.
For example, don't use
`implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))`
with the `io.spring.dependency-management` plugin.

{{% /alert %}}

### OpenTelemetry Starter dependency

Add the dependency given below to enable the OpenTelemetry starter.

The OpenTelemetry starter uses OpenTelemetry Spring Boot
[autoconfiguration](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html).

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter")
```

{{% /tab %}} {{< /tabpane>}}
