---
title: ソースからのビルド
description: OpenTelemetry Collectorをソースからビルドする方法を学ぶ
weight: 100
default_lang_commit: 6a7f17450ce3edc2e4363013551ee93ba7934a5d
---

以下のコマンドを使用して、ローカルのオペレーティングシステムに基づいてコレクターの最新バージョンをビルドできます。

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```
