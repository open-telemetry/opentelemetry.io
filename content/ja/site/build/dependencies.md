---
title: 依存関係の管理
description: >-
  サイトの npm 依存関係に対するインストール時の動作、更新手順、サプライチェーン制御
weight: 5
default_lang_commit: bf53e16042a4ec7ae37779f944c49d1cde3719d3
cSpell:ignore: EBADENGINE
---

npm 依存関係はコミット済みの `package-lock.json` によって固定され、インストール時にはレビュー済みのライフサイクルスクリプトのみが実行されます。
これらの制御の背景にある脅威モデルと根拠については、[Supply-chain security][] を参照してください。

## インストール時の動作 {#install-contracts}

CI、devcontainer、Netlify は、ロック固定かつスクリプト無効でインストールし、その後、レビュー済みのフック1つだけを明示的に再有効化します。
それは固定された Hugo バイナリを取得する `hugo-extended` のリビルドです。
リビルドは `scripts/rebuild-hugo-extended.mjs` を通じて実行され、制限付きバックオフでフェッチをリトライし、`HUGO_*` インストーラーオーバーライドが設定されている間は実行を拒否します。
インストールではオプショナルな依存関係を保持します。npm はプラットフォーム固有のバイナリ（たとえば `sass-embedded` 内の Dart Sass コンパイラー）を `os`/`cpu` で選択されるオプショナルな依存関係として配布するため、省略するとビルドが壊れます。
環境ごとの詳細は以下のとおりです。

- **CI**: `npm run ci:min` を実行します。
  サイトをビルドするジョブは続けて `npm run ci:prepare` を実行します。
- **Devcontainer**: `npm run install:safe` を実行します。
  同じ動作を保証します。
- **Netlify**: `npm run install:safe` を実行します。
  [Netlify][] のビルドコマンドによって、[不活性な自動インストール](#inert-netlify-auto-install)の後、クリーンなワーキングツリーのチェックの間に実行されます。
  - ロックのドリフトやその他の Git で検出可能な変更があればビルドが失敗します。
  - インストールが変更していないパスでの失敗については、後述の[古い Netlify ビルドキャッシュ](#netlify-build-cache)を参照してください。
- **ローカル**: `npm run install:safe`、または標準の `npm install` を実行します。
  標準の `npm install` は、`package.json` と一致する間はロックに従い、ライフサイクルスクリプトを無効化するかわりに[許可リスト](#lifecycle-script-allowlist)でゲートします。
  詳細は[ローカルセットアップ][local setup]を参照してください。

ネストされた [Docsy][] テーマのセットアップも同じ動作に従います。
`prepare` ステップが Docsy 自身のロック固定かつスクリプト無効のテーマ依存関係インストールを呼び出します。

### 古い Netlify ビルドキャッシュ {#netlify-build-cache}

Netlify は[デプロイコンテキスト][deploy context]ごとにビルドキャッシュを保持します。

- プロダクション用に1つ
- Deploy Preview 用に**ヘッドブランチ名**ごとに1つ。
  そのブランチ名の最初のビルド時にプロダクションキャッシュからシードされます。
  キャッシュの系統は明示的なクリアでのみ消滅します。
  ブランチの削除は Netlify からは見えないため、同じ名前で再作成されたブランチ（リサイクルされたボットブランチ名を含む）は古いキャッシュに再接続されます。

各キャッシュには[リポジトリのクローンが含まれており][includes a clone of the repository]、git サブモジュールを削除するコミットをチェックアウトすると、サブモジュールのワーキングツリーがそのまま残ります。
そのため、削除されたサブモジュールがキャッシュに乗って後のビルドに未追跡の残留物として混入し、クリーンなワーキングツリーのチェックに失敗する可能性があります。
デプロイログには `??` 接頭辞のステータス行としてそのパスが表示されます。

パスを `.gitignore` に追加するのではなく、該当する[ビルドキャッシュ][build cache]をクリアしてください。

- **プロダクション**:
  - **Deploys** > **Trigger deploy** からキャッシュをクリアしてサイトをデプロイします。
- **Deploy Preview**: 既にビルドされた各ブランチは独自のキャッシュコピーを保持しており、プロダクションのクリア後も影響を受けません。
  - PR の最新デプロイページから **Retry** > **Clear cache and retry with latest branch commit** でクリアします。
    ブランチ全体を一括でクリアする方法はありません。

> [!IMPORTANT]
>
> git サブモジュールを削除した後は、残留物がブランチごとのキャッシュにシードされる前に、削除の一環としてプロダクションビルドキャッシュをクリアしてください。
> また、リサイクルされたボットブランチ名の系統もクリアしてください。
> プロダクションのクリアではそれらに到達しません。

## 依存関係の更新 {#updating}

通常のバージョンアップは [Renovate][] PR として届き、[リリースクールダウン](#release-cooldown)でゲートされます。
既知の脆弱性修正はアラート駆動で届きます（[セキュリティ更新](#security-updates)）。
残りのケースは手動です。
いずれの場合も、再生成したロックファイルを `package.json` の変更と一緒にコミットしてください。

### マニフェストの変更 {#manifest-changes}

`package.json` を手動で編集した場合でも、`npm run update:packages` ですべてのバージョンをアップした場合でも（提供されるバージョンには[リリースクールダウン](#release-cooldown)が適用されます）、変更されたマニフェストに合わせてロックファイルを同期します。

```sh
npm install --package-lock-only --ignore-scripts
```

`npm update`（後述）とは異なり、このコマンドはマニフェスト編集の影響を受けるロックエントリのみを書き換えます。
ただし、編集したパッケージだけにとどまらない場合があります。
バンプされたパッケージが置き換えられると、そのパッケージ固有の推移的依存関係（他のパッケージが依存していないもの）が、範囲とクールダウンが許す最新バージョンに再解決される可能性があるため、ロックの差分全体をレビューしてください。

ロックファイルのマージコンフリクトも同じ方法で解決します。
`main` のバージョンを採用し、上記のコマンドを再実行してください。

### スクリプトを持つパッケージ {#script-bearing-packages}

`allowScripts` エントリを持つ（または必要とする）パッケージを追加または更新する場合、変更を行うコントリビューターは以下を行います。

1. 新しいバージョンのライフサイクルスクリプトをレビューする。
2. 結果を、依存関係の変更と一緒にコミットし、PR レビューで検証する。
   必要なスクリプトは正確なバージョン承認として、不要なスクリプトは名前レベルの拒否（`false`、以降のバージョンアップ時に更新不要）として記録する。
3. 新しい承認の場合、[`.github/renovate.jsonc`][] の Renovate 自動マージ除外リストにもそのパッケージを追加する。
   承認済みパッケージのすべてのバージョンアップには上記の手順が必要なため、その更新 PR はコントリビューターを待つ必要がある。

### 推移的依存関係のリフレッシュ {#transitive-refresh}

ロックファイル全体を再解決するスケジュールはありません（[解決は意図的][deliberate]）。
推移的依存関係をリフレッシュするには、リポジトリルートで以下をオンデマンドで実行します（ロックファイルは `scripts/generate-community-data` ワークスペースもカバーしています）。

```sh
npm update --package-lock-only --ignore-scripts
```

特定のパッケージだけをリフレッシュするには、名前を指定します。

```sh
npm update --package-lock-only --ignore-scripts PACKAGE_NAME
```

_`PACKAGE_NAME`_ をリフレッシュするパッケージ名に置き換えてください。

いずれの場合も、リフレッシュ後のロック全体をレビューしてください。
npm は選択されたバージョンが必要とするものも移動させます。
また、マニフェストの宣言された範囲に従うため、親が範囲を広げると新しい推移的メジャーバージョンが入る可能性があります。

[リリースクールダウン](#release-cooldown)が適用されますが、注意すべきエッジケースがあります。
満たせるバージョンがすべてクールダウンより新しい依存関係（正確なピン指定がよくあるケースです）は、いずれかのバージョンが経過期間を超えるまで解決全体が失敗します（`ETARGET`）。
レビュー済みで問題ないと判断した新しいリリースの場合は、その名前だけを除外します。
クールダウンはツリーの残りの部分には引き続き適用されます。

```sh
npm_config_min_release_age_exclude=PACKAGE_NAME \
  npm update --package-lock-only --ignore-scripts
```

除外は呼び出しごとに指定してください。
[`.npmrc`][] に恒久的なエントリを追加すると、その名前に対するクールダウンが永続的に免除されます。

### 予期しないロックファイルの変更 {#lock-drift}

依存関係を変更していないのにロックファイルが変更された場合（`postinstall` チェックがインストール時にこれを検出すると警告します）、ドリフトを示しています。
ロックファイルを復元し、リライトをコミットするのではなく調査してください。

### セキュリティ更新 {#security-updates}

既知の脆弱性修正は、週次の更新 PR を待たずにアラート駆動で届きます。

- **GitHub の [Dependabot security updates][]**: リポジトリ側の設定（`dependabot.yml` は不要）で、直接的および推移的依存関係にパッチを適用できます。
  npm の場合、ロックファイルだけでなく親のマニフェストエントリの書き換えが必要になることがあります。
- **[Renovate][] の脆弱性アラート PR**: 直接的依存関係に対して即座にオープンされます。

重複は意図的なものであり、まれに PR が重複することは許容されています。
スケジュールされたロックの再解決は[設計上無効][deliberate]であるため、これらのアラート駆動のパスが推移的修正の唯一の自動化されたルートです。
そのためリポジトリ側の設定は有効のままにしています。
どちらも PR を出さない場合は、メンテナーがパッケージを[名前で指定してリフレッシュ](#transitive-refresh)します（手動ルート）。
2つのパスは[リリースクールダウン](#release-cooldown)に対して異なる挙動を示します。

- Dependabot security updates は、すべてのリリース経過期間ゲート（`.npmrc` を含む）を意図的にオーバーライドします。
  クールダウンより新しい修正バージョンがランドする可能性があり、その検証はレビューするメンテナーの責任です。
- Renovate の PR は、ロックファイルを再生成する際に `.npmrc` のゲートの対象となるため、クールダウンより新しい修正は失敗したアーティファクト更新として届きます。
  早期に採用するには、メンテナーが[スコープ付き除外](#transitive-refresh)を実行する必要があります。

## サプライチェーン制御 {#controls}

### サプライチェーン監査 {#audit}

サプライチェーン監査テスト [`scripts/supply-chain-audit.test.mjs`][] は、`test:local-tools` の実行ごとにコミット済みファイルのみから以下の制御を検証します。
これにより、制御の退行はインシデントを待たずにテスト失敗として検出されます。
監査自体の検証原則については、その[設計ページ](/site/design/supply-chain-audit/)を参照してください。

PR で監査が失敗した場合、アサーションメッセージに期待される条件が記載されています。
よくあるケースは以下のとおりです。

- **`allowScripts` エントリを持つ依存関係をバージョンアップした場合**: [スクリプトを持つパッケージ](#script-bearing-packages)に従ってください。
  失敗メッセージにエントリが移行すべきバージョンが示されます。
- **インストールパスのスクリプト、`.npmrc`、または `netlify.toml` を変更した場合**: その失敗こそが目的です。
  監査はインストール面を固定し、変更のたびに意図的なレビューが行われるようにしています。
  変更に合わせて対応するアサーションを更新し、PR にその理由を記載してください。

グリーンにするためだけにアサーションを緩和しないでください。
各アサーションはこのページの制御を強制しているため、まず変更によってどの制御が緩和されるかを把握してください。

監査のスコープ外: <a id="audit-out-of-scope"></a>

- GitHub ワークフローファイル: トリガーとトークン権限はワークフローごとにレビューされます（[CI ワークフロー][ci-security]を参照）
- [Renovate][] 設定（[`.github/renovate.jsonc`][]）: コードと同様にレビューされるが、監査による固定の対象外
- [Docsy][] テーマ自身の依存関係インストール（上流で監査済み）
- インストール境界を越えたビルド側の npm スクリプト: サイト自身のコードを丸ごと実行し、通常の開発で変更される

### リリースクールダウン {#release-cooldown}

バージョン解決では、設定された最小経過期間より新しいリリースは無視されます。

- **適用**: [`.npmrc`][] の `min-release-age`。
  `scripts/generate-community-data` サブプロジェクトは独立したロックホームではなく npm ワークスペースであるため、ルートの `.npmrc` とロックファイルがその解決も管理します。
- **スコープ**:
  - 影響を受けるのはバージョン解決操作のみです。
    ロック固定インストール（`npm ci`）はバージョンを解決しません。
  - npm はプロジェクト設定をユーザー設定より優先するため、ユーザーの `.npmrc` でより厳しいクールダウンを設定していても、ここのプロジェクト値に緩和されます。
    特定の呼び出しで自分の設定を維持するには、`npm_config_min_release_age` 環境変数を設定してください。
    この変数は両方の設定より優先されます。
- **[Renovate][]**: 開く更新 PR に独自のクールダウンを適用します。
  [`.github/renovate.jsonc`][] の `minimumReleaseAge` で設定されます。
  人間のレビューなしでマージされる更新にはより長い期間が設定されます。
  プリセット提供の3日間の npm クールダウン（`security:minimumReleaseAgeNpm`）は、これらの期間をオーバーライドできないよう（その経過期間の免除を含め）除外されています。
  注意: そのプリセットの上流での名前変更は、暗黙的にクールダウンを再適用させます。
  Renovate が日付を判定できない更新タイプ（`pin`、`replacement`、`rollback` など）はクールダウンの対象外です。
  それらの PR は通常どおりオープンされ、恒久的に保留の安定性ステータス（必須チェックではない）が表示される場合があり、通常のレビューがゲートとなります。

### ライフサイクルスクリプト許可リスト {#lifecycle-script-allowlist}

インストール時にパッケージのライフサイクルスクリプトが実行されるのは、その正確な名前とバージョンが `allowScripts` 許可リストに記載されている場合のみです。

- **適用**: [`package.json`][] の `allowScripts` マップ。
  [`.npmrc`][] の `strict-allow-scripts` によりフェイルクローズドとなります。
- **評価されるタイミング**: スクリプト有効のインストール時のみです。
  具体的には、[インストール時の動作](#install-contracts)の `hugo-extended` リビルドステップ（npm がインストール済みツリー全体をチェックする）と、`--ignore-scripts` なしで実行されるローカルの `npm install` です。
- **拒否**:
  - `false` に設定されたエントリは、レビュー済みの拒否を記録します。
    パッケージはインストールされますが、そのスクリプトはスキップされます。
  - 拒否は何も許可しないため、バージョンをまたいで名前単位でパッケージをカバーします。
- **ローカルでのマスキング**: ユーザーの `.npmrc` で `ignore-scripts=true` を設定すると、通常のローカル `npm install` はスクリプト無効になるため、許可リストの評価をスキップします。
  ただし、リビルドステップは引き続き許可リストを評価するため、`npm run install:safe` はユーザー設定に関係なくリポジトリの態勢をチェックします。

### npm バージョンフロア {#npm-version-floor}

アクティブな npm が engines フロアより古い場合、インストールは失敗します。
engines フロアとは、上記の制御をサポートする最も古いバージョンです。

- **適用**:
  - [`package.json`][] の `engines` がフロアを設定します。
    フロアを下回る npm は、許可リストの適用機能の一部または全部、および[推移的リフレッシュの除外](#transitive-refresh)が依存する `min-release-age-exclude` 設定を欠いています。
    `engines` の横のコメントにリリースが記載されています。
    `allowScripts` をサポートしないバージョンはこのフィールドを黙って無視するため、スクリプト有効のインストールではすべてのインストールスクリプトが実行されます。
  - [`.npmrc`][] の `engine-strict` が npm の `EBADENGINE` 警告を拒否に変えます。
- **フロアポリシー**:
  - npm が制御の適用ギャップを修正するたびにフロアは引き上げられます。
  - コミット済みの `.nvmrc` は、バンドルされている npm がフロアを満たす Node.js リリースを固定しているため、CI、Netlify、`nvm` 管理のローカルセットアップは構造上これを満たします。
    [Renovate][] がこの固定値を最新に保ちます。
    （`lts/*` のようなフローティングな `.nvmrc` ではこれを保証できません。CI ランナーは古い可能性のあるキャッシュから解決します。）
- **Netlify**:
  - Netlify の Node バンドルのデフォルト npm はフロアより古い場合があります。
    [`netlify.toml`][] の [`NPM_VERSION`][netlify-deps] でフロアを満たすバージョンを固定しています。
  - 少なくともフロアが引き上げられた際にはこの固定値も更新してください。

### 不活性な Netlify 自動インストール {#inert-netlify-auto-install}

ビルド開始時の Netlify の[自動インストール][netlify-deps]は、[`netlify.toml`][] の [`NPM_FLAGS`][netlify-deps] によって無効化されます。

- `--dry-run`: npm はインストールが何を変更するかを解決してログに記録しますが、何も書き込みません。
- `--ignore-scripts`: ライフサイクルスクリプトは、ドライランの副作用としてではなく、明示的な指示により無効化されたままになります。

**スコープ**: `NPM_FLAGS` は Netlify のビルド設定であり npm の設定ではありません。
自動インストールにのみ適用され、ビルドコマンドの npm 実行には適用されません。

**多層防御**: [実際のインストール][install contracts]は `npm ci` であり、`node_modules` を丸ごと置換します。
そのため、自動インストールやビルドキャッシュの `node_modules` 内の残留物は、クリーンなワーキングツリーのチェックからは見えない（Git で検出可能な変更のみを見る）にもかかわらず、ビルドには持ち越されません。

### 素の npx の禁止 {#no-bare-npx}

リポジトリの設定（パッケージスクリプト、CI、ヘルパースクリプト、コントリビュータードキュメント）は、`npx BIN` としてバイナリを呼び出しません。
`node_modules` が古いか存在しない場合、`npx` は公開レジストリにフォールバックし、その名前を持つパッケージが何であれ実行します。
インストールプロンプトは防御になりません。
非インタラクティブなコンテキストではスキップされ、その他の場合は反射的に「はい」を誘います。
ローカライズされたコントリビュータードキュメントのコピーは、[ドリフトトラッキング][drift tracking]を通じてこのルールに追従します。

- **代替手段**:
  - パッケージスクリプトは、依存関係が提供するバイナリを直接呼び出します。
    npm が `node_modules/.bin` を `PATH` に追加するため、バイナリが存在しなければレジストリへの通信なしに大きなエラーで失敗します。
  - その `PATH` エントリがないコンテキスト（ドキュメント、スタンドアロンスクリプト）では、`npm exec --no -- BIN` を使用します。
    これはインストールを行いません。
- **適用**: レビューの規律による。
  自動化されたチェックはありません。

<!-- prettier-ignore-start -->
[`.github/renovate.jsonc`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/renovate.jsonc
[`.npmrc`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.npmrc
[`netlify.toml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/netlify.toml
[`package.json`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json
[`scripts/supply-chain-audit.test.mjs`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/supply-chain-audit.test.mjs
[build cache]: https://docs.netlify.com/build/configure-builds/troubleshooting-tips/
[ci-security]: ../ci-workflows/#security-model
[deliberate]: ../../design/supply-chain-security/#deliberate
[Dependabot security updates]: https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates
[deploy context]: https://docs.netlify.com/deploy/deploy-overview/#deploy-contexts
[Docsy]: https://www.docsy.dev/
[drift tracking]: /docs/contributing/localization/#track-changes
[includes a clone of the repository]: https://answers.netlify.com/t/what-does-clear-cache-and-deploy-site-do-specifically/9419/2
[install contracts]: #install-contracts
[local setup]: /docs/contributing/development/#local-setup
[netlify-deps]: https://docs.netlify.com/build/configure-builds/manage-dependencies/#npm
[Netlify]: https://www.netlify.com/
[Renovate]: https://docs.renovatebot.com/
[Supply-chain security]: /site/design/supply-chain-security/
<!-- prettier-ignore-end -->
