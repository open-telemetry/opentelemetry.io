---
title: OpenTelemetryオペレーターチャート
linkTitle: オペレーターチャート
default_lang_commit: e8f18928513b726068be250802ebe7ece25e8851
---

## はじめに {#introduction}

[OpenTelemetryオペレーター](/docs/platforms/kubernetes/operator) は、[OpenTelemetryコレクター](/docs/collector) とワークロードの自動計装を管理するKubernetesオペレーターです。
OpenTelemetryオペレーターをインストールする方法の1つは、[OpenTelemetry Operator Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator)を経由することです。

OpenTelemetryオペレーターの詳しい使い方については、[ドキュメント](/docs/platforms/kubernetes/operator)を参照してください。

### チャートをインストールする {#installing-the-chart}

リリース名 `my-opentelemetry-operator` のチャートをインストールするには、以下のコマンドを実行します。

```console
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-operator open-telemetry/opentelemetry-operator \
  --set "manager.collectorImage.repository=otel/opentelemetry-collector-k8s" \
  --set admissionWebhooks.certManager.enabled=false \
  --set admissionWebhooks.autoGenerateCert.enabled=true
```

これにより、自己署名証明書とシークレットを持つOpenTelemetryオペレーターがインストールされます。

### 設定 {#configuration}

オペレーターHelmチャートのデフォルトの `values.yaml` はすぐにでもインストール可能ですが、Cert Managerがクラスタ上にすでに存在していることを想定しています。

Kubernetesでは、APIサーバーがWebhookコンポーネントと通信するために、WebhookはAPIサーバーが信頼するように設定されたTLS証明書を必要とします。
必要なTLS証明書を生成/設定するには、いくつかの方法があります。

- もっとも簡単でデフォルトの方法は、[cert-manager](https://cert-manager.io/docs/)をインストールし、 `admissionWebhooks.certManager.enabled` を `true` に設定することです。
  こうすることで、cert-managerが自己署名証明書を生成します。
  詳細は[cert-managerのインストール](https://cert-manager.io/docs/installation/kubernetes/)を参照してください。
- `admissionWebhooks.certManager.issuerRef` の値を設定することで、独自のIssuerを提供できます。
  `kind` (Issuer または ClusterIssuer) と `name` を指定する必要があります。
  この方法も cert-manager のインストールが必要であることに注意してください。
- `admissionWebhooks.certManager.enabled` を `false` に、`admissionWebhooks.autoGenerateCert.enabled` を `true` に設定することで、自動生成された自己署名証明書を使用できます。
  Helm が自己署名証明書とシークレットを作成してくれます。
- `admissionWebhooks.certManager.enabled` と `admissionWebhooks.autoGenerateCert.enabled` の両方を `false` に設定することで、自分で生成した自己署名証明書を使用できます。
  必要な値は `admissionWebhooks.cert_file` 、`admissionWebhooks.key_file` 、`admissionWebhooks.ca_file` に指定します。
- `.Values.admissionWebhooks.create` と `admissionWebhooks.certManager.enabled` を無効にし、`admissionWebhooks.secretName` にカスタム証明書のシークレット名を設定することで、カスタムWebhookと証明書をサイドロードできます。
- すべてのWebhookを一度に無効にするには、`.Values.admissionWebhooks.create` を無効にし、環境変数 `.Values.manager.env.ENABLE_WEBHOOKS` を `false` に設定します。

チャートで利用可能なすべての設定オプション（コメント付き）は、その[values.yamlファイル](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-operator/values.yaml)で確認できます。
