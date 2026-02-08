---
title: Kubernetes 的重要组件
linkTitle: 组件
default_lang_commit: 5273b533bd6dcf1aa1a4b8f57295320dc001a4a4
# prettier-ignore
cSpell:ignore: alertmanagers filelog horizontalpodautoscalers hostfs hostmetrics k8sattributes kubelet kubeletstats replicasets replicationcontrollers resourcequotas statefulsets varlibdockercontainers varlogpods
---

[OpenTelemetry Collector](/docs/collector/) 支持许多不同的接收器和处理器以助力监控 Kubernetes。
本节介绍采集 Kubernetes 数据并对其进行加工增强的核心组件。

本页面涵盖的组件：

- [Kubernetes 属性处理器](#kubernetes-attributes-processor)：向传入的应用遥测数据添加 Kubernetes 元数据。
- [Kubeletstats 接收器](#kubeletstats-receiver)：从 kubelet 上的 API 服务器拉取节点、Pod 和容器指标。
- [Filelog 接收器](#filelog-receiver)：收集 Kubernetes 日志和写入 stdout、stderr 的应用程序日志。
- [Kubernetes 集群接收器](#kubernetes-cluster-receiver)：收集集群级别的指标和实体事件。
- [Kubernetes 对象接收器](#kubernetes-objects-receiver)：从 Kubernetes API 服务器收集对象，如事件。
- [Prometheus 接收器](#prometheus-receiver)：接收 [Prometheus](https://prometheus.io/) 格式的指标。
- [主机指标接收器](#host-metrics-receiver)：从 Kubernetes 节点抓取主机指标。

对于应用程序链路、指标或日志，我们推荐使用
[OTLP 接收器](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)，
但也可选用任何适配你的数据的接收器。

## Kubernetes 属性处理器 {#kubernetes-attributes-processor}

| 部署模式           | 可用 |
| ------------------ | ---- |
| DaemonSet（代理）  | 是   |
| Deployment（网关） | 是   |
| Sidecar            | 否   |

Kubernetes 属性处理器自动发现 Kubernetes Pod，
提取其元数据，并将提取的元数据作为资源属性添加到 Span、指标和日志中。
**Kubernetes 属性处理器是在 Kubernetes 中运行的 Collector 最重要的组件之一。任何接收应用程序数据的 Collector 都应该使用它。**
因为它将 Kubernetes 上下文添加到你的遥测数据中，Kubernetes 属性处理器允许你将应用程序的链路、指标和日志信号与 Kubernetes 遥测数据（如 Pod 指标和链路）相关联。

Kubernetes 属性处理器使用 Kubernetes API 发现集群中运行的所有 Pod，
并记录它们的 IP 地址、Pod UID 和关键元数据信息。
默认情况下，通过处理器的数据会通过传入请求的 IP 地址与 Pod 关联，
但可以配置不同的规则。
由于处理器使用 Kubernetes API，它需要特殊权限（见下面的示例）。
如果你使用
[OpenTelemetry Collector Helm Chart](/docs/platforms/kubernetes/helm/collector/)，
你可以使用
[`kubernetesAttributes` 预设](/docs/platforms/kubernetes/helm/collector/#kubernetes-attributes-preset)来开始使用。

默认添加以下属性：

- `k8s.namespace.name`
- `k8s.pod.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.deployment.name`
- `k8s.node.name`

Kubernetes 属性处理器还可利用你添加到 Pod 和命名空间的 Kubernetes 标签和 Kubernetes 注解为链路、指标和日志设置自定义资源属性。

```yaml
k8sattributes:
  auth_type: 'serviceAccount'
  extract:
    metadata: # 从 Pod 中提取
      - k8s.namespace.name
      - k8s.pod.name
      - k8s.pod.start_time
      - k8s.pod.uid
      - k8s.deployment.name
      - k8s.node.name
    annotations:
      # 提取键为 `annotation-one` 的 Pod 注解值，并将其作为键为 `a1` 的资源属性插入
      - tag_name: a1
        key: annotation-one
        from: pod
      # 提取键为 `annotation-two` 的命名空间注解值（使用正则表达式），并将其作为键为 `a2` 的资源属性插入
      - tag_name: a2
        key: annotation-two
        regex: field=(?P<value>.+)
        from: namespace
    labels:
      # 提取键为 `label1` 的命名空间标签值，并将其作为键为 `l1` 的资源属性插入
      - tag_name: l1
        key: label1
        from: namespace
      # 提取键为 `label2` 的 Pod 标签值（使用正则表达式），并将其作为键为 `l2` 的资源属性插入
      - tag_name: l2
        key: label2
        regex: field=(?P<value>.+)
        from: pod
  pod_association: # 如何将数据与 Pod 关联（顺序很重要）
    - sources: # 首先尝试使用资源属性 k8s.pod.ip 的值
        - from: resource_attribute
          name: k8s.pod.ip
    - sources: # 然后尝试使用资源属性 k8s.pod.uid 的值
        - from: resource_attribute
          name: k8s.pod.uid
    - sources: # 如果都不起作用，使用请求的连接获取 Pod IP
        - from: connection
```

当 Collector 部署为 Kubernetes DaemonSet（代理）或 Kubernetes Deployment（网关）时，还有特殊的配置选项。
有关详细信息，请参阅
[Deployment 场景](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor#deployment-scenarios)

有关 Kubernetes 属性处理器配置的详细信息，请参阅
[Kubernetes 属性处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)。

由于处理器使用 Kubernetes API，它需要正确的权限才能正常工作。
对于大多数用例，你需要通过 ClusterRole 为运行 Collector 的服务账户授予以下权限。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: collector
  namespace: <OTEL_COL_NAMESPACE>
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups:
      - ''
    resources:
      - 'pods'
      - 'namespaces'
    verbs:
      - 'get'
      - 'watch'
      - 'list'
  - apiGroups:
      - 'apps'
    resources:
      - 'replicasets'
    verbs:
      - 'get'
      - 'list'
      - 'watch'
  - apiGroups:
      - 'extensions'
    resources:
      - 'replicasets'
    verbs:
      - 'get'
      - 'list'
      - 'watch'
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector
subjects:
  - kind: ServiceAccount
    name: collector
    namespace: <OTEL_COL_NAMESPACE>
roleRef:
  kind: ClusterRole
  name: otel-collector
  apiGroup: rbac.authorization.k8s.io
```

## Kubeletstats 接收器 {#kubeletstats-receiver}

| 部署模式           | 可用                               |
| ------------------ | ---------------------------------- |
| DaemonSet（代理）  | 首选                               |
| Deployment（网关） | 是，但只会收集其部署所在节点的指标 |
| Sidecar            | 否                                 |

每个 Kubernetes 节点运行一个包含 API 服务器的 kubelet。
Kubeletstats 接收器通过 API 服务器连接到该 kubelet，以收集有关节点和节点上运行的工作负载的指标。

有不同的身份验证方法，但通常使用服务账户。
服务账户还需要适当的权限才能从 kubelet 拉取数据（见下文）。
如果你使用
[OpenTelemetry Collector Helm Chart](/docs/platforms/kubernetes/helm/collector/)，
你可以使用
[`kubeletMetrics` 预设](/docs/platforms/kubernetes/helm/collector/#kubelet-metrics-preset)
来开始使用。

默认情况下，将为 Pod 和节点收集指标，但你也可以配置接收器以收集容器和卷指标。
接收器还允许配置收集指标的频率：

```yaml
receivers:
  kubeletstats:
    collection_interval: 10s
    auth_type: 'serviceAccount'
    endpoint: '${env:K8S_NODE_NAME}:10250'
    insecure_skip_verify: true
    metric_groups:
      - node
      - pod
      - container
```

有关收集哪些指标的具体详细信息，请参阅
[默认指标](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver/documentation.md)。
有关具体配置详细信息，请参阅
[Kubeletstats 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver)。

由于处理器使用 Kubernetes API，它需要正确的权限才能正常工作。
对于大多数用例，你应该通过 ClusterRole 为运行 Collector 的服务账户授予以下权限。

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups: ['']
    resources: ['nodes/stats']
    verbs: ['get', 'watch', 'list']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector
    namespace: default
```

## Filelog 接收器 {#filelog-receiver}

| 部署模式           | 可用                               |
| ------------------ | ---------------------------------- |
| DaemonSet（代理）  | 首选                               |
| Deployment（网关） | 是，但只会收集其部署所在节点的日志 |
| Sidecar            | 是，但这被视为高级配置             |

Filelog 接收器跟踪并解析文件中的日志。
虽然它不是特定于 Kubernetes 的接收器，但它仍然是从 Kubernetes 收集任何日志的事实上的解决方案。

Filelog 接收器由多个算子组件构成，这些组件以链式方式协同处理日志。每个算子仅承担单一的简单职责，例如解析时间戳或解析 JSON 格式。配置 Filelog 接收器并非一项简单的工作。
如果你使用
[OpenTelemetry Collector Helm Chart](/docs/platforms/kubernetes/helm/collector/)，
你可以使用
[`logsCollection` 预设](/docs/platforms/kubernetes/helm/collector/#logs-collection-preset)
来开始使用。

由于 Kubernetes 日志通常符合一组标准格式，Kubernetes 的典型 Filelog 接收器配置如下：

```yaml
filelog:
  include:
    - /var/log/pods/*/*/*.log
  exclude:
    # 排除所有名为 otel-collector 的容器的日志
    - /var/log/pods/*/otel-collector/*.log
  start_at: end
  include_file_path: true
  include_file_name: false
  operators:
    # 解析容器日志
    - type: container
      id: container-parser
```

有关 Filelog 接收器配置的详细信息，请参阅
[Filelog 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)。

除了 Filelog 接收器配置外，你在 Kubernetes 中部署的 OpenTelemetry Collector 还需要获取其待采集日志的访问权限。
通常，这意味着你需要在 Collector 配置清单添加相应的卷和卷挂载配置：

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
...
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
        - name: opentelemetry-collector
          ...
          volumeMounts:
            ...
            # 将卷挂载到 Collector 容器
            - name: varlogpods
              mountPath: /var/log/pods
              readOnly: true
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
            ...
      volumes:
        ...
        # 通常，Collector 需要访问 Pod 日志和容器日志
        - name: varlogpods
          hostPath:
            path: /var/log/pods
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
        ...
```

## Kubernetes 集群接收器 {#kubernetes-cluster-receiver}

| 部署模式           | 可用                         |
| ------------------ | ---------------------------- |
| DaemonSet（代理）  | 是，但会导致数据重复         |
| Deployment（网关） | 是，但多个副本会导致数据重复 |
| Sidecar            | 否                           |

Kubernetes 集群接收器使用 Kubernetes API 服务器收集有关整个集群的指标和实体事件。
使用此接收器来回答有关 Pod 阶段、节点状态和其他集群层面的各类问题。
由于接收器收集整个集群的遥测数据，因此整个集群中只需要一个接收器实例即可收集所有数据。

有不同的身份验证方法，但通常使用服务账户。
服务账户还需要适当的权限才能从 Kubernetes API 服务器拉取数据（见下文）。
如果你使用
[OpenTelemetry Collector Helm Chart](/docs/platforms/kubernetes/helm/collector/)，
你可以使用
[`clusterMetrics` 预设](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset)
来开始使用。

对于节点状态，接收器默认只收集 `Ready`，但可以配置为收集更多。
接收器还可以配置为报告一组可分配资源，例如 `cpu` 和 `memory`：

```yaml
k8s_cluster:
  auth_type: serviceAccount
  node_conditions_to_report:
    - Ready
    - MemoryPressure
  allocatable_types_to_report:
    - cpu
    - memory
```

要了解有关收集的指标的更多信息，请参阅
[默认指标](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/k8sclusterreceiver/documentation.md)
有关配置详细信息，请参阅
[Kubernetes 集群接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sclusterreceiver)。

由于处理器使用 Kubernetes API，它需要正确的权限才能正常工作。
对于大多数使用场景，你应该通过 ClusterRole 为运行 Collector 的服务账户授予以下权限。

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector-opentelemetry-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector-opentelemetry-collector
rules:
  - apiGroups:
      - ''
    resources:
      - events
      - namespaces
      - namespaces/status
      - nodes
      - nodes/spec
      - pods
      - pods/status
      - replicationcontrollers
      - replicationcontrollers/status
      - resourcequotas
      - services
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - apps
    resources:
      - daemonsets
      - deployments
      - replicasets
      - statefulsets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
    resources:
      - daemonsets
      - deployments
      - replicasets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - batch
    resources:
      - jobs
      - cronjobs
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - autoscaling
    resources:
      - horizontalpodautoscalers
    verbs:
      - get
      - list
      - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector-opentelemetry-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector-opentelemetry-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector-opentelemetry-collector
    namespace: default
```

## Kubernetes 对象接收器 {#kubernetes-objects-receiver}

| 部署模式           | 可用                         |
| ------------------ | ---------------------------- |
| DaemonSet（代理）  | 是，但会导致数据重复         |
| Deployment（网关） | 是，但多个副本会导致数据重复 |
| Sidecar            | 否                           |

Kubernetes 对象接收器通过拉取或监视从 Kubernetes API 服务器收集对象。
此接收器最常见的用例是监视 Kubernetes 事件，
但它也可用于收集任何类型的 Kubernetes 对象。
由于接收器收集整个集群的遥测数据，因此整个集群中只需要一个接收器实例即可收集所有数据。

目前，只能使用服务账户进行身份验证。
服务账户还需要适当的权限才能从 Kubernetes API 服务器拉取数据（见下文）。
如果你使用
[OpenTelemetry Collector Helm Chart](/docs/platforms/kubernetes/helm/collector/)
并且想要摄取事件，你可以使用
[`kubernetesEvents` 预设](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset)
来开始使用。

对于配置为拉取的对象，接收器将使用 Kubernetes API 定期列出集群中的所有对象。
每个对象将转换为独立的日志条目。
对于配置为监听的对象，接收器会与 Kubernetes API 建立流连接，当对象更改时接收更新。

要查看可用于收集的对象，请在你的集群中运行 `kubectl api-resources`：

<!-- cspell:disable -->

```console
kubectl api-resources
NAME                              SHORTNAMES   APIVERSION                             NAMESPACED   KIND
bindings                                       v1                                     true         Binding
componentstatuses                 cs           v1                                     false        ComponentStatus
configmaps                        cm           v1                                     true         ConfigMap
endpoints                         ep           v1                                     true         Endpoints
events                            ev           v1                                     true         Event
limitranges                       limits       v1                                     true         LimitRange
namespaces                        ns           v1                                     false        Namespace
nodes                             no           v1                                     false        Node
persistentvolumeclaims            pvc          v1                                     true         PersistentVolumeClaim
persistentvolumes                 pv           v1                                     false        PersistentVolume
pods                              po           v1                                     true         Pod
podtemplates                                   v1                                     true         PodTemplate
replicationcontrollers            rc           v1                                     true         ReplicationController
resourcequotas                    quota        v1                                     true         ResourceQuota
secrets                                        v1                                     true         Secret
serviceaccounts                   sa           v1                                     true         ServiceAccount
services                          svc          v1                                     true         Service
mutatingwebhookconfigurations                  admissionregistration.k8s.io/v1        false        MutatingWebhookConfiguration
validatingwebhookconfigurations                admissionregistration.k8s.io/v1        false        ValidatingWebhookConfiguration
customresourcedefinitions         crd,crds     apiextensions.k8s.io/v1                false        CustomResourceDefinition
apiservices                                    apiregistration.k8s.io/v1              false        APIService
controllerrevisions                            apps/v1                                true         ControllerRevision
daemonsets                        ds           apps/v1                                true         DaemonSet
deployments                       deploy       apps/v1                                true         Deployment
replicasets                       rs           apps/v1                                true         ReplicaSet
statefulsets                      sts          apps/v1                                true         StatefulSet
tokenreviews                                   authentication.k8s.io/v1               false        TokenReview
localsubjectaccessreviews                      authorization.k8s.io/v1                true         LocalSubjectAccessReview
selfsubjectaccessreviews                       authorization.k8s.io/v1                false        SelfSubjectAccessReview
selfsubjectrulesreviews                        authorization.k8s.io/v1                false        SelfSubjectRulesReview
subjectaccessreviews                           authorization.k8s.io/v1                false        SubjectAccessReview
horizontalpodautoscalers          hpa          autoscaling/v2                         true         HorizontalPodAutoscaler
cronjobs                          cj           batch/v1                               true         CronJob
jobs                                           batch/v1                               true         Job
certificatesigningrequests        csr          certificates.k8s.io/v1                 false        CertificateSigningRequest
leases                                         coordination.k8s.io/v1                 true         Lease
endpointslices                                 discovery.k8s.io/v1                    true         EndpointSlice
events                            ev           events.k8s.io/v1                       true         Event
flowschemas                                    flowcontrol.apiserver.k8s.io/v1beta2   false        FlowSchema
prioritylevelconfigurations                    flowcontrol.apiserver.k8s.io/v1beta2   false        PriorityLevelConfiguration
ingressclasses                                 networking.k8s.io/v1                   false        IngressClass
ingresses                         ing          networking.k8s.io/v1                   true         Ingress
networkpolicies                   netpol       networking.k8s.io/v1                   true         NetworkPolicy
runtimeclasses                                 node.k8s.io/v1                         false        RuntimeClass
poddisruptionbudgets              pdb          policy/v1                              true         PodDisruptionBudget
clusterrolebindings                            rbac.authorization.k8s.io/v1           false        ClusterRoleBinding
clusterroles                                   rbac.authorization.k8s.io/v1           false        ClusterRole
rolebindings                                   rbac.authorization.k8s.io/v1           true         RoleBinding
roles                                          rbac.authorization.k8s.io/v1           true         Role
priorityclasses                   pc           scheduling.k8s.io/v1                   false        PriorityClass
csidrivers                                     storage.k8s.io/v1                      false        CSIDriver
csinodes                                       storage.k8s.io/v1                      false        CSINode
csistoragecapacities                           storage.k8s.io/v1                      true         CSIStorageCapacity
storageclasses                    sc           storage.k8s.io/v1                      false        StorageClass
volumeattachments                              storage.k8s.io/v1                      false        VolumeAttachment
```

<!-- cspell:enable -->

有关具体配置详细信息，请参阅
[Kubernetes Objects Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sobjectsreceiver)。

由于处理器使用 Kubernetes API，它需要正确的权限才能正常工作。
由于服务账户是唯一的身份验证选项，你必须为服务账户提供适当的访问权限。
对于你想要收集的任何对象，你需要确保将名称添加到集群角色中。
例如，如果你想收集 Pod，则集群角色如下所示：

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector-opentelemetry-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector-opentelemetry-collector
rules:
  - apiGroups:
      - ''
    resources:
      - pods
    verbs:
      - get
      - list
      - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector-opentelemetry-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector-opentelemetry-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector-opentelemetry-collector
    namespace: default
```

## Prometheus 接收器 {#prometheus-receiver}

| 部署模式           | 可用 |
| ------------------ | ---- |
| DaemonSet（代理）  | 是   |
| Deployment（网关） | 是   |
| Sidecar            | 否   |

Prometheus 是 Kubernetes 和在 Kubernetes 上运行的服务的常见指标格式。
Prometheus 接收器是这些指标收集的最小替代品。
它支持完整的 Prometheus
[`scrape_config` 选项](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)。

接收器不支持一些高级 Prometheus 功能。
如果配置 YAML、代码包含以下任何内容，接收器将返回错误：

- `alert_config.alertmanagers`
- `alert_config.relabel_configs`
- `remote_read`
- `remote_write`
- `rule_files`

有关具体配置详细信息，请参阅
[Prometheus 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver)。

Prometheus 接收器是
[有状态的](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/standard-warnings.md#statefulness)，
这意味着使用它时需要考虑一些重要细节：

- 当运行 Collector 的多个副本时，其无法对指标拉取过程实现自动扩缩容。
- 当使用相同的配置运行 Collector 的多个副本时，它会多次抓取目标。
- 如果用户想要手动分片抓取过程，他们需要为每个副本配置不同的抓取配置。

为了使 Prometheus 接收器的配置更容易，OpenTelemetry Operator 包含一个名为
[Target Allocator](/docs/platforms/kubernetes/operator/target-allocator)
的可选组件。
此组件可用于告诉 Collector 它应该抓取哪些 Prometheus 端点。

有关接收器设计的更多信息，请参阅
[设计](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/DESIGN.md)。

## 主机指标接收器 {#host-metrics-receiver}

| 部署模式           | 可用                               |
| ------------------ | ---------------------------------- |
| DaemonSet（代理）  | 首选                               |
| Deployment（网关） | 是，但只会收集其部署所在节点的指标 |
| Sidecar            | 否                                 |

主机指标接收器使用各种抓取器从主机收集指标。
它与
[Kubeletstats 接收器](#kubeletstats-receiver)
有一些重叠，因此如果你决定同时使用两者，可能值得禁用这些重复的指标。

在 Kubernetes 中，接收器需要访问 `hostfs` 卷才能正常工作。
如果你使用
[OpenTelemetry Collector Helm Chart](/docs/platforms/kubernetes/helm/collector/)，
你可以使用
[`hostMetrics` 预设](/docs/platforms/kubernetes/helm/collector/#host-metrics-preset)
来开始使用。

可用的抓取器：

| 抓取器     | 支持的操作系统            | 描述                                |
| ---------- | ------------------------- | ----------------------------------- |
| cpu        | 除 macOS[^1] 外的所有系统 | CPU 利用率指标                      |
| disk       | 除 macOS[^1] 外的所有系统 | 磁盘 I/O 指标                       |
| load       | 所有系统                  | CPU 负载指标                        |
| filesystem | 所有系统                  | 文件系统利用率指标                  |
| memory     | 所有系统                  | 内存利用率指标                      |
| network    | 所有系统                  | 网络接口 I/O 指标和 TCP 连接指标    |
| paging     | 所有系统                  | 分页/交换空间利用率和 I/O 指标      |
| processes  | Linux、macOS              | 进程计数指标                        |
| process    | Linux、macOS、Windows     | 每个进程的 CPU、内存和磁盘 I/O 指标 |

[^1]: 在 macOS 系统上，若编译时未启用 cgo 则该功能不受支持，这是采集器特别兴趣小组（Collector SIG）发布镜像的默认配置。

有关收集哪些指标的具体详细信息以及具体配置详细信息，请参阅
[主机指标接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)。

如果你需要自己配置组件，请确保挂载 `hostfs` 卷，如果你想收集节点的指标而不是容器的指标。

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
...
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
        - name: opentelemetry-collector
          ...
          volumeMounts:
            ...
            - name: hostfs
              mountPath: /hostfs
              readOnly: true
              mountPropagation: HostToContainer
      volumes:
        ...
        - name: hostfs
          hostPath:
            path: /
      ...
```

然后配置主机指标接收器使用 `volumeMount`：

```yaml
receivers:
  hostmetrics:
    root_path: /hostfs
    collection_interval: 10s
    scrapers:
      cpu:
      load:
      memory:
      disk:
      filesystem:
      network:
```

有关在容器中使用接收器的更多详细信息，请参阅
[从容器内部收集主机指标（仅 Linux）](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver#collecting-host-metrics-from-inside-a-container-linux-only)
