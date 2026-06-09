---
title: Propagação
description: Propagação de contexto para o SDK JS
weight: 65
default_lang_commit: 2b99811a310f2749a5b6389f5e4d654a4f2e2f8e
cSpell:ignore: desserializado rolldice
---

{{% docs/languages/propagation %}}

{{% include esm-support-note.md %}}

## Propagação automática de contexto {#automatic-context-propagation}

[Bibliotecas de instrumentação](../libraries/) como
[`@opentelemetry/instrumentation-http`](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
ou
[`@opentelemetry/instrumentation-express`](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
propagam o contexto entre serviços por você.

Se você seguiu o [Guia de Primeiros Passos](../getting-started/nodejs), pode
criar uma aplicação cliente que consulta o _endpoint_ `/rolldice`.

> [!NOTE]
>
> Você também pode combinar este exemplo com a aplicação de exemplo do guia de
> Primeiros Passos de qualquer outra linguagem. A correlação funciona entre
> aplicações escritas em linguagens diferentes sem nenhuma diferença.

Comece criando uma nova pasta chamada `dice-client` e instale as dependências
necessárias:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
npm install -D tsx  # uma ferramenta para executar arquivos TypeScript (.ts) diretamente com node
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
```

{{% /tab %}} {{< /tabpane >}}

Em seguida, crie um novo arquivo chamado `client.ts` (ou `client.js`) com o
seguinte conteúdo:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/* client.ts */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

import { request } from 'undici';

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json: any) => console.log(json));
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/* instrumentation.mjs */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

const { request } = require('undici');

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json) => console.log(json));
});
```

{{% /tab %}} {{% /tabpane %}}

Certifique-se de que a versão instrumentada de `app.ts` (ou `app.js`) do
[Primeiros Passos](../getting-started/nodejs) esteja em execução em um terminal:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx --import ./instrumentation.ts app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --import ./instrumentation.mjs app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Abra um segundo terminal e execute o `client.ts` (ou `client.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```shell
npx tsx client.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```shell
node client.js
```

{{% /tab %}} {{< /tabpane >}}

Ambos os terminais devem emitir detalhes dos trechos no console. A saída do
cliente é semelhante à seguinte:

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET',
  id: '6f64ce484217a7bf',
  kind: 2,
  timestamp: 1718875320295000,
  duration: 19836.833,
  attributes: {
    'url.full': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

Anote o traceId (`cccd19c3a2d10e589f01bfe2dc896dc2`) e o ID
(`6f64ce484217a7bf`). Ambos também podem ser encontrados na saída do cliente:

```javascript {hl_lines=[6,9]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: {
    traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
    spanId: '6f64ce484217a7bf',
    traceFlags: 1,
    isRemote: true
  },
  traceState: undefined,
  name: 'GET /rolldice',
  id: '027c5c8b916d29da',
  kind: 1,
  timestamp: 1718875320310000,
  duration: 3894.792,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

Suas aplicações cliente e servidora relatam com sucesso trechos conectados. Se
você enviar ambas para um _backend_ agora, a visualização mostrará essa
dependência para você.

## Propagação manual de contexto {#manual-context-propagation}

Em alguns casos, não é possível propagar o contexto automaticamente como
descrito na seção anterior. Pode não existir uma biblioteca de instrumentação
correspondente à biblioteca que você usa para fazer os serviços se comunicarem
entre si. Ou você pode ter requisitos que essas bibliotecas não conseguem
atender, mesmo que existissem.

Quando você precisa propagar o contexto manualmente, pode usar a
[API de Contexto](/docs/languages/js/context).

### Exemplo genérico {#generic-example}

O exemplo genérico a seguir demonstra como você pode propagar o contexto do
rastro manualmente.

Primeiro, no serviço de envio, você precisa injetar o `context` atual:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// Serviço de envio
import { context, propagation, trace } from '@opentelemetry/api';

// Define uma interface para o objeto de saída que conterá as informações do rastro.
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// Cria um objeto de saída que segue essa interface.
const output: Carrier = {};

// Serializa o traceparent e o tracestate do contexto para
// um objeto de saída.
//
// Este exemplo usa o contexto de rastro ativo, mas você pode
// usar o contexto que for apropriado ao seu cenário.
propagation.inject(context.active(), output);

// Extrai os valores de traceparent e tracestate do objeto de saída.
const { traceparent, tracestate } = output;

// Em seguida, você pode passar os dados de traceparent e
// tracestate para o mecanismo que você usa para propagar
// entre serviços.
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// Serviço de envio
const { context, propagation } = require('@opentelemetry/api');
const output = {};

// Serializa o traceparent e o tracestate do contexto para
// um objeto de saída.
//
// Este exemplo usa o contexto de rastro ativo, mas você pode
// usar o contexto que for apropriado ao seu cenário.
propagation.inject(context.active(), output);

const { traceparent, tracestate } = output;
// Em seguida, você pode passar os dados de traceparent e
// tracestate para o mecanismo que você usa para propagar
// entre serviços.
```

{{% /tab %}} {{< /tabpane >}}

No serviço de recebimento, você precisa extrair o `context` (por exemplo, de
cabeçalhos HTTP analisados) e defini-lo como o contexto de rastro atual.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// Serviço de recebimento
import {
  type Context,
  propagation,
  trace,
  Span,
  context,
} from '@opentelemetry/api';

// Define uma interface para o objeto de entrada que inclui 'traceparent' e 'tracestate'.
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// Suponha que "input" seja um objeto com as chaves 'traceparent' e 'tracestate'.
const input: Carrier = {};

// Extrai os dados de 'traceparent' e 'tracestate' para um objeto de contexto.
//
// Em seguida, você pode tratar este contexto como o contexto ativo para os
// seus rastros.
let activeContext: Context = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span: Span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// Define o trecho criado como ativo no contexto desserializado.
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// Serviço de recebimento
import { context, propagation, trace } from '@opentelemetry/api';

// Suponha que "input" seja um objeto com as chaves 'traceparent' e 'tracestate'
const input = {};

// Extrai os dados de 'traceparent' e 'tracestate' para um objeto de contexto.
//
// Em seguida, você pode tratar este contexto como o contexto ativo para os
// seus rastros.
let activeContext = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// Define o trecho criado como ativo no contexto desserializado.
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{< /tabpane >}}

A partir daí, quando você tem um contexto ativo desserializado, pode criar
trechos que farão parte do mesmo rastro do outro serviço.

Você também pode usar a [API de Contexto](/docs/languages/js/context) para
modificar ou definir o contexto desserializado de outras formas.

### Exemplo de protocolo personalizado {#custom-protocol-example}

Um caso de uso comum para quando você precisa propagar o contexto manualmente é
quando você usa um protocolo personalizado de comunicação entre serviços. O
exemplo a seguir usa um protocolo TCP básico baseado em texto para enviar um
objeto serializado de um serviço para outro.

Comece criando uma nova pasta chamada `propagation-example` e inicialize-a com
as dependências da seguinte forma:

```shell
npm init -y
npm install @opentelemetry/api @opentelemetry/sdk-node
```

Em seguida, crie os arquivos `client.js` e `server.js` com o seguinte conteúdo:

```javascript
// client.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('client');

// Conecta ao servidor
const client = net.createConnection({ port: 8124 }, () => {
  // Envia o objeto serializado para o servidor
  let span = tracer.startActiveSpan('send', { kind: 1 }, (span) => {
    const output = {};
    propagation.inject(context.active(), output);
    const { traceparent, tracestate } = output;

    const objToSend = { key: 'value' };

    if (traceparent) {
      objToSend._meta = { traceparent, tracestate };
    }

    client.write(JSON.stringify(objToSend), () => {
      client.end();
      span.end();
    });
  });
});
```

```javascript
// server.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('server');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const message = data.toString();
    // Analisa o objeto JSON recebido do cliente
    try {
      const json = JSON.parse(message);
      let activeContext = context.active();
      if (json._meta) {
        activeContext = propagation.extract(context.active(), json._meta);
        delete json._meta;
      }
      span = tracer.startSpan('receive', { kind: 1 }, activeContext);
      trace.setSpan(activeContext, span);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    } finally {
      span.end();
    }
  });
});

// Escuta na porta 8124
server.listen(8124, () => {
  console.log('Server listening on port 8124');
});
```

Abra um primeiro terminal para executar o servidor:

```console
$ node server.js
Server listening on port 8124
```

Depois, em um segundo terminal, execute o cliente:

```shell
node client.js
```

O cliente deve encerrar imediatamente e o servidor deve exibir o seguinte:

```text
Parsed JSON: { key: 'value' }
```

Como o exemplo até aqui dependeu apenas da API do OpenTelemetry, todas as
chamadas a ela são [instruções _no-op_](https://pt.wikipedia.org/wiki/NOP) e o
cliente e o servidor se comportam como se o OpenTelemetry não estivesse sendo
usado.

> [!IMPORTANT]
>
> Isto é especialmente importante se o código do seu servidor e cliente forem
> bibliotecas, já que elas devem usar apenas a API do OpenTelemetry. Para
> entender o porquê, leia a
> [página de conceito sobre como adicionar instrumentação à sua biblioteca](/docs/concepts/instrumentation/libraries/).

Para habilitar o OpenTelemetry e ver a propagação de contexto em ação, crie um
arquivo adicional chamado `instrumentation.js` com o seguinte conteúdo:

```javascript
// instrumentation.mjs
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

sdk.start();
```

Use este arquivo para executar tanto o servidor quanto o cliente com a
instrumentação habilitada:

```console
$ node --import ./instrumentation.mjs server.js
Server listening on port 8124
```

e

```shell
node --import ./instrumentation.mjs client.js
```

Depois que o cliente enviar os dados para o servidor e encerrar, você verá
trechos na saída do console de ambos os terminais.

A saída do cliente é semelhante à seguinte:

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: undefined,
  traceState: undefined,
  name: 'send',
  id: '92f125fa335505ec',
  kind: 1,
  timestamp: 1718879823424000,
  duration: 1054.583,
  // ...
}
```

A saída do servidor é semelhante à seguinte:

```javascript {hl_lines=[7,8]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: '92f125fa335505ec',
  traceState: undefined,
  name: 'receive',
  id: '53da0c5f03cb36e5',
  kind: 1,
  timestamp: 1718879823426000,
  duration: 959.541,
  // ...
}
```

Assim como no [exemplo manual](#manual-context-propagation), os trechos são
conectados usando o `traceId` e o `id`/`parentId`.

## Próximos passos {#next-steps}

Para saber mais sobre propagação, leia a
[especificação da API de Propagadores](/docs/specs/otel/context/api-propagators/).
