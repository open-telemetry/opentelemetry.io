---
title: 快速入门
default_lang_commit: 4cb7e22f1e45d17854b309efc730499880aa7197
weight: 1
# prettier-ignore
cSpell:ignore: filelog filelogreceiver kubelet kubeletstats kubeletstatsreceiver sattributes sattributesprocessor sclusterreceiver sobjectsreceiver
---

本页面将引导你以最快的方式开始使用 OpenTelemetry 监控你的 Kubernetes 集群。
它将专注于收集 Kubernetes 集群、节点、Pod 和容器的指标和日志，以及使集群支持发送 OTLP 数据的服务。

如果你想在 Kubernetes 中看到 OpenTelemetry 的实际应用，最好的起点是 [OpenTelemetry 演示](/docs/demo/kubernetes-deployment/)。
该演示旨在说明 OpenTelemetry 的实现，但并非用于展示如何监控 Kubernetes 本身。
完成本教程后，安装演示并查看所有监控如何响应活跃工作负载会是一个有趣的实验。

如果你想开始从 Prometheus 迁移到 OpenTelemetry，或者对使用 OpenTelemetry Collector 收集 Prometheus 指标感兴趣，请参阅
[Prometheus 接收器](/docs/platforms/kubernetes/collector/components/#prometheus-receiver)。

## 概述 {#overview}

Kubernetes 通过多种不同方式暴露大量重要的遥测数据。
它有许多不同对象的日志、事件、指标以及其工作负载生成的数据。

为了收集所有这些数据，我们将使用 [OpenTelemetry Collector](/docs/collector/)。
Collector 有许多不同的工具，可以高效地收集所有这些数据并以有意义的方式增强它。

为了收集所有数据，我们需要安装两个 Collector 实例，一个作为
[Daemonset](/docs/collector/deploy/agent/)，另一个作为
[Deployment](/docs/collector/deploy/gateway/)。
Daemonset 安装的 Collector 将用于收集服务发出的遥测数据、日志以及节点、Pod 和容器的指标。
Deployment 安装的 Collector 将用于收集集群指标和事件。

我们将使用
[OpenTelemetry Collector Helm Chart](/docs/platforms/kubernetes/helm/collector/)来安装 Collector，
该 Chart 提供了一些配置选项，使 Collector 的配置更加容易。
如果你不熟悉 Helm，请查看
[Helm 项目网站](https://helm.sh/)。
如果你对使用 Kubernetes Operator 感兴趣，请参阅
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator/)，
但本指南将重点介绍 Helm Chart。

## 准备工作 {#preparation}

本指南假设使用 [Kind 集群](https://kind.sigs.k8s.io/)，
但你可以自由使用任何你认为合适的 Kubernetes 集群。

假设你已经安装了
[Kind](https://kind.sigs.k8s.io/#installation-and-usage)，创建一个新的 kind 集群：

```sh
kind create cluster
```

假设你已经安装了 [Helm](https://helm.sh/docs/intro/install/)，添加 OpenTelemetry Collector Helm Chart 以便稍后安装：

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

## Daemonset Collector {#daemonset-collector}

收集 Kubernetes 遥测数据的第一步是部署 OpenTelemetry Collector 的 Daemonset 实例，以收集与节点和在这些节点上运行的工作负载相关的遥测数据。
使用 Daemonset 是为了保证 Collector 的这个实例安装在所有节点上。
Daemonset 中的每个 Collector 实例只会从其运行所在的节点收集数据。

Collector 的这个实例将使用以下组件：

- [OTLP 接收器](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)：
  用于收集应用程序链路、指标和日志。
- [Kubernetes 属性处理器](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor)：
  用于向传入的应用程序遥测数据添加 Kubernetes 元数据。
- [Kubeletstats 接收器](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver)：
  用于从 kubelet 上的 API 服务器拉取节点、Pod 和容器指标。
- [Filelog 接收器](/docs/platforms/kubernetes/collector/components/#filelog-receiver)：
  用于收集 Kubernetes 日志和写入 stdout、stderr 的应用程序日志。

让我们详细分析这些组件。

### OTLP 接收器 {#otlp-receiver}

[OTLP 接收器](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
是收集 [OTLP 格式](/docs/specs/otel/protocol/) 的链路、指标和日志的最佳解决方案。
如果你以其他格式发送应用程序遥测数据，Collector 很可能[有对应的接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver)，
但在本教程中，我们假设遥测数据采用 OTLP 格式。

虽然不是必需的，但在节点上运行的应用程序将其链路、指标和日志发送到同一节点上运行的 Collector 是一种常见做法。
这使网络交互保持简单，并允许使用 `k8sattributes` 处理器轻松关联 Kubernetes 元数据。

### Kubernetes 属性处理器 {#kubernetes-attributes-processor}

[Kubernetes 属性处理器](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor)
是任何从 Kubernetes Pod 接收遥测数据的 Collector 中的高度推荐组件。
该处理器自动发现 Kubernetes Pod，提取其元数据（如 Pod 名称或节点名称），
并将提取的元数据作为资源属性添加到 Span、指标和日志中。
由于它将 Kubernetes 上下文添加到你的遥测数据中，借此你能将应用的追踪、指标、日志各类信号，与 Pod 指标、追踪数据等 Kubernetes 层面的遥测数据进行关联分析。

### Kubeletstats 接收器 {#kubeletstats-receiver}

[Kubelet 状态接收器](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver)
是用于采集节点层面监控指标的接收器组件，可采集容器内存使用率、Pod CPU 使用率、节点网络错误数等指标。该组件采集的所有遥测数据，都会附带 Pod 名称、节点名称这类 Kubernetes 元数据。结合我们启用的 Kubernetes 属性处理器，就能将应用的追踪、指标、日志数据，与 Kubelet 状态接收器采集的指标数据进行关联分析。

### Filelog 接收器 {#filelog-receiver}

[Filelog 接收器](/docs/platforms/kubernetes/collector/components/#filelog-receiver)
将通过跟踪 Kubernetes 写入`/var/log/pods/*/*/*.log`的日志来收集写入 stdout、stderr 的日志。
与大多数日志采集器一致，Filelog 接收器提供了丰富且完善的处理能力，支持根据实际需求对日志文件进行灵活的解析操作。

有一天你可能需要自己配置 Filelog 接收器，但在本教程中，OpenTelemetry Helm Chart 将为你处理所有复杂的配置。
此外，它将根据文件名提取有用的 Kubernetes 元数据。
由于我们使用 Kubernetes 属性处理器，我们将能够将应用程序的链路、指标和日志与 Filelog 接收器产生的日志相关联。

---

OpenTelemetry Collector Helm Chart 使在 Collector 的 Daemonset 安装中配置所有这些组件变得容易。
它还将处理所有 Kubernetes 特定的细节，如 RBAC、挂载和主机端口。

有一点需要注意 —— 该 Chart 默认不会将数据上报至任何后端系统。
若你希望在常用的后端平台中实际使用这些数据，需要自行配置对应的导出器。

我们将使用以下 `values.yaml`：

```yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-k8s

presets:
  # 启用 k8sattributesprocessor 并将其添加到链路、指标和日志管道中
  kubernetesAttributes:
    enabled: true
  # 启用 kubeletstatsreceiver 并将其添加到指标管道中
  kubeletMetrics:
    enabled: true
  # 启用 filelogreceiver 并将其添加到日志管道中
  logsCollection:
    enabled: true
## Chart 默认只包含 debugexporter
## 如果你想将数据发送到某个地方，你需要
## 配置一个导出器，如 otlp 导出器
# config:
#   exporters:
#     otlp:
#       endpoint: "<SOME BACKEND>"
#   service:
#     pipelines:
#       traces:
#         exporters: [ otlp ]
#       metrics:
#         exporters: [ otlp ]
#       logs:
#         exporters: [ otlp ]
```

要将此 `values.yaml` 与 Chart 一起使用，将其保存到你喜欢的文件位置，然后运行以下命令安装 Chart：

```sh
helm install otel-collector open-telemetry/opentelemetry-collector --values <path where you saved the chart>
```

现在，你应该已经在集群中运行了 OpenTelemetry Collector 的 Daemonset 安装，正在从每个节点收集遥测数据！

## Deployment Collector {#deployment-collector}

收集 Kubernetes 遥测数据的下一步是部署 Collector 的 Deployment 实例，以收集与整个集群相关的遥测数据。
具有恰好一个副本的 Deployment 确保我们不会产生重复数据。

Collector 的这个实例将使用以下组件：

- [Kubernetes 集群接收器](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver)：
  用于收集集群级别的指标和实体事件。
- [Kubernetes 对象接收器](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver)：
  用于从 Kubernetes API 服务器收集对象，如事件。

让我们详细分析这些组件。

### Kubernetes 集群接收器 {#kubernetes-cluster-receiver}

[Kubernetes 集群接收器](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver)
是 Collector 收集整个集群状态指标的解决方案。
该接收器可采集节点状态、Pod 阶段、容器重启次数、Deployment 可用副本数与期望副本数等各类指标。

### Kubernetes 对象接收器 {#kubernetes-objects-receiver}

[Kubernetes 对象接收器](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver)
是 Collector 将 Kubernetes 对象作为日志收集的解决方案。
虽然可以收集任何对象，但一个常见且重要的用例是收集 Kubernetes 事件。

---

OpenTelemetry Collector Helm Chart 简化了 Collector 的 Deployment 安装中所有这些组件的配置。
它还将处理所有 Kubernetes 特定的细节，如 RBAC 和挂载。

有一点需要注意 —— 该 Chart 默认不会将数据上报至任何后端系统。
若你希望在指定的后端平台中实际使用这些数据，需要自行配置对应的导出器。

我们将使用以下 `values.yaml`：

```yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-k8s

# 我们只想要一个这样的 Collector - 更多会产生重复数据
replicaCount: 1

presets:
  # 启用 k8sclusterreceiver 并将其添加到指标管道中
  clusterMetrics:
    enabled: true
  # 启用 k8sobjectsreceiver 仅收集事件并将其添加到日志管道中
  kubernetesEvents:
    enabled: true
## chart 默认只包含 debugexporter
## 如果你想将数据发送到某个地方，你需要
## 配置一个导出器，如 otlp 导出器
# config:
# exporters:
#   otlp:
#     endpoint: "<SOME BACKEND>"
# service:
#   pipelines:
#     traces:
#       exporters: [ otlp ]
#     metrics:
#       exporters: [ otlp ]
#       exporters: [ otlp ]
#     logs:
#       exporters: [ otlp ]
```

要将此 `values.yaml` 与 Chart 一起使用，将其保存到你喜欢的文件位置，然后运行以下命令安装 Chart

```sh
helm install otel-collector-cluster open-telemetry/opentelemetry-collector --values <path where you saved the chart>
```
至此，你已经在集群中完成 Collector 的 Deployment 安装，且该采集器会持续采集集群的指标与事件数据！