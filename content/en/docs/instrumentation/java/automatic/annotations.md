---
title: Annotations
description: Using instrumentation annotations with a Java agent.
aliases: [/docs/instrumentation/java/annotations]
weight: 4
---

For most users, the out-of-the-box instrumentation is completely sufficient and
nothing more has to be done.  Sometimes, however, users wish to create spans
for their own custom code without doing too much code change.

## Dependencies

You'll need to add a dependency on the `opentelemetry-extension-annotations`
library to use the `@WithSpan` annotation.

### Maven

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-extension-annotations</artifactId>
    <version>1.12.0</version>
  </dependency>
</dependencies>
```

### Gradle

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-extension-annotations:1.11.0')
}
```

## Creating spans around methods with `@WithSpan`

To create a span corresponding to one of your method, annotate the method
with `@WithSpan`.

```java
import io.opentelemetry.extension.annotations.WithSpan;

public class MyClass {
  @WithSpan
  public void myMethod() {
      <...>
  }
}
```

Each time the application invokes the annotated method, it creates a span that
denotes its duration and provides any thrown exceptions. By default, the span
name will be `<className>.<methodName>`, unless a name is provided as an
argument to the annotation.

If the return type of the method annotated by `@WithSpan` is one of the below "future promise" types,
then the span will not be ended until the "future promise" completes.

* java.util.concurrent.CompletableFuture
* java.util.concurrent.CompletionStage
* com.google.common.util.concurrent.ListenableFuture
* org.reactivestreams.Publisher
* reactor.core.publisher.Mono
* reactor.core.publisher.Flux
* io.reactivex.Completable
* io.reactivex.Maybe
* io.reactivex.Single
* io.reactivex.Observable
* io.reactivex.Flowable
* io.reactivex.parallel.ParallelFlowable

## Adding attributes to the span with `@SpanAttribute`

When a span is created for an annotated method the values of the arguments to
the method invocation can be automatically added as attributes to the created
span by annotating the method parameters with the `@SpanAttribute` annotation.

```java
import io.opentelemetry.extension.annotations.SpanAttribute;
import io.opentelemetry.extension.annotations.WithSpan;

public class MyClass {

    @WithSpan
    public void myMethod(@SpanAttribute("parameter1") String parameter1,
        @SpanAttribute("parameter2") long parameter2) {
        <...>
    }
}
```

Unless specified as an argument to the annotation, the attribute name will be
derived from the formal parameter names if they are compiled into the `.class`
files by passing the `-parameters` option to the `javac` compiler.

## Suppressing `@WithSpan` instrumentation

Suppressing `@WithSpan` is useful if you have code that is over-instrumented
using `@WithSpan` and you want to suppress some of them without modifying the
code.

| System property                                                  | Environment variable                                             | Purpose |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------- |
| `otel.instrumentation.opentelemetry-annotations.exclude-methods` | `OTEL_INSTRUMENTATION_OPENTELEMETRY_ANNOTATIONS_EXCLUDE_METHODS` | Suppress `@WithSpan` instrumentation for specific methods. Format is `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`

## Creating spans around methods with `otel.instrumentation.methods.include`

In cases where you are unable to modify the code, you can still configure the
javaagent to capture spans around specific methods.

| System property                        | Environment variable                   | Purpose |
| -------------------------------------- | -------------------------------------- | ------- |
| `otel.instrumentation.methods.include` | `OTEL_INSTRUMENTATION_METHODS_INCLUDE` | Add instrumentation for specific methods in lieu of `@WithSpan`. Format is `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`

## Next steps

Beyond the use of annotations, the OpenTelemetry API allows you to obtain
a tracer that can be used for [Manual Instrumentation](../../manual)
and execute code within the scope of that span.