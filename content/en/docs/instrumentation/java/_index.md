---
title: Java
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/Java_SDK.svg"
  alt="Java"></img> A language-specific implementation of OpenTelemetry in Java.
aliases: [/java, /java/metrics, /java/tracing]
weight: 18
cascade:
  javaVersion: 1.26.0
---

{{% docs/instrumentation/lang-index-intro java /%}}

### Repositories

OpenTelemetry Java consists of the following repositories:

- [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java):
  Components for manual instrumentation including API and SDK as well as
  extensions, the OpenTracing shim.
- [opentelemetry-java-docs][]: Manual instrumentation examples.
- [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation):
  Built on top of opentelemetry-java and provides a Java agent JAR that can be
  attached to any Java 8+ application and dynamically injects bytecode to
  capture telemetry from a number of popular libraries and frameworks.
- [opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib):
  Provides helpful libraries and standalone OpenTelemetry-based utilities that
  don't fit the express scope of the OpenTelemetry Java or Java Instrumentation
  projects. For example, JMX metric gathering.

### Components

See [components] for a complete list of published components.

### Releases

Published [releases][] are available on [maven central][]. We strongly recommend
using our BOM to keep the versions of the various components in sync.

#### Maven

```xml
<project>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-bom</artifactId>
        <version>{{% param javaVersion %}}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-api</artifactId>
    </dependency>
  </dependencies>
</project>
```

#### Gradle

```kotlin
dependencies {
  implementation(platform("io.opentelemetry:opentelemetry-bom:{{% param javaVersion %}}"))
  implementation("io.opentelemetry:opentelemetry-api")
}
```

[maven central]: https://mvnrepository.com/artifact/io.opentelemetry
[opentelemetry-java-docs]:
  https://github.com/open-telemetry/opentelemetry-java-docs#java-opentelemetry-examples
[releases]: https://github.com/open-telemetry/opentelemetry-java/releases
[components]: https://github.com/open-telemetry/opentelemetry-java#releases
