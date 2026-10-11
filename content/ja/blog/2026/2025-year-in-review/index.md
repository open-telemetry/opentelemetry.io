---
title: OpenTelemetry.io 2025年の振り返り
linkTitle: 年間レビュー
date: 2026-01-09
author: >-
  [Vitor Vasconcellos](https://github.com/vitorvasc) (Mercado Libre), [Tiffany
  Hrabusa](https://github.com/tiffany76) (Grafana Labs)
sig: Comms
default_lang_commit: 86176b5ce89da875add2a77296131397f7a7ca31
cSpell:ignore: jaydeluca Msksgm Sugimoto Vasconcellos windsonsea
---

2025年が終わりを迎え、ウェブサイト、ドキュメント、ローカリゼーションの取り組みにおいてコミュニティが達成したすべてのことを振り返ります。
この年は OpenTelemetry.io にとってまたもエキサイティングな章であり、いくつかのハイライトを皆さんと共有できることを嬉しく思います。

## 2025年のハイライト {#highlights-of-2025}

2024年に多言語ドキュメントの基盤が導入されたのに対し、2025年はローカリゼーションが OpenTelemetry.io の中核的な柱となった年です。
これは、より多くのコントリビューター、より多くの翻訳、より多くのサポート言語、そしてローカライズされたコンテンツのさらなる可視性を意味します。

また、OpenTelemetry ユーザーにとって最大の課題の1つに対する革新的なソリューションにも着手しました。
Ecosystem Explorer プロジェクトにより、計装の設定やテレメトリーの収集に利用可能なすべてのオプションを見つけて理解することが容易になります。

## ローカリゼーション：飛躍の年 {#localization-a-breakout-year}

[ローカリゼーション][Localization]は2025年の際立った成果の1つです。
2024年に導入された5つのロケールをベースに、今年は3つの新しい言語を立ち上げました。

- [ベンガル語](/bn/) — 2025年5月16日
- [ウクライナ語](/uk/) — 2025年7月30日
- [ルーマニア語](/ro/) — 2025年9月11日

これにより**8つのサポートロケール**となり、アクセシビリティとグローバルなリーチにおける大きなマイルストーンとなりました。

![開始以来の言語別ローカリゼーションコントリビューション](localization-contributions-by-lang-since-inception.png)

[Localization]: /docs/contributing/localization/

### 数字で見るローカリゼーション活動 {#localization-activity-by-the-numbers}

すべてのロケールにわたって、コントリビューターは以下を提供しました。

- 翻訳コンテンツ **74,825行**
- **483件**のローカライズされたファイル
- **523件**のローカリゼーション固有のコミット
- 言語をまたいだ**65人**のユニークコントリビューター

これらの数字を総合すると、ローカリゼーションは OpenTelemetry エコシステム全体で最も活発で活気のあるコントリビューション分野の1つになったことを示しています。

### 翻訳の完成度 {#translation-completeness}

常に変化し続けるドキュメントセットをローカライズするには、多大な時間と労力が必要です。
ローカリゼーションチームは、毎日より多くの翻訳コンテンツを追加するために尽力してきました。
年末時点では、日本語のローカリゼーションが28%のカバレッジでトップでした。

- 日本語 — 28%（169ファイル）
- 中国語 — 24%（147ファイル）
- ポルトガル語 — 18%（109ファイル）
- スペイン語 — 13%（79ファイル）
- フランス語 — 9%（57ファイル）
- ベンガル語 — 3%（17ファイル）
- ウクライナ語 — 1%（7ファイル）
- ルーマニア語 — 1%（4ファイル）

### 最も活発なローカリゼーションコントリビューター {#most-active-localization-contributors}

数名のコントリビューターが、ローカライズされたドキュメントの維持と拡大において主要な役割を果たしました。

- Masaki Sugimoto ([@Msksgm](https://github.com/Msksgm)) — 127コミット（日本語）
- Vitor Vasconcellos ([@vitorvasc](https://github.com/vitorvasc)) — 74コミット（ポルトガル語 + ロケール横断のワークフロー改善）
- Michael Yao ([@windsonsea](https://github.com/windsonsea)) — 49コミット（中国語）
- Patrice Chalin ([@chalin](https://github.com/chalin)) — ロケール横断のメンテナンス、バリデーション、インフラストラクチャ

## Ecosystem Explorer：メタデータの力を引き出す {#ecosystem-explorer-unlocking-the-power-of-our-metadata}

ドキュメントとローカリゼーションを超えて、2025年は **OpenTelemetry [Ecosystem Explorer][]** イニシアチブが Communications SIG のもとで形になった年でもありました。

OpenTelemetry エコシステムが成長するにつれ、ユーザーが基本的だが重要な質問に答えることが難しくなっています。

- _どのライブラリやテクノロジーが計装されているのか？_
- _どのようなテレメトリー（スパン、メトリクス、属性）を出力するのか？_
- _そのテレメトリーはバージョンや設定によってどう変わるのか？_

既存の [OpenTelemetry Registry][] はユーザーがコンポーネントを発見するのに役立ちますが、かなりの手動メンテナンスが必要であり、必要な情報の深さを常に提供できるわけではありません。

概念実証である [Instrumentation Explorer][] は、Java エージェントに対してこれがどのように見えるかをすでに示しています。
計装を調べたり、出力されるテレメトリーを確認したり、バージョンや設定間で動作を比較したりできます。

この取り組みを推進し、より広範なプロジェクトのきっかけとなったオリジナルの Java Instrumentation Explorer プロトタイプを作成した [Jay DeLuca (@jaydeluca)][Jay DeLuca] に特別な称賛を送ります。

[Ecosystem Explorer]: https://github.com/open-telemetry/community/pull/3000
[OpenTelemetry Registry]: /ecosystem/registry/
[Instrumentation Explorer]: https://jaydeluca.github.io/instrumentation-explorer/
[Jay DeLuca]: https://github.com/jaydeluca

## 数字で見る1年 {#year-in-numbers}

2025年は、コミットやファイルだけでなく、チーム自体にも大きな成長が見られました。

### コントリビューション {#contributions}

[2023年12月から2024年11月][December 2023 to November 2024]と[2024年12月から2025年11月][December 2024 to November 2025]の期間を比較すると、コミット数と変更ファイル数に上昇傾向が見られました。

- **コミット数**は1,340件から1,913件へ43%増加しました。
- **変更ファイル数**は1,624件から1,888件へ16%増加しました。
- **マージされた PR 数**は1,374件から2,067件へ50%増加しました。
- 唯一減少した統計は**コントリビューター数**で、106人から73人へ31%減少しました。

リポジトリが2019年4月に開設されて以来、コミュニティは目覚ましい成長を遂げ、以下を達成しました。

- 5,966件のマージされたプルリクエスト（7,061コミット）
- 1,000人超のコントリビューター（正確には1,002人！）

OpenTelemetry ウェブサイトの構築と改善にご尽力いただいたすべてのコントリビューターに感謝します。
皆さんの努力が違いを生み出しています！

[December 2023 to November 2024]: https://github.com/open-telemetry/opentelemetry.io/compare/2023.12...2024.11
[December 2024 to November 2025]: https://github.com/open-telemetry/opentelemetry.io/compare/2024.12...2025.11

### チームスピリット {#team-spirit}

Opentelemetry.io を管理する [Communications SIG][] も今年成長しました！
新しいメンテナーを**2人**、新しい承認者を**2人**追加し、トリアージャーの役割を新設して**6人**の新しいトリアージャーを迎えました。

15人のグループは、2026年も引き続き OpenTelemetry ウェブサイトとドキュメントの管理を担っていくことに意欲的です。
新規・経験者を問わず、コントリビューターの皆さんを支援できることを楽しみにしています！

[Communications SIG]: https://github.com/open-telemetry/opentelemetry.io#roles

### 人気のページ {#popular-pages}

公開されている[アナリティクス][analytics]には、ページビューと人気のページに関するデータが表示されます。
2024年12月1日から2025年11月30日のデータによると、[opentelemetry.io](/) は500万セッションで**1,300万回超**閲覧されました（2024年の1,200万回の閲覧と400万セッションから増加）。

最も訪問されたドキュメントページを見ると、いくつかのセクションが目立ちます。

| ページ/セクション   | 閲覧数 | 全体の閲覧数に対する割合 [^2] |
| ------------------- | -----: | ----------------------------: |
| [Collector][]       |   790K |                         ~6.0% |
| [Concepts][]        |   725K |                         ~5.5% |
| [Languages][]       |   434K |                         ~3.3% |
| [Getting Started][] |   326K |                         ~2.5% |
| [Demo][]            |   298K |                         ~2.3% |

[analytics]: https://lookerstudio.google.com/s/tSTKxK1ECeU
[Collector]: /docs/collector
[Concepts]: /docs/what-is-opentelemetry/
[Languages]: /docs/languages/
[Getting Started]: /docs/getting-started/
[Demo]: /docs/demo/

[^2]: サイト全体の1,300万閲覧数に対する割合。

## 今後の展望 {#looking-ahead}

今年も OpenTelemetry プロジェクトにとってエキサイティングな年になりそうです！
Cloud Native Computing Foundation（CNCF）インキュベーションからのプロジェクト卒業に向けた準備の一環として、Communications SIG はホームページの[リデザイン][redesign]や Collector ドキュメントの完全な[リファクタリング][refactoring]など、重要なウェブサイトの改善を行う予定です。

エンドユーザー、コントリビューター、あるいは単に OpenTelemetry に関心がある方であっても、ぜひご参加ください。
[イシュー][issues]の起票、[ディスカッション][discussions]への参加、[PR の提出][submitting PRs]などを通じて[コントリビュート][contribute]できます。

以下からもご参加いただけます。

- [CNCF Slack](https://slack.cncf.io/) の多数の `#otel` 接頭辞付きチャンネルのいずれか
- 隔週火曜日の太平洋時間午前9時に開催される [Comms ミーティング][Comms meetings]

2026年も [opentelemetry.io](/) にとって素晴らしい年にしましょう！

[redesign]: https://github.com/open-telemetry/opentelemetry.io/blob/9bd13bd7b3ecd76093fa980c44dc10b5611b4ee0/projects/landing-page-redesign.md?from_branch=main
[refactoring]: https://github.com/orgs/open-telemetry/projects/174/views/3
[Comms meetings]: https://docs.google.com/document/d/1wW0jLldwXN8Nptq2xmgETGbGn9eWP8fitvD5njM-xZY
[discussions]: https://github.com/open-telemetry/opentelemetry.io/discussions
[contribute]: /docs/contributing/
[issues]: https://github.com/open-telemetry/opentelemetry.io/issues
[submitting PRs]: /docs/contributing/pull-requests/
