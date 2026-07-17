---
title: 設定
weight: 20
description: ニーズに合わせてコレクターを設定する方法を確認してください
default_lang_commit: ad6f8d1e5179464d22f7e9cdf9fe86bc53f550e5
drifted_from_default: true
# prettier-ignore
cSpell:ignore: cfssl cfssljson configtls fluentforward gencert genkey hostmetrics initca oidc pprof prodevent prometheusremotewrite spanevents unredacted upsert zpages
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

`--config` フラグは、ファイルパス、または設定 URI `"<scheme>:<opaque_data>"` の形式の値のいずれかを受け取ります。
現在、OpenTelemetry Collector は `scheme` として以下のプロバイダーをサポートしています。

- **file** - ファイルから設定を読み込みます。たとえば `file:path/to/config.yaml` のように指定します。
- **env** - 環境変数から設定を読み込みます。たとえば `env:MY_CONFIG_IN_AN_ENVVAR` のように指定します。
- **yaml** - YAML 文字列から設定を読み込みます。サブパスは `::` で区切ります。
  たとえば `yaml:exporters::debug::verbosity: detailed` のように指定します。

<!-- prettier-ignore-start -->
- **http** - HTTP URI から設定を読み込みます。たとえば `http://www.example.com` のように指定します。
- **https** - HTTPS URI から設定を読み込みます。たとえば
`https://www.example.com` のように指定します。
<!-- prettier-ignore-end -->

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

> [!TIP]
>
> YAML パスでネストされたキーを参照するとき、ドットを含む名前空間との混乱を避けるために、必ずダブルコロン (`::`) を使います。
> たとえば `receivers::docker_stats::metrics::container.cpu.utilization::enabled: false` などです。

設定ファイルを検証するには、 `validate` コマンドを使用します。
たとえば次のような形です。

```shell
otelcol validate --config=customconfig.yaml
```

## 設定の構造 {#basics}

コレクターの設定ファイルの構造は、テレメトリーデータにアクセスするパイプラインコンポーネントの4つのクラスで構成されます。

- [レシーバー](#receivers) <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Receivers.svg">
- [プロセッサー](#processors) <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Processors.svg">
- [エクスポーター](#exporters) <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Exporters.svg">
- [コネクター](#connectors) <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Load_Balancer.svg">

各パイプラインコンポーネントを設定した後、設定ファイルの[service](#service)節内のパイプラインを使用して有効にする必要があります。

パイプラインコンポーネントの他に、[拡張機能](#extensions)を設定することもできます。
[拡張機能](#extensions)は、診断ツールなど、コレクターに追加できる機能を提供します。
拡張機能はテレメトリーデータに直接アクセスする必要はなく、[service](#service) 節で有効にできます。

<a id="endpoint-0.0.0.0-warning"></a>以下は、レシーバー、プロセッサー、エクスポーター、3つの拡張機能を持つコレクターの設定例です。

> [!WARNING]
>
> 一般に、すべてのクライアントがローカルの場合、エンドポイントを `localhost` にバインドするのが望ましいですが、この例の構成では便宜上「未指定」アドレス `0.0.0.0` を使用しています。
> コレクターのデフォルトは `localhost` です。
> エンドポイント設定値としてのこれらの選択肢の詳細については、[サービス拒否攻撃への対策][Safeguards against denial of service attacks]を参照してください。

[Safeguards against denial of service attacks]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:

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
      exporters: [otlp_grpc]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
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

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:
  otlp_grpc/2:
    endpoint: otelcol2:4317
    sending_queue:
      batch:

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
      exporters: [otlp_grpc]
    traces/2:
      receivers: [otlp/2]
      exporters: [otlp_grpc/2]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
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
      exporters: [otlp_grpc]
```

そして `exporters.yaml` ファイルが次のようになっているとします。

```yaml
otlp_grpc:
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
  otlp_grpc:
    endpoint: otelcol.observability.svc.cluster.local:443

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

## レシーバー <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Receivers.svg"> {#receivers}

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

## プロセッサー <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Processors.svg"> {#processors}

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

## エクスポーター <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Exporters.svg"> {#exporters}

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
  otlp_grpc/jaeger:
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
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # データソース: トレース、メトリクス
  otlp_http:
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

## コネクター <img width="32" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Load_Balancer.svg"> {#connectors}

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
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [memory_limiter]
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
カスタムの認証機能を開発したい場合は、[認証機能の拡張を開発する](/docs/collector/extend/custom-component/extension/authenticator/) を参照してください。

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
  otlp_grpc/auth:
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
        - otlp_grpc/auth
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

#### コレクターでの証明書の使用 {#using-certificates-in-the-collector}

証明書を用意したら、コレクターがそれを使うように設定します。

##### レシーバー（サーバー側）の TLS 設定 {#tls-configuration-for-receivers-server-side}

着信接続を暗号化するには、レシーバーに TLS を設定します。
サーバー証明書を指定するには `cert_file` と `key_file` を使用します。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
      http:
        endpoint: 0.0.0.0:4318
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
```

##### エクスポーター（クライアント側）の TLS 設定 {#tls-configuration-for-exporters-client-side}

送信接続を暗号化するには、エクスポーターに TLS を設定します。
サーバーの証明書を検証するために `ca_file` を使用します。

```yaml
exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
```

サーバーにクライアント証明書を提示する必要がある場合は、次のようにします。

```yaml
exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/cert.pem
      key_file: /path/to/cert-key.pem
```

##### mTLS の設定（相互 TLS） {#mtls-configuration-mutual-tls}

mTLS では、レシーバーとエクスポーターの両方が互いの証明書を検証します。
レシーバーには、クライアント証明書を検証するために `client_ca_file` を追加します。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/server-cert.pem
          key_file: /path/to/server-key.pem
          client_ca_file: /path/to/ca.pem
```

エクスポーターには、サーバーを検証する CA とクライアント証明書の両方を指定します。

```yaml
exporters:
  otlp_grpc:
    endpoint: remote-collector:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/client-cert.pem
      key_file: /path/to/client-key.pem
```

##### TLS 共通設定 {#common-tls-settings}

TLS 設定に利用できる項目は以下のとおりです。

| 設定                   | 説明                                               |
| ---------------------- | -------------------------------------------------- |
| `ca_file`              | ピア証明書を検証するための CA 証明書のパス         |
| `cert_file`            | TLS 証明書のパス                                   |
| `key_file`             | TLS 秘密鍵のパス                                   |
| `client_ca_file`       | クライアント証明書を検証するための CA 証明書のパス |
| `insecure`             | TLS 検証を無効にする（本番環境では非推奨）         |
| `insecure_skip_verify` | サーバー証明書の検証をスキップする（非推奨）       |
| `min_version`          | 最小 TLS バージョン（たとえば `1.2` や `1.3`）     |
| `max_version`          | 最大 TLS バージョン                                |
| `reload_interval`      | 証明書を再読み込みするまでの期間                   |

<!-- prettier-ignore-start -->
<!-- markdownlint-disable MD034 -->
> TLS 設定オプションの詳細については、[configtls のドキュメント](https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/config/configtls/README.md)を参照してください。
<!-- markdownlint-enable MD034 -->
<!-- prettier-ignore-end -->

[dcc]: /docs/concepts/components/#collector

## 設定を上書きする {#override-settings}

`--set` オプションを使用してコレクター設定をオーバーライドできます。
この方法で定義した設定は、すべての `--config` ソースが解決されてマージされた後に最終的な設定にマージされます。

以下の例では、ネストされた節の内部で設定を上書きする方法を示します。

### シンプルなプロパティ {#simple-property}

`--set` オプションは常に1つのキー/バリューのペアを受け取り、 `--set key=value` のように使います。
これに相当する YAML は次のとおりです。

```yaml
key: value
```

### 複雑なネストされたキー {#complex-nested-keys}

ネストされたマップの値を参照するには、ペアの名前のキー区切り文字として2つのコロン (`::`) を使います。
たとえば、 `--set outer::inner=value` は次のように変換されます。

```yaml
outer:
  inner: value
```

### 複数の値 {#multiple-values}

複数の値を設定するには、複数の `--set` フラグを指定します。
したがって `--set a=b --set c=d` は次のようになります。

```yaml
a: b
c: d
```

### 配列の値 {#array-values}

配列は `[]` で値を囲んで表現できます。
たとえば、 `--set "key=[a, b, c]"` は次のように変換されます。

```yaml
key:
  - a
  - b
  - c
```

より複雑なデータ構造を表現する必要がある場合は、YAML の利用を強く推奨します。

> [!CAUTION]
>
> `--set` オプションには以下の制約があります。
>
> 1. ドット `.` を含むキーの設定はサポートしていません。
> 2. 等号 `=` を含むキーの設定はサポートしていません。
> 3. プロパティの値の部分の設定キーの区切り文字は "::" です。
>    たとえば `--set "name={a::b: c}"` は `--set name::a::b=c` と等価です。

## 他の設定プロバイダーの埋め込み {#embedding-other-configuration-providers}

ある設定プロバイダーから、次のように他の設定プロバイダーを参照できます。

```yaml
receivers:
  otlp:
    protocols:
      grpc:

exporters: ${file:otlp-exporter.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

## ディストリビューションで利用できるコンポーネントを確認する方法 {#how-to-check-components-available-in-a-distribution}

`build-info` サブコマンドを使用します。以下に例を示します。

```bash
otelcol components
```

出力例:

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.143.0
receivers:
  - otlp
processors:
  - memory_limiter
exporters:
  - otlp_grpc
  - otlp_http
  - debug
extensions:
  - zpages
```

## 最終的な設定を確認する方法 {#how-to-examine-the-final-configuration}

> [!CAUTION]
>
> このコマンドは実験的な機能です。
> 動作は予告なく変更される可能性があります。

`print-config` をデフォルトモード (`--mode=redacted`) と `--feature-gates=otelcol.printInitialConfig` で使用します。

```bash
otelcol print-config --config=file:examples/local/otel-config.yaml
```

デフォルトでは、設定は有効な場合にのみ出力され、機密情報はマスクされます。
有効でない可能性のある設定を出力するには、`--validate=false` を使用します。

### 機密フィールドを表示する方法 {#how-to-view-sensitive-fields}

`print-config` を `--mode=unredacted` と `--feature-gates=otelcol.printInitialConfig` で使用します。

```bash
otelcol print-config --mode=unredacted --config=file:examples/local/otel-config.yaml
```

### 最終的な設定を JSON 形式で出力する方法 {#how-to-print-the-final-configuration-in-json-format}

> [!CAUTION]
>
> このコマンドは実験的な機能です。
> 動作は予告なく変更される可能性があります。

`print-config` を `--format=json` と `--feature-gates=otelcol.printInitialConfig` で使用します。
JSON 形式は不安定とみなされていることに注意してください。

```bash
otelcol print-config --format=json --config=file:examples/local/otel-config.yaml
```
