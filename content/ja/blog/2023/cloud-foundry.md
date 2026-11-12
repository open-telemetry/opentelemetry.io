---
title: '体験レポート: Cloud Foundry におけるメトリクスのための OpenTelemetry の導入'
linkTitle: Cloud Foundry での OpenTelemetry
date: 2023-11-08
author: >-
  [Matthew Kocher](https://github.com/mkocher) (VMware) and [Carson
  Long](https://github.com/ctlong) (VMware)
default_lang_commit: 1b7f33e30a91ebf48b6c9d00f7808b4021fb74dd
cSpell:ignore: Kocher
---

{{< blog/integration-badge >}}

[Cloud Foundry](https://www.cloudfoundry.org/) は最近、メトリクスの送出に [OpenTelemetry Collector](/docs/collector/) を統合しました。
その過程で多くのことを学びました。
この統合が現在提供するものと、今後の可能性に期待しています。

## 私たちが求めていたもの {#what-we-were-looking-for}

Cloud Foundry は、12-factor アプリケーションを実行する大規模なマルチテナントの Platform as a Service です。
Cloud Foundry のプラットフォームエンジニアリングチームは通常、数千のアプリケーションと数十万のコンテナを実行する 4〜8 の Cloud Foundry デプロイメントを運用しています。
Cloud Foundry のユーザーは多く、メトリクスに関する私たちの目標は、単一のソリューションを強制するのではなく、プラットフォームエンジニアリングチームが選択した監視ツールと統合できるようにすることです。

歴史的に、新しい監視ツールのサポートを追加するには、独自の Firehose API を使用し、各ツールに対して新しい「ノズル」を作成する必要がありましたが、これは参入障壁が高いものでした。
Firehose API は、大量のログとメトリクスを扱う際に固有のパフォーマンス上の制限があることもわかりました。
スケーラブルでない API とスケーラブルでない統合アプローチを前に、Cloud Foundry からメトリクスを送出する方法の置き換えを検討し始めました。

私たちは、ボトルネックや単一障害点なしに、数百の VM と数千のコンテナからメトリクスをスケーラブルに送出する方法を求めていました。
また、プラットフォームエンジニアリングチームが使いたいと思う多くの監視ツールをサポートするために取り組む本当のコミュニティを求めていました。
そうすることで、カスタム統合の作成とメンテナンスの業務から解放されたかったのです。

## 私たちが評価したもの {#what-we-evaluated}

各 VM にエージェントを追加し、監視ツールにメトリクスを直接送信するアプローチについては、容易に合意が得られました。
Cloud Foundry 内では、このアプローチがログの送出においてうまく機能し、ボトルネックと単一障害点を排除することをすでに確認していました。

私たちはいくつかの人気のあるメトリクス送出ソリューションを評価しました。
OpenTelemetry のほかに、[Fluent Bit](https://fluentbit.io/) と [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/) も真剣に検討しました。

検討したすべてのソリューションについて、以下の観点で評価しました。

- 柔軟性: いくつの監視ツールに送信できるか？
- パフォーマンス: CPU とメモリの使用効率はどうか？
- コミュニティ: コミュニティはどの程度活発か？
  どの言語やツールを使用しているか？
- デプロイ: BOSH ジョブとしてデプロイでき、Cloud Foundry デプロイメントの制約内で動作するか？
  設定のホットリロードは可能か？

## OpenTelemetry を選んだ理由 {#why-we-chose-opentelemetry}

Fluent Bit を評価したとき、C 言語で書かれていることがわかりました。
これにはパフォーマンス上の利点がある可能性がありますが、私たちは主に Go で開発しています。
コードベースへの貢献が最小限になることを懸念し、将来的に制約になると心配したため、Fluent Bit は早い段階で候補から外しました。

次に、Telegraf と OpenTelemetry をより真剣に検討しました。
どちらも Go で書かれているため、その点は問題ありませんでした。
OpenTelemetry を選んだ主な理由は、カスタマイズ可能なビルドプロセスが利用できることでした。
OpenTelemetry では、独自のコンポーネントとコミュニティコンポーネントを厳選した [Collector をビルド](/docs/collector/extend/ocb/)できます。

さらに、OpenTelemetry を調査する中で、多くの[ツール](/ecosystem/integrations/)や[ベンダー](/ecosystem/vendors/)が [OpenTelemetry Protocol](/docs/specs/otlp/)（OTLP）のネイティブサポートを追加していることがわかりました。
これにより、OTLP の広く採用されているファーストパーティ実装として OpenTelemetry Collector を採用することに確信を持てました。

私たちは [RFC で Cloud Foundry に OpenTelemetry Collector を追加することを提案](https://github.com/cloudfoundry/community/blob/0365df129e52ae7b784957a5569b16b7e133f97e/toc/rfc/rfc-0018-aggregate-metric-egress-with-opentelemetry-collector.md)し、コミュニティからのフィードバックを募りました。
2023年7月7日に承認され、作業に取りかかりました。

## 既存のメトリクスシステムと OpenTelemetry の統合方法 {#how-we-integrated-opentelemetry-with-our-current-metric-system}

Cloud Foundry では、ログとメトリクスの転送を担当する一連のエージェントがあります。
入り口となるのは「Forwarder Agent」で、独自のカスタムフォーマットでログとメトリクスを受け取り、他のエージェント向けに多重化します。

私たちはエージェントにメトリクスを OTLP に変換して OpenTelemetry Collector に転送するサポートを追加しました。
これに必要だったのは[わずか 200 行の Go コード](https://github.com/cloudfoundry/loggregator-agent-release/blob/1fd275fe85d6190bac73dc1195007cc8726c1871/src/pkg/otelcolclient/otelcolclient.go#L108-L153)で、その多くの行は単に波括弧を閉じているだけでした。
このコードを書く際に、既存のデータモデルを OpenTelemetry の protobuf データモデルに変換する方法を考える必要がありました。
OpenTelemetry は、私たちが過去に遭遇した多くのエッジケースや、まだ遭遇していないエッジケースも考慮していることがわかりました。
いつか[スコープ](/docs/concepts/instrumentation-scope/)と[リソース](/docs/concepts/resources/)を効果的に活用する方法を理解したいと思っています。

私たちの実装はうまく機能しましたが、OpenTelemetry Collector が大量の CPU を使用していることがわかりました。
最初は最もシンプルなことから始め、gRPC リクエストごとに 1 つのメトリクスしか送信していませんでした。
[バッチ処理を追加](https://github.com/cloudfoundry/loggregator-agent-release/pull/396)したところ、Collector のリソース使用率は大幅に低下しました。

## Cloud Foundry プラットフォームエンジニアリングチームでの動作 {#how-it-works-for-cloud-foundry-platform-engineering-teams}

プラットフォームエンジニアリングチームは、[Cloud Foundry をデプロイする際にオプションで OpenTelemetry Collector のエクスポーター設定を提供](https://github.com/cloudfoundry/cf-deployment/blob/fcde539a81a6b091a25d06992e16bb2fb641a329/operations/experimental/add-otel-collector.yml)できるようになりました。
デプロイメント内のすべての VM は、その設定を使用して指定した監視ツールにメトリクスを転送する Collector を実行します。

私たちは小さく始め、現在は OTLP と Prometheus のエクスポーターのみをサポートしています。
しかし、プラットフォームエンジニアリングチームがどの追加エクスポーターを使いたいかを聞き、それらを OpenTelemetry Collector ディストリビューションに追加することを楽しみにしています。

## 今後について {#whats-next}

この作業に着手した際、メトリクスだけに焦点を当てました。
OpenTelemetry Collector 統合でサポートする別のシグナルタイプとして、ログを追加する明確な道筋があります。
Cloud Foundry の組み込みシグナルとしてトレースはまだサポートしていませんが、プラットフォームコンポーネントとプラットフォーム上で実行されるアプリケーションの両方にトレースが提供できる可能性に期待しています。

現在の OpenTelemetry Collector 統合は、私たちが「集約ドレイン」と呼んでいるものを提供しています。
これは、プラットフォームまたはプラットフォーム上で実行されているアプリケーションによって生成されたシグナルを送出します。
また、「アプリケーションドレイン」も提供したいと考えています。
これは、個々のアプリケーションからアプリケーションチームが選択した監視ツールにのみシグナルを送出するものです。
これには複雑なルーティングとエクスポーターの頻繁な作成・削除が必要であり、新しい OpenTelemetry Collector の機能が必要になる可能性があります。

これらの目標を達成できれば、エージェントスイート全体を各 VM 上で実行される単一の OpenTelemetry Collector に置き換えることができます。
それらの Collector は、システムコンポーネントのログ、メトリクス、トレースに加えて、プラットフォーム上で実行されるすべてのアプリケーションのログ、メトリクス、トレースも処理できるようになります。
