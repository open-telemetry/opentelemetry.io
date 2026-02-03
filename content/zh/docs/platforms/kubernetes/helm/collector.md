---
title: OpenTelemetry Collector Chart
linkTitle: Collector Chart
# prettier-ignore
cSpell:ignore: debugexporter filelog filelogreceiver hostmetricsreceiver kubelet kubeletstats kubeletstatsreceiver otlphttp sattributesprocessor sclusterreceiver sobjectsreceiver statefulset
---

## 介绍 {#introduction}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
## Introduction

The [OpenTelemetry Collector](/docs/collector) is an important tool for
monitoring a Kubernetes cluster and all the services that operate within. To
facilitate installation and management of a collector deployment in a Kubernetes
the OpenTelemetry community created the
[OpenTelemetry Collector Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector).
This helm chart can be used to install a collector as a Deployment, Daemonset,
or Statefulset.
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
[OpenTelemetry Collector](/docs/collector) 是监控 Kubernetes 集群及其内部所有服务的重要工具。
为了方便在 Kubernetes 中安装和管理 Collector 部署，
OpenTelemetry 社区创建了
[OpenTelemetry Collector Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)。
此 Helm chart 可用于将 Collector 安装为 Deployment、Daemonset 或 Statefulset。
</div>

### 安装 Chart {#installing-the-chart}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
### Installing the Chart

To install the chart with the release name `my-opentelemetry-collector`, run the
following commands:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-collector open-telemetry/opentelemetry-collector \
   --set image.repository="otel/opentelemetry-collector-k8s" \
   --set mode=<daemonset|deployment|statefulset>
```
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
要安装发布名称为 `my-opentelemetry-collector` 的 chart，请运行以下命令：

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-collector open-telemetry/opentelemetry-collector \
   --set image.repository="otel/opentelemetry-collector-k8s" \
   --set mode=<daemonset|deployment|statefulset>
```
</div>

### 配置 {#configuration}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
### Configuration

The OpenTelemetry Collector Chart requires that `mode` is set. `mode` can be
either `daemonset`, `deployment`, or `statefulset` depending on which kind of
Kubernetes deployment your use case requires.

When installed, the chart provides a few default collector components to get you
started. By default, the collector's config will look like:

```yaml
exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
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

The chart will also enable ports based on the default receivers. Default
configuration can be removed by setting the value to `null` in your
`values.yaml`. Ports can be disabled in the `values.yaml` as well.

You can add/modify any part of the configuration using the `config` section in
your `values.yaml`. When changing a pipeline, you must explicitly list all the
components that are in the pipeline, including any default components.

For example, to disable metrics and logging pipelines and non-otlp receivers:

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

All the configuration options (with comments) available in the chart can be
viewed in its
[values.yaml file](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-collector/values.yaml).
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
OpenTelemetry Collector Chart 要求设置 `mode`。
`mode` 可以是 `daemonset`、`deployment` 或 `statefulset`，具体取决于你的用例需要哪种 Kubernetes 部署类型。

安装时，chart 会提供一些默认的 Collector 组件来帮助你入门。
默认情况下，Collector 的配置如下：

```yaml
exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
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

chart 还会根据默认接收器启用端口。
可以通过在 `values.yaml` 中将值设置为 `null` 来删除默认配置。
也可以在 `values.yaml` 中禁用端口。

你可以使用 `values.yaml` 中的 `config` 部分添加/修改配置的任何部分。
更改管道时，必须明确列出管道中的所有组件，包括任何默认组件。

例如，要禁用指标和日志管道以及非 otlp 接收器：

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

chart 中可用的所有配置选项（带注释）可以在其
[values.yaml 文件](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-collector/values.yaml)中查看。
</div>

### 预设 {#presets}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
### Presets

Many of the important components the OpenTelemetry Collector uses to monitor
Kubernetes require special setup in the Collector's own Kubernetes deployment.
In order to make using these components easier, the OpenTelemetry Collector
Chart comes with some presets that, when enabled, handle the complex setup for
these important components.

Presets should be used as a starting point. They configure basic, but rich,
functionality for their related components. If your use case requires extra
configuration of these components it is recommend to NOT use the preset and
instead manually configure the component and anything it requires (volumes,
RBAC, etc.).
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
OpenTelemetry Collector 用于监控 Kubernetes 的许多重要组件需要在 Collector 自己的 Kubernetes 部署中进行特殊设置。
为了使这些组件的使用更加容易，OpenTelemetry Collector Chart 提供了一些预设，启用后会处理这些重要组件的复杂设置。

预设应作为起点使用。
它们为相关组件配置基本但丰富的功能。
如果你的用例需要对这些组件进行额外配置，建议不要使用预设，而是手动配置组件及其所需的任何内容（卷、RBAC 等）。
</div>

#### 日志收集预设 {#logs-collection-preset}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
#### Logs Collection Preset

The OpenTelemetry Collector can be used to collect logs sent to standard output
by Kubernetes containers.

This feature is disabled by default. It has the following requirements in order
to be safely enabled:

- It requires the
  [Filelog receiver](/docs/platforms/kubernetes/collector/components/#filelog-receiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=daemonset`. The `filelogreceiver` will only be able to collect logs on
  the node the Collector is running and multiple configured Collectors on the
  same node will produce duplicate data.

To enable this feature, set the `presets.logsCollection.enabled` property to
`true`. When enabled, the chart will add a `filelogreceiver` to the `logs`
pipeline. This receiver is configured to read the files where Kubernetes
container runtime writes all containers' console output
(`/var/log/pods/*/*/*.log`).

Here is an example `values.yaml`:

```yaml
mode: daemonset
presets:
  logsCollection:
    enabled: true
```

The chart's default logs pipeline uses the `debugexporter`. Paired with the
`logsCollection` preset's `filelogreceiver` it is easy to accidentally feed the
exported logs back into the collector, which can cause a "log explosion".

To prevent the looping, the default configuration of the receiver excludes the
collector's own logs. If you want to include the collector's logs, make sure to
replace the `debug` exporter with an exporter that does not send logs to the
collector's standard output.

Here's an example `values.yaml` that replaces the default `debug` exporter on
the `logs` pipeline with an `otlphttp` exporter that sends the container logs to
`https://example.com:55681` endpoint. It also uses
`presets.logsCollection.includeCollectorLogs` to tell the preset to enable
collection of the collector's logs.

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
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
OpenTelemetry Collector 可用于收集 Kubernetes 容器发送到标准输出的日志。

此功能默认禁用。
要安全启用它，需要满足以下要求：

- 它要求 Collector 镜像中包含
  [Filelog 接收器](/docs/platforms/kubernetes/collector/components/#filelog-receiver)，
  例如
  [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=daemonset` 一起使用。
  `filelogreceiver` 只能收集 Collector 运行所在节点上的日志，
  同一节点上的多个配置的 Collector 会产生重复数据。

要启用此功能，请将 `presets.logsCollection.enabled` 属性设置为 `true`。
启用后，chart 会将 `filelogreceiver` 添加到 `logs` 管道中。
此接收器配置为读取 Kubernetes 容器运行时写入所有容器控制台输出的文件
（`/var/log/pods/*/*/*.log`）。

以下是 `values.yaml` 示例：

```yaml
mode: daemonset
presets:
  logsCollection:
    enabled: true
```

chart 的默认日志管道使用 `debugexporter`。
与 `logsCollection` 预设的 `filelogreceiver` 配对使用时，
很容易意外地将导出的日志反馈回 Collector，这可能会导致"日志爆炸"。

为防止循环，接收器的默认配置会排除 Collector 自己的日志。
如果你想包含 Collector 的日志，请确保将 `debug` 导出器替换为不将日志发送到 Collector 标准输出的导出器。

以下是一个 `values.yaml` 示例，它将 `logs` 管道上的默认 `debug` 导出器替换为 `otlphttp` 导出器，
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
</div>

#### Kubernetes 属性预设 {#kubernetes-attributes-preset}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
#### Kubernetes Attributes Preset

The OpenTelemetry Collector can be configured to add Kubernetes metadata, such
as `k8s.pod.name`, `k8s.namespace.name`, and `k8s.node.name`, to logs, metrics
and traces. It is highly recommended to use the preset, or enable the
`k8sattributesprocessor` manually.

Due to RBAC considerations, this feature is disabled by default. It has the
following requirements:

- It requires the
  [Kubernetes Attributes processor](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).

To enable this feature, set the `presets.kubernetesAttributes.enabled` property
to `true`. When enabled, the chart will add the necessary RBAC roles to the
ClusterRole and will add a `k8sattributesprocessor` to each enabled pipeline.

Here is an example `values.yaml`:

```yaml
mode: daemonset
presets:
  kubernetesAttributes:
    enabled: true
```
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
OpenTelemetry Collector 可以配置为向日志、指标和链路添加 Kubernetes 元数据，
例如 `k8s.pod.name`、`k8s.namespace.name` 和 `k8s.node.name`。
强烈建议使用预设，或手动启用 `k8sattributesprocessor`。

由于 RBAC 考虑，此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含
  [Kubernetes 属性处理器](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor)，
  例如
  [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。

要启用此功能，请将 `presets.kubernetesAttributes.enabled` 属性设置为 `true`。
启用后，chart 会将必要的 RBAC 角色添加到 ClusterRole 中，
并将 `k8sattributesprocessor` 添加到每个启用的管道中。

以下是 `values.yaml` 示例：

```yaml
mode: daemonset
presets:
  kubernetesAttributes:
    enabled: true
```
</div>

#### Kubelet 指标预设 {#kubelet-metrics-preset}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
#### Kubelet Metrics Preset

The OpenTelemetry Collector can be configured to collect node, pod, and
container metrics from the API server on a kubelet.

This feature is disabled by default. It has the following requirements:

- It requires the
  [Kubeletstats receiver](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=daemonset`. The `kubeletstatsreceiver` will only be able to collect
  metrics on the node the Collector is running and multiple configured
  Collectors on the same node will produce duplicate data.

To enable this feature, set the `presets.kubeletMetrics.enabled` property to
`true`. When enabled, the chart will add the necessary RBAC roles to the
ClusterRole and will add a `kubeletstatsreceiver` to the metrics pipeline.

Here is an example `values.yaml`:

```yaml
mode: daemonset
presets:
  kubeletMetrics:
    enabled: true
```
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
OpenTelemetry Collector 可以配置为从 kubelet 上的 API 服务器收集节点、Pod 和容器指标。

此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含
  [Kubeletstats 接收器](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver)，
  例如
  [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=daemonset` 一起使用。
  `kubeletstatsreceiver` 只能收集 Collector 运行所在节点上的指标，
  同一节点上的多个配置的 Collector 会产生重复数据。

要启用此功能，请将 `presets.kubeletMetrics.enabled` 属性设置为 `true`。
启用后，chart 会将必要的 RBAC 角色添加到 ClusterRole 中，
并将 `kubeletstatsreceiver` 添加到指标管道中。

以下是 `values.yaml` 示例：

```yaml
mode: daemonset
presets:
  kubeletMetrics:
    enabled: true
```
</div>

#### 集群指标预设 {#cluster-metrics-preset}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
#### Cluster Metrics Preset

The OpenTelemetry Collector can be configured to collect cluster-level metrics
from the Kubernetes API server. These metrics include many of the metrics
collected by Kube State Metrics.

This feature is disabled by default. It has the following requirements:

- It requires the
  [Kubernetes Cluster receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=deployment` or `mode=statefulset` with a single replica. Running
  `k8sclusterreceiver` on multiple Collectors will produce duplicate data.

To enable this feature, set the `presets.clusterMetrics.enabled` property to
`true`. When enabled, the chart will add the necessary RBAC roles to the
ClusterRole and will add a `k8sclusterreceiver` to the metrics pipeline.

Here is an example `values.yaml`:

```yaml
mode: deployment
replicaCount: 1
presets:
  clusterMetrics:
    enabled: true
```
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
OpenTelemetry Collector 可以配置为从 Kubernetes API 服务器收集集群级别的指标。
这些指标包括 Kube State Metrics 收集的许多指标。

此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含
  [Kubernetes 集群接收器](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver)，
  例如
  [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=deployment` 或 `mode=statefulset`（单个副本）一起使用。
  在多个 Collector 上运行 `k8sclusterreceiver` 会产生重复数据。

要启用此功能，请将 `presets.clusterMetrics.enabled` 属性设置为 `true`。
启用后，chart 会将必要的 RBAC 角色添加到 ClusterRole 中，
并将 `k8sclusterreceiver` 添加到指标管道中。

以下是 `values.yaml` 示例：

```yaml
mode: deployment
replicaCount: 1
presets:
  clusterMetrics:
    enabled: true
```
</div>

#### Kubernetes 事件预设 {#kubernetes-events-preset}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
#### Kubernetes Events Preset

The OpenTelemetry Collector can be configured to collect Kubernetes events.

This feature is disabled by default. It has the following requirements:

- It requires the
  [Kubernetes Objects receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=deployment` or `mode=statefulset` with a single replica. Running
  `k8sclusterreceiver` on multiple Collectors will produce duplicate data.

To enable this feature, set the `presets.kubernetesEvents.enabled` property to
`true`. When enabled, the chart will add the necessary RBAC roles to the
ClusterRole and will add a `k8sobjectsreceiver` to the logs pipeline configure
to only collector events.

Here is an example `values.yaml`:

```yaml
mode: deployment
replicaCount: 1
presets:
  kubernetesEvents:
    enabled: true
```
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
OpenTelemetry Collector 可以配置为收集 Kubernetes 事件。

此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含
  [Kubernetes 对象接收器](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver)，
  例如
  [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=deployment` 或 `mode=statefulset`（单个副本）一起使用。
  在多个 Collector 上运行 `k8sclusterreceiver` 会产生重复数据。

要启用此功能，请将 `presets.kubernetesEvents.enabled` 属性设置为 `true`。
启用后，chart 会将必要的 RBAC 角色添加到 ClusterRole 中，
并将 `k8sobjectsreceiver` 添加到日志管道中，配置为仅收集事件。

以下是 `values.yaml` 示例：

```yaml
mode: deployment
replicaCount: 1
presets:
  kubernetesEvents:
    enabled: true
```
</div>

#### 主机指标预设 {#host-metrics-preset}

<!-- 英文原文 -->
<div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #e0e0e0; margin-bottom: 15px;">
#### Host Metrics Preset

The OpenTelemetry Collector can be configured to collect host metrics from
Kubernetes nodes.

This feature is disabled by default. It has the following requirements:

- It requires the
  [Host Metrics receiver](/docs/platforms/kubernetes/collector/components/#host-metrics-receiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=daemonset`. The `hostmetricsreceiver` will only be able to collect
  metrics on the node the Collector is running and multiple configured
  Collectors on the same node will produce duplicate data.

To enable this feature, set the `presets.hostMetrics.enabled` property to
`true`. When enabled, the chart will add the necessary volumes and volumeMounts
and will add a `hostmetricsreceiver` to the metrics pipeline. By default metrics
will be scraped every 10 seconds and the following scrapers are enabled:

- cpu
- load
- memory
- disk
- filesystem[^1]
- network

Here is an example `values.yaml`:

```yaml
mode: daemonset
presets:
  hostMetrics:
    enabled: true
```

[^1] due to some overlap with the `kubeletMetrics` preset some filesystem types
and mount points are excluded by default.
</div>

<!-- 中文翻译 -->
<div style="background-color: #f0f8ff; padding: 10px; border-left: 4px solid #add8e6; margin-bottom: 15px;">
OpenTelemetry Collector 可以配置为从 Kubernetes 节点收集主机指标。

此功能默认禁用。
它有以下要求：

- 它要求 Collector 镜像中包含
  [主机指标接收器](/docs/platforms/kubernetes/collector/components/#host-metrics-receiver)，
  例如
  [Collector 的 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib)。
- 虽然不是严格要求，但建议将此预设与 `mode=daemonset` 一起使用。
  `hostmetricsreceiver` 只能收集 Collector 运行所在节点上的指标，
  同一节点上的多个配置的 Collector 会产生重复数据。

要启用此功能，请将 `presets.hostMetrics.enabled` 属性设置为 `true`。
启用后，chart 会添加必要的卷和卷挂载，并将 `hostmetricsreceiver` 添加到指标管道中。
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

[^1] 由于与 `kubeletMetrics` 预设存在一些重叠，默认情况下会排除某些文件系统类型和挂载点。
</div>