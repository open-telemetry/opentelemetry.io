---
title: 快速入门
description: 几分钟内完成设置并收集遥测数据！
aliases: [getting-started]
weight: 1
default_lang_commit: ae313ca8475cc4694e900b61976e1a5228690912
cSpell:ignore: docker dokey gobin okey telemetrygen
---

<!-- markdownlint-disable ol-prefix blanks-around-fences -->

OpenTelemetry Collector 是一个可执行文件，它能够接收[链路](/docs/concepts/signals/traces/)、
[指标](/docs/concepts/signals/metrics/)和[日志](/docs/concepts/signals/logs/)，
处理这些遥测数据，并通过其组件将其导出到多种可观测性后端。要了解 Collector 的概念性概览，
请参见 [Collector](/docs/collector)。

你将学习如何在不到五分钟的时间内完成以下操作：

- 设置并运行 OpenTelemetry Collector。
- 发送遥测数据并查看 Collector 对其进行处理。

## 前提条件 {#prerequisites}

请确保你的开发环境具备以下条件。本文档假设你使用的是 `bash`，请根据你所偏好的 Shell 适配相关配置与命令。

- [Docker](https://www.docker.com/) 或任何兼容的容器运行时。
- [Go](https://go.dev/) 1.20 或更高版本
- [`GOBIN` 环境变量][gobin]已设置；若未设置，请按如下方式进行初始化[^1]：

  ```sh
  export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
  ```

[^1]: 更多信息请参见[你的第一个程序](https://go.dev/doc/code#Command)。

## 设置环境 {#set-up-the-environment}

1. 拉取 OpenTelemetry Collector Contrib 的 Docker 镜像：

   ```sh
   docker pull otel/opentelemetry-collector-contrib:{{% param vers %}}
   ```

2. 安装 [telemetrygen][] 工具：

   ```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
   ```

   此工具可以模拟生成[链路][traces]、[指标][metrics]和[日志][logs]的客户端行为。

## 生成并收集遥测数据 {#generate-and-collect-telemetry}

3. 启动 Collector，使其监听端口 4317（用于 OTLP gRPC）、4318（用于 OTLP HTTP）和 55679（用于 ZPages）：

   ```sh
   docker run
     -p 127.0.0.1:4317:4317
     -p 127.0.0.1:4318:4318
     -p 127.0.0.1:55679:55679
     otel/opentelemetry-collector-contrib:{{% param vers %}}
     2>&1 | tee collector-output.txt # 可选择将输出保存，以便后续搜索
   ```

4. 在另一个终端窗口中生成几个示例链路：

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure --traces 3
   ```

   在工具生成的输出中，你应能看到确认生成链路的消息：

   ```text
   2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
   2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
   ```

   为了更方便查看相关输出，你可以进行筛选：

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure
     --traces 3 2>&1 | grep -E 'start|traces|stop'
   ```

5. 在运行 Collector 容器的终端窗口中，你应该能看到类似如下的链路抓取活动：

   ```console
   $ grep -E '^Span|(ID|Name|Kind|time|Status w+)s+:' ./collector-output.txt
   Span #0
       Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
       Parent ID      : 6f1ff7f9cf4ec1c7
       ID             : 8d1e820c1ac57337
       Name           : okey-dokey
       Kind           : Server
       Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
       End time       : 2024-01-16 14:13:54.586 +0000 UTC
       Status code    : Unset
       Status message :
   Span #1
       Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
       Parent ID      :
       ID             : 6f1ff7f9cf4ec1c7
       Name           : lets-go
       Kind           : Client
       Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
       End time       : 2024-01-16 14:13:54.586 +0000 UTC
       Status code    : Unset
       Status message :
   ...
   ```

6. 打开 [http://localhost:55679/debug/tracez](http://localhost:55679/debug/tracez)，
   在表格中选择一个示例，以查看你刚刚生成的链路。

7. 完成后，关闭 Collector 容器，例如按下 <kbd>Control-C</kbd>。

## 后续步骤 {#next-steps}

在本教程中，你已经启动了 OpenTelemetry Collector 并向其发送了遥测数据。下一步建议你执行以下操作：

- 探索其他[安装 Collector 的方式](../installation/)。
- 了解 Collector 的不同运行模式，参见[部署方式](../deployment/)。
- 熟悉 Collector 的[配置文件](/docs/collector/configuration)和结构。
- 浏览[组件注册表](/ecosystem/registry/?language=collector)，了解可用组件。
- 学习如何使用 OpenTelemetry Collector Builder (OCB)
  [构建自定义 Collector](/docs/collector/custom-collector/)。

[gobin]: https://pkg.go.dev/cmd/go#hdr-Environment_variables
[logs]: /docs/concepts/signals/logs/
[metrics]: /docs/concepts/signals/metrics/
[telemetrygen]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen
[traces]: /docs/concepts/signals/traces/
