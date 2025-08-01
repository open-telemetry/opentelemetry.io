---
title: サンプリング
weight: 80
description: 生成されるテレメトリの量を削減する
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

[サンプリング](/docs/concepts/sampling/)は、システムによって生成されるトレースの量を制限するプロセスです。
JavaScript SDKでは、いくつかの[ヘッドサンプラー](/docs/concepts/sampling#head-sampling)が提供されています。

## デフォルトの動作 {#default-behavior}

デフォルトでは、すべてのスパンがサンプリングされ、つまり100%のトレースがサンプリングされます。
データ量を管理する必要がない場合は、サンプラーの設定は不要です。

## TraceIDRatioBasedSampler {#traceidratiobasedsampler}

サンプリングを行う際に最も一般的に使用されるヘッドサンプラーは、TraceIdRatioBasedSamplerです。
このサンプラーは、パラメータとして渡される割合のトレースを決定論的にサンプリングします。

### 環境変数 {#environment-variables}

TraceIdRatioBasedSamplerは環境変数で設定できます。

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

これにより、SDKはスパンをサンプリングし、トレースの10%のみが作成されるよう指定します。

### Node.js {#nodejs}

TraceIdRatioBasedSamplerはコードでも設定できます。Node.jsの例は以下の通りです。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // その他のSDK設定パラメータをここに記述
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-node');

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // その他のSDK設定パラメータをここに記述
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
```

{{% /tab %}} {{< /tabpane >}}

### ブラウザ {#browser}

TraceIdRatioBasedSamplerはコードでも設定できます。
ブラウザアプリケーションの例は以下の通りです。

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
