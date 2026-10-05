---
title: リンクチェック
weight: 12
description: ローカルおよび CI でのサイトのリンクチェック方法。
default_lang_commit: bf53e16042a4ec7ae37779f944c49d1cde3719d3
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
| `fix:link-cache`       | `check:links` のエイリアス。[リンクキャッシュ][link cache]を更新するために使用 |

`check:links` と `check:links:internal` スクリプトは `BUILD_KIND` のビルドに対して実行されます。
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

外部リンクのチェック結果は **`link-cache.jsonc`** にキャッシュされます。
このファイルは [link-cache][] パッケージが管理するコミット済みキャッシュです。
Lychee 独自のキャッシュファイル `.lycheecache` は実行ごとにそこから導出され、git 管理外です。
ファイルのフォーマット（エントリを手動でシードする方法を含む）については[所有キャッシュ][cache-format]を、チェック実行がどの URL をフェッチしどの URL をキャッシュから提供するかについては[オペレーティングモデル][Operating model]を参照してください。
手動編集は意図的なシード専用です。
単にリンクチェッカーをブロックする URL の場合は、かわりに `?link-check=no` を URL に付加してください（[有効な外部リンクの対処][Handling valid external links]を参照）。

キャッシュは複数の[スケジュール実行ワークフロー](#workflows)とコンテンツ PR によって日常的に更新されるため、同時更新は Git の 3 ウェイマージで競合する可能性があります。
異なる URL であっても、両サイドが同じソート位置のギャップに挿入したり、一方がプルーニングしたエントリをもう一方がリフレッシュまたは隣に挿入した場合（ハンクがエントリを分割することがあります）に競合が発生します。
ブランチのキャッシュ変更が通常のチェック結果である場合は、`main` のファイル全体を取得してチェックを再実行すれば、ブランチに必要なものが再追加されます。
それ以外の場合は[所有キャッシュ][cache-format]の競合ルールに従い、チェックを再実行してファイルを正規化してください。

外部リンクを追加または変更した場合は、**PR を送信する前に** `npm run check:links` を実行し（サイトビルドが実行時間の大部分を占めます）、更新された `link-cache.jsonc` をコンテンツの変更と一緒にコミットしてください。
そうしないと `CACHE updates committed?` チェックが失敗します。
復旧手順については [`CACHE updates committed?`][pr-checks] を参照してください。

## キャッシュの更新とハウスキーピングワークフロー {#workflows}

以下のワークフローは毎日スケジュールされ、リンクチェックコマンドを実行します。

| ワークフロー                                                    | リンクチェックコマンド                          |
| --------------------------------------------------------------- | ----------------------------------------------- |
| Refcache refresh                                                | `log:check:links`（フルビルド、プルーニング後） |
| [ハウスキーピング][Housekeeping]（`fix-and-test:all`）          | `fix:link-cache`（フルビルド）                  |
| [レジストリバージョンの自動更新][Auto-update registry versions] | `fix:link-cache`                                |

Refcache refresh は最も古いキャッシュエントリをプルーニングし（件数はワークフローの入力値）、リンクチェックを再実行することで、プルーニングされた URL のうちサイトでまだ使用されているもののキャッシュエントリを更新します。

### 失敗したリンクのダブルチェック {#double-check}

一部のサイトはブラウザには有効なページを提供しますが、Lychee のようなプレーンな HTTP クライアントを拒否します（ボットウォール、crates.io の無条件 404、npmjs.com のサインインリダイレクト）。
キャッシュされた失敗は[毎回の実行で再フェッチされる][Operating model]ため、そのようなサイトへのリンクはチェックのたびに失敗することになります。

**ダブルチェック**ツールは、Lychee が報告した失敗をブラウザグレードのプローブで再検証し、解決した URL を `link-cache.jsonc` に合成ステータス `206`（「OK by analysis」）で記録します。
解決できない URL は、チェックが記録した失敗のまま残り、refresh PR でトリアージされます。
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
このジョブは、実行によってコミット済みの `link-cache.jsonc` が古くなった場合に失敗します。

<!-- prettier-ignore-start -->
[Auto-update registry versions]: ../scripts/#update-registry-versionssh
[blog-index]: https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/blog/_index.md
[Build kinds: full and lean]: ../#build-kinds
[cache-format]: https://github.com/chalin/link-cache/blob/main/docs/cache-format.md
[ci]: ../ci-workflows/
[double-check README]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/lychee/double-check/README.md
[drifted]: /docs/contributing/localization/#track-changes
[Handling valid external links]: /docs/contributing/pr-checks/#handling-valid-external-links
[Housekeeping]: ../ci-workflows/#housekeeping
[link cache]: #link-cache
[link-cache]: https://github.com/chalin/link-cache#readme
[Lychee]: https://lychee.cli.rs/
[lychee-install]: https://lychee.cli.rs/guides/getting-started/
[Operating model]: https://github.com/chalin/link-cache/blob/main/docs/operating-model.md
[`lychee.base.toml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/lychee.base.toml
[pr-checks]: /docs/contributing/pr-checks/#cache-updates-committed
<!-- prettier-ignore-end -->
