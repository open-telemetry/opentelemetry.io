---
title: OpenTelemetry プロファイルがパブリックアルファに
linkTitle: プロファイルのパブリックアルファ
date: 2026-03-26
author: >-
  [Alexey Alexandrov](https://github.com/aalexand) (Google) [Ivo
  Anjo](https://github.com/ivoanjo) (Datadog) [Felix
  Geisendörfer](http://github.com/felixge) (Datadog) [Christos
  Kalkanis](https://github.com/christos68k) (Elastic) [Florian
  Lehner](https://github.com/florianl) (Elastic) [Damien
  Mathieu](https://github.com/dmathieu) (Elastic)
sig: Profiling
default_lang_commit: 346b2912021b98de4349f80753c829d9223a1f25
# prettier-ignore
cSpell:ignore: Alexandrov Branczyk devfiler Filimonov Geisendörfer Ghattas Halliday Höner k8sattributesprocessor Kalkanis Lehner Mefford Najaryan Nayef OTTL Rühsen Suereth Teräs Tigran Zymtrace
---

OpenTelemetry が初めてプロファイルを[紹介](/blog/2024/profiling/)して以来、トレース、メトリクス、ログと並ぶ継続的な本番プロファイリングの統一された業界標準の構築に向けた勢いは増す一方です。
本日、Profiling SIG はプロファイルシグナルが正式に[パブリックアルファ](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.55.0/oteps/0232-maturity-of-otel.md#alpha)に移行したことを発表します。
より広いコミュニティでの利用とフィードバックを受け入れる準備が整いました。

## すべての人に本番プロファイリングを {#production-profiling-for-all}

本番環境で低オーバーヘッドのパフォーマンスプロファイルを継続的に取得する手法は、[数十年にわたって使われてきました](https://www.waldspurger.org/carl/papers/dcpi-sosp97.pdf)。
本番インシデントのトラブルシューティングに役立ち、ソフトウェアを高速化することでユーザー体験を向上させ、同じ処理に必要なリソースを減らすことで計算コストを削減します。
歴史的に、JFR や pprof のようなフォーマットが普及していたにもかかわらず、継続的プロファイリングの共通フレームワークやプロトコルは業界に存在しませんでした。

OpenTelemetry プロファイルにより、コミュニティとエコシステムのサポートに支えられた、真のベンダー中立性を備えた本番プロファイリングの業界標準を導入します。
これを実現するにはいくつかのコンポーネントがあります。

- プロファイリングデータの統一されたデータ[表現](https://github.com/open-telemetry/opentelemetry-proto/blob/v1.10.0/opentelemetry/proto/profiles/v1development/profiles.proto)を作成し、pprof のような既存フォーマットとの互換性を確保する。
- 新しいリファレンス eBPF ベースのプロファイラー[実装](https://github.com/open-telemetry/opentelemetry-ebpf-profiler)を導入する。
- プロファイルを OpenTelemetry エコシステムの自然な一部にする（OTel Collector との統合など）。

上記のすべてがアルファリリースで大幅に改善されました。
ここからは、私たちが取り組んできた内容を紹介します。

## データ表現の標準化 {#standardizing-the-data-representation}

統一されたプロファイリングフォーマットの作成は、多様な環境にわたる業界標準として機能する必要があるため、大きな課題です。
ワーキンググループは多くの要件を調整する必要がありました。
サンプリングとトレーシング、ネイティブランタイムとインタプリタランタイム、ワイヤー/メモリーサイズの効率性とデータの可読性のトレードオフ、その他同様の側面です。

結果として生まれたプロファイルアルファ[フォーマット](https://github.com/open-telemetry/opentelemetry-proto/blob/v1.10.0/opentelemetry/proto/profiles/v1development/profiles.proto)は、プロファイリングデータを効率的にキャプチャできるバランスの取れた機能セットを提供します。

- スタック表現は重複排除されており、各ユニークなコールスタックは一度だけ格納されるため、多様なプロファイリングデータを効率的にエンコードできます。
- その他の一般的なエンティティのディクショナリテーブルにより、効率的なデータ正規化も可能です。
- 主に集約データのエンコードに焦点を当てていますが、個々の（サンプリングされた場合でも）オフ CPU イベントの記録などのユースケースをサポートするために、タイムスタンプ付きイベントデータのキャプチャも可能です。
- リソース属性により、追加情報でデータモデルを拡張できます。
  文字列ディクショナリのサポートにより、プロファイリングデータを関連するログ、メトリクス、トレースを出力した同じ[リソース](/docs/concepts/resources/)に効率的に（[ワイヤーサイズ40%削減](https://github.com/open-telemetry/sig-profiling/blob/ec8a031b86205e905a1211e162f6f7691a6ff5d2/otlp-bench/reports/2025-11-27-gh733-resource-attr-dict/README.md?from_branch=main)）リンクできます。
- プロファイルサンプルは、さらにトレーシングの `trace_id` / `span_id` 属性と関連付けることができ、データのクロスシグナル相関を実現します。
- [セマンティック規約](https://github.com/open-telemetry/semantic-conventions)が、最も一般的なプロファイリング固有の属性の定義を提供します。

pprof フォーマットに着想を得て `pprof` のメンテナーと共同で開発された OTLP プロファイルは、OpenTelemetry エコシステムの幅広い要件に対応する独立した標準へと進化しました。
元の pprof フォーマットのデータは、情報の損失なく OTLP プロファイルとの間でラウンドトリップ変換できます。
この目的のために、シームレスな相互運用性を確保する新しいネイティブ[トランスレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/cc10682103a84a8d7700d6e64c469d7a1469af49/pkg/translator/pprof?from_branch=main)が含まれるようになりました。

データ品質と導入の容易さを確保するため、[適合性チェッカーツール](https://github.com/open-telemetry/sig-profiling/tree/3ee8c0d4f303285cb72e0b3b934f8b20b209edaa/profcheck?from_branch=main)もリリースします。
このツールにより、エクスポートされたプロファイルが OpenTelemetry プロファイルの技術仕様とセマンティック規約に準拠しているかを検証できます。

## eBPF プロファイリングエージェントによる手間のないインサイト {#frictionless-insights-with-the-ebpf-profiling-agent}

Elastic による [eBPF プロファイリングエージェント](https://github.com/open-telemetry/opentelemetry-ebpf-profiler)の OpenTelemetry への[寄贈](/blog/2024/elastic-contributes-continuous-profiling-agent/)と OTel Collector との統合により、最も広く使われている言語ランタイムをサポートした、追加の計装なしの低オーバーヘッドなシステム全体の Linux 継続的プロファイリングが、すべての OpenTelemetry ユーザーに提供されるようになりました。

アルファリリースでは多くの重要な改善が利用可能です。

- eBPF エージェントが OpenTelemetry Collector レシーバーとして動作するようになり、メトリクスと K8s メタデータの既存の OpenTelemetry 処理パイプラインを活用し、公式の [Collector ディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/4c40558ecfad1e7ae8b535013ef3cd14ae763ff9/distributions/otelcol-ebpf-profiler?from_branch=main)として配布されます。
- Go 実行ファイルのターゲット上での自動シンボル化
- Node.js V8 の ARM64 サポート
- BEAM（Erlang/Elixir）の初期サポート
- .NET 9 および 10 のサポート
- Ruby のアンワインドとシンボル化の修正と改善

## OTel エコシステムにおけるプロファイル {#profiles-in-the-otel-ecosystem}

OpenTelemetry は多くの連携するパーツを持つ包括的なエコシステムです。
プロファイルのような新しいシグナルがあらゆる場所に統合され、すべてのシグナルが互いに恩恵を受けられることが重要です。
アルファリリースでは、OTel の多くの次元にわたるこの領域で複数の改善がもたらされました。

プロファイルの水平統合の注目すべき例を以下に示します。

- OTel Collector に、特定のフォーマットでプロファイルデータを受信したり、インフラストラクチャ情報でプロファイルを拡張したりするためのサポートが含まれるようになりました。
  - [pprof レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/cb1f1bb54ee849b4c569eb8f6a950c0f9c7c6d43/receiver/pprofreceiver?from_branch=main)により、pprof フォーマットのファイルからプロファイルを受信できます。
  - [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/cc10682103a84a8d7700d6e64c469d7a1469af49/processor/k8sattributesprocessor?from_branch=main) により、Kubernetes メタデータでプロファイルを拡張できます。
  - [OTTL](/docs/collector/transforming-telemetry/) サポートにより、プロファイルの変換やフィルタリングのカスタムルールを構築できます。
- OTLP リソースモデルが更新され、効率的な情報共有が可能になりました。
  Collector もプロファイルシグナルに対してこの最適化を透過的にサポートするよう更新されました。

## はじめてみる {#getting-started}

OpenTelemetry プロファイルの詳細については、OpenTelemetry [ドキュメント](/docs/)の[プロファイルの概念](/docs/concepts/signals/profiles)ページを参照してください。

実際のデプロイメントを始める最も簡単な方法は、OpenTelemetry の [eBPF プロファイラー](https://github.com/open-telemetry/opentelemetry-ebpf-profiler)を OTLP プロファイルをサポートするバックエンドと組み合わせて使用することです。
シグナルはまだ開発中のため、本番対応のバックエンドはまだ登場していませんが、複数のベンダーが OpenTelemetry プロファイルのサポートに取り組んでいます。

開発とテストを加速するために、Elastic は eBPF プロファイラーのバックエンド（収集、データストレージ、シンボル化、UI）部分を再実装した [devfiler](https://github.com/elastic/devfiler) というデスクトップアプリケーションをオープンソースとして公開しました。
devfiler は本番バックエンドではなく、そのように使用すべきではないことに注意してください。
詳細な手順については、eBPF プロファイラーの[リポジトリ](https://github.com/open-telemetry/opentelemetry-ebpf-profiler)を参照してください。

![Devfiler の例](devfiler-latest.png)

## 貢献者一覧 {#brought-to-you-by}

このようなプロジェクトには多くの人々が関わっています。
これを可能にしたすべての方々に感謝します。

- [Alexey Alexandrov](https://github.com/aalexand) (Google)
- [Ivo Anjo](https://github.com/ivoanjo) (Datadog)
- [Frederic Branczyk](https://github.com/brancz) (Polar Signals)
- [Roger Coll](https://github.com/rogercoll) (Elastic)
- [Dmitry Filimonov](https://github.com/petethepig) (Grafana Labs)
- [Felix Geisendörfer](https://github.com/felixge) (Datadog)
- [Nayef Ghattas](https://github.com/Gandem) (Datadog)
- [Jonathan Halliday](https://github.com/jhalliday) (Red Hat)
- [Dale Hamel](https://github.com/dalehamel) (Shopify)
- [Joel Höner](https://github.com/athre0z) (Zymtrace)
- [Christos Kalkanis](https://github.com/christos68k) (Elastic)
- [Florian Lehner](https://github.com/florianl) (Elastic)
- [Damien Mathieu](https://github.com/dmathieu) (Elastic)
- [Greg Mefford](https://github.com/GregMefford) (Adobe)
- [Tigran Najaryan](https://github.com/tigrannajaryan) (Splunk)
- [Tommy Reilly](https://github.com/gnurizen) (Polar Signals)
- [Tim Rühsen](https://github.com/rockdaboot) (Zymtrace)
- [Josh Suereth](https://github.com/jsuereth) (Google)
- [Timo Teräs](https://github.com/fabled) (Elastic)
- [Brennan Vincent](https://github.com/umanwizard) (Polar Signals)

## 今後の展望 {#whats-next}

プロファイリングツールや製品を構築しているチームには、OpenTelemetry プロファイルの利用を推奨します。
参加方法は以下のとおりです。

- ツールに OTel プロファイルのエクスポートまたは受信オプションを追加する。
  これはすでに実現されています（例: [async-profiler](https://github.com/async-profiler/async-profiler/blob/b3f58429f5c0252e9ced3f0fcb444fed17671321/docs/OutputFormats.md?from_branch=master)）。
- eBPF エージェントと OTel Collector（v0.148.0以降）のプロファイルサポートをテストし、イシューを報告する。
  PR の送信も歓迎します。
- シグナルのドキュメントをレビューし、改善点を提案する。

アルファリリースの段階では、本番の重要なワークロードにこのシグナルを使用すべきではないことに注意してください。
詳細は、OpenTelemetry の[アルファ成熟度レベルの定義](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.55.0/oteps/0232-maturity-of-otel.md#alpha)を参照してください。

次のマイルストーンに向けて、多くのエキサイティングな作業が計画・進行中です。

- シグナルの相関はオブザーバビリティの成功に不可欠なため、[OBI](/docs/zero-code/obi/) やプロファイリングエージェントのような eBPF ベースのエージェント間で情報を共有する[作業が進行中](https://github.com/open-telemetry/opentelemetry-specification/pull/4855)です。
- シンボル化はすべての本番プロファイリングスタックの重要なコンポーネントであるため、API、ストレージフォーマットの標準化、およびリファレンス実装の公開について議論しています。
- プロセス内 SDK コードと eBPF エージェント間のランタイム情報の共有は、「99パーセンタイルレイテンシーのトレースにおけるオフ CPU イベントは何か」といった質問に答えるためのクロスシグナル相関に重要です。
  これを実現するための[プロセスコンテキスト](https://github.com/open-telemetry/opentelemetry-specification/pull/4719)と[スレッドコンテキスト](https://github.com/open-telemetry/opentelemetry-specification/pull/4947)共有の OTEP が進行中です。

そして、これらすべてにおいて皆さんのフィードバックが必要です。
[OTLP](https://github.com/open-telemetry/opentelemetry-proto) または [Profiling SIG](https://github.com/open-telemetry/sig-profiling) リポジトリに GitHub イシューを作成してください。
業界のニーズにシグナルを適合させ、次の段階であるベータおよび GA リリースに向けて着実に進化させていく助けになります。
