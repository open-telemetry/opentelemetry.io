---
title: GCP でサンプル設定を使った Collector Builder の利用
linkTitle: GCP での Collector Builder
date: 2022-10-17
author: >-
  [Mike Dame](https://github.com/damemi) (Google)
default_lang_commit: e5be8d8d487dcaa1e3962964536084b9438db5fd
# prettier-ignore
cSpell:ignore: batchprocessor configmap gomod loggingexporter otlpexporter otlpreceiver zipkinexporter
---

[OpenTelemetry Collector](/docs/collector/) はテレメトリーデータの処理とエクスポートに使える汎用的なツールです。
モジュラー設計のおかげで、多くの異なるソースからのインジェストと、同様に多くのオブザーバビリティバックエンドへのルーティングをサポートしています。
この設計は、個別のレシーバー、プロセッサー、エクスポーターに基づいており、サードパーティによる新しいバックエンドサポートの開発を可能にしています。
また、ユーザーがユースケースに合わせてカスタマイズしたテレメトリーパイプラインを設定することもできます。

[collector-builder ツール](https://github.com/open-telemetry/opentelemetry-collector/tree/d25efc7e2f31a3ba5347d0725a22d7bed1b4015d/cmd/builder?from_branch=main)は、そのカスタマイズ性をさらに一歩進め、特定のインジェストおよびエクスポートコンポーネントのみで構成された Collector バイナリを簡単にコンパイルする方法を提供します。
一般公開されているバイナリリリース（デフォルトで多数のコンポーネントがバンドルされている）とは対照的に、カスタム Collector は本当に必要なコンポーネントのみを含むようにスリム化できます。
これにより、コンパイルされた Collector は公開リリースよりも小さく、高速で、安全にできます。

Google Cloud は最近、GCP 上で独自のカスタム OpenTelemetry Collector をビルドしてデプロイするための[サンプル GitHub リポジトリ](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample)を公開しました。
これにより GCP 上での Collector の実行にあたっての推測作業がなくなりますが、ユースケースに合わせた拡張の自由度は維持されます。

このリポジトリは以下のことに役立ちます。

- [**collector-builder**](https://github.com/open-telemetry/opentelemetry-collector/tree/d25efc7e2f31a3ba5347d0725a22d7bed1b4015d/cmd/builder?from_branch=main) **を使って GCP 向けに設計されたカスタム Collector をコンパイルする。**
  アップストリームの collector-builder ツールを使えば、軽量な Collector ビルドが可能です。
  そのため、GCP サービスを念頭に置いた軽量な Collector をビルドするためのセットアップファイルを提供しています。
  これは GCP 上で実行する場合や GCP サービスと連携する場合に GCP が推奨するコンポーネントの基本セットです。
  OpenTelemetry は複雑で敷居が高いこともあるため、出発点として厳選しテストした設定を提供しています。

- **OpenTelemetry Collector の既存チュートリアルを GCP のユースケースに適用する。**
  Collector の利用に関する幅広い情報をまとめ、セットアップをいくつかの簡単なコマンドに抽象化することで、このリポジトリはカスタム Collector のセットアッププロセスをいくつかのシンプルな Make コマンドに削減します。

- **Collector のデプロイを最新の状態に保つ。**
  カスタム Collector を CI/CD パイプラインに組み込むことで、ビルドを自動化し、Collector が最新の機能とバグ修正に追従できるようにします。
  このリポジトリでは、Cloud Build を使ってそれを実現する方法のひとつを紹介します。

これらはそれぞれ、OpenTelemetry Collector の「はじめに」プロセスの一部です。
これらのステップを特定し統合することで、その体験を数クリックにまで簡略化し、容易にしたいと考えています。

## ニーズに合った OpenTelemetry Collector をビルドする {#build-an-opentelemetry-collector-that-suits-your-needs}

OpenTelemetry コミュニティが公開している [Collector の公開 Docker イメージ](https://hub.docker.com/r/otel/opentelemetry-collector-contrib/tags)はありますが、これらのイメージは 40MB もの大きさになることがあります。
これは、デフォルトでイメージにバンドルされている多数の[レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/944d4a82c408d58f9d8ba1a1d4783094301af0de/receiver?from_branch=main)、[プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/7c7beffbf95ce2d3ea7159cc4c48ecde8a73c82a/processor?from_branch=main)、[エクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/8d0362c4a63f6b4e6f106f007977b6d75e4bd272/exporter?from_branch=main)によるものです。
これらすべてのデフォルトコンポーネントがあることで、セキュリティ上の問題が発生する可能性もあり、これが [Collector のメンテナーが必要なコンポーネントのみを有効にすることを推奨している](https://github.com/open-telemetry/opentelemetry-collector/blob/5ab00fcf51bd74acbc3ac95946e38adb8cfa25e5/docs/security.md)理由の一つです。

[collector-builder ツール](https://github.com/open-telemetry/opentelemetry-collector/tree/d25efc7e2f31a3ba5347d0725a22d7bed1b4015d/cmd/builder?from_branch=main)は、シンプルな YAML 設定ファイルで軽量な Collector イメージのコンパイルを高速化します。
このファイルではビルドに含めるコンポーネントを宣言し、collector-builder はそれらのコンポーネントのみを含めます（それ以外は含みません）。
これは、デフォルトの Collector ビルドとは対照的で、デフォルトでは多くのコンポーネントがコンパイル済みバイナリに含まれます（Collector の実行時設定で有効にしていなくても）。
この違いこそが、余分なコンポーネントを多数含む公開イメージに対して改善を達成する方法です。
余分な依存関係がイメージの重量とセキュリティの負担を増やしますが、カスタムビルドではそれらの余分なコンポーネントは存在すらしないため、容量を占有しません。

この仕組みを示すために、このリポジトリには GCP に最も関連性の高い OpenTelemetry コンポーネントがあらかじめ設定されたサンプル設定ファイルが用意されています。
ただし、ユースケースに合わせてそのサンプルファイルを変更することをおすすめします。

たとえば、以下のビルドファイルには OTLP レシーバーとエクスポーター、そして logging エクスポーターのみが含まれています。

```yaml
receivers:
  - import: go.opentelemetry.io/collector/receiver/otlpreceiver
    gomod: go.opentelemetry.io/collector v0.57.2

exporters:
  - import: go.opentelemetry.io/collector/exporter/otlpexporter
    gomod: go.opentelemetry.io/collector v0.57.2
  - import: go.opentelemetry.io/collector/exporter/loggingexporter
    gomod: go.opentelemetry.io/collector v0.57.2
```

リポジトリの[このファイル](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/blob/3bd48267a6d0e4a84da913a0b15434bc59f95426/build/local/builder-config.yaml?from_branch=main)を編集し、`make build` を実行するとローカルバイナリが自動的に生成されます。
また、`make docker-build` を実行するとコンテナイメージがコンパイルされます。

## GKE ですぐに稼働させる {#get-up-and-running-quickly-on-gke}

便利なことに、このリポジトリには GKE クラスターで Collector をデプロイするために必要な最小限の Kubernetes マニフェストと、デフォルトでビルドされるサンプル collector-builder コンポーネントに対応した[ランタイム設定](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/blob/3bd48267a6d0e4a84da913a0b15434bc59f95426/deploy/gke/simple/otel-config.yaml?from_branch=main)が含まれています。
これらを併用すると、イメージのビルドと Artifact Registry へのプッシュに使われる Make コマンドが、新しく作成されたイメージを使用するようにリポジトリ内のマニフェストを自動的に更新し、エンドツーエンドのビルドとデプロイのリファレンスを提供します。

### GKE での Collector のデプロイ {#deploying-the-collector-in-gke}

この記事の冒頭で述べたように、Collector はログ、メトリクス、トレーシングのテレメトリーデータに対して、ベンダー非依存のルーティングと処理を提供します。
たとえば、GKE 上で（メトリクスやログ用の）収集エージェントをすでに使用している場合でも、Collector はトレースをエクスポートするための経路を提供できます。
それらのトレースは任意のオブザーバビリティバックエンドに送信できます。
その後、他のテレメトリーシグナルを処理し、任意のバックエンドにエクスポートする柔軟性が生まれます。

[提供されている Kubernetes マニフェスト](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/blob/11493d29e986695710ac265d08f4d6b59f503494/deploy/gke/simple/manifest.yaml?from_branch=main)を使えば、Collector のデプロイに必要な `kubectl` コマンドは 1 つだけです。

```shell
kubectl apply -f k8s/manifest.yaml -n otel-collector
```

この記事の前半で示したビルドファイルから生成された Collector を使用した場合、対応する [OpenTelemetry Collector 設定](/docs/collector/configuration/)は以下のようになります。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  otlp:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp]
```

GKE 内の Collector は、Collector Pod にマウントされた Kubernetes ConfigMap を通じてこの設定ファイルを読み込みます。
この ConfigMap は基本的な `kubectl` コマンドで作成されます。

```shell
kubectl create configmap otel-config --from-file=./otel-config.yaml -n otel-collector
```

### Collector 設定の変更 {#modifying-the-collector-config}

OpenTelemetry の設定ファイル形式は、最小限の中断で Collector 設定をホットスワップしてテレメトリーデータのルーティングを変更できます。
たとえば、Collector のデバッグに関する情報を提供する `logging` エクスポーターを一時的に有効にすると便利かもしれません。
これは上記のローカル設定ファイルを編集して 2 行追加するだけで実現できます。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  otlp:
  logging:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp, logging]
```

ランタイム設定は `kubectl apply` で再適用できます。

```shell
kubectl create configmap otel-config --from-file=./otel-config.yaml --dry-run=client -n otel-collector -o yaml | kubectl apply -f -
```

Collector Pod を再起動すると（`kubectl delete` や、以下に示す新しいマニフェストの適用など）、新しい設定変更が反映されます。
このワークフローは任意の OpenTelemetry エクスポーターの有効化や無効化に使用でき、[多くの一般的なオブザーバビリティバックエンド](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/8d0362c4a63f6b4e6f106f007977b6d75e4bd272/exporter?from_branch=main)向けのエクスポーターが利用可能です。

### レシーバーとプロセッサーの追加 {#adding-a-receiver-and-processor}

さらにコンポーネントを追加し、上記と同じプロセスに従って新しい Collector イメージをビルドおよびデプロイできます。
たとえば、[Zipkin エクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/exporter/zipkinexporter?from_branch=main)（トレースを [Zipkin](https://zipkin.io/) バックエンドサービスに送信するため）と[バッチプロセッサー](https://github.com/open-telemetry/opentelemetry-collector/tree/811b5147d3ae2da9610f85265305dd46c79de179/processor/batchprocessor?from_branch=main)を有効にするには、前述のビルダー設定を以下のように編集します。

```yaml
receivers:
  - import: go.opentelemetry.io/collector/receiver/otlpreceiver
    gomod: go.opentelemetry.io/collector v0.57.2

processors:
  - import: go.opentelemetry.io/collector/processor/batchprocessor
    gomod: go.opentelemetry.io/collector v0.57.2

exporters:
  - import: go.opentelemetry.io/collector/exporter/otlpexporter
    gomod: go.opentelemetry.io/collector v0.57.2
  - import: go.opentelemetry.io/collector/exporter/loggingexporter
    gomod: go.opentelemetry.io/collector v0.57.2
  - import: github.com/open-telemetry/opentelemetry-collector-contrib/exporter/zipkinexporter
    gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/exporter/zipkinexporter
      v0.57.2
```

`make docker-build` を実行すると、新しいバージョンの Collector イメージがコンパイルされます。
Collector イメージをホスティングするための Artifact Registry が設定されている場合は、環境変数を設定して `make docker-push` を実行することで GKE クラスターでイメージを利用可能にできます（このセットアップ手順は [README](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/tree/3bd48267a6d0e4a84da913a0b15434bc59f95426/build/cloudbuild?from_branch=main#building-with-cloud-build) に記載されています）。

新しいレシーバーとプロセッサーの有効化も上記と同じ手順に従います。
まず、ローカルの Collector 設定を編集します。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
processors:
  batch:
    send_batch_max_size: 200
    send_batch_size: 200
exporters:
  otlp:
  logging:
  zipkin:
    endpoint: http://my-zipkin-service:9411/api/v2/spans
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp, logging, zipkin]
```

前述と同じ `kubectl apply` コマンドを実行してクラスター内の設定を更新します。

```shell
kubectl create configmap otel-config --from-file=./otel-config.yaml --dry-run=client -n otel-collector -o yaml | kubectl apply -f -
```

新しいイメージで Collector Pod が再起動すると、新しいエクスポーターとプロセッサーの使用が開始されます。
`make docker-build` を実行した際に、リポジトリ内の Kubernetes デプロイメントマニフェストは新しい Collector イメージを指すように自動的に更新されています。
そのため、既に実行中の Collector を新しいイメージで更新するには、再度 `kubectl apply` を実行するだけです。

```shell
kubectl apply -f manifest.yaml -n otel-collector
```

これにより Collector デプロイメントの新しいロールアウトがトリガーされ、設定変更と、更新されたイメージにコンパイルされた新しいコンポーネントが反映されます。

## 安全で最新のイメージのためのビルド自動化 {#automate-builds-for-secure-up-to-date-images}

独自の Collector をビルドすることで、Collector イメージの更新とロールアウトを制御できます。
このリポジトリでは、GCP 上で Collector ビルドを自分で管理する方法のサンプルをいくつか用意しています。

[Cloud Build](https://cloud.google.com/build) の設定を使えば、Collector のサーバーレスかつ自動化されたビルドが可能です。
これにより、Collector コンポーネントの新しいリリース、機能、バグ修正を最小限の遅延で取り込めます。
[Artifact Registry](https://cloud.google.com/artifact-registry) と組み合わせることで、これらのビルドを GCP プロジェクト内の Docker イメージとしてプッシュできます。
これによりイメージの移植性とアクセス性が提供されるとともに、Artifact Registry でのコンテナ脆弱性スキャンにより Collector デプロイメントのサプライチェーンの安全性が確保されます。

サーバーレスビルドと脆弱性スキャンは、信頼性の高い CI/CD パイプラインの重要な要素です。
ここでは、このリポジトリにサンプル設定を同梱することで、これらのプロセスに関する複雑さの一部を抽象化したいと考えています。
GCP でのセットアップに向けたサンプル手順をいくつか提供していますが、同様のアプローチは他の多くのベンダーでも可能です。

## まとめ {#wrapping-up}

OpenTelemetry Collector はテレメトリーデータのインジェストとエクスポートを容易にします。
これは OpenTelemetry のベンダー非依存のデータモデルのおかげですが、さまざまなバックエンド向けのカスタムコンポーネントをサポートするコントリビューターの活発なコミュニティのおかげでもあります。
これらのコンポーネントが、幅広いユースケースをサポートするための柔軟性を OpenTelemetry に提供しています。

このサンプルや、ここで紹介したユースケースの例が、OpenTelemetry を使い始める際に感じる摩擦を解消する助けになれば幸いです。
フィードバックがあれば、[GitHub でイシューを作成](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/issues)して機能リクエストやイシューを報告してください。
