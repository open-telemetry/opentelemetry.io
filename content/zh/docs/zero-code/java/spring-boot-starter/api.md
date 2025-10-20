---
title: 使用 API 扩展插桩功能
linkTitle: 使用 API 扩展插桩功能
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
description: 结合 OpenTelemetry API 与 Spring Boot 启动器，通过自定义 Span 和指标扩展自动生成的遥测数据。
weight: 21
---

## Introduction {#introduction}

除开箱即用的插桩功能外，你还可借助 OpenTelemetry API，通过自定义手动插桩的方式对 Spring 启动器进行扩展。
这使你能够为自己的代码创建 [Span](/docs/concepts/signals/traces/#spans) 和[指标](/docs/concepts/signals/metrics)，
无需进行过多代码修改。

所需的依赖项已包含在 Spring Boot 启动器中。

## OpenTelemetry {#opentelemetry}

Spring Boot 启动器是一个特殊的案例，其中 `OpenTelemetry` 可作为 Spring Bean 使用。
只需将 `OpenTelemetry` 注入到你的 Spring 组件中即可。

## Span {#span}

{{% alert title="Note" %}}

对于最常见的使用场景，使用 `@WithSpan` 注解而不是手动插桩。
请参阅[注解](../annotations)以获取更多信息。

{{% /alert %}}

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

@Controller
public class MyController {
  private final Tracer tracer;

  public MyController(OpenTelemetry openTelemetry) {
    this.tracer = openTelemetry.getTracer("application");
  }
}
```

使用 `Tracer` 创建一个 Span，如 [Span](/docs/languages/java/api/#span) 部分所述。

完整示例可在[示例代码库][example repository]中找到。

## Meter {#meter}

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

@Controller
public class MyController {
  private final Meter meter;

  public MyController(OpenTelemetry openTelemetry) {
    this.meter = openTelemetry.getMeter("application");
  }
}
```

使用 `Meter` 创建一个指标，如 [Meter](/docs/languages/java/api/#meter) 部分所述。

完整示例可在[示例代码库][example repository]中找到。

[example repository]: https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native
