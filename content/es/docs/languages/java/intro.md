---
title: Introducción a OpenTelemetry Java
description: Introducción al ecosistema de OpenTelemetry Java
weight: 9
---

OpenTelemetry Java es el conjunto de herramientas de observabilidad de
OpenTelemetry para el ecosistema Java. En términos generales, Esta compuerto por
la API el SDK y la instrumentación.

Esta pagina presenta el ecosistema con una
[descripción general](#descripcion-general), una guía para
[navegar por la documentacion](#navegar-por-la-documentacion), y una lista de
[repositorios](#repositorios) con detalles claves sobre versiones y artefactos.

## Descripción General

La API es un conjunto de clases e interfaces para registrar telemetría en
señales de observabilidad clave. Admite múltiples implementaciones, incluyendo
una implementación minimalista sin operaciones y una implementación de referncia
del SDK con bajo consumo de recursos. Esta diseñada para ser utilizada como
dependencia directa por bibliotecas, frameworks y propietarios de aplicacione
sque deseen añadir intrumentación. Ofrece sólidas garantías de
retrocompatiblidad, no tiene dependencias transitivas y es comptaible con Java
8+.

El SDK es la implementación de referencia integrada de la API, que procesa y
exporta la telemetrìa generada por la llamadas a la API de instrumentación.
Configurar el SDK para que el procese y exporte correctamente es un paso
esencial para integrar OpenTelemetry en una aplicación. El SDK cuenta con
opciones de autoconfiguación y configuración programática.

La instrumentación reigstra telemetría utilizando la API. Existen diversas
categorías de instrumentación, entre ellas: agente Java sin código, iniciador de
Spring Boot sin código, bibliotecas, instrumentación nativa, instrumentación
manual y shims de compatibilidad

Para una descricipión general independiente del lenguaje, consulta
[conceptos de OpenTelemetry](/docs/concepts/).

## Navegar por la documentación

La documentación de OpenTelemetry Java está organizada de la siguiente manera:

- [Guía de inicio con ejemplos](../getting-started/): Un ejemplo rápido para
  comenzar a trabajar con OpenTelemetry Java, demostrando la integración del
  agente JAva de OpenTelemetry en una aplicación web sencilla.
- [Ecosistema de instrumentación](../instrumentation/): Una guía sobre el
  ecosistema de instrumentación de OpenTelemetry Java. Este es un recurso clave
  para desarrolladores de aplicaciones que buscan integrar OpenTelemetry Java en
  sus aplicaciones. Aprende sobre las diferentes categorías de instrumentación y
  decide cuál es el mas adecauda para ti.
- [Regitrar Telemetría con API](../api/): Una referencia técnica de la API de
  OpenTelemetry, que explora todos los aspectos clave de la API con ejemplos de
  código funcionales. La mayorìa de los usuarios utilizarán esta página como una
  enciclopedia, consultando el índice de secciones según sea necesaro, en lugar
  de leerla de principio a fin.
- [Gestionar la telemetría con SDK](../sdk/) Una refencia técnica del SDK de
  OpenTelemetry, que explora todos los puntos de extensión de complementos del
  SDK y la API de configuración programática con ejemplos de código funcionales.
  La mayoría de los usuarios utilizarán esta página como una enciclopedia,
  consultando el índice de secciones según sea necesario, en lugar de leerla de
  principio a fin.
- [Configurar el SDK](../configuration/): Una referencia técnica para configurar
  el SDK, enfocada en la autoconfiguración sin codigo. Incluye una referencia de
  todas las variables de entorno y propiedades del sistema comptaibles para
  configurar el SDK. Explora todos los puntos de personalización programática
  con ejemplos de código funcionales. La mayoría de los usuarios utilizarán esta
  pagina como una enciclopedia, consultando el índice de secciones según sea
  necesario, en lugar de leerla de principio a fin.
- **Más información**: Recursos complementarios, incluidos end-to-end
  [examples](../examples/), [Javadoc](../api/), componentes
  [registros](../registry/), y
  [referencia de rendimiento](/docs/zero-code/java/agent/performance/).

## Repositorios

El códio fuente de OpenTelemetry Java está organizado en varios repositorios:

| Repositorios                                                                                               | Descripción                                                                                                   | Grupo ID                           | Versión actual                       | Frecuencia de Despliegues                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)                                 | Componentes principales del API y SDK                                                                         | `io.opentelemetry`                 | `{{% param vers.otel %}}`            | [Friday after first Monday of the month](https://github.com/open-telemetry/opentelemetry-java/blob/main/RELEASING.md#release-cadence)                     |
| [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) | Instrumentación administrada por OpenTelemetry, incluido el agente Java de OpenTelemetry                      | `io.opentelemetry.instrumentation` | `{{% param vers.instrumentation %}}` | [Wednesday after second Monday of the month](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/RELEASING.md#release-cadence) |
| [opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib)                 | Componenetes mantenidos por la comunidad que quedan fuera del alcance específico de otros repositorios.       | `io.opentelemetry.contrib`         | `{{% param vers.contrib %}}`         | [Friday after second Monday of the month](https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/RELEASING.md#release-cadence)            |
| [semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)                   | Código generado para las convenciones semánticas. conventions                                                 | `io.opentelemetry.semconv`         | `{{% param vers.semconv %}}`         | Following releases of [semantic-conventions](https://github.com/open-telemetry/semantic-conventions)                                                      |
| [opentelemetry-proto-java](https://github.com/open-telemetry/opentelemetry-proto-java)                     | Enlaces generados para OTLP                                                                                   | `io.opentelemetry.proto`           | `1.3.2-alpha`                        | Following releases of [opentelemetry-proto](https://github.com/open-telemetry/opentelemetry-proto)                                                        |
| [opentelemetry-java-examples](https://github.com/open-telemetry/opentelemetry-java-examples)               | Ejemplos de código End-to-end que demuestran diversos patrones de uso de la API, el SDK y la instrumentación. | n/a                                | n/a                                  | n/a                                                                                                                                                       |

`opentelemetry-java`, `opentelemetry-java-instrumentation`, y
`opentelemetry-java-contrib` cada uno publica amplios catálogos de artefacto.
Consulta los repositorios para obtener mas detalles, o revisa la columna
"Dependencias administradas" en la columna
[Bill of Materials](#dependencies-and-boms) para ver la lista completa de
dependencias administradas.

Como reglas general, los artefactos publicados desde el mismo repositorio
comparten la misma versión. La excepción es `opentelemetry-java-contrib`, que
puede considerarse como un conjunto de proyectos independientes alojados en el
mismo repositorio para aprovechar herramientas compartidas. Por ahora, los
artefactos de `opentelemetry-java-contrib` están alineados en versión, pero esto
es una coincidencia y cambiará en el futuro.

Los repositorios tienen una cadencia de lanzamientos que refleja su estructura
de dependencias de alto nivel:

- `opentelemetry-java` es el núcleo y realiza sus lanzamientos 1ero de cada mes.
- `opentelemetry-java-instrumentation` depende de `opentelemetry-java` y es el
  siguiente en publicar.
- `opentelemetry-java-contrib` depende de `opentelemetry-java-instrumentation` y
  de `opentelemetry-java`, y es el último en pulicar.
- Although `semantic-conventions-java` es una depedencia de
  `opentelemetry-java-instrumentation`, es un artefacto independiente con su
  propio calendario de lanzamientos.

## Dependencias y BOMs

[bill of materials](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Bill_of_Materials_.28BOM.29_POMs),
un BOM (Bill of Materials), o simplemente BOM, es un artefacto que ayuda a
mantener alineadas las versiones de dependencias relacionadas. OpenTelemetry
Java publica varios BOMs orientados a diferentes casos de uso, listados a
continuación en orden de alcance creciente. Recomendamos encaredicamente
utilizar un BOM

> [!NOTA]
>
> Debido a que los BOMs son jerárquicos, no se recomienda agregar dependencias
> sobre múltiples BOMs, ya que es redundante y puede generar una resolución de
> versiones de dependencias poco intuitiva.

Haz clic en el enlace de la columna 'Dependencias administradas' para ver una
lista de los artefactos gestionados por el BOM.

| Descripción                                                                                                       | Repositorio                          | Grupo ID                           | Artefacto ID                              | Versión actual                             | Dependencias gestionadas                                  |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Artefactos Core de la API y SDK                                                                                   | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom`                       | `{{% param vers.otel %}}`                  | [latest pom.xml][opentelemetry-bom]                       |
| Artefactos experimentales del Core de la API y SDK, incluidos todos los siguientes: `opentelemetry-bom`           | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom-alpha`                 | `{{% param vers.otel %}}-alpha`            | [latest pom.xml][opentelemetry-bom-alpha]                 |
| Artefactos estables de instrumentación, incluidos todos los siguientes: `opentelemetry-bom`                       | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom`       | `{{% param vers.instrumentation %}}`       | [latest pom.xml][opentelemetry-instrumentation-bom]       |
| Artefactos experimentales de instrumentación, incluidos todos los siguientes: `opentelemetry-instrumentation-bom` | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom-alpha` | `{{% param vers.instrumentation %}}-alpha` | [latest pom.xml][opentelemetry-instrumentation-alpha-bom] |

El siguiente fragmento de código muestra cómo agregar una dependencia
BOM`{{bomGroupId}}`, `{{bomArtifactId}}`, y `{{bomVersion}}` haciendo referencia
a las columnas de la tabla "Grupo ID", "Artefacto ID", y "Versión actual"
respectivamente.

{{< tabpane text=true >}} {{% tab "Gradle" %}}

```kotlin
dependencies {
  implementation(platform("{{bomGroupId}}:{{bomArtifactId}}:{{bomVersion}}"))
  // Agregar una dependencia sobre un artefacto cuya versión es gestionada por el BOM
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
  <!-- Agregar una dependencia a un artefacto cuya versión es gestionada por el BOM -->
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
