---
title: Annotations
description: Using instrumentation annotations with a Java agent.
aliases: [/docs/instrumentation/java/annotations]
weight: 4
javaInstrumentationVersion: 1.25.0
---

For most users, the out-of-the-box instrumentation is completely sufficient and
nothing more has to be done. Sometimes, however, users wish to create
[spans](/docs/concepts/signals/traces/#spans) for their own custom code without
doing too much code change.

## Dependencies

You'll need to add a dependency on the
`opentelemetry-instrumentation-annotations` library to use the `@WithSpan`
annotation.

### Maven

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-instrumentation-annotations</artifactId>
    <version>{{% param javaInstrumentationVersion %}}</version>
  </dependency>
</dependencies>
```

### Gradle

```groovy
dependencies {
    implementation('io.opentelemetry.instrumentation:opentelemetry-instrumentation-annotations:{{% param javaInstrumentationVersion %}}')
}
```

## Creating spans around methods with `@WithSpan`

To create a [span](/docs/concepts/signals/traces/#spans) corresponding to one of
your method, annotate the method with `@WithSpan`.

```java
import io.opentelemetry.instrumentation.annotations.WithSpan;

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

If the return type of the method annotated by `@WithSpan` is one of the
[future- or promise-like](https://en.wikipedia.org/wiki/Futures_and_promises)
types listed below, then the span will not be ended until the future completes.

- [java.util.concurrent.CompletableFuture](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html)
- [java.util.concurrent.CompletionStage](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletionStage.html)
- [com.google.common.util.concurrent.ListenableFuture](https://guava.dev/releases/10.0/api/docs/com/google/common/util/concurrent/ListenableFuture.html)
- [org.reactivestreams.Publisher](https://www.reactive-streams.org/reactive-streams-1.0.1-javadoc/org/reactivestreams/Publisher.html)
- [reactor.core.publisher.Mono](https://projectreactor.io/docs/core/3.1.0.RELEASE/api/reactor/core/publisher/Mono.html)
- [reactor.core.publisher.Flux](https://projectreactor.io/docs/core/3.1.0.RELEASE/api/reactor/core/publisher/Flux.html)
- [io.reactivex.Completable](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Completable.html)
- [io.reactivex.Maybe](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Maybe.html)
- [io.reactivex.Single](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Single.html)
- [io.reactivex.Observable](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Observable.html)
- [io.reactivex.Flowable](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Flowable.html)
- [io.reactivex.parallel.ParallelFlowable](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/parallel/ParallelFlowable.html)

## Adding attributes to the span with `@SpanAttribute`

When a [span](/docs/concepts/signals/traces/#spans) is created for an annotated
method the values of the arguments to the method invocation can be automatically
added as [attributes](/docs/concepts/signals/traces/#attributes) to the created
span by annotating the method parameters with the `@SpanAttribute` annotation.

```java
import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;

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

{{% config_option
  name="otel.instrumentation.opentelemetry-instrumentation-annotations.exclude-methods" %}}
Suppress `@WithSpan` instrumentation for specific methods. Format is `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`.
{{% /config_option %}}

## Creating spans around methods with `otel.instrumentation.methods.include`

In cases where you are unable to modify the code, you can still configure the
javaagent to capture spans around specific methods.

{{% config_option name="otel.instrumentation.methods.include" %}} Add
instrumentation for specific methods in lieu of `@WithSpan`. Format is
`my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`. {{%
/config_option %}}

If a method is overloaded (appears more than once on the same class with the
same name but different parameters), all versions of the method will be
instrumented.

## Next steps

Beyond the use of annotations, the OpenTelemetry API allows you to obtain a
tracer that can be used for [Manual Instrumentation](../../manual) and execute
code within the scope of that span.
