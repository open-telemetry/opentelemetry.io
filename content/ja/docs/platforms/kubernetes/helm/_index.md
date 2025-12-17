---
title: OpenTelemetry Helmチャート
linkTitle: Helm Charts
default_lang_commit: e8f18928513b726068be250802ebe7ece25e8851
---

## はじめに {#introduction}

[Helm](https://helm.sh/) は、Kubernetesアプリケーションを管理するためのCLIソリューションです。

Helm を使うことにした場合、[OpenTelemetry Helmチャート](https://github.com/open-telemetry/opentelemetry-helm-charts) を使って、[OpenTelemetryコレクター](/docs/collector), [OpenTelemetryオペレーター](/docs/platforms/kubernetes/operator), [OpenTelemetryデモ](/docs/demo) のインストールを管理することができます。

次のコマンドでOpenTelemetry Helmリポジトリを追加します。

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```
