---
title: OpenTelemetry eBPF Instrumentation が v1.0.0 に到達
linkTitle: OBI v1.0.0
date: 2026-10-30
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk)
issue: 12395
sig: SIG eBPF Instrumentation
# cSpell:ignore Aerospike Avni Beyla GenAI Giuseppe Grcevski
# cSpell:ignore Haibin Macias marctc Mattia Meleleo Nimrod Ognibene
# cSpell:ignore Ollama Qwen reranking Roquetto Tudurí Yahn
default_lang_commit: e234c145b84f7c5e029afd1c7458ae162c307432
---

OpenTelemetry eBPF Instrumentation（OBI）の v1.0.0 を発表できることを嬉しく思います。

[OBI](/docs/zero-code/obi/) は、ソースコードを変更することなく、実行中の Linux アプリケーションに OpenTelemetry のオブザーバビリティを提供します。
OBI は eBPF とランタイム固有の計装を組み合わせて、サービス、言語、フレームワークを横断してアプリケーションのメトリクスとトレースをキャプチャします。
リクエストレート、エラー、レイテンシー、サービス依存関係から始めて、ニーズの拡大に応じてより深い可視性を構築できます。

このリリースは、[2026年に設定したフラッグシップ目標](/blog/2026/obi-goals/)を達成するものです。
OBI の安定した基盤を確立するという目標です。
これは、計装カバレッジの拡大、正確性の向上、リリースツールの強化、そしてユーザーが OBI を長期的に運用するために必要な互換性とテレメトリー移行プラクティスの構築に費やした1年間の成果を反映しています。

ユーザーにとって最も重要な変更は予測可能性です。
アップグレード時に何が起こるかを把握し、何かが変わったときにどう進めばよいかを知ることができます。

OBI 1.0 は、Config v2、その生成スキーマ、ドキュメント化されたデプロイインターフェイス、サポート対象環境を含む、設定とデプロイに関する[ドキュメント化された互換性コミットメント][versioning]を確立します。

テレメトリーに関しては、OBI と OpenTelemetry が進化する中での信頼性の高い移行パスがコミットメントです。
OBI は、安定したセマンティック規約に従うテレメトリーと、規約がまだ策定中のテレメトリーを混在して出力します。
後者は、規約の成熟に伴い変更される可能性があります。
また、安定した規約に従うテレメトリーの実際の動作が規約に準拠していない場合、そのバグも修正します。

この進化を管理しやすくするために、OBI はテレメトリーを [Weaver 互換のスキーマレジストリ][registry]で記述しています。
[OpenTelemetry Weaver](https://github.com/open-telemetry/weaver) は、テレメトリーを定義、検証し、従うべき規約に照らしてレビューするのに役立ちます。
公開された[テレメトリースキーマ](/docs/specs/otel/schemas/)は、変更を表現できる場合にバージョン間の変換を記述し、追加の対応が必要な変更についてはリリースノートと移行ガイダンスで説明します。

ダッシュボード、アラート、処理パイプラインを管理するチームにとって、これはアップグレードを計画し、意図的に適応するための手段を提供します。
テレメトリーの進化に伴い、定義、ツール、ガイダンスを備えた、サポートされた前進パスを提供することが約束です。

この基盤には、プロジェクト全体にわたる大幅な進展が伴っています。

- **アプリケーション依存関係のより広い可視性。**
  1.0 に至るリリースを通じて、OBI は MQTT、NATS、AMQP 1.0、MSSQL、Couchbase、Memcached、Aerospike を含むシステムへの計装を追加しました。
  多様なテクノロジースタックを運用するチームにとって、これは1つの計装アプローチでデータベースとメッセージングのアクティビティを理解する機会が増えることを意味します。
  [サポートマトリクス][support]には、各プロトコルのカバレッジ、トレース伝搬機能、制限事項が記載されています。

- **より良いトレースとより有用なサービス詳細。**
  [HTTP/2 と gRPC の伝搬の改善][v0-14]により、既存の接続、多重化されたトラフィック、個々のストリームコンテキストの処理が強化されました。
  フレームワークルートの検出は Django、FastAPI、Flask、Rails、.NET、いくつかの PHP フレームワークに拡大しました。
  ルートテンプレートは、一意の URL をそれぞれ別のメトリクス系列にすることなく、遅いエンドポイントを区別するのに役立ちます。

- **自動計装からアプリケーション固有のインサイトへのパス。**
  OBI は、[サポートされている OpenTelemetry Go Trace API と Auto SDK の設定][v0-11]を通じて、アプリケーションが作成したスパンをキャプチャできます。
  Node.js でも、登録された SDK がないアプリケーション向けに[オプトインの手動スパンキャプチャ][v0-12-1]が追加されました。
  これらの機能により、開発者は OBI が周囲の自動計装を提供しつつ、ビジネスオペレーションに関する詳細を追加できます（ドキュメント化されたランタイム要件に従います）。

- **インシデント調査のためのより多くのコンテキスト。**
  [トレースとログの相関](/docs/zero-code/obi/trace-log-correlation/)は、サポートされているアプリケーションログをトレースコンテキストで拡充でき、チームがリクエストのパスからそれに関連するログへ移動するのに役立ちます。
  Mattia Meleleo の[ゼロコードによるトレースとログの相関のウォークスルー](/blog/2026/obi-trace-log-correlation/)では、2つのサービスにわたって動作する様子を示し、有効化の方法を説明しています。
  OBI はまた、TCP 再送信や接続失敗などのネットワーク測定とともに、[Go、Java、.NET、Node.js、Python にわたるランタイムメトリクス][runtime]を追加しました。
  ランタイムメトリクスは実験的なままであり、利用可能性はランタイムと有効化された機能に依存します。

- **AI アプリケーションのための計装。**
  OBI のカバレッジは、モデルプロバイダー、エンベディング、リランキング、ベクター検索、MCP インタラクションに拡大しました。
  この作業には、[ツール呼び出しと検索の計装][v0-10]、[OpenAI 互換ゲートウェイとネイティブ Ollama サポート][v0-11]が含まれます。
  これらの機能は、チームがアプリケーションの他の部分とともに AI の依存関係を調査するのに役立ちます。
  詳細な抽出には明示的なペイロードキャプチャと機能設定が必要であり、すべてのデプロイで自動的に有効化されるわけではありません。

<!-- prettier-ignore -->
1.0 の背後にある作業の多くは新しいプロトコルほど目立ちませんが、計装の運用に不可欠です。
コントリビューターは[パーサーを堅牢化し、ライフサイクルとエクスポートの動作を修正し][v0-12-1]、[バッファの安全性と接続中断のバグに対処し][v0-13]、トレースの親子関係を改善しました。
リリースツールには[署名されたアーティファクト、チェックサム、ソフトウェア部品表][rc2]が追加され、検証はカーネルとアーキテクチャ全体に拡大されました。
これらの投資は、ユーザーがデプロイするソフトウェアを評価し運用するのに役立ちます。

既存のユーザーにとって、Config v2 は 1.0 の設定の動作保証です。
v0.11.0 から利用可能であり、生成スキーマと `obi config validate` および `obi config migrate` コマンドが含まれます。
Config v1 は後方互換性のためにサポートが継続されますが、凍結されており修正や新機能は提供されません。
[設定移行ガイド][migration]に従い、環境変数を通じて提供される設定を確認し、広範にロールアウトする前にカナリアデプロイでテレメトリーを比較してください。
Collector に OBI を組み込んでいるユーザーは、バージョンを選択する際に[レシーバーの別の v0 リリースライン][receiver-versioning]も確認してください。

OBI を初めて使う場合は、サポートされている Linux ホストまたは Kubernetes クラスターで[代表的なサービスから始めてください](/docs/zero-code/obi/setup/)。
OpenTelemetry Collector または互換バックエンドにエクスポートし、得られたメトリクスとトレースを確認して、そこから拡張してください。
言語エージェントと手動計装は、OBI が自動的に観測できる範囲を超えたアプリケーション固有のコンテキストが必要な場合に引き続き有用です。

OBI は Grafana Beyla の寄贈から始まり、[組織を超えたコラボレーションと幅広い OpenTelemetry コミュニティを通じて最初のアルファリリースに到達しました](/blog/2025/obi-announcing-first-release/)。
そのコラボレーションがプロジェクトを 1.0 へと導きました。

このマイルストーンの達成に貢献した持続的な取り組みを行ったコントリビューターに特別な感謝を述べたいと思います。

- [Nikola Grcevski](https://github.com/grcevski) と
  [Mario Macias](https://github.com/mariomac)：OBI の計装基盤の開発、ランタイムサポート、サービスディスカバリー、フレームワーク統合、設定の拡張。
- [Nimrod Avni](https://github.com/NimrodAvni78)：設定スキーマの生成、Collector 統合、プロトコルカバレッジ、テレメトリーレジストリと Weaver 検証の作業。
- [Mattia Meleleo](https://github.com/mmat11)：トレースとログの相関、トレースコンテキスト処理、Go 計装の改善、リリース準備。
- [Rafael Roquetto](https://github.com/rafaelroquetto)：eBPF インフラストラクチャ、バッファ処理、パーサーの堅牢化、パフォーマンス改善。
- [Giuseppe Ognibene](https://github.com/pinoOgni)：ネットワークオブザーバビリティ、BPF 検証器テスト、ランタイムメトリクス、計装とエクスポーターの正確性。
- [Stephen Lang](https://github.com/skl)：CI の強化、統合テスト、ARM カバレッジ、アプリケーション計装の改善。
- [Marc Tudurí](https://github.com/marctc)：プロトコル計装の拡大、Python 非同期トレーシング、Python と .NET のランタイムメトリクス。
- [Haibin Zhang](https://github.com/NameHaibinZhang)：エンベディング、リランキング、Qwen、MCP を含む GenAI 計装の拡大。

コードの貢献、変更のレビュー、ドキュメントの改善、バグの報告、OBI の運用経験の共有を行ったすべてのコミュニティメンバーにも感謝します。
再現手順、デプロイのフィードバック、予期しない動作に関する質問は、すべてより良いプロジェクトの構築に役立ちました。
このリリースは、ここに至るまで貢献したすべての方々のものです。

1.0 のリリースにより、この勢いを 2027年の OBI の計画に向けています。
ぜひその方向性の決定にご協力ください。

注目しているイシュー、サポートしてほしいプロトコルやランタイム、あなたの環境で OBI をより便利にする機能があれば、教えてください。
[既存のイシュー](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues)にユースケースを追加するか、[機能リクエストを開く](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/new/choose)か、[SIG eBPF Instrumentation ミーティング](https://github.com/open-telemetry/community#sig-ebpf-instrumentation)にアイデアを持ち込んでください。
何を達成しようとしているのか、今日何が障害になっているのか、成功した解決策が何を可能にするのかを教えてください。

[OBI 1.0 を試して](/docs/zero-code/obi/setup/)、経験を共有し、次に何を構築するか一緒に決めましょう。

[versioning]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/VERSIONING.md
[registry]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v1.0.0-rc.2/schemas/obi
[support]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/SUPPORT_MATRIX.md
[runtime]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/SUPPORT_MATRIX.md#runtime-metrics
[v0-10]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.10.0
[v0-11]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.11.0
[v0-12-1]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.12.1
[v0-13]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.13.0
[v0-14]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.14.0
[rc2]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v1.0.0-rc.2
[migration]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/devdocs/config/version-2.0/migration.md
[receiver-versioning]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/VERSIONING.md#release-scope
