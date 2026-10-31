---
title: OpenTelemetry in Focus、2023年5月
linkTitle: OTel in Focus 2023/05
date: 2023-05-31
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: 5cf207da7aef590bebe8ea29a1873d65ad5c02a2
cSpell:ignore: Dyrmishi Farfetch vertx
---

**OpenTelemetry in Focus** の2023年5月号へようこそ！
太陽が輝き、空は青く、OpenTelemetry プロジェクトの最新アップデートをお届けする時間です！

メンテナーの方でここで取り上げてほしい内容がある場合は、[Austin Parker にメール](mailto:austin+otel@ap2.io)、または [CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースと更新 {#releases-and-updates}

主要なリポジトリの最新アップデートをお届けします。

<!-- markdownlint-disable heading-increment -->

##### [仕様](/docs/specs/otel/) {#specification}

[バージョン1.21](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.21.0) がリリースされ、以下を含むさまざまな重要な変更が加えられました。

- Log Bridge API と SDK が安定版としてマークされました。
- ファイルベースの OpenTelemetry 設定の基盤が追加されました。
- OpenCensus 互換性仕様が安定版としてマークされました。

##### [Collector](/docs/collector/) {#collector}

[バージョン0.78.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.78.0) が 0.77 と合わせてリリースされました。
これらのリリースでは、以下を含むコアに関するいくつかの重要な問題に対処しています。

- バッチプロセッサーが属性キーによるバッチ処理に対応しました。
- 内部での OpenTelemetry SDK 使用に対する初期サポートが追加されました。
- エクスポーターのデフォルトキューサイズが5000から1000に削減されました。
- 高カーディナリティの内部メトリクスを無効にするフィーチャーゲートが追加されました。

加えて、[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.78.0) もいくつかの変更と機能強化で更新されました。
[Operator](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.77.0) は、Python、Java、Node.js、.NET に加えて、Golang および Apache HTTP サーバーの自動計装をサポートするようになりました。

##### [Go](/docs/languages/go/) {#go}

[バージョン1.16.0/0.39.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.16.0) は、Go における OpenTelemetry Metric API の安定版リリースとなります。

##### [Java](/docs/languages/java/) {#java}

[バージョン1.26](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.26.0) は Log Bridge のリリース候補です。
このリリースにより、ログアペンダーが既存のログフレームワークからログをブリッジできるようになり、ユーザーは Log SDK を設定してログの処理とエクスポート方法を制御できます。
加えて、opentelemetry-opentracing-shim が安定版になったほか、その他のバグ修正と改善が含まれています。

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.26.0) には、vertx-sql-client の計装サポートといくつかのバグ修正が含まれています。

#### [JavaScript](/docs/languages/js/) {#javascript}

[バージョン1.13](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.13.0) がリリースされ、gRPC ログエクスポートのサポートが追加されました。
加えて、いくつかのバグが修正されました。

#### [Python](/docs/languages/python/) {#python}

[バージョン1.18](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.18.0) では、環境変数を使用してヒストグラム集計を設定できる新機能が追加されたほか、リソース検出、エクスポート、計装の抑制に関するさまざまなバグ修正が含まれています。

- 環境変数によるヒストグラム集計の選択機能を追加
- protobuf エンコーディングを独自のパッケージに移動
- 自動計装でリソースディテクターを検出する実験的機能を追加
- `opentelemetry.sdk.metrics.view` からの ExponentialBucketHistogramAggregation のエクスポートを修正
- OTLP エクスポーターのヘッダー型の不一致を修正

#### [.NET](/docs/languages/dotnet/) {#net}

[バージョン1.5.0-rc1](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.5.0-rc.1) には、さまざまなパッケージにわたる多くのバグ修正が含まれています。

## プロジェクトとコミュニティの更新 {#project-and-community-updates}

### YouTube とミーティング録画 {#youtube-and-meeting-recordings}

最近、OpenTelemetry の YouTube チャンネルがミーティングの録画公開を停止したことにお気づきかもしれません。
今後は、Zoom クラウドを通じて録画、トランスクリプト、チャット履歴にアクセスできるようになります。
詳しくは[こちらのイシュー](https://github.com/open-telemetry/community/pull/1431)をご覧ください。

6月から、エンドユーザーへのインタビューなど、より厳選されたコンテンツを OpenTelemetry チャンネルで公開していく予定です。
最新情報は OpenTelemetry ブログをご確認ください。

### ブログより {#from-the-blog}

[OpenTelemetry Lambda Layers](/blog/2023/lambda-release/) が利用可能になりました。
Functions-as-a-Service SIG のリリースをお祝い申し上げます！

ブログに[ヒストグラムとサマリーの比較](/blog/2023/histograms-vs-summaries/)と[指数ヒストグラム](/blog/2023/exponential-histograms/)について解説する新しいブログシリーズが公開され、この重要なトピックの概要を紹介しています。

## ニュースと今後のイベント {#news-and-upcoming-events}

OpenTelemetry in Practice が6月8日、10:00 PT/13:00 ET/19:00 CET に開催予定で、Farfetch の Iris Dyrmishi が登壇します。
詳しくは CNCF Slack の #otel-comms チャンネルをご確認ください。

Observability Day が KubeCon North America としてシカゴにやってきます！
詳しくは [KubeCon](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/) のページをご覧ください。
CFP は6月初旬に公開される予定です。
