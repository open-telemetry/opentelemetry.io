---
title: 'Keycloak のオブザーバビリティへの道のり：プロジェクトメンテナーのためのガイド'
linkTitle: Keycloak のオブザーバビリティへの道のり
date: 2026-11-02
author: >-
  [Marcin "Perk" Stożek](https://github.com/perk) (Elastic), [Martin
  Bartoš](https://github.com/mabartos) (IBM), [Juliano
  Costa](https://github.com/julianocosta89) (Dash0), [Johanna
  Öjeling](https://github.com/johannaojeling) (community), [Fabrizia
  Rossano](https://github.com/frossano-grafana) (Grafana Labs), [Alexander
  Schwartz](https://github.com/ahus1) (IBM)
issue: 10950
sig: Developer Experience SIG
default_lang_commit: 14ce4396ff6debc4ac4cb9aee6f7e2273d445575
cSpell:ignore: Bartoš exemplars Fabrizia Keycloak Rossano Stożek Öjeling
---

Developer Experience SIG では、進行中のシリーズの一環として、OpenTelemetry の実際のデプロイメントについて組織にインタビューを行い、実践的な教訓をより広いコミュニティと共有しています。
この記事では CNCF プロジェクトである [Keycloak](https://www.keycloak.org/) を取り上げ、出荷するソフトウェアにネイティブな OpenTelemetry サポートを追加するプロジェクトメンテナーの視点から、その道のりを見ていきます。

Identity and Access Management（IAM）ソリューションが必要になったことがあるなら、Keycloak が候補に挙がった可能性は高いでしょう。
Keycloak は広く使われているコミュニティ主導のオープンソース IAM システムで、OpenID Connect（OIDC）、OAuth 2.0、SAML などの業界標準プロトコルを通じて、人間と人間以外のユーザーの両方を認証し、アプリケーションを保護します。

Keycloak チームの [Martin Bartoš](https://github.com/mabartos) と [Alexander Schwartz](https://github.com/ahus1) がシステムの本番運用への準備を改善しようとしたとき、彼らは「すぐに使える」オブザーバビリティ体験を思い描いていました。
[Quarkus](https://quarkus.io/) Java フレームワークを基盤として、高リスクな認証フローでユーザーが信頼できるネイティブテレメトリーを目標としていました。
しかし、スムーズな OpenTelemetry 統合への道のりは、メンテナーにとっての旅がアーキテクチャ上のトレードオフに関するものであることが、新しいシグナルの実装と同じくらい多いことを明らかにしました。

## ネイティブがエージェントに勝るとき：Java の世界からの教訓 {#when-native-beats-agents-lessons-from-the-java-world}

最初の明らかな一手は [OpenTelemetry Java エージェント](/docs/zero-code/java/agent/)でした。
これは起動時にアタッチしてバイトコードをオンザフライで書き換えることで、あらゆる JVM アプリにトレーシングを導入するゼロコードの方法です。
これにより、チームは OpenTelemetry の機能をすばやく試すことができましたが、コストはすぐに現れました。
Keycloak の場合、エージェントはほぼ瞬時の起動に数十秒を追加しました。
これは Keycloak に限った問題ではありません。
エージェントはアプリケーションがロードするすべてのクラスをスキャンし、場合によっては変換する必要があり、エージェントのメンテナーも[この起動オーバーヘッドがこのアプローチに固有のものであることを確認しています](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/8629)。
ユーザーからは起動時間がおよそ3分の1増加したとの報告があります。

> 「OpenTelemetry Java エージェントにより機能を試すことはできましたが、Keycloak の起動が非常に遅くなりました」と Alexander Schwartz はインタビューで述べました。
> 「即座のパフォーマンスと迅速なスケーリングが重要なセキュリティに敏感なアプリケーションにとって、起動時間に数十秒を追加することは、サポートしたいことではありませんでした。」

チームはネイティブの Quarkus 統合に移行しました。
これにより、必要なテレメトリーを維持しながら高速な起動を保つことができました。
同様にパフォーマンスに敏感なアプリケーションのメンテナーにとって、汎用エージェントよりもネイティブフレームワークサポートを優先する価値があります。

## シグナルの統合：メトリクスとトレース {#integrating-the-signals-metrics-and-traces}

Keycloak のオブザーバビリティへの道のりはメトリクスから始まり、すぐに価値をもたらしましたが、チームはまもなくトレーシングが深い根本原因分析に欠けているピースであることに気づきました。
データベースや LDAP のボトルネックを伴う複雑なフローでは、トレーシングがリクエストがどこで停滞しているかを正確に特定するために必要なコンテキストを提供しました。
これらのシグナルをリンクする力が最も明確になったのは exemplars で、これにより開発者はメトリクスのスパイクから代表的なトレースに直接ジャンプでき、99パーセンタイルのレイテンシーをトラブルシューティングする時間を劇的に短縮しました。

断片化されたアーキテクチャの課題を振り返り、Martin Bartoš は次のように述べました。

> 「ミートアップやカンファレンスでコミュニティのメンテナーから、断片化されたオブザーバビリティスタックのセットアップが非常にわかりにくいとよく聞きます。
> Keycloak での私たちの目標は、ユーザーに切断された Prometheus エンドポイント、個別のトレーシング拡張機能、独立したログアグリゲーターをやりくりさせるのではなく、1つのネイティブなパラダイムのもとでこの体験を完全に統一することです。」

## Keycloak でトレーシングを有効にする {#enabling-tracing-in-keycloak}

トレーシングは Keycloak 独自の設定を通じて有効にします。
OpenTelemetry サポートはデフォルトで有効になっていますが、積極的に使用するにはトレーシングなどの少なくとも1つのコンポーネントを有効にする必要があります。
以下の設定で、Keycloak はトレースのエクスポートを開始します。

```sh
bin/kc.sh start --tracing-enabled=true ...
```

または、Operator を使用して Kubernetes に Keycloak をデプロイする場合は以下のようにします。

```yaml
apiVersion: k8s.keycloak.org/v2alpha1
kind: Keycloak
metadata:
  name: example-kc
spec:
  telemetry:
    endpoint: http://localhost:4317 # デフォルトのオプション
    serviceName: keycloak # デフォルトのオプション
    protocol: grpc # デフォルトのオプション
  tracing:
    enabled: true
```

これらの機能のセットアップに関する完全なガイドについては、[テレメトリー](https://www.keycloak.org/observability/telemetry)と[トレーシング](https://www.keycloak.org/observability/tracing)に関する Keycloak の公式ドキュメントを参照してください。

![HTTP リクエスト、認証フロー、データベースクエリのスパンを含む Keycloak トレースを表示する Jaeger UI](jaeger-tracing.png)

_画像ソース：[Keycloak トレーシングガイド](https://www.keycloak.org/observability/tracing)。_

## 「信頼」のトレードオフ：プッシュモデルとプルモデル {#the-trust-trade-off-push-vs-pull-models}

OpenTelemetry への移行は、データの信頼に関する根本的な議論も浮き彫りにしました。
Prometheus のような従来のプルベースモデルは、スクレイパーが既知の信頼されたエンドポイントに接続するため、高い信頼性を提供します。
Alexander Schwartz はその懸念を次のように説明しました。

> 「従来の Prometheus のバックグラウンドから来ると、プルベースシステムの組み込みのバックプレッシャーと信頼されたアンカリングを重視しています。
> アーキテクチャがオープンな TCP ソケットを介したプッシュベースのテレメトリーに完全に依存する場合、プラットフォームオペレーターにとって複雑な境界の問題が生じます。
> そのメトリクスの主張の送信元 Pod を本当に検証できるのか、あるいは侵害された Pod が不正なシグナルでインフラストラクチャを圧倒する可能性があるのか、ということです。」

プッシュベースのシグナルにおける組み込みのバックプレッシャーの欠如は、メンテナーにとって依然として中心的な懸念事項です。
メンテナーはオブザーバビリティスタック自体が負債になりかねない過負荷からアプリケーション環境を守る必要があります。

## 課題とコミュニティのニーズ {#pain-points-and-community-needs}

今後を見据えると、さらなる標準化とより良いツールへの明確な要望があります。
Keycloak にとって、アイデンティティプロバイダー向けの標準化された[セマンティック規約](/docs/specs/semconv/)が存在しないことは、カスタム接頭辞に頼ることを意味し、エコシステム全体の一貫性を期待するユーザーにとって摩擦を生んでいます。

Martin Bartoš は、専門家でない人にとって参入障壁が依然として高いことを強調しました。

> 「ほとんどの開発者は OpenTelemetry の専門家ではなく、ビジネスコンプライアンス要件を実装する新参者です。
> その道のりは急な学習曲線から始まるため、エコシステムには、デプロイ前に破壊的変更を防ぐための明示的なベストプラクティスのガイドと自動検証ツールが緊急に必要です。」

チームはまた、OpenTelemetry の導入を検討しているメンテナーが [Weaver](https://github.com/open-telemetry/weaver) のようなより良い検証ツールや、新参者が統合プロセスをナビゲートするのに役立つ包括的なガイドから恩恵を受けるだろうと指摘しました。

## メンテナー仲間への戦略的な教訓 {#strategic-takeaways-for-fellow-maintainers}

この道のりに踏み出すメンテナー仲間に向けて、Keycloak チームの経験はいくつかの具体的な教訓を示しています。
エージェントにコミットする前にそのコストを測定しましょう。
起動に敏感なアプリケーションには、ネイティブフレームワーク統合のほうが適しています。
最初に効果をもたらすシグナルから始め、次にすべてのシグナルを1つのネイティブ設定のもとに統一することで、ユーザーが断片化されたスタックを組み立てる必要がないようにしましょう。
プッシュベースのテレメトリーは単なる運用上の詳細ではなく、脅威モデルの変更として扱いましょう。
そして、セマンティック規約がまだ自分のドメインをカバーしていない場合は、属性名を慎重に選び、上流の規約が到着したら収束する準備をしておきましょう。
