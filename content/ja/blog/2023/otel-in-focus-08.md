---
title: OpenTelemetry in Focus、2023年8月
linkTitle: OTel in Focus 2023/08
date: 2023-09-06
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: be22aba55640608e5da2570f1261d5442857065c
# prettier-ignore
cSpell:ignore: azuremonitor configgrpc googlecloudexporter jaegerreceiver Ktor loggingexporter postgresqlreceiver redisreceiver Tanzu zpages
---

**OpenTelemetry in Focus** の2023年8月号へようこそ！
忙しい夏でしたので、さっそく最新情報をお届けします。

メンテナーの方でここで取り上げてほしい内容がある場合は、[Austin Parker にメール](mailto:austin+otel@ap2.io)、または [CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースと更新 {#releases-and-updates}

主要なリポジトリの最新アップデートをお届けします。

<!-- markdownlint-disable heading-increment -->

##### [仕様](/docs/specs/otel/) {#specification}

[バージョン1.24](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.24.0) には、メトリクスとログに関する更新が含まれています。

##### [Collector](/docs/collector/) {#collector}

[バージョン0.84.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.84.0) が0.83とあわせてリリースされました。

ユーザーに影響する主な変更は以下のとおりです。

- `loggingexporter` で、詳細度レベルが detailed に設定されている場合にエグゼンプラーのログ出力がサポートされるようになりました。
- `configgrpc` で、登録済みの任意の gRPC ロードバランサー名を使用できるようになりました。
- 内部トレースを OTLP 経由でエクスポートできるようになりました。
- `configgrpc` で、gRPC クライアントの `:authority` 擬似ヘッダーがサポートされるようになりました。

さらに、Collector API のエクスポーター向けにさまざまなバグ修正と変更が行われました。

[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.84.0) にも多くの更新が含まれています。
リリースノートをご確認ください。

破壊的変更を含むユーザー向けの変更がいくつかあります。

- `jaegerreceiver` の remote_sampling 設定が非推奨になりました。
  設定が指定されている場合、起動に失敗するようになりました。
  将来のバージョンでこの機能は削除され、設定が指定されている場合は常にレシーバーが起動に失敗するようになります。
- `googlecloudexporter` の retry_on_failure 設定が削除されました。
  リトライ処理時に問題を引き起こしていたためです。
- Datadog プロセッサーが非推奨となり、Datadog コネクターに置き換えられました。
- Tanzu Observability（Wavefront）エクスポーターが非推奨となり、ネイティブ OTLP インジェストに置き換えられました。
- `redisreceiver` で、Redis への接続時にユーザー名パラメーターを追加できるようになりました。
- `postgresqlreceiver` に postgresql.temp_files メトリクスが追加されました。
- `receiver/azuremonitor` のメトリクスに name、type、resource_group などの新しい属性が追加されました。

##### [Java](/docs/languages/java/) {#java}

[バージョン1.29](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.29.0) には、トレースとメトリクス向けの API および SDK の更新が含まれています。
`zpages` エクステンションが削除された点にご注意ください。

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.29.0) では、Ktor と ElasticSearch Rest Client のサポートが追加されました。

#### [Python](/docs/languages/python/) {#python}

[バージョン1.20](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.20.0) では、Prometheus エクスポーターが非単調な Sum をゲージに変換するよう変更されました。

#### [Go](/docs/languages/go/) {#go}

[バージョン1.17.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.17.0) には、API と SDK の更新が含まれています。
主なハイライトとして、指数ヒストグラム集約のサポート追加、セマンティック規約1.21のサポート、およびバグ修正が含まれます。
Jaeger エクスポーターが非推奨となり、OTLP エクスポーターへの移行が推奨されている点にご注意ください。

#### [JavaScript](/docs/languages/js/) {#javascript}

[バージョン1.15.2](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.15.1) では、いくつかのバグが修正されました。

#### [.NET](/docs/languages/dotnet/) {#net}

[バージョン1.6.0-rc.1](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.6.0-rc.1) がリリースされ、メトリクス、エクスポート、および Log Bridge の実験的な実装に軽微な変更が加えられました。

## ニュースと今後のイベント {#news-and-upcoming-events}

KubeCon North America がおよそ8週間後にシカゴで開催され、スケジュールが発表されました！
[オブザーバビリティトラックをチェック](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/)して、OpenTelemetry、Prometheus などに関するトークをご覧ください。

Observability Day のトークもまもなく発表される予定です。

KubeCon に参加される予定の方は、OpenTelemetry のコントリビューターやメンテナーと交流、ネットワーキング、情報交換できるさまざまな機会を提供したいと考えています。
詳細はブログをチェックしてください。
