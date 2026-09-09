---
title: プルリクエストのチェックとテスト
linkTitle: PR チェック & テスト
description: プルリクエストがすべてのチェックをパスする方法学ぶ
weight: 40
default_lang_commit: 38e36ae231c523f9e54499ad6ca05de7c49501c5
---

[opentelemetry.io リポジトリ](https://github.com/open-telemetry/opentelemetry.io)に[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)（PR）を作成した際に、一連のチェックが実行されます。
PR のチェックは次のことを検証します。

- [CLA](#easy-cla) の署名しているか
- PR が[Netlify を通じてデプロイ](#netlify-deployment)に成功しているか
- [スタイルガイド](#checks)に変更が従っているか

> [!NOTE]
>
> もし何らかの PR チェックが失敗していれば、最初にローカルで `npm run fix` を実行することで[内容の問題を修正](../pull-requests/#fix-issues)してください。
>
> PRに `/fix` というコメントを追加することもできます。
> これにより、OpenTelemetry ボットがかわりにそのコマンドを実行して、PR を更新します。
> ローカルに変更をプルすることを忘れないでください。
>
> 問題が残り続けている場合のみ、以下を読んで様々なチェックの内容と、失敗した状態からの修正する方法を確認してください。

## `Easy CLA` {#easy-cla .notranslate lang=en}

[CLA に署名](../prerequisites/#cla)していなかった場合は、このチェックが失敗します。

## Netlify deployment {#netlify-deployment}

[Netlify](https://www.netlify.com/)のビルドが失敗した場合は、詳細については **Details** を選択してください。

`"build.command" failed` の直前に `?? some/path` というステータス行が表示され、そのパスが PR で変更していないものである場合、ビルドが変更内容ではなく古い Netlify ビルドキャッシュに起因して失敗した可能性があります。

1. PR にコメントして、メンテナーにキャッシュなしでビルドを再試行するよう依頼してください。
   キャッシュクリアの手順については、[Dependency management](/site/build/dependencies/#netlify-build-cache)を参照してください。
2. キャッシュなしの再試行でも失敗が再発する場合、キャッシュが原因ではありません。
   ビルドの何らかのステップがそのパスを書き込んでおり、変更内容が最初の原因候補です。

## GitHub PR チェック {#checks}

コントリビューションが [スタイルガイド](../style-guide/) に従っていることを検証するために、スタイルガイドのルールを検証し、問題が見つかった場合に失敗する一連のチェックを実装しています。

以下のセクションでは、現在のチェック内容と、それに関連するエラーを修正する方法について説明します。

> [!NOTE]
>
> チェックされるのは最近のブログ記事のみです。
> 詳しくは[古いブログは更新されません][old-blogs]を参照してください。
> 特に、古い記事はウェブサイトにレンダリングされますが、以下に記載するチェックは古いブログには適用されません。

[old-blogs]: ../blog/#old-blogs-are-not-updated

### `TEXT linter` {#text-linter .notranslate lang=en}

このチェックは、[OpenTelemetry 固有の用語や単語がサイト全体で一貫して使用されていること](../style-guide/#opentelemetryio-word-list)を検証します。

問題が見つかった場合、プルリクエストの `files changed` ビューでファイルにアノテーションが追加されます。これらを修正すると、チェックが成功します。
また、`npm run check:text -- --fix` をローカルで実行すると、ほとんどの問題を修正できます。
`npm run check:text` を再度実行し、残りの問題を手動で修正してください。

### `MARKDOWN linter` {#markdown-linter .notranslate lang=en}

このチェックは、[Markdown ファイルの標準と一貫性が強制されていること](../style-guide/#markdown-standards)を検証します。

問題が見つかった場合、`npm run fix:markdown` を実行すると、ほとんどの問題を自動的に修正できます。
残りの問題については、`npm run check:markdown` を実行し、提案された変更を手動で適用してください。

### `SPELLING check` {#spelling-check .notranslate lang=en}

このチェックは、[すべての単語が正しく綴られていること][spell-checking]をすべてのロケールで検証します。

このチェックが失敗した場合、`npm run check:spelling` をローカルで実行して、問題を確認してください。
許可された単語を追加または変更するには、スタイルガイドの[スペルチェック][spell-checking]を参照してください。

[spell-checking]: ../style-guide/#spell-checking

### `CSPELL` check {#cspell-check .notranslate lang=en}

このチェックは、フロントマターにある cSpell の `cSpell:ignore` リストが正規化されていること、および `.cspell/*.txt` 単語リストがソートされていることを検証します (`npm run fix:dict` を参照してください)。

このチェックが失敗した場合、`npm run fix:dict` をローカルで実行し、新しいコミットの変更をプッシュしてください。

### `FILE FORMAT` {#file-format .notranslate lang=en}

このチェックは、すべてのファイルが [Prettier フォーマットルール](../style-guide/#file-format)に従っているかを検証します。

このチェックが失敗した場合、`npm run fix:format` をローカルで実行し、新しいコミットで変更をプッシュしてください。

### `FILENAME check` {#filename-check .notranslate lang=en}

このチェックは以下の項目を検証します。

- すべての[ファイル名が kebab-case になっていること](../style-guide/#file-names)
- 古いファイルやフォルダがリポジトリに存在しないこと (以下のリストを参照してください)

各エラーアノテーションのガイダンスに従ってください。
ローカルで修正を適用するには、`npm run fix:filenames` を実行し、新しいコミットで変更をプッシュしてください。

> [!NOTE]
>
> `fix:filenames` は古いファイルやフォルダを**削除**することがあります。

#### 古いファイルやフォルダ

このチェックは以下の古いパスにフラグを付けます。

- `tools/` - [code-excerpts ツールが npm パッケージに移行][#9638]されたときに削除
- `static/refcache.json` - [Lychee への切り替え][#10911]で削除。
  ブランチがこのファイルを復元する場合は、[古いブランチの更新手順][#10990]に従ってください。

[#9638]: https://github.com/open-telemetry/opentelemetry.io/pull/9638
[#10911]: https://github.com/open-telemetry/opentelemetry.io/pull/10911
[#10990]: https://github.com/open-telemetry/opentelemetry.io/issues/10990

### `BUILD` and `CHECK LINKS` {#build-and-check-links .notranslate lang=en}

これらの2つのチェックは、ウェブサイトをビルドしてすべてのリンクが有効であることを検証します。

> [!NOTE]
>
> サイト内リンクの警告については、[常にサイト内リンクを使用する](#avoid-external-site-local-links)を参照してください。

#### 404 エラーの修正 {#fix-404s}

リンクチェッカーによって **invalid**（HTTPステータス **404**）として報告された URL を修正する必要があります。

#### 有効な外部リンクの処理 {#handling-valid-external-links}

リンクチェッカーは、チェッカーをブロックするサーバーによって、200（成功）以外の HTTP ステータスを取得することがあります。
このようなサーバーは、404 以外の 400 番台の HTTP ステータス（401、403、406 が最も一般的）を返すことがよくあります。
LinkedIn などの一部のサーバーは 999 を報告します。

チェッカーが成功ステータスを取得できない外部リンクを手動で検証した場合は、URL にクエリパラメーター `?link-check=no` を追加して、リンクチェッカーに無視させることができます。ほかのクエリパラメーターがすでにある場合は `&link-check=no` を追加してください。
たとえば、以下の URL は無視されます。

- `https:/some-example.org?link-check=no`
- `https:/some-example.org?other-param=value&link-check=no`

`link-check=no` を追加した場合は、`last-validated=YYYY-MM-DD` パラメーターもあわせて追加して、手動で検証した日付を記録してください。
たとえば以下のようになります。

- `https:/some-example.org?link-check=no&last-validated=2026-08-02`

### `CACHE updates committed?` {#cache-updates-committed .notranslate lang=en}

外部リンクを追加または変更した場合、リンクチェッカーはそのリンクをリンクキャッシュ (`.lycheecache`) に記録します。
更新されたキャッシュがコミットされるまでこのチェックは失敗します。

キャッシュを更新する最も簡単な方法は、PR に [`/fix:link-cache`](../pull-requests/#fixing-prs-in-github) とコメントすることです。
OpenTelemetry ボットがキャッシュを更新してくれます。

あるいは、`npm run check:links` を実行してローカルでビルドとリンクチェックを行うこともできます。
このコマンドはリンクキャッシュも更新します。
キャッシュに変更があれば、新しいコミットでプッシュしてください。

### `WARNINGS in build log?` {#warnings-in-build-log .notranslate lang=en}

このチェックが失敗した場合、`npm run log:build` ステップの `BUILD` ログを確認して、他の潜在的な問題を特定してください。
復旧方法がわからない場合は、メンテナーに助けを求めてください。

#### 常にサイト内リンクを使用する {#avoid-external-site-local-links}

OpenTelemetry ウェブサイト内のページをリンクする場合、外部リンクではなくローカルパスを使用してください。
使用しない場合、ビルド時に警告が表示されます。

ビルドの警告を解消するには、完全な URL のパス部分のみを保持してください。

| ❌ 間違った使い方                         | ✅ 正しい使い方   |
| ----------------------------------------- | ----------------- |
| `https://opentelemetry.io/docs/concepts/` | `/docs/concepts/` |
| `https://www.opentelemetry.io/blog/...`   | `/blog/...`       |

ローカルパスを使用することで、以下のことが保証されます。

- サイト内ページが同じブラウザタブで開く: 外部リンクは新しいタブで開くため、サイト内ナビゲーションの望ましい動作ではありません
- ローカリゼーションリンク処理が期待通りに動作する: リンクパスの先頭に、適切な言語コードが自動で付与されます
- ローカルパスはリンクチェックが容易で、リンクキャッシュを不必要に肥大化させません

<details>
<summary>メンテナーへの注意</summary>

以下のコードはこのセクションで説明したリンク要件を強制します。

- この警告を表示するレンダーリンクフック:
  [`layouts/_markup/render-link.html`](https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_markup/render-link.html)
- 完全な URL をローカルパスに自動的に変換するスクリプト:
  [`scripts/content-modules/adjust-pages/`](https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/content-modules/adjust-pages)

</details>

### `LOCALIZATION` guidelines {#localization .notranslate lang=en}

このチェックは、[ローカリゼーションガイドライン](../localization/)のうち機械的に検証可能なルール（たとえば、ローカリゼーション間での[画像やその他のアセットのコピー禁止](../localization/#images)など）を、他のチェックでまだカバーされていないものについて適用します。

このチェックが失敗した場合、`npm run fix:l10n` をローカルで実行し、新しいコミットで変更をプッシュしてください。

### `TEST (excluding test:base)` {#test-excluding-test-base .notranslate lang=en}

このチェックは、`npm run test:compound-tests` を実行します。
これは、たとえば Netlify edge-function テストのような `test:*-*` 形式の NPM スクリプトを実行します。
このチェックは `test:base` を**実行しません**。
