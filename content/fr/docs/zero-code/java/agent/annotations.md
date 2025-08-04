---
title: Annotations
description: Utilisation des annotations d'instrumentation avec un agent Java.
aliases: [/docs/instrumentation/java/annotations]
weight: 20
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: Flowable javac reactivestreams reactivex
---

Pour la plupart des utilisateurs, l'instrumentation fournie par défaut est
complètement suffisante et rien de plus n'a besoin d'être fait. Parfois,
cependant, les utilisateurs souhaitent créer des
[spans](/docs/concepts/signals/traces/#spans) pour leur propre code sans avoir à
changer beaucoup de code. Les annotations `WithSpan` et `SpanAttribute`
supportent ces cas d'usage.

## Dépendances {#dependencies}

Vous devrez ajouter une dépendance à `opentelemetry-instrumentation-annotations`
pour utiliser l'annotation `@WithSpan`.

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

## Créer des spans autour de méthodes avec `@WithSpan` {#creating-spans-around-methods-with-withspan}

Pour créer un [span](/docs/concepts/signals/traces/#spans) qui instrumente une
méthode particulière, annotez la méthode avec `@WithSpan`.

```java
import io.opentelemetry.instrumentation.annotations.WithSpan;

public class MyClass {
  @WithSpan
  public void myMethod() {
      <...>
  }
}
```

Chaque fois que l'application invoque la méthode annotée, elle crée un span qui
indique sa durée et fournit toutes les exceptions levées. Par défaut, le nom du
span sera `<className>.<methodName>`, sauf si un nom est fourni via le paramètre
d'annotation `value`.

Si le type de retour de la méthode annotée par `@WithSpan` est l'un des types
[future ou promise](https://en.wikipedia.org/wiki/Futures_and_promises) listés
ci-dessous, alors le span ne sera pas terminé jusqu'à ce que le future se
termine.

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

### Paramètres {#parameters}

L'attribut `@WithSpan` supporte les paramètres optionnels suivants pour
permettre la personnalisation des spans :

| nom              | type              | défaut     | description                                                                                                                                 |
| ---------------- | ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`          | `String`          | `""`       | Le nom du span. Si non spécifié, le défaut `<className>.<methodName>` est utilisé.                                                          |
| `kind`           | `SpanKind` (enum) | `INTERNAL` | Le [type de span](/docs/specs/otel/trace/api/#spankind).                                                                                    |
| `inheritContext` | `boolean`         | `true`     | Depuis 2.14.0. Contrôle si le nouveau span sera ou non parent dans le contexte existant (actuel). Si `false`, un nouveau contexte est créé. |

Exemple d'utilisation des paramètres :

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

## Ajouter des attributs au span avec `@SpanAttribute` {#adding-attributes-to-the-span-with-spanattribute}

Quand un [span](/docs/concepts/signals/traces/#spans) est créé pour une méthode
annotée, les valeurs des arguments de l'invocation de méthode peuvent être
automatiquement ajoutées comme
[attributs](/docs/concepts/signals/traces/#attributes) au span créé. Annotez
simplement les paramètres de méthode avec l'annotation `@SpanAttribute` :

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

Sauf si spécifié comme argument de l'annotation, le nom de l'attribut sera
dérivé des noms de paramètres formels s'ils sont compilés dans les fichiers
`.class` en passant l'option `-parameters` au compilateur `javac`.

## Supprimer l'instrumentation `@WithSpan` {#suppressing-withspan-instrumentation}

Supprimer `@WithSpan` est utile si vous avez du code qui est sur-instrumenté en
utilisant `@WithSpan` et que vous voulez en supprimer certains sans modifier le
code.

{{% config_option
  name="otel.instrumentation.opentelemetry-instrumentation-annotations.exclude-methods" %}} Supprimer
l'instrumentation `@WithSpan` pour des méthodes spécifiques. Le format est
`my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`.
{{% /config_option %}}

## Créer des spans autour de méthodes avec `otel.instrumentation.methods.include` {#creating-spans-around-methods-with-otelinstrumentationmethodsinclude}

Dans les cas où vous ne pouvez pas modifier le code, vous pouvez toujours
configurer l'agent Java pour capturer des spans autour de méthodes spécifiques.

{{% config_option name="otel.instrumentation.methods.include" %}} Ajouter
l'instrumentation pour des méthodes spécifiques à la place de `@WithSpan`. Le
format est `my.package.MyClass1[method1,method2];my.package.MyClass2[method3]`.
{{%
/config_option %}}

Si une méthode est surchargée (apparaît plus d'une fois sur la même classe avec
le même nom mais des paramètres différents), toutes les versions de la méthode
seront instrumentées.

## Prochaines étapes {#next-steps}

Au-delà de l'utilisation d'annotations, l'API OpenTelemetry vous permet
d'obtenir un traceur qui peut être utilisé pour
[l'instrumentation personnalisée](../api).
