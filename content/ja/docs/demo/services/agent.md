---
title: エージェントサービス
linkTitle: エージェント
default_lang_commit: a449f75ace18eca8e9633c7057c29c59056f743c
cSpell:ignore: fastapi httpx langchain langgraph openai
---

このサービスはデモの AI アシスタントを提供します。
FastAPI エンドポイントを公開してユーザーのプロンプトを受け付け、LangGraph ReAct エージェントを通じてルーティングし、組み込みのツールまたは [MCP サービス](/docs/demo/services/mcp/)から読み込まれたツールを使ってショップの API を呼び出します。

[エージェントサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/agent/)

## LLM の設定 {#llm-configuration}

デフォルトでは、このサービスは記録済みの LLM レスポンスを再生するため、ライブモデルなしでデモを実行できます。
実際の OpenAI 互換 LLM を使用するには、`.env.override` ファイルに以下の環境変数を設定してください。

```text
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
API_KEY=<replace with API key>
USE_VCR=False
```

## 計装ライブラリ {#instrumentation-libraries}

このサービスは `opentelemetry-instrument` ラッパーを介して起動されません。
`Dockerfile` はスクリプトを直接実行し、計装はコード内でセットアップされます。

```dockerfile
CMD ["python", "run.py"]
```

`run.py` では、[Traceloop SDK](https://www.traceloop.com/) が OpenTelemetry SDK を初期化し、生成 AI 計装ライブラリのバンドルを有効にします。
その後、HTTPX 計装が明示的に有効化されます。

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "agent"),
)

HTTPXClientInstrumentor().instrument()
```

FastAPI 計装はアプリケーションオブジェクトが作成された後、`start_servers` 内で適用されます。

```python
FastAPIInstrumentor.instrument_app(agent.app)
```

これらを組み合わせることで、手動でスパンを作成することなくスパンが生成されます。

- `opentelemetry-instrumentation-fastapi` — `POST /prompt` へのリクエストに対するサーバースパン。
- `opentelemetry-instrumentation-httpx` — LLM API およびショップツールが使用するフロントエンド API への送信呼び出しに対するクライアントスパン。
- Traceloop のバンドル、特に `opentelemetry-instrumentation-langchain`、`opentelemetry-instrumentation-openai`、および `opentelemetry-instrumentation-mcp` — LangChain と LangGraph のステップ、LLM 呼び出し、および `MCP_ENABLED=True` の場合の MCP ツール呼び出しに対するスパン。

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

`Traceloop.init()` はバッチスパンプロセッサーと OTLP エクスポーターを備えたトレーサープロバイダーを作成し、グローバルトレーサープロバイダーとして登録します。
そのため、上記の計装ライブラリは単一のエクスポートパイプラインを共有します。

エクスポートエンドポイントは `OTEL_EXPORTER_OTLP_ENDPOINT` ではなく `TRACELOOP_BASE_URL` から取得され、Traceloop はそれに `/v1/traces` を付加します。
Docker Compose では、これは OpenTelemetry Collector の OTLP/HTTP ポートを指します。
`app_name` 引数は `service.name` リソース属性になり、追加のリソース属性は `OTEL_RESOURCE_ATTRIBUTES` から読み取られます。

### 新しいスパンの作成 {#create-new-spans}

`run_agent` メソッドは Traceloop の `@workflow` デコレーターでラップされており、エージェント実行全体に対するスパンを開始します。
計装ライブラリが作成する LLM およびツールのスパンはその子スパンになります。

```python
@workflow(name="astronomy_shop_agent_workflow")
async def run_agent(self, input_prompt, history: List[Dict] | None = None):
```

これにより `astronomy_shop_agent_workflow` という名前のスパンが生成されます。
単一のプロンプトが複数の推論およびツール呼び出しターンをトリガーする可能性があるため、このスパンが1回のエンドツーエンドのエージェント実行をまとめるものとなります。

このデコレーター以外に、このサービスは OpenTelemetry トレーシング API を直接使用しません。
`start_as_current_span` でスパンを作成することも、`set_attribute` でスパンを拡充することもありません。

### プロンプトと完了コンテンツ {#prompt-and-completion-content}

バンドルされた生成 AI 計装は OpenTelemetry の[生成 AI セマンティック規約](/docs/specs/semconv/gen-ai/)に従い、プロンプトと完了をスパン属性として `gen_ai.input.messages` および `gen_ai.output.messages` に記録します。
`TRACELOOP_TRACE_CONTENT=false` を設定すると、エクスポートされるスパンからプロンプトと完了コンテンツを除外できます。

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

`Traceloop.init()` は `TRACELOOP_METRICS_ENABLED=false` が設定されていない限り、メトリクスも構成します。
定期エクスポートメトリクスリーダーを備えたメータープロバイダーを作成しグローバルに登録するため、FastAPI および HTTPX 計装ライブラリが出力するメトリクスがエクスポートされます。

### カスタムメトリクス {#custom-metrics}

このサービスはカスタムメトリクスを定義していません。
メーターを取得したり、独自の計装を作成したりすることもありません。

## ログ {#logs}

このサービスは Python 標準ライブラリのロガーのみを設定します。

```python
logging.basicConfig(level=logging.INFO)
```

Traceloop のログエクスポートはデフォルトで無効であり、このサービスは `LoggerProvider` や `LoggingHandler` をセットアップしません。
ログレコードは OTLP 経由でエクスポートされるのではなく、標準出力に書き込まれコンテナランタイムによって収集されるため、トレースとの相関はありません。
[ログカバレッジマトリクス](/docs/demo/telemetry-features/log-coverage/)を参照してください。

環境変数の完全なリストとトラブルシューティング手順については、[サービスの README](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/agent#readme) を参照してください。
