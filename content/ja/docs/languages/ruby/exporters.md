---
title: エクスポーター
weight: 50
default_lang_commit: 5db74ea69e5f5f8918cf2ef2030560bd083a7cda
---

{{% docs/languages/exporters/intro %}}

## OTLPエンドポイント {#otlp-endpoint}

OTLPエンドポイント（[コレクター](/docs/collector)やJaegerなど）にトレースデータを送信するには、`opentelemetry-exporter-otlp`のようなエクスポーターパッケージを使用します。

{{< tabpane text=true >}} {{% tab bundler %}}

```sh
bundle add opentelemetry-exporter-otlp
```

{{% /tab %}} {{% tab gem %}}

```sh
gem install opentelemetry-exporter-otlp
```

{{% /tab %}} {{< /tabpane >}}

次に、OTLPエンドポイントを指定するようにエクスポーターを設定します。
たとえば、[Getting Started](../getting-started/)の `config/initializers/opentelemetry.rb` に `require 'opentelemetry-exporter-otlp'` を追加し、次のようなコードに更新できます。

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry-exporter-otlp'
OpenTelemetry::SDK.configure do |c|
  c.service_name = 'dice-ruby'
  c.use_all() # すべての計装を有効化します！
end
```

アプリケーションを実行すると、OTLPを使用してトレースがエクスポートされます。

```sh
rails server -p 8080
```

デフォルトでは、トレースはlocalhost:4318でリッスンしているOTLPエンドポイントに送信されます。
`OTEL_EXPORTER_OTLP_ENDPOINT` を適切に設定することで、エンドポイントを変更できます。

```sh
env OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318" rails server -p 8080
```

すぐにOTLPエクスポーターを試して、受信側でトレースが視覚化されていることを確認するには、DockerコンテナでJaegerを実行します。

```shell
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

## Zipkin {#zipkin}

可能な限り早くZipkinをセットアップするには、Dockerコンテナで実行します。

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

アプリケーションの依存関係としてエクスポーターパッケージをインストールします。

{{< tabpane text=true >}} {{% tab bundle %}}

```sh
bundle add opentelemetry-exporter-zipkin
```

{{% /tab %}} {{% tab gem %}}

```sh
gem install opentelemetry-exporter-zipkin
```

{{% /tab %}} {{< /tabpane >}}

エクスポーターを使用してZipkinバックエンドにデータを送信するようにOpenTelemetry構成を更新します。

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'

require 'opentelemetry-exporter-zipkin'
OpenTelemetry::SDK.configure do |c|
  c.service_name = 'dice-ruby'
  c.use_all() # すべての計装を有効化します！
end
```

アプリケーションを実行する場合は、環境変数 `OTEL_TRACES_EXPORTER` をZipkinに設定します。

```sh
env OTEL_TRACES_EXPORTER=zipkin rails server
```

デフォルトでは、トレースはlocalhost:9411でリッスンしているZipkinエンドポイントに送信されます。
`OTEL_EXPORTER_ZIPKIN_ENDPOINT` を適切に設定することで、エンドポイントを変更できます。

```sh
env OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:9411" rails server
```
