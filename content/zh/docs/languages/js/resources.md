---
title: 资源
weight: 70
description: 在你的遥测数据中添加有关应用程序环境的详细信息
default_lang_commit: 72833370dbaba23a35a21fcb0961329201700246
cSpell:ignore: myhost SIGINT uuidgen WORKDIR
---

{{% docs/languages/resources-intro %}}

下面你将了解如何通过 Node.js SDK 设置资源探测。

## 设置 {#setup}

请按照 [Node.js 快速入门][Getting Started - Node.js]中的说明进行操作，这样你就会拥有`package.json`、`app.js`（或`app.ts`）和`instrumentation.mjs`（或`instrumentation.ts`）这些文件。

## 进程和环境资源探测 {#process-environment-resource-detection}

开箱即用，Node.js SDK 会探测[进程和进程运行时资源][process and process runtime resources]，
并从环境变量`OTEL_RESOURCE_ATTRIBUTES`中获取属性。
你可以通过在插桩文件中启用诊断日志，来验证它探测到的内容：

```javascript
// 要进行故障排查，请将日志级别设置为 DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

运行应用程序时设置一些`OTEL_RESOURCE_ATTRIBUTES`的值，例如我们设置`host.name`来标识[主机][Host]：

```console
$ env OTEL_RESOURCE_ATTRIBUTES="host.name=localhost" \
  node --import ./instrumentation.mjs app.js
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: { 'host.name': 'localhost' } }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 12345,
    'process.executable.name': 'node',
    'process.command': '/app.js',
    'process.command_line': '/bin/node /app.js',
    'process.runtime.version': '16.17.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
...
```

## 通过环境变量添加资源 {#adding-resources-with-environment-variables}

在上面的示例中，SDK 探测到了进程，还通过环境变量自动添加了`host.name=localhost`属性。

下面你将找到自动为你探测资源的相关配置说明。但是，有时你会发现，所需的资源并没有现成的探测工具。
在这种情况下，使用环境变量`OTEL_RESOURCE_ATTRIBUTES`来注入你需要的任何内容。
此外，你可以使用环境变量`OTEL_SERVICE_NAME`来设置`service.name`资源属性的值。
例如，以下脚本添加了[服务][Service]、[主机][Host]和[操作系统][OS]资源属性：

```console
$ env OTEL_SERVICE_NAME="app.js" OTEL_RESOURCE_ATTRIBUTES="service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=${HOSTNAME},host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" \
  node --import ./instrumentation.mjs app.js
...
EnvDetector found resource. Resource {
  attributes: {
    'service.name': 'app.js',
    'service.namespace': 'tutorial',
    'service.version': '1.0',
    'service.instance.id': '46D99F44-27AB-4006-9F57-3B7C9032827B',
    'host.name': 'myhost',
    'host.type': 'arm64',
    'os.name': 'linux',
    'os.version': '6.0'
  }
}
...
```

## 在代码中添加资源 {#adding-resources-in-code}

自定义资源也可以在你的代码中配置。`NodeSDK`提供了一个配置选项，你可以在其中设置它们。
例如，你可以像下面这样更新你的插桩文件，以设置`service.*`属性：

```javascript
...
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
...
const sdk = new opentelemetry.NodeSDK({
  ...
  resource: resourceFromAttributes({
    [ ATTR_SERVICE_NAME ]: "yourServiceName",
    [ ATTR_SERVICE_VERSION ]: "1.0",
  })
  ...
});
...
```

{{% alert title="备注" class="info" %}}

如果你同时通过环境变量和代码两种方式设置资源属性，那么通过环境变量设置的值将优先生效。

{{% /alert %}}

## 容器资源探测 {#container-resource-detection}

使用相同的设置（启用调试的`package.json`、`app.js`和`instrumentation.mjs`），
并在同一目录下使用以下内容的`Dockerfile`：

```Dockerfile
FROM node:latest
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "--import", "./instrumentation.mjs", "app.js" ]
```

为了确保你可以通过 <kbd>Ctrl + C</kbd>（`SIGINT`）停止你的 Docker 容器，请将以下内容添加到`app.js`的末尾：

```javascript
process.on('SIGINT', function () {
  process.exit();
});
```

要自动探测容器的 ID，请安装以下附加依赖项：

```sh
npm install @opentelemetry/resource-detector-container
```

接下来，像下面这样更新你的`instrumentation.mjs`：

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');

// 要进行故障排除，请将日志级别设置为 DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  resourceDetectors: [containerDetector],
});

sdk.start();
```

构建你的 Docker 镜像：

```sh
docker build . -t nodejs-otel-getting-started
```

运行你的 Docker 容器：

```sh
$ docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': 'fffbeaf682f32ef86916f306ff9a7f88cc58048ab78f7de464da3c3201db5c54'
  }
}
```

探测器已经为你提取了`container.id`。但是你可能会注意到，在这个示例中，进程属性和通过环境变量设置的属性丢失了！
要解决这个问题，当你设置`resourceDetectors`列表时，你还需要指定`envDetector`和`processDetector`探测器：

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');
const { envDetector, processDetector } = require('@opentelemetry/resources');

// 要进行故障排除，请将日志级别设置为 DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  // 请确保在这里添加所有你需要的探测器！
  resourceDetectors: [envDetector, processDetector, containerDetector],
});

sdk.start();
```

重新构建你的镜像并再次运行你的容器：

```shell
docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: {} }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 1,
    'process.executable.name': 'node',
    'process.command': '/usr/src/app/app.js',
    'process.command_line': '/usr/local/bin/node /usr/src/app/app.js',
    'process.runtime.version': '18.9.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': '654d0670317b9a2d3fc70cbe021c80ea15339c4711fb8e8b3aa674143148d84e'
  }
}
...
```

## 下一步 {#next-steps}

你可以在配置中添加更多资源探测器，例如获取有关你的[云][Cloud]环境或[部署][Deployment]的详细信息。
更多信息，请参阅[opentelemetry-js-contrib 仓库中名为 `resource-detector-*` 的包](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages)。

[getting started - node.js]: /docs/languages/js/getting-started/nodejs/
[process and process runtime resources]: /docs/specs/semconv/resource/process/
[host]: /docs/specs/semconv/resource/host/
[cloud]: /docs/specs/semconv/resource/cloud/
[deployment]: /docs/specs/semconv/resource/deployment-environment/
[service]: /docs/specs/semconv/resource/#service
[os]: /docs/specs/semconv/resource/os/
