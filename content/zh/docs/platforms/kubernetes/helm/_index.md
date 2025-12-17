---
title: OpenTelemetry Helm Chart
linkTitle: Helm Chart
default_lang_commit: a18833df3c17db379911a796f1b0a549c4d8f10f
---

## 简介 {#introduction}

[Helm](https://helm.sh/) 是一个用于管理 Kubernetes 应用的 CLI 解决方案。

如果你选择使用 Helm，可以通过
[OpenTelemetry Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts)
来管理 [OpenTelemetry Collector](/docs/collector)、
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator) 和
[OpenTelemetry Demo](/docs/demo) 的安装。

运行以下命令来添加 OpenTelemetry 的 Helm 仓库：

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```
