---
title: 'OpenTelemetry in Practice: Kubernetes とコレクター'
linkTitle: OTel in Practice
date: 2022-08-17
author: '[Rynn Mancuso](https://github.com/musingvirtual)'
default_lang_commit: fb1cb7ad5eb8bcf1b211470d5b5e418a3f4d79bb
---

## シリーズについて {#about-the-series}

**OpenTelemetry in Practice** シリーズへようこそ！
これは End User Working Group の一部の OpenTelemetry コントリビューターによる新しい試みです。

私たちの目標は以下のとおりです。

- 開発チームが OpenTelemetry を導入する際に、よくある実務上の障壁を解消すること
- 特定の言語に注力する開発者とのつながりを強化すること
- 本番環境での OpenTelemetry 導入体験を改善すること

各 OpenTelemetry in Practice セッションでは、30分のライトニングトークと30分のオープンディスカッションを行います。
OpenTelemetry in Practice チームへの参加や、今後のイベントでの登壇を募集しています。
こうした議論を形づくることに興味のある方は、[CNCF Slack](https://slack.cncf.io/) の [#otel-user-research チャンネル](https://cloud-native.slack.com/archives/C01RT3MSWGZ)までご連絡ください。

最初のセッションは8月23日 10:00 AM PDT に [Zoom](https://zoom.us/j/5227112777?pwd=TXBqZ3RMWVYxenVGdlk0SFlwMkwwQT09) で開催され、テーマは Kubernetes とコレクターです。

## トーク {#talks}

ライトニングトークの内容は以下のとおりです。

## Kubernetes でのコレクターの設定とトラブルシューティング {#collector-configuration-and-troubleshooting-in-kubernetes}

&mdash; [Jessica Kerr, Honeycomb](https://jessitron.com/)

Kubernetes で OpenTelemetry コレクターを動かす方法についてお話しします。
Jess が OpenTelemetry の Helm チャートを使ってコレクターを実行し、動作するまで設定を調整します。
トラブルシューティングの2つのテクニックを実演し、いくつかの落とし穴について注意点を共有します。
その後、コレクターに関する成功体験や苦労した点をぜひ共有してください。

## Kubernetes のオブザーバビリティパイプライン {#observability-pipelines-for-kubernetes}

&mdash; [Daniel Kim, New Relic](https://newrelic.com/blog/authors/daniel-kim)

オブザーバビリティを実現するには、さまざまなデータソース、フレームワーク、プログラミング言語からシグナルを収集する必要があります。
OpenTelemetry のようなフレームワークを使えば、多種多様なシグナルにまたがる異種データを、具体的な行動につながる知見に変換できます。
このトークでは、Daniel が OpenTelemetry コレクターとオープンソースプラグインを使って、オブザーバビリティデータパイプラインを構築する方法を紹介します。
これらのプラグインは、トレースやメトリクスへのインフラストラクチャメタデータの注入、テイルベースサンプリングの実装、OTLP 経由での任意のバックエンドへのデータエクスポートなど、幅広いデータ処理を行えます。
最後に、コレクター運用における課題を共有し、自分自身のオブザーバビリティパイプラインを OpenTelemetry で構築する際の参考にしていただきます。
