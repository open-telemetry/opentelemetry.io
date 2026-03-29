---
title: Getting Started
description: 5分以内にアプリのテレメトリーを取得しましょう！
weight: 10
default_lang_commit: 7a39e1b95f51cf97fe203ef98a1011d3be33d77e
# prettier-ignore
cSpell:ignore: debugexporter diceroller distro maxlen randint rolldice rollspan venv
---

このページでは、PythonでOpenTelemetryを始める方法を説明します。

シンプルなアプリケーションを自動的に計装する方法を学び、[トレース][traces]、[メトリクス][metrics]、および[ログ][logs]がコンソールに出力されるようにします。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- [Python 3](https://www.python.org/)

> [!NOTE]
>
> Windowsでは、Pythonは通常`python3`ではなく`python`として呼び出されます。
> 以下の例では、それぞれのオペレーティングシステムに合ったコマンドを示します。

## サンプルアプリケーション {#example-application}

次の例では、基本的な[Flask](https://flask.palletsprojects.com/)アプリケーションを使用します。
Flaskを使用しない場合でも問題ありません。
DjangoやFastAPIなどの他のWebフレームワークでもOpenTelemetry Pythonを使用できます。
サポートされているフレームワークのライブラリの完全なリストについては、[レジストリ](/ecosystem/registry/?component=instrumentation&language=python)を参照してください。

より詳細な例については、[例](/docs/languages/python/examples/)を参照してください。

## インストール {#installation}

はじめに、新しいディレクトリで環境をセットアップします。

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
mkdir otel-getting-started
cd otel-getting-started
python3 -m venv venv
source ./venv/bin/activate
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
mkdir otel-getting-started
cd otel-getting-started
python -m venv venv
.\venv\Scripts\Activate.ps1
```

{{% /tab %}} {{< /tabpane >}}

次に、Flaskをインストールします。

```shell
pip install flask
```

### HTTPサーバーの作成と起動 {#create-and-launch-an-http-server}

`app.py`というファイルを作成し、次のコードを追加します。

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

次のコマンドでアプリケーションを実行し、Webブラウザで<http://localhost:8080/rolldice>を開いて動作していることを確認します。

```sh
flask run -p 8080
```

## 計装 {#instrumentation}

ゼロコード計装が代わりにテレメトリーデータを生成します。
利用可能なオプションはいくつかあり、[ゼロコード計装](/docs/zero-code/python/)で詳しく説明しています。
ここでは`opentelemetry-instrument`エージェントを使用します。

OpenTelemetry API、SDK、および以下で使用する`opentelemetry-bootstrap`と`opentelemetry-instrument`ツールが含まれる`opentelemetry-distro`パッケージをインストールします。

```shell
pip install opentelemetry-distro
```

`opentelemetry-bootstrap`コマンドを実行します。

```shell
opentelemetry-bootstrap -a install
```

これにより、Flask計装がインストールされます。

## 計装済みアプリの実行 {#run-the-instrumented-app}

`opentelemetry-instrument`を使用して計装済みアプリを実行し、コンソールに出力します。

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument `
    --traces_exporter console `
    --metrics_exporter console `
    --logs_exporter console `
    --service_name dice-server `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

Webブラウザで<http://localhost:8080/rolldice>を開き、ページを数回リロードします。
しばらくすると、コンソールに次のようなスパンが出力されます。

<details>
<summary>出力例を表示</summary>

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

生成されたスパンは`/rolldice`ルートへのリクエストのライフタイムを追跡します。

リクエスト中に出力されたログ行は同じトレースIDとスパンIDを持ち、ログエクスポーター経由でコンソールに出力されます。

エンドポイントにさらに数回リクエストを送信した後、しばらく待つかアプリを終了すると、コンソールに次のようなメトリクスが出力されます。

<details>
<summary>出力例を表示</summary>

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

## 自動計装への手動計装の追加 {#add-manual-instrumentation-to-automatic-instrumentation}

自動計装はシステムの境界（インバウンドおよびアウトバウンドのHTTPリクエストなど）でテレメトリーをキャプチャしますが、アプリケーション内部の動作はキャプチャしません。
そのためには[手動計装](../instrumentation/)を記述する必要があります。
以下に、手動計装を自動計装と簡単に連携させる方法を示します。

### トレース {#traces}

まず、トレーサーを初期化し、自動生成されたスパンの子スパンを作成するコードを`app.py`に追加します。

```python
from random import randint
from flask import Flask

from opentelemetry import trace

# トレーサーを取得する
tracer = trace.get_tracer("diceroller.tracer")

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(roll())

def roll():
    # 現在のスパンの子スパンを作成する
    with tracer.start_as_current_span("roll") as rollspan:
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        return res
```

アプリを再度実行します。

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument `
    --traces_exporter console `
    --metrics_exporter console `
    --logs_exporter console `
    --service_name dice-server `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

サーバーにリクエストを送信すると、コンソールに2つのスパンが出力され、`roll`という名前のスパンの親スパンが自動生成されたものであることがわかります。

<details>
<summary>出力例を表示</summary>

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

`roll`の`parent_id`が`/rolldice`の`span_id`と同じであることから、親子関係が確認できます。

### メトリクス {#metrics}

次に、メーターを初期化し、各ロール値のロール回数をカウントするカウンターを作成するコードを`app.py`に追加します。

```python
# 必要なインポート宣言
from opentelemetry import trace
from opentelemetry import metrics

from random import randint
from flask import Flask, request
import logging

# トレーサーを取得する
tracer = trace.get_tracer("diceroller.tracer")
# メーターを取得する
meter = metrics.get_meter("diceroller.meter")

# カウンターを作成して計測に使用する
roll_counter = meter.create_counter(
    "dice.rolls",
    description="The number of rolls by roll value",
)

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/rolldice")
def roll_dice():
    # 現在のスパンの子スパンを作成する
    with tracer.start_as_current_span("roll") as roll_span:
        player = request.args.get('player', default = None, type = str)
        result = str(roll())
        roll_span.set_attribute("roll.value", result)
        # 該当するロール値のカウンターに1を加算する
        roll_counter.add(1, {"roll.value": result})
        if player:
            logger.warn("%s is rolling the dice: %s", player, result)
        else:
            logger.warn("Anonymous player is rolling the dice: %s", result)
        return result

def roll():
    return randint(1, 6)
```

アプリを再度実行します。

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument `
    --traces_exporter console `
    --metrics_exporter console `
    --logs_exporter console `
    --service_name dice-server `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

サーバーにリクエストを送信すると、各ロール値ごとのカウントとともに、ロールカウンターのメトリクスがコンソールに出力されます。

<details>
<summary>出力例を表示</summary>

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

## OpenTelemetry Collectorへのテレメトリー送信 {#send-telemetry-to-an-opentelemetry-collector}

[OpenTelemetry Collector](/docs/collector/)は、ほとんどの本番環境デプロイメントにおける重要なコンポーネントです。
コレクターの使用が有益な例としては、以下のものがあります。

- 複数のサービスで共有される単一のテレメトリーシンク（エクスポーターの切り替えオーバーヘッドを削減）
- 複数のホストで実行される複数のサービスにわたるトレースの集約
- バックエンドにエクスポートする前にトレースを処理する一元的な場所

単一のサービスのみを使用している場合や実験中の場合を除き、本番環境デプロイメントではコレクターを使用することをお勧めします。

### ローカルコレクターの設定と実行 {#configure-and-run-a-local-collector}

まず、次のコレクター設定をファイルに保存します。
Linux/macOSの場合は`/tmp/otel-collector-config.yaml`に、Windowsの場合は`$env:TEMP\otel-collector-config.yaml`に保存します。

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  # NOTE: v0.86.0以前は`debug`の代わりに`logging`を使用してください。
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

次に、この設定をもとにコレクターを取得して実行するDockerコマンドを実行します。

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
docker run -p 4317:4317 `
    -v "${env:TEMP}\otel-collector-config.yaml:/etc/otel-collector-config.yaml" `
    otel/opentelemetry-collector:latest `
    --config=/etc/otel-collector-config.yaml
```

{{% /tab %}} {{< /tabpane >}}

これでコレクターのインスタンスがローカルで実行され、ポート4317でリッスンしています。

### OTLPでスパンとメトリクスを送信するようコマンドを変更 {#modify-the-command-to-export-spans-and-metrics-via-otlp}

次に、コンソールではなくOTLP経由でスパンとメトリクスをコレクターに送信するようにコマンドを変更します。

OTLPエクスポーターパッケージをインストールします。

```shell
pip install opentelemetry-exporter-otlp
```

`opentelemetry-instrument`エージェントは、インストールしたパッケージを検出し、次回の実行時にデフォルトでOTLPエクスポートを使用します。

### アプリケーションの実行 {#run-the-application}

前と同様にアプリケーションを実行しますが、コンソールへのエクスポートは行いません。

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument --logs_exporter otlp flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument --logs_exporter otlp flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

デフォルトでは、`opentelemetry-instrument`はOTLP/gRPC経由でトレースとメトリクスをエクスポートし、コレクターがリッスンしている`localhost:4317`に送信します。

`/rolldice`ルートにアクセスすると、Flaskプロセスではなくコレクタープロセスに次のような出力が表示されます。

<details>
<summary>出力例を表示</summary>

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

Pythonの自動計装にはいくつかのオプションがあります。
それらとその設定方法については、[ゼロコード計装](/docs/zero-code/python/)を参照してください。

手動計装では、子スパンの作成以外にも多くのことができます。
OpenTelemetry APIの初期化方法やその他多くの機能については、[手動計装](../instrumentation/)を参照してください。

OpenTelemetryでテレメトリーデータをエクスポートするオプションはいくつかあります。
お好みのバックエンドへのデータエクスポート方法については、[エクスポーター](../exporters/)を参照してください。

より複雑な例を参照したい場合は、Pythonベースの[推奨サービス](/docs/demo/services/recommendation/)と[ロードジェネレーター](/docs/demo/services/load-generator/)を含む[OpenTelemetryデモ](/docs/demo/)をご覧ください。

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
