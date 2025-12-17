---
title: 使用插桩库
linkTitle: Libraries
aliases:
  - /docs/languages/go/using_instrumentation_libraries
  - /docs/languages/go/automatic_instrumentation
weight: 40
default_lang_commit: 859e80c74d61d694104f565aecde325ab4aa713f
---

{{% docs/languages/libraries-intro "go" %}}

## 使用插桩库{#use-instrumentation-libraries}

如果某个库本身没有集成 OpenTelemetry，你可以使用
[插桩库（instrumentation libraries）](/docs/specs/otel/glossary/#instrumentation-library)
为这个库或者框架生成遥测数据。

例如，
[`net/http` 的插桩库](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp)
会基于 HTTP 请求自动创建 [span](/docs/concepts/signals/traces/#spans) 和
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

## 可用插桩库{#available-packages}

完整的可用插桩库列表见
[OpenTelemetry 支持库列表](/ecosystem/registry/?language=go&component=instrumentation).

## 后续步骤{#next-steps}

插桩库可以生成入站和出站 HTTP 请求的遥测数据，但不会对你的实际应用程序进行插桩。

你可以通过在代码中集成[自定义插桩](../instrumentation/)来丰富你的遥测数据。
这补充了标准库生成的遥测数据，并且可以让你更深入地了解正在运行的应用程序。
