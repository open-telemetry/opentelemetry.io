---
title: Amostragem
weight: 80
description: Reduza a quantidade de telemetria criada
default_lang_commit: 06837fe15457a584f6a9e09579be0f0400593d57
---

[Amostragem](/docs/concepts/sampling/) é um processo que restringe a quantidade
de rastros gerados por um sistema. O SDK JavaScript oferece diversos
[amostradores de cabeçalho (_head samplers_)](/docs/concepts/sampling#head-sampling).

## Comportamento padrão {#default-behavior}

Por padrão, todos os trechos são amostrados e, portanto, 100% dos rastros são
amostrados. Se não for necessário gerenciar o volume de dados, não é preciso
configurar um amostrador.

## TraceIDRatioBasedSampler

O amostrador de cabeçalho mais comum é o TraceIdRatioBasedSampler. Ele realiza a
amostragem determinística de uma porcentagem de rastros definida como parâmetro.

### Variáveis de ambiente {#environment-variables}

Configure o TraceIdRatioBasedSampler com variáveis de ambiente:

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

Isso instrui o SDK a amostrar trechos de forma que apenas 10% dos rastros sejam
criados.

### Node.js

É possível configurar o TraceIdRatioBasedSampler também no código. Veja um
exemplo para Node.js:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Outros parâmetros de configuração do SDK vão aqui
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-node');

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Outros parâmetros de configuração do SDK vão aqui
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{< /tabpane >}}

### Navegador {#browser}

É possível configurar o TraceIdRatioBasedSampler também no código. Veja um
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
