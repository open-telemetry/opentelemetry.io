---
title: OpenTelemetry in Focus、2023年3月
linkTitle: OTel in Focus 2023/03
date: 2023-03-31
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: 9d1c87cdbe98ce2dde3e417bd2f6d965d0f08ae3
cSpell:ignore: Jodd Ktor spanmetricsconnector spanmetricsprocessor Webflux
---

**OpenTelemetry in Focus** の2023年3月号へようこそ！
OpenTelemetry コミュニティにとって今月もまた忙しい月となり、いくつかの大きな発表とコアリポジトリからの新しいリリースがありました。
また、[ブログ、ウェブサイト、プロジェクトのハイライト](https://arc.net/e/18897C6F-3A57-4769-A929-902A18AB1B04)の概要もまとめましたので、ぜひご覧ください。
ご感想をお聞かせいただけると嬉しいです。

メンテナーの方でここで取り上げてほしい内容がある場合は、[Austin Parker にメール](mailto:austin@lightstep.com)、または [CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースと更新 {#releases-and-updates}

主要なリポジトリの最新アップデートをお届けします。

<!-- markdownlint-disable heading-increment -->

##### [仕様](/docs/specs/otel/) {#specification}

[バージョン1.19](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.19.0) がリリースされ、いくつかの重要な更新が含まれています。

- OTLP/JSON が安定版として宣言されました。
- 目的を明確にするため、Logs API は Logs Bridge API に名称変更されました。
- セマンティック規約の更新。

##### [Collector](/docs/collector/) と contrib {#collector-and-contrib}

Collector の[バージョン0.74/v1.0-rc8](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.74.0) がリリースされ、新しい [Operator](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.74.0) のバージョンもリリースされました。
主なハイライトは以下の通りです。

- コネクターがデフォルトで有効になりました。
- `spanmetricsprocessor` が非推奨となり、`spanmetricsconnector` が推奨されるようになりました。
  このコンポーネントの動作にはその他の変更も加えられています。
- CloudFlare ログ用の新しいレシーバーが追加されました。
- 多くのバグ修正と機能強化。

##### [Go](/docs/languages/go/) {#go}

[バージョン v1.15.0-rc.2](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.15.0-rc.2) がリリースされました。
バージョン1.15では Metrics v1 のサポートとそれに伴う安定性の保証が含まれる予定です。
リリース候補のその他のハイライトは以下の通りです。

- グローバルメータープロバイダーのサポート。
- メトリクスデータに対するエグザンプラーのサポートを追加。
- いくつかの最適化、バグ修正、削除・非推奨化。

##### [Java](/docs/languages/java/) {#java}

Java SDK の[バージョン1.24.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.24.0) がリリースされ、メトリクス SDK に対するいくつかの最適化とバグ修正が含まれています。

加えて、[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.24.0) パッケージも1.24に更新され、いくつかの新しい計装と修正が含まれています。

- Apache Pulsar と Jodd-Http が、エージェントを通じて自動的に計装できるようになりました。
- Ktor と Spring Webflux ライブラリが、ライブラリを使用して計装できるようになりました。
- RxJava2、Cassandra、Spring Boot、その他の計装パッケージの改善。

##### [Python](/docs/languages/python/) {#python}

[バージョン1.17](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.17.0) がリリースされ、いくつかの修正と改善が含まれています。
特に注目すべきは、指数ヒストグラムのサポートです！

## プロジェクトの更新 {#project-updates}

[Elastic Common Schema（ECS）を OpenTelemetry に統合する](https://github.com/open-telemetry/oteps/pull/222)提案が承認されました！
これは、競合する標準を減らし、オープンソースのオブザーバビリティエコシステムを共通のデータモデルに統一するための大きな一歩です。

[OpenTelemetry Instrumentation for Android の寄贈](https://github.com/open-telemetry/community/issues/1400)に関する提案が行われました。
リンク先のイシューで議論をフォローできます。
OpenTelemetry でクライアントオブザーバビリティの選択肢が増えるのは嬉しいことです！

Stack Overflow で未回答の OpenTelemetry の質問を減らすミッションに取り組んでいます。
[月間ハイライトの Stack Overflow Watch](https://arc.net/e/18897C6F-3A57-4769-A929-902A18AB1B04) をぜひご覧いただき、どのように貢献できるかを確認してください。
その過程でクールなグッズも手に入ります。

[Logs Bridge の仕様](https://github.com/open-telemetry/opentelemetry-specification/issues/2911)はマージ前の最終段階にあります。
校正にご協力いただける方、またはコメントがある方は、今が参加する絶好のタイミングです！

## ニュースと今後のイベント {#news-and-upcoming-events}

[KubeCon EU のスケジュール](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/program/schedule/)が公開され、OpenTelemetry 関連のセッションが盛りだくさんです！
[Observability Day EU](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/co-located-events/observability-day/) にも参加予定です。
こちらはライブ配信される予定で、プロジェクトの最新情報や OpenTelemetry メンテナーが登壇するパネルディスカッションが含まれます。
現地で参加される方は、ぜひ声をかけてください（帽子をかぶっている人が私です）。
お会いできるのを楽しみにしています（ステッカーも配布予定です）。
プロジェクトブースも出展しますので、ぜひお立ち寄りください。
KubeCon EU での活動の詳細は、別のブログでもお知らせする予定です。
