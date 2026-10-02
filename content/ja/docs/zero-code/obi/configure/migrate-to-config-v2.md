---
title: OBI Config v1 から Config v2 への移行
linkTitle: Config v2 への移行
description: OBI Config v1 ファイルを安全に Config v2 へ移行する方法を学びます。
weight: 4
default_lang_commit: aff3fc18e04671f7510465c179716719e48cc754
---

OBI v0.11.0 以降には、構成を移行および検証するコマンドが含まれています。
デプロイメントを 1 つずつ移行し、生成された Config v2 ファイルを検証して、ロールアウトを続行する前にテストしてください。

このガイドでは、スタンドアロン OBI および OBI Collector レシーバーの構成を移行する方法を説明します。
Config v2 の構造とサポートされるフィールドについては、[Config v2 リファレンス](/docs/zero-code/obi/configure/config-v2/)を参照してください。

## 移行前の準備 {#before-you-migrate}

移行前にロールバック計画を準備してください。

1. 現在の Config v1 ファイルを保存します。
   デプロイメントで使用されている正確な OBI バイナリバージョン、イメージタグ、またはイメージダイジェストを記録します。
2. 環境変数、コマンドラインフラグ、Helm の値、Kubernetes マニフェスト、またはシークレットインジェクションで提供される設定をリストアップします。
   移行コマンドは、指定されたファイルのみを読み取ります。
3. 対象の OBI v0.12.1 以降のバイナリをインストールします。
4. カナリアデプロイ用に、代表的なインスタンスまたはワークロードを 1 つ選択します。

移行コマンドは、ソースファイル内の置換式を解決します。
そのため、生成されたファイルにはシークレットの値が含まれる場合があります。
出力はプライベートな一時ディレクトリに書き込み、内容を慎重に確認し、シークレットをコミットしないでください。

## スタンドアロン構成の移行 {#migrate-a-standalone-configuration}

`obi config migrate` コマンドは、1 つの Config v1 ファイルを受け取ります。
生成された Config v2 YAML を標準出力に、移行レポートを標準エラー出力に書き込みます。

```sh
umask 077
migration_dir="$(mktemp -d)"

obi config migrate ./obi-v1.yaml \
  > "${migration_dir}/obi-v2.yaml" \
  2> "${migration_dir}/migration-report.txt"
```

生成されたファイルを使用する前に、終了ステータスを確認してください。
終了ステータス 0 は成功を示します。
成功時のレポートは `migrated v1 config to OBI config v2` で始まります。
エラーの場合は `migration failed:` で始まります。

次に、生成されたファイルを検証します。

```sh
obi config validate "${migration_dir}/obi-v2.yaml"
```

移行および検証コマンドは、以下の終了ステータスを使用します。

| ステータス | 意味                                     |
| ---------- | ---------------------------------------- |
| `0`        | コマンドが成功しました。                 |
| `1`        | パース、検証、または移行に失敗しました。 |
| `2`        | コマンドの構文または引数が無効です。     |

## 生成される構造の理解 {#understand-the-generated-structure}

移行コマンドは、Config v1 の設定を以下の Config v2 セクションに移動します。

| Config v1 の設定                                                         | Config v2 の場所                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Discovery セレクター                                                     | `extensions.obi.capture.policy` および `extensions.obi.capture.rules` |
| アプリケーションプロトコル                                               | `extensions.obi.capture.instrumentation`                              |
| ランタイム計装                                                           | `extensions.obi.capture.runtimes`                                     |
| ネットワークキャプチャと統計                                             | `extensions.obi.capture.network`                                      |
| eBPF およびバッチ制御                                                    | `extensions.obi.capture.engine`                                       |
| Kubernetes およびサービス名エンリッチメント                              | `extensions.obi.enrich`                                               |
| トレースログ相関                                                         | `extensions.obi.correlation`                                          |
| プロセスロギング、プロファイリング、シャットダウン、および内部メトリクス | `extensions.obi.daemon`                                               |
| トレースサンプリングとエクスポート                                       | トップレベルの `tracer_provider`                                      |
| メトリクスエクスポート                                                   | トップレベルの `meter_provider`                                       |
| リソース属性                                                             | トップレベルの `resource`                                             |

生成されたファイルには、Config v1 の動作を保持するために必要な明示的なデフォルト値が含まれます。
カナリアデプロイでテストするまで、これらの値を変更しないでください。

## 動作変更の確認 {#review-behavior-changes}

### キャプチャのデフォルトとルール順序 {#capture-defaults-and-rule-order}

選択フィールドのない Config v1 ファイルは、アプリケーションキャプチャを無効にします。
一方、Config v2 ファイルはデフォルトでワークロードを含めます。
Config v1 の動作を保持するため、移行コマンドはソースファイルがワークロードを選択していない場合に `default_action` を `exclude` に設定します。

移行コマンドは組み込みの除外を書き込み、Config v1 の include セレクターの順序を逆にする場合があります。
生成された順序は、Config v2 のルールモデルで Config v1 の優先順位を保持します。
重複するルールや 1 つのルールにのみ一致するワークロードをテストするまで、ルールの順序を変更しないでください。

`rules: []` を明示的に設定すると、OBI は組み込みの除外を削除します。

### フィルター {#filters}

Config v1 は、アプリケーションテレメトリー、ネットワークテレメトリー、TCP 統計のそれぞれに 1 つのフィルターを提供します。
移行コマンドは、各 Config v1 フィルターを対応するすべての Config v2 フィールドにコピーし、生成された構成が元の動作を保持するようにします。

そのベースラインを確立した後、Config v2 ではプロトコルおよびシグナルごとにアプリケーションフィルターを個別に調整できます。
たとえば、HTTP トレースフィルターを HTTP メトリクスフィルターや SQL フィルターと一致させる必要がなくなります。
これらの変更はカナリアデプロイで行い、テレメトリーの量とカーディナリティを比較してからロールアウトしてください。

ネットワークフローと TCP 統計のフィルターは、v0.12.1 ではトレースとメトリクスで共有されたままです。
各グループ内で 2 つのマップを同一に保ってください。
異なる場合、検証でエラーが報告されます。

### HTTP ルート {#http-routes}

グローバルな Config v1 のルート設定は、受信トラフィックと送信トラフィックに適用されます。
移行コマンドは、これらを `capture.instrumentation.http.routes` の両方向にコピーします。

サービスごとのルートパターンは `rules[].refine.http.routes` に移動します。
指定された方向に対して、明示的なサービスごとのリストはグローバルリストを置き換え、空のリストはそれをクリアします。
グローバルパターンとサービスごとのパターンの組み合わせで Config v1 の継承動作を保持できない場合、移行は失敗します。

### ワークロードの絞り込み {#workload-refinements}

Config v1 のセレクターには、エクスポートおよびルートの絞り込みを含めることができます。
Config v2 では、include ルールは省略された絞り込みを以前の一致ルールから継承しません。
この違いが動作を変える場合、明示的な `exports` または `routes` フィールドと省略されたフィールドが混在するセレクターリストでは移行が失敗します。

これらのセレクターを移行するには、各絞り込みを該当するすべてのセレクターで明示的にしてください。
条件付き継承に依存するセレクターを再構成し、各 Config v2 ルールが自己完結するようにしてから、重複するルールをテストしてください。

## エクスポーターの構成 {#configure-exporters}

Config v2 は、トップレベルの OpenTelemetry セクションでテレメトリーパイプラインを定義します。
移行コマンドは OTLP/gRPC エクスポーターを生成できます。
エンドポイントまたはプロトコルの意味を変えずに決定できない場合、移行は失敗します。

OTLP/gRPC トレースエクスポーターには、以下の構成を使用します。

```yaml
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_grpc:
            endpoint: http://collector:4317
            tls:
              insecure: true
```

OTLP/gRPC メトリクスエクスポーターには、以下の構成を使用します。

```yaml
meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_grpc:
            endpoint: http://collector:4317
            tls:
              insecure: true
        interval: 60000
```

Config v1 ファイルが OTLP over HTTP を使用している場合は、まず他の設定を移行してください。
その後、HTTP エクスポーターを手動で追加します。

```yaml
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://collector:4318/v1/traces
            encoding: protobuf

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: http://collector:4318/v1/metrics
            encoding: protobuf
```

OTLP over HTTP では、`encoding` を `json` に設定することもできます。
Config v2 は宣言的なエクスポーターヘッダーもサポートしています。
エクスポーター認証用の環境変数はランタイム入力のままであり、移行コマンドはその値を生成ファイルにコピーしません。

## 手動変更が必要な設定の処理 {#handle-settings-that-need-manual-changes}

移行コマンドが設定を保持できない場合、失敗してエラーメッセージで Config v1 のフィールドを特定します。
サポートされていない動作を置き換えるか廃止してから、コマンドを再実行してください。
以下の設定は一般的に手動変更が必要です。

| Config v1 の設定                                                                               | 対処方法                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service_name`、`service_namespace`                                                            | スタンドアロン OBI の場合、`service.name` または `service.namespace` をトップレベルの `resource` 属性として設定します。OBI Collector レシーバーの場合、Collector のリソースプロセッサーを使用します。 |
| `prometheus_export.path`                                                                       | 選択した Collector または Prometheus エクスポーターがサポートするパスを使用します。Config v2 にはポータブルなフィールドがありません。                                                                 |
| カスタムまたは空の `discovery.excluded_linux_system_paths`                                     | パスベースの除外を `capture.rules` のワークロード除外に置き換えます。対応するワークロード除外が不要な場合は設定を削除します。                                                                         |
| `health_check.*`                                                                               | デプロイメントのヘルスチェックまたは Collector のヘルスチェック機能を使用します。                                                                                                                     |
| `jvm_runtime_metrics.sampling_interval`                                                        | カスタムインターバルを削除し、Config v2 の JVM サンプリング動作をテストします。                                                                                                                       |
| `attributes.instance_id.dns`                                                                   | `service.instance.id` をトップレベルのリソース属性として設定するか、インスタンス ID のエンリッチメントを Collector プロセッサーに移行します。                                                         |
| `ebpf.stats_wakeup_data_bytes`                                                                 | カスタムウェイクアップ閾値を削除し、Config v2 のデフォルトでパフォーマンスをテストします。                                                                                                            |
| セレクターの `name`、`namespace`、セレクターごとのメトリクス、またはセレクターごとのサンプラー | サポートされている match フィールドと `refine` フィールドでセレクターを再設計します。絞り込みが異なる場合は明示的なルールに分割します。                                                               |
| セレクターの `exports.logs`                                                                    | セレクターごとのログエクスポート絞り込みを削除します。ログ相関の対象となるワークロードの選択にはキャプチャルールを使用します。                                                                        |
| `ebpf.log_enricher.services`                                                                   | 個別のログアノテーションセレクターを、対象ワークロードを選択するキャプチャルールに置き換えます。                                                                                                      |
| `sensitive_query_params`                                                                       | 移行前にプライバシーポリシーを再設計します。Config v2 には同等のフィールドがありません。                                                                                                              |
| デバッグエクスポーターまたはサポートされていないサンプラー                                     | サポートされている OTLP エクスポーターまたはサンプラーを構成します。                                                                                                                                  |
| アクティブな OTLP と Prometheus の計装リストが異なる場合                                       | 移行前にプロトコルのメトリクス有効化を統一します。                                                                                                                                                    |

コマンドは、サポートされていないメトリクス機能やヒストグラム、エクスポーター、Prometheus の設定も個別に報告します。
移行を再実行する前に、報告されたすべてのフィールドを確認し解決してください。
直接的な同等機能がないフィールドについては、サポートされている Config v2 または Collector の動作を選択し、カナリアデプロイで変更を検証してください。

コマンドは、不明な Config v1 フィールド、既に Config v2 を使用しているファイル、複数の YAML ドキュメントを含むファイルも拒否します。

たとえば、意図的なスタンドアロンのサービス ID をリソース属性にマッピングするには以下のようにします。

```yaml
resource:
  attributes:
    - name: service.name
      value: checkout
    - name: service.namespace
      value: shop
```

このフラグメントはスタンドアロン構成のルートにのみ追加してください。
OBI Collector レシーバーの場合は、かわりに Collector のリソースプロセッサーを使用します。

## 環境変数オーバーライドの移行 {#migrate-environment-overrides}

移行コマンドはソースファイルを読み取りますが、OBI ランタイム環境変数のオーバーライドは適用しません。
また、OBI は Config v1 の環境変数名を Config v2 のフィールドに自動的にマッピングしません。

たとえば、デプロイメントで `OTEL_EBPF_BPF_WAKEUP_LEN=999` を設定している場合、対応する Config v2 のフィールドに明示的な置換式を追加します。

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      engine:
        batching:
          wakeup_len: ${OTEL_EBPF_BPF_WAKEUP_LEN:-500}
```

構成ファイルでは `${VAR}`、`${env:VAR}`、またはそれらの `:-fallback` 形式を使用できます。
同等の `$()` 形式も使用できます。
式をリテラルテキストとして保持するには、先頭に追加の `$` を付けます。

コマンドラインおよびデプロイメントレベルのオーバーライドも同様に確認してください。
各値を対応する Config v2 フィールドまたは Collector パイプライン設定に移動します。

## Collector レシーバーの移行 {#migrate-a-collector-receiver}

OBI レシーバーコンポーネントの本体を移行コマンドに渡します。
Collector の完全な構成ではありません。

```sh
obi config migrate --mode=receiver ./obi-receiver-v1.yaml \
  > ./obi-receiver-v2.yaml \
  2> ./migration-report.txt

obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

コマンドは Config v2 のレシーバーコンポーネント本体を生成します。
この形式では、キャプチャフィールドは `capture` レベルなしで `version` の隣に表示されます。

```yaml
version: '2.0'
policy:
  default_action: exclude
rules:
  - action: include
    match:
      process:
        open_ports: '8080'
```

検証が成功した後、コンポーネント本体を Collector 構成の `receivers.obi` にコピーします。

レシーバー移行では、スタンドアロンのエクスポーター、エンリッチメント、相関、デーモン、または内部テレメトリーフィールドは受け付けません。
同等の動作は、Collector のエクスポーター、プロセッサー、エクステンション、およびサービステレメトリーで構成します。
完全なパイプラインの例については、[OpenTelemetry Collector レシーバーとしての OBI](../collector-receiver/) を参照してください。

## 移行の検証とテスト {#validate-and-test-the-migration}

`obi config validate` は、YAML 構造を検証し、OBI が指定された Config v2 フィールドをサポートしていることを確認します。
このコマンドは、OBI の起動、エクスポーターへの接続、eBPF プログラムのアタッチ、カーネルケーパビリティの確認は行いません。

検証が成功した後、Config v2 を 1 つのインスタンスにデプロイし、Config v1 のデプロイメントと比較します。

- 同じワークロードが含まれ、除外されていることを確認します。
- トレース、メトリクス、ルート、属性、サンプリング動作を確認します。
- エクスポーターの接続性と認証を確認します。
- テレメトリーの量とカーディナリティを比較します。
- OBI のログと内部メトリクスでエラーやバックプレッシャーを確認します。
- 重複する選択ルールに一致するワークロードを実行します。

カナリアテスト中は、Config v1 ファイルと以前の OBI バイナリまたはイメージを利用可能な状態に保ってください。
動作が異なる場合は、構成と OBI バージョンをロールバックしてください。
ロールアウトを続行する前に、不一致を解決してください。
