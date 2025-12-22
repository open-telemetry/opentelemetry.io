---
title: 使用插桩库
linkTitle: 库
default_lang_commit: 8dad29e2443b7c8739f3be322e5d5eec3baf999f
weight: 40
description: 如何为应用所依赖的库进行插桩
---

{{% docs/languages/libraries-intro "js" %}}

## 使用插桩库 {#use-instrumentation-libraries}

如果一个库没有提供 OpenTelemetry 开箱即用的支持，你可以使用[插桩库](/docs/specs/otel/glossary/#instrumentation-library)来为该库或框架生成遥测数据。

例如，
[Express 插桩库](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)会根据入站 HTTP 请求自动创建 [Span](/docs/concepts/signals/traces/#spans)。

### 安装 {#setup}

每个插桩库都是一个 NPM 包。例如，下面是如何安装
[Express 插桩库](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
和
[HTTP 插桩库](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
来为入站和出站 HTTP 流量生成遥测数据:

```sh
npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
```

OpenTelemetry JavaScript 还定义了
[auto-instrumentation-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
和
[auto-instrumentation-web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web)
这两个元包，将所有基于 Node.js 或 Web 的插桩库打包整合到单个软件包中。
这是一种便捷的方式，只需极少工作量，就能为所有库添加自动生成的遥测数据:

{{< tabpane text=true >}}

{{% tab Node.js %}}

```shell
npm install --save @opentelemetry/auto-instrumentations-node
```

{{% /tab %}}

{{% tab Browser %}}

```shell
npm install --save @opentelemetry/auto-instrumentations-web
```

{{% /tab %}} {{< /tabpane >}}

注意，使用这些元包会增加你的依赖关系图的大小。如果你确切地知道自己需要哪些插桩库，请使用单独的插桩库。

### 注册 {#registration}

安装所需的插桩库后，将它们注册到 Node.js 的 OpenTelemetry SDK 中。
如果你遵循了[入门指南](/docs/languages/js/getting-started/nodejs/)，你已经使用了元包。
如果你遵循了[手动插桩 SDK 初始化说明](/docs/languages/js/instrumentation/#initialize-tracing)，
更新你的 `instrumentation.ts` (或 `instrumentation.js`) 如下:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // 这里注册所有插桩库
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  // 这里注册所有插桩库
  instrumentations: [getNodeAutoInstrumentations()]
});
```

{{% /tab %}}

{{< /tabpane >}}

要禁用单个插桩库，可以进行以下更改:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // 这里注册所有插桩库
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start()
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  // 这里注册所有插桩库
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});
```

{{% /tab %}}

{{< /tabpane >}}

要仅加载单个插桩库，请将 `[getNodeAutoInstrumentations()]` 替换为你需要的那些库的列表:

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // Express 插桩要求 HTTP 层已完成插桩
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});

sdk.start()
```

{{% /tab %}} {{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // Express 插桩要求 HTTP 层已完成插桩
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});
```

{{% /tab %}}

{{< /tabpane >}}

### 配置 {#configuration}

一些插桩库提供了额外的配置选项。

例如，[Express 插桩](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express#express-instrumentation-options)
提供了可以忽略指定的中间件或通过请求钩子为自动生成的追踪 Span 补充更多信息等多种方式，

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
import { Span } from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions';
import {
  ExpressInstrumentation,
  ExpressLayerType,
  ExpressRequestInfo,
} from '@opentelemetry/instrumentation-express';

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span: Span, info: ExpressRequestInfo) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(ATTR_HTTP_REQUEST_METHOD, info.request.method);
      span.setAttribute(ATTR_URL_FULL, info.request.baseUrl);
    }
  },
});
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_URL_FULL,
} = require('@opentelemetry/semantic-conventions');
const {
  ExpressInstrumentation,
  ExpressLayerType,
} = require('@opentelemetry/instrumentation-express');

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span, info) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(ATTR_HTTP_REQUEST_METHOD, info.request.method);
      span.setAttribute(ATTR_URL_FULL, info.request.baseUrl);
    }
  },
});
```

{{% /tab %}}

{{< /tabpane >}}

你需要参考每个插桩库的文档以获取高级配置说明。

### 可用的插桩库 {#available-instrumentation-libraries}

你可以在[注册表](/ecosystem/registry/?language=js&component=instrumentation)中找到可用的插桩库列表。

## 对库进行原生插桩 {#instrument-a-library-natively}

如果要为库添加原生插桩，你应该参考以下文档：

- [库](/docs/concepts/instrumentation/libraries/)概念页面提供了关于何时插桩以及插桩什么的见解
- [手动插桩](/docs/languages/js/instrumentation/)提供了创建库的追踪、指标和日志所需的代码示例
- Node.js 和浏览器的[插桩实现指南](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md)
  包含了 JavaScript 特定的创建库插桩的最佳实践。

## 创建一个插桩库 {#create-an-instrumentation-library}

虽然为应用提供开箱即用的可观测性是理想方案，但这并非在所有情况下都可行或符合需求。
在这些场景下，你可以创建一个插桩库，该库会通过各种机制注入插桩调用，例如包装接口、订阅库专属回调函数，或是将现有遥测数据转换为 OpenTelemetry 数据模型。

创建这样的库请参考 Node.js 和浏览器的[插桩实现指南](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md)。
