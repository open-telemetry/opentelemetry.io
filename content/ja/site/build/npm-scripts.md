---
title: NPM スクリプト
description: >-
  OpenTelemetry ウェブサイトのビルド、配信、検証、メンテナンスのための NPM スクリプト。
weight: 20
todo: Keep table entries sorted
default_lang_commit: e87b1c4543d287bc4509225d102588c0f2670eae
drifted_from_default: true
cSpell:ignore: lycheecache
---

スクリプトの定義はリポジトリルートの [`package.json`](https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json) にあります。
`npm run <script-name>` で任意のスクリプトを実行できます。
名前が `_` で始まるスクリプトは内部ヘルパーであり、直接実行することを想定していません。

> [!NOTE] デフォルトと `:all` スクリプトバリアント
>
> **`check`**、**`fix`**、**`test`** スクリプトは、各アクションでもっとも一般的に必要とされるサブスクリプトを実行します。
> すべてのサブスクリプトを実行するには、**`*:all`** バリアントを使用してください。
>
> - `check:all`
> - `fix:all`
> - `test:all`

## ビルドと配信 {#build-and-serve}

| スクリプト         | 説明                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| `build:full`       | サイトのフルビルドを実行します。詳細は [Build kinds][] を参照。        |
| `build:lean`       | サイトのリーンビルドを実行します。詳細は [Build kinds][] を参照。      |
| `build:preview`    | ミニファイ付きのフルビルド（例: Netlify プレビュー用）。               |
| `build:production` | ミニファイ付きのプロダクション Hugo ビルド。                           |
| `build`            | サイトをビルドします。デフォルトはリーンです。[Build kinds][] を参照。 |
| `clean`            | `make clean` を実行します。                                            |
| `serve:hugo`       | インメモリレンダリングで Hugo サーバーを起動します。                   |
| `serve:netlify`    | Hugo を使用して Netlify Dev を起動します。                             |
| `serve`            | Hugo 開発サーバーを起動します（デフォルト、フルレンダリング）。        |

## チェック {#checking}

| スクリプト             | 説明                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| `check:all`            | すべてのチェックスクリプトを順番に実行します。                           |
| `check:code-excerpts`  | コード抜粋をチェックし、更新が必要な場合は失敗します。                   |
| `check:codeowners`     | CODEOWNERS のロケールセクションがレジストリと一致することを検証します。  |
| `check:collector-sync` | collector-sync チェックを実行します。                                    |
| `check:expired`        | 期限切れのコンテンツ（フロントマターに基づく）をリストします。           |
| `check:filenames`      | [ファイル名の検証と廃止されたファイル/フォルダの検出][fn]。              |
| `check:format`         | Prettier と prose-wrap のチェック。                                      |
| `check:i18n`           | ローカリゼーションフロントマター（`default_lang_commit`）を検証します。  |
| `check:l10n`           | ローカリゼーションチェックを実行します。                                 |
| `check:links:diff`     | 変更されたファイルのみの Lychee リンクチェック（パイロット）。           |
| `check:links:htmltest` | htmltest でサイト全体をリンクチェックします。最初にリーンビルドを実行。  |
| `check:links:lychee`   | Lychee でサイト全体をリンクチェックします。最初にリーンビルドを実行。    |
| `check:links`          | サイト全体をリンクチェック（htmltest、デフォルト）。最初にリーンビルド。 |
| `check:markdown:specs` | `tmp/` 内の仕様フラグメントの Markdown lint。                            |
| `check:markdown`       | Markdown lint（コンテンツおよびプロジェクト）。                          |
| `check:registry`       | `data/registry/` 配下のレジストリ YAML を検証します。                    |
| `check:spelling`       | コンテンツ、データ、レイアウト Markdown に対する cspell。                |
| `check:text`           | コンテンツとデータに対する textlint。                                    |
| `check`                | もっとも一般的に必要なチェックスクリプトを順番に実行します。             |

## 修正 {#fixing}

| スクリプト                | 説明                                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| `fix`                     | もっとも一般的に必要な修正スクリプトを実行します。                          |
| `fix:code-excerpts`       | コード抜粋を更新します。                                                    |
| `fix:codeowners`          | レジストリから CODEOWNERS ロケールセクションを再生成します。                |
| `fix:all`                 | すべての修正スクリプトを実行します。                                        |
| `fix:format`              | Prettier を適用し、末尾の空白を削除します。                                 |
| `fix:format:staged`       | ステージングされたファイルのみをフォーマットします。                        |
| `fix:i18n`                | i18n フロントマターを追加/修正します（`fix:i18n:new`、`fix:i18n:status`）。 |
| `fix:l10n`                | ローカリゼーションの修正を適用します。                                      |
| `fix:markdown`            | Markdown lint の問題と末尾の空白を修正します。                              |
| `fix:refcache`            | refcache をプルーンし、リンクチェックを再実行します（refcache を更新）。    |
| `fix:refcache:refresh`    | カウントに基づいて refcache をプルーンします。                              |
| `fix:submodule`           | サブモジュールのリビジョンをピンします（`pin:submodule` と同じ）。          |
| `fix:filenames`           | [ファイルのリネームと廃止されたファイル/フォルダの削除][fn]。               |
| `fix:dict`                | cspell ワードリストをソートし、フロントマターを正規化します。               |
| `fix:expired`             | `check:expired` で報告されたファイルを削除します。                          |
| `fix:text`                | --fix 付きで textlint を実行します。                                        |
| `fix:collector-sync:lint` | --fix 付きで collector-sync 内の ruff を実行します。                        |
| `format`                  | Prettier write のエイリアス（コンテンツおよび nowrap パス）。               |

## サブモジュールとコンテンツ {#submodules-and-content}

| スクリプト         | 説明                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `code-excerpts`    | コード抜粋を更新します。非推奨: `fix:code-excerpts` または `check:code-excerpts` を使用。 |
| `cp:spec`          | 仕様コンテンツ（content-modules）をコピーします。                                         |
| `get:submodule`    | git サブモジュールを初期化/更新します（スキップするには `GET=no` を設定）。               |
| `pin:submodule`    | サブモジュールのリビジョンをピンします（任意の `PIN_SKIP`）。                             |
| `schemas:update`   | OpenTelemetry 仕様サブモジュールとコンテンツを更新します。                                |
| `update:submodule` | サブモジュールを最新のリモートに更新し、タグを取得します。                                |

## テストと CI {#test-and-ci}

| スクリプト                 | 説明                                                                             |
| -------------------------- | -------------------------------------------------------------------------------- |
| `diff:check`               | ワーキングツリーにコミットされていない変更がある場合に警告します。               |
| `diff:fail`                | ワーキングツリーに変更がある場合に失敗します（例: ビルド後）。                   |
| `fix-and-test:all`         | すべての修正（i18n を含む）を実行し、その後チェック。リンクチェックは1回。[^fat] |
| `netlify-build:preview`    | `build:preview` を実行し、その後 `diff:check`。                                  |
| `netlify-build:production` | `build:production` を実行し、その後 `diff:check`。                               |
| `test-and-fix`             | 修正スクリプト（i18n/refcache/submodule を除く）を実行し、その後チェック。       |
| `test:all`                 | `test:base` を実行し、その後 `test:compound-tests`。                             |
| `test:base`                | 基本テスト（`check` と同じ）。                                                   |
| `test:collector-sync`      | collector-sync テスト。                                                          |
| `test:compound-tests`      | 複合 `test:*-*` スクリプトを実行します。[^categories]                            |
| `test:edge-functions:live` | 任意の `node:test` ライブスイート。`--help` をサポート。                         |
| `test:edge-functions`      | `netlify/edge-functions/**/*.test.ts` に対する Node テストランナー。             |
| `test:local-tools`         | `scripts/**/*.test.mjs` に対する Node テストランナー。[^categories]              |
| `test:local-tools:lychee`  | `test:local-tools` の lychee バイナリスライス（注記を参照）。                    |
| `test:public`              | ビルドされたサイトに対して `tests/public/` チェックを実行します。[^categories]   |
| `test`                     | もっとも一般的に必要なテストを実行します。                                       |

[^categories]:
    これらのスクリプトはテストスクリプトの命名規則に従います。
    [テストカテゴリ](/site/testing/#test-categories)を参照してください。

[^fat]:
    ハウスキーピングのデフォルト: コンテンツ修正の後に `fix:refcache`（プルーンしてからリンクチェック）を実行します。
    keep-going `all` ランナーを使用してすべての修正を記録します。
    チェックフェーズは `check:links`（`fix:refcache` がカバー）と `check:i18n`（`fix:i18n` がドリフトステータスを記録した後は冗長）を除外します。
    [ハウスキーピング](../ci-workflows/#housekeeping)を参照してください。

## ユーティリティ {#utilities}

| スクリプト                     | 説明                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `seq`                          | 指定されたスクリプト名を順番に実行します。最初の失敗で終了。                 |
| `all`                          | 指定されたすべてのスクリプトを実行し、いずれかが失敗した場合は失敗で終了。   |
| `locale-auto-merge`            | [ロケール自動マージヘルパー CLI][locale-auto-merge]（`--help`）。            |
| `prepare`                      | インストールステップ: `get:submodule` を実行し、Docsy テーマの npm install。 |
| `prebuild:*`                   | `build*` の前に実行されるフック。各フックは `_prebuild` を実行。             |
| `update:hugo`                  | 最新の hugo-extended をインストールします。                                  |
| `update:packages`              | npm-check-updates を実行して依存関係を更新します。                           |
| `generate:config:links`        | `.htmltest.base.yml` から git 無視の `.htmltest.yml` を生成します。          |
| `generate:config:links:lychee` | `lychee.base.toml` から git 無視の `lychee.toml` を生成します。              |
| `log:build`、`log:check:links` | 対応するスクリプトを実行し、出力を `tmp/` に tee します。                    |

## 注記 {#notes}

- **refcache のメンテナンス**は htmltest 固有です。
  詳細は [Refcache](/site/build/link-checking/#refcache) を参照してください。
- **Lychee リンクチェック（パイロット）。**
  `:lychee` と `:diff` スクリプトは、htmltest のより高速な代替として [Lychee](https://github.com/lycheeverse/lychee) を実行し、そのカバレッジを反映します。
  `lychee.toml` を生成し、refcache から `.lycheecache` を自動的に（再）シードします。
  Lychee は [#10449](https://github.com/open-telemetry/opentelemetry.io/issues/10449) で評価される間、非ブロッキングの [CI パイロット](../ci-workflows/#other-workflows)として実行されます。
- **`test:local-tools:lychee`** は `test:local-tools` のうち `lychee` バイナリを必要とするサブセット（動作フラグメントおよび設定チェックテスト）です。
  バイナリが存在しない場合はそれらのテストはスキップされるため、`test:local-tools` は一般的なテストジョブですでにカバーしています。
  末尾の `:lychee` はこのスクリプトを `test:compound-tests`（`test:*-*` にマッチ）から除外し、スイートが2回実行されないようにします。
  リンクチェック CI ジョブは lychee をインストールし、このスクリプトを実行して実際にテストを実行します。
- **`all`** はリスト内のスクリプトを1つが失敗してもすべて実行し、いずれかが失敗した場合は非ゼロステータスで終了します。

[build kinds]: /site/build/#build-kinds
[fn]: /docs/contributing/pr-checks/#filename-check
[locale-auto-merge]: ../ci-workflows/#locale-auto-merge
