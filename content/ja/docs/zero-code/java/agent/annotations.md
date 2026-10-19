---
title: アノテーション
description: Java エージェントで計装アノテーションを使用する。
aliases: [/docs/instrumentation/java/annotations]
weight: 20
default_lang_commit: a3833f515c4dbb7f22deeab950b60af22a7f3384
cSpell:ignore: Flowable javac reactivestreams reactivex
---

ほとんどのユーザーにとって、デフォルトの計装で十分であり、追加の作業は必要ありません。
しかし、コードをほとんど変更せずに、独自のカスタムコードに対して[スパン](/docs/concepts/signals/traces/#spans)を作成したい場合もあります。
`WithSpan` と `SpanAttribute` アノテーションはこのようなユースケースをサポートします。

## 依存関係 {#dependencies}

`@WithSpan` アノテーションを使用するには、`opentelemetry-instrumentation-annotations` ライブラリへの依存関係を追加する必要があります。

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

### Gradle

```groovy
dependencies {
    implementation('io.opentelemetry.instrumentation:opentelemetry-instrumentation-annotations:{{% param vers.instrumentation %}}')
}
```

{{% /tab %}} {{< /tabpane >}}

## `@WithSpan` でメソッドにスパンを作成する {#creating-spans-around-methods-with-withspan}

特定のメソッドを計装する[スパン](/docs/concepts/signals/traces/#spans)を作成するには、メソッドに `@WithSpan` アノテーションを付けます。

```java
import io.opentelemetry.instrumentation.annotations.WithSpan;

public class MyClass {
  @WithSpan
  public void myMethod() {
      <...>
  }
}
```

アプリケーションがアノテーション付きのメソッドを呼び出すたびに、その実行時間を示し、スローされた例外を記録するスパンが作成されます。
デフォルトでは、スパン名は `<className>.<methodName>` になりますが、`value` アノテーションパラメーターで名前を指定することもできます。

`@WithSpan` でアノテーションされたメソッドの戻り値の型が、以下に示す [future またはPromise に類似した](https://en.wikipedia.org/wiki/Futures_and_promises)型のいずれかである場合、スパンは future が完了するまで終了しません。

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

### パラメーター {#parameters}

`@WithSpan` 属性はスパンのカスタマイズのために以下のオプションパラメーターをサポートしています。

| 名前             | 型                | デフォルト | 説明                                                                                                                                     |
| ---------------- | ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `value`          | `String`          | `""`       | スパン名。指定しない場合、デフォルトの `<className>.<methodName>` が使用されます。                                                       |
| `kind`           | `SpanKind` (enum) | `INTERNAL` | [スパンの種類](/docs/specs/otel/trace/api/#spankind)。                                                                                   |
| `inheritContext` | `boolean`         | `true`     | 2.14.0以降。新しいスパンが既存の（現在の）コンテキストの子になるかどうかを制御します。`false` の場合、新しいコンテキストが作成されます。 |

パラメーターの使用例：

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

## `@SpanAttribute` でスパンに属性を追加する {#adding-attributes-to-the-span-with-spanattribute}

アノテーション付きのメソッドに対して[スパン](/docs/concepts/signals/traces/#spans)が作成される際、メソッド呼び出しの引数の値を、作成されたスパンの[属性](/docs/concepts/signals/traces/#attributes)として自動的に追加できます。
メソッドのパラメーターに `@SpanAttribute` アノテーションを付けるだけです。

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

アノテーションの引数として指定しない場合、属性名は `-parameters` オプションを `javac` コンパイラーに渡して `.class` ファイルにコンパイルされた仮パラメーター名から導出されます。

## `@WithSpan` 計装の抑制 {#suppressing-withspan-instrumentation}

`@WithSpan` の抑制は、`@WithSpan` で過剰に計装されたコードがあり、コードを変更せずに一部を抑制したい場合に便利です。

{{% config_option
  name="otel.instrumentation.opentelemetry-instrumentation-annotations.exclude-methods" %}} 特定のメソッドに対する `@WithSpan` 計装を抑制します。
形式は `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]` です。
{{% /config_option %}}

## `otel.instrumentation.methods.include` でメソッドにスパンを作成する {#creating-spans-around-methods-with-otelinstrumentationmethodsinclude}

コードを変更できない場合でも、特定のメソッドにスパンをキャプチャするように Java エージェントを設定できます。

{{% config_option name="otel.instrumentation.methods.include" %}} `@WithSpan` のかわりに特定のメソッドに計装を追加します。
形式は `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]` です。
{{% /config_option %}}

メソッドがオーバーロードされている場合（同じクラスに同じ名前で異なるパラメーターを持つメソッドが複数存在する場合）、そのメソッドのすべてのバージョンが計装されます。

## 次のステップ {#next-steps}

アノテーションの使用に加えて、OpenTelemetry API を使用すると、[カスタム計装](../api)に使えるトレーサーを取得できます。
