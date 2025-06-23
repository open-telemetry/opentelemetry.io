---
title: 使用插桩库（Using instrumentation libraries）
linkTitle: Libraries
aliases:
  - /docs/languages/go/using_instrumentation_libraries
  - /docs/languages/go/automatic_instrumentation
weight: 40
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

{{% docs/languages/libraries-intro "go" %}}

## 使用插桩库{#use-natively-instrumented-libraries}

如果某个库本身没有集成 OpenTelemetry，你可以使用
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
为其生成遥测数据。

例如
[instrumentation library for `net/http`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp)
会基于 HTTP 请求自动创建 [spans](/docs/concepts/signals/traces/#spans) 和
[metrics](/docs/concepts/signals/metrics/)。

## 安装{#setup}

每个插桩库是一个独立的 Go 包。通常你需要使用 `go get` 获取相应的包。例如，如果要安装由
[Contrib repository](https://github.com/open-telemetry/opentelemetry-go-contrib)
维护的插桩库，可以运行以下命令：

```sh
go get go.opentelemetry.io/contrib/instrumentation/{import-path}/otel{package-name}
```

然后根据库的要求在代码中配置它。

[Getting Started](../getting-started/) 中展示了如何为一个 `net/http` 服务器设置插桩。

## 可用包{#available-packages}

完整的可用插桩库列表见
[OpenTelemetry registry](/ecosystem/registry/?language=go&component=instrumentation).

## 后续步骤{#next-steps}

插桩库可以为如 HTTP 请求的输入输出等操作生成遥测数据，但它们并不会自动覆盖你实际业务逻辑的内部执行过程。

你可以通过在代码中集成
[custom instrumentation](../instrumentation/) 来丰富你的遥感数据。这能够补充标准库的遥测数据，并提供对运行中应用程序更深入的洞察。
