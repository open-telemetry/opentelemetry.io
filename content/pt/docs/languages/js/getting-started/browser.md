---
title: Navegador
aliases: [/docs/js/getting_started/browser]
description: Aprenda como adicionar OpenTelemetry para seu aplicativo de navegador
weight: 20
default_lang_commit: 06837fe15457a584f6a9e09579be0f0400593d57
---

{{% alert title="Warning" color="warning" %}}
{{% _param notes.browser-instrumentation %}} {{% /alert %}}

Enquanto este guia utiliza o exemplo de aplicação apresentado abaixo, os passos para instrumentar sua própria aplicação devem ser similares.

## Pré-requisitos

Certifique-se de que você tem instalado localmente:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), se você for usar
  TypeScript.

## Exemplo de Aplicação

Este é um guia muito simples, se você quiser ver exemplos mais complexos, vá para
[examples/opentelemetry-web](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web).

Copie o seguinte arquivo em um diretório vazio e chame-o `index.html`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Document Load Instrumentation Example</title>
    <base href="/" />
    <!--
      https://www.w3.org/TR/trace-context/
      Set the `traceparent` in the server's HTML template code. It should be
      dynamically generated server side to have the server's request trace Id,
      a parent span Id that was set on the server's request span, and the trace
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
    Example of using Web Tracer with document load instrumentation with console
    exporter and collector exporter
  </body>
</html>
```

### Instalação

Para criar rastros no navegador, você irá precisar `@opentelemetry/sdk-trace-web`,
e a instrumentação `@opentelemetry/instrumentation-document-load`:

```shell
npm init -y
npm install @opentelemetry/api \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/instrumentation-document-load \
  @opentelemetry/context-zone
```

### Inicialização e Configuração

Se você estiver codificando em TypeScript, execute o seguinte comando:

```shell
tsc --init
```

Então adicione [parcel](https://parceljs.org/), que (entre outras coisas) permitirá que você trabalhe com TypeScript.

```shell
npm install --save-dev parcel
```

Crie um arquivo de código vazio chamado `document-load` com a extensão `.ts` ou `.js`,
com base no idioma que você escolheu para escrever seu aplicativo. Adicione o seguinte código ao seu HTML logo antes do `</body>` fechando tag:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```html
<script type="module" src="document-load.ts"></script>
```

{{% /tab %}} {{% tab JavaScript %}}

```html
<script type="module" src="document-load.js"></script>
```

{{% /tab %}} {{< /tabpane >}}

Implementaremos código para monitorar os tempos de carregamento do documento e relatar esses dados como Spans OpenTelemetry.

### Criando um Provedor de Rastros

Adicione o seguinte código ao `document-load.ts|js` para criar um provedor de rastros,
que traz a instrumentação para rastrear a carga do documento:

```js
/* document-load.ts|js file - the code snippet is the same for both the languages */
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

const provider = new WebTracerProvider();

provider.register({
  // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
  contextManager: new ZoneContextManager(),
});

// Registering instrumentations
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

Agora crie o aplicativo com parcel:

```shell
npx parcel index.html
```

e abra o servidor de desenvolvimento web (e.g. at `http://localhost:1234`) para ver se o seu código funciona.

Ainda não haverá saída de rastros, para isso precisamos adicionar um exportador.

### Criando um Exportador

No exemplo a seguir, usaremos o `ConsoleSpanExporter` que imprime todos os
spans no console.

Para visualizar e analisar seus rastros, você precisará exportá-los para um
backend de rastreamento. Seguir [estas instruções](../../exporters) para configurar um
backend e exportador.

Você também pode querer usar o `BatchSpanProcessor` para exportar trechos em lotes para usar os recursos de forma mais eficiente..

Para exportar rastros para o console, modifique `document-load.ts|js` para que corresponda
ao seguinte trecho de código:

```js
/* document-load.ts|js file - the code is the same for both the languages */
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

const provider = new WebTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register({
  // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
  contextManager: new ZoneContextManager(),
});

// Registering instrumentations
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

Agora, reconstrua seu aplicativo e abra o navegador novamente. No console da
barra de ferramentas do desenvolvedor, você deve ver alguns rastros sendo exportados:

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

### Adicionar Instrumentações

Se você quiser instrumentar solicitações Ajax, interações do usuário e outros, você pode
registrar instrumentações adicionais para eles:

```javascript
registerInstrumentations({
  instrumentations: [
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});
```

## Meta Pacotes para Web

Para aproveitar as instrumentações mais comuns em um só lugar, você pode simplesmente usar o
[OpenTelemetry Meta Pacotes para Web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web)
