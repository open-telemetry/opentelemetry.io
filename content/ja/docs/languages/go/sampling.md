---
title: サンプリング
weight: 80
default_lang_commit: 39d3d2ef243d968e6a434fd9d2690c8070c3d7ea
---

[サンプリング](/docs/concepts/sampling/)は、システムが生成するスパンの量を制限するプロセスです。
使用すべき正確なサンプラーは特定のニーズによって異なりますが、一般的にはトレースの開始時に決定を行い、サンプリング決定を他のサービスに伝搬させる必要があります。

[`Sampler`][] は、次のように[`WithSampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#WithSampler)オプションを使用してトレーサープロバイダーに設定できます。

```go
provider := trace.NewTracerProvider(
    trace.WithSampler(trace.AlwaysSample()),
)
```

[`AlwaysSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#AlwaysSample)と[`NeverSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#NeverSample)は説明不要の値です。`AlwaysSample`はすべてのスパンがサンプリングされることを意味し、`NeverSample`はスパンがサンプリングされないことを意味します。
開始時や開発環境では、`AlwaysSample`を使用してください。

その他のサンプラーには次があります。

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased)は、サンプラーに与えられた割合に基づいてスパンの一部をサンプリングします。0.5を設定すると、すべてのスパンの半分がサンプリングされます。
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased)は、スパンの親に基づいて異なる動作をするサンプラーデコレーターです。
  スパンに親がない場合、デコレートされたサンプラーがサンプリング決定を行うために使用されます。
  デフォルトでは、`ParentBased`はサンプリングされた親を持つスパンをサンプリングし、サンプリングされなかった親を持つスパンはサンプリングしません。

デフォルトでは、トレーサープロバイダーは`AlwaysSample`サンプラーを使用した`ParentBased`サンプラーを使用します。

本番環境では、`TraceIDRatioBased`サンプラーを使用した`ParentBased`サンプラーの使用を検討してください。

## カスタムサンプラー {#custom-samplers}

ビルトインサンプラーが要件を満たさない場合、[`Sampler`][] インターフェイスを実装してカスタムサンプラーを作成できます。
カスタムサンプラーは、次の 2 つのメソッドを実装する必要があります。

- `ShouldSample(parameters SamplingParameters) SamplingResult`: 提供されたパラメーターに基づいてサンプリング決定を行います。
- `Description() string`: サンプラーの説明を返します。

> [!IMPORTANT] 親の tracestate を保持する
>
> `ShouldSample` では、親の tracestate を `SamplingResult` に _必ず_ 保持してください。
> そうしないと、tracestate 経由でベンダー固有またはアプリケーション固有のトレースデータを渡している分散システムにおいて、コンテキスト伝搬が正しく機能しなくなります。
>
> 以下のように、親スパンのコンテキストから tracestate を取り出します。
>
> ```go
> psc := trace.SpanContextFromContext(parameters.ParentContext)
> ```
>
> `SamplingResult` を作成する際に、`psc.TraceState()` を渡してください。

### 例 {#example}

次の例は、属性値に基づいてスパンをサンプリングするカスタムサンプラーを示しています。
また、親スパンの tracestate を正しく保持しています。

```go
package main

import (
    "context"

    "go.opentelemetry.io/otel/attribute"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    "go.opentelemetry.io/otel/trace"
)

// AttributeBasedSampler は、属性値に基づいてスパンをサンプリングします。
// "high.priority" 属性が true に設定されたスパンは必ずサンプリングされます。
type AttributeBasedSampler struct {
    fallback sdktrace.Sampler
}

// NewAttributeBasedSampler は、新しい AttributeBasedSampler を作成します。
func NewAttributeBasedSampler(fallback sdktrace.Sampler) *AttributeBasedSampler {
    return &AttributeBasedSampler{fallback: fallback}
}

func (s *AttributeBasedSampler) ShouldSample(p sdktrace.SamplingParameters) sdktrace.SamplingResult {
    // tracestate を取得するために、都度親スパンのコンテキストを取り出します。
    psc := trace.SpanContextFromContext(p.ParentContext)

    // 属性が high priority かどうかを確認します。
    for _, attr := range p.Attributes {
        if attr.Key == "high.priority" && attr.Value.AsBool() {
            return sdktrace.SamplingResult{
                Decision:   sdktrace.RecordAndSample,
                Attributes: p.Attributes,
                // 重要: 親の tracestate を保持します。
                Tracestate: psc.TraceState(),
            }
        }
    }

    // 他のスパンはデフォルトのサンプラーにフォールバックします。
    result := s.fallback.ShouldSample(p)

    // フォールバック時も、tracestate が保持されるようにしてください。
    // ビルトインサンプラーはすでにこれを処理していますが、確認するのは良い習慣です。
    return sdktrace.SamplingResult{
        Decision:   result.Decision,
        Attributes: result.Attributes,
        Tracestate: psc.TraceState(),
    }
}

func (s *AttributeBasedSampler) Description() string {
    return "AttributeBasedSampler"
}
```

### カスタムサンプラーの使用 {#using-your-custom-sampler}

トレーサープロバイダーでカスタムサンプラーを使用できます。

```go
sampler := NewAttributeBasedSampler(sdktrace.TraceIDRatioBased(0.1))

provider := sdktrace.NewTracerProvider(
    sdktrace.WithSampler(sampler),
)
```

また、`ParentBased` サンプラーと組み合わせることもできます。

```go
provider := sdktrace.NewTracerProvider(
    sdktrace.WithSampler(
        sdktrace.ParentBased(
            NewAttributeBasedSampler(sdktrace.TraceIDRatioBased(0.1)),
        ),
    ),
)
```

### 追加の考慮事項 {#additional-considerations}

カスタムサンプラーを実装する際には、次の点に注意してください。

1. **親のサンプリング決定を無視する**:
   親のサンプリング決定を尊重したい場合は、`ParentBased` でサンプラーをラップするか、`psc.IsSampled()` を手動で確認してください。

2. **ShouldSample における重い計算**:
   `ShouldSample` 関数は、スパン作成時に同期的に呼び出されます。
   ネットワーク呼び出しや複雑な計算など、パフォーマンスに影響を与える可能性のある重い操作を避けてください。

[`Sampler`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler
