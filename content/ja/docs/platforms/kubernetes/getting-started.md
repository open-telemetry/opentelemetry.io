---
title: はじめに
weight: 1
default_lang_commit: 0cdf20f0dcbf7305541f8eab3001c95ce805fbc0
# prettier-ignore
cSpell:ignore: filelog filelogreceiver kubelet kubeletstats kubeletstatsreceiver loggingexporter otlpexporter sattributes sattributesprocessor sclusterreceiver sobjectsreceiver
---

このページでは、OpenTelemetry を使って Kubernetes クラスターの監視を始める最速の方法を説明します。
Kubernetesクラスター、ノード、ポッド、コンテナのメトリクスとログの収集、そしてクラスタがOTLPデータを出力するサービスをサポートできるようにすることに焦点を当てます。

Kubernetes で OpenTelemetry が動いているところを見たいのであれば、[OpenTelemetryデモ](/docs/demo/kubernetes-deployment/) から始めるのがベストです。
このデモは OpenTelemetry の実装を説明するためのものですが、Kubernetes 自体を監視する方法の例ではありません。
このウォークスルーを終えたら、デモをインストールして、すべての監視がアクティブなワークロードにどのように反応するかを見るのは楽しい実験になるでしょう。

PrometheusからOpenTelemetryへの移行を始めようとしている場合、あるいはOpenTelemetryコレクターを使ってPrometheusメトリクスを収集することに興味がある場合は、[Prometheusレシーバーa](../collector/components/#prometheus-receiver) を参照してください。

## 概要

Kubernetesは多くの重要なテレメトリーをさまざまな方法で公開しています。
ログ、イベント、多くの異なるオブジェクトのメトリクス、そしてワークロードによって生成されたデータがあります。

このすべてのデータを収集するために、[OpenTelemetryコレクター](/docs/collector/) を使用します。
コレクターは、このデータを効率的に収集し、意味のある方法で強化できる、自由に使えるさまざまなツールを備えています。

すべてのデータを収集するには、コレクターを2つの方法でインストールする必要があります。
1つは[デーモンセット](/docs/collector/deployment/agent/)として、もう1つは[デプロイメント](/docs/collector/deployment/gateway/)としてです。
コレクターのデーモンセットインストールは、ノード、ポッド、コンテナのサービス、ログ、メトリクスが発するテレメトリーを収集するために使用されます。
コレクターのデプロイメントインストールは、クラスタのメトリクスとイベントの収集に使用されます。

コレクターをインストールするには、[OpenTelemetry Collector Helm チャート](../helm/collector/) を使用します。
Helm には、コレクターを簡単に設定するためのいくつかの設定オプションが付属しています。
Helm に慣れていない場合は、[Helm プロジェクトサイト](https://helm.sh/) を確認してください。
Kubernetes オペレーターを使うことに興味があるなら、[OpenTelemetry Operator](../operator/) を参照してほしいですが、このガイドでは Helm チャートにフォーカスします。

## 準備

このガイドでは、[Kindクラスター](https://kind.sigs.k8s.io/)を使用することを前提に説明しますが、適切と思われるKubernetesクラスターを自由に使用することができます。

すでに[Kindがインストールされている](https://kind.sigs.k8s.io/#installation-and-usage)と仮定して、新しいKindクラスタを作成します。

```sh
kind create cluster
```

すでに [Helm がインストールされている](https://helm.sh/docs/intro/install/) と仮定して、OpenTelemetry Collector Helm チャートを追加し、後でインストールできるようにします。

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

## デーモンセットコレクター

Kubernetesのテレメトリーを収集する最初のステップは、ノードとそのノード上で実行されているワークロードに関連するテレメトリーを収集するために、OpenTelemetry Collectorのデーモンセットインスタンスをデプロイすることです。
デーモンセットは、コレクターのこのインスタンスがすべてのノードにインストールされていることを保証するために使用されます。
デーモンセット内のコレクターの各インスタンスは、それが実行されているノードからのみデータを収集します。

コレクターのこのインスタンスは、以下のコンポーネントを使用します。

- [OTLP レシーバー](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver): アプリケーションのトレース、メトリクス、ログを収集します。
- [Kubernetes 属性プロセッサー](../collector/components/#kubernetes-attributes-processor): 受信するアプリケーションのテレメトリーにKubernetesメタデータを追加します。
- [Kubeletstats レシーバー](../collector/components/#kubeletstats-receiver): Kubelet上のAPIサーバーからノード、ポッド、コンテナのメトリクスをプルします。
- [Filelog レシーバー](../collector/components/#filelog-receiver): Kubernetesログとstdout/stderrに書き込まれたアプリケーションログを収集します。

これらを1つひとつ見ていきましょう。

### OTLP Receiver

The
[OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
is the best solution for collecting traces, metrics, and logs in the
[OTLP format](/docs/specs/otel/protocol/). If you are emitting application
telemetry in another format, there is a good chance that
[the Collector has a receiver for it](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver),
but for this tutorial we'll assume the telemetry is formatted in OTLP.

Although not a requirement, it is a common practice for applications running on
a node to emit their traces, metrics, and logs to a collector running on the
same node. This keeps network interactions simple and allows easy correlation of
Kubernetes metadata using the `k8sattributes` processor.

### Kubernetes Attributes Processor

The
[Kubernetes Attributes Processor](../collector/components/#kubernetes-attributes-processor)
is a highly recommended component in any collector receive telemetry from
Kubernetes pods. This processor automatically discovers Kubernetes pods,
extracts their metadata such as pod name or node name, and adds the extracted
metadata to spans, metrics, and logs as resource attributes. Because it adds
Kubernetes context to your telemetry, the Kubernetes Attributes Processor lets
you correlate your application's traces, metrics, and logs signals with your
Kubernetes telemetry, such as pod metrics and traces.

### Kubeletstats Receiver

The [Kubeletstats Receiver](../collector/components/#kubeletstats-receiver) is
the receiver that gathers metrics about the node. It will gather metrics like
container memory usage, pod cpu usage, and node network errors. All of the
telemetry includes Kubernetes metadata like pod name or node name. Since we're
using the Kubernetes Attributes Processor, we'll be able to correlate our
application traces, metrics, and logs with the metrics produced by the
Kubeletstats Receiver.

### Filelog Receiver

The [Filelog Receiver](../collector/components/#filelog-receiver) will collect
logs written to stdout/stderr by tailing the logs Kubernetes writes to
`/var/log/pods/*/*/*.log`. Like most log tailers, the filelog receiver provides
a robust set of actions that allow you to parse the file however you need.

Someday you may need to configure a Filelog Receiver on your own, but for this
walkthrough the OpenTelemetry Helm Chart will handle all the complex
configuration for you. In addition, it will extract useful Kubernetes metadata
based on the file name. Since we're using the Kubernetes Attributes Processor,
we'll be able to correlate the application traces, metrics, and logs with the
logs produced by the Filelog Receiver.

---

The OpenTelemetry Collector Helm chart makes configuring all of these components
in a daemonset installation of the collector easy. It will also take care of all
of the Kubernetes-specific details, such as RBAC, mounts and host ports.

One caveat - the chart doesn't send the data to any backend by default. If you
want to actually use your data in your favorite backend you'll need to configure
an exporter yourself.

The following `values.yaml` is what we'll use

```yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-k8s

presets:
  # enables the k8sattributesprocessor and adds it to the traces, metrics, and logs pipelines
  kubernetesAttributes:
    enabled: true
  # enables the kubeletstatsreceiver and adds it to the metrics pipelines
  kubeletMetrics:
    enabled: true
  # Enables the filelogreceiver and adds it to the logs pipelines
  logsCollection:
    enabled: true
## The chart only includes the loggingexporter by default
## If you want to send your data somewhere you need to
## configure an exporter, such as the otlpexporter
# config:
#   exporters:
#     otlp:
#       endpoint: "<SOME BACKEND>"
#   service:
#     pipelines:
#       traces:
#         exporters: [ otlp ]
#       metrics:
#         exporters: [ otlp ]
#       logs:
#         exporters: [ otlp ]
```

To use this `values.yaml` with the chart, save it to your preferred file
location and then run the following command to install the chart

```sh
helm install otel-collector open-telemetry/opentelemetry-collector --values <path where you saved the chart>
```

You should now have a daemonset installation of the OpenTelemetry Collector
running in your cluster collecting telemetry from each node!

## Deployment Collector

The next step to collecting Kubernetes telemetry is to deploy a deployment
instance of the Collector to gather telemetry related to the cluster as a whole.
A deployment with exactly one replica ensures that we don't produce duplicate
data.

This instance of the Collector will use the following components:

- [Kubernetes Cluster Receiver](../collector/components/#kubernetes-cluster-receiver):
  to collect cluster-level metrics and entity events.
- [Kubernetes Objects Receiver](../collector/components/#kubernetes-objects-receiver):
  to collect objects, such as events, from the Kubernetes API server.

Let's break these down.

### Kubernetes Cluster Receiver

The
[Kubernetes Cluster Receiver](../collector/components/#kubernetes-cluster-receiver)
is the Collector's solution for collecting metrics about the state of the
cluster as a whole. This receiver can gather metrics about node conditions, pod
phases, container restarts, available and desired deployments, and more.

### Kubernetes Objects Receiver

The
[Kubernetes Objects Receiver](../collector/components/#kubernetes-objects-receiver)
is the Collector's solution for collecting Kubernetes objects as logs. Although
any object can be collected, a common and important use case is to collect
Kubernetes events.

---

The OpenTelemetry Collector Helm chart streamlines the configuration for all of
these components in a deployment installation of the Collector. It will also
take care of all of the Kubernetes-specific details, such as RBAC and mounts.

One caveat - the chart doesn't send the data to any backend by default. If you
want to actually use your data in your preferred backend, you'll need to
configure an exporter yourself.

The following `values.yaml` is what we'll use:

```yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-k8s

# We only want one of these collectors - any more and we'd produce duplicate data
replicaCount: 1

presets:
  # enables the k8sclusterreceiver and adds it to the metrics pipelines
  clusterMetrics:
    enabled: true
  # enables the k8sobjectsreceiver to collect events only and adds it to the logs pipelines
  kubernetesEvents:
    enabled: true
## The chart only includes the loggingexporter by default
## If you want to send your data somewhere you need to
## configure an exporter, such as the otlpexporter
# config:
# exporters:
#   otlp:
#     endpoint: "<SOME BACKEND>"
# service:
#   pipelines:
#     traces:
#       exporters: [ otlp ]
#     metrics:
#       exporters: [ otlp ]
#     logs:
#       exporters: [ otlp ]
```

To use this `values.yaml` with the chart, save it to your preferred file
location and then run the following command to install the chart:

```sh
helm install otel-collector-cluster open-telemetry/opentelemetry-collector --values <path where you saved the chart>
```

You should now have a deployment installation of the collector running in your
cluster that collects cluster metrics and events!
