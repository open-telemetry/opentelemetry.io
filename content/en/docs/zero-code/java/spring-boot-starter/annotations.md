---
title: Annotations
weight: 50
cSpell:ignore: proxys
---

For most users, the out-of-the-box instrumentation is completely sufficient and
nothing more has to be done. Sometimes, however, users wish to create
[spans](/docs/concepts/signals/traces/#spans) for their own custom code without
doing too much code change.

If you add the `WithSpan` annotation to a method, the method is wrapped in a
span. The `SpanAttribute` annotation allows you to capture the method arguments
as attributes.

```java
import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;

    @WithSpan
    public void tracedMethod(@SpanAttribute parameter) {
    }
```

{{% alert title="Note" color="info" %}} The OpenTelemetry annotations use Spring
AOP based on proxys.

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

{{% alert title="Note" color="info" %}}

To be able to use the OpenTelemetry annotations, you have to add the Spring Boot
Starter AOP dependency to your project:

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>>spring-boot-starter-aop</artifactId>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```kotlin
dependencies {
implementation("org.springframework.boot:spring-boot-starter-aop") }
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
