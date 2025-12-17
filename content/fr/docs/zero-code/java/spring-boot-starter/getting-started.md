---
title: Démarrage rapide
weight: 20
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649 # patched
drifted_from_default: true
cSpell:ignore: springboot
---

{{% alert title="Note" %}}

Vous pouvez également utiliser l'[agent Java](../../agent) pour instrumenter
votre application Spring Boot. Pour les avantages et les inconvénients,
consultez [Instrumentation Java Zero-code](..).

{{% /alert %}}

## Compatibilité {#compatibility}

Le Spring Boot starter OpenTelemetry fonctionne avec Spring Boot 2.6+ et 3.1+,
et les images d'applications natives à Spring Boot. Le dépôt
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)
contient un exemple d'image d'application native à Spring Boot instrumentée à
l'aide du Spring Boot OpenTelemetry starter.

## Gestion des dépendances {#dependency-management}

Une nomenclature
([BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms))
garantit que les versions des dépendances (y compris transitives) sont alignées.

Pour garantir l'alignement des versions sur toutes les dépendances
OpenTelemetry, vous devez importer la nomenclature
`opentelemetry-instrumentation-bom` lors de l'utilisation du starter
OpenTelemetry.

{{% alert title="Note" %}}

Lors de l'utilisation de Maven, importez les nomenclatures OpenTelemetry avant
toute autre dans votre projet. Par exemple, si vous importez la nomenclature
`spring-boot-dependencies`, vous devez la déclarer après les nomenclatures
OpenTelemetry.

Gradle sélectionne la
[dernière version](https://docs.gradle.org/current/userguide/dependency_resolution.html#2_perform_conflict_resolution)
d'une dépendance lorsque plusieurs nomenclatures sont utilisées, donc l'ordre
des nomenclatures n'est pas important.

{{% /alert %}}

L'exemple suivant montre comment importer les nomenclatures OpenTelemetry en
utilisant Maven :

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom</artifactId>
            <version>{{% param vers.instrumentation %}}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Avec Gradle et Spring Boot, vous avez deux façons d'importer une nomenclature.

Vous pouvez utiliser le support natif de Gradle pour les nomenclatures en
ajoutant des `dependencies` :

```kotlin
import org.springframework.boot.gradle.plugin.SpringBootPlugin

plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
}

dependencies {
  implementation(platform(SpringBootPlugin.BOM_COORDINATES))
  implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))
}
```

L'autre façon avec Gradle est d'utiliser le plugin
`io.spring.dependency-management` et d'importer les nomenclatures dans
`dependencyManagement` :

```kotlin
plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
  id("io.spring.dependency-management") version "1.1.0"
}

dependencyManagement {
  imports {
    mavenBom("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}")
  }
}
```

{{% alert title="Note" %}}

Faites attention à ne pas mélanger les différentes manières de configurer les
choses avec Gradle. Par exemple, n'utilisez pas
`implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))`
avec le plugin `io.spring.dependency-management`.

{{% /alert %}}

### Dépendance du starter OpenTelemetry {#opentelemetry-starter-dependency}

Ajoutez la dépendance ci-dessous pour activer le starter OpenTelemetry.

Le starter OpenTelemetry utilise l'autoconfiguration
[Spring Boot](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html).

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter")
```

{{% /tab %}} {{< /tabpane>}}
