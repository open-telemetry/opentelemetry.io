---
title: Анотації
weight: 50
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Для більшості користувачів вбудована інструменталізація є цілком достатньою і нічого більше не потрібно робити. Однак іноді користувачі бажають створювати [відрізки](/docs/concepts/signals/traces/#spans) для свого власного коду без необхідності вносити багато змін у код.

Якщо додати анотацію `WithSpan` до методу, метод буде обгорнутий у відрізок. Анотація `SpanAttribute` дозволяє захоплювати аргументи методу як атрибути.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/TracedClass.java"?>
```java
package otel;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;
import org.springframework.stereotype.Component;

/** Тест WithSpan */
@Component
public class TracedClass {

  @WithSpan
  public void tracedMethod() {}

  @WithSpan(value = "назва спану")
  public void tracedMethodWithName() {
    Span currentSpan = Span.current();
    currentSpan.addEvent("ДОДАТИ ПОДІЮ ДО tracedMethodWithName SPAN");
    currentSpan.setAttribute("isTestAttribute", true);
  }

  @WithSpan(kind = SpanKind.CLIENT)
  public void tracedClientSpan() {}

  @WithSpan
  public void tracedMethodWithAttribute(@SpanAttribute("attributeName") String parameter) {}
}
```
<!-- prettier-ignore-end -->

> [!NOTE]
>
> Анотації OpenTelemetry використовують Spring AOP на основі проксі.
>
> Ці анотації працюють лише для методів проксі. Ви можете дізнатися більше у [документації Spring](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html).
>
> У наступному прикладі анотація `WithSpan` не буде нічого робити, коли викликається GET-точка доступу:
>
> ```java
> @RestController
> public class MyControllerManagedBySpring {
>
>     @GetMapping("/ping")
>     public void aMethod() {
>         anotherMethod();
>     }
>
>     @WithSpan
>     public void anotherMethod() {
>     }
> }
> ```

{{% alert data-why="Using shortcode syntax because of tab panes" title="Примітка" %}}

Щоб мати можливість використовувати анотації OpenTelemetry, вам потрібно додати залежність Spring Boot Starter AOP до вашого проєкту:

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

Ви можете вимкнути анотації OpenTelemetry, встановивши властивість `otel.instrumentation.annotations.enabled` у `false`.

Ви можете налаштувати відрізок, використовуючи елементи анотації `WithSpan`:

| Назва   | Тип        | Опис           | Стандартне значення |
| ------- | ---------- | -------------- | ------------------- |
| `value` | `String`   | Назва відрізку | ClassName.Method    |
| `kind`  | `SpanKind` | Тип відрізку   | `SpanKind.INTERNAL` |

Ви можете встановити назву атрибута за допомогою елемента `value` анотації `SpanAttribute`:

| Назва   | Тип      | Опис           | Стандартне значення    |
| ------- | -------- | -------------- | ---------------------- |
| `value` | `String` | Назва атрибута | Назва параметра методу |

## Наступні кроки {#next-steps}

Окрім використання анотацій, OpenTelemetry API дозволяє отримати трасувальник, який може бути використаний [вашим власним інструментарієм](../api).
