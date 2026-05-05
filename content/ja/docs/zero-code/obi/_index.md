---
title: OpenTelemetry eBPF 計装
linkTitle: OBI
description: 自動計装に OpenTelemetry eBPF 計装を使用する方法を学びます。
weight: 3
cascade:
  OTEL_RESOURCE_ATTRIBUTES_APPLICATION: obi
  OTEL_RESOURCE_ATTRIBUTES_NAMESPACE: obi
  OTEL_RESOURCE_ATTRIBUTES_POD: obi
default_lang_commit: 6751402db060c25800bb41c270dcaebb48aa7acb
cSpell:ignore: CAP_PERFMON
---

OpenTelemetry ライブラリは、一般的なプログラミング言語やフレームワーク向けのテレメトリー収集機能を提供します。
しかし、分散トレーシングの導入は複雑になる場合があります。
Go や Rust などの一部のコンパイル型言語では、コードにトレースポイントを手動で追加する必要があります。

OpenTelemetry eBPF 計装（OBI）は、アプリケーションのオブザーバビリティを簡単に開始するための自動計装ツールです。
OBI は eBPF を使用して、アプリケーションの実行可能ファイルと OS ネットワーク層を自動的に検査し、Web トランザクションや Linux HTTP/S および gRPC サービスの Rate Errors Duration（RED）指標に関連するトレーススパンをキャプチャします。
すべてのデータキャプチャは、アプリケーションのコードや構成を変更することなく行われます。

OBI は以下の機能を提供します。

- **幅広い言語サポート**: Java（JDK 8+）、.NET、Go、Python、Ruby、Node.js、C、C++、および Rust
- **軽量**: コード変更不要、ライブラリインストール不要、再起動不要
- **効率的な計装**: トレースとメトリクスは、最小限のオーバーヘッドで eBPF プローブによってキャプチャ
- **分散トレーシング**: 分散トレーススパンがキャプチャされ、Collector に送信される
- **ログエンリッチメント**: JSON ログをトレースコンテキストでエンリッチしてトレースと相関させる
- **Kubernetes ネイティブ**: Kubernetes アプリケーションに構成不要の自動計装を提供
- **暗号化された通信の可視性**: TLS/SSL 経由のトランザクションを復号化せずにキャプチャ
- **コンテキスト伝搬**: サービス間でトレースコンテキストを自動的に伝搬
- **プロトコルサポート**: HTTP/S、gRPC、gRPC-Web、JSON-RPC、MQTT、Memcached など
- **データベース計装**: PostgreSQL（pgx ドライバーを含む）、MySQL、MongoDB、Redis、Couchbase（N1QL/SQL++ および KV プロトコル）
- **生成AI 計装**: OpenAI、Anthropic Claude、Google AI Studio（Gemini）、および AWS Bedrock API 呼び出しのトレースとメトリクス（ペイロードの自動抽出を含む）
- **低カーディナリティメトリクス**: コスト削減のための低カーディナリティの Prometheus 互換メトリクス
- **ネットワークのオブザーバビリティ**: ホストレベルの TCP RTT 統計とともにサービス間のネットワークフローをキャプチャ
- **強化されたサービスディスカバリー**: DNS 解決によるサービス名の検索の改善
- **Collector との統合**: OBI を OpenTelemetry Collector レシーバーコンポーネントとして実行

## 最近のハイライト（v0.8.0） {#recent-highlights-v080}

OBI v0.8.0 は、プロトコルカバレッジ、ペイロード抽出、およびデプロイメントドキュメントを拡張しました。

- **汎用 Go トレーシングの改善**: 汎用リクエストのコンテキスト伝搬を含む、汎用 Go プロトコルサポートを追加
- **プロトコルカバレッジの拡大**: すべての言語で JSON-RPC サポートを追加
- **より深い HTTP ペイロード抽出**: 完全な HTTP ボディ抽出を追加し、レスポンスボディの制限付き解凍をサポート
- **より広い生成 AI カバレッジ**: Google AI Studio（Gemini）と AWS Bedrock のペイロード抽出を追加し、Vertex AI Gemini サポートを修正
- **名前付き CIDR ラベル**: ネットワークメトリクスで設定された CIDR 範囲に人間が読みやすい名前をラベル付けできるようになりました
- **新しいサンプルシナリオ**: 既存の NGINX ウォークスルーに加えて、Apache HTTP Server のサンプルを追加
- **サポートドキュメント**: リリース成果物とサポートされる環境のプロジェクトサポートマトリクスを追加

完全な変更リストとアップグレードノートについては、
[リリースノート](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.8.0)を参照してください。

上流のサンプルを確認するには、
[NGINX ウォークスルー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.8.0/examples/nginx)と
[Apache ウォークスルー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.8.0/examples/apache)を参照してください。

## OBI の仕組み {#how-obi-works}

以下の図は、OBI の高レベルアーキテクチャと、eBPF 計装がテレメトリーパイプラインにどのように適合するかを示しています。

![OBI eBPF architecture](./ebpf-arch.svg)

## 互換性 {#compatibility}

OBI は、以下の要件を満たす Linux 環境をサポートしています。

| 要件              | サポート対象                                                                    |
| :--------------- | :----------------------------------------------------------------------------- |
| CPU アーキテクチャ | `amd64`、`arm64`                                                               |
| Linux カーネル    | `5.8+`、または必要な eBPF バックポートが適用された RHEL ファミリーのカーネルバージョン `4.18+` の Linux  |
| カーネル機能      | BTF                                                                            |
| 権限             | Root、または有効化された OBI 機能に必要な Linux ケーパビリティ                   |

OBI は以下のサポートされたリリース成果物を公開しています。

| 成果物                                           | サポートされるプラットフォーム          |
| :----------------------------------------------- | :--------------------------- |
| `obi` バイナリアーカイブ                           | Linux `amd64`, Linux `arm64` |
| `k8s-cache` バイナリアーカイブ                     | Linux `amd64`, Linux `arm64` |
| `otel/ebpf-instrument` コンテナイメージ            | Linux `amd64`, Linux `arm64` |
| `otel/ebpf-instrument-k8s-cache` コンテナイメージ  | Linux `amd64`, Linux `arm64` |

OBI は、要件を満たす環境であれば、スタンドアロン Linux ホスト、コンテナ、および Kubernetes にデプロイできます。

OBI は、Linux 以外のオペレーティングシステム、`amd64` および `arm64` 以外の Linux アーキテクチャ、BTF のない Linux 環境、またはドキュメントに示されている `4.18+` の RHEL ファミリーという例外を除き、Linux `5.8` より古いカーネルバージョンをサポートしていません。

機能固有のサポートの詳細については、以下のガイドに記載されています。

- [分散トレース](distributed-traces/): コンテキスト伝搬のサポート、ランタイム固有の要件、および分散トレーシングの制限
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
