---
title: Python
description: >-
  <img width="35" class="img-initial otel-icon"
  src="/img/logos/32x32/Python_SDK.svg" alt="Python"> PythonにおけるOpenTelemetryの言語固有の実装。
aliases: [/python, /python/metrics, /python/tracing]
weight: 190
default_lang_commit: d8f5ed285d009cc6baac6d7141bfde8d0956a756
---

{{% docs/languages/index-intro python /%}}

## バージョンサポート {#version-support}

OpenTelemetry-PythonはPython 3.9以上をサポートしています。

## インストール {#installation}

APIおよびSDKパッケージはPyPIで公開されており、pipでインストールできます。

```sh
pip install opentelemetry-api
pip install opentelemetry-sdk
```

また、個別にインストール可能な拡張パッケージもあります。

```sh
pip install opentelemetry-exporter-{exporter}
pip install opentelemetry-instrumentation-{instrumentation}
```

これらはそれぞれエクスポーターと計装ライブラリ用です。
Jaeger、Zipkin、Prometheus、OTLPおよびOpenCensusエクスポーターはリポジトリの[exporter](https://github.com/open-telemetry/opentelemetry-python/blob/main/exporter/)ディレクトリにあります。
計装と追加のエクスポーターはcontribリポジトリの[instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation)および[exporter](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/exporter)ディレクトリにあります。

## エクステンション {#extensions}

エクスポーター、計装ライブラリ、トレーサー実装などの関連プロジェクトを探すには、[レジストリ](/ecosystem/registry/?s=python)を参照してください。

### 最新パッケージのインストール {#installing-cutting-edge-packages}

まだPyPIにリリースされていない機能はいくつかあります。
その場合、リポジトリから直接パッケージをインストールすることができます。
リポジトリをクローンして[編集可能なインストール](https://pip.pypa.io/en/stable/reference/pip_install/#editable-installs)を行う方法は次のとおりです。

```sh
git clone https://github.com/open-telemetry/opentelemetry-python.git
cd opentelemetry-python
pip install -e ./opentelemetry-api -e ./opentelemetry-sdk -e ./opentelemetry-semantic-conventions
```

## リポジトリとベンチマーク {#repositories-and-benchmarks}

- メインリポジトリ: [opentelemetry-python][]
- Contribリポジトリ: [opentelemetry-python-contrib][]

[opentelemetry-python]: https://github.com/open-telemetry/opentelemetry-python
[opentelemetry-python-contrib]: https://github.com/open-telemetry/opentelemetry-python-contrib
