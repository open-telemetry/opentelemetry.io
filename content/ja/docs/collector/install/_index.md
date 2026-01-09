---
title: コレクターのインストール
linkTitle: インストール
aliases: [installation]
weight: 2
default_lang_commit: ec1657d18d8e1c63bf353049e8a7bf7e65c3e9cb
---

OpenTelemetryコレクターはさまざまなオペレーティングシステムやアーキテクチャにデプロイできます。
以下の手順は、コレクターの最新の安定版をダウンロードしてインストールする方法を示しています。

OpenTelemetryコレクターに適用可能なデプロイメントモデル、コンポーネント、リポジトリについてよく知らない場合は、まず[データ収集][Data Collection]と[デプロイ方法][Deployment Methods]のページを確認してください。

## ソースからビルドする {#build-from-source}

以下のコマンドを使用して、ローカルのオペレーティングシステムに基づいてコレクターの最新バージョンをビルドできます。

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[data collection]: /docs/concepts/components/#collector
[deployment methods]: /docs/collector/deploy/
