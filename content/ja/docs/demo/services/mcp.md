---
title: MCP サービス
linkTitle: MCP
default_lang_commit: 5f6c57b59b2c0d705b50c089eeed8c2ef2eaff55
cSpell:ignore: fastmcp httpx
---

このサービスはショップの操作を [Model Context Protocol](https://modelcontextprotocol.io/) 上のツールとして公開し、[エージェントサービス](../agent/)やその他の MCP 互換クライアントがそれらを呼び出せるようにします。
各ツールはフロントエンド API を HTTP 経由で呼び出す薄いラッパーです。

[MCP サービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/mcp/)

## 計装ライブラリ {#instrumentation-libraries}

このサービスは `opentelemetry-instrument` ラッパーを介して起動されません。
`Dockerfile` はスクリプトを直接実行し、計装はコード内でセットアップされます。

```dockerfile
CMD ["python", "run.py"]
```

`run.py` では、[Traceloop SDK](https://www.traceloop.com/) が OpenTelemetry SDK を初期化し、`opentelemetry-instrumentation-mcp` を含む計装ライブラリのバンドルを有効にします。
その後、HTTPX 計装が明示的に有効化されます。

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "mcp"),
)

HTTPXClientInstrumentor().instrument()
```

この組み合わせにより、手動でスパンを作成することなくサービスの両側をカバーします。

- `opentelemetry-instrumentation-mcp` — FastMCP サーバーが処理する受信 MCP ツール呼び出しに対するスパン。
- `opentelemetry-instrumentation-httpx` — 各ツールがフロントエンド API に対して行う送信 HTTP 呼び出しに対するクライアントスパン。

エージェントとこのサービスは同じ MCP 計装で計装されているため、コンテキストは MCP トランスポートを越えて伝搬し、エージェントが行ったツール呼び出しはこのサービスが実行する処理と同じトレースに表示されます。

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

`Traceloop.init()` はバッチスパンプロセッサーと OTLP エクスポーターを備えたトレーサープロバイダーを作成し、グローバルトレーサープロバイダーとして登録します。
そのため、上記の計装ライブラリは単一のエクスポートパイプラインを共有します。

エクスポートエンドポイントは `OTEL_EXPORTER_OTLP_ENDPOINT` ではなく `TRACELOOP_BASE_URL` から取得され、Traceloop はそれに `/v1/traces` を付加します。
Docker Compose では、これは OpenTelemetry Collector の OTLP/HTTP ポートを指します。
`app_name` 引数は `service.name` リソース属性になり、追加のリソース属性は `OTEL_RESOURCE_ATTRIBUTES` から読み取られます。

### 新しいスパンの作成 {#create-new-spans}

このサービスは独自のスパンを作成しません。
ツールは FastMCP サーバーに登録され、ラップされないため、すべてのスパンは計装ライブラリによって生成されます。

```python
self.mcp.tool("add_to_cart")(tools.add_to_cart)
```

このサービスは OpenTelemetry トレーシング API を直接使用しません。
`start_as_current_span` を呼び出さず、`set_attribute` を使用してスパンをエンリッチすることもしません。

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

`Traceloop.init()` は `TRACELOOP_METRICS_ENABLED=false` が設定されていない限り、メトリクスも構成します。
定期エクスポートメトリクスリーダーを備えたメータープロバイダーを作成しグローバルに登録するため、HTTPX 計装ライブラリが出力するメトリクスがエクスポートされます。

### カスタムメトリクス {#custom-metrics}

このサービスはカスタムメトリクスを定義していません。
メーターを取得せず、独自の計装も作成しません。

## ログ {#logs}

このサービスは Python 標準ライブラリのロガーのみを設定します。

```python
logging.basicConfig(level=logging.INFO)
```

Traceloop のログエクスポートはデフォルトで無効であり、このサービスは `LoggerProvider` や `LoggingHandler` をセットアップしません。
ログレコードは OTLP 経由でエクスポートされるのではなく、stdout に書き込まれコンテナランタイムによって収集されるため、トレースとの相関はありません。
[ログカバレッジマトリクス](../../telemetry-features/log-coverage/)を参照してください。

環境変数の全リストとトラブルシューティング手順については、[サービスの README](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/mcp#readme) を参照してください。
