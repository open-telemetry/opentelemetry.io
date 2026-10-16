---
title: Primeros pasos
weight: 20
default_lang_commit: f304b22c356b4ad4046b8ce5550ddf503a510d69
cSpell:ignore: autoconfiguración springboot
---

> [!NOTE]
>
> También puedes usar el [agente de Java](../../agent) para instrumentar tu
> aplicación Spring Boot. Para conocer las ventajas y desventajas de cada
> opción, consulta [Instrumentación sin código para Java](..).

## Compatibilidad {#compatibility}

El _starter_ de OpenTelemetry para Spring Boot funciona con Spring Boot 2.6+ y
3.1+, y con aplicaciones Spring Boot compiladas como imagen nativa. El
repositorio
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)
contiene un ejemplo de una aplicación Spring Boot con imagen nativa
instrumentada con el _starter_ de OpenTelemetry para Spring Boot.

## Gestión de dependencias {#dependency-management}

Un _Bill of Materials_
([BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms))
garantiza que las versiones de las dependencias (incluidas las transitivas)
estén alineadas.

Para asegurar que las versiones de todas las dependencias de OpenTelemetry estén
alineadas, debes importar el BOM `opentelemetry-instrumentation-bom` cuando uses
el _starter_ de OpenTelemetry.

> [!NOTE]
>
> Si usas Maven, importa los BOMs de OpenTelemetry antes que cualquier otro BOM
> de tu proyecto. Por ejemplo, si importas el BOM `spring-boot-dependencies`,
> debes declararlo después de los BOMs de OpenTelemetry.
>
> Gradle selecciona la
> [versión más reciente](https://docs.gradle.org/current/userguide/dependency_constraints_conflicts.html#sub:resolving-version-conflicts)
> de una dependencia cuando varios BOMs la definen, por lo que el orden de los
> BOMs no importa.

El siguiente ejemplo muestra cómo importar los BOMs de OpenTelemetry con Maven:

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

Con Gradle y Spring Boot, tienes dos formas de importar un BOM.

Puedes usar el soporte nativo de BOMs de Gradle añadiendo `dependencies`:

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

La otra forma con Gradle es usar el _plugin_ `io.spring.dependency-management` e
importar los BOMs en `dependencyManagement`:

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

> [!NOTE]
>
> Ten cuidado de no mezclar las distintas formas de configurar Gradle. Por
> ejemplo, no uses
> `implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))`
> junto con el _plugin_ `io.spring.dependency-management`.

### Dependencia del _starter_ de OpenTelemetry {#opentelemetry-starter-dependency}

Añade la siguiente dependencia para habilitar el _starter_ de OpenTelemetry.

El _starter_ de OpenTelemetry usa la
[autoconfiguración](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)
de Spring Boot.

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
