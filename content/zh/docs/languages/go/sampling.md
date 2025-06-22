---
title: 采样（Sampling）
weight: 80
---

[Sampling](/docs/concepts/sampling/) 是一种限制系统生成的 span 数量的机制，你应根据自身的需求选择合适的采样器，但是一般建议在一个 trace 开始时就做出采样决策，并将该决策传递到其他服务中。

你可以使用 [`WithSampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#WithSampler)
选项在 Tracer Provider 上设置一个
[`Sampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler)，如下所示：

```go
provider := trace.NewTracerProvider(
    trace.WithSampler(trace.AlwaysSample()),
)
```

[`AlwaysSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#AlwaysSample)
和
[`NeverSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#NeverSample)
顾名思义，`AlwaysSample` 表示对每个 span 都会进行采样，而 `NeverSample` 表示不对任何 span 进行采样。

其他采样器还包括：

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased)：它按一定比例采样 span，根据提供给采样器的小数值决定。例如设置为 0.5 表示采样 50% 的 span。
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased)：这是一个装饰器采样器，其行为取决于当前 span 的父 span。如果 span 没有父级，它会使用被装饰的采样器来做采样决策；如果有父级，默认会采样父级已采样的 span，而跳过未采样的。

默认情况下，Tracer Provider 使用的是 `ParentBased` 与 `AlwaysSample` 的组合。

在生产环境中，建议将 `ParentBased` 与 `TraceIDRatioBased` 搭配使用。这样可以减少开销，同时保留跨服务追踪能力。
