---
title: サンプリング
weight: 80
default_lang_commit: 06837fe15457a584f6a9e09579be0f0400593d57
---

[サンプリング](/docs/concepts/sampling/)は、システムによって生成されるトレース量を制限するプロセスです。
Ruby SDKには、いくつかの[ヘッドサンプラー](/docs/concepts/sampling#head-sampling)が用意されています。

## デフォルトの動作 {#default-behavior}

デフォルトでは、すべてのスパンがサンプリングされます。
つまり、トレースの100%がサンプリングされます。
データ量を管理する必要がない場合は、サンプラーを設定しないでください。

具体的には、デフォルトのサンプラーは [ParentBased][] と [ALWAYS_ON][] を組み合わせたものであり、トレース内のルートスパンが常にサンプリングされ、すべての子スパンが親のサンプリングフラグを尊重してサンプリングの決定を行うことを保証します。
これにより、デフォルトですべてのスパンがサンプリングされることが保証されます。

[ParentBased]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers/ParentBased
[ALWAYS_ON]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers

## TraceIDRatioBasedサンプラー {#traceidratio-based-sampler}

最も一般的に使用されるヘッドサンプラーは [TraceIdRatioBased][] サンプラーです。
TraceIdRatioBasedサンプラーは、パラメーターとして渡すトレースの割合を決定論的にサンプリングします。

[TraceIdRatioBased]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers/TraceIdRatioBased

### 環境変数 {#environment-variables}

環境変数を使用して、`TraceIdRatioBased` サンプラーを設定できます。

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

この設定では、トレースの10%のみがエクスポートされるようにスパンがサンプリングされます。

### コードでの構成 {#configuration-in-code}

`TraceIdRatioBased`サンプラーをコードで構成することは可能ですが、推奨されません。
コードで構成するには、適切な構成オプションをすべて備えたトレーサープロバイダーを手動で設定する必要がありますが、`OpenTelemetry::SDK.configure` を使用するだけの場合と比べて正しく実行するのが困難です。
