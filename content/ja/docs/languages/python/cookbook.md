---
title: クックブック
weight: 100
default_lang_commit: 06837fe15457a584f6a9e09579be0f0400593d57
---

このページは、よくあるシナリオのためのクックブックです。

## 新しいスパンを作成する {#create-a-new-span}

```python
from opentelemetry import trace

tracer = trace.get_tracer("my.tracer")
with tracer.start_as_current_span("print") as span:
    print("foo")
    span.set_attribute("printed_string", "foo")
```

## スパンの取得と変更 {#getting-and-modifying-a-span}

```python
from opentelemetry import trace

current_span = trace.get_current_span()
current_span.set_attribute("hometown", "Seattle")
```

## ネストしたスパンを作成する {#create-a-nested-span}

```python
from opentelemetry import trace
import time

tracer = trace.get_tracer("my.tracer")

# いくつかの処理を追跡するための新しいスパンを作成
with tracer.start_as_current_span("parent"):
    time.sleep(1)

    # ネストした処理を追跡するためのネストしたスパンを作成
    with tracer.start_as_current_span("child"):
        time.sleep(2)
        # ネストしたスパンはスコープを抜けると閉じられます

    # ここで再び親スパンが現在のスパンになります
    time.sleep(1)

    # このスパンもスコープを抜けると閉じられます
```

## 異なるコンテキストでバゲッジを取得する {#capturing-baggage-at-different-contexts}

```python
from opentelemetry import trace, baggage

tracer = trace.get_tracer("my.tracer")
with tracer.start_as_current_span(name="root span") as root_span:
    parent_ctx = baggage.set_baggage("context", "parent")
    with tracer.start_as_current_span(
        name="child span", context=parent_ctx
    ) as child_span:
        child_ctx = baggage.set_baggage("context", "child")

print(baggage.get_baggage("context", parent_ctx))
print(baggage.get_baggage("context", child_ctx))
```

## スパンコンテキストを手動で設定する {#manually-setting-span-context}

通常は、アプリケーションやサービングフレームワークがトレースコンテキストの伝搬を処理してくれます。
ただし、場合によってはトレースコンテキストを自分で保存し（`.inject` を使用）、別の場所で復元し（`.extract` を使用）なければならないことがあります。

```python
from opentelemetry import trace, context
from opentelemetry.trace import NonRecordingSpan, SpanContext, TraceFlags
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# 何が起きているかを確認できるよう、スパンをコンソールに書き出すシンプルなプロセッサーを設定します。
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer("my.tracer")

# TextMapPropagator は、デフォルトでは Carrier として dict のような任意のオブジェクトで動作します。
# カスタムの getter や setter を実装することもできます。
with tracer.start_as_current_span('first-trace'):
    carrier = {}
    # 現在のコンテキストを carrier に書き込みます。
    TraceContextTextMapPropagator().inject(carrier)

# 以下は別のスレッド、別のマシンなどで行われる可能性があります。
# 典型的には別のマイクロサービス上で行われ、carrier は HTTP ヘッダー経由で
# 転送されているはずです。

# carrier からトレースコンテキストを抽出します。
# これは上で inject された場合の典型的な carrier の例です。
carrier = {'traceparent': '00-a9c3b99a95cc045e573e163c3ac80a77-d99d251a8caecd06-01'}
# そして、propagator を使ってそこからコンテキストを取得します。
ctx = TraceContextTextMapPropagator().extract(carrier=carrier)

# carrier からトレースコンテキストを抽出するかわりに、すでに SpanContext
# オブジェクトを持っている場合は、次のようにトレースコンテキストを取得できます。
span_context = SpanContext(
    trace_id=2604504634922341076776623263868986797,
    span_id=5213367945872657620,
    is_remote=True,
    trace_flags=TraceFlags(0x01)
)
ctx = trace.set_span_in_context(NonRecordingSpan(span_context))

# これで、トレースコンテキストを利用する方法がいくつかあります。

# スパンを開始するときにコンテキストオブジェクトを渡せます。
with tracer.start_as_current_span('child', context=ctx) as span:
    span.set_attribute('primes', [2, 3, 5, 7])

# あるいは、それを現在のコンテキストにすると、次のスパンがそれを引き継ぎます。
# 戻り値のトークンを使うと、前のコンテキストを復元できます。
token = context.attach(ctx)
try:
    with tracer.start_as_current_span('child') as span:
        span.set_attribute('evens', [2, 4, 6, 8])
finally:
    context.detach(token)
```

## 異なる Resource を持つ複数のトレーサープロバイダーを使用する {#using-multiple-tracer-providers-with-different-resource}

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor

# グローバルなトレーサープロバイダーは 1 度しか設定できません
trace.set_tracer_provider(
    TracerProvider(resource=Resource.create({"service.name": "service1"}))
)
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer("tracer.one")
with tracer.start_as_current_span("some-name") as span:
    span.set_attribute("key", "value")



another_tracer_provider = TracerProvider(
    resource=Resource.create({"service.name": "service2"})
)
another_tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

another_tracer = trace.get_tracer("tracer.two", tracer_provider=another_tracer_provider)
with another_tracer.start_as_current_span("name-here") as span:
    span.set_attribute("another-key", "another-value")
```
