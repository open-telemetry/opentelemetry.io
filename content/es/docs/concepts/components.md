---
title: Componentes
description: Componentes que forman OpenTelemetry
aliases: [data-collection]
weight: 20
default_lang_commit: 99a39c5e4e51daba968bfbb3eb078be4a14ad363
---

OpenTelemetry está compuesto por varios componentes principales:

- [Especificación](#specification)
- [Collector](#collector)
- [Implementaciones de API y SDK específicas del lenguaje](#implementaciones-de-api-y-sdk-específicas-del-lenguaje)
  - [Librerías de Instrumentación](#librerías-de-instrumentación)
  - [Exportadores](#exporters)
  - [Instrumentación sin código](#instrumentación-sin-código)
  - [Detectores de Recursos](#detectores-de-recursos)
  - [Propagadores entre servicios](#propagadores-entre-servicios)
  - [Muestreadores](#muestreadores)
- [Operador de Kubernetes](#operador-de-kubernetes)
- [Elementos de Función como Servicio](#elementos-de-función-como-servicio)

OpenTelemetry te permite reemplazar la necesidad de SDKs y herramientas
específicas de proveedores para generar y exportar datos de telemetría.

## Especificación {#specification}

Describe los requisitos y expectativas multilenguaje para todas las
implementaciones. Más allá de la definición de términos, la especificación
define lo siguiente:

- **API:** Define tipos de datos y operaciones para generar y correlacionar
  datos de trazas, métricas y logs.
- **SDK:** Define requisitos para una implementación específica del lenguaje de
  la API. La configuración, procesamiento de datos y conceptos de exportación
  también se definen aquí.
- **Datos:** Define el Protocolo de OpenTelemetry (OTLP) y convenciones
  semánticas neutrales que un backend de telemetría puede soportar.

Para más información, consulta las [especificaciones](/docs/specs/).

## Collector

El Collector de OpenTelemetry es un proxy neutral que puede recibir, procesar y
exportar datos de telemetría. Soporta recibir datos de telemetría en múltiples
formatos (por ejemplo, OTLP, Jaeger, Prometheus, así como muchas herramientas
comerciales/proprietarias) y enviar datos a uno o más backends. También permite
procesar y filtrar datos de telemetría antes de exportarlos.

Para más información, consulta el [Collector](/docs/collector/).

## Implementaciones de API y SDK específicas del lenguaje

OpenTelemetry también cuenta con SDKs específicos para cada lenguaje que te
permiten usar la API de OpenTelemetry para generar datos de telemetría en el
lenguaje de tu elección y exportarlos a un backend preferido. Estos SDKs también
permiten incorporar librerías de instrumentación para librerías y frameworks
comunes, que puedes utilizar para conectar la instrumentación manual en tu
aplicación.

Para más información, consulta
[Instrumentación](/docs/concepts/instrumentation/).

### Librerías de instrumentación

OpenTelemetry soporta una amplia gama de componentes que generan datos de
telemetría relevantes desde librerías y frameworks populares para los lenguajes
soportados. Por ejemplo, las solicitudes HTTP entrantes y salientes desde una
librería HTTP generan datos sobre esas solicitudes.

Un objetivo aspiracional de OpenTelemetry es que todas las librerías populares
estén diseñadas para ser observables por defecto, para que no se requieran
dependencias separadas.

Para más información, consulta
[Instrumentación de librerías](/docs/concepts/instrumentation/libraries/).

### Exportadores {#exporters}

{{% docs/languages/exporters/intro %}}

### Instrumentación sin código

Si aplica, una implementación específica de OpenTelemetry en un lenguaje
proporciona una forma de instrumentar tu aplicación sin tocar el código fuente.
Aunque el mecanismo subyacente depende del lenguaje, la instrumentación sin
código añade las capacidades de API y SDK de OpenTelemetry a tu aplicación.
Adicionalmente, puede añadir un conjunto de librerías de instrumentación y
dependencias de exportador.

Para más información, consulta
[Instrumentación sin código](/docs/concepts/instrumentation/zero-code/).

### Detectores de recursos

Un [recurso](/docs/concepts/resources/) representa la entidad que produce
telemetría como atributos de tipo recurso. Por ejemplo, un proceso que produce
telemetría y que se está ejecutando en un contenedor en Kubernetes tiene el
nombre del Pod, un nombre del namespace y posiblemente un nombre del Deployment.
Puedes incluir todos estos atributos como tipo recurso.

Las implementaciones específicas de OpenTelemetry para cada lenguaje
proporcionan detección de recursos desde la variable de entorno
`OTEL_RESOURCE_ATTRIBUTES` y para muchas entidades comunes, como el runtime del
proceso, servicio, host o sistema operativo.

Para más información, consulta [Recursos](/docs/concepts/resources/).

### Propagadores entre servicios

La propagación es el mecanismo que transfiere datos entre servicios y procesos.
Aunque no está limitado a las trazas, la propagación permite que las trazas
construyan información causal sobre un sistema a través de servicios
distribuidos arbitrariamente entre fronteras de procesos y redes.

Para la gran mayoría de los casos, la propagación de contexto ocurre a través de
librerías de instrumentación. Si es necesario, puedes utilizar propagadores tú
mismo para serializar y deserializar intereses compartidos, como el contexto de
un span y el [equipaje](/docs/concepts/signals/baggage/).

### Muestreadores

El muestreo es un proceso que restringe la cantidad de trazas generadas por un
sistema. Cada implementación específica de OpenTelemetry para un lenguaje ofrece
varios [muestreadores de cabecera](/docs/concepts/sampling/#head-sampling).

Para más información, consulta [Muestreo](/docs/concepts/sampling).

## Operador de Kubernetes

El Operador de OpenTelemetry es una implementación de un Operador de Kubernetes.
El operador gestiona el Collector de OpenTelemetry y la auto-instrumentación de
las aplicaciones usando OpenTelemetry.

Para más información, consulta el
[Operador K8s](/docs/platforms/kubernetes/operator/).

## Elementos de Función como Servicio

OpenTelemetry soporta varios métodos de monitoreo para Function-as-a-Service
proporcionados por diferentes proveedores de servicios en la nube. La comunidad
de OpenTelemetry proporciona capas Lambda prefabricadas capaces de
auto-instrumentar tu aplicación, así como la opción de una capa Lambda de
Collector independiente que puede usarse al instrumentar aplicaciones manual o
automáticamente.

Para más información, consulta [Funciones como Servicio](/docs/platforms/faas/).
