---
title: 2023年2月の OpenTelemetry エンドユーザーディスカッションまとめ
linkTitle: エンドユーザーディスカッション 2023年2月
date: 2023-03-07
author: '[Pranay Prateek](https://github.com/pranay01) (SigNoz)'
body_class: otel-with-contributions-from
default_lang_commit: f3179baa7e430026f2fd9b960faee07a7d1e16db
---

[Henrik Rexed](https://github.com/henrikrexed)（Dynatrace）、
[Michael Hausenblas](https://github.com/mhausenblas)（AWS）、
[Rynn Mancuso](https://github.com/musingvirtual)（Honeycomb）、
[Reese Lee](https://github.com/reese-lee)（New Relic）、
[Adriana Villela](https://github.com/avillela)（Lightstep）の協力のもと作成。

OpenTelemetry のエンドユーザーグループミーティングは、南北アメリカ（AMER）、ヨーロッパ・中東・アフリカ（EMEA）、アジア太平洋（APAC）のユーザーを対象に毎月開催されています。

ディスカッションは [Lean Coffee 形式](https://agilecoffee.com/leancoffee/)で行われ、参加者は[このような Agile Coffee ボード](http://agile.coffee/?http_ok#3716060f-183a-4966-8da4-60daab2842c4)にトピックを投稿し、出席者全員が話したいテーマに投票します。

## 話し合ったこと {#what-we-talked-about}

今月のディスカッションでは、以下のトピックが取り上げられました。

- トレースのサンプリング
- ビジネスメトリクスの送信
- OpenTelemetry Collector のヘルスモニタリング
- OTel Collector のバックアップ/バッファ機能

## ディスカッションのハイライト {#discussion-highlights}

以下は今月のディスカッションのまとめです。

### OpenTelemetry Collector {#opentelemetry-collector}

#### 1 - OTel Collector のヘルスモニタリング {#1---monitoring-otel-collectors-health}

**Q:** OTel Collector のヘルスモニタリングやエージェントのテレメトリーを収集するパターンについて、何か提案はありますか？

**A:** Collector は他の Collector からテレメトリーデータを収集するために使用でき、必ずしも別のテレメトリーシステムである必要はありません。
また、複数のシグナルを収集することを検討すべきです。
1 つのシグナルが失敗しても、別のシグナルでアラートを受け取れるようになります。
これについて議論している[記事](https://ref.otel.help/otel-collector-ops/)をご覧ください。

#### 2 - OpAMP エクステンションのタイムライン {#2---timeline-for-opamp-extension}

**Q:** エージェント管理のための [OpAMP 仕様](https://github.com/open-telemetry/opamp-spec)の実装について、何かタイムラインはありますか？

**A:** 現時点では最優先事項ではありません。
コミュニティから OpAMP のメンテナーがいるとよいでしょう。
進捗を追跡するには、[issue #16462](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/16462) をご覧ください。

#### 3 - OTel Collector のバッファ機能 {#3---buffer-capabilities-of-otel-collector}

**Q:** エンドポイントが利用できない場合の OTel Collector のバックアップ/リトライバッファ機能にはどのようなものがありますか？

**A:** バッファリングとデータの永続化をサポートするための実験的な[ストレージエクステンション](https://github.com/open-telemetry/opentelemetry-collector/tree/232c878cd0a5631cf93f40cbd3fe9c266ed9e6b7/extension/experimental/storage?from_branch=main)が現在開発中です。

#### 4 - Collector の定期的なプロファイリングによるパフォーマンス改善 {#4---periodically-profiling-collectors-to-improve-performance}

**Q:** Collector を定期的にプロファイリングし、継続的にパフォーマンスを改善する取り組みはありますか？

**A:** OpenTelemetry Collector で負荷テストを実行する GitHub Action がありますが、それを改善するために取り組んでいる人はいません。

### OpenTelemetry 言語 API と SDK {#opentelemetry-language-api--sdks}

#### 1 - Go SDK のタイムライン {#1---timeline-for-go-sdk}

**Q:** OTel Go SDK の仕様完全準拠のタイムラインはどうなっていますか？

**A:** Go OTel SDK では、現在の進捗は主にメトリクスに関するものです。
ログの開発は凍結されています。
メトリクス SDK で大きな作業が行われています。
Go メトリクスの進捗を追跡するには、[Metric プロジェクトテーブル](https://github.com/open-telemetry/opentelemetry-go/projects?query=metric)をご覧ください。
メトリクスが完了したら、ログに取りかかる予定です。

### OpenTelemetry トレース {#opentelemetry-traces}

#### 1 - トレースのサンプリング {#1---sampling-for-traces}

**Q:** スパン数に基づいてトレースをサンプリングする方法はありますか？
例: 1 つのトレースに1000以上のスパンがあるトレースをドロップ/切り詰める。

**補足:** アプリケーション自体の問題により、一部のトレースが不要な大量のスパンを生成することがあります。
これを OpenTelemetry で制御する方法はありますか？
具体的には、あるトレースのスパン数が「n」を超えた場合に、スパンをドロップまたは切り詰めるような条件を設定する方法はありますか？

**A:** テイルベースサンプリングプロセッサーは、ユーザーにさまざまなサンプリングポリシーを提供しています。
スパン数はそのようなポリシーの 1 つです。
複数のポリシーを組み合わせることもできます。
テイル[サンプリングプロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/549e115b28292c164eb671618c0ec8b728b69d2a/processor/tailsamplingprocessor/README.md?from_branch=main)のリンクはこちらです。
スパン数ポリシーは最小スパン数に基づいています。
一部のユーザーは何らかの除外ポリシーを求めるかもしれません。

#### 2 - スパンリンクのユースケース {#2---use-cases-of-span-links}

**Q:** スパンリンクのユースケースは何ですか？

**A:** [スパンリンク](/docs/concepts/signals/traces/#span-links)は、1 つ以上のスパン間の因果関係を示すために使用されます。
これは元のトレース仕様の一部であり、現在のステータスは安定版です。
関連しているが非同期に実行されるトレースをリンクするために使用できます。

たとえば、スパンリンクはバッチ操作で、複数の開始スパンによって起動されたスパンをリンクするために使用できます。
スパンはリンクを介して多対多のマッピングを持つことができます。
Jaeger は UI でスパンリンクをサポートしています。

### OpenTelemetry メトリクス {#opentelemetry-metrics}

#### 1 - 他のメトリクス形式のサポート {#1---supporting-other-metrics-format}

**Q:** OTel Collector は statsd ライブラリなどの他のライブラリから生成されたメトリクスをサポートできますか？

**A:** [OpenTelemetry Collector contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) には、使用できるさまざまな種類のメトリクスの[レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/944d4a82c408d58f9d8ba1a1d4783094301af0de/receiver?from_branch=main)が多数あります。
たとえば、Prometheus 形式でメトリクスを送信している場合、OTel Collector を Prometheus メトリクスをスクレイプするように設定できます。
[statsd レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/statsdreceiver?from_branch=main)も利用可能です。
すでに動作しているものがある場合、変更する必要はありません。
[レシーバーの一覧](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/944d4a82c408d58f9d8ba1a1d4783094301af0de/receiver?from_branch=main)をご確認ください。

#### 2 - ビジネスメトリクスの送信 {#2---emitting-business-metrics}

**Q:** ビジネスメトリクスを送信するためにどのシグナルを使用していますか？
たとえば、任意の時点で、カウンターに似たものを送信するが、一度だけ送信する場合。

**A:** これに関する[現在のイシュー](https://github.com/open-telemetry/opentelemetry-specification/issues/2318)があり、追跡できます。
ビジネスメトリクスの例としては、特定のページにアクセスするユーザーをカウンターで追跡することが挙げられます。

### OpenTelemetry の導入と普及 {#opentelemetry-adoption--enablement}

#### 1 - APAC 地域からのコントリビューションの改善 {#1---improving-contributions-from-apac-region}

**Q:** APAC 地域からのコントリビューションを改善するにはどうすればよいですか？

**A:** コミュニティからの提案:

- 現在の OpenTelemetry メンテナーに連絡を取り、課題を共有する
- APAC 地域のメンテナーのリストを作成し、人々が連絡できるようにする
- OpenTelemetry ユーザー向けのローカルな対面ミートアップ
- OTel リポジトリの `good first issues` から始めるのがよい出発点であり、GitHub イシューで助けを求める
- [OTel Slack コミュニティ](https://communityinviter.com/apps/cloud-native/cncf)に参加し、関連するチャンネルでやり取りする

## その他の重要な議論ポイント {#other-important-discussion-points}

コミュニティでは以下の重要なポイントも議論されました。

### テレメトリーデータを収集するソースの自動検出 {#auto-discovery-of-sources-to-collect-telemetry-data}

**Q:** OTel Collector は既知のソースを自動的に検出し、そこからテレメトリーを収集できますか？

**A:** OTel Collector が既知のソースからテレメトリーを収集するために自己設定するというアイデアです。
Prometheus は Kubernetes で自動サービスディスカバリーを備えています。
現在、Collector にはこれを解決するものはありません。

[レシーバークリエーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/2f469687a6d48b2a9637eba1a751388f7af81f87/receiver/receivercreator/README.md?from_branch=main)は、観測されたエンドポイントが設定されたルールに一致するかどうかに基づいて、実行時に他のレシーバーをインスタンス化できます。
レシーバークリエーターを使用するには、まず 1 つ以上の[オブザーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/3b3c4d23ebe578ffd2a30457d1181e3711fc28a8/extension/observer/README.md?from_branch=main)を設定する必要があります。
[Kubernetes オブザーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/extension/observer/k8sobserver?from_branch=main#kubernetes-observer)を使用すると、Kubernetes API を介して Kubernetes の Pod、ポート、ノードのエンドポイントを検出し報告できます。

### Azure 内での OTel Collector のホスティングパターンの提案 {#hosting-pattern-suggestion-of-the-otel-collector-within-azure}

**Q:** Azure App Services や Azure Functions からテレメトリーを収集するために、Azure 内での Collector のホスティングパターンについて何か提案はありますか？

**A:** 通常、コミュニティはベストプラクティスの提供について Microsoft の方々に頼っています。
[OTel の1.4バージョンと Azure Functions 7 に関する問題](https://github.com/Azure/azure-functions-host/issues/8938)がありました。

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
