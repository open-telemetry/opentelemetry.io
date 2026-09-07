---
title: Docker デプロイ
linkTitle: Docker
aliases: [docker_deployment]
default_lang_commit: ef74cd393090313b5ad970e74d499a97505fffb8
cSpell:ignore: Firepit otlphttp span_metrics
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## 前提条件 {#prerequisites}

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/)
  v2.0.0+
- Make（オプション）
- アプリケーション用に 6 GB の RAM（または[最小モード](#deployment-modes)を使う場合は約 3 GB）
- 14 GB のディスク容量

## デモの取得と実行 {#get-and-run-the-demo}

1. デモリポジトリをクローンしてください。

   ```shell
   git clone https://github.com/open-telemetry/opentelemetry-demo.git
   ```

2. デモフォルダに移動します。

   ```shell
   cd opentelemetry-demo/
   ```

3. デモを起動[^1]します。

   {{< tabpane text=true >}} {{% tab Make %}}

   ```shell
   make start
   ```

   {{% /tab %}} {{% tab Docker %}}

   ```shell
   docker compose --env-file .env --env-file .env.override \
     -f compose.yaml -f compose.full.yaml \
     -f compose.observability.yaml -f compose.extras.yaml \
     up --force-recreate --remove-orphans --detach
   ```

   {{% /tab %}} {{< /tabpane >}}

   ### デプロイモード {#deployment-modes}

   デモはいくつかのデプロイモードに対応しています。
   デフォルトの `make start` はすべてのサービスとオブザーバビリティスタックを含むフルデモを実行します。
   他のモードではリソース使用量を削減したり、特定のコンポーネントを除外したりできます。

   | モード                    | Make ターゲット              | 説明                                                                                                               |
   | ------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
   | Full                      | `make start`                 | すべてのサービスとオブザーバビリティバックエンド（デフォルト）                                                     |
   | Minimal                   | `make start-minimal`         | Kafka とそれに依存するサービス（`accounting`、`fraud-detection`、`kafka`）を除外し、メモリ使用量を約 3 GB に削減   |
   | No observability          | `make start-no-o11y`         | オブザーバビリティバックエンド（Jaeger、Grafana、Prometheus、OpenSearch）なしですべてのサービスを実行              |
   | Minimal, no observability | `make start-minimal-no-o11y` | オブザーバビリティバックエンドなしの最小サービス                                                                   |
   | Profiling                 | `make start-profiling`       | eBPF プロファイラーとプロファイリングデータ用の [Firepit](https://github.com/florianl/firepit) UI を含むフルモード |
   | Agentic                   | `make start-agentic`         | AI エージェント、MCP サーバー、デモ操作用チャットボットを含むフルモード                                            |

   たとえば、最小モードでデモを起動するには以下を実行します。

   {{< tabpane text=true >}} {{% tab Make %}}

   ```shell
   make start-minimal
   ```

   {{% /tab %}} {{% tab Docker %}}

   ```shell
   docker compose --env-file .env --env-file .env.override \
     -f compose.yaml -f compose.observability.yaml -f compose.extras.yaml \
     up --force-recreate --remove-orphans --detach
   ```

   {{% /tab %}} {{< /tabpane >}}

4. （オプション）テレメトリーサニティテストを実行します。

   デモには、各サービスがトレース、メトリクス、ログを生成し、期待されるバックエンド（Jaeger、Prometheus、OpenSearch）に到達していることを検証するテレメトリーサニティテストスイートが含まれています。
   詳細は [test/telemetry/README.md](https://github.com/open-telemetry/opentelemetry-demo/blob/main/test/telemetry/README.md) を参照してください。

   | テストスコープ | Make ターゲット                    | 起動内容                                                  |
   | -------------- | ---------------------------------- | --------------------------------------------------------- |
   | Full           | `make run-telemetry-tests`         | フルデプロイ（`make start`）                              |
   | Minimal        | `make run-telemetry-tests-minimal` | 最小デプロイ（`make start-minimal`）                      |
   | Agentic        | `make run-telemetry-tests-agentic` | Agentic デプロイ（エージェント、MCP、チャットボット付き） |

   各ターゲットは `./test/telemetry` からテストイメージをビルドし、対応するデプロイを起動してテストを実行した後、デモを停止します。

   {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-telemetry-tests
```

    {{% /tab %}} {{% tab Docker %}}

```shell
# テスト開始前にデモが実行中である必要があります。
docker build -t opentelemetry-demo-telemetry-tests ./test/telemetry
docker run --rm --network opentelemetry-demo \
  --env-file .env --env-file .env.override \
  -e TEST_SCOPE=full \
  opentelemetry-demo-telemetry-tests
```

    {{% /tab %}} {{< /tabpane >}}

## ウェブストアとテレメトリーの確認 {#verify-the-web-store-and-telemetry}

イメージがビルドされ、コンテナが開始されると以下にアクセスできるようになります。

- ウェブストア: <http://localhost:8080/>
- ロードジェネレーター UI: <http://localhost:8080/loadgen/>
- Flagd 設定 UI: <http://localhost:8080/feature>
- テレメトリードキュメント（Weaver で生成）:
  <http://localhost:8080/telemetry/>

以下はオブザーバビリティスタックが実行中の場合（`*-no-o11y` モード以外）に利用可能です。

- Grafana: <http://localhost:8080/grafana/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- OpAMP UI: <http://localhost:8080/opamp/>

以下は特定のデプロイモードでのみ利用可能です。

- Firepit UI（プロファイリングモード）: <http://localhost:8080/profiles/>
- チャットボット（Agentic モード）: <http://localhost:8080/chatbot/>

## デモのプライマリーポート番号の変更 {#changing-the-demos-primary-port-number}

デフォルトでは、デモアプリケーションは 8080 ポートにバウンドされたすべてのブラウザのトラフィックに対してプロキシを開始します。
ポート番号を変更するには、デモを開始する前に環境変数 `ENVOY_PORT` を設定してください。

- 次の設定は 8081 ポートを利用する場合の例です[^1]。

  {{< tabpane text=true >}} {{% tab Make %}}

```shell
ENVOY_PORT=8081 make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
ENVOY_PORT=8081 docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## 独自のバックエンドを導入する {#bring-your-own-backend}

おそらく、あなたがすでに所持しているオブザーバビリティバックエンド（たとえば、Jaeger、Zipkin、または[選択したベンダー](/ecosystem/vendors/)のいずれかの既存インスタンス）のデモアプリケーションとしてウェブストアを利用したいでしょう。

OpenTelemetry Collector はテレメトリーデータを複数のバックエンドに送信するのに利用可能です。
デフォルトで、デモアプリケーションの Collector は以下のファイルから設定をマージします（順序通り）。

- `otelcol-config.yml` — ベースのレシーバー、プロセッサー、パイプライン
- `otelcol-config-full.yml` — Kafka と PostgreSQL メトリクスレシーバー（フルモード）
- `otelcol-config-observability.yml` — Jaeger、Prometheus、OpenSearch エクスポーター（オブザーバビリティスタック使用時）
- `otelcol-config-extras.yml` — カスタマイズ用の空スタブ、常に最後にロード

あなたのバックエンドに追加するために、エディターで [src/otel-collector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml) ファイルを開いてください。

- 新しいエクスポーターを追加することで始めます。
  たとえば、もしあなたのバックエンドが OTLP over HTTP をサポートしているのであれば、以下を追加してください。

  ```yaml
  exporters:
    otlphttp/example:
      endpoint: <your-endpoint-url>
  ```

- そして、`exporters` をあなたのバックエンドに使いたいテレメトリーパイプラインに上書きしてください。

  ```yaml
  service:
    pipelines:
      traces:
        exporters: [debug, otlp_grpc/jaeger, span_metrics, otlphttp/example]
  ```

> [!NOTE]
>
> YAML の値を Collector とマージすると、オブジェクトはマージされて、配列は置き換えられます。
> `span_metrics` コネクターはトレースからメトリクスへの橋渡しを行うため、パイプラインを上書きする場合はトレースの `exporters` とメトリクスの `receivers` に残す必要があります。
> これを省略すると Collector がクラッシュします。
> 他のエクスポーターはすべてオプションです。
> いずれかを省略すると、そのバックエンドへのデータ送信が停止されるだけです。
> アップストリームのエクスポーター名は以下の通りです。
>
> - **traces**: `debug`、`otlp_grpc/jaeger`、`span_metrics` _（必須）_
> - **metrics**: `debug`、`otlp_http/prometheus`
> - **logs**: `debug`、`opensearch`

ベンダーのバックエンドは認証のために追加のパラメーターを必要とするかもしれません。ドキュメントを確認してください。
一部のバックエンドは異なるエクスポーターが必要です。それらのエクスポーターとドキュメントについて [opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) で入手できます。

`otelcol-config-extras.yml` を更新した後に、`make start` を実行してデモを開始してください。
しばらくして、あなたのバックエンドにトレースが流れるのも確認できるはずです。

[^1]: {{% param notes.docker-compose-v2 %}}
