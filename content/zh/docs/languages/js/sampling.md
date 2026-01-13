---
title: 采样
weight: 80
description: 减少遥测数据量
default_lang_commit: 06837fe15457a584f6a9e09579be0f0400593d57
---

[采样](/docs/concepts/sampling/)是一个限制系统生成链路数量的过程。JavaScript SDK 提供了几种[头部采样器](/docs/concepts/sampling#head-sampling)。

## 默认行为 {#default-behavior}

默认情况下，所有 Span 都会被采样，因此 100% 的链路都会被采样。如果不需要管理数据量，就不需要设置采样器。

## TraceIDRatioBasedSampler {#traceidratiobasedsampler}

采样时，最常用的头部采样器是 TraceIDRatioBasedSampler。它会确定性地根据你传入的百分比参数对追踪链路进行采样。

### 环境变量 {#environment-variables}

你可以使用环境变量配置 TraceIDRatioBasedSampler：

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

这会告诉 SDK 对 Span 进行采样，仅生成 10% 的链路。

### Node.js {#node-js}

你也可以在代码中配置 TraceIDRatioBasedSampler。这是一个 Node.js 示例：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // 其他 SDK 配置参数放在这里
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-node');

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // 其他 SDK 配置参数放在这里
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{< /tabpane >}}

### 浏览器 {#browser}

你也可以在代码中配置 TraceIDRatioBasedSampler。这是一个浏览器应用示例：

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
