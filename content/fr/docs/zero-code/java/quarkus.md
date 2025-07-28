---
title: Instrumentation Quarkus
linkTitle: Quarkus
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
---

[Quarkus](https://quarkus.io/) est un framework open source conçu pour aider les
développeurs à construire des applications cloud natives efficaces à la fois
avec la JVM et avec les images natives Quarkus.

Quarkus utilise des extensions pour fournir un support optimisé pour une large
gamme de bibliothèques. L'
[extension Quarkus OpenTelemetry](https://quarkus.io/guides/opentelemetry)
fournit :

- Instrumentation prête à l'emploi
- Autoconfiguration du SDK OpenTelemetry, supportant presque toutes les
  propriétés système définies pour le
  [SDK OpenTelemetry](/docs/languages/java/configuration/)
- Exportateur OTLP basé sur [Vert.x](https://vertx.io/)
- Les mêmes instrumentations peuvent être utilisées avec les images natives
  Quarkus, qui ne sont pas supportées par l'agent Java OpenTelemetry.

{{% alert title="Note" color="secondary" %}}

L'instrumentation Quarkus OpenTelemetry est maintenue et supportée par Quarkus.
Pour plus de détails, consultez
[Support communautaire Quarkus](https://quarkus.io/support/).

{{% /alert %}}

Quarkus peut également être instrumenté avec
l'[agent Java OpenTelemetry](../agent/) si vous n'exécutez pas une application
native.

## Démarrage rapide {#getting-started}

Pour activer OpenTelemetry dans votre application Quarkus, ajoutez l'extension
`quarkus-opentelemetry` comme dépendance à votre projet.

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-opentelemetry</artifactId>
</dependency>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
implementation("io.quarkus:quarkus-opentelemetry")
```

{{% /tab %}} {{< /tabpane>}}

Seul les **traces** sont activées par défaut. Pour activer les **métriques** et
les **logs**, ajoutez la configuration suivante à votre fichier
`application.properties` :

```properties
quarkus.otel.metrics.enabled=true
quarkus.otel.logs.enabled=true
```

La journalisation OpenTelemetry est supportée par Quarkus 3.16.0+.

Pour plus de détails concernant ces options de configuration et d'autres,
consultez
[Référence de configuration OpenTelemetry](https://quarkus.io/guides/opentelemetry#configuration-reference).

## En savoir plus {#learn-more}

- [Utilisation d'OpenTelemetry](https://quarkus.io/guides/opentelemetry), une
  référence générale couvrant toutes les
  [options de configuration](https://quarkus.io/guides/opentelemetry#configuration-reference)
- Guides spécifiques aux signaux pour
  - [Traces](https://quarkus.io/guides/opentelemetry-tracing)
  - [Métriques](https://quarkus.io/guides/opentelemetry-metrics)
  - [Logs](https://quarkus.io/guides/opentelemetry-logging)
