---
title: OpenTelemetry eBPF 計装
linkTitle: OBI
description: 自動計装に OpenTelemetry eBPF 計装を使用する方法を学びます。
weight: 3
cascade:
  OTEL_RESOURCE_ATTRIBUTES_APPLICATION: obi
  OTEL_RESOURCE_ATTRIBUTES_NAMESPACE: obi
  OTEL_RESOURCE_ATTRIBUTES_POD: obi
default_lang_commit: df7ca870f2ec59453948ced42ca0d76bfd5e53d5
cSpell:ignore: Aerospike HotSpot Ollama Qwen SunRPC uprobe
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
- **HTTP ペイロード計装**: サーバーサイドの GraphQL とクライアントサイドの Elasticsearch、OpenSearch、AWS S3、および AWS SQS、さらにクライアントとサーバーの両方での MCP over JSON-RPC
- **生成 AI 計装**: OpenAI、OpenAI 互換ゲートウェイ、Ollama、Anthropic Claude、Google AI Studio（Gemini）、AWS Bedrock、Qwen（DashScope）、MCP over JSON-RPC、埋め込みおよび再ランク API、およびベクトル検索システムのトレースとメトリクス
- **ランタイムメトリクス**: SDK を変更せずに Go、HotSpot JVM、および Node.js イベントループのメトリクスを収集
- **GPU 計装**: Linux でサポートされた CUDA ランタイムオペレーションをキャプチャ
- **スパンおよびサービスグラフメトリクス**: アプリケーションのスパンメトリクスとサービス間の関係をエクスポート
- **低カーディナリティメトリクス**: コスト削減のための低カーディナリティの Prometheus 互換メトリクス
- **ネットワークのオブザーバビリティ**: バイトおよびパケットカウンター、TCP RTT、再送、接続、ソケット I/O メトリクスとともにサービス間のネットワークフローをキャプチャ
- **強化されたサービスディスカバリー**: DNS 解決によるサービス名の検索の改善
- **Collector との統合**: OBI を OpenTelemetry Collector レシーバーコンポーネントとして実行

## 最近のハイライト（v0.12.1） {#recent-highlights-v0121}

OBI v0.12.1 は、v0.12.0 に向けて準備された変更の公開リリースです。
v0.12.0 はタグ付けされましたが、リリースバリデーションが失敗したため公開されませんでした。
v0.12.0 で意図された変更とリリース修正を含む v0.12.1 をインストールしてください。

主な変更点は以下の通りです。

- **Node.js 手動スパン**: アプリケーションが OpenTelemetry SDK を登録していない場合に、`@opentelemetry/api` で作成されたスパンをキャプチャ
- **Node.js ランタイムメトリクス**: イベントループの時間、使用率、遅延のメトリクスを追加
- **より精密な Config v2 フィルター**: プロトコルおよびシグナルごとにアプリケーションフィルターを独立して適用
- **プロセスコンテキストエンリッチメント**: 計装対象プロセスが実験的な `OTEL_CTX` マッピングを通じて公開するリソース属性とメタデータを読み取り
- **データベースサーバーメトリクス**: サーバーサイドの Redis、Memcached、および SQL オペレーション向けに `db.server.operation.duration` を追加
- **改善された Java サービス名**: `java` にフォールバックする前に、Spring Boot アプリケーション名、JAR マニフェストタイトル、または JAR ベース名を使用
- **信頼性の修正**: プライベートスタックカーネルを uprobe プリエンプションから保護し、必要なプローブがアタッチできない場合の安全でないコンテキスト伝搬を回避し、トレースの親子関係、ラップされた Go TLS 接続、短命プロセスのログエンリッチメント、および OTLP 属性処理を修正

完全な変更リストとアップグレードノートについては、
[リリースノート](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.12.1)を参照してください。

上流のサンプルを確認するには、
[NGINX ウォークスルー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.12.1/examples/nginx)と
[Apache ウォークスルー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.12.1/examples/apache)を参照してください。

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
