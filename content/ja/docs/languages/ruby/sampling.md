---
title: サンプリング
weight: 80
default_lang_commit: f9b631a466855b3bb7ec11bb5a9d342470caa77a
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

## カスタムサンプラー {#custom-samplers}

スパンの名前、属性、またはその他の識別基準に基づいて決定を行うカスタム [Sampler][] を作成したい場合があります。
サンプラーは、サンプリングの決定に必要な情報がスパンの開始時に利用可能な場合に適しています。
決定に必要な情報がスパンの終了時まで利用できない場合は、[スパンプロセッサー][span-processor]の使用を検討してください。

以下は、`db.statement` の値が `;` であるすべてのスパンを除外するカスタム Sampler クラスの例です。

このクエリは、Active Record と PostgreSQL（`pg` gem）を組み合わせて使用するアプリケーションでよく見られます。
Active Record は2秒ごとにアクティブなデータベース接続を確認し、`pg` でステートメントが `;` だけのクエリを実行します。
これにより、大量の不要なスパンが生成される可能性があります。

スパンがこの基準を満たす場合、そのスパンはドロップされます。
この基準を満たさない場合、サンプリングの決定はデリゲートサンプラーにフォールバックします。
この場合、デリゲートサンプラーは `TraceIdRatioBased` サンプラーです。

[Sampler]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers
[span-processor]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/SpanProcessor

```ruby
class CustomSampler
  def initialize(delegate)
    @delegate = delegate
  end

  def should_sample?(trace_id:, parent_context:, links:, name:, kind:, attributes:)
    if attributes && attributes["db.statement"] == ";"
      OpenTelemetry::SDK::Trace::Samplers::Result.new(
        decision: OpenTelemetry::SDK::Trace::Samplers::Decision::DROP,
        tracestate: OpenTelemetry::Trace.current_span(parent_context).context.tracestate
      )
    else
      @delegate.should_sample?(trace_id: trace_id, parent_context: parent_context,
        links: links, name: name, kind: kind, attributes: attributes)
    end
  end

  def description
    "CustomSampler{#{@delegate.description}}"
  end
end

# OpenTelemetry::SDK.configure の呼び出し後、サンプラーをデフォルトの
# トレーサープロバイダーに割り当てることができます。

OpenTelemetry.tracer_provider.sampler = CustomSampler.new(
  OpenTelemetry::SDK::Trace::Samplers.trace_id_ratio_based(0.5))
```
