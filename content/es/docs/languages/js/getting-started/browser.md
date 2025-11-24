---
title: Navegador
aliases: [/docs/js/getting_started/browser]
description: Aprende cómo agregar OpenTelemetry a tu aplicación de navegador.
weight: 20
default_lang_commit: 1ececa0615b64c5dfd93fd6393f3e4052e0cc496
drifted_from_default: true
---

{{% include browser-instrumentation-warning.md %}}

Aunque esta guía utiliza la aplicación de ejemplo presentada a continuación, los
pasos para instrumentar tu propia aplicación deberían ser similares.

## Requisitos previos

Asegúrate de tener lo siguiente instalado localmente:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), si vas a utilizar
  TypeScript.

## Aplicación de ejemplo

Esta es una guía muy simple; si deseas ver ejemplos más complejos, ve a
[examples/opentelemetry-web](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web).

Copia el siguiente archivo en un directorio vacío y llámalo `index.html`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Ejemplo de instrumentación de carga del documento</title>
    <base href="/" />
    <!--
      https://www.w3.org/TR/trace-context/
      Set the `traceparent` in the server's HTML template code. It should be
      dynamically generated server side to have the server's request trace ID,
      a parent span ID that was set on the server's request span, and the trace
      flags to indicate the server's sampling decision
      (01 = sampled, 00 = not sampled).
      '{version}-{traceId}-{spanId}-{sampleDecision}'
    -->
    <meta
      name="traceparent"
      content="00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    Ejemplo de uso de Web Tracer con instrumentación de carga del documento,
    utilizando el exportador a consola y el exportador al colector.
  </body>
</html>
```

### Instalación

Para crear trazas en el navegador, necesitarás `@opentelemetry/sdk-trace-web`, y
la instrumentación `@opentelemetry/instrumentation-document-load`:

```shell
npm init -y
npm install @opentelemetry/api \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/instrumentation-document-load \
  @opentelemetry/context-zone
```

### Inicialización y configuración

Si estás programando en TypeScript, ejecuta el siguiente comando:

```shell
tsc --init
```

Luego, instala [parcel](https://parceljs.org/), que te permitirá, entre otras
cosas, trabajar con TypeScript.

```shell
npm install --save-dev parcel
```

Crea un archivo de código vacío llamado `document-load` con una extensión `.ts`
o `.js`, según corresponda, dependiendo del lenguaje que hayas elegido para
desarrollar tu aplicación. Agrega el siguiente código a tu archivo HTML justo
antes de la etiqueta de cierre `</body>`:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```html
<script type="module" src="document-load.ts"></script>
```

{{% /tab %}} {{% tab JavaScript %}}

```html
<script type="module" src="document-load.js"></script>
```

{{% /tab %}} {{< /tabpane >}}

Agregaremos un poco de código que rastreará los tiempos de carga del documento y
los mostrará como Spans de OpenTelemetry.

### Creación de un proveedor de Tracer

Agrega el siguiente código a `document-load.ts|js` para crear un proveedor de
tracer, que habilita la instrumentación para rastrear la carga del documento:

```js
/* Archivo  document-load.ts|js - El fragmento de código es el mismo para ambos lenguajes */
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider();

provider.register({
  // Cambiar el contextManager predeterminado para usar ZoneContextManager – admite operaciones asíncronas – opcional
  contextManager: new ZoneContextManager(),
});

// Registro de instrumentaciones
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

Ahora compila la aplicación con Parcel:

```shell
npx parcel index.html
```

y abre el servidor web de desarrollo (por ejemplo, en `http://localhost:1234`)
para verificar si tu código funciona.

Aún no habrá salida de trazas; para ello, necesitamos agregar un exportador.

### Creación de un exportador

En el siguiente ejemplo, usaremos `ConsoleSpanExporter`, que imprime todos los
spans en la consola.

Para visualizar y analizar tus trazas, necesitarás exportarlos a un backend de
trazas. Sigue [estas instrucciones](../../exporters) para configurar un backend
y un exportador.

También podrías querer usar `BatchSpanProcessor` para exportar los spans en
lotes y así utilizar los recursos de manera más eficiente.

Para exportar trazas a la consola, modifica `document-load.ts|js` para que
coincida con el siguiente fragmento de código:

```js
/* Archivo document-load.ts|js - El fragmento de código es el mismo para ambos lenguajes */
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

provider.register({
  // Cambiar el contextManager predeterminado para usar ZoneContextManager – admite operaciones asíncronas – opcional.
  contextManager: new ZoneContextManager(),
});

// Registering instrumentations
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

Ahora, vuelve a compilar tu aplicación y abre el navegador nuevamente. En la
consola de las herramientas de desarrollador deberías ver algunas trazas siendo
exportados:

```json
{
  "traceId": "ab42124a3c573678d4d8b21ba52df3bf",
  "parentId": "cfb565047957cb0d",
  "name": "documentFetch",
  "id": "5123fc802ffb5255",
  "kind": 0,
  "timestamp": 1606814247811266,
  "duration": 9390,
  "attributes": {
    "component": "document-load",
    "http.response_content_length": 905
  },
  "status": {
    "code": 0
  },
  "events": [
    {
      "name": "fetchStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "domainLookupStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "domainLookupEnd",
      "time": [1606814247, 811266158]
    },
    {
      "name": "connectStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "connectEnd",
      "time": [1606814247, 811266158]
    },
    {
      "name": "requestStart",
      "time": [1606814247, 819101158]
    },
    {
      "name": "responseStart",
      "time": [1606814247, 819791158]
    },
    {
      "name": "responseEnd",
      "time": [1606814247, 820656158]
    }
  ]
}
```

### Agregar instrumentaciones

Si deseas instrumentar solicitudes Ajax, interacciones del usuario y otros
eventos, puedes registrar instrumentaciones adicionales para ello:

```javascript
registerInstrumentations({
  instrumentations: [
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});
```

## Meta paquetes para la web

Para aprovechar las instrumentaciones más comunes en un solo paquete, puedes
simplemente usar los
[Meta paquetes de OpenTelemetry para la web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web)
