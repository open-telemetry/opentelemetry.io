---
title: 'Skyscanner が実践する OpenTelemetry のスケーリング: 24 の本番クラスターにまたがる Collector の管理'
linkTitle: Skyscanner が実践する OpenTelemetry のスケーリング
date: 2026-04-21
author: >-
  [Johanna Öjeling](https://github.com/johannaojeling) (Grafana Labs), [Juliano
  Costa](https://github.com/julianocosta89) (Datadog), [Tristan
  Sloughter](https://github.com/tsloughter) (community), [Neil
  Fordyce](https://github.com/neilfordyce) (Skyscanner)
sig: Developer Experience SIG
default_lang_commit: 763b47b07a21aeda64a77446317478f603491f0f
# prettier-ignore
cSpell:ignore: devex Fordyce kube kubelet rollouts Skyscanner Sloughter Öjeling
---

Developer Experience SIG は、さまざまな業界や規模の企業における実際の OpenTelemetry デプロイメントを紹介するブログ記事シリーズを公開しています。
この記事では、スコットランドのエジンバラに拠点を置くグローバルな旅行検索プラットフォーム [Skyscanner](https://www.skyscanner.net/) を取り上げます。

全世界で 1,400 人の従業員を擁し、24 の本番 Kubernetes クラスターで 1,000 以上のマイクロサービスを運用している Skyscanner の OpenTelemetry 導入事例は、大規模な組織にとって貴重な教訓を提供します。

## 組織構造 {#organizational-structure}

6 名のプラットフォームエンジニアで構成される Hubble チームが、Skyscanner の Collector の大部分を管理しています。
より大きなプラットフォームエンジニアリング組織の一部として、主に Java ベースのマイクロサービスアーキテクチャを実行するコンピューティングプラットフォームを担当しています。

サービスチーム自体は、デプロイメントやテレメトリー収集のインフラストラクチャから抽象化されています。
Java サービスの場合、チームは事前設定された OpenTelemetry Java エージェントを含むベース Docker イメージを継承します。
Python および Node.js サービスの場合、プラットフォームチームが環境やリソース属性に基づいた適切なデフォルト値を設定するラッパーライブラリを提供しています。
これらのアプローチにより、ボイラープレートのセットアップが最小化され、サービスチームは OpenTelemetry の深い知識を必要とせずに、すぐにオブザーバビリティを利用できます。

## OpenTelemetry の導入 {#opentelemetry-adoption}

Skyscanner の OpenTelemetry 導入は 2021 年に始まりました。
当時、同社は社内で構築したオープンソーススタックから商用ベンダーへの移行を進めていましたが、ベンダーロックインを避けたいと考えていました。

> 「ベンダーに依存しない方法でベンダーに移行したかったのです」と、Skyscanner の Hubble プラットフォームチームのソフトウェアエンジニアである [Neil Fordyce](https://github.com/neilfordyce) は説明しました。

このベンダーに依存しないアプローチにより、テレメトリーインフラストラクチャの中核として OpenTelemetry Collector を採用することになりました。

## アーキテクチャ: 集中ルーティング、分散収集 {#architecture-centralized-routing-distributed-collection}

Skyscanner の Collector アーキテクチャは、Istio ベースのインテリジェントルーティングを備えた中央 DNS エンドポイントを特徴としています。
サービスがグローバルのどこで実行されていても、どのクラスターにあっても、テレメトリーはこの単一のアドレスに送信されます。
Istio がリクエストを最も近い利用可能な Collector にルーティングします。

デプロイメントは 2 つの異なる Collector パターンで構成されています。

**Gateway Collector（Replica Set）**: 大部分の OTLP トラフィック（トレースとメトリクス）を処理し、処理の大半がここで行われます。

**Agent Collector（DaemonSet）**: まだネイティブに OTLP をサポートしていないオープンソースやプラットフォームサービスから Prometheus エンドポイントをスクレイピングします。

![Skyscanner アーキテクチャ図](skyscanner-architecture.png)

## 設定: シンプルに始めて段階的に進化 {#configuration-start-simple-evolve-gradually}

2021 年に Skyscanner が初めて Collector をデプロイしたとき、設定はごくシンプルなものでした。
メモリリミッター、バッチプロセッサー、そしてトレース用の OTLP エクスポーターだけでした。

時間とともに設定は有機的に進化しました。
メトリクスパイプラインの追加、Istio スパンの取り込みの統合、スパンからメトリクスへの変換の実装、そしてノイズ削減とコスト管理のためのフィルタープロセッサーの追加が行われました。

### Istio サービスメッシュのスパンをプラットフォームメトリクスに変換 {#turning-istio-service-mesh-spans-into-platform-metrics}

Skyscanner の Collector の最も革新的な活用法の 1 つは、Istio サービスメッシュのスパンからメトリクスを生成することです。

Istio のネイティブメトリクスは、Prometheus デプロイメントを圧倒するカーディナリティの爆発的増加の問題を抱えていました。
さらに、Skyscanner はコードを所有していない多くの既製サービスを運用しており、それでも一貫したメトリクスが必要でした。

彼らの解決策は次のとおりです。
Istio がスパンを出力するように設定し（元々は Zipkin フォーマットでしたが、現在 Istio は OTLP をサポートしています）、Zipkin レシーバーを使って Collector に取り込み、セマンティック規約に合うように変換し、[span metrics connector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/e8a502371ea1d2c3534235d623c1b1eb3b6b4b58/connector/spanmetricsconnector?from_branch=main) を使用して、アプリケーション計装なしで一貫したメトリクスを生成します。

> 「アプリケーションオーナーがコードに計装を追加する必要なく、プラットフォームレベルでそれを実現できるのです」と Neil は述べました。

span metrics connector の設定は、スパンから主要なディメンションを抽出します。

```yaml
connectors:
  spanmetrics:
    aggregation_temporality: AGGREGATION_TEMPORALITY_DELTA
    dimensions:
      - name: http.status_code
      - name: grpc.status_code
      - name: rpc.service
      - name: rpc.method
      - name: prot
      - name: flag
      - name: k8s.deployment.name
      - name: k8s.replicaset.name
      - name: destination_subset
    dimensions_cache_size: 15000000
    histogram:
      exponential:
        max_size: 160
      unit: ms
    metrics_flush_interval: 30s
```

Collector はこれらのメトリクスを `http.client.duration` や `http.server.duration` などのセマンティック規約名に変換し、クラスター、サービス名、HTTP ステータスコードごとに集約します。
これにより、コード変更なしですべてのサービスにプラットフォームレベルの HTTP メトリクスが提供され、セマンティック規約に準拠した一貫した命名規則が実現し、ネイティブの Istio メトリクスよりも低いカーディナリティが得られます。

### 404 エラーの課題 {#the-404-error-challenge}

Collector の設定に関する注目すべき課題の 1 つは、キャッシュサービスがキャッシュにエントリが存在しないことを示すために HTTP 404 を返すケースでした。
Collector はこれらの 404 をエラーとして扱い、実際には正常で大量に発生する動作に対して 100% のトレースサンプリングをトリガーしていました。

解決策は、これらの特定の 404 レスポンスのエラーステータスを解除するフィルタープロセッサーを追加することでした。

```yaml
processors:
  span/unset_cache_client_404:
    include:
      attributes:
        - key: http.response.status_code
          value: ^404$
        - key: server.address
          value: ^(service-x\.skyscanner\.net|service-y\.skyscanner\.net|service-z\.skyscanner\.net|service-z-\w{2}-\w+-\d\.int\.\w{2}-\w+-\d\.skyscanner\.com)$
      match_type: regexp
      regexp:
        cacheenabled: true
        cachemaxnumentries: 1000
    status:
      code: Unset
```

このプロセッサーは、特定のキャッシュサービスからの 404 ステータスコードを持つスパンにマッチし、エラーステータスを解除することで、エラーベースのサンプリングがトリガーされるのを防ぎます。

> 「最初からフィルタープロセッサーがあれば、より高品質で使いやすいトレースが得られたでしょう」と Neil は振り返りました。

ただし、Neil は最近導入された OpenTelemetry SDK の[宣言的設定](/docs/languages/sdk-configuration/declarative-configuration/)により、このようなフィルタリングは中央の Collector 設定を変更するのではなく、サービスチーム自身が分散的に設定できるようになったと指摘しています。

### 設定の詳細 {#configuration-deep-dive}

Skyscanner は、これらのパターンを実践的に理解してもらうために、本番の Collector 設定を共有しています。

#### Gateway Collector {#gateway-collector}

[Gateway Collector][gateway-otelbin] は処理の大部分を担当します。

- サービスからの OTLP メトリクスとトレース、および Istio からの Zipkin スパンを受信
- span metrics connector を使用して Istio スパンからメトリクスを生成
- 広範な transform プロセッサーを使用して Istio 属性をセマンティック規約にマッピング
- キャッシュサービスに対する 404 フィルタリングロジックを実装
- メトリクスとトレースを OTLP 経由でオブザーバビリティベンダーにエクスポート

この図は、OTLP メトリクスとトレース、および Istio スパンがこれらの Gateway Collector にどのように到達するかを示しています。

![Skyscanner アーキテクチャ（Gateway Collector）図](skyscanner-architecture-gateway.png)

#### Agent Collector {#agent-collector}

[Agent Collector][agent-otelbin] は、各ノードからインフラストラクチャおよびプラットフォームレベルのメトリクスを収集することに特化しています。

- さまざまなソース（node exporter、kube-state-metrics、kubelet）から Prometheus エンドポイントをスクレイピング
- 最小限の処理を実行（メモリ制限、バッチ処理、属性のクリーンアップ）
- メトリクスを OTLP 経由でオブザーバビリティベンダーにエクスポート

## 計装戦略 {#instrumentation-strategy}

Skyscanner の Java 中心の環境は、OpenTelemetry の自動計装機能から大きな恩恵を受けています。
ベース Docker イメージに事前設定された Java エージェントが、HTTP および gRPC スパンの生成をすぐに利用できる形で提供します。

### 自動計装に対する明確な方針 {#opinionated-auto-instrumentation}

チームは自動計装に対して意図的に明確な方針を持ったアプローチを取っています。
デフォルトですべてを有効にするのではなく、逆のアプローチを取ります。
共有ベース Docker イメージですべての計装を無効にし、厳選されたセットのみを明示的に有効にします。

> 「逆のアプローチなんです。すべてを無効にしてから、必要なものだけを有効にします」と Neil は説明しました。

ベースイメージの環境変数を使用して、Skyscanner はランタイム、HTTP、gRPC 関連の計装のうち、厳選されたセットをデフォルトで有効にしています。
これには、JAX-RS、gRPC、Jetty、一般的な HTTP クライアント、エグゼキューター計装、およびロギングコンテキスト伝搬が含まれます。
サービスチームはこれらのデフォルトを自動的に継承しますが、必要に応じて独自のサービス定義でオーバーライドしたり、追加の計装を有効にしたりすることもできます。

このモデルにより、数百のサービス間で一貫性が確保されると同時に、エッジでの柔軟性も維持されます。

### Java エージェントの設定 {#setting-up-the-java-agent}

以下のスニペットは、共有 Java ベースイメージの例です。
OpenTelemetry Java エージェントをイメージにバンドルし、組織全体のデフォルトを設定し、共通のランチャースクリプトをインストールします。

```Dockerfile base image
# OpenTelemetry Java エージェントのソースとして使用するイメージ
FROM ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:2.25.0 AS otel

# すべての Java マイクロサービスが拡張する共通ベースイメージを定義
FROM image/registry/public-java-image:x.y.z

# OTel イメージから OpenTelemetry Java エージェントをコピー
COPY --from=otel /javaagent.jar $OPEN_TELEMETRY_DIRECTORY/opentelemetry-javaagent.jar
ENV OTEL_AGENT=$OPEN_TELEMETRY_DIRECTORY/opentelemetry-javaagent.jar

# 組織全体で適切なデフォルトを設定
ENV OTEL_METRICS_EXPORTER="otlp"
ENV OTEL_TRACES_EXPORTER="otlp"
ENV OTEL_LOGS_EXPORTER="none"
ENV OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE="DELTA"
ENV OTEL_EXPERIMENTAL_METRICS_VIEW_CONFIG="otel-view.yaml"
ENV OTEL_EXPORTER_OTLP_ENDPOINT="http://otel.skyscanner.net"
ENV OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED="false"
ENV OTEL_INSTRUMENTATION_RUNTIME_TELEMETRY_ENABLED="true"
ENV OTEL_INSTRUMENTATION_ASYNC_HTTP_CLIENT_ENABLED="true"
ENV OTEL_INSTRUMENTATION_APACHE_HTTPCLIENT_ENABLED="true"

COPY run.sh /usr/bin/run.sh
```

そのランチャースクリプト `run.sh` は、デプロイメントが提供する環境変数から `-javaagent` フラグと `otel.resource.attributes` を構築します。

```bash run.sh
# これは OTel のリソース属性をセットアップするために使用します
# サービスの起動時に環境変数から検出できるものを設定します
# これらの変数はデプロイメントシステムによって自動的に設定されます
# 繰り返しを避けるため、一部の環境変数は省略しています
setup_otel_agent() {
   if [[ -n "$AWS_REGION" ]]; then CLOUD_REGION="cloud.region=${AWS_REGION},"; else CLOUD_REGION=""; fi
   if [[ -n "$AWS_ACCOUNT" ]]; then CLOUD_ACCOUNT_ID="cloud.account.id=${AWS_ACCOUNT},"; else CLOUD_ACCOUNT_ID=""; fi
   if [[ -n "$CLUSTER_NAME" ]]; then K8S_CLUSTER_NAME="k8s.cluster.name=${CLUSTER_NAME},"; else K8S_CLUSTER_NAME=""; fi
   if [[ -n "$SERVICE" ]]; then SERVICE_NAME="service.name=${SERVICE}"; else SERVICE_NAME=""; fi
   echo -n "-javaagent:$OTEL_AGENT" \
       "-Dotel.resource.attributes=${CLOUD_REGION}${CLOUD_ACCOUNT_ID}${K8S_CLUSTER_NAME}${SERVICE_NAME}"
}

JAVA_OPTS="-D64 -server -showversion $(setup_otel_agent) ${ADDITIONAL_JAVA_OPTS:-}"

exec java $JAVA_OPTS "$@"
```

最後に、個別のサービス Dockerfile は同じベースを拡張し、そのサービスが必要とする追加の計装のみを追加します。

```Dockerfile my-service
FROM image/registry/skyscanner-java-base:x.y.z

COPY my-service.jar

# my-service がデフォルト以外の計装を有効にしたい場合に簡単に拡張できます
ENV OTEL_INSTRUMENTATION_OPENAI_ENABLED=true
ENV OTEL_INSTRUMENTATION_OKHTTP_ENABLED=true

CMD exec /usr/bin/run.sh -jar my-service.jar server
```

### スパンは有効、メトリクスは無効（デフォルト） {#spans-yes-metrics-no-by-default}

Skyscanner の戦略で特に興味深いのは、メトリクスとトレースの扱い方です。
HTTP および gRPC の計装は有効になっていますが、チームは SDK が生成する HTTP および RPC メトリクスの大部分を意図的に破棄しています。
これは、前述のとおり、Istio サービスメッシュのスパンからすでに一貫した低カーディナリティのプラットフォームメトリクスを生成しているためです。

計装を完全に無効にすると（スパンも削除されてしまうため）、かわりに OpenTelemetry SDK のビューを使用してメトリクスの集約を破棄しつつ、トレーシングは維持しています。

- HTTP および RPC メトリクスはグローバルに破棄
- スパンは通常どおり出力を継続
- サービスチームは、Istio が提供するものを超えた追加の粒度が必要な場合、特定のメトリクス（たとえばサーバーサイドのレイテンシ）を選択的に再有効化できる

チームが SDK メトリクスを再有効化する場合、既存の Istio 由来のメトリクスとの衝突や二重カウントを避けるために、メトリクス名を変更することがよくあります。

先に示した [Java ベースイメージ](#setting-up-the-java-agent)では、`OTEL_EXPERIMENTAL_METRICS_VIEW_CONFIG` が Skyscanner のデフォルトの `otel-view.yaml` を指しており、[view file configuration](https://github.com/open-telemetry/opentelemetry-java/blob/65f7412a986cb474314b093c1bbba77955b52031/sdk-extensions/incubator/README.md#view-file-configuration) を使用しています。

```yaml
# Skyscanner のデフォルトのメトリクスビュー設定
# OTEL_EXPERIMENTAL_METRICS_VIEW_CONFIG が指すファイルに保存
# Istio からのメトリクスがすでにあるため、http と rpc のメトリクスを破棄
# 計装を無効にするのではなく、トレーシングは引き続き動作させたい
- selector:
    instrument_name: http.*
  view:
    aggregation: drop
- selector:
    instrument_name: rpc.*
  view:
    aggregation: drop
```

サービスが特定のメトリクスを保持する必要がある場合、同じファイルを拡張できます。
一般的なユースケースは、`http.route` ごとにリクエストを分類することです。

```yaml
# この破棄動作は、リストにさらにビューを追加して
# 明示的に保持するメトリクスを選択することで変更できます。
# たとえば、http.server.request.duration メトリクスを保持しつつ、
# http.client.* メトリクスは引き続き破棄する場合
- selector:
    instrument_name: http.server.request.duration
  view:
    # Istio メトリクスに http.server.request.duration という名前がすでにあるため、
    # 衝突や二重カウントを避けるためにリネーム
    name: app.http.server.request.duration
    attribute_keys:
      - http.request.method
      - http.route
      - http.response.status_code
```

このアプローチにより、Skyscanner は価値の高い分散トレースを維持し、メトリクスの重複を回避し、カーディナリティを制御し、取り込みコストを削減できます。これらすべてが、サービスオーナーが OpenTelemetry の内部を深く理解する必要なく実現されています。

全体として、この戦略は強力なプラットフォームの考え方を反映しています。
大規模に機能する適切なデフォルトを提供し、ノイズを最小限に抑え、「正しいこと」を簡単に行えるようにしながらも、高度なニーズを持つチームがさらに先に進む余地を残しています。

## デプロイメントとリリース管理 {#deployment-and-release-management}

Skyscanner は、必要なものがすべて含まれていたため、OpenTelemetry Collector Contrib ディストリビューションを採用しました。
チームはインタビュー中に Contrib が本番環境での使用は推奨されていないことを知り、必要なコンポーネントのみを含むカスタム Collector イメージの構築を検討する予定です。

Skyscanner は約 6 か月ごとに Collector を更新しますが、特定の機能や重要な修正を追跡している場合は、より頻繁にアップグレードします。
RSS フィードや CNCF Slack チャンネルをフォローしてリリース情報を把握しています。

ロールアウト戦略では、クラスターティア間での段階的プロモーションを採用しています。
Dev クラスター、次に 3 つの Alpha 本番クラスター、続いて 8 つの Beta 本番クラスター、最後に残りの 13 本番クラスターの順です。
Argo CD を使用してデプロイし、ティア間の変更はプルリクエストを通じてプロモートされます。

> 「開発テストクラスターで問題を起こしてから、先に進む前に修正したことは間違いなくあります」と Neil は言いました。

この段階的なアプローチにより、本番環境に到達する前に設定の問題を検出できています。
OpenTelemetry Collector デプロイメントの自動テストやロールバック機能はまだありませんが、これらの改善は将来の計画に含まれています。

## うまくいっていること {#what-works-well}

本番環境で OpenTelemetry を導入して以来、チームの体験は非常にポジティブなものでした。

> 「正直なところ、かなり問題なく進んでいます」と Neil は振り返りました。

柔軟性が Collector の最大の強みとして際立っています。

> 「実現しようとしたことはすべて実際に提供できました。それがいかに柔軟であるかを物語っていると思います」と Neil は説明しました。

その他のハイライトとしては、OTLP プロトコルがシンプルな設定によるベンダー独立性を提供していること、明確でよく整理されたリリースノート、そしてチームメンバーが Collector コンポーネントのメモリリークを発見して修正をコントリビュートした際のコミュニティの対応力が挙げられます。

## 教訓とペインポイント {#lessons-and-pain-points}

Skyscanner は一部のパイプラインで古い不安定な HTTP セマンティック規約をまだ使用しています。
アップグレードには、Istio 属性をセマンティック規約名にマッピングする複数の transform プロセッサールールの更新が必要であり、ドキュメントを手動で照合して設定文字列を入力する作業が伴います。

チームはセマンティック規約管理のための [Weaver](https://github.com/open-telemetry/weaver) を認識していますが、まだワークフローに統合していません。

6 か月ごとにアップグレードするということは、一度に複数の破壊的変更に遭遇することを意味します。
リリースノートはよく書かれており変更内容が明確に文書化されていますが、6 か月分の更新を一度にレビューするのは、リリースペースに追従する場合と比べて摩擦が増えます。

## 他の方へのアドバイス {#advice-for-others}

本番環境での経験に基づき、Skyscanner チームは次のアドバイスを提供しています。

- **シンプルに始める**: メモリリミッター、バッチプロセッサー、基本的なエクスポーターだけから始めましょう。
  必要に応じて複雑さを追加してください。
- **初日からメモリリミッターを設定**: スケーリングに伴うメモリの問題を防ぐために、すぐに設定しましょう。
- **フィルタープロセッサーを早期に検討**: アプリケーションのステータスコードのセマンティクスを理解し、大量の「偽陽性」をフィルタリングしてコストを管理しましょう。
- **レジリエンスを過度に設計しない**: テレメトリーデータの場合、シンプルなインメモリバッチ処理で十分なことが多いです。
- **段階的なロールアウトで問題を検出**: 環境ティア間での段階的プロモーションは、貴重なバリデーションを提供します。

## 今後の展望 {#whats-next}

この事例は、控えめな規模のプラットフォームエンジニアリングチームが、比較的低い運用オーバーヘッドで大規模な OpenTelemetry Collector インフラストラクチャを成功裏に管理できることを示しています。

このシリーズの続編もお楽しみに。さまざまな規模の組織が、それぞれ独自の課題と創造的なソリューションを持ちながら、本番環境で OpenTelemetry Collector をどのように活用しているかを引き続き紹介していきます。

独自の OpenTelemetry Collector ストーリーをお持ちですか。
CNCF の [#otel-devex](https://cloud-native.slack.com/archives/C01S42U83B2) Slack チャンネルにご参加ください。
本番環境での OpenTelemetry の活用方法や、開発者体験の改善に向けたご意見をぜひお聞かせください。

[gateway-otelbin]: https://www.otelbin.io/#config=connectors%3A*N__spanmetrics%3A*N____aggregation*_temporality%3A_AGGREGATION*_TEMPORALITY*_DELTA*N____dimensions%3A*N____-_name%3A_http.status*_code*N____-_name%3A_grpc.status*_code*N____-_name%3A_rpc.service*N____-_name%3A_rpc.method*N____-_name%3A_prot*N____-_name%3A_flag*N____-_name%3A_k8s.deployment.name*N____-_name%3A_k8s.replicaset.name*N____-_name%3A_destination*_subset*N____dimensions*_cache*_size%3A_15000000*N____histogram%3A*N______exponential%3A*N________max*_size%3A_160*N______unit%3A_ms*N____metrics*_flush*_interval%3A_30s*Nexporters%3A*N__debug%3A*N____verbosity%3A_normal*N__debug%2Fbasic%3A*N____verbosity%3A_basic*N__debug%2Fdetailed%3A*N____verbosity%3A_detailed*N__otlphttp%3A*N____endpoint%3A_https%3A%2F%2Fotlp-trace-sampler.vendor.com*N__otlphttp%2Fmetrics%3A*N____endpoint%3A_https%3A%2F%2Fotlp.vendor.com*N__otlphttp%2Fspanmetrics%3A*N____endpoint%3A_https%3A%2F%2Fotlp.vendor.com*Nextensions%3A*N__health*_check%3A*N____endpoint%3A_*S%7Benv%3AMY*_POD*_IP%7D%3A13133*N__pprof%3A*N____endpoint%3A_%3A1888*Nprocessors%3A*N__attributes%2Fspanmetrics-prep%3A*N____actions%3A*N____-_action%3A_extract*N______key%3A_response*_flags*N______pattern%3A_*C*QP*Lflag*G.***D*N____-_action%3A_extract*N______key%3A_dest*N______pattern%3A_%5E*C*QP*Lip*G*C*QP*Lip*_8*G*Bd*P*D*B.*C*QP*Lip*_16*G*Bd*P*D*B.*Bd*P*B.*Bd*P*D*S*N____-_action%3A_extract*N______key%3A_grpc.path*N______pattern%3A_%5E*B%2F*C*QP*Lrpc*_service*G%5B%5E*B%2F%5D*P*D*B%2F*C*QP*Lrpc*_method*G%5B%5E*B%2F%5D*P*D*S*N____-_action%3A_upsert*N______from*_attribute%3A_rpc*_service*N______key%3A_rpc.service*N____-_action%3A_delete*N______key%3A_rpc*_service*N____-_action%3A_upsert*N______from*_attribute%3A_rpc*_method*N______key%3A_rpc.method*N____-_action%3A_delete*N______key%3A_rpc*_method*N____-_action%3A_extract*N______key%3A_upstream*_cluster*N______pattern%3A_%5Eoutbound*B%7C*Bd*P*B%7C*C*QP*Ldestination*_subset*G%5B%5E%7C%5D***D*B%7C.***S*N__attributes%2Fspanmetrics-split-service-name%3A*N____actions%3A*N____-_action%3A_extract*N______key%3A_service.name*N______pattern%3A_%5E*C*QP*Lsvc*G%5B%5E*B.%5D*P*D*C*QP*Lns*_suffix*G*B.*C*QP*Lns*G%5B%5E*B.%5D*P*D*D*Q*S*N__batch%3A*N____send*_batch*_max*_size%3A_500*N____send*_batch*_size%3A_500*N__batch%2Fspanmetrics-export%3A*N____send*_batch*_max*_size%3A_512*N____send*_batch*_size%3A_512*N__batch%2Fspanmetrics-prep%3A_%7B%7D*N__filter%2Fspanmetrics%3A*N____metrics%3A*N______include%3A*N________match*_type%3A_strict*N________metric*_names%3A*N________-_traces.span.metrics.duration*N__filter%2Fspanmetrics-duration%3A*N____metrics%3A*N______include%3A*N________match*_type%3A_regexp*N________metric*_names%3A*N________-_*Crpc%7Chttp*D*B.*Cclient%7Cserver*D*B.duration*N__filter%2Fspanmetrics-prep%3A*N____spans%3A*N______include%3A*N________attributes%3A*N________-_key%3A_component*N__________value%3A_proxy*N________match*_type%3A_strict*N__groupbyattrs%2Fgroup-by-ip%3A*N____keys%3A*N____-_net.host.ip*N__k8sattributes%2Ffrom-pod-ip%3A*N____auth*_type%3A_serviceAccount*N____extract%3A*N______metadata%3A*N______-_k8s.deployment.name*N______-_k8s.replicaset.name*N____passthrough%3A_false*N____pod*_association%3A*N____-_sources%3A*N______-_from%3A_resource*_attribute*N________name%3A_k8s.pod.ip*N__memory*_limiter%3A*N____check*_interval%3A_1s*N____limit*_percentage%3A_100*N____spike*_limit*_percentage%3A_1*N__memory*_limiter%2Fmetrics%3A*N____check*_interval%3A_1s*N____limit*_percentage%3A_85*N____spike*_limit*_percentage%3A_10*N__memory*_limiter%2Fspanmetrics%3A*N____check*_interval%3A_1s*N____limit*_percentage%3A_75*N____spike*_limit*_percentage%3A_1*N__metricstransform%2Fspanmetrics-semantic-naming%3A*N____transforms%3A*N____-_action%3A_insert*N______experimental*_match*_labels%3A*N________prot%3A_http*N________span.kind%3A_SPAN*_KIND*_CLIENT*N______include%3A_traces.span.metrics.duration*N______match*_type%3A_strict*N______new*_name%3A_http.client.duration*N______operations%3A*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.name*N________new*_value%3A_actual*_cluster*_name*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.internal*_name*N________new*_value%3A_internal*_cluster*_name*N______-_action%3A_update*_label*N________label%3A_flag*N________new*_label%3A_istio.response*_flags*N______-_action%3A_update*_label*N________label%3A_svc*N________new*_label%3A_service.name*N______-_action%3A_update*_label*N________label%3A_ns*N________new*_label%3A_service.namespace*N______-_action%3A_update*_label*N________label%3A_span.name*N________new*_label%3A_net.peer.name*N______-_action%3A_aggregate*_labels*N________aggregation*_type%3A_sum*N________label*_set%3A*N________-_k8s.cluster.name*N________-_k8s.cluster.internal*_name*N________-_istio.response*_flags*N________-_service.name*N________-_service.namespace*N________-_net.peer.name*N________-_http.status*_code*N________-_destination*_subset*N____-_action%3A_insert*N______experimental*_match*_labels%3A*N________prot%3A_http*N________span.kind%3A_SPAN*_KIND*_SERVER*N______include%3A_traces.span.metrics.duration*N______match*_type%3A_strict*N______new*_name%3A_http.server.duration*N______operations%3A*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.name*N________new*_value%3A_actual*_cluster*_name*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.internal*_name*N________new*_value%3A_internal*_cluster*_name*N______-_action%3A_update*_label*N________label%3A_flag*N________new*_label%3A_istio.response*_flags*N______-_action%3A_update*_label*N________label%3A_svc*N________new*_label%3A_service.name*N______-_action%3A_update*_label*N________label%3A_ns*N________new*_label%3A_service.namespace*N______-_action%3A_aggregate*_labels*N________aggregation*_type%3A_sum*N________label*_set%3A*N________-_k8s.cluster.name*N________-_k8s.cluster.internal*_name*N________-_istio.response*_flags*N________-_service.name*N________-_service.namespace*N________-_http.status*_code*N____-_action%3A_insert*N______experimental*_match*_labels%3A*N________prot%3A_grpc*N________span.kind%3A_SPAN*_KIND*_CLIENT*N______include%3A_traces.span.metrics.duration*N______match*_type%3A_strict*N______new*_name%3A_rpc.client.duration*N______operations%3A*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.name*N________new*_value%3A_actual*_cluster*_name*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.internal*_name*N________new*_value%3A_internal*_cluster*_name*N______-_action%3A_update*_label*N________label%3A_flag*N________new*_label%3A_istio.response*_flags*N______-_action%3A_update*_label*N________label%3A_svc*N________new*_label%3A_service.name*N______-_action%3A_update*_label*N________label%3A_ns*N________new*_label%3A_service.namespace*N______-_action%3A_update*_label*N________label%3A_span.name*N________new*_label%3A_net.peer.name*N______-_action%3A_add*_label*N________new*_label%3A_rpc.system*N________new*_value%3A_grpc*N______-_action%3A_update*_label*N________label%3A_grpc.status*_code*N________new*_label%3A_rpc.grpc.status*_code*N______-_action%3A_aggregate*_labels*N________aggregation*_type%3A_sum*N________label*_set%3A*N________-_k8s.cluster.name*N________-_k8s.cluster.internal*_name*N________-_istio.response*_flags*N________-_service.name*N________-_service.namespace*N________-_net.peer.name*N________-_rpc.system*N________-_rpc.grpc.status*_code*N________-_rpc.service*N________-_rpc.method*N________-_destination*_subset*N____-_action%3A_insert*N______experimental*_match*_labels%3A*N________prot%3A_grpc*N________span.kind%3A_SPAN*_KIND*_SERVER*N______include%3A_traces.span.metrics.duration*N______match*_type%3A_strict*N______new*_name%3A_rpc.server.duration*N______operations%3A*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.name*N________new*_value%3A_actual*_cluster*_name*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.internal*_name*N________new*_value%3A_internal*_cluster*_name*N______-_action%3A_update*_label*N________label%3A_flag*N________new*_label%3A_istio.response*_flags*N______-_action%3A_update*_label*N________label%3A_svc*N________new*_label%3A_service.name*N______-_action%3A_update*_label*N________label%3A_ns*N________new*_label%3A_service.namespace*N______-_action%3A_add*_label*N________new*_label%3A_rpc.system*N________new*_value%3A_grpc*N______-_action%3A_update*_label*N________label%3A_grpc.status*_code*N________new*_label%3A_rpc.grpc.status*_code*N______-_action%3A_aggregate*_labels*N________aggregation*_type%3A_sum*N________label*_set%3A*N________-_k8s.cluster.name*N________-_k8s.cluster.internal*_name*N________-_istio.response*_flags*N________-_service.name*N________-_service.namespace*N________-_rpc.system*N________-_rpc.grpc.status*_code*N________-_rpc.service*N________-_rpc.method*N__resource%2Fcommon%3A*N____attributes%3A*N____-_action%3A_delete*N______key%3A_process.command*N____-_action%3A_delete*N______key%3A_process.command*_line*N____-_action%3A_delete*N______key%3A_process.command*_args*N____-_action%3A_delete*N______key%3A_process.executable.name*N____-_action%3A_delete*N______key%3A_process.executable.path*N____-_action%3A_delete*N______key%3A_process.pid*N____-_action%3A_delete*N______key%3A_process.runtime.description*N____-_action%3A_delete*N______key%3A_process.runtime.name*N____-_action%3A_delete*N______key%3A_process.runtime.version*N____-_action%3A_delete*N______key%3A_os.description*N____-_action%3A_delete*N______key%3A_os.type*N____-_action%3A_delete*N______key%3A_env.aws.account*N____-_action%3A_delete*N______key%3A_env.aws.project.name*N____-_action%3A_delete*N______key%3A_env.aws.region*N____-_action%3A_delete*N______key%3A_env.platform*N____-_action%3A_delete*N______key%3A_env.service.name*N____-_action%3A_delete*N______key%3A_env.version*N__resource%2Fpod-ip-sem-conv%3A*N____attributes%3A*N____-_action%3A_insert*N______from*_attribute%3A_ipv4*N______key%3A_k8s.pod.ip*N____-_action%3A_insert*N______from*_attribute%3A_net.host.ip*N______key%3A_k8s.pod.ip*N____-_action%3A_delete*N______key%3A_ipv4*N____-_action%3A_delete*N______key%3A_net.host.ip*N__resource%2Fremove-k8s-pod-ip%3A*N____attributes%3A*N____-_action%3A_delete*N______key%3A_k8s.pod.ip*N__resource%2Fspanmetrics-remove-unused%3A*N____attributes%3A*N____-_action%3A_delete*N______key%3A_http.scheme*N____-_action%3A_delete*N______key%3A_net.host.port*N____-_action%3A_delete*N______key%3A_service.instance.id*N____-_action%3A_delete*N______key%3A_service.name*N__span%2Fspanmetrics-destination-service%3A*N____name%3A*N______to*_attributes%3A*N________rules%3A*N________-_%5E*C*QP*Ldest*G%5B%5E%3A*B%2F%5D*P*D.***S*N__span%2Fspanmetrics-fake-name%3A*N____name%3A*N______from*_attributes%3A*N______-_dest*N__span%2Funset*_cache*_client*_404%3A*N____include%3A*N______attributes%3A*N______-_key%3A_http.response.status*_code*N________value%3A_%5E404*S*N______-_key%3A_server.address*N________value%3A_%5E*Cservice-x*B.skyscanner*B.net%7Cservice-y*B.skyscanner*B.net%7Cservice-z*B.skyscanner*B.net%7Cservice-z-*Bw%7B2%7D-*Bw*P-*Bd*B.int*B.*Bw%7B2%7D-*Bw*P-*Bd*B.skyscanner*B.com*D*S*N______match*_type%3A_regexp*N______regexp%3A*N________cacheenabled%3A_true*N________cachemaxnumentries%3A_1000*N____status%3A*N______code%3A_Unset*N__span%2Funset*_cache*_client*_404*_legacy%3A*N____include%3A*N______attributes%3A*N______-_key%3A_http.status*_code*N________value%3A_%5E404*S*N______-_key%3A_net.peer.name*N________value%3A_%5E*Cservice-x*B.skyscanner*B.net%7Cservice-y*B.skyscanner*B.net%7Cservice-z*B.skyscanner*B.net%7Cservice-z-*Bw%7B2%7D-*Bw*P-*Bd*B.int*B.*Bw%7B2%7D-*Bw*P-*Bd*B.skyscanner*B.com*D*S*N______match*_type%3A_regexp*N______regexp%3A*N________cacheenabled%3A_true*N________cachemaxnumentries%3A_1000*N____status%3A*N______code%3A_Unset*N__span%2Funset*_cache*_client*_404*_url%3A*N____include%3A*N______attributes%3A*N______-_key%3A_http.response.status*_code*N________value%3A_%5E404*S*N______-_key%3A_http.url*N________value%3A_%5E*Cservice-1*B.skyscanner*B.net*B%2Fapi*B%2Fv3*B%2Fflights%7Cservice-2*B.skyscanner*B.net*B%2Fapi*B%2Fv2*B%2Fhotels*B%2F.*P*D*S*N______match*_type%3A_regexp*N______regexp%3A*N________cacheenabled%3A_true*N________cachemaxnumentries%3A_1000*N____status%3A*N______code%3A_Unset*N__span%2Funset*_cache*_client*_404*_url*_legacy%3A*N____include%3A*N______attributes%3A*N______-_key%3A_http.status*_code*N________value%3A_%5E404*S*N______-_key%3A_http.url*N________value%3A_%5E*Cservice-1*B.skyscanner*B.net*B%2Fapi*B%2Fv3*B%2Fflights%7Cservice-2*B.skyscanner*B.net*B%2Fapi*B%2Fv2*B%2Fhotels*B%2F.*P*D*S*N______match*_type%3A_regexp*N______regexp%3A*N________cacheenabled%3A_true*N________cachemaxnumentries%3A_1000*N____status%3A*N______code%3A_Unset*N__span%2Funset*_status*_jaxrs*_common%3A*N____include%3A*N______libraries%3A*N______-_name%3A_io.opentelemetry.jaxrs-2.0-common*N______match*_type%3A_strict*N____status%3A*N______code%3A_Unset*N__transform%2Fspanmetrics-prep%3A*N____trace*_statements%3A*N____-_context%3A_span*N______statements%3A*N______-_set*Cattributes%5B%22prot%22%5D%2C_%22http%22*D_where_attributes%5B%22grpc.status*_code%22%5D_*E*E_nil*N______-_set*Cattributes%5B%22prot%22%5D%2C_%22grpc%22*D_where_attributes%5B%22grpc.status*_code%22%5D_%21*E_nil*N______-_set*Cattributes%5B%22dest%22%5D%2C_%22unknown-ip%22*D_where_attributes%5B%22ip%22%5D_%21*E_nil_and_attributes%5B%22ip%22%5D_%21*E_%22%22*N______-_set*Cattributes%5B%22dest%22%5D%2C_%22aws-metadata-service%22*D_where_attributes%5B%22ip%22%5D_*E*E_%22169.254.169.254%22*N______-_set*Cattributes%5B%22dest%22%5D%2C_%22vpc-ip%22*D_where_attributes%5B%22ip*_8%22%5D_*E*E_%22172%22_and_Int*Cattributes%5B%22ip*_16%22%5D*D_*G*E_16_and_Int*Cattributes%5B%22ip*_16%22%5D*D_*L*E_20*N__transform%2Ftruncate*_all%3A*N____metric*_statements%3A*N____-_context%3A_resource*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*N____-_context%3A_datapoint*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*N____trace*_statements%3A*N____-_context%3A_resource*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*N____-_context%3A_span*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*N____-_context%3A_spanevent*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*Nreceivers%3A*N__otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A50051*N__prometheus%3A*N____config%3A*N______scrape*_configs%3A*N______-_job*_name%3A_opentelemetry-collector*N________scrape*_interval%3A_10s*N________static*_configs%3A*N________-_targets%3A*N__________-_*S%7Benv%3AMY*_POD*_IP%7D%3A8888*N__zipkin%3A*N____endpoint%3A_0.0.0.0%3A9411*Nservice%3A*N__extensions%3A*N__-_health*_check*N__-_pprof*N__pipelines%3A*N____metrics%3A*N______exporters%3A*N______-_otlphttp%2Fmetrics*N______processors%3A*N______-_memory*_limiter%2Fmetrics*N______-_batch*N______-_resource%2Fcommon*N______receivers%3A*N______-_otlp*N____metrics%2Fspanmetrics-export%3A*N______exporters%3A*N______-_otlphttp%2Fspanmetrics*N______processors%3A*N______-_filter%2Fspanmetrics*N______-_attributes%2Fspanmetrics-split-service-name*N______-_metricstransform%2Fspanmetrics-semantic-naming*N______-_filter%2Fspanmetrics-duration*N______-_resource%2Fspanmetrics-remove-unused*N______-_batch%2Fspanmetrics-export*N______receivers%3A*N______-_spanmetrics*N____traces%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_resource%2Fcommon*N______-_transform%2Ftruncate*_all*N______-_span%2Funset*_cache*_client*_404*_legacy*N______-_span%2Funset*_cache*_client*_404*N______-_span%2Funset*_cache*_client*_404*_url*_legacy*N______-_span%2Funset*_cache*_client*_404*_url*N______-_span%2Funset*_status*_jaxrs*_common*N______-_batch*N______receivers%3A*N______-_otlp*N____traces%2Fspanmetrics%3A*N______exporters%3A*N______-_debug%2Fbasic*N______-_spanmetrics*N______processors%3A*N______-_memory*_limiter%2Fspanmetrics*N______-_filter%2Fspanmetrics-prep*N______-_groupbyattrs%2Fgroup-by-ip*N______-_resource%2Fpod-ip-sem-conv*N______-_k8sattributes%2Ffrom-pod-ip*N______-_resource%2Fremove-k8s-pod-ip*N______-_span%2Fspanmetrics-destination-service*N______-_attributes%2Fspanmetrics-prep*N______-_transform%2Fspanmetrics-prep*N______-_span%2Fspanmetrics-fake-name*N______-_batch%2Fspanmetrics-prep*N______receivers%3A*N______-_zipkin*N__telemetry%3A*N____metrics%3A*N______readers%3A*N______-_pull%3A*N__________exporter%3A*N____________prometheus%3A*N______________host%3A_0.0.0.0*N______________port%3A_8888*N______________without*_type*_suffix%3A_true%7E
[agent-otelbin]: https://www.otelbin.io/#config=exporters%3A*N__debug%3A*N____verbosity%3A_normal*N__otlphttp%3A*N____endpoint%3A_https%3A%2F%2Fotlp.vendor.com*Nextensions%3A*N__health*_check%3A*N____endpoint%3A_*S%7Benv%3AMY*_POD*_IP%7D%3A13133*Nprocessors%3A*N__attributes%2Fconventions%3A*N____actions%3A*N____-_action%3A_delete*N______key%3A_service*_name*N____-_action%3A_delete*N______key%3A_service*_namespace*N____-_action%3A_delete*N______key%3A_service*_instance*_id*N____-_action%3A_delete*N______key%3A_service*_version*N__attributes%2Fkube-state-metrics%3A*N____actions%3A*N____-_action%3A_upsert*N______from*_attribute%3A_namespace*N______key%3A_k8s.namespace.name*N____-_action%3A_upsert*N______from*_attribute%3A_horizontalpodautoscaler*N______key%3A_k8s.hpa.name*N____-_action%3A_upsert*N______from*_attribute%3A_resourcequota*N______key%3A_k8s.resourcequota.name*N____-_action%3A_delete*N______key%3A_namespace*N____-_action%3A_delete*N______key%3A_horizontalpodautoscaler*N____-_action%3A_delete*N______key%3A_resourcequota*N__batch%3A*N____send*_batch*_max*_size%3A_512*N____send*_batch*_size%3A_512*N__cumulativetodelta%3A_null*N__filter%2Fprom*_scrape*_metrics%3A*N____metrics%3A*N______metric%3A*N______-_IsMatch*Cname%2C_%22scrape*_.**%22*D*N__filter%2Fzero*_value*_counts%3A*N____metrics%3A*N______datapoint%3A*N______-_value*_double_*E*E_0.0*N__groupbyattrs%2Fkube-state-metrics%3A*N____keys%3A*N____-_k8s.namespace.name*N____-_k8s.cluster.name*N____-_k8s.cluster.internal*_name*N____-_k8s.hpa.name*N____-_k8s.resourcequota.name*N__memory*_limiter%3A*N____check*_interval%3A_10s*N____limit*_percentage%3A_50*N____spike*_limit*_percentage%3A_1*N__metricstransform%2Fenvoy*_metrics%3A*N____transforms%3A*N____-_action%3A_update*N______include%3A_%5E.***Cejections*_active*D*S*N______match*_type%3A_regexp*N______new*_name%3A_envoy.cluster.outlier*_detection.ejections.active*N__resource%3A*N____attributes%3A*N____-_action%3A_insert*N______key%3A_k8s.cluster.name*N______value%3A_actual*_cluster*_name*N____-_action%3A_insert*N______key%3A_k8s.cluster.internal*_name*N______value%3A_internal*_cluster*_name*N__resource%2Fkube-state-metrics%3A*N____attributes%3A*N____-_action%3A_delete*N______key%3A_k8s.container.name*N____-_action%3A_delete*N______key%3A_k8s.namespace.name*N____-_action%3A_delete*N______key%3A_k8s.node.name*N____-_action%3A_delete*N______key%3A_k8s.pod.name*N____-_action%3A_delete*N______key%3A_k8s.pod.uid*N____-_action%3A_delete*N______key%3A_k8s.replicaset.name*N____-_action%3A_delete*N______key%3A_http.scheme*N____-_action%3A_delete*N______key%3A_net.host.name*N____-_action%3A_delete*N______key%3A_net.host.name*N____-_action%3A_delete*N______key%3A_net.host.port*N__transform%2Fnode*_ethtool*_convert*_gauge*_to*_sum%3A*N____metric*_statements%3A*N____-_context%3A_metric*N______statements%3A*N______-_convert*_gauge*_to*_sum*C%22cumulative%22%2C_true*D_where_IsMatch*Cname%2C_%22node*_ethtool*_.*P*_allowance*_exceeded%22*D*N________*E*E_true*N______-_convert*_gauge*_to*_sum*C%22cumulative%22%2C_true*D_where_IsMatch*Cname%2C_%22awscni*_.*P*_req*_count*S%22*D*N________*E*E_true*Nreceivers%3A*N__opencensus%3A_null*N__prometheus%3A*N____config%3A*N______scrape*_configs%3A*N______-_honor*_timestamps%3A_false*N________job*_name%3A_k8s*_by*_annotations*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_*C*Cotelcol%7Ckarpenter*D*_.*P*D*D*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________-_action%3A_drop*N__________regex%3A_*C*Ckarpenter*_build%7Ckarpenter*_scheduler*_queue*_depth*D*C*_.***D*Q*D*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_%22true%22*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*N________-_action%3A_keep*N__________regex%3A_.*P*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_port*N________-_action%3A_keep*N__________regex%3A_.*P*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_drop*N__________regex%3A_kube-state-metrics*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________regex%3A_*C%5B%5E%3A%5D*P*D*C*Q%3A%3A*Bd*P*D*Q%3B*C*Bd*P*D*N__________replacement%3A_*S*S1%3A*S*S2*N__________source*_labels%3A*N__________-_*_*_address*_*_*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_port*N__________target*_label%3A_*_*_address*_*_*N________-_action%3A_replace*N__________regex%3A_*Chttps*D*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scheme*N__________target*_label%3A_*_*_scheme*_*_*N________-_action%3A_replace*N__________regex%3A_*C.*P*D*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_path*N__________target*_label%3A_*_*_metrics*_path*_*_*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N__________target*_label%3A_job*N________-_action%3A_drop*N__________regex%3A_.**-envoy-prom*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_container*_port*_name*N________scrape*_interval%3A_30s*N________tls*_config%3A*N__________insecure*_skip*_verify%3A_true*N______-_honor*_timestamps%3A_false*N________job*_name%3A_k8s*_node*_exporter*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_node*_ethtool*_.*P*_allowance*_exceeded*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_prometheus-node-exporter*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_jobLabel*N__________target*_label%3A_job*N________-_action%3A_drop*N__________regex%3A_.**-envoy-prom*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_container*_port*_name*N________-_action%3A_replace*N__________regex%3A_*C.***D*N__________replacement%3A_*S*S1*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_kubernetes*_io*_arch*N__________target*_label%3A_host*_arch*N________scrape*_interval%3A_30s*N______-_honor*_timestamps%3A_false*N________job*_name%3A_aws*_vpc*_cni*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_*Cotelcol*D*_.*P*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_aws-node*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________regex%3A_*C%5B%5E%3A%5D*P*D*C*Q%3A%3A*Bd*P*D*Q*N__________replacement%3A_*S*S1%3A61678*N__________source*_labels%3A*N__________-_*_*_address*_*_*N__________target*_label%3A_*_*_address*_*_*N________scrape*_interval%3A_30s*N______-_honor*_timestamps%3A_false*N________job*_name%3A_argocd*_metrics*_scraper*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_*Cgo%7Cprocess%7Crest*D*_.*P*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_%22true%22*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*N________-_action%3A_keep*N__________regex%3A_.*P*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_port*N________-_action%3A_keep*N__________regex%3A_*Cargo-rollouts%7Cargocd-.***D*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N__________target*_label%3A_job*N________scrape*_interval%3A_30s*N________tls*_config%3A*N__________insecure*_skip*_verify%3A_true*N__prometheus%2Fenvoy-metrics%3A*N____config%3A*N______scrape*_configs%3A*N______-_job*_name%3A_envoy-stats*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_*Cenvoy*_cluster*D.***Coutlier*_detection*_ejections*_active*D*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________metrics*_path%3A_%2Fstats%2Fprometheus*N________params%3A*N__________filter%3A*N__________-_.**ejections*_active.***N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_.**-envoy-prom*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_container*_port*_name*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N__________target*_label%3A_job*N______-_job*_name%3A_envoy-stats-default-egress-gateways*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_istio*_tcp.***N__________source*_labels%3A*N__________-_*_*_name*_*_*N________metrics*_path%3A_%2Fstats%2Fprometheus*N________params%3A*N__________filter%3A*N__________-_istio*_tcp.***N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_default-egressgateway*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_type*N________-_action%3A_keep*N__________regex%3A_.**-envoy-prom*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_container*_port*_name*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*N__________target*_label%3A_job*N__prometheus%2Fkube-state-metrics%3A*N____config%3A*N______scrape*_configs%3A*N______-_honor*_timestamps%3A_false*N________job*_name%3A_kube-state-metrics*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_kube*_resourcequota%7Ckube*_pod*_container*_status*_last*_terminated*_reason%7Ckube*_node*_status*_condition*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________-_action%3A_drop*N__________regex%3A_%5E*C%5B%5EO%5D%7CO%5B%5EO%5D%7COO%5B%5EM%5D%7COOM%5B%5EK%5D%7COOMK%5B%5Ei%5D%7COOMKi%5B%5El%5D%7COOMKil%5B%5El%5D%7COOMKill%5B%5Ee%5D%7COOMKille%5B%5Ed%5D*S*D.***N__________source*_labels%3A*N__________-_reason*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_service*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_instance*N________-_action%3A_keep*N__________regex%3A_kube-state-metrics*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________regex%3A_*C%5B%5E%3A%5D*P*D*C*Q%3A%3A*Bd*P*D*Q%3B*C*Bd*P*D*N__________replacement%3A_*S*S1%3A*S*S2*N__________source*_labels%3A*N__________-_*_*_address*_*_*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_port*N__________target*_label%3A_*_*_address*_*_*N________scrape*_interval%3A_30s*N__prometheus%2Fkubelet%3A*N____config%3A*N______scrape*_configs%3A*N______-_bearer*_token*_file%3A_%2Fvar%2Frun%2Fsecrets%2Fkubernetes.io%2Fserviceaccount%2Ftoken*N________honor*_timestamps%3A_false*N________job*_name%3A_kubelet*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_kubelet*_*Cpod*_start%7Cevictions%7Cimage*_pull*_duration%7Cnode*_startup*_duration%7Cpleg*_relist%7Cpreemptions%7Crunning*_containers%7Crunning*_pods*D.***N__________source*_labels%3A*N__________-_*_*_name*_*_*N________metrics*_path%3A_%2Fapi%2Fv1%2Fnodes%2F*S%7Benv%3ANODE*_NAME%7D%2Fproxy%2Fmetrics*N________scheme%3A_https*N________static*_configs%3A*N________-_targets%3A*N__________-_kubernetes.default.svc*N__zipkin%3A*N____endpoint%3A_*S%7Benv%3AMY*_POD*_IP%7D%3A9411*Nservice%3A*N__extensions%3A*N__-_health*_check*N__pipelines%3A*N____metrics%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_filter%2Fprom*_scrape*_metrics*N______-_batch*N______-_transform%2Fnode*_ethtool*_convert*_gauge*_to*_sum*N______-_attributes%2Fconventions*N______-_resource*N______receivers%3A*N______-_prometheus*N____metrics%2Fenvoy-metrics%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_filter%2Fzero*_value*_counts*N______-_filter%2Fprom*_scrape*_metrics*N______-_batch*N______-_metricstransform%2Fenvoy*_metrics*N______-_attributes%2Fconventions*N______-_resource*N______receivers%3A*N______-_prometheus%2Fenvoy-metrics*N____metrics%2Fkube-state-metrics%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_filter%2Fprom*_scrape*_metrics*N______-_batch*N______-_resource*N______-_resource%2Fkube-state-metrics*N______-_attributes%2Fkube-state-metrics*N______-_groupbyattrs%2Fkube-state-metrics*N______receivers%3A*N______-_prometheus%2Fkube-state-metrics*N____metrics%2Fkubelet%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_batch*N______-_attributes%2Fconventions*N______-_resource*N______receivers%3A*N______-_prometheus%2Fkubelet*N__telemetry%3A*N____logs%3A*N______level%3A_info*N____metrics%3A*N______readers%3A*N______-_pull%3A*N__________exporter%3A*N____________prometheus%3A*N______________host%3A_*S%7Benv%3AMY*_POD*_IP%7D*N______________port%3A_8888*N______________without*_type*_suffix%3A_true*N%7E
