---
title: 古いブログの無視範囲を更新する
description: >-
  サイトチェックおよび修正スクリプトから除外される古いブログ投稿の年範囲を更新する方法。
default_lang_commit: 89a269b12093690dd47ccc32d7f8b22ff7f946d8
cSpell:ignore: textlintignore
---

古いブログ投稿は[履歴として扱われ、更新されません][old-blogs]。
そのため、lint/format チェックおよび修正スクリプトから除外されています。
年に1回（または必要に応じて）、以下に示す各ツールの設定で年範囲を更新してください。

[old-blogs]: /docs/contributing/blog/#old-blogs-are-not-updated

## 更新する設定 {#configuration}

各エントリは同じポリシーを表しています。
現在は2019年と `202[0-4]` を無視しています。
リンクチェッカーは、2020年の投稿が存在しないため2020年を省略しています（glob ベースのツールでは2020年が含まれていても問題ありません）。
各ツールに合わせて、年の無視 glob/パターンを調整してください。

| ツール                      | 設定                                                    |
| --------------------------- | ------------------------------------------------------- |
| cspell                      | `.cspell.yml` → `ignorePaths`                           |
| markdownlint                | `.markdownlint-cli2.yaml` → `ignores`                   |
| prettier                    | `.prettierignore`                                       |
| textlint                    | `.textlintignore`（注: `**` glob 接尾辞が必要）         |
| `fix:dict`, trailing spaces | `package.json` → `__find:md:not-old-blog` script        |
| link checker (Lychee)       | `content/en/blog/_index.md` → `link_check_exclude_path` |

## 検証 {#verify}

このポリシーは `scripts/old-blog-lint-ignores.test.mjs` によって保護されています。
このテストは、古いブログフォルダと新しいブログフォルダに違反をシードし、各ツールが前者をスキップして後者をフラグすることを検証します。
以下のコマンドで実行できます。

```sh
npm run test:local-tools
```

新しく無視された年にまだ lint の負債が残っていてツールがスキップするようになっても、それは想定どおりです。
古い投稿はそのまま残されます。
