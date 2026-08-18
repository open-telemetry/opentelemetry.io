---
title: リンクチェック
weight: 12
description: ローカルおよび CI でのサイトのリンクチェック方法。
default_lang_commit: 9a8128b38643d2c42b1d249b42c29ebe23c6c2b7
---

サイトのリンクチェックには **[Lychee][]** を使用しており、外部リンクの結果はコミットされたキャッシュ（[リンクキャッシュ][link cache]を参照）によって裏付けられています。

> [!NOTE] Lychee のローカルインストールは任意です
>
> CI はすべての PR のリンクチェックを行い、ボットが[リンクキャッシュ](#link-cache)を更新できます。
> ローカルでチェックを実行するには、[Lychee をインストール][lychee-install]してください。
> CI は独自のピン留めされたコピーをインストールするため（`.github/actions/install-lychee` アクションを参照）、ローカルバージョンもそれに近い状態を維持してください。

## リンクのチェック {#check-links}

ローカルでリンクをチェックするには、以下を実行します。

```sh
npm run check:links
```

## よく使うコマンド {#common-commands}

| コマンド               | チェック範囲                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `check:links`          | サイト全体                                                                     |
| `check:links:internal` | サイト全体、オフライン（外部リンクなし）                                       |
| `check:links:diff`     | 変更されたファイルのみ                                                         |
| `fix:link-cache`       | `check:links` のエイリアス。[リンクキャッシュ][link cache]を更新するために使用 |

`check:links` と `check:links:internal` スクリプトは `BUILD_KIND` のビルドに対して実行されます。
`check:links:diff` は既存の `public/` ビルドのファイルをチェックします。
詳細は[フルビルドとリーンビルド][Build kinds: full and lean]を参照してください。

## 設定 {#configuration}

Lychee はビルドされたサイト（`public/`）に対して、生成された git 管理外の `lychee.toml` を使用して実行されます。
`generate:config:links` スクリプトは [`lychee.base.toml`][] にページのフロントマターから算出された `exclude_path` ブロックを加えて設定を導出します。
フロントマターには 2 つのソースがあります。

- **`link_check_exclude_path`** — リンクチェッカーがスキップすべきページのサイト相対パス正規表現のリスト。
  ブログのページネーションや古いブログ記事などが該当します。
  [`content/en/blog/_index.md`][blog-index] を参照してください。
  パターンを `^(../)?` で始めることで、すべてのロケールをカバーできます。
  オプションの `../` は `ja/` のような 2 文字のロケールパスセグメントにマッチします。
- **`drifted_from_default`** — [乖離したローカリゼーションページ][drifted]。
  ステータスは `true`（英語の対応ページが変更された）または `file not found`（英語の対応ページが削除された）です。
  そのようなページ*からの*リンクはチェックされません。
  古くなっている可能性があるためですが、そのページは有効なリンクターゲットのままです。
  同期済みのページからのインバウンドリンク（フラグメントを含む）は引き続き検証されます。

保存された乖離ステータスは、最後に夜間の[ハウスキーピング][Housekeeping]ステータス同期がマージされた時点のものに過ぎないため（そのため、ウィンドウが 1 日を超えることもあります）、ジェネレーターは**乖離保留中**のページもスキップします。
これは、**乖離ステータスのベースライン**（`data/l10n-drift.yaml` にツリー全体のステータス同期 `npm run fix:i18n` によって記録された main ブランチのコミット）以降に変更（または削除）された英語ページのロケールコピーです。
ベースライン以降にそのコピー自体が変更されている場合は、チェック対象のままになります。
誰かがそのページの作業を行っているためです。
ベースラインが存在しないか解決できない場合、設定の生成は失敗します。
CI では、`CHECK LINKS` ジョブが最初にシャロークローンをベースラインコミットまで深くします。
ローカルでは、不足している履歴をフェッチ（`git fetch upstream main`）するか、ベースラインをオーバーライドしてください。
`DRIFT_BASELINE=HEAD npm run check:links` はオーバーレイを空にします（保存済みステータスのスキップは引き続き適用されます）。

ローカルでのツリー全体のステータス同期（`npm run fix:i18n`）は `data/l10n-drift.yaml` を書き換えることがあります。
その書き換えはコミットしないでください。
ローカルで記録されたコミットは upstream に存在しない可能性があります。

## リンクキャッシュ {#link-cache}

外部リンクのチェック結果は `.lycheecache` にキャッシュされます。
このファイルはバージョン管理下にあるため、チェックは新しい URL またはキャッシュエントリの有効期限が切れた URL のみをフェッチします。
Lychee は成功した結果のみをキャッシュするため、失敗は毎回リトライされます。

外部リンクを追加または変更した場合は、**PR を送信する前に** `npm run check:links` を実行し（サイトビルドが実行時間の大部分を占めます）、更新された `.lycheecache` をコンテンツの変更と一緒にコミットしてください。
そうしないと `CACHE updates committed?` チェックが失敗します。
復旧手順については [`CACHE updates committed?`][pr-checks] を参照してください。

## キャッシュの更新とハウスキーピングワークフロー {#workflows}

以下のワークフローは毎日スケジュールされ、**フル**ビルドに対してリンクチェックコマンドを実行します。

| ワークフロー                                           | リンクチェックコマンド              |
| ------------------------------------------------------ | ----------------------------------- |
| Refcache refresh                                       | `log:check:links`（プルーニング後） |
| [ハウスキーピング][Housekeeping]（`fix-and-test:all`） | `fix:link-cache`                    |

Refcache refresh は最も古いキャッシュエントリをプルーニングし（件数はワークフローの入力値）、リンクチェックを再実行することで、プルーニングされた URL のうちサイトでまだ使用されているもののキャッシュエントリを更新します。

### 失敗したリンクのダブルチェック {#double-check}

一部のサイトはブラウザには有効なページを提供しますが、Lychee のようなプレーンな HTTP クライアントを拒否します（ボットウォール、crates.io の無条件 404、npmjs.com のサインインリダイレクト）。
[失敗はキャッシュされない](#link-cache)ため、そのようなサイトへのリンクは、キャッシュエントリの有効期限が切れるたびにリンクチェックで失敗することになります。

**ダブルチェック**ツールは、Lychee が報告した失敗をブラウザグレードのプローブで再検証します。
プローブが解決した URL は `.lycheecache` に合成ステータス `206`（「OK by analysis」）で記録されます。
Refcache refresh ワークフローはリンクチェックの後にダブルチェックを実行します。
キャプチャされたログに対してローカルで実行するには、以下を使用します。

```sh
npm run log:check:links
npm run fix:link-cache:double-check
```

オプションについては `npm run fix:link-cache:double-check -- --help` を実行してください。
プローブの動作とセットアップについては [double-check README][] を参照してください。

## CI での動作 {#in-ci}

[`check-links.yml` ワークフロー][ci]はサイトを一度（リーン）ビルドし、そのアーティファクトを `CHECK LINKS` ジョブと共有するため、ローカルでの実行と CI は同じビルドをチェックします。
リンクチェックが失敗するとそのジョブは失敗し、更新されたキャッシュを `CACHE updates committed?` ジョブに渡します。
このジョブは、実行によってコミット済みの `.lycheecache` が古くなった場合に失敗します。

<!-- prettier-ignore-start -->
[blog-index]: https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/blog/_index.md
[Build kinds: full and lean]: ../#build-kinds
[ci]: ../ci-workflows/
[double-check README]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/lychee/double-check/README.md
[drifted]: /docs/contributing/localization/#track-changes
[Housekeeping]: ../ci-workflows/#housekeeping
[link cache]: #link-cache
[Lychee]: https://lychee.cli.rs/
[lychee-install]: https://lychee.cli.rs/guides/getting-started/
[`lychee.base.toml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/lychee.base.toml
[pr-checks]: /docs/contributing/pr-checks/#cache-updates-committed
<!-- prettier-ignore-end -->
