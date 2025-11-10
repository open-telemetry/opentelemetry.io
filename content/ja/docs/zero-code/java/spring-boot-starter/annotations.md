---
title: アノテーション
weight: 50
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
drifted_from_default: true
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

ほとんどのユーザーにとっては、すぐに使える計装は完全に十分であり、それ以上何もする必要はありません。
しかし時には、ユーザーが多くのコード変更を必要とせずに、独自のカスタムコードに対して[スパン](/docs/concepts/signals/traces/#spans)を作成したい場合があります。

メソッドに`WithSpan`アノテーションを追加すると、そのメソッドはスパンでラップされます。
`SpanAttribute`アノテーションを使用すると、メソッドの引数を属性としてキャプチャできます。

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

  public void tracedMethodWithAttribute(@SpanAttribute("attributeName") String parameter) {}
}
```
<!-- prettier-ignore-end -->

{{% alert title="注意" %}}

OpenTelemetryアノテーションは、プロキシに基づくSpring AOPを使用します。

これらのアノテーションは、プロキシのメソッドに対してのみ機能します。詳細については、[Springドキュメント](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)を参照してください。

次の例では、GETエンドポイントが呼び出されたときに、`WithSpan`アノテーションは何もしません。

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

OpenTelemetryアノテーションを使用できるようにするには、Spring BootスターターのAOP依存関係をプロジェクトに追加する必要があります。

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

`otel.instrumentation.annotations.enabled`プロパティを`false`に設定することで、OpenTelemetryアノテーションを無効にできます。

`WithSpan`アノテーションの要素を使用してスパンをカスタマイズできます。

| 名前    | 型         | 説明         | デフォルト値        |
| ------- | ---------- | ------------ | ------------------- |
| `value` | `String`   | スパン名     | ClassName.Method    |
| `kind`  | `SpanKind` | スパンの種類 | `SpanKind.INTERNAL` |

`SpanAttribute`アノテーションの`value`要素から属性名を設定できます。

| 名前    | 型       | 説明   | デフォルト値         |
| ------- | -------- | ------ | -------------------- |
| `value` | `String` | 属性名 | メソッドパラメータ名 |

## 次のステップ {#next-steps}

アノテーションの使用以外にも、OpenTelemetry APIを使用すると、[カスタム計装](../api)に使用できるトレーサーを取得できます。
