---
title: Kubernetesでコレクターをインストールする
linkTitle: Kubernetes
weight: 200
default_lang_commit: 1f686d5f7b6bbdfaa30dafdc6ca0214c6f2308db
---

以下のコマンドを使用して、OpenTelemetry Collector を DaemonSet として、また単一のゲートウェイインスタンスとしてインストールします。

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

この例は出発点として利用することを目的としています。
本番環境向けのカスタマイズとインストールについては、[OpenTelemetry Helm Charts][] を参照してください。

また、[OpenTelemetry Operator][] を使用して、OpenTelemetry Collector インスタンスをプロビジョニングおよび管理することもできます。
Operator には、自動アップグレード処理、OpenTelemetry 構成に基づく `Service` 構成、デプロイメントへのサイドカーの自動注入などの機能があります。

Kubernetesでコレクターを使用する方法のガイダンスについては、[Kubernetesのはじめに](/docs/platforms/kubernetes/getting-started/)を参照してください。

[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/
