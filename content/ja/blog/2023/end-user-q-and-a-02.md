---
title: 'エンドユーザー Q&A シリーズ: Uplight における OTel の活用'
linkTitle: 'エンドユーザー Q&A: Uplight における OTel'
date: 2023-03-20
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
body_class: otel-with-contributions-from
default_lang_commit: 8ca9ac2ec763561222f00952cc0a4a8af5432a75
cSpell:ignore: Uplight
---

[Rynn Mancuso](https://github.com/musingvirtual)（Honeycomb）と
[Reese Lee](https://github.com/reese-lee)（New Relic）の協力のもと作成。

2023年3月2日（木）、OpenTelemetry（OTel）End User Working Group は 2023 年 2 回目の[エンドユーザー Q&A セッション](/community/end-user/interviews-feedback/)を開催しました。
このシリーズは、本番環境で OpenTelemetry を使用しているチームとの月例カジュアルディスカッションです。
チームの環境、成功事例、直面している課題について学び、コミュニティと共有することで、ともに OpenTelemetry をより良いものにしていくことを目的としています。

今月は、[Uplight](https://uplight.com) の Principal Architect である [Doug Ramirez](https://www.linkedin.com/in/dougramirez/) 氏にお話を伺いました。

## 概要 {#overview}

Doug 氏はオブザーバビリティ、そして OpenTelemetry を愛しています。
自分が書いたコードに対するフィードバックを得られることに喜びを感じているからです。

このセッションで Doug 氏は以下の内容を共有しました。

- 組織の OpenTelemetry 導入の歩み
- Uplight 社内で OpenTelemetry をどのように普及させてきたか
- Uplight の OpenTelemetry 導入の過程で遭遇した課題と、いくつかの改善提案

## Q&A {#qa}

### あなたの役割を教えてください {#tell-us-about-your-role}

Uplight は、合併や買収によって集まった複数の企業で構成されており、現在はすべて Uplight ブランドのもとに存在しています。
その使命は、電力会社がグリッドを効率的に運用してリソース消費を最小限に抑え、CO2 排出を相殺することを支援し、地球を救うことです。
組織には、電力会社のために大規模なデータセットを集約するメインデータプラットフォームがあります。
成長に伴い、Uplight のデータプラットフォームは、顧客に最終的な価値を届けるアプリケーションを支える極めて重要なコンポーネントとなりました。

プラットフォームの Principal Architect としての Doug 氏の役割は、ビジネス要件を満たしつつ、開発者がプラットフォームを簡単に活用できるように設計・アーキテクチャを構築することです。
そのために、彼はアーキテクチャ特性としてオブザーバビリティを重視しており、過去一年間にわたりオブザーバビリティについて議論し、考え、あらゆるものに組み込んできました。

### オブザーバビリティで何を解決できると考えていますか {#what-do-you-think-that-observability-will-help-you-solve}

Uplight は複数の企業の集合体であるため、異なるテクノロジースタック、異なる設計パターン、同じ問題に対する異なるアプローチが存在します。

これらすべての異なるシステムとスタックがある中でも、Doug 氏はそれらがまとまりのあるユニットとして一体的に動作しているのを観測できることが不可欠だと感じています。
彼は、使用しているテクノロジースタックに関係なく、開発者がコードを観測するための統一された体験を社内全体で構築したいと考えています。
つまり、オブザーバビリティへの共通のパスです。
これは、標準およびツールとしての OpenTelemetry を採用することで実現されています。

### アーキテクチャはどのようになっていますか {#what-is-your-architecture-like}

Uplight は「あらゆるもの」を使用しており、Ruby、Java、Python が多く、一部 .NET もあり、テクノロジースタックを一言で説明するのが困難です。
レガシーコードも多く存在します。
多くのモノリスがあります。
新規開発は Python で行われており、マイクロサービスには [FastAPI](https://fastapi.tiangolo.com) を活用しています。

多くの異なる言語やフレームワークが使われている中で、どのようにしてオブザーバビリティと OTel をこれらの異なるプラットフォームに注入または組み込むかが課題でした。

最終的な目標は、開発者に OpenTelemetry とオブザーバビリティに関する長期的なビジョンを理解してもらうことでした。
ほとんどの開発者はログに慣れ親しんでいます。
ログを書いて何が起こるかを確認したいだけです。
そこで Doug 氏は、まず開発者にさまざまなプラットフォームのすべてのサービスに [OpenTelemetry（構造化）ログ](/docs/specs/otel/logs/)を追加してもらうことから始めました。
OTel のログを活用するためには、開発者はコードに [OpenTelemetry の言語固有の SDK](/docs/languages/sdk-configuration/) を追加する必要がありました。
その最初のハードルを越えて SDK をコードに組み込んだ後は、OTel の基盤がすでに整っていたため、[メトリクス](/docs/concepts/signals/metrics/)や[トレース](/docs/concepts/signals/traces/)などの[他のシグナル](/docs/concepts/signals/)をコードに追加することも容易になりました。

Doug 氏とチームは、構造化ログの問題はすでに OpenTelemetry によって解決されていることに気づきました。
コントリビューターやメンテナーはログと構造の標準化について深く考え抜いており、車輪の再発明をする意味はありませんでした。
ログの仕様はすでに存在していたため、Uplight は OTel の成果を活用し、開発者がオブザーバビリティへのパスをより迅速かつ簡単にたどれるようにすることを選択しました。
OpenTelemetry のログを採用したことで、[トレース](/docs/concepts/signals/traces/)や[メトリクス](/docs/concepts/signals/metrics/)の採用は自然な次のステップとなりました。

### ビルドとデプロイのプロセスはどのようになっていますか {#what-is-your-build-and-deployment-process-like}

ビルドは [CircleCI](https://circleci.com) と [Jenkins](https://www.jenkins.io) を使用して行われています。
すべてコンテナで実行されており、すべてのクラウドプロバイダーを使用しています。
クラウドへのデプロイに関するツールとプロセスの標準化に取り組んでいます。

### OTel のログは比較的新しいものです。なぜそれほど新しいものを使うのですか {#otel-logs-are-relatively-new-why-use-something-so-new}

[OpenTelemetry の新しいシグナル](/docs/specs/otel/logs/)の一つとして、ログの成熟度に関して多くの懸念がありました。
OTel 自体がなくなるのではないか、ログが仕様から削除されるのではないかという懸念も多くありました。
Uplight のメンバーがログ相関、つまりログとトレースのリンクを探求し使い始めたことで、これらの不安はすべて解消されました。

### OTel への道のりでどのような課題がありましたか {#what-were-some-of-the-challenges-on-the-road-to-otel}

Uplight 社内で最も大きな課題の一つは、意味のあるテレメトリーデータを出力してオブザーバビリティを実現しつつ、ベンダーロックインを防ぐことでした。
Uplight の一部のメンバーは、APM ベンダーが提供する SDK で十分だと考えていましたが、それはベンダーロックインを意味していました。

良い開発者体験を提供することが重要でした。
計装のデファクトスタンダードとなっているフレームワークを使って簡単にコードを計装でき、かつポータブルであるため特定のベンダーにロックインされないことを開発者に示す必要がありました。

開発者たちが OpenTelemetry を実際に体験した後、意識が変わり始めました。

- 構造化ログを確認し、トレースとログを相関させ、メトリクスを出力できること。
- [コンテキスト伝搬](/docs/languages/js/propagation/)の利点を体験したこと。
  つまり、スパンとトレースが異なるオペレーション間で連携し、サービスコールのエンドツーエンドビューを提供すること。

### 組織全体で OpenTelemetry をどのように普及させましたか {#how-did-you-promote-opentelemetry-across-the-organization}

OpenTelemetry が導入に値するほど成熟しているかどうかについて、社内で多くの議論がありました。
その結果、Doug 氏は OpenTelemetry について教育するために多くの時間を費やし、OpenTelemetry はブリーディングエッジではなく（しばらく前から存在している）、主要なオブザーバビリティベンダーのサポートを受けていることを示しました。
実際、これらのベンダーはすべてブログで OpenTelemetry について語っています。
これらの取り組みにより、Uplight のリーダーシップとエンジニアの両方から賛同を得ることができました。

Uplight における Doug 氏の主なアーキテクチャ目標は、オブザーバビリティ、デプロイ可能性、セキュリティです。
オブザーバビリティの話の中で、OpenTelemetry について紹介し、その仕組みを見せることも含まれていました。
そのために、Doug 氏は [Microsoft の Channel 9](<https://en.wikipedia.org/wiki/Channel_9_(Microsoft)>) に触発された、短い社内 [Loom](https://loom.com) 動画を多数作成しました。
Loom 動画は、OpenTelemetry に関する情報（理論とコードスニペットの両方）を組織全体に迅速に共有する非常に効果的な手段となっています。
これらの動画は非常に好評でした。
動画のトピックには、構造化ログ、メトリクス、トレース、Webhook プラットフォームとの分散トレーシングの統合が含まれています。

社内ハッカソンも、OpenTelemetry を普及させ、利用者を増やすための非常に効果的な手段であることが証明されています。

### 開発者は OTel SDK をアプリケーションコードに統合する体験をどのように感じていますか {#how-have-developers-found-the-experience-of-integrating-the-otel-sdks-into-the-application-code}

Doug 氏の OpenTelemetry に関する目標の一つは、言語 SDK の実装において快適な開発者体験を作ることでした。
共有ライブラリが OTel SDK 実装の参入障壁を下げるのに役立つかどうかについて、社内で多くの議論がありました。
最終的に、チームが自分たちのパスを選べるようにすることが決定されました。
Uplight の共有ライブラリを実装しているチームもあれば、Doug 氏が作成したリファレンスアーキテクチャのコードスニペットを活用しているチームもあり、SDK を直接使用しているチームもあります。

Doug 氏の主な教訓は、すぐに OpenTelemetry を使い始め、慣れ親しんでから、共有ライブラリの作成を心配すればよいということです。

### 手動計装か自動計装か {#manual-or-auto-instrumentation}

Uplight のメンバーは、手動計装と自動計装を組み合わせて使用しています。
Doug 氏の主なアドバイスは、計装を稼働させるために必要最低限のことを行い、トレースとログの出力と相関に必要な最低限のことを行い、その後必要に応じて改善するということです。

SDK は必要なものをすべて提供しています。
その上でどれだけ最適化するかはあなた次第です。
Doug 氏のアドバイスは、始めるために必要な最低限のことを行うことです。

### OTel Collector はどのようにデプロイしていますか {#how-do-you-deploy-your-otel-collectors}

Uplight には現在いくつかの異なる Collector 構成があります。

- [サイドカー](https://github.com/open-telemetry/opentelemetry-operator/blob/d980048f185202f9f8d736410b20be541371c2bc/docs/collector/deployment-modes.md)としてスタンドアロンで動作する Collector
- 大規模な Kubernetes クラスターでは、[各クラスターで Collector を実行](/docs/collector/installation/#kubernetes)
- 開発者が[Docker でローカルに](/docs/collector/installation/#docker)独自の Collector を実行

Doug 氏の最終的な目標は、あらゆる環境でのデプロイが [OTel Collector ゲートウェイ](/docs/collector/deploy/gateway/)にテレメトリーを簡単に送信できるようにすることです。

Uplight の Collector は、個々のチームが独自の Collector の所有権を取ることを決定しない限り、通常はインフラストラクチャチームが運用・管理しています。
独自の Collector の所有権を取ったチームは、これまでのところ良い体験をしています。
Uplight は、開発チームが独自の Collector を所有すべきかどうかを後日再検討する可能性がありますが、今のところ、OpenTelemetry の導入をさらに促進するために、開発者が Collector を迅速に立ち上げるパスを提供することがより重要です。

## フィードバック {#feedback}

### コミュニティへの参加 {#community-engagement}

Doug 氏はこれまでのところ OpenTelemetry について非常に良い体験をしています。
OTel コミュニティが [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) で非常に活発であることを嬉しく思っており、OpenTelemetry を始める方には、OTel チャンネル（例：[#otel-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W)、[#otel-logs](https://cloud-native.slack.com/archives/C01N5UCHTEH)、[#otel-python](https://cloud-native.slack.com/archives/C01PD4HUVBL)）に参加して、人々がどんな話をしているか見ることを推奨しています。
さまざまなチャンネルで行われている会話が、Uplight での意思決定に役立っています。

### コントリビューション {#contribution}

Doug 氏は Python SDK にいくつかのコントリビューションを行いましたが、コントリビューションの進め方を理解するのに少し時間がかかりました。
最初は、どのように関わればよいか、Slack で誰に話しかければよいか、PR のレビューをどのように依頼すればよいかがわかりませんでした。
人々が簡単に明確にコントリビューションできるようにするための取り組みがあれば、非常に役立つでしょう。

### コミュニケーション {#communication}

Doug 氏は、特定の種類の会話をどこで行えばよいかを判断するのが難しいと感じています。
GitHub Issues なのか Slack なのか。
コントリビューションしたい新しいメンバーはどこに行けばよいのか。
OTel を初めて使って問題に遭遇した場合はどこに行けばよいのか。
会話が重複しないようにするにはどうすればよいのか。

### シンプルなリファレンス実装 {#simple-reference-implementations}

Doug 氏は、OTel をゼロから始める人々を支援するための、本当にシンプルなリファレンス実装を見たいと考えています。
たとえば、シンプルな「Hello World」プログラムを実行して Collector にデータを送信しているのに、何も表示されず、ガイダンスが必要な場合です。
Docker にそれほど詳しくなく、OpenTelemetry にもそれほど詳しくない人々をどのように支援できるでしょうか。
始めたばかりの人を手助けするための、非常にシンプルなリファレンス実装を用意できないでしょうか。
たとえば、Ruby 開発者であれば、X リポジトリをクローンし、`docker compose up`[^1] を実行すれば、すべてが起動して稼働するようになっていれば、Docker ネットワーキングやその他の気が散ることに悩まされることなく、OpenTelemetry の学習に集中できます。

私は Doug 氏に、[OTel デモアプリ](https://github.com/open-telemetry/opentelemetry-demo#-opentelemetry-demo)（および Slack の [#otel-community-demo](https://cloud-native.slack.com/archives/C03B4CWV4DA) チャンネル）があり、箱から出してすぐに使える OTel サンプルを提供していることを共有しました。
また、OTel のブートストラップの簡素化を目指す [#otel-config-file](https://cloud-native.slack.com/archives/C0476L7UJT1) Slack チャンネルも紹介しました。

Doug 氏は、より言語に特化した、箱から出してすぐ使えるサンプルを見たいと考えています。
たとえば、2つの Python サービスが互いに通信し、コンテキスト伝搬をデモンストレーションし、Collector を経由して Jaeger にトレースを送信する FastAPI のサンプルです。

## 次のステップ {#whats-next}

Doug 氏との会話の全編をご覧になりたい方は、[動画](https://www.youtube.com/watch?v=ptYWBF-R1Fc)をご覧ください。

Doug 氏との会話を続けたい方は、[#otel-user-research](https://cloud-native.slack.com/archives/C01RT3MSWGZ) Slack チャンネルで連絡してください。

また、今月の [OTel in Practice シリーズ（3月27日 09:00 PT/11:00 ET）](https://surl.li/fqdox)で Doug 氏の OTel の取り組みについてもぜひご覧ください。

## おわりに {#final-thoughts}

OpenTelemetry はコミュニティによって成り立っており、コントリビューター、メンテナー、ユーザーなしには今の私たちはありません。
OpenTelemetry が実際にどのように実装されているかの事例を聞くことは、全体像の一部に過ぎません。
私たちはユーザーフィードバックを大切にしており、すべてのユーザーの皆様に体験を共有していただくことで、OpenTelemetry を継続的に改善していきたいと考えています。
❣️

あなたの組織で OpenTelemetry をどのように活用しているかのストーリーがあれば、ぜひお聞かせください！
共有方法は以下の通りです。

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の [#otel-endusers チャンネル](/community/end-user/slack-channel/)に参加する
- 月例の[エンドユーザーディスカッショングループ](/community/end-user/discussion-group/)に参加する
- [OTel in Practice セッション](/community/end-user/otel-in-practice/)に参加する
- 月例の[インタビュー／フィードバックセッション](/community/end-user/interviews-feedback/)に申し込む
- [LinkedIn の OpenTelemetry グループ](https://www.linkedin.com/groups/14081251)に参加する
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)でストーリーを共有する

[Mastodon](https://fosstodon.org/@opentelemetry) と [Twitter](https://twitter.com/opentelemetry) で OpenTelemetry をフォローし、**#OpenTelemetry** ハッシュタグを使ってストーリーを共有してください！

[^1]: {{% param notes.docker-compose-v2 %}}
