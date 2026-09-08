---
title: エクスポーター
weight: 50
default_lang_commit: 4f8b46449bcc2980fd81c8e726733e1df1defddd
cSpell:ignore: rebar relx
---

{{% docs/languages/exporters/intro %}}

## OpenTelemetry Collector へのエクスポート {#exporting-to-the-opentelemetry-collector}

[Collector](/docs/collector/) はテレメトリーデータを受信、処理、エクスポートするためのベンダー非依存の手段を提供します。
[opentelemetry_exporter](https://hex.pm/packages/opentelemetry_exporter) パッケージは、HTTP（デフォルト）と gRPC の両方を使用した Collector へのエクスポートをサポートしています。
Collector はスパンを Zipkin や Jaeger などのセルフホストサービスや、商用サービスにエクスポートできます。
利用可能なエクスポーターの一覧は、[レジストリ](/ecosystem/registry/?component=exporter)を参照してください。

## Collector のセットアップ {#setting-up-the-collector}

テスト目的であれば、以下の Collector 設定をプロジェクトのルートに配置して利用できます。

```yaml
# otel-collector-config.yaml

# OTLP を受信して Jaeger にエクスポートする OpenTelemetry Collector の設定
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: '0.0.0.0:4317'
      http:
        endpoint: '0.0.0.0:4318'
exporters:
  debug:
  otlp/jaeger:
    endpoint: jaeger-all-in-one:4317
    tls:
      insecure: true
    sending_queue:
      batch:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug, otlp/jaeger]
```

より詳細な例として、`opentelemetry-erlang` がテストに使用している[設定ファイル](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/config/otel-collector-config.yaml)を確認できます。

このチュートリアルでは、アプリと並行して Collector を Docker イメージとして起動します。
このチュートリアルでは、[はじめに](/docs/languages/erlang/getting-started)ガイドの Dice Roll のサンプルを引き続き使用します。

以下の docker-compose ファイルをアプリのルートに追加してください。

```yaml
# docker-compose.yml
version: '3'
services:
  otel:
    image: otel/opentelemetry-collector-contrib:0.98.0
    command: ['--config=/conf/otel-collector-config.yaml']
    ports:
      - 4317:4317
      - 4318:4318
    volumes:
      - ./otel-collector-config.yaml:/conf/otel-collector-config.yaml
    links:
      - jaeger-all-in-one

  jaeger-all-in-one:
    image: jaegertracing/jaeger:latest
    ports:
      - '16686:16686'
```

この設定は、[docker-compose.yml](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/docker-compose.yml) で HTTP と gRPC の両方のレシーバーを持つ Collector を起動し、[docker-compose](https://docs.docker.com/compose/) で同時に実行される Zipkin にエクスポートするために使用されます。

実行中の Collector にエクスポートするには、`opentelemetry_exporter` パッケージを他の `opentelemetry` 依存関係よりも前にプロジェクトの依存関係に追加する必要があります。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
{deps, [{opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
        {opentelemetry_api, "~> {{% param versions.otelApi %}}"},
        {opentelemetry, "~> {{% param versions.otelSdk %}}"}]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
def deps do
  [
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"}
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

次に、SDK アプリケーションの設定より前に Release の設定に追加し、SDK がエクスポーターを初期化して使用する前にエクスポーターの依存関係が起動されるようにします。

`rebar.config` での Release 設定と [mix の Release タスク](https://hexdocs.pm/mix/Mix.Tasks.Release.html)の例を示します。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% rebar.config
{relx, [{release, {my_instrumented_release, "0.1.0"},
         [opentelemetry_exporter,
	      {opentelemetry, temporary},
          my_instrumented_app]},

       ...]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# mix.exs
def project do
  [
    releases: [
      my_instrumented_release: [
        applications: [opentelemetry_exporter: :permanent, opentelemetry: :temporary]
      ],

      ...
    ]
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

最後に、`opentelemetry` と `opentelemetry_exporter` アプリケーションのランタイム設定を Collector にエクスポートするように設定します。
以下の設定は、何も設定されていない場合に使用されるデフォルト値を示しています。
デフォルトは HTTP プロトコルで、エンドポイントは `localhost` のポート `4318` です。
注意点:

- `otlp_protocol` に `grpc` を使用する場合、エンドポイントを `http://localhost:4317` に変更する必要があります。
- 上記の docker compose ファイルを使用している場合、`localhost` を `otel` に置き換える必要があります。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% config/sys.config.src
[
 {opentelemetry,
  [{span_processor, batch},
   {traces_exporter, otlp}]},

 {opentelemetry_exporter,
  [{otlp_protocol, http_protobuf},
   {otlp_endpoint, "http://localhost:4318"}]}]}
].
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# config/config.exs
config :opentelemetry,
  resource: %{service: %{name: "roll_dice_app"}},
  span_processor: :batch,
  traces_exporter: :otlp

config :opentelemetry_exporter,
  otlp_protocol: :http_protobuf,
  otlp_endpoint: "http://localhost:4318"
  # docker compose ファイルを使用している場合は otlp_endpoint: "http://otel:4318"
```

{{% /tab %}} {{< /tabpane >}}

一方のターミナルで `docker compose up` を実行し、別のターミナルで `mix phx.server` を実行すると、トレースを確認できます。
アプリにいくつかリクエストを送信した後、`http://localhost:16686` にアクセスし、Service ドロップダウンから `roll_dice_app` を選択して、「Find Traces」をクリックしてください。

## 注意点 {#gotchas}

一部の環境では、コンテナを root ユーザーとして実行できません。
そのような環境で作業する場合、このチュートリアルで使用する `docker-compose.yml` ファイルの `otel` サービスにトップレベルのキーバリューとして `user: "1001"` を追加できます。
