---
title: OpenTelemetry Collector v1 に向けたロードマップ
linkTitle: Collector のロードマップ
date: 2024-05-06
author: '[Alex Boten](https://github.com/codeboten) (Honeycomb)'
default_lang_commit: 5d6a81cbc10c0d041125802495b0a09c4ff835d6
# prettier-ignore
cSpell:ignore: Antipatterns Boten Broadbridge Helmuth Hrabovcak Ishan Jaglowski OTTL Pantuza Shishi Vijay
---

[OpenTelemetry Collector](/docs/collector/) は、OpenTelemetry の中でも非常に人気のあるコンポーネントであり、長期間にわたって活発に開発が続けられてきました。
Collector は、さまざまな形式のテレメトリーを受信し、変換し、送信先へ出力できるバイナリです。
過去数年間、Collector についてはさまざまなブログ記事や講演で多くのことが語られてきました。
Collector についてまだ学ぶ機会がなかった方のために、関連する講演の一覧を紹介します。

- [Connected Observability Pipelines in the OpenTelemetry Collector - Dan Jaglowski](https://www.youtube.com/watch?v=uPpZ23iu6kI)
- [OpenTelemetry Collector Antipatterns - Adriana Villela](/blog/2024/otel-collector-anti-patterns/)
- [Telemetry Showdown: Fluent Bit Vs. OpenTelemetry Collector - Henrik Rexed](https://www.youtube.com/watch?v=ykq1F_3PmJw)
- [OpenTelemetry Collector Deployment Patterns - Juraci Kröhling](https://www.youtube.com/watch?v=WhRrwSHDBFs)
- [OTTL Me Why Transforming Telemetry in the OpenTelemetry Collector Just Got Better - Tyler Helmuth & Evan Bradley](https://www.youtube.com/watch?v=uVs0oUV72CE)
- [Manage OpenTelemetry Collectors at scale with Ansible - Ishan Jain](/blog/2024/scaling-collectors/)

Collector は、システムから出力されるテレメトリーを改善する戦略の一環として OpenTelemetry を採用しようとする組織にとって、中核的なコンポーネントとなってきました。
世界中の組織がすでに Collector を採用し、パイプラインを通じて大量のデータを処理しています。
その実績は以下の講演で紹介されています。

- [Adopting OpenTelemetry Collector @ eBay - Swapping Engines Mid Flight - Vijay Samuel](https://www.youtube.com/watch?v=tZJd6W-CIcU)
- [Ingesting 6.5 Tb of Telemetry Data Daily Through OpenTelemetry Protocol and Collectors - Gustavo Pantuza](https://www.youtube.com/watch?v=aDysORX1zIs)
- [Today, Not Tomorrow: Scalable Strategies for Migrating to OpenTelemetry - Jason Anderson & Kevin Broadbridge](https://www.youtube.com/watch?v=iPGd9_aYu-A)
- [How and Why You Should Adopt and Expose OSS Interfaces Like OTel & Prometheus - Daniel Hrabovcak & Shishi Chen](https://www.youtube.com/watch?v=D71fK2MFreI)
- [Why, How to, and Issues: Tail-Based Sampling in the OpenTelemetry Collector - Reese Lee](https://www.youtube.com/watch?v=l4PeclHKl7I)

数か月前、OpenTelemetry Collector を安定版として宣言してほしいという[コミュニティからの要望](https://github.com/open-telemetry/community/issues/1971)がありました。

![Can haz Collector v1?](can-haz-collector.png)

ここで「なぜ Collector を安定版と宣言する必要があるのか。すでに本番環境で使われていると言ったばかりではないか」と思うかもしれません。
たしかに、Collector とその設定はコアコンポーネントにおいてはかなり前から比較的安定しています。
しかし、「非公式に安定している」というだけでは、Collector を採用したいと考える多くの組織にとっては十分ではありません。

- 公式な v1 のリリースは、OpenTelemetry コミュニティが長期サポートを提供する準備が整っており、メジャーバージョンを上げずに後方互換性のない変更を導入しないという意思表示になります。
- プレリリースソフトウェアの使用を禁止するポリシーを持つ組織が、Collector を採用できるようになります。
- Collector の安定性は、OpenTelemetry が CNCF Graduated プロジェクトになるための前進を助けます。

安定版化の要望に対して、メンテナーからは反発がありました。
何であれ 1.0 と名付けることは、期待を半永久的に設定することになるからです。
これをきっかけに一連の議論やミーティングが行われ、Collector のメンテナーが集まって 1.0 が Collector にとって本当に何を意味するのかを決めることになりました。

多くの議論を経て、フォーカスすべき範囲を限定することに決めました。

1. OTLP レシーバーと OTLP エクスポーターのみを含む Collector のディストリビューション。
2. Collector コンポーネントが依存する個々の Go モジュールも、プロジェクトの[バージョニングガイドライン](https://github.com/open-telemetry/opentelemetry-collector/blob/f0c7a8b5077040e9946020ed3496fe8d262009fd/VERSIONING.md?from_branch=main#general-go-api-considerations)に従って安定版としてマークされなければなりません。

これとは別に、ユーザーフィードバックに基づいてコントリビューターが改善したいと考えた領域がいくつかありました。

- Collector 自身が生成するテレメトリーについて
  - トレース、メトリクス、ログが OTLP 経由で利用可能であること。
  - テレメトリーの設定が設定スキーマに従うこと。
- Collector のスケーラビリティについて
  - キューイング、バックプレッシャー、エラーのハンドリングを改善すること。
  - エンドユーザー向けの明確なベンチマークとパフォーマンスの期待値を示すこと。
- 安定した重要インフラにふさわしいドキュメントの整備。

[ロードマップ](https://github.com/open-telemetry/opentelemetry-collector/blob/af92ca87d82026e700c29eea922f23e3a8aff2dc/docs/ga-roadmap.md?from_branch=main)は Collector のリポジトリで公開され、進行中の作業を追跡するためのマイルストーンが作成されました。
この取り組みを成功させるために、成果物のスコープは以下を提供するように限定されました。

- 明確で達成可能な目標
- 脇道にそれないためのフォーカス
- プロジェクトが何に注力しているかを新しいコントリビューターに示すシグナル

[プロジェクトボード](https://github.com/orgs/open-telemetry/projects/83)を見ればわかるようにやるべきことは多いですが、この取り組みに対する期待は大きいです。
貢献に関心がある方は、GitHub のオープンなイシューにコメントするか、毎週水曜日に開催される Collector SIG ミーティングに参加してください。
1.0 の進捗概要については、トラッキング[イシュー](https://github.com/open-telemetry/opentelemetry-collector/issues/9375)をご覧ください。
