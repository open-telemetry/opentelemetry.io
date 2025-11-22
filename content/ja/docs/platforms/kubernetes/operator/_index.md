---
title: Kubernetes用のOpenTelemetryオペレーター
linkTitle: Kubernetesオペレーター
description: OpenTelemetryの計装ライブラリを使用して、コレクターとワークロードの自動計装を管理するKubernetesオペレーターの実装。
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/platforms/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/platforms/kubernetes-operator/*, to: ':splat' }
default_lang_commit: 9b427bf25703c33a2c6e05c2a7b58e0f768f7bad
drifted_from_default: true
---

## はじめに {#introduction}

[OpenTelemetryオペレーター](https://github.com/open-telemetry/opentelemetry-operator)は、[Kubernetesオペレーター](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)の実装のひとつです。

Operatorは以下を管理します。

- [OpenTelemetryコレクター](https://github.com/open-telemetry/opentelemetry-collector)
- [OpenTelemetryの計装ライブラリを使用したワークロードの自動計装](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Getting started {#getting-started}

既存のクラスターにオペレーターをインストールするには、まず [`cert-manager`](https://cert-manager.io/docs/installation/) がインストールされていることを確認し、以下のコマンドを実行します。

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

`opentelemetry-operator` のDeploymentが準備できたら、OpenTelemetryコレクター (otelcol) インスタンスを以下のように作成します。

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
      # NOTE: v0.86.0より前では `debug` の代わりに `logging` を使用します。
      debug: {}

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
EOF
```

{{% alert title="Note" %}}

デフォルトでは、`opentelemetry-operator` は [`opentelemetry-collector` イメージ](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector)を使用します。
[Helmチャート](/docs/platforms/kubernetes/helm/)を使用してオペレーターをインストールした場合は、[`opentelemetry-collector-k8s` イメージ](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s)が使用されます。
これらのリリースにないコンポーネントが必要な場合は、[独自のコレクター](/docs/collector/custom-collector/)を構築する必要があるかもしれません。

{{% /alert %}}

より詳細な設定オプションや、OpenTelemetryの計装ライブラリを使用したワークロードの自動計装を挿入する設定については、[Kubernetes用のOpenTelemetryオペレーター](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md)を参照してください。
