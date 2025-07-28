---
title: Étendre les instrumentations avec l'API
linkTitle: Étendre avec l'API
description:
  Utilisez l'API OpenTelemetry en combinaison avec l'agent Java pour étendre la
  télémétrie générée automatiquement avec des spans et métriques personnalisés
weight: 21
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
---

## Introduction {#introduction}

En plus de l'instrumentation prête à l'emploi, vous pouvez étendre l'agent Java
avec une instrumentation manuelle personnalisée en utilisant l'API
OpenTelemetry. Cela vous permet de créer des
[spans](/docs/concepts/signals/traces/#spans) et des
[métriques](/docs/concepts/signals/metrics) pour votre propre code sans faire
trop de changements de code.

## Dépendances {#dependencies}

Ajoutez une dépendance à la bibliothèque `opentelemetry-api`.

### Maven {#maven}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

### Gradle {#gradle}

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}')
}
```

## OpenTelemetry {#opentelemetry}

L'agent Java est un cas particulier où `GlobalOpenTelemetry` est défini par l'
agent. Appelez simplement `GlobalOpenTelemetry.get()` pour accéder à l'instance
`OpenTelemetry`.

## Span {#span}

{{% alert title="Note" %}}

Pour les cas d'usage les plus courants, utilisez l'annotation `@WithSpan` au
lieu de l'instrumentation manuelle. Consultez [Annotations](../annotations) pour
plus d'informations.

{{% /alert %}}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

Tracer tracer = GlobalOpenTelemetry.getTracer("application");
```

Utilisez le `Tracer` pour créer un span comme expliqué dans la section
[Span](/docs/languages/java/api/#span).

Un exemple complet peut être trouvé dans le [dépôt d'exemples].

## Meter {#meter}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

Meter meter = GlobalOpenTelemetry.getMeter("application");
```

Utilisez le `Meter` pour créer un compteur, une jauge ou un histogramme comme
expliqué dans la section [Meter](/docs/languages/java/api/#meter).

Un exemple complet peut être trouvé dans le [dépôt d'exemples].

[dépôt d'exemples]:
  https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent
