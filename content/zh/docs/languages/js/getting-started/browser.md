---
title: 浏览器
aliases: [/docs/js/getting_started/browser]
description: 了解如何为你的浏览器应用添加 OpenTelemetry
default_lang_commit: 4c9af5912f276b79a489a10b44c53f720c7927d7
weight: 20
---

{{% include browser-instrumentation-warning.md %}}

尽管本指南使用下述示例应用，你也可以将这些步骤应用于你自己的应用。

## 前置条件 {#prerequisites}

请确保你已在本地安装以下内容：

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download)，如果你将使用 TypeScript。

## 示例应用 {#example-application}

这是一个非常简单的指南，如果你想查看更复杂的示例，请访问
[examples/opentelemetry-web](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web)。

将以下文件复制到空目录中，并将其命名为 `index.html`。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Document Load Instrumentation Example</title>
    <base href="/" />
    <!--
      https://www.w3.org/TR/trace-context/
      在服务器的 HTML 模板代码中设置 `traceparent`。
      它应在服务器端动态生成，包含服务器的请求跟踪 ID、在服务器请求 Span 上设置的父 Span ID，
      以及用于指示服务器采样决策的跟踪标志（01 表示已采样，00 表示未采样）。
      格式为：{version}-{traceId}-{spanId}-{sampleDecision}
    -->
    <meta
      name="traceparent"
      content="00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    使用 Web Tracer 进行文档加载插桩的示例，包含控制台导出器和收集器导出器。
  </body>
</html>
```

### 安装 {#installation}

要在浏览器中创建链路，你需要 `@opentelemetry/sdk-trace-web` 和 `@opentelemetry/instrumentation-document-load` 插桩库：

```shell
npm init -y
npm install @opentelemetry/api \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/instrumentation-document-load \
  @opentelemetry/context-zone
```

### 初始化与配置 {#initialization-and-configuration}

如果你使用 TypeScript 编写应用，你需要运行以下命令：

```shell
tsc --init
```

然后获取 [parcel](https://parceljs.org/)，它（除其他功能外）可让你使用 TypeScript 进行开发。

```shell
npm install --save-dev parcel
```

根据你选择的应用开发语言，创建一个名为 `document-load` 的空代码文件，扩展名为 `.ts` 或 `.js`。
在 HTML 中 `</body>` 结束标签前添加以下代码：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```html
<script type="module" src="document-load.ts"></script>
```

{{% /tab %}} {{% tab JavaScript %}}

```html
<script type="module" src="document-load.js"></script>
```

{{% /tab %}} {{< /tabpane >}}

我们将添加一些代码来追踪文档加载时间，并将其作为 OpenTelemetry Span 输出。

### 创建一个 Tracer 提供器 {#creating-a-tracer-provider}

在 `document-load.ts|js` 中添加以下代码以创建一个 tracer 提供器，该提供器会引入用于追踪文档加载的插桩功能：

```js
/* document-load.ts|js 文件（此代码片段在两种语言中是相同的）*/
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider();

provider.register({
  // 将默认的 contextManager 更改为使用 ZoneContextManager（支持异步操作，可选）
  contextManager: new ZoneContextManager(),
});

// 注册插桩
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

现在使用 parcel 构建应用：

```shell
npx parcel index.html
```

然后打开开发 Web 服务器（例如在 `http://localhost:1234`）以查看代码是否工作。

如果一切正常，你应该在浏览器的开发者工具控制台中看到一些链路数据。

### 创建一个导出器 {#creating-an-exporter}

在以下示例中，我们将使用 `ConsoleSpanExporter`，它会将所有 Span 打印到控制台。

为了可视化和分析你的链路，你需要将它们导出到链路后端。请按照[这些说明](../../exporters)设置后端和导出器。

你可能还想使用 `BatchSpanProcessor` 批量导出 Span，以更有效地利用资源。

要将链路导出到控制台，请修改 `document-load.ts|js` 使其与以下代码片段匹配：

```js
/* document-load.ts|js 文件（此代码片段在两种语言中是相同的）*/
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

provider.register({
  // 将默认的 contextManager 更改为使用 ZoneContextManager（支持异步操作，可选）
  contextManager: new ZoneContextManager(),
});

// 注册插桩
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

现在，重新构建你的应用程序并再次打开浏览器。在开发者工具的控制台中，你应该会看到一些被导出的链路：

```json
{
  "traceId": "ab42124a3c573678d4d8b21ba52df3bf",
  "parentId": "cfb565047957cb0d",
  "name": "documentFetch",
  "id": "5123fc802ffb5255",
  "kind": 0,
  "timestamp": 1606814247811266,
  "duration": 9390,
  "attributes": {
    "component": "document-load",
    "http.response_content_length": 905
  },
  "status": {
    "code": 0
  },
  "events": [
    {
      "name": "fetchStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "domainLookupStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "domainLookupEnd",
      "time": [1606814247, 811266158]
    },
    {
      "name": "connectStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "connectEnd",
      "time": [1606814247, 811266158]
    },
    {
      "name": "requestStart",
      "time": [1606814247, 819101158]
    },
    {
      "name": "responseStart",
      "time": [1606814247, 819791158]
    },
    {
      "name": "responseEnd",
      "time": [1606814247, 820656158]
    }
  ]
}
```

### 添加插桩 {#add-instrumentations}

如果你想要对 Ajax 请求、用户交互等进行插桩，你可以添加额外的插桩库并注册它们：

```sh
npm install @opentelemetry/instrumentation-user-interaction \
  @opentelemetry/instrumentation-xml-http-request \
```

```javascript
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});
```

## Web 基础包 {#meta-packages-for-web}

若要一次性利用最常见的插桩功能，你只需使用 [OpenTelemetry Web 基础包](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web)。
