---
title: Instrumentação
aliases:
  - /docs/languages/js/api/tracing
  - manual
weight: 30
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
description: Instrumentação para OpenTelemetry JavaScript
cSpell:ignore: dicelib instrumentacao Millis rolldice versao
---

{{% include instrumentation-intro.md %}}

{{% alert title="Nota" %}}

Nesta página você irá aprender como adicionar rastros, métricas e logs ao código
manualmente. No entanto, não é necessário utilizar apenas um tipo de
instrumentação: utilize a [instrumentação automática](/docs/zero-code/js/) para
começar e depois enriqueça o código com a instrumentação manual conforme
necessário.

Além disso, para bibliotecas das quais o código depende, não é necessário
escrever o código de instrumentação manualmente, pois elas podem vir com
OpenTelemetry integrado de forma nativa ou é possível utilizar
[bibliotecas de instrumentação](/docs/languages/js/libraries/).

{{% /alert %}}

## Preparação da aplicação de exemplo {#example-app}

Esta página utiliza uma versão modificada da aplicação de exemplo mostrada em
[Primeiros Passos](/docs/languages/js/getting-started/nodejs/) para auxiliar no
aprendizado sobre instrumentação manual.

Não é obrigatório utilizar a aplicação de exemplo: caso deseje instrumentar uma
aplicação ou biblioteca própria, basta seguir as instruções desta seção para
adaptar o processo ao seu código.

### Dependências {#example-app-dependencies}

Crie um arquivo `package.json` vazio do NPM em um novo diretório:

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

### Criar e iniciar um servidor HTTP {#create-and-launch-an-http-server}

Para destacar a diferença entre instrumentar uma biblioteca e uma aplicação,
separe a lógica de rolagem de dados em um arquivo de biblioteca, que será
importado como dependência pelo arquivo da aplicação.

Crie o arquivo de biblioteca chamado `dice.ts` (ou `dice.js` caso não esteja
utilizando TypeScript) e adicione o seguinte código:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

Crie o arquivo da aplicação chamado `app.ts` (ou `app.js` caso não esteja
utilizando TypeScript) e adicione o seguinte código:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("O parâmetro 'rolls' está ausente ou não é um número.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Escutando requisições em http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');
const { rollTheDice } = require('./dice.js');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("O parâmetro 'rolls' está ausente ou não é um número.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Escutando requisições em http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

Para garantir que tudo está funcionando, execute a aplicação com o seguinte
comando e abra <http://localhost:8080/rolldice?rolls=12> no navegador.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx app.ts
Escutando requisições em http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Escutando requisições em http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## Configuração de instrumentação manual {#manual-instrumentation-setup}

### Dependências {#dependencies}

Instale os pacotes da API do OpenTelemetry:

```shell
npm install @opentelemetry/api @opentelemetry/resources @opentelemetry/semantic-conventions
```

### Inicializar o SDK {#initialize-the-sdk}

{{% alert title="Note" %}} Caso esteja instrumentando uma biblioteca, **ignore
esta etapa**. {{% /alert %}}

Para instrumentar uma aplicação Node.js, instale o
[SDK OpenTelemetry para Node.js](https://www.npmjs.com/package/@opentelemetry/sdk-node):

```shell
npm install @opentelemetry/sdk-node
```

Antes que qualquer outro módulo da aplicação seja carregado, é necessário
inicializar o SDK. Caso o SDK não seja inicializado, ou seja inicializado tarde
demais, implementações _no-op_ (pronunciada "no-op", de "no operation",
significando "sem operação") serão fornecidas a qualquer biblioteca que obtenha
um Tracer ou Meter da API.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'nomeDoServico',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

Para fins de depuração (_debugging_) e desenvolvimento local, o exemplo a seguir
exporta telemetria para o console. Após concluir a configuração da
instrumentação manual, será necessário configurar um exportador apropriado para
[exportar os dados de telemetria da aplicação](/docs/languages/js/exporters/)
para um ou mais _backends_ de observabilidade.

O exemplo também define o atributo padrão obrigatório do SDK `service.name`, que
contém o nome lógico do serviço, e o atributo opcional (porém altamente
recomendado!) `service.version`, que contém a versão da API ou implementação do
serviço.

Existem métodos alternativos para definir atributos de recurso. Para mais
informações, consulte [Recursos](/docs/languages/js/resources/).

{{% alert title="Note" %}} Os exemplos a seguir que utilizam
`--import instrumentation.ts` (TypeScript) requerem Node.js v20 ou posterior.
Caso esteja utilizando Node.js v18, utilize o exemplo em JavaScript.
{{% /alert %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

Esta configuração básica ainda não tem efeito na aplicação. É necessário
adicionar código para [rastros](#traces), [métricas](#metrics) e/ou
[logs](#logs).

Também é possível registrar bibliotecas de instrumentação com o SDK
OpenTelemetry para Node.js a fim de gerar dados de telemetria para as
dependências. Para mais informações, veja
[Bibliotecas](/docs/languages/js/libraries/).

## Rastros {#traces}

### Inicializar rastros {#initialize-tracing}

{{% alert title="Nota" %}} Caso esteja instrumentando uma biblioteca, **ignore
esta etapa**. {{% /alert %}}

Para habilitar [rastros](/docs/concepts/signals/traces/) em uma aplicação, será
necessário ter um
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) inicializado,
que permitirá criar um [`Tracer`](/docs/concepts/signals/traces/#tracer).

Caso um `TracerProvider` não seja criado, as APIs do OpenTelemetry irão utilizar
uma implementação _no-op_ e não irão gerar dados. Conforme explicado a seguir, o
arquivo `instrumentation.ts` (ou `instrumentation.js`) deve incluir todo o
código de inicialização do SDK.

#### Node.js

Caso as instruções para [inicializar o SDK](#initialize-the-sdk) acima tenham
sido seguidas, já existe um `TracerProvider` configurado. É possível continuar
com [obter um Tracer](#acquiring-a-tracer).

#### Navegador {#browser}

{{% include browser-instrumentation-warning.md %}}

Primeiro, certifique-se de ter instalado os pacotes corretos:

```shell
npm install @opentelemetry/sdk-trace-web
```

Em seguida, atualize o arquivo `instrumentation.ts` (ou `instrumentation.js`)
para conter todo o código de inicialização do SDK:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'nome-do-servico',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  defaultResource,
  resourceFromAttributes,
} = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const {
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'nome-do-servico',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
```

{{% /tab %}} {{< /tabpane >}}

Será necessário gerar um pacote que inclua este arquivo na sua aplicação para
que seja possível utilizar os rastros em todo o restante da aplicação web.

Isso ainda não terá efeito algum na sua aplicação: é preciso criar
[trechos](#create-spans) para que a telemetria seja emitida.

#### Escolhendo o processador de trechos correto {#picking-the-right-span-processor}

Por padrão, o SDK do Node utiliza o `BatchSpanProcessor`, e este processador de
trechos também é escolhido no exemplo do SDK Web. O `BatchSpanProcessor`
processa trechos em lotes antes de serem exportados. Geralmente, este é o
processador correto a ser utilizado por uma aplicação.

Por outro lado, o `SimpleSpanProcessor` processa trechos conforme são criados.
Isso significa que se forem criados 5 trechos, cada um deles será processado e
exportado antes que o próximo seja criado no código. Esse comportamento pode ser
útil em cenários nos quais não se deseja correr o risco de perder um lote, ou ao
experimentar o OpenTelemetry em ambiente de desenvolvimento. No entanto, esta
escolha também pode gerar uma sobrecarga significativa, especialmente se os
trechos estiverem sendo exportados por uma rede — cada vez que um trecho é
criado, este trecho seria processado e enviado antes que a execução da aplicação
pudesse continuar.

Na maioria dos casos, utilize `BatchSpanProcessor` em vez de
`SimpleSpanProcessor`.

### Obtendo um Tracer {#acquiring-a-tracer}

Em qualquer parte da sua aplicação onde for escrito código de rastreamento
manual, deve-se chamar `getTracer` para obter um Tracer. Exemplo:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
//...

const tracer = opentelemetry.trace.getTracer(
  'nome-do-escopo-de-instrumentacao',
  'versao-do-escopo-de-instrumentacao',
);

// Agora é possível usar 'tracer' para fazer rastreamento!
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
//...

const tracer = opentelemetry.trace.getTracer(
  'nome-do-escopo-de-instrumentacao',
  'versao-do-escopo-de-instrumentacao',
);

// Agora é possível usar 'tracer' para fazer rastreamento!
```

{{% /tab %}} {{< /tabpane >}}

Os valores `nome-do-escopo-de-instrumentacao` e
`versao-do-escopo-de-instrumentacao` devem identificar exclusivamente o
[Escopo de Instrumentação](/docs/concepts/instrumentation-scope/), como o nome
de um pacote, módulo ou classe. O nome é obrigatório, enquanto a versão, embora
opcional, é recomendada.

De modo geral, recomenda-se chamar `getTracer` na aplicação sempre que for
necessário, em vez de exportar a instância de `tracer` para o restante do
código. Essa abordagem ajuda a evitar problemas mais complexos de carregamento
da aplicação quando há outras dependências envolvidas.

No caso da [aplicação de exemplo](#example-app), há dois pontos em que um Tracer
pode ser obtido com o Escopo de Instrumentação apropriado:

Primeiro, no _arquivo da aplicação_ `app.ts` (ou `app.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts {hl_lines=[6]}
/*app.ts*/
import { trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("O parâmetro 'rolls' está ausente ou não é um número.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Escutando requisições em http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js {hl_lines=[6]}
/*app.js*/
const { trace } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("O parâmetro 'rolls' está ausente ou não é um número.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Escutando requisições em http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

E segundo, no _arquivo de biblioteca_ `dice.ts` (ou `dice.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts {hl_lines=[4]}
/*dice.ts*/
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js {hl_lines=[4]}
/*dice.js*/
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

### Criar trechos (_spans_) {#create-spans}

Agora que os [Tracers](/docs/concepts/signals/traces/#tracer) foram
inicializados, é possível criar [trechos](/docs/concepts/signals/traces/#spans).

A API do OpenTelemetry JavaScript oferece dois métodos para criar trechos:

- [`tracer.startSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Tracer.html#startspan):
  Inicia um novo trecho sem defini-lo no contexto.
- [`tracer.startActiveSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Tracer.html#startactivespan):
  Inicia um novo trecho e executa a função de _callback_ fornecida, passando o
  trecho criado como primeiro argumento. O novo trecho é definido no contexto
  ativo enquanto a função é executada.

Na maioria dos casos, é preferível utilizar `tracer.startActiveSpan`, pois ele
gerencia automaticamente o contexto ativo.

O código a seguir ilustra como criar um trecho ativo.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { trace, type Span } from '@opentelemetry/api';

/* ... */

export function rollTheDice(rolls: number, min: number, max: number) {
  // Cria um trecho ativo. O trecho deve ser finalizado.
  return tracer.startActiveSpan('rollTheDice', (span: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // Certifique-se de encerrar o trecho!
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  // Cria um trecho ativo. O trecho deve ser finalizado.
  return tracer.startActiveSpan('rollTheDice', (span) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // Certifique-se de encerrar o trecho!
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

Caso as instruções utilizando a [aplicação de exemplo](#example-app) tenham sido
seguidas até este ponto, é possível copiar o código acima no arquivo de
biblioteca `dice.ts` (ou `dice.js`). Você poderá visualizar trechos sendo
emitidos pela sua aplicação.

Execute o comando abaixo para iniciar a aplicação e, em seguida, envie
requisições acessando <http://localhost:8080/rolldice?rolls=12> pelo navegador
ou utilizando o `curl`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

Após algum tempo, os trechos poderão ser vistos impressos no console pelo
`ConsoleSpanExporter`, similar a isto:

```js
{
  resource: {
    attributes: {
      'service.name': 'dice-server',
      'service.version': '0.1.0',
      // ...
    }
  },
  instrumentationScope: { name: 'dice-lib', version: undefined, schemaUrl: undefined },
  traceId: '30d32251088ba9d9bca67b09c43dace0',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'rollTheDice',
  id: 'cc8a67c2d4840402',
  kind: 0,
  timestamp: 1756165206470000,
  duration: 35.584,
  attributes: {},
  status: { code: 0 },
  events: [],
  links: []
}
```

### Criar trechos aninhados {#create-nested-spans}

[Trechos](/docs/concepts/signals/traces/#spans) aninhados permitem rastrear
operações que são aninhadas por natureza. Por exemplo, a função `rollOnce()`
abaixo representa uma operação aninhada. O exemplo a seguir cria um trecho
aninhado que rastreia `rollOnce()`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  // Cria um trecho ativo. O trecho deve ser finalizado.
  return tracer.startActiveSpan('rollTheDice', (parentSpan: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // Certifique-se de encerrar o trecho!
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

function rollTheDice(rolls, min, max) {
  // Cria um trecho ativo. O trecho deve ser finalizado.
  return tracer.startActiveSpan('rollTheDice', (parentSpan) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // Certifique-se de encerrar o trecho!
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

Este código cria um trecho filho para cada rolagem, tendo o ID do `parentSpan`
como seu ID de pai (_parent ID_):

```js
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ...
  },
  name: 'rollOnce:0',
  id: '36423bc1ce7532b0',
  timestamp: 1756165362215000,
  duration: 85.667,
  // ...
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ...
  },
  name: 'rollOnce:1',
  id: 'ed9bbba2264d6872',
  timestamp: 1756165362215000,
  duration: 16.834,
  // ...
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: undefined,
  name: 'rollTheDice',
  id: '38691692d6bc3395',
  timestamp: 1756165362214000,
  duration: 1022.209,
  // ...
}
```

### Criar trechos independentes {#create-independent-spans}

Os exemplos anteriores mostraram como criar um trecho ativo. Em alguns casos,
você vai querer criar trechos inativos que são irmãos uns dos outros, em vez de
serem aninhados.

```js
const doWork = () => {
  const span1 = tracer.startSpan('work-1');
  // realizar alguma operação
  const span2 = tracer.startSpan('work-2');
  // realizar mais alguma operação
  const span3 = tracer.startSpan('work-3');
  // realizar ainda mais operações

  span1.end();
  span2.end();
  span3.end();
};
```

Neste exemplo, `span1`, `span2` e `span3` são trechos irmãos e nenhum deles é
considerado o trecho ativo no momento. Eles compartilham o mesmo pai, em vez de
serem aninhados uns sob os outros.

Essa disposição pode ser útil caso você tenha unidades de trabalho que estão
agrupadas, mas são conceitualmente independentes umas das outras.

### Obter o trecho atual {#get-the-current-span}

Às vezes, é útil fazer algo com o [trecho](/docs/concepts/signals/traces/#spans)
atual/ativo em um determinado ponto na execução da aplicação.

```js
const activeSpan = opentelemetry.trace.getActiveSpan();

// fazer algo com o trecho ativo, opcionalmente encerrando-o se for apropriado para o caso de uso.
```

### Obter um trecho do contexto {#get-a-span-from-context}

Também pode ser útil obter o [trecho](/docs/concepts/signals/traces/#spans) de
um determinado contexto que não é necessariamente o trecho ativo.

```js
const ctx = getContextFromSomewhere();
const span = opentelemetry.trace.getSpan(ctx);

// fazer algo com o trecho adquirido, opcionalmente encerrando-o se for apropriado para o caso de uso.
```

### Atributos {#attributes}

[Atributos](/docs/concepts/signals/traces/#attributes) permitem anexar pares de
chave/valor a um [`Trecho`](/docs/concepts/signals/traces/#spans) para que ele
carregue mais informações sobre a operação atual que está sendo rastreada.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // Adiciona um atributo ao trecho
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // Adiciona um atributo ao trecho
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

Também é possível adicionar atributos a um trecho quando ele é criado:

```javascript
tracer.startActiveSpan(
  'app.new-span',
  { attributes: { attribute1: 'value1' } },
  (span) => {
    // realizar alguma operação...

    span.end();
  },
);
```

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollTheDice(rolls: number, min: number, max: number) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span: Span) => {
      /* ... */
    },
  );
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span) => {
      /* ... */
    },
  );
}
```

{{% /tab %}} {{< /tabpane >}}

#### Atributos semânticos {#semantic-attributes}

Existem convenções semânticas para trechos que representam operações em
protocolos bem conhecidos, como HTTP ou chamadas de banco de dados. As
convenções semânticas para esses trechos estão definidas na especificação em
[Convenções Semânticas de Rastreamento (_Trace semantic conventions_)](/docs/specs/semconv/general/trace/).
No exemplo deste guia, podem ser utilizados atributos de código fonte.

Primeiro, adicione o pacote de convenções semânticas como dependência da
aplicação:

```shell
npm install --save @opentelemetry/semantic-conventions
```

Adicione as seguintes importações no topo do arquivo da aplicação:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} from '@opentelemetry/semantic-conventions';
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} = require('@opentelemetry/semantic-conventions');
```

{{% /tab %}} {{< /tabpane >}}

Por fim, atualize o código para incluir os atributos semânticos:

```javascript
const doWork = () => {
  tracer.startActiveSpan('app.doWork', (span) => {
    span.setAttribute(ATTR_CODE_FUNCTION_NAME, 'doWork');
    span.setAttribute(ATTR_CODE_FILE_PATH, __filename);

    // Realizar alguma operação...

    span.end();
  });
};
```

### Eventos de trecho {#span-events}

Um [Evento de Trecho (_Span Event_)](/docs/concepts/signals/traces/#span-events)
é uma mensagem legível por humanos em um
[`Trecho`](/docs/concepts/signals/traces/#spans) que representa um evento
discreto, sem duração, que pode ser rastreado por um único carimbo de data e
hora (_timestamp_). Você pode pensar nisso como uma forma primitiva de log.

```js
span.addEvent('Executando algo');

const result = doWork();
```

Também é possível criar Eventos de Trecho com
[Atributos](/docs/concepts/signals/traces/#attributes):

```js
span.addEvent('some log', {
  'log.severity': 'error',
  'log.message': 'Data not found',
  'request.id': requestId,
});
```

### Links de trecho {#span-links}

[Trechos](/docs/concepts/signals/traces/#spans) podem ser criados com zero ou
mais [Links](/docs/concepts/signals/traces/#span-links) para outros Trechos que
estão casualmente relacionados. Um cenário comum é correlacionar um ou mais
rastros com o trecho atual.

```js
const someFunction = (spanToLinkFrom) => {
  const options = {
    links: [
      {
        context: spanToLinkFrom.spanContext(),
      },
    ],
  };

  tracer.startActiveSpan('app.someFunction', options, (span) => {
    // Executa alguma operação...

    span.end();
  });
};
```

### Estado de trecho {#span-status}

{{% include "span-status-preamble.md" %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Erro',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Erro',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{< /tabpane >}}

### Registrar exceções {#recording-exceptions}

Registrar exceções no momento em que ocorrem é uma boa prática, especialmente
quando combinado com a definição de [estado do trecho](#span-status).

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ...

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{< /tabpane >}}

### Usando `sdk-trace-base` e propagando manualmente o contexto do trecho {#using-sdk-trace-base-and-manually-propagating-span-context}

Em alguns casos, pode não ser possível utilizar o SDK do Node.js nem o SDK para
Web. A maior diferença, além do código de inicialização, é que será necessário
definir manualmente trechos como ativos no contexto atual para poder criar
trechos aninhados.

#### Inicializando rastreamento com `sdk-trace-base` {#initializing-tracing-with-sdk-trace-base}

A inicialização é semelhante a como seria feito com Node.js ou o SDK Web.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // Configura o Span Processor para enviar trechos ao exportador
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// Isso é o que será acessado em todo o código de instrumentação
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} = require('@opentelemetry/core');
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // Configura o Span Processor para enviar trechos ao exportador
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// Isso é o que será acessado em todo o código de instrumentação
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{< /tabpane >}}

Assim como os outros exemplos neste documento, isso exporta um Tracer que pode
ser usado em toda a aplicação.

#### Criando trechos aninhados com `sdk-trace-base` {#creating-nested-spans-with-sdk-trace-base}

Para criar trechos aninhados, é necessário definir qualquer trecho atualmente
criado como o trecho ativo no contexto atual. O uso de `startActiveSpan` não é
recomendado aqui, pois ele não define o trecho como ativo.

```javascript
const mainWork = () => {
  const parentSpan = tracer.startSpan('main');

  for (let i = 0; i < 3; i += 1) {
    doWork(parentSpan, i);
  }

  // Certifique-se de encerrar o trecho pai!
  parentSpan.end();
};

const doWork = (parent, i) => {
  // Para criar um trecho filho, é necessário marcar o trecho atual (pai) como o trecho ativo
  // no contexto, e então utilizar o contexto resultante para criar um trecho filho.
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent,
  );
  const span = tracer.startSpan(`doWork:${i}`, undefined, ctx);

  // simular alguma operação aleatória.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // vazio
  }

  // Certifique-se de encerrar o span filho! Se não o fizer,
  // ele continuará a rastrear as operações além de 'doWork'!
  span.end();
};
```

Todas as outras APIs se comportam da mesma forma ao usar o `sdk-trace-base`, em
comparação com os SDKs do Node.js ou Web.

## Métricas {#metrics}

As [métricas](/docs/concepts/signals/metrics) combinam medições individuais em
agregados, gerando dados constantes independentemente da carga do sistema. Os
agregados não contêm detalhes suficientes para diagnosticar problemas de baixo
nível, mas complementam os trechos ao ajudar a identificar tendências e fornecer
telemetria sobre o tempo de execução da aplicação.

### Inicializar métricas {#initialize-metrics}

{{% alert %}} Caso esteja instrumentando uma biblioteca, ignore esta etapa.
{{% /alert %}}

Para ativar [métricas](/docs/concepts/signals/metrics/) em sua aplicação, é
necessário inicializar um
[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider), que permitirá
criar um [`Meter`](/docs/concepts/signals/metrics/#meter).

Caso um `MeterProvider` não seja criado, as APIs do OpenTelemetry para métricas
utilizarão uma implementação _no-op_ (pronunciada "no-op", de "no operation",
significando "sem operação") e não conseguirão gerar dados. Conforme explicado a
seguir, modifique o arquivo `instrumentation.ts` (ou `instrumentation.js`) para
incluir todo o código de inicialização do SDK no Node e no navegador.

#### Node.js {#initialize-metrics-nodejs}

Caso tenha seguido as instruções para [inicializar o SDK](#initialize-the-sdk)
acima, você já possui um `MeterProvider` configurado. É possível continuar com
[Obtendo um Meter](#acquiring-a-meter).

##### Inicializando métricas com `sdk-metrics` {#initializing-metrics-with-sdk-metrics}

Em alguns casos, pode não ser possível — ou desejável — utilizar o
[SDK completo do OpenTelemetry para Node.js](https://www.npmjs.com/package/@opentelemetry/sdk-node).
O mesmo vale se você quiser utilizar o usar OpenTelemetry JavaScript no
navegador.

Nesses casos, é possível inicializar as métricas com o pacote
`@opentelemetry/sdk-metrics`:

```shell
npm install @opentelemetry/sdk-metrics
```

Caso ainda não tenha feito isso, crie um arquivo `instrumentation.ts` (ou
`instrumentation.js`) que contenha todo o código de inicialização do SDK:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  // O valor padrão é 60000ms (60 segundos). Vamos utilizar 10 segundos apenas para fins de demonstração.
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Defina este MeterProvider para ser global para a aplicação que está sendo instrumentada.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const {
  defaultResource,
  resourceFromAttributes,
} = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // O valor padrão é 60000ms (60 segundos). Vamos utilizar 10 segundos apenas para fins de demonstração.
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});
// Defina este MeterProvider para ser global para a aplicação que está sendo instrumentada.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{< /tabpane >}}

Será necessário utilizar `--import` com este arquivo ao executar a aplicação,
como:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

Agora que o `MeterProvider` está configurado, é possível adquirir um `Meter`.

### Obtendo um Meter {#acquiring-a-meter}

Em qualquer parte da aplicação onde houver código instrumentado manualmente, é
possível chamar `getMeter` para obter um Meter. Por exemplo:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';

const myMeter = opentelemetry.metrics.getMeter(
  'nome-do-escopo-de-instrumentacao',
  'versao-do-escopo-de-instrumentacao',
);

// Agora é possível utilizar 'meter' para criar instrumentos!
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter(
  'nome-do-escopo-de-instrumentacao',
  'versao-do-escopo-de-instrumentacao',
);

// Agora é possível utilizar 'meter' para criar instrumentos!
```

{{% /tab %}} {{< /tabpane >}}

Os valores `nome-do-escopo-de-instrumentacao` e
`versao-do-escopo-de-instrumentacao` devem identificar exclusivamente o
[Escopo de Instrumentação](/docs/concepts/instrumentation-scope/), como o nome
de um pacote, módulo ou classe. O nome é obrigatório, enquanto a versão, embora
opcional, é recomendada.

De modo geral, recomenda-se chamar `getMeter` na aplicação sempre que for
necessário, em vez de exportar a instância de `meter` para o restante do código.
Essa abordagem ajuda a evitar problemas mais complexos de carregamento da
aplicação quando há outras dependências envolvidas.

No caso da [aplicação de exemplo](#example-app), há dois pontos em que um Meter
pode ser obtido com o Escopo de Instrumentação apropriado:

Primeiro, no _arquivo da aplicação_ `app.ts` (ou `app.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import { metrics, trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("O parâmetro 'rolls' está ausente ou não é um número.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Escutando requisições em http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const { trace, metrics } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("O parâmetro 'rolls' está ausente ou não é um número.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Escutando requisições em http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

E segundo, no _arquivo de biblioteca_ `dice.ts` (ou `dice.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
import { trace, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const { trace, metrics } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

Agora que os [Meters](/docs/concepts/signals/metrics/#meter) foram
inicializados, é possível criar
[instrumentos de métrica](/docs/concepts/signals/metrics/#metric-instruments).

### Utilizando Contadores (Counters) {#using-counters}

Contadores são usados para medir valores cumulativos, não-negativos e
crescentes.

No caso da [aplicação de exemplo](#example-app), é possível contar quantas vezes
os dados foram lançados:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min: number, max: number) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min, max) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

{{% /tab %}} {{< /tabpane >}}

### Utilizando Contadores UpDown (UpDown Counters) {#using-updown-counters}

Contadores UpDown podem incrementar e decrementar, permitindo observar um valor
cumulativo que aumenta ou diminui ao longo do tempo.

```js
const counter = myMeter.createUpDownCounter('events.counter');

//...

counter.add(1);

//...

counter.add(-1);
```

### Utilizando Histogramas (Histograms) {#using-histograms}

Histogramas são utilizados para medir uma distribuição de valores ao longo do
tempo.

Por exemplo, veja como reportar uma distribuição de tempos de resposta para uma
rota de API com Express:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import express from 'express';

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // realiza alguma operação em uma chamada de API

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Registra a duração da operação da tarefa
  histogram.record(executionTime);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const express = require('express');

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // realiza alguma operação em uma chamada de API

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Registra a duração da operação da tarefa
  histogram.record(executionTime);
});
```

{{% /tab %}} {{< /tabpane >}}

### Utilizando Contadores Observáveis (Assíncronos) {#using-observable-async-counters}

Contadores observáveis (_Observable counters_) são utilizados para medir um
valor aditivo, não-negativo e monotonicamente crescente.

```js
const events = [];

const addEvent = (name) => {
  events.push(name);
};

const counter = myMeter.createObservableCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//... chamadas para addEvent
```

### Utilizando Contadores UpDown Observáveis (Assíncronos) {#using-observable-async-updown-counters}

Contadores UpDown observáveis (_Observable UpDown counters_) podem incrementar e
decrementar, permitindo medir um valor cumulativo aditivo, não-negativo e
não-monotonicamente crescente.

```js
const events = [];

const addEvent = (name) => {
  events.push(name);
};

const removeEvent = () => {
  events.pop();
};

const counter = myMeter.createObservableUpDownCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//... chamadas para addEvent e removeEvent
```

### Utilizando Medidores Observáveis (Assíncronos) {#using-observable-async-gauges}

Medidores Observáveis (_Observable Gauges_) devem ser usados para medir valores
não-aditivos.

```js
let temperature = 32;

const gauge = myMeter.createObservableGauge('temperature.gauge');

gauge.addCallback((result) => {
  result.observe(temperature);
});

//... a variável temperature é modificada por um sensor
```

### Descrevendo instrumentos {#describing-instruments}

Ao criar instrumentos como contadores, histogramas, etc., é possível fornecer
uma descrição.

```js
const httpServerResponseDuration = myMeter.createHistogram(
  'http.server.duration',
  {
    description: 'Distribuição do tempo de resposta do servidor HTTP',
    unit: 'milliseconds',
    valueType: ValueType.INT,
  },
);
```

Em JavaScript, cada tipo de configuração significa o seguinte:

- `description` - Uma descrição para o instrumento, legível por humanos.
- `unit` - A descrição da unidade de medida que o valor pretende representar.
  Por exemplo, `milliseconds` para medir duração, ou `bytes` para contar número
  de bytes.
- `valueType` - O tipo de valor numérico usado nas medições.

De modo geral, recomenda-se descrever cada instrumento criado.

### Adicionando Atributos {#adding-attributes}

É possível adicionar atributos às métricas no momento em que são geradas:

```js
const counter = myMeter.createCounter('my.counter');

counter.add(1, { 'algum.atributo.opcional': 'algum valor' });
```

### Configurar Metric Views {#configure-metric-views}

Uma Metric View fornece aos desenvolvedores a capacidade de personalizar
métricas expostas pelo SDK de Métricas.

#### Seletores {#selectors}

Para instanciar uma _view_, primeiro é necessário selecionar o instrumento de
destino. Os seguintes seletores são válidos para métricas:

- `instrumentType`
- `instrumentName`
- `meterName`
- `meterVersion`
- `meterSchemaUrl`

A seleção por `instrumentName` (do tipo _string_) oferece suporte a curingas
(_wildcards_), permitindo, por exemplo, selecionar todos os instrumentos com `*`
ou todos aqueles cujo nome começa com `http`, utilizando `http*`.

#### Exemplos {#examples}

Filtrar atributos em todos os tipos de métrica:

```js
const limitAttributesView = {
  // exporta apenas o atributo 'environment'
  attributeKeys: ['environment'],
  // aplica a view a todos os instrumentos
  instrumentName: '*',
};
```

Descartar todos os instrumentos cujo nome do `Meter` seja `pubsub`:

```js
const dropView = {
  aggregation: { type: AggregationType.DROP },
  meterName: 'pubsub',
};
```

Definir intervalos de _buckets_ explícitos para o Histograma chamado
`http.server.duration`:

```js
const histogramView = {
  aggregation: {
    type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
    options: { boundaries: [0, 1, 5, 10, 15, 20, 25, 30] },
  },
  instrumentName: 'http.server.duration',
  instrumentType: InstrumentType.HISTOGRAM,
};
```

#### Anexar ao Meter Provider {#attach-to-meter-provider}

Depois de configuradas as _views_, é preciso anexá-las ao Meter Provider
correspondente:

```js
const meterProvider = new MeterProvider({
  views: [limitAttributesView, dropView, histogramView],
});
```

## Logs

As APIs e SDKs de logs estão atualmente em desenvolvimento.

## Próximos passos {#next-steps}

Também é necessário configurar um exportador apropriado para
[exportar seus dados de telemetria](/docs/languages/js/exporters) para um ou
mais _backends_ de observabilidade.
