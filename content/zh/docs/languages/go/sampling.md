---
title: 采样
weight: 80
default_lang_commit: 859e80c74d61d694104f565aecde325ab4aa713f
---

[采样（Sampling）](/docs/concepts/sampling/) 是一种限制系统生成的 span 数量的机制，你应根据自身的需求选择合适的采样器（Sampler），但是一般建议在一个链路（trace）开始时就做出采样决策，并将该决策传递到其他服务中。

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

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased)：它按一定比例采样 span，这个比例根据提供给采样器的数值决定。例如设置为 0.5 表示采样 50% 的 span。
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased)： 是一种采样器装饰器，它的行为会根据当前 span 是否有父 span，以及父 span 的采样状态来决定。如果 span 没有父级，那么就使用传入的默认采样器来决定是否采样；如果有父 span，默认情况下：若父 span 被采样了，则当前 span 也被采样；若父 span 没被采样，则当前 span 也不会被采样。

默认情况下，Tracer Provider 将 `ParentBased` 采样器和 `AlwaysSample` 采样器结合在一起使用。

在生产环境中，建议将 `ParentBased` 采样器与 `TraceIDRatioBased` 采样器搭配使用。
