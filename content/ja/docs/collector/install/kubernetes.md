---
title: Kubernetesでコレクターをインストールする
linkTitle: Kubernetes
weight: 200
default_lang_commit: ec1657d18d8e1c63bf353049e8a7bf7e65c3e9cb
---

## Kubernetes {#kubernetes}

次のコマンドは、エージェントをデーモンセットと単一のゲートウェイインスタンスとしてデプロイします。

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

先ほどの例は、本番環境で使う前に拡張したりカスタマイズしたりするための、出発点としてのものです。
本番環境でのカスタマイズとインストールについては、[OpenTelemetry Helm Charts][] を参照してください。

また、[OpenTelemetry Operator][] を使って、OpenTelemetryコレクターインスタンスのプロビジョニングとメンテナンスを行えます。
この機能には、自動アップグレード処理、OpenTelemetry コンフィギュレーションに基づいた `Service` コンフィギュレーション、デプロイメントへの自動サイドカーインジェクションなどがあります。

Kubernetesでコレクターを使用する方法については、[Kubernetesで始める](/docs/platforms/kubernetes/getting-started/)を参照してください。

[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/
