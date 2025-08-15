---
title: サンプリング
weight: 80
default_lang_commit: adc4264c2926e3d767b6a56affb19fb4ae3f2a22
---

[サンプリング](/docs/concepts/sampling/)は、システムが生成するスパンの量を制限するプロセスです。
使用すべき正確なサンプラーは特定のニーズによって異なりますが、一般的にはトレースの開始時に決定を行い、サンプリング決定を他のサービスに伝搬させる必要があります。

[`Sampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler)は、次のように[`WithSampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#WithSampler)オプションを使用してトレーサープロバイダーに設定できます。

```go
provider := trace.NewTracerProvider(
    trace.WithSampler(trace.AlwaysSample()),
)
```

[`AlwaysSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#AlwaysSample)と[`NeverSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#NeverSample)は説明不要の値です。`AlwaysSample`はすべてのスパンがサンプリングされることを意味し、`NeverSample`はスパンがサンプリングされないことを意味します。
開始時や開発環境では、`AlwaysSample`を使用してください。

その他のサンプラーには次があります。

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased)は、サンプラーに与えられた割合に基づいてスパンの一部をサンプリングします。0.5を設定すると、すべてのスパンの半分がサンプリングされます。
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased)は、スパンの親に基づいて異なる動作をするサンプラーデコレーターです。スパンに親がない場合、デコレートされたサンプラーがスパンの親に基づいてサンプリング決定を行うために使用されます。デフォルトでは、`ParentBased`はサンプリングされた親を持つスパンをサンプリングし、サンプリングされなかった親を持つスパンはサンプリングしません。

デフォルトでは、トレーサープロバイダーは`AlwaysSample`サンプラーを使用した`ParentBased`サンプラーを使用します。

本番環境では、`TraceIDRatioBased`サンプラーを使用した`ParentBased`サンプラーの使用を検討してください。
