---
title: 'Skyscanner: 24 の本番クラスターにまたがる OpenTelemetry Collector の管理'
linkTitle: Skyscanner
author: >-
  [Johanna Öjeling](https://github.com/johannaojeling) (Grafana Labs), [Juliano
  Costa](https://github.com/julianocosta89) (Datadog), [Tristan
  Sloughter](https://github.com/tsloughter) (community), [Neil
  Fordyce](https://github.com/neilfordyce) (Skyscanner)
sig: End-User
default_lang_commit: ce5058cd71a2fc6be2f9b90d4704520fff981dfe
cSpell:ignore: Fordyce kube kubelet rollouts Skyscanner Sloughter Öjeling
---

[Johanna Öjeling](https://github.com/johannaojeling)（Grafana Labs）、
[Juliano Costa](https://github.com/julianocosta89)（Datadog）、
[Tristan Sloughter](https://github.com/tsloughter)（community）、
[Neil Fordyce](https://github.com/neilfordyce)（Skyscanner）著 | 2026年4月21日

このリファレンス実装では、スコットランドのエディンバラに拠点を置くグローバルな旅行検索プラットフォームである [Skyscanner](https://www.skyscanner.net/) が、OpenTelemetry を大規模に運用している方法について説明します。

世界中に1,400人の従業員を擁し、24の本番 Kubernetes クラスターで1,000以上のマイクロサービスを運用する Skyscanner の OpenTelemetry 導入の歩みは、大規模に運用する組織にとって貴重な教訓を提供します。

## 組織構造 {#organizational-structure}

Hubble チームは6人のプラットフォームエンジニアで構成され、Skyscanner の Collector の大部分を管理しています。
より広範なプラットフォームエンジニアリング組織の一部として、Skyscanner の主に Java ベースのマイクロサービスアーキテクチャを実行するコンピュートプラットフォームを担当しています。

サービスチーム自身は、デプロイメントやテレメトリー収集インフラストラクチャから抽象化されています。
Java サービスでは、チームは事前設定済みの OpenTelemetry Java エージェントを含むベース Docker イメージを継承します。
Python や Node.js のサービスでは、プラットフォームチームが環境やリソース属性に基づいた適切なデフォルト値を設定するラッパーライブラリを提供しています。
これらのアプローチにより、ボイラープレートのセットアップが最小限に抑えられ、サービスチームは深い OpenTelemetry の知識を必要とせずにすぐにオブザーバビリティを利用できます。

## OpenTelemetry の導入 {#opentelemetry-adoption}

Skyscanner の OpenTelemetry の導入は2021年に始まりました。
同社は社内で構築したオープンソーススタックから商用ベンダーへの移行を進めていました。
しかし、ベンダーロックインを避けたいと考えていました。

> 「ベンダーに依存しない形でベンダーに移行したかったのです」と、Skyscanner の Hubble プラットフォームチームのソフトウェアエンジニアである [Neil Fordyce](https://github.com/neilfordyce) は説明しました。

このベンダーに依存しないアプローチが、テレメトリーインフラストラクチャの中核として OpenTelemetry Collector を採用することにつながりました。

## アーキテクチャ: 集中ルーティング、分散収集 {#architecture-centralized-routing-distributed-collection}

Skyscanner の Collector アーキテクチャは、Istio ベースのインテリジェントルーティングを備えた中央 DNS エンドポイントを特徴としています。
サービスがグローバルのどこで実行されているか、どのクラスターにいるかに関わらず、テレメトリーはこの単一のアドレスに送信されます。
Istio が最も近い利用可能な Collector へのリクエストルーティングを処理します。

デプロイメントは2つの異なる Collector パターンで構成されています。

**Gateway Collector（Replica Set）**: ほとんどのサービスからの大量の OTLP トラフィック（トレースとメトリクス）を処理し、処理の大部分がここで行われます。

**Agent Collector（DaemonSet）**: OTLP をネイティブにサポートしていないオープンソースおよびプラットフォームサービスから Prometheus エンドポイントをスクレイプします。

![Skyscanner アーキテクチャ図](skyscanner-architecture.png)

## 設定: シンプルに始めて、徐々に進化させる {#configuration-start-simple-evolve-gradually}

Skyscanner が2021年に Collector を最初にデプロイしたとき、設定はメモリリミッター、バッチプロセッサー、トレース用の OTLP エクスポーターという最小限のものでした。

時間の経過とともに、設定は自然に進化しました。
メトリクスパイプラインの追加、Istio スパンの取り込みの統合、スパンからメトリクスへの変換の実装、ノイズを削減しコストを管理するためのフィルタープロセッサーの追加などが行われました。

### Istio サービスメッシュのスパンをプラットフォームメトリクスに変換する {#turning-istio-service-mesh-spans-into-platform-metrics}

Skyscanner の Collector の最も革新的な活用法の1つは、Istio サービスメッシュのスパンからメトリクスを生成することです。

Istio のネイティブメトリクスには、Prometheus デプロイメントを圧倒するカーディナリティ爆発の問題がありました。
さらに、Skyscanner はコードを所有していないものの、一貫したメトリクスが必要な多くの既製サービスを運用しています。

彼らの解決策は次のとおりです。
Istio がスパンを発行するように設定し（元々は Zipkin 形式でしたが、現在 Istio は OTLP をサポートしています）、Zipkin レシーバーを使用して Collector に取り込み、セマンティック規約に合わせて変換し、[span metrics connector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/e8a502371ea1d2c3534235d623c1b1eb3b6b4b58/connector/spanmetricsconnector?from_branch=main) を使用して、アプリケーションの計装なしで一貫したメトリクスを生成するというものです。

> 「アプリケーションの所有者がコードを計装することなく、プラットフォームレベルでそれを実現できるのです」と Neil は述べました。

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

Collector はこれらのメトリクスを `http.client.duration` や `http.server.duration` などのセマンティック規約の名前を使用するように変換し、クラスター、サービス名、HTTP ステータスコード別に集約します。
これにより、コード変更なしですべてのサービスにプラットフォームレベルの HTTP メトリクスが提供され、セマンティック規約に準拠した一貫した命名が実現し、ネイティブの Istio メトリクスよりも低いカーディナリティが得られます。

### 404 エラーの課題 {#the-404-error-challenge}

Collector 設定に関する注目すべき課題の1つは、キャッシュサービスがキャッシュにエントリが存在しないことを示すために HTTP 404 を返すケースでした。
Collector はこれらの 404 をエラーとして扱い、実際には正常な高頻度の動作に対して 100% のトレースサンプリングをトリガーしていました。

解決策は、これらの特定の 404 レスポンスに対してエラーステータスを解除するフィルタープロセッサーを追加することでした。

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

このプロセッサーは、特定のキャッシュサービスからの 404 ステータスコードを持つスパンに一致させ、そのエラーステータスを解除することで、エラーベースのサンプリングがトリガーされるのを防ぎます。

> 「最初からフィルタープロセッサーがあれば、より高品質で使いやすいトレースが得られたでしょう」と Neil は振り返りました。

しかし、Neil は OpenTelemetry SDK の[宣言的設定](/docs/languages/sdk-configuration/declarative-configuration/)が最近導入されたことで、このようなフィルタリングは中央の Collector 設定を変更する必要なく、サービスチーム自身が分散的に設定できるようになったと述べています。

### 設定の詳細 {#configuration-deep-dive}

Skyscanner は、これらのパターンを実際に理解してもらうために、本番環境の Collector 設定を共有しています。

#### Gateway Collector {#gateway-collector}

[Gateway Collector][gateway-otelbin] は処理の大部分を担当します。

- サービスからの OTLP メトリクスとトレース、および Istio からの Zipkin スパンを受信する
- span metrics connector を使用して Istio スパンからメトリクスを生成する
- 広範な transform プロセッサーを使用して Istio 属性をセマンティック規約にマッピングする
- キャッシュサービスに対する 404 フィルタリングロジックを実装する
- メトリクスとトレースを OTLP 経由でオブザーバビリティベンダーにエクスポートする

この図は、OTLP メトリクスとトレース、および Istio スパンがこれらの Gateway Collector にどのように到達するかを示しています。

![Skyscanner アーキテクチャ（Gateway Collector）図](skyscanner-architecture-gateway.png)

#### Agent Collector {#agent-collector}

[Agent Collector][agent-otelbin] は、各ノードからのインフラストラクチャおよびプラットフォームレベルのメトリクスの収集に特化しています。

- さまざまなソース（node exporter、kube-state-metrics、kubelet）から Prometheus エンドポイントをスクレイプする
- 最小限の処理（メモリ制限、バッチ処理、属性のクリーンアップ）を実行する
- メトリクスを OTLP 経由でオブザーバビリティベンダーにエクスポートする

## 計装戦略 {#instrumentation-strategy}

Skyscanner の Java 中心の環境は、OpenTelemetry の自動計装機能から大きな恩恵を受けています。
ベース Docker イメージに事前設定された Java エージェントにより、HTTP と gRPC のスパン生成がすぐに利用可能です。

### 独自方針の自動計装 {#opinionated-auto-instrumentation}

チームは自動計装に対して意図的に独自の方針を持ったアプローチをとっています。
デフォルトですべてを有効にするのではなく、逆のアプローチをとっています。
共有ベース Docker イメージですべての計装を無効にし、厳選されたセットのみを明示的に有効にしています。

> 「逆のアプローチなのです。すべてを無効にしてから、必要なものだけを有効にします」と Neil は説明しました。

ベースイメージの環境変数を使用して、Skyscanner はデフォルトでランタイム、HTTP、gRPC 関連の計装の厳選されたセットを有効にしています。
これには、JAX-RS、gRPC、Jetty、一般的な HTTP クライアント、executor 計装、ロギングコンテキスト伝搬が含まれます。
サービスチームはこれらのデフォルトを自動的に継承しますが、必要に応じて自身のサービス定義でオーバーライドしたり、追加の計装を有効にしたりできます。

このモデルにより、数百のサービスにわたる一貫性を確保しつつ、必要な場合には柔軟性も維持できます。

### Java エージェントのセットアップ {#setting-up-the-java-agent}

以下のスニペットは、共有 Java ベースイメージの一例です。
OpenTelemetry Java エージェントをイメージにバンドルし、組織全体のデフォルトを設定し、共通のランチャースクリプトをインストールします。

```Dockerfile base image
# OpenTelemetry Java エージェントのソースとして使用するイメージ
FROM ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:2.25.0 AS otel

# すべての Java マイクロサービスが拡張する共通ベースイメージを定義する
FROM image/registry/public-java-image:x.y.z

# OTel イメージから OpenTelemetry Java エージェントをコピーする
COPY --from=otel /javaagent.jar $OPEN_TELEMETRY_DIRECTORY/opentelemetry-javaagent.jar
ENV OTEL_AGENT=$OPEN_TELEMETRY_DIRECTORY/opentelemetry-javaagent.jar

# 組織全体で適切なデフォルトを設定する
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
# OTel リソース属性をセットアップするために使用する
# サービス起動時に環境変数から検出できるもの
# これらの変数はデプロイメントシステムによって自動的に設定される
# 一部の環境変数は繰り返しを避けるために省略されている
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

最後に、個々のサービスの Dockerfile は同じベースを拡張し、そのサービスに必要な追加の計装のみを追加します。

```Dockerfile my-service
FROM image/registry/skyscanner-java-base:x.y.z

COPY my-service.jar

# my-service が他のデフォルト以外の計装を有効にしたい場合、簡単に拡張できる
ENV OTEL_INSTRUMENTATION_OPENAI_ENABLED=true
ENV OTEL_INSTRUMENTATION_OKHTTP_ENABLED=true

CMD exec /usr/bin/run.sh -jar my-service.jar server
```

### スパンは有効、メトリクスは無効（デフォルト） {#spans-yes-metrics-no-by-default}

Skyscanner の戦略で特に興味深い点は、メトリクスとトレースの扱い方です。
HTTP と gRPC の計装は有効になっていますが、チームは SDK が生成する HTTP および RPC メトリクスのほとんどを意図的にドロップしています。
これは、前述のとおり、Istio サービスメッシュのスパンから一貫性があり、低カーディナリティのプラットフォームメトリクスをすでに導出しているためです。

計装を完全に無効にする（スパンも削除される）のではなく、OpenTelemetry SDK ビューを使用してメトリクスの集約をドロップしつつ、トレースは維持しています。

- HTTP と RPC のメトリクスはグローバルにドロップされる
- スパンは通常どおり発行され続ける
- サービスチームは、Istio が提供するものを超える追加の粒度が必要な場合、特定のメトリクス（たとえばサーバーサイドのレイテンシー）を選択的に再有効化できる

チームが SDK メトリクスを再度有効にする場合、既存の Istio 由来のメトリクスとの衝突や二重カウントを避けるために、通常はメトリクス名を変更します。

先ほど示した [Java ベースイメージ](#setting-up-the-java-agent)では、`OTEL_EXPERIMENTAL_METRICS_VIEW_CONFIG` が Skyscanner のデフォルトの `otel-view.yaml` を指しており、[ビューファイル設定](https://github.com/open-telemetry/opentelemetry-java/blob/65f7412a986cb474314b093c1bbba77955b52031/sdk-extensions/incubator/README.md#view-file-configuration)を使用しています。

```yaml
# Skyscanner のデフォルトメトリクスビュー設定
# OTEL_EXPERIMENTAL_METRICS_VIEW_CONFIG が指すファイルに保存される
# Istio からのメトリクスがすでにあるため、http と rpc のメトリクスをドロップする
# 計装自体を無効にするのではなく、トレースは引き続き機能させたい
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
# このドロップ動作は、リストを拡張して保持するメトリクスを
# 明示的に選択するビューを追加することで変更できる。
# 例: http.server.request.duration メトリクスを保持しつつ、
# http.client.* メトリクスは引き続きドロップする
- selector:
    instrument_name: http.server.request.duration
  view:
    # Istio メトリクスにすでに http.server.request.duration という名前のメトリクスがあるため、
    # 衝突や二重カウントを避けるためにリネームする
    name: app.http.server.request.duration
    attribute_keys:
      - http.request.method
      - http.route
      - http.response.status_code
```

このアプローチにより、Skyscanner は高価値の分散トレースを維持し、メトリクスの重複を回避し、カーディナリティを制御し、取り込みコストを削減できます。
これらすべてをサービスオーナーが OpenTelemetry の内部を深く理解する必要なく実現しています。

全体として、この戦略は強力なプラットフォームマインドセットを反映しています。
スケールで機能する適切なデフォルトを提供し、ノイズを最小限に抑え、「正しいこと」を「簡単なこと」にしつつ、高度なニーズを持つチームがさらに先に進む余地を残しています。

## デプロイメントとリリース管理 {#deployment-and-release-management}

Skyscanner は、必要なものがすべて含まれていたため、OpenTelemetry Collector Contrib ディストリビューションを使用しています。
チームは Contrib が本番環境での使用には推奨されていないことを認識しており、必要なコンポーネントのみを含むカスタム Collector イメージの構築を検討する予定です。

Skyscanner は約6か月ごとに Collector を更新しますが、特定の機能や重要な修正を追跡している場合はより頻繁にアップグレードします。
リリース情報を把握するために RSS フィードや CNCF Slack チャンネルをフォローしています。

ロールアウト戦略では、クラスター階層間での段階的なプロモーションを使用します。
Dev クラスター、次に3つの Alpha 本番クラスター、続いて8つの Beta 本番クラスター、最後に残りの13の本番クラスターという順序です。
Argo CD を使用してデプロイメントを行い、階層間の変更はプルリクエストを通じてプロモーションされます。

> 「開発テストクラスターで確実に問題を起こしたことはありますが、さらにプロモーションする前に修正しました」と Neil は言いました。

この段階的なアプローチにより、設定上の問題を本番環境に到達する前にキャッチできました。
OpenTelemetry Collector のデプロイメントに対する自動化されたテストやロールバック機能はまだありませんが、これらの改善は今後予定されています。

## うまくいっていること {#what-works-well}

本番環境で OpenTelemetry を導入して以来、チームの経験は非常にポジティブなものでした。

> 「本当にほとんど痛みがなかったです」と Neil は振り返りました。

柔軟性が Collector の最大の強みとして際立っています。

> 「やろうとしたことはすべて実現できました。それは Collector がいかに柔軟であるかを物語っていると思います」と Neil は説明しました。

その他のハイライトとしては、OTLP プロトコルがシンプルな設定によるベンダー非依存性を提供していること、明確で整理されたリリースノート、そしてチームメンバーが Collector コンポーネントのメモリリークを発見して修正に貢献した際のコミュニティの対応力があります。

## 教訓と課題 {#lessons-and-pain-points}

Skyscanner は一部のパイプラインで古い不安定な HTTP セマンティック規約をまだ使用しています。
アップグレードには、Istio 属性をセマンティック規約の名前にマッピングする複数の transform プロセッサールールの更新が必要で、ドキュメントを手動で照合し、設定文字列を埋める作業が伴います。

チームはセマンティック規約の管理に [Weaver](https://github.com/open-telemetry/weaver) があることを認識していますが、まだワークフローに統合していません。

6か月ごとにアップグレードすることは、一度に複数の破壊的変更に直面することを意味します。
リリースノートはよく書かれており、変更が明確に文書化されていますが、6か月分の更新を一度にレビューするのは、リリースペースに追随する場合と比べて負担が大きくなります。

## 他の組織へのアドバイス {#advice-for-others}

本番環境での経験に基づき、Skyscanner チームは以下のアドバイスを提供しています。

- **シンプルに始める**: メモリリミッター、バッチプロセッサー、基本的なエクスポーターだけから始めましょう。
  必要が生じたときにのみ複雑さを追加してください。
- **メモリリミッターは初日から**: スケールアップに伴うメモリの問題を防ぐために、すぐにセットアップしましょう。
- **フィルタープロセッサーの早期検討**: アプリケーションのステータスコードのセマンティクスを理解し、高頻度の「偽陽性」をフィルタリングしてコストを管理しましょう。
- **回復性を過度に設計しない**: テレメトリーデータには、シンプルなインメモリバッチ処理で十分な場合が多いです。
- **段階的なロールアウトで問題をキャッチ**: 環境階層間での段階的なプロモーションは、貴重な検証を提供します。

## まとめ {#takeaways}

Skyscanner の事例は、少人数のプラットフォームエンジニアリングチームが、比較的低い運用オーバーヘッドで大規模な OpenTelemetry Collector インフラストラクチャを成功裏に管理できることを示しています。

[gateway-otelbin]: https://www.otelbin.io/#config=connectors%3A*N__spanmetrics%3A*N____aggregation*_temporality%3A_AGGREGATION*_TEMPORALITY*_DELTA*N____dimensions%3A*N____-_name%3A_http.status*_code*N____-_name%3A_grpc.status*_code*N____-_name%3A_rpc.service*N____-_name%3A_rpc.method*N____-_name%3A_prot*N____-_name%3A_flag*N____-_name%3A_k8s.deployment.name*N____-_name%3A_k8s.replicaset.name*N____-_name%3A_destination*_subset*N____dimensions*_cache*_size%3A_15000000*N____histogram%3A*N______exponential%3A*N________max*_size%3A_160*N______unit%3A_ms*N____metrics*_flush*_interval%3A_30s*Nexporters%3A*N__debug%3A*N____verbosity%3A_normal*N__debug%2Fbasic%3A*N____verbosity%3A_basic*N__debug%2Fdetailed%3A*N____verbosity%3A_detailed*N__otlphttp%3A*N____endpoint%3A_https%3A%2F%2Fotlp-trace-sampler.vendor.com*N__otlphttp%2Fmetrics%3A*N____endpoint%3A_https%3A%2F%2Fotlp.vendor.com*N__otlphttp%2Fspanmetrics%3A*N____endpoint%3A_https%3A%2F%2Fotlp.vendor.com*Nextensions%3A*N__health*_check%3A*N____endpoint%3A_*S%7Benv%3AMY*_POD*_IP%7D%3A13133*N__pprof%3A*N____endpoint%3A_%3A1888*Nprocessors%3A*N__attributes%2Fspanmetrics-prep%3A*N____actions%3A*N____-_action%3A_extract*N______key%3A_response*_flags*N______pattern%3A_*C*QP*Lflag*G.***D*N____-_action%3A_extract*N______key%3A_dest*N______pattern%3A_%5E*C*QP*Lip*G*C*QP*Lip*_8*G*Bd*P*D*B.*C*QP*Lip*_16*G*Bd*P*D*B.*Bd*P*B.*Bd*P*D*S*N____-_action%3A_extract*N______key%3A_grpc.path*N______pattern%3A_%5E*B%2F*C*QP*Lrpc*_service*G%5B%5E*B%2F%5D*P*D*B%2F*C*QP*Lrpc*_method*G%5B%5E*B%2F%5D*P*D*S*N____-_action%3A_upsert*N______from*_attribute%3A_rpc*_service*N______key%3A_rpc.service*N____-_action%3A_delete*N______key%3A_rpc*_service*N____-_action%3A_upsert*N______from*_attribute%3A_rpc*_method*N______key%3A_rpc.method*N____-_action%3A_delete*N______key%3A_rpc*_method*N____-_action%3A_extract*N______key%3A_upstream*_cluster*N______pattern%3A_%5Eoutbound*B%7C*Bd*P*B%7C*C*QP*Ldestination*_subset*G%5B%5E%7C%5D***D*B%7C.***S*N__attributes%2Fspanmetrics-split-service-name%3A*N____actions%3A*N____-_action%3A_extract*N______key%3A_service.name*N______pattern%3A_%5E*C*QP*Lsvc*G%5B%5E*B.%5D*P*D*C*QP*Lns*_suffix*G*B.*C*QP*Lns*G%5B%5E*B.%5D*P*D*D*Q*S*N__batch%3A*N____send*_batch*_max*_size%3A_500*N____send*_batch*_size%3A_500*N__batch%2Fspanmetrics-export%3A*N____send*_batch*_max*_size%3A_512*N____send*_batch*_size%3A_512*N__batch%2Fspanmetrics-prep%3A_%7B%7D*N__filter%2Fspanmetrics%3A*N____metrics%3A*N______include%3A*N________match*_type%3A_strict*N________metric*_names%3A*N________-_traces.span.metrics.duration*N__filter%2Fspanmetrics-duration%3A*N____metrics%3A*N______include%3A*N________match*_type%3A_regexp*N________metric*_names%3A*N________-_*Crpc%7Chttp*D*B.*Cclient%7Cserver*D*B.duration*N__filter%2Fspanmetrics-prep%3A*N____spans%3A*N______include%3A*N________attributes%3A*N________-_key%3A_component*N__________value%3A_proxy*N________match*_type%3A_strict*N__groupbyattrs%2Fgroup-by-ip%3A*N____keys%3A*N____-_net.host.ip*N__k8sattributes%2Ffrom-pod-ip%3A*N____auth*_type%3A_serviceAccount*N____extract%3A*N______metadata%3A*N______-_k8s.deployment.name*N______-_k8s.replicaset.name*N____passthrough%3A_false*N____pod*_association%3A*N____-_sources%3A*N______-_from%3A_resource*_attribute*N________name%3A_k8s.pod.ip*N__memory*_limiter%3A*N____check*_interval%3A_1s*N____limit*_percentage%3A_100*N____spike*_limit*_percentage%3A_1*N__memory*_limiter%2Fmetrics%3A*N____check*_interval%3A_1s*N____limit*_percentage%3A_85*N____spike*_limit*_percentage%3A_10*N__memory*_limiter%2Fspanmetrics%3A*N____check*_interval%3A_1s*N____limit*_percentage%3A_75*N____spike*_limit*_percentage%3A_1*N__metricstransform%2Fspanmetrics-semantic-naming%3A*N____transforms%3A*N____-_action%3A_insert*N______experimental*_match*_labels%3A*N________prot%3A_http*N________span.kind%3A_SPAN*_KIND*_CLIENT*N______include%3A_traces.span.metrics.duration*N______match*_type%3A_strict*N______new*_name%3A_http.client.duration*N______operations%3A*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.name*N________new*_value%3A_actual*_cluster*_name*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.internal*_name*N________new*_value%3A_internal*_cluster*_name*N______-_action%3A_update*_label*N________label%3A_flag*N________new*_label%3A_istio.response*_flags*N______-_action%3A_update*_label*N________label%3A_svc*N________new*_label%3A_service.name*N______-_action%3A_update*_label*N________label%3A_ns*N________new*_label%3A_service.namespace*N______-_action%3A_update*_label*N________label%3A_span.name*N________new*_label%3A_net.peer.name*N______-_action%3A_aggregate*_labels*N________aggregation*_type%3A_sum*N________label*_set%3A*N________-_k8s.cluster.name*N________-_k8s.cluster.internal*_name*N________-_istio.response*_flags*N________-_service.name*N________-_service.namespace*N________-_net.peer.name*N________-_http.status*_code*N________-_destination*_subset*N____-_action%3A_insert*N______experimental*_match*_labels%3A*N________prot%3A_http*N________span.kind%3A_SPAN*_KIND*_SERVER*N______include%3A_traces.span.metrics.duration*N______match*_type%3A_strict*N______new*_name%3A_http.server.duration*N______operations%3A*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.name*N________new*_value%3A_actual*_cluster*_name*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.internal*_name*N________new*_value%3A_internal*_cluster*_name*N______-_action%3A_update*_label*N________label%3A_flag*N________new*_label%3A_istio.response*_flags*N______-_action%3A_update*_label*N________label%3A_svc*N________new*_label%3A_service.name*N______-_action%3A_update*_label*N________label%3A_ns*N________new*_label%3A_service.namespace*N______-_action%3A_aggregate*_labels*N________aggregation*_type%3A_sum*N________label*_set%3A*N________-_k8s.cluster.name*N________-_k8s.cluster.internal*_name*N________-_istio.response*_flags*N________-_service.name*N________-_service.namespace*N________-_http.status*_code*N____-_action%3A_insert*N______experimental*_match*_labels%3A*N________prot%3A_grpc*N________span.kind%3A_SPAN*_KIND*_CLIENT*N______include%3A_traces.span.metrics.duration*N______match*_type%3A_strict*N______new*_name%3A_rpc.client.duration*N______operations%3A*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.name*N________new*_value%3A_actual*_cluster*_name*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.internal*_name*N________new*_value%3A_internal*_cluster*_name*N______-_action%3A_update*_label*N________label%3A_flag*N________new*_label%3A_istio.response*_flags*N______-_action%3A_update*_label*N________label%3A_svc*N________new*_label%3A_service.name*N______-_action%3A_update*_label*N________label%3A_ns*N________new*_label%3A_service.namespace*N______-_action%3A_update*_label*N________label%3A_span.name*N________new*_label%3A_net.peer.name*N______-_action%3A_add*_label*N________new*_label%3A_rpc.system*N________new*_value%3A_grpc*N______-_action%3A_update*_label*N________label%3A_grpc.status*_code*N________new*_label%3A_rpc.grpc.status*_code*N______-_action%3A_aggregate*_labels*N________aggregation*_type%3A_sum*N________label*_set%3A*N________-_k8s.cluster.name*N________-_k8s.cluster.internal*_name*N________-_istio.response*_flags*N________-_service.name*N________-_service.namespace*N________-_net.peer.name*N________-_rpc.system*N________-_rpc.grpc.status*_code*N________-_rpc.service*N________-_rpc.method*N________-_destination*_subset*N____-_action%3A_insert*N______experimental*_match*_labels%3A*N________prot%3A_grpc*N________span.kind%3A_SPAN*_KIND*_SERVER*N______include%3A_traces.span.metrics.duration*N______match*_type%3A_strict*N______new*_name%3A_rpc.server.duration*N______operations%3A*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.name*N________new*_value%3A_actual*_cluster*_name*N______-_action%3A_add*_label*N________new*_label%3A_k8s.cluster.internal*_name*N________new*_value%3A_internal*_cluster*_name*N______-_action%3A_update*_label*N________label%3A_flag*N________new*_label%3A_istio.response*_flags*N______-_action%3A_update*_label*N________label%3A_svc*N________new*_label%3A_service.name*N______-_action%3A_update*_label*N________label%3A_ns*N________new*_label%3A_service.namespace*N______-_action%3A_add*_label*N________new*_label%3A_rpc.system*N________new*_value%3A_grpc*N______-_action%3A_update*_label*N________label%3A_grpc.status*_code*N________new*_label%3A_rpc.grpc.status*_code*N______-_action%3A_aggregate*_labels*N________aggregation*_type%3A_sum*N________label*_set%3A*N________-_k8s.cluster.name*N________-_k8s.cluster.internal*_name*N________-_istio.response*_flags*N________-_service.name*N________-_service.namespace*N________-_rpc.system*N________-_rpc.grpc.status*_code*N________-_rpc.service*N________-_rpc.method*N__resource%2Fcommon%3A*N____attributes%3A*N____-_action%3A_delete*N______key%3A_process.command*N____-_action%3A_delete*N______key%3A_process.command*_line*N____-_action%3A_delete*N______key%3A_process.command*_args*N____-_action%3A_delete*N______key%3A_process.executable.name*N____-_action%3A_delete*N______key%3A_process.executable.path*N____-_action%3A_delete*N______key%3A_process.pid*N____-_action%3A_delete*N______key%3A_process.runtime.description*N____-_action%3A_delete*N______key%3A_process.runtime.name*N____-_action%3A_delete*N______key%3A_process.runtime.version*N____-_action%3A_delete*N______key%3A_os.description*N____-_action%3A_delete*N______key%3A_os.type*N____-_action%3A_delete*N______key%3A_env.aws.account*N____-_action%3A_delete*N______key%3A_env.aws.project.name*N____-_action%3A_delete*N______key%3A_env.aws.region*N____-_action%3A_delete*N______key%3A_env.platform*N____-_action%3A_delete*N______key%3A_env.service.name*N____-_action%3A_delete*N______key%3A_env.version*N__resource%2Fpod-ip-sem-conv%3A*N____attributes%3A*N____-_action%3A_insert*N______from*_attribute%3A_ipv4*N______key%3A_k8s.pod.ip*N____-_action%3A_insert*N______from*_attribute%3A_net.host.ip*N______key%3A_k8s.pod.ip*N____-_action%3A_delete*N______key%3A_ipv4*N____-_action%3A_delete*N______key%3A_net.host.ip*N__resource%2Fremove-k8s-pod-ip%3A*N____attributes%3A*N____-_action%3A_delete*N______key%3A_k8s.pod.ip*N__resource%2Fspanmetrics-remove-unused%3A*N____attributes%3A*N____-_action%3A_delete*N______key%3A_http.scheme*N____-_action%3A_delete*N______key%3A_net.host.port*N____-_action%3A_delete*N______key%3A_service.instance.id*N____-_action%3A_delete*N______key%3A_service.name*N__span%2Fspanmetrics-destination-service%3A*N____name%3A*N______to*_attributes%3A*N________rules%3A*N________-_%5E*C*QP*Ldest*G%5B%5E%3A*B%2F%5D*P*D.***S*N__span%2Fspanmetrics-fake-name%3A*N____name%3A*N______from*_attributes%3A*N______-_dest*N__span%2Funset*_cache*_client*_404%3A*N____include%3A*N______attributes%3A*N______-_key%3A_http.response.status*_code*N________value%3A_%5E404*S*N______-_key%3A_server.address*N________value%3A_%5E*Cservice-x*B.skyscanner*B.net%7Cservice-y*B.skyscanner*B.net%7Cservice-z*B.skyscanner*B.net%7Cservice-z-*Bw%7B2%7D-*Bw*P-*Bd*B.int*B.*Bw%7B2%7D-*Bw*P-*Bd*B.skyscanner*B.com*D*S*N______match*_type%3A_regexp*N______regexp%3A*N________cacheenabled%3A_true*N________cachemaxnumentries%3A_1000*N____status%3A*N______code%3A_Unset*N__span%2Funset*_cache*_client*_404*_legacy%3A*N____include%3A*N______attributes%3A*N______-_key%3A_http.status*_code*N________value%3A_%5E404*S*N______-_key%3A_net.peer.name*N________value%3A_%5E*Cservice-x*B.skyscanner*B.net%7Cservice-y*B.skyscanner*B.net%7Cservice-z*B.skyscanner*B.net%7Cservice-z-*Bw%7B2%7D-*Bw*P-*Bd*B.int*B.*Bw%7B2%7D-*Bw*P-*Bd*B.skyscanner*B.com*D*S*N______match*_type%3A_regexp*N______regexp%3A*N________cacheenabled%3A_true*N________cachemaxnumentries%3A_1000*N____status%3A*N______code%3A_Unset*N__span%2Funset*_cache*_client*_404*_url%3A*N____include%3A*N______attributes%3A*N______-_key%3A_http.response.status*_code*N________value%3A_%5E404*S*N______-_key%3A_http.url*N________value%3A_%5E*Cservice-1*B.skyscanner*B.net*B%2Fapi*B%2Fv3*B%2Fflights%7Cservice-2*B.skyscanner*B.net*B%2Fapi*B%2Fv2*B%2Fhotels*B%2F.*P*D*S*N______match*_type%3A_regexp*N______regexp%3A*N________cacheenabled%3A_true*N________cachemaxnumentries%3A_1000*N____status%3A*N______code%3A_Unset*N__span%2Funset*_cache*_client*_404*_url*_legacy%3A*N____include%3A*N______attributes%3A*N______-_key%3A_http.status*_code*N________value%3A_%5E404*S*N______-_key%3A_http.url*N________value%3A_%5E*Cservice-1*B.skyscanner*B.net*B%2Fapi*B%2Fv3*B%2Fflights%7Cservice-2*B.skyscanner*B.net*B%2Fapi*B%2Fv2*B%2Fhotels*B%2F.*P*D*S*N______match*_type%3A_regexp*N______regexp%3A*N________cacheenabled%3A_true*N________cachemaxnumentries%3A_1000*N____status%3A*N______code%3A_Unset*N__span%2Funset*_status*_jaxrs*_common%3A*N____include%3A*N______libraries%3A*N______-_name%3A_io.opentelemetry.jaxrs-2.0-common*N______match*_type%3A_strict*N____status%3A*N______code%3A_Unset*N__transform%2Fspanmetrics-prep%3A*N____trace*_statements%3A*N____-_context%3A_span*N______statements%3A*N______-_set*Cattributes%5B%22prot%22%5D%2C_%22http%22*D_where_attributes%5B%22grpc.status*_code%22%5D_*E*E_nil*N______-_set*Cattributes%5B%22prot%22%5D%2C_%22grpc%22*D_where_attributes%5B%22grpc.status*_code%22%5D_%21*E_nil*N______-_set*Cattributes%5B%22dest%22%5D%2C_%22unknown-ip%22*D_where_attributes%5B%22ip%22%5D_%21*E_nil_and_attributes%5B%22ip%22%5D_%21*E_%22%22*N______-_set*Cattributes%5B%22dest%22%5D%2C_%22aws-metadata-service%22*D_where_attributes%5B%22ip%22%5D_*E*E_%22169.254.169.254%22*N______-_set*Cattributes%5B%22dest%22%5D%2C_%22vpc-ip%22*D_where_attributes%5B%22ip*_8%22%5D_*E*E_%22172%22_and_Int*Cattributes%5B%22ip*_16%22%5D*D_*G*E_16_and_Int*Cattributes%5B%22ip*_16%22%5D*D_*L*E_20*N__transform%2Ftruncate*_all%3A*N____metric*_statements%3A*N____-_context%3A_resource*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*N____-_context%3A_datapoint*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*N____trace*_statements%3A*N____-_context%3A_resource*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*N____-_context%3A_span*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*N____-_context%3A_spanevent*N______statements%3A*N______-_truncate*_all*Cattributes%2C_4095*D*Nreceivers%3A*N__otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A50051*N__prometheus%3A*N____config%3A*N______scrape*_configs%3A*N______-_job*_name%3A_opentelemetry-collector*N________scrape*_interval%3A_10s*N________static*_configs%3A*N________-_targets%3A*N__________-_*S%7Benv%3AMY*_POD*_IP%7D%3A8888*N__zipkin%3A*N____endpoint%3A_0.0.0.0%3A9411*Nservice%3A*N__extensions%3A*N__-_health*_check*N__-_pprof*N__pipelines%3A*N____metrics%3A*N______exporters%3A*N______-_otlphttp%2Fmetrics*N______processors%3A*N______-_memory*_limiter%2Fmetrics*N______-_batch*N______-_resource%2Fcommon*N______receivers%3A*N______-_otlp*N____metrics%2Fspanmetrics-export%3A*N______exporters%3A*N______-_otlphttp%2Fspanmetrics*N______processors%3A*N______-_filter%2Fspanmetrics*N______-_attributes%2Fspanmetrics-split-service-name*N______-_metricstransform%2Fspanmetrics-semantic-naming*N______-_filter%2Fspanmetrics-duration*N______-_resource%2Fspanmetrics-remove-unused*N______-_batch%2Fspanmetrics-export*N______receivers%3A*N______-_spanmetrics*N____traces%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_resource%2Fcommon*N______-_transform%2Ftruncate*_all*N______-_span%2Funset*_cache*_client*_404*_legacy*N______-_span%2Funset*_cache*_client*_404*N______-_span%2Funset*_cache*_client*_404*_url*_legacy*N______-_span%2Funset*_cache*_client*_404*_url*N______-_span%2Funset*_status*_jaxrs*_common*N______-_batch*N______receivers%3A*N______-_otlp*N____traces%2Fspanmetrics%3A*N______exporters%3A*N______-_otlphttp*N______-_spanmetrics*N______processors%3A*N______-_memory*_limiter%2Fspanmetrics*N______-_filter%2Fspanmetrics-prep*N______-_groupbyattrs%2Fgroup-by-ip*N______-_resource%2Fpod-ip-sem-conv*N______-_k8sattributes%2Ffrom-pod-ip*N______-_resource%2Fremove-k8s-pod-ip*N______-_span%2Fspanmetrics-destination-service*N______-_attributes%2Fspanmetrics-prep*N______-_transform%2Fspanmetrics-prep*N______-_span%2Fspanmetrics-fake-name*N______-_batch%2Fspanmetrics-prep*N______receivers%3A*N______-_zipkin*N__telemetry%3A*N____metrics%3A*N______readers%3A*N______-_pull%3A*N__________exporter%3A*N____________prometheus%3A*N______________host%3A_0.0.0.0*N______________port%3A_8888*N______________without*_type*_suffix%3A_true%7E
[agent-otelbin]: https://www.otelbin.io/#config=exporters%3A*N__debug%3A*N____verbosity%3A_normal*N__otlphttp%3A*N____endpoint%3A_https%3A%2F%2Fotlp.vendor.com*Nextensions%3A*N__health*_check%3A*N____endpoint%3A_*S%7Benv%3AMY*_POD*_IP%7D%3A13133*Nprocessors%3A*N__attributes%2Fconventions%3A*N____actions%3A*N____-_action%3A_delete*N______key%3A_service*_name*N____-_action%3A_delete*N______key%3A_service*_namespace*N____-_action%3A_delete*N______key%3A_service*_instance*_id*N____-_action%3A_delete*N______key%3A_service*_version*N__attributes%2Fkube-state-metrics%3A*N____actions%3A*N____-_action%3A_upsert*N______from*_attribute%3A_namespace*N______key%3A_k8s.namespace.name*N____-_action%3A_upsert*N______from*_attribute%3A_horizontalpodautoscaler*N______key%3A_k8s.hpa.name*N____-_action%3A_upsert*N______from*_attribute%3A_resourcequota*N______key%3A_k8s.resourcequota.name*N____-_action%3A_delete*N______key%3A_namespace*N____-_action%3A_delete*N______key%3A_horizontalpodautoscaler*N____-_action%3A_delete*N______key%3A_resourcequota*N__batch%3A*N____send*_batch*_max*_size%3A_512*N____send*_batch*_size%3A_512*N__cumulativetodelta%3A_null*N__filter%2Fprom*_scrape*_metrics%3A*N____metrics%3A*N______metric%3A*N______-_IsMatch*Cname%2C_%22scrape*_.**%22*D*N__filter%2Fzero*_value*_counts%3A*N____metrics%3A*N______datapoint%3A*N______-_value*_double_*E*E_0.0*N__groupbyattrs%2Fkube-state-metrics%3A*N____keys%3A*N____-_k8s.namespace.name*N____-_k8s.cluster.name*N____-_k8s.cluster.internal*_name*N____-_k8s.hpa.name*N____-_k8s.resourcequota.name*N__memory*_limiter%3A*N____check*_interval%3A_10s*N____limit*_percentage%3A_50*N____spike*_limit*_percentage%3A_1*N__metricstransform%2Fenvoy*_metrics%3A*N____transforms%3A*N____-_action%3A_update*N______include%3A_%5E.***Cejections*_active*D*S*N______match*_type%3A_regexp*N______new*_name%3A_envoy.cluster.outlier*_detection.ejections.active*N__resource%3A*N____attributes%3A*N____-_action%3A_insert*N______key%3A_k8s.cluster.name*N______value%3A_actual*_cluster*_name*N____-_action%3A_insert*N______key%3A_k8s.cluster.internal*_name*N______value%3A_internal*_cluster*_name*N__resource%2Fkube-state-metrics%3A*N____attributes%3A*N____-_action%3A_delete*N______key%3A_k8s.container.name*N____-_action%3A_delete*N______key%3A_k8s.namespace.name*N____-_action%3A_delete*N______key%3A_k8s.node.name*N____-_action%3A_delete*N______key%3A_k8s.pod.name*N____-_action%3A_delete*N______key%3A_k8s.pod.uid*N____-_action%3A_delete*N______key%3A_k8s.replicaset.name*N____-_action%3A_delete*N______key%3A_http.scheme*N____-_action%3A_delete*N______key%3A_net.host.name*N____-_action%3A_delete*N______key%3A_net.host.name*N____-_action%3A_delete*N______key%3A_net.host.port*N__transform%2Fnode*_ethtool*_convert*_gauge*_to*_sum%3A*N____metric*_statements%3A*N____-_context%3A_metric*N______statements%3A*N______-_convert*_gauge*_to*_sum*C%22cumulative%22%2C_true*D_where_IsMatch*Cname%2C_%22node*_ethtool*_.*P*_allowance*_exceeded%22*D*N________*E*E_true*N______-_convert*_gauge*_to*_sum*C%22cumulative%22%2C_true*D_where_IsMatch*Cname%2C_%22awscni*_.*P*_req*_count*S%22*D*N________*E*E_true*Nreceivers%3A*N__opencensus%3A_null*N__prometheus%3A*N____config%3A*N______scrape*_configs%3A*N______-_honor*_timestamps%3A_false*N________job*_name%3A_k8s*_by*_annotations*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_*C*Cotelcol%7Ckarpenter*D*_.*P*D*D*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________-_action%3A_drop*N__________regex%3A_*C*Ckarpenter*_build%7Ckarpenter*_scheduler*_queue*_depth*D*C*_.***D*Q*D*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_%22true%22*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*N________-_action%3A_keep*N__________regex%3A_.*P*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_port*N________-_action%3A_keep*N__________regex%3A_.*P*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_drop*N__________regex%3A_kube-state-metrics*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________regex%3A_*C%5B%5E%3A%5D*P*D*C*Q%3A%3A*Bd*P*D*Q%3B*C*Bd*P*D*N__________replacement%3A_*S*S1%3A*S*S2*N__________source*_labels%3A*N__________-_*_*_address*_*_*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_port*N__________target*_label%3A_*_*_address*_*_*N________-_action%3A_replace*N__________regex%3A_*Chttps*D*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scheme*N__________target*_label%3A_*_*_scheme*_*_*N________-_action%3A_replace*N__________regex%3A_*C.*P*D*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_path*N__________target*_label%3A_*_*_metrics*_path*_*_*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N__________target*_label%3A_job*N________-_action%3A_drop*N__________regex%3A_.**-envoy-prom*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_container*_port*_name*N________scrape*_interval%3A_30s*N________tls*_config%3A*N__________insecure*_skip*_verify%3A_true*N______-_honor*_timestamps%3A_false*N________job*_name%3A_k8s*_node*_exporter*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_node*_ethtool*_.*P*_allowance*_exceeded*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_prometheus-node-exporter*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_jobLabel*N__________target*_label%3A_job*N________-_action%3A_drop*N__________regex%3A_.**-envoy-prom*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_container*_port*_name*N________-_action%3A_replace*N__________regex%3A_*C.***D*N__________replacement%3A_*S*S1*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_kubernetes*_io*_arch*N__________target*_label%3A_host*_arch*N________scrape*_interval%3A_30s*N______-_honor*_timestamps%3A_false*N________job*_name%3A_aws*_vpc*_cni*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_*Cotelcol*D*_.*P*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_aws-node*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________regex%3A_*C%5B%5E%3A%5D*P*D*C*Q%3A%3A*Bd*P*D*Q*N__________replacement%3A_*S*S1%3A61678*N__________source*_labels%3A*N__________-_*_*_address*_*_*N__________target*_label%3A_*_*_address*_*_*N________scrape*_interval%3A_30s*N______-_honor*_timestamps%3A_false*N________job*_name%3A_argocd*_metrics*_scraper*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_*Cgo%7Cprocess%7Crest*D*_.*P*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_%22true%22*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*N________-_action%3A_keep*N__________regex%3A_.*P*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_port*N________-_action%3A_keep*N__________regex%3A_*Cargo-rollouts%7Cargocd-.***D*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N__________target*_label%3A_job*N________scrape*_interval%3A_30s*N________tls*_config%3A*N__________insecure*_skip*_verify%3A_true*N__prometheus%2Fenvoy-metrics%3A*N____config%3A*N______scrape*_configs%3A*N______-_job*_name%3A_envoy-stats*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_*Cenvoy*_cluster*D.***Coutlier*_detection*_ejections*_active*D*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________metrics*_path%3A_%2Fstats%2Fprometheus*N________params%3A*N__________filter%3A*N__________-_.**ejections*_active.***N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_.**-envoy-prom*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_container*_port*_name*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N__________target*_label%3A_job*N______-_job*_name%3A_envoy-stats-default-egress-gateways*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_istio*_tcp.***N__________source*_labels%3A*N__________-_*_*_name*_*_*N________metrics*_path%3A_%2Fstats%2Fprometheus*N________params%3A*N__________filter%3A*N__________-_istio*_tcp.***N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_default-egressgateway*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_type*N________-_action%3A_keep*N__________regex%3A_.**-envoy-prom*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_container*_port*_name*N________-_action%3A_replace*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*N__________target*_label%3A_job*N__prometheus%2Fkube-state-metrics%3A*N____config%3A*N______scrape*_configs%3A*N______-_honor*_timestamps%3A_false*N________job*_name%3A_kube-state-metrics*N________kubernetes*_sd*_configs%3A*N________-_role%3A_pod*N__________selectors%3A*N__________-_field%3A_spec.nodeName*E*S%7Benv%3ANODE*_NAME%7D*N____________role%3A_pod*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_kube*_resourcequota%7Ckube*_pod*_container*_status*_last*_terminated*_reason%7Ckube*_node*_status*_condition*N__________source*_labels%3A*N__________-_*_*_name*_*_*N________-_action%3A_drop*N__________regex%3A_%5E*C%5B%5EO%5D%7CO%5B%5EO%5D%7COO%5B%5EM%5D%7COOM%5B%5EK%5D%7COOMK%5B%5Ei%5D%7COOMKi%5B%5El%5D%7COOMKil%5B%5El%5D%7COOMKill%5B%5Ee%5D%7COOMKille%5B%5Ed%5D*S*D.***N__________source*_labels%3A*N__________-_reason*N________relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_service*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_instance*N________-_action%3A_keep*N__________regex%3A_kube-state-metrics*N__________source*_labels%3A*N__________-_*_*_meta*_kubernetes*_pod*_label*_app*_kubernetes*_io*_name*N________-_action%3A_replace*N__________regex%3A_*C%5B%5E%3A%5D*P*D*C*Q%3A%3A*Bd*P*D*Q%3B*C*Bd*P*D*N__________replacement%3A_*S*S1%3A*S*S2*N__________source*_labels%3A*N__________-_*_*_address*_*_*N__________-_*_*_meta*_kubernetes*_pod*_annotation*_prometheus*_io*_scrape*_port*N__________target*_label%3A_*_*_address*_*_*N________scrape*_interval%3A_30s*N__prometheus%2Fkubelet%3A*N____config%3A*N______scrape*_configs%3A*N______-_bearer*_token*_file%3A_%2Fvar%2Frun%2Fsecrets%2Fkubernetes.io%2Fserviceaccount%2Ftoken*N________honor*_timestamps%3A_false*N________job*_name%3A_kubelet*N________metric*_relabel*_configs%3A*N________-_action%3A_keep*N__________regex%3A_kubelet*_*Cpod*_start%7Cevictions%7Cimage*_pull*_duration%7Cnode*_startup*_duration%7Cpleg*_relist%7Cpreemptions%7Crunning*_containers%7Crunning*_pods*D.***N__________source*_labels%3A*N__________-_*_*_name*_*_*N________metrics*_path%3A_%2Fapi%2Fv1%2Fnodes%2F*S%7Benv%3ANODE*_NAME%7D%2Fproxy%2Fmetrics*N________scheme%3A_https*N________static*_configs%3A*N________-_targets%3A*N__________-_kubernetes.default.svc*N__zipkin%3A*N____endpoint%3A_*S%7Benv%3AMY*_POD*_IP%7D%3A9411*Nservice%3A*N__extensions%3A*N__-_health*_check*N__pipelines%3A*N____metrics%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_filter%2Fprom*_scrape*_metrics*N______-_batch*N______-_transform%2Fnode*_ethtool*_convert*_gauge*_to*_sum*N______-_attributes%2Fconventions*N______-_resource*N______receivers%3A*N______-_prometheus*N____metrics%2Fenvoy-metrics%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_filter%2Fzero*_value*_counts*N______-_filter%2Fprom*_scrape*_metrics*N______-_batch*N______-_metricstransform%2Fenvoy*_metrics*N______-_attributes%2Fconventions*N______-_resource*N______receivers%3A*N______-_prometheus%2Fenvoy-metrics*N____metrics%2Fkube-state-metrics%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_filter%2Fprom*_scrape*_metrics*N______-_batch*N______-_resource*N______-_resource%2Fkube-state-metrics*N______-_attributes%2Fkube-state-metrics*N______-_groupbyattrs%2Fkube-state-metrics*N______receivers%3A*N______-_prometheus%2Fkube-state-metrics*N____metrics%2Fkubelet%3A*N______exporters%3A*N______-_otlphttp*N______processors%3A*N______-_memory*_limiter*N______-_batch*N______-_attributes%2Fconventions*N______-_resource*N______receivers%3A*N______-_prometheus%2Fkubelet*N__telemetry%3A*N____logs%3A*N______level%3A_info*N____metrics%3A*N______readers%3A*N______-_pull%3A*N__________exporter%3A*N____________prometheus%3A*N______________host%3A_*S%7Benv%3AMY*_POD*_IP%7D*N______________port%3A_8888*N______________without*_type*_suffix%3A_true%7E
