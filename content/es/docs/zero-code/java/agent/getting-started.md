---
title: Primeros pasos
weight: 1
default_lang_commit: 5d68eec62bc16a5558678eae6d2f8c5083113823
cSpell:ignore: Dotel jvms
---

## Configuración { #setup }

1. Descarga
   [opentelemetry-javaagent.jar](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
   desde
   [Releases](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases)
   del repositorio `opentelemetry-java-instrumentation` y coloca el JAR en el
   directorio que prefieras. El archivo JAR contiene el agente y las librerías
   de instrumentación.
2. Añade `-javaagent:path/to/opentelemetry-javaagent.jar` y el resto de la
   configuración a los argumentos de inicio de la JVM y ejecuta tu aplicación:

   - Directamente en el comando de inicio:

     ```shell
     java -javaagent:path/to/opentelemetry-javaagent.jar -Dotel.service.name=your-service-name -jar myapp.jar
     ```

   - Mediante `JAVA_TOOL_OPTIONS` y otras variables de entorno:

     ```shell
     export JAVA_TOOL_OPTIONS="-javaagent:path/to/opentelemetry-javaagent.jar"
     export OTEL_SERVICE_NAME="your-service-name"
     java -jar myapp.jar
     ```

## Configuración declarativa { #declarative-configuration }

La configuración declarativa utiliza un archivo YAML en lugar de variables de
entorno o propiedades del sistema. Resulta útil cuando tienes que establecer
muchas opciones de configuración o quieres usar opciones que no están
disponibles como variables de entorno o propiedades del sistema.

Consulta la página de [Configuración declarativa](../declarative-configuration)
para obtener más información.

## Configuración del agente { #configuring-the-agent }

El agente ofrece numerosas opciones de configuración.

Una opción es pasar propiedades de configuración mediante la opción `-D`. En
este ejemplo, se configuran el nombre del servicio y el exportador de Zipkin
para las trazas:

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.service.name=your-service-name \
     -Dotel.traces.exporter=zipkin \
     -jar myapp.jar
```

También puedes usar variables de entorno para configurar el agente:

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=zipkin \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

También puedes indicar un archivo de propiedades de Java desde el que cargar los
valores de configuración:

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.configuration-file=path/to/properties/file.properties \
     -jar myapp.jar
```

o bien

```sh
OTEL_JAVAAGENT_CONFIGURATION_FILE=path/to/properties/file.properties \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

Para consultar todas las opciones de configuración disponibles, visita
[Configuración del agente](../configuration).

## Librerías, frameworks, servicios de aplicaciones y JVM compatibles { #supported-libraries-frameworks-application-services-and-jvms }

El agente de Java incluye librerías de instrumentación para muchos componentes
populares. Consulta la
[lista completa de librerías, frameworks, servicios de aplicaciones y JVM compatibles](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

## Resolución de problemas { #troubleshooting }

{{% config_option name="otel.javaagent.debug" %}}

Configura esta opción en `true` para ver los registros de depuración. Ten en
cuenta que son bastante detallados.

{{% /config_option %}}

## Pasos siguientes { #next-steps }

Una vez que hayas configurado la instrumentación automática para tu aplicación o
servicio, quizá quieras [anotar](../annotations) métodos seleccionados o agregar
[instrumentación manual](/docs/languages/java/instrumentation/) para recopilar
datos de telemetría personalizados.
