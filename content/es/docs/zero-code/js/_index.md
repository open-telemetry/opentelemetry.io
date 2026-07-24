---
title: Instrumentación sin código para JavaScript
linkTitle: JavaScript
description:
  Captura la telemetría de tu aplicación sin modificar el código fuente
aliases: [/docs/languages/js/automatic]
default_lang_commit: 6bf06ddb9fc057dd6e8092f26d988ffe7b1af5ed
---

La instrumentación sin código para JavaScript ofrece una forma de instrumentar
cualquier aplicación Node.js y capturar datos de telemetría de muchas librerías
y frameworks populares sin ningún cambio en el código.

## Instalación

Ejecuta los siguientes comandos para instalar los paquetes correspondientes.

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/auto-instrumentations-node
```

Los paquetes `@opentelemetry/api` y `@opentelemetry/auto-instrumentations-node`
instalan la API, el SDK y las herramientas de instrumentación.

## Configuración del módulo

El módulo es altamente configurable.

Una opción es configurar el módulo utilizando `env` para establecer variables de
entorno desde la CLI:

```shell
env OTEL_TRACES_EXPORTER=otlp OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=your-endpoint \
node --require @opentelemetry/auto-instrumentations-node/register app.js
```

Como alternativa, puedes usar `export` para establecer las variables de entorno:

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_ENDPOINT="your-endpoint"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
export OTEL_SERVICE_NAME="your-service-name"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node app.js
```

De forma predeterminada, se utilizan todos los
[detectores de recursos](/docs/languages/js/resources/) del SDK. Puedes usar la
variable de entorno `OTEL_NODE_RESOURCE_DETECTORS` para habilitar solo ciertos
detectores o para deshabilitar su uso por completo.

Para ver todas las opciones de configuración, consulta la
[Configuración del módulo](configuration).

## Librerías y frameworks compatibles

Varias librerías populares de Node.js se instrumentan automáticamente. Para ver
la lista completa, consulta las
[instrumentaciones compatibles](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/auto-instrumentations-node#supported-instrumentations).

## Solución de problemas

Puedes establecer el nivel de registro configurando la variable de entorno
`OTEL_LOG_LEVEL` con uno de los siguientes valores:

- `none`
- `error`
- `warn`
- `info`
- `debug`
- `verbose`
- `all`

El nivel predeterminado es `info`.

> [!NOTE]
>
> - En un entorno de producción, se recomienda establecer `OTEL_LOG_LEVEL` en
>   `info`.
> - Los logs siempre se envían a `console`, sin importar el entorno o el nivel
>   de depuración.
> - Los logs de depuración son extremadamente detallados y pueden afectar
>   negativamente el rendimiento de tu aplicación. Habilita el registro de
>   depuración solo cuando sea necesario.
