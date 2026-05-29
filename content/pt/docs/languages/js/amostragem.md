---
title: Amostragem
weight: 80
description: Reduza a quantidade de telemetria criada
---

[Amostragem](/docs/concepts/sampling/) é um processo que restringe a quantidade de traces gerados por um sistema. O SDK JavaScript oferece vários
[head samplers](/docs/concepts/sampling#head-sampling).

## Comportamento padrão {#default-behavior}

Por padrão, todos os spans são amostrados e, portanto, 100% dos traces são
amostrados. Se você não precisa gerenciar o volume de dados, não é necessário
configurar um sampler.

## TraceIDRatioBasedSampler

Ao fazer amostragem, o head sampler mais comum é o TraceIdRatioBasedSampler. Ele
amostra deterministicamente uma porcentagem dos traces que você passa como
parâmetro.

### Variáveis de ambiente {#environment-variables}

Você pode configurar o TraceIdRatioBasedSampler com variáveis de ambiente:

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

Isso instrui o SDK a amostrar spans de forma que apenas 10% dos traces sejam
criados.

### Node.js

Você também pode configurar o TraceIdRatioBasedSampler no código. Aqui está um
exemplo para Node.js:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Other SDK configuration parameters go here
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-node');

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Other SDK configuration parameters go here
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{< /tabpane >}}

### Navegador {#browser}

Você também pode configurar o TraceIdRatioBasedSampler no código. Aqui está um
exemplo para aplicações de navegador:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  WebTracerProvider,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-web';

const samplePercentage = 0.1;

const provider = new WebTracerProvider({
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const {
  WebTracerProvider,
  TraceIdRatioBasedSampler,
} = require('@opentelemetry/sdk-trace-web');

const samplePercentage = 0.1;

const provider = new WebTracerProvider({
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{< /tabpane >}}
