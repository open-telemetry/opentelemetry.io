---
title: 負荷生成ツール
aliases: [loadgenerator]
default_lang_commit: cf9f44c2aaeb97ab9cd891f3de7d27a9f47ac8c9
cSpell:ignore: gevent instrumentor loadgenerator locustfile urllib
---

負荷生成ツールは、Python の負荷テストフレームワーク [Locust](https://locust.io) をベースにしています。
デフォルトでは、フロントエンドに対して複数の異なるルートをリクエストするユーザーをシミュレーションします。

[負荷生成ツールのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

このサービスは [locustfile](https://docs.locust.io/en/stable/writing-a-locustfile.html) であるため、OpenTelemetry SDK は import 文の後で初期化されます。
このコードはトレーサープロバイダーを作成し、使用するスパンプロセッサーを設定します。
エクスポートエンドポイント、リソース属性、サービス名は [OpenTelemetry 環境変数](/docs/specs/otel/configuration/sdk-environment-variables/)を使用して自動的に設定されます。

```python
tracer_provider = TracerProvider()
trace.set_tracer_provider(tracer_provider)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(insecure=True)))
```

### 計装ライブラリの追加 {#adding-instrumentation-libraries}

計装ライブラリを追加するには、Python コード内で各ライブラリの Instrumentor をインポートする必要があります。
Locust は `Requests`、`URLLib3`、`Jinja2` ライブラリを使用するため、それぞれの Instrumentor をインポートします。

```python
from opentelemetry.instrumentation.jinja2 import Jinja2Instrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
```

Instrumentor は、Locust の gevent モンキーパッチに起因するエラーを回避するため、`opentelemetry-instrument` 経由ではなく `instrument()` を直接呼び出して初期化されます。

```python
Jinja2Instrumentor().instrument()
RequestsInstrumentor().instrument()
URLLib3Instrumentor().instrument()
```

初期化が完了すると、この負荷生成ツールが行うすべての Locust リクエストは、`Requests` と `URLLib3` ライブラリそれぞれに対応するスパンを持つ独自のトレースを持つようになります。

### 手動スパン {#manual-spans}

シミュレーションされた各ユーザーアクション（商品の閲覧、カートの確認、チェックアウトなど）にも、`tracer.start_as_current_span` で作成された独自の手動スパンがあります。
`demo.product.id`、`demo.ad.category`、`demo.cart.items.count` などの属性が、関連する箇所で付与されます。
これらの属性は、[テレメトリースキーマ](https://github.com/open-telemetry/opentelemetry-demo/blob/main/telemetry-schema/services/load_generator.yaml)で `service.load_generator` 向けに宣言されています。

## メトリクス {#metrics}

`MeterProvider` が `PeriodicExportingMetricReader` と OTLP エクスポーターで設定されます。
`SystemMetricsInstrumentor` はこれを使用して、負荷生成ツール自体のプロセスレベルのシステムメトリクス（CPU、メモリなど）をレポートします。

## ログ {#logs}

`LoggerProvider` はログレコードをバッチ処理し、OTLP 経由でエクスポートします。
標準ライブラリの `logging` モジュールは `LoggingHandler` を通じて接続され、`LoggingInstrumentor` がアクティブなトレース ID とスパン ID を各ログレコードに注入するため、locustfile 全体の `logging.info(...)` のような呼び出しが対応するスパンと関連付けて表示されます。

## バゲッジ {#baggage}

OpenTelemetry バゲッジは、負荷生成ツールのトレースが合成的に生成されたものであることを示すために使用されます。
これは `on_start` 関数でバゲッジ項目を含むコンテキストオブジェクトを作成し、シミュレーションされたユーザーが実行するすべてのタスクにそのコンテキストをアタッチすることで実現されます。

```python
ctx = baggage.set_baggage("session.id", session_id)
ctx = baggage.set_baggage("synthetic_request", "true", context=ctx)
context.attach(ctx)
```

コンテキストはスパンの `with` ブロックの外でアタッチされます。
スパンのコンテキストマネージャー内でアタッチすると、そのスパンの終了時にバゲッジもデタッチされ、ユーザーセッションの残りの部分でバゲッジが静かに破棄されてしまいます。

バゲッジ自体はテレメトリーにマーキングを行いません。
各バックエンドサービスが、受信したバゲッジから `synthetic_request` エントリを読み取り、自身のスパンやログレコードに属性としてコピーします。
テレメトリーが合成フローから来たものかどうかを記録するのは、その属性です。
フロントエンドは `demo.synthetic_request` を設定し、チェックアウトサービスと決済サービスは `user_agent.synthetic.type` を `test` に設定します。
マーカーがテレメトリー自体に付与されるため、オブザーバビリティバックエンドの任意のクエリで負荷生成ツールのトラフィックをフィルタリングして含めたり除外したりできます。
