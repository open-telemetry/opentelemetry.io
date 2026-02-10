---
title: OpenTelemetry Operator Chart
linkTitle: Operator Chart
default_lang_commit: c8c0a255c51e0ba22f89601f81842944a4d673bf
---

## 介绍 {#introduction}

[OpenTelemetry Operator](/docs/platforms/kubernetes/operator) 是一个 Kubernetes 操作器。
用于管理 [OpenTelemetry Collector](/docs/collector/) 和工作负载的自动插桩。
安装 OpenTelemetry Operator 的方法之一是通过
[OpenTelemetry Operator Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator)。

有关 OpenTelemetry Operator 的详细使用，请访问其
[文档](/docs/platforms/kubernetes/operator)。

### 安装 Chart {#installing-the-chart}

要安装发布名称为 `my-opentelemetry-operator` 的 Chart，请运行以下命令：

```console
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-operator open-telemetry/opentelemetry-operator \
  --set "manager.collectorImage.repository=otel/opentelemetry-collector-k8s" \
  --set admissionWebhooks.certManager.enabled=false \
  --set admissionWebhooks.autoGenerateCert.enabled=true
```

这将安装一个带有自签名证书和密钥的 OpenTelemetry Operator。

### 配置 {#configuration}

Operator Helm Chart 的默认 `values.yaml`
可直接用于安装，但该配置要求 Cert Manager 已预先部署在集群中。


在 Kubernetes 中，为使 API 服务器能够与 Webhook 组件通信，
Webhook 需配置一份 API 服务器已信任的 TLS 证书。
你可通过多种不同方式生成、配置该所需的 TLS 证书。

- 最简单且默认的方法是安装
  [cert-manager](https://cert-manager.io/docs/) 并将
  `admissionWebhooks.certManager.enabled` 设置为 `true`。
  这样，cert-manager 将生成一个自签名证书。
  有关更多详细信息，请参阅
  [cert-manager 安装](https://cert-manager.io/docs/installation/kubernetes/)。
- 你可以通过配置
  `admissionWebhooks.certManager.issuerRef` 值来提供自己的 Issuer。
  你需要指定 `kind`（Issuer 或 ClusterIssuer）和 `name`。
  请注意，此方法也需要安装 cert-manager。
- 你可以通过将
  `admissionWebhooks.certManager.enabled` 设置为 `false` 并将
  `admissionWebhooks.autoGenerateCert.enabled` 设置为 `true` 来使用自动生成的自签名证书。
  Helm 将为你创建一个自签名证书和密钥。
- 你可以通过将
  `admissionWebhooks.certManager.enabled` 和
  `admissionWebhooks.autoGenerateCert.enabled` 都设置为 `false` 来使用自己生成的自签名证书。
  你应该为 `admissionWebhooks.cert_file`、
  `admissionWebhooks.key_file` 和 `admissionWebhooks.ca_file` 提供必要的值。
- 你可以通过禁用
  `.Values.admissionWebhooks.create` 和 `admissionWebhooks.certManager.enabled`，
  同时在 `admissionWebhooks.secretName` 中设置你的自定义证书密钥名称来侧载自定义 webhook 和证书。
- 你可以通过禁用
  `.Values.admissionWebhooks.create` 并将环境变量
  `.Values.manager.env.ENABLE_WEBHOOKS` 设置为 `false` 来完全禁用 webhook。

Chart 中可用的所有配置选项（带注释）可以在其
[values.yaml 文件](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-operator/values.yaml)中查看。