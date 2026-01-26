---
title: JavaScript 零代码插桩
linkTitle: JavaScript
default_lang_commit: 55f8de69ad3cf54f24243c200f70cd0b3a608ad4
description: 无需修改源代码即可从应用程序捕获遥测数据
aliases: [/docs/languages/js/automatic]
---

JavaScript 零代码插桩方案为 Node.js 应用提供了一种插桩方式，无需修改任何代码，即可对任意 Node.js 应用进行插桩，并采集众多主流类库与框架的遥测数据。

## 设置 {#setup}

运行以下命令安装相应的包。

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/auto-instrumentations-node
```

`@opentelemetry/api` 和 `@opentelemetry/auto-instrumentations-node` 包会安装 API、SDK 和插桩工具。

## 配置该模块 {#configuring-the-module}

该模块具有高度的可配置性。

一种选择是通过命令行界面（CLI）利用 env 命令设置环境变量来配置模块：

```shell
env OTEL_TRACES_EXPORTER=otlp OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=your-endpoint \
node --require @opentelemetry/auto-instrumentations-node/register app.js
```

另一种选择是，你可以使用 `export` 来设置环境变量：

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_ENDPOINT="your-endpoint"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
export OTEL_SERVICE_NAME="your-service-name"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node app.js
```

默认情况下，会使用所有 SDK [资源探测器](/docs/languages/js/resources/)。你可以使用环境变量 `OTEL_NODE_RESOURCE_DETECTORS` 只启用特定的探测器，或完全禁用它们。

要查看完整的配置选项列表，请参阅[模块配置](configuration)。

## 支持的库和框架 {#supported-libraries-and-frameworks}

许多流行的 Node.js 库都支持自动插桩。完整列表请参阅[支持的插桩](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/auto-instrumentations-node#supported-instrumentations)。

## 故障排除 {#troubleshooting}

你可以通过将 `OTEL_LOG_LEVEL` 环境变量设置为以下值之一来设置日志级别：

- `none`
- `error`
- `warn`
- `info`
- `debug`
- `verbose`
- `all`

默认级别是 `info`。

{{% alert title="注意" %}}

- 在生产环境中，建议将 `OTEL_LOG_LEVEL` 设置为 `info`。
- 无论环境或调试级别如何，日志始终发送到 `console`。
- 调试日志非常详细，可能会对应用程序的性能产生负面影响。仅在需要时启用调试日志。

{{% /alert %}}
