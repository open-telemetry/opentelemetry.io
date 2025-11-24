---
title: Usando bibliotecas de instrumentação
linkTitle: Bibliotecas
weight: 40
default_lang_commit: 115933c1b9c643c8b6cf0d413a32061cd3a1b65f
description: Como instrumentar bibliotecas das quais uma aplicação depende
cSpell:ignore: metapackages metapacotes
---

{{% docs/languages/libraries-intro "js" %}}

## Usando bibliotecas de instrumentação {#use-instrumentation-libraries}

Se uma biblioteca não vem com OpenTelemetry de forma nativa, é possível utilizar
[bibliotecas de instrumentação](/docs/specs/otel/glossary/#instrumentation-library)
para gerar dados de telemetria para uma biblioteca ou _framework_.

Por exemplo,
[a biblioteca de instrumentação para Express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
irá criar automaticamente [trechos](/docs/concepts/signals/traces/#spans)
baseados nas requisições HTTP de entrada.

### Configuração {#setup}

Cada biblioteca de instrumentação é um pacote NPM. Por exemplo, veja como
instalar as bibliotecas
[instrumentation-express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
e
[instrumentation-http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
para instrumentar tráfego HTTP de entrada e saída:

```sh
npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
```

O OpenTelemetry JavaScript também define metapacotes (_metapackages_)
[auto-instrumentation-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
e
[auto-instrumentation-web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web),
que agrupam todas as bibliotecas de instrumentação baseadas em Node.js ou web em
um único pacote. É uma maneira conveniente de adicionar telemetria gerada
automaticamente para todas as suas bibliotecas com esforço mínimo:

{{< tabpane text=true >}}

{{% tab Node.js %}}

```shell
npm install --save @opentelemetry/auto-instrumentations-node
```

{{% /tab %}}

{{% tab Browser %}}

```shell
npm install --save @opentelemetry/auto-instrumentations-web
```

{{% /tab %}} {{< /tabpane >}}

Note que usar esses metapacotes aumenta o tamanho do seu grafo de dependências.
Utilize bibliotecas de instrumentação individuais caso você saiba exatamente
quais precisa.

### Registro {#registration}

Após instalar as bibliotecas de instrumentação necessárias, registre-as no SDK
do OpenTelemetry para Node.js. Se você seguiu os
[Primeiros Passos](/docs/languages/js/getting-started/nodejs/), você já utiliza
os metapacotes. Se você seguiu as instruções
[para inicializar o SDK com instrumentação manual](/docs/languages/js/instrumentation/#initialize-tracing),
atualize seu `instrumentation.ts` (ou `instrumentation.js`) da seguinte forma:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // Registra todos os pacotes de instrumentação
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  // Registra todos os pacotes de instrumentação
  instrumentations: [getNodeAutoInstrumentations()]
});
```

{{% /tab %}}

{{< /tabpane >}}

Para desabilitar bibliotecas de instrumentação individuais, aplique a seguinte
alteração:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // Registra todos os pacotes de instrumentação
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start()
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  // Registra todos os pacotes de instrumentação
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});
```

{{% /tab %}}

{{< /tabpane >}}

Para carregar apenas bibliotecas de instrumentação individuais, substitua
`[getNodeAutoInstrumentations()]` pela lista daquelas que você precisa:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // A instrumentação Express espera que a camada HTTP esteja instrumentada
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});

sdk.start()
```

{{% /tab %}} {{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // A instrumentação Express espera que a camada HTTP esteja instrumentada
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});
```

{{% /tab %}}

{{< /tabpane >}}

### Configuração {#configuration}

Algumas bibliotecas de instrumentação oferecem opções de configuração
adicionais.

Por exemplo,
[a instrumentação Express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express#express-instrumentation-options)
oferece formas de ignorar _middlewares_ especificados ou enriquecer trechos
criados automaticamente com um _hook_ de requisição:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
import { Span } from '@opentelemetry/api';
import {
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_URL,
} from '@opentelemetry/semantic-conventions';
import {
  ExpressInstrumentation,
  ExpressLayerType,
  ExpressRequestInfo,
} from '@opentelemetry/instrumentation-express';

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span: Span, info: ExpressRequestInfo) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(SEMATTRS_HTTP_METHOD, info.request.method);
      span.setAttribute(SEMATTRS_HTTP_URL, info.request.baseUrl);
    }
  },
});
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const {
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_URL,
} = require('@opentelemetry/semantic-conventions');
const {
  ExpressInstrumentation,
  ExpressLayerType,
} = require('@opentelemetry/instrumentation-express');

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span, info) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(SEMATTRS_HTTP_METHOD, info.request.method);
      span.setAttribute(SEMATTRS_HTTP_URL, info.request.baseUrl);
    }
  },
});
```

{{% /tab %}}

{{< /tabpane >}}

Consulte a documentação de cada biblioteca de instrumentação para opções
avançadas.

### Bibliotecas de instrumentação disponíveis {#available-instrumentation-libraries}

É possível encontrar a lista de instrumentações disponíveis no
[registro](/ecosystem/registry/?language=js&component=instrumentation).

## Instrumentar uma biblioteca nativamente {#instrument-a-library-natively}

Caso queira adicionar instrumentação nativa à sua biblioteca, consulte a
seguinte documentação:

- A página de conceito [Bibliotecas](/docs/concepts/instrumentation/libraries/)
  fornece informações úteis sobre quando instrumentar e o que instrumentar.
- A página de [instrumentação manual](/docs/languages/js/instrumentation/)
  fornece exemplos de código necessários para criar rastros, métricas e logs
  para sua biblioteca.
- O
  [Guia de Implementação de Instrumentação](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md)
  para Node.js e navegador contém boas práticas específicas de JavaScript para
  criar instrumentação de bibliotecas.

## Criar uma biblioteca de instrumentação {#create-an-instrumentation-library}

Embora ter observabilidade pronta para uso em uma aplicação seja a forma
preferida, isso nem sempre é possível ou desejado. Nesses casos, você pode criar
uma biblioteca de instrumentação, que irá injetar chamadas de instrumentação
utilizando mecanismos como empacotamento de _interfaces_, assinatura de funções
de retorno (_callbacks_) específicos da biblioteca ou tradução de telemetria
existente para o modelo do OpenTelemetry.

Para criar uma biblioteca desse tipo, siga o
[Guia de Implementação de Instrumentação](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md)
para Node.js e navegador.
