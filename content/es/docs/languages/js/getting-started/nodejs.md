---
title: Node.js
description: ¡Obtén telemetría para tu aplicación en menos de 5 minutos!
aliases: [/docs/js/getting_started/nodejs]
weight: 10
default_lang_commit: 788277e362bc602b72a90aa9191f9c05c403458e
drifted_from_default: true
cSpell:ignore: autoinstrumentaciones autoinstrumentación rolldice
---

Esta página te mostrará cómo comenzar con OpenTelemetry en Node.js.

Aprenderás cómo instrumentar tanto [trazas][] como [métricas][] y registrarlas
en la consola.

{{% alert title="Nota" %}} La biblioteca de registro (logging) de OpenTelemetry
para Node.js aún está en desarrollo, por lo que no se proporciona un ejemplo en
este documento. Para conocer el estado, consulta
[Estado y versiones](/docs/languages/js/#status-and-releases). {{% /alert %}}

## Requisitos previos

Asegúrate de tener instalados localmente las siguientes dependencias:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), si vas a usar
  TypeScript.

## Aplicación de ejemplo

El siguiente ejemplo utiliza una aplicación básica de
[Express](https://expressjs.com/). Si no estás usando Express, no hay problema,
ya que también puedes usar OpenTelemetry JavaScript con otros frameworks web,
como Koa y Nest.JS. Para obtener una lista completa de las bibliotecas
compatibles con otros frameworks, consulta el
[registro](/ecosystem/registry/?component=instrumentation&language=js).

Para ver ejemplos más elaborados, consulta la sección de
[Ejemplos](/docs/languages/js/examples/).

### Dependencias

Para comenzar, configura un `package.json` vacío en un nuevo directorio:

```shell
npm init -y
```

A continuación, instala las dependencias de Express.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm install typescript \
  ts-node \
  @types/node \
  express \
  @types/express

# Inicializa typescript
npx tsc --init
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### Crea y lanza un servidor HTTP

Crea un archivo llamado `app.ts` (o `app.js` si no usas TypeScript) y añade lo
siguiente:

{{% tabpane text=true %}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { Express } from 'express';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Escuchando solicitudes en http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Escuchando solicitudes en http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% /tabpane %}}

Ejecuta la aplicación con el siguiente comando y abre
<http://localhost:8080/rolldice> en tu navegador web para asegurarte de que
funciona.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node app.ts
Escuchando solicitudes en http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Escuchando solicitudes en http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## Instrumentación

Lo siguiente muestra cómo instalar, inicializar y ejecutar una aplicación
instrumentada con OpenTelemetry.

### Mas dependencias

Primero, instala el paquete Node SDK y el paquete de autoinstrumentaciones.

El Node SDK te permite inicializar OpenTelemetry con varias configuraciones
predeterminadas que son adecuadas para la mayoría de los casos de uso.

El paquete `auto-instrumentations-node` instala bibliotecas de instrumentación
que crearán automáticamente spans correspondientes al código llamado en
bibliotecas. En este caso, proporciona instrumentación para Express, lo que
permite que la aplicación de ejemplo cree spans automáticamente para cada
solicitud entrante.

```shell
npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
```

Para encontrar todos los módulos de autoinstrumentación, puedes consultar el
[registro](/ecosystem/registry/?language=js&component=instrumentation).

### Configuración

La configuración e inicialización de la instrumentación debe ejecutarse _antes_
que el código de tu aplicación. Una herramienta comúnmente utilizada para esta
tarea es la opción
[--require](https://nodejs.org/api/cli.html#-r---require-module).

Crea un archivo llamado `instrumentation.ts` (o `instrumentation.js` si no usas
TypeScript), que contendrá el código de configuración de tu instrumentación.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
// Require dependencies
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## Ejecutar la aplicación instrumentada

Ahora puedes ejecutar tu aplicación como lo harías normalmente, pero puedes usar
la opción `--require` para cargar la instrumentación antes del código de la
aplicación. Asegúrate de no tener otras opciones `--require` en conflicto, como
`--require @opentelemetry/auto-instrumentations-node/register` en tu variable de
entorno `NODE_OPTIONS`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node --require ./instrumentation.ts app.ts
Escuchando solicitudes en http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --require ./instrumentation.js app.js
Escuchando solicitudes en http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Abre <http://localhost:8080/rolldice> en tu navegador web y recarga la página
varias veces. Después de un momento, deberías ver los spans impresos en la
consola por el `ConsoleSpanExporter`.

<details>
<summary>Ver salida de ejemplo</summary>

```json
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "middleware - query",
  "id": "41a27f331c7bfed3",
  "kind": 0,
  "timestamp": 1624982589722992,
  "duration": 417,
  "attributes": {
    "http.route": "/",
    "express.name": "query",
    "express.type": "middleware"
  },
  "status": { "code": 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "middleware - expressInit",
  "id": "e0ed537a699f652a",
  "kind": 0,
  "timestamp": 1624982589725778,
  "duration": 673,
  "attributes": {
    "http.route": "/",
    "express.name": "expressInit",
    "express.type": "middleware"
  },
  "status": { code: 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "request handler - /",
  "id": "8614a81e1847b7ef",
  "kind": 0,
  "timestamp": 1624982589726941,
  "duration": 21,
  "attributes": {
    "http.route": "/",
    "express.name": "/",
    "express.type": "request_handler"
  },
  "status": { code: 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": undefined,
  "name": "GET /",
  "id": "f0b7b340dd6e08a7",
  "kind": 1,
  "timestamp": 1624982589720260,
  "duration": 11380,
  "attributes": {
    "http.url": "http://localhost:8080/",
    "http.host": "localhost:8080",
    "net.host.name": "localhost",
    "http.method": "GET",
    "http.route": "",
    "http.target": "/",
    "http.user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "http.flavor": "1.1",
    "net.transport": "ip_tcp",
    "net.host.ip": "::1",
    "net.host.port": 8080,
    "net.peer.ip": "::1",
    "net.peer.port": 61520,
    "http.status_code": 304,
    "http.status_text": "NOT MODIFIED"
  },
  "status": { "code": 1 },
  "events": []
}
```

</details>

El span generado rastrea la duración de una solicitud a la ruta `/rolldice`.

Envía algunas solicitudes más al endpoint. Después de un momento, verás métricas
en la salida de la consola, como las siguientes:

<details>
<summary>Ver salida de ejemplo</summary>

```yaml
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the inbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the outbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'The number of connections that are currently in the state referenced by the attribute "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
}
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the inbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the outbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'The number of connections that are currently in the state referenced by the attribute "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
}
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the inbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the outbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'The number of connections that are currently in the state referenced by the attribute "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
}
```

</details>

## Próximos pasos

Enriquece tu instrumentación generada automáticamente con
[instrumentación manual](/docs/languages/js/instrumentation) de tu propio
código. Esto te permitirá obtener datos de observabilidad personalizados.

También querrás configurar un exporter apropiado para
[enviar tus datos de telemetría](/docs/languages/js/exporters) a uno o más
backends de telemetría.

Si deseas explorar un ejemplo más complejo, revisa la
[demostración de OpenTelemetry](/docs/demo/), que incluye el
[servicio de pagos](/docs/demo/services/payment/) basado en JavaScript y el
[servicio de interfaz (frontend)](/docs/demo/services/frontend/) basado en
TypeScript.

## Solución de problemas

¿Algo salió mal? Puedes habilitar el registro de diagnóstico para verificar que
OpenTelemetry se inicializa correctamente:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Para la solución de problemas, configura el nivel de registro en DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
// Require dependencies
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[trazas]: /docs/concepts/signals/traces/
[métricas]: /docs/concepts/signals/metrics/
