---
title: 零代码插桩配置
linkTitle: 配置
description: 了解如何为 Node.js 配置零代码插桩
default_lang_commit: 115933c1b9c643c8b6cf0d413a32061cd3a1b65f
aliases:
  - /docs/languages/js/automatic/configuration
  - /docs/languages/js/automatic/module-config
weight: 10
cSpell:ignore: serviceinstance
---

这个模块通过设置[环境变量](/docs/specs/otel/configuration/sdk-environment-variables/)具有高度的可配置性。
自动插桩行为的许多方面都可以根据你的需要进行配置，例如资源探测器、导出器、链路上下文传播头等等。

## SDK 和导出器配置 {#sdk-and-exporter-configuration}

[SDK 和导出器配置](/docs/languages/sdk-configuration/)可以使用环境变量设置。

## SDK 资源探测器配置 {#sdk-resource-detector-configuration}

默认情况下，该模块将启用所有 SDK 资源探测器。
你可以使用 `OTEL_NODE_RESOURCE_DETECTORS` 环境变量来只启用特定的探测器，或完全禁用它们：

- `env`
- `host`
- `os`
- `process`
- `serviceinstance`
- `container`
- `alibaba`
- `aws`
- `azure`
- `gcp`
- `all` - 启用所有资源探测器
- `none` - 禁用资源探测

例如，要只启用 `env` 和 `host` 探测器，你可以设置：

```shell
OTEL_NODE_RESOURCE_DETECTORS=env,host
```

## 排除插桩库 {#excluding-instrumentation-libraries}

默认情况下，所有[支持的插桩库](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/auto-instrumentations-node/README.md#supported-instrumentations)都已启用，
但你可以使用环境变量来启用或禁用特定的插桩。

### 启用特定的插桩 {#enable-specific-instrumentations}

使用环境变量 `OTEL_NODE_ENABLED_INSTRUMENTATIONS` 来只启用特定的插桩，
通过提供一个逗号分隔的插桩库名称列表，不需要包含 `@opentelemetry/instrumentation-` 前缀。

例如，要只启用
[@opentelemetry/instrumentation-http](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http)
和
[@opentelemetry/instrumentation-express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express)
插桩：

```shell
OTEL_NODE_ENABLED_INSTRUMENTATIONS="http,express"
```

### 禁用特定的插桩 {#disable-specific-instrumentations}

使用环境变量 `OTEL_NODE_DISABLED_INSTRUMENTATIONS` 来保持启用完整列表，只禁用特定的插桩。
通过提供一个逗号分隔的插桩库名称列表，不需要包含 `@opentelemetry/instrumentation-` 前缀。

例如，要只禁用
[@opentelemetry/instrumentation-fs](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-fs)
和
[@opentelemetry/instrumentation-grpc](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc)
插桩：

```shell
OTEL_NODE_DISABLED_INSTRUMENTATIONS="fs,grpc"
```

{{% alert title="注意" %}}

如果同时设置了这两个环境变量，`OTEL_NODE_ENABLED_INSTRUMENTATIONS` 会先被应用，然后 `OTEL_NODE_DISABLED_INSTRUMENTATIONS` 会应用到该列表。
因此，如果同一插桩同时包含在两个列表中，该插桩将被禁用。

{{% /alert %}}
