---
title: Node.js
description: Obtenha telemetria para seu aplicativo em menos de 5 minutos!
aliases: [/docs/js/getting_started/nodejs]
cSpell:ignore: autoinstrumentations KHTML rolldice
weight: 10
default_lang_commit: 2bda479b6ce77f51266845ade9fe1b431dfde0d3
---

Esta página mostrará como começar a usar o OpenTelemetry no Node.js.

Você aprenderá como instrumentar [rastros][] e [métricas][] e registrá-los
no console.

{{% alert title="Note" color="info" %}} A biblioteca de registro para OpenTelemetry
para Node.js ainda está em desenvolvimento, portanto, um exemplo para ela não é fornecido
abaixo. Olhe [aqui](/docs/languages/js) para mais informações sobre o status do
OpenTelemetry em JavaScript. {{% /alert %}}

## Pré-requisitos

Certifique-se de ter o seguinte instalado localmente:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), se você for usar
TypeScript.

## Exemplo de aplicação

O exemplo a seguir usa um básico [Express](https://expressjs.com/)
aplicação. Se você não estiver usando o Express, está OK — você pode usar OpenTelemetry
JavaScript com outras estruturas da web também, como Koa e Nest.JS. Para uma lista completa de bibliotecas para frameworks suportados, veja o
[registry](/ecosystem/registry/?component=instrumentation&language=js).

Para exemplos mais elaborados, veja [exemplos](/docs/languages/js/examples/).

### Dependências

Para começar, configure um em branco `package.json` em um novo diretório:

```shell
npm init -y
```

Em seguida, instale as dependências do Express.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm install typescript \
  ts-node \
  @types/node \
  express \
  @types/express

# initialize typescript
npx tsc --init
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### Crie e inicie um servidor HTTP

Crie um arquivo chamado `app.ts` (ou `app.js` se você não estiver usando TypeScript) e adicione o seguinte código a ele:

{{% tabpane text=true %}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { Express } from "express";

const PORT: number = parseInt(process.env.PORT || "8080");
const app: Express = express();

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get("/rolldice", (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require("express");

const PORT = parseInt(process.env.PORT || "8080");
const app = express();

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get("/rolldice", (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% /tabpane %}}

Execute o aplicativo com o seguinte comando e abra
<http://localhost:8080/rolldice> no seu navegador para garantir que está funcionando.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## Instrumentação

A seguir mostramos como instalar, iniciar, e rodar o aplicativo
instrumentado com OpenTelemetry.

### Mais dependências

Primeiro, instale o Node SDK e pacote de autoinstrumentações.

O Node SDK permite que você inicialize o OpenTelemetry com várias configurações
padrões que são corretos para a maioria dos casos de uso.

O `auto-instrumentação-node` pacote instala as bibliotecas de instrumentação que irão criar automaticamente Trechos correspondentes ao código chamado em bibliotecas. Neste caso, ele fornece instrumentação parao Express, permitindo que o aplicativo de exemplo crie automaticamente intervalos para cada solicitação recebida.

```shell
npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
```

Para encontrar todos os módulos de auto-instrumentação, você pode olhar o
[registro](/ecosystem/registry/?language=js&component=instrumentation).

### Configurar

A configuração da instrumentação e a configuração devem ser executadas _antes_ seu
código de aplicação. Uma ferramenta frequentemente utilizada para essa tarefa é a
[--require](https://nodejs.org/api/cli.html#-r---require-module) flag.

Crie um arquivo chamado `instrumentation.ts` (ou `instrumentation.js` se não estiver utilizando
TypeScript) , onde você colocará seu código de configuração de instrumentação.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from "@opentelemetry/sdk-metrics";

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
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require("@opentelemetry/sdk-metrics");

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

## Execute o aplicativo instrumentado

Agora você pode executar seu aplicativo normalmente, mas, você pode usar o 
`--require` sinalizador para carregar a instrumentação antes dos códigos de aplicação. Certifique-se
de que vocÊ não tem outros conflitos `--require` sinalizar como
`--require @opentelemetry/auto-instrumentations-node/register` no seu
`NODE_OPTIONS` variável de ambiente.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node --require ./instrumentation.ts app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --require ./instrumentation.js app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Abra <http://localhost:8080/rolldice> no seu navegador e recarregue a página
algumas vezes. Depois de um tempo você deverá ver os Trechos exibidos no console pelo
`ConsoleSpanExporter`.

<details>
<summary>View example output</summary>

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

O intervalo gerado rastreia o tempo de vida de uma solicitação para a `/rolldice` rota.

Envie mais algumas solicitações para o endpoint. Depois de um momento, você verá métricas na saída do console, como o seguinte:

<details>
<summary>View example output</summary>

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

## Próximos passos

Enriqueça sua instrumentação gerada automaticamente com 
[instrumentação manual](/docs/languages/js/instrumentation) da sua própria base de código.
Isso lhe dá dados de observabilidade personalizados.

Você também vai querer configurar um exportador apropriado para
[exporte seus dados de telemetria](/docs/languages/js/exporters) para um ou mais
backends de telemetria.

Se você quiser explorar um exemplo mais complexo, dê uma olhada no
[Demonstração OpenTelemetry ](/docs/demo/), que inclui o JavaScript baseado
[Serviço de Pagamento](/docs/demo/services/payment/) e o TypeScript baseado
[Serviço de Frontend](/docs/demo/services/frontend/).

## Soluções de Problemas

Algo deu errado ? Você pode habilitar o registro de diagnóstico para validar que o
OpenTelemetry foi inicializado corretamente:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
// Require dependencies
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[Rastros]: /docs/concepts/signals/traces/
[Metricas]: /docs/concepts/signals/metrics/
