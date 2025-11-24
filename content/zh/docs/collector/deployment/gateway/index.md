---
title: 网关
description: 为什么以及如何将信号发送到单个 OTLP 端点，并从 OTLP 端点发送到后端
weight: 3
default_lang_commit: 219d54eb41a768f8fa6058616177e58032d089b5
drifted_from_default: true
# prettier-ignore
cSpell:ignore: filelogreceiver hostmetricsreceiver hostnames loadbalancer loadbalancing resourcedetectionprocessor
---

网关 Collector 的部署模式涉及各类应用（或其他 Collector）将遥测数据发送到一个或多个
Collector 实例提供的统一 OTLP 端点，其中这些 Collector 以独立服务
（例如 Kubernetes 中的 Deployment）的方式运行，通常按集群、数据中心或区域进行部署。

在一般情况下，你可以使用现成的负载均衡器将负载分配到各个 Collector：

![网关部署概念](../../img/otel-gateway-sdk.svg)

对于需要在特定 Collector 中处理遥测数据的用例，可以使用双层设置：第一层的
Collector 配置了带有[基于链路 ID/服务名感知的负载均衡导出器][lb-exporter]的管道，
第二层则是处理横向扩展的 Collector。例如，当使用[尾部采样处理器][tailsample-processor]时，
需要使用负载均衡导出器，以便给定跟踪的所有 Span 都能到达同一个应用了尾部采样策略的 Collector 实例。

下面我们来看一个使用负载均衡导出器的示例：

![带负载均衡导出器的网关部署](../../img/otel-gateway-lb-sdk.svg)

1. 在应用中，SDK 被配置为将 OTLP 数据发送到一个中心位置。
2. 一个配置了负载均衡导出器的 Collector，将信号分发到一组 Collector。
3. 这些 Collector 被配置为将遥测数据发送到一个或多个后端。

## 示例 {#examples}

### NGINX 作为“开箱即用”负载均衡器 {#nginx-as-an-out-of-the-box-load-balancer}

假设你配置了三个 Collector （`collector1`、`collector2` 和 `collector3`），
并希望使用 NGINX 在它们之间进行负载均衡，可以使用以下配置：

```nginx
server {
    listen 4317 http2;
    server_name _;

    location / {
            grpc_pass      grpc://collector4317;
            grpc_next_upstream     error timeout invalid_header http_500;
            grpc_connect_timeout   2;
            grpc_set_header        Host            $host;
            grpc_set_header        X-Real-IP       $remote_addr;
            grpc_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 4318;
    server_name _;

    location / {
            proxy_pass      http://collector4318;
            proxy_redirect  off;
            proxy_next_upstream     error timeout invalid_header http_500;
            proxy_connect_timeout   2;
            proxy_set_header        Host            $host;
            proxy_set_header        X-Real-IP       $remote_addr;
            proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

upstream collector4317 {
    server collector1:4317;
    server collector2:4317;
    server collector3:4317;
}

upstream collector4318 {
    server collector1:4318;
    server collector2:4318;
    server collector3:4318;
}
```

### 负载均衡导出器 {#load-balancing-exporter}

要给出一个集中式 Collector 部署模式的具体示例，我们首先需要更详细地了解负载均衡导出器。它有两个主要的配置字段：

- `resolver`：决定在哪里查找下游 Collector（或后端）。如果使用 `static` 子键，就需要手动列出 Collector URL。
  另一种支持的解析器是 DNS 解析器，它会定期检查更新并解析 IP 地址。对于这种解析器类型，`hostname`
  子键指定要查询的主机名，以获取 IP 地址列表。
- `routing_key`：告诉负载均衡导出器将 Span 路由到特定的下游 Collector。如果将该字段设置为 `traceID`
  （默认值），负载均衡导出器会基于 `traceID` 导出 Span。否则，如果使用 `service` 作为 `routing_key`
  的值，则会基于服务名称导出 Span，这在使用 [Span 指标连接器][spanmetrics-connector]时很有用，
  这样同一服务的所有 Span 都会发送到同一个下游 Collector 进行指标收集，确保聚合的准确性。

提供 OTLP 端点的第一层 Collector 的配置如下：

{{< tabpane text=true >}} {{% tab Static %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      static:
        hostnames:
          - collector-1.example.com:4317
          - collector-2.example.com:5317
          - collector-3.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{% tab DNS %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: collectors.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{% tab "DNS with service" %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    routing_key: service
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: collectors.example.com
        port: 5317

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{< /tabpane >}}

负载均衡导出器会生成一些指标，包括 `otelcol_loadbalancer_num_backends` 和
`otelcol_loadbalancer_backend_latency`，可用于 OTLP 端点 Collector 的健康和性能监控。

## Collector 作为代理和网关的组合部署 {#combined-deployment-of-collectors-as-agents-and-gateways}

采用多个 OpenTelemetry Collector 的部署通常同时运行 Collector
作为网关和作为[代理](/docs/collector/deployment/agent/)。

下图展示了这种组合部署的架构：

- 使用代理部署模式（运行在每个主机上，类似于 Kubernetes DaemonSet）运行的 Collector，
  从主机上运行的服务以及主机遥测（如主机指标和日志抓取）中收集遥测数据。
- 使用网关部署模式运行的 Collector 来处理数据，如过滤、采样以及导出到后端等。

![gateway](otel-gateway-arch.svg)

这种组合部署模式在以下情况下是必要的：当 Collector 中使用的组件需要在每台主机上唯一，
或者需要获取仅在应用运行的同一主机上可用的信息时：

- 像 [`hostmetricsreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)
  或 [`filelogreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)
  这样的接收器需要在每个主机实例上唯一运行。运行多个实例会导致数据重复。

- 像 [`resourcedetectionprocessor`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)
  这样的处理器用于添加有关主机、Collector 以及正在运行的应用的信息。如果在远程机器上的
  Collector 中运行它们，会导致数据不准确。

## 权衡 {#tradeoffs}

优点：

- 职责分离，例如集中管理凭据
- 集中策略管理（例如过滤某些日志或采样）

缺点：

- 增加了需要维护和可能出错的组件（复杂性）
- 在级联 Collector 的情况下增加延迟
- 更高的整体资源使用量（成本）

[lb-exporter]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter
[tailsample-processor]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor
[spanmetrics-connector]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector

## 多 Collector 与单写入原则 {#multiple-collectors-and-the-single-writer-principle}

OTLP 内的所有指标数据流必须具有[单一写入方](/docs/specs/otel/metrics/data-model/#single-writer)。
在网关配置中部署多个 Collector 时，必须确保所有指标数据流都有一个单一的写入方，并且具有全局唯一的标识。

### 潜在问题 {#potential-problems}

来自多个修改或报告相同数据的应用的并发访问可能会导致数据丢失或数据质量下降。例如，
在同一资源上来自多个来源的不一致数据，不同来源可能会互相覆盖，因为资源没有唯一标识。

数据模式中可能存在一些迹象表明是否发生了这种情况。例如，通过可视化检查，
同一时间序列中出现无法解释的间隙或跳跃，可能表明多个 Collector 在发送相同的样本。
你还可能会在后端看到错误。例如，在 Prometheus 后端中：

`Error on ingesting out-of-order samples`

此错误可能表示两个作业中存在相同的目标，并且时间戳的顺序不正确。例如：

- 指标 `M1` 在 `T1` 收到，时间戳 13:56:04，值为 `100`
- 指标 `M1` 在 `T2` 收到，时间戳 13:56:24，值为 `120`
- 指标 `M1` 在 `T3` 收到，时间戳 13:56:04，值为 `110`
- 指标 `M1` 在时间 13:56:24 收到，值为 `120`
- 指标 `M1` 在时间 13:56:04 收到，值为 `110`

### 最佳实践 {#best-practices}

- 使用 [Kubernetes 属性处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)为不同的
  Kubernetes 资源添加标签。
- 使用[资源检测处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/resourcedetectionprocessor/README.md)从主机检测资源信息并收集资源元数据。
