---
title: OBI Config v2 リファレンス
linkTitle: Config v2 リファレンス
description: スタンドアロン OBI または OBI Collector レシーバーを Config v2 で設定する方法を学びます。
weight: 3
default_lang_commit: df7ca870f2ec59453948ced42ca0d76bfd5e53d5
# prettier-ignore
cSpell:ignore: Aerospike jsonrpc ollama openai qwen rerank sattributes SIGUSR sqlpp
---

Config v2 は OBI v0.11.0 以降で利用可能です。
OpenTelemetry の宣言的構成構造を使用します。
リソース、サンプリング、エクスポーターなどの共通設定はドキュメントのルートに配置し、OBI 固有の設定は `extensions.obi` 配下にまとめます。

すでに Config v1 ファイルがある場合は、手動で書き直すかわりに [Config v1 から v2 への移行ガイド](../migrate-to-config-v2/)を使用してください。

## 構成構造の選択 {#choose-a-configuration-structure}

構成の構造は、OBI の実行方法によって異なります。

- **スタンドアロン OBI**: 完全な OpenTelemetry 宣言的構成ドキュメントを使用します。
  共通の OpenTelemetry 設定をドキュメントのルートに定義し、OBI 設定を `extensions.obi` 配下に定義します。
- **OBI Collector レシーバー**: OBI のキャプチャ設定を `receivers.obi` 配下に直接定義します。
  リソースエンリッチメント、処理、エクスポートの設定には Collector パイプラインを使用します。

## スタンドアロン OBI の設定 {#configure-standalone-obi}

以下の例では、1 つの実行可能ファイルを計装し、キャプチャしたスパンをデバッグ用に標準出力に出力します。
この設定を本番環境で使用する前に、実行可能ファイルのパスを置き換え、`debug_trace_output` を削除し、`tracer_provider` 配下に OTLP エクスポーターを設定してください。

```yaml
file_format: '1.0'

extensions:
  obi:
    version: '2.0'
    capture:
      policy:
        default_action: exclude
      rules:
        - action: include
          match:
            process:
              exe_path_glob: ['/path/to/your/application']
    daemon:
      logging:
        debug_trace_output: text
```

OBI を起動する前に、構成ファイルを検証します。

```sh
obi config validate ./obi-v2.yaml
```

### 構成構造 {#configuration-structure}

```yaml
file_format: '1.0'
log_level: info

resource: {}
tracer_provider: {}
meter_provider: {}

extensions:
  obi:
    version: '2.0'
    capture: {}
    enrich: {}
    correlation: {}
    daemon: {}
```

両方のバージョンフィールドは必須ですが、それぞれ異なるスキーマを識別します。

- `file_format: "1.0"` は OpenTelemetry 宣言的構成スキーマを識別します。
- `extensions.obi.version: "2.0"` は OBI 構成スキーマを識別します。
  現在、`"2.0"` が唯一のサポートされる値です。

どちらのフィールドも OBI のリリースバージョンに設定しないでください。

### サポートされるトップレベルフィールド {#supported-top-level-fields}

OBI v0.12.1 は、以下の OpenTelemetry 宣言的構成フィールドをサポートしています。

| フィールド                   | サポート内容                                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file_format`                | 必須。サポートされる値は `"1.0"` です。                                                                                                                   |
| `log_level`                  | OBI のログ出力を設定します。trace と debug レベルは `DEBUG` に、info は `INFO` に、warning は `WARN` に、error と fatal は `ERROR` にマッピングされます。 |
| `resource`                   | `host.name`、`host.id`、`service.name`、`service.namespace` という名前の文字列属性をサポートします。                                                      |
| `tracer_provider.sampler`    | always-on、always-off、trace-ID-ratio、およびこれらのサンプラーのシンプルな parent-based 形式をサポートします。                                           |
| `tracer_provider.processors` | 1 つの OTLP エクスポーターを持つ 1 つのバッチプロセッサーをサポートします。                                                                               |
| `meter_provider.readers`     | 最大 1 つの周期的な OTLP リーダーと 1 つの Prometheus 開発用プルリーダーをサポートします。                                                                |

たとえば、文字列リソース属性で固定のサービスアイデンティティを設定します。

```yaml
resource:
  attributes:
    - name: service.name
      value: checkout
    - name: service.namespace
      value: shop
```

スタンドアロン構成を検証する際、OBI はサポートされていないパイプラインフィールドを無視せず、エラーを報告します。
v0.12.1 では、`attribute_limits`、`instrumentation/development`、`logger_provider` は使用しないでください。
また、`disabled: true`、空でない `distribution`、空でない `propagator` も拒否されます。

Config v2 の OTLP/gRPC および OTLP/HTTP エクスポーターの例については、[エクスポーターの設定](../migrate-to-config-v2/#configure-exporters)を参照してください。
OBI がテレメトリーをエクスポートする方法の一般的な情報については、[データエクスポートの設定](../export-data/)を参照してください。

## ワークロードの選択 {#select-workloads}

`capture.policy` と `capture.rules` を使用して、OBI が計装するワークロードを指定します。
OBI は定義された順序でルールを評価します。

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      policy:
        default_action: exclude
        match_order: first_match_wins
        min_process_age: 5s
      rules:
        - action: exclude
          name: exclude-system-namespaces
          match:
            kubernetes:
              namespace_glob: ['kube-system', 'monitoring']
        - action: include
          name: checkout-service
          match:
            process:
              open_ports: '8080,9090-9091'
              exe_path_glob: ['/srv/checkout-*']
```

`default_action` を省略すると、OBI はデフォルトでワークロードをインクルードします。
ルールに一致するワークロードのみを計装するには、`default_action` を `exclude` に設定し、1 つ以上のインクルードルールを追加します。

`match_order` を `first_match_wins` または `last_match_wins` に設定します。
除外ルールは実行時に常に優先されます。
`first_match_wins` の場合、除外ルールをインクルードルールの前に配置します。
`last_match_wins` の場合、除外ルールをインクルードルールの後に配置します。

`rules` を設定すると、OBI および Collector バイナリ、一般的なシステム名前空間、すでに OTLP をエクスポートしているサービスに対する OBI の組み込み除外がリストに置き換わります。
これは `rules: []` にも適用され、すべての組み込み除外が削除されます。
必要な除外は引き続き保持してください。
移行コマンドはこれらの除外を生成されたリストに書き込みます。
置き換える意図がない限り、それらを残しておいてください。

### プロセスマッチフィールド {#process-match-fields}

| フィールド                        | 値                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `open_ports`                      | カンマ区切りのポートと範囲。例: `"8080,9090-9091"`                             |
| `target_pids`                     | プロセス ID の配列                                                             |
| `language_glob`, `language_regex` | プログラミング言語のマッチ                                                     |
| `cmd_args_glob`, `cmd_args_regex` | コマンドライン引数のマッチ                                                     |
| `exe_path_glob`, `exe_path_regex` | 実行可能ファイルパスのマッチ                                                   |
| `containers_only`                 | コンテナワークロードのみにマッチ                                               |
| `exports_otlp`                    | 指定された `port` と `protocol` で OTLP をエクスポートしているプロセスにマッチ |

glob フィールドには値の配列を、正規表現フィールドには 1 つの式を指定します。

### Kubernetes マッチフィールド {#kubernetes-match-fields}

| フィールド                                 | 値                                              |
| ------------------------------------------ | ----------------------------------------------- |
| `namespace_glob`, `namespace_regex`        | Kubernetes 名前空間のマッチ                     |
| `metadata_glob`, `metadata_regex`          | Kubernetes メタデータフィールドとマッチのマップ |
| `pod_labels`, `pod_labels_regex`           | Pod ラベルとマッチのマップ                      |
| `pod_annotations`, `pod_annotations_regex` | Pod アノテーションとマッチのマップ              |

サポートされるメタデータキーには、Pod、Deployment、ReplicaSet、DaemonSet、StatefulSet、Job、CronJob、オーナー、およびコンテナ名が含まれます。

### マッチしたワークロードの調整 {#refine-a-matched-workload}

インクルードルールの `refine` ブロックを使用して、マッチしたワークロードのシグナルエクスポートおよび HTTP ルート設定をオーバーライドします。

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      rules:
        - action: include
          name: staging
          match:
            kubernetes:
              namespace_glob: ['staging-*']
          refine:
            exports:
              traces: false
              metrics: true
        - action: include
          name: orders
          match:
            kubernetes:
              namespace_glob: ['orders']
          refine:
            http:
              routes:
                incoming:
                  patterns: ['/orders/{id}']
                  ignored_patterns: ['/health']
                  unmatched: path
```

v0.12.1 では、`refine` は `exports` と `http.routes` をサポートします。
空でない `http.filters` フィールドやワークロードごとのサンプリングはサポートされていません。
すべてのワークロードに対するサンプリングは `tracer_provider.sampler` で設定してください。

複数のルールがワークロードにマッチした場合、ルールは以前のルールで省略された調整を継承しません。
ルールが重複する可能性がある場合は、各調整を明示的に指定し、結果の動作をテストしてください。

## キャプチャの設定 {#configure-capture}

`extensions.obi.capture` を使用して、OBI がワークロードを選択してテレメトリーをキャプチャする方法を設定します。
以下の設定はスタンドアロン OBI と OBI Collector レシーバーの両方で使用できます。

| セクション        | 目的                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `policy`, `rules` | ワークロードを選択し、ワークロードごとの調整を適用します。                                                   |
| `instrumentation` | アプリケーションプロトコルの有効化とチューニングを行います。                                                 |
| `runtimes`        | Go、Node.js、Java のランタイム計装を制御します。                                                             |
| `network`         | ネットワークフローと TCP 統計のキャプチャを設定します。                                                      |
| `limits`          | カーディナリティとメモリのガードレールを設定します。                                                         |
| `engine`          | バッチ処理、PID フィルタリング、コンテキスト伝搬、トラフィック制御、その他の eBPF 動作をチューニングします。 |
| `safety`          | 必要なシステムケーパビリティを強制します。                                                                   |
| `channels`        | 内部バッファリングとバックプレッシャーをチューニングします。                                                 |
| `telemetry`       | OBI レポーターキャッシュとメトリクス保持をチューニングします。                                               |

### プロトコル計装 {#protocol-instrumentation}

`instrumentation` 配下で、HTTP、gRPC、SQL、Redis、Kafka、MongoDB、Couchbase、DNS、GPU、Aerospike の計装を設定できます。
各プロトコルごとにトレースとメトリクスを個別に有効化します。

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      instrumentation:
        http:
          enabled:
            traces: true
            metrics: true
        dns:
          enabled:
            traces: false
            metrics: true
```

HTTP ルートは受信リクエストと送信リクエストで個別に設定します。
`incoming` と `outgoing` の両セクションは、`patterns`、`ignored_patterns`、`ignore_mode`、`unmatched`、`wildcard_char`、`max_path_segment_cardinality` を受け付けます。
これらの設定の動作については、[ルートの設定](../routes-decorator/)を参照してください。

Config v2 は、プロトコルとシグナルごとにアプリケーションフィルターを独立して適用します。
たとえば、HTTP メトリクスや SQL テレメトリーに同じフィルターを適用せずに、HTTP トレースだけをフィルタリングできます。
これらのフィルターは `capture.instrumentation.<protocol>.filters.traces` と `.metrics` 配下に定義します。

ネットワークフローフィルターと TCP 統計フィルターは v0.12.1 ではシグナル固有ではありません。
これらのグループごとに、トレースとメトリクスで同じフィルターマップを使用してください。
2 つのマップが異なる場合、検証でエラーが報告されます。

HTTP ペイロード抽出を有効にするには、`payload_extraction.enabled` にエクストラクターを追加します。
サポートされる値は `graphql`、`elasticsearch`、`aws`、`sqlpp`、`openai`、`anthropic`、`gemini`、`qwen`、`bedrock`、`mcp`、`embedding`、`rerank`、`retrieval`、`ollama`、`openai_compatible`、`jsonrpc`、`enrichment` です。
対応するネストされたブロックを使用して、有効なエクストラクターを設定します。
ネストされたブロックはエクストラクターを有効にするわけではありません。

### ランタイム計装 {#runtime-instrumentation}

`capture.runtimes` を使用して、Go プローブ、Node.js の `SIGUSR1` インジェクション、Java エージェントのアタッチメントを有効化または無効化します。
Java のデバッグ設定やアタッチメントタイムアウトも設定できます。
OBI v0.12.1 では、空でないランタイム `filter` フィールドはサポートされていません。
かわりにキャプチャルールを使用してワークロードを選択してください。

### ネットワークオブザーバビリティ {#network-observability}

`capture.network.capture` を使用してネットワークフローテレメトリーを設定し、`capture.network.stats` を使用して TCP 統計を設定します。
TCP 統計の `features` リストは `tcp_rtt`、`tcp_failed_connections`、`tcp_retransmits`、`tcp_io` をサポートします。

`tcp_io` は、他の機能よりも大幅に多くのイベントを生成する可能性があるため、送信ごとおよび受信ごとの統計が必要な場合にのみ有効にしてください。
デプロイメントとメトリクスの詳細については、[ネットワークオブザーバビリティ](../../network/)を参照してください。

## スタンドアロン専用機能の設定 {#configure-standalone-only-features}

OBI をスタンドアロンプロセスとして実行する場合、`extensions.obi` 配下で以下のセクションも使用できます。

- `enrich` を使用して、Kubernetes メタデータ、サービス命名、属性エンリッチメントを設定します。
  Kubernetes モードを `autodetect`、`enabled`、`disabled` に設定します。
- `correlation` を使用して、アプリケーションログにおけるトレースコンテキストアノテーションを設定します。
  [トレースとログの相関](../../trace-log-correlation/)を参照してください。
- `daemon` を使用して、ログ出力、プロファイリング、グレースフルシャットダウン、内部メトリクス、スタンドアロン Prometheus メトリクスシェイピングを設定します。
  ログの詳細度はトップレベルの `log_level` フィールドで設定します。

## Collector レシーバー構成 {#collector-receiver-configuration}

Collector レシーバー構成では、スタンドアロン構成の `extensions.obi.capture` 配下にあるフィールドを、`version` の隣の `receivers.obi` 配下に直接配置します。
`capture` レベルは含めないでください。
たとえば、以下の YAML は OBI レシーバーコンポーネント本体です。

```yaml
version: '2.0'
policy:
  default_action: exclude
rules:
  - action: include
    match:
      process:
        open_ports: '8080'
instrumentation:
  http:
    enabled:
      traces: true
      metrics: true
```

レシーバーコンポーネント本体を別のファイルに保存して検証します。

```sh
obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

検証が成功した後、コンポーネント本体を Collector 構成の `receivers.obi` にコピーします。
次に、適切なトレースおよびメトリクスパイプラインに `obi` を追加します。

スタンドアロン専用の `enrich`、`correlation`、`daemon` セクションをレシーバー構成に追加しないでください。
エンリッチメントには `k8sattributes` などの Collector プロセッサーを、運用設定には Collector サービステレメトリーを、データエクスポートには Collector エクスポーターを使用してください。
完全なセットアップについては、[OBI を Collector レシーバーとして実行する](../collector-receiver/)を参照してください。

## 環境変数 {#environment-variables}

OBI が構成ファイルを読み取る際、YAML をパースする前に以下の環境変数式を展開します。

- `${VAR}` および `${env:VAR}`
- `${VAR:-fallback}` および `${env:VAR:-fallback}`

同等の `$()` 形式も使用できます。
式をリテラルテキストとして保持するには、先頭に `$` を追加します。

OBI は Config v1 の環境変数名を Config v2 フィールドに自動的にマッピングしません。
環境変数によるオーバーライドを保持するには、[環境変数オーバーライドの移行](../migrate-to-config-v2/#migrate-environment-overrides)の説明に従って、対応する Config v2 フィールドに置換式を追加してください。

## 構成の検証 {#validate-a-configuration}

デプロイメントに合った検証モードを使用します。
コマンドはサポートされていないフィールドや競合する設定を報告します。

```sh
# スタンドアロンドキュメント
obi config validate ./obi-v2.yaml

# レシーバーコンポーネント本体
obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

検証コマンドは OBI の起動、eBPF プログラムのアタッチ、エクスポーターへの接続、実行中のカーネルの確認を行いません。
検証が成功した後、カナリアデプロイメントで構成をテストしてください。
