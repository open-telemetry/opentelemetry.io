---
title: Вибірка
weight: 80
description: Зменшення кількості створюваних телеметричних даних
default_lang_commit: c0af68cd6d2581f6931827e168820e44c42e222e
---

[Вибірка](/docs/concepts/sampling/) — це процес, який обмежує кількість трейсів, що генеруються системою. JavaScript SDK пропонує кілька [головних механізмів вибірки](/docs/concepts/sampling#head-sampling).

## Стандартна поведінка {#default-behavior}

Стандартно всі відрізки вибираються, тобто 100% трейсів вибираються. Якщо вам не потрібно керувати обсягом даних, не варто налаштовувати механізм вибірки.

## TraceIDRatioBasedSampler

При вибірці найпоширенішим головним механізмом є TraceIdRatioBasedSampler. Він детерміновано вибирає відсоток трейсів, який ви передаєте як параметр.

### Змінні середовища {#environment-variables}

Ви можете налаштувати TraceIdRatioBasedSampler за допомогою змінних середовища:

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

Це вказує SDK відбирати відрізки так, щоб створювалося лише 10% трейсів.

### Node.js

Ви також можете налаштувати TraceIdRatioBasedSampler в коді. Ось приклад для Node.js:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace';

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Інші параметри конфігурації SDK йдуть тут
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace');

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
  TracerProvider,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace';

const samplePercentage = 0.1;

const tracerProvider = new TracerProvider({
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const {
  TracerProvider,
  TraceIdRatioBasedSampler,
} = require('@opentelemetry/sdk-trace');

const samplePercentage = 0.1;

const tracerProvider = new TracerProvider({
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{< /tabpane >}}
