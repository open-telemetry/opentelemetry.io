---
title: ログ自動計装の例
linkTitle: Logs Example
weight: 20
default_lang_commit: 3d737b777f7bfa070f7f14835570add916d4dcb0
---

このページでは、OpenTelemetry で Python ログを自動計装する方法を説明します。

トレースやメトリクスとは異なり、同等のLogs APIはありません。
あるのはSDKだけです。
Python の場合は、Python の `logger` ライブラリを使用し、OTel SDK がルートロガーに OTLP ハンドラーをアタッチし、Python ロガーを OTLP ロガーに変えます。
これを実現する1つの方法は、[OpenTelemetry Python リポジトリ][OpenTelemetry Python repository]のログの例で文書化されています。

これを実現するもう1つの方法は、Pythonがログの自動計装をサポートすることです。
以下の例は、[OpenTelemetry Python リポジトリ][OpenTelemetry Python repository]のログの例に基づいています。

> しかし、アプリケーション開発者がログを作成するために使用するものではないので、トレースおよびメトリクスAPIとは異なります。
> かわりに、このブリッジAPIを使用して、標準の言語固有のロギングライブラリでログアペンダーをセットアップします。
> 詳細については、[Logs API](/docs/specs/otel/logs/api/) を参照のこと。

まずexamplesディレクトリとexample Pythonファイルを作成します。

```sh
mkdir python-logs-example
cd python-logs-example
touch example.py
```

以下の内容を `example.py` に貼り付けます。

```python
import logging

from opentelemetry import trace

tracer = trace.get_tracer_provider().get_tracer(__name__)

# トレースコンテキストの相関
with tracer.start_as_current_span("foo"):
    # なにかする
    current_span = trace.get_current_span()
    current_span.add_event("This is a span event")
    logging.getLogger().error("This is a log message")
```

[otel-collector-config.yaml](https://github.com/open-telemetry/opentelemetry-python/blob/main/docs/examples/logs/otel-collector-config.yaml)のサンプルを開いてコピーし、`python-logs-example/otel-collector-config.yaml`に保存します。

## 準備 {#prepare}

以下の例を実行します。
その際、仮想環境を使用することを推奨します。
以下のコマンドを実行し、ログの自動計装の準備をします。

```sh
mkdir python_logs_example
virtualenv python_logs_example
source python_logs_example/bin/activate
```

## インストール {#install}

以下のコマンドは適切なパッケージをインストールします。
`opentelemetry-distro` パッケージは、独自のコードをカスタム計装するための `opentelemetry-sdk` や、プログラムを自動的に計装するためのいくつかのコマンドを提供する `opentelemetry-instrumentation` など、他のいくつかのパッケージに依存しています。

```sh
pip install opentelemetry-distro
pip install opentelemetry-exporter-otlp
```

この後の例では、計装結果をコンソールに送信します。
コレクターのような他の送信先にテレメトリーを送信するための [OpenTelemetry Distro](/docs/languages/python/distro) のインストールと設定については、ドキュメントを参照してください。

> **注**: `opentelemetry-instrument`による自動計装を使用するには、
> 環境変数またはコマンドラインで設定する必要があります。
> エージェントはテレメトリーパイプラインを作成するので、これらの手段以外では変更できません。
> テレメトリーパイプラインのカスタマイズが必要な場合は、エージェントを使用せず、 OpenTelemetry SDK と計装ライブラリをコードにインポートし、そこで設定する必要があります。
> また、OpenTelemetry API をインポートすることで > 自動計装を拡張することもできます。
> 詳細については、[API リファレンス][API reference] を参照してください。

## 実行 {#execute}

この節は、自動計装されたログを実行する手順を説明します。

新しいターミナルウィンドウを開き、コレクターを起動します。

```sh
docker run -it --rm -p 4317:4317 -p 4318:4318 \
  -v $(pwd)/otel-collector-config.yaml:/etc/otelcol-config.yml \
  --name otelcol \
  otel/opentelemetry-collector-contrib:0.76.1 \
  "--config=/etc/otelcol-config.yml"
```

別のターミナルを開き、Pythonプログラムを実行します。

```sh
source python_logs_example/bin/activate

export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
  --traces_exporter console,otlp \
  --metrics_exporter console,otlp \
  --logs_exporter console,otlp \
  --service_name python-logs-example \
  python $(pwd)/example.py
```

サンプル出力は次のとおりです。

```text
...
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope __main__
Span #0
    Trace ID       : 389d4ac130a390d3d99036f9cd1db75e
    Parent ID      :
    ID             : f318281c4654edc5
    Name           : foo
    Kind           : Internal
    Start time     : 2023-08-18 17:04:05.982564 +0000 UTC
    End time       : 2023-08-18 17:04:05.982667 +0000 UTC
    Status code    : Unset
    Status message :
Events:
SpanEvent #0
     -> Name: This is a span event
     -> Timestamp: 2023-08-18 17:04:05.982586 +0000 UTC

...

ScopeLogs #0
ScopeLogs SchemaURL:
InstrumentationScope opentelemetry.sdk._logs._internal
LogRecord #0
ObservedTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-08-18 17:04:05.982605056 +0000 UTC
SeverityText: ERROR
SeverityNumber: Error(17)
Body: Str(This is a log message)
Attributes:
     -> otelSpanID: Str(f318281c4654edc5)
     -> otelTraceID: Str(389d4ac130a390d3d99036f9cd1db75e)
     -> otelTraceSampled: Bool(true)
     -> otelServiceName: Str(python-logs-example)
Trace ID: 389d4ac130a390d3d99036f9cd1db75e
Span ID: f318281c4654edc5
...
```

Span イベントとログの両方が同じ SpanID（`f318281c4654edc5`）を持つことに注意してください。
ロギングSDKは、テレメトリーを相関させる能力を向上させるために、ログに記録されたイベントに現在のスパンのSpanIDを追加します。

[api reference]: https://opentelemetry-python.readthedocs.io/en/latest/index.html
[OpenTelemetry Python repository]: https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/logs
