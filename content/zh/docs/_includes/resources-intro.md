---
params:
  aResource: 进程
default_lang_commit: 8a5b880c16d49257a147c2c3ec4a6ef6fcee8e20
---

[资源]({{ $resourceHRef }})以资源属性的形式表示产生遥测数据的实体。例如，
{{ $aResource }} 产生的遥测数据运行在 Kubernetes 的容器中，那么它会具有
{{ $aResource }} 的名称、Pod 名称、命名空间，可能还有部署名称。这四个属性都可以包含在资源中。

在你的可观测性后端中，你可以使用资源信息来更好地调查异常行为。例如，
如果你的追踪或指标数据表明系统中存在延迟，你可以将问题定位到特定的容器、Pod 或 Kubernetes 部署上。
