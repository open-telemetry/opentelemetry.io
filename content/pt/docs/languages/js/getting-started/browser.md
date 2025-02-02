---
title: Navegador
aliases: [/docs/js/getting_started/browser]
description: Aprenda como adicionar o OpenTelemetry à sua aplicação de navegador
weight: 20
default_lang_commit: 7cb1bd39726fc03698164ee17fe9087afdac054c
---

{{% alert title="Aviso" color="warning" %}}
{{% param notes.browser-instrumentation %}} {{% /alert %}}

Embora este guia utilize o exemplo de aplicação apresentada abaixo, as etapas
para instrumentar a sua própria aplicação devem ser similares.

## Pré-requisitos {#prerequisites}

Certifique-se de que você tenha instalado localmente:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), caso esteja utilizando
  TypeScript.

## Exemplo de aplicação {#example-application}

Este é um guia muito simples. Caso deseje visualizar exemplos mais complexos,
consulte o repositório
[examples/opentelemetry-web](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web).

Copie o conteúdo a seguir em um arquivo em um diretório vazio e salve-o como
`index.html`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Exemplo de Instrumentação ao Carregar Documento</title>
    <base href="/" />
    <!--
      https://www.w3.org/TR/trace-context/
      Defina o `traceparent` no código do template HTML do servidor. Ele
      deve ser gerado dinamicamente pelo servidor para conter o ID do rastro
      da requisição do servidor, um ID de trecho pai que foi definido no trecho
      da requisição do servidor e as flags de rastro para indicar a decisão de
      amostragem do servidor (01 = amostrado, 00 = não amostrado).
      '{versão}-{IDDoRastro}-{IDDoTrecho}-{decisãoDeAmostragem}''
    -->
    <meta
      name="traceparent"
      content="00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    Exemplo de utilização do Tracer Web com instrumentação do carregamento de
    documento com Exporter de Console e Exporter de Collector
  </body>
</html>
```

### Instalação {#installation}

Para criar rastros no navegador, você precisará do
`@opentelemetry/sdk-trace-web` e da instrumentação
`@opentelemetry/instrumentation-document-load`:

```shell
npm init -y
npm install @opentelemetry/api \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/instrumentation-document-load \
  @opentelemetry/context-zone
```

### Inicialização e configuração {#initialization-and-configuration}

Caso esteja escrevendo seu código em TypeScript, execute o seguinte comando:

```shell
tsc --init
```

Em seguida, adicione o [parcel](https://parceljs.org/), que permitirá (entre
outras coisas) que você trabalhe com TypeScript.

```shell
npm install --save-dev parcel
```

Crie um arquivo de código vazio chamado `document-load` com a extensão `.ts` ou
`.js`, conforme apropriado, com base na linguagem que você escolheu para
escrever sua aplicação. Adicione o seguinte código ao seu HTML, logo antes da
tag de fechamento `</body>`:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```html
<script type="module" src="document-load.ts"></script>
```

{{% /tab %}} {{% tab JavaScript %}}

```html
<script type="module" src="document-load.js"></script>
```

{{% /tab %}} {{< /tabpane >}}

Adicionaremos o código para rastrear os tempos de carregamento do documento e
relatar esses dados como trechos OpenTelemetry.

### Criando um Tracer Provider {#creating-a-tracer-provider}

Adicione o seguinte código ao arquivo `document-load.ts|js` para criar um Tracer
Provider, que trará a instrumentação para rastrear o tempo de carregamento do
documento:

```js
/* arquivo document-load.ts|js - este trecho do código é o mesmo para ambas as linguagens */
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider();

provider.register({
  // Alterando o contextManager padrão para utilizar o ZoneContextManager - oferece suporte para operações assíncronas - opcional
  contextManager: new ZoneContextManager(),
});

// Registrando instrumentações
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

Agora crie a aplicação com parcel:

```shell
npx parcel index.html
```

e acesse o servidor web de desenvolvimento (por exemplo, em
`http://localhost:1234`) para validar se o seu código funciona.

Ainda não haverá saída de rastros, para isso precisamos adicionar um exportador.

### Criando um Exporter {#creating-an-exporter}

No exemplo a seguir, utilizaremos o `ConsoleSpanExporter` que exibe todos os
trechos no console.

Para visualizar e analisar seus rastros, você precisará exportá-los para um
_backend_ de rastreamento. Siga [estas instruções](../../exporters) para
configurar um _backend_ e um exportador.

Você também pode utilizar o `BatchSpanProcessor` para exportar trechos em lotes
de forma a utilizar os recursos mais eficientemente.

Para exportar os rastros para o console, modifique o arquivo
`document-load.ts|js` para que corresponda ao seguinte trecho de código:

```js
/* arquivo document-load.ts|js - o código é o mesmo para ambas as linguagens */
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
  // Alterando o contextManager padrão para utilizar o ZoneContextManager - oferece suporte para operações assíncronas - opcional
  contextManager: new ZoneContextManager(),
});

// Registrando instrumentações
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

Agora, reconstrua sua aplicação e abra o navegador novamente. No console da
barra de ferramentas do desenvolvedor, você deverá ver alguns rastros sendo
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

### Adicionar instrumentações {#add-instrumentations}

Caso deseje instrumentar requisições Ajax, interações do usuário e outros, é
possível registrar instrumentações adicionais para esses elementos:

```javascript
registerInstrumentations({
  instrumentations: [
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});
```

## Pacotes Meta para Web {#meta-packages-for-web}

Para aproveitar as instrumentações mais comuns em um único lugar, você pode
simplesmente usar os
[Pacotes Meta do OpenTelemetry para Web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web).
