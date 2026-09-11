---
title: レコメンデーションサービス
linkTitle: レコメンデーション
aliases: [recommendationservice]
default_lang_commit: 524c62c4d0a3794fc15e206f8a6b634c12c60d8f
cSpell:ignore: cpython NOTSET
---

このサービスは、ユーザーが閲覧中の既存の商品 ID に基づいて、おすすめ商品のリストを取得する役割を担います。

[レコメンデーションサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/)

## 自動計装 {#auto-instrumentation}

この Python ベースのサービスは、Python 用の OpenTelemetry 自動計装を利用しています。
これは `opentelemetry-instrument` Python ラッパーを活用してスクリプトを実行することで実現されています。
サービスの `Dockerfile` の `ENTRYPOINT` コマンドで設定できます。

```dockerfile
ENTRYPOINT [ "opentelemetry-instrument", "python", "recommendation_server.py" ]
```

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

OpenTelemetry SDK は `__main__` コードブロックで初期化されます。
このコードはトレーサープロバイダーを作成し、使用するスパンプロセッサーを設定します。
エクスポートエンドポイント、リソース属性、サービス名は、環境変数に基づいて OpenTelemetry 自動計装によって自動的に設定されます。

```python
tracer = trace.get_tracer_provider().get_tracer("recommendation")
```

### 自動計装されたスパンへの属性の追加 {#add-attributes-to-auto-instrumented-spans}

自動計装されたコードの実行中に、コンテキストから現在のスパンを取得できます。

```python
span = trace.get_current_span()
```

スパンへの属性の追加は、スパンオブジェクトの `set_attribute` を使用して行います。
`ListRecommendations` 関数では、スパンに属性が追加されます。

```python
span.set_attribute("app.products_recommended.count", len(prod_list))
```

### 新しいスパンの作成 {#create-new-spans}

新しいスパンは、OpenTelemetry Tracer オブジェクトの `start_as_current_span` を使用して作成し、アクティブなコンテキストに配置できます。
`with` ブロックと組み合わせて使用すると、ブロックの実行が終了したときにスパンは自動的に終了します。
これは `get_product_list` 関数で行われています。

```python
with tracer.start_as_current_span("get_product_list") as span:
```

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

OpenTelemetry SDK は `__main__` コードブロックで初期化されます。
このコードはメータープロバイダーを作成します。
エクスポートエンドポイント、リソース属性、サービス名は、環境変数に基づいて OpenTelemetry 自動計装によって自動的に設定されます。

```python
meter = metrics.get_meter_provider().get_meter("recommendation")
```

### カスタムメトリクス {#custom-metrics}

現在利用可能なカスタムメトリクスは以下のとおりです。

- `app_recommendations_counter`：サービス呼び出しごとのレコメンデーション商品数の累積カウント

### 自動計装メトリクス {#auto-instrumented-metrics}

以下のメトリクスは、自動計装を通じて利用可能です。
これは、レコメンデーションサービスの Docker イメージをビルドする際に `opentelemetry-bootstrap` の一部としてインストールされる `opentelemetry-instrumentation-system-metrics` によって提供されます。

- `runtime.cpython.cpu_time`
- `runtime.cpython.memory`
- `runtime.cpython.gc_count`

## ログ {#logs}

### ログの初期化 {#initializing-logs}

OpenTelemetry SDK は `__main__` コードブロックで初期化されます。
以下のコードは、バッチプロセッサー、OTLP ログエクスポーター、およびロギングハンドラーを持つロガープロバイダーを作成します。
最後に、アプリケーション全体で使用するロガーを作成します。

```python
logger_provider = LoggerProvider(
    resource=Resource.create(
        {
            'service.name': service_name,
        }
    ),
)
set_logger_provider(logger_provider)
log_exporter = OTLPLogExporter(insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(log_exporter))
handler = LoggingHandler(level=logging.NOTSET, logger_provider=logger_provider)

logger = logging.getLogger('main')
logger.addHandler(handler)
```

### ログレコードの作成 {#create-log-records}

ロガーを使用してログを作成します。
使用例は `ListRecommendations` 関数と `get_product_list` 関数にあります。

```python
logger.info(f"Receive ListRecommendations for product ids:{prod_list}")
```

ご覧のとおり、初期化の後は、標準的な Python と同じ方法でログレコードを作成できます。
OpenTelemetry ライブラリは各ログレコードにトレース ID とスパン ID を自動的に付加し、これによりログとトレースの相関が可能になります。

### 注意事項 {#notes}

Python 用のログはまだ実験的であり、変更が加えられる可能性があります。
このサービスの実装は [Python ログの例](https://github.com/open-telemetry/opentelemetry-python/blob/stable/docs/examples/logs/example.py)に従っています。
