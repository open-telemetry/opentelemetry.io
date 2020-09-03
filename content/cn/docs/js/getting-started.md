---
title: "入门"
---

本指南将引导您完成跟踪后端的设置和配置过程（在本例中为[Zipkin]（https://zipkin.io），但是[Jaeger]（https://www.jaegertracing.io）很简单也可以使用），[Prometheus]（https://prometheus.io）等指标后端以及NodeJS的自动检测。 [您可以在此处找到有关TypeScript的指南]（ts-example / README.md＃getting-started-with-opentelemetry-js-typescript）。


##使用OpenTelemetry跟踪您的应用程序

（[链接到TypeScript版本]（ts-example / README.md＃tracing-your-application-with-opentelemetry））

本指南假定您将使用Zipkin作为跟踪后端，但是为Jaeger对其进行修改应该很简单。

可在[example directory]（示例）中找到可以与本指南一起使用的示例应用程序。您可以在[traced-example目录]（traced-example）中启用跟踪功能后看到它的外观。

###设置跟踪后端

（[链接到TypeScript版本]（ts-example / README.md＃setting-up-a-tracing-backend））

开始收集跟踪之前，我们需要做的第一件事是将跟踪导出到Zipkin这样的跟踪后端。如果您已经具有受支持的跟踪后端（Zipkin或Jaeger），则可以跳过此步骤。如果没有，您将需要运行一个。

为了尽快设置Zipkin，请运行最新的[Docker Zipkin]（https://github.com/openzipkin/docker-zipkin）容器，并暴露端口“ 9411”。如果您无法运行Docker容器，则需要按照Zipkin [quickstart指南]（https://zipkin.io/pages/quickstart.html）下载并运行Zipkin。

```sh
泊坞窗运行--rm -d -p 9411：9411 --name zipkin openzipkin / zipkin
```

浏览到<http：// localhost：9411>以确保您可以看到Zipkin UI。

<p align =“ center”> <img src =“ ./ images / zipkin.png？raw = true” /> </ p>

###跟踪您的NodeJS应用程序

（[链接到TypeScript版本]（ts-example / README.md＃trace-your-nodejs-application））

本指南使用`example`目录中提供的示例应用程序，但检测您自己的应用程序的步骤应大致相同。这是我们将要做的概述。

1.安装所需的OpenTelemetry库
2.初始化全局跟踪器
3.初始化并注册跟踪导出器

####安装所需的OpenTelemetry库

（[链接到TypeScript版本]（ts-example / README.md＃install-the-required-opentelemetry-libraries））

要在NodeJS上创建跟踪，您将需要`@ opentelemetry / node`，`@ opentelemetry / core`以及应用程序所需的任何插件，例如gRPC或HTTP。如果您使用的是示例应用程序，则需要安装`@ opentelemetry / plugin-http`。

```sh
$ npm安装
  @ opentelemetry /核心\
  @ opentelemetry /节点\
  @ opentelemetry / plugin-http
```

####初始化全局跟踪器

（[链接到TypeScript版本]（ts-example / README.md＃initialize-a-global-tracer））

所有跟踪初始化都应在应用程序的代码运行之前进行。最简单的方法是在运行应用程序代码之前，使用节点的-r选项在一个单独的文件中初始化跟踪。

创建一个名为“ tracing.js”的文件，并添加以下代码：

javascript
“使用严格”；

const {LogLevel} = require（“ @ opentelemetry / core”）;
const {NodeTracerProvider} = require（“ @ opentelemetry / node”）;

const provider = new NodeTracerProvider（{
  logLevel：LogLevel.ERROR
}）;

provider.register（）;
```

如果您现在使用`node -r ./tracing.js app.js`运行应用程序，则您的应用程序将通过HTTP创建并传播跟踪。如果已经检测到的支持[Trace Context]（https://www.w3.org/TR/trace-context/）标头的服务使用HTTP调用您的应用程序，而您使用HTTP调用另一个应用程序，则Trace Context标头将为正确传播。

但是，如果您希望看到完整的跟踪，则需要再执行一步。您必须注册一个导出器才能将跟踪发送到跟踪后端。

####初始化并注册跟踪导出器

（[链接到TypeScript版本]（ts-example / README.md＃initialize-and-register-a-trace-exporter））

本指南使用Zipkin跟踪后端，但是如果您使用[Jaeger]（https://www.jaegertracing.io）之类的另一个后端，则可以在此处进行更改。

要导出跟踪，我们将需要更多的依赖关系。使用以下命令安装它们：

```sh
$ npm安装
  @ opentelemetry /跟踪\
  @ opentelemetry / exporter-zipkin

$＃对于jaeger，您将运行以下命令：
$＃npm install @ opentelemetry / exporter-jaeger
```

安装完这些依赖​​项后，我们将需要初始化和注册它们。修改`tracing.js`，使其与以下代码段匹配，并根据需要用自己的服务名替换服务名““ getting-started”`。

javascript
“使用严格”；

const {LogLevel} = require（“ @ opentelemetry / core”）;
const {NodeTracerProvider} = require（“ @ opentelemetry / node”）;
const {SimpleSpanProcessor} = require（“ @ opentelemetry / tracing”）;
const {ZipkinExp