---
title: Java
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/Java_SDK.svg"
  alt="Java"> 以 Java 语言实现特定的 OpenTelemetry。
aliases: [/java, /java/metrics, /java/tracing]
cascade:
  vers:
    instrumentation: 2.7.0
    otel: 1.42.1
    contrib: 1.38.0
    semconv: 1.27.0
weight: 18
default_lang_commit: 20c51c53
drifted_from_default: true
---

{{% docs/languages/index-intro java /%}}

### 仓库

OpenTelemetry Java 由以下仓库组成：

- [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)：
  用于手动插桩的组件，包括 API 和 SDK，也包括扩展和 OpenTracing shim。
- [opentelemetry-java-docs][]：手动插桩样例。
- [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)：
  建立在 opentelemetry-java 之上，并提供一个 Java agent JAR，可以附加到任何 Java 8+ 应用程序，并动态注入字节码，从许多流行的库和框架中捕获遥测数据。
- [opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib)：
  提供有用的库和独立的基于 OpenTelemetry 的实用程序，这些实用程序不属于 OpenTelemetry Java 或 Java Instrumentation 项目的明确范围。
  例如，JMX 指标收集。
- [semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)：
  [OpenTelemetry 语义约定](/docs/specs/semconv/)的 Java 实现。例如 `ResourceAttributes.SERVICE_NAME`。
- [opentelemetry-proto-java](https://github.com/open-telemetry/opentelemetry-proto-java)：
  [OpenTelemetry 协议 (OTLP)](/docs/specs/otlp/) 的 Java 绑定。

### 组件

查看[组件]以获取已发布组件的完整列表。

### 发行版

已经发布的[发行版][]可以在 [maven 中央仓库][]上找到。
我们强烈推荐使用我们的 BOM 来保持各种组件的版本同步。

#### Maven

```xml
<project>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-bom</artifactId>
        <version>{{% param vers.otel %}}</version>
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
  implementation(platform("io.opentelemetry：opentelemetry-bom：{{% param vers.otel %}}"))
  implementation("io.opentelemetry：opentelemetry-api")
}
```

[maven 中央仓库]: https://mvnrepository.com/artifact/io.opentelemetry
[opentelemetry-java-docs]: https://github.com/open-telemetry/opentelemetry-java-docs#java-opentelemetry-examples
[发行版]: https://github.com/open-telemetry/opentelemetry-java/releases
[组件]: https://github.com/open-telemetry/opentelemetry-java#releases
