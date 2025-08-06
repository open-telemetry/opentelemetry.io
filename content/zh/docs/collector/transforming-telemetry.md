---
title: 转换遥测数据
weight: 26
default_lang_commit: 1f88cd39457dc0f62dd86b35ba4f1841aac0462c
# prettier-ignore
cSpell:ignore: accountid clustername k8sattributes metricstransform OTTL resourcedetection
---

OpenTelemetry Collector 是在将数据发送到厂商或其他系统之前转换数据的便捷位置。
这样做通常出于数据质量、治理、成本和安全等方面的考虑。

来自 [Collector Contrib 仓库](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)的处理器支持对指标、
Span 和日志数据进行数十种不同的转换。以下各节提供了一些常用处理器的入门示例。

处理器的配置可能会对 Collector 性能产生重大影响，尤其是高级转换更是明显。

## 基本筛选 {#basic-filtering}

**处理器**：
[筛选处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)

筛选处理器允许用户使用
[OTTL](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/ottl/README.md)
来筛选遥测数据。符合任一条件的遥测数据将被丢弃。

例如，仅允许来自服务 app1、app2 和 app3 的 Span 数据，并丢弃来自所有其他服务的数据：

```yaml
processors:
  filter/ottl:
    error_mode: ignore
    traces:
      span:
        - |
        resource.attributes["service.name"] != "app1" and
        resource.attributes["service.name"] != "app2" and
        resource.attributes["service.name"] != "app3"
```

要仅丢弃名为 `service1` 的服务的 Span，同时保留所有其他 Span：

```yaml
processors:
  filter/ottl:
    error_mode: ignore
    traces:
      span:
        - resource.attributes["service.name"] == "service1"
```

[筛选处理器文档](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)中还有更多示例，
包括日志和指标的筛选。

## 添加或删除属性 {#adding-or-deleting-attributes}

**处理器**：
[属性处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor)
或[资源处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourceprocessor)

属性处理器可用于更新、插入、删除或替换指标或链路中的现有属性。
例如，以下配置为所有 Span 添加一个名为 account_id 的属性：

```yaml
processors:
  attributes/accountid:
    actions:
      - key: account_id
        value: 2245
        action: insert
```

资源处理器的配置与此相同，但仅适用于[资源属性](/docs/specs/semconv/resource/)。
使用资源处理器可以修改与遥测相关的基础设施元数据。例如，以下配置插入 Kubernetes 集群名称：

```yaml
processors:
  resource/k8s:
    attributes:
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
```

## 重命名指标或指标标签 {#renaming-metrics-or-metric-labels}

**处理器：**
[指标转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)

[指标转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)与[属性处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor)有部分功能重叠，
但它还支持重命名以及其他特定于指标的功能。

```yaml
processors:
  metricstransform/rename:
    transforms:
      - include: system.cpu.usage
        action: update
        new_name: system.cpu.usage_time
```

[指标转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)还支持使用正则表达式对多个指标名称或标签同时应用转换规则。
以下示例将所有指标中的 cluster_name 标签重命名为 cluster-name：

```yaml
processors:
  metricstransform/clustername:
    transforms:
      - include: ^.*$
        match_type: regexp
        action: update
        operations:
          - action: update_label
            label: cluster_name
            new_label: cluster-name
```

## 使用资源属性增强遥测数据 {#enriching-telemetry-with-resource-attributes}

**处理器**：
[资源检测处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)和
[K8s 属性处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)

这些处理器可用于通过相关的基础设施元数据增强遥测数据，以帮助团队快速识别基础设施是否正在影响服务健康或性能。

资源检测处理器会将相关的云环境或主机层信息添加到遥测数据中：

```yaml
processors:
  resourcedetection/system:
    # 修改 detector 列表以匹配你的云环境
    detectors: [env, system, gcp, ec2, azure]
    timeout: 2s
    override: false
```

同样地，K8s 处理器会用相关 Kubernetes 元数据（如 Pod 名称、节点名称或工作负载名称）增强遥测数据。
Collector Pod 必须被配置为拥有[对特定 Kubernetes RBAC API 的读取权限](https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor#readme-role-based-access-control)。
若使用默认选项，可使用空的配置块：

```yaml
processors:
  k8sattributes/default:
```

## 设置 Span 状态 {#setting-a-span-status}

**处理器**：
[转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)

使用转换处理器设置 Span 的状态。以下示例在 `http.request.status_code` 属性为 400 时将 Span 状态设置为 `Ok`：

<!-- prettier-ignore-start -->

```yaml
transform:
  error_mode: ignore
  trace_statements:
    - set(span.status.code, STATUS_CODE_OK) where span.attributes["http.request.status_code"] == 400
```

<!-- prettier-ignore-end -->

你还可以使用转换处理器根据属性修改 Span 名称，或从 Span 名称中提取 Span 属性。
更多示例请参见该处理器的[配置文件示例](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9b28f76c02c18f7479d10e4b6a95a21467fd85d6/processor/transformprocessor/testdata/config.yaml)。

## 高级转换操作 {#advanced-transformations}

更高级的属性转换也可通过[转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)实现。
转换处理器允许终端用户使用
[OpenTelemetry 转换语言](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/ottl)对指标、日志和链路数据执行转换操作。
