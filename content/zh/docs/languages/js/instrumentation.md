---
title: 插桩
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
aliases:
  - /docs/languages/js/api/tracing
  - manual
weight: 30
description: OpenTelemetry JavaScript 插桩工具
cSpell:ignore: dicelib Millis rolldice
---

{{% include instrumentation-intro.md %}}

{{% alert title="备注" %}}

在本页中，你将学习如何**手动**向代码添加链路、指标和日志。
但是，你并不局限于只使用一种插桩方式：
可以使用[自动插桩](/docs/zero-code/js/)来入门，然后根据需要使用手动插桩来丰富代码。

{{% /alert %}}

## 示例应用程序准备 {#example-app}

本页使用了[入门指南](/docs/languages/js/getting-started/nodejs/)中的示例应用程序的修改版本，帮助你学习手动插桩。

你无需使用该示例应用程序：如果你希望为自己的应用程序或库实现插桩，可遵循此处的说明，将该流程调整适配到你自己的代码中。

### 依赖项 {#example-app-dependencies}

在一个新目录下创建一个空的 NPM `package.json` 文件：

```shell
npm init -y
```

然后，安装 Express 依赖项。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm install express @types/express
npm install -D tsx  # 一款可通过 Node.js 直接运行 TypeScript（.ts）文件的工具
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### 创建和启动一个 HTTP 服务器 {#create-and-launch-an-http-server}

为了突出**类库**和独立**应用程序**实现插桩的区别，
将掷骰子逻辑提取到一个**类库文件**中，该文件将作为**应用程序文件**的依赖项导入。

创建名为 `dice.ts`（或 `dice.js` 如果不使用 TypeScript）的**库文件**，并添加以下代码：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

创建名为 `app.ts`（或 `app.js` 如果不使用 TypeScript）的**应用程序文件**，并添加以下代码：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');
const { rollTheDice } = require('./dice.js');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

为了确保其工作正常，请使用以下命令运行应用程序，
并在浏览器中打开 <http://localhost:8080/rolldice?rolls=12>。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## 手动插桩配置 {#manual-instrumentation-setup}

### 依赖项 {#dependencies}

安装 OpenTelemetry API 包：

```shell
npm install @opentelemetry/api @opentelemetry/resources @opentelemetry/semantic-conventions
```

### 初始化 SDK {#initialize-the-sdk}

{{% alert title="备注" %}} 如果你正在为一个类库实现插桩，**请跳过此步骤**。 {{% /alert %}}

若要为 Node.js 应用实现插桩，请安装 [OpenTelemetry Node.js 版 SDK](https://www.npmjs.com/package/@opentelemetry/sdk-node)：

```shell
npm install @opentelemetry/sdk-node
```

在应用程序加载任何其他模块之前，必须初始化 SDK。
若 SDK 初始化失败或初始化时机过晚，
任何从该 API 获取追踪器（tracer）或计量器（meter）的类库，都会被提供无操作实现版本。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'yourServiceName',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

出于调试和本地开发目的，以下示例将遥测数据导出到控制台。
完成手动插桩的配置后，你需要配置一个合适的导出器，以将[应用的遥测数据导出](/docs/languages/js/exporters/)至一个或多个遥测后端。

该示例还设置了强制性的 SDK 默认属性 `service.name`，它保存服务的逻辑名称，
并设置了可选的（但强烈建议！）属性 `service.version`，它保存服务 API 或实现的版本。

设置资源属性还存在其他方法。如需了解更多信息，请参见[资源](/docs/languages/js/resources/)。

{{% alert title="备注" %}} 以下使用 `--import instrumentation.ts`（TypeScript）的示例需要 Node.js v20 或更高版本。
如果你使用的是 Node.js v18，请使用 JavaScript 示例。 {{% /alert %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

此基本设置尚未对应用程序产生任何影响。
你需要添加[链路](#traces)、[指标](#metrics)、[日志](#logs)的代码。

你可以将类库注册到 OpenTelemetry Node.js 版 SDK 中，以便为你的依赖项生成遥测数据。
如需了解更多信息，请参见[类库](/docs/languages/js/libraries/)。

## 链路 {#traces}

### 初始化链路追踪 {#initialize-tracing}

{{% alert title="备注" %}} 如果你正在为一个类库实现插桩，**请跳过此步骤**。 {{% /alert %}}

要在应用程序中启用[链路追踪](/docs/concepts/signals/traces/)，
你需要有一个已初始化的
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider)，
它将允许你创建一个 [`Tracer`](/docs/concepts/signals/traces/#tracer)。

如果未创建 `TracerProvider`，则 OpenTelemetry 链路追踪 API 将使用无操作实现版本，无法生成数据。
如下文所述，请修改 `instrumentation.ts`（或 `instrumentation.js`）文件，
将所有 SDK 初始化代码纳入其中，以适配 Node 环境和浏览器环境。

#### Node.js {#nodejs}

如果你遵循了上述[初始化 SDK](#initialize-the-sdk) 的说明，
你已经有一个为你设置好的 `TracerProvider`。
你可以继续[获取一个 tracer](#acquiring-a-tracer)。

#### 浏览器 {#browser}

{{% include browser-instrumentation-warning.md %}}

首先，确保你拥有正确的包：

```shell
npm install @opentelemetry/sdk-trace-web
```

然后，更新 `instrumentation.ts`（或 `instrumentation.js`），
使其包含所有 SDK 初始化代码：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  defaultResource,
  resourceFromAttributes,
} = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const {
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
```

{{% /tab %}} {{< /tabpane >}}

你需要将此文件与你的 Web 应用程序捆绑在一起，来确保在应用程序启动时加载并执行此文件。

这尚未对你的应用程序产生任何影响：
你需要[创建 Span](#create-spans)，才能使你的应用程序生成遥测数据。

#### 选择正确的 Span 处理器 {#picking-the-right-span-processor}

默认情况下，Node SDK 使用 `BatchSpanProcessor`，Web SDK 示例中也选择了此 Span 处理器。
`BatchSpanProcessor` 会在导出之前批量处理 Span。
对于应用程序而言，这通常是适用的处理器。

相比之下，`SimpleSpanProcessor` 会在 Span 创建时立即处理 Span。
这意味着如果你创建了 5 个 Span，
每个 Span 都会立即被处理和导出，而不会等待其他 Span 的创建。
在你不想承担批次数据丢失风险的场景下，或是在开发环境中试用 OpenTelemetry 时，这一方式会十分实用。
但是，这也可能带来显著的开销，尤其是在通过网络导出 Span 的情况下——
每个 Span 创建时都需要进行网络调用，这会增加应用程序的延迟。

在大多数情况下，请坚持使用 `BatchSpanProcessor`，而非 `SimpleSpanProcessor`。

### 获取一个追踪器 {#acquiring-a-tracer}

在应用程序中的任何地方编写手动链路追踪代码时，都应调用 `getTracer` 来获取一个追踪器。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
//......

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// 现在你可以使用 'tracer' 来实现链路追踪了！
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
//......

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// 现在你可以使用 'tracer' 来实现链路追踪了！
```

{{% /tab %}} {{< /tabpane >}}

`instrumentation-scope-name` 和 `instrumentation-scope-version` 的值应能唯一标识[插桩作用域](/docs/concepts/instrumentation-scope/)。
例如包名、模块名或类名。其中名称为必填项，版本号虽为可选项，但仍建议填写。

一般建议在需要时调用 `getTracer`，而不是将 `tracer` 实例导出到应用程序的其他部分。
这有助于避免在其他依赖项存在时导致的加载问题。

以[示例应用](#example-app)为例，存在两处可通过恰当的插桩作用域获取追踪器的场景：

首先，在**应用程序文件** `app.ts`（或 `app.js`）中：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts {hl_lines=[6]}
/*app.ts*/
import { trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js {hl_lines=[6]}
/*app.js*/
const { trace } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

And second, in the _library file_ `dice.ts` (or `dice.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts {hl_lines=[4]}
/*dice.ts*/
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js {hl_lines=[4]}
/*dice.js*/
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

### 创建Span {#create-spans}

现在你已经有了已初始化的[追踪器](/docs/concepts/signals/traces/#tracer)，
你可以使用它来创建 [Span](/docs/concepts/signals/traces/#spans)。

OpenTelemetry JavaScript API 提供了两种创建 Span 的方法：

- [`tracer.startSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Tracer.html#startspan)：
  启动一个新 Span，但不会将其设置到上下文中。
- [`tracer.startActiveSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Tracer.html#startactivespan)：
  启动一个新 Span 并调用给定的回调函数，将新 Span 作为第一个参数传递。
  新 Span 会被设置到上下文中，并且在回调函数执行期间会被激活。

在大多数情况下，你应该使用后者（`tracer.startActiveSpan`），因为它会负责设置 Span 和其上下文激活。

下面的代码演示了如何创建一个活跃的 Span。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { trace, type Span } from '@opentelemetry/api';

/* ...... */

export function rollTheDice(rolls: number, min: number, max: number) {
  // 创建一个 Span。该 Span 应该被关闭。
  return tracer.startActiveSpan('rollTheDice', (span: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // 确保关闭 Span！
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  // 创建一个 Span。该 Span 应该被关闭。
  return tracer.startActiveSpan('rollTheDice', (span) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // 确保关闭 Span！
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

如果你遵循了上述[示例应用](#example-app)的说明，
并将上述代码复制到你的库文件 `dice.ts`（或 `dice.js`）中，
你应该现在能够在应用中看到生成的 Span。

按照以下方式启动应用，然后通过访问 <http://localhost:8080/rolldice?rolls=12> 来发送请求（使用浏览器或 `curl`）。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

经过一段时间后，你应该会在控制台中看到 `ConsoleSpanExporter` 打印的 Span，类似如下内容：

```js
{
  resource: {
    attributes: {
      'service.name': 'dice-server',
      'service.version': '0.1.0',
      // ......
    }
  },
  instrumentationScope: { name: 'dice-lib', version: undefined, schemaUrl: undefined },
  traceId: '30d32251088ba9d9bca67b09c43dace0',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'rollTheDice',
  id: 'cc8a67c2d4840402',
  kind: 0,
  timestamp: 1756165206470000,
  duration: 35.584,
  attributes: {},
  status: { code: 0 },
  events: [],
  links: []
}
```

### 创建嵌套 Span {#create-nested-spans}

嵌套 [Span](/docs/concepts/signals/traces/#spans) 可用于追踪具有嵌套结构的任务。
例如，下面的 `rollOnce()` 函数代表一个嵌套操作。
以下示例会创建一个嵌套跨度，用于追踪 `rollOnce()` 函数的执行过程：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  // 创建一个 Span。该 Span 应该被关闭。
  return tracer.startActiveSpan('rollTheDice', (parentSpan: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // 确保关闭 Span！
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

function rollTheDice(rolls, min, max) {
  // 创建一个 Span。该 Span 应该被关闭。
  return tracer.startActiveSpan('rollTheDice', (parentSpan) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // 确保关闭 Span！
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

这段代码会为每一次**掷骰子**操作创建一个子跨度，该子跨度将 `parentSpan` 的 ID 作为自身的父级 ID：

```js
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ......
  },
  name: 'rollOnce:0',
  id: '36423bc1ce7532b0',
  timestamp: 1756165362215000,
  duration: 85.667,
  // ......
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ......
  },
  name: 'rollOnce:1',
  id: 'ed9bbba2264d6872',
  timestamp: 1756165362215000,
  duration: 16.834,
  // ......
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: undefined,
  name: 'rollTheDice',
  id: '38691692d6bc3395',
  timestamp: 1756165362214000,
  duration: 1022.209,
  // ......
}
```

### 创建独立 Span {#create-independent-spans}

前述示例演示了如何创建活跃 Span。在某些场景下，你可能需要创建非活跃 Span，这类跨度彼此互为同级，而非呈嵌套关系。

```js
const doWork = () => {
  const span1 = tracer.startSpan('work-1');
  // 执行一些工作
  const span2 = tracer.startSpan('work-2');
  // 执行更多工作
  const span3 = tracer.startSpan('work-3');
  // 执行更多工作

  span1.end();
  span2.end();
  span3.end();
};
```

在此示例中，`span1`、`span2` 和 `span3` 是同级 Span，
它们都不被视为当前活动 Span。
它们共用同一个父级，而非彼此嵌套。

若你有一些归为一组、但在逻辑层面彼此独立的工作单元，这种结构会十分实用。

### 获得当前 Span {#get-the-current-span}

在程序执行过程中的特定节点，
对当前或活跃 [Span](/docs/concepts/signals/traces/#spans) 执行某些操作，有时会起到事半功倍的效果。

```js
const activeSpan = opentelemetry.trace.getActiveSpan();

// 对活跃 Span 执行某些操作，视情况可选是否结束它。
```

### 从上下文获取 Span {#get-a-span-from-context}

从给定的上下文中获取 [Span](/docs/concepts/signals/traces/#spans) 也会很有帮助,这个上下文未必是当前活跃的 Span。

```js
const ctx = getContextFromSomewhere();
const span = opentelemetry.trace.getSpan(ctx);

// 对获取到的 Span 执行某些操作，视情况可选是否结束它。
```

### 属性 {#attributes}

[属性](/docs/concepts/signals/traces/#attributes)允许你将键值对附加到 [`Span`](/docs/concepts/signals/traces/#spans) 上，
以便在追踪当前操作时携带更多信息。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // 向 Span 添加属性
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // 向 Span 添加属性
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

You can also add attributes to a span as it's created:

```javascript
tracer.startActiveSpan(
  'app.new-span',
  { attributes: { attribute1: 'value1' } },
  (span) => {
    // 执行一些工作......

    span.end();
  },
);
```

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollTheDice(rolls: number, min: number, max: number) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span: Span) => {
      /* ...... */
    },
  );
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span) => {
      /* ...... */
    },
  );
}
```

{{% /tab %}} {{< /tabpane >}}

#### 语义属性 {#semantic-attributes}

对于代表 HTTP、数据库调用等常见协议操作的 Span，存在对应的语义规范。
这些 Span 的语义规范在[链路语义规范](/docs/specs/semconv/general/trace/)中有定义。
在本指南的简单示例中，可直接使用源代码属性。

首先，将语义规范作为依赖项添加到你的应用程序中：

```shell
npm install --save @opentelemetry/semantic-conventions
```

然后，将以下内容添加到应用程序文件的顶部：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} from '@opentelemetry/semantic-conventions';
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} = require('@opentelemetry/semantic-conventions');
```

{{% /tab %}} {{< /tabpane >}}

Finally, you can update your file to include semantic attributes:

```javascript
const doWork = () => {
  tracer.startActiveSpan('app.doWork', (span) => {
    span.setAttribute(ATTR_CODE_FUNCTION_NAME, 'doWork');
    span.setAttribute(ATTR_CODE_FILE_PATH, __filename);

    // 执行一些工作......

    span.end();
  });
};
```

### Span 事件 {#span-events}

一个 [Span 事件](/docs/concepts/signals/traces/#span-events)是 [`Span`](/docs/concepts/signals/traces/#spans) 上的一个便于人类阅读的消息，
表示一个无持续时长的离散事件，可以通过单个时间戳进行跟踪。你可以将其视为原始日志。

```js
span.addEvent('Doing something');

const result = doWork();
```

你还可以使用额外的[属性](/docs/concepts/signals/traces/#attributes)来创建 Span 事件：

```js
span.addEvent('some log', {
  'log.severity': 'error',
  'log.message': 'Data not found',
  'request.id': requestId,
});
```

### Span 链接 {#span-links}

[`Span`](/docs/concepts/signals/traces/#spans) 可以零个或多个 [`Link`](/docs/concepts/signals/traces/#span-links) 链接到其他因果相关的 Span。
一种常见场景是将一条或多条追踪链路，与当前 Span 建立关联关系。

```js
const someFunction = (spanToLinkFrom) => {
  const options = {
    links: [
      {
        context: spanToLinkFrom.spanContext(),
      },
    ],
  };

  tracer.startActiveSpan('app.someFunction', options, (span) => {
    // 执行一些工作......

    span.end();
  });
};
```

### Span 状态 {#span-status}

{{% include "span-status-preamble.md" %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ......

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Error',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ......

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Error',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{< /tabpane >}}

### 记录异常 {#recording-exceptions}

当异常发生时，记录异常是一个好主意。建议将其 [Span 状态](#span-status)结合使用。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ......

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ......

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{< /tabpane >}}

### 使用 `sdk-trace-base` 手动传播 Span 上下文 {#using-sdk-trace-base-and-manually-propagating-span-context}

在某些情况下，你可能无法使用 Node.js SDK 或 Web SDK。
除初始化代码外，最大的区别在于，你必须手动将 Span 设置为当前上下文中的活跃状态，才能创建嵌套跨度。

#### 使用 `sdk-trace-base` 初始化追踪功能 {#initializing-tracing-with-sdk-trace-base}

追踪功能的初始化方式类似与你在 Node.js 或 Web SDK 中的实现方式。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // 配置 Span 处理器，将 Span 发送至导出器
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// 这是我们在所有插桩代码中访问的内容
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} = require('@opentelemetry/core');
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // 配置 Span 处理器，将 Span 发送至导出器
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// 这是我们在所有插桩代码中访问的内容
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{< /tabpane >}}

与本文档中的其他示例一样，这会导出一个可在整个应用程序中使用的追踪器。

#### 使用 `sdk-trace-base` 创建嵌套 Span {#creating-nested-spans-with-sdk-trace-base}

要创建嵌套跨度，你需要将当前创建的 Span 设置为当前上下文中的活跃 Span。
不要使用 `startActiveSpan`，因为它不会为你完成此操作。

```javascript
const mainWork = () => {
  const parentSpan = tracer.startSpan('main');

  for (let i = 0; i < 3; i += 1) {
    doWork(parentSpan, i);
  }

  // 确保结束父 Span！
  parentSpan.end();
};

const doWork = (parent, i) => {
  // 要创建子 Span，我们需要将当前（父）Span 设置为当前上下文中的活跃 Span，
  // 然后使用 resulting context 创建子 Span。
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent,
  );
  const span = tracer.startSpan(`doWork:${i}`, undefined, ctx);

  // 模拟一些随机工作。
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }

  // 确保结束子 Span！如果不这样做，
  // 它将继续跟踪超出 'doWork' 的工作！
  span.end();
};
```

所有其他 API 在使用 `sdk-trace-base` 时与 Node.js 或 Web SDK 相同。

## 指标 {#metrics}

[指标](/docs/concepts/signals/metrics)会将单独的测量数据聚合为汇总数据，
并生成不受系统负载影响的稳定数据。
聚合值缺少诊断低级问题所需的详细信息，但通过帮助识别趋势和提供应用程序运行时遥测，
补充了跨度。

### 初始化指标工具 {#initialize-metrics}

{{% alert %}} 若你正在为某个库做插桩适配，则可跳过此步骤。 {{% /alert %}}

要在应用程序中启用[指标工具](/docs/concepts/signals/metrics/)，
你需要初始化一个 [`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider)，
该提供程序将允许你创建一个 [`Meter`](/docs/concepts/signals/metrics/#meter)。

如果未创建 `MeterProvider`，OpenTelemetry 指标 API 将使用无操作实现，无法生成数据。
如接下来所述，修改 `instrumentation.ts`（或 `instrumentation.js`）文件，
将所有 SDK 初始化代码包含在 Node 和浏览器中。

#### Node.js {#initialize-metrics-nodejs}

如果你遵循了上述[初始化 SDK](#initialize-the-sdk) 的说明，
则已为你设置了一个 `MeterProvider`。你可以继续[获取指标工具](#acquiring-a-meter)。

##### 使用 `sdk-metrics` 初始化指标工具 {#initialize-metrics-sdk-metrics}

在某些情况下，你可能无法或不想使用 [Node.js 完整 OpenTelemetry SDK](https://www.npmjs.com/package/@opentelemetry/sdk-node)。
若你希望在浏览器环境中使用 OpenTelemetry JavaScript 库，该要求同样有效。

若要初始化指标工具，你可以使用 `@opentelemetry/sdk-metrics` 包：

```shell
npm install @opentelemetry/sdk-metrics
```

若你尚未为追踪功能创建过该文件，
请新建一个独立的 `instrumentation.ts`（或 `instrumentation.js`）文件，
并将所有 SDK 初始化代码置于其中：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  // 默认值为 60000ms（60 秒）。仅用于演示目的，将其设置为 10 秒。
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// 将此 MeterProvider 配置为当前待插桩应用的全局实例。
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const {
  defaultResource,
  resourceFromAttributes,
} = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // 默认值为 60000ms（60 秒）。仅用于演示目的，将其设置为 10 秒。
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// 将此 MeterProvider 配置为当前待插桩应用的全局实例。
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{< /tabpane >}}

你需要在运行应用程序时使用 `--import` 导入此文件，例如：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

现在已配置 `MeterProvider`，你可以获取 `Meter`。

### 获取计量器 {#acquiring-a-meter}

在应用中所有手动编写了插桩代码的位置，你都可以调用 `getMeter` 方法来获取计量器。例如：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';

const myMeter = opentelemetry.metrics.getMeter(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// 现在你可借助该 'meter' 来创建插桩了！
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// 现在你可借助该 'meter' 来创建插桩了！
```

{{% /tab %}} {{< /tabpane >}}

`instrumentation-scope-name` 和 `instrumentation-scope-version` 的取值应能唯一标识[插桩范围](/docs/concepts/instrumentation-scope/)，
例如包名、模块名或类名。其中名称为必填项，版本虽为可选项但仍建议填写。

通常建议在应用程序中需要时调用 `getMeter`，而非将计量器实例导出到应用程序的其他部分。
当涉及其他必要依赖项时，此举有助于规避更为棘手的应用程序加载问题。

以[示例应用](#example-app)为例，有两处位置可结合合适的插桩范围来获取计量器：

首先，在**应用程序文件** `app.ts`（或 `app.js`）中：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import { metrics, trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const { trace, metrics } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

其次，在**库文件** `dice.ts`（或 `dice.js`）中：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
import { trace, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const { trace, metrics } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

现在你已初始化了[计量器](/docs/concepts/signals/metrics/#meter)，
你可以借助它来创建[指标插桩](/docs/concepts/signals/metrics/#metric-instruments)。

### 使用计数器 {#using-counters}

计数器可用于测量非负、递增的值。

以[示例应用](#example-app)为例，我们可以使用它来统计骰子被掷的次数：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min: number, max: number) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min, max) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

{{% /tab %}} {{< /tabpane >}}

### 使用增减计数器 {#using-updown-counters}

增减计数器支持递增和递减操作，可用于观测一个可增可减的累计值。

```js
const counter = myMeter.createUpDownCounter('events.counter');

//......

counter.add(1);

//......

counter.add(-1);
```

### 使用直方图 {#using-histograms}

直方图用于测量一段时间内值的分布。

例如，以下示例展示了如何基于 Express 框架上报某一 API 路由的响应时间分布情况：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import express from 'express';

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // 在一次 API 调用中执行一些业务处理逻辑

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // 记录任务操作的持续时间
  histogram.record(executionTime);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const express = require('express');

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // 在一次 API 调用中执行一些业务处理逻辑

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // 记录任务操作的持续时间
  histogram.record(executionTime);
});
```

{{% /tab %}} {{< /tabpane >}}

### 使用可观测（异步）计数器 {#using-observable-async-counters}

可观测计数器可用于计量具有累加性、非负性且单调递增的数值。

```js
const events = [];

const addEvent = (name) => {
  events.push(name);
};

const counter = myMeter.createObservableCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//…… 对 addEvent 方法的调用
```

### 使用可观测（异步）增减计数器 {#using-observable-async-updown-counters}

可观测增减计数器支持递增和递减操作，可用于计量具备累加性、非负性但非单调递增的累计值。

```js
const events = [];

const addEvent = (name) => {
  events.push(name);
};

const removeEvent = () => {
  events.pop();
};

const counter = myMeter.createObservableUpDownCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//…… 对 addEvent 和 removeEvent 方法的调用
```

### 使用可观测（异步）瞬时值计量器 {#using-observable-async-gauges}

可观测瞬时值计量器用于测量非累加性值。

```js
let temperature = 32;

const gauge = myMeter.createObservableGauge('temperature.gauge');

gauge.addCallback((result) => {
  result.observe(temperature);
});

//…… 温度变量由传感器修改
```

### 插桩说明 {#describing-instruments}

创建计数器、直方图等插桩时，你可以为它们添加描述信息。

```js
const httpServerResponseDuration = myMeter.createHistogram(
  'http.server.duration',
  {
    description: 'A distribution of the HTTP server response times',
    unit: 'milliseconds',
    valueType: ValueType.INT,
  },
);
```

JavaScript 中，每个配置类型含义如下：

- `description` - 便于人类阅读的插桩描述
- `unit` - 用于描述数值所代表的计量单位。例如，使用 `milliseconds` 来衡量持续时间，或使用 `bytes` 来统计字节数。
- `valueType` - 用于测量的数值类型。

通常建议描述你创建的每个插桩。

### 添加属性信息 {#adding-attributes}

你可在指标生成时为其添加属性信息。

```js
const counter = myMeter.createCounter('my.counter');

counter.add(1, { 'some.optional.attribute': 'some value' });
```

### 配置指标视图 {#configuring-metric-views}

指标视图为开发者提供了自定义由指标 SDK 对外暴露的指标数据的能力。

#### 选择器 {#selectors}

要实例化一个视图，需先选定目标指标插桩。以下是适用于指标的合法选择器：

- `instrumentType`
- `instrumentName`
- `meterName`
- `meterVersion`
- `meterSchemaUrl`

选择器 `instrumentName`（类型为字符串）支持通配符，因此你可以使用 `*` 选择所有插桩，或使用 `http*` 选择所有名称以 `http` 开头的插桩。

#### 示例 {#examples}

对所有指标类型进行属性筛选：

```js
const limitAttributesView = {
  // 仅导出属性 'environment'
  attributeKeys: ['environment'],
  // 应用视图到所有插桩
  instrumentName: '*',
};
```

删除所有 meter 名称为 `pubsub` 的插桩：

```js
const dropView = {
  aggregation: { type: AggregationType.DROP },
  meterName: 'pubsub',
};
```

为名为 `http.server.duration` 的直方图定义显式的桶大小：

```js
const histogramView = {
  aggregation: {
    type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
    options: { boundaries: [0, 1, 5, 10, 15, 20, 25, 30] },
  },
  instrumentName: 'http.server.duration',
  instrumentType: InstrumentType.HISTOGRAM,
};
```

#### 关联至计量器提供器 {#attaching-to-meter-provider}

配置视图后，将它们关联到相应的计量器提供器：

```js
const meterProvider = new MeterProvider({
  views: [limitAttributesView, dropView, histogramView],
});
```

## 日志 {#logs}

日志 API 和 SDK 当前正在开发中。

## 下一步 {#next-steps}

你还需要配置一个合适的导出器，以将[遥测数据导出](/docs/languages/js/exporters)至一个或多个遥测后端。
