---
title: 传播
description: 上下文传播 JS SDK
default_lang_commit: 1aa53278c92dd763c43c42c3b0383d572db54337
drifted_from_default: true
weight: 65
cSpell:ignore: rolldice
---

{{% docs/languages/propagation %}}

## 自动上下文传播 {#automatic-context-propagation}

像[插桩库](../libraries/)这样的工具，如
[`@opentelemetry/instrumentation-http`](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
或
[`@opentelemetry/instrumentation-express`](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
会为你在服务之间传播上下文。

如果你遵循了[入门指南](../getting-started/nodejs)，你可以创建一个客户端应用程序来查询 `/rolldice` 端点。

{{% alert title="备注" color="warning" %}}

你也可将本示例与其他任意语言快速入门指南中的示例应用整合使用。关联功能在不同编程语言编写的应用间均可生效，且无任何差异。

{{% /alert %}}

首先创建一个名为 `dice-client` 的新文件夹，然后安装所需的依赖项：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
npm install -D tsx  # 一个直接在 Node.js 中运行 TypeScript 文件的工具
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
```

{{% /tab %}} {{< /tabpane >}}

接下来，创建一个名为 `client.ts`（或 `client.js`）的新文件，内容如下：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/* client.ts */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

import { request } from 'undici';

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json: any) => console.log(json));
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/* instrumentation.mjs */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

const { request } = require('undici');

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json) => console.log(json));
});
```

{{% /tab %}} {{% /tabpane %}}

确保你在一个终端中运行了来自[入门指南](../getting-started/nodejs)的插桩版本 `app.ts`（或 `app.js`）：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx --import ./instrumentation.ts app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --import ./instrumentation.mjs app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

启动第二个终端并运行 `client.ts`（或 `client.js`）：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```shell
npx tsx client.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```shell
node client.js
```

{{% /tab %}} {{< /tabpane >}}

两个终端都应该向控制台输出 Span 详细信息。
客户端输出类似于以下内容：

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET',
  id: '6f64ce484217a7bf',
  kind: 2,
  timestamp: 1718875320295000,
  duration: 19836.833,
  attributes: {
    'url.full': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

请注意 traceId（`cccd19c3a2d10e589f01bfe2dc896dc2`）和 ID（`6f64ce484217a7bf`）。
这两个值也可以在客户端的输出中找到：

```javascript {hl_lines=[6,9]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: {
    traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
    spanId: '6f64ce484217a7bf',
    traceFlags: 1,
    isRemote: true
  },
  traceState: undefined,
  name: 'GET /rolldice',
  id: '027c5c8b916d29da',
  kind: 1,
  timestamp: 1718875320310000,
  duration: 3894.792,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

你的客户端和服务器应用程序成功报告了存在关联关系的 Span。
如果你现在将两者都发送到后端，可视化将显示这种依赖关系。

## 手动上下文传播 {#manual-context-propagation}

在某些情况下，如上一节所述，不可能自动传播上下文。
可能没有与你用于服务间通信的库相匹配的插桩库。
或者即使存在，这些库也可能无法满足你的要求。

当你必须手动传播上下文时，你可以使用[上下文 API](/docs/languages/js/context)。

### 通用示例 {#generic-example}

以下通用示例演示了如何手动传播链路上下文。

首先，在发送服务上，你需要注入当前的 `context`：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// 发送端服务
import { context, propagation, trace } from '@opentelemetry/api';

// 为承载链路信息的输出对象定义一个接口。
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// 创建一个符合该接口规范的输出对象。
const output: Carrier = {};

// 将上下文中的 traceparent 和 tracestate 序列化至一个输出对象中。
//
// 本示例使用的是当前活跃的链路上下文，但你也可以根据自身业务场景，选用任何合适的上下文。
propagation.inject(context.active(), output);

// 从输出对象中提取 traceparent 和 tracestate 的值
const { traceparent, tracestate } = output;

// 随后你可将 traceparent 和 tracestate 数据传递至任何你所使用的、用于跨服务传播上下文的机制中。
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// 发送端服务
const { context, propagation } = require('@opentelemetry/api');
const output = {};

// 将上下文中的 traceparent 和 tracestate 序列化到输出对象。
//
// 本示例使用活跃链路上下文，也可根据业务场景选用合适的上下文。
propagation.inject(context.active(), output);

const { traceparent, tracestate } = output;
// 随后你可将 traceparent 和 tracestate 数据传递至任何你所使用的、用于跨服务传播上下文的机制中。
```

{{% /tab %}} {{< /tabpane >}}

在接收服务上，你需要提取 `context`（例如，从解析的 HTTP 头中），然后将它们设置为当前链路上下文。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// 接收端服务
import {
  type Context,
  propagation,
  trace,
  Span,
  context,
} from '@opentelemetry/api';

// 定义一个接口，用于表示包含 'traceparent' 和 'tracestate' 键的输入对象。
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// 假设 "input" 是一个包含 'traceparent' 和 'tracestate' 键的对象。
const input: Carrier = {};

// 将 'traceparent' 和 'tracestate' 数据提取至一个上下文对象中。
//
// 随后你可将此上下文作为你的链路的活跃上下文使用。
let activeContext: Context = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span: Span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// 将创建的 Span 设为反序列化上下文的活跃 Span。
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// 接收端服务
import { context, propagation, trace } from '@opentelemetry/api';

// 假设 "input" 是一个包含 'traceparent' 和 'tracestate' 键的对象。
const input = {};

// 将 'traceparent' 和 'tracestate' 数据提取至一个上下文对象中。
//
// 随后你可将此上下文作为你的链路的活跃上下文使用。
let activeContext = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// 将创建的 Span 设为反序列化上下文的活跃 Span。
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{< /tabpane >}}

从那里开始，当你有一个反序列化的活动上下文时，你可以创建属于来自另一个服务的同一个链路的 Span。

你也可以使用[上下文](/docs/languages/js/context) API 以其他方式修改或设置反序列化的上下文。

### 自定义协议示例 {#custom-protocol-example}

当你需要手动传播上下文时，一个常见的用例是使用服务间通信的自定义协议。
以下示例使用基本的基于文本的 TCP 协议将一个序列化对象从一个服务发送到另一个服务。

首先创建一个名为 `propagation-example` 的文件夹，并按如下方式初始化依赖项：

```shell
npm init -y
npm install @opentelemetry/api @opentelemetry/sdk-node
```

接下来创建文件 `client.js` 和 `server.js`，内容如下：

```javascript
// client.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('client');

// 连接到服务器
const client = net.createConnection({ port: 8124 }, () => {
  // 将序列化对象发送至服务器
  let span = tracer.startActiveSpan('send', { kind: 1 }, (span) => {
    const output = {};
    propagation.inject(context.active(), output);
    const { traceparent, tracestate } = output;

    const objToSend = { key: 'value' };

    if (traceparent) {
      objToSend._meta = { traceparent, tracestate };
    }

    client.write(JSON.stringify(objToSend), () => {
      client.end();
      span.end();
    });
  });
});
```

```javascript
// server.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('server');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const message = data.toString();
    // 解析从客户端接收的 JSON 对象
    try {
      const json = JSON.parse(message);
      let activeContext = context.active();
      if (json._meta) {
        activeContext = propagation.extract(context.active(), json._meta);
        delete json._meta;
      }
      span = tracer.startSpan('receive', { kind: 1 }, activeContext);
      trace.setSpan(activeContext, span);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    } finally {
      span.end();
    }
  });
});

// 监听 8124 端口
server.listen(8124, () => {
  console.log('Server listening on port 8124');
});
```

启动第一个终端来运行服务器：

```console
$ node server.js
Server listening on port 8124
```

然后在第二个终端中运行客户端：

```shell
node client.js
```

客户端应立即终止，服务器应输出以下内容：

```text
Parsed JSON: { key: 'value' }
```

由于到目前为止，该示例仅依赖 OpenTelemetry API，因此所有对该 API 的调用均为[空操作指令](<https://en.wikipedia.org/wiki/NOP_(code)>)，客户端与服务端的运行行为也等同于未启用 OpenTelemetry 的状态。

{{% alert title="Note" color="warning" %}}

这在你的服务器和客户端代码是库的情况下尤为重要，因为它们应该只使用 OpenTelemetry API。
要了解原因，请阅读[关于如何为你的库添加插桩的概念页面](/docs/concepts/instrumentation/libraries/)。

{{% /alert %}}

要启用 OpenTelemetry 并查看上下文传播的实际效果，请创建一个名为 `instrumentation.js` 的附加文件，内容如下：

```javascript
// instrumentation.mjs
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

sdk.start();
```

使用此文件来运行服务器和客户端，并启用插桩：

```console
$ node --import ./instrumentation.mjs server.js
Server listening on port 8124
```

以及

```shell
node --import ./instrumentation.mjs client.js
```

在客户端向服务器发送数据并终止后，你应该在两个终端的控制台输出中看到 Span。

客户端的输出类似于以下内容：

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: undefined,
  traceState: undefined,
  name: 'send',
  id: '92f125fa335505ec',
  kind: 1,
  timestamp: 1718879823424000,
  duration: 1054.583,
  // ...
}
```

服务器的输出类似于以下内容：

```javascript {hl_lines=[7,8]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: '92f125fa335505ec',
  traceState: undefined,
  name: 'receive',
  id: '53da0c5f03cb36e5',
  kind: 1,
  timestamp: 1718879823426000,
  duration: 959.541,
  // ...
}
```

与[手动示例](#manual-context-propagation)类似，这些 Span 使用 `traceId` 和 `id`、`parentId` 连接。

## 下一步 {#next-steps}

要了解有关传播的更多信息，请阅读[传播器 API 规范](/docs/specs/otel/context/api-propagators/)。
