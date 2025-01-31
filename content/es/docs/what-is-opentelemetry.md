---
title: ¿Qué es OpenTelemetry?
description: Qué es y qué no es OpenTelemetry, una breve explicación
weight: 150
default_lang_commit: 13c2d415e935fac3014344e67c6c61556779fd6f
cSpell:ignore: extensibilidad microservicios
---

OpenTelemetry es:

- Un framework de
  [observabilidad](/docs/concepts/observability-primer/#what-is-observability) y
  un conjunto de herramientas diseñado para crear y gestionar datos de
  telemetría tales como [trazas](/docs/concepts/signals/traces/),
  [métricas](/docs/concepts/signals/metrics/) y
  [logs](/docs/concepts/signals/logs/).
- Independiente de proveedores y herramientas, lo que significa que puede usarse
  con una amplia variedad de backends de observabilidad, incluyendo
  [Jaeger](https://www.jaegertracing.io/) y
  [Prometheus](https://prometheus.io/), así como soluciones comerciales.
- No es un backend de observabilidad como Jaeger, Prometheus, o productos
  comerciales de terceros.
- Enfocado en la generación, recopilación, gestión y exportación de telemetría.
  Uno de los objetivos principales de OpenTelemetry es que puedas instrumentar
  fácilmente tus aplicaciones o sistemas, sin importar el lenguaje de
  programación, infraestructura o entorno de ejecución. El almacenamiento y
  visualización de la telemetría se deja intencionadamente a otras herramientas.

## ¿Qué es la observabilidad?

[Observabilidad](/docs/concepts/observability-primer/#what-is-observability) es
la capacidad para comprender el estado interno de un sistema a través del
análisis de sus resultados. En el contexto del software, esto significa ser
capaces de comprender el estado interno de un sistema a través del análisis de
sus datos de telemetría, que incluyen trazas, métricas y logs.

Para que un sistema sea observable, debe ser
[instrumentado](/docs/concepts/instrumentation), esto es, su código debe emitir
[trazas](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/) o
[logs](/docs/concepts/signals/logs/). Los datos instrumentados tienen que ser
enviados luego a un backend de observabilidad.

## ¿Por qué OpenTelemetry?

Con el auge de la computación en la nube, las arquitecturas de microservicios y
requisitos comerciales cada vez más complejos, la necesidad de
[observabilidad](/docs/concepts/observability-primer/#what-is-observability) del
software y la infraestructura es mayor que nunca.

OpenTelemetry satisface la necesidad de observabilidad siguiendo dos principios
fundamentales:

1. Eres dueño de los datos que generas. No hay ningún tipo de dependencia del
   proveedor.
2. Solo tienes que aprender un único conjunto de API y convenciones.

Ambos principios combinados otorgan a los equipos y organizaciones la
flexibilidad que necesitan en el mundo informático de hoy en día.

Si quieres aprender más, echa un vistazo a
[la misión, la visión y los valores](/community/mission/) de OpenTelemetry.

## Principales componentes de OpenTelemetry

OpenTelemetry consta de los siguientes componentes principales:

- Una [especificación](/docs/specs/otel) para todos los componentes.
- Un [protocolo](/docs/specs/otlp/) estándar que define el formato de los datos
  de telemetría.
- Una [convención semántica](/docs/specs/semconv/) que define un sistema de
  nomenclatura estándar para tipos de datos de telemetría comunes.
- APIs que describen cómo se generan los datos de telemetría.
- [SDKs para cada lenguaje](/docs/languages) que implementan las
  especificaciones, las APIs, y que exportan datos de telemetría.
- Un [ecosistema de librerías](/ecosystem/registry) que implementan
  instrumentación para librerías y frameworks populares.
- Componentes de instrumentación automática que generan datos de telemetría sin
  requerir cambios en el código.
- El [OpenTelemetry Collector](/docs/collector), un proxy que recibe, procesa y
  exporta datos de telemetría.
- Numerosas herramientas, como el
  [OpenTelemetry Operator para Kubernetes](/docs/kubernetes/operator/),
  [OpenTelemetry Helm Charts](/docs/kubernetes/helm/) y
  [recursos para la comunidad para FaaS](/docs/faas/).

OpenTelemetry es utilizado por una amplia variedad de
[librerías, servicios y aplicaciones](/ecosystem/integrations/) que integran
OpenTelemetry y proporcionan observabilidad por defecto.

OpenTelemetry cuenta con el respaldo de numerosos
[proveedores](/ecosystem/vendors/), muchos de los cuales brindan soporte
comercial para OpenTelemetry y contribuyen directamente al proyecto.

## Extensibilidad

OpenTelemetry está diseñado para ser extensible. Algunos ejemplos de cómo se
puede extender incluyen:

- Agregar un receptor al OpenTelemetry Collector para admitir datos de
  telemetría desde una fuente de datos personalizada.
- Cargar librerías de instrumentación personalizadas en un SDK.
- Crear una [distribución](/docs/concepts/distributions/) de un SDK o Collector
  adaptada a un caso de uso específico.
- Crear un nuevo exportador para un backend personalizado que aún no admite el
  protocolo OpenTelemetry (OTLP).
- Crear un propagador personalizado para un formato de propagación de contexto
  que no es estándar.

Aunque la mayoría de los usuarios tal vez no necesiten extender OpenTelemetry,
el proyecto está diseñado para hacerlo posible en casi todos los niveles.

## Historia {#history}

OpenTelemetry es un proyecto de
[Cloud Native Computing Foundation (CNCF)](https://www.cncf.io) que es el
resultado de una fusión entre dos proyectos anteriores,
[OpenTracing](https://opentracing.io) y [OpenCensus](https://opencensus.io).
Ambos proyectos fueron creados para resolver el mismo problema: la falta de un
estándar sobre cómo instrumentar código y enviar datos de telemetría a un
backend de Observabilidad. Como ninguno de los dos proyectos anteriores pudo
resolver por completo el problema de forma independiente, se fusionaron para
formar OpenTelemetry y combinar así sus fortalezas a la vez que ofrecían una
solución única.

Si usas OpenTracing u OpenCensus, aprende cómo migrar a OpenTelemetry en la
[guía de migración](/docs/migration/).

## Pasos siguientes

- [Tutorial de inicio rápido](/docs/getting-started/): ¡lánzate de inmediato!
- Conoce los [conceptos fundamentales de OpenTelemetry](/docs/concepts/).
