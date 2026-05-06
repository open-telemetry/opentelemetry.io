---
title: 伝搬
description: Python SDK のコンテキスト伝搬
weight: 65
default_lang_commit: 6bf06ddb9fc057dd6e8092f26d988ffe7b1af5ed
cSpell:ignore: sqlcommenter
---

伝搬は、サービスやプロセス間でデータを移動させる仕組みです。
トレースに限ったものではありませんが、プロセス境界やネットワーク境界をまたいで任意に分散したサービス群の間で、システムに関する因果関係の情報をトレースが構築できるようにするものです。

OpenTelemetry は、[W3C Trace Context](https://www.w3.org/TR/trace-context/) の HTTP ヘッダーを使用して、リモートサービスにコンテキストを伝搬するためのテキストベースの方法を提供します。

## 自動的なコンテキスト伝搬 {#automatic-context-propagation}

Jinja2、Flask、Django、Celery などの一般的な Python フレームワークやライブラリ向けの計装ライブラリは、サービス間でコンテキストを自動的に伝搬します。

> [!NOTE]
>
> コンテキストの伝搬には計装ライブラリを使用してください。
> 手動でコンテキストを伝搬することも可能ですが、Python の自動計装と計装ライブラリは十分にテストされており、より簡単に利用できます。

## 手動でのコンテキスト伝搬 {#manual-context-propagation}

次の汎用的な例は、トレースコンテキストを手動で伝搬する方法を示しています。

まず、送信側のサービスで現在の `context` を注入します。

```python
from flask import Flask
import requests
from opentelemetry import trace, baggage
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.baggage.propagation import W3CBaggagePropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

@app.route('/')
def hello():
    with tracer.start_as_current_span("api1_span") as span:
        ctx = baggage.set_baggage("hello", "world")

        headers = {}
        W3CBaggagePropagator().inject(headers, ctx)
        TraceContextTextMapPropagator().inject(headers, ctx)
        print(headers)

        response = requests.get('http://127.0.0.1:5001/', headers=headers)
        return f"Hello from API 1! Response from API 2: {response.text}"

if __name__ == '__main__':
    app.run(port=5002)
```

受信側のサービスでは、たとえば解析済みの HTTP ヘッダーから `context` を抽出し、それを現在のトレースコンテキストとして設定します。

```python
from flask import Flask, request
from opentelemetry import trace, baggage
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.baggage.propagation import W3CBaggagePropagator

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

@app.route('/')
def hello():
    # 例: API 2 のリクエストで受信したヘッダーをログに出力
    headers = dict(request.headers)
    print(f"Received headers: {headers}")
    carrier ={'traceparent': headers['Traceparent']}
    ctx = TraceContextTextMapPropagator().extract(carrier=carrier)
    print(f"Received context: {ctx}")

    b2 ={'baggage': headers['Baggage']}
    ctx2 = W3CBaggagePropagator().extract(b2, context=ctx)
    print(f"Received context2: {ctx2}")

    # 新しいスパンを開始
    with tracer.start_span("api2_span", context=ctx2):
       # 伝搬されたコンテキストを使用
        print(baggage.get_baggage('hello', ctx2))
        return "Hello from API 2!"

if __name__ == '__main__':
    app.run(port=5001)
```

このようにして、デシリアライズされたアクティブなコンテキストが得られたら、別のサービスからの同じトレースの一部であるスパンを作成できます。

### sqlcommenter {#sqlcommenter}

一部の Python 計装は sqlcommenter をサポートしており、コンテキスト情報でデータベースクエリ文を拡張します。
sqlcommenter を有効にして行われたクエリには、設定可能なキーと値のペアが追加されます。
たとえば、次のようになります。

```sql
"select * from auth_users; /*traceparent=00-01234567-abcd-01*/"
```

これは、データベースのログレコードが有効になっている場合に、データベースクライアントとサーバー間のコンテキスト伝搬をサポートします。
詳細は、以下を参照してください。

- [OpenTelemetry Python sqlcommenter の例](https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/sqlcommenter/)
- [セマンティック規約 - データベーススパン](/docs/specs/semconv/db/database-spans/#sql-commenter)
- [sqlcommenter](https://google.github.io/sqlcommenter/)

## 次のステップ {#next-steps}

伝搬の詳細については、[Propagators API](/docs/specs/otel/context/api-propagators/) を参照してください。
