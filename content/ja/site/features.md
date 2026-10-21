---
title: 機能
description: >-
  主要なサイト機能の概要と、それぞれの主なリファレンスへのリンク。
weight: 20
default_lang_commit: cb07a7f2f522075ab85baaca6b23625cad38b30f
cSpell:ignore: otelwebtelemetry
---

## エージェントフレンドリーなコンテンツ配信 {#agent-friendly-content-delivery}

サイトのコンテンツをエージェントが発見しやすく、利用しやすくします。
現在の作業では、コンテンツページの Markdown 出力と `Accept: text/markdown` の HTTP ネゴシエーションを追加しています。

- ステータス: 進行中
- 設計: [Agent support](../design/agent-support/)
- 実装: `netlify/edge-functions/markdown-negotiation.ts` 配下のロジックとテスト用フォルダー。
- リファレンス:
  [opentelemetry.io#9449](https://github.com/open-telemetry/opentelemetry.io/issues/9449),
  [docsy#2596](https://github.com/docsy/docsy/issues/2596)

## ウェブサイトのテレメトリー {#website-telemetry}

> [!NOTE]
>
> ウェブサイトのテレメトリーは、プロジェクトの新しい Collector の準備が整うまで停止しています（[#9559][]）。
> この項目は、設計どおりの機能を説明しています。

このサイトは、OpenTelemetry JS SDK でページの読み込み、ユーザー操作、`fetch`/XHR 呼び出しを計装しています。
スパンは OTLP で `otelwebtelemetry.com` にエクスポートされ、ブラウザーのコンソールにも出力されます。

テレメトリー（トレーサー）のコードは、Netlify のビルド（本番、デプロイプレビュー、ブランチデプロイ）で有効になります。
フォーク独自の Netlify サイトではトレースしません。

- ステータス: 稼働中
- 設計: [ウェブサイトのテレメトリー](../design/telemetry/)
- 実装: [`assets/js/tracing.js`][]（`layouts/_partials/hooks/body-end.html` から読み込まれます）
- ローカルビルド: [ビルドと配信](../build/npm-scripts/#build-and-serve)

<!-- prettier-ignore-start -->
[#9559]: https://github.com/open-telemetry/opentelemetry.io/issues/9559
[`assets/js/tracing.js`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/assets/js/tracing.js
<!-- prettier-ignore-end -->
