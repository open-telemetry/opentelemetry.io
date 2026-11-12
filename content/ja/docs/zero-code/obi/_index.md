---
title: OpenTelemetry eBPF 計装
linkTitle: OBI
description: 自動計装に OpenTelemetry eBPF 計装を使用する方法を学びます。
weight: 3
cascade:
  OTEL_RESOURCE_ATTRIBUTES_APPLICATION: obi
  OTEL_RESOURCE_ATTRIBUTES_NAMESPACE: obi
  OTEL_RESOURCE_ATTRIBUTES_POD: obi
default_lang_commit: 9c32e973d7dd7fa0ec965d45a20954b7a4a613b2
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

## 安定性 {#stability}

OBI v1.0.0 は最初の安定リリースです。
以下の互換性を保証します。

- [`go.opentelemetry.io/obi`](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0/VERSIONING.md#go-module-api) のパブリック Go API。
- Config v2、その生成スキーマ、および OpenTelemetry 宣言的設定のサポートされたサブセット。
- ドキュメント化された CLI フラグ、環境変数、リリースバイナリ、およびコンテナイメージの動作。
- OTLP と組み込み Prometheus 出力の両方で `stable` に分類されたテレメトリー。
- サポートされた環境、およびドキュメント化されたアップグレードと非推奨のルール。

これらの保証を破る変更には新しいメジャーバージョンが必要です。
マイナーリリースは互換性のある機能を追加でき、パッチリリースは互換性を維持します。
[リリースノート](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v1.0.0)と[バージョニングポリシー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0/VERSIONING.md#compatibility-and-release-rules-after-v1)を参照してください。

[コレクターレシーバー](configure/collector-receiver/)は v0 リリースラインで個別にバージョン管理されています。
`stable` とマークされていないテレメトリーと属性は引き続き変更される可能性があり、セマンティック規約の整合が進められている間はネットワークフロー属性名も同様です。
[テレメトリーの安定性](metrics/#stability)を参照してください。

## v1.0.0 へのアップグレード {#upgrade-to-v100}

- [Config v2](configure/config-v2/) を使用してください。
  Config v1 は引き続きサポートされますが、バグ修正や新機能は提供されません。
  [移行ガイド](configure/migrate-to-config-v2/)に従い、移行された設定をロールアウト前に1つのインスタンスでテストしてください。
- コレクターレシーバーは `v0.15.2` のままです。
  コアの `v1.0.0` は個別に選択してください。
  [コレクターレシーバーのセットアップ](configure/collector-receiver/)を参照してください。
- テレメトリースキーマ URL は `0.15.2` から `1.0.0` に変更されます。
  スキーマは以前の変換を保持し、新しいリネームは追加されません。
  スキーマの制限については[テレメトリーの安定性](metrics/#stability)を参照してください。

v1.0.0-rc.1 または v0.15.2 より前のリリースからアップグレードする場合は、[v0.15.2 リリースノート](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.15.2)でスパン名、デフォルトのメトリクス属性、Prometheus ラベル、および Go 設定 API の変更を確認してください。
v0.14.0 より前のリリースからアップグレードする場合は、[v0.14.0 リリースノート](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.14.0)も確認してください。
ロールアウト中は[既知の運用上の制限事項](#limitations)を確認してください。

上流のサンプルを確認するには、
[NGINX ウォークスルー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v1.0.0/examples/nginx)と
[Apache ウォークスルー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v1.0.0/examples/apache)を参照してください。

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

[サポートマトリクス](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0/SUPPORT_MATRIX.md)で、サポートされた環境と機能固有の要件を定義しています。

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

既知の制限事項と未解決の報告には以下が含まれます。

- Kubernetes Pod の起動または再起動後にアプリケーションメトリクスが欠落したままになることがあります。
  OBI を再起動すると復元できます。
  [アプリケーションメトリクスの欠落](troubleshooting/#missing-application-metrics-after-a-pod-restart)を参照してください。
- あるユーザーが OBI v0.9.0/v0.10.0 を OpenShift 4.16 で使用した際に[子スパンのタイムスタンプが親スパンのタイムスタンプより早くなる](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/2568)ことを報告しました。
  [報告された条件](troubleshooting/#reported-span-timestamp-anomalies)を参照してください。
- OBI がメタデータを解決できない場合、サービスグラフに `outgoing` の宛先が表示されたり、同じサービスに対して Kubernetes 名と OpenTelemetry 名が別々に表示されたりすることがあります。
  [サービスグラフの制限事項](metrics/#service-graph-limitations)を参照してください。

OBI が必要とするケーパビリティの包括的なリストについては、[セキュリティ、権限、およびケーパビリティ](security/)を参照してください。

## OBI を使い始める {#get-started-with-obi}

- Docker または Kubernetes で OBI を使い始めるには、[セットアップ](setup/)ドキュメントに従ってください。
- [トレースとログの相関](./trace-log-correlation/)について学び、トレースとアプリケーションログを接続し、JSON ログをトレースコンテキストでエンリッチします。
- 集中テレメトリー処理のために [OBI を Collector レシーバーとして実行](./configure/collector-receiver/)する方法を確認します。

## トラブルシューティング {#troubleshooting}

- 一般的な問題のヘルプについては、[トラブルシューティング](./troubleshooting)ガイドを参照してください。
