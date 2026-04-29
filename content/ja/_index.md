---
title: OpenTelemetry
description: >-
  テレメトリーのオープンスタンダード
developer_note: 以下で使用する blocks/cover コラムは、ファイル名に "background" を含む画像ファイルを背景画像として使用します。
params:
  btn-lg: class="btn btn-lg btn-{1}" role="button"
  show_banner: true
default_lang_commit:
---

{{% blocks/cover image_anchor="top" height="max td-below-navbar" %}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<!-- prettier-ignore -->
<div class="td-cta-buttons my-5">
  <a {{% _param btn-lg primary %}} href="docs/what-is-opentelemetry/">
    より詳しく学ぶ
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    デモを試す
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="OpenTelemetry ドキュメントを検索..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="OpenTelemetry 概要" %}}

**OpenTelemetry** はクラウドネイティブソフトウェアのためのオープンソースオブザーバビリティフレームワークです。
アプリケーションから分散トレースとメトリクスを収集するため、API、ライブラリ、エージェント、およびコレクターサービスをひとまとまりとして提供します。

OpenTelemetry は、OpenTracing と OpenCensus の各プロジェクトが長年積み重ねてきた知見を土台にしつつ、コミュニティからの優れた考え方と実践も取り入れています。

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="ベンダー非依存の計装"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

OpenTelemetry API と SDK を使用し、コードを一度だけ計装します。
テレメトリーデータは、Jaeger、Prometheus、商用ベンダー、あるいは独自のソリューションなど、任意のオブザーバビリティバックエンドにエクスポートできます。
アプリケーションコードを変更せずに、バックエンドを切り替えられます。

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="統一されたオブザーバビリティシグナル"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

リクエストの経路全体を通じて流れる共有コンテキストにより、トレース、メトリクス、ログを紐づけます。
すべてのコンポーネントとサービスにまたがって、アプリケーションの振る舞いを包括的に把握できます。

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="どこでも実行可能"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

OpenTelemetry は100%オープンソースで、ベンダーに依存しません。
オンプレミス、ハイブリッド環境、複数クラウドにまたがる構成など、高い柔軟性をもち、ロックインもありません。
ワークロードを望む環境へ移動させられます。

{{% /homepage/main-feature %}}

{{< homepage/signals-showcase title="オブザーバビリティシグナル" >}}
{{< homepage/signal name="トレース" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
分散トレース {{< /homepage/signal >}}
{{< homepage/signal name="メトリクス" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
時系列の計測 {{< /homepage/signal >}}
{{< homepage/signal name="ログ" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
タイムスタンプ付きレコード {{< /homepage/signal >}}
{{< homepage/signal name="バゲッジ" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
コンテキストに紐づくメタデータ {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{% homepage/otel-features title="OpenTelemetry の機能" columns="2" %}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="自動計装" url="/docs/concepts/instrumentation/zero-code/" >}}
主要なフレームワークとライブラリ向けのゼロコード計装を使えば、すぐに計装を開始できます。
ソースコードを変更せずに、自動計装エージェントがトレース、メトリクス、ログを収集します。 {{% /homepage/otel-feature %}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="コレクターパイプライン" url="/docs/collector/" >}}
OpenTelemetry Collector を使用して、テレメトリーデータの加工、フィルター、ルーティングを行います。
エージェントまたはゲートウェイとしてデプロイし、200以上のコンポーネントで大規模にテレメトリーの受信、処理、エクスポートを行います。 {{% /homepage/otel-feature %}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="コンテキスト伝播" url="/docs/concepts/context-propagation/" >}}
サービス境界をまたぐトレースを自動的に紐付けられます。
分散コンテキストがリクエストの経路全体に伝播し、ログ、メトリクス、トレースを統一されたビューに結びつけます。 {{% /homepage/otel-feature %}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="多言語サポート" url="/docs/languages/" >}}
Java、Kotlin、Python、Go、JavaScript、.NET、Ruby、PHP、Rust、C++、Swift、Erlang を含む、12以上の言語向けのネイティブ SDK があります。
好みの言語で、本格的な OpenTelemetry サポートを利用できます。 {{% /homepage/otel-feature %}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="安定版かつ本番環境対応" url="/status/" >}}
トレースおよびメトリクス API は、すべての主要な言語で安定版です。
数千の組織が本番環境で OpenTelemetry を運用しています。
CNCF および主要クラウドプロバイダーの支援を受けています。 {{% /homepage/otel-feature %}}

{{< /homepage/open-feature image="/img/homepage/feature-openness.svg" title="オープン仕様" url="/docs/specs/status/" >}}
API、SDK、およびワイヤープロトコル (OTLP) について、オープンかつベンダー非依存の仕様に基づいています。
CNCF による透明性の高いガバナンスにより、長期的な安定性とコミュニティ主導の進化が保証されています。 {{% /homepage/otel-feature %}}

{{% /homepage/otel-features %}}

{{< homepage/ecosystem-stats title="OpenTelemetry エコシステム" >}}
{{< homepage/stat type="languages" label="言語" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="コレクターコンポーネント" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="統合" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="ベンダー" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="業界リーダーによって信頼されています"
    limit="10"
    ctaText="すべての採用者を見る"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetryは[CNCF][] [incubating][]プロジェクトです。**<br>OpenTracingとOpenCensusのプロジェクトが合併して設立されました。

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/

{{% /blocks/section %}}
