---
title: コレクターのインストール
linkTitle: インストール
aliases: [installation]
weight: 2
default_lang_commit: ec1657d18d8e1c63bf353049e8a7bf7e65c3e9cb
---

OpenTelemetry Collectorは、幅広いオペレーティングシステムとアーキテクチャで導入できます。
以下の手順では、コレクターの最新の安定バージョンをダウンロードしてインストールする方法を説明します。

OpenTelemetry Collectorに適用可能なデプロイメントモデル、コンポーネント、リポジトリについて詳しくない場合は、最初に[データ収集][data collection]および[デプロイ方法][deployment methods]のページを確認してください。

## ソースからビルドする {#build-from-source}

次のコマンドを使用して、ローカルのオペレーティングシステムに基づいてコレクターの最新バージョンをビルドできます。

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[data collection]: /docs/concepts/components/#collector
[deployment methods]: ../deployment/
