---
title: はじめに
description: 5分以内にアプリのテレメトリを取得しましょう！
weight: 10
default_lang_commit: e04e8da1f4527d65c162af9a670eb3be8e7e7fb9
# prettier-ignore
cSpell:ignore: debugexporter diceroller distro maxlen randint rolldice rollspan venv
---

このページでは、Python で OpenTelemetry を始める方法を説明します。

簡単なアプリケーションを自動的に計装し、[トレース][traces]、[メトリクス][metrics]、[ログ][logs]がコンソールに出力される方法を学習します。

## 前提条件 {#prerequisites}

次のものがローカルにインストールされていることを確認してください。

- [Python 3](https://www.python.org/)

## サンプルアプリケーション {#example-application}

次の例では、基本的な [Flask](https://flask.palletsprojects.com/) アプリケーションを使用します。
Flask を使用していない場合でも大丈夫です。
OpenTelemetry Python は、Django や FastAPI などの他の Web フレームワークでも使用できます。
サポートされているフレームワークのライブラリの完全なリストについては、[レジストリ](/ecosystem/registry/?component=instrumentation&language=python)を参照してください。

より詳細な例については、[例](/docs/languages/python/examples/) を参照してください。

## インストール {#installation}

開始するには、新しいディレクトリで環境を設定します。

```shell
mkdir otel-getting-started
cd otel-getting-started
python3 -m venv venv
source ./venv/bin/activate
```

次に Flask をインストールします。

```shell
pip install flask
```

### HTTP サーバーの作成と起動 {#create-and-launch-an-http-server}

`app.py` ファイルを作成し、次のコードを追加します。

```python
from random import randint
from flask import Flask, request
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route("/rolldice")
def roll_dice():
    player = request.args.get('player', default=None, type=str)
    result = str(roll())
    if player:
        logger.warning("%s is rolling the dice: %s", player, result)
    else:
        logger.warning("Anonymous player is rolling the dice: %s", result)
    return result


def roll():
    return randint(1, 6)
```

次のコマンドでアプリケーションを実行し、Web ブラウザで <http://localhost:8080/rolldice> を開いて動作を確認します。

```sh
flask run -p 8080
```

## 計装 {#instrumentation}

ゼロコード計装は、ユーザーに代わってテレメトリーデータを生成します。
いくつかのオプションがあり、詳細については[ゼロコード計装](/docs/zero-code/python/) で説明されています。
ここでは `opentelemetry-instrument` エージェントを使用します。

OpenTelemetry API、SDK、および以下で使用する `opentelemetry-bootstrap` と `opentelemetry-instrument` ツールを含む `opentelemetry-distro` パッケージをインストールします。

```shell
pip install opentelemetry-distro
```

`opentelemetry-bootstrap` コマンドを実行します。

```shell
opentelemetry-bootstrap -a install
```

これにより Flask 計装がインストールされます。

## 計装されたアプリの実行 {#run-the-instrumented-app}

`opentelemetry-instrument` で計装されたアプリを実行し、現在はコンソールに出力させることができます。

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

Web ブラウザで <http://localhost:8080/rolldice> を開き、ページを数回再読み込みします。
しばらくすると、次のようなスパンがコンソールに出力されます。

<details>
<summary>サンプル出力を表示</summary>

```json
{
    "name": "/rolldice",
    "context": {
        "trace_id": "0xdb1fc322141e64eb84f5bd8a8b1c6d1f",
        "span_id": "0x5c2b0f851030d17d",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2023-10-10T08:14:32.630332Z",
    "end_time": "2023-10-10T08:14:32.631523Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.port": 8080,
        "http.host": "localhost:8080",
        "http.target": "/rolldice?rolls=12",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/8.1.2",
        "net.peer.port": 58419,
        "http.flavor": "1.1",
        "http.route": "/rolldice",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
{
    "body": "Anonymous player is rolling the dice: 3",
    "severity_number": "<SeverityNumber.WARN: 13>",
    "severity_text": "WARNING",
    "attributes": {
        "otelSpanID": "5c2b0f851030d17d",
        "otelTraceID": "db1fc322141e64eb84f5bd8a8b1c6d1f",
        "otelServiceName": "dice-server"
    },
    "timestamp": "2023-10-10T08:14:32.631195Z",
    "trace_id": "0xdb1fc322141e64eb84f5bd8a8b1c6d1f",
    "span_id": "0x5c2b0f851030d17d",
    "trace_flags": 1,
    "resource": "BoundedAttributes({'telemetry.sdk.language': 'python', 'telemetry.sdk.name': 'opentelemetry', 'telemetry.sdk.version': '1.17.0', 'service.name': 'dice-server', 'telemetry.auto.version': '0.38b0'}, maxlen=None)"
}
```

</details>

生成されたスパンは `/rolldice` ルートへのリクエストのライフタイムを追跡します。

リクエスト中に出力されたログ行には同じトレース ID とスパン ID が含まれ、ログエクスポーターを介してコンソールにエクスポートされます。

エンドポイントにさらにいくつかのリクエストを送信し、少し待つかアプリを終了すると、次のようなメトリクスがコンソール出力に表示されます。

<details>
<summary>サンプル出力を表示</summary>

```json
{
  "resource_metrics": [
    {
      "resource": {
        "attributes": {
          "service.name": "unknown_service",
          "telemetry.auto.version": "0.34b0",
          "telemetry.sdk.language": "python",
          "telemetry.sdk.name": "opentelemetry",
          "telemetry.sdk.version": "1.13.0"
        },
        "schema_url": ""
      },
      "schema_url": "",
      "scope_metrics": [
        {
          "metrics": [
            {
              "data": {
                "aggregation_temporality": 2,
                "data_points": [
                  {
                    "attributes": {
                      "http.flavor": "1.1",
                      "http.host": "localhost:5000",
                      "http.method": "GET",
                      "http.scheme": "http",
                      "http.server_name": "127.0.0.1"
                    },
                    "start_time_unix_nano": 1666077040061693305,
                    "time_unix_nano": 1666077098181107419,
                    "value": 0
                  }
                ],
                "is_monotonic": false
              },
              "description": "measures the number of concurrent HTTP requests that are currently in-flight",
              "name": "http.server.active_requests",
              "unit": "requests"
            },
            {
              "data": {
                "aggregation_temporality": 2,
                "data_points": [
                  {
                    "attributes": {
                      "http.flavor": "1.1",
                      "http.host": "localhost:5000",
                      "http.method": "GET",
                      "http.scheme": "http",
                      "http.server_name": "127.0.0.1",
                      "http.status_code": 200,
                      "net.host.port": 5000
                    },
                    "bucket_counts": [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    "count": 1,
                    "explicit_bounds": [
                      0, 5, 10, 25, 50, 75, 100, 250, 500, 1000
                    ],
                    "max": 1,
                    "min": 1,
                    "start_time_unix_nano": 1666077040063027610,
                    "sum": 1,
                    "time_unix_nano": 1666077098181107419
                  }
                ]
              },
              "description": "measures the duration of the inbound HTTP request",
              "name": "http.server.duration",
              "unit": "ms"
            }
          ],
          "schema_url": "",
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "schema_url": "",
            "version": "0.34b0"
          }
        }
      ]
    }
  ]
}
```

</details>

## 自動計装に手動計装を追加する {#add-manual-instrumentation-to-automatic-instrumentation}

自動計装は、インバウンド・アウトバンド HTTP リクエストなど、システムの境界でテレメトリーを取得しますが、アプリケーション内で何が起こっているかは取得しません。
そのためには、[手動計装](../instrumentation/) を記述する必要があります。
以下では、手動計装を自動計装と簡単にリンクする方法を説明します。

### トレース {#traces}

まず、`app.py` を変更して、トレーサーを初期化し、それを使用して自動的に生成されるトレースの子となるトレースを作成するコードを含めます。

```python
from random import randint
from flask import Flask

from opentelemetry import trace

# トレーサーを取得
tracer = trace.get_tracer("diceroller.tracer")

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(roll())

def roll():
    # これは現在のスパンの子である新しいスパンを作成します
    with tracer.start_as_current_span("roll") as rollspan:
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        return res
```

アプリを再度実行します。

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

サーバーにリクエストを送信すると、コンソールに出力されるトレースに 2 つのスパンが表示され、`roll` と呼ばれるスパンは、自動的に作成されたスパンを親として登録します。

<details>
<summary>サンプル出力を表示</summary>

```json
{
    "name": "roll",
    "context": {
        "trace_id": "0x6f781c83394ed2f33120370a11fced47",
        "span_id": "0x623321c35b8fa837",
        "trace_state": "[]"
    },
    "kind": "SpanKind.INTERNAL",
    "parent_id": "0x09abe52faf1d80d5",
    "start_time": "2023-10-10T08:18:28.679261Z",
    "end_time": "2023-10-10T08:18:28.679560Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "roll.value": "6"
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
{
    "name": "/rolldice",
    "context": {
        "trace_id": "0x6f781c83394ed2f33120370a11fced47",
        "span_id": "0x09abe52faf1d80d5",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2023-10-10T08:18:28.678348Z",
    "end_time": "2023-10-10T08:18:28.679677Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.port": 8080,
        "http.host": "localhost:8080",
        "http.target": "/rolldice?rolls=12",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/8.1.2",
        "net.peer.port": 58485,
        "http.flavor": "1.1",
        "http.route": "/rolldice",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
```

</details>

`roll` の `parent_id` は `/rolldice` の `span_id` と同じで、親子関係を示しています！

### メトリクス {#metrics}

次に、`app.py` を変更して、メーターを初期化し、それを使用して各可能なロール値のロール数をカウントするカウンター計装を作成するコードを含めます。

```python
# これらは必要なインポート宣言です
from opentelemetry import trace
from opentelemetry import metrics

from random import randint
from flask import Flask, request
import logging

# トレーサーを取得
tracer = trace.get_tracer("diceroller.tracer")
# メーターを取得
meter = metrics.get_meter("diceroller.meter")

# 測定に使用するカウンターインストルメントを作成
roll_counter = meter.create_counter(
    "dice.rolls",
    description="The number of rolls by roll value",
)

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/rolldice")
def roll_dice():
    # これは現在のスパンの子である新しいスパンを作成します
    with tracer.start_as_current_span("roll") as roll_span:
        player = request.args.get('player', default = None, type = str)
        result = str(roll())
        roll_span.set_attribute("roll.value", result)
        # これは、指定されたロール値のカウンターに 1 を追加します
        roll_counter.add(1, {"roll.value": result})
        if player:
            logger.warn("{} is rolling the dice: {}", player, result)
        else:
            logger.warn("Anonymous player is rolling the dice: %s", result)
        return result

def roll():
    return randint(1, 6)
```

アプリを再度実行します。

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

サーバーにリクエストを送信すると、ロールカウンターメトリクスがコンソールに出力され、
各ロール値に対して個別のカウントが表示されます。

<details>
<summary>サンプル出力を表示</summary>

```json
{
  "resource_metrics": [
    {
      "resource": {
        "attributes": {
          "telemetry.sdk.language": "python",
          "telemetry.sdk.name": "opentelemetry",
          "telemetry.sdk.version": "1.17.0",
          "service.name": "dice-server",
          "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
      },
      "scope_metrics": [
        {
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "version": "0.38b0",
            "schema_url": ""
          },
          "metrics": [
            {
              "name": "http.server.active_requests",
              "description": "measures the number of concurrent HTTP requests that are currently in-flight",
              "unit": "requests",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.host": "localhost:8080",
                      "http.scheme": "http",
                      "http.flavor": "1.1",
                      "http.server_name": "127.0.0.1"
                    },
                    "start_time_unix_nano": 1696926005694857000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 0
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": false
              }
            },
            {
              "name": "http.server.duration",
              "description": "measures the duration of the inbound HTTP request",
              "unit": "ms",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.host": "localhost:8080",
                      "http.scheme": "http",
                      "http.flavor": "1.1",
                      "http.server_name": "127.0.0.1",
                      "net.host.port": 8080,
                      "http.status_code": 200
                    },
                    "start_time_unix_nano": 1696926005695798000,
                    "time_unix_nano": 1696926063549782000,
                    "count": 7,
                    "sum": 6,
                    "bucket_counts": [
                      1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    ],
                    "explicit_bounds": [
                      0.0, 5.0, 10.0, 25.0, 50.0, 75.0, 100.0, 250.0, 500.0,
                      750.0, 1000.0, 2500.0, 5000.0, 7500.0, 10000.0
                    ],
                    "min": 0,
                    "max": 1
                  }
                ],
                "aggregation_temporality": 2
              }
            }
          ],
          "schema_url": ""
        },
        {
          "scope": {
            "name": "diceroller.meter",
            "version": "",
            "schema_url": ""
          },
          "metrics": [
            {
              "name": "dice.rolls",
              "description": "The number of rolls by roll value",
              "unit": "",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "roll.value": "5"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 3
                  },
                  {
                    "attributes": {
                      "roll.value": "6"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "1"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "3"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "4"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": true
              }
            }
          ],
          "schema_url": ""
        }
      ],
      "schema_url": ""
    }
  ]
}
```

</details>

## OpenTelemetry Collector へのテレメトリー送信 {#send-telemetry-to-an-opentelemetry-collector}

[OpenTelemetry Collector](/docs/collector/) は、ほとんどの本番デプロイメントの重要なコンポーネントです。
Collector を使用することが有益な場合の例をいくつか示します。

- 複数のサービスで共有される単一のテレメトリーシンク（エクスポーターの切り替えのオーバーヘッドを削減）
- 複数のホストで実行される複数のサービス間でのトレースの集約
- バックエンドにエクスポートする前にトレースを処理する中央の場所

単一のサービスがあるだけの場合や実験している場合を除き、本番デプロイメントでは Collector を使用したいでしょう。

### ローカル Collector の設定と実行 {#configure-and-run-a-local-collector}

まず、次の Collector 設定コードを `/tmp/` ディレクトリのファイルに保存します。

```yaml
# /tmp/otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  # 注意: v0.86.0 より前では `debug` の代わりに `logging` を使用してください。
  debug:
    verbosity: detailed
processors:
  batch:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
      processors: [batch]
    metrics:
      receivers: [otlp]
      exporters: [debug]
      processors: [batch]
    logs:
      receivers: [otlp]
      exporters: [debug]
      processors: [batch]
```

次に、docker コマンドを実行して、この設定に基づいて Collector を取得して実行します。

```shell
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

これで、ポート 4317 でリッスンする Collector インスタンスがローカルで実行されます。

### OTLP 経由でスパンとメトリクスをエクスポートするためのコマンドの変更 {#modify-the-command-to-export-spans-and-metrics-via-otlp}

次のステップは、コンソールのかわりに OTLP 経由で Collector にスパンとメトリクスを送信するようにコマンドを変更することです。

これを行うには、OTLP エクスポーターパッケージをインストールします。

```shell
pip install opentelemetry-exporter-otlp
```

`opentelemetry-instrument` エージェントは、インストールしたパッケージを検出し、次回実行時にデフォルトで OTLP エクスポートを行います。

### アプリケーションの実行 {#run-the-application}

以前と同様にアプリケーションを実行しますが、コンソールにはエクスポートしません。

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument --logs_exporter otlp flask run -p 8080
```

デフォルトでは、`opentelemetry-instrument` は OTLP/gRPC でトレースとメトリクスをエクスポートし、Collector がリッスンしている `localhost:4317` に送信します。

`/rolldice` ルートにアクセスすると、flask プロセスではなく Collector プロセスで出力が表示され、次のようになります。

<details>
<summary>サンプル出力を表示</summary>

```text
2022-06-09T20:43:39.915Z        DEBUG   debugexporter/debug_exporter.go:51  ResourceSpans #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.12.0rc1)
     -> telemetry.auto.version: STRING(0.31b0)
     -> service.name: STRING(unknown_service)
InstrumentationLibrarySpans #0
InstrumentationLibrary app
Span #0
    Trace ID       : 7d4047189ac3d5f96d590f974bbec20a
    Parent ID      : 0b21630539446c31
    ID             : 4d18cee9463a79ba
    Name           : roll
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2022-06-09 20:43:37.390134089 +0000 UTC
    End time       : 2022-06-09 20:43:37.390327687 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> roll.value: INT(5)
InstrumentationLibrarySpans #1
InstrumentationLibrary opentelemetry.instrumentation.flask 0.31b0
Span #0
    Trace ID       : 7d4047189ac3d5f96d590f974bbec20a
    Parent ID      :
    ID             : 0b21630539446c31
    Name           : /rolldice
    Kind           : SPAN_KIND_SERVER
    Start time     : 2022-06-09 20:43:37.388733595 +0000 UTC
    End time       : 2022-06-09 20:43:37.390723792 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> http.method: STRING(GET)
     -> http.server_name: STRING(127.0.0.1)
     -> http.scheme: STRING(http)
     -> net.host.port: INT(5000)
     -> http.host: STRING(localhost:5000)
     -> http.target: STRING(/rolldice)
     -> net.peer.ip: STRING(127.0.0.1)
     -> http.user_agent: STRING(curl/7.82.0)
     -> net.peer.port: INT(53878)
     -> http.flavor: STRING(1.1)
     -> http.route: STRING(/rolldice)
     -> http.status_code: INT(200)

2022-06-09T20:43:40.025Z        INFO    debugexporter/debug_exporter.go:56  MetricsExporter {"#metrics": 1}
2022-06-09T20:43:40.025Z        DEBUG   debugexporter/debug_exporter.go:66  ResourceMetrics #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.12.0rc1)
     -> telemetry.auto.version: STRING(0.31b0)
     -> service.name: STRING(unknown_service)
InstrumentationLibraryMetrics #0
InstrumentationLibrary app
Metric #0
Descriptor:
     -> Name: roll_counter
     -> Description: The number of rolls by roll value
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: AGGREGATION_TEMPORALITY_CUMULATIVE
NumberDataPoints #0
Data point attributes:
     -> roll.value: INT(5)
StartTimestamp: 2022-06-09 20:43:37.390226915 +0000 UTC
Timestamp: 2022-06-09 20:43:39.848587966 +0000 UTC
Value: 1
```

</details>

## 次のステップ {#next-steps}

自動計装と Python には、いくつかのオプションがあります。
それらとその設定方法については、[ゼロコード計装](/docs/zero-code/python/)を参照してください。

手動計装には、子スパンを作成する以外にもたくさんのことがあります。
手動計装の初期化の詳細と、使用できる OpenTelemetry API の多くの部分については、[手動計装](../instrumentation/) を参照してください。

OpenTelemetry でテレメトリーデータをエクスポートするためのオプションはいくつかあります。
希望するバックエンドにデータをエクスポートする方法については、[エクスポーター](../exporters/) を参照してください。

より複雑な例を調べたい場合は、Python ベースの[推奨サービス](/docs/demo/services/recommendation/) と[負荷ジェネレーター](/docs/demo/services/load-generator/) を含む[OpenTelemetry デモ](/docs/demo/) をご覧ください。

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
