---
title: ヘルパースクリプト
description: >-
  ラベル管理、リンクチェック、レジストリ更新などに CI ワークフローやローカル開発で使用されるシェルスクリプト。
weight: 30
default_lang_commit: 1cc5320d70b48ffcf7bc62af0657bc7ef1d001a9
drifted_from_default: true
---

すべてのスクリプトは [`.github/scripts/`](https://github.com/open-telemetry/opentelemetry.io/tree/main/.github/scripts) 配下にあります。

## check-i18n-helper.sh {#check-i18n-helpersh}

ローカリゼーションページに必須のフロントマターフィールド `default_lang_commit` が含まれているかを検証します。
不足しているページがある場合、スクリプトは修正コマンドを出力します。

```sh
npm run fix:i18n:new
```

## pr-approval-labels.sh {#pr-approval-labelssh}

レビュー状態とファイルオーナーシップに基づいて PR の承認ラベルを管理します。
[`pr-approval-labels` ワークフロー](../ci-workflows/#pr-approval-labels)から呼び出されます。

**動作の仕組み：**

1. `gh` を使って PR データ（変更されたファイル、最新のレビュー、現在のラベル）を取得します。
2. GitHub org API から `docs-approvers` チームメンバーを解決します。
3. 変更されたファイルを [`.github/component-owners.yml`][owners] と照合して、必要な SIG チームを特定します（YAML を手動でパースし、`yq` への依存はありません）。
4. 必要なグループごとに承認レビューがあるかを確認します。
5. 三値ロジック（`true`/`false`/`unknown`）を使用してラベルを追加または削除し、チームメンバーシップを取得できない場合にラベルが変更されることを防ぎます。

[owners]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml

**必須の環境変数：** `REPO`、`PR`、`GITHUB_TOKEN`。

## update-registry-versions.sh {#update-registry-versionssh}

上流のレジストリに問い合わせて `data/registry/*.yml` のパッケージバージョンを自動更新します。
対応レジストリはnpm、Packagist、RubyGems、Go、NuGet、Hex、Mavenです。

- CI 環境（`GITHUB_ACTIONS` が設定されている場合）: ブランチを作成し、PR をオープンします。
- ローカル環境: デフォルトでは**ドライラン**モードで実行されます。
  実際に実行するには `-f` を使用してください。

更新サマリーから SHA-1 タグを生成することで PR の重複を排除します。

バージョンが変更された場合、レジストリ更新によって外部 URL が追加または削除されることがあるため、スクリプトはコミット前に[リンクキャッシュ][link cache]を更新します。
その更新中に一時的な障害が発生すると、リンク自体は通過するにもかかわらず、bot PR の `CACHE updates committed?` が赤くなることがあります。
その場合は PR に [`/fix:link-cache`][] とコメントして修復してください。
一方、更新により実際に壊れた URL が導入された場合は、bot PR のリンクチェック自体が赤くなります。
キャッシュ修正を再実行するのではなく、URL を修正してください。

<!-- prettier-ignore-start -->
[`/fix:link-cache`]: /docs/contributing/pull-requests/#fixing-prs-in-github
[link cache]: /site/build/link-checking/#link-cache
<!-- prettier-ignore-end -->
