---
title: 機能
description: >-
  主要なサイト機能の概要と、それぞれの主なリファレンスへのリンク。
weight: 20
default_lang_commit: 1338cb2423fbaba7da27b8e94d00293aac6922cc
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
