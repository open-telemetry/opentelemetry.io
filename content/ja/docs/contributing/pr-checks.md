---
title: プルリクエストのチェック
description: プルリクエストがすべてのチェックをパスする方法学ぶ
weight: 40
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

[opentelemetry.io リポジトリ](https://github.com/open-telemetry/opentelemetry.io)に[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)（PR）を作成した際に、一連のチェックが実行されます。
PR のチェックは次のことを検証します。

- [CLA](#easy-cla) の署名しているか
- PR が[Netlify を通じてデプロイ](#netlify-deployment)に成功しているか
- [スタイルガイド](#checks)に変更が従っているか

{{% alert title="Note" %}}

もし何らかの PR チェックが失敗していれば、最初にローカルで `npm run fix:all` を実行することで[内容の問題を修正](../pull-requests/#fix-issues)してください。

PRに `/fix:all` というコメントを追加することもできます。
これにより、OpenTelemetry ボットがかわりにそのコマンドを実行して、PR を更新します。
ローカルに変更をプルすることを忘れないでください。

問題が残り続けている場合のみ、以下を読んで様々なチェックの内容と、失敗した状態からの修正する方法を確認してください。

{{% /alert %}}

## `Easy CLA` {#easy-cla .notranslate lang=en}

[CLA に署名](../prerequisites/#cla)していなかった場合は、このチェックが失敗します。

## Netlify deployment {#netlify-deployment}

[Netlify](https://www.netlify.com/)のビルドが失敗した場合は、詳細については **Details** を選択してください。

## GitHub PR チェック {#checks}

コントリビューションが [スタイルガイド](../style-guide/) に従っていることを検証するために、スタイルガイドのルールを検証し、問題が見つかった場合に失敗する一連のチェックを実装しています。

後述のリストでは、現在のチェック内容と、それに関連するエラーを修正する方法について説明します。

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

このチェックは、[すべての単語が正しく綴られていること](../style-guide/#spell-checking) を検証します。

このチェックが失敗した場合、`npm run check:spelling` をローカルで実行して、スペルミスのある単語を確認してください。
単語のスペルが正しい場合は、ファイルのフロントマターの `cSpell:ignore` セクションに追加する必要があるかもしれません。

### `CSPELL` check {#cspell-check .notranslate lang=en}

このチェックは、cSpell の ignore リストに含まれるすべての単語が正規化されていることを検証します。

このチェックが失敗した場合、`npm run fix:dict` をローカルで実行し、新しいコミットの変更をプッシュしてください。

### `FILENAME check` {#filename-check .notranslate lang=en}

このチェックは、[すべてのファイルが Prettier によってフォーマットされていること](../style-guide/#file-format) を検証します。

このチェックが失敗した場合、`npm run fix:format` をローカルで実行し、新しいコミットで変更をプッシュしてください。

### `FILE FORMAT` {#file-format .notranslate lang=en}

このチェックは、[すべてのファイル名が kebab-case になっていること](../style-guide/#file-names) を検証します。

このチェックが失敗した場合、`npm run fix:filenames` をローカルで実行し、新しいコミットで変更をプッシュしてください。

### `BUILD` and `CHECK LINKS` {#build-and-check-links .notranslate lang=en}

これらの2つのチェックは、ウェブサイトをビルドしてすべてのリンクが有効であることを検証します。

ローカルでビルドしてリンクをチェックするには、`npm run check:links` を実行してください。
このコマンドは参照キャッシュも更新します。
refcache に変更があれば、新しいコミットでプッシュしてください。

#### 404 エラーの修正 {#fix-404s}

リンクチェッカーによって **invalid**（HTTPステータス **404**）として報告された URL を修正する必要があります。

#### 有効な外部リンクの処理 {#handling-valid-external-links}

リンクチェッカーは、チェッカーをブロックするサーバーによって、200（成功）以外の HTTP ステータスを取得することがあります。
このようなサーバーは、404 以外の 400 番台の HTTP ステータス（401、403、406 が最も一般的）を返すことがよくあります。
LinkedIn などの一部のサーバーは 999 を報告します。

チェッカーが成功ステータスを取得できない外部リンクを手動で検証した場合は、URL にクエリパラメーター`?no-link-check`を追加して、リンクチェッカーに無視させることができます。
たとえば、<https:/some-example.org?no-link-check> はリンクチェッカーによって無視されます。

{{% alert title="メンテナーのヒント" %}}

メンテナーは、リンクチェッカーを実行した直後に次のスクリプトを実行して、Puppeteer にOKでないステータスのリンクの検証を試みさせることができます。

```sh
./scripts/double-check-refcache-4XX.mjs
```

外部リンクのURLフラグメント（アンカー）も検証するには`-f`フラグを使用してください。
これは`htmltest`が行わない検証です。
現在これを頻繁に実行していないため、`-m N`フラグを使用して更新されるエントリ数を制限することをお勧めします。
使用方法については、`-h`で実行してください。

{{% /alert %}}

### `WARNINGS in build log?` {#warnings-in-build-log .notranslate lang=en}

このチェックが失敗した場合、`npm run log:check:links` ステップの `BUILD and CHECK LINKS` ログを確認して、他の潜在的な問題を特定してください。
復旧方法がわからない場合は、メンテナーに助けを求めてください。
