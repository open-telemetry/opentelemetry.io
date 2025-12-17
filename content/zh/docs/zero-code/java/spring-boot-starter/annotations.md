---
title: 注解
default_lang_commit: 1edcb4998a74ca24a76668310b762a765c6f5966
weight: 50
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

对于大多数用户来说，开箱即用的插桩功能已经完全足够，无需进行任何其他操作。
然而，在某些情况下，用户可能希望为自己的自定义代码创建 [Span](/docs/concepts/signals/traces/#spans)，而无需进行许多代码更改。

如果你在方法上添加 `WithSpan` 注解，则该方法会被包装在一个 Span 中。
`SpanAttribute` 注解还允许你将方法参数作为属性捕获。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/TracedClass.java"?>
```java
package otel;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;
import org.springframework.stereotype.Component;

/** 测试 WithSpan */
@Component
public class TracedClass {

  @WithSpan
  public void tracedMethod() {}

  @WithSpan(value = "span name")
  public void tracedMethodWithName() {
    Span currentSpan = Span.current();
    currentSpan.addEvent("ADD EVENT TO tracedMethodWithName SPAN");
    currentSpan.setAttribute("isTestAttribute", true);
  }

  @WithSpan(kind = SpanKind.CLIENT)
  public void tracedClientSpan() {}

  @WithSpan
  public void tracedMethodWithAttribute(@SpanAttribute("attributeName") String parameter) {}
}
```
<!-- prettier-ignore-end -->

{{% alert title="注意" %}}
OpenTelemetry 注解基于代理模式使用 Spring AOP。

这些注解仅适用于代理的方法。
你可以在 [Spring 文档](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)中了解更多信息。

在下面的示例中，当调用 GET 端点时，`WithSpan` 注解不会起作用：

```java
@RestController
public class MyControllerManagedBySpring {

    @GetMapping("/ping")
    public void aMethod() {
        anotherMethod();
    }

    @WithSpan
    public void anotherMethod() {
    }
}
```

{{% /alert %}}

{{% alert title="注意" %}}

要使用 OpenTelemetry 注解，你需要向项目中添加 Spring Boot 启动器 AOP 依赖：

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-aop")
}
```

{{% /tab %}} {{< /tabpane >}}

{{% /alert %}}

你可以通过将 `otel.instrumentation.annotations.enabled` 属性设置为 `false` 来禁用 OpenTelemetry 注解。

你可以使用 `WithSpan` 注解的元素来自定义 Span：

| 名称    | 类型       | 描述      | 默认值              |
| ------- | ---------- | --------- | ------------------- |
| `value` | `String`   | Span 名称 | 类名.方法名         |
| `kind`  | `SpanKind` | Span 类型 | `SpanKind.INTERNAL` |

你可以使用 `SpanAttribute` 注解的 `value` 元素来自定义属性名称：

| 名称    | 类型     | 描述     | 默认值     |
| ------- | -------- | -------- | ---------- |
| `value` | `String` | 属性名称 | 方法参数名 |

## 下一步操作 {#next-steps}

除使用注解外，OpenTelemetry API 还允许你获取一个可用于[自定义插桩](../api)的追踪器。
