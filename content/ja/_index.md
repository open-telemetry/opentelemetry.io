---
title: OpenTelemetry
description: >-
  効果的な観測を可能にする、高品質でユビキタスかつポータブルなテレメトリー
developer_note: blocks/coverコラム（以下で使用）は、ファイル名に "background" を含む画像ファイルを背景画像として使用します。
show_banner: true
default_lang_commit: fd7da211d5bc37ca93112a494aaf6a94445e2e28
drifted_from_default: true
---

<div class="d-none"><a rel="me" href="https://fosstodon.org/@opentelemetry"></a></div>

{{< blocks/cover image_anchor="top" height="max" color="primary" >}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<div class="l-primary-buttons mt-5">

- [より詳しく学ぶ](docs/what-is-opentelemetry/)
- [デモを試す](docs/demo/)

</div>

<div class="h3 mt-4">
あなたのロールに応じて<a class="text-secondary" href="docs/getting-started/">始めてみましょう</a>
</div>
<div class="l-get-started-buttons">

- [開発者（Dev）](docs/getting-started/dev/)
- [運用担当者（Ops）](docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

OpenTelemetry は API、SDK、ツールのコレクションです。
テレメトリーデータ（メトリクス、ログ、トレース）の計装、生成、収集、エクスポートに使用し、ソフトウェアのパフォーマンスや動作の分析に役立てましょう。

> OpenTelemetryは[いくつかの言語](docs/languages/)で[一般的に利用可能](/status/)で、使用に適しています。

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="トレース、メトリクス、ログ" url="docs/concepts/observability-primer/" %}}

サービスやソフトウェアからテレメトリーを作成・収集し、様々な分析ツールに転送します。

{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="ドロップイン計装&統合" %}}

OpenTelemetry は多くの人気のライブラリーとフレームワークに[インテグレート][instrumentation]されています。
そして、手動およびゼロコードの[計装][integrates]をサポートしています。

[instrumentation]: /docs/concepts/instrumentation/
[integrates]: /ecosystem/integrations/

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="オープンソース、ベンダー非依存" %}}

100％フリーでオープンソースのOpenTelemetryは、オブザーバビリティ分野の[業界リーダー][industry leaders]によって[採用][adopted]され、サポートされています。

[adopted]: /ecosystem/adopters/
[industry leaders]: /ecosystem/vendors/

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetryは[CNCF][] [incubating][]プロジェクトです。**<br>OpenTracingとOpenCensusのプロジェクトが合併して設立されました。

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/

{{% /blocks/section %}}
