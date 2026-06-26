---
title: 'エンドユーザー Q&A シリーズ: OTel と GraphQL の活用'
linkTitle: 'エンドユーザー Q&A: OTel と GraphQL'
date: 2023-02-13
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
aliases:
  - /blog/2023/end-user-q-and-a-series-otel-and-graphql
  - /blog/2023/otel-end-user-q-and-a-series-otel-and-graphql
body_class: otel-with-contributions-from
default_lang_commit: 83d3356437c8ad2a4d3b25ee1bfe1068ca0db180
cSpell:ignore: Deno
---

[Rynn Mancuso](https://github.com/musingvirtual)（Honeycomb）と
[Reese Lee](https://github.com/reese-lee)（New Relic）の協力のもと作成。

2023年1月26日（木）、OpenTelemetry End User Working Group は 2023 年最初の月例エンドユーザー Q&A セッションを開催しました。
このシリーズは、本番環境で OpenTelemetry を使用しているチームとの月例カジュアルディスカッションです。
チームの環境、成功事例、直面している課題について学び、コミュニティと共有することで、ともに OpenTelemetry をより良いものにしていくことを目的としています。

今月は、Dynatrace の [Henrik Rexed](https://github.com/henrikrexed) 氏が、金融サービス企業で働く J 氏に、[GraphQL](https://graphql.org/) と OpenTelemetry の活用方法についてお話を伺いました。

## 概要 {#overview}

J 氏とそのチームが OpenTelemetry を導入した主な理由は 2 つあります。

- J 氏の会社ではいくつかの異なるオブザーバビリティバックエンドを使用しています。
  彼のチームは、連携する他のチームが使用しているバックエンドとは異なるベンダーバックエンドに切り替えていました。
  OpenTelemetry により、異なるベンダーを使用しているにもかかわらず、エンドツーエンドのトレースを引き続き取得できるようになりました。
- 彼のチームは GraphQL を使用しており、GraphQL の呼び出しの裏側で何が起きているかをより深く理解する必要がありました。

J 氏はまた以下の内容を共有しました。

- チームの OpenTelemetry セットアップ
- 彼とチームが他のチームの OpenTelemetry 導入をどのように支援してきたか
- OpenTelemetry を組織の標準にするための取り組み
- OpenTelemetry 導入の過程で遭遇した課題と、いくつかの改善提案

## Q&A {#qa}

### なぜ OpenTelemetry なのか {#why-opentelemetry}

J 氏の会社は、オンプレミスの旧式メインフレームから AWS Cloud や Azure Cloud まで、多様なテクノロジーエコシステムを持っています。
Windows と Linux の両方のサーバーを運用しています。
また、[Node.js](https://nodejs.org/en/)、[.NET](https://dotnet.microsoft.com/en-us/)、[Java](https://www.java.com/en/)、C、C++、[PL/I](https://en.wikipedia.org/wiki/PL/I)（メインフレーム）を含む、さまざまなプログラミング言語を使用しています。

組織全体で、異なるチームがそれぞれのニーズに合わせて異なるオブザーバビリティプラットフォームを選択しており、オープンソースとプロプライエタリのオブザーバビリティツールが混在する結果となっています。

J 氏のチームは最近、あるオブザーバビリティバックエンドから別のバックエンドに移行していました。
この移行後、連携する他のチームがまだ異なるオブザーバビリティバックエンドを使用していたため、トレースデータにギャップが生じ始めました。
その結果、トレースのエンドツーエンドの全体像が把握できなくなりました。
解決策は、標準的でベンダーニュートラルなテレメトリー出力方法、すなわち OpenTelemetry を使用することでした。

彼のチームが OpenTelemetry を採用したもう 1 つの理由は、4 年間使用してきた [GraphQL](https://graphql.org) です。
GraphQL は [API のクエリと操作に使用されるオープンソース言語](https://en.wikipedia.org/wiki/GraphQL)です。
GraphQL では、すべてがデータのボディに格納されます。リクエスト、レスポンス、エラーのすべてが含まれ、その結果、すべてが [HTTP ステータス 200](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) を返すため、失敗さえも成功しているかのような印象を与えます。
これは、J 氏とチームが裏側で何が起きているかをまったく可視化できないことを意味していました。

彼らは GraphQL のレスポンスに大量のデータを渡しています。すべての異なる GraphQL エンドポイントを 1 つに統合するメインゲートウェイがあるため、すべてが 1 つの巨大なクエリのように見えます。
OpenTelemetry により、GraphQL システムから膨大な量のデータが明らかになりました。**3,000 から 4,000** ものスパンを持つトレースもありました！
計装は Node.js の GraphQL システムを中心に行われており、.NET の GraphQL システムの計装も開始されています。

もう 1 つのブラックボックスとして AWS があり、[Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) や [ECS](https://aws.amazon.com/ecs/) などのコンポーネントに分散トレーシングを追加することを検討しています。

### アプリケーションはどのように本番環境にデプロイされていますか {#how-are-applications-deployed-into-production}

チームは GitLab を使用しており、CI/CD には GitLab パイプラインを使用し、デプロイの管理には [Ansible Tower](https://access.redhat.com/products/ansible-tower-red-hat) を活用しています。
GitLab のカスタムパイプラインは、Kubernetes YAML ファイルを（[Helm](https://helm.sh) を使用せずに）[EKS クラスター](https://docs.aws.amazon.com/eks/latest/userguide/clusters.html)にデプロイします。

チームは現在、Amazon の [cdk8s](https://aws.amazon.com/about-aws/whats-new/2021/10/cdk-kubernetes-cdk8s-available/) を使用して Kubernetes にデプロイし、Flagger を使用してそれらのデプロイ（[カナリアデプロイ](https://martinfowler.com/bliki/CanaryRelease.html)を含む）を管理する計画の初期段階にあります。

### GraphQL ではどのようにクエリを構築していますか {#how-are-queries-built-in-graphql}

GraphQL でゲートウェイを構築するシステムは 2 つあります。
1 つは [Apollo Federation](https://www.apollographql.com/docs/federation/) を使用する方法で、もう 1 つは [Schema Stitching](https://blog.logrocket.com/understanding-schema-stitching-graphql/) を使用する方法です。
Schema Stitching を使用すると、複数の GraphQL API にまたがる単一のクエリを実行できます。
J 氏のチームが Schema Stitching を選択した理由は、ロックダウンが進んでいる Apollo とは異なり、よりオープンソースで柔軟性があり、プロプライエタリ性が低いためです。

これにより、ユーザーは好きなだけデータをクエリまたは[ミューテーション](https://graphql.org/learn/queries/#mutations)できます。
GraphQL の用途には、マイクロサービス開発や分析のためのデータ抽出が含まれます。

### どのようにトレースを生成していますか {#how-do-you-generate-traces}

コードを計装するために、[Node.js SDK](/docs/languages/js/getting-started/nodejs/) を設定し、いくつかの [Node.js 自動計装プラグイン](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/17f4334056e1a97463e5dbf5f45f2e1195d47d7e/plugins/node?from_branch=main)を使用しています。
チームは現在、トレースと[スパン](/docs/concepts/observability-primer/#spans)の生成に[自動計装](/docs/specs/otel/glossary/#automatic-instrumentation)のみを使用していますが、スパンに追加のデータ（たとえば[属性](/docs/concepts/signals/traces/#attributes)）を付与することもあります。
これは[コンテキスト](/docs/concepts/signals/traces/#context-propagation)を取得してスパンを見つけ、そのスパンにカスタム属性を注入することで行っています。

チームがカスタムスパンを作成する予定は現在ありません。
実際、J 氏はチームが独自のカスタムスパンを作成することを現在のところ推奨していません。
非同期プログラミングを多く行っているため、非同期プロセス間でコンテキストがどのように振る舞うかを開発者が理解することが非常に困難になりうるからです。

トレースは、すべてのノードにインストールされているベンダーのエージェントを使用して、オブザーバビリティバックエンドに送信されています。

### トレース以外のシグナルは使用していますか {#besides-traces-do-you-use-other-signals}

チームは、GraphQL に関する特定の[メトリクス](/docs/concepts/signals/metrics/)データ（非推奨フィールドの使用状況や全体的なクエリ使用状況など）を取得するためのカスタム Node.js プラグインを実装しています。
これはトレースからは取得できない情報です。
これらのメトリクスは、[OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector#-opentelemetry-collector) の [OTLP メトリクスレシーバー](https://github.com/open-telemetry/opentelemetry-collector/blob/b3125cea266d6453df1bd48a17686f752f7d07d9/receiver/otlpreceiver/README.md?from_branch=main)を通じてオブザーバビリティバックエンドに送信されています。

このプラグインを OpenTelemetry コミュニティにコントリビューションする長期的な目標があります。
しかし現時点では、プラグインは自社のシステムと結合しており、より汎用的なユースケース向けに修正する必要があります。
さらに、外部に共有する前に、組織のオープンソースソフトウェアグループによるレビューが必要です。

### ロギングは行っていますか {#do-you-do-any-logging}

チームはロギングに [Amazon Elasticache](https://en.wikipedia.org/wiki/Amazon_ElastiCache) と [ELK スタック](https://www.techtarget.com/searchitoperations/definition/Elastic-Stack)を使用しています。
現在、.NET ログをオブザーバビリティバックエンドに移行する概念実証（POC）を実施しています。
最終的な目標は、[メトリクス](/docs/concepts/signals/metrics/)、[ログ](/docs/concepts/signals/logs/)、[トレース](/docs/concepts/signals/traces/)を 1 つの基盤に統合することです。

現時点では、[Node.js Bunyan](https://nodejs.org/en/blog/module/service-logging-in-json-with-bunyan/) を使用して ELK 内でトレースとログを自動的にリンクすることができています。
[OpenTelemetry のエグザンプラー](/docs/specs/otel/metrics/data-model/#exemplars)を活用して、トレースとメトリクスをリンクすることを目指しています。

### 組織はどのようにテレメトリーデータをさまざまなオブザーバビリティバックエンドに送信していますか {#how-is-the-organization-sending-telemetry-data-to-various-observability-backends}

J 氏のチームは、プロプライエタリバックエンドのエージェントと OpenTelemetry Collector（メトリクス用）を組み合わせて使用しています。
彼らは J 氏の会社における OpenTelemetry の主要なユーザーの 1 つであり、より多くのチームに切り替えを促すことを目指しています。

### 計装データには誰がアクセスできますか {#who-has-access-to-the-instrumentation-data}

トレースは診断目的で使用されています。
本番環境で問題が発生した場合、トレースは開発者が問題の所在を特定するのに役立ちます。

GraphQL はほとんどの場合 HTTP 200 を返すため、エラーが発生していないような印象を与えますが、実際には裏側にエラーが潜んでいる場合があります。
トレースがあることで、開発者はレスポンスボディに実際にエラーが含まれているかどうかを確認できます。
たとえば、データベースにアクセスする際に接続が切断された場合、GraphQL は HTTP 200 を報告しますが、トレースにはエラーが発生していることと、その場所が表示されます。

SRE チームも、システムの信頼性とパフォーマンスの向上のためにオブザーバビリティデータを使用しています。

### OpenTelemetry の導入体験を全体的にどのように評価しますか {#how-would-you-describe-the-overall-opentelemetry-adoption-experience}

チームの初期導入は非常に速く簡単でした。トレーシングのニーズの 80% がすぐに満たされました。
残りの 20% には追加の概念実証作業が必要でしたが、比較的短期間で完了しました。
全体として、非常にポジティブな経験でした。

J 氏のチームは他のいくつかのグループに OpenTelemetry の使用を勧めましたが、いくつかの課題に直面しました。
たとえば、J 氏はこれらのチームが [Apollo Studio](https://studio.apollographql.com) のようなプロプライエタリソフトウェアから移行するようにしたいと考えています。
OpenTelemetry がすでに同じニーズを満たしているからです。

### 組織全体で OpenTelemetry を使用する計画はありますか {#are-there-plans-to-use-opentelemetry-across-the-organization}

チームは最近、社内のオープンソースソフトウェア（OSS）グループとエンタープライズアーキテクチャ（EA）グループに対して、OpenTelemetry をエンタープライズ標準にするよう提案しています。
本番環境で稼働している自分たちの OpenTelemetry システムの成功事例を活用して、組織全体における OpenTelemetry のメリットを実証することを目指しています。

### 本番環境で GraphQL と OpenTelemetry を使用するメリットを実感していますか {#are-you-seeing-the-benefits-of-using-opentelemetry-with-graphql-in-your-production-environments}

[Node.js 用の GraphQL OpenTelemetry プラグイン](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/0b33a118f289c0435a241c84c3c3923312fc2b98/packages/instrumentation-graphql?from_branch=main)を使用することで、本番環境で問題を起こしていた GraphQL リゾルバの問題を容易に特定できました。

### 使用した計装ライブラリの出力は有用でしたか？調整が必要でしたか？ {#were-the-outputs-produced-by-the-instrumentation-libraries-that-you-used-meaningful-to-you-or-did-you-have-to-make-any-adjustments}

Node.js 側では、チームは [HTTP](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)、[Express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/0b33a118f289c0435a241c84c3c3923312fc2b98/packages/instrumentation-express?from_branch=main)、[GraphQL](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/0b33a118f289c0435a241c84c3c3923312fc2b98/packages/instrumentation-graphql?from_branch=main)、および一部のシステムでは [AWS SDK](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/0b33a118f289c0435a241c84c3c3923312fc2b98/packages/instrumentation-aws-sdk?from_branch=main) の自動計装を使用しました。

最も有用だった計装は GraphQL と AWS SDK でした。
GraphQL の自動計装は非常に有用でしたが、特定のフィールドを無視する機能の追加など、改善の余地がまだいくつかあります。
J 氏はこの問題に対処するための[プルリクエストを提出](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/1134)しています。

チームは HTTP と Express の自動計装にはあまりメリットを感じませんでした。
HTTP の計装はやや冗長すぎると感じました。
Express は最小限にしか使用されておらず、そのため計装の実質的な価値はありませんでした。
また、チームは近い将来 Express から [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga) に移行する予定です。
GraphQL Yoga に移行すると計装のギャップが生じることが予想されるため、そのための OpenTelemetry プラグインを作成し、OpenTelemetry コミュニティにコントリビューションする計画です。

### メインフレームコードの計装を予定していますか {#are-you-planning-on-instrumenting-mainframe-code}

J 氏のチームが使用しているオブザーバビリティバックエンドは、メインフレーム向けのネイティブ計装を提供していました。
J 氏とチームは OpenTelemetry を使用してメインフレームコードを計装したいと考えていました。
しかし残念ながら、PL/I（および [FORTRAN](https://en.wikipedia.org/wiki/Fortran) や [COBOL](https://en.wikipedia.org/wiki/COBOL) などの他のメインフレーム言語）向けの OpenTelemetry SDK は現在存在しません。
チームはメインフレーム向けの OpenTelemetry を望んでいますが、そのような取り組みに十分な需要があるかどうかは不明です。

**注:** メインフレーム向けの OpenTelemetry 実装に興味がある方、または作成された方は、ぜひご連絡ください！

## 課題と今後の展望 {#challengesmoving-forward}

J 氏との会話の中で、彼はいくつかの改善分野と提案も共有しました。

### JavaScript のメンテナンス {#javascript-maintenance}

OpenTelemetry の言語メンテナーは少人数であり、そのためすべての作業に十分なリソースを割けるとは限りません。
そのため、現在は SDK と API を更新するための仕様変更への対応に注力しています。
これは、contrib リポジトリ（たとえば GraphQL）を管理する時間（そして場合によっては専門知識）が不足することを意味します。
これは既知の問題であり、現在のところ解決策はありません。
OpenTelemetry コミュニティは改善のための提案を歓迎しています！

また、[セマンティック規約の安定化](https://docs.google.com/document/d/1ghvajKaipiNZso3fDtyNxU7x1zx0_Eyd02OGpMGEpLE/edit#)にも大きな注力がなされており、その取り組みの一環として、メンテナーは既存の計装ライブラリを確認し、最新の規約に準拠しているかを確認する予定です。
Java などの特定の言語では非常によく保守されていますが、Node.js などの他の言語ではそうではありません。

JavaScript 環境は、以下の理由から開発の「ワイルドウエスト」と言えます。

- 複数のファセット: Web 側とサーバー側
- 複数の言語: JavaScript、TypeScript、Elm
- 2 つの類似しているが異なるサーバーサイドランタイム: Node.js と [Deno](https://deno.land)

J 氏の提案の 1 つは、OTel JavaScript を階層構造として扱うことです。
コア JavaScript チームから始まり、フロントエンド Web グループとバックエンドグループの 2 つのサブグループに分割します。
フロントエンドとバックエンドはさらに分割されます。
たとえばバックエンドでは、Deno グループと Node.js グループを別々に設けます。

もう 1 つの提案は、コア SDK および API メンテナーグループとは別に、contrib メンテナーグループを設けることです。

### JavaScript へのコントリビューション {#javascript-contributions}

OpenTelemetry JavaScript へのコントリビューションは、特にプラグインに関して進展が遅い場合があります。
プラグインのメンテナンスの多くはプラグインの元の作成者に依存していますが、元の作成者がいなくなっているケースや、メンテナーが GitHub を頻繁に確認しないケースが多く、その結果一部のプルリクエスト（PR）の進展が非常に遅くなっています。
これを緩和する 1 つの方法は、コントリビューターをより積極的に関与させることであり、それにより新たなコントリビューターの増加にもつながる可能性があります。

### ドキュメント {#documentation}

J 氏とチームは、ドキュメントに関してもいくつかの課題を経験しており、オンラインドキュメントにいくつかのギャップがあることを指摘しました。

- JavaScript のメトリクスの項目に、Observable Gauge に関する記述がまったくありません。
  J 氏はコードを直接確認して見つける必要がありました。
- 短く概要レベルのメトリクス API の例がいくつかありますが、これらの例にはどのライブラリを取り込む必要があるかが示されていません。
  また、アイテムのエクスポート方法についても説明されていません。
- .NET では、async/await やスレッド間のジャンプのために、作業中のトレースを維持することが非常に困難です。
  .NET のドキュメントには、この特定のシナリオにおけるコンテキスト伝搬に関する詳細が不足しています。

## おわりに {#final-thoughts}

OpenTelemetry はコミュニティがすべてであり、コントリビューター、メンテナー、ユーザーなしでは今の私たちはありません。
OpenTelemetry が実際にどのように実装されているかのストーリーを聞くことは全体像の一部にすぎません。
ユーザーのフィードバックを大切にしており、すべてのユーザーの皆さんに体験を共有していただき、OpenTelemetry の改善を続けていくことを推奨しています❣️

あなたの組織で OpenTelemetry をどのように使用しているかのストーリーを共有していただける方は、ぜひお聞かせください！
共有方法:

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の
  [#otel-endusers チャンネル](/community/end-user/slack-channel/)に参加する
- 月例の
  [エンドユーザーディスカッショングループミーティング](/community/end-user/discussion-group/)に参加する
- [OTel in Practice セッション](/community/end-user/otel-in-practice/)に参加する
- [月例インタビュー / フィードバックセッション](/community/end-user/interviews-feedback/)に申し込む
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)でストーリーを共有する

[Mastodon](https://fosstodon.org/@opentelemetry) と [Twitter](https://twitter.com/opentelemetry) で OpenTelemetry をフォローし、**#OpenTelemetry** ハッシュタグを使ってあなたのストーリーを共有してください！
