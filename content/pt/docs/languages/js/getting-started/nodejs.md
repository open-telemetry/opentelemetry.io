---
title: Node.js
description: Obtenha telemetria para sua aplicação em menos de 5 minutos!
aliases: [/docs/js/getting_started/nodejs]
weight: 10
default_lang_commit: 1f6a173c26d1e194696ba77e95b6c3af40234952
cSpell:ignore: autoinstrumentations KHTML rolldice
---

Esta página mostrará como começar a usar o OpenTelemetry no Node.js.

Você aprenderá como instrumentar [rastros][] e [métricas][] e exibi-los no
console.

{{% alert title="Nota" color="info" %}} A biblioteca para logs do OpenTelemetry
para Node.js ainda está em desenvolvimento, portanto, este exemplo não será
fornecido a seguir. Consulte [esta página](/docs/languages/js) para mais
informações sobre o status do OpenTelemetry para JavaScript. {{% /alert %}}

## Pré-requisitos {#prerequisites}

Certifique-se de que você tenha instalado localmente:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), caso esteja utilizando
  TypeScript.

## Exemplo de Aplicação {#example-application}

O exemplo a seguir utiliza uma aplicação básica com
[Express](https://expressjs.com/). Caso não esteja utilizando o Express, não se
preocupe — você pode usar o OpenTelemetry JavaScript com outros _frameworks_
web, como Koa e Nest.JS. Para uma lista completa de bibliotecas para
_frameworks_ suportados, consulte o
[registro](/ecosystem/registry/?component=instrumentation&language=js).

Para exemplos mais elaborados, consulte
[exemplos](/docs/languages/js/examples/).

### Dependências {#dependencies}

Para começar, configure um arquivo vazio `package.json` em um novo diretório:

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

# inicialização do typescript
npx tsc --init
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### Crie e inicie um servidor HTTP {#create-and-launch-an-http-server}

Crie um arquivo chamado `app.ts` (ou `app.js`, caso não esteja utilizando
TypeScript) e adicione o seguinte código:

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
  console.log(`Aguardando requisições em http://localhost:${PORT}`);
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
  console.log(`Aguardando requisições em http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% /tabpane %}}

Execute a aplicação utilizando o comando abaixo e acesse
<http://localhost:8080/rolldice> no seu navegador para garantir que esteja
funcionando.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node app.ts
Aguardando requisições em http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Aguardando requisições em http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## Instrumentação {#instrumentation}

A seguir, mostramos como instalar, inicializar e executar uma aplicação
instrumentada com OpenTelemetry.

### Mais dependências {#more-dependencies}

Primeiro, instale os pacotes do Node SDK e das autoinstrumentações.

O Node SDK permite que você inicialize o OpenTelemetry com diversas
configurações padrão que são suficientes para a maioria dos casos de uso.

O pacote `auto-instrumentations-node` instala as bibliotecas de instrumentação
que irão criar automaticamente trechos correspondentes ao código chamado nas
bibliotecas. Neste caso, ele fornece instrumentação para o Express, permitindo
que a aplicação de exemplo crie trechos automaticamente para cada requisição
recebida.

```shell
npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
```

Para encontrar todos os módulos de autoinstrumentação, você pode consultar o
[registro](/ecosystem/registry/?language=js&component=instrumentation).

### Configuração {#setup}

A configuração e inicialização da instrumentação devem ser executadas **antes**
do código da sua aplicação. Uma ferramenta frequentemente utilizada para essa
tarefa é a _flag_
[--require](https://nodejs.org/api/cli.html#-r---require-module).

Crie um arquivo chamado `instrumentation.ts` (ou `instrumentation.js`, caso não
esteja utilizando TypeScript), que deverá conter o código de configuração de
instrumentação.

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
// Requer dependências
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

## Execute a aplicação instrumentada {#run-the-instrumented-app}

Agora você poderá executar a aplicação normalmente, mas poderá usar a _flag_
`--require` para carregar a instrumentação antes do código da aplicação.
Certifique-se de que não haja conflitos na utilização da _flag_ `--require`,
como, por exemplo, a variável de ambiente `NODE_OPTIONS` já possuir algo como
`--require @opentelemetry/auto-instrumentations-node/register`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node --require ./instrumentation.ts app.ts
Aguardando requisições em http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --require ./instrumentation.js app.js
Aguardando requisições em http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Acesse <http://localhost:8080/rolldice> no seu navegador e recarregue a página
algumas vezes. Depois de um tempo, você deverá ver os trechos exibidos no
console pelo `ConsoleSpanExporter`.

<details>
<summary>Ver exemplo de saída</summary>

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

O trecho gerado rastreia o tempo de vida de uma requisição para a rota
`/rolldice`.

Envie mais algumas requisições para esta rota. Depois de um tempo, você poderá
visualizar métricas na saída do console, como as seguintes:

<details>
<summary>Ver exemplo de saída</summary>

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

## Próximos passos {#next-steps}

Enriqueça a instrumentação gerada automaticamente com a
[instrumentação manual](/docs/languages/js/instrumentation) na sua base de
código. Isso lhe proporcionará dados de observabilidade personalizados.

Você também poderá configurar um exportador apropriado para
[exportar seus dados de telemetria](/docs/languages/js/exporters) para um ou
mais _backends_ de telemetria.

Caso queira explorar um exemplo mais complexo, dê uma olhada no
[OpenTelemetry Demo](/docs/demo/), que inclui o
[Serviço de Pagamento](/docs/demo/services/payment/) em JavaScript e o
[Serviço Frontend](/docs/demo/services/frontend/) em TypeScript.

## Soluções de problemas {#troubleshooting}

Algo deu errado? Você pode habilitar o _logging_ de diagnóstico para validar se
o OpenTelemetry está inicializado corretamente:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Para solução de problemas, defina o nível de log como DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
// Requer dependências
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Para solução de problemas, defina o nível de log como DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[rastros]: /docs/concepts/signals/traces/
[métricas]: /docs/concepts/signals/metrics/
