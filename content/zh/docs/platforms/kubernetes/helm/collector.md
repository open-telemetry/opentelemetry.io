---
title: OpenTelemetry Collector Chart
linkTitle: Collector Chart
default_lang_commit: a41755046773da6186e0521e92c6cf1b439f7c7d # patched
# prettier-ignore
cSpell:ignore: debugexporter filelog filelogreceiver hostmetricsreceiver kubelet kubeletstats kubeletstatsreceiver otlphttp sattributesprocessor sclusterreceiver sobjectsreceiver statefulset
---

## 介绍 {#introduction}

[OpenTelemetry Collector](/docs/collector) 是监控 Kubernetes 集群及其内部所有服务的重要工具。
为了方便在 Kubernetes 中安装和管理 Collector 部署，
OpenTelemetry 社区创建了 [OpenTelemetry Collector Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)。
此 Helm chart 可用于将 Collector 安装为 Deployment、Daemonset 或 Statefulset。

### 安装 Chart {#installing-the-chart}

要安装发布名称为 `my-opentelemetry-collector` 的 Chart，请运行以下命令：

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-collector open-telemetry/opentelemetry-collector \
   --set image.repository="otel/opentelemetry-collector-k8s" \
   --set mode=<daemonset|deployment|statefulset>
```

### 配置 {#configuration}

OpenTelemetry Collector Chart 要求设置 `mode`。
`mode` 可以是 `daemonset`、`deployment` 或 `statefulset`，具体取决于你的场景需要哪种 Kubernetes 部署类型。

安装时，chart 会提供一些默认的 Collector 组件来帮助你入门。
默认情况下，Collector 的配置如下：

```yaml
exporters:
  # 注意：在 v0.86.0 版本之前，请使用 `logging` 而非 `debug`。
  debug: {}
extensions:
  health_check: {}
processors:
  batch: {}
  memory_limiter:
    check_interval: 5s
    limit_percentage: 80
    spike_limit_percentage: 25
receivers:
  jaeger:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:14250
      thrift_compact:
        endpoint: ${env:MY_POD_IP}:6831
      thrift_http:
        endpoint: ${env:MY_POD_IP}:14268
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
      http:
        endpoint: ${env:MY_POD_IP}:4318
  prometheus:
    config:
      scrape_configs:
        - job_name: opentelemetry-collector
          scrape_interval: 10s
          static_configs:
            - targets:
                - ${env:MY_POD_IP}:8888
  zipkin:
    endpoint: ${env:MY_POD_IP}:9411
service:
  extensions:
    - health_check
  pipelines:
    logs:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
    metrics:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
        - prometheus
    traces:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
        - jaeger
        - zipkin
  telemetry:
    metrics:
      address: ${env:MY_POD_IP}:8888
```

Chart 还会根据默认接收器启用端口。
可以通过在 `values.yaml` 中将值设置为 `null` 来删除默认配置。
也可以在 `values.yaml` 中禁用端口。

你可以使用 `values.yaml` 中的 `config` 部分添加、修改配置的任何部分。
更改流水线时，必须明确列出流水线中的所有组件，包括任何默认组件。

例如，要禁用指标和日志流水线以及非 otlp 接收器：

```yaml
config:
  receivers:
    jaeger: null
    prometheus: null
    zipkin: null
  service:
    pipelines:
      traces:
        receivers:
          - otlp
      metrics: null
      logs: null
ports:
  jaeger-compact:
    enabled: false
  jaeger-thrift:
    enabled: false
  jaeger-grpc:
    enabled: false
  zipkin:
    enabled: false
```

Chart 中可用的所有配置选项（带注释）可以在其 [values.yaml 文件](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-collector/values.yaml)中查看。

### 预设 {#presets}

OpenTelemetry Collector 用于监控 Kubernetes 的许多关键组件，
都需要在 Collector 自身的 Kubernetes 部署中进行特殊配置。
为了简化这些组件的使用，OpenTelemetry Collector Chart 提供了若干预设配置，
启用这些预设后，系统会自动处理这些关键组件所需的复杂设置。

预设应作为起点使用。
它们为相关组件配置基本但丰富的功能。
如果你的使用场景需要对这些组件进行额外配置，建议不要使用预设，
而是手动配置该组件及其所需的所有资源（如存储卷、RBAC 等）。

#### 日志收集预设 {#logs-collection-preset}

OpenTelemetry Collector 可用于收集 Kubernetes 容器发送到标准输出的日志。

此功能默认禁用。
要安全启用它，需要满足以下要求：

- 它要求 Collector 镜像中包含 [Filelog 接收器](/docs/platforms/kubernetes/collector/components/#filelog-receiver)，
  例如 [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=daemonset` 一起使用。
  `filelogreceiver` 只能收集 Collector 运行所在节点上的日志，
  同一节点上运行多个已配置的 Collector 会产生重复数据。

要启用此功能，请将 `presets.logsCollection.enabled` 属性设置为 `true`。
启用后，Chart 会将 `filelogreceiver` 添加到 `logs` 流水线中。
此接收器配置为读取 Kubernetes 容器运行时写入所有容器控制台输出的文件（`/var/log/pods/*/*/*.log`）。

以下是 `values.yaml` 示例：

```yaml
mode: daemonset
presets:
  logsCollection:
    enabled: true
```

Chart 的默认日志流水线使用 `debugexporter`。
与 `logsCollection` 预设的 `filelogreceiver` 配对使用时，
很容易意外地将导出的日志反馈回 Collector，这可能会导致"日志爆炸"。

为防止循环，接收器的默认配置会排除 Collector 自己的日志。
如果你想包含 Collector 的日志，请确保将 `debug` 导出器替换为不将日志发送到 Collector 标准输出的导出器。

以下是一个 `values.yaml` 示例，它将 `logs` 流水线上的默认 `debug` 导出器替换为 `otlphttp` 导出器，
该导出器将容器日志发送到 `https://example.com:55681` 端点。
它还使用 `presets.logsCollection.includeCollectorLogs` 告诉预设启用 Collector 日志的收集。

```yaml
mode: daemonset

presets:
  logsCollection:
    enabled: true
    includeCollectorLogs: true

config:
  exporters:
    otlphttp:
      endpoint: https://example.com:55681
  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
```

#### Kubernetes 属性预设 {#kubernetes-attributes-preset}

OpenTelemetry Collector 可以配置为向日志、指标和链路添加 Kubernetes 元数据，
例如 `k8s.pod.name`、`k8s.namespace.name` 和 `k8s.node.name`。
强烈建议使用预设，或手动启用 `k8sattributesprocessor`。

由于 RBAC 考虑，此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含 [Kubernetes 属性处理器](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor)，
  例如 [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。

要启用此功能，请将 `presets.kubernetesAttributes.enabled` 属性设置为 `true`。
启用后，Chart 会将必要的 RBAC 角色添加到 ClusterRole 中，
并将 `k8sattributesprocessor` 添加到每个启用的流水线中。

以下是 `values.yaml` 示例：

```yaml
mode: daemonset
presets:
  kubernetesAttributes:
    enabled: true
```

#### Kubelet 指标预设 {#kubelet-metrics-preset}

OpenTelemetry Collector 可以配置为从 kubelet 上的 API 服务器收集节点、Pod 和容器指标。

此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含 [Kubeletstats 接收器](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver)，
  例如 [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=daemonset` 一起使用。
  `kubeletstatsreceiver` 只能收集 Collector 运行所在节点上的指标，
  同一节点上运行多个已配置的 Collector 会产生重复数据。

要启用此功能，请将 `presets.kubeletMetrics.enabled` 属性设置为 `true`。
启用后，Chart 会将必要的 RBAC 角色添加到 ClusterRole 中，
并将 `kubeletstatsreceiver` 添加到指标流水线中。

以下是 `values.yaml` 示例：

```yaml
mode: daemonset
presets:
  kubeletMetrics:
    enabled: true
```

#### 集群指标预设 {#cluster-metrics-preset}

OpenTelemetry Collector 可以配置为从 Kubernetes API 服务器收集集群级别的指标。
这些指标包括 Kube State Metrics 收集的许多指标。

此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含 [Kubernetes 集群接收器](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver)，
  例如 [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=deployment` 或单副本的 `mode=statefulset` 一起使用。
  在多个 Collector 上运行 `k8sclusterreceiver` 会产生重复数据。

要启用此功能，请将 `presets.clusterMetrics.enabled` 属性设置为 `true`。
启用后，Chart 会将必要的 RBAC 角色添加到 ClusterRole 中，
并将 `k8sclusterreceiver` 添加到指标流水线中。

以下是 `values.yaml` 示例：

```yaml
mode: deployment
replicaCount: 1
presets:
  clusterMetrics:
    enabled: true
```

#### Kubernetes 事件预设 {#kubernetes-events-preset}

OpenTelemetry Collector 可以配置为收集 Kubernetes 事件。

此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含 [Kubernetes 对象接收器](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver)，
  例如 [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=deployment` 或单副本的 `mode=statefulset` 一起使用。
  在多个 Collector 上运行 `k8sclusterreceiver` 会产生重复数据。

要启用此功能，请将 `presets.kubernetesEvents.enabled` 属性设置为 `true`。
启用后，Chart 会将必要的 RBAC 角色添加到 ClusterRole 中，
并将 `k8sobjectsreceiver` 添加到日志流水线中，配置为仅收集事件。

以下是 `values.yaml` 示例：

```yaml
mode: deployment
replicaCount: 1
presets:
  kubernetesEvents:
    enabled: true
```

#### 主机指标预设 {#host-metrics-preset}

OpenTelemetry Collector 可以配置为从 Kubernetes 节点收集主机指标。

此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含[主机指标接收器](/docs/platforms/kubernetes/collector/components/#host-metrics-receiver)，
  例如 [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=daemonset` 一起使用。
  `hostmetricsreceiver` 只能收集 Collector 运行所在节点上的指标，
  同一节点上运行多个已配置的 Collector 会产生重复数据。

要启用此功能，请将 `presets.hostMetrics.enabled` 属性设置为 `true`。
启用后，Chart 会添加必要的卷和卷挂载，并将 `hostmetricsreceiver` 添加到指标流水线中。
默认情况下，指标每 10 秒抓取一次，启用以下抓取器：

- cpu
- load
- memory
- disk
- filesystem[^1]
- network

以下是 `values.yaml` 示例：

```yaml
mode: daemonset
presets:
  hostMetrics:
    enabled: true
```

[^1]: 由于与 `kubeletMetrics` 预设存在一些重叠，某些文件系统类型和挂载点默认会被排除。
