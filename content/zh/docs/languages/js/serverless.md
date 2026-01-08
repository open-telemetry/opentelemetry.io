---
title: Serverless
weight: 100
description: 使用 OpenTelemetry JavaScript 为 Serverless 函数添加插桩
default_lang_commit: 8dad29e2443b7c8739f3be322e5d5eec3baf999f
cSpell:ignore: otelwrapper
---

本指南展示了如何开始使用 OpenTelemetry 插桩库追踪 Serverless 函数。

## AWS Lambda {#aws-lambda}

{{% alert title="注意" %}}

你也可以使用[社区提供的 Lambda 层](/docs/platforms/faas/lambda-auto-instrument/)自动为 AWS Lambda 函数添加插桩。

{{% /alert %}}

以下内容展示了如何使用 Lambda 包装器和 OpenTelemetry 手动为 AWS Lambda 函数添加插桩，并将链路发送到配置的后端。

如果你对即插即用的用户体验感兴趣，请查看 [OpenTelemetry Lambda 层](https://github.com/open-telemetry/opentelemetry-lambda)。

### 依赖项 {#dependencies}

首先，创建一个空的 `package.json`：

```sh
npm init -y
```

然后安装所需的依赖项：

```sh
npm install \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation \
  @opentelemetry/sdk-trace-base \
  @opentelemetry/sdk-trace-node
```

### AWS Lambda 包装器代码 {#aws-lambda-wrapper-code}

此文件包含所有启用追踪的 OpenTelemetry 逻辑。将以下代码保存为 `lambda-wrapper.js`。

```javascript
/* lambda-wrapper.js */

const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: '<backend_url>',
  }),
);

const provider = new NodeTracerProvider({
  spanProcessors: [spanProcessor],
});

provider.register();

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-aws-lambda': {
        disableAwsContextPropagation: true,
      },
    }),
  ],
});
```

将 `<backend_url>` 替换为你喜欢的后端 URL，以便将所有链路导出到该后端。如果你还没有设置后端，可以查看 [Jaeger](https://www.jaegertracing.io/) 或 [Zipkin](https://zipkin.io/)。

注意，`disableAwsContextPropagation` 被设置为 true。原因是 Lambda 插桩组件默认会尝试使用 X-Ray 上下文头信息，除非为该函数启用了主动追踪功能，否则这会导致生成一个未采样的上下文，从而创建 `NonRecordingSpan`。

更多详细信息可以在插桩[文档](https://www.npmjs.com/package/@opentelemetry/instrumentation-aws-lambda)中找到。

### AWS Lambda 函数处理程序 {#aws-lambda-function-handler}

现在你有了 Lambda 包装器，创建一个简单的处理程序作为 Lambda 函数。将以下代码保存为 `handler.js`。

```javascript
/* handler.js */

'use strict';

const https = require('https');

function getRequest() {
  const url = 'https://opentelemetry.io/';

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      reject(new Error(err));
    });
  });
}

exports.handler = async (event) => {
  try {
    const result = await getRequest();
    return {
      statusCode: result,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error.message,
    };
  }
};
```

### 部署 {#deployment}

部署 Lambda 函数有多种方式：

- [AWS 控制台](https://aws.amazon.com/console/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Serverless 框架](https://github.com/serverless/serverless)
- [Terraform](https://github.com/hashicorp/terraform)

这里我们将使用 Serverless 框架，更多详细信息可以在[设置 Serverless 框架指南](https://www.serverless.com/framework/docs/getting-started)中找到。

创建一个名为 `serverless.yml` 的文件：

```yaml
service: lambda-otel-native
frameworkVersion: '3'
provider:
  name: aws
  runtime: nodejs14.x
  region: '<your-region>'
  environment:
    NODE_OPTIONS: --require lambda-wrapper
functions:
  lambda-otel-test:
    handler: handler.hello
```

为了让 OpenTelemetry 正常工作，`lambda-wrapper.js` 必须在任何其他文件之前包含：`NODE_OPTIONS` 设置确保了这一点。

注意，如果你不使用 Serverless Framework 部署 Lambda 函数，你必须使用 AWS 控制台 UI 手动添加此环境变量。

最后，运行以下命令将项目部署到 AWS：

```shell
serverless deploy
```

现在你可以使用 AWS 控制台 UI 调用新部署的 Lambda 函数。你应该会看到与 Lambda 函数调用相关的 Span。

### 访问后端 {#visiting-the-backend}

你现在应该能够在后端查看由 OpenTelemetry 从 Lambda 函数生成的链路！

## GCP 函数 {#gcp-function}

以下内容展示了如何使用 Google Cloud Platform（GCP）UI 为 [HTTP 触发的函数](https://docs.cloud.google.com/run/docs/write-functions)添加插桩。

### 创建函数 {#creating-function}

登录 GCP 并创建或选择一个项目，你的函数将被放置在该项目中。在侧边菜单中，转到 “Serverless” 并选择 “Cloud Functions”。接下来，点击 “Create Function”，选择 [2nd generation](https://cloud.google.com/blog/products/serverless/cloud-functions-2nd-generation-now-generally-available) 作为你的环境，提供函数名称并选择你的区域。

### 设置 otelwrapper 的环境变量 {#setup-environment-variable-for-otelwrapper}

如果已关闭，请打开 “Runtime, build, connections and security settings” 菜单，向下滚动并添加环境变量 `NODE_OPTIONS`，值为：

```shell
--require ./otelwrapper.js
```

### 选择运行时 {#select-runtime}

在下一个屏幕（“Code”）上，为你的运行时选择 Node.js 16 版本。

### 创建 OTel 包装器 {#create-otel-wrapper}

创建一个名为 `otelwrapper.js` 的新文件，用于为你的服务添加插桩。请确保提供 `SERVICE_NAME` 并设置 `<address for your backend>`。

```javascript
/* otelwrapper.js */

const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const collectorOptions = {
  url: '<address for your backend>',
};

const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: '<your function name>',
  }),
  spanProcessors: [
    new BatchSpanProcessor(new OTLPTraceExporter(collectorOptions)),
  ],
});

provider.register();

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});
```

### 添加包依赖项 {#add-package-dependencies}

将以下内容添加到你的 `package.json`：

```json
{
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/auto-instrumentations-node": "^0.56.1",
    "@opentelemetry/exporter-trace-otlp-http": "^0.200.0",
    "@opentelemetry/instrumentation": "^0.200.0",
    "@opentelemetry/sdk-trace-base": "^2.0.0",
    "@opentelemetry/sdk-trace-node": "^2.0.0",
    "@opentelemetry/resources": "^2.0.0",
    "@opentelemetry/semantic-conventions": "^2.0.0"
  }
}
```

### 为函数添加 HTTP 调用 {#add-http-call-to-function}

以下代码调用 OpenTelemetry 网站来演示出站调用。

```javascript
/* index.js */
const functions = require('@google-cloud/functions-framework');
const https = require('https');

functions.http('helloHttp', (req, res) => {
  let url = 'https://opentelemetry.io/';
  https
    .get(url, (response) => {
      res.send(`Response ${response.body}!`);
    })
    .on('error', (e) => {
      res.send(`Error ${e}!`);
    });
});
```

### 后端 {#backend}

如果你在 GCP VM 中运行 OTel 收集器，你可能需要[创建 VPC 访问连接器](https://cloud.google.com/vpc/docs/configure-serverless-vpc-access)才能发送链路。

### 部署 {#deploy}

在 UI 中选择部署并等待部署完成。

### 测试 {#testing}

你可以使用测试选项卡中的云 shell 测试函数。
