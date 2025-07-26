---
title: インストルメンテーション
aliases: [manual]
weight: 20
description: OpenTelemetry Python の手動インストルメンテーション
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
cSpell:ignore: millis ottrace textmap
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro.md %}}

## セットアップ {#setup}

まず、API と SDK パッケージがあることを確認してください。

```shell
pip install opentelemetry-api
pip install opentelemetry-sdk
```

## トレース {#traces}

### トレーサーの取得 {#acquire-tracer}

トレースを開始するには、[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) を初期化し、オプションでそれをグローバルデフォルトとして設定する必要があります。

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
)

provider = TracerProvider()
processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)

# グローバルデフォルトトレーサープロバイダーを設定
trace.set_tracer_provider(provider)

# グローバルトレーサープロバイダーからトレーサーを作成
tracer = trace.get_tracer("my.tracer.name")
```

### スパンの作成 {#creating-spans}

[スパン](/docs/concepts/signals/traces/#spans) を作成するには、通常、それを現在のスパンとして開始したいでしょう。

```python
def do_work():
    with tracer.start_as_current_span("span-name") as span:
        # 'span' が追跡する何らかの作業を実行
        print("doing some work...")
        # 'with' ブロックがスコープから外れると、'span' が自動的に閉じられます
```

現在のスパンにすることなくスパンを作成するために `start_span` を使用することもできます。
これは通常、並行処理や非同期処理を追跡するために行われます。

### ネストしたスパンの作成 {#creating-nested-spans}

別の操作の一部として追跡したい明確なサブ操作がある場合、関係を表現するために[スパン](/docs/concepts/signals/traces/#spans) を作成できます。

```python
def do_work():
    with tracer.start_as_current_span("parent") as parent:
        # 'parent' が追跡する何らかの作業を実行
        print("doing some work...")
        # ネストした作業を追跡するためのネストしたスパンを作成
        with tracer.start_as_current_span("child") as child:
            # 'child' が追跡する何らかの作業を実行
            print("doing some nested work...")
            # ネストしたスパンはスコープから外れると閉じられます

        # このスパンもスコープから外れると閉じられます
```

トレース可視化ツールでスパンを表示すると、`child` は `parent` の下のネストしたスパンとして追跡されます。

### デコレーターでスパンを作成 {#creating-spans-with-decorators}

関数全体の実行を単一の [スパン](/docs/concepts/signals/traces/#spans) で追跡することは一般的です。
そのシナリオでは、コードを削減するために使用できるデコレーターがあります。

```python
@tracer.start_as_current_span("do_work")
def do_work():
    print("doing some work...")
```

デコレーターの使用は、`do_work()` 内でスパンを作成し、`do_work()` が終了したときにそれを終了することと同等です。

デコレーターを使用するには、関数宣言に対してグローバルに使用可能な `tracer` インスタンスが必要です。

### 現在のスパンの取得 {#get-the-current-span}

特定の時点で現在の [スパン](/docs/concepts/signals/traces/#spans) が何であるかにアクセスして、より多くの情報で豊かにすることが役立つ場合があります。

```python
from opentelemetry import trace

current_span = trace.get_current_span()
# 'current_span' に何らかの情報を追加
```

### スパンに属性を追加 {#add-attributes-to-a-span}

[属性](/docs/concepts/signals/traces/#attributes) を使用すると、[スパン](/docs/concepts/signals/traces/#spans) にキー/バリューのペアを添付して、追跡している現在の操作に関するより多くの情報を運ぶことができます。

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.set_attribute("operation.value", 1)
current_span.set_attribute("operation.name", "Saying hello!")
current_span.set_attribute("operation.other-stuff", [1, 2, 3])
```

### セマンティック属性を追加 {#add-semantic-attributes}

[セマンティック属性](/docs/specs/semconv/general/trace/) は、一般的な種類のデータに対してよく知られた命名規則である事前定義された[属性](/docs/concepts/signals/traces/#attributes) です。
セマンティック属性を使用すると、システム全体でこの種の情報を正規化できます。

Python でセマンティック属性を使用するには、セマンティック規則パッケージがあることを確認してください。

```shell
pip install opentelemetry-semantic-conventions
```

その後、コードで使用できます。

```python
from opentelemetry import trace
from opentelemetry.semconv.trace import SpanAttributes

// ...

current_span = trace.get_current_span()
current_span.set_attribute(SpanAttributes.HTTP_METHOD, "GET")
current_span.set_attribute(SpanAttributes.HTTP_URL, "https://opentelemetry.io/")
```

### イベントの追加 {#adding-events}

[イベント](/docs/concepts/signals/traces/#span-events) は、[スパン](/docs/concepts/signals/traces/#spans) の存続期間中に「何かが起こっている」ことを表す人間が読める形式のメッセージです。
これは原始的なログと考えることができます。

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.add_event("Gonna try it!")

# 何かを実行

current_span.add_event("Did it!")
```

### リンクの追加 {#adding-links}

[スパン](/docs/concepts/signals/traces/#spans) は、因果的に別のスパンにリンクする 0 個以上のスパン [リンク](/docs/concepts/signals/traces/#span-links)で作成できます。
リンクを作成するには、スパンコンテキストが必要です。

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("span-1"):
    # 'span-1' が追跡する何かを実行
    ctx = trace.get_current_span().get_span_context()
    link_from_span_1 = trace.Link(ctx)

with tracer.start_as_current_span("span-2", links=[link_from_span_1]):
    # 'span-2' が追跡する何かを実行
    # 'span-2' のリンクは因果関係で 'span-1' と関連付けられていますが、
    # 子スパンではありません。
    pass
```

### スパンステータスの設定 {#set-span-status}

{{% include "span-status-preamble.md" %}}

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # 失敗する可能性のある何か
except:
    current_span.set_status(Status(StatusCode.ERROR))
```

### スパンで例外を記録 {#record-exceptions-in-spans}

例外が発生したときに記録することは良いアイデアです。
これは [スパンステータス](#set-span-status) の設定と組み合わせて行うことが推奨されます。

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # 失敗する可能性のある何か

# コードでより具体的な例外をキャッチすることを検討してください
except Exception as ex:
    current_span.set_status(Status(StatusCode.ERROR))
    current_span.record_exception(ex)
```

### デフォルトの伝搬形式の変更 {#change-the-default-propagation-format}

デフォルトでは、OpenTelemetry Python は次の伝搬形式を使用します。

- W3C Trace Context
- W3C Baggage

デフォルトを変更する必要がある場合は、環境変数またはコードで行うことができます。

#### 環境変数の使用 {#using-environment-variables}

`OTEL_PROPAGATORS` 環境変数をカンマ区切りのリストで設定できます。
受け入れられる値は次のとおりです。

- `"tracecontext"`: W3C Trace Context
- `"baggage"`: W3C Baggage
- `"b3"`: B3 Single
- `"b3multi"`: B3 Multi
- `"jaeger"`: Jaeger
- `"xray"`: AWS X-Ray (サードパーティ)
- `"ottrace"`: OT Trace (サードパーティ)
- `"none"`: 自動設定されたプロパゲーターなし

デフォルト設定は `OTEL_PROPAGATORS="tracecontext,baggage"` と同等です。

#### SDK API の使用 {#using-sdk-apis}

代替手段として、コードで形式を変更できます。

たとえば、かわりに Zipkin の B3 伝搬形式を使用する必要がある場合、B3 パッケージをインストールできます。

```shell
pip install opentelemetry-propagator-b3
```

その後、トレース初期化コードで B3 プロパゲーターを設定します。

```python
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.b3 import B3Format

set_global_textmap(B3Format())
```

環境変数は、コードで設定されたものを上書きすることに注意してください。

### 参考資料 {#further-reading}

- [トレースの概念](/docs/concepts/signals/traces/)
- [トレース仕様](/docs/specs/otel/overview/#tracing-signal)
- [Python トレース API ドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html)
- [Python トレース SDK ドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.html)

## メトリクス {#metrics}

メトリクスの収集を開始するには、[`MeterProvider`](/docs/specs/otel/metrics/api/#meterprovider) を初期化し、オプションでそれをグローバルデフォルトとして設定する必要があります。

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import (
    ConsoleMetricExporter,
    PeriodicExportingMetricReader,
)

metric_reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
provider = MeterProvider(metric_readers=[metric_reader])

# グローバルデフォルトメータープロバイダーを設定
metrics.set_meter_provider(provider)

# グローバルメータープロバイダーからメーターを作成
meter = metrics.get_meter("my.meter.name")
```

### 同期計装の作成と使用 {#creating-and-using-synchronous-instruments}

計装は、アプリケーションの測定を行うために使用されます。
[同期計装](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments)は、リクエストの処理や別のサービスの呼び出しなど、アプリケーション/ビジネス処理ロジックとインラインで使用されます。

まず、計装を作成します。
計装は一般的に、モジュールまたはクラスレベルで一度作成され、その後ビジネスロジックとインラインで使用されます。
この例では、[カウンター](/docs/specs/otel/metrics/api/#counter)計装を使用して、完了した作業項目の数をカウントします。

```python
work_counter = meter.create_counter(
    "work.counter", unit="1", description="Counts the amount of work done"
)
```

カウンターの [add 操作](/docs/specs/otel/metrics/api/#add) を使用して、以下のコードは作業項目のタイプを属性として使用して、カウントを 1 つずつ増やします。

```python
def do_work(work_item):
    # 実行中の作業をカウント
    work_counter.add(1, {"work.type": work_item.work_type})
    print("doing some work...")
```

### 非同期計装の作成と使用 {#creating-and-using-asynchronous-instruments}

[非同期計装](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments)は、ユーザーがコールバック関数を登録する方法を提供し、これらは必要に応じて呼び出されて測定を行います。
これは、直接計装できない値を定期的に測定するのに便利です。
非同期計装は、メトリクス収集中に呼び出される 0 個以上のコールバックで作成されます。
各コールバックは SDK からのオプションを受け取り、その観測値を返します。

この例では、[非同期ゲージ](/docs/specs/otel/metrics/api/#asynchronous-gauge)計装を使用して、HTTP エンドポイントをスクレイピングすることで設定サーバーによって提供される現在の設定バージョンを報告します。
まず、観測を行うコールバックを記述します。

```python
from typing import Iterable
from opentelemetry.metrics import CallbackOptions, Observation


def scrape_config_versions(options: CallbackOptions) -> Iterable[Observation]:
    r = requests.get(
        "http://configserver/version_metadata", timeout=options.timeout_millis / 10**3
    )
    for metadata in r.json():
        yield Observation(
            metadata["version_num"], {"config.name": metadata["version_num"]}
        )
```

OpenTelemetry はタイムアウトを含むオプションをコールバックに渡すことに注意してください。
コールバックは、無期限にブロックしないように、このタイムアウトを尊重する必要があります。
最後に、コールバックで計装を作成して登録します。

```python
meter.create_observable_gauge(
    "config.version",
    callbacks=[scrape_config_versions],
    description="The active config version for each configuration",
)
```

### 参考資料 {#further-reading-1}

- [メトリクスの概念](/docs/concepts/signals/metrics/)
- [メトリクス仕様](/docs/specs/otel/metrics/)
- [Python メトリクス API ドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/api/metrics.html)
- [Python メトリクス SDK ドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.html)

## ログ {#logs}

ログ API と SDK は現在開発中です。
ログの収集を開始するには、[`LoggerProvider`](/docs/specs/otel/logs/api/#loggerprovider) を初期化し、オプションでそれをグローバルデフォルトとして設定する必要があります。
その後、Python の組み込みログモジュールを使用して、OpenTelemetry が処理できるログレコードを作成します。

```python
import logging
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor, ConsoleLogExporter
from opentelemetry._logs import set_logger_provider, get_logger

provider = LoggerProvider()
processor = BatchLogRecordProcessor(ConsoleLogExporter())
provider.add_log_record_processor(processor)
# グローバルデフォルトロガープロバイダーを設定
set_logger_provider(provider)

logger = get_logger(__name__)

handler = LoggingHandler(level=logging.INFO, logger_provider=provider)
logging.basicConfig(handlers=[handler], level=logging.INFO)

logging.info("This is an OpenTelemetry log record!")
```

### 参考資料 {#further-reading-2}

- [ログの概念](/docs/concepts/signals/logs/)
- [ログ仕様](/docs/specs/otel/logs/)
- [Python ログ API ドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/api/_logs.html)
- [Python ログ SDK ドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/sdk/_logs.html)

## 次のステップ {#next-steps}

テレメトリーデータを 1 つ以上のテレメトリーバックエンドに[エクスポートする](/docs/languages/python/exporters) ために、適切なエクスポーターを設定することも必要です。
