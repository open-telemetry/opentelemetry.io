---
title: Annotations
weight: 50
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Pour la plupart des utilisateurs, l'instrumentation prête à l'emploi est
suffisante et rien de plus n'a besoin d'être fait. Cependant, parfois, les
utilisateurs souhaitent créer des [spans](/docs/concepts/signals/traces/#spans)
pour leur propre code personnalisé sans avoir besoin de faire beaucoup de
changements de code.

Si vous ajoutez l'annotation `WithSpan` à une méthode, la méthode est enveloppée
dans un span. L'annotation `SpanAttribute` vous permet de capturer les arguments
de la méthode comme attributs.

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

{{% alert title="Note" %}} Les annotations OpenTelemetry utilisent Spring AOP
basé sur des proxys.

Ces annotations ne fonctionnent que pour les méthodes du proxy. Vous pouvez en
apprendre plus dans la
[documentation Spring](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html).

Dans l'exemple suivant, l'annotation `WithSpan` ne fera rien lorsque le point de
terminaison GET est appelé :

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

Pour pouvoir utiliser les annotations OpenTelemetry, vous devez ajouter la
dépendance Spring Boot Starter AOP à votre projet :

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

Vous pouvez désactiver les annotations OpenTelemetry en définissant la propriété
`otel.instrumentation.annotations.enabled` à `false`.

Vous pouvez personnaliser le span en utilisant les éléments de l'annotation
`WithSpan` :

| Nom     | Type       | Description          | Valeur par défaut   |
| ------- | ---------- | -------------------- | ------------------- |
| `value` | `String`   | Nom du span          | ClassName.Method    |
| `kind`  | `SpanKind` | Type de span du span | `SpanKind.INTERNAL` |

Vous pouvez définir le nom de l'attribut à partir de l'élément `value` de
l'annotation `SpanAttribute` :

| Nom     | Type     | Description       | Valeur par défaut              |
| ------- | -------- | ----------------- | ------------------------------ |
| `value` | `String` | Nom de l'attribut | Nom du paramètre de la méthode |

## Prochaines étapes {#next-steps}

Au-delà de l'utilisation d'annotations, l'API OpenTelemetry vous permet
d'obtenir un traceur qui peut être utilisé pour
[l'instrumentation personnalisée](../api).
