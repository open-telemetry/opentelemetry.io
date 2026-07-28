---
title: Autre auto-configuration Spring
weight: 70
default_lang_commit: 2d89b60b2e09d42ba96757b0afdbc31f54a2b0e7
cSpell:ignore: autoconfigurations
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Au lieu d'utiliser le Spring starter OpenTelemetry, vous pouvez utiliser le
Zipkin starter OpenTelemetry.

## Zipkin starter {#zipkin-starter}

Le "OpenTelemetry Zipkin Exporter Starter" est un paquet de démarrage qui inclut
`opentelemetry-api`, `opentelemetry-sdk`, `opentelemetry-extension-annotations`,
`opentelemetry-logging-exporter`, `opentelemetry-spring-boot-autoconfigurations`
et les starters du framework Spring requis pour configurer le traçage distribué.
Il fournit également l'artefact
[opentelemetry-exporters-zipkin](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/zipkin)
et l'autoconfiguration de l'exportateur correspondante.

Si un exportateur est présent dans le classpath lors de l'exécution et qu'un
bean Spring de l'exportateur est manquant dans le contexte de l'application
Spring, un bean d'exportateur est initialisé et ajouté à un simple processeur de
span dans le traceur actif. Pour plus de détails, consultez l'
[implémentation (OpenTelemetryAutoConfiguration.java)](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/OpenTelemetryAutoConfiguration.java).

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-zipkin</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}")
}
```

{{% /tab %}} {{< /tabpane>}}

### Configurations {#configurations}

{{< tabpane text=true >}} {{% tab "Properties" %}}

Active l'exportateur Zipkin (nécessite `ZipkinSpanExporter` dans le classpath) :

```yaml
otel:
  exporter:
    zipkin:
      enabled: true # défaut : true
```

{{% /tab %}} {{% tab "Declarative Configuration" %}}

Avec la [configuration déclarative](../declarative-configuration/),
l'exportateur Zipkin se configure dans le
[schéma standard de configuration déclarative](/docs/languages/sdk-configuration/declarative-configuration/),
sous `tracer_provider.processors` :

```yaml
otel:
  tracer_provider:
    processors:
      - batch:
          exporter:
            zipkin:
              endpoint: http://localhost:9411/api/v2/spans
```

{{% /tab %}} {{< /tabpane >}}
