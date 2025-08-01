---
title: Configuration du SDK
weight: 30
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: customizer distro
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Ce Spring Starter supporte les
[métadonnées de configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html),
ce qui signifie que vous pouvez voir et autocompléter toutes les propriétés
disponibles, depuis votre IDE.

## Configuration générale {#general-configuration}

L'OpenTelemetry Starter supporte toute l'
[autoconfiguration du SDK](/docs/zero-code/java/agent/configuration/#sdk-configuration)
(depuis la version 2.2.0).

Vous pouvez mettre à jour la configuration à l'aide de propriétés dans le
fichier `application.properties` ou `application.yaml`, ou avec des variables
d'environnement.

Exemple `application.properties` :

```properties
otel.propagators=tracecontext,b3
otel.resource.attributes.deployment.environment=dev
otel.resource.attributes.service.name=cart
otel.resource.attributes.service.namespace=shop
```

Exemple `application.yaml` :

```yaml
otel:
  propagators:
    - tracecontext
    - b3
  resource:
    attributes:
      deployment.environment: dev
      service:
        name: cart
        namespace: shop
```

Exemple de variables d'environnement :

```shell
export OTEL_PROPAGATORS="tracecontext,b3"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=dev,service.name=cart,service.namespace=shop"
```

## Surcharge des attributs de ressource {#overriding-resource-attributes}

Comme d'habitude dans Spring Boot, vous pouvez surcharger les propriétés dans
les fichiers `application.properties` et `application.yaml` avec des variables
d'environnement.

Par exemple, vous pouvez définir ou surcharger l'attribut de ressource
`deployment.environment` (sans changer `service.name` ou `service.namespace`) en
définissant la variable d'environnement standard `OTEL_RESOURCE_ATTRIBUTES` :

```shell
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=prod"
```

Alternativement, vous pouvez utiliser la variable d'environnement
`OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT` pour définir ou surcharger un
seul attribut de ressource :

```shell
export OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT="prod"
```

La deuxième option est d'utiliser les expressions
[SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html).

Notez que `DEPLOYMENT_ENVIRONMENT` est converti en `deployment.environment` par
la liaison
[Relaxed Binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables)
de Spring Boot.

## Désactiver le OpenTelemetry Starter {#disable-the-opentelemetry-starter}

{{% config_option name="otel.sdk.disabled" %}}

Définissez la valeur à `true` pour désactiver le starter, par exemple à des fins
de test.

{{% /config_option %}}

## Configuration programmatique {#programmatic-configuration}

Vous pouvez utiliser le `AutoConfigurationCustomizerProvider` pour la
configuration programmatique. La configuration programmatique est recommandée
pour les cas d'utilisation avancés, qui ne sont pas configurables à l'aide de
propriétés.

### Exclure les traces des les points de terminaison de l'actuateur {#exclude-actuator-endpoints-from-tracing}

Par exemple, vous pouvez personnaliser l'échantillonneur pour exclure les traces
des points de terminaison de vérification de la disponibilité :

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.contrib</groupId>
    <artifactId>opentelemetry-samplers</artifactId>
    <version>1.33.0-alpha</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry.contrib:opentelemetry-samplers:1.33.0-alpha")
}
```

{{% /tab %}} {{< /tabpane>}}

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/FilterPaths.java"?>
```java
package otel;

import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.contrib.sampler.RuleBasedRoutingSampler;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import io.opentelemetry.semconv.UrlAttributes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterPaths {

  @Bean
  public AutoConfigurationCustomizerProvider otelCustomizer() {
    return p ->
        p.addSamplerCustomizer(
            (fallback, config) ->
                RuleBasedRoutingSampler.builder(SpanKind.SERVER, fallback)
                    .drop(UrlAttributes.URL_PATH, "^/actuator")
                    .build());
  }
}
```
<!-- prettier-ignore-end -->

### Configurer programmatiquement l'exportateur {#configure-the-exporter-programmatically}

Vous pouvez également configurer programmatiquement les exportateurs OTLP. Cette
configuration remplace l'exportateur OTLP par défaut et ajoute un en-tête
personnalisé aux requêtes.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomAuth.java"?>
```java
package otel;

import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CustomAuth {
  @Bean
  public AutoConfigurationCustomizerProvider otelCustomizer() {
    return p ->
        p.addSpanExporterCustomizer(
            (exporter, config) -> {
              if (exporter instanceof OtlpHttpSpanExporter) {
                return ((OtlpHttpSpanExporter) exporter)
                    .toBuilder().setHeaders(this::headers).build();
              }
              return exporter;
            });
  }

  private Map<String, String> headers() {
    return Collections.singletonMap("Authorization", "Bearer " + refreshToken());
  }

  private String refreshToken() {
    // par exemple, lire le jeton d'un secret kubernetes
    return "token";
  }
}
```
<!-- prettier-ignore-end -->

## Fournisseurs de ressources {#resource-providers}

L'OpenTelemetry Starter inclut les mêmes fournisseurs de ressources que l'agent
Java :

- [Fournisseurs de ressources communs](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [Fournisseurs de ressources désactivés par défaut](/docs/zero-code/java/agent/configuration/#enable-resource-providers-that-are-disabled-by-default)

De plus, l'OpenTelemetry Starter inclut les fournisseurs de ressources
spécifiques à Spring Boot suivants :

### Fournisseur de ressources de distribution {#distribution-resource-provider}

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| Attribut                   | Valeur                              |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | version du starter                  |

### Fournisseur de ressources Spring {#spring-resource-provider}

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| Attribut          | Valeur                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name` ou `build.name` de `build-info.properties` (voir [Nom du service](#service-name)) |
| `service.version` | `build.version` de `build-info.properties`                                                                  |

## Nom du service {#service-name}

En utilisant ces fournisseurs de ressources, le nom du service est déterminé par
les règles de précédence suivantes, conformément à la
[spécification](/docs/languages/sdk-configuration/general/#otel_service_name)
OpenTelemetry :

1. Propriété spring `otel.service.name` ou variable d'environnement
   `OTEL_SERVICE_NAME` (plus haute précédence)
2. `service.name` dans la propriété système/spring `otel.resource.attributes` ou
   la variable d'environnement `OTEL_RESOURCE_ATTRIBUTES`
3. Propriété spring `spring.application.name`
4. `build-info.properties`
5. `Implementation-Title` de META-INF/MANIFEST.MF
6. La valeur par défaut est `unknown_service:java` (plus basse précédence)

Utilisez l'extrait suivant dans votre fichier pom.xml pour générer le fichier
`build-info.properties` :

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<build>
    <finalName>${project.artifactId}</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>build-info</goal>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
springBoot {
  buildInfo {
  }
}
```

{{% /tab %}} {{< /tabpane>}}
