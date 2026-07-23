---
title: コレクターのインストール
linkTitle: インストール
aliases: [installation]
weight: 2
default_lang_commit: 50b023ac3dcf1f780650d90152dbadc9bdc9dd8a
---

OpenTelemetryコレクターはさまざまなオペレーティングシステムやアーキテクチャにデプロイできます。
以下の手順は、お使いの環境向けにコレクターの最新の安定版をダウンロードしてインストールする方法を示しています。

始める前に、[デプロイメントパターン][deployment patterns]、[コンポーネント][components]、[設定][configuration]を含む、コレクターの基本について理解していることを確認してください。

## ソースからビルドする {#build-from-source}

以下のコマンドを使用して、ローカルのオペレーティングシステムに基づいてコレクターの最新バージョンをビルドできます。

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[deployment patterns]: /docs/collector/deploy/
[components]: /docs/collector/components/
[configuration]: /docs/collector/configuration/
