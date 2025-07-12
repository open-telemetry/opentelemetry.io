---
title: Семплювання
weight: 80
description: Зменшення кількості створюваних телеметричних даних
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

[Семплювання](/docs/concepts/sampling/) — це процес, який обмежує кількість трейсів, що генеруються системою. JavaScript SDK пропонує кілька [головних семплерів](/docs/concepts/sampling#head-sampling).

## Стандартна поведінка {#default-behavior}

Стандартно всі відрізки семплюються, тобто 100% трейсів семплюються. Якщо вам не потрібно керувати обсягом даних, не варто налаштовувати семплер.

## TraceIDRatioBasedSampler

При семплюванні найпоширенішим головним семплером є TraceIdRatioBasedSampler. Він детерміновано семплює відсоток трейсів, який ви передаєте як параметр.

### Змінні середовища {#environment-variables}

Ви можете налаштувати TraceIdRatioBasedSampler за допомогою змінних середовища:

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

Це вказує SDK семплювати відрізки так, щоб створювалося лише 10% трейсів.

### Node.js

Ви також можете налаштувати TraceIdRatioBasedSampler в коді. Ось приклад для Node.js:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Інші параметри конфігурації SDK йдуть тут
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-node');

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Інші параметри конфігурації SDK йдуть тут
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{< /tabpane >}}

### Оглядач {#browser}

Ви також можете налаштувати TraceIdRatioBasedSampler в коді. Ось приклад для застосунків оглядача:

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
