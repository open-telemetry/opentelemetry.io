---
title: OpenTelemetry en hosts Linux
linkTitle: Linux
description:
  Instala OpenTelemetry como un paquete del sistema para instrumentar
  automáticamente las aplicaciones que se ejecutan en un host Linux.
weight: 250
default_lang_commit: edb244ceebdcbbb33c640eaac8d218dbc480e4c0
cSpell:ignore: instálalo metapackage
---

La configuración de OpenTelemetry suele depender de dónde se ejecutan tus
aplicaciones. Algunos entornos están altamente automatizados, como
[Kubernetes](/docs/platforms/kubernetes/), gracias al OpenTelemetry Operator, o
[Functions as a Service](/docs/platforms/faas/) con las capas de OpenTelemetry
Lambda. Pero muchas aplicaciones Java, .NET, Node.js y Python se ejecutan
directamente en hosts Linux, donde instrumentarlas tradicionalmente ha
significado descargar agentes manualmente y configurar variables de entorno tú
mismo.

El
[OpenTelemetry Packaging SIG](https://github.com/open-telemetry/opentelemetry-packaging)
proporciona **paquetes del sistema** que convierten a OpenTelemetry en una
dependencia del propio host. Después de instalar un único paquete y reiniciar
tus aplicaciones, los procesos Java, .NET, Node.js y Python del host se
instrumentan automáticamente y comienzan a emitir telemetría.

## Cómo funciona {#how-it-works}

El paquete `opentelemetry` es un _metapackage_ que depende de:

- El
  [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector),
  que configura el enlazador dinámico para que los runtimes admitidos carguen la
  auto-instrumentación correspondiente cuando se inicia un proceso.
- Los paquetes de auto-instrumentación específicos de cada lenguaje para Java,
  .NET, Node.js y Python.

Una vez instalado, el injector se adjunta a cada proceso nuevo enlazado
dinámicamente que se inicia en el host. Solo tiene un efecto visible en los
procesos de un runtime admitido, cargando la auto-instrumentación
correspondiente para ellos; los procesos de runtimes sin un SDK de OpenTelemetry
no se ven afectados. Las aplicaciones que ya estaban en ejecución se
instrumentan después de reiniciarse. Por defecto, la telemetría se exporta
mediante OTLP a `localhost` en los puertos `4317` (gRPC) y `4318` (HTTP), por lo
que normalmente ejecutas un [OpenTelemetry Collector](/docs/collector/) local
para recibirla y reenviarla. El propio Collector se distribuye como paquetes del
sistema a través del proyecto
[OpenTelemetry Collector Releases](https://github.com/open-telemetry/opentelemetry-collector-releases);
su integración en este repositorio de paquetes del sistema se rastrea en
[opentelemetry-collector-releases#1561](https://github.com/open-telemetry/opentelemetry-collector-releases/issues/1561).

Los SIG de Packaging y OBI también planean ofrecer
[OpenTelemetry eBPF Instrumentation](/docs/zero-code/obi/) como un paquete del
sistema, extendiendo la instrumentación sin código a runtimes adicionales como
Go, Rust y C++.

## Primeros pasos {#get-started}

- [Instalación](installation/): añade el repositorio e instala el paquete en
  Debian, Ubuntu, Fedora o RHEL y derivados.
- [Configuración](configuration/): apunta el injector a tu Collector o backend y
  ajusta qué se instrumenta.

## Estado y limitaciones {#status-and-limitations}

> [!WARNING]
>
> Los paquetes del sistema están en una etapa temprana de su desarrollo y **aún
> no están pensados para cargas de trabajo de producción**. Es muy probable que
> haya cambios a medida que madura el proceso de empaquetado.
>
> En concreto:
>
> - Los repositorios APT y YUM están alojados actualmente en GitHub Pages, lo
>   cual **no es su ubicación definitiva**.
> - Los paquetes **aún no están firmados**, por lo que las instrucciones de
>   instalación deshabilitan la verificación de firmas.
> - El [OpenTelemetry Collector](/docs/collector/) todavía no forma parte del
>   _metapackage_ base; por ahora, instálalo y ejecútalo por separado.
>
> El Packaging SIG está buscando activamente comentarios de los usuarios
> finales. Prueba los paquetes y abre issues en el repositorio
> [opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging).

## Más información {#learn-more}

- Entrada de blog:
  [One-command OpenTelemetry setup on Linux hosts](/blog/2026/packaging-first-repo/)
- El repositorio
  [opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging)
  y su reunión semanal del SIG.
