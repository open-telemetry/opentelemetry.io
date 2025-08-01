---
title: Étendre les instrumentations avec l'API
linkTitle: Étendre avec l'API
description:
  Utilisez l'API OpenTelemetry en combinaison avec le Spring Boot starter pour
  étendre la télémétrie générée automatiquement avec des spans et des métriques
  personnalisés
weight: 21
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
---

## Introduction {#introduction}

En plus de l'instrumentation prête à l'emploi, vous pouvez étendre le Spring
Boot starter avec une instrumentation manuelle personnalisée en utilisant l'API
OpenTelemetry. Cela vous permet de créer des
[spans](/docs/concepts/signals/traces/#spans) et des
[métriques](/docs/concepts/signals/metrics) pour votre propre code sans faire
trop de changements de code.

Les dépendances requises sont déjà incluses dans le starter Spring Boot.

## OpenTelemetry {#opentelemetry}

Le Spring Boot starter est un cas particulier où `OpenTelemetry` est disponible
en tant que Beans Spring Boot. Injectez simplement `OpenTelemetry` dans vos
composants Spring.

## Span {#span}

{{% alert title="Note" %}}

Pour les cas d'usage les plus courants, utilisez l'annotation `@WithSpan` au
lieu de l'instrumentation manuelle. Consultez [Annotations](../annotations) pour
plus d'informations.

{{% /alert %}}

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

@Controller
public class MyController {
  private final Tracer tracer;

  public MyController(OpenTelemetry openTelemetry) {
    this.tracer = openTelemetry.getTracer("application");
  }
}
```

Utilisez le `Tracer` pour créer un span comme expliqué dans la section
[Span](/docs/languages/java/api/#span).

Un exemple complet peut être trouvé dans le [dépôt d'exemples].

## Meter {#meter}

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

@Controller
public class MyController {
  private final Meter meter;

  public MyController(OpenTelemetry openTelemetry) {
    this.meter = openTelemetry.getMeter("application");
  }
}
```

Utilisez le `Meter` pour créer un compteur, une jauge ou un histogramme comme
expliqué dans la section [Meter](/docs/languages/java/api/#meter).

Un exemple complet peut être trouvé dans le [dépôt d'exemples].

[dépôt d'exemples]:
  https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native
