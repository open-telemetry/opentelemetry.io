---
title: Serverless
weight: 100
description: Instrumente suas funções serverless com OpenTelemetry JavaScript
default_lang_commit: 2b99811a310f2749a5b6389f5e4d654a4f2e2f8e
cSpell:ignore: otelwrapper
---

Este guia mostra como começar a rastrear funções _serverless_ (sem servidor) usando as
bibliotecas de instrumentação do OpenTelemetry.

> [!NOTE]
>
> A documentação do OpenTelemetry assume que a aplicação compilada é executada
> como [CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules).

## AWS Lambda {#aws-lambda}

> [!NOTE]
>
> Você também pode instrumentar automaticamente suas funções AWS Lambda usando
> as
> [camadas Lambda fornecidas pela comunidade](/docs/platforms/faas/lambda-auto-instrument/).

O exemplo a seguir mostra como usar _wrappers_ Lambda com o OpenTelemetry para
instrumentar funções AWS Lambda manualmente e enviar rastros para um _backend_
configurado.

Se você tem interesse em uma experiência _plug and play_, veja as
[Camadas Lambda do OpenTelemetry](https://github.com/open-telemetry/opentelemetry-lambda).

### Dependências {#dependencies}

Primeiro, crie um `package.json` vazio:

```sh
npm init -y
```

Em seguida, instale as dependências necessárias:

```sh
npm install \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation \
  @opentelemetry/sdk-trace-base \
  @opentelemetry/sdk-trace-node
```

### Código do wrapper do AWS Lambda {#aws-lambda-wrapper-code}

Este arquivo contém toda a lógica do OpenTelemetry, que habilita o rastreamento.
Salve o código a seguir como `lambda-wrapper.js`.

```javascript
/* lambda-wrapper.js */

const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: '<backend_url>',
  }),
);

const provider = new NodeTracerProvider({
  spanProcessors: [spanProcessor],
});

provider.register();

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-aws-lambda': {
        disableAwsContextPropagation: true,
      },
    }),
  ],
});
```

Substitua `<backend_url>` pela URL do seu _backend_ favorito para exportar todos
os rastros para ele. Se você ainda não tem um configurado, pode conferir o
[Jaeger](https://www.jaegertracing.io/) ou o [Zipkin](https://zipkin.io/).

Observe que `disableAwsContextPropagation` está definido como `true`. O motivo
disso é que a instrumentação do Lambda tenta usar os cabeçalhos de contexto do
X-Ray por padrão; a menos que o rastreamento ativo esteja habilitado para esta
função, isso resulta em um contexto não amostrado, que cria um
`NonRecordingSpan`.

Mais detalhes podem ser encontrados na
[documentação](https://www.npmjs.com/package/@opentelemetry/instrumentation-aws-lambda)
da instrumentação.

### Manipulador (Handler) da função AWS Lambda {#aws-lambda-function-handler}

Agora que você tem um _wrapper_ Lambda, crie um _handler_ simples que serve como
uma função Lambda. Salve o código a seguir como `handler.js`.

```javascript
/* handler.js */

'use strict';

const https = require('https');

function getRequest() {
  const url = 'https://opentelemetry.io/';

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      reject(new Error(err));
    });
  });
}

exports.handler = async (event) => {
  try {
    const result = await getRequest();
    return {
      statusCode: result,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error.message,
    };
  }
};
```

### Implantação {#deployment}

Existem várias maneiras de implantar sua função Lambda:

- [AWS Console](https://aws.amazon.com/console/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Serverless Framework](https://github.com/serverless/serverless)
- [Terraform](https://github.com/hashicorp/terraform)

Aqui usaremos o Serverless Framework; mais detalhes podem ser encontrados no
[guia de configuração do Serverless Framework](https://www.serverless.com/framework/docs/getting-started).

Crie um arquivo chamado `serverless.yml`:

```yaml
service: lambda-otel-native
frameworkVersion: '3'
provider:
  name: aws
  runtime: nodejs14.x
  region: '<your-region>'
  environment:
    NODE_OPTIONS: --require lambda-wrapper
functions:
  lambda-otel-test:
    handler: handler.hello
```

Para que o OpenTelemetry funcione corretamente, `lambda-wrapper.js` deve ser
incluído antes de qualquer outro arquivo: a configuração `NODE_OPTIONS` garante
isso.

Observe que, se você não estiver usando o Serverless Framework para implantar
sua função Lambda, deverá adicionar esta variável de ambiente manualmente pela
interface do AWS Console.

Por fim, execute o comando a seguir para implantar o projeto na AWS:

```shell
serverless deploy
```

Agora você pode invocar a função Lambda recém-implantada pela interface do AWS
Console. Você deverá ver trechos relacionados à invocação da função Lambda.

### Acessando o backend {#visiting-the-backend}

Agora você deve conseguir visualizar no _backend_ os rastros produzidos pelo
OpenTelemetry a partir da sua função Lambda!

## Função GCP {#gcp-function}

O exemplo a seguir mostra como instrumentar uma
[função acionada por HTTP](https://docs.cloud.google.com/run/docs/write-functions)
usando a interface do Google Cloud Platform (GCP).

### Criando a função {#creating-function}

Faça login no GCP e crie ou selecione um projeto onde sua função será colocada.
No menu lateral, vá em _Serverless_ e selecione _Cloud Functions_. Em seguida,
clique em _Create Function_ e selecione
[2ª geração](https://cloud.google.com/blog/products/serverless/cloud-functions-2nd-generation-now-generally-available)
para o seu ambiente, forneça um nome para a função e selecione a sua região.

### Configurar variável de ambiente para o otelwrapper {#setup-environment-variable-for-otelwrapper}

Se estiver fechado, abra o menu _Runtime, build, connections and security
settings_, role para baixo e adicione a variável de ambiente `NODE_OPTIONS` com
o seguinte valor:

```shell
--require ./otelwrapper.js
```

### Selecione o runtime {#select-runtime}

Na próxima tela (_Code_), selecione o Node.js versão 16 para o seu _runtime_.

### Criar o wrapper do OTel {#create-otel-wrapper}

Crie um novo arquivo chamado `otelwrapper.js`, que será usado para instrumentar
o seu serviço. Certifique-se de fornecer um `SERVICE_NAME` e de definir o
`<address for your backend>`.

```javascript
/* otelwrapper.js */

const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const collectorOptions = {
  url: '<endereço do seu backend>',
};

const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: '<nome da sua função>',
  }),
  spanProcessors: [
    new BatchSpanProcessor(new OTLPTraceExporter(collectorOptions)),
  ],
});

provider.register();

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});
```

### Adicione as dependências do pacote {#add-package-dependencies}

Adicione o seguinte ao seu `package.json`:

```json
{
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/auto-instrumentations-node": "^0.56.1",
    "@opentelemetry/exporter-trace-otlp-http": "^0.200.0",
    "@opentelemetry/instrumentation": "^0.200.0",
    "@opentelemetry/sdk-trace-base": "^2.0.0",
    "@opentelemetry/sdk-trace-node": "^2.0.0",
    "@opentelemetry/resources": "^2.0.0",
    "@opentelemetry/semantic-conventions": "^2.0.0"
  }
}
```

### Adicionar uma chamada HTTP à função {#add-http-call-to-function}

O código a seguir faz uma chamada ao site do OpenTelemetry para demonstrar uma
chamada de saída.

```javascript
/* index.js */
const functions = require('@google-cloud/functions-framework');
const https = require('https');

functions.http('helloHttp', (req, res) => {
  let url = 'https://opentelemetry.io/';
  https
    .get(url, (response) => {
      res.send(`Response ${response.body}!`);
    })
    .on('error', (e) => {
      res.send(`Error ${e}!`);
    });
});
```

### Backend {#backend}

Se você executa o OTel Collector em uma VM do GCP, provavelmente precisará
[criar um conector de acesso VPC](https://cloud.google.com/vpc/docs/configure-serverless-vpc-access)
para conseguir enviar rastros.

### Implantar {#deploy}

Selecione Deploy na interface e aguarde a implantação ficar pronta.

### Testando {#testing}

Você pode testar a função usando o Cloud Shell na aba de testes.
