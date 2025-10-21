---
title: 注解
description: 结合 Java 代理使用插桩注解。
default_lang_commit: 115477dad3237f21d1ee15052e8cb3c56bd14819
aliases: [/docs/instrumentation/java/annotations]
weight: 20
cSpell:ignore: Flowable javac reactivestreams reactivex
---

对于大多数用户而言，开箱即用的插桩功能已经完全足够，无需进行额外操作。
不过，有时用户希望为自己的自定义代码创建 [Span](/docs/concepts/signals/traces/#spans)，同时又不想对代码做太多改动。
`WithSpan` 和 `SpanAttribute` 注解可满足这些使用场景。

## 依赖项 {#dependencies}

要使用 `@WithSpan` 注解，你需要添加对 `opentelemetry-instrumentation-annotations` 库的依赖。

{{< tabpane text=true >}} {{% tab "Maven" %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-instrumentation-annotations</artifactId>
    <version>{{% param vers.instrumentation %}}</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab "Gradle" %}}

### Gradle {#gradle}

```groovy
dependencies {
    implementation('io.opentelemetry.instrumentation:opentelemetry-instrumentation-annotations:{{% param vers.instrumentation %}}')
}
```

{{% /tab %}} {{< /tabpane >}}

## 使用 `@WithSpan` 在方法周围创建 Span {#creating-spans-around-methods-with-withspan}

要为特定方法创建用于插桩的 [Span](/docs/concepts/signals/traces/#spans)，可使用 `@WithSpan` 对该方法进行注解。

```java
import io.opentelemetry.instrumentation.annotations.WithSpan;

public class MyClass {
  @WithSpan
  public void myMethod() {
      <...>
  }
}
```

每当应用程序调用带有该注解的方法时，都会创建一个 Span 来记录方法的执行时长并捕获所有抛出的异常。
默认情况下，Span 名称为 `<类名>.< 方法名 >`，除非通过 `value` 注解参数指定了名称。

如果被 `@WithSpan` 注解的方法的返回类型是以下列出的[类 Future 或 类Promise](https://en.wikipedia.org/wiki/Futures_and_promises)，
那么该 Span 将在 Future 完成后才会结束。

- [java.util.concurrent.CompletableFuture](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html)
- [java.util.concurrent.CompletionStage](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletionStage.html)
- [com.google.common.util.concurrent.ListenableFuture](https://guava.dev/releases/10.0/api/docs/com/google/common/util/concurrent/ListenableFuture.html)
- [org.reactivestreams.Publisher](https://www.reactive-streams.org/reactive-streams-1.0.1-javadoc/org/reactivestreams/Publisher.html)
- [reactor.core.publisher.Mono](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html)
- [reactor.core.publisher.Flux](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html)
- [io.reactivex.Completable](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Completable.html)
- [io.reactivex.Maybe](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Maybe.html)
- [io.reactivex.Single](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Single.html)
- [io.reactivex.Observable](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Observable.html)
- [io.reactivex.Flowable](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/Flowable.html)
- [io.reactivex.parallel.ParallelFlowable](https://reactivex.io/RxJava/2.x/javadoc/index.html?io/reactivex/parallel/ParallelFlowable.html)

### 参数 {#parameters}

`@WithSpan` 注解支持以下可选参数，用于对 Span 进行自定义：

| 名称             | 类型              | 默认值     | 描述                                                                                                         |
| ---------------- | ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `value`          | `String`          | `""`       | Span 名称。如果未指定，则使用默认的 `<类名>.<方法名>`。                                                      |
| `kind`           | `SpanKind` (enum) | `INTERNAL` | [Span 的类型](/docs/specs/otel/trace/api/#spankind)。                                                        |
| `inheritContext` | `boolean`         | `true`     | 自 2.14.0 起。控制新生成的 Span 是否会在现有（当前）上下文中被继承。如果为 `false`，则会创建一个新的上下文。 |

参数使用示例：

```java
@WithSpan(kind = SpanKind.CLIENT, inheritContext = false, value = "my span name")
public void myMethod() {
    <...>
}

@WithSpan("my span name")
public void myOtherMethod() {
    <...>
}
```

## 使用 `@SpanAttribute` 为 Span 添加属性 {#adding-attributes-to-the-span-with-spanattribute}

当为带有注解的方法创建 [Span](/docs/concepts/signals/traces/#spans) 时，
方法调用的参数值可以自动作为[属性](/docs/concepts/signals/traces/#attributes)添加到所创建的 Span 中。
只需在方法参数上添加 `@SpanAttribute` 注解即可：

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

除非在注解中指定参数名，否则属性名将从形参名派生，
前提是通过向 `javac` 编译器传递 `-parameters` 选项将形式参数名称编译到 `.class` 文件中。

## 禁用 `@WithSpan` 插桩 {#suppressing-withspan-instrumentation}

如果某些代码通过 `@WithSpan` 进行了过度插桩，而你希望在不修改代码的情况下禁用其中一部分，
那么禁用 @WithSpan 就会非常有用。

{{% config_option
  name="otel.instrumentation.opentelemetry-instrumentation-annotations.exclude-methods" %}}
禁用特定方法的 `@WithSpan` 插桩。
格式为 `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`。
{{% /config_option %}}

## 使用 `otel.instrumentation.methods.include` 在方法周围创建 Span {#creating-spans-around-methods-with-otelinstrumentationmethodsinclude}

在无法修改代码的情况下，你仍然可以配置 Java 代理以捕获特定方法的 Span。

{{% config_option name="otel.instrumentation.methods.include" %}}
添加对特定方法的插桩，以替代 `@WithSpan`。
格式为 `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`。
{{% /config_option %}}

如果一个方法被重载（在同一个类中出现多次，名称相同但参数不同），那么该方法的所有版本都会被插桩。

## 下一步操作 {#next-steps}

除了使用注解之外，OpenTelemetry API 还允许你获取一个追踪器（tracer），
该追踪器可用于[自定义插桩](../api)。
