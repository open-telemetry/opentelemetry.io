---
title: OpenTelemetry Operator について知らないかもしれないこと - OTel Operator Q&A
linkTitle: OTel Operator Q&A
date: 2024-05-13
author: '[Adriana Villela](https://github.com/avillela) (ServiceNow)'
canonical_url: https://adri-v.medium.com/81d63addbf92
default_lang_commit: 62881f483a5dd3afc5f5cac76505dec21d69d8dc
cSpell:ignore: mycollector
---

![飛行機から見た雲の上にそびえるシアトルのマウントレーニア。写真: Adriana Villela](mount-rainier.jpg)

[OpenTelemetry（OTel）Operator](https://github.com/open-telemetry/opentelemetry-operator) は、Kubernetes クラスター内で OTel を管理し、作業を少し楽にしてくれる [Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) です。
以下のことを行います。

- [OpenTelemetry Collector](/docs/collector/) のデプロイメントを管理します。
  [`OpenTelemetryCollector`](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#getting-started) [カスタムリソース（CR）](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)によってサポートされています。
- [OpAMP](/docs/specs/opamp/) 統合を通じて、OpenTelemetry Collector のフリートの設定を管理します。
  [`OpAMPBridge`](https://github.com/open-telemetry/opentelemetry-operator/blob/6022a4fef5b60f8812069a54bac44e631ef5ec8c/docs/api/opampbridges.md?from_branch=main) カスタムリソースによってサポートされています。
- [Prometheus Operator の `PodMonitor` および `ServiceMonitor` CR との統合](https://github.com/open-telemetry/opentelemetry-operator/tree/de81a64ae8d7d2f4f48945049d8ef9ad3509f89e/cmd/otel-allocator?from_branch=main)を提供します。
- [自動計装](https://www.honeycomb.io/blog/what-is-auto-instrumentation)を Pod にインジェクションして設定します。
  [`Instrumentation`](https://github.com/open-telemetry/opentelemetry-operator/blob/d980048f185202f9f8d736410b20be541371c2bc/docs/auto-instrumentation/README.md) カスタムリソースによってサポートされています。

この1年で Operator を使う機会があり、いくつかのクールなことを学んだので、Q&A の形式で、OTel Operator に関するちょっとした豆知識を共有するのが役立つと思いました。

この記事は、OpenTelemetry、[OpenTelemetry Collector](/docs/collector/)、[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)（[Target Allocator](https://adri-v.medium.com/prometheus-opentelemetry-better-together-41dc637f2292) を含む）、および [Kubernetes](https://kubernetes.io) についてある程度の知識があることを前提としています。

## Q&A {#qa}

### Q1: Operator は複数の Collector 設定ソースをサポートしていますか {#q1-does-the-operator-support-multiple-collector-configuration-sources}

簡潔な回答: いいえ。

詳細な回答: OTel Collector には複数の Collector 設定 YAML ファイルを渡すことができます。
これにより、基本設定を `otelcol-config.yaml` に保持し、基本設定のオーバーライドや追加を `otelcol-config-extras.yaml` などに入れることができます。
[OTel Demo の Docker compose ファイル](https://github.com/open-telemetry/opentelemetry-demo/blob/06f020c97f78ae9625d3a4a5d1107c55045c567f/docker-compose.yml#L665-L668)でこの例を確認できます。

残念ながら、OTel Collector は複数の Collector 設定ファイルをサポートしていますが、OTel Operator によって管理される Collector はサポートしていません。

これを回避するには、事前に外部ツールを使用して複数の Collector 設定をマージすることができます。
たとえば、[Helm を使って Operator をデプロイしている](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/2c6541c9914ea7ad82c00884af7fc28385fd522d/charts/opentelemetry-operator?from_branch=main)場合、[複数の --values フラグを使用して複数の Collector 設定ファイルを渡し](https://stackoverflow.com/a/56653384)、[Helm](https://helm.sh) にマージを任せることができます。

> **NOTE:** [この PR](https://github.com/open-telemetry/opentelemetry-operator/issues/1906) にあるように、将来的には設定を指定するためのより高レベルな構成を提供する計画があります。

参考までに、[#otel-operator CNCF Slack チャンネルのこのスレッド](https://cloud-native.slack.com/archives/C033BJ8BASU/p1709321896612279)をご覧ください。

### Q2: Collector の設定でアクセストークンを安全に参照するにはどうすればよいですか {#q2-how-can-i-securely-reference-access-tokens-in-the-collectors-configuration}

OpenTelemetry データをオブザーバビリティバックエンドに送信するには、少なくとも1つの[エクスポーター](/docs/collector/configuration/#exporters)を定義する必要があります。
[OTLP](/docs/specs/otel/protocol/) を使用するか[ベンダー独自のフォーマット](/docs/specs/otel/protocol/)を使用するかにかかわらず、ほとんどのエクスポーターでは、ベンダーバックエンドにデータを送信する際にエンドポイントとアクセストークンを指定する必要があります。

OpenTelemetry Operator を使用して OTel Collector を管理する場合、OTel Collector の設定 YAML は [OpenTelemetryCollector](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#getting-started) CR で定義されます。
このファイルはバージョン管理されるべきであるため、平文で保存されたアクセストークンを含む機密データを含めるべきではありません。

幸い、`OpenTelemetryCollector` CR ではその値をシークレットとして参照する方法が提供されています。
以下がその方法です。

1- アクセストークン用の Kubernetes シークレットを作成します。
シークレットを [base-64 エンコード](https://www.base64encode.org/)することを忘れないでください。

2- `OpenTelemetryCollector` CR の [`env` セクション](https://github.com/avillela/otel-target-allocator-talk/blob/21e9643e28165e39bd79f3beec7f2b1f989d87e9/src/resources/02-otel-collector-ls.yml#L16-L21)に追加して、[シークレットを環境変数として公開](https://kubernetes.io/docs/concepts/configuration/secret/#using-a-secret)します。
例：

```yaml
env:
  - name: TOKEN_VALUE
    valueFrom:
      secretKeyRef:
        key: TOKEN_VALUE
        name: otel-collector-secret
```

3- [エクスポーターの定義](https://github.com/avillela/otel-target-allocator-talk/blob/21e9643e28165e39bd79f3beec7f2b1f989d87e9/src/resources/02-otel-collector-ls.yml#L43-L47)で環境変数を参照します。

```yaml
exporters:
  otlp:
    endpoint: '<your_backend_endpoint_here>'
    headers:
      '<token_name>': '${TOKEN_VALUE}'
```

詳細については、[完全な例](https://github.com/avillela/otel-target-allocator-talk/blob/4c0eb425c90187d584c9d03b51ad918b377014a3/src/resources/02-otel-collector-ls.yml?from_branch=main)と[手順](https://github.com/avillela/otel-target-allocator-talk/tree/1f49e53e0b3bfc0399913ee0a1e44e61ad7a4752?tab=readme-ov-file&from_branch=main#3b--kubernetes-deployment-servicenow-cloud-observability-backend)を参照してください。

### Q3: Operator のバージョンは Collector のバージョンと同等ですか {#q3-is-the-operator-version-at-parity-with-the-collector-version}

Collector のリリースごとに、その Collector バージョンをサポートする Operator のリリースがあります。
たとえば、この記事の執筆時点で、最新の Operator バージョンは 0.98.0 です。
したがって、Operator が使用する Collector のデフォルトイメージは、[コアディストリビューション](/blog/2024/otel-collector-anti-patterns/#3--not-using-the-right-collector-distribution-or-not-building-your-own-distribution)（contrib ディストリビューションではなく）のバージョン 0.98.0 です。

### Q4: ベースの OTel Collector イメージをオーバーライドできますか {#q4-can-i-override-the-base-otel-collector-image}

はい！
実際、[オーバーライドすべきかもしれません](https://cloud-native.slack.com/archives/C033BJ8BASU/p1713894678225579)！

先ほど見たように、[コアディストリビューション](https://github.com/open-telemetry/opentelemetry-collector)は `OpenTelemetryCollector` CR で使用されるデフォルトの Collector ディストリビューションです。
コアディストリビューションは、OTel 開発者が開発やテストを行うための最小限の Collector ディストリビューションです。
基本的なコンポーネントセット、つまり[エクステンション](/docs/collector/configuration/#service-extensions)、[コネクター](/docs/collector/configuration/#connectors)、[レシーバー](/docs/collector/configuration/#receivers)、[プロセッサー](/docs/collector/configuration/#processors)、[エクスポーター](/docs/collector/configuration/#exporters)が含まれています。

コアが提供するコンポーネントよりも多くのコンポーネントにアクセスしたい場合は、かわりに Collector の [Kubernetes ディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/b590e8bc74a5aacca1236f02b10bafeb4959dd96/distributions/otelcol-k8s?from_branch=main)を使用できます。
このディストリビューションは、Kubernetes クラスター内で Kubernetes およびそこで動作するサービスを監視するために特別に作られています。
[OpenTelemetry Collector Core](https://github.com/open-telemetry/opentelemetry-collector) と [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) のコンポーネントのサブセットが含まれています。

独自の特定の Collector コンポーネントを使用したい場合は、[OpenTelemetry Collector Builder](/docs/collector/extend/ocb/)（OCB）を使用して独自のディストリビューションをビルドし、必要なコンポーネントのみを含めることができます。

いずれの場合も、OpenTelemetryCollector CR では、`spec.image` を追加することで、デフォルトの Collector イメージをニーズに合ったものにオーバーライドできます。
さらに、`spec.replicas` を追加して Collector のレプリカ数を指定することもできます。
これは、Collector イメージをオーバーライドするかどうかとは完全に独立しています。

コードは次のようになります。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: mynamespace
spec:
  mode: statefulset
  image: <my_collector_image>
  replicas: <number_of_replicas>
```

ここで、

- `<my_collector_image>` はコンテナリポジトリの有効な Collector イメージの名前です
- `<number_of_replicas>` は、基盤となる OpenTelemetry Collector の Pod インスタンス数です

プライベートコンテナレジストリから Collector イメージをプルする場合は、[`imagePullSecrets`](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) を使用する必要があることに注意してください。
プライベートコンテナレジストリは認証が必要なため、これによりそのプライベートレジストリに対して認証できるようになります。
Collector イメージで `imagePullSecrets` を使用する方法の詳細については、[手順](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#using-imagepullsecrets)を参照してください。

詳細については、[OpenTelemetryCollector CR API ドキュメント](https://github.com/open-telemetry/opentelemetry-operator/blob/f6b0d947a4c48444a0483b3b0dcaf1e60c4458d6/docs/api/opentelemetrycollectors.md?from_branch=main)をご覧ください。

### Q5: Target Allocator はすべてのデプロイメントタイプで動作しますか {#q5-does-the-target-allocator-work-for-all-deployment-types}

いいえ。
Target Allocator は [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) と [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)（[新たに導入](https://github.com/open-telemetry/opentelemetry-operator/pull/2430#discussion_r1420495631)）でのみ動作します。
詳細については、[`collector_webhook.go`](https://github.com/open-telemetry/opentelemetry-operator/blob/aed905c2c3c0aa3fb608a79c2e4d0e7b73dff980/apis/v1beta1/collector_webhook.go#L328) を参照してください。

### Q6: Target Allocator で `prometheusCR` を有効にした場合、Kubernetes クラスターに `PodMonitor` と `ServiceMonitor` の CR をインストールする必要がありますか {#q6-if-i-enable-prometheuscr-in-the-target-allocator-do-i-need-the-podmonitor-and-servicemonitor-crs-installed-in-my-kubernetes-cluster}

はい、必要です。
これらの CR は [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator) にバンドルされていますが、スタンドアロンでインストールできるため、Target Allocator でこの2つの CR を使用するためだけに Prometheus Operator をインストールする必要はありません。

[`PodMonitor`](https://github.com/prometheus-operator/prometheus-operator/blob/5e8d9c51281b62da75b9faa48d7f99a4d0a9ea79/Documentation/api-reference/api.md?from_branch=main#monitoring.coreos.com/v1.PodMonitor) と [`ServiceMonitor`](https://github.com/prometheus-operator/prometheus-operator/blob/5e8d9c51281b62da75b9faa48d7f99a4d0a9ea79/Documentation/api-reference/api.md?from_branch=main#monitoring.coreos.com/v1.ServiceMonitor) の CR をインストールする最も簡単な方法は、個別の [PodMonitor YAML](https://github.com/prometheus-community/helm-charts/blob/ad05cfdbbf20b84325f41018e55eddbd841ec9da/charts/kube-prometheus-stack/charts/crds/crds/crd-podmonitors.yaml?from_branch=main) と [ServiceMonitor YAML](https://github.com/prometheus-community/helm-charts/blob/ad05cfdbbf20b84325f41018e55eddbd841ec9da/charts/kube-prometheus-stack/charts/crds/crds/crd-servicemonitors.yaml?from_branch=main) の[カスタムリソース定義（CRD）](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)のコピーを取得することです。
以下のようにします。

```shell
kubectl --context kind-otel-target-allocator-talk apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd/monitoring.coreos.com_servicemonitors.yaml

kubectl --context kind-otel-target-allocator-talk apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd/monitoring.coreos.com_podmonitors.yaml
```

[`ServiceMonitor` を使用した OpenTelemetry Operator の Target Allocator の例](https://github.com/avillela/otel-target-allocator-talk/tree/1f49e53e0b3bfc0399913ee0a1e44e61ad7a4752?tab=readme-ov-file&from_branch=main#3b--kubernetes-deployment-servicenow-cloud-observability-backend)を参照してください。

### Q7: Target Allocator を使用するためにサービスアカウントを作成する必要がありますか {#q7-do-i-need-to-create-a-service-account-to-use-the-target-allocator}

いいえ、ただし少し追加の作業が必要です。
Target Allocator を使用するには[サービスアカウント](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/)が必要ですが、自分で作成する必要はありません。

Target Allocator を有効にしてサービスアカウントを作成しない場合、自動的に作成されます。
このサービスアカウントのデフォルト名は、Collector 名（`OpenTelemetryCollector` CR の `metadata.name`）と `-collector` を連結したものです。
たとえば、Collector の名前が `mycollector` であれば、サービスアカウントは `mycollector-collector` になります。

デフォルトでは、このサービスアカウントにはポリシーが定義されていません。
つまり、独自の [`ClusterRole`](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole) と [`ClusterRoleBinding`](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding) を作成し、`ClusterRoleBinding` を介して `ClusterRole` を `ServiceAccount` に関連付ける必要があります。

Target Allocator の RBAC 設定の詳細については、[Target Allocator の readme](https://github.com/open-telemetry/opentelemetry-operator/tree/de81a64ae8d7d2f4f48945049d8ef9ad3509f89e/cmd/otel-allocator?from_branch=main#rbac) を参照してください。

> **NOTE:** これはバージョン `0.100.0` の一部として、近い将来完全に自動化される予定です（付随する [PR](https://github.com/open-telemetry/opentelemetry-operator/pull/2787) を参照）。

### Q8: Target Allocator のベースイメージをオーバーライドできますか {#q8-can-i-override-the-target-allocator-base-image}

`OpenTelemetryCollector` CR で Collector のベースイメージをオーバーライドできるのと同様に、Target Allocator のベースイメージもオーバーライドできます。

互換性の問題を避けるために、[Target Allocator と OTel Operator のバージョンを同じに保つのが通常最善です](https://cloud-native.slack.com/archives/C033BJ8BASU/p1709128862949249?thread_ts=1709081221.484429&cid=C033BJ8BASU)。
Target Allocator のベースイメージをオーバーライドする場合は、`OpenTelemetryCollector` CR に `spec.targetAllocator.image` を追加することで行えます。
`spec.targetAllocator.replicas` を追加してレプリカ数を指定することもできます。
これは、TA イメージをオーバーライドするかどうかとは完全に独立しています。

コードは次のようになります。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: mynamespace
spec:
  mode: statefulset
  targetAllocator:
    image: <ta_image_name>
    replicas: <number_of_replicas>
```

ここで、

- `<ta_image_name>` はコンテナリポジトリの有効な Target Allocator イメージです
- `<number_of_replicas>` は、基盤となる Target Allocator の Pod インスタンス数です

### Q9: Target Allocator のベースイメージのオーバーライドが推奨されていないなら、なぜオーバーライドしたいのですか {#q9-if-its-not-recommended-that-you-override-the-target-allocator-base-image-then-why-would-you-want-to}

1つのユースケースは、[セキュリティ上の理由で、Target Allocator のイメージのミラーを独自のプライベートコンテナレジストリにホストする必要がある場合](https://cloud-native.slack.com/archives/C033BJ8BASU/p1713894678225579)です。

プライベートレジストリから Target Allocator イメージを参照する必要がある場合は、`imagePullSecrets` を使用する必要があります。
詳細については、[手順](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#using-imagepullsecrets)を参照してください。
自分でサービスアカウントを作成しない場合は自動的に作成されるため、Target Allocator 用の `serviceAccount` を作成する必要はないことに注意してください（[Q7](#q7-do-i-need-to-create-a-service-account-to-use-the-target-allocator) を参照）。

詳細については、[Target Allocator API ドキュメント](https://github.com/open-telemetry/opentelemetry-operator/blob/20d055590028d991e2cd241cbf21723e5609d842/docs/api/targetallocators.md?from_branch=main)をご覧ください。

### Q10: OTel Operator の自動計装とサポート対象言語の自動計装との間にバージョンの遅延はありますか {#q10-is-there-a-version-lag-between-the-otel-operator-auto-instrumentation-and-auto-instrumentation-of-supported-languages}

遅延がある場合でも最小限です。
メンテナーはリリースサイクルごとにこれらを最新の状態に保つよう努めています。
一部のセマンティック規約に破壊的な変更があり、チームはユーザーのコードを壊さないようにしていることに留意してください。
詳細については、この [`#otel-operator` スレッド](https://cloud-native.slack.com/archives/C033BJ8BASU/p1713894678225579)を参照してください。

## まとめ {#final-thoughts}

この記事が OTel Operator の理解を少しでも深める助けになれば幸いです。
確かに多くのことが行われており、OTel Operator は最初は少し怖く感じるかもしれませんが、基本を理解すれば、この強力なツールを使いこなす道が開けるでしょう。

OTel Operator について質問がある場合は、[CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf) の [#otel-operator](https://cloud-native.slack.com/archives/C033BJ8BASU) チャンネルに質問を投稿することを強くお勧めします。
メンテナーやコントリビューターはとても親切で、いつも質問に喜んで答えてくれます！
[私に連絡](https://bento.me/adrianamvillela)していただければ、質問にお答えするか、回答を持っている方をご紹介するよう最善を尽くします！
