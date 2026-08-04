---
title: 2023年3月の OpenTelemetry エンドユーザーディスカッションまとめ
linkTitle: エンドユーザーディスカッション 2023年3月
date: 2023-03-30
author: '[Reese Lee](https://github.com/reese-lee) (New Relic)'
body_class: otel-with-contributions-from
default_lang_commit: f060502a2ef094095e4f03f6621349ff3bf09c32
cSpell:ignore: distro
---

[Henrik Rexed](https://github.com/henrikrexed)（Dynatrace）、
[Michael Hausenblas](https://github.com/mhausenblas)（AWS）、
[Rynn Mancuso](https://github.com/musingvirtual)（Honeycomb）、
[Adriana Villela](https://github.com/avillela)（Lightstep）、
[Pranay Prateek](https://github.com/pranay01)（SigNoz）の協力のもと作成。

OpenTelemetry のエンドユーザーグループミーティングは、南北アメリカ（AMER）、ヨーロッパ・中東・アフリカ（EMEA）、アジア太平洋（APAC）のユーザーを対象に毎月開催されています。

ディスカッションは [Lean Coffee 形式](https://agilecoffee.com/leancoffee/)で行われ、参加者は[このような Agile Coffee ボード](http://agile.coffee/?http_ok#3716060f-183a-4966-8da4-60daab2842c4)にトピックを投稿し、出席者全員が話したいテーマに投票します。

## 話し合ったこと {#what-we-talked-about}

サンプリングと Collector の機能が引き続き関心の高いトピックであり、計装や導入に関する質問もありました。

## ディスカッションのハイライト {#discussion-highlights}

以下は今月のディスカッションのまとめです。

### OpenTelemetry Collector {#opentelemetry-collector}

#### 1 - Azure App Services での gRPC の喪失 {#1---losing-grpc-with-azure-app-services}

**Q:** Azure で OTel Collector のホスティングモデルを検討した際、HTTP のみがサポートされています（Azure App Service での実行の場合）。
gRPC の機能を失うことに伴うリスクは何ですか？

**A:** Azure で HTTP/2 がサポートされている場合、gRPC は HTTP の上に HTTP/2 上の追加の仕組みを加えたものなので、動作する可能性があります。
1 つの提案として、gRPC サポートについて Microsoft にフォローアップすることが挙げられます。
非常に長時間の接続が発生する可能性があるためです。

#### 2 - 稼働監視/シンセティクス {#2---uptime-monitoringsynthetics}

**Q:** OTel Collector には稼働監視やシンセティクスを行う機能はありますか？
ない場合、そのような機能に向けた計画はありますか？

**A:**
[ヘルスチェック](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/443567a6a00d7cff8cae1432a6fef655d8698e94/extension/healthcheckextension/README.md?from_branch=main)が参考になるかもしれません。
また、[HTTP チェックレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/443567a6a00d7cff8cae1432a6fef655d8698e94/extension/healthcheckextension/README.md?from_branch=main)もご確認ください。

#### 3 - Collector のディストリビューション {#3---collector-distributions}

**Q:** ベンダーのディストリビューションとコミュニティの Collector ディストリビューション、どちらを使うべきですか？

**A:** 各ベンダーのディストリビューションにはカスタマイズが含まれますが、コミュニティの Collector ディストリビューションには、レシーバーやエクスポーターなどすべてが含まれます。
柔軟性が必要な場合は、OTel Collector ディストリビューションを使うべきです。

#### 4 - レシーバーのレートリミット {#4---rate-limiting-on-receivers}

**Q:** レシーバーでのレートリミットやサーキットブレーカーを有効にする計画はありますか？
多数のクライアントが同じ OTel Collector のセットにテレメトリーを送信するケースを想像してください。

**詳しい文脈**: トレース、メトリクス、ログ用の Collector があり、100 以上の個別アプリからトラフィックを受信している状況で、どのようにレートリミットを行えばよいですか？
大量のトラフィックを生成する顧客が 1 社でもいれば、Collector 全体の健全性に影響を与える可能性があります。

**A:** リバースプロキシを使ってください。
注意すべき点として、データが Collector 内部に入ると、データはすでにデシリアライズされており、Collector にデータを大量に流し込んでいる状態なので、その時点でレートリミットを行うのは少し遅いです。
1 つのアプローチとして、SDK を設定する際に追加情報を含むヘッダーを追加することで、ロードバランシングに役立てる方法があります。

#### 5 - コネクター {#5---connectors}

**Q:** コネクターとは何ですか？

**A:** コネクターは、あるパイプラインでエクスポーターとしてテレメトリーシグナルを消費し、別のパイプラインでレシーバーとして出力する Collector コンポーネントです。
[詳しくはこちら](https://o11y.news/2023-03-13/#opentelemetry-connectors)をご覧ください。

#### 6 - upstream、downstream、distro の定義 {#6---definitions-of-upstream-downstream-and-distro}

**Q:** upstream とは何ですか？
downstream とは？
distro とは？

**A:** 「upstream」と「downstream」という用語は、システム内のサービスやコンポーネントがどのように接続されているかを指します。
ソフトウェアにおけるさまざまな状況での適用については、[こちらの記事](https://reflectoring.io/upstream-downstream/)を参照してください。

「distro」はディストリビューションの略称です。
ディストリビューションを提供するベンダーの一覧は、[ベンダー](/ecosystem/vendors/)をご覧ください。

### サンプリング {#sampling}

#### 1 - テイルサンプリング {#1---tail-sampling}

**Q:** エラーやレイテンシの高い HTTP リクエストすべてに対してテイルサンプリングを行い、ヘッドベースサンプリングだけに頼らない場合、どのようなデメリットが考えられますか？
トレースサンプリングに関するベストプラクティスはありますか？
テイルサンプリングは非常にコストが高くなる可能性があります。

**A:** 一般的に、ヘッドサンプリングはお勧めしません。
やりたいことの 100% を実現できないためですが、テイルサンプリングにコストがかかるのも事実です。
サンプリングが複雑な議論になる理由は、本当に万能の答えがないからです。
さらに、データ分析ツールが提供する機能にも依存します。
たとえば、データ取り込みコストがあるのか、ストレージコストがあるのか？
取り込みコストがある場合は、データが取り込まれる前にサンプリングしたいでしょう。
ストレージコストの場合は、多くのデータを削除する必要があるため、トレードオフ次第です。

考慮すべき点として、スパンにエラーがある場合など、属性に基づいたテイルサンプリングを使用できますが、より多くのメモリが必要です。
さらなる調査として以下をお勧めします。

- [OpenTelemetry のカラムデータストア](https://github.com/open-telemetry/oteps/pull/171)
- [OpAMP](/blog/2022/opamp/)
- バックエンドベンダーのテイルベースサンプリング戦略
- [Uber の論文](https://uber.com/blog/crisp-critical-path-analysis-for-microservice-architectures/)
- [テイルサンプリングプロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/549e115b28292c164eb671618c0ec8b728b69d2a/processor/tailsamplingprocessor/README.md?from_branch=main)

### 導入、移行、実装 {#adoption-migration-and-implementation}

#### 1 - 一般的な移行の課題 {#1---common-migration-challenges}

**Q:** OpenTelemetry への移行時に開発者が直面する一般的な課題は何ですか？

**詳しい文脈:** 数百のマイクロサービスを移行する必要があり、その中には特定のベンダーとそのライブラリにロックインされた多くのカスタムトレーシングを持つ大規模なモノリスシステムも含まれます。
この移行を支援するためにエージェントをセットアップすることは、2 つの異なるオブザーバビリティシステムを同時に稼働させるようなものです。

**A:** あるユーザーが自身の経験を共有しました。
まず OpenTelemetry をサポートするバックエンドを使い始めました。
直面した 2 つの課題は、エンジニアのマインドセットにおける文化的な変化と、OpenTelemetry の認知度向上であり、これらは技術的な課題よりも大きなものでした。
重要なのは、一度に大きな変更を提案しないことです。
ベンダーベースのソリューションから OpenTelemetry への移行は、全面的な転換ではなく、段階的なプロセスであるべきです。

追加の提案:

- まず開発環境やテスト環境で始めて、ソフトウェアへの信頼を構築する
- Java や Node.js など、OTel がより成熟しているスタックを選ぶ
- 開発者の抵抗に対しては、まず自動計装を使い始めるのがよいステップである

#### 2 - 開始とスケーリング {#2---starting-and-scaling}

**Q:** OpenTelemetry を始めるのに適した場所はどこですか？
たとえば、インフラからデータ収集を始めるのか、アプリケーションから始めるのか？
そして、どのようにスケールアップしますか？

**詳しい文脈**: 私たちのユースケースはエンドツーエンドの可視性です。
現在、ログ、メトリクス、トレースの監視にベンダーを使用しています。
RUM（リアルユーザーモニタリング）なども使っています。
OpenTelemetry でも同じことを、しかもスケールして実現できますか？

**A:** 新しいプロジェクトで OTel を使い始めるのか、既存のプロジェクトを再編成しようとしているのかによります。
移行計画を立て、パフォーマンスへの影響が悪くないことを確認し、必要なものをスケールアップするのが最善です。
1 つの提案として、Java の OTel 計装で実験を始めることが挙げられます。
全体的なパフォーマンスへの影響はごくわずかです。

もう 1 つの提案は、Collector の [host metrics レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/d613690dbc58780aebf40237cf66b487bd579581/receiver/hostmetricsreceiver/README.md?from_branch=main)を使用して、OpenTelemetry によるインフラ監視を試みることです。
多くのメトリクスをカバーしており、依存関係がありません。
あるユーザーは、インフラ監視をベンダー固有のエージェントから host metrics レシーバーに移行した際、CPU 使用率が 20% 削減されたと報告しました。

#### 3 - 自動計装 {#3---auto-instrumentation}

**Q:** コードを変更せずにスパンを自動的に作成する方法はありますか？

**A:** ユースケースによります。

- OTel では[自動計装](/docs/concepts/instrumentation/zero-code/)のオプションが成熟しつつあります。
  たとえば、Java の JAR エージェントは、アプリケーションが使用する[ほとんどのライブラリ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/9b99a549b7e1f4b180625a2771706d7170a7e949/docs/supported-libraries.md?from_branch=main#libraries--frameworks)の計装を処理します。
  自動計装は [Python](/docs/zero-code/python/)、[.NET](/docs/zero-code/dotnet/)、[Node.js](/docs/zero-code/js/) でも利用可能です。
- Kubernetes を使用している場合は、[OTel Operator](https://github.com/open-telemetry/opentelemetry-operator) を使用できます。
  これは K8s にデプロイされたアプリケーションの計装を処理します。
  OTel Operator は、利用可能な場合に自動計装ライブラリの注入と設定もサポートしています（上記のポイントを参照）。
- AWS Lambda を使用している場合は、[OTel Lambda エクステンション](https://github.com/open-telemetry/opentelemetry-lambda)をご確認ください。

#### 4 - OTel からのテレメトリーの活用 {#4---leveraging-telemetry-from-otel}

**Q:** OTel からのテレメトリーを活用するためのテレコマンド標準に向けた取り組みはありますか？

**A:** テレコマンドとは、テレコマンドが送信される場所から直接接続されていないリモートシステムを制御するために送信されるコマンドです（Wikipedia より）。
[こちらの論文](https://www.gsse.biz/pdfs/papers/DASIA2018-abstract.pdf)と [OpAMP](/blog/2022/opamp/) をご確認ください。

#### 5 - メッセージブローカー {#5---message-brokers}

**Q:** メッセージブローカーのユースケースにはどのようなものがありますか？

**A:** IoT のユースケース（自動車メーカー）があります。
メッセージのセマンティック規約サポートに関する作業も進行中です。

### アップデートとコミュニケーション {#updates-and-communications}

#### 1 - 統一クエリ標準 {#1---unified-query-standard}

**Q:** KubeCon EU の O11y Day で議論される、オブザーバビリティデータの統一クエリ標準ワーキンググループに関するアップデートはありますか？

**A:** CNCF 内の Observability TAG は、さまざまなクエリ言語を分析し、ユースケースをまとめるワーキンググループの立ち上げに取り組んでいます。
たとえば、もっとも一般的なアラートや診断のタイプは何か、利用可能にしたい一般的でないパターンは何か、などです。
その後、ベンダー間で統一された標準言語の推奨を策定できるかどうかを検討します。
SQL に近いものになるかもしれません。

月末にワーキンググループを正式に立ち上げる予定です。
チャーターはコメントを受付中です。
[こちらでご覧ください](https://docs.google.com/document/d/1JRQ4hoLtvWl6NqBu_RN8T7tFaFY5jkzdzsB9H-V370A)。
カンファレンスを巡ってフィードバックを収集する予定であり、最初の場所は [Observability Day](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/co-located-events/observability-day/) です。
CNCF の Slack インスタンスの [#telemetry-analysis](https://cloud-native.slack.com/archives/C04LXHPDW6M) でディスカッションに参加してください。

#### 2 - ドキュメントと検索 {#2---documentation-and-searches}

**Q:** ドキュメントや質問の回答を見つけるためにどこを探しますか？

**A:** 公式ドキュメントや GitHub リポジトリなど、多くのリソースがあります。

リソースの改善に役立てるため、エンドユーザーとしてのフィードバックを集めたいと考えています。
OTel の情報を見つけるためのプロセスはどのようなものですか？
Stack Overflow で回答を検索したり、質問を投稿したりしていますか？
コミュニティでは、質問を検索可能にインデックスできる選択肢を調査しています。
その 1 つが Stack Overflow です。
以下のいずれかの方法で回答を共有してください！

## ミーティングノートと録画 {#meeting-notes--recordings}

上記のトピックをさらに詳しく知るには、以下をご確認ください。

- [AMER](https://docs.google.com/document/d/1p_FoGbLiDC9VPqqLblJqQtHBn3tr-aPxhu2GaIykU6k)
  ミーティングノート
- [EMEA](https://docs.google.com/document/d/1fh4RWyZ-ScWdwrgpRHO9mnfqLSKfxUTf4wZGdUvnnUM)
  ミーティングノート
- [APAC](https://docs.google.com/document/d/1eDYC97LfvE428cpIf3A_hSGirdNzglPurlxgKCmw8o4)
  ミーティングノート

## 参加しませんか {#join-us}

OpenTelemetry を組織でどのように活用しているかのストーリーを共有したい方は、ぜひお聞かせください！
共有方法:

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の [#otel-endusers チャンネル](/community/end-user/slack-channel/)に参加する
- 毎月開催の[エンドユーザーディスカッショングループ](/community/end-user/discussion-group/)に参加する
- [OTel in Practice](/community/end-user/otel-in-practice/) セッションに参加する
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)でストーリーを共有する

OpenTelemetry を [Mastodon](https://fosstodon.org/@opentelemetry) や [Twitter](https://twitter.com/opentelemetry) でフォローし、**#OpenTelemetry** ハッシュタグを使ってストーリーを共有してください！
