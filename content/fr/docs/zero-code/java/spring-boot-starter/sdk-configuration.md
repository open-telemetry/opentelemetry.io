---
title: Configuration du SDK
weight: 30
default_lang_commit: 2d89b60b2e09d42ba96757b0afdbc31f54a2b0e7
cSpell:ignore: distro
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

{{< tabpane text=true >}} {{% tab "Properties" %}}

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

{{% /tab %}} {{% tab "Declarative Configuration" %}}

Les réglages au niveau du SDK (ressources, propagateurs, exportateurs) utilisent
le
[schéma standard de configuration déclarative](/docs/languages/sdk-configuration/declarative-configuration/)
directement dans `application.yaml`. Les propriétés système et les variables
d'environnement continuent de fonctionner pour surcharger des valeurs — voir
[Surcharges par variables d'environnement](../declarative-configuration/#environment-variable-overrides).

```yaml
otel:
  file_format: '1.0'

  resource:
    attributes:
      - name: deployment.environment
        value: dev
      - name: service.name
        value: cart
      - name: service.namespace
        value: shop

  propagator:
    composite:
      - tracecontext:
      - b3:
```

{{% /tab %}} {{< /tabpane >}}

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

{{< tabpane text=true >}} {{% tab "Properties" %}}

Définissez `otel.sdk.disabled` à `true` pour désactiver le starter, par exemple
à des fins de test :

```yaml
otel:
  sdk:
    disabled: true
```

{{% /tab %}} {{% tab "Declarative Configuration" %}}

Définissez `otel.disabled` à `true` pour désactiver le starter, par exemple à
des fins de test.

Note : avec la
[configuration déclarative](../declarative-configuration/), le nom de la
propriété est `otel.disabled`, et non `otel.sdk.disabled`.

```yaml
otel:
  file_format: '1.0'
  disabled: true
```

{{% /tab %}} {{< /tabpane >}}

## Configuration programmatique {#programmatic-configuration}

Voir [Configuration programmatique](../programmatic-configuration/).

## Fournisseurs de ressources {#resource-providers}

{{< tabpane text=true >}} {{% tab "Properties" %}}

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

{{% /tab %}} {{% tab "Declarative Configuration" %}}

Avec la [configuration déclarative](../declarative-configuration/), les
fournisseurs de ressources se configurent explicitement comme des détecteurs,
sous `resource.detection/development.detectors`. Seuls les détecteurs listés
sont actifs — rien n'est découvert automatiquement via SPI.

```yaml
otel:
  resource:
    detection/development:
      detectors:
        - container: # container.id
        - host: # host.name, host.arch
        - host_id: # host.id
        - os: # os.type, os.description
        - process: # process.pid, process.executable.path, process.command_line
        - process_runtime: # process.runtime.name/version/description
        - service: # service.name, service.instance.id
        - spring: # service.name (depuis spring.application.name), service.version (depuis build-info)
```

Les attributs `telemetry.distro.name` et `telemetry.distro.version` sont
toujours ajoutés automatiquement par le starter, à des fins de dépannage.

{{% /tab %}} {{< /tabpane >}}

## Nom du service {#service-name}

En utilisant ces fournisseurs de ressources, le nom du service est déterminé par
les règles de précédence suivantes, conformément à la
[spécification](/docs/languages/sdk-configuration/general/#otel_service_name)
OpenTelemetry :

{{< tabpane text=true >}} {{% tab "Properties" %}}

1. Propriété spring `otel.service.name` ou variable d'environnement
   `OTEL_SERVICE_NAME` (plus haute précédence)
2. `service.name` dans la propriété système/spring `otel.resource.attributes` ou
   la variable d'environnement `OTEL_RESOURCE_ATTRIBUTES`
3. Propriété spring `spring.application.name`
4. `build-info.properties`
5. `Implementation-Title` de META-INF/MANIFEST.MF
6. La valeur par défaut est `unknown_service:java` (plus basse précédence)

{{% /tab %}} {{% tab "Declarative Configuration" %}}

Le nom du service dépend des détecteurs de ressources que vous incluez (voir
[Fournisseurs de ressources](#resource-providers)) :

1. `service.name` dans `otel.resource.attributes` (plus haute précédence) :

   ```yaml
   otel:
     resource:
       attributes:
         - name: service.name
           value: my-spring-app
   ```

2. Le détecteur `service` — s'il est inclus, détecte automatiquement depuis
   `OTEL_SERVICE_NAME` :

   ```yaml
   otel:
     resource:
       detection/development:
         detectors:
           - service:
   ```

3. Le détecteur `spring` — s'il est inclus, détecte depuis
   `spring.application.name` et `build-info.properties` :

   ```yaml
   otel:
     resource:
       detection/development:
         detectors:
           - spring:
   ```

4. La valeur par défaut est `unknown_service:java` (plus basse précédence)

{{% /tab %}} {{< /tabpane >}}

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
