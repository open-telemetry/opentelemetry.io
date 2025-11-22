---
title: 設定
weight: 20
description: ニーズに合わせてコレクターを設定する方法を確認してください
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
drifted_from_default: true
# prettier-ignore
cSpell:ignore: cfssl cfssljson fluentforward gencert genkey hostmetrics initca oidc otlphttp pprof prodevent prometheusremotewrite spanevents upsert zpages
---

<!-- markdownlint-disable link-fragments -->

観測のニーズに合わせて OpenTelemetry Collector を設定できます。
コレクターの設定方法を学ぶ前に、以下の内容を理解してください。

- [データ収集の概念][dcc]、OpenTelemetry コレクターに適用可能なリポジトリを理解します。
- [エンドユーザー向けセキュリティガイダンス](/docs/security/config-best-practices/)
- [コンポーネント開発者のためのセキュリティガイダンス](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)

## ロケーション {#location}

デフォルトでは、コレクターの設定は `/etc/<otel-directory>/config.yaml` に配置されます。
ここで、 `<otel-directory>` はコレクターのバージョンや使っているコレクターのディストリビューションによって `otelcol` 、 `otelcol-contrib` あるいは他の値となります。

`--config` オプションを使用して、1つまたは複数の設定を指定できます。
たとえば次のように行います。

```shell
otelcol --config=customconfig.yaml
```

また、異なるパスにある複数のファイルを使用して、複数の設定を提供できます。
各ファイルは完全な構成でも部分的な構成でもよく、ファイルは互いのコンポーネントを参照できます。
ファイルの結合が完全な設定を構成しない場合、必要なコンポーネントがデフォルトで追加されないため、エラーとなります。
コマンドラインで次のように複数のファイルパスを渡します。

```shell
otelcol --config=file:/path/to/first/file --config=file:/path/to/second/file
```

環境変数、HTTP URI、YAMLパスを使って設定を提供することもできます。
たとえば次のように行います。

```shell
otelcol --config=env:MY_CONFIG_IN_AN_ENVVAR --config=https://server/config.yaml
otelcol --config="yaml:exporters::debug::verbosity: normal"
```

{{% alert title="Tip" %}}

YAML パスでネストされたキーを参照するとき、ドットを含む名前空間との混乱を避けるために、必ずダブルコロン (::) を使います。
たとえば `receivers::docker_stats::metrics::container.cpu.utilization::enabled: false` などです。

{{% /alert %}}

設定ファイルを検証するには、 `validate` コマンドを使用します。
たとえば次のような形です。

```shell
otelcol validate --config=customconfig.yaml
```

## 設定の構造 {#basics}

コレクターの設定ファイルの構造は、テレメトリーデータにアクセスするパイプラインコンポーネントの4つのクラスで構成されます。

- [レシーバー](#receivers) <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Receivers.svg">
- [プロセッサー](#processors) <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Processors.svg">
- [エクスポーター](#exporters) <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Exporters.svg">
- [コネクター](#connectors) <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Load_Balancer.svg">

各パイプラインコンポーネントを設定した後、設定ファイルの[service](#service)節内のパイプラインを使用して有効にする必要があります。

パイプラインコンポーネントの他に、[拡張機能](#extensions)を設定することもできます。
[拡張機能](#extensions)は、診断ツールなど、コレクターに追加できる機能を提供します。
拡張機能はテレメトリーデータに直接アクセスする必要はなく、[service](#service) 節で有効にできます。

<a id="endpoint-0.0.0.0-warning"></a>以下は、レシーバー、プロセッサー、エクスポーター、3つの拡張機能を持つコレクターの設定例です。

{{% alert title="Important" color="warning" %}}

一般に、すべてのクライアントがローカルの場合、エンドポイントを `localhost` にバインドするのが望ましいですが、この例の構成では便宜上「未指定」アドレス `0.0.0.0` を使用しています。
コレクターのデフォルトは現在 `0.0.0.0` ですが、近い将来 `localhost` に変更される予定です。
エンドポイント設定値としてのこれらの選択肢の詳細については、[サービス拒否攻撃への対策][Safeguards against denial of service attacks]を参照してください。

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
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

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

レシーバー、プロセッサー、エクスポーター、パイプラインは、`type[/name]` 形式にしたがうコンポーネント識別子で定義されることに注意してください。
たとえば `otlp` や `otlp/2` というような形です。
識別子が一意である限り、指定されたタイプのコンポーネントを複数回定義できます。
以下に例を載せます。

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
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

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

設定は他のファイルを含むこともでき、コレクターはそれらをYAML設定の単一のメモリ内表現にマージします。

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

そして `exporters.yaml` ファイルが次のようになっているとします。

```yaml
otlp:
  endpoint: otelcol.observability.svc.cluster.local:443
```

メモリの最終結果はこうなります。

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
プルベースでもプッシュベースでもよく、1つ以上の[データソース](/docs/concepts/signals/)をサポートすることができます。

レシーバーは `receivers` セクションで設定します。
多くのレシーバーにはデフォルト設定が付属しており、レシーバー名を指定するだけで設定できます。
レシーバーの設定が必要な場合やデフォルト設定を変更したい場合は、このセクションで行うことができます。
指定した設定がデフォルト値より優先されます。

> レシーバーを設定しても、有効になるわけではありません。
> レシーバーは、[service](#service)セクション内の適切なパイプラインに追加することで有効になります。

コレクターには1つ以上のレシーバーが必要です。
以下の例では、同じ構成ファイルにさまざまなレシーバーが含まれています。

```yaml
receivers:
  # データソース: ログ
  fluentforward:
    endpoint: 0.0.0.0:8006

  # データソース: メトリクス
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

  # データソース: トレース
  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      thrift_binary:
      thrift_compact:
      thrift_http:

  # データソース: トレース、メトリクス、ログ
  kafka:
    protocol_version: 2.0.0

  # データソース: トレース、メトリクス
  opencensus:

  # データソース: トレース、メトリクス、ログ
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: cert.pem
          key_file: cert-key.pem
      http:
        endpoint: 0.0.0.0:4318

  # データソース: メトリクス
  prometheus:
    config:
      scrape_configs:
        - job_name: otel-コレクター
          scrape_interval: 5s
          static_configs:
            - targets: [localhost:8888]

  # データソース: トレース
  zipkin:
```

> 詳細なレシーバー設定については、[レシーバーのREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md)を参照してください。

## プロセッサー <img width="35" class="img-initial" alt="" src="/img/logos/32x32/Processors.svg"> {#processors}

プロセッサーは、レシーバーによって収集されたデータを、エクスポーターに送信する前に修正または変換します。
データ処理は、各プロセッサーに定義されたルールまたは設定にしたがって行われ、フィルタリング、ドロップ、名前の変更、テレメトリーの再計算などの処理が含まれます。
パイプライン内のプロセッサーの順序は、コレクターがシグナルに適用する処理操作の順序を決定します。

プロセッサーはオプションですが、いくつかは[推奨](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)です。

コレクター構成ファイルの `processors` セクションを使用してプロセッサーを構成できます。
指定した設定は、デフォルト値がある場合はそれを上書きします。

> プロセッサーを設定しても、そのプロセッサーが有効になるわけではありません。
> プロセッサーは、[service](#service)セクション内の適切なパイプラインに追加することで有効になります。

以下の例では、同じ設定ファイルの中にデフォルトのプロセッサーをいくつか示しています。
[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)のリストと[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor)のリストを組み合わせることで、プロセッサーの完全なリストを見つけられます。

```yaml
processors:
  # データソース: トレース
  attributes:
    actions:
      - key: environment
        value: production
        action: insert
      - key: db.statement
        action: delete
      - key: email
        action: hash

  # データソース: トレース、メトリクス、ログ
  batch:

  # データソース: メトリクス、トレース、ログ
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

  # データソース: トレース、メトリクス、ログ
  memory_limiter:
    check_interval: 5s
    limit_mib: 4000
    spike_limit_mib: 500

  # データソース: トレース
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

  # データソース: トレース
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 15

  # データソース: トレース
  span:
    name:
      to_attributes:
        rules:
          - ^\/api\/v1\/document\/(?P<documentId>.*)\/update$
      from_attributes: [db.svc, operation]
      separator: '::'
```

> プロセッサー設定の詳細については、[プロセッサーのREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md)を参照してください。

## エクスポーター <img width="35" class="img-initial" alt="" src="/img/logos/32x32/Exporters.svg"> {#exporters}

エクスポーターはデータを1つ以上のバックエンドや宛先に送信します。
また、1つ以上の[データソース](/docs/concepts/signals/)をサポートすることもあります。

`exporters` セクション内の各キーはエクスポーターインスタンスを定義します。
キーは `type/name` の形式にしたがい、`type` はエクスポータータイプを指定します(例: `otlp`、 `kafka`、`prometheus`)。
また、`name` （オプション）を追加して、同じタイプの複数のインスタンスに対して一意の名前を指定することもできます。

ほとんどのエクスポーターは、少なくとも宛先を指定する設定と、認証トークンやTLS証明書などのセキュリティ設定を必要とします。
指定した設定は、デフォルト値がある場合はそれを上書きします。

> エクスポーターを設定しても、それが有効になるわけではありません。
> エクスポート機能は、[service](#service)セクション内の適切なパイプラインに追加することで有効になります。

コレクターには1つ以上のエクスポーターが必要です。
以下の例では、同じ構成ファイルにさまざまなエクスポーターが含まれています。

```yaml
exporters:
  # データソース: トレース、メトリクス、ログ
  file:
    path: ./filename.json

  # データソース: トレース
  otlp/jaeger:
    endpoint: jaeger-server:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # データソース: トレース、メトリクス、ログ
  kafka:
    protocol_version: 2.0.0

  # データソース: トレース、メトリクス、ログ
  # NOTE: v0.86.0 以前では `debug` ではなく `logging` とする
  debug:
    verbosity: detailed

  # データソース: トレース、メトリクス
  opencensus:
    endpoint: otelcol2:55678

  # データソース: トレース、メトリクス、ログ
  otlp:
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # データソース: トレース、メトリクス
  otlphttp:
    endpoint: https://otlp.example.com:4318

  # データソース: メトリクス
  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: default

  # データソース: メトリクス
  prometheusremotewrite:
    endpoint: http://prometheus.example.com:9411/api/prom/push
    # 公式の Prometheus (Docker経由で動作) の
    # エンドポイントを使う場合は: 'http://prometheus:9090/api/v1/write' 次を追加
    # tls:
    #   insecure: true

  # # データソース: トレース
  zipkin:
    endpoint: http://zipkin.example.com:9411/api/v2/spans
```

[証明書の設定](#setting-up-certificates)で説明されているように、安全な接続を確立するためにx.509証明書を必要とするエクスポーターもあることに注意してください。

> エクスポーターの設定については、[エクスポーターのREADME.md](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md)を参照してください。

## コネクター <img width="32" class="img-initial" alt="" src="/img/logos/32x32/Load_Balancer.svg"> {#connectors}

コネクターは2つのパイプラインを結合し、エクスポーターとレシーバーの両方の役割を果たします。
コネクターは、あるパイプラインの終端でエクスポーターとしてデータを消費し、別のパイプラインの始端でレシーバーとしてデータを放出します。
消費されるデータと排出されるデータは、同じデータ型である場合もあれば、異なるデータ型である場合もあります。
コネクターを使用して、消費されたデータを要約したり、複製したり、ルーティングしたりできます。

コレクター構成ファイルの `connectors` セクションを使用して、1つまたは複数のコネクターを構成できます。
デフォルトでは、コネクターは構成されていません。
コネクターの各タイプは、1つまたは複数のデータ型のペアで動作するように設計されており、パイプラインの接続にのみ使用できます。

> コネクターは[service](#service)セクション内のパイプラインを通じて有効になります。

次の例は、`count` コネクターと、`pipelines` 節での設定方法を示しています。
このコネクターは、トレースのエクスポーターとして、またメトリクスのレシーバーとして機能し、両方のパイプラインを接続していることに注意してください。

```yaml
receivers:
  foo:

exporters:
  bar:

connectors:
  count:
    spanevents:
      my.prod.event.count:
        description: The number of span events from my prod environment.
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

> コネクターの詳細な設定については、[コネクターのREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)を参照。

## 拡張機能 {#extensions}

拡張機能は、コレクターの機能を拡張して、テレメトリーデータの処理に直接関係しないタスクを実行するオプションのコンポーネントです。
たとえば、コレクターのヘルス監視、サービスディスカバリ、データ転送などの拡張機能を追加できます。

コレクター設定ファイルの `extensions` セクションで拡張機能を設定できます。
ほとんどの拡張機能にはデフォルトの設定が付属しているため、拡張機能の名前を指定するだけで設定できます。
指定した設定は、デフォルト値がある場合はそれを上書きします。

> 拡張機能を設定しても有効にはなりません。
> 拡張機能は[service](#service)セクションで有効になります。

デフォルトでは、拡張機能は設定されていません。
次の例では、同じファイルに複数の拡張機能が設定されています。

```yaml
extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679
```

> 詳細な拡張機能の設定については、[拡張機能のREADME](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md)を参照してください。

## サービスセクション {#service}

`service` セクションは、レシーバー、プロセッサー、エクスポーター、および拡張機能のセクションの構成に基づいて、コレクターで有効になるコンポーネントを構成するために使用されます。
コンポーネントが設定されているけれど、`service` セクションで定義されていない場合、そのコンポーネントは有効になりません。

サービス部門は3つのサブ節で構成されています。

- extensions
- pipelines
- telemetry

### 拡張機能 {#service-extensions}

`extensions` サブセクションは、有効にする拡張のリストで構成されます。
たとえば次のようになります。

```yaml
service:
  extensions: [health_check, pprof, zpages]
```

### パイプライン {#pipelines}

`pipelines` サブセクションは、パイプラインを設定する場所です。

- `traces:` トレースデータの収集と処理を行います
- `metrics:` メトリクスデータの収集と処理を行います
- `logs:` ログデータの収集と処理を行います

パイプラインは、レシーバー、プロセッサー、エクスポーターのセットで構成されます。
パイプラインにレシーバー、プロセッサー、エクスポーターを含める前に、適切な節で設定を定義してください。

同じレシーバー、プロセッサー、エクスポーターを複数のパイプラインで使用できます。
プロセッサーが複数のパイプラインで参照される場合、各パイプラインはプロセッサーの個別のインスタンスを取得します。

以下はパイプラインの構成例です。
プロセッサーの順番によって、データの処理順が決まることに注意してください。

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

コンポーネントと同様に、`type[/name]` 構文を使用して、指定したタイプのパイプラインを追加作成します。
前述の設定を拡張した例を示します。

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

`telemetry` 設定セクションでは、コレクター自体のオブザーバビリティを設定します。
これは2つのサブセクションで構成されます。
`logs` および `metrics` です。
これらのシグナルの設定方法については、[コレクター内部のテレメトリーを有効にする](/docs/collector/internal-telemetry#activate-internal-telemetry-in-the-collector) を参照してください。

## その他の情報 {#other-information}

### 環境変数 {#environment-variables}

コレクター設定では、環境変数の使用と拡張がサポートされています。
たとえば、`DB_KEY` および `OPERATION` 環境変数に格納されている値を使用するには、以下のように記述します。

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY}
        action: ${env:OPERATION}
```

bash構文（`${env:DB_KEY:-some-default-var}`）を使用して環境変数にデフォルト値を渡すことができます。

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY:-mydefault}
        action: ${env:OPERATION:-}
```

リテラル `$` を示すには `$$` を使用します。
たとえば、`$DataVisualization` 使うときは、次のようになります。

```yaml
exporters:
  prometheus:
    endpoint: prometheus:8889
    namespace: $$DataVisualization
```

### プロキシ対応 {#proxy-support}

[`net/http`](https://pkg.go.dev/net/http) パッケージを使用するエクスポーターは、以下のプロキシ環境変数を尊重します。

- `HTTP_PROXY`: HTTPプロキシのアドレス
- `HTTPS_PROXY`: HTTPSプロキシのアドレス
- `NO_PROXY`: プロキシを使ってはいけないアドレス

コレクターの開始時に設定されている場合、エクスポーターはプロトコルに関係なく、これらの環境変数によって定義されたプロキシトラフィックまたはバイパスプロキシトラフィックを使用します。

### 認証 {#authentication}

HTTPまたはgRPCポートを公開しているほとんどのレシーバーは、コレクターの認証メカニズムを使用して保護できます。
同様に、HTTP または gRPC クライアントを使用するほとんどのエクスポーターは、送信リクエストに認証を追加できます。

コレクターの認証メカニズムは拡張メカニズムを使用しており、カスタム認証機能をコレクターディストリビューションにプラグインできます。
各認証拡張機能には2つの使用法があります。

- エクスポーターのクライアント認証機能として、送信リクエストに認証データを追加します。
- レシーバーのサーバー認証機能として、着信接続を認証します。

既知の認証機能のリストについては、[レジストリ](/ecosystem/registry/?s=authenticator&component=extension)を参照してください。
カスタムの認証機能を開発したい場合は、[認証機能の拡張を開発する](../building/authenticator-extension) を参照してください。

コレクターのレシーバーにサーバー認証機能を追加するには、以下の手順にしたがいます。

1. 認証機能拡張とその設定を `.extensions` に追加します。
2. 認証機能への参照を `.services.extensions` に追加し、コレクターで読み込まれるようにします。
3. `.receivers.<your-receiver>.<http-or-grpc-config>.auth` に認証子への参照を追加します。

以下の例では、レシーバー側でOIDC認証を使用しているため、エージェントとして動作する OpenTelemetryコレクターからデータを受信するリモート コレクターに適しています。

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
  # NOTE: v0.86.0 以前では `debug` ではなく `logging` を使うこと
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

エージェント側では、OTLPエクスポーターにOIDCトークンを取得させ、リモートコレクターへのすべてのRPCに追加する例です。

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
    endpoint: remote-コレクター:4317
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

本番環境では、セキュアな通信にTLS証明書を使用するか、相互認証にmTLSを使用します。
以下の手順にしたがって、この例のように自己署名証明書を生成します。
現在使用している証明書のプロビジョニング手順を使用して、本番環境で使用する証明書を調達するといいでしょう。

[`cfssl`](https://github.com/cloudflare/cfssl)をインストールし、以下の `csr.json` ファイルを作成します。

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

そして以下のコマンドを実行します。

```sh
cfssl genkey -initca csr.json | cfssljson -bare ca
cfssl gencert -ca ca.pem -ca-key ca-key.pem csr.json | cfssljson -bare cert
```

これで2つの証明書が作成されます。

- `ca.pem` の "OpenTelemetry Example" 認証局（CA）とそれに紐づく `ca-key.pem` のキー
- OpenTelemetry Example CA が署名した `cert.pem` のクライアント証明書、およびそれに紐づいた `cert-key.pem` のキー

[dcc]: /docs/concepts/components/#collector

## 設定を上書きする {#override-settings}

`--set` オプションを使用してコレクター設定をオーバーライドできます。
この方法で定義した設定は、すべての `--config` ソースが解決されてマージされた後に最終的な設定にマージされます。

以下の例では、ネストされた節の内部で設定を上書きする方法を示します。

```sh
otelcol --set "exporters::debug::verbosity=detailed"
otelcol --set "receivers::otlp::protocols::grpc={endpoint:localhost:4317, compression: gzip}"
```

{{% alert title="Important" color="warning" %}}

`--set` オプションは、ドットまたは等号を含むキーの設定に対応していません。

{{% /alert %}}
