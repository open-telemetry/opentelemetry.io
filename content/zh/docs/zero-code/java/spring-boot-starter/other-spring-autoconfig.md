---
title: 其他 Spring 自动配置
default_lang_commit: f92dd4fbd069d7f6884b54b5a7961562bb40d656
weight: 70
cSpell:ignore: autoconfigurations
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

你可以使用 OpenTelemetry Zipkin 启动器，而不是使用 OpenTelemetry Spring 启动器。

## Zipkin 启动器 {#zipkin-starter}

OpenTelemetry Zipkin Exporter Starter 是一个启动器包，其中包含设置分布式追踪所需的 `opentelemetry-api`、`opentelemetry-sdk`、`opentelemetry-extension-annotations`、`opentelemetry-logging-exporter`、`opentelemetry-spring-boot-autoconfigurations` 和 Spring 框架启动器。
它还提供了 [opentelemetry-exporters-zipkin](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/zipkin) 构件和相应的导出器自动配置。

如果运行时类路径中存在导出器，且 Spring 应用程序上下文中缺少该导出器的 Spring Bean，则会初始化一个导出器 Bean，并将其添加到活动追踪器提供程序中的简单跨度处理器中。
有关更多详细信息，请参阅 [实现 (OpenTelemetryAutoConfiguration.java)](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/OpenTelemetryAutoConfiguration.java)。

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

### 配置 {#configurations}

| 属性                           | 默认值 | ConditionalOnClass   |
| ------------------------------ | ------ | -------------------- |
| `otel.exporter.zipkin.enabled` | true   | `ZipkinSpanExporter` |
