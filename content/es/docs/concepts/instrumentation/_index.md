---
title: Instrumentación
description: Cómo OpenTelemetry facilita la instrumentación
aliases: [instrumenting]
weight: 15
default_lang_commit: efeda2d8ded2471211697c3993f6d475a3a8b06e
---

Para que un sistema sea [observable], debe estar **instrumentado**: esto
significa que el código de los componentes del sistema debe emitir
[señales][signals], como [trazas][traces], [métricas][metrics], y [logs].

Con OpenTelemetry, puedes instrumentar tu código principalmente de dos formas:

1. [Soluciones basadas en código](code-based/) a través de
   [APIs y SDKs oficiales para la mayoría de los lenguajes](/docs/languages/)
2. [Soluciones sin código](zero-code/)

Las soluciones **basadas en código** te permiten obtener una visión más
detallada y una telemetría rica desde la propia aplicación. Te permiten usar el
API de OpenTelemetry para generar telemetría desde tu aplicación, lo que actúa
como un complemento esencial a la telemetría generada por las soluciones sin
código.

Las soluciones **sin código** son excelentes para empezar o cuando no puedes
modificar la aplicación de la que necesitas obtener telemetría. Proporcionan una
telemetría abundante de las librerías que utilizas y/o del entorno en el que se
ejecuta tu aplicación. Otra forma de verlo es que proporcionan información sobre
lo que está sucediendo _en los límites_ de tu aplicación.

Puedes utilizar ambas soluciones simultáneamente.

## Beneficios adicionales de OpenTelemetry {#additional-openTelemetry-benefits}

OpenTelemetry ofrece más que solo soluciones de telemetría sin código y basadas
en código. Los siguientes aspectos también forman parte de OpenTelemetry:

- Las librerías pueden usar la API de OpenTelemetry como una dependencia, lo que
  no tendrá ningún impacto en las aplicaciones que usen esa librería, a menos
  que se importe el SDK de OpenTelemetry.
- Para cada una de las [señales][signals], tienes varios métodos a tu
  disposición para crearlas, procesarlas y exportarlas.
- Con la [propagación de contexto](../context-propagation/) integrada en las
  implementaciones, puedes correlacionar señales independientemente de dónde se
  generen.
- Los [Recursos](../resources/) y
  [Ámbitos de Instrumentación](../instrumentation-scope/) permiten agrupar
  señales por diferentes entidades, como el
  [host](/docs/specs/semconv/resource/host/), el
  [sistema operativo](/docs/specs/semconv/resource/os/) o el
  [clúster de K8s](/docs/specs/semconv/resource/k8s/#cluster).
- Cada implementación de la API y el SDK para un lenguaje específico sigue los
  requisitos y expectativas de la
  [Especificación de OpenTelemetry](/docs/specs/otel/).
- Las [Convenciones Semánticas](../semantic-conventions/) proporcionan un
  esquema de nombres común que se puede usar para la estandarización en bases de
  código y plataformas.

[logs]: ../signals/logs/
[metrics]: ../signals/metrics/
[observable]: ../observability-primer/#what-is-observability
[signals]: ../signals/
[traces]: ../signals/traces/
