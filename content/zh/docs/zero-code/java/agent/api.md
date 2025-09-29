---
title: 使用 API 扩展插桩功能
linkTitle: 使用 API 进行扩展
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
description: 结合使用 OpenTelemetry API 与 Java 代理，通过自定义 Span 和指标来扩展自动生成的遥测数据。
weight: 21
---

## 介绍 {#introduction}

除了开箱即用的插桩功能外，您还可以使用 OpenTelemetry API 扩展 Java 代理，进行自定义手动插桩。
这使你能够为自己的代码创建 [Span](/docs/concepts/signals/traces/#spans) 和[指标](/docs/concepts/signals/metrics)，
而无需进行太多代码更改。

## 依赖 {#dependencies}

添加对 `opentelemetry-api` 库的依赖。

### Maven {#maven}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

### Gradle {#gradle}

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}')
}
```

## OpenTelemetry {#opentelemetry}

Java 代理是一个特殊情况，其中 `GlobalOpenTelemetry` 由代理设置。
只需调用 `GlobalOpenTelemetry.get()` 即可访问 `OpenTelemetry` 实例。

## Span {#span}

{{% alert title="注意" %}}

对于最常见的场景，请使用 `@WithSpan` 注解而非手动插桩。
有关更多信息，请参阅[注解](../annotations)。

{{% /alert %}}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

Tracer tracer = GlobalOpenTelemetry.getTracer("application");
```

使用 `Tracer` 来创建 Span，具体说明见[Span](/docs/languages/java/api/#span)部分。

完整示例可在 [示例仓库][example repository] 中找到。

## Meter {#meter}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

Meter meter = GlobalOpenTelemetry.getMeter("application");
```

使用 `Meter` 来创建指标，具体说明见 [Meter](/docs/languages/java/api/#meter) 部分。

完整示例可在 [示例仓库][example repository] 中找到。

[example repository]: https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent
