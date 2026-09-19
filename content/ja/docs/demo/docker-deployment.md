---
title: Docker デプロイ
linkTitle: Docker
aliases: [docker_deployment]
default_lang_commit: 0a410d00f789607f64e6e71b785b9c027305117b
cSpell:ignore: Firepit span_metrics
---

<!-- markdownlint-disable code-block-style ol-prefix heading-start-left -->

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

   > [!NOTE]
   >
   > `docker compose up` だけを実行すると `compose.yaml` しか読み込まれません。
   > その場合ウェブストアは起動しますが、Kafka やオブザーバビリティバックエンドは含まれないため、テレメトリーを確認する場所がありません。
   > 上記のようにファイルを明示的に指定するか、`make start` を使用してください。

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

   ### AI エージェントで実行 {#run-with-the-ai-agent}

   エージェント、MCP サーバー、チャットボットはデフォルトでは起動しません。
   追加するには[^1]以下を実行します。

   {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-agentic
```

{{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  -f compose.agent.yaml \
  up --force-recreate --remove-orphans --detach
```

{{% /tab %}} {{< /tabpane >}}

これにより <http://localhost:8080/chatbot/> でチャットボット UI が利用可能になります。
デフォルトではエージェントは記録済みの LLM レスポンスを再生する（`USE_VCR=True`）ため、API キーは不要です。
実際の LLM と対話するには、`.env.override` で `LLM_BASE_URL`、`LLM_MODEL`、`API_KEY` を設定してください。

### 継続的プロファイリングで実行 {#run-with-continuous-profiling}

eBPF プロファイラーと Firepit プロファイリング UI を追加するには[^1]以下を実行します。

{{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-profiling
```

{{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.profiling.yaml \
  -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

{{% /tab %}} {{< /tabpane >}}

プロファイルは <http://localhost:8080/profiles/> で確認できます。

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

5. （オプション）フロントエンドのエンドツーエンドテストを実行[^1]します。

   Cypress フロントエンドテストは、起動済みのデモに対して実行します。

   {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-frontend-tests
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  -f compose.tests.yaml \
  run frontendTests
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
デモアプリケーションの Collector は複数のファイルから設定を読み込み、それぞれ前のファイルの上にマージします。
どのファイルが読み込まれるかは、デモの起動方法によって異なります。

- `otelcol-config.yml` — ベースの設定、常に読み込まれる
- `otelcol-config-full.yml` — Kafka などフルデモでのみ実行されるサービス用のレシーバーを追加
- `otelcol-config-observability.yml` — バンドルされたバックエンド（Jaeger、Prometheus、OpenSearch）を接続
- `otelcol-config-extras.yml` — カスタマイズ用の独自の追加設定、常に最後に読み込まれる

`make start` と `make start-minimal` はこれら4つのファイルをすべて読み込みます。
オブザーバビリティスタックなしでデモを起動すると読み込まれるファイルは少なくなりますが、`otelcol-config-extras.yml` は常に最後に適用されるため、どのモードでもカスタマイズが優先されます。

あなたのバックエンドに追加するために、エディターで [src/otel-collector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml) ファイルを開いてください。

- 新しいエクスポーターを追加することで始めます。
  たとえば、もしあなたのバックエンドが OTLP over HTTP をサポートしているのであれば、以下を追加してください。

  ```yaml
  exporters:
    otlp_http/example:
      endpoint: <your-endpoint-url>
  ```

- そして、`exporters` をあなたのバックエンドに使いたいテレメトリーパイプラインに上書きしてください。

  ```yaml
  service:
    pipelines:
      traces:
        exporters: [debug, otlp_grpc/jaeger, span_metrics, otlp_http/example]
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
