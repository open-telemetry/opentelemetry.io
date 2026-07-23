---
title: OBI のメトリクスとトレースの属性を設定する
linkTitle: メトリクス属性
description: 計装された Kubernetes Pod のインスタンス ID デコレーションとメタデータを含む、報告される属性を制御するメトリクスとトレースの属性コンポーネントを設定します。
weight: 30
default_lang_commit: 1c5c4de33671bca46cb2ad38c082933284c53739
drifted_from_default: true
cSpell:ignore: kube kubecache kubeconfig replicaset statefulset
---

OBI がメトリクスとトレースの属性をどのように装飾するかを設定できます。
属性の設定や有効化には、トップレベルの YAML セクション `attributes` を使用します。

[OBI でエクスポートされるメトリクス](../../metrics/) のドキュメントには、各メトリクスで報告できる属性が一覧化されています。
OBI はデフォルトで一部の属性を報告し、カーディナリティを制御するために他の属性を非表示にします。

各メトリクスに対して、`select` サブセクションでどの属性を表示するかを制御できます。
これは、各キーが OpenTelemetry または Prometheus ポートにおけるメトリクスの名前であるマップで、各メトリクスは `include` と `exclude` の 2 つのサブプロパティを持ちます。

- `include` は報告する属性のリストです。各属性は名前またはワイルドカード（たとえば、`k8s.dst` で始まるすべての属性を含めるための `k8s.dst.*`）にできます。`include` リストを指定しない場合、OBI はデフォルトの属性セットを報告します。特定のメトリクスのデフォルト属性に関する詳細は [OBI でエクスポートされるメトリクス](../../metrics/) を参照してください
- `exclude` は、`include` リストまたはデフォルトの属性セットから削除する属性名またはワイルドカードのリストです

例:

```yaml
attributes:
  select:
    obi_network_flow_bytes:
      # OTEL_EBPF_network_flow_bytes の属性を以下の 3 つだけに限定します
      include:
        - obi.ip
        - src.name
        - dst.port
    sql_client_duration:
      # db_statement を除くすべての可能な属性を報告します
      include: ['*']
      exclude: ['db_statement']
    http_client_request_duration:
      # デフォルトの属性セットを報告しますが、Kubernetes Pod 情報は除外します
      exclude: ['k8s.pod.*']
```

さらに、メトリクス名としてワイルドカードを使用して、同じ名前のメトリクスグループに対して属性を追加・除外することもできます。
たとえば次のとおりです。

```yaml
attributes:
  select:
    http_*:
      include: ['*']
      exclude: ['http_path', 'http_route']
    http_client_*:
      # http_* の除外設定を上書きします
      include: ['http_path']
    http_server_*:
      # http_* の除外設定を上書きします
      include: ['http_route']
```

前述の例では、名前が `http_` または `http.` で始まるすべてのメトリクスについて、`http_path` と `http_route` または `http.path`/`http.route` を除くすべての可能な属性が含まれます。
`http_client_*` と `http_server_*` のセクションは基本設定を上書きし、HTTP クライアントメトリクスでは `http_path` 属性を、HTTP サーバーメトリクスでは `http_route` 属性を有効化します。

メトリクス名がワイルドカードを使用する複数の定義にマッチする場合、完全一致がワイルドカードマッチよりも優先されます。

## トレースの選択 {#trace-selection}

エクスポートされる OpenTelemetry トレースについては、`attributes.select` 配下で（メトリクス名ではなく）`traces` キーを使用します。
これは、`db.query.text`、`url.query`、GenAI ペイロード属性、`db.response.error` など、オプションのトレース装飾を制御します。

```yaml
attributes:
  select:
    traces:
      include:
        - db.query.text
        - db.response.error
```

### `db.response.error` {#db-response-error}

`db.response.error` は OpenTelemetry セマンティック規約の一部ではありません。
OBI はこの文字列を `attributes.select.traces` 配下の設定フラグとしてのみ使用します。

| 条件                     | 動作                                                                                                                                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 含まれない（デフォルト） | データベース関連の失敗したスパン（SQL、Redis、MongoDB、Couchbase、Memcached、HTTP 経由の SQL++）では、`span.status.message` は空のままになります。これは、他のオプション属性（たとえば `db.query.text`）の挙動と一貫しています — 選択されない場合、それらは省略されます。 |
| 含まれる                 | これらの同じスパンで、`span.status.message` がプロトコルレスポンスから解析された実際のエラー説明に設定されます。                                                                                                                                                          |

`db.response.error` は OTLP トレースのスパン属性として添付されることはありません。
エクスポート時、OBI はゲートされた値をデータベーススパンの `span.status.message` を構築するためにのみ使用し、その後この属性をエクスポートされるスパンから削除します。
このオプションを有効にすると、スパン上の独立した `db.response.error` フィールドではなく、ステータスの説明が変更されます。

このオプトインは、エラー文字列に機密情報や高カーディナリティの詳細（スキーマ名、クエリの断片、データ値）が含まれる可能性があるために存在します。

## 分散トレースとコンテキスト伝搬 {#distributed-traces-and-context-propagation}

YAML セクション: `ebpf`

このコンポーネントは、YAML 設定ファイルの `ebpf` セクション、または環境変数を使用して設定できます。

| YAML<br>環境変数                                                 | 説明                                                                                                                                                                                       | 型      | デフォルト |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ---------- |
| `context_propagation`<br>`OTEL_EBPF_BPF_CONTEXT_PROPAGATION`     | トレースコンテキスト伝搬方式を制御します。受け付ける値: `all`、`headers`、`tcp`、`headers,tcp`、`disabled`。詳細は [コンテキスト伝搬セクション](#context-propagation) を参照してください。 | string  | disabled   |
| `track_request_headers`<br>`OTEL_EBPF_BPF_TRACK_REQUEST_HEADERS` | トレーススパンの受信 `Traceparent` ヘッダーを追跡します。詳細は [リクエストヘッダーの追跡セクション](#track-request-headers) を参照してください。                                          | boolean | false      |

### コンテキスト伝搬 {#context-propagation}

OBI は送信される HTTP リクエストに対して `Traceparent` ヘッダー値を注入するため、受信したコンテキストを下流のサービスへ伝搬できます。
このコンテキスト伝搬は、任意のプログラミング言語で機能します。

TLS 暗号化された HTTP リクエスト（HTTPS）の場合、OBI は `Traceparent` ヘッダー値を TCP/IP パケットレベルでエンコードします。
通信の両側に OBI が存在している必要があります。

TCP/IP パケットレベルのエンコーディングには Linux Traffic Control (TC) を使用します。
TC も使用する eBPF プログラムは、OBI と正しくチェーンする必要があります。
プログラムのチェーンに関する詳細は [Cilium 互換性ドキュメント](../../cilium-compatibility/) を参照してください。

`context_propagation="headers"` を設定することで、TCP レベルの伝搬と Linux Traffic Control プログラムを無効にできます。
このモードは、任意の OpenTelemetry 分散トレーシングライブラリと完全に互換性があります。

コンテキスト伝搬の値:

- `all`: HTTP ヘッダーと TCP コンテキスト伝搬の両方を有効化
- `headers`: HTTP ヘッダーを介したコンテキスト伝搬のみを有効化
- `tcp`: TCP パケットパスを介したコンテキスト伝搬のみを有効化
- `headers,tcp`: 両方の方式を明示的に有効化
- `disabled`: トレースコンテキスト伝搬を無効化

`http` は `headers` のエイリアスとして受け付けられますが、例と設定では `headers` という名前が推奨されます。

このオプションをコンテナ環境（Kubernetes および Docker）で使用するには、次のことが必要です。

- OBI を `DaemonSet` として、ホストネットワークアクセス `hostNetwork: true` でデプロイする
- ホストの `/sys/fs/cgroup` パスをローカルの `/sys/fs/cgroup` パスとしてボリュームマウントする
- OBI コンテナに `CAP_NET_ADMIN` 機能を付与する

このネットワークレベルモードでは、gRPC と HTTP/2 はサポートされていません。

Kubernetes での分散トレースの設定例については、[OBI による分散トレース](../../distributed-traces/) ガイドを参照してください。

### リクエストヘッダーの追跡 {#track-request-headers}

このオプションは、受信した `Traceparent` ヘッダー値を OBI が処理できるようにします。
有効にすると、OBI は `Traceparent` ヘッダー値を持つサーバーリクエストを受信した際、提供された「トレース ID」を使用して独自のトレーススパンを作成します。

このオプションは Go アプリケーションには影響しません。
Go アプリケーションでは、`Traceparent` フィールドが常に処理されます。

このオプションを有効にすると、リクエスト量の多いシナリオでパフォーマンスのオーバーヘッドが増加する可能性があります。
このオプションは OBI のトレースを生成するときにのみ有用で、メトリクスには影響しません。

### その他の属性 {#other-attributes}

| YAML オプション<br>環境変数                                | 説明                                                                                    | 型      | デフォルト |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------- | ---------- |
| `heuristic_sql_detect`<br>`OTEL_EBPF_HEURISTIC_SQL_DETECT` | ヒューリスティックな SQL クライアント検出を有効化します。詳細は以下を参照してください。 | boolean | (false)    |

`heuristic sql detect` オプションを使用すると、プロトコルが直接サポートされていなくても、OBI はクエリ文を検査することで SQL クライアントリクエストを検出できます。
デフォルトでは、OBI はバイナリプロトコル形式によって SQL クライアントリクエストを検出します。
OBI が直接サポートしていないデータベース技術を使用している場合、このオプションを有効にしてデータベースクライアントのテレメトリーを取得できます。
このオプションはデフォルトでは有効になっていません。
たとえばアプリケーションが TCP 接続を介してログ出力のために SQL テキストを送信する場合のように、誤検出を生じる可能性があるためです。
現在、OBI は PostgreSQL、MySQL、MSSQL のバイナリプロトコルをネイティブにサポートしています。

### スパン向けの HTTP ヘッダー・ボディエンリッチメント {#http-header-enrichment-for-spans}

OBI は、`ebpf.payload_extraction.http.enrichment` 設定セクションを通じて、選択した HTTP ヘッダーや選択した HTTP ボディフィールドをスパンに添付できます。
これは、アプリケーションを手動で計装することなく、ビジネスやルーティング関連のヘッダーをトレースに持ち込みたい場合に有用です。

エンリッチメントエンジンはルールベースです。

- HTTP ヘッダーとボディのエンリッチメントを有効化するには `enabled: true` を設定します。
- YAML で `policy.default_action.headers` と `policy.default_action.body` を使用して、マッチしないヘッダーやボディコンテンツを含めるか除外するかを定義します。両方のデフォルトは `exclude` です。
- スパンに添付される前に、機密性のあるヘッダー値や JSON ボディフィールドを秘匿化するために `obfuscate` ルールを使用します。
- ルールは順番に評価されます。

たとえば次のとおりです。

```yaml
ebpf:
  buffer_sizes:
    http: 8192
  payload_extraction:
    http:
      enrichment:
        enabled: true
        policy:
          default_action:
            headers: exclude
            body: exclude
          obfuscation_string: '***'
        rules:
          - action: obfuscate
            type: headers
            scope: all
            match:
              patterns:
                - Authorization
              case_sensitive: false
          - action: include
            type: headers
            scope: all
            match:
              patterns:
                - Content-Type
                - X-Custom-*
                - X-Dice-Roll
              case_sensitive: false
          - action: include
            type: body
            scope: request
            match:
              methods: [POST]
              url_path_patterns:
                - /v1/chat/completions
          - action: obfuscate
            type: body
            scope: request
            match:
              methods: [POST]
              url_path_patterns:
                - /v1/chat/completions
              obfuscation_json_paths:
                - $.messages[*].content
```

次の環境変数がエンリッチメントのグローバルな動作を制御します。

- `OTEL_EBPF_HTTP_ENRICHMENT_ENABLED`
- `OTEL_EBPF_HTTP_ENRICHMENT_OBFUSCATION_STRING`

`policy.default_action.headers` と `policy.default_action.body` の設定は YAML でのみ設定できます。
これらのデフォルト値に対応する環境変数はありません。

ルール自体は YAML で設定します。
ヘッダールールは `match.patterns` とオプションの `case_sensitive` を使用します。
ボディルールは `match.url_path_patterns`、`match.methods`、`match.obfuscation_json_paths` を使用します。

ボディの抽出には HTTP ペイロードキャプチャが必要です。
OBI がエンリッチしたいリクエストまたはレスポンスのバイトをキャプチャできるように、`ebpf.buffer_sizes.http` を増やしてください。
この上限はリクエストとレスポンスに対して独立して適用されます。

## インスタンス ID デコレーション {#instance-id-decoration}

YAML セクション: `attributes.instance_id`

OBI は、計装された各アプリケーションを識別する一意のインスタンス ID 文字列でメトリクスとトレースを装飾します。
デフォルトでは、OBI は OBI を実行しているホスト名（コンテナ名または Pod 名にもなり得る）に、計装対象のプロセスの PID を続けて使用します。
インスタンス ID の構成方法は、`attributes` トップレベルセクション配下の `instance_id` YAML サブセクションで上書きできます。

たとえば次のとおりです。

```yaml
attributes:
  instance_id:
    dns: false
```

| YAML<br>環境変数                             | 説明                                                                                                                                                                                           | 型      | デフォルト |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- |
| `dns`<br>`OTEL_EBPF_HOSTNAME_DNS_RESOLUTION` | `true` の場合、OBI はローカルホスト名をネットワーク DNS に対して解決しようとします。`false` の場合、ローカル名を使用します。詳細は [DNS セクション](#dns) を参照してください。                 | boolean | true       |
| `override_hostname`<br>`OTEL_EBPF_HOSTNAME`  | 設定されている場合、OBI は指定された文字列をインスタンス ID のホスト部分として使用します。DNS 解決を上書きします。詳細は [ホスト名の上書きセクション](#override-hostname) を参照してください。 | string  | (unset)    |

### DNS {#dns}

`true` の場合、OBI はローカルホスト名をネットワーク DNS に対して解決しようとします。
`false` の場合、ローカルホスト名を使用します。

### ホスト名の上書き {#override-hostname}

設定されている場合、OBI はホスト名の解決を試みるかわりに、指定された文字列をインスタンス ID のホスト部分として使用します。
このオプションは `dns` よりも優先されます。

## Kubernetes デコレーター {#kubernetes-decorator}

YAML セクション: `attributes.kubernetes`

このコンポーネントは、YAML 設定ファイルの `attributes.kubernetes` セクション、または環境変数を使用して設定できます。

この機能を有効化するには、OBI Pod に追加の権限を付与する必要があります。
[「Kubernetes で OBI を実行する」ページの「Kubernetes メタデータ装飾の設定」セクション](../../setup/kubernetes/) を参照してください。

このオプションを `true` に設定すると、OBI は Kubernetes メタデータでメトリクスとトレースを装飾します。
`false` に設定すると、OBI は Kubernetes メタデータデコレーターを無効化します。
`autodetect` に設定すると、OBI は Kubernetes 内で実行されているかどうかを検出しようとし、そうであればメタデータ装飾を有効化します。

たとえば次のとおりです。

```yaml
attributes:
  kubernetes:
    enable: true
```

| YAML<br>環境変数                                                            | 説明                                                                                                                                                                                                              | 型             | デフォルト     |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------- |
| `enable`<br>`OTEL_EBPF_KUBE_METADATA_ENABLE`                                | Kubernetes メタデータ装飾を有効化または無効化します。Kubernetes 内で実行されている場合に有効化するには `autodetect` を設定します。詳細は [Kubernetes の有効化セクション](#enable-kubernetes) を参照してください。 | boolean/string | false          |
| `kubeconfig_path`<br>`KUBECONFIG`                                           | Kubernetes 設定ファイルへのパス。詳細は [Kubernetes 設定パスセクション](#kubernetes-configuration-path) を参照してください。                                                                                      | string         | ~/.kube/config |
| `disable_informers`<br>`OTEL_EBPF_KUBE_DISABLE_INFORMERS`                   | 無効化する Informer のリスト（`node`、`service`）。詳細は [Informer の無効化セクション](#disable-informers) を参照してください。                                                                                  | string         | (empty)        |
| `meta_restrict_local_node`<br>`OTEL_EBPF_KUBE_META_RESTRICT_LOCAL_NODE`     | メタデータをローカルノードのみに制限します。詳細は [メタデータをローカルノードに制限するセクション](#meta-restrict-local-node) を参照してください。                                                               | boolean        | false          |
| `informers_sync_timeout`<br>`OTEL_EBPF_KUBE_INFORMERS_SYNC_TIMEOUT`         | 開始前に Kubernetes メタデータを待機する最大時間。詳細は [Informer 同期タイムアウトセクション](#informers-sync-timeout) を参照してください。                                                                      | Duration       | 30s            |
| `reconnect_initial_interval`<br>`OTEL_EBPF_KUBE_RECONNECT_INITIAL_INTERVAL` | 接続喪失後に Kubernetes API に再接続するまでの初期遅延。詳細は [再接続初期間隔セクション](#reconnect-initial-interval) を参照してください。                                                                       | Duration       | 5s             |
| `informers_resync_period`<br>`OTEL_EBPF_KUBE_INFORMERS_RESYNC_PERIOD`       | すべての Kubernetes メタデータを定期的に再同期します。詳細は [Informer 再同期周期セクション](#informers-resynchronization-period) を参照してください。                                                            | Duration       | 30m            |
| `meta_cache_address`<br>`OTEL_EBPF_KUBE_META_CACHE_ADDRESS`                 | Kubernetes メタデータを取得する外部 `k8s-cache` サービスのアドレス。詳細は [メタデータキャッシュアドレスセクション](#meta-cache-address) を参照してください。                                                     | string         | (empty)        |
| `service_name_template`<br>`OTEL_EBPF_SERVICE_NAME_TEMPLATE`                | サービス名のための Go テンプレート。詳細は [サービス名テンプレートセクション](#service-name-template) を参照してください。                                                                                        | string         | (empty)        |

### Kubernetes の有効化 {#enable-kubernetes}

Kubernetes 環境で OBI を実行している場合、標準の OpenTelemetry ラベルでトレースとメトリクスを装飾するように設定できます。

- `k8s.namespace.name`
- `k8s.deployment.name`
- `k8s.statefulset.name`
- `k8s.replicaset.name`
- `k8s.daemonset.name`
- `k8s.node.name`
- `k8s.pod.name`
- `k8s.container.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.cluster.name`
- `k8s.owner.name`

### Kubernetes 設定パス {#kubernetes-configuration-path}

これは標準の Kubernetes 設定環境変数です。
これを使用して、Kubernetes クラスターと通信するための Kubernetes 設定を OBI がどこで見つけるかを伝えます。
通常、この値を変更する必要はありません。

### Informer の無効化 {#disable-informers}

受け付ける値は `node` と `service` を含む可能性のあるリストです。

このオプションを使用すると、ネットワークメトリクスやアプリケーションのメトリクスとトレースを装飾するために必要なメタデータを取得するために Kubernetes API を継続的にリッスンする一部の Kubernetes Informer を選択的に無効化できます。

非常に大規模なクラスターで OBI を DaemonSet としてデプロイする場合、すべての OBI インスタンスが複数の Informer を作成すると、Kubernetes API に過剰な負荷がかかる可能性があります。

一部の Informer を無効化すると報告されるメタデータが不完全になりますが、Kubernetes API への負荷は軽減されます。

Pod の Informer は無効化できません。
それを行うには、Kubernetes メタデータ装飾全体を無効化してください。

### メタデータをローカルノードに制限する {#meta-restrict-local-node}

true の場合、OBI は OBI インスタンスが実行されているノードからのみ Pod とノードのメタデータを保存します。

このオプションはメタデータを保存するためのメモリ使用量を減らしますが、ネットワークバイト数やサービスグラフメトリクスなどの一部のメトリクスは、異なるノード上の宛先 Pod からのメタデータを含まなくなります。

### Informer 同期タイムアウト {#informers-sync-timeout}

これは、メトリクスとトレースの装飾を開始する前に、OBI がすべての Kubernetes メタデータを取得するために待機する最大時間です。
このタイムアウトに達すると、OBI は通常通り開始しますが、すべての Kubernetes メタデータがバックグラウンドで更新されるまで、メタデータ属性が不完全になる可能性があります。

### 再接続初期間隔 {#reconnect-initial-interval}

OBI が Kubernetes API への接続を失った場合、この値が接続を再試行するまでの初期遅延を制御します。

不安定または過負荷の API サーバーに対する再接続の負荷を軽減するには、この値を大きくしてください。
一時的な API 障害後により速く回復したい場合は、小さくしてください。

### Informer 再同期周期 {#informers-resynchronization-period}

OBI はリソースのメタデータに対する更新を即座に受信します。
それに加えて、OBI はこのプロパティで指定する頻度ですべての Kubernetes メタデータを定期的に再同期します。
値を大きくすると Kubernetes API サービスへの負荷が軽減されます。

### メタデータキャッシュアドレス {#meta-cache-address}

設定すると、OBI は Kubernetes API サーバーに対して独自の Informer を実行するかわりに、外部の `k8s-cache` サービスから gRPC 経由で Kubernetes メタデータを取得します。
これは Kubernetes API への過負荷を避けるため、大規模クラスターおよび DaemonSet デプロイメントで推奨されます。

### サービス名テンプレート {#service-name-template}

Go テンプレートを使用してサービス名をテンプレート化できます。
これにより、条件付きまたは拡張されたサービス名を作成できます。

次のコンテキストがテンプレートで利用可能です。

```text
Meta: (*informer.ObjectMeta)
  Name: (string)
  Namespace: (string)
  Labels:
    label1: lv1
    label2: lv2
  Annotations:
    Anno1: av1
    Anno2: av2
  Pod: (*PodInfo)
  ...

ContainerName: (string)
```

完全なオブジェクトと構造は `kubecache informer.pb.go` ソースファイルにあります。

サービス名テンプレートの例:

```go
{{- .Meta.Namespace }}/{{ index .Meta.Labels "app.kubernetes.io/name" }}/{{ index .Meta.Labels "app.kubernetes.io/component" -}}{{ if .ContainerName }}/{{ .ContainerName -}}{{ end -}}
```

または

```go
{{- .Meta.Namespace }}/{{ index .Meta.Labels "app.kubernetes.io/name" }}/{{ index .Meta.Labels "app.kubernetes.io/component" -}}
```

この例では、サービス名内の空白を防ぐために、最初の行のみが使用されトリミングされます。

## 追加のグループ属性 {#extra-group-attributes}

OBI を使用すると、`extra_group_attributes` 設定を使用してカスタム属性でメトリクスを拡張できます。
これにより、標準セット以外の追加のメタデータをメトリクスに含める柔軟性が得られます。

この機能を使用するには、グループ名とそのグループに含めたい属性のリストを指定します。

現在、`k8s_app_meta` グループのみがサポートされています。
このグループには、Pod 名、名前空間、コンテナ名、Pod UID などの Kubernetes 固有のメタデータが含まれます。

設定例:

```yaml
attributes:
  kubernetes:
    enable: true
  extra_group_attributes:
    k8s_app_meta: ['k8s.app.version']
```

この例では:

- `extra_group_attributes > k8s_app_meta` ブロックに `k8s.app.version` を追加すると、`k8s.app.version` ラベルがメトリクスに表示されるようになります。
- Kubernetes マニフェストで接頭辞 `resource.opentelemetry.io/` および接尾辞 `k8s.app.version` を持つアノテーションを定義することもできます。これらのアノテーションは自動的にメトリクスに含まれます。

次の表はデフォルトのグループ属性を示しています。

| グループ       | ラベル                 |
| -------------- | ---------------------- |
| `k8s_app_meta` | `k8s.namespace.name`   |
| `k8s_app_meta` | `k8s.pod.name`         |
| `k8s_app_meta` | `k8s.container.name`   |
| `k8s_app_meta` | `k8s.deployment.name`  |
| `k8s_app_meta` | `k8s.replicaset.name`  |
| `k8s_app_meta` | `k8s.daemonset.name`   |
| `k8s_app_meta` | `k8s.statefulset.name` |
| `k8s_app_meta` | `k8s.node.name`        |
| `k8s_app_meta` | `k8s.pod.uid`          |
| `k8s_app_meta` | `k8s.pod.start_time`   |
| `k8s_app_meta` | `k8s.cluster.name`     |
| `k8s_app_meta` | `k8s.owner.name`       |

そして、次の表はメトリクスとそれらに関連付けられたグループを示しています。

| グループ       | OTel Metric                      | Prom Metric                            |
| -------------- | -------------------------------- | -------------------------------------- |
| `k8s_app_meta` | `process.cpu.utilization`        | `process_cpu_utilization_ratio`        |
| `k8s_app_meta` | `process.cpu.time`               | `process_cpu_time_seconds_total`       |
| `k8s_app_meta` | `process.memory.usage`           | `process_memory_usage_bytes`           |
| `k8s_app_meta` | `process.memory.virtual`         | `process_memory_virtual_bytes`         |
| `k8s_app_meta` | `process.disk.io`                | `process_disk_io_bytes_total`          |
| `k8s_app_meta` | `messaging.publish.duration`     | `messaging_publish_duration_seconds`   |
| `k8s_app_meta` | `messaging.process.duration`     | `messaging_process_duration_seconds`   |
| `k8s_app_meta` | `http.server.request.duration`   | `http_server_request_duration_seconds` |
| `k8s_app_meta` | `http.server.request.body.size`  | `http_server_request_body_size_bytes`  |
| `k8s_app_meta` | `http.server.response.body.size` | `http_server_response_body_size_bytes` |
| `k8s_app_meta` | `http.client.request.duration`   | `http_client_request_duration_seconds` |
| `k8s_app_meta` | `http.client.request.body.size`  | `http_client_request_body_size_bytes`  |
| `k8s_app_meta` | `http.client.response.body.size` | `http_client_response_body_size_bytes` |
| `k8s_app_meta` | `rpc.client.duration`            | `rpc_client_duration_seconds`          |
| `k8s_app_meta` | `rpc.server.duration`            | `rpc_server_duration_seconds`          |
| `k8s_app_meta` | `db.client.operation.duration`   | `db_client_operation_duration_seconds` |
| `k8s_app_meta` | `gpu.kernel.launch.calls`        | `gpu_kernel_launch_calls_total`        |
| `k8s_app_meta` | `gpu.kernel.grid.size`           | `gpu_kernel_grid_size_total`           |
| `k8s_app_meta` | `gpu.kernel.block.size`          | `gpu_kernel_block_size_total`          |
| `k8s_app_meta` | `gpu.memory.allocations`         | `gpu_memory_allocations_bytes_total`   |
