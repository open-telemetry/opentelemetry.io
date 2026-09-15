---
title: Introducción a OpenTelemetry Java
description: Introducción al ecosistema de OpenTelemetry Java
weight: 9
default_lang_commit: 4edfbfc2ff38123678ca63eca95de94ede457623
cSpell:ignore: autoconfiguración
---

OpenTelemetry Java es el conjunto de herramientas de observabilidad de
OpenTelemetry para el ecosistema Java. A grandes rasgos, se compone de la API,
el SDK y la instrumentación.

Esta página presenta el ecosistema con una [descripción general](#overview)
conceptual, una guía para [navegar por la documentación](#navigating-the-docs) y
una lista de [repositorios](#repositories) con detalles clave sobre versiones y
artefactos.

## Descripción general {#overview}

La API es un conjunto de clases e interfaces para registrar telemetría en las
señales de observabilidad clave. Admite múltiples implementaciones e incluye de
forma predeterminada una implementación minimalista sin operaciones (no-op) de
bajo consumo y una implementación de referencia del SDK. Está diseñada para que
bibliotecas, frameworks y responsables de aplicaciones que deseen añadir
instrumentación la utilicen como dependencia directa. Ofrece sólidas garantías
de compatibilidad hacia atrás, no tiene dependencias transitivas y es compatible
con Java 8+.

El SDK es la implementación de referencia integrada de la API, que procesa y
exporta la telemetría generada por las llamadas a la API de instrumentación.
Configurar el SDK para que procese y exporte correctamente es un paso esencial
para integrar OpenTelemetry en una aplicación. El SDK ofrece opciones de
autoconfiguración y de configuración programática.

La instrumentación registra telemetría mediante la API. Existen diversas
categorías de instrumentación, entre ellas: agente Java sin código (zero-code),
iniciador de Spring Boot sin código (zero-code), de biblioteca, nativa, manual y
shims.

Para obtener una descripción general independiente del lenguaje, consulta los
[conceptos de OpenTelemetry](/docs/concepts/).

## Navegar por la documentación {#navigating-the-docs}

La documentación de OpenTelemetry Java está organizada de la siguiente manera:

- [Primeros pasos con un ejemplo](../getting-started/): Un ejemplo rápido para
  empezar a trabajar con OpenTelemetry Java, que muestra la integración del
  agente Java de OpenTelemetry en una aplicación web sencilla.
- [Ecosistema de instrumentación](../instrumentation/): Una guía sobre el
  ecosistema de instrumentación de OpenTelemetry Java. Es un recurso clave para
  los desarrolladores de aplicaciones que buscan integrar OpenTelemetry Java en
  sus aplicaciones. Conoce las diferentes categorías de instrumentación y decide
  cuál es la más adecuada para ti.
- [Registrar telemetría con la API](../api/): Una referencia técnica de la API
  de OpenTelemetry, que explora todos los aspectos clave de la API con ejemplos
  de código funcionales. La mayoría de los usuarios utilizarán esta página como
  una enciclopedia, consultando el índice de secciones según sea necesario, en
  lugar de leerla de principio a fin.
- [Gestionar la telemetría con el SDK](../sdk/) Una referencia técnica del SDK
  de OpenTelemetry, que explora todos los puntos de extensión de complementos
  del SDK y la API de configuración programática con ejemplos de código
  funcionales. La mayoría de los usuarios utilizarán esta página como una
  enciclopedia, consultando el índice de secciones según sea necesario, en lugar
  de leerla de principio a fin.
- [Configurar el SDK](../configuration/): Una referencia técnica para configurar
  el SDK, centrada en la autoconfiguración sin código (zero-code). Incluye una
  referencia de todas las variables de entorno y propiedades del sistema
  compatibles para configurar el SDK. Explora todos los puntos de
  personalización programática con ejemplos de código funcionales. La mayoría de
  los usuarios utilizarán esta página como una enciclopedia, consultando el
  índice de secciones según sea necesario, en lugar de leerla de principio a
  fin.
- **Más información**: Recursos complementarios, que incluyen
  [ejemplos](../examples/) de extremo a extremo, [Javadoc](../api/), el
  [registro](../registry/) de componentes y una
  [referencia de rendimiento](/docs/zero-code/java/agent/performance/).

## Repositorios {#repositories}

El código fuente de OpenTelemetry Java está organizado en varios repositorios:

| Repositorio                                                                                                | Descripción                                                                                                          | Grupo ID                           | Versión actual                       | Cadencia de lanzamiento                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)                                 | Componentes principales de la API y el SDK                                                                           | `io.opentelemetry`                 | `{{% param vers.otel %}}`            | [Viernes después del primer lunes del mes](https://github.com/open-telemetry/opentelemetry-java/blob/main/RELEASING.md#release-cadence)                    |
| [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) | Instrumentación mantenida por OpenTelemetry, incluido el agente Java de OpenTelemetry                                | `io.opentelemetry.instrumentation` | `{{% param vers.instrumentation %}}` | [Miércoles después del segundo lunes del mes](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/RELEASING.md#release-cadence) |
| [opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib)                 | Componentes mantenidos por la comunidad que quedan fuera del alcance específico de otros repositorios                | `io.opentelemetry.contrib`         | `{{% param vers.contrib %}}`         | [Viernes después del segundo lunes del mes](https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/RELEASING.md#release-cadence)           |
| [semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)                   | Código generado para las convenciones semánticas                                                                     | `io.opentelemetry.semconv`         | `{{% param vers.semconv %}}`         | Sigue los lanzamientos de [semantic-conventions](https://github.com/open-telemetry/semantic-conventions)                                                   |
| [opentelemetry-proto-java](https://github.com/open-telemetry/opentelemetry-proto-java)                     | Enlaces generados para OTLP                                                                                          | `io.opentelemetry.proto`           | `1.3.2-alpha`                        | Sigue los lanzamientos de [opentelemetry-proto](https://github.com/open-telemetry/opentelemetry-proto)                                                     |
| [opentelemetry-java-examples](https://github.com/open-telemetry/opentelemetry-java-examples)               | Ejemplos de código de extremo a extremo que muestran diversos patrones de uso de la API, el SDK y la instrumentación | n/a                                | n/a                                  | n/a                                                                                                                                                        |

`opentelemetry-java`, `opentelemetry-java-instrumentation` y
`opentelemetry-java-contrib` publican, cada uno, amplios catálogos de
artefactos. Consulta los repositorios para obtener más detalles o revisa la
columna «Dependencias gestionadas» de la tabla
[Bill of Materials](#dependencies-and-boms) para ver la lista completa de
dependencias gestionadas.

Como regla general, los artefactos publicados desde el mismo repositorio tienen
la misma versión. La excepción es `opentelemetry-java-contrib`, que puede
considerarse como un grupo de proyectos independientes ubicados en el mismo
repositorio para aprovechar herramientas compartidas. Por ahora, los artefactos
de `opentelemetry-java-contrib` están alineados, pero esto es una coincidencia y
cambiará en el futuro.

Los repositorios tienen una cadencia de lanzamiento que refleja su estructura de
dependencias de alto nivel:

- `opentelemetry-java` es el núcleo y es el primero en publicar cada mes.
- `opentelemetry-java-instrumentation` depende de `opentelemetry-java` y es el
  siguiente en publicar.
- `opentelemetry-java-contrib` depende de `opentelemetry-java-instrumentation` y
  de `opentelemetry-java`, y es el último en publicar.
- Aunque `semantic-conventions-java` es una dependencia de
  `opentelemetry-java-instrumentation`, es un artefacto independiente con su
  propio calendario de lanzamientos.

## Dependencias y BOMs {#dependencies-and-boms}

Un
[bill of materials](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Bill_of_Materials_.28BOM.29_POMs),
o BOM para abreviar, es un artefacto que ayuda a mantener alineadas las
versiones de dependencias relacionadas. OpenTelemetry Java publica varios BOMs
orientados a diferentes casos de uso, enumerados a continuación en orden de
alcance creciente. Recomendamos encarecidamente utilizar un BOM.

> [!NOTE]
>
> Dado que los BOMs son jerárquicos, no se recomienda añadir dependencias sobre
> múltiples BOMs, ya que es redundante y puede provocar una resolución de
> versiones de dependencias poco intuitiva.

Haz clic en el enlace de la columna «Dependencias gestionadas» para ver una
lista de los artefactos gestionados por el BOM.

| Descripción                                                                                              | Repositorio                          | Grupo ID                           | Artefacto ID                              | Versión actual                             | Dependencias gestionadas                                  |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Artefactos estables del núcleo de la API y el SDK                                                        | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom`                       | `{{% param vers.otel %}}`                  | [último pom.xml][opentelemetry-bom]                       |
| Artefactos experimentales del núcleo de la API y el SDK, incluidos todos los de `opentelemetry-bom`      | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom-alpha`                 | `{{% param vers.otel %}}-alpha`            | [último pom.xml][opentelemetry-bom-alpha]                 |
| Artefactos estables de instrumentación, incluidos todos los de `opentelemetry-bom`                       | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom`       | `{{% param vers.instrumentation %}}`       | [último pom.xml][opentelemetry-instrumentation-bom]       |
| Artefactos experimentales de instrumentación, incluidos todos los de `opentelemetry-instrumentation-bom` | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom-alpha` | `{{% param vers.instrumentation %}}-alpha` | [último pom.xml][opentelemetry-instrumentation-alpha-bom] |

El siguiente fragmento de código muestra cómo añadir una dependencia de BOM,
donde `{{bomGroupId}}`, `{{bomArtifactId}}` y `{{bomVersion}}` hacen referencia
a las columnas «Grupo ID», «Artefacto ID» y «Versión actual» de la tabla,
respectivamente.

{{< tabpane text=true >}} {{% tab "Gradle" %}}

```kotlin
dependencies {
  implementation(platform("{{bomGroupId}}:{{bomArtifactId}}:{{bomVersion}}"))
  // Añade una dependencia sobre un artefacto cuya versión gestiona el BOM
  implementation("io.opentelemetry:opentelemetry-api")
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>{{bomGroupId}}</groupId>
        <artifactId>{{bomArtifactId}}</artifactId>
        <version>{{bomVersion}}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <!-- Añade una dependencia sobre un artefacto cuya versión gestiona el BOM -->
  <dependencies>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-api</artifactId>
    </dependency>
  </dependencies>
</project>
```

{{% /tab %}} {{< /tabpane >}}

[opentelemetry-bom]:
  <https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom/{{% param vers.otel %}}/opentelemetry-bom-{{% param vers.otel %}}.pom>
[opentelemetry-bom-alpha]:
  <https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom-alpha/{{% param vers.otel %}}-alpha/opentelemetry-bom-alpha-{{% param vers.otel %}}-alpha.pom>
[opentelemetry-instrumentation-bom]:
  <https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom/{{% param vers.instrumentation %}}/opentelemetry-instrumentation-bom-{{% param vers.instrumentation %}}.pom>
[opentelemetry-instrumentation-alpha-bom]:
  <https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom-alpha/{{% param vers.instrumentation %}}-alpha/opentelemetry-instrumentation-bom-alpha-{{% param vers.instrumentation %}}-alpha.pom>
