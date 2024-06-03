---
title: Annotations
weight: 60
---

For most users, the out-of-the-box instrumentation is completely sufficient and
nothing more has to be done. Sometimes, however, users wish to create
[spans](/docs/concepts/signals/traces/#spans) for their own custom code without
doing too much code change.

## Available annotations

This feature uses spring-aop to wrap methods annotated with `@WithSpan` in a
span. The arguments to the method can be captured as attributed on the created
span by annotating the method parameters with `@SpanAttribute`.

> **Note**: this annotation can only be applied to bean methods managed by the
> spring application context. To learn more about aspect weaving in spring, see
> [spring-aop](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop).

| Feature     | Property                                   | Default Value | Description                       |
| ----------- | ------------------------------------------ | ------------- | --------------------------------- |
| `@WithSpan` | `otel.instrumentation.annotations.enabled` | true          | Enables the WithSpan annotations. |

```java
import org.springframework.stereotype.Component;

import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanKind;

/**
 * Test WithSpan
 */
@Component
public class TracedClass {

    @WithSpan
    public void tracedMethod() {
    }

    @WithSpan(value="span name")
    public void tracedMethodWithName() {
        Span currentSpan = Span.current();
        currentSpan.addEvent("ADD EVENT TO tracedMethodWithName SPAN");
        currentSpan.setAttribute("isTestAttribute", true);
    }

    @WithSpan(kind = SpanKind.CLIENT)
    public void tracedClientSpan() {
    }

    public void tracedMethodWithAttribute(@SpanAttribute("attributeName") String parameter) {
    }
}
```
