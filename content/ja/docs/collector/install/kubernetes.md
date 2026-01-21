---
title: Kubernetesでコレクターをインストールする
linkTitle: Kubernetes
weight: 200
default_lang_commit: ec1657d18d8e1c63bf353049e8a7bf7e65c3e9cb
---

## Kubernetes {#kubernetes}

以下のコマンドを使用して、デーモンセットとしてエージェントと、単一のゲートウェイインスタンスをデプロイします。

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

上記の例を出発点として利用し、実際の本番環境での使用前に拡張およびカスタマイズすることを目的としています。
本番環境向けのカスタマイズとインストールについては、[OpenTelemetry Helm Charts][]を参照してください。

また、[OpenTelemetry Operator][]を使用して、自動アップグレード処理、OpenTelemetry構成に基づく`Service`構成、デプロイメントへのサイドカーの自動注入などの機能を備えたOpenTelemetry Collectorインスタンスをプロビジョニングおよび管理することもできます。

Kubernetesでコレクターを使用する方法のガイダンスについては、[Kubernetesのはじめに](/docs/platforms/kubernetes/getting-started/)を参照してください。

[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/
