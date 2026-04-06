---
title: 使用 Kubernetes 安装 Collector
linkTitle: Kubernetes
weight: 200
default_lang_commit: 4f007739e0f0fc0b178b8dae457ef06c1c9a5757
---

使用以下命令将 OpenTelemetry Collector 以 DaemonSet 和单个网关实例的形式安装：

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

该示例可作为入门起点。对于生产环境的定制与安装，请参见 [OpenTelemetry Helm Charts](/docs/platforms/kubernetes/helm/)。

你也可以使用 [OpenTelemetry Operator](/docs/platforms/kubernetes/operator/) 来部署和维护
OpenTelemetry Collector 实例。Operator 提供了诸如自动升级处理、基于 OpenTelemetry 配置自动生成
`Service`、在 Deployment 中自动注入边车等功能。

有关如何在 Kubernetes 中使用 Collector 的指导，请参见
[Kubernetes 入门指南](/docs/platforms/kubernetes/getting-started/)。
