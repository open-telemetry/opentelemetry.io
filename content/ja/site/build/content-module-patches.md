---
title: コンテンツモジュールのパッチ
description: >-
  リリース間でコンテンツモジュールの一時的なパッチを作成・管理する方法。
weight: 15
default_lang_commit: 74d8cb2aaefe493295c6c49e2e8ef39801847880
---

このサイトで公開されている仕様ページ（OTel 仕様、OTLP、セマンティック規約、OpAMP）は、[`content-modules/`][content-modules] 配下の git サブモジュールとして管理されている上流リポジトリから取得されます。
ウェブサイトは各サブモジュールの特定のリリースをピン留めしているため、生の Markdown は新しいリリースにバンプすることでのみ更新できるスナップショットです。

[`npm run cp:spec`](../npm-scripts/#submodules-and-content) を実行すると、[`cp-pages.sh`][cp-pages] がサブモジュールのコンテンツを `tmp/` にコピーし、`README.md` ファイルを `_index.md` にリネームした後、すべての Markdown ファイルに対して [`adjust-pages`][script] スクリプトを実行します。
Hugo は `tmp/` をサイトツリーにマウントするため、処理済みのページは `/docs/specs/` 配下に表示されます。

## スクリプトの動作 {#what-the-script-does}

仕様の Markdown ファイルは GitHub レンダリング向けに書かれています。
Hugo のフロントマターがなく、リンクは GitHub の URL を指し、画像パスはリポジトリのレイアウトを前提としています。
[`adjust-pages`][script] スクリプトは、各ファイルに以下の変換を適用することでこのギャップを埋めます。

- **フロントマターの挿入** — 最初の `# Heading` を `title` として抽出し、`linkTitle` を生成して Hugo のフロントマターを出力します。
  `<!--- Hugo ... --->` コメントブロックに埋め込まれたフロントマターもサポートしています。
- **バージョンの記録** — OTel 仕様、OTLP、セマンティック規約のランディングページのタイトルと linkTitle に仕様のバージョン番号（例: `1.54.0`）を付加します。
- **URL の書き換え** — 仕様リポジトリの絶対 GitHub URL をローカルの `/docs/specs/...` パスに変換し、仕様間のクロスリンクがサイト上で機能するようにします。
- **画像パスの調整** — 相対画像パスを、Hugo ページの場所から正しく解決されるように書き換えます。
- **コンテンツの削除** — サイトで不要な `<details>` ブロックや `<!-- toc -->` セクションを削除します。
- **一時パッチ** — リリースでまだ修正されていない仕様の問題に対して、正規表現ベースのパッチを適用します（以下を参照）。

変換はスクリプトの [`index.mjs`][script] 内で順序付きルールパイプラインとして実行され、順序が重要です。
変更する場合は、仕様ページを再生成し、`tmp/` のビフォーアフター差分を確認して、スクリプトのキャラクタリゼーションテスト（`index.test.mjs`）を合わせて更新してください。

仕様のバージョンは [`data/spec-versions.yml`][spec-versions] で宣言されています。
これは Hugo のデータファイルであるため、テンプレートからもアクセスできます。
バージョンはバージョン更新ワークフローによって自動的に更新されます。
`cp:spec` の実行時に、スクリプトは各バージョンが [`.gitmodules`][gitmodules] の対応する `*-pin` エントリのベースリリースと一致することを検証し、一致しない場合は失敗します。
（ピンは正確なリリースではなく `git describe` の識別子である場合もあります。たとえば、ドラフト仕様の統合ブランチなどです。）

## リリース間での仕様のパッチ適用 {#patching-specs}

仕様のリンク切れや不正確なコンテンツの修正には、上流リポジトリへの PR、新しいリリース、このリポジトリでのサブモジュールバンプが必要です。
このプロセスには数週間から数か月かかることがあります。
その間、壊れたコンテンツが CI の失敗を引き起こします。
最も多いのは、サイト上のすべての外部リンクをチェックする自動化された `otelbot/refcache-refresh` PR です。

上流リリースを待たずに CI をブロック解除するには、[`patches.yml`][patches] に一時パッチを追加できます。
コードの変更は不要です。
パッチは正規表現ベースの書き換えで、ビルド時に実行されます。
バージョントラッキングが組み込まれており、仕様がパッチのバージョン範囲を超えると、`cp:spec` がパッチが廃止済みで削除可能であることを示す警告を出力します。

### 1. パッチエントリの追加 {#1-add-a-patch-entry}

パッチは [`patches.yml`][patches] に YAML リストのエントリとして宣言します。
新しいエントリを追加します（リストが空の場合は `[]` マーカーを置き換えてください）。

```yaml
- id: 2025-11-21-docker-api-versions
  module: semconv
  minVers: 1.39.0-dev
  file: ^tmp/semconv/docs/
  search: '(https://docs\.docker\.com/reference/api/engine/version)/v1\.(43|51)/(#tag/)'
  replace: '$1/v1.52/$3'
  flags: g
  notes: >-
    Replace older Docker API versions with the latest. See
    open-telemetry/semantic-conventions#3103; upstreamed fix:
    open-telemetry/semantic-conventions#3093
```

各パッチエントリのフィールドは以下のとおりです。

- **`id`** — ログメッセージに出力される一意の ID（日付 + 短い説明）。
- **`module`** — `spec`、`otlp`、`semconv` のいずれか。
- **`minVers`** — 包含的な下限。
  サブモジュールのバージョンがこのバージョン以上である間パッチが適用され、仕様がパッチのバージョン範囲を超えると廃止されます。
- **`maxVers`** — 省略可能な排他的上限。
  省略した場合、`minVers` のパッチ番号をインクリメントした値がデフォルトとなります（たとえば `1.55.0` は `maxVers = 1.55.1` を意味します）。
  これは元の接頭辞マッチの動作と一致します。
  明示的に設定した場合、サブモジュールのバージョンが `maxVers` に達するとパッチはスキップされます（つまり、バージョンが `< maxVers` の間のみ適用されます）。
- **`file`** — パッチを適用するファイルパスにマッチする省略可能な正規表現。
  たとえば `^tmp/semconv/docs/` です。
  省略した場合、モジュールの仕様/ドキュメントツリーがデフォルトとなります。
  `spec` の場合は `^tmp/otel/specification/`、`otlp` の場合は `^tmp/otlp/docs/`、`semconv` の場合は `^tmp/semconv/docs/` です。
- **`context`** — 省略可能。
  `body|front-matter`（デフォルト: `body`）。
  body パッチは行ごとに適用されます。
  `front-matter` パッチはフロントマターブロック全体に適用されます。
- **`search`** — 置換対象のテキストに対する JavaScript の `RegExp` ソース。
  バックスラッシュがリテラルのまま維持されるよう、シングルクォートの YAML を推奨します。
- **`replace`** — JavaScript の置換構文（`$1`、`$<name>`、`$&`）を使用した置換文字列。
  グループ参照の後に数字が続く場合は、名前付きキャプチャグループを使用してください。
  `$108` は曖昧です。
- **`flags`** — 省略可能な `RegExp` フラグ。
  通常、すべての出現箇所を置換するために `g` を使用します。
- **`notes`** — 省略可能なフリーテキスト。
  パッチの内容と、上流のイシュー/PR へのリンク。

別途の登録手順は不要です。
スクリプトはビルド時に [`patches.yml`][patches] のすべてのエントリを適用します。

### 2. パッチのテスト {#2-test-the-patch}

仕様コピーステップを実行し、パッチが適用されたことを確認します。

```sh
npm run cp:spec
```

正常に実行されるとエラーは表示されません。
`tmp/` の出力で問題のあるコンテンツを検索し、書き換えられたことを確認できます。
リンク関連のパッチの場合は、以下も実行してください。

```sh
npm run fix:link-cache  # リンクをチェックし、リンクキャッシュを更新します
npm test                # リンクチェックを含むフルテストの実行
```

### 3. コミットとプッシュ {#3-commit-and-push}

リンクキャッシュ PR（例: `otelbot/refcache-refresh` ブランチ）の修正中にパッチを作成した場合は、`patches.yml` への変更と更新された `.lycheecache` をまとめてコミットし、lease 付きで force-push します。

```sh
git add scripts/content-modules/adjust-pages/patches.yml .lycheecache
git commit -m "Patch content modules and refresh the link cache"
git push --force-with-lease
```

### 4. 廃止されたパッチの削除 {#4-remove-obsolete-patches}

修正を含む仕様の新しいリリースが出ると、`cp:spec` が警告を出力します。

```text
INFO: scripts/content-modules/adjust-pages/cli.mjs: patch '<id>' is probably
obsolete now that spec '<name>' is at version '<new>' >= '<target>'; if so,
remove the patch
```

このメッセージが表示されたら、[`patches.yml`][patches] からパッチエントリを削除してください。
最後に残ったパッチの場合は、将来のパッチの参考として、削除するかわりにコメントアウトしても構いません。

[content-modules]: https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules
[cp-pages]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/cp-pages.sh
[gitmodules]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.gitmodules
[patches]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/adjust-pages/patches.yml
[script]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/content-modules/adjust-pages
[spec-versions]: https://github.com/open-telemetry/opentelemetry.io/blob/main/data/spec-versions.yml
