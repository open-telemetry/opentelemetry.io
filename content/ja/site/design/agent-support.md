---
title: エージェントサポート
description: >-
  エージェントが OpenTelemetry ウェブサイトのコンテンツを利用しやすくするための設計メモ。
weight: 10
default_lang_commit: 885c8388de720f12d52a55b555316b2155b2a12c
---

より広範な[エージェントフレンドリーなコンテンツ配信](/site/features/)機能の設計メモです。

## Markdown コンテンツネゴシエーション {#markdown-content-negotiation}

リクエストが明示的に `text/markdown` を要求または優先する場合、Netlify Edge Function を使用して Hugo のビルド済み `index.md` 出力を配信します。

### 根拠 {#rationale}

- すべての HTML ページに Markdown 版が必要なわけではありません。
- HTTP ネゴシエーションは配信レイヤーに属します。
- Markdown の成果物が存在しない場合、この関数は通常の HTML にフォールバックできます。

### ルール {#rules}

- `GET` と `HEAD` のみが対象です。
- `.md` やその他のページ以外のリソースへのリクエストはネゴシエーションをバイパスします。
- ページ的なリクエストには以下が含まれます:
  - スラッシュで終わるパス
  - 拡張子なしのパス
  - `.../index.html` パス
- `text/markdown` が `q` がゼロより大きい値で受け入れられ、かつその `q` が `text/html` / `application/xhtml+xml` の最も高い `q` **以上**の場合に Markdown が配信されます（同じ重みの場合は Markdown が選択されます）。
- `*/*` のようなワイルドカードは意図的に無視されます。
  明示的な markdown/html メディアタイプのみが q 値に寄与します。
  これは保守的な選択であり、後で見直される可能性があります。
- Markdown が見つからない場合は通常の HTML レスポンスにフォールバックします。
- ネゴシエーションされたレスポンスは `Vary: Accept` を設定します。
- `/search/` は HTML のみを出力するため、常に HTML にフォールバックします。

パスマッピングに関する注意事項:

- `/docs/` のようなきれいな URL は、Hugo の `/docs/index.md` 出力にマッピングされます。
- `index.html` は隣接する `.md` ファイルにマッピングされます（例: `/docs/index.html` → `/docs/index.md`）。
- その他の `.html` パスは Netlify の通常のリダイレクトとルーティングに委ねられます。
  たとえば、Netlify は `/docs.html` を `/docs/` にリダイレクトします。

### 関連する実装 {#related-implementation}

- `config/_default/hugo.yaml` がこのサイトの Markdown 出力を有効にしています。
- `content/en/search.md` が `outputs: [HTML]` で検索ページを除外しています。
- `netlify.toml` が他のルートハンドリングより前に Edge Function を配置します。
- `netlify/edge-functions/markdown-negotiation/index.ts` がネゴシエーションを実装しています。
  `netlify/edge-functions/markdown-negotiation.ts` はそれを再エクスポートする Netlify のエントリスタブです。
