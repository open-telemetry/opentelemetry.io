---
title: Pythonの自動計装に関する問題のトラブルシューティング
linkTitle: Troubleshooting
weight: 40
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
cSpell:ignore: ASGI gunicorn uvicorn
---

## インストールに関する問題 {#installation-issues}

### Python パッケージのインストール失敗 {#python-package-installation-failure}

Pythonパッケージのインストールには `gcc` と `gcc-c++` が必要で、CentOSのようなスリムバージョンのLinuxを使用している場合はインストールする必要があるかもしれません。

<!-- markdownlint-disable blanks-around-fences -->

{{< tabpane text=true >}} {{% tab "CentOS" %}}

```sh
yum -y install python3-devel
yum -y install gcc-c++
```

{{% /tab %}} {{% tab "Debian/Ubuntu" %}}

```sh
apt install -y python3-dev
apt install -y build-essential
```

{{% /tab %}} {{% tab "Alpine" %}}

```sh
apk add python3-dev
apk add build-base
```

{{% /tab %}} {{< /tabpane >}}

### uv を使ったブートストラップ {#bootstrap-using-uv}

[uv](https://docs.astral.sh/uv/)パッケージマネージャを使用しているときに `opentelemetry-bootstrap -a install` を実行すると、依存関係の設定がエラーになったり、予期しない結果になったりすることがあります。

かわりに、OpenTelemetry 要件を動的に生成し、`uv` を使ってインストールできます。

まず、適切なパッケージをインストール（またはプロジェクトファイルに追加して `uv sync` を実行）します。

```sh
uv pip install opentelemetry-distro opentelemetry-exporter-otlp
```

これで、自動計装をインストールできます。

```sh
uv run opentelemetry-bootstrap -a requirements | uv pip install --requirement -
```

最後に、 `uv run` を使用してアプリケーションを起動します（[エージェントの設定](/docs/zero-code/python/#configuring-the-agent)を参照してください）。

```sh
uv run opentelemetry-instrument python myapp.py
```

`uv sync` を実行したり、既存のパッケージを更新したりするたびに、自動計装を再インストールする必要があることに注意してください。
そのため、ビルドパイプラインの一部としてインストールを行うことを推奨します。

## 計装の問題 {#instrumentation-issues}

### リローダによる Flask デバッグモードが計装を壊す {#flask-debug-mode-with-reloader-breaks-instrumentation}

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

### プリフォークサーバーの問題 {#pre-fork-server-issues}

複数のワーカーを持つGunicornのようなプリフォークサーバーは、次のように実行できます。

```sh
gunicorn myapp.main:app --workers 4
```

ただし、複数の `--workers` を指定すると、自動計装を適用した場合にメトリクスの生成が壊れる可能性があります。
これは、ワーカー/子プロセスの作成であるフォークが、バックグラウンドスレッドとOpenTelemetry SDKの主要なコンポーネントが想定しているロックとの間に、各子プロセス間で不整合を生じさせるためです。
具体的には、`PeriodicExportingMetricReader` は、データをエクスポーターに定期的にフラッシュするための独自のスレッドを生成します。
イシュー[#2767](https://github.com/open-telemetry/opentelemetry-python/issues/2767) および [#3307](https://github.com/open-telemetry/opentelemetry-python/issues/3307#issuecomment-1579101152) も参照してください。
フォーク後、各子プロセスは実際には実行されていないメモリ内のスレッドオブジェクトを探し、元のロックは各子プロセスでアンロックされない可能性があります。
[Python issue 6721](https://bugs.python.org/issue6721) で説明されているフォークとデッドロックも参照してください。

#### 回避策 {#workarounds}

OpenTelemetryでプリフォークサーバーを使用するためのいくつかの回避策があります。
次の表は、複数のワーカーでプリフォークされた、さまざまな自動計装Webサーバーゲートウェイスタックによるシグナルエクスポートの現在のサポートをまとめています。
詳細とオプションについては、以下を参照してください。

| 複数ワーカーのスタック   | トレース | メトリクス | ログ |
| ------------------------ | -------- | ---------- | ---- |
| Uvicorn                  | x        |            | x    |
| Gunicorn                 | x        |            | x    |
| Gunicorn + UvicornWorker | x        | x          | x    |

##### GunicornとUvicornWorkerでデプロイ {#deploy-with-gunicorn-and-uvicornworker}

複数のワーカーを持つサーバーを自動計装するには、非同期サーバーゲートウェイインターフェース（ASGI）アプリ（FastAPI、Starletteなど）の場合、`uvicorn.workers.UvicornWorker` を使ったGunicornによるデプロイが推奨されます。
UvicornWorkerクラスは、バックグラウンドプロセスとスレッドを保持しながらフォークを処理するように特別に設計されています。
例を挙げましょう。

```sh
opentelemetry-instrument gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  myapp.main:app
```

##### プログラム自動計装の使用 {#use-programmatic-auto-instrumentation}

`opentelemetry-instrument` のかわりに、サーバーフォーク後のワーカープロセス内で[プログラム自動計装](https://github.com/open-telemetry/opentelemetry-python-contrib/blob/main/opentelemetry-instrumentation/README.rst#programmatic-auto-instrumentation)を使用してOpenTelemetryを初期化します。
例を挙げましょう。

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize
initialize()

from your_app import app
```

FastAPIを使用している場合、計装がパッチされる方法により、`FastAPI` をインポートする前に `initialize()` を呼び出す必要があることに注意してください。
例を挙げましょう。

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize
initialize()

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

その後、次のコマンドでサーバーを実行します。

```sh
uvicorn main:app --workers 2
```

##### PrometheusでOTLPを直接使用 {#use-prometheus-with-direct-otlp}

OTLP メトリクスを直接受信するために、[Prometheus](/docs/languages/python/exporters/#prometheus-setup) の最新バージョンの使用を検討してください。
`PeriodicExportingMetricReader` とプロセスごとに1つのOTLPワーカーを設定して、Prometheusサーバーにプッシュします。
フォークでの `PrometheusMetricReader` の使用は推奨しません。
イシュー[#3747](https://github.com/open-telemetry/opentelemetry-python/issues/3747) を参照してください。

##### 単一ワーカーの使用 {#use-a-single-worker}

または、ゼロコード計装でプリフォークで単一ワーカーを使用します。

```sh
opentelemetry-instrument gunicorn your_app:app --workers 1
```

## 接続性の問題 {#connectivity-issues}

### gRPCコネクティビティ {#grpc-connectivity}

Python gRPC接続の問題をデバッグするには、以下のgRPCデバッグ環境変数を設定します。

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python YOUR_APP.py
```
