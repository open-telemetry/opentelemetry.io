---
title: 管理
description: 如何管理 OpenTelemetry Collector 大规模部署
weight: 23
default_lang_commit: 4f2df45798ecb448e9029f155e8eaa64d23555ff
cSpell:ignore: hostmetrics opampsupervisor
---

本文描述如何在大规模场景下管理 OpenTelemetry Collector 部署。

为了更好地理解本文，你应该先了解如何安装和配置 Collector。参阅以下页面所述的主题：

- [快速开始](/docs/collector/quick-start/)：了解如何安装 OpenTelemetry Collector。
- [配置]：了解如何配置 OpenTelemetry Collector 并设置遥测管道。

## 基础知识 {#basics}

在大规模场景下进行遥测收集，需要有结构化的方法来管理代理。典型的代理管理任务包括：

1. 查询代理信息和配置。代理信息可能包括其版本、操作系统相关信息或功能。代理的配置指其遥测收集设置，例如
   OpenTelemetry Collector 的[配置][configuration]。
2. 升级/降级代理以及管理代理特定的软件包，包括基础代理功能和插件。
3. 将新配置应用到代理。这可能是由于环境变化或策略变化而需要进行的。
4. 监控代理的健康状况和性能，通常包括 CPU 和内存使用情况，以及代理特定的指标，例如处理速率或与背压相关的信息。
5. 管理控制平面和代理之间的连接，例如处理 TLS 证书（吊销和轮换）。

并非所有使用场景都需要支持上述所有代理管理任务。在 OpenTelemetry
的语境中，任务 **4. 健康和性能监控** 理想情况下应通过 OpenTelemetry 完成。

## OpAMP

可观测性厂商和云服务提供商提供了专有的代理管理解决方案。在开源可观测性领域中，
正在出现一种可用于代理管理的标准：[开放代理管理协议][Open Agent Management Protocol] (OpAMP)。

[OpAMP 规范][OpAMP specification]定义了如何管理一组遥测数据代理。这些代理可以是
[OpenTelemetry Collector](/docs/collector/)、Fluent Bit 或其他任意组合的代理。

> **注意** 这里的“代理”一词是一个总称，指响应 OpAMP 的 OpenTelemetry 组件，可以是 Collector，也可以是 SDK 组件。

OpAMP 是一种客户端/服务器协议，支持通过 HTTP 和 WebSockets 进行通信：

- **OpAMP 服务器** 是控制平面的一部分，充当编排器，管理一组遥测代理。
- **OpAMP 客户端** 是数据平面的一部分。OpAMP 的客户端可以以内嵌方式实现，例如
  [OpenTelemetry Collector 中对 OpAMP 的支持][opamp-in-otel-collector]。
  客户端也可以以独立进程方式实现。在后一种情况下，你可以使用一个 Supervisor，它负责与
  OpAMP 服务器的特定通信，同时控制遥测代理，例如应用配置或升级它。注意 Supervisor
  和遥测代理之间的通信不是 OpAMP 的一部分。

下面我们来看一个具体的设置：

![OpAMP 示例设置](../img/opamp.svg)

1. OpenTelemetry Collector，配置了以下管道：
   - (A) 从下游来源接收信号
   - (B) 将信号导出到上游目标，可能包括关于 Collector 本身的遥测（由 OpAMP `own_xxx` 连接设置表示）。

2. 控制平面（实现了 OpAMP 服务器端部分）和 Collector（或控制 Collector 的 Supervisor，实现了
   OpAMP 客户端端部分）之间的双向 OpAMP 控制流。

### 试用 {#try-it-out}

你可以通过使用 [Go 语言实现的 OpAMP 协议][opamp-go]来尝试一个简单的 OpAMP 设置。以下演练需要 Go 1.22+。

我们将设置一个简单的 OpAMP 控制平面，它包含一个示例 OpAMP 服务器，并让 OpenTelemetry Collector
通过 [OpAMP Supervisor][opamp-supervisor] 连接到它。

#### 步骤 1 - 启动 OpAMP 服务器

克隆 `open-telemetry/opamp-go` 仓库：

```sh
git clone https://github.com/open-telemetry/opamp-go.git
```

在 `./opamp-go/internal/examples/server` 目录下启动 OpAMP 服务器：

```console
$ go run .
2025/04/20 15:10:35.307207 [MAIN] OpAMP Server starting...
2025/04/20 15:10:35.308201 [MAIN] OpAMP Server running...
```

#### 步骤 2 - 安装 OpenTelemetry Collector

我们需要一个可以由 OpAMP Supervisor 管理的 OpenTelemetry Collector 二进制文件。为此，请安装
[OpenTelemetry Collector Contrib][otelcolcontrib] 发行版。Collector
二进制文件的安装路径将在后续配置中用 `$OTEL_COLLECTOR_BINARY` 表示。

#### 步骤 3 - 安装 OpAMP Supervisor

`opampsupervisor` 二进制文件可以作为 OpenTelemetry Collector 的[发布版本][tags]中带有
`cmd/opampsupervisor` 标签的可下载资产获取。你会看到基于操作系统和芯片架构命名的资产列表，请下载与你的环境相符的版本：

{{< tabpane text=true >}}

{{% tab "Linux (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_linux_amd64"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "Linux (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_linux_arm64"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "Linux (ppc64le) "%}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_linux_ppc64le"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "macOS (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_darwin_amd64"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "macOS (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_darwin_arm64"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "Windows (AMD 64)" %}}

```sh
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_windows_amd64.exe" -OutFile "opampsupervisor.exe"
Unblock-File -Path "opampsupervisor.exe"
```

{{% /tab %}} {{< /tabpane >}}

#### 步骤 4 - 创建 OpAMP Supervisor 配置文件

创建一个名为 `supervisor.yaml` 的文件，内容如下：

```yaml
server:
  endpoint: wss://127.0.0.1:4320/v1/opamp
  tls:
    insecure_skip_verify: true

capabilities:
  accepts_remote_config: true
  reports_effective_config: true
  reports_own_metrics: false
  reports_own_logs: true
  reports_own_traces: false
  reports_health: true
  reports_remote_config: true

agent:
  executable: $OTEL_COLLECTOR_BINARY

storage:
  directory: ./storage
```

{{% alert color="primary" title="注意" %}}

请确保将 `$OTEL_COLLECTOR_BINARY` 替换为实际文件路径。例如，在 Linux 或 macOS 中，如果你将
Collector 安装在 `/usr/local/bin/`，那么应将 `$OTEL_COLLECTOR_BINARY` 替换为 `/usr/local/bin/otelcol`。

{{% /alert %}}

#### 步骤 5 - 运行 OpAMP Supervisor

现在可以启动 Supervisor，它将会启动你的 OpenTelemetry Collector：

```console
$ ./opampsupervisor --config=./supervisor.yaml
{"level":"info","ts":1745154644.746028,"logger":"supervisor","caller":"supervisor/supervisor.go:340","msg":"Supervisor starting","id":"01965352-9958-72da-905c-e40329c32c64"}
{"level":"info","ts":1745154644.74608,"logger":"supervisor","caller":"supervisor/supervisor.go:1086","msg":"No last received remote config found"}
```

如果一切正常，你现在应该可以访问 [http://localhost:4321/](http://localhost:4321/) 打开
OpAMP 服务器 UI。你应该能在 Supervisor 管理的代理列表中看到你的 Collector：

![OpAMP 示例设置](../img/opamp-server-ui.png)

#### 步骤 6 - 远程配置 OpenTelemetry Collector

在服务器 UI 中点击该 Collector，并将以下内容粘贴到 `Additional Configuration` 输入框中：

```yaml
receivers:
  hostmetrics:
    collection_interval: 10s
    scrapers:
      cpu:

exporters:
  # 注意：在 v0.86.0 之前使用 `logging` 而不是 `debug`。
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [hostmetrics]
      exporters: [debug]
```

点击 `Save and Send to Agent`：

![OpAMP 附加配置](../img/opamp-server-additional-config.png)

刷新页面，确认代理状态显示为 `Up: true`：

![OpAMP 代理](../img/opamp-server-agent.png)

你可以查询 Collector 导出的指标（注意标签值）：

```console
$ curl localhost:8888/metrics
# HELP otelcol_exporter_send_failed_metric_points Number of metric points in failed attempts to send to destination. [alpha]
# TYPE otelcol_exporter_send_failed_metric_points counter
otelcol_exporter_send_failed_metric_points{exporter="debug",service_instance_id="01965352-9958-72da-905c-e40329c32c64",service_name="otelcol-contrib",service_version="0.124.1"} 0
# HELP otelcol_exporter_sent_metric_points Number of metric points successfully sent to destination. [alpha]
# TYPE otelcol_exporter_sent_metric_points counter
otelcol_exporter_sent_metric_points{exporter="debug",service_instance_id="01965352-9958-72da-905c-e40329c32c64",service_name="otelcol-contrib",service_version="0.124.1"} 132
# HELP otelcol_process_cpu_seconds Total CPU user and system time in seconds [alpha]
# TYPE otelcol_process_cpu_seconds counter
otelcol_process_cpu_seconds{service_instance_id="01965352-9958-72da-905c-e40329c32c64",service_name="otelcol-contrib",service_version="0.124.1"} 0.127965
...
```

你还可以查看 Collector 的日志：

```console
$ cat ./storage/agent.log
{"level":"info","ts":"2025-04-20T15:11:12.996+0200","caller":"service@v0.124.0/service.go:199","msg":"Setting up own telemetry..."}
{"level":"info","ts":"2025-04-20T15:11:12.996+0200","caller":"builders/builders.go:26","msg":"Development component. May change in the future."}
{"level":"info","ts":"2025-04-20T15:11:12.997+0200","caller":"service@v0.124.0/service.go:266","msg":"Starting otelcol-contrib...","Version":"0.124.1","NumCPU":11}
{"level":"info","ts":"2025-04-20T15:11:12.997+0200","caller":"extensions/extensions.go:41","msg":"Starting extensions..."}
{"level":"info","ts":"2025-04-20T15:11:12.997+0200","caller":"extensions/extensions.go:45","msg":"Extension is starting..."}
{"level":"info","ts":"2025-04-20T15:11:13.022+0200","caller":"extensions/extensions.go:62","msg":"Extension started."}
{"level":"info","ts":"2025-04-20T15:11:13.022+0200","caller":"extensions/extensions.go:45","msg":"Extension is starting..."}
{"level":"info","ts":"2025-04-20T15:11:13.022+0200","caller":"healthcheckextension@v0.124.1/healthcheckextension.go:32","msg":"Starting health_check extension","config":{"Endpoint":"localhost:58760","TLSSetting":null,"CORS":null,"Auth":null,"MaxRequestBodySize":0,"IncludeMetadata":false,"ResponseHeaders":null,"CompressionAlgorithms":null,"ReadTimeout":0,"ReadHeaderTimeout":0,"WriteTimeout":0,"IdleTimeout":0,"Path":"/","ResponseBody":null,"CheckCollectorPipeline":{"Enabled":false,"Interval":"5m","ExporterFailureThreshold":5}}}
{"level":"info","ts":"2025-04-20T15:11:13.022+0200","caller":"extensions/extensions.go:62","msg":"Extension started."}
{"level":"info","ts":"2025-04-20T15:11:13.024+0200","caller":"healthcheck/handler.go:132","msg":"Health Check state change","status":"ready"}
{"level":"info","ts":"2025-04-20T15:11:13.024+0200","caller":"service@v0.124.0/service.go:289","msg":"Everything is ready. Begin running and processing data."}
{"level":"info","ts":"2025-04-20T15:11:14.025+0200","msg":"Metrics","resource metrics":1,"metrics":1,"data points":44}
```

## 其他信息

- 博客文章：
  - [Open Agent Management Protocol (OpAMP) 2023 年现状][blog-opamp-status]
  - [使用 OpenTelemetry OpAMP 动态修改服务遥测][blog-opamp-service-telemetry]

- YouTube 视频：
  - [使用 OpAMP Supervisor 实现平滑扩展：管理数千个 OpenTelemetry Collector][video-opamp-smooth-scaling]
  - [使用开放代理管理协议进行可观测性的远程控制][video-opamp-remote-control]
  - [什么是 OpAMP 与 BindPlane][video-opamp-bindplane]
  - [闪电演讲：通过 OpAMP 协议管理 OpenTelemetry][video-opamp-lt]

[configuration]: /docs/collector/configuration/
[Open Agent Management Protocol]: https://github.com/open-telemetry/opamp-spec
[OpAMP specification]: /docs/specs/opamp/
[opamp-in-otel-collector]: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/opampsupervisor/specification/README.md
[opamp-go]: https://github.com/open-telemetry/opamp-go
[opamp-supervisor]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/opampsupervisor
[otelcolcontrib]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags
[blog-opamp-status]: /blog/2023/opamp-status/
[blog-opamp-service-telemetry]: /blog/2022/opamp/
[video-opamp-smooth-scaling]: https://www.youtube.com/watch?v=g8rtqqNTL9Q
[video-opamp-remote-control]: https://www.youtube.com/watch?v=t550FzDi054
[video-opamp-bindplane]: https://www.youtube.com/watch?v=N18z2dOJSd8
[video-opamp-lt]: https://www.youtube.com/watch?v=LUsfZFRM4yo
