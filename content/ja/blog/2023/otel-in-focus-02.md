---
title: OpenTelemetry in Focus、2023年2月
linkTitle: OTel in Focus 2023/02
date: 2023-02-28
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: 52d31b5caca65effb62359af091c6c2e1d6fa0f4
cSpell:ignore: Outreachy promtail
---

今月の OpenTelemetry in Focus へようこそ！
北半球の多くの地域では寒く雪の降る日が続いていますが、私たちの進歩は止まりません。
新しいリリース、アナウンス、その他の重要なアップデートの概要をお読みください。

ここで紹介してほしい内容をお持ちのメンテナーの方は、[Austin Parker にメール](mailto:austin@lightstep.com)で、または [CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースとアップデート {#releases-and-updates}

コアリポジトリの最新のアップデートを紹介します。

<!-- markdownlint-disable heading-increment -->

##### [Specification](/docs/specs/otel/) {#specification}

[v1.18](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.18.0) がリリースされ、セマンティック規約のバッチ更新と、Prometheus と OpenTelemetry メトリクス間のマッピングおよび変換に関する明確化が含まれています。

##### [Collector](/docs/collector/) と contrib {#collector-and-contrib}

[v0.72](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases) がリリースされ、注意すべきいくつかの主要な変更があります。

- サポートされる最小の Golang バージョンが 1.19 になりました。
- ホストメトリクスレシーバーから、非推奨になっていたプロセスメモリのメトリクスが削除されました。
- promtail レシーバーが collector-contrib から削除されました。
- Jaeger エクスポーターが非推奨になり、将来のリリースで削除される予定です。
- [コネクター](https://github.com/open-telemetry/opentelemetry-collector/blob/9fd84668bb02d15e0b055516b7eaefc988e0b33a/connector/README.md?from_branch=main)が追加されました！
  これらはエクスポーターとレシーバーの両方として機能するコンポーネントで、パイプラインを通じてデータをルーティングできます。
  詳細についてはコンポーネントのドキュメントを参照してください。
- 多数のバグ修正と機能強化。

##### [Go](/docs/languages/go/) {#go}

[v1.14](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.14.0) がリリースされました。
これは Go 1.18 をサポートする最後のリリースで、将来は 1.19 が必要になります。
セマンティック規約が更新され、定数と関数の名前が変更されています。
さらに、さまざまなバグ修正やその他の小さな変更が含まれています。

##### [Java](/docs/languages/java/) {#java}

[v1.23](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.23.0) がリリースされ、安定版の base2 指数ヒストグラム集約と大幅なメトリクスのリファクタリングが含まれています。
セマンティック規約のアップデート、SDK シャットダウンの改善、SDK エクステンションへのいくつかの機能強化もこのリリースに含まれています。
[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.23.0) も同様に更新され、特に HTTP スパン名が更新されたセマンティック規約を反映するように変更されました。

##### [PHP](/docs/languages/php/) {#php}

[v1 ベータ版](https://github.com/open-telemetry/opentelemetry-php/releases/tag/1.0.0beta1)が1月末に[発表](/blog/2023/php-beta-release/)されました。
PHP SIG は皆さんのフィードバックを楽しみにしています。
さらに、Communications SIG は近日中に PHP の新しいドキュメントのリリースを計画しています。

##### [Python](/docs/languages/python/) {#python}

[v1.16](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.16.0) がリリースされ、Jaeger エクスポーターの非推奨化、いくつかのパフォーマンス改善とバグ修正、Prometheus エクスポートへの変更が含まれています。

##### [.NET](/docs/languages/dotnet/) {#net}

[v1.4](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.4.0) では、いくつかの非推奨の拡張メソッドが削除されました。

いつものように、これはコアプロジェクト全体の重要な変更と改善のスナップショットに過ぎません。
OpenTelemetry の依存関係をアップグレードする際は、リリースノートを必ず十分にお読みください。

## プロジェクトのアップデート {#project-updates}

[Outreachy](/blog/2023/outreachy-may-cohort/) プロジェクトが参加者を募集しています。
これは、新しいオープンソースコントリビューターを小規模で自己完結型のプロジェクトに結びつける年次プログラムです。
これらのコントリビューターのメンターとしてボランティアする機会もあります。
詳細についてはブログをお読みください！

[Collector SIG は、新しい APAC 向けミーティングを開始](/blog/2023/new-apac-meetings/)し、世界中のコントリビューターとメンテナーをサポートします。

エンドユーザーワーキンググループが、[GraphQL での OpenTelemetry の使用に関する Q&A](/blog/2023/end-user-q-and-a-01/) を執筆しました。

## ニュースと今後のイベント {#news-and-upcoming-events}

OpenTelemetry のメンテナーとコントリビューターが、KubeCon/CloudNativeCon Europe 2023 の一環として2023年4月18日に開催される [Observability Day Europe](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/co-located-events/observability-day/) に参加する予定です。
