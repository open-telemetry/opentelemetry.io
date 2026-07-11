---
title: Apache APISIX が OpenTelemetry と統合してトレーシングデータを収集
linkTitle: Apache APISIX と OpenTelemetry の統合
date: 2022-03-26
author: '[Haochao Zhuang](https://github.com/dmsolr), Fei Han'
canonical_url: https://apisix.apache.org/blog/2022/02/28/apisix-integration-opentelemetry-plugin/
default_lang_commit: e1086c68246fd3b55b83c544db07f48eac0623c8
cSpell:ignore: APISIX Haochao httpbin pprof roundrobin Zhuang zpages
---

この記事では、Apache APISIX の `opentelemetry` プラグインのコンセプトと、プラグインを有効化しデプロイする方法を紹介します。

## 背景情報 {#background-information}

OpenTelemetry はオープンソースのテレメトリーデータ取得・処理システムです。
アプリケーション側のテレメトリーデータ収集・レポートのためのさまざまな SDK を提供するだけでなく、データの受信、処理、エクスポートを行うデータ収集側も提供しています。
Jaeger、Zipkin、OpenCensus などの1つまたは複数の OpenTelemetry バックエンドにエクスポートできます。
OpenTelemetry Collector に対応したプラグインの一覧は [レジストリ](/ecosystem/registry/?s=collector) で確認できます。

![Architecture-Present](architecture-present.png)

## プラグインの紹介 {#plugin-introduction}

Apache APISIX の `opentelemetry` プラグインは、トレーシングデータの収集を実装し、HTTP プロトコルを通じて OpenTelemetry Collector に送信します。
Apache APISIX は v2.13.0 からこの機能のサポートを開始しました。

OpenTelemetry の特徴のひとつは、OpenTelemetry のエージェント/SDK がバックエンドの実装にロックインされないことです。
これにより、ユーザーはバックエンドサービスを柔軟に選択できます。
つまり、アプリケーション側に影響を与えることなく、Zipkin や Jaeger などのバックエンドサービスを選択できます。

`opentelemetry` プラグインはエージェント側に位置します。
OpenTelemetry のエージェント/SDK を統合し、その機能を Apache APISIX に取り入れます。
トレースされたリクエストを収集し、`trace` を生成して OpenTelemetry Collector に転送できます。
`trace` プロトコルをサポートしており、次のバージョンでは OpenTelemetry の `logs` と `metrics` プロトコルもサポートする予定です。

## プラグインの有効化 {#enable-the-plugin}

`conf/config.yaml` 設定ファイルで `opentelemetry` プラグインを有効化し、Collector の設定を変更する必要があります。

ここでは、APISIX と同じノードに OpenTelemetry Collector をすでにデプロイしており、[OTLP HTTP Receiver](https://github.com/open-telemetry/opentelemetry-collector/blob/b3125cea266d6453df1bd48a17686f752f7d07d9/receiver/otlpreceiver/README.md?from_branch=main) を有効化しているものとします。

> OpenTelemetry Collector のデプロイについてヘルプが必要な場合は、以下のシナリオ [例](#example) を参照してください。

OTLP HTTP Receiver のデフォルトポートは `4318` で、`collector` のアドレスは OpenTelemetry Collector の HTTP Receiver アドレスです。
関連フィールドについては、[Apache APISIX ドキュメント](https://apisix.apache.org/docs/apisix/next/plugins/opentelemetry/) を参照してください。

典型的な設定は次のようになります。

```yaml
plugins:
  ... # 有効化されている他のプラグイン
  - opentelemetry
plugin_attr:
  ...
  opentelemetry:
    trace_id_source: x-request-id
    resource:
      service.name: APISIX
    collector:
      address: 127.0.0.1:4318 # OTLP HTTP Receiver のアドレス
      request_timeout: 3
```

### 方法 1: 特定のルートに対してプラグインを有効化する {#method-1-enable-the-plugin-for-a-specific-route}

テスト効果をより分かりやすく示すために、この例では `sampler` を一時的にフルサンプリングに設定して、トレースされた各リクエストの後に `trace` データが生成されるようにしています。
これにより、Web UI で `trace` 関連のデータを確認できます。
実際の状況に応じて関連パラメーターを設定することもできます。

```shell
curl http://127.0.0.1:9080/apisix/admin/routes/1 \
  -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' \
  -X PUT -d '
{
    "uri": "/get",
    "plugins": {
        "opentelemetry": {
            "sampler": {
                "name": "always_on"
            }
        }
    },
    "upstream": {
        "type": "roundrobin",
        "nodes": {
            "httpbin.org:80": 1
        }
    }
}'
```

### 方法 2: プラグインをグローバルに有効化する {#method-2-enable-the-plugin-globally}

Apache APISIX の Plugins 機能を通じて `opentelemetry` プラグインをグローバルに有効化することもできます。
グローバル設定が完了した後も、ルートを作成する必要があります。
そうしないとテストができません。

```shell
curl 'http://127.0.0.1:9080/apisix/admin/global_rules/1' \
-H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' \
-X PUT -d '{
    "plugins": {
        "opentelemetry": {
            "sampler": {
                "name": "always_on"
            }
        }
    }
}'
```

### 方法 3: additional_attributes を通じてスパンのラベルをカスタマイズする {#method-3-customize-labels-for-span-through-additional_attributes}

`sampler` と `additional_attributes` の設定については、[Apache APISIX ドキュメント](https://apisix.apache.org/docs/apisix/next/plugins/opentelemetry/#attributes) を参照してください。
`additional_attributes` は一連の `Key:Value` ペアで、スパンのラベルをカスタマイズするために使用でき、スパンに従って Web UI に表示されます。
`additional_attributes` を通じてルートのスパンに `route_id` と `http_x-custom-ot-key` を追加するには、以下の設定を参照してください。

```shell
curl http://127.0.0.1:9080/apisix/admin/routes/1001 \
  -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' \
  -X PUT -d '
{
    "uri": "/put",
    "plugins": {
        "opentelemetry": {
            "sampler": {
                "name": "always_on"
            },
            "additional_attributes":[
                "route_id",
                "http_x-custom-ot-key"
            ]
        }
    },
    "upstream": {
        "type": "roundrobin",
        "nodes": {
            "httpbin.org:80": 1
        }
    }
}'
```

## プラグインのテストと検証 {#test-and-verify-the-plugin}

上記3つの方法のいずれかで `opentelemetry` プラグインを有効化できます。
以下の例では方法3の例を使用してルートを作成します。
作成が成功した後、以下のコマンドを参照してルートにアクセスしてください。

```shell
curl -X PUT -H `x-custom-ot-key: test-ot-val` http://127.0.0.1:9080/put
```

アクセスが成功すると、Jaeger UI で `/put` に類似したスパンの詳細を確認できます。
ルートのカスタムタグが Tags リストに表示されていることが確認できます。
`http_x-custom-ot-key` と `route_id` です。

![Jaeger UI](jaeger-ui-1.png)

`additional_attributes` の設定は、Apache APISIX および NGINX の変数から `attribute` の値として取得するように設定されているため、`additional_attributes` は有効な Apache APISIX または NGINX の変数である必要があることに注意してください。
HTTP Header も含まれますが、http*header を取得する場合は、変数名の接頭辞として `http*` を追加する必要があります。
変数が存在しない場合、`tag` は表示されません。

## 例 {#example}

このシナリオ例では、OpenTelemetry Collector の例を簡単に変更して、Collector、Jaeger、Zipkin をバックエンドサービスとしてデプロイし、2つのサンプルアプリケーション（Client と Server）を起動します。
Server は HTTP サービスを提供し、Client はサーバーが提供する HTTP インターフェイスを循環的に呼び出します。
これにより、2つのスパンで構成されるコールチェーンが生成されます。

### ステップ 1: OpenTelemetry のデプロイ {#step-1-deploy-opentelemetry}

以下では `docker compose` を例として使用します。
その他のデプロイ方法については、[クイックスタート](/docs/collector/quick-start/) を参照してください。

以下のコマンドでデプロイできます[^1]。

```shell
git clone https://github.com/open-telemetry/opentelemetry-collector-contrib.git
cd opentelemetry-collector-contrib/examples/demo
docker compose up -d
```

ブラウザで <http://127.0.0.1:16886>（Jaeger UI）または <http://127.0.0.1:9411/zipkin>（Zipkin UI）にアクセスしてください。
正常にアクセスできれば、デプロイは成功です。

以下のスクリーンショットは、アクセス成功の例を示しています。

![Jaeger UI](jaeger-ui-2.png)

![Zipkin UI](zipkin-ui-1.png)

### ステップ 2: テスト環境の設定 {#step-2-configure-the-test-environment}

Apache APISIX サービスが導入され、最終的なアプリケーションのトポロジーは以下の図のとおりです。

![トポロジー図](demo-topology.png)

トレースデータのレポートフローは以下のとおりです。
Apache APISIX は個別にデプロイされ docker-compose のネットワークに含まれないため、Apache APISIX はローカルにマッピングされたポート（`127.0.0.1:4138`）を通じて OpenTelemetry Collector の OTLP HTTP Receiver にアクセスします。

![トレースデータのレポートフロー](trace-data-flow.png)

`opentelemetry` プラグインを有効化し、Apache APISIX をリロードしていることを確認してください。

以下の例を参照して、ルートを作成しサンプリング用に `opentelemetry` プラグインを有効化できます。

```shell
curl http://127.0.0.1:9080/apisix/admin/routes/1 \
-H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' \
-X PUT -d '
{
  "uri": "/hello",
  "plugins": {
      "opentelemetry": {
          "sampler": {
            "name": "always_on"
          }
      }
  },
  "upstream": {
      "type": "roundrobin",
      "nodes": {
          "127.0.0.1:7080": 1
      }
  }
}'
```

`./examples/demo/otel-collector-config.yaml` ファイルを変更して OTLP HTTP Receiver を追加します。

```yaml
receivers:
otlp:
  protocols:
    grpc:
    http: ${ip:port} # OTLP HTTP Receiver を追加、デフォルトポートは 4318
```

`docker-compose.yaml` ファイルを変更します。

設定ファイルを変更し、Client が Server を呼び出すインターフェイスアドレスを Apache APISIX のアドレスに変更し、OTLP HTTP Receiver と Server サービスのポートをローカルにマッピングする必要があります。

以下の例は、設定変更後の完全な `docker-compose.yaml` です。

```yaml
version: '2'
services:
  # Jaeger
  jaeger-all-in-one:
    image: jaegertracing/all-in-one:latest
    ports:
      - '16686:16686' # Jaeger UI ポート
      - '14268'
      - '14250'

  # Zipkin
  zipkin-all-in-one:
    image: openzipkin/zipkin:latest
    ports:
      - '9411:9411'

  # Collector
  otel-collector:
    image: ${OTELCOL_IMG}
    command: ['--config=/etc/otel-collector-config.yaml', '${OTELCOL_ARGS}']
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - '1888:1888' # pprof エクステンション
      - '8888:8888' # Collector が公開する Prometheus メトリクス
      - '8889:8889' # Prometheus エクスポーターメトリクス
      - '13133:13133' # health_check エクステンション
      - '4317' # OTLP gRPC レシーバー
      - '4318:4318' # OTLP HTTP Receiver のポートマッピングを追加
      - '55670:55679' # zpages エクステンション
    depends_on:
      - jaeger-all-in-one
      - zipkin-all-in-one

  demo-client:
    build:
      dockerfile: Dockerfile
      context: ./client
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=otel-collector:4317
      - DEMO_SERVER_ENDPOINT=http://172.17.0.1:9080/hello # APISIX のアドレス
    depends_on:
      - demo-server

  demo-server:
    build:
      dockerfile: Dockerfile
      context: ./server
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=otel-collector:4317
    ports:
      - '7080:7080' # Server のポートをホストにマッピング
    depends_on:
      - otel-collector

  prometheus:
    container_name: prometheus
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yaml:/etc/prometheus/prometheus.yml
    ports:
      - '9090:9090'
```

`demo-client.environment.DEMO_SERVER_ENDPOINT` を Apache APISIX のアドレスに変更し、コンテナ内から正常にアクセスできることを確認する必要があります。

もちろん、`docker-compose.yaml` を通じて Apache APISIX をデプロイすることもできます。
詳細については、[Docker によるインストール](https://hub.docker.com/r/apache/apisix) を参照してください。

### ステップ 3: 出力の確認 {#step-3-verify-the-outputs}

再デプロイが完了すると、Jaeger UI または Zipkin UI にアクセスして、以下のように APISIX のスパンがトレースに含まれていることを確認できます。

![Jaeger UI](jaeger-ui-3.png)

![Zipkin UI](zipkin-ui-2.png)

demo-server が計装されていない場合でも、このプラグインを有効にすることで demo-server の動作を可視化できます。
これは典型的なケースではありませんが、demo-server の実際の計装の簡易的な代替手段であり、多くの価値を提供します。

![upstream-not-instrumented](upstream-not-instrumented.png)

リクエストが demo-server に到達しない場合、出力には demo-server のスパンは含まれません。

![demo-server disconnected](demo-server-disconnected.png)

## プラグインの無効化 {#disable-the-plugin}

一時的にルートのトレース収集が不要な場合は、ルートの設定を変更して、設定内の `plugins` の下にある `opentelemetry` の部分を削除するだけで済みます。

Global Rules のバインドにより `opentelemetry` をグローバルに有効化した場合は、`opentelemetry` グローバルプラグインの設定を削除できます。

`opentelemetry` プラグインを無効化すると APISIX のスパンが切断されるだけであり、クライアントとサーバーのスパンは接続されたままであることに注意してください。

## まとめ {#summary}

Apache APISIX が OpenTelemetry を統合することで、市場の多くのトレースシステムと容易に接続できるようになりました。
Apache APISIX はより強力なエコシステムを構築するために、コミュニティとの協力も積極的に進めています。

Apache APISIX では、より多くのサービスとの統合をサポートするための追加プラグインの開発にも取り組んでいます。
興味がある方は、GitHub で [ディスカッションを開始](https://github.com/apache/apisix/discussions) するか、[メーリングリスト](https://apisix.apache.org/docs/general/join/#subscribe-to-the-mailing-list) を通じてコミュニケーションしてください。

_この記事のあるバージョンは、Apache APISIX ブログに [最初に投稿されました][originally posted]。_

[^1]: {{% param notes.docker-compose-v2 %}}

[originally posted]: <{{% param canonical_url %}}>
