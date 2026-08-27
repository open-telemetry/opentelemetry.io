---
title: Instrumentación sin código para Python
linkTitle: Python
weight: 30
aliases: [/docs/languages/python/automatic]
cascade:
  collector_vers: 0.158.0
default_lang_commit: 2d447daa701636c3246c116d4b8c4a2f2c35de60
drifted_from_default: true
cSpell:ignore: distro
---

La instrumentación automática con Python utiliza un agente de Python que se
puede adjuntar a cualquier aplicación Python. Este agente utiliza principalmente
[monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) para modificar
funciones de librerías en tiempo de ejecución, lo que permite capturar datos de
telemetría de muchas librerías y frameworks populares.

## Instalación {#setup}

Ejecuta los siguientes comandos para instalar los paquetes correspondientes.

```sh
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

El paquete `opentelemetry-distro` instala la API, el SDK y las herramientas
`opentelemetry-bootstrap` y `opentelemetry-instrument`.

> [!NOTE]
>
> Debes instalar un paquete distro para que la instrumentación automática
> funcione. El paquete `opentelemetry-distro` contiene la distro predeterminada
> para configurar automáticamente algunas de las opciones más comunes. Para más
> información, consulta [OpenTelemetry distro](/docs/languages/python/distro/).

El comando `opentelemetry-bootstrap -a install` lee la lista de paquetes
instalados en tu carpeta activa `site-packages` e instala las librerías de
instrumentación correspondientes para esos paquetes, si procede. Por ejemplo, si
ya instalaste el paquete `flask`, al ejecutar
`opentelemetry-bootstrap -a install` se instalará
`opentelemetry-instrumentation-flask` por ti. El agente de OpenTelemetry para
Python utilizará monkey patching para modificar funciones de estas librerías en
tiempo de ejecución.

Ejecutar `opentelemetry-bootstrap` sin argumentos muestra la lista de librerías
de instrumentación recomendadas para instalar. Para más información, consulta
[`opentelemetry-bootstrap`](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap).

> [!WARNING] ¿Usas `uv`?
>
> Si utilizas el gestor de paquetes [uv](https://docs.astral.sh/uv/), podrías
> experimentar problemas al ejecutar `opentelemetry-bootstrap -a install`. Para
> más detalles, consulta
> [Bootstrap usando uv](troubleshooting/#bootstrap-using-uv).

{#configuring-the-agent}

## Configuración del agente {#configuring-the-agent}

El agente es altamente configurable.

Una opción es configurar el agente mediante propiedades de configuración desde
la CLI:

```sh
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name your-service-name \
    --exporter_otlp_endpoint 0.0.0.0:4317 \
    python myapp.py
```

Alternativamente, puedes usar variables de entorno para configurar el agente:

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=console,otlp \
OTEL_METRICS_EXPORTER=console \
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=0.0.0.0:4317
opentelemetry-instrument \
    python myapp.py
```

Para ver todas las opciones de configuración, consulta la
[Configuración del agente](configuration).

## Librerías y frameworks compatibles {#supported-libraries-and-frameworks}

Muchas librerías populares de Python se instrumentan automáticamente, entre
ellas
[Flask](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-flask)
y
[Django](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-django).
Para ver la lista completa, consulta el
[Registry](/ecosystem/registry/?language=python&component=instrumentation).

## Solución de problemas {#troubleshooting}

Para pasos generales de solución de problemas y soluciones a problemas
específicos, consulta [Solución de problemas](./troubleshooting/).
