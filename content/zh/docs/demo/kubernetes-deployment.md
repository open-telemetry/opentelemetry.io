---
title: Kubernetes 部署
linkTitle: Kubernetes
aliases: [kubernetes_deployment]
default_lang_commit: ff6f300f46ac9bfab574f2a73a0555fccb64fda9
cSpell:ignore: loadgen otlphttp spanmetrics
---

我们提供了一个 [OpenTelemetry 演示所用的 Helm Chart](/docs/platforms/kubernetes/helm/demo/)，
以帮助你将演示程序部署到现有的 Kubernetes 集群中。

要使用该 Helm Chart，你需要先安装 [Helm](https://helm.sh)。请参考
Helm 的[官方文档](https://helm.sh/docs/)开始使用。

## 前置条件 {#prerequisites}

- Kubernetes 1.24+
- 6 GB 可用内存供应用使用
- Helm 3.14+（仅适用于 Helm 安装方式）

## 使用 Helm 安装（推荐方式） {#install-using-helm-recommended}

添加 OpenTelemetry 的 Helm 仓库：

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

使用以下命令以 `my-otel-demo` 作为发布名称安装 Chart：

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

{{% alert title="注意" %}}

OpenTelemetry 演示所用的 Helm Chart 不支持从一个版本升级到另一个版本。
如果需要升级 Chart，必须先删除现有发布，然后安装新版本。

{{% /alert %}}

{{% alert title="注意" %}}

要使用下述所有方式，必须使用 OpenTelemetry 演示所用的 Helm Chart v0.11.0 或更高版本。

{{% /alert %}}

## 使用 kubectl 安装 {#install-using-kubectl}

以下命令会将演示应用安装到你的 Kubernetes 集群中：

```shell
kubectl create --namespace otel-demo -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-demo/main/kubernetes/opentelemetry-demo.yaml
```

{{% alert title="注意" %}}

OpenTelemetry 演示所用的 Kubernetes 清单文件不支持从一个版本升级到另一个版本。
如果需要升级演示应用，必须先删除已有资源再重新安装新版本。

{{% /alert %}}

{{% alert title="注意" %}}

这些清单文件是由 Helm Chart 生成的，提供仅为方便起见。推荐使用 Helm Chart 进行安装。

{{% /alert %}}

## 使用演示应用 {#use-the-demo}

要使用演示应用，你需要将服务暴露到 Kubernetes 集群外部。你可以使用
`kubectl port-forward` 命令将服务转发到本地系统，或配置服务类型（如 LoadBalancer）并可选地部署 Ingress 资源。

### 使用 kubectl port-forward 暴露服务 {#expose-services-using-kubectl-port-forward}

要暴露 `frontend-proxy` 服务，请使用以下命令（将 `default` 替换为你的 Helm Chart 所在的命名空间）：

```shell
kubectl --namespace default port-forward svc/frontend-proxy 8080:8080
```

{{% alert title="注意" %}}

`kubectl port-forward` 会持续代理端口直到该进程终止。你可能需要为每次端口转发单独打开终端，
并在完成后使用 <kbd>Ctrl-C</kbd> 终止进程。

{{% /alert %}}

设置好 frontend-proxy 的端口转发后，你可以访问以下地址：

- Web 商店：[http://localhost:8080/](http://localhost:8080/)
- Grafana：[http://localhost:8080/grafana/](http://localhost:8080/grafana/)
- 负载生成器 UI：[http://localhost:8080/loadgen/](http://localhost:8080/loadgen/)
- Jaeger UI：[http://localhost:8080/jaeger/ui/](http://localhost:8080/jaeger/ui/)
- Flagd 配置器 UI：[http://localhost:8080/feature](http://localhost:8080/feature)

### 使用 Service 或 Ingress 配置暴露演示组件

{{% alert title="注意" %}}

推荐在安装 Helm Chart 时使用 values 文件以便进行额外配置。

{{% /alert %}}

#### 配置 Ingress 资源 {#configure-ingress-resources}

{{% alert title="注意" %}}

某些 Kubernetes 集群可能没有支持 LoadBalancer 类型服务或 Ingress
资源的基础设施。使用这些配置前请确认集群是否具备支持。

{{% /alert %}}

每个演示组件（如 frontend-proxy）都可以配置其 Kubernetes 服务类型。
默认情况下不会创建 Ingress，但你可以通过组件的 `ingress` 属性进行启用和配置。

以下示例配置将为 frontend-proxy 组件启用 Ingress 资源，可添加到你的 values 文件中：

```yaml
components:
  frontend-proxy:
    ingress:
      enabled: true
      annotations: {}
      hosts:
        - host: otel-demo.my-domain.com
          paths:
            - path: /
              pathType: Prefix
              port: 8080
```

部分 Ingress 控制器可能需要特殊注解或服务类型，请参考你的 Ingress 控制器文档获取详细信息。

#### 配置服务类型

每个演示组件（如 frontend-proxy）都可以配置其 Kubernetes 服务类型。
默认是 `ClusterIP`，你可以通过每个组件的 `service.type` 属性进行更改。

以下示例配置将 frontend-proxy 组件的服务类型更改为 LoadBalancer，可添加到你的 values 文件中：

```yaml
components:
  frontend-proxy:
    service:
      type: LoadBalancer
```

#### 配置浏览器端遥测

为了正确收集来自浏览器的 span，你还需要指定 OpenTelemetry Collector 的访问地址。
frontend-proxy 定义了一个前缀为 `/otlp-http` 的路由，你可以通过设置 frontend 组件的以下环境变量来配置 Collector 端点：

```yaml
components:
  frontend:
    envOverrides:
      - name: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
        value: http://otel-demo.my-domain.com/otlp-http/v1/traces
```

## 使用你自己的后端服务 {#bring-your-own-backend}

你可能希望将 Web 商店作为演示应用，连接到你已有的可观测性后端
（例如已有的 Jaeger、Zipkin 实例，或[你选择的其他厂商](/ecosystem/vendors/)）。

OpenTelemetry Collector 的配置在 Helm Chart 中是可暴露的。
你进行的任何添加都会被合并到默认配置中。这可以让你添加自定义导出器，并将其加入到需要的管道中：

```yaml
opentelemetry-collector:
  config:
    exporters:
      otlphttp/example:
        endpoint: <your-endpoint-url>

    service:
      pipelines:
        traces:
          exporters: [spanmetrics, otlphttp/example]
```

{{% alert title="注意" %}}

在使用 Helm 合并 YAML 值时，对象会合并，但数组会被替换。如果你重写了
`traces` 管道的 `exporters`，必须确保其中包含 `spanmetrics` 导出器，否则将会出错。

{{% /alert %}}

某些厂商的后端可能要求添加额外的认证参数，请参考相关文档。部分后端需要使用不同的导出器，你可以在
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter)
中找到这些导出器及其文档。

使用自定义的 `my-values-file.yaml` values 文件安装 Helm Chart 的命令如下：

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo --values my-values-file.yaml
```
