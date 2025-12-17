---
title: Node.js
description: Obtenha telemetria para sua aplicação em menos de 5 minutos!
aliases: [/docs/js/getting_started/nodejs]
weight: 10
default_lang_commit: 6ffcc4d3f434c2af67e1983ec732fc700052a93d
cSpell:ignore: autoinstrumentations rolldice
---

Esta página mostrará como começar a usar o OpenTelemetry no Node.js.

Você aprenderá como instrumentar [rastros][] e [métricas][] e exibi-los no
console.

{{% alert title="Nota" %}} A biblioteca para logs do OpenTelemetry para Node.js
ainda está em desenvolvimento, portanto, um exemplo não será fornecido a seguir.
Para informações sobre o status, consulte
[Estado e Lançamentos](/docs/languages/js/#status-and-releases). {{% /alert %}}

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
npm install express @types/express
npm install -D tsx  # ferramenta para executar arquivos TypeScript (.ts) diretamente com node
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
$ npx tsx app.ts
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
tarefa é a _flag_ [--import](https://nodejs.org/api/cli.html#--importmodule).

Crie um arquivo chamado `instrumentation.ts` (ou `instrumentation.mjs`, caso não
esteja utilizando TypeScript), que deverá conter o código de configuração de
instrumentação.

{{% alert title="Nota" %}} Os exemplos a seguir que utilizam a _flag_
`--import instrumentation.ts` (TypeScript) requerem Node.js v.20 ou superior. Se
você estiver utilizando Node.js v.18, por favor, utilize o exemplo em
JavaScript. {{% /alert %}}

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
/*instrumentation.mjs*/
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

{{% /tab %}} {{< /tabpane >}}

## Execute a aplicação instrumentada {#run-the-instrumented-app}

Agora você poderá executar a aplicação normalmente, mas poderá usar a _flag_
`--import` para carregar a instrumentação antes do código da aplicação.
Certifique-se de que não haja outras _flags_ conflitantes para `--import` ou
`--require`, como, por exemplo, já possuir algo como
`--require @opentelemetry/auto-instrumentations-node/register` na variável de
ambiente `NODE_OPTIONS`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx --import ./instrumentation.ts app.ts
Aguardando requisições em http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --import ./instrumentation.js app.js
Aguardando requisições em http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Acesse <http://localhost:8080/rolldice> no seu navegador e recarregue a página
algumas vezes. Depois de um tempo, você deverá ver os trechos exibidos no
console pelo `ConsoleSpanExporter`.

<details>
<summary>Ver exemplo de saída</summary>

```js
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // ... alguns atributos de recursos foram omitidos ...
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-express',
    version: '0.52.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: {
    traceId: '61e8960c349ca2a3a51289e050fd3b82',
    spanId: '631b666604f933bc',
    traceFlags: 1,
    traceState: undefined
  },
  traceState: undefined,
  name: 'request handler - /rolldice',
  id: 'd8fcc05ac4f60c99',
  kind: 0,
  timestamp: 1755719307779000,
  duration: 2801.5,
  attributes: {
    'http.route': '/rolldice',
    'express.name': '/rolldice',
    'express.type': 'request_handler'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // ... alguns atributos de recursos foram omitidos ...
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-http',
    version: '0.203.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET /rolldice',
  id: '631b666604f933bc',
  kind: 1,
  timestamp: 1755719307777000,
  duration: 4705.75,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    'http.host': 'localhost:8080',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.scheme': 'http',
    'http.target': '/rolldice',
    'http.user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 8080,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 63067,
    'http.status_code': 200,
    'http.status_text': 'OK',
    'http.route': '/rolldice'
  },
  status: { code: 0 },
  events: [],
  links: []
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
    description: 'Measures the duration of inbound HTTP requests.',
    unit: 'ms',
    valueType: 1,
    advice: {}
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 200,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719307, 782000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.439792,
        max: 5.775,
        sum: 15.370167,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 5, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 6
      }
    },
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 304,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719433, 609000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.39575,
        max: 1.39575,
        sum: 1.39575,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 1
      }
    }
  ]
}
{
  descriptor: {
    name: 'nodejs.eventloop.utilization',
    type: 'OBSERVABLE_GAUGE',
    description: 'Event loop utilization',
    unit: '1',
    valueType: 1,
    advice: {}
  },
  dataPointType: 2,
  dataPoints: [
    {
      attributes: {},
      startTime: [ 1755719362, 939000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: 0.00843049454565211
    }
  ]
}
{
  descriptor: {
    name: 'v8js.gc.duration',
    type: 'HISTOGRAM',
    description: 'Garbage collection duration by kind, one of major, minor, incremental or weakcb.',
    unit: 's',
    valueType: 1,
    advice: { explicitBucketBoundaries: [ 0.01, 0.1, 1, 10 ] }
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: { 'v8js.gc.type': 'minor' },
      startTime: [ 1755719303, 5000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0005120840072631835,
        max: 0.0022552499771118163,
        sum: 0.006526499509811401,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 6, 0, 0, 0, 0 ] },
        count: 6
      }
    },
    {
      attributes: { 'v8js.gc.type': 'incremental' },
      startTime: [ 1755719310, 812000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0003403329849243164,
        max: 0.0012867081165313721,
        sum: 0.0016270411014556885,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    },
    {
      attributes: { 'v8js.gc.type': 'major' },
      startTime: [ 1755719310, 830000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0025888750553131105,
        max: 0.005744750022888183,
        sum: 0.008333625078201293,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    }
  ]
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
/*instrumentation.mjs*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Para solução de problemas, defina o nível de log como DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[rastros]: /docs/concepts/signals/traces/
[métricas]: /docs/concepts/signals/metrics/
