---
title: i18n 乖離状況の更新
description: >-
  ローカライズされたコンテンツ全体の drifted_from_default フロントマターフィールドを更新し、
  オプションでその結果の PR を作成する方法。
default_lang_commit: 74d8cb2aaefe493295c6c49e2e8ef39801847880
---

以下の手順に従い、ロケールごとに `npm run fix:i18n:status` を実行してローカライズされたコンテンツの `drifted_from_default` フロントマターフィールドを更新し、ロケールごとにコミットして、オプションで PR を作成します。

## 引数 {#arguments}

このスキルはオプションの引数を受け付けます。

- **`--locale locale,...`**（オプション）: 処理するロケール ID のカンマ区切りリストです。
  たとえば `--locale pt,es,fr` のように指定します。
  省略した場合、英語以外のすべてのロケールが処理されます。
- **`--create-pr`**（オプションフラグ）: 処理後に自動的に PR を作成します。
  省略した場合、`AskUserQuestion` を使用して PR を作成するかどうかをユーザーに確認します。

## 準備 {#preparation}

以下の手順は、メインリポジトリを指す `upstream` リモートが設定されたリポジトリのローカルクローンがあることを前提としています。
リポジトリルートからローカルで実行してください。

1. ワーキングツリーがクリーン（コミットされていない変更がない）であることを確認します。
2. `main` に切り替えて最新の変更をプルします。

   ```sh
   git checkout main
   git pull upstream main
   ```

3. 作業用ブランチを作成します。

   ```sh
   git checkout -b i18n_update-drift-status
   ```

## ロケールの検出 {#discover-locales}

`--locale` が渡されなかった場合、コンテンツディレクトリから英語以外のすべてのロケールを検出します。

```sh
find content -maxdepth 1 -mindepth 1 -type d ! -name 'en' -exec basename {} \;
```

これにより、1行に1つのロケール ID（たとえば `bn`、`es`、`fr` など）が返されます。

`--locale` が渡された場合は、そのリストを使用します。

> [!NOTE] `en` を含めないこと
>
> 英語はデフォルトのコンテンツであり乖離は発生しないため、ロケールリストに含めたり、このスキルで処理したりしないでください。
> `--locale` 引数に `en` が含まれている場合は、無視するかエラーを報告してください。

## ロケールごとの乖離状況の更新 {#update-per-locale}

解決されたロケールリスト内の各 `{LANG_ID}` に対して、以下を実行します。

1. 乖離状況の更新コマンドを実行します。

   ```sh
   npm run fix:i18n:status -- content/{LANG_ID}
   ```

2. PR の説明テーブル用の統計情報を収集します。

   ```sh
   # 乖離したファイル数
   grep -rl "drifted_from_default: true" content/{LANG_ID} | wc -l
   # 翻訳可能なファイルの合計数
   grep -rl "default_lang_commit" content/{LANG_ID} | wc -l
   ```

3. コマンドによって変更が生じた場合、ステージングしてコミットします。

   ```sh
   git add content/{LANG_ID}
   git commit -m "chore({LANG_ID}): update drift status"
   ```

   あるロケールで変更がなかった場合、コミットはスキップしますが、統計情報は記録します。

## PR の作成 {#create-the-pr}

すべてのロケールの処理後、以下を行います。

- `--create-pr` が渡されて**いない**場合、`AskUserQuestion` を使用して PR を作成するかどうかをユーザーに確認してから進めます。
- ユーザーが拒否した場合（または `--create-pr` が渡されておらず、ユーザーが「いいえ」と答えた場合）、ここで処理を止めて統計情報を報告します。

PR を作成するには、ブランチをプッシュします。

```sh
git push -u origin i18n_update-drift-status
```

次に `gh pr create` を以下の内容で実行します。

- **タイトル**: `[i18n] Update drift status for localized content`
- **説明**: 上記で収集した統計情報を以下のテーブルに記入し、処理されたロケールのみを含めます。

```md
Updates the drift status for localized content.

Status per locale after this PR:

| Locale | Drifted files | Total files |
| ------ | ------------- | ----------- |
| {ID}   | {drifted}     | {total}     |
```
