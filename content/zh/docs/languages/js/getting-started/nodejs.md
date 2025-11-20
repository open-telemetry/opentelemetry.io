---
title: Node.js
description: 5 分钟内为你的应用获取遥测数据！
default_lang_commit: 6ffcc4d3f434c2af67e1983ec732fc700052a93d
aliases: [/docs/js/getting_started/nodejs]
weight: 10
cSpell:ignore: autoinstrumentations rolldice
---

这个页面将向你展示如何在 Node.js 中开始使用 OpenTelemetry。

你将学习如何为应用程序植入[链路][traces]和[指标][metrics]，并将其记录到控制台。

{{% alert title="Note" %}} OpenTelemetry for Node.js 的日志记录库仍在开发中，因此下面没有提供示例。
有关状态详情，请参阅[状态和发布](/docs/languages/js/#status-and-releases)。 {{% /alert %}}

## 前提条件 {#prerequisites}

确保你已安装以下内容：

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download)，如果您将使用 TypeScript。

## 示例应用程序 {#example-application}

以下示例使用一个基本的 [Express](https://expressjs.com/) 应用程序。
如果您不使用 Express，也没关系——您也可以将 OpenTelemetry JavaScript 与其他 Web 框架一起使用，例如 Koa 和 Nest.JS。
有关受支持框架的库的完整列表，请参阅[注册表](/ecosystem/registry/?component=instrumentation&language=js)。

有关更详细的示例，请参阅[示例](/docs/languages/js/examples/)。

### 依赖项 {#dependencies}

起初，设置一个新目录中的空 `package.json` 文件：

```shell
npm init -y
```

接下来，安装 Express 依赖项。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm install express @types/express
npm install -D tsx  # 一个可通过 Node 直接运行 TypeScript（.ts）文件的工具
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### 创建和启动一个 HTTP 服务器 {#create-and-launch-an-http-server}

创建一个名为 `app.ts`（如果不使用 TypeScript，则为 `app.js`）的文件，并将以下代码添加到其中：

{{% tabpane text=true %}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { Express } from 'express';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% /tabpane %}}

执行以下命令启动应用，然后在浏览器中打开 <http://localhost:8080/rolldice>，验证应用是否正常运行。

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

## 插桩 {#instrumentation}

下面展示了如何安装、初始化和运行使用 OpenTelemetry 进行插桩的应用程序。

### 更多依赖项 {#more-dependencies}

首先，安装 Node SDK 和自动插桩包。

Node SDK 让你可以使用多个配置默认值来初始化 OpenTelemetry，这些默认值适用于大多数用例。

`auto-instrumentations-node` 包安装了插桩库，这些库将自动为库中调用的代码创建相应的 Span。
在这种情况下，它为 Express 提供了插桩，使示例应用程序能够自动为每个传入请求创建 Span。

```shell
npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
```

要查找所有自动插桩模块，可以查看[注册表](/ecosystem/registry/?language=js&component=instrumentation)。

### 安装 {#setup}

插桩设置和配置必须在应用程序代码之前运行。一个常用的工具是 [--import](https://nodejs.org/api/cli.html#--importmodule) 标志。

创建一个名为 `instrumentation.ts`（如果不使用 TypeScript，则为 `instrumentation.mjs`）的文件，其中包含插桩设置代码。

{{% alert title="Note" %}} 以下示例使用 `--import instrumentation.ts`（TypeScript）要求 Node.js v.20 或更高版本。
如果您使用的是 Node.js v.18，请使用 JavaScript 示例。 {{% /alert %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## 运行已完成插桩的应用 {#run-the-instrumented-app}

现在，你可以像平常一样运行应用程序，但可以使用 `--import` 标志在应用程序代码之前加载插桩。
确保你的 `NODE_OPTIONS` 环境变量中没有其他冲突的 `--import` 或 `--require` 标志，
例如 `--require @opentelemetry/auto-instrumentations-node/register`。

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

在浏览器中打开 <http://localhost:8080/rolldice> 并重新加载页面几次。
等待一段时间后，你应该会在控制台中看到 `ConsoleSpanExporter` 打印的 Span。

<details>
<summary>查看示例输出</summary>

```js
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // …… 部分资源属性已省略……
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-express',
    version: '0.52.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: {
    traceId: '61e8960c349ca2a3a51289e050fd3b82',
    spanId: '631b666604f933bc',
    traceFlags: 1,
    traceState: undefined
  },
  traceState: undefined,
  name: 'request handler - /rolldice',
  id: 'd8fcc05ac4f60c99',
  kind: 0,
  timestamp: 1755719307779000,
  duration: 2801.5,
  attributes: {
    'http.route': '/rolldice',
    'express.name': '/rolldice',
    'express.type': 'request_handler'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // …… 部分资源属性已省略……
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-http',
    version: '0.203.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET /rolldice',
  id: '631b666604f933bc',
  kind: 1,
  timestamp: 1755719307777000,
  duration: 4705.75,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    'http.host': 'localhost:8080',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.scheme': 'http',
    'http.target': '/rolldice',
    'http.user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 8080,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 63067,
    'http.status_code': 200,
    'http.status_text': 'OK',
    'http.route': '/rolldice'
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

</details>

生成的 Span 会追踪针对 `/rolldice` 路由的请求生命周期。

再向该端点发送几次请求。片刻之后，你将在控制台输出中看到指标数据，例如：

<details>
<summary>查看示例输出</summary>

```yaml
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'Measures the duration of inbound HTTP requests.',
    unit: 'ms',
    valueType: 1,
    advice: {}
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 200,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719307, 782000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.439792,
        max: 5.775,
        sum: 15.370167,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 5, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 6
      }
    },
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 304,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719433, 609000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.39575,
        max: 1.39575,
        sum: 1.39575,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 1
      }
    }
  ]
}
{
  descriptor: {
    name: 'nodejs.eventloop.utilization',
    type: 'OBSERVABLE_GAUGE',
    description: 'Event loop utilization',
    unit: '1',
    valueType: 1,
    advice: {}
  },
  dataPointType: 2,
  dataPoints: [
    {
      attributes: {},
      startTime: [ 1755719362, 939000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: 0.00843049454565211
    }
  ]
}
{
  descriptor: {
    name: 'v8js.gc.duration',
    type: 'HISTOGRAM',
    description: 'Garbage collection duration by kind, one of major, minor, incremental or weakcb.',
    unit: 's',
    valueType: 1,
    advice: { explicitBucketBoundaries: [ 0.01, 0.1, 1, 10 ] }
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: { 'v8js.gc.type': 'minor' },
      startTime: [ 1755719303, 5000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0005120840072631835,
        max: 0.0022552499771118163,
        sum: 0.006526499509811401,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 6, 0, 0, 0, 0 ] },
        count: 6
      }
    },
    {
      attributes: { 'v8js.gc.type': 'incremental' },
      startTime: [ 1755719310, 812000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0003403329849243164,
        max: 0.0012867081165313721,
        sum: 0.0016270411014556885,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    },
    {
      attributes: { 'v8js.gc.type': 'major' },
      startTime: [ 1755719310, 830000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0025888750553131105,
        max: 0.005744750022888183,
        sum: 0.008333625078201293,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    }
  ]
}
```

</details>

## 下一步操作 {#next-steps}

通过对你自己的代码库进行[手动插桩](/docs/languages/js/instrumentation)，丰富自动生成的插桩。
这将为你提供定制化的可观测性数据。

你还需要配置一个合适的导出器，将[导出你的遥测数据](/docs/languages/js/exporters)到一个或多个遥测后端。

如果你想探索一个更复杂的示例，请查看 [OpenTelemetry Demo](/docs/demo/)，
其中包括基于 JavaScript 的[支付服务](/docs/demo/services/payment/)和基于 TypeScript 的[前端服务](/docs/demo/services/frontend/)。

## 调试 {#troubleshooting}

出现问题了吗？你可以启用诊断日志记录来验证 OpenTelemetry 是否正确初始化：

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// 为了调试，将日志级别设置为 DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// 为了调试，将日志级别设置为 DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
