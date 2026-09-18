---
title: チャットボットサービス
linkTitle: チャットボット
default_lang_commit: 5f6c57b59b2c0d705b50c089eeed8c2ef2eaff55
cSpell:ignore: gradio httpx
---

このサービスは、デモの AI アシスタントのチャットインターフェイスを提供します。
[Gradio](https://www.gradio.app/) Web UI を配信し、ユーザーのメッセージを HTTP 経由で[エージェントサービス](/docs/demo/services/agent/)に転送し、応答をレンダリングします。
フロントエンドプロキシの `/chatbot` を通じて公開されています。

[チャットボットサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/chatbot/)

## 計装ライブラリ {#instrumentation-libraries}

このサービスは `opentelemetry-instrument` ラッパーを通じて起動されません。
`Dockerfile` はスクリプトを直接実行し、計装はコード内でセットアップされます。

```dockerfile
CMD ["python", "run.py"]
```

[エージェント](/docs/demo/services/agent/)サービスや [MCP](/docs/demo/services/mcp/) サービスとは異なり、このサービスは Traceloop SDK ではなく OpenTelemetry SDK を直接使用します。
2つの HTTP クライアント計装ライブラリが有効化されています。

```python
RequestsInstrumentor().instrument()
HTTPXClientInstrumentor().instrument()
```

エージェントへの呼び出しは `requests` で行われるため、`opentelemetry-instrumentation-requests` がそのクライアントスパンを生成し、送信リクエストにトレースコンテキストを注入します。
これにより、チャットインターフェイスがエージェントに、さらにエージェントが行う LLM やツール呼び出しに接続されます。

Gradio サーバー自体は計装されていないため、ブラウザからの受信リクエストはサーバースパンを生成しません。
このサービスのトレースは、エージェントへの送信呼び出しから始まります。

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

トレースは `_configure_tracing` で明示的に設定されており、`run.py` がインポート時に呼び出します。
このコードはトレーサープロバイダーを作成し、OTLP エクスポーターを備えたバッチスパンプロセッサーを追加し、計装ライブラリが使用できるようにプロバイダーをグローバルに登録します。

```python
def _configure_tracing() -> None:
    provider = TracerProvider()
    provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
    trace.set_tracer_provider(provider)

    RequestsInstrumentor().instrument()
    HTTPXClientInstrumentor().instrument()
```

エクスポーターは `opentelemetry.exporter.otlp.proto.http.trace_exporter` からインポートされるため、このサービスは OTLP/HTTP 経由でエクスポートします。
Docker Compose はこのサービスに対して `OTEL_EXPORTER_OTLP_ENDPOINT` を OpenTelemetry Collector の OTLP/HTTP ポートに設定していますが、他のほとんどのデモサービスは gRPC 経由でエクスポートします。
エクスポートエンドポイント、リソース属性、サービス名はすべて標準の OpenTelemetry 環境変数から取得されます。

### 新しいスパンの作成 {#create-new-spans}

このサービスは独自のスパンを作成しません。
トレーサーを取得せず、`start_as_current_span` を呼び出さず、`set_attribute` を使用してスパンを拡充することもありません。
すべてのスパンは `requests` および HTTPX 計装ライブラリから生成されます。

## メトリクス {#metrics}

メータープロバイダーは設定されていません。
このサービスはトレースエクスポーターのみをインポートし、`metrics.set_meter_provider` を呼び出さないため、`requests` および HTTPX 計装ライブラリが出力可能なメトリクスは送信先がなく、エクスポートされません。
[メトリクスカバレッジマトリクス](/docs/demo/telemetry-features/metric-coverage/)を参照してください。

## ログ {#logs}

このサービスは Python 標準ライブラリのロガーのみを設定しています。

```python
logging.basicConfig(level=logging.INFO)
```

エージェントへのリクエストとエラーは、`chat_with_agent` 内でこのロガーを通じて記録されます。

```python
logging.info(f"Sending request {payload} to Agent")
```

`LoggerProvider` や `LoggingHandler` が設定されていないため、これらのレコードは OTLP 経由でエクスポートされるのではなく、標準出力に出力されコンテナランタイムによって収集されます。
そのため、トレースとの相関はありません。
[ログカバレッジマトリクス](/docs/demo/telemetry-features/log-coverage/)を参照してください。

環境変数の完全なリストとトラブルシューティング手順については、[サービスの README](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/chatbot#readme) を参照してください。
