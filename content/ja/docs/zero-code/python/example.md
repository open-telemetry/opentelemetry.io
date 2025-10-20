---
title: 自動計装の例
linkTitle: Example
weight: 20
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

このページでは、OpenTelemetry で Python 自動計装を使う方法を示します。
この例は [OpenTracing の例][OpenTracing example] に基づいています。
このページで使用されている [ソースファイル][source files] は `opentelemetry-python` リポジトリからダウンロードしたり閲覧できます。

この例では、3つの異なるスクリプトを使用しています。
それぞれの主な違いは、計装の方法です。

1. `server_manual.py`は _手動_ で計装されます。
2. `server_automatic.py` は _自動_ で計装されます。
3. `server_programmatic.py` は _プログラム_ で計装されます。

[_プログラムによる_ 計装](#execute-the-programmatically-instrumented-server)は、最小限の計装コードをアプリケーションに追加する必要のある計装の一種です。
いくつかの計装ライブラリだけが、プログラム的に使用されるとき、計装プロセスをより大きく制御する追加機能を提供します。

最初のスクリプトを自動計装エージェントなしで実行し、2番目のスクリプトをエージェントありで実行します。
どちらも同じ結果が得られるはずで、自動計装エージェントが手動計装とまったく同じことを行うことを示しています。

自動計装は、[計装ライブラリ][instrumentation]を通じて、実行時にメソッドやクラスを動的に書き換えるために、[モンキーパッチ][monkey-patching]を利用します。
これにより、OpenTelemetry をアプリケーションコードに統合するのに必要な作業量を減らせます。
以下に、手動、自動、プログラムで計装された Flask ルートの違いを示します。

## 手動計測サーバー {#manually-instrumented-server}

`server_manual.py`

```python
@app.route("/server_request")
def server_request():
    with tracer.start_as_current_span(
        "server_request",
        context=extract(request.headers),
        kind=trace.SpanKind.SERVER,
        attributes=collect_request_attributes(request.environ),
    ):
        print(request.args.get("param"))
        return "served"
```

## 自動計装サーバー {#automatically-instrumented-server}

`server_automatic.py`

```python
@app.route("/server_request")
def server_request():
    print(request.args.get("param"))
    return "served"
```

## プログラム計測サーバー {#programmatically-instrumented-server}

`server_programmatic.py`

```python
instrumentor = FlaskInstrumentor()

app = Flask(__name__)

instrumentor.instrument_app(app)
# instrumentor.instrument_app(app, excluded_urls="/server_request")
@app.route("/server_request")
def server_request():
    print(request.args.get("param"))
    return "served"
```

## 準備 {#prepare}

別の仮想環境で以下の例を実行します。
以下のコマンドを実行して、自動計装の準備をします。

```sh
mkdir auto_instrumentation
cd auto_instrumentation
python -m venv venv
source ./venv/bin/activate
```

## インストール {#install}

以下のコマンドを実行して、適切なパッケージをインストールしてください。
`opentelemetry-distro` パッケージは、カスタム計装用の `opentelemetry-sdk` や、プログラムを自動的に計装するためのいくつかのコマンドを提供する `opentelemetry-instrumentation` など、他のいくつかのパッケージに依存しています。

```sh
pip install opentelemetry-distro
pip install flask requests
```

`opentelemetry-bootstrap` コマンドを実行します。

```shell
opentelemetry-bootstrap -a install
```

この後の例では、計装結果をコンソールに送信します。
コレクターのような他の送信先にテレメトリーを送信するための [OpenTelemetry Distro](/docs/languages/python/distro) のインストールと設定については、こちらを参照してください。

> **注**: `opentelemetry-instrument` による自動計装を使用するには、
> 環境変数またはコマンドラインで設定する必要があります。
> エージェントはテレメトリーパイプラインを作成するので、
> これらの手段以外では変更できません。
> テレメトリーパイプラインのカスタマイズが必要な場合は、エージェントを使用せず、
> OpenTelemetry SDK と計装ライブラリをコードにインポートし、そこで設定する必要があります。
> また、OpenTelemetry API をインポートすることで自動計装を拡張することもできます。
> 詳細については、[API リファレンス][API reference] を参照してください。

## 実行 {#execute}

この節では、サーバーの計装を手動で行うプロセスと、自動的に計装されたサーバーを実行するプロセスについて説明します。

## 手動で計測したサーバーを実行する {#execute-the-manually-instrumented-server}

この例を構成するスクリプトをそれぞれ実行するために、2つの別々のコンソールでサーバーを実行します。

```sh
source ./venv/bin/activate
python server_manual.py
```

```sh
source ./venv/bin/activate
python client.py
```

`server_manual.py` を実行しているコンソールは計装によって生成されたスパンをJSONとして表示します。
スパンは以下の例のように表示されます。

```json
{
  "name": "server_request",
  "context": {
    "trace_id": "0xfa002aad260b5f7110db674a9ddfcd23",
    "span_id": "0x8b8bbaf3ca9c5131",
    "trace_state": "{}"
  },
  "kind": "SpanKind.SERVER",
  "parent_id": null,
  "start_time": "2020-04-30T17:28:57.886397Z",
  "end_time": "2020-04-30T17:28:57.886490Z",
  "status": {
    "status_code": "OK"
  },
  "attributes": {
    "http.method": "GET",
    "http.server_name": "127.0.0.1",
    "http.scheme": "http",
    "host.port": 8082,
    "http.host": "localhost:8082",
    "http.target": "/server_request?param=testing",
    "net.peer.ip": "127.0.0.1",
    "net.peer.port": 52872,
    "http.flavor": "1.1"
  },
  "events": [],
  "links": [],
  "resource": {
    "telemetry.sdk.language": "python",
    "telemetry.sdk.name": "opentelemetry",
    "telemetry.sdk.version": "0.16b1"
  }
}
```

## 自動計装サーバーの実行 {#execute-the-automatically-instrumented-server}

<kbd>Control+C</kbd> を押して `server_manual.py` の実行を停止し、かわりに以下のコマンドを実行します。

```sh
opentelemetry-instrument --traces_exporter console --metrics_exporter none --logs_exporter none python server_automatic.py
```

以前 `client.py` を実行したコンソールで、もう一度以下のコマンドを実行します。

```sh
python client.py
```

`server_automatic.py` を実行しているコンソールは計装によって生成されたスパンを JSON として表示します。
スパンは以下の例のように表示されます。

```json
{
  "name": "server_request",
  "context": {
    "trace_id": "0x9f528e0b76189f539d9c21b1a7a2fc24",
    "span_id": "0xd79760685cd4c269",
    "trace_state": "{}"
  },
  "kind": "SpanKind.SERVER",
  "parent_id": "0xb4fb7eee22ef78e4",
  "start_time": "2020-04-30T17:10:02.400604Z",
  "end_time": "2020-04-30T17:10:02.401858Z",
  "status": {
    "status_code": "OK"
  },
  "attributes": {
    "http.method": "GET",
    "http.server_name": "127.0.0.1",
    "http.scheme": "http",
    "host.port": 8082,
    "http.host": "localhost:8082",
    "http.target": "/server_request?param=testing",
    "net.peer.ip": "127.0.0.1",
    "net.peer.port": 48240,
    "http.flavor": "1.1",
    "http.route": "/server_request",
    "http.status_text": "OK",
    "http.status_code": 200
  },
  "events": [],
  "links": [],
  "resource": {
    "telemetry.sdk.language": "python",
    "telemetry.sdk.name": "opentelemetry",
    "telemetry.sdk.version": "0.16b1",
    "service.name": ""
  }
}
```

自動計装は手動計測とまったく同じことをするので、両方の出力が同じであることがわかります。

## プログラムで計装されたサーバーを実行する {#execute-the-programmatically-instrumented-server}

計装ライブラリ（`opentelemetry-instrumentation-flask` など）を単独で使うことも可能で、オプションをカスタマイズできるという利点があります。
しかし、これを選択することは、 `opentelemetry-instrument` を使ってアプリケーションを起動することによる自動計装を見送ることを意味します。

手動計装の場合と同じように、2つの別々のコンソールでサーバーを実行します。

```sh
source ./venv/bin/activate
python server_programmatic.py
```

```sh
source ./venv/bin/activate
python client.py
```

結果は、手動の計装を使った場合と同じになるはずです。

### プログラムによる計装機能の使用 {#using-programmatic-instrumentation-features}

計装ライブラリの中には、プログラムで計装を行う際に、より精密な制御を可能にする機能を備えているものがあり、Flask用の計装ライブラリもその1つです。

この例にはコメントアウトされた行があるので、次のように変更してください。

```python
# instrumentor.instrument_app(app)
instrumentor.instrument_app(app, excluded_urls="/server_request")
```

この例を再度実行すると、サーバー側には計装が表示されなくなります。
これは `instrument_app` に渡された `excluded_urls` オプションのためで、`server_request` 関数の URL が `excluded_urls` に渡された正規表現にマッチするため、効果的に計装が行われなくなります。

## デバッグ中の計装 {#instrumentation-while-debugging}

デバッグモードは、Flaskアプリで次のように有効にできます。

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True)
```

デバッグモードはリローダを有効にするため、計装を中断させることがあります。
デバッグモードが有効なときに計装を実行するには、 `use_reloader` オプションを `False` に設定します。

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True, use_reloader=False)
```

## 設定 {#configure}

自動計装は、環境変数から設定を読み込めます。

## HTTP リクエストとレスポンスヘッダーをキャプチャする {#capture-http-request-and-response-headers}

[セマンティック規約][semantic convention]にしたがって、定義済みのHTTPヘッダーをスパン属性として取り込めます。

どのHTTPヘッダーをキャプチャしたいかを定義するには、HTTPヘッダー名のカンマ区切りのリストを環境変数 `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST` と `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE` で指定します。

たとえば次のように行います。

```sh
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST="Accept-Encoding,User-Agent,Referer"
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE="Last-Modified,Content-Type"
opentelemetry-instrument --traces_exporter console --metrics_exporter none --logs_exporter none python app.py
```

これらの設定オプションは、以下のHTTP計装でサポートされています。

- Django
- Falcon
- FastAPI
- Pyramid
- Starlette
- Tornado
- WSGI

これらのヘッダーが利用可能であれば、それらはあなたのスパンに含まれます。

```json
{
  "attributes": {
    "http.request.header.user-agent": [
      "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)"
    ],
    "http.request.header.accept_encoding": ["gzip, deflate, br"],
    "http.response.header.last_modified": ["2022-04-20 17:07:13.075765"],
    "http.response.header.content_type": ["text/html; charset=utf-8"]
  }
}
```

[semantic convention]: /docs/specs/semconv/http/http-spans/
[api reference]: https://opentelemetry-python.readthedocs.io/en/latest/index.html
[instrumentation]: https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation
[monkey-patching]: https://stackoverflow.com/questions/5626193/what-is-monkey-patching
[opentracing example]: https://github.com/yurishkuro/opentracing-tutorial/tree/master/python
[source files]: https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/auto-instrumentation
