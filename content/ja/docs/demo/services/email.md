---
title: メールサービス
linkTitle: メール
aliases: [emailservice]
default_lang_commit: cf9f44c2aaeb97ab9cd891f3de7d27a9f47ac8c9
cSpell:ignore: sinatra
---

このサービスは、注文が行われたときにユーザーに確認メールを送信します。

[メールサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/email/)

## トレースの初期化 {#initializing-tracing}

コアの OpenTelemetry SDK とエクスポーターの Ruby gem、および自動計装ライブラリに必要な gem（例: Sinatra）を require する必要があります。

```ruby
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/sinatra"
```

Ruby SDK は OpenTelemetry 標準の環境変数を使用して、OTLP エクスポート、リソース属性、サービス名を自動的に設定します。
OpenTelemetry SDK を初期化する際に、利用する自動計装ライブラリ（例: Sinatra）も指定します。

```ruby
OpenTelemetry::SDK.configure do |c|
  c.use "OpenTelemetry::Instrumentation::Sinatra"
end
```

## トレース {#traces}

### 自動計装されたスパンへの属性の追加 {#add-attributes-to-auto-instrumented-spans}

自動計装されたコードの実行中に、コンテキストから現在のスパンを取得できます。

```ruby
current_span = OpenTelemetry::Trace.current_span
```

スパンオブジェクトの `add_attributes` を使用して、スパンに複数の属性を追加できます。

```ruby
current_span.add_attributes({
  "app.order.id" => data.order.order_id,
})
```

スパンオブジェクトの `set_attribute` を使用して、単一の属性のみを追加することもできます。

```ruby
span.set_attribute("app.email.recipient", data.email)
```

### 新しいスパンの作成 {#create-new-spans}

OpenTelemetry の Tracer オブジェクトの `in_span` を使用して、新しいスパンを作成しアクティブなコンテキストに配置できます。
`do..end` ブロックと組み合わせて使用すると、ブロックの実行が終了したときにスパンは自動的に終了します。

```ruby
tracer = OpenTelemetry.tracer_provider.tracer('email')
tracer.in_span("send_email") do |span|
  # スパンのコンテキスト内のロジックをここに記述
end
```

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

OpenTelemetry メトリクス SDK と OTLP メトリクスエクスポーターは、`email_server.rb` ファイルのルートレベルで初期化されます。
アクセスするには、まず `require` 文が必要です。

```ruby
require "opentelemetry-metrics-sdk"
require "opentelemetry-exporter-otlp-metrics"
```

Ruby SDK は OpenTelemetry 標準の環境変数を使用して、OTLP エクスポート、リソース属性、サービス名を自動的に設定します。
OpenTelemetry メトリクス SDK を初期化する際に、メータープロバイダーとメトリクスリーダーも設定する必要があります。

```ruby
otlp_metric_exporter = OpenTelemetry::Exporter::OTLP::Metrics::MetricsExporter.new
OpenTelemetry.meter_provider.add_metric_reader(otlp_metric_exporter)
meter = OpenTelemetry.meter_provider.meter("email")
```

メータープロバイダーを使用してメーターにアクセスでき、これを使ってグローバルなメトリクス（例: `counter`）を作成できます。

```ruby
$confirmation_counter = meter.create_counter("app.confirmation.counter", unit: "1", description: "Counts the number of order confirmation emails sent")
```

### カスタムメトリクス {#custom-metrics}

現在、以下のカスタムメトリクスが利用可能です。

- `app.confirmation.counter`: 送信された注文確認メールの累積カウント

## ログ {#logs}

### ログの初期化 {#initializing-logs}

OpenTelemetry ログ SDK と OTLP ログエクスポーターは、`email_server.rb` ファイルのルートレベルで初期化されます。
アクセスするには、まず `require` 文が必要です。

```ruby
require "opentelemetry-logs-sdk"
require "opentelemetry-exporter-otlp-logs"
```

Ruby SDK は OpenTelemetry 標準の環境変数を使用して、OTLP エクスポート、リソース属性、サービス名を自動的に設定します。
OpenTelemetry ログ SDK を初期化する際に、グローバルなロガーを作成するためにロガープロバイダーが必要です。

```ruby
$logger = OpenTelemetry.logger_provider.logger(name: "email")
```

### 構造化ログの出力 {#emitting-structured-logs}

ロガーの `on_emit` メソッドを使用して構造化ログを書き込むことができます。
`severity_text`（例: `INFO`、`ERROR`）、人間が読める `body`、そして後でログをクエリする際に役立つ `app.email.recipient` 属性を含めます。

```ruby
$logger.on_emit(
  timestamp: Time.now,
  severity_text: "INFO",
  body: "Order confirmation email sent",
  attributes: { "app.email.recipient" => data.email }
)
```
