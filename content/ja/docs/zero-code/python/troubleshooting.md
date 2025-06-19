---
title: Pythonの自動計装に関する問題のトラブルシューティング
linkTitle: Troubleshooting
weight: 40
default_lang_commit: 3d737b777f7bfa070f7f14835570add916d4dcb0
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

The debug mode can break instrumentation from happening because it enables a reloader. To run instrumentation while the debug mode is enabled, set the `use_reloader` option to `False`:

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True, use_reloader=False)
```

## 接続性の問題 {#connectivity-issues}

### gRPCコネクティビティ {#grpc-connectivity}

Python gRPC接続の問題をデバッグするには、以下のgRPCデバッグ環境変数を設定します。

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python YOUR_APP.py
```
