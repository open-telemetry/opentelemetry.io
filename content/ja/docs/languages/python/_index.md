---
title: Python
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/Python_SDK.svg"
  alt="Python"> Python における OpenTelemetry の言語固有の実装。
aliases: [/python, /python/metrics, /python/tracing]
weight: 22
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

{{% docs/languages/index-intro python /%}}

## バージョンサポート {#version-support}

OpenTelemetry-Python は Python 3.8 以上をサポートしています。

## インストール {#installation}

API と SDK パッケージは PyPI で利用可能で、pip 経由でインストールできます。

```sh
pip install opentelemetry-api
pip install opentelemetry-sdk
```

さらに、個別にインストールできるいくつかの拡張パッケージがあります。

```sh
pip install opentelemetry-exporter-{exporter}
pip install opentelemetry-instrumentation-{instrumentation}
```

これらはそれぞれエクスポーターと計装ライブラリ用です。
Jaeger、Zipkin、Prometheus、OTLP、OpenCensus エクスポーターは、リポジトリの[exporter](https://github.com/open-telemetry/opentelemetry-python/blob/main/exporter/)ディレクトリにあります。
計装と追加のエクスポーターは、contrib リポジトリの[instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation)と[exporter](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/exporter)ディレクトリで見つけることができます。

## 拡張機能 {#extensions}

エクスポーター、計装ライブラリ、トレーサー実装などの関連プロジェクトを見つけるには、[レジストリ](/ecosystem/registry/?s=python)を参照してください。

### 最新パッケージのインストール {#installing-cutting-edge-packages}

PyPI にまだリリースされていない機能がいくつかあります。
そのような状況では、リポジトリから直接パッケージをインストールすることができます。
これは、リポジトリをクローンして[編集可能インストール](https://pip.pypa.io/en/stable/reference/pip_install/#editable-installs)を行うことで実行できます。

```sh
git clone https://github.com/open-telemetry/opentelemetry-python.git
cd opentelemetry-python
pip install -e ./opentelemetry-api -e ./opentelemetry-sdk -e ./opentelemetry-semantic-conventions
```

## リポジトリとベンチマーク {#repositories-and-benchmarks}

- メインリポジトリ: [opentelemetry-python][]
- Contrib リポジトリ: [opentelemetry-python-contrib][]

[opentelemetry-python]: https://github.com/open-telemetry/opentelemetry-python
[opentelemetry-python-contrib]: https://github.com/open-telemetry/opentelemetry-python-contrib
