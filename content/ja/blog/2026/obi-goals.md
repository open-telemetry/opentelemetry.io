---
title: OpenTelemetry eBPF Instrumentation 2026年の目標
linkTitle: OBI 2026年の目標
date: 2026-01-23
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk)
sig: SIG eBPF Instrumentation
default_lang_commit: f5b3c44e7ed3e98a7307379e8c867750dd2f1dea
cSpell:ignore: AMQP grcevski marctc MQTT NATS NimrodAvni rafaelroquetto Yahn
---

2026年を迎えるにあたり、[OpenTelemetry eBPF Instrumentation](/docs/zero-code/obi/) SIG は今年の野心的なロードマップを策定しました。
私たちは、安定版 1.0 リリースによる本番環境での利用準備を達成しつつ、より幅広いユースケースに対応するためにプロトコルと言語のサポートを拡大することに注力しています。
また、ハイブリッド計装アプローチをサポートするために、OpenTelemetry の API および SDK との統合を強化しています。
OBI を初めて知る方は、上記のドキュメントリンクからゼロコード計装による eBPF を活用したオブザーバビリティについて詳しくご覧ください。

## 目標 {#goals}

2026年の優先事項と、各イニシアチブを支えるキーコントリビューターの概要を紹介します。

### 安定版 1.0 リリース {#stable-10-release}

- トラッキングイシュー:
  [#1133](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1133)
- スポンサー: [@MrAlias](https://github.com/MrAlias)

安定版 1.0 リリースの達成は、2026年の最重要目標です。
このマイルストーンは、OBI が本番環境へのデプロイに対応していることを示すものであり、他のすべてのイニシアチブの基盤となります。
1.0 への道のりは、包括的なドキュメント、設定の標準化、本番対応の検証という3つの重要な領域に焦点を当てています。

すべての設定オプションに対する完全なドキュメントを構築しており、モダンなエディターでのバリデーションとオートコンプリートを可能にする JSON スキーマ定義も含まれます。
OpenTelemetry コミュニティが[宣言的設定標準](https://github.com/orgs/open-telemetry/projects/38)を安定化させるにつれて、OBI はこれらの標準を採用し、OpenTelemetry エコシステム全体で一貫した設定を実現します。
これには、サービスごとおよびプロセスごとの設定のサポートも含まれており、複雑な環境でのテレメトリー収集をきめ細かく制御できます。

1.0 リリースには、テレメトリースキーマの採用、包括的なバージョニングドキュメント、目標とするテストカバレッジの閾値の達成も含まれます。
これらの投資により、信頼性と安定性が最も重要視される本番環境で OBI を安心してデプロイできるようになります。

### プロトコルサポートの拡大 {#expanding-protocol-support}

- トラッキングイシュー:
  [#1134](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1134)
- スポンサー: [@marctc](https://github.com/marctc)、
  [@NimrodAvni78](https://github.com/NimrodAvni78)

OBI は現在 HTTP、gRPC、SQL プロトコルをサポートしていますが、モダンなアプリケーションは多様な通信パターンのエコシステムに依存しています。
この目標では、OBI のプロトコル対応範囲をメッセージングシステム、NoSQL データベース、クラウドサービス SDK に拡大します。

メッセージングシステムについては、MQTT、AMQP、NATS、Redis pub/sub のサポートを追加し、イベント駆動アーキテクチャや非同期通信を行うマイクロサービスのオブザーバビリティを実現します。
データベース側では、MongoDB のサポートを拡張し、圧縮やレガシーバージョンへの対応も含みます。
また、完全なコンテキスト伝搬のサポートにより gRPC の計装も強化しています。

おそらく最も重要な取り組みとして、Google Cloud、AWS、Azure のクラウドサービス SDK の計装に取り組んでいます。
これにより、クラウド API 呼び出しの可視性が提供され、チームがアプリケーションとクラウドインフラストラクチャとのインタラクションを理解し、分散クラウドネイティブシステムにおけるパフォーマンスのボトルネックを特定するのに役立ちます。

### .NET のサポート {#supporting-net}

- トラッキングイシュー:
  [#1136](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1136)
- スポンサー: [@rafaelroquetto](https://github.com/rafaelroquetto)

.NET は、OBI が完全にサポートする必要がある最後の主要言語エコシステムのひとつです。
初期テストでは .NET 9 以降のバージョンで有望な結果が得られており、.NET エコシステム全体でこのサポートを拡大・検証することに注力しています。

私たちの作業には、サポート対象バージョン範囲の決定（モダン .NET（バージョン 8 以降）と .NET Framework（バージョン 4.x および 3.5 SP1）の両方）、およびすべてのサポート対象バージョンでコンテキスト伝搬が確実に動作することの確認が含まれます。
分散トレーシングと RED メトリクス（Rate、Errors、Duration）の収集を検証するための包括的な統合テストを構築し、.NET アプリケーションが他のサポート対象言語と同レベルのオブザーバビリティを得られるようにしています。

この拡張は、.NET に大きな投資をしている企業にとって特に重要であり、既存の OpenTelemetry インフラストラクチャとシームレスに統合されるゼロコード計装によるオブザーバビリティを提供します。

### OTel API/SDK を活用したハイブリッド計装 {#hybrid-instrumentation-with-otel-apissdks}

- トラッキングイシュー:
  [#1140](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1140)
- スポンサー: [@grcevski](https://github.com/grcevski)

多くの組織は、ゼロコード eBPF 計装と OpenTelemetry API および SDK を使用した手動計装を組み合わせたハイブリッドアプローチを採用しています。
この目標は、これらのアプローチがシームレスに連携し、競合やテレメトリーの重複ではなく付加価値を提供できるようにすることです。

OBI が SDK で生成されたトレースをラップし、計装ソースに関係なくリクエストのタイミング情報が正確に保たれる機能を開発しています。
また、OBI と SDK のテレメトリー間で一貫したラベリング、どちらのソースからのトレース情報も参照するメトリクスエグザンプラー、およびすべてのサポート対象言語にわたって手動計装と自動計装を組み合わせる機能（Go ですでに利用可能なものをベースに構築）にも取り組んでいます。

このハイブリッドアプローチは、段階的にオブザーバビリティを導入する場合に特に有用です。
チームはまずゼロコード eBPF 計装で即座に可視性を獲得し、その後どちらかのアプローチを選ぶ必要なく、ビジネス固有のインサイトのために手動計装を追加できます。

### その他の注力領域 {#additional-focus-areas}

これら4つの主要目標に加えて、OBI と広範な OpenTelemetry エコシステムとの統合を強化するいくつかの支援イニシアチブにも優先的に取り組んでいます。
ネットワーク属性を [OpenTelemetry セマンティック規約](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1092)に合わせるとともに、すべてのセマンティック規約の使用を[最新バージョン](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1135)に更新しています。
また、OBI をレシーバーとして組み込んだ [OpenTelemetry Collector ディストリビューション](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1157)の構築、統合オブザーバビリティのための [OpenTelemetry eBPF プロファイラー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1137)との統合、および OBI から直接[ランタイムメトリクス](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1139)を提供する取り組みも進めています。
2026年の目標の完全なリストについては、[ロードマップ全体](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues?q=is%3Aissue+is%3Aopen+label%3A%22goal%3A+2026%22)をご覧ください。

## 会話に参加する {#join-the-conversation}

これらの目標は、コミュニティのフィードバックとプロジェクトの成熟度に基づく優先事項を表しています。
これらの領域が皆さんのユースケースに対応しているか、また考慮すべきギャップがあるかどうか、ぜひお聞かせください。
皆さんの意見は OBI の開発を方向づけ、実際のデプロイメントにとって最も重要な機能を構築するのに役立ちます。

参加方法は以下のとおりです。

- **進捗を追跡する**: [2026年ロードマッププロジェクトボード](https://github.com/orgs/open-telemetry/projects/187/views/1)をフォローして、私たちの取り組み状況を確認してください
- **フィードバックを共有する**: [エピックイシュー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22goal%3A%202026%22%20label%3Aepic)や任意の2026年目標に、質問、提案、ユースケースをコメントしてください
- **ディスカッションに参加する**: [毎週の SIG ミーティング](https://github.com/open-telemetry/community?tab=readme-ov-file#sig-ebpf-instrumentation)に参加する、[CNCF Slack](https://slack.cncf.io) の [#otel-ebpf-instrumentation](https://cloud-native.slack.com/archives/C06DQ7S2YEP) チャンネルでつながる、または[ディスカッションを開始](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/discussions)してください
- **コントリビュートする**: [オープンイシュー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues)をチェックして、ゼロコード計装によるオブザーバビリティの未来を一緒に構築しましょう

## 謝辞 {#acknowledgments}

OBI が本番対応に向けて前進しているのは、グローバルかつマルチベンダーのコントリビューターコミュニティの協力の成果です。
コード、ドキュメント、テスト、フィードバック、そして熱意を通じてこのプロジェクトを実現してくださったすべての方に感謝します。
コミュニティと協力してこれらの目標を達成し、OpenTelemetry エコシステムに本番対応のゼロコード計装によるオブザーバビリティをもたらすことを楽しみにしています！
