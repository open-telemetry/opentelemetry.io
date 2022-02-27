---
title: Using API and Annotations
description: OpenTelemetry documentaion for using API and annotations with Java agent.
weight: 2
---

For most users, the out-of-the-box instrumentation is completely sufficient and nothing more has to
be done.  Sometimes, however, users wish to add attributes to the otherwise automatic spans,
or they might want to manually create spans for their own custom code.

# Dependencies

You'll need to add a dependency on the `opentelemetry-api` library to get started; if you intend to
use the `@WithSpan` annotation, also include the `opentelemetry-extension-annotations` dependency.

## Maven

```xml
  <dependencies>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-api</artifactId>
      <version>1.7.0</version>
    </dependency>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-extension-annotations</artifactId>
      <version>1.7.0</version>
    </dependency>
  </dependencies>
```

## Gradle

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-api:1.7.0')
    implementation('io.opentelemetry:opentelemetry-extension-annotations:1.7.0')
}
```

# Adding attributes to the current span

A common need when instrumenting an application is to capture additional application-specific or
business-specific information as additional attributes to an existing span from the automatic
instrumentation. Grab the current span with `Span.current()` and use the `setAttribute()`
methods:

```java
import io.opentelemetry.api.trace.Span;

// ...

Span span = Span.current();
span.setAttribute(..., ...);
```

# Creating spans around methods with `@WithSpan`

Another common situation is to capture a span corresponding to one of your methods. The
`@WithSpan` annotation makes this straightforward:

```java
import io.opentelemetry.extension.annotations.WithSpan;

public class MyClass {
  @WithSpan
  public void MyLogic() {
      <...>
  }
}
```

Each time the application invokes the annotated method, it creates a span that denote its duration
and provides any thrown exceptions. Unless specified as an argument to the annotation, the span name
will be `<className>.<methodName>`.


## Adding attributes to the span with `@SpanAttribute`

When a span is created for an annotated method the values of the arguments to the method invocation
can be automatically added as attributes to the created span by annotating the method parameters
with the `@SpanAttribute` annotation.

```java
import io.opentelemetry.extension.annotations.SpanAttribute;
import io.opentelemetry.extension.annotations.WithSpan;

public class MyClass {
  @WithSpan
  public void MyLogic(@SpanAttribute("parameter1") String parameter1, @SpanAttribute("parameter2") long parameter2) {
      <...>
  }
}
```

Unless specified as an argument to the annotation, the attribute name will be derived from the
formal parameter names if they are compiled into the `.class` files by passing the `-parameters`
option to the `javac` compiler.

## Suppressing `@WithSpan` instrumentation

Suppressing `@WithSpan` is useful if you have code that is over-instrumented using `@WithSpan`
and you want to suppress some of them without modifying the code.

| System property                                                  | Environment variable                                             | Purpose |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------- |
| `otel.instrumentation.opentelemetry-annotations.exclude-methods` | `OTEL_INSTRUMENTATION_OPENTELEMETRY_ANNOTATIONS_EXCLUDE_METHODS` | Suppress `@WithSpan` instrumentation for specific methods. Format is `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`

## Creating spans around methods with otel.instrumentation.methods.include

In cases where you are unable to modify the code, you can still configure the javaagent to capture
spans around specific methods.

| System property                        | Environment variable                   | Purpose |
| -------------------------------------- | -------------------------------------- | ------- |
| `otel.instrumentation.methods.include` | `OTEL_INSTRUMENTATION_METHODS_INCLUDE` | Add instrumentation for specific methods in lieu of `@WithSpan`. Format is `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`

# Creating spans manually with a Tracer

If `@WithSpan` doesn't work for your specific use case, you're still in luck!

The underlying OpenTelemetry API allows you to obtain a tracer 
that can be used for [Manual Instrumentation](../../manual)
and execute code within the scope of that span.