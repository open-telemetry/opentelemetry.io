---
title: OpenTelemetryオペレーターを使用して自動計装を注入する
linkTitle: Operator
weight: 30
default_lang_commit: 3d737b777f7bfa070f7f14835570add916d4dcb0
---

KubernetesでPythonサービスを実行する場合、[OpenTelemetryオペレーター](https://github.com/open-telemetry/opentelemetry-operator)を活用することで、各サービスを直接修正することなく自動計装を注入できます。
[詳細はOpenTelemetryオペレーターによる自動計装のドキュメントを参照してください](/docs/platforms/kubernetes/operator/automatic/)

### Python 固有のトピック {#python-specific-topics}

#### バイナリwheel付きライブラリ {#libraries-with-binary-wheels}

私たちが計装を行ったり、計装ライブラリで必要とするPythonのパッケージの中には、バイナリコードが同梱されていることがあります。
たとえば、`grpcio` や `psutil` (`opentelemetry-instrumentation-system-metrics` で使われている) がそうです。

バイナリコードは、特定のCライブラリのバージョン（glibcまたはmusl）と特定のPythonのバージョンに関連付けられています。
[OpenTelemetryオペレーター](https://github.com/open-telemetry/opentelemetry-operator)は、glibc Cライブラリに基づいた単一のPythonバージョン用のイメージを提供します。
もしこれを使いたいのであれば、Python自動計装用のオペレーターDockerイメージを自分で構築する必要があるかもしれません。
you might need to build your own image operator Docker image for Python auto-instrumentation.

オペレーター v0.113.0以降、glibcとmuslベースの自動計装の両方を持つイメージをビルドし、[実行時に設定する](/docs/platforms/kubernetes/operator/automatic/#annotations-python-musl)ことが可能です。

#### Django アプリケーション {#django-applications}

Django のように独自の実行ファイルから実行されるアプリケーションでは、デプロイファイルに2つの環境変数を設定する必要があります。

- `PYTHONPATH` には Django アプリケーションのルートディレクトリへのパスを指定します（例: "/app"）。
- `DJANGO_SETTINGS_MODULE` に Django 設定モジュールの名前を指定します（例: "myapp.settings"）。
