---
title: 采样（Sampling）
weight: 80
default_lang_commit: 859e80c74d61d694104f565aecde325ab4aa713f
---

[Sampling](/docs/concepts/sampling/) 是一种限制系统生成的 span 数量的机制，你应根据自身的需求选择合适的采样器（Sampler），但是一般建议在一个链路（trace）开始时就做出采样决策，并将该决策传递到其他服务中。

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

其他采样器（Sampler）还包括：

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased)：它按一定比例采样 span，这个比例根据提供给采样器（Sampler）的数值决定。例如设置为 0.5 表示采样 50% 的 span。
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased)：这是一个装饰器采样器，其行为取决于当前 span 的父 span。如果 span 没有父级，它会使用被装饰的采样器（Sampler）来做采样决策；如果有父级，默认会采样父级已采样的 span，而不会采样父级未被采样的 span。

默认情况下，Tracer Provider 将 `ParentBased` 采样器和 `AlwaysSample` 采样器结合在一起使用。

在生产环境中，建议将 `ParentBased` 采样器与 `TraceIDRatioBased` 采样器搭配使用。