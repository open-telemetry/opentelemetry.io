---
title: 构建认证器扩展
weight: 40
aliases: [/docs/collector/custom-auth/]
default_lang_commit: c6df1ca98613ce886d3ea5ecb7ea50d02a31f18a
drifted_from_default: true
cSpell:ignore: configauth oidc
---

OpenTelemetry Collector 允许将接收器和导出器连接到认证器，
从而在接收端对传入连接进行身份验证，并在导出端为传出的请求添加认证数据。

这种机制是通过[扩展][extensions]实现的，本文将指导你实现自己的认证器。
如果你正在寻找如何使用现有认证器的文档，请参考入门指南页面以及你的认证器文档。
你可以在本网站的注册表中找到现有认证器的列表。

请使用本指南作为构建自定义认证器的常规指导，并参考最新的
[API 参考指南](https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth)
以了解每种类型和函数的实际语义。

如果你需要帮助，可以随时加入
[CNCF Slack 工作区](https://slack.cncf.io)中的
[#opentelemetry-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W) 聊天室。

## 架构 {#architecture}

[认证器][authenticators]是普通的扩展，但同时满足与认证机制相关的一个或多个接口。
[服务器认证器][sa]与接收器一起使用，可以拦截 HTTP 和 gRPC 请求；
客户端认证器与导出器一起使用，可以向 HTTP 和 gRPC 请求添加认证数据。
一个认证器可以同时实现这两个接口，从而允许同一个扩展实例同时用于处理传入和传出的请求。
但请注意，用户可能仍然希望针对传入和传出请求使用不同的认证器，
因此不要让你的认证器必须同时在两端使用。

一旦认证器扩展可用于 Collector 发行版中，就可以像普通扩展一样在配置文件中引用此扩展：

```yaml
extensions:
  oidc:

receivers:
processors:
exporters:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers: []
      processors: []
      exporters: []
```

但是，认证器必须由使用它的组件引用才能生效。
下面的示例展示了与上面相同的扩展，但现在它被名为 `otlp/auth` 的接收器使用：

```yaml
extensions:
  oidc:

receivers:
  otlp/auth:
    protocols:
      grpc:
         endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:
exporters:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters: []
```

当需要多个相同类型的认证器实例时，可以给它们不同的名称：

```yaml
extensions:
  oidc/some-provider:
  oidc/another-provider:

receivers:
  otlp/auth:
    protocols:
      grpc:
         endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc/some-provider

processors:
exporters:

service:
  extensions:
    - oidc/some-provider
    - oidc/another-provider
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters: []
```

### 服务器认证器 {#server-authenticators}

[服务器认证器][sa]本质上是一个带有 `Authenticate` 函数的扩展，该函数接收载荷头作为参数。
如果认证器能够验证传入连接，应返回 `nil` 错误；如果无法认证，则返回具体错误。
作为扩展，认证器应确保在
[`Start`](https://pkg.go.dev/go.opentelemetry.io/collector/component#Component)
阶段初始化所需的所有资源，并在 `Shutdown` 时清理这些资源。

`Authenticate` 调用是传入请求的热路径的一部分，会阻塞管道，
因此要正确处理任何可能阻塞的操作。具体来说，如果提供了上下文的截止时间，要确保遵守该截止时间。
此外，还要为扩展添加足够的可观测性，尤其是通过指标和追踪，
以便用户在错误率高于某个水平时能够设置通知系统，并能调试特定的失败情况。

### 客户端认证器 {#client-authenticators}

**客户端认证器**是实现了[客户端认证器][client authenticators]中定义的一个或多个接口的扩展。

与服务器认证器类似，它们本质上是带有额外函数的扩展，
每个函数都会接收一个对象，让认证器有机会向其中注入认证数据。
例如，HTTP 客户端认证器会提供一个
[`http.RoundTripper`](https://pkg.go.dev/net/http#RoundTripper)，
而 gRPC 客户端认证器则可以生成
[`credentials.PerRPCCredentials`](https://pkg.go.dev/google.golang.org/grpc/credentials#PerRPCCredentials)。

## 将自定义认证器添加到发行版 {#adding-your-custom-authenticator-to-a-distribution}

自定义认证器必须与主要 Collector 位于同一个可执行文件中。
当你构建自己的认证器时，通常需要同时构建自定义发行版，或者为用户提供将你的扩展作为其发行版一部分的方式。
幸运的是，可以使用 [OpenTelemetry Collector Builder][builder] 工具轻松构建自定义发行版。

[authenticators]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth
[builder]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[client authenticators]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#client-authenticators
[extensions]: ../../configuration/#extensions
[sa]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#server-authenticators
