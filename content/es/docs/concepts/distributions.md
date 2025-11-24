---
title: Distribuciones
description: >-
  Una distribución, que no debe confundirse con un fork, es una versión
  personalizada de un componente de OpenTelemetry.
weight: 190
default_lang_commit: 55f9c9d07ba35c241048ffc0d756d67843d68805
---

Los proyectos de OpenTelemetry consisten en múltiples
[componentes](../components) que soportan múltiples [señales](../signals). La
implementación de referencia de OpenTelemetry está disponible como:

- [Librerías de instrumentación específicas por lenguaje](../instrumentation)
- Un archivo [binario de colector](/docs/concepts/components/#collector)

Cualquier implementación de referencia puede ser personalizada como una
distribución.

## ¿Qué es una distribución? {#what-is-a-distribution}

Una distribución es una versión personalizada de un componente de OpenTelemetry.
Una distribución es un envoltorio alrededor de un repositorio upstream de
OpenTelemetry con algunas personalizaciones. Las distribuciones no deben
confundirse con _forks_.

Las personalizaciones en una distribución pueden incluir:

- Scripts para facilitar el uso o personalizar el uso para un backend o
  proveedor específico.
- Cambios en la configuración predeterminada requeridos para un backend,
  proveedor o usuario final.
- Opciones de empaquetado adicionales que pueden ser específicas de un proveedor
  o usuario final.
- Cobertura adicional de pruebas, rendimiento y seguridad más allá de lo que
  ofrece OpenTelemetry.
- Capacidades adicionales más allá de lo que ofrece OpenTelemetry.
- Menos capacidades de las que ofrece OpenTelemetry.

Las distribuciones en general caen en las siguientes categorías:

- **"Pura":** Estas distribuciones proporcionan la misma funcionalidad que el
  _upstream_ y son 100% compatibles. Las personalizaciones generalmente mejoran
  la facilidad de uso o el empaquetado. Estas personalizaciones pueden ser
  específicas de un backend, proveedor o usuario final.
- **"Plus":** Estas distribuciones proporcionan funcionalidades adicionales
  sobre el upstream a través de componentes adicionales. Ejemplos incluyen
  librerías de instrumentación o exportadores de proveedores que no han sido
  integrados al proyecto de OpenTelemetry.
- **"Minus":** Estas distribuciones proporcionan un subconjunto de funcionalidad
  del upstream. Ejemplos de esto incluyen la eliminación de librerías de
  instrumentación o receptores, procesadores, exportadores o extensiones que se
  encuentran en el proyecto de OpenTelemetry Collector. Estas distribuciones
  pueden ser proporcionadas para aumentar las consideraciones de soporte y
  seguridad.

## ¿Quién puede crear una distribución? {#who-can-create-a-distribution}

Cualquiera puede crear una distribución. Hoy en día, varios
[proveedores](/ecosystem/vendors/) ofrecen
[distribuciones](/ecosystem/distributions/). Además, los usuarios finales pueden
considerar crear una distribución si desean utilizar componentes en el
[Registro](/ecosystem/registry/) que no han sido integrados al proyecto de
OpenTelemetry.

## ¿Contribución o distribución? {#contribution-or-distribution}

Antes de seguir leyendo y aprender cómo crear tu propia distribución, pregúntate
si tus aportes sobre un componente de OpenTelemetry serían beneficiosas para
todos y, por lo tanto, deberían incluirse en las implementaciones de referencia:

- ¿Pueden generalizarse tus scripts para "facilitar el uso"?
- ¿Pueden tus cambios en la configuración predeterminada ser la mejor opción
  para todos?
- ¿Son realmente específicas tus opciones de empaquetado adicionales?
- ¿Podrían tus coberturas adicionales de pruebas, rendimiento y seguridad
  funcionar también con la implementación de referencia?
- ¿Has consultado con la comunidad si tus capacidades adicionales podrían formar
  parte del estándar?

## Creando tu propia distribución {#creating-your-own-distribution}

### Colector {#collector}

Una guía sobre cómo crear tu propia distribución está disponible en este
artículo:
["Building your own OpenTelemetry Collector distribution"](https://medium.com/p/42337e994b63)

Si estás creando tu propia distribución,
[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
podría ser un buen punto de partida.

### Librerías de instrumentación específicas por lenguaje {#language-specific-instrumentation-libraries}

Existen mecanismos de extensibilidad específicos por lenguaje para personalizar
las librerías de instrumentación:

- [Agente de Java](/docs/zero-code/java/agent/extensions)

## Sigue las pautas {#follow-the-guidelines}

Al usar material del proyecto OpenTelemetry, como el logotipo y el nombre para
tu distribución, asegúrate de estar alineado con las [Pautas de Marketing de
OpenTelemetry para Organizaciones Contribuyentes][guidelines].

El proyecto OpenTelemetry no certifica distribuciones en este momento. En el
futuro, OpenTelemetry podría certificar distribuciones y socios de manera
similar al proyecto Kubernetes. Al evaluar una distribución, asegúrate de que
usar la distribución no resulte en un bloqueo con el proveedor.

> Cualquier soporte para una distribución proviene de los autores de la
> distribución y no de los autores de OpenTelemetry.

[guidelines]:
  https://github.com/open-telemetry/community/blob/main/marketing-guidelines.md
