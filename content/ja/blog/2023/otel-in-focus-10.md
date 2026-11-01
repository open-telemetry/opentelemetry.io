---
title: OpenTelemetry in Focus、2023年10月
linkTitle: OTel in Focus 2023/10
date: 2023-11-01
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: 8f1d1ac436c56db26a5df5233e9c524de29092ad
# prettier-ignore
cSpell:ignore: Contribfest distro dockerstatsreceiver k8sclusterreceiver parquetexporter pdata Pekko resourcetype signalfxexporter splunkhecexporter
---

**OpenTelemetry in Focus** の2023年10月号へようこそ！
シカゴで開催される KubeCon North America に向けて準備を進めており、今月も忙しい月でした。
現地で話すことがたくさんありますし、皆さんに直接お会いできることを楽しみにしています！

メンテナーの方でここで取り上げてほしい内容がある場合は、[Austin Parker にメール](mailto:austin+otel@ap2.io)、または [CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースと更新 {#releases-and-updates}

主要なリポジトリの最新アップデートをお届けします。

<!-- markdownlint-disable heading-increment -->

##### [仕様とセマンティック規約](/docs/specs/otel/) {#specification-and-semantic-conventions}

OpenTelemetry 仕様のバージョン 1.26.0 がリリースされました。
このリリースにはいくつかの小さな変更が含まれており、OpenTelemetry がコンポーネントのアップグレードとバージョン管理をどのように扱うかを説明する新しいセクションが追加されました。
詳細については、[v1.25.0 と v1.26.0 の差分](https://github.com/open-telemetry/opentelemetry-specification/compare/v1.25.0...v1.26.0)をご覧ください。

セマンティック規約 v1.22.0 では、JVM、HTTP、System、Messaging 名前空間に重要な変更が導入されました。

主な破壊的変更のハイライト：

- すべての JVM メトリクスが `process.runtime.jvm.*` から `jvm.*` にリネームされました。
- JVM メトリクス属性に名前空間が追加されました。
- `http.client.duration` と `http.server.duration` メトリクスがそれぞれ `http.client.request.duration` と `http.server.request.duration` にリネームされました。
- `jvm.classes.current_loaded` メトリクスが `jvm.classes.count` にリネームされました。
- JVM メトリクス名前空間から複数形が削除されました。
- `system.cpu.`、`system.memory.`、`system.paging.`、`system.disk.`、`system.filesystem.`、`system.network.` メトリクス配下のいくつかの属性メトリクスがリネームされました。

HTTP メトリクスの重要な変更として、`http.server.request.size` メトリクスが `http.server.request.body.size` に、`http.server.response.size` メトリクスが `http.server.response.body.size` にリネームされました。
Messaging メトリクスの重要な変更として、`messaging.message.payload_size_bytes` が `messaging.message.body.size` にリネームされ、`messaging.message.payload_compressed_size_bytes` が削除されました。
テレメトリーメトリクスにも重要な更新があり、`telemetry.auto.version` リソース属性が `telemetry.distro.version` にリネームされました。

非破壊的な変更も多数導入されており、新しい属性メトリクスの追加、命名規約の更新、特定のメトリクスに対する新しいスキームの導入などが含まれます。

完全なリリースノートは[こちらのリンク](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.22.0)をご覧ください。
OpenTelemetry SDK を更新する際は、これらの変更にご注意ください。

##### [Collector](/docs/collector/) {#collector}

10月には例年通り、Collector の2つのリリースがありました。
[リリースノート](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.88.0)はこちらからご確認いただけます。

これらのリリースには、2つの主要な機能強化と、いくつかの非推奨化が含まれています。
`pdata` のミュータビリティを制御する API が導入されました。
さらに、すべてのコンポーネントのロギングがデフォルトでサンプリングロギングモードになりました。
以前のリリースで非推奨とマークされていた特定の構造体やメソッドが削除されました。

[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.88.0) でも複数のリリースがありました。
主な非推奨化と破壊的変更は以下の通りです：

- `k8sclusterreceiver`：`opencensus.resourcetype` 属性が削除されました。
- `splunkhecexporter` と `signalfxexporter`：`max_connections` 設定フィールドが削除され、`max_idle_conns` または `max_idle_conns_per_host` に置き換えられました。
- `dockerstatsreceiver`：`cpu.container.percent` が非推奨となり、`container.cpu.utilization` が推奨されます。
- `parquetexporter` が削除されました。

さらに、さまざまなプロセッサー、レシーバー、エクスポーターに対して多くの変更と機能強化が行われました。

Operator も複数回更新されています。主なハイライトは以下の通りです：

- Kubernetes の最低必要バージョンが 1.23 になりました。
- NGINX Pod の自動計装がサポートされました。
- OpAMP ブリッジの改善が行われました。
- 計装ライブラリが全般的に更新されました。

詳細は[リリースノート](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.88.0)をご覧ください。

##### [Java](/docs/languages/java/) {#java}

[バージョン 1.31.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.31.0) には多くの小さな変更が含まれています。
特に、セマンティック規約パッケージに関する破壊的変更があり、セマンティック規約のバージョンに合わせた新しいモジュールが公開されました。

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.31.0) には、Apache Pekko の新しい計装や、多くの機能強化とバグ修正が含まれています。

#### [JavaScript](/docs/languages/js/) {#javascript}

[バージョン 1.17.1](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.17.1) では、トレーシングとメトリクスのいくつかのバグが修正されました。
実験的ビルドには、ロギングエクスポーターのいくつかのバグ修正と機能強化、Jaeger への直接エクスポートの非推奨化などが含まれています。

#### [.NET](/docs/languages/dotnet/) {#net}

[バージョン 1.7.0-alpha](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.7.0-alpha.1) には、いくつかの破壊的変更を含む、多くのバグ修正と更新が含まれています。

## ニュースと今後のイベント {#news-and-upcoming-events}

KubeCon North America がまもなくシカゴにやってきます。スケジュールが発表されました！
OpenTelemetry や Prometheus などに関するトークについては、[オブザーバビリティトラックをチェック](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/)してください。

[Observability Day](https://colocatedeventsna2023.sched.com/overview/type/Observability+Day) も再び開催されます。素晴らしいイベントになりそうです！
上記リンクから発表されたスケジュールをご確認ください。

また、初の [Contribfest](https://kccncna2023.sched.com/event/1R2rQ) の開催もお知らせします！
Collector と JavaScript SIG のメンテナーと一緒にイシューやプルリクエストに取り組み、OpenTelemetry への貢献方法について詳しく学ぶことができます。

最後に、展示フロアの OpenTelemetry Observatory にもぜひお立ち寄りください。
さまざまなミートアップや Q&A、コントリビューターやユーザー同士のネットワーキングの機会があります。
