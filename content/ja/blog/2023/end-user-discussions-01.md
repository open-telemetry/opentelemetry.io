---
title: 2023年1月の OpenTelemetry エンドユーザーディスカッションまとめ
linkTitle: エンドユーザーディスカッション 2023年1月
date: 2023-01-27
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
aliases: [otel-end-user-discussions-january-2023]
body_class: otel-with-contributions-from
default_lang_commit: c0067e41464a36f4b29f59d1b0d3b3970d4bd5dc
cSpell:ignore: january OTTL
---

[Henrik Rexed](https://github.com/henrikrexed)（Dynatrace）、
[Michael Hausenblas](https://github.com/mhausenblas)（AWS）、
[Pranay Prateek](https://github.com/pranay01)（SigNoz）、
[Rynn Mancuso](https://github.com/musingvirtual)（Honeycomb）、
[Reese Lee](https://github.com/reese-lee)（New Relic）の協力のもと作成。

OpenTelemetry（OTel）コミュニティのユーザーは毎月集まり、実際の現場で OpenTelemetry をどのように使っているかについて話し合っています。
セッションは南北アメリカ（AMER）、ヨーロッパ・中東・アフリカ（EMEA）、アジア太平洋（APAC）のユーザーを対象に開催されています。
ディスカッションは [Lean Coffee 形式](https://agilecoffee.com/leancoffee/)で行われ、参加者は[このような Agile Coffee ボード](http://agile.coffee/?http_ok#b3b37364-d40e-4029-847c-8ee059d60855)にトピックを投稿し、出席者全員が話したいテーマに投票します。

OpenTelemetry コミュニティの他のユーザーと交流し、OpenTelemetry が実際にどのように使われているかについて実践的な経験を学び、共有するための素晴らしい機会です。
各ミーティングには OTel ガバナンス委員会メンバーやメンテナーが参加し、質問への回答、ユーザーからのフィードバックの聴取、議論されるトピックへの追加の文脈や洞察の提供を行っています。

これは、月例の OTel エンドユーザーディスカッションをまとめるブログ記事シリーズの第 1 回で、2023年1月のセッションから始まります。

## 話し合ったこと {#what-we-talked-about}

今月は 3 つのセッションを通じて、いくつかの共通テーマが見られました。

- OpenTelemetry の導入と普及
- [コネクター](https://github.com/open-telemetry/opentelemetry-collector/pull/6140)（Collector）
- [Service Graph Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/d02d376f20a67762c85766590249911b77198b8b/processor/servicegraphprocessor?from_branch=main)（Collector）
- シグナルの相関（例: メトリクス/トレースの相関、ログ/トレースの相関）

これらのトピックについて詳しく見ていきましょう！

## ディスカッションのハイライト {#discussion-highlights}

以下は今月のディスカッションのまとめです。

### OpenTelemetry Collector {#opentelemetry-collector}

#### 1 - OpenTelemetry Transformation Language（OTTL） {#1--opentelemetry-transformation-language-ottl}

**Q:** エクスポーターは [OTTL](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/6f6508287432467610c3385020845f1bac937532/pkg/ottl?from_branch=main)（OpenTelemetry データを変換するための言語）をサポートする予定はありますか？
ユースケース: データを変換する必要があるが、プロセッサーで行いたくない。

**A:** 関心の分離の観点から、OTTL がエクスポーターに追加される可能性は低いですが、[コネクター](https://github.com/open-telemetry/opentelemetry-collector/pull/6140)（パイプラインを結合するためのエクスポーター/レシーバーのペアとして機能する新しい Collector コンポーネント）または[ルーティングプロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/71fc94173de0ee2cf1bd9d38d4c16ea20722a362/processor/routingprocessor?from_branch=main)のユースケースになる可能性があります。
ルーティングプロセッサーは HTTP リクエストまたは属性からデータを読み取り、指定されたエクスポーターにルーティングします。

#### 2 - Service Graph Processor {#2--service-graph-processor}

**Q:** OpenTelemetry を使ってサービスグラフを生成し、メトリクスを生成し、データを可視化ツールに送信するにはどうすればよいですか？

**A:** [Service Graph Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/d02d376f20a67762c85766590249911b77198b8b/processor/servicegraphprocessor?from_branch=main) がサービスグラフを生成します。
このプロセッサーはまだアルファ版であり、依存関係マッピングに関する Service Graph の既知の問題がいくつかあります。
1 つのスパンには全体のコンテキストが含まれておらず、全体像を把握するには、スパンを集中管理されたサービスに送信する必要があります。

#### 3 - パイプラインでのデータの分岐 {#3--bifurcating-data-in-a-pipeline}

**Q:** Collector を使って異なるデータセットを異なるバックエンドに送信したい場合、最適な方法は何ですか？

**A:** [コネクター](https://github.com/open-telemetry/opentelemetry-collector/pull/6140)（パイプラインを結合するためのエクスポーター/レシーバーのペアとして機能する新しい Collector コンポーネント）を使うことで解決できます。
コネクターは近日リリース予定です。
詳細については、[コネクターの PR](https://github.com/open-telemetry/opentelemetry-collector/pull/6372) をご覧ください。

もう 1 つの方法は、[ルーティングプロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/71fc94173de0ee2cf1bd9d38d4c16ea20722a362/processor/routingprocessor?from_branch=main)を使うことです。
ルーティングプロセッサーは HTTP リクエストまたは属性からデータを読み取り、指定されたエクスポーターにルーティングします。
この方法は新しいネットワーク接続を作成するため、非効率になる可能性があります。

#### 4 - テレメトリーデータの時刻ずれの管理 {#4--managing-time-drift-in-telemetry-data}

**Q:** サーバー間でクロックが同期していない場合、一部のデータポイントが将来の時刻として記録されることがあります。
これを軽減するために OTel Collector に何か実装できますか？

**A:** クロックスキューは常に発生するものです。
特にマイクロサービスアーキテクチャでは、クロックを同期させる方法はありません。
テレメトリーを生成するシステムのオーナーの方が、クロックの特性をよく理解しています。
Collector はこの問題に対処するのに適していません。

#### 5 - 高度な Collector のデプロイと設定 {#5--advanced-collector-deployment-and-configuration}

**Q:** Pod を水平スケーリングするタイミングと、個々のコレクターの設定を変更するタイミングはいつですか？
コレクターを追加する場合とコレクターの設定を変更する場合の判断基準は？

**A:** Collector のデプロイと設定にはいくつかの考慮点があります。

- Collector にステートレスなコンポーネントしかない場合、メトリクスに基づいてスケール（レプリカの追加）できます。
- 処理の種類に応じてパイプラインをシャーディングすることをお勧めします。
  たとえば、メトリクス用、ログ用、トレース用のパイプラインをそれぞれ作成するのがよいでしょう。
  これらのパイプラインのワークロードはそれぞれ異なるためです。
- 処理されるデータの種類に応じて Collector を分割することもできます。
  [個人を特定できる情報（PII）](https://www.investopedia.com/terms/p/personally-identifiable-information-pii.asp)を含むデータが多い名前空間がある場合、その名前空間専用の Collector を設置し、[属性プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/ecf97200a5140932805ed4a4cc66f2927e2cfb8e/processor/attributesprocessor/README.md?from_branch=main)を使用するとよいでしょう。

### OpenTelemetry の導入と普及 {#opentelemetry-adoption--enablement}

**Q:** 組織で OpenTelemetry を採用することを決めたものの、次に何をすればよいでしょうか？
開発者を圧倒することなく、OpenTelemetry の導入を促進し、開発者に OpenTelemetry の利用に対する意欲を持たせる最良の方法は何ですか？

**A:** コミュニティからの提案をいくつか紹介します。

- OpenTelemetry のチャンピオンになってくれる人を見つける
- OpenTelemetry に不慣れな開発者を、より詳しい開発者とペアにする
- OpenTelemetry の真の価値は、いくつかのサービスを計装して、それらがどのように連携しているかを確認するまで見えてこない
- 開発者はコードの計装を始める心構えができている必要がある。
  既存のコードに計装を追加することを意味する場合もあることに留意する
- 「ビッグバン」アプローチは OpenTelemetry を導入する最良の方法ではない可能性がある。
  組織にとって圧倒的になりかねないため、1 つか 2 つのコンポーネントから始めるとよい

### OpenTelemetry 言語 API と SDK {#opentelemetry-language-api--sdks}

#### 1 - 新しい言語の計装 {#1--new-language-instrumentation}

**Q:** [Dart](https://dart.dev) や [Lua](https://www.lua.org) など、さまざまな言語の OTel 実装に関する情報はどのように見つけられますか？

**A:** [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf) は検索を始めるのに最適な場所です。
言語ごとのチャンネルがあり、**otel-&lt;language_name>** という命名規則に従っています。
お使いの言語のチャンネルが見つからない場合は、[OpenTelemetry CNCF Slack チャンネル](https://cloud-native.slack.com/archives/CJFCJHG4Q)や [GitHub](https://github.com/open-telemetry/community) でディスカッションを始めてください。
[Perl 向け OTel のこのイシュー](https://github.com/open-telemetry/community/issues/828)のような例もあります。
詳細については[こちらのページ](/docs/languages/other/)もご確認ください。

#### 2 - Python の計装 {#2--python-instrumentation}

**Q:** Python の自動計装はどの程度成熟していますか？
また、OpenTelemetry Python を使っている方々の経験はどのようなものですか？

**A:** Python の自動計装はベータ版ですが、本番環境で OTel Python を使用している企業があるため、本番環境で問題が発生する可能性は低いでしょう。
SIG として、OTel Python は破壊的変更の出荷を最小限に抑えるよう努めていますが、すべてのものと同様に、破壊的変更がないという保証はありません。
Python の計装が安定版としてマークされる確定した時期はありません。

### その他の項目 {#misc-items}

#### 1 - OpenTelemetry エグゼンプラー {#1--opentelemetry-exemplars}

**Q:** [エグゼンプラー](/docs/specs/otel/metrics/data-model/)について、また実際にどのように使われているかについて、どこで詳しく学べますか？

**A:** [エグゼンプラー](/docs/specs/otel/metrics/data-model/)は、OpenTelemetry の[メトリクス](/docs/concepts/signals/metrics/)を[トレース](/docs/concepts/signals/traces/)に相関させるために使用されます。
エグゼンプラーは現在開発の初期段階にあり、まだ多くの作業が必要です。
エグゼンプラーの状況について詳しくは、CNCF Slack の [#otel-metrics チャンネル](https://cloud-native.slack.com/archives/C01NP3BV26R)をご確認ください。
[Michael Hausenblas の最近の講演](https://www.slideshare.net/Altinity/osa-con-2022-signal-correlation-the-ho11y-grail-michael-hausenblas-awspdf)もぜひご覧ください。

#### 2 - トレースとログの相関 {#2--correlation-between-traces-and-logs}

**Q:** トレースとログをより簡単に相関させる方法はありますか？

**A:** 相関の実装には時間がかかり、進行中の作業です。
相関の作業は一部の言語（例: Java、Go）では他よりも成熟しています。
最善のアプローチは、お使いの状況に該当する言語固有のリポジトリでこの問題を提起することです。
回避策として、ログレベルでトレースを開始する方法があり、すべてのログに関連するトレースが紐付けられます。

#### 3 - プロファイリング {#3--profiling}

**Q:** OpenTelemetry におけるプロファイリングの状況はどうなっていますか？

**A:** プロファイリングに関する OTel の提案は承認され、活発に作業と議論が行われています。
現在は SDK の作業を開始する前に、プロトコルの策定に注力しています。
GitHub の[プロファイリングリポジトリ](https://github.com/open-telemetry/opentelemetry-profiling)や、GitHub の[プロファイリングビジョンのプルリクエスト](https://github.com/open-telemetry/oteps/pull/212)をご確認ください。

#### 4 - コンテキスト伝搬 {#4--context-propagation}

**Q:** ブラウザーはコンテキスト伝搬を自動的に追跡できないため、手動で行う必要があります。
現在の回避策には多くのオーバーヘッドが伴っています。
これはどのように対処できますか？

**A:** この問題に対処するには、[JavaScript SIG](https://cloud-native.slack.com/archives/C01NL1GRPQR) に参加してそこで問題を提起することです。
これを内部的に解決する API に取り組んでいる方がいれば、OTel コミュニティにコントリビュートしていただけると素晴らしいです。

## ミーティングノートと録画 {#meeting-notes--recordings}

上記のトピックをさらに詳しく知るには、以下をご確認ください。

- [AMER](https://docs.google.com/document/d/1p_FoGbLiDC9VPqqLblJqQtHBn3tr-aPxhu2GaIykU6k/edit?usp=sharing)
  ミーティングノート +
  [セッション録画](https://www.youtube.com/watch?v=a_Hr515wl9U)
- [EMEA](https://docs.google.com/document/d/1fh4RWyZ-ScWdwrgpRHO9mnfqLSKfxUTf4wZGdUvnnUM/edit?usp=sharing)
  ミーティングノート
- [APAC](https://docs.google.com/document/d/1eDYC97LfvE428cpIf3A_hSGirdNzglPurlxgKCmw8o4/edit?usp=sharing)
  ミーティングノート

今後はすべてのエンドユーザーディスカッションミーティングを録画する予定です。

## 参加しませんか {#join-us}

OpenTelemetry を組織でどのように活用しているかのストーリーを共有したい方は、ぜひお聞かせください！
共有方法:

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の [#otel-endusers チャンネル](/community/end-user/slack-channel/)に参加する
- 毎月開催の[エンドユーザーディスカッショングループ](/community/end-user/discussion-group/)に参加する
- [OTel in Practice](/community/end-user/otel-in-practice/) セッションに参加する
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)でストーリーを共有する

OpenTelemetry を [Mastodon](https://fosstodon.org/@opentelemetry) や [Twitter](https://twitter.com/opentelemetry) でフォローし、**#OpenTelemetry** ハッシュタグを使ってストーリーを共有してください！
