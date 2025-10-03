---
title: Annotations
weight: 50
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

For most users, the out-of-the-box instrumentation is completely sufficient and
nothing more has to be done. Sometimes, however, users wish to create
[spans](/docs/concepts/signals/traces/#spans) for their own custom code without
needing to make many code changes.

If you add the `WithSpan` annotation to a method, the method is wrapped in a
span. The `SpanAttribute` annotation allows you to capture the method arguments
as attributes.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/TracedClass.java"?>
```java
package otel;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;
import org.springframework.stereotype.Component;

/** Test WithSpan */
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

{{% alert title="Note" %}} The OpenTelemetry annotations use Spring AOP based on
proxies.

These annotations work only for the methods of the proxy. You can learn more in
the
[Spring documentation](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html).

In the following example, the `WithSpan` annotation won't do anything when the
GET endpoint is called:

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

{{% alert title="Note" %}}

To be able to use the OpenTelemetry annotations, you have to add the Spring Boot
Starter AOP dependency to your project:

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

You can disable the OpenTelemetry annotations by setting the
`otel.instrumentation.annotations.enabled` property to `false`.

You can customize the span by using the elements of the `WithSpan` annotation:

| Name    | Type       | Description           | Default Value       |
| ------- | ---------- | --------------------- | ------------------- |
| `value` | `String`   | Span name             | ClassName.Method    |
| `kind`  | `SpanKind` | Span kind of the span | `SpanKind.INTERNAL` |

You can set the attribute name from the `value` element of the `SpanAttribute`
annotation:

| Name    | Type     | Description    | Default Value         |
| ------- | -------- | -------------- | --------------------- |
| `value` | `String` | Attribute name | Method parameter name |

## Next steps

Beyond the use of annotations, the OpenTelemetry API allows you to obtain a
tracer that can be used [custom instrumentation](../api).
