---
title: プルリクエストのチェック
description: プルリクエストがすべてのチェックをパスする方法学ぶ
weight: 40
default_lang_commit: 9ba98f4fded66ec78bfafa189ab2d15d66df2309
cSpell:ignore: REFCACHE
---

[opentelemetry.io リポジトリ](https://github.com/open-telemetry/opentelemetry.io)に[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)（PR）を作成した際に、一連のチェックが実行されます。
PR のチェックは次のことを検証します。

- [CLA](#easy-cla) の署名しているか
- [Netlify](#netlify-deployment)を通じて正常にデプロイしているか
- [スタイルガイド](#style-checks)に変更が従っているか

{{% alert title="Note" color="primary" %}}

もし何らかの PR チェックが失敗していれば、最初に自身の PC で `npm run fix:all` を実行することで[自動的に内容が修正されるか](../pull-requests/#fix-issues)試してください。

加えて、`/fix:all` をプルリクエストにコメントできます。
OpenTelemetry ボットが代わりにこれらのコマンドを実行して、PR を更新します。
ローカルに変更をプルすることを忘れないでください。

問題が残り続けている場合のみ、以下を読んで様々なチェックの内容と、失敗した状態からの修正する方法を確認してください。

{{% /alert %}}

## Easy CLA {#easy-cla}

[CLA に署名](../prerequisites/#cla)していなかった場合は、このチェックが失敗します。

## Netlify deployment {#netlify-deployment}

[Netlify](https://www.netlify.com/)のビルドが失敗した場合は、より詳細のために **Details** を選択してください。

## スタイルチェック {#style-checks}

コントリビューションが [スタイルガイド](../style-guide/) に従っていることを検証するために、スタイルガイドのルールを検証し、問題が見つかった場合に失敗する一連のチェックを実装しています。

後述のリストでは、現在のチェック内容と、それに関連するエラーを修正する方法について説明します。

### TEXT linter {#text-linter}

このチェックは、[OpenTelemetry 固有の用語や単語がサイト全体で一貫して使用されていること](../style-guide/#opentelemetryio-word-list)を検証します。

問題が見つかった場合、プルリクエストの `files changed` ビューでファイルにアノテーションが追加されます。これらを修正すると、チェックが成功します。
また、`npm run check:text -- --fix` をローカルで実行すると、ほとんどの問題を修正できます。
`npm run check:text` を再度実行し、残りの問題を手動で修正してください。

### MARKDOWN linter {#markdown-linter}

このチェックは、[Markdown ファイルの標準と一貫性が強制されていること](../style-guide/#markdown-standards)を検証します。

問題が見つかった場合、`npm run:format` を実行すると、ほとんどの問題を修正できます。
より複雑な問題がある場合は、`npm run check:markdown` を実行し、提案された変更を適用してください。

### SPELLING check {#spelling-check}

このチェックは、[すべての単語が正しく綴られていること](../style-guide/#spell-checking) を検証します。

### CSPELL:IGNORE check {#cspellignore-check}

このチェックは、cSpell の ignore リストに含まれるすべての単語が正規化されていることを検証します。

このチェックが失敗した場合、`npm run fix:dict` をローカルで実行し、新しいコミットの変更をプッシュしてください。

### FILENAME check {#filename-check}

このチェックは、[すべてのファイルが Prettier によってフォーマットされていること](../style-guide/#file-format) を検証します。

このチェックが失敗した場合、`npm fix:format` をローカルで実行し、新しいコミットで変更をプッシュしてください。

### FILE FORMAT {#file-format}

このチェックは、[すべてのファイル名が kebab-case になっていること](../style-guide/#file-names) を検証します。

このチェックが失敗した場合、`npm fix:filenames` をローカルで実行し、新しいコミットで変更をプッシュしてください。

### BUILD and CHECK LINKS / REFCACHE updates? {#build-and-check-links--refcache-updates}

このチェックは、コミットによって追加されたすべてのリンクが機能していることを検証します。

`npm run check:links` を実行して、ローカルでリンクを検証してください。
これにより参照キャッシュ (`REFCACHE`) も更新されます。
`REFCACHE` の変更があれば、新しいコミットでプッシュしてください。

### WARNINGS in build log? {#warnings-in-build-log}

このチェックが失敗した場合、ビルドログを検証し、他の潜在的な問題を特定してください。
復旧方法がわからない場合は、メンテナーに助けを求めてください。
