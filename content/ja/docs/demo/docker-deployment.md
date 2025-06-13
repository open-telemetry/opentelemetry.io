---
title: Docker デプロイ
linkTitle: Docker
aliases: [docker_deployment]
default_lang_commit: d0a90db560d4f15934bdb43d994eabcfd91c515a
cSpell:ignore: otlphttp spanmetrics tracetest tracetesting
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## 前提条件 {#prerequisites}

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/)
  v2.0.0+
- Make (オプション)
- アプリケーション用に 6 GB の RAM

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
docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

4. (オプション) API オブザーバビリティ駆動テストの有効化[^1]します。

   {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-tracetesting
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f docker-compose-tests.yml run traceBasedTests
```

    {{% /tab %}} {{< /tabpane >}}

## ウェブストアとテレメトリーの確認 {#verify-the-web-store-and-telemetry}

イメージがビルドされ、コンテナが開始されると以下にアクセスできるようになります。

- ウェブストア: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- 負荷生成 UI: <http://localhost:8080/loadgen/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- トレーステスト UI: <http://localhost:11633/>、`make run-tracetesting` の使用時のみ
- Flagd 設定 UI: <http://localhost:8080/feature>

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
ENVOY_PORT=8081 docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## 独自のバックエンドを導入する {#bring-your-own-backend}

おそらく、あなたがすでに所持しているオブザーバビリティバックエンド（たとえば、Jaeger、Zipkin、または[選択したベンダー](/ecosystem/vendors/)のいずれかの既存インスタンス）のデモアプリケーションとしてウェブストアを利用したいでしょう。

OpenTelemetry コレクターはテレメトリーデータを複数のバックエンドに送信するのに利用可能です。
デフォルトで、デモアプリケーションのコレクターは 2 つのファイルから設定をマージします。

- `otelcol-config.yml`
- `otelcol-config-extras.yml`

あなたのバックエンドに追加するために、エディターで [src/otel-collector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml) ファイルを開いてください。

- 新しいエクスポーターを追加することで始めます。 たとえば、もしあなたのバックエンドが OTLP over HTTP をサポートしているのであれば、以下を追加してください。

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
        exporters: [spanmetrics, otlphttp/example]
  ```

{{% alert title="Note" %}}
YAML の値をコレクターとマージすると、オブジェクトはマージされて、配列は置き換えられます。
`spanmetrics` エクスポーターを上書きする場合は、`traces` パイプラインのエクスポーターの配列に含める必要があります。
このエクスポーターを含めないとエラーが発生します。
{{% /alert %}}

ベンダーのバックエンドは認証のために追加のパラメーターを必要とするかもしれません。ドキュメントを確認してください。
一部のバックエンドは異なるエクスポーターが必要です。それらのエクスポーターとドキュメントについて[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) で入手できます。

`otelcol-config-extras.yml` を更新した後に、`make start` を実行してデモを開始してください。
しばらくして、あなたのバックエンドにトレースが流れるのも確認できるはずです。

[^1]: {{% param notes.docker-compose-v2 %}}
