---
title: Kubernetes 的 OpenTelemetry Operator
linkTitle: Kubernetes Operator
description: Kubernetes Operator 的一个实现，使用 OpenTelemetry 插桩库管理 Collector 和工作负载的自动插桩。
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/platforms/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/platforms/kubernetes-operator/*, to: ':splat' }
default_lang_commit: a18833df3c17db379911a796f1b0a549c4d8f10f
drifted_from_default: true
---

## 简介 {#introduction}

[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
是 [Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
的一个实现。

Operator 管理以下内容：

- [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)
- [使用 OpenTelemetry 插桩库对工作负载进行自动插桩](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## 入门指南 {#getting-started}

要在已有集群中安装 Operator，请确保已安装 [`cert-manager`](https://cert-manager.io/docs/installation/)，然后运行：

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

一旦 `opentelemetry-operator` 部署就绪，创建一个 OpenTelemetry Collector（otelcol）实例，如下所示：

```console
$ kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: simplest
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15
      batch:
        send_batch_size: 10000
        timeout: 10s

    exporters:
      # 注意：较旧版本中请使用 `logging` 替代 `debug`。
      debug: {}

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
EOF
```

{{% alert title="注意" %}}

默认情况下，`opentelemetry-operator` 使用的是
[`opentelemetry-collector` 镜像](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector)。

当通过 [Helm Chart](../helm/) 安装 Operator 时，使用的是
[`opentelemetry-collector-k8s` 镜像](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s)。

如果你需要使用这些版本中未包含的组件，可能需要[构建你自己的 Collector](/docs/collector/custom-collector/)。

{{% /alert %}}

有关更多配置选项以及如何使用 OpenTelemetry 插桩库注入自动插桩，请参见
[Kubernetes 专用的 OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md)。
