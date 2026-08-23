---
title: ホームページアナウンス
description: ホームページアナウンスページのフロントマターフィールドとレンダリング動作。
weight: 60
default_lang_commit: 38e36ae231c523f9e54499ad6ca05de7c49501c5
---

ホームページアナウンスには `content/<lang>/announcements/*.md` を使用してください。

このページはアナウンスページのフィールドの意味と、サイトがアナウンスをどのようにレンダリングするかについての正式な情報源です。

共有アナウンスパラメーターは `content/en/announcements/_index.md` の `cascade` で設定されており、すべてのロケールで共有されます。
`en` 以外のロケールでは、カスケードされたパラメーターを複製してはいけません。

## フロントマターフィールド {#front-matter-fields}

- `title`: アナウンステキストで使用されるアナウンスタイトル。
- `linkTitle`: アナウンスインデックスページで使用される省略可能な短いタイトル。
- `date`: アナウンスの表示を開始する日付。
- `expiryDate`: アナウンスの表示を終了する日付。
  - イベント終了日に設定してください（例: `2026-06-06`）。
  - アナウンスを将来再利用する可能性がある場合は、この行の末尾に `# keep` を付けてアナウンスファイルの削除を防いでください。
- `weight`: 必須。
  イベント終了日を `yyyymmdd` の整数で設定してください（例: `20260606`）。
  アナウンスは `weight` の昇順で表示されるため、終了日が最も近いイベントが先頭に表示されます。
- `params`:
  - `eventUrl`: ページリンクで使用されるベースイベント URL。
    Linux Foundation のイベントの場合、`https://events.linuxfoundation.org/event-name/` の形式であることが多いです。
  - `utmParam`: イベント URL に付加される UTM パラメーター。
    セクションインデックスページ（`content/en/announcements/_index.md`）で設定されるため、オーバーライドしたい場合を除き定義する必要はありません。
  - `blogPostURL`: アナウンスの CTA リンク用の省略可能なサイトブログ記事 URL。

## バナーテキスト {#banner-text}

バナーテキストは短く簡潔にしてください。
一般的な本文テンプレートは以下のとおりです。

```markdown
[**{{%/* param title */%}}**][LF], **<span class="text-nowrap">March
23–26,</span> Amsterdam**. <span class="d-none d-md-inline"><br></span> Come
[collaborate, learn, and share][blog]<span class="d-none d-sm-inline"> with the
Cloud Native community</span>!

[blog]: <{{%/* param blogPostURL */%}}>
[LF]: <{{%/* param eventUrl */%}}register/?{{%/* _param utmParam */%}}>
```

設計上の注意点:

- `d-none` や `d-*-inline` などのクラスを使用して、画面サイズに基づいたバナーテキストの表示を制御しています。
  これにより、小さな画面ではバナーテキストをよりコンパクトにできます。
- `utmParam` へのアクセスには `_param` を使用しています。
  `param` はクエリパラメーターの `&` を `&amp;` にエスケープしますが、`_param` は値をそのまま安全に扱うためです。

## レンダリング動作 {#rendering-behavior}

- ホームページバナーテンプレート: `layouts/_partials/banner.html`
- コミュニティイベント一覧ショートコード: `layouts/_shortcodes/community-events.md`

どちらの場合も、アナウンスのレンダリングには `.RegularPages` が使用されます。

- Hugo は `expiryDate` に基づいて期限切れのページを自動的に除外します。
- ページは Hugo の[デフォルトのページ順序][default page order]で表示され、まず `weight` の昇順でソートされます。
  `weight` は `yyyymmdd` 形式の終了日の整数に設定されているため（上記参照）、終了日が最も近いアナウンスが先頭に表示されます。

[default page order]: https://gohugo.io/quick-reference/glossary/#default-sort-order
