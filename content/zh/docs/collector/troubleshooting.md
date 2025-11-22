---
title: 故障排查
description: Collector 故障排查建议
weight: 25
default_lang_commit: 00927d66af2f5f9e6d2b6fc90ce77341c3cf9033
drifted_from_default: true
cSpell:ignore: confmap pprof tracez zpages
---

在本页中，你可以了解如何对 OpenTelemetry Collector 的健康状况和性能进行故障排查。

## 故障排查工具 {#troubleshooting-tools}

Collector 在调试问题方面提供了多种指标、日志和扩展功能。

### 内部遥测数据 {#internal-telemetry}

你可以配置并使用 Collector 的[内部遥测数据](/docs/collector/internal-telemetry/)，以监控其性能。

### 本地导出器 {#local-exporters}

针对某些类型的问题，例如配置验证和网络调试，你可以将少量测试数据发送到配置为输出到本地日志的 Collector。
通过使用一个[本地导出器](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#general-information)，
你可以检查 Collector 正在处理的数据。

对于实时故障排查，可以考虑使用
[`debug` 导出器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/debugexporter/README.md)，它可确认
Collector 是否正在接收、处理并导出数据。例如：

```yaml
receivers:
  zipkin:
exporters:
  debug:
service:
  pipelines:
    traces:
      receivers: [zipkin]
      processors: []
      exporters: [debug]
```

开始测试时，生成一个 Zipkin 负载。例如，你可以创建一个名为 `trace.json` 的文件，内容如下：

```json
[
  {
    "traceId": "5982fe77008310cc80f1da5e10147519",
    "parentId": "90394f6bcffb5d13",
    "id": "67fae42571535f60",
    "kind": "SERVER",
    "name": "/m/n/2.6.1",
    "timestamp": 1516781775726000,
    "duration": 26000,
    "localEndpoint": {
      "serviceName": "api"
    },
    "remoteEndpoint": {
      "serviceName": "apip"
    },
    "tags": {
      "data.http_response_code": "201"
    }
  }
]
```

Collector 运行后，向其发送该负载：

```shell
curl -X POST localhost:9411/api/v2/spans -H'Content-Type: application/json' -d @trace.json
```

你应当会看到类似如下的日志条目：

```shell
2023-09-07T09:57:43.468-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
```

你也可以配置 `debug` 导出器，使其打印完整负载内容：

```yaml
exporters:
  debug:
    verbosity: detailed
```

如果使用修改后的配置重新运行上述测试，日志输出如下：

```shell
2023-09-07T09:57:12.820-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
2023-09-07T09:57:12.821-0700    info    ResourceSpans #0
Resource SchemaURL: https://opentelemetry.io/schemas/1.4.0
Resource attributes:
     -> service.name: Str(telemetrygen)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope telemetrygen
Span #0
    Trace ID       : 0c636f29e29816ea76e6a5b8cd6601cf
    Parent ID      : 1a08eba9395c5243
    ID             : 10cebe4b63d47cae
    Name           : okey-dokey
    Kind           : Internal
    Start time     : 2023-09-07 16:57:12.045933 +0000 UTC
    End time       : 2023-09-07 16:57:12.046058 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> span.kind: Str(server)
     -> net.peer.ip: Str(1.2.3.4)
     -> peer.service: Str(telemetrygen)
```

### 检查 Collector 组件 {#check-collector-components}

使用以下子命令列出 Collector 分发包中可用的组件及其稳定性等级。请注意，输出格式可能随版本变化：

```shell
otelcol components
```

示例输出：

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.96.0
receivers:
  - name: opencensus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Beta
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
  - name: zipkin
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Beta
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
processors:
  - name: resource
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: span
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Alpha
  - name: probabilistic_sampler
    stability:
      logs: Alpha
      metrics: Undefined
      traces: Beta
exporters:
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: otlphttp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: debug
    stability:
      logs: Development
      metrics: Development
      traces: Development
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
connectors:
  - name: forward
    stability:
      logs-to-logs: Beta
      logs-to-metrics: Undefined
      logs-to-traces: Undefined
      metrics-to-logs: Undefined
      metrics-to-metrics: Beta
      traces-to-traces: Beta
extensions:
  - name: zpages
    stability:
      extension: Beta
  - name: health_check
    stability:
      extension: Beta
  - name: pprof
    stability:
      extension: Beta
```

### 扩展 {#extensions}

以下是可用于 Collector 调试的扩展列表。

#### 性能分析器 (pprof) {#performance-profiler-pprof}

[pprof 扩展](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/pprofextension/README.md)默认在本地端口
`1777` 提供服务，可在 Collector 运行时对其进行性能分析。这是一种高级使用场景，通常情况下无需使用。

#### zPages

[zPages 扩展](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/zpagesextension/README.md)默认在本地端口
`55679` 提供服务，可用于查看 Collector 接收器和导出器的实时数据。

其中，`/debug/tracez` 上的 TraceZ 页面对调试链路操作很有帮助，例如：

- 延迟问题。找出应用中耗时的部分。
- 死锁与探针问题。识别未正常结束的正在运行的 Span。
- 错误。判断发生了哪些类型的错误以及错误发生的位置。

请注意，`zpages` 中可能包含 Collector 本身未输出的错误日志。

在容器化环境中，建议将此端口暴露至公有接口而非仅本地可用。可通过 `extensions` 配置段设置 `endpoint`：

```yaml
extensions:
  zpages:
    endpoint: 0.0.0.0:55679
```

## 复杂管道的调试清单 {#checklist-for-debugging-complex-pipelines}

当遥测数据通过多个 Collector 和网络流动时，定位问题可能会比较困难。每次数据在
Collector 或其他组件之间传递时，都应验证以下内容：

- Collector 日志中是否有错误信息？
- 遥测数据是如何进入该组件的？
- 此组件是否修改了遥测数据（如采样、脱敏）？
- 此组件如何导出遥测数据？
- 遥测数据使用的是什么格式？
- 下游组件的配置如何？
- 是否存在网络策略阻止数据进出？

## 常见的 Collector 问题 {#common-collector-issues}

本节介绍如何解决常见的 Collector 问题。

### Collector 出现数据问题 {#collector-is-experiencing-data-issues}

Collector 及其组件可能会出现数据问题。

#### Collector 丢失数据 {#collector-is-dropping-data}

Collector 可能因以下常见原因丢失数据：

- Collector 配置不当，处理和导出数据的速度低于接收速度。
- 导出目标不可用或接收速度太慢。

为缓解丢失情况，请配置
[`batch` 处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)。
另外，还可能需要在启用的导出器上配置[排队重试选项](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/exporterhelper#configuration)。

#### Collector 收不到数据 {#collector-is-not-receiving-data}

Collector 收不到数据的原因可能包括：

- 网络配置问题。
- 接收器配置不正确。
- 客户端配置错误。
- 接收器在 `receivers` 段中定义但未在任何 `pipelines` 中启用。

检查 Collector 的[日志](/docs/collector/internal-telemetry/#configure-internal-logs)以及
[zPages](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md)
以排查问题。

#### Collector 未处理数据 {#collector-is-not-processing-data}

大多数处理问题源于对处理器工作方式的误解或处理器配置错误。例如：

- 属性处理器仅作用于 Span 上的标签，Span 名称需由 Span 处理器处理。
- 除尾部采样外的链路数据处理器仅作用于单个 Span。

#### Collector 未导出数据 {#collector-is-not-exporting-data}

Collector 未导出数据的原因可能包括：

- 网络配置问题。
- 导出器配置错误。
- 目标端不可用。

检查 Collector 的[日志](/docs/collector/internal-telemetry/#configure-internal-logs)以及
[zPages](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md)
以排查问题。

导出数据失败通常是由于网络配置问题，例如防火墙、DNS 或代理问题。注意 Collector
支持[代理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#proxy-support)。

### Collector 出现控制问题 {#collector-is-experiencing-control-issues}

Collector 可能会遇到启动失败、异常退出或重启的问题。

#### Collector 退出或重启 {#collector-exits-or-restarts}

Collector 可能因以下原因退出或重启：

- 缺少或错误配置的
  [`memory_limiter` 处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)导致内存压力。
- 负载下资源配置不当。
- 错误的配置，例如队列大小超过可用内存。
- 基础设施资源限制，如 Kubernetes。

#### Collector 在 Windows Docker 容器中启动失败 {#collector-fails-to-start-in-windows-docker-containers}

在 v0.90.1 及更早版本中，Collector 在 Windows Docker 容器中启动可能失败，并出现错误信息：
`The service process could not connect to the service controller`。
此时，需设置 `NO_WINDOWS_SERVICE=1` 环境变量，使 Collector
以交互式终端方式启动，而非尝试作为 Windows 服务运行。

### Collector 出现配置问题 {#collector-is-experiencing-configuration-issues}

Collector 可能因配置问题导致异常。

#### 空映射问题 {#null-maps}

在解析多个配置文件时，较早配置中的值会被较晚配置中的值覆盖，即便后者为 null。你可以通过以下方式修复：

- 使用 `{}` 表示空映射，例如使用 `processors: {}` 而非 `processors:`。
- 省略空配置段，例如不写 `processors:`。

更多信息请参见
[confmap 故障排查](https://github.com/open-telemetry/opentelemetry-collector/blob/main/confmap/README.md#null-maps)。
