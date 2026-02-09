---
title: OpenTelemetry Demo Chart
linkTitle: Demo Chart
default_lang_commit: fe623719bc24346e9dcd77e9769026cf1c720cc5
---

[OpenTelemetry Demo](/docs/demo/) 是一个基于微服务的分布式系统，
旨在说明 OpenTelemetry 在接近真实世界环境中的实现。
作为该工作的一部分，OpenTelemetry 社区创建了
[OpenTelemetry Demo Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo)，
以便可以在 Kubernetes 中轻松安装。

## 配置 {#configuration}

Demo Helm Chart 的默认 `values.yaml` 已准备好安装。
所有组件的内存限制都已调整以优化性能，
如果你的集群不够大，可能会导致问题。
整个安装限制在约 4 GB 内存，但可能使用更少。

Chart 中可用的所有配置选项（带注释）可以在其
[`values.yaml` 文件](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/values.yaml)中查看，
详细说明可以在
[Chart 的 README 文件](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo#chart-parameters)中找到。

## 安装 {#installation}

添加 OpenTelemetry Helm 仓库：

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

要安装发布名称为 `my-otel-demo` 的 Chart，请运行以下命令：

```sh
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

安装后，所有服务都可以通过前端代理
(<http://localhost:8080>) 访问，方法是运行这些命令：

```sh
kubectl port-forward svc/my-otel-demo-frontendproxy 8080:8080
```

代理暴露后，你还可以访问以下路径

| 组件         | 路径                              |
| ------------ | --------------------------------- |
| 网上商店     | <http://localhost:8080>           |
| Grafana      | <http://localhost:8080/grafana>   |
| 功能标志 UI  | <http://localhost:8080/feature>   |
| 负载生成器 UI | <http://localhost:8080/loadgen>   |
| Jaeger UI    | <http://localhost:8080/jaeger/ui> |

要采集来自 Web Store 的 Span，必须暴露 OpenTelemetry Collector 的 OTLP/HTTP 接收器：

```sh
kubectl port-forward svc/my-otel-demo-otelcol 4318:4318
```

有关在 Kubernetes 中使用Demo的更多详细信息，请参阅
[Kubernetes 部署](/docs/demo/kubernetes-deployment/)。