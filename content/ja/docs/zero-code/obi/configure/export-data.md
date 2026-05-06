---
title: OBI の Prometheus および OpenTelemetry データエクスポート設定
linkTitle: データのエクスポート
description:
  OBI コンポーネントが Prometheus 形式と OpenTelemetry 形式のメトリクスおよび
  OpenTelemetry 形式のトレースをエクスポートするよう設定する
weight: 10
# prettier-ignore
cSpell:ignore: AsterixDB couchbase genai gonic jackc libcudart memcached pgxpool pyserver segmentio spanmetrics
default_lang_commit: dc2fb5771163265cb804a39b1dacc536b95bdb96
---

OBI は OpenTelemetry 形式のメトリクスとトレースを OTLP エンドポイントにエクスポートできます。

## 計装の互換性 {#instrumentation-compatibility}

OBI はトレースとメトリクスの計装において、以下のプロトコルと機能バージョンをサポートします。

| 領域          | サポートバージョン      | 備考                                                                                                     |
| :------------ | :---------------------- | :------------------------------------------------------------------------------------------------------- |
| HTTP          | `1.0/1.1`               | コンテキスト伝搬をサポートします。                                                                       |
| HTTP          | `2.0`                   | コンテキスト伝搬には Go ライブラリレベルの計装が必要です。                                               |
| gRPC          | `1.0+`                  | OBI 起動前から続く長期接続ではメソッド名に `*` が使用される場合があります。                              |
| MySQL         | すべて                  | OBI 起動前に作成されたプリペアドステートメントにはクエリテキストが含まれない場合があります。             |
| PostgreSQL    | すべて                  | OBI 起動前に作成されたプリペアドステートメントにはクエリテキストが含まれない場合があります。             |
| Redis         | すべて                  | 既存の接続にはデータベース番号または `db.namespace` が含まれない場合があります。                         |
| MongoDB       | `5.0+`                  | 圧縮ペイロードはサポートされていません。                                                                 |
| Couchbase     | すべて                  | OBI 起動前にネゴシエーションが完了した場合、バケット名またはコレクション名が利用できない場合があります。 |
| Memcached     | すべて                  | `quit` とメタコマンドを除く ASCII テキストプロトコルのサブセットをサポートします。                       |
| Kafka         | すべて                  | フェッチ API バージョン `13+` ではトピック名のルックアップが失敗する場合があります。                     |
| MQTT          | `3.1.1/5.0`             | ペイロードはキャプチャされません。                                                                       |
| GraphQL       | すべて                  | バージョン制限に関する追加のドキュメントはありません。                                                   |
| Elasticsearch | `7.14+`                 | バージョン制限に関する追加のドキュメントはありません。                                                   |
| OpenSearch    | `3.0.0+`                | バージョン制限に関する追加のドキュメントはありません。                                                   |
| AWS S3        | すべて                  | バージョン制限に関する追加のドキュメントはありません。                                                   |
| AWS SQS       | すべて                  | バージョン制限に関する追加のドキュメントはありません。                                                   |
| SQL++         | すべて                  | バージョン制限に関する追加のドキュメントはありません。                                                   |
| GenAI         | OpenAI および Anthropic | バージョン制限に関する追加のドキュメントはありません。                                                   |

一部のアプリケーションレベルの計装は、特定のランタイム、ライブラリ、またはサーバーのバージョンにも依存します。

| 領域                  | サポートバージョン                        | 備考                                                                                                       |
| :-------------------- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| Go アプリケーション   | Go `1.17+`                                | Go ライブラリレベルの計装に適用されます。Go ライブラリレベルのコンテキスト伝搬には Go `1.18+` が必要です。 |
| Java アプリケーション | JDK `8+`                                  | ランタイムの制約に関する追加のドキュメントはありません。                                                   |
| NGINX                 | NGINX `1.27.5` および `1.29.7` で検証済み | これらはドキュメントに記載された検証対象の NGINX バージョンです。                                          |

### Go ライブラリの計装互換性 {#go-library-instrumentation-compatibility}

OBI はアプリケーション計装において、以下の Go ライブラリと最低バージョンをサポートします。

| ライブラリ                       | サポートバージョン              |
| :------------------------------- | :------------------------------ |
| `net/http`                       | `>= 1.17`                       |
| `golang.org/x/net/http2`         | `>= 0.12.0`                     |
| `github.com/gorilla/mux`         | `>= v1.5.0`                     |
| `github.com/gin-gonic/gin`       | `>= v1.6.0`, `!= v1.7.5`        |
| `google.golang.org/grpc`         | `>= 1.40`                       |
| `net/rpc/jsonrpc`                | `>= 1.17`                       |
| `database/sql`                   | `>= 1.17`                       |
| `github.com/go-sql-driver/mysql` | `>= v1.5.0`                     |
| `github.com/lib/pq`              | all versions                    |
| `github.com/redis/go-redis/v9`   | `>= v9.0.0`                     |
| `github.com/segmentio/kafka-go`  | `>= v0.4.11`                    |
| `github.com/IBM/sarama`          | `>= 1.37`                       |
| `go.mongodb.org/mongo-driver`    | `v1: >= v1.10.1; v2: >= v2.0.1` |

これらの表に記載されているバージョンは、OBI が明示的にサポートするバージョンです。
他のバージョンでも動作する場合がありますが、特に記載がない限りサポート対象外です。

### GPU 計装の互換性 {#gpu-instrumentation-compatibility}

OBI は、環境が [OBI 互換性要件](/docs/zero-code/obi/#compatibility) を満たし、アプリケーションがサポート対象の CUDA ランタイムライブラリを使用している場合に GPU 計装をサポートします。

| 要件                      | サポート対象                    |
| :------------------------ | :------------------------------ |
| オペレーティングシステム  | Linux                           |
| CPU アーキテクチャ        | `amd64`, `arm64`                |
| CUDA ランタイムライブラリ | CUDA `7.0+` 向け `libcudart.so` |

OBI は以下の CUDA 操作を計装します。

| 操作               |
| :----------------- |
| `cudaLaunchKernel` |
| `cudaGraphLaunch`  |
| `cudaMalloc`       |
| `cudaMemcpy`       |
| `cudaMemcpyAsync`  |

GPU 計装は、上記のサポート対象 CUDA ランタイムライブラリと操作を使用するアプリケーションにのみ適用されます。
他の GPU API、フレームワーク、ライブラリは、特に記載がない限りサポート対象外です。

## メトリクスの共通設定 {#common-metrics-configuration}

YAML セクションは `metrics` です。

`metrics` セクションには、OpenTelemetry メトリクスとトレースのエクスポーターに共通の設定が含まれます。

現在、エクスポートするメトリクスのセットを選択できます。

次がその例です。

```yaml
metrics:
  features: ['network', 'network_inter_zone']
```

| YAML<br>環境変数                           | 説明                                                                                                                                                                                                                                                                               | 型              | デフォルト        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------- |
| `features`<br>`OTEL_EBPF_METRICS_FEATURES` | OBI がデータをエクスポートするメトリクスグループのリスト。[メトリクスのエクスポート機能](#metrics-export-features) を参照してください。有効な値: `all`、`*`、`application`、`application_span`、`application_host`、`application_service_graph`、`network`、`network_inter_zone`。 | string のリスト | `["application"]` |

### メトリクスのエクスポート機能 {#metrics-export-features}

OBI メトリクスエクスポーターは、[メトリクスディスカバリー](./)の設定でエントリーと一致するプロセスに対して、以下のメトリクスデータグループをエクスポートできます。

- `all` または `*`: すべてのメトリクスグループ（すべてのメトリクスを有効にする便利なオプション）
- `application`: アプリケーションレベルのメトリクス。
- `application_host`: ホストベースの価格設定向けのアプリケーションレベルのホストメトリクス。
- `application_span`: レガシー形式（`traces_spanmetrics_latency` など）のアプリケーションレベルのトレーススパンメトリクス。`spanmetrics` は独立していません。
- `application_span_otel`: OpenTelemetry 形式（`traces_span_metrics_calls_total` など）のアプリケーションレベルのトレーススパンメトリクス。`span_metrics` は独立しています。
- `application_span_sizes`: リクエストとレスポンスのサイズ情報を報告するアプリケーションレベルのトレーススパンメトリクス。
- `application_service_graph`: アプリケーションレベルのサービスグラフメトリクス。
  サービスディスカバリーには DNS を使用し、DNS 名が OBI で使用される OpenTelemetry サービス名と一致するようにすることを推奨します。
  Kubernetes 環境では、サービス名ディスカバリーで設定された OpenTelemetry サービス名がサービスグラフメトリクスに最適です。
- `network`: ネットワークレベルのメトリクス。詳細については、[ネットワークメトリクス](../../network) の設定ドキュメントを参照してください。
- `network_inter_zone`: ネットワークのゾーン間メトリクス。詳細については、[ネットワークメトリクス](../../network/) の設定ドキュメントを参照してください。

### アプリケーション別のメトリクスエクスポート機能 {#per-application-metrics-export-features}

また、OBI では `discovery > instrument` の各エントリーに `metrics > features` プロパティを追加することで、アプリケーションごとにグローバルなメトリクスエクスポート機能を上書きできます。

たとえば、以下の設定では次のようになります。

- `apache`、`nginx`、`tomcat` サービスインスタンスは、トップレベルの `metrics > features` 設定で定義された `application_service_graph` メトリクスのみをエクスポートします。

- `pyserver` サービスは `application` グループのメトリクスのみをエクスポートします。

- ポート 3030 または 3040 でリッスンしているサービスは、`application`、`application_span`、`application_service_graph` のメトリクスグループをエクスポートします。

```yaml
metrics:
  features: ['application_service_graph']
discovery:
  instrument:
    - open_ports: 3030,3040
      metrics:
        features:
          - 'application'
          - 'application_span'
          - 'application_service_graph'
    - name: pyserver
      open_ports: 7773
      metrics:
        features:
          - 'application'
    - name: apache
      open_ports: 8080
    - name: nginx
      open_ports: 8085
    - name: tomcat
      open_ports: 8090
```

## OpenTelemetry メトリクスエクスポーターコンポーネント {#opentelemetry-metrics-exporter-component}

YAML セクションは `otel_metrics_export` です。

設定ファイルでエンドポイント属性を設定するか、環境変数を使用して OpenTelemetry メトリクスエクスポートコンポーネントを有効にします。
[メトリクスエクスポート設定オプション](#opentelemetry-metrics-exporter-component) を参照してください。

YAML 設定の `otel_metrics_export` セクション、または環境変数でコンポーネントを設定します。

この記事に記載されている設定に加えて、[標準 OpenTelemetry エクスポーター設定](/docs/languages/sdk-configuration/otlp-exporter/) の環境変数もサポートします。

次は設定例です。

```yaml
otel_metrics_export:
  ttl: 5m
  endpoint: http://otelcol:4318
  protocol: grpc
  buckets:
    duration_histogram: [0, 1, 2]
  histogram_aggregation: base2_exponential_bucket_histogram
```

| YAML<br>環境変数                                                                         | 説明                                                                                                                                                                                                                                                                                                               | 型              | デフォルト                  |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | --------------------------- |
| `endpoint`<br>`OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`                                      | OBI がメトリクスを送信するエンドポイント。                                                                                                                                                                                                                                                                         | URL             |                             |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                                                            | メトリクスとトレースのエクスポーターで共有するエンドポイント。OBI は OpenTelemetry 標準に従い、メトリクス送信時に URL に `/v1/metrics` パスを追加します。この動作を無効にするには、メトリクス専用の設定を使用してください。                                                                                        | URL             |                             |
| `protocol`<br>`OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`                                      | OpenTelemetry エンドポイントのプロトコルトランスポート/エンコーディング。[メトリクスのエクスポートプロトコル](#metrics-export-protocol) を参照してください。[受け付ける値](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_protocol) は `http/json`、`http/protobuf`、`grpc` です。            | string          | ポート使用から推定          |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                                                            | 共有エンドポイントと同様に、メトリクスとトレースのプロトコルを指定。                                                                                                                                                                                                                                               | string          | ポート使用から推定          |
| `insecure_skip_verify`<br>`OTEL_EBPF_INSECURE_SKIP_VERIFY`                               | `true` の場合、OBI は検証をスキップしてサーバー証明書を受け入れます。本番環境以外でのみこの設定を変更してください。                                                                                                                                                                                                | boolean         | `false`                     |
| `interval`<br>`OTEL_EBPF_METRICS_INTERVAL`                                               | エクスポート間の時間。                                                                                                                                                                                                                                                                                             | Duration        | `60s`                       |
| `allow_service_graph_self_references`<br>`OTEL_EBPF_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | サービスグラフ生成に自己参照サービスを含めるかどうかを制御します。たとえば、自分自身を呼び出すサービスなどです。自己参照はサービスグラフの有用性を低下させ、データカーディナリティを増加させます。                                                                                                                 | boolean         | `false`                     |
| `instrumentations`<br>`OTEL_EBPF_METRICS_INSTRUMENTATIONS`                               | OBI がデータを収集するメトリクス計装のリスト。[メトリクスの計装](#metrics-instrumentation) セクションを参照してください。                                                                                                                                                                                          | list of strings | `["*"]`                     |
| `buckets`                                                                                | 多様なヒストグラムのバケット境界を上書きする方法を設定します。[ヒストグラムバケットの上書き](../metrics-histograms/) を参照してください。                                                                                                                                                                          | (n/a)           | Object                      |
| `histogram_aggregation`<br>`OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION`    | OBI がヒストグラム計装に使用するデフォルトの集計方法を設定します。有効な値は [`explicit_bucket_histogram`](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) または [`base2_exponential_bucket_histogram`](/docs/specs/otel/metrics/sdk/#base2-exponential-bucket-histogram-aggregation) です。 | `string`        | `explicit_bucket_histogram` |

### メトリクスのエクスポートプロトコル {#metrics-export-protocol}

プロトコルを設定しない場合、OBI は以下のようにプロトコルを設定します。

- `grpc`: ポートが `4317` で終わる場合（例: `4317`、`14317`、`24317`）。
- `http/protobuf`: ポートが `4318` で終わる場合（例: `4318`、`14318`、`24318`）。

### メトリクスの計装 {#metrics-instrumentation}

OBI がデータを収集できる計装領域のリストは以下のとおりです。

- `*`: すべての計装。`*` が存在する場合、OBI は他の値を無視します
- `http`: HTTP/HTTPS/HTTP/2 アプリケーションメトリクス
- `grpc`: gRPC アプリケーションメトリクス
- `sql`: SQL データベースクライアント呼び出しメトリクス（PostgreSQL、MySQL、pgx などの Go `database/sql` ドライバーを含む）
- `redis`: Redis クライアント/サーバーデータベースメトリクス
- `kafka`: Kafka クライアント/サーバーメッセージキューメトリクス
- `mqtt`: MQTT パブリッシュ/サブスクライブメッセージメトリクス（MQTT 3.1.1 および 5.0）
- `couchbase`: memcached プロトコルに基づく Couchbase N1QL/SQL++ クエリメトリクスおよび KV（Key-Value）プロトコルメトリクス
- `genai`: GenAI クライアントメトリクス（OpenAI、Anthropic、Gemini、AWS Bedrock）
- `gpu`: GPU パフォーマンスメトリクス
- `mongo`: MongoDB クライアント呼び出しメトリクス
- `dns`: DNS クエリメトリクス

たとえば、`instrumentations` オプションを `http,grpc` に設定すると、`HTTP/HTTPS/HTTP2` および `gRPC` アプリケーションメトリクスの収集が有効になり、他の計装は無効になります。

| YAML<br>環境変数                                           | 説明                                                                                                            | 型              | デフォルト |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------- | ---------- |
| `instrumentations`<br>`OTEL_EBPF_METRICS_INSTRUMENTATIONS` | OBI がデータを収集する計装のリスト。[メトリクスの計装](#metrics-instrumentation) セクションを参照してください。 | list of strings | `["*"]`    |

## OpenTelemetry トレースエクスポーターコンポーネント {#opentelemetry-traces-exporter-component}

YAML セクションは `otel_traces_export` です。

YAML 設定の `otel_traces_export` セクション、または環境変数でコンポーネントを設定できます。

この記事に記載されている設定に加えて、[標準 OpenTelemetry エクスポーター設定](/docs/languages/sdk-configuration/otlp-exporter/) の環境変数もサポートします。

```yaml
otel_traces_export:
  endpoint: http://jaeger:4317
  protocol: grpc
  instrumentations: ["http, "sql"]
```

| YAML<br>環境変数                                                                    | 説明                                                                                                                                                                                                                                                                                            | 型              | デフォルト         |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------ |
| `endpoint`<br>`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`<br>`OTEL_EXPORTER_OTLP_ENDPOINT` | OBI がトレースを送信するエンドポイント。`OTEL_EXPORTER_OTLP_ENDPOINT` を使用する場合、OBI は OpenTelemetry 標準に従い、URL に `/v1/traces` パスを自動的に追加します。この動作が不要な場合は、トレース専用の設定を使用してください。                                                             | URL             |                    |
| `protocol`<br>`OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`<br>`OTEL_EXPORTER_OTLP_PROTOCOL` | OpenTelemetry エンドポイントのプロトコルトランスポート/エンコーディング。[トレースのエクスポートプロトコル](#traces-export-protocol) を参照してください。[受け付ける値](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_protocol) は `http/json`、`http/protobuf`、`grpc`。 | string          | ポート使用から推定 |
| `insecure_skip_verify`<br>`OTEL_EBPF_INSECURE_SKIP_VERIFY`                          | `true` の場合、OBI は検証をスキップしてサーバー証明書を受け入れます。本番環境以外でのみこの設定を変更してください。                                                                                                                                                                             | boolean         | `false`            |
| `instrumentations`<br>`OTEL_EBPF_TRACES_INSTRUMENTATIONS`                           | OBI がデータを収集する計装のリスト。[トレースの計装](#traces-instrumentation) セクションを参照してください。                                                                                                                                                                                    | list of strings | `["*"]`            |

### トレースのエクスポートプロトコル {#traces-export-protocol}

プロトコルを設定しない場合、OBI は以下のようにプロトコルを設定します。

- `grpc`: ポートが `4317` で終わる場合（例: `4317`、`14317`、`24317`）。
- `http/protobuf`: ポートが `4318` で終わる場合（例: `4318`、`14318`、`24318`）。

### トレースの計装 {#traces-instrumentation}

OBI がデータを収集できる計装領域のリストは以下のとおりです。

- `*`: すべての計装。`*` が存在する場合、OBI は他の値を無視します
- `http`: HTTP/HTTPS/HTTP/2 アプリケーショントレース
- `grpc`: gRPC アプリケーショントレース
- `sql`: SQL データベースクライアント呼び出しメトリクス（PostgreSQL、MySQL、pgx などの Go `database/sql` ドライバーを含む）
- `redis`: Redis クライアント/サーバーデータベーストレース
- `kafka`: Kafka クライアント/サーバーメッセージキュートレース
- `mqtt`: MQTT パブリッシュ/サブスクライブメッセージトレース（MQTT 3.1.1 および 5.0）
- `couchbase`: Couchbase N1QL/SQL++ クエリトレースおよび KV（Key-Value）プロトコルトレース（クエリテキストと操作の詳細を含む）
- `genai`: GenAI クライアントトレース（OpenAI、Anthropic、Gemini、AWS Bedrock）
- `gpu`: GPU パフォーマンストレース
- `mongo`: MongoDB クライアント呼び出しトレース
- `dns`: DNS クエリトレース

たとえば、`instrumentations` オプションを `http,grpc` に設定すると、`HTTP/HTTPS/HTTP2` および `gRPC` アプリケーショントレースの収集が有効になり、他の計装は無効になります。

#### MQTT 計装 {#mqtt-instrumentation}

OBI は MQTT 通信を自動的に計装します。MQTT は IoT や組み込みシステムで一般的に使用される軽量メッセージングプロトコルです。

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**サポートされる操作**

- `publish`: トピックへのメッセージ送信
- `subscribe`: トピックのサブスクリプション要求

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**プロトコルバージョン**

- MQTT 3.1.1
- MQTT 5.0

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**キャプチャされる情報**

- トピック名（サブスクライブ操作では最初のトピックフィルターのみ）
- 操作レイテンシ
- クライアント-サーバー通信パターン

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**制限事項**

- サブスクライブ操作では最初のトピックフィルターのみがキャプチャされます
- オーバーヘッドを最小限に抑えるため、メッセージペイロードはキャプチャされません

**ユースケース例**: センサーデータを MQTT ブローカーにパブリッシュする IoT ゲートウェイを監視し、メッセージ配信率を追跡して通信の問題を特定します。

#### PostgreSQL pgx ドライバー計装 {#postgresql-pgx-driver-instrumentation}

OBI は、PostgreSQL データベース向けの高性能なネイティブ Go ドライバーである pgx に特化した計装を提供します。

**pgx の特徴**: pgx 計装は Go 専用の eBPF トレーシングを使用して Go ドライバーに直接フックし、汎用ネットワークレベルの SQL 計装のオーバーヘッドなしにデータベース固有のオブザーバビリティを提供します。

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**サポートされる操作**

- `Query`: 結果セットを伴う SQL クエリ実行
- 接続プーリング（pgxpool を使用）
- ネイティブ pgx API および database/SQL ラッパーインターフェイス

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**キャプチャされる情報**

- SQL クエリテキスト
- PostgreSQL サーバーホスト名（pgx 接続設定から取得）
- 操作時間とエラーの詳細
- すべての標準 database/SQL メトリクスラベル

**サポートされる pgx バージョン**: pgx v5.0.0 以降（v5.8.0 まで検証済み）。database/SQL ラッパー経由でもサポートされます: `github.com/jackc/pgx/v5/stdlib`

#### Couchbase 計装 {#couchbase-instrumentation}

Couchbase は、直接 Key-Value アクセスと SQL++ による SQL ライクなクエリの両方をサポートする NoSQL ドキュメントデータベースです。
柔軟なスキーマと高可用性が求められるアプリケーションで一般的に使用されています。
OBI は 2 つのプロトコルを通じて Couchbase 操作を計装します。

- **KV（Key-Value）プロトコル**: ポート 11210 での直接 Key-Value アクセスのためのバイナリプロトコル。[Memcached バイナリプロトコル](https://github.com/couchbase/memcached/blob/master/docs/BinaryProtocol.md) の拡張に基づいています。
- **SQL++（N1QL）**: ポート 8093 の `/query/service` エンドポイントを使用する HTTP ベースのクエリプロトコル。

##### KV（Key-Value）プロトコル {#kv-key-value-protocol}

**キャプチャされる情報**:

| 属性                      | ソース                       | 例                  |
| ------------------------- | ---------------------------- | ------------------- |
| `db.system.name`          | 定数                         | `couchbase`         |
| `db.operation.name`       | オペコード                   | `GET`, `SET`        |
| `db.namespace`            | バケット                     | `travel-sample`     |
| `db.collection.name`      | スコープ + コレクション      | `inventory.airline` |
| `db.collection.name`      | コレクション                 | `airline`           |
| `db.response.status_code` | ステータスコード（エラー時） | `1`                 |
| `server.address`          | 接続情報                     | サーバーホスト名    |
| `server.port`             | 接続情報                     | `11210`             |

**バケット、スコープ、コレクションのトラッキング**: Couchbase は階層的な名前空間を使用します: Bucket → Scope → Collection。
リクエストごとの名前空間プロトコルとは異なり、名前空間は接続レベルで確立されます。

- `SELECT_BUCKET`（トレース対象外）: 接続上の後続の操作すべてにアクティブなバケットを設定します。MySQL の `USE database` や Redis の `SELECT db_number` に相当します。
- `GET_COLLECTION_ID`（トレース対象外）: `scope.collection` パスを数値のコレクション ID に解決します。OBI はこれを使用してスコープ名とコレクション名でスパン属性を補完します。

OBI は接続ごとにバケット名、スコープ名、コレクション名のキャッシュを管理し、後続のすべてのスパンにアノテーションを付けるために使用します。

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**制限事項**

- `SELECT_BUCKET` が OBI 起動前に発生した場合、その接続のバケット名は不明です
- `GET_COLLECTION_ID` が OBI 起動前に発生した場合、コレクション名は利用できません
- 認証とメタデータ操作はキャプチャされません
- これらの制限は OBI 初期化前に確立された接続のみに影響します

##### SQL++（N1QL）操作 {#sql-n1ql-operations}

SQL++ クエリ（N1QL クエリ言語の最新名称）は、ポート 8093 の `/query/service` エンドポイントにある Couchbase の HTTP クエリサービスを通じて自動的に検出されます。

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**サポートされる操作**

- すべての SQL++ クエリタイプ: SELECT、INSERT、UPDATE、DELETE、UPSERT
- SQL パス（例: `bucket.scope.collection`）を通じてアクセスするバケットおよびコレクション操作
- コレクション間およびバケット間クエリ

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**キャプチャされる情報**

| 属性                      | ソース                         | 例                               |
| ------------------------- | ------------------------------ | -------------------------------- |
| `db.system.name`          | N1QL バージョンヘッダー        | `couchbase` または `other_sql`   |
| `db.operation.name`       | SQL パーサー                   | `SELECT`, `INSERT`, `UPDATE`     |
| `db.namespace`            | テーブルパス / `query_context` | `travel-sample`                  |
| `db.collection.name`      | テーブルパス                   | `inventory.airline`              |
| `db.query.text`           | リクエストボディ               | 完全な SQL++ クエリテキスト      |
| `db.response.status_code` | エラーコード（エラー時）       | `12003`                          |
| `error.type`              | エラーメッセージ（エラー時）   | Couchbase からのエラーメッセージ |

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**サポートされるデータベース**

- **Couchbase Server**: レスポンスの N1QL バージョンヘッダーで検出
- **その他の SQL++ 実装**: Apache AsterixDB および互換データベースも汎用の `other_sql` 指定でサポートされています

**リクエスト形式**: SQL++ リクエストは JSON ボディと `/query/service` へのフォームエンコードされた POST の両形式を受け付けます。

{{< tabpane text=true >}} {{% tab "JSON Body" %}}

```json
{
  "statement": "SELECT * FROM `bucket`.`scope`.`collection` WHERE id = $1",
  "query_context": "default:`bucket`.`scope`"
}
```

{{% /tab %}} {{% tab "Form Encoded" %}}

```text
statement=SELECT+*+FROM+users&query_context=default:`travel-sample`.`inventory`
```

{{% /tab %}} {{< /tabpane >}}

**名前空間の解決**: パーサーは以下からバケットとコレクションを抽出します。

1. SQL ステートメントのテーブルパス: `` `bucket`.`scope`.`collection` ``
2. 存在する場合の `query_context` フィールド
3. 単一識別子: コレクション名として扱われます（`query_context` あり）またはバケット名として扱われます（`query_context` なし、レガシーモード）

**設定**: SQL++ 計装には明示的な有効化が必要です。

```bash
export OTEL_EBPF_HTTP_SQLPP_ENABLED=true
export OTEL_EBPF_BPF_BUFFER_SIZE_HTTP=2048  # Larger than default; needed to capture request/response bodies
```

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->

**制限事項**

- バケットとコレクションの検出には、クエリ内の SQL パス表記（例: `bucket.scope.collection`）またはリクエストの `query_context` フィールドが必要です
- Couchbase バージョンヘッダーのないレスポンスは汎用の `other_sql` 操作としてラベル付けされます

**ユースケース例**: セッションストレージとコンテンツ管理に Couchbase を使用する高トラフィックな Web アプリケーションを監視し、クエリパフォーマンスを追跡して非効率な N1QL クエリを特定します。

## Prometheus エクスポーターコンポーネント {#prometheus-exporter-component}

YAML セクションは `prometheus_export` です。

YAML 設定の `prometheus_export` セクション、または環境変数でコンポーネントを設定できます。
このコンポーネントは自動計装ツールに HTTP エンドポイントを開き、外部のスクレイパーが Prometheus 形式でメトリクスをプルできるようにします。
`port` プロパティが設定されている場合に有効になります。

```yaml
prometheus_export:
  port: 8999
  path: /metrics
  extra_resource_attributes: ['deployment_environment']
  ttl: 1s
  buckets:
    request_size_histogram: [0, 10, 20, 22]
    response_size_histogram: [0, 10, 20, 22]
  instrumentations: ['http', 'sql']
```

| YAML<br>環境変数                                                                                    | 説明                                                                                                                                                                                   | 型              | デフォルト   |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------ |
| `port`<br>`OTEL_EBPF_PROMETHEUS_PORT`                                                               | Prometheus スクレイプエンドポイントの HTTP ポート。未設定または 0 の場合、Prometheus エンドポイントは開かれません。                                                                    | int             |              |
| `path`<br>`OTEL_EBPF_PROMETHEUS_PATH`                                                               | Prometheus メトリクスのリストを取得するための HTTP クエリパス。                                                                                                                        | string          | `/metrics`   |
| `extra_resource_attributes`<br>`OTEL_EBPF_PROMETHEUS_EXTRA_RESOURCE_ATTRIBUTES`                     | `target_info` メトリクスに追加されるリソース属性のリスト。ランタイム中に検出される属性の詳細については、[追加リソース属性](#prometheus-extra-resource-attributes) を参照してください。 | list of strings |              |
| `ttl`<br>`OTEL_EBPF_PROMETHEUS_TTL`                                                                 | メトリクスインスタンスが更新されていない場合に報告を停止するまでの期間。終了したアプリケーションインスタンスを無期限に報告し続けることを防ぐために使用されます。                       | Duration        | `5m`         |
| `buckets`                                                                                           | 多様なヒストグラムのバケット境界を上書きする方法を設定します。[ヒストグラムバケットの上書き](../metrics-histograms/) を参照してください。                                              | Object          |              |
| `exemplar_filter`<br>`OTEL_EBPF_PROMETHEUS_EXEMPLAR_FILTER`                                         | Prometheus メトリクスにエグゼンプラーを付与するタイミングを制御します。有効な値は `always_on`、`always_off`、`trace_based`。                                                           | string          | `always_off` |
| `allow_service_graph_self_references`<br>`OTEL_EBPF_PROMETHEUS_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | サービスグラフ生成に自己参照サービスを含めるかどうかを指定します。自己参照はサービスグラフにとって有用ではなく、データカーディナリティを増加させます。                                 | boolean         | `false`      |
| `instrumentations`<br>`OTEL_EBPF_PROMETHEUS_INSTRUMENTATIONS`                                       | OBI がデータを収集する計装のリスト。[Prometheus 計装](#prometheus-instrumentation) セクションを参照してください。                                                                      | list of strings | `["*"]`      |

### Prometheus の追加リソース属性 {#prometheus-extra-resource-attributes}

Prometheus API クライアントの内部的な制限により、OBI は各メトリクスに対してどの属性が公開されるかを事前に把握する必要があります。
このため、計装中にランタイムで検出される一部の属性はデフォルトでは表示されません。
たとえば、Kubernetes アノテーションを通じて各アプリケーションで定義された属性や、対象アプリケーションの `OTEL_RESOURCE_ATTRIBUTES` 環境変数で定義された属性などです。

たとえば、アプリケーションが `OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production` を環境変数として定義している場合、`target_info{deployment.environment="production"}` 属性は、メトリクスが OpenTelemetry 経由でエクスポートされる場合はデフォルトで表示されますが、Prometheus 経由の場合は表示されません。

`deployment_environment` を Prometheus で表示するには、`extra_resource_attributes` リストに追加する必要があります。

### Prometheus 計装 {#prometheus-instrumentation}

OBI がデータを収集できる計装領域のリストは以下のとおりです。

- `*`: すべての計装。`*` が存在する場合、OBI は他の値を無視します
- `http`: HTTP/HTTPS/HTTP/2 アプリケーションメトリクス
- `grpc`: gRPC アプリケーションメトリクス
- `sql`: SQL データベースクライアント呼び出しメトリクス（PostgreSQL、MySQL、pgx などの Go `database/sql` ドライバーを含む）
- `redis`: Redis クライアント/サーバーデータベースメトリクス
- `kafka`: Kafka クライアント/サーバーメッセージキューメトリクス
- `mqtt`: MQTT パブリッシュ/サブスクライブメッセージメトリクス
- `couchbase`: Couchbase N1QL/SQL++ クエリメトリクスおよび KV プロトコルメトリクス
- `genai`: GenAI クライアントメトリクス（OpenAI、Anthropic、Gemini、AWS Bedrock）

たとえば、`instrumentations` オプションを `http,grpc` に設定すると、`HTTP/HTTPS/HTTP2` および `gRPC` アプリケーションメトリクスの収集が有効になり、他の計装は無効になります。
