---
title: Añadiendo al registro
linkTitle: Añadir
description: Cómo agregar entradas al registro.
default_lang_commit: 1a6db8fe3a989fa20267368336aceb5665b4394b
cSpell:ignore: zpages
---

¿Mantienes o contribuyes a una integración para OpenTelemetry? ¡Nos encantaría
incluir tu proyecto en el [registro](../)!

Para añadir tu proyecto, envía una [solicitud de registro][]. Necesitarás crear
un archivo de datos en [data/registry][] para tu proyecto, usando la siguiente
plantilla: [registry-entry.yml][].

Asegúrate de que los nombres y descripciones de tus proyectos cumplan con
nuestras [directrices de marketing][] y con las [directrices de uso de marca
registrada][] de la Linux Foundation.

## Tipos de registro {#registry-types}

Al añadir tu proyecto al registro, debes especificar un `registryType`. Este
campo categoriza tu proyecto según su relación con OpenTelemetry. A
continuación, se muestran los posibles valores y sus definiciones:

### `integración de aplicaciones` {#application-integration}

**Usar para**: Aplicaciones o servicios que tienen OpenTelemetry integrado de
forma nativa (soporte integrado) sin necesidad de plugins externos ni
bibliotecas de instrumentación.

**Ejemplos**: Consulta la lista de integraciones de aplicaciones nativas en la
página [Integraciones](/ecosystem/integrations/).

{{% alert title="Nota" %}}

Este es el único tipo de registro que permite licencias
comerciales/propietarias.

{{% /alert %}}

### `core` {#core}

**Usar para**: Solo componentes principales del proyecto OpenTelemetry. Esto
nunca se aplica a componentes de terceros ni a componentes de proyectos que no
sean de OpenTelemetry.

### `exportador` {#exporter}

**Usar para**: Componentes exportadores del Collector de OpenTelemetry o
bibliotecas exportadoras dentro de SDK específicos del lenguaje.

**Ejemplos**: Exportadores OTLP, exportadores Prometheus o cualquier componente
que envíe datos de telemetría a sistemas externos.

**Nota**: No aplicable a componentes de terceros que exportan datos de
telemetría.

### `extensión` {#extension}

**Usar para**: Extensiones del Collector o del SDK que amplían la funcionalidad
de OpenTelemetry.

**Ejemplos**: Autenticadores, orígenes/proveedores de configuración,
descubrimiento de servicios, comprobaciones de estado/pprof/zpages u otros
componentes que mejoran el comportamiento del Collector/SDK.

### `instrumentación` {#instrumentation}

**Usar para**: Bibliotecas de instrumentación o instrumentaciones nativas para
bibliotecas/marcos de trabajo específicos.

**Ejemplos**: Instrumentación HTTP, instrumentación de base de datos,
instrumentación específica del marco de trabajo o agentes de
autoinstrumentación, según corresponda.

### `log-bridge` {#log-bridge}

**Usar para**: Adaptadores específicos del lenguaje que conectan marcos/API de
registro existentes con el registro de OpenTelemetry, lo que permite que las
aplicaciones emitan registros de OTel a través de las API de registro
habituales.

**Ejemplos**: Puentes/controladores/anexadores para marcos como Java
SLF4J/Log4j/Logback, registro de Python, JavaScript Winston/Pino y Go
log/slog/zap.

### `procesador` {#processor}

**Usar para**: Componentes del procesador del Collector de OpenTelemetry.

**Ejemplos**: Procesadores por lotes, procesadores de atributos, procesadores de
muestreo o cualquier componente que procese datos de telemetría dentro de la
canalización del Collector.

### `proveedor` {#provider}

**Usar para**: Componentes del proveedor del Collector de OpenTelemetry.

**Ejemplos**: Proveedores de configuración, proveedores de credenciales o
cualquier componente que proporcione recursos o configuración al Collector.

### `receptor` {#receiver}

**Usar para**: Componentes receptores del Collector de OpenTelemetry.

**Ejemplos**: Receptores OTLP, receptores Prometheus o cualquier componente que
reciba datos de telemetría de fuentes externas.

{{% alert title="Nota" %}}

No aplicable a componentes de terceros que reciben telemetría de OpenTelemetry.

{{% /alert %}}

### `detector de recursos` {#resource-detector}

**Usar para**: Detectores de recursos para SDK específicos del lenguaje.

**Ejemplos**: Detectores de recursos de AWS, detectores de recursos de GCP o
cualquier componente que detecte y agregue automáticamente información de
recursos a la telemetría.

### `utilidades` {#utilities}

**Usar para**: Cualquier otra herramienta que permita trabajar con
OpenTelemetry.

**Ejemplos**: Utilidades de prueba, herramientas de depuración, herramientas de
migración o cualquier biblioteca auxiliar que facilite el trabajo con
OpenTelemetry.

[data/registry]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/registry
[solicitud de registro]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry-entry.yml]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/templates/registry-entry.yml
[directrices de marketing]: /community/marketing-guidelines/
[directrices de uso de marca registrada]:
  https://www.linuxfoundation.org/legal/trademark-usage
