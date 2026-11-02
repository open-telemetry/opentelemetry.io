---
title: OpenTelemetry eBPF 計装
linkTitle: OBI
description: 自動計装に OpenTelemetry eBPF 計装を使用する方法を学びます。
weight: 3
cascade:
  OTEL_RESOURCE_ATTRIBUTES_APPLICATION: obi
  OTEL_RESOURCE_ATTRIBUTES_NAMESPACE: obi
  OTEL_RESOURCE_ATTRIBUTES_POD: obi
default_lang_commit: ab6ef133372515d3267cf99f06d4e5f8db0ef409
cSpell:ignore: Aerospike Ollama Qwen SunRPC
---

OpenTelemetry ライブラリは、一般的なプログラミング言語やフレームワーク向けのテレメトリー収集機能を提供します。
しかし、分散トレーシングの導入は複雑になる場合があります。
Go や Rust などの一部のコンパイル型言語では、コードにトレースポイントを手動で追加する必要があります。

OpenTelemetry eBPF 計装（OBI）は、アプリケーションのオブザーバビリティを簡単に開始するための自動計装ツールです。
OBI は eBPF を使用して、アプリケーションの実行可能ファイルと OS ネットワーク層を自動的に検査し、サポートされた Linux ワークロードのトレーススパン、Rate Errors Duration（RED）指標、ランタイム指標、アプリケーションおよびネットワークの関係をキャプチャします。
すべてのデータキャプチャは、アプリケーションのコードや構成を変更することなく行われます。

OBI は以下の機能を提供します。

- **幅広い言語サポート**: Java（JDK 8+）、.NET、Go、Python、Ruby、Node.js、C、C++、および Rust
- **軽量**: コード変更不要、ライブラリインストール不要、再起動不要
- **効率的な計装**: トレースとメトリクスは、最小限のオーバーヘッドで eBPF プローブによってキャプチャ
- **分散トレーシング**: 分散トレーススパンがキャプチャされ、Collector に送信される
- **ログエンリッチメント**: JSON およびプレーンテキストのログをトレースコンテキストでエンリッチしてトレースと相関させる
- **Kubernetes ネイティブ**: Kubernetes アプリケーションに構成不要の自動計装を提供
- **暗号化された通信の可視性**: TLS/SSL 経由のトランザクションを復号化せずにキャプチャ
- **コンテキスト伝搬**: サービス間でトレースコンテキストを自動的に伝搬
- **プロトコルサポート（クライアントおよびサーバー）**: HTTP/S、HTTP/2、gRPC、Kafka、NATS、MQTT、Memcached、SunRPC（NFS を含む）、および JSON-RPC
- **プロトコルサポート（クライアントのみ）**: AMQP 1.0 および DNS クエリ
- **データベース計装（クライアントおよびサーバー）**: PostgreSQL（pgx ドライバーを含む）、MySQL、MSSQL、および Redis
- **データベース計装（クライアントのみ）**: MongoDB、Couchbase（N1QL/SQL++ および KV プロトコル）、Aerospike、Elasticsearch、および OpenSearch
- **HTTP ペイロード計装**: サーバーサイドの GraphQL とクライアントサイドの Elasticsearch、OpenSearch、および AWS S3、SQS、SNS、さらにクライアントとサーバーの両方での MCP over JSON-RPC
- **生成 AI 計装**: OpenAI、OpenAI 互換ゲートウェイ、Ollama、Anthropic Claude、Google AI Studio（Gemini）、AWS Bedrock、Qwen（DashScope）、MCP over JSON-RPC、埋め込みおよび再ランク API、およびベクトル検索システムのトレースとメトリクス
- **ランタイムメトリクス**: SDK を変更せずに Go、JVM、.NET、Node.js、および Python のランタイムメトリクスを収集
- **GPU 計装**: Linux でサポートされた CUDA ランタイムオペレーションをキャプチャ
- **スパンおよびサービスグラフメトリクス**: アプリケーションのスパンメトリクスとサービス間の関係をエクスポート
- **低カーディナリティメトリクス**: コスト削減のための低カーディナリティの Prometheus 互換メトリクス
- **ネットワークのオブザーバビリティ**: バイトおよびパケットカウンター、TCP RTT、再送、接続、ソケット I/O メトリクスとともにサービス間のネットワークフローをキャプチャ
- **強化されたサービスディスカバリー**: DNS 解決によるサービス名の検索の改善
- **Collector との統合**: OBI を OpenTelemetry Collector レシーバーコンポーネントとして実行

## 最近のハイライト（v0.15.2） {#recent-highlights-v0152}

OBI v0.15.2 は、未公開の v0.15.0 および v0.15.1 リリースを置き換えるものです。
v0.15.0 で意図された変更、BPF ベリファイアの修正、およびリリースアーティファクトのビルド修正が含まれています。
v0.14.0 からアップグレードする場合は v0.15.2 をインストールしてください。

- **Go 手動スパン**: 別途 Auto SDK モジュールを必要とせず、Go Trace API に組み込まれた Auto SDK を通じてスパンをキャプチャ
- **.NET 計装**: ルートハーベスティングを拡張し、CPU および最終コレクション時のヒープサイズメトリクスを追加
- **エンドポイント名**: オプトインの AWS Route53 ホストゾーン名前解決を追加
- **Config v2**: メトリクスファミリーを明示的に選択し、プロトコルメトリクススイッチをスパンメトリクスおよびサービスグラフに適用
- **Collector 統合**: インポートパスを維持しながら、レシーバーを別の Go モジュールとして公開
- **正確性の修正**: 誤分類されたソケットへの HTTP/2 コンテキストインジェクションを防止し、衝突するメトリクスラベルタプルを分離し、重複した `target.info` カウントを修正し、OTLP/HTTP JSON トレースエンコーディングを修正

[v0.15.2 アップグレードノート](#upgrade-notes-for-v0152)と[リリースノート](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.15.2)で、ダッシュボード、メトリクスカーディナリティ、およびトレース処理に影響する変更を確認してください。

上流のサンプルを確認するには、
[NGINX ウォークスルー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.15.2/examples/nginx)と
[Apache ウォークスルー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.15.2/examples/apache)を参照してください。

## v0.15.2 のアップグレードノート {#upgrade-notes-for-v0152}

- `go.opentelemetry.io/obi/collector` モジュールの `v0.15.2` で Collector ディストリビューションをビルドしてください。
  ルートモジュールにはレシーバーパッケージが含まれなくなりました。
  更新されたモジュール置換とコンポーネントバージョンについては、[Collector レシーバーのセットアップ](configure/collector-receiver/)を参照してください。
  Go エンベッダーは、削除された `PrometheusConfig.Registry` フィールドを Prometheus HTTP ポート設定に置き換える必要もあります。
- Config v2 プロトコルの `enabled.metrics: false` は、そのプロトコルのスパンメトリクスとサービスグラフも抑制するようになりました。
  トレースは引き続き独立して設定できます。
  Config v1 の計装リストと導出されたメトリクスカバレッジが異なる場合は、移行レポートを確認してください。
  [メトリクス機能の選択](configure/config-v2/#metric-feature-selection)を参照してください。
- HTTP クライアントの `server.address` 値は Host ヘッダーのポートを省略します。
  `server.port` と `url.full` はポートを保持します。
  ポートを持つ Kubernetes Service ホストはサービスとネームスペースに解決されるようになり、サービスグラフ名が変わる可能性があります。
- gRPC スパン名と `rpc.method` 値は先頭のスラッシュを省略します。
  無効またはまだ読み取られていないパスはスパン名 `grpc` とメソッド `_OTHER` を使用します。
  `rpc.method_original` はキャプチャされた生パスを保持します。
  ONC RPC は CALL がキャプチャされた場合にのみ `{program}/{procedure}` メソッドを使用し、REPLY がある場合にのみレスポンスステータスを報告します。
- GenAI、データベース、GraphQL、AWS S3/SQS、および ONC RPC のスパン名はセマンティック規約に従うように変更されました。
  たとえば、Anthropic の `message` は `chat` に、GraphQL サーバー名は `GraphQL` を省略し、S3/SQS の名前は `S3.`/`SQS.` 接頭辞を使用します。
  スパン名フィルターとスパンメトリクスクエリを更新してください。
- データベースの持続時間メトリクスにはデフォルトで `db.collection.name` が含まれるようになりました。
  RPC クライアントの持続時間に `server.port` が追加され、失敗した RPC サーバーの持続時間に `error.type` が追加されました。
  メッセージングクライアントの持続時間に `messaging.operation.type` が追加されます。
  クライアントとプロセスの持続時間にはサブスクリプション名が存在する場合に含まれます。
  これらのデフォルトはメトリクス系列を分割する可能性があります。
  [メトリクス属性](metrics/#attributes-of-obi-metrics)を参照してください。
- MQTT SUBSCRIBE テレメトリーは宛先名のかわりに `messaging.destination.subscription.name` を使用し、スパン名からフィルターを省略します。
  共有サブスクリプションは `messaging.consumer.group.name` も報告します。
  AWS SNS スパンには `rpc.system.name` と `rpc.method` が含まれなくなりました。
- GraphQL、MCP、および JSON-RPC サーバースパンは HTTP メソッド、ステータス、ルート、URL、ボディサイズ、ユーザーエージェント、または OBI レスポンス監視属性を含まなくなりました。
  キャプチャされた HTTP ヘッダーはプレーン HTTP および GraphQL スパンに限定されます。
  OTLP GenAI メトリクスはリクエストモデルが欠落している場合にそれを省略し、AMQP メトリクスは空の宛先を省略します。
- テレメトリースキーマは以前の変換を保持したまま `0.15.2` に更新されました。
  テレメトリーレジストリは Weaver `definition/2` を使用します。
  スパンリファレンス ID に `span.` 接頭辞が付かなくなったため、古いカタログアンカーへのリンクを更新してください。

v0.14.0 より古いリリースからアップグレードする場合は、以下の以前の変更も確認してください。
リリースノートには、追加のプロトコル固有の命名と属性の変更が記載されています。

## v0.14.0 のアップグレードノート {#upgrade-notes-for-v0140}

- HTTP の持続時間およびボディサイズメトリクスは、失敗したリクエストにデフォルトで `error.type` を含むようになりました。
  Prometheus 系列に `error_type` ラベルが追加され、成功したリクエストでは空の値になります。
  古い系列に依存するダッシュボードとアラートクエリを確認してください。
- OTLP スパンメトリクスは `host.id` を各データポイントにコピーしなくなりました。
  値はリソース属性と `target_info` に残ります。
  OBI の Prometheus エクスポーターは変更されていません。
  OTLP リソースを Prometheus ラベルにフラット化するコンシューマーは、`host_id` クエリを確認してください。
- `service.peer.name`、`http.request.body.size`、`http.response.body.size`、および `obi.http.response.observed` はオプトインのスパン属性になりました。
  必要な場合は [`attributes.select.traces.include`](configure/metrics-traces-attributes/) で選択してください。
  サービスグラフプロセッサーには `service.peer.name` が必要な場合があります。
- 固定された `traces_ctx_v1` マップはデフォルトでは設定されなくなりました。
  外部トレースプロファイル相関と Go チャネルハンドオフフォールバックは、[`ebpf.populate_trace_context: true`](configure/metrics-traces-attributes/) で復元できます。
- ターゲット宣言は引き続きリソースメタデータより優先されます。
  解決されたターゲットメタデータはエージェント自身の `OTEL_RESOURCE_ATTRIBUTES` より優先されるようになり、値はキーごとにマージされます。
- Elastic Cloud クライアントスパンとデータベースオペレーションメトリクスに `X-Found-Handling-Cluster` からの `db.namespace` が含まれるようになりました。
  既存のメトリクス系列がクラスターごとに分割される可能性があります。
  AWS SQS スパンには `aws.extended_request_id` が含まれなくなりました。

## OBI の仕組み {#how-obi-works}

以下の図は、OBI の高レベルアーキテクチャと、eBPF 計装がテレメトリーパイプラインにどのように適合するかを示しています。

![OBI eBPF architecture](./ebpf-arch.svg)

## 互換性 {#compatibility}

OBI は、以下の要件を満たす Linux 環境をサポートしています。

| 要件               | サポート対象                                                                                            |
| :----------------- | :------------------------------------------------------------------------------------------------------ |
| CPU アーキテクチャ | `amd64`、`arm64`                                                                                        |
| Linux カーネル     | `5.8+`、または必要な eBPF バックポートが適用された RHEL ファミリーのカーネルバージョン `4.18+` の Linux |
| カーネル機能       | BTF                                                                                                     |
| 権限               | Root、または有効化された OBI 機能に必要な Linux ケーパビリティ                                          |

OBI は以下のサポートされたリリース成果物を公開しています。

| 成果物                                               | サポートされるプラットフォーム |
| :--------------------------------------------------- | :----------------------------- |
| `obi` バイナリアーカイブ                             | Linux `amd64`, Linux `arm64`   |
| `otel/ebpf-instrument` コンテナイメージ              | Linux `amd64`, Linux `arm64`   |
| `otel/opentelemetry-ebpf-k8s-cache` コンテナイメージ | Linux `amd64`, Linux `arm64`   |

OBI は、要件を満たす環境であれば、スタンドアロン Linux ホスト、コンテナ、および Kubernetes にデプロイできます。

OBI は、Linux 以外のオペレーティングシステム、`amd64` および `arm64` 以外の Linux アーキテクチャ、BTF のない Linux 環境、またはドキュメントに示されている `4.18+` の RHEL ファミリーという例外を除き、Linux `5.8` より古いカーネルバージョンをサポートしていません。

機能固有のサポートの詳細については、以下のガイドに記載されています。

- [分散トレース](distributed-traces/): コンテキスト伝搬のサポート、ランタイム固有の要件、および分散トレーシングの制限
- [トレースコンテキストの関連付け](context-propagation/): 非同期およびスレッドによるリクエスト処理における親子関連付けのサポート
- [データのエクスポート](configure/export-data/): プロトコル、データベース、メッセージング、生成AI、GPU、および Go ライブラリ計装のサポート

## 制限事項 {#limitations}

OBI は、コード変更なしにアプリケーションとプロトコルのオブザーバビリティを提供しますが、すべてのシナリオで言語レベルの計装を置き換えるものではありません。
カスタムスパン、アプリケーション固有の属性、ビジネスイベント、または eBPF ベースの計装が自動的に取得できないその他のインプロセステレメトリーが必要な場合は、言語エージェントまたは手動による計装を使用してください。

OBI はネットワークとプロトコルのアクティビティを自動的にキャプチャできますが、eBPF 観測ポイントから見えないアプリケーション固有の詳細を常に復元できるわけではありません。

一部の機能には、コアプラットフォーム要件よりも追加の注意事項やサポート範囲の制限があります。
詳細については、[分散トレース](distributed-traces/)と[エクスポートされた計装](configure/export-data/)の機能固有のドキュメントを参照してください。

OBI が必要とするケーパビリティの包括的なリストについては、[セキュリティ、権限、およびケーパビリティ](security/)を参照してください。

## OBI を使い始める {#get-started-with-obi}

- Docker または Kubernetes で OBI を使い始めるには、[セットアップ](setup/)ドキュメントに従ってください。
- [トレースとログの相関](./trace-log-correlation/)について学び、トレースとアプリケーションログを接続し、JSON ログをトレースコンテキストでエンリッチします。
- 集中テレメトリー処理のために [OBI を Collector レシーバーとして実行](./configure/collector-receiver/)する方法を確認します。

## トラブルシューティング {#troubleshooting}

- 一般的な問題のヘルプについては、[トラブルシューティング](./troubleshooting)ガイドを参照してください。
