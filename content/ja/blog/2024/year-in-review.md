---
title: OpenTelemetry.io 2024年の振り返り
linkTitle: 今年の振り返り
date: 2024-12-17
author: >-
  [Severin Neumann](https://github.com/svrnm) (Cisco), [Patrice
  Chalin](https://github.com/chalin/) (CNCF), [Tiffany
  Hrabusa](https://github.com/tiffany76) (Grafana Labs)
sig: Comms
crosspost_url: https://www.cncf.io/blog/2024/12/20/opentelemetry-io-2024-review/
default_lang_commit: b294b8a5c77561eeaf2363176b72ad43bbdbec14
---

2024年が終わりを迎えるにあたり、今年を振り返り、このウェブサイト、ブログ、ドキュメントを管理するチームである [SIG Communications][Comms meetings] の成果と知見を共有します。

## 2024年の主な成果 {#key-achievements-of-2024}

OpenTelemetry のドキュメントをよりアクセスしやすく、使いやすく、グローバルコミュニティにとってインパクトのあるものにする取り組みの中で、いくつかの重要な成果がありました。

### 多言語ドキュメント <i class="fa-solid fa-language"></i> {#multilingual-documentation}

今年の大きな成果は、[ローカライズされたドキュメント](/blog/2024/docs-localized/)の公開による多言語サポートの実現でした。
ローカリゼーションチームの尽力により、120以上のページが英語から他の言語に翻訳されました。
利用可能な翻訳には以下が含まれます。

- [中国語](/zh/)
- [フランス語](/fr/)
- [日本語](/ja/)
- [ポルトガル語](/pt/)
- [スペイン語](/es/)

この取り組みに貢献してくださったすべての方に感謝します。
これらの翻訳により、OpenTelemetry がよりアクセスしやすくなり、グローバルなユーザーのユーザー体験が向上しました。

### 情報アーキテクチャ（IA）の改善 <i class="fa-solid fa-sitemap"></i> {#ia-improvements}

**読者の体験を向上**させ、OpenTelemetry の**ドキュメントをより直感的でアクセスしやすく**するために、今年は情報アーキテクチャ（IA）の重要な更新を行いました。
これらの変更は、コンテンツをより適切に整理し、主要セクションの目的を明確にし、エンドユーザーや開発者にとってより構造化された使いやすい体験を提供する必要性によって推進されました。

主な IA の更新には以下が含まれます。

- `Instrumentation` セクションを [Language APIs & SDKs](/docs/languages/) に改名し、その目的をより的確に反映し、ユーザーにとってより明確な期待値を設定しました。
- `Automatic Instrumentation` を新しい [Zero-code Instrumentation](/docs/zero-code/) セクションに移動し、計装の API & SDK と、テレメトリーを注入するために使用される Java エージェントのようなツールをより明確に区別しました。
- これらの更新に続き、Java SIG が[提案][proposed]し、[ドキュメントを再編成][java-reorg]して、コンテンツの構造と明確さに大幅な改善を加えました。
  この取り組みの大部分は、以下の PR に反映されています。
  - [Refactor Java SDK and configuration #4966][#4966]
  - [Refactor Java instrumentation #5276][#5276]
  - [Move performance to Java agent, merge Javadoc into API page #5590][#5590]

  <!-- prettier-ignore -->
  言語 SIG ドキュメントの改善において模範的なリーダーシップを発揮した [Jack Berg][] と [Java SIG][] に称賛を送ります！
  {.mt-3}

来年は、初心者に対する OpenTelemetry の紹介方法を再設計し、よりスムーズでアクセスしやすい学習体験を実現することを目指しています。
OpenTelemetry をより理解しやすく使いやすくすることに情熱をお持ちの方は、ぜひこの共同作業に[ご参加ください][#2427]。

[#2427]: https://github.com/open-telemetry/community/pull/2427
[#4966]: https://github.com/open-telemetry/opentelemetry.io/pull/4966
[#5276]: https://github.com/open-telemetry/opentelemetry.io/pull/5276
[#5590]: https://github.com/open-telemetry/opentelemetry.io/pull/5590
[Jack Berg]: https://github.com/jack-berg
[Java SIG]: https://docs.google.com/document/d/1D7ZD93LxSWexHeztHohRp5yeoTzsi9Dj1HRm7Tad-hM
[proposed]: https://github.com/open-telemetry/opentelemetry.io/discussions/4853
[java-reorg]: https://github.com/open-telemetry/opentelemetry.io/pulls?q=is%3Apr+java+is%3Aclosed+label%3Asig%3Ajava+merged%3A2024-01-01..2024-12-31+author%3Ajack-berg

## 数字で見る1年 <i class="fa-solid fa-chart-pie"></i> {#year-in-numbers}

### コントリビューション {#contributions}

[2022年12月][December 2022]に、定期的に活動をまとめ、重要なコントリビューションをハイライトできるよう、ウェブサイトの[月次リリース][monthly releases]を開始しました。
これらのリリースにより、長期的な進捗を追跡し、比較することができます。

たとえば、[2022年12月から2023年11月][December 2022 to November 2023]と[2023年12月から2024年11月][December 2023 to November 2024]の期間を比較すると、コントリビューションの増加傾向が見られました。

- **コミット数**は1,011から1,340に33%増加しました
- **コントリビューター数**は92から106に15%増加しました
- 唯一減少したメトリクスは**変更されたファイル数**で、1,864から1,624に減少しました（13%）

2019年4月のリポジトリ開設以来、コミュニティは目覚ましい成長を遂げ、以下の実績を達成しました。

- 768人のコントリビューターによる
- 3,824件のマージされたプルリクエスト（3,982件のコミット）

OpenTelemetry ウェブサイトの構築と改善に貢献してくださったすべてのコントリビューターに感謝します。
皆さんの努力が大きな違いを生んでいます！

[December 2022]: https://github.com/open-telemetry/opentelemetry.io/releases/tag/2022.12
[December 2022 to November 2023]: https://github.com/open-telemetry/opentelemetry.io/compare/2022.12...2023.11
[December 2023 to November 2024]: https://github.com/open-telemetry/opentelemetry.io/compare/2023.12...2024.11
[monthly releases]: https://github.com/open-telemetry/opentelemetry.io/releases

### 最も人気のあったページは？ {#which-pages-were-the-most-popular}

公開されている[アナリティクス][analytics]データによると、今年 [opentelemetry.io](/) は400万セッション、**1,200万**回閲覧されました。
これは、昨年の約1,000万回の閲覧と300万以上のセッションに対して**16%の増加**です。

ドキュメントの中で最も人気のあったページとセクションは以下の通りです。

| ページ/セクション          | 閲覧数 | % [^1] |
| -------------------------- | -----: | -----: |
| [What is OpenTelemetry?][] |   290K |   2.4% |
| [Collector][]              |   1.3M |  10.5% |
| [Concepts][]               |   1.2M |   9.8% |
| [Demo][]                   |   829K |   6.7% |
| [Ecosystem][]              |   500K |   4.0% |

[analytics]: https://lookerstudio.google.com/s/tSTKxK1ECeU
[Collector]: /docs/collector
[Concepts]: /docs/what-is-opentelemetry/
[Demo]: /docs/demo/
[Ecosystem]: /ecosystem/
[What is OpenTelemetry?]: /docs/what-is-opentelemetry/

[^1]: サイト全体の1,200万閲覧数に対する割合。

### 面白いトリビア <i class="fa-solid fa-lightbulb"></i> {#trivia}

ご存知でしたか？

- 「OpenTelemetry」は英語のウェブサイトページに7,300回出現し、「the」と「to」に次いで3番目に多い単語です。
  「collector」は3,200回使用されており、11番目に位置しています！
- [Collector のランディングページ][Collector landing page]は、作成以来91回の変更が行われ、最も多く更新されたファイルです。
- 511件のコミット（27,000行の追加と10,000行の削除）により、[opentelemetrybot][] は4番目にアクティブなコントリビューターです。
  ボットがんばれ！
- 今年、そして過去最多のコメントが付いた PR の記録は以下が保持しています。
  - [Generative AI updates blog post (#5575)][#5575]、150件のコメント！

  <!-- prettier-ignore -->
  僅差の2位は以下です。
  {.mt-3}
  - [Go 計装のポルトガル語翻訳][#5380]、146件のコメント

[#5380]: https://github.com/open-telemetry/opentelemetry.io/pull/5380
[#5575]: https://github.com/open-telemetry/opentelemetry.io/pull/5575
[Collector landing page]: /docs/collector/
[opentelemetrybot]: https://github.com/opentelemetrybot

## 素晴らしいコミュニティ <i class="fa-regular fa-heart"></i> {#amazing-community}

[1,300件の PR][1.3K PRs] により、コンテンツが正確で価値があり、ドキュメントの目標に沿っており、読みやすく理解しやすいものであることを確認するために、同様に素晴らしい数のレビューに貢献しました。

PR に加えて、コントリビューターは約 [500件のイシュー][500 issues]を作成し、多くの[ディスカッション][discussions]に参加して、バグの報告、改善の提案、コラボレーションの推進を行いました。
これらの取り組みのそれぞれが、OpenTelemetry ドキュメントの品質を維持しようとするコミュニティの献身を反映しています。

幸いなことに、以下のような責任を担ってくれる多くのコントリビューターがいます。

- 他の SIG からの**承認者やメンテナー**がドキュメントの一部を共同で管理しています
- **ローカリゼーションチーム**がさまざまな言語への翻訳を監督しています
- **OpenTelemetry コミュニティ**の皆さんのコントリビューションがすべての違いを生んでいます &mdash; すべてのちょっとした編集やタイポ修正が大切です！
- **SIG Communications チームメンバー**がコントリビューションとその全体の調整を行っています！

今年 OpenTelemetry ドキュメントに時間と専門知識を提供してくださったすべての方に感謝します！

[500 issues]: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+created%3A2024-01-01..2024-12-31
[1.3K PRs]: https://github.com/open-telemetry/opentelemetry.io/pulls?q=is%3Apr+is%3Amerged+merged%3A2024-01-01..2024-12-31

## 2025年も一緒に {#join-us-in-2025}

2024年を成功の年にしてくださったすべての方に大きな感謝を送ります！
2025年も引き続きコラボレーションを続けられることを楽しみにしています。

エンドユーザーの方も、コントリビューターの方も、OpenTelemetry に興味を持っている方も、皆さんのご参加を歓迎します。
[イシュー][issues]の作成、[ディスカッション][discussions]への参加、[PR の送信][submitting PRs]を通じて[参加][get involved]できます。

以下でもお待ちしています。

- [CNCF Slack](https://slack.cncf.io/) の `#otel` 接頭辞が付いた多数のチャンネル。
- 隔週月曜日の太平洋時間午前10時に開催される [Comms ミーティング][Comms meetings]。

一緒に 2025年も [opentelemetry.io](/) にとって素晴らしい年にしましょう！

_この記事は [CNCF ブログにも掲載されています][appears on the CNCF blog]。_

[appears on the CNCF blog]: <{{% param crosspost_url %}}>
[Comms meetings]: https://docs.google.com/document/d/1wW0jLldwXN8Nptq2xmgETGbGn9eWP8fitvD5njM-xZY
[discussions]: https://github.com/open-telemetry/opentelemetry.io/discussions
[get involved]: /docs/contributing/
[issues]: https://github.com/open-telemetry/opentelemetry.io/issues
[submitting PRs]: /docs/contributing/pull-requests/
