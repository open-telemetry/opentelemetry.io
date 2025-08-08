---
title: Basado en código
description: Learn the essential steps in setting up code-based instrumentation
aliases: [manual]
weight: 20
default_lang_commit: 8d7aa298d2b42f64f118526e7a1189b1b9dffd0d
---

## Importa la API y el SDK de OpenTelemetry {#import-the-opentelemetry-api-and-sdk}

Primero tendrás que importar OpenTelemetry en el código de tu servicio. Si estás
desarrollando una librería u otro componente destinado a ser consumido por un
ejecutable binario, solo necesitarías la dependencia de la API. Si tu artefacto
es un proceso o servicio independiente, entonces necesitarías la dependencia
tanto de la API como del SDK. Para más información sobre la API y el SDK de
OpenTelemetry, consulta la [especificación](/docs/specs/otel/).

## Configura la API de OpenTelemetry {#configure-the-opentelemetry-api}

Para poder crear trazas o métricas, primero deberás crear un provider de tipo
`tracer` y/o un `meter`. En general, recomendamos que el SDK proporcione un
único proveedor predeterminado para estos objetos. Luego, obtendrás una
instancia de `tracer` o `meter` de ese proveedor y le darás un nombre y una
versión. El nombre que elijas aquí debe identificar exactamente lo que se está
instrumentando -- si estás escribiendo una librería, por ejemplo, deberías darle
el nombre de tu librería (por ejemplo, `com.example.myLibrary`), ya que este
nombre pondrá en un espacio de nombres todos los spans o eventos de métricas
producidos. También se recomienda que proporciones una cadena de versión (por
ejemplo, `semver:1.0.0`) que se corresponda con la versión actual de tu librería
o servicio.

## Configura el SDK de OpenTelemetry {#configure-the-opentelemetry-sdk}

Si estás construyendo un proceso de servicio, también deberás configurar el SDK
con las opciones apropiadas para exportar tus datos de telemetría a algún
backend de análisis. Recomendamos que esta configuración se gestione de forma
programática a través de un archivo de configuración o algún otro mecanismo.
También hay opciones de ajuste específicas para cada lenguaje que podrías
aprovechar.

## Crea datos de telemetría {#create-telemetry-data}

Una vez que hayas configurado la API y el SDK, podrás crear trazas y eventos de
métricas a través de los objetos `tracer` y `meter` que obtuviste del proveedor.
Haz uso de las librerías de instrumentación para tus dependencias -- consulta el
[registro](/ecosystem/registry/) o el repositorio de tu lenguaje para más
información sobre estas.

## Exporta datos {#export-data}

Una vez que hayas creado los datos de telemetría, querrás enviarlos a algún
lugar. OpenTelemetry soporta dos métodos principales para exportar datos desde
tu proceso a un backend de análisis: directamente desde un proceso o haciendo
proxy a través del [OpenTelemetry Collector](/docs/collector).

La exportación desde el proceso requiere que importes y tengas una dependencia
en uno o más exportadores, librerías que traducen los objetos span y de métricas
en memoria de OpenTelemetry al formato apropiado para herramientas de análisis
de telemetría como Jaeger o Prometheus. Además, OpenTelemetry soporta un
protocolo de comunicación conocido como `OTLP`, que es compatible con todos los
SDK de OpenTelemetry. Este protocolo puede usarse para enviar datos al
OpenTelemetry Collector, un proceso binario independiente que puede ejecutarse
como un proxy o sidecar para las instancias de tu servicio, o en un host
separado. El colector puede configurarse para reenviar y exportar estos datos a
las herramientas de análisis de tu elección.

Además de las herramientas de código abierto como Jaeger o Prometheus, una lista
creciente de empresas soporta la ingesta de datos de telemetría de
OpenTelemetry. Para más detalles, consulta [Vendors](/ecosystem/vendors/).
