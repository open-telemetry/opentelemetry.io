---
title: Métricas
weight: 2
description: Una medida capturada en tiempo de ejecución.
default_lang_commit: 34f672f4afbc083423d5c03a03f97c308591d255
---

Una **métrica** es una **medida** de un servicio capturada en tiempo de
ejecución. El momento de capturar una medida se conoce como **evento de
métrica**, que consiste no solo en la medida en sí misma, sino también en el
momento en que fue capturada y los metadatos asociados.

Las métricas de aplicación y de peticiones son indicadores importantes de
disponibilidad y rendimiento. Las métricas personalizadas pueden proporcionar
información sobre cómo los indicadores de disponibilidad impactan en la
experiencia del usuario o en el negocio. Los datos recopilados se pueden usar
para alertar de una interrupción del servicio o para activar decisiones de
escalar automáticamente un deployment ante una alta demanda.

Para entender cómo funcionan las métricas en OpenTelemetry, veamos una lista de
los componentes que desempeñarán un papel en la instrumentación de nuestro
código.

## Meter Provider {#meter-provider}

Un `Meter Provider` (a veces llamado `MeterProvider`) es una factoría para
Meters. En la mayoría de las aplicaciones, un `Meter Provider` se inicializa una
vez y su ciclo de vida coincide con el ciclo de vida de la aplicación. La
inicialización del `Meter Provider` también incluye la inicialización del
`Resource` y el `Exporter`. Suele ser el primer paso en la medición con
OpenTelemetry. Algunos SDKs de lenguaje ya te inicializan un `Meter Provider`
global y no lo tendrás que inicializar tú.

## Meter {#meter}

Un `Meter` crea [instrumentos de métrica](#metric-instruments), capturando
medidas sobre un servicio en tiempo de ejecución. Los `Meters` se crean a partir
de Meter Providers.

## Metric Exporter {#metric-exporter}

Los exportadores de métricas envían datos de métrica a un consumidor. Este
consumidor puede ser la salida estándar para la depuración durante el
desarrollo, el OpenTelemetry Collector, o cualquier backend de código abierto o
de proveedores de tu elección.

## Metric Instruments {#metric-instruments}

En OpenTelemetry, las medidas se capturan mediante **Instrumentos de Métricas**.
Un instrumento de métricas se define por:

- Nombre
- Tipo
- Unidad (opcional)
- Descripción (opcional)

El nombre, la unidad y la descripción son elegidos por quien desarrolla o son
definidos a través de
[convenciones semánticas](/docs/specs/semconv/general/metrics/) para los
comunes, como las métricas de petición y de proceso.

El tipo de instrumento es uno de los siguientes:

- **Counter**: Un valor que se acumula con el tiempo -- puedes pensar en esto
  como el cuentakilómetros de un coche: solo sube.
- **Asynchronous Counter**: Igual que el **Counter**, pero se recolecta una vez
  por cada exportación. Se puede usar cuando no tienes acceso a los incrementos
  continuos, sino solamente al valor agregado.
- **UpDownCounter**: Un valor que se acumula con el tiempo, pero que también
  puede bajar. Un ejemplo podría ser la longitud de una cola, que aumentará y
  disminuirá con el número de elementos de trabajo en la cola.
- **Asynchronous UpDownCounter**: Igual que el **UpDownCounter**, pero se
  recolecta una vez por cada exportación. Se puede usar cuando no tienes acceso
  a los cambios continuos, sino solo al valor agregado (por ejemplo, el tamaño
  actual de la cola).
- **Gauge**: Mide el valor actual en el momento en que se hace la medición. Un
  ejemplo sería el indicador de combustible en un vehículo. Los Gauges son
  síncronos.
- **Asynchronous Gauge**: Igual que el **Gauge**, pero se recolecta una vez por
  cada exportación. Se puede usar cuando no tienes acceso a los cambios
  continuos, sino solo al valor agregado.
- **Histogram**: Una agregación de valores en el lado del cliente, como la
  latencia de las peticiones. Un histograma es una buena opción si te interesan
  valores estadísticos. Por ejemplo: ¿Cuántas peticiones tardan menos de 1
  segundo?

Para más información sobre instrumentos síncronos y asíncronos, y qué tipo se
adapta mejor a tu caso de uso, consulta las
[Guías Adicionales](/docs/specs/otel/metrics/supplementary-guidelines/).

## Agregación {#aggregation}

Además de los instrumentos de métricas, es importante entender el concepto de
**agregaciones**. Una agregación es una técnica mediante la cual un gran número
de medidas se combinan en estadísticas exactas o estimadas sobre los eventos de
métrica que tuvieron lugar durante un periodo de tiempo. El protocolo OTLP
transporta dichas métricas agregadas. La API de OpenTelemetry proporciona una
agregación predeterminada para cada instrumento que se puede anular usando
[`Views`](#views). El proyecto OpenTelemetry tiene como objetivo proporcionar
agregaciones predeterminadas que sean compatibles con visualizadores y backends
de telemetría.

A diferencia del [trazado de peticiones](../traces/), que tiene como objetivo
capturar los ciclos de vida de las solicitudes y proporcionar contexto a las
piezas individuales de una petición, las métricas tienen como objetivo
proporcionar información estadística en conjunto. Algunos ejemplos de casos de
uso para las métricas incluyen:

- Informar del número total de bytes leídos por un servicio, por tipo de
  protocolo.
- Informar del número total de bytes leídos y los bytes por petición.
- Informar de la duración de una llamada al sistema.
- Informar de los tamaños de las peticiones para determinar una tendencia.
- Informar del uso de CPU o memoria de un proceso.
- Informar de los valores de saldo promedio de una cuenta.
- Informar las peticiones activas actuales que se están manejando.

## Views {#views}

Una `View` proporciona a los usuarios del SDK la flexibilidad de personalizar la
salida de las métricas del SDK. Puedes personalizar qué instrumentos de métrica
deben ser procesados o ignorados. También puedes personalizar la agregación y
qué atributos quieres reportar en las métricas.

## Language Support {#language-support}

Las métricas son una señal
[estable](/docs/specs/otel/versioning-and-stability/#stable) en la
especificación de OpenTelemetry. Para las implementaciones específicas de la API
de métricas y el SDK de cada lenguaje, el estado es el siguiente:

{{% signal-support-table "metrics" %}}

## Especificación {#specification}

Para saber más sobre métricas en OpenTelemetry, consulta la
[especificación de las métricas](/docs/specs/otel/overview/#metric-signal).
