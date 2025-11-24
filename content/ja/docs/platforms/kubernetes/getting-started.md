---
title: はじめに
weight: 1
default_lang_commit: 9b427bf25703c33a2c6e05c2a7b58e0f768f7bad
drifted_from_default: true
# prettier-ignore
cSpell:ignore: filelog kubelet kubeletstats kubeletstatsreceiver loggingexporter otlpexporter sattributes sattributesprocessor sclusterreceiver sobjectsreceiver
---

このページでは、OpenTelemetry を使って Kubernetes クラスターの監視を始める最速の方法を説明します。
Kubernetesクラスター、ノード、ポッド、コンテナのメトリクスとログの収集、そしてクラスタがOTLPデータを出力するサービスをサポートできるようにすることに焦点を当てます。

Kubernetes で OpenTelemetry が動いているところを見たいのであれば、[OpenTelemetryデモ](/docs/demo/kubernetes-deployment/) から始めるのがベストです。
このデモは OpenTelemetry の実装を説明するためのものですが、Kubernetes 自体を監視する方法の例ではありません。
このウォークスルーを終えたら、デモをインストールして、すべての監視がアクティブなワークロードにどのように反応するかを見るのは楽しい実験になるでしょう。

PrometheusからOpenTelemetryへの移行を始めようとしている場合、あるいはOpenTelemetryコレクターを使ってPrometheusメトリクスを収集することに興味がある場合は、[Prometheusレシーバー](/docs/platforms/kubernetes/collector/components/#prometheus-receiver) を参照してください。

## 概要 {#overview}

Kubernetesは多くの重要なテレメトリーをさまざまな方法で公開しています。
ログ、イベント、多くの異なるオブジェクトのメトリクス、そしてワークロードによって生成されたデータがあります。

このすべてのデータを収集するために、[OpenTelemetryコレクター](/docs/collector/) を使用します。
コレクターは、このデータを効率的に収集し、意味のある方法で強化できる、自由に使えるさまざまなツールを備えています。

すべてのデータを収集するには、コレクターを2つの方法でインストールする必要があります。
1つは[デーモンセット](/docs/collector/deployment/agent/)として、もう1つは[デプロイメント](/docs/collector/deployment/gateway/)としてです。
コレクターのデーモンセットインストールは、ノード、ポッド、コンテナのサービス、ログ、メトリクスが発するテレメトリーを収集するために使用されます。
コレクターのデプロイメントインストールは、クラスタのメトリクスとイベントの収集に使用されます。

コレクターをインストールするには、[OpenTelemetry Collector Helm チャート](/docs/platforms/kubernetes/helm/collector/) を使用します。
Helm には、コレクターを簡単に設定するためのいくつかの設定オプションが付属しています。
Helm に慣れていない場合は、[Helm プロジェクトサイト](https://helm.sh/) を確認してください。
Kubernetes オペレーターを使うことに興味があるなら、[OpenTelemetry Operator](/docs/platforms/kubernetes/operator/) を参照してほしいですが、このガイドでは Helm チャートにフォーカスします。

## 準備 {#preparation}

このガイドでは、[Kindクラスター](https://kind.sigs.k8s.io/)を使用することを前提に説明しますが、適切と思われるKubernetesクラスターを自由に使用することができます。

すでに[Kindがインストールされている](https://kind.sigs.k8s.io/#installation-and-usage)と仮定して、新しいKindクラスタを作成します。

```sh
kind create cluster
```

すでに [Helm がインストールされている](https://helm.sh/docs/intro/install/) と仮定して、OpenTelemetry Collector Helm チャートを追加し、後でインストールできるようにします。

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

## デーモンセットコレクター {#daemonset-collector}

Kubernetesのテレメトリーを収集する最初のステップは、ノードとそのノード上で実行されているワークロードに関連するテレメトリーを収集するために、OpenTelemetry Collectorのデーモンセットインスタンスをデプロイすることです。
デーモンセットは、コレクターのこのインスタンスがすべてのノードにインストールされていることを保証するために使用されます。
デーモンセット内のコレクターの各インスタンスは、それが実行されているノードからのみデータを収集します。

コレクターのこのインスタンスは、以下のコンポーネントを使用します。

- [OTLP レシーバー](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver): アプリケーションのトレース、メトリクス、ログを収集します。
- [Kubernetes 属性プロセッサー](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor): 受信するアプリケーションのテレメトリーにKubernetesメタデータを追加します。
- [Kubeletstats レシーバー](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver): Kubelet上のAPIサーバーからノード、ポッド、コンテナのメトリクスをプルします。
- [Filelog レシーバー](/docs/platforms/kubernetes/collector/components/#filelog-receiver): Kubernetesログとstdout/stderrに書き込まれたアプリケーションログを収集します。

これらを1つひとつ見ていきましょう。

### OTLPレシーバー {#otlp-receiver}

[OTLP レシーバー](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver) は、[OTLP フォーマット](/docs/specs/otel/protocol/) でトレース、メトリクス、ログを収集するための最良のソリューションです。
他のフォーマットでアプリケーションのテレメトリーを発信している場合、[コレクターがそのためのレシーバーを持っている](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver)可能性が高いですが、このチュートリアルでは、テレメトリーが OTLP でフォーマットされていると仮定します。

要件ではないですが、ノード上で実行されているアプリケーションが、そのトレース、メトリクス、ログを同じノード上で実行されているコレクターに送信することは一般的なプラクティスです。
これにより、ネットワークの相互作用がシンプルに保たれ、`k8sattributes` プロセッサーを使用してKubernetesのメタデータを簡単に相関させることができます。

### Kubernetes属性プロセッサー (Kubernetes Atributes Processor) {#kubernetes-attributes-processor}

[Kubernetes属性プロセッサー](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor)は、Kubernetesポッドからテレメトリーを受信するコレクターで強く推奨されるコンポーネントです。
このプロセッサーは、Kubernetesポッドを自動的に検出し、ポッド名やノード名などのメタデータを抽出し、抽出したメタデータをリソース属性としてスパン、メトリクス、ログに追加します。
テレメトリーにKubernetesコンテキストを追加するため、Kubernetes属性プロセッサーを使用すると、アプリケーションのトレース、メトリクス、ログのシグナルを、ポッドのメトリクスやトレースなどのKubernetesテレメトリーと関連付けられます。

### Kubeletstatsレシーバー (Kubeletstats Receiver) {#kubeletstats-receiver}

[Kubeletstatsレシーバー](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver) は、ノードに関するメトリクスを収集するレシーバーです。
コンテナのメモリ使用量、ポッドのCPU使用量、ノードのネットワークエラーなどのメトリクスを収集します。
すべてのテレメトリーには、ポッド名やノード名などのKubernetesメタデータが含まれます。
ここではKubernetes属性プロセッサーを使用しているため、アプリケーションのトレース、メトリクス、ログをKubeletstatsレシーバーが生成したメトリクスと関連付けることができます。

### ファイルログレシーバー (Filelog Receiver) {#filelog-receiver}

[ファイルログレシーバー](/docs/platforms/kubernetes/collector/components/#filelog-receiver)は、Kubernetesが `/var/log/pods/*/*.log` に書き込むログをテイルすることで、標準出力/標準エラーに書き込まれたログを収集します。
ほとんどのログテイルツールと同様に、ファイルログレシーバーは、必要な方法でファイルをパースできるように、堅牢なアクションセットを提供します。

いつか自分でファイルログレシーバーを設定する必要が出てくるかもしれませんが、このウォークスルーでは、OpenTelemetry Helmチャートが複雑な設定をすべて処理してくれます。
さらに、ファイル名に基づいて有用なKubernetesメタデータを抽出してくれます。
ここではKubernetes属性プロセッサーを使用しているので、アプリケーションのトレース、メトリクス、ログをファイルログレシーバーが生成したログと相関できるでしょう。

---

OpenTelemetryコレクターHelmチャートは、コレクターのDeamonSetでのインストールにおいて、これらすべてのコンポーネントの設定を簡単にします。
また、RBAC、マウント、ホストポートなど、Kubernetes特有の詳細もすべて引き受けてくれます。

1つ注意事項があります。チャートはデフォルトではどのバックエンドにもデータを送信しません。
お気に入りのバックエンドで実際にデータを使いたい場合は、自分でエクスポーターを設定する必要があります。

このウォークスルーの例では、以下の`values.yaml`を使用します。

```yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-k8s

presets:
  # k8sattributesprocessorを有効にし、トレース、メトリクス、ログのパイプラインに追加します
  kubernetesAttributes:
    enabled: true
  # kubeletstatsreceiverを有効にし、メトリクスパイプラインに追加します
  kubeletMetrics:
    enabled: true
  # ファイルログレシーバーを有効にし、ログパイプラインに追加します
  logsCollection:
    enabled: true
## チャートにはデフォルトでloggingexporterしか含まれていません
## データをどこかに送りたい場合は、otlpexporterのようなエクスポーターを設定する必要があります
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

この `values.yaml` をチャートと一緒に使うには、ファイルを好きな場所に保存してから、以下のコマンドを実行してチャートをインストールします。

```sh
helm install otel-collector open-telemetry/opentelemetry-collector --values <チャートを保存した場所へのパス>
```

これで、OpenTelemetry コレクターのDaemonSetのインストールがクラスタ内で実行され、各ノードからテレメトリーが収集されるはずです！

## デプロイメントコレクター {#deployment-collector}

Kubernetesのテレメトリーを収集する次のステップは、クラスタ全体に関連するテレメトリーを収集するためにコレクターのデプロイメントインスタンスをデプロイすることです。
正確に1つのレプリカを持つデプロイは、重複したデータを生成しないことを保証します。

コレクターのこのインスタンスは、以下のコンポーネントを使用します。

- [Kubernetesクラスターレシーバー](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver): クラスターレベルのメトリクスとエンティティイベントを収集します。
- [Kubernetesオブジェクトレシーバー](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver): Kubernetes APIサーバーからイベントなどのオブジェクトを収集します。

これらを1つずつ見ていきましょう。

### Kubernetesクラスターレシーバー (Kubernetes Cluster Receiver) {#kubernetes-cluster-receiver}

[Kubernetesクラスターレシーバー](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver)は、クラスター全体の状態に関するメトリクスを収集するためのコレクターのソリューションです。
このレシーバーは、ノードの状態、ポッドのフェーズ、コンテナの再起動、利用可能なデプロイメントと希望するデプロイメントなどに関するメトリクスを収集できます。

### Kubernetesオブジェクトレシーバー (Kubernetes Objects Receiver) {#kubernetes-objects-receiver}

[Kubernetesオブジェクトレシーバー](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver) は、Kubernetesオブジェクトをログとして収集するためのコレクターのソリューションです。
どんなオブジェクトでも収集できますが、一般的で重要なユースケースはKubernetesイベントを収集することです。

---

OpenTelemetryコレクターHelmチャートは、コレクターのデプロイメントインストールにおけるこれらすべてのコンポーネントの設定を効率化します。
また、RBAC やマウントといった Kubernetes 固有の詳細もすべて引き受けてくれます。

1つ注意事項があります。
チャートはデフォルトではどのバックエンドにもデータを送信しません。
もし実際にあなたの好みのバックエンドでデータを使いたい場合は、自分でエクスポーターを設定する必要があります。

このウォークスルーの例では、以下の`values.yaml`を使用します。

```yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-k8s

# これらのコレクターは1つだけ必要で、それ以上は重複したデータを生成することになります
replicaCount: 1

presets:
  # k8sclusterreceiverを有効にし、メトリクスパイプラインに追加します
  clusterMetrics:
    enabled: true
  # k8sobjectsreceiverがイベントのみを収集するようにし、ログパイプラインに追加します
  kubernetesEvents:
    enabled: true
## チャートにはデフォルトでloggingexporterしか含まれていません
## データをどこかに送りたい場合は、otlpexporterのようなエクスポーターを設定する必要があります
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

この `values.yaml` をチャートで使用するには、ファイルを好きな場所に保存してから、以下のコマンドを実行してチャートをインストールしてください。

```sh
helm install otel-collector-cluster open-telemetry/opentelemetry-collector --values <チャートを保存した場所へのパス>
```

これで、クラスタメトリクスとイベントを収集するコレクターのデプロイメントインストールがクラスタで実行されるはずです！
