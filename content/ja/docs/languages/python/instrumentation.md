---
title: 計装
aliases: [manual]
weight: 20
description: OpenTelemetry Pythonの手動計装
default_lang_commit: 0e8c0ce298a66ea2cb968c0e978e4589ceeb84c6
cSpell:ignore: millis ottrace textmap
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro.md %}}

## セットアップ {#setup}

まず、APIとSDKパッケージがインストールされていることを確認します。

```shell
pip install opentelemetry-api
pip install opentelemetry-sdk
```

## トレース {#traces}

### トレーサーの取得 {#acquire-tracer}

トレースを開始するには、[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider)を初期化し、オプションでグローバルデフォルトとして設定する必要があります。

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

# グローバルデフォルトのトレーサープロバイダーを設定する
trace.set_tracer_provider(provider)

# グローバルトレーサープロバイダーからトレーサーを作成する
tracer = trace.get_tracer("my.tracer.name")
```

### スパンの作成 {#creating-spans}

通常、[スパン](/docs/concepts/signals/traces/#spans)を作成するには、現在のスパンとして開始します。

```python
def do_work():
    with tracer.start_as_current_span("span-name") as span:
        # 'span'が追跡する作業を行う
        print("doing some work...")
        # 'with'ブロックのスコープを抜けると、'span'は自動的に閉じられる
```

`start_span`を使用して、現在のスパンにせずにスパンを作成することもできます。
これは通常、並行処理や非同期処理を追跡するために使用します。

### ネストされたスパンの作成 {#creating-nested-spans}

別の操作の一部として追跡したい個別のサブ操作がある場合、その関係を表す[スパン](/docs/concepts/signals/traces/#spans)を作成できます。

```python
def do_work():
    with tracer.start_as_current_span("parent") as parent:
        # 'parent'が追跡する作業を行う
        print("doing some work...")
        # ネストされた作業を追跡するためのネストされたスパンを作成する
        with tracer.start_as_current_span("child") as child:
            # 'child'が追跡する作業を行う
            print("doing some nested work...")
            # ネストされたスパンはスコープを抜けると閉じられる

        # このスパンもスコープを抜けると閉じられる
```

トレースの可視化ツールでスパンを表示すると、`child`は`parent`の下にネストされたスパンとして追跡されます。

### デコレーターによるスパンの作成 {#creating-spans-with-decorators}

単一の[スパン](/docs/concepts/signals/traces/#spans)で関数全体の実行を追跡することはよくあります。
そのような場合、コードを削減するためにデコレーターを使用できます。

```python
@tracer.start_as_current_span("do_work")
def do_work():
    print("doing some work...")
```

デコレーターの使用は、`do_work()`内でスパンを作成し、`do_work()`の完了時にスパンを終了することと同等です。

デコレーターを使用するには、関数宣言のグローバルスコープで`tracer`インスタンスが利用可能である必要があります。

### 現在のスパンの取得 {#get-the-current-span}

ある時点で現在の[スパン](/docs/concepts/signals/traces/#spans)にアクセスし、追加情報を付与したい場合があります。

```python
from opentelemetry import trace

current_span = trace.get_current_span()
# 'current_span'に情報を付与する
```

### スパンへの属性の追加 {#add-attributes-to-a-span}

[属性](/docs/concepts/signals/traces/#attributes)を使用すると、[スパン](/docs/concepts/signals/traces/#spans)にキーバリューのペアを付与でき、追跡中の現在の操作に関するより多くの情報を保持できます。

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.set_attribute("operation.value", 1)
current_span.set_attribute("operation.name", "Saying hello!")
current_span.set_attribute("operation.other-stuff", [1, 2, 3])
```

### セマンティック属性の追加 {#add-semantic-attributes}

[セマンティック属性](/docs/specs/semconv/general/trace/)は、一般的な種類のデータに対するよく知られた命名規則として事前定義された[属性](/docs/concepts/signals/traces/#attributes)です。
セマンティック属性を使用すると、システム全体でこの種の情報を正規化できます。

Pythonでセマンティック属性を使用するには、セマンティック規約パッケージがインストールされていることを確認してください。

```shell
pip install opentelemetry-semantic-conventions
```

その後、コード内で使用できます。

```python
from opentelemetry import trace
from opentelemetry.semconv.trace import SpanAttributes

// ...

current_span = trace.get_current_span()
current_span.set_attribute(SpanAttributes.HTTP_METHOD, "GET")
current_span.set_attribute(SpanAttributes.HTTP_URL, "https://opentelemetry.io/")
```

### イベントの追加 {#adding-events}

[イベント](/docs/concepts/signals/traces/#span-events)は、[スパン](/docs/concepts/signals/traces/#spans)のライフタイム中に「何かが起こった」ことを表す、人間が読めるメッセージです。
プリミティブなログと考えることができます。

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.add_event("Gonna try it!")

# 処理を行う

current_span.add_event("Did it!")
```

### リンクの追加 {#adding-links}

[スパン](/docs/concepts/signals/traces/#spans)は、別のスパンと因果関係を持つゼロ個以上のスパン[リンク](/docs/concepts/signals/traces/#span-links)を持つように作成できます。
リンクを作成するにはスパンコンテキストが必要です。

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("span-1"):
    # 'span-1'が追跡する処理を行う
    ctx = trace.get_current_span().get_span_context()
    link_from_span_1 = trace.Link(ctx)

with tracer.start_as_current_span("span-2", links=[link_from_span_1]):
    # 'span-2'が追跡する処理を行う
    # 'span-2'のリンクは'span-1'と因果関係がありますが、
    # 子スパンではありません
    pass
```

### スパンステータスの設定 {#set-span-status}

{{% include "span-status-preamble.md" %}}

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # 失敗する可能性のある処理
except:
    current_span.set_status(Status(StatusCode.ERROR))
```

### スパンでの例外の記録 {#record-exceptions-in-spans}

例外が発生した場合に記録することは良いプラクティスです。
[スパンステータス](#set-span-status)の設定とあわせて行うことをお勧めします。

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # 失敗する可能性のある処理

# コード内ではより具体的な例外をキャッチすることを検討してください
except Exception as ex:
    current_span.set_status(Status(StatusCode.ERROR))
    current_span.record_exception(ex)
```

### デフォルトの伝搬（伝搬）フォーマットの変更 {#change-the-default-propagation-format}

デフォルトでは、OpenTelemetry Pythonは以下の伝搬（伝搬）フォーマットを使用します。

- W3C Trace Context
- W3C Baggage

デフォルトを変更する必要がある場合は、環境変数またはコードで設定できます。

#### 環境変数の使用 {#using-environment-variables}

`OTEL_PROPAGATORS`環境変数にカンマ区切りのリストを設定できます。
受け入れられる値は以下のとおりです。

- `"tracecontext"`: W3C Trace Context
- `"baggage"`: W3C Baggage
- `"b3"`: B3 Single
- `"b3multi"`: B3 Multi
- `"jaeger"`: Jaeger
- `"xray"`: AWS X-Ray（サードパーティ）
- `"ottrace"`: OT Trace（サードパーティ）
- `"none"`: 自動設定されるプロパゲーターなし

デフォルトの設定は`OTEL_PROPAGATORS="tracecontext,baggage"`と同等です。

#### SDK APIの使用 {#using-sdk-apis}

かわりに、コード内でフォーマットを変更することもできます。

たとえば、ZipkinのB3伝搬（伝搬）フォーマットを使用する必要がある場合は、B3パッケージをインストールします。

```shell
pip install opentelemetry-propagator-b3
```

そして、トレースの初期化コードでB3プロパゲーターを設定します。

```python
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.b3 import B3Format

set_global_textmap(B3Format())
```

環境変数はコードで設定されたものを上書きすることに注意してください。

### 参考資料 {#further-reading}

- [トレースのコンセプト](/docs/concepts/signals/traces/)
- [トレース仕様](/docs/specs/otel/overview/#tracing-signal)
- [Python Trace APIドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html)
- [Python Trace SDKドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.html)

## メトリクス {#metrics}

メトリクスの収集を開始するには、[`MeterProvider`](/docs/specs/otel/metrics/api/#meterprovider)を初期化し、オプションでグローバルデフォルトとして設定する必要があります。

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import (
    ConsoleMetricExporter,
    PeriodicExportingMetricReader,
)

metric_reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
provider = MeterProvider(metric_readers=[metric_reader])

# グローバルデフォルトのメータープロバイダーを設定する
metrics.set_meter_provider(provider)

# グローバルメータープロバイダーからメーターを作成する
meter = metrics.get_meter("my.meter.name")
```

### 同期計装の作成と使用 {#creating-and-using-synchronous-instruments}

計装は、アプリケーションの計測に使用されます。
[同期計装](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments)は、リクエストの処理や別のサービスの呼び出しなど、アプリケーションやビジネスの処理ロジックと連動して使用されます。

まず、計装を作成します。
計装は通常、モジュールまたはクラスレベルで一度作成され、ビジネスロジックと連動して使用されます。
この例では、完了した作業項目の数をカウントするために[Counter](/docs/specs/otel/metrics/api/#counter)計装を使用します。

```python
work_counter = meter.create_counter(
    "work.counter", unit="1", description="Counts the amount of work done"
)
```

Counterの[add操作](/docs/specs/otel/metrics/api/#add)を使用して、以下のコードでは作業項目のタイプを属性としてカウントを1つ増やします。

```python
def do_work(work_item):
    # 実行中の作業をカウントする
    work_counter.add(1, {"work.type": work_item.work_type})
    print("doing some work...")
```

### 非同期計装の作成と使用 {#creating-and-using-asynchronous-instruments}

[非同期計装](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments)は、オンデマンドで呼び出されるコールバック関数を登録する方法を提供します。
これは、直接計装できない値を定期的に計測するのに便利です。
非同期計装は、メトリクス収集中に呼び出されるゼロ個以上のコールバックとともに作成されます。
各コールバックはSDKからのオプションを受け取り、その観測値を返します。

この例では、HTTPエンドポイントをスクレイピングして設定サーバーから提供される現在の設定バージョンを報告するために、[非同期ゲージ](/docs/specs/otel/metrics/api/#asynchronous-gauge)計装を使用します。
まず、観測値を作成するコールバックを記述します。

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

OpenTelemetryはタイムアウトを含むオプションをコールバックに渡すことに注意してください。
コールバックは無限にブロックしないよう、このタイムアウトを尊重する必要があります。
最後に、コールバックとともに計装を作成して登録します。

```python
meter.create_observable_gauge(
    "config.version",
    callbacks=[scrape_config_versions],
    description="The active config version for each configuration",
)
```

### 参考資料 {#further-reading-1}

- [メトリクスのコンセプト](/docs/concepts/signals/metrics/)
- [メトリクス仕様](/docs/specs/otel/metrics/)
- [Python Metrics APIドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/api/metrics.html)
- [Python Metrics SDKドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.html)

## ログ {#logs}

ログAPIおよびSDKは現在開発中です。
ログの収集を開始するには、[`LoggerProvider`](/docs/specs/otel/logs/api/#loggerprovider)を初期化し、オプションでグローバルデフォルトとして設定する必要があります。
その後、Pythonの組み込みロギングモジュールを使用して、OpenTelemetryが処理できるログレコードを作成します。

```python
import logging
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor, ConsoleLogRecordExporter # 1.39.0より前のバージョンではConsoleLogExporter
from opentelemetry._logs import set_logger_provider

provider = LoggerProvider()
processor = BatchLogRecordProcessor(ConsoleLogRecordExporter())
provider.add_log_record_processor(processor)
# グローバルデフォルトのロガープロバイダーを設定する
set_logger_provider(provider)

handler = LoggingHandler(level=logging.INFO, logger_provider=provider)
logging.basicConfig(handlers=[handler], level=logging.INFO)

logging.getLogger(__name__).info("This is an OpenTelemetry log record!")
```

### 参考資料 {#further-reading-2}

- [ログのコンセプト](/docs/concepts/signals/logs/)
- [ログ仕様](/docs/specs/otel/logs/)
- [Python Logs APIドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/api/_logs.html)
- [Python Logs SDKドキュメント](https://opentelemetry-python.readthedocs.io/en/latest/sdk/_logs.html)

## 次のステップ {#next-steps}

[テレメトリーデータのエクスポート](/docs/languages/python/exporters)を行うために、適切なエクスポーターを設定することも必要です。
