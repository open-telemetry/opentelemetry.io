---
title: 設定
weight: 20
description: ニーズに合わせてCollectorを設定する方法を学ぶ
default_lang_commit: 82dc25ce2cc1c6b3b2bde68b5d25bd58e5ac49b3
# prettier-ignore
cSpell:ignore: cfssl cfssljson fluentforward gencert genkey hostmetrics initca oidc otlphttp pprof prodevent prometheusremotewrite spanevents upsert zpages
---

<!-- markdownlint-disable link-fragments -->

OpenTelemetry Collectorをオブザーバビリティのニーズに合わせて設定できます。
Collectorの設定がどのように機能するかを学ぶ前に、以下の内容を理解しておいてください。

- [データ収集コンセプト][dcc]、OpenTelemetry Collectorに適用されるリポジトリを理解するため。
- [エンドユーザー向けセキュリティガイダンス](/docs/security/config-best-practices/)
- [コンポーネント開発者向けセキュリティガイダンス](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)

## 配置場所 {#location}

デフォルトでは、Collectorの設定は`/etc/<otel-directory>/config.yaml`に配置されます。
ここで、`<otel-directory>`は`otelcol`、`otelcol-contrib`、または使用しているCollectorのバージョンやCollectorディストリビューションに応じて他の値になります。

`--config`オプションを使用して1つ以上の設定を提供できます。たとえば：

```shell
otelcol --config=customconfig.yaml
```

異なるパスにある複数のファイルを使用して複数の設定を提供することもできます。
各ファイルは完全な設定または部分的な設定であり、ファイルは相互にコンポーネントを参照できます。
ファイルのマージが完全な設定を構成しない場合、必要なコンポーネントがデフォルトで追加されないため、ユーザーはエラーを受け取ります。
コマンドラインで次のように複数のファイルパスを渡します。

```shell
otelcol --config=file:/path/to/first/file --config=file:/path/to/second/file
```

環境変数、HTTP URI、またはYAMLパスを使用して設定を提供することもできます。
例を挙げましょう。

```shell
otelcol --config=env:MY_CONFIG_IN_AN_ENVVAR --config=https://server/config.yaml
otelcol --config="yaml:exporters::debug::verbosity: normal"
```

{{% alert title="ヒント" %}}

YAMLパスでネストされたキーを参照する場合、ドットを含む名前空間との混同を避けるため、必ずダブルコロン(::)を使用してください。
たとえば、`receivers::docker_stats::metrics::container.cpu.utilization::enabled: false`です。

{{% /alert %}}

設定ファイルを検証するには、`validate`コマンドを使用します。
例を挙げましょう。

```shell
otelcol validate --config=customconfig.yaml
```

## 設定構成 {#basics}

Collectorの設定ファイルの構造は、テレメトリーデータにアクセスする4つのクラスのパイプラインコンポーネントで構成されています。

- [レシーバー](#receivers)
  <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Receivers.svg">
- [プロセッサー](#processors)
  <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Processors.svg">
- [エクスポーター](#exporters)
  <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Exporters.svg">
- [コネクター](#connectors)
  <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Load_Balancer.svg">

各パイプラインコンポーネントを設定した後、設定ファイルの[サービス](#service)セクション内のパイプラインを使用して有効にする必要があります。

パイプラインコンポーネントに加えて、[エクステンション](#extensions)も設定できます。
これらは診断ツールなど、Collectorに追加できる機能を提供します。エクステンションはテレメトリーデータへの直接アクセスを必要とせず、[サービス](#service)セクションを通じて有効化されます。

<a id="endpoint-0.0.0.0-warning"></a> 以下は、レシーバー、プロセッサー、エクスポーター、および3つのエクステンションを含むCollector設定の例です。

{{% alert title="重要" color="warning" %}}

すべてのクライアントがローカルの場合、エンドポイントを`localhost`にバインドすることが一般的に望ましいですが、私たちの例の設定では便宜上「未指定」アドレス`0.0.0.0`を使用しています。
Collectorは現在デフォルトで`0.0.0.0`になっていますが、近い将来デフォルトは`localhost`に変更される予定です。
エンドポイント設定値としてこれらのいずれかの選択に関する詳細については、[サービス拒否攻撃に対する保護措置][Safeguards against denial of service attacks]を参照してください。

[Safeguards against denial of service attacks]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks

{{% /alert %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
processors:
  batch:

exporters:
  otlp:
    endpoint: otelcol:4317

extensions:
  health_check:
  pprof:
  zpages:

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
```

レシーバー、プロセッサー、エクスポーター、パイプラインは`type[/name]`形式に従うコンポーネント識別子を通じて定義されることに注意してください。
たとえば`otlp`や`otlp/2`です。
識別子が一意である限り、特定のタイプのコンポーネントを複数回定義できます。
例を挙げましょう。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  otlp/2:
    protocols:
      grpc:
        endpoint: 0.0.0.0:55690

processors:
  batch:
  batch/test:

exporters:
  otlp:
    endpoint: otelcol:4317
  otlp/2:
    endpoint: otelcol2:4317

extensions:
  health_check:
  pprof:
  zpages:

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    traces/2:
      receivers: [otlp/2]
      processors: [batch/test]
      exporters: [otlp/2]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
```

設定には他のファイルを含めることもでき、CollectorがそれらをYAML設定の単一のインメモリ表現にマージします。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters: ${file:exporters.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp]
```

`exporters.yaml`ファイルは以下のようになります。

```yaml
otlp:
  endpoint: otelcol.observability.svc.cluster.local:443
```

メモリ内の最終結果は以下のようになります。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  otlp:
    endpoint: otelcol.observability.svc.cluster.local:443

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp]
```

## レシーバー <img width="35" class="img-initial" alt="" src="/img/logos/32x32/Receivers.svg"> {#receivers}

レシーバーは1つ以上のソースからテレメトリーを収集します。
プルベースまたはプッシュベースで、1つ以上の[データソース](/docs/concepts/signals/)をサポートできます。

レシーバーは`receivers`セクションで設定されます。
多くのレシーバーにはデフォルト設定が付属しているため、レシーバーの名前を指定するだけで設定できます。
レシーバーを設定する必要がある場合やデフォルト設定を変更したい場合は、このセクションで行えます。
指定した設定は、存在する場合、デフォルト値を上書きします。

> レシーバーを設定しても有効にはなりません。
> レシーバーは[サービス](#service)セクション内の適切なパイプラインに追加することで有効になります。

Collectorには1つ以上のレシーバーが必要です。
以下の例は、同じ設定ファイルにさまざまなレシーバーを示しています。

```yaml
receivers:
  # データソース：ログ
  fluentforward:
    endpoint: 0.0.0.0:8006

  # データソース：メトリクス
  hostmetrics:
    scrapers:
      cpu:
      disk:
      filesystem:
      load:
      memory:
      network:
      process:
      processes:
      paging:

  # データソース：トレース
  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      thrift_binary:
      thrift_compact:
      thrift_http:

  # データソース：トレース、メトリクス、ログ
  kafka:
    protocol_version: 2.0.0

  # データソース：トレース、メトリクス
  opencensus:

  # データソース：トレース、メトリクス、ログ
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: cert.pem
          key_file: cert-key.pem
      http:
        endpoint: 0.0.0.0:4318

  # データソース：メトリクス
  prometheus:
    config:
      scrape_configs:
        - job_name: otel-collector
          scrape_interval: 5s
          static_configs:
            - targets: [localhost:8888]

  # データソース：トレース
  zipkin:
```

> 詳細なレシーバー設定については、[レシーバーのREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md)を参照してください。

## プロセッサー <img width="35" class="img-initial" alt="" src="/img/logos/32x32/Processors.svg"> {#processors}

プロセッサーはレシーバーが収集したデータを取得し、エクスポーターに送信する前に変更または変換します。
データ処理は、各プロセッサーに定義されたルールや設定に従って行われ、フィルタリング、ドロップ、リネーム、テレメトリーの再計算などの操作が含まれる場合があります。
パイプライン内のプロセッサーの順序によって、Collectorがシグナルに適用する処理操作の順序が決まります。

プロセッサーはオプションですが、いくつかは[推奨されています](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。

プロセッサーはCollector設定ファイルの`processors`セクションを使用して設定できます。
指定した設定は、存在する場合、デフォルト値を上書きします。

> プロセッサーを設定しても有効にはなりません。
> プロセッサーは[サービス](#service)セクション内の適切なパイプラインに追加することで有効になります。

以下の例は、同じ設定ファイルにいくつかのデフォルトプロセッサーを示しています。
[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)のリストと[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor)のリストを組み合わせることで、プロセッサーの完全なリストを見つけることができます。

```yaml
processors:
  # データソース：トレース
  attributes:
    actions:
      - key: environment
        value: production
        action: insert
      - key: db.statement
        action: delete
      - key: email
        action: hash

  # データソース：トレース、メトリクス、ログ
  batch:

  # データソース：メトリクス、メトリクス、ログ
  filter:
    error_mode: ignore
    traces:
      span:
        - 'attributes["container.name"] == "app_container_1"'
        - 'resource.attributes["host.name"] == "localhost"'
        - 'name == "app_3"'
      spanevent:
        - 'attributes["grpc"] == true'
        - 'IsMatch(name, ".*grpc.*")'
    metrics:
      metric:
        - 'name == "my.metric" and resource.attributes["my_label"] == "abc123"'
        - 'type == METRIC_DATA_TYPE_HISTOGRAM'
      datapoint:
        - 'metric.type == METRIC_DATA_TYPE_SUMMARY'
        - 'resource.attributes["service.name"] == "my_service_name"'
    logs:
      log_record:
        - 'IsMatch(body, ".*password.*")'
        - 'severity_number < SEVERITY_NUMBER_WARN'

  # データソース：トレース、メトリクス、ログ
  memory_limiter:
    check_interval: 5s
    limit_mib: 4000
    spike_limit_mib: 500

  # データソース：トレース
  resource:
    attributes:
      - key: cloud.zone
        value: zone-1
        action: upsert
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
      - key: redundant-attribute
        action: delete

  # データソース：トレース
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 15

  # データソース：トレース
  span:
    name:
      to_attributes:
        rules:
          - ^\/api\/v1\/document\/(?P<documentId>.*)\/update$
      from_attributes: [db.svc, operation]
      separator: '::'
```

> 詳細なプロセッサー設定については、[プロセッサーのREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md)を参照してください。

## エクスポーター <img width="35" class="img-initial" alt="" src="/img/logos/32x32/Exporters.svg"> {#exporters}

エクスポーターは1つ以上のバックエンドまたは宛先にデータを送信します。
エクスポーターはプルベースまたはプッシュベースで、1つ以上の[データソース](/docs/concepts/signals/)をサポートできます。

`exporters`セクション内の各キーはエクスポーターインスタンスを定義します。
キーは`type/name`形式に従い、`type`はエクスポータータイプ（例：`otlp`、`kafka`、`prometheus`）を指定し、`name`（オプション）は同じタイプの複数のインスタンスに一意の名前を提供するために追加できます。

ほとんどのエクスポーターは、少なくとも宛先を指定するための設定が必要であり、認証トークンやTLS証明書などのセキュリティ設定も必要です。
指定した設定は、存在する場合、デフォルト値を上書きします。

> エクスポーターを設定しても有効にはなりません。
> エクスポーターは[サービス](#service)セクション内の適切なパイプラインに追加することで有効になります。

Collectorには1つ以上のエクスポーターが必要です。
以下の例は、同じ設定ファイルにさまざまなエクスポーターを示しています。

```yaml
exporters:
  # データソース：トレース、メトリクス、ログ
  file:
    path: ./filename.json

  # データソース：トレース
  otlp/jaeger:
    endpoint: jaeger-server:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # データソース：トレース、メトリクス、ログ
  kafka:
    protocol_version: 2.0.0

  # データソース：トレース、メトリクス、ログ
  # 注：v0.86.0以前は`logging`を`debug`の代わりに使用
  debug:
    verbosity: detailed

  # データソース：トレース、メトリクス
  opencensus:
    endpoint: otelcol2:55678

  # データソース：トレース、メトリクス、ログ
  otlp:
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # データソース：トレース、メトリクス
  otlphttp:
    endpoint: https://otlp.example.com:4318

  # データソース：メトリクス
  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: default

  # データソース：メトリクス
  prometheusremotewrite:
    endpoint: http://prometheus.example.com:9411/api/prom/push
    # 公式のPrometheus（Docker経由で実行）を使用する場合
    # endpoint: 'http://prometheus:9090/api/v1/write'、追加：
    # tls:
    #   insecure: true

  # データソース：トレース
  zipkin:
    endpoint: http://zipkin.example.com:9411/api/v2/spans
```

一部のエクスポーターは、[証明書の設定](#setting-up-certificates)で説明されているように、セキュアな接続を確立するためにx.509証明書が必要であることに注意してください。

> エクスポーター設定の詳細については、[エクスポーターのREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md)を参照してください。

## コネクター <img width="32" class="img-initial" alt="" src="/img/logos/32x32/Load_Balancer.svg"> {#connectors}

コネクターは2つのパイプラインを結合し、エクスポーターとレシーバーの両方として機能します。
コネクターは1つのパイプラインの最後でエクスポーターとしてデータを消費し、別のパイプラインの最初でレシーバーとしてデータを出力します。
消費および出力されるデータは、同じタイプまたは異なるデータタイプである場合があります。
コネクターを使用して、消費したデータを要約、複製、またはルーティングできます。

Collector設定ファイルの`connectors`セクションを使用して1つ以上のコネクターを設定できます。
デフォルトでは、コネクターは設定されていません。
各タイプのコネクターは、1つ以上のデータタイプのペアで動作するように設計されており、それに応じてパイプラインを接続するためにのみ使用できます。

> コネクターを設定しても有効にはなりません。コネクターは[サービス](#service)セクション内のパイプラインを通じて有効になります。

以下の例は、`count`コネクターと`pipelines`セクションでの設定方法を示しています。コネクターがトレースのエクスポーターとして、メトリクスのレシーバーとして機能し、両方のパイプラインを接続していることに注意してください。

```yaml
receivers:
  foo:

exporters:
  bar:

connectors:
  count:
    spanevents:
      my.prod.event.count:
        description: 私のprod環境からのスパンイベントの数。
        conditions:
          - 'attributes["env"] == "prod"'
          - 'name == "prodevent"'

service:
  pipelines:
    traces:
      receivers: [foo]
      exporters: [count]
    metrics:
      receivers: [count]
      exporters: [bar]
```

> 詳細なコネクター設定については、[コネクターのREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)を参照してください。

## エクステンション <img width="32" class="img-initial" alt="" src="/img/logos/32x32/Extensions.svg"> {#extensions}

エクステンションは、テレメトリーデータの処理に直接関与しないタスクを実行するためにCollectorの機能を拡張するオプションのコンポーネントです。
たとえば、Collectorのヘルスモニタリング、サービスディスカバリー、またはデータ転送などのエクステンションを追加できます。

Collector設定ファイルの`extensions`セクションを通じてエクステンションを設定できます。
ほとんどのエクステンションにはデフォルト設定が付属しているため、エクステンションの名前を指定するだけで設定できます。
指定した設定は、存在する場合、デフォルト値を上書きします。

> エクステンションを設定しても有効にはなりません。エクステンションは[サービス](#service)セクション内で有効になります。

デフォルトでは、エクステンションは設定されていません。
以下の例は、同じファイルに設定されたいくつかのエクステンションを示しています。

```yaml
extensions:
  health_check:
  pprof:
  zpages:
```

> 詳細なエクステンション設定については、[エクステンションのREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md)を参照してください。

## サービスセクション {#service}

`service`セクションは、レシーバー、プロセッサー、エクスポーター、エクステンションセクションにある設定に基づいて、Collectorで有効になるコンポーネントを設定するために使用されます。
コンポーネントが設定されていても、`service`セクション内で定義されていない場合、有効になりません。

サービスセクションは3つのサブセクションで構成されています。

- エクステンション
- パイプライン
- テレメトリー

### エクステンション {#service-extensions}

`extensions`サブセクションは、有効にしたいエクステンションのリストで構成されています。
例を挙げましょう。

```yaml
service:
  extensions: [health_check, pprof, zpages]
```

### パイプライン {#pipelines}

`pipelines`サブセクションは、パイプラインが設定される場所であり、以下のタイプがあります。

- `traces`はトレースデータを収集および処理します。
- `metrics`はメトリクスデータを収集および処理します。
- `logs`はログデータを収集および処理します。

パイプラインは、レシーバー、プロセッサー、エクスポーターのセットで構成されています。
パイプラインにレシーバー、プロセッサー、またはエクスポーターを含める前に、適切なセクションでその設定を定義してください。

同じレシーバー、プロセッサー、またはエクスポーターを複数のパイプラインで使用できます。
プロセッサーが複数のパイプラインで参照される場合、各パイプラインはプロセッサーの個別のインスタンスを取得します。

以下はパイプライン設定の例です。プロセッサーの順序がデータが処理される順序を決定することに注意してください。

```yaml
service:
  pipelines:
    metrics:
      receivers: [opencensus, prometheus]
      processors: [batch]
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [batch, memory_limiter]
      exporters: [opencensus, zipkin]
```

コンポーネントと同様に、`type[/name]`構文を使用して、特定のタイプの追加パイプラインを作成します。
以下は前の設定を拡張した例です。

```yaml
service:
  pipelines:
    # ...
    traces:
      # ...
    traces/2:
      receivers: [opencensus]
      processors: [batch]
      exporters: [zipkin]
```

### テレメトリー {#telemetry}

`telemetry`設定セクションは、Collector自体のオブザーバビリティを設定する場所です。
`logs`と`metrics`の2つのサブセクションで構成されています。
これらのシグナルを設定する方法については、
[Collectorで内部テレメトリを有効にする](/docs/collector/internal-telemetry#activate-internal-telemetry-in-the-collector)を参照してください。

## その他の情報 {#other-information}

### 環境変数 {#environment-variables}

環境変数の使用と展開はCollector設定でサポートされています。
たとえば、`DB_KEY`と`OPERATION`環境変数に格納された値を使用するには、次のように記述できます。

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY}
        action: ${env:OPERATION}
```

`${env:DB_KEY:-some-default-var}` のようにbash構文を使用して環境変数にデフォルトを渡すことができます。

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY:-mydefault}
        action: ${env:OPERATION:-}
```

リテラルの`$`を示すには`$$`を使用します。
たとえば、`$DataVisualization`を表現すると次のようになります。

```yaml
exporters:
  prometheus:
    endpoint: prometheus:8889
    namespace: $$DataVisualization
```

### プロキシサポート {#proxy-support}

[`net/http`](https://pkg.go.dev/net/http)パッケージを使用するエクスポーターは、以下のプロキシ環境変数を遵守します。

- `HTTP_PROXY`：HTTPプロキシのアドレス
- `HTTPS_PROXY`：HTTPSプロキシのアドレス
- `NO_PROXY`：プロキシを使用してはならないアドレス

Collectorの起動時に設定されている場合、エクスポーターはプロトコルに関係なく、これらの環境変数で定義されたとおりにプロキシトラフィックを通過させるか、プロキシトラフィックをバイパスします。

### 認証 {#authentication}

HTTPまたはgRPCポートを公開するほとんどのレシーバーは、Collectorの認証メカニズムを使用して保護できます。
同様に、HTTPまたはgRPCクライアントを使用するほとんどのエクスポーターは、送信リクエストに認証を追加できます。

Collectorの認証メカニズムはエクステンションメカニズムを使用し、カスタム認証システムをCollectorディストリビューションにプラグインできるようにします。
各認証エクステンションには2つの可能な使用法があります。

- エクスポーターのクライアント認証として、送信リクエストに認証データを追加。
- レシーバーのサーバー認証として、受信接続を認証。

既知の認証システムのリストについては、[Registry](/ecosystem/registry/?s=authenticator&component=extension)を参照してください。
カスタム認証システムの開発に興味がある場合は、[認証エクステンションの構築](../building/authenticator-extension)を参照してください。

Collectorのレシーバーにサーバー認証を追加するには、以下の手順に従います。

1. `.extensions`の下に認証エクステンションとその設定を追加します。
2. `.services.extensions`に認証への参照を追加して、Collectorによって読み込まれるようにします。
3. `.receivers.<your-receiver>.<http-or-grpc-config>.auth`の下に認証への参照を追加します。

以下の例では、レシーバー側でOIDC認証を使用しており、エージェントとして動作するOpenTelemetry Collectorからデータを受信するリモートCollectorに適しています。

```yaml
extensions:
  oidc:
    issuer_url: http://localhost:8080/auth/realms/opentelemetry
    audience: collector

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:

exporters:
  # 注：v0.86.0以前は`logging`を`debug`の代わりに使用。
  debug:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters:
        - debug
```

エージェント側では、これはOTLPエクスポーターがOIDCトークンを取得し、リモートCollectorへのすべてのRPCに追加する例です。

```yaml
extensions:
  oauth2client:
    client_id: agent
    client_secret: some-secret
    token_url: http://localhost:8080/auth/realms/opentelemetry/protocol/openid-connect/token

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:

exporters:
  otlp/auth:
    endpoint: remote-collector:4317
    auth:
      authenticator: oauth2client

service:
  extensions:
    - oauth2client
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - otlp/auth
```

### 証明書の設定 {#setting-up-certificates}

本番環境では、セキュアな通信のためにTLS証明書を使用するか、相互認証のためにmTLSを使用します。
この例のように自己署名証明書を生成するには、以下の手順に従います。
本番利用のために、現在の証明書プロビジョニング手順を使用して証明書を調達することをお勧めします。

[`cfssl`](https://github.com/cloudflare/cfssl)をインストールし、以下の`csr.json`ファイルを作成します。

```json
{
  "hosts": ["localhost", "127.0.0.1"],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "O": "OpenTelemetry Example"
    }
  ]
}
```

次に以下のコマンドを実行します。

```sh
cfssl genkey -initca csr.json | cfssljson -bare ca
cfssl gencert -ca ca.pem -ca-key ca-key.pem csr.json | cfssljson -bare cert
```

これにより2つの証明書が作成されます。

- `ca.pem`内の「OpenTelemetry Example」認証局（CA）、関連するキーは`ca-key.pem`
- `cert.pem`内のクライアント証明書、OpenTelemetry Example CAによって署名され、関連するキーは`cert-key.pem`。

[dcc]: /docs/concepts/components/#collector

## 設定のオーバーライド {#override-settings}

`--set`オプションを使用してCollectorの設定をオーバーライドできます。
この方法で定義した設定は、すべての`--config`ソースが解決およびマージされた後、最終的な設定にマージされます。

以下の例は、ネストされたセクション内の設定をオーバーライドする方法を示しています。

```sh
otelcol --set "exporters::debug::verbosity=detailed"
otelcol --set "receivers::otlp::protocols::grpc={endpoint:localhost:4317, compression: gzip}"
```

{{% alert title="重要" color="warning" %}}

`--set`オプションは、ドットまたは等号を含むキーの設定をサポートしていません。

{{% /alert %}}
