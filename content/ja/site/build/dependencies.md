---
title: 依存関係の管理
description: >-
  サイトの npm 依存関係に対するインストール時の動作、更新手順、サプライチェーン制御
weight: 5
default_lang_commit: f73c0ca547d4c6160a6afa492e36992b1876299b
cSpell:ignore: EBADENGINE ERESOLVE
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

通常のバージョンアップは [Renovate][] PR として届き、[リリースクールダウン](#release-cooldown)でゲートされ、更新タイプごとにグループ化されます。
patch グループはより長いクールダウンの後に自動マージされ、minor および major の更新はレビュー後にマージされます。
[OpenTelemetry npm パッケージ](#peer-coupled-packages)はかわりに1つの PR としてまとめて届きます。
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

依存関係の変更によってインストールスクリプトを持つパッケージが追加される場合、または承認を持つパッケージがバージョンアップされる場合、[スクリプトポリシー][script policy]に従ってレビューしてください。

1. `npm view PACKAGE_NAME@VERSION scripts` を実行する。
   _`PACKAGE_NAME`_ と _`VERSION`_ にはロックされた名前とバージョンを指定する。
   そのバージョンのインストールスクリプト（`preinstall`、`install`、`postinstall`）が実行するファイルを、実行せずに読む。
   `npm run ci:min` はロックされたツリーを `node_modules` にインストールし、スクリプトは一切実行しない。
2. [`package.json`][] の `allowScripts` を[依存関係の変更](#updating)と一緒に更新する。
   - サイトのワークフローがセットアップ中にそのスクリプトを必要としない場合は、`"PACKAGE_NAME": false` を使用する。
   - サイトのワークフローがセットアップステップとしてスクリプトを必要とし、かつすべてのスクリプトがレビューに合格した場合のみ、`"PACKAGE_NAME@VERSION": true` を使用する。
     承認だけではスクリプト無効の[インストールパス](#install-contracts)では何も実行されない。
     パスもスクリプトを実行する必要があり、`ci:prepare` が Hugo に対して行っているように動作する。
   - 新しいエントリの場合、その理由を[現在のエントリ](#lifecycle-script-allowlist)に追加する。
   - 不要になったエントリについては、[サプライチェーン監査](#audit)を参照する。
3. `npm run test:local-tools` と `npm run install:safe` を実行する。
   セットアップにスクリプトが必要な理由、またはスクリプトなしでどのように動作するかを PR で説明する。

### ピア結合パッケージ {#peer-coupled-packages}

OpenTelemetry npm パッケージ（`@opentelemetry/*`）のうち、SDK パッケージは `@opentelemetry/api` の狭いバージョン範囲のみを受け入れます。SDK 3.0 以降はその範囲は 1 つのマイナーバージョンに限られ、`@opentelemetry/instrumentation` も同じ範囲を共有しています。
エクスポーターおよび Web 自動計装は、自身のリリースの SDK パッケージに依存します。
協調リリースの一部だけが揃った状態では、API の境界をまたぐとロック再生成が `ERESOLVE` で失敗し、そうでなくてもロック内に重複した OpenTelemetry パッケージがネストされた状態で解決される可能性があります。

共有グループに任せると、更新タイプをまたぐリリース（API の minor を伴う SDK の major）が major PR と共有の minor グループに分かれ、失敗したロックが minor グループの無関係なバンプを止めてしまいます。
[`.github/renovate.jsonc`][] の `OpenTelemetry npm packages` ルールは、更新タイプをまたいで `@opentelemetry/*` のすべての更新を1つの PR にグループ化します。
その PR は以下のとおりです。

- **[共有ポリシー](#updating)に従ってマージされます**: patch のみのセットは自動マージ、それ以外のセットはレビュー後にマージされます。
- **リリースを延期するためにクローズすることはできません**: 異なるターゲットバージョンを持つ更新を含む PR は、次回の実行で再作成されます。
- **一部だけの状態でグリーンになる場合があります**: 更新が[クールダウン](#release-cooldown)を異なる実行でクリアする可能性があります（段階的なパブリッシュ、または patch メンバーのより長いクールダウン）。パッケージリストをリリースと照合し、残りは経過期間を超えた時点で Renovate が追加するのを待ってください。

### Hugo {#hugo}

Hugo のバージョンを指定する設定は 2 つあります。

- [`package.json`][] の `hugo-extended`：正確なピン指定です。すべてのビルドが使用するバイナリであり、サイトが検証されている唯一のバージョンです。
- [`module-template.yaml`][] の `module.hugoVersion.min`：下限です。これを下回ると Hugo が警告を出し、[ビルドログチェック][build-log check]がその警告を CI の失敗に変えます。

サイトが Hugo の変更に依存するようになると、下限が引き上げられます。
たとえば、マウントの `files` パターンは、Hugo 0.166.0 で修正された glob エンジン（`**/` がゼロ個のディレクトリにマッチしなくなった）を前提としています。

Hugo をバージョンアップするには、以下の手順を実行します。

1. 対象となる Hugo のバージョン範囲について [Docsy のアップグレードガイド][Docsy upgrade guides]に沿って作業する。
2. `package.json` の `hugo-extended` のバージョンを設定し、[ロックファイルを同期する](#manifest-changes)。
   （`npm run update:hugo` はかわりに最新バージョンを、スクリプトを有効にした状態でインストールします。承認がすでにそのバージョンを指定していない限り、`strict-allow-scripts` によって失敗します。）
3. [`allowScripts` の承認](#script-bearing-packages)を更新し、`npm run install:safe` を実行して、レビュー済みのフックを通じてピン指定されたバイナリを取得する。
4. サイトがその範囲内の変更に依存するようになった場合は、`hugoVersion.min` を引き上げる。

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

_`PACKAGE_NAME`_ をリフレッシュするパッケージ名（複数指定可）に置き換えてください。

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

親の宣言された範囲が修正バージョンを除外している場合、リフレッシュでは到達できません。
修正を取り込めるリリースがあれば親をバンプしてください。そうでなければ、ルートに [`overrides`][] エントリを追加し、監査の `REVIEWED_OVERRIDES` レジスターに行を登録して、[ロックファイルを同期](#manifest-changes)してください。
親の宣言された範囲が変わると監査が失敗し、[再評価](#audit)を促します。

## サプライチェーン制御 {#controls}

### サプライチェーン監査 {#audit}

サプライチェーン監査テスト [`scripts/supply-chain-audit.test.mjs`][] は、以下の制御と各[セキュリティオーバーライド](#security-updates)を、`test:local-tools` の実行ごとにコミット済みファイルのみから検証します。
これにより、制御の退行はインシデントを待たずにテスト失敗として検出されます。
監査自体の検証原則については、その[設計ページ](../../design/supply-chain-audit/)を参照してください。

PR で監査が失敗した場合、アサーションメッセージに期待される条件が記載されています。
よくあるケースは以下のとおりです。

- **`allowScripts` 承認を持つ依存関係をバージョンアップした場合**。
  [スクリプトを持つパッケージ](#script-bearing-packages)に従ってください。
  失敗メッセージに新たにロックされたバージョンが示されます。
- **バージョンアップによりパッケージのインストールスクリプトが削除された場合**。
  そのパッケージの `allowScripts` エントリ（承認または拒否）を削除してください。
  監査は、インストールスクリプトを持つロックされたパッケージに対してのみエントリを受け入れます。
- **セキュリティオーバーライドの親の範囲を変更した場合**。
  新しい範囲が修正バージョンを取り込めるなら、オーバーライドを削除し、[ロックファイルを同期](#manifest-changes)して、その行の `firstFixed` より古いコピーが残っていないことを確認した上で行を削除してください。取り込めなければ、行の `parentRange` を更新してください。
- **ボットがセキュリティオーバーライドをバンプした場合**。
  行の `spec` を更新し、バンプが新しいアドバイザリーに対応する場合は `firstFixed` とアドバイザリー ID も更新してください。
- **インストールパスのスクリプト、`.npmrc`、または `netlify.toml` を変更した場合**。
  その失敗こそが目的です。
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
  [人間のレビューなしでマージされる](#updating)更新にはより長い期間が設定されます。
  プリセット提供の3日間の npm クールダウン（`security:minimumReleaseAgeNpm`）は、これらの期間をオーバーライドできないよう（その経過期間の免除を含め）除外されています。
  注意: そのプリセットの上流での名前変更は、暗黙的にクールダウンを再適用させます。
  Renovate が日付を判定できない更新タイプ（`pin`、`replacement`、`rollback` など）はクールダウンの対象外です。
  それらの PR は通常どおりオープンされ、恒久的に保留の安定性ステータス（必須チェックではない）が表示される場合があり、通常のレビューがゲートとなります。

### ライフサイクルスクリプト許可リスト {#lifecycle-script-allowlist}

インストール時にパッケージのライフサイクルスクリプトが実行されるのは、その正確な名前とバージョンが `allowScripts` 許可リストに記載されている場合のみです。

- **適用**: [`package.json`][] の `allowScripts` マップ。
  [`.npmrc`][] の `strict-allow-scripts` によりフェイルクローズドとなります。
- **評価されるタイミング**: スクリプト有効のインストール時のみです。
  具体的には、[インストール時の動作](#install-contracts)の `hugo-extended` リビルドステップと、`--ignore-scripts` なしで実行されるローカルの `npm install` です。
  リビルドステップはインストール済みのすべての依存関係を許可リストと照合しますが、実行するのは `hugo-extended` のスクリプトのみです。
- **拒否**:
  - `false` に設定されたエントリは、レビュー済みの拒否を記録します。
    パッケージはインストールされますが、そのスクリプトはスキップされます。
  - 拒否は何も許可しないため、バージョンをまたいで名前単位でパッケージをカバーします。
- **現在のエントリ**:
  - `hugo-extended`、承認: インストール時の動作がそのスクリプトを通じてピン指定された Hugo バイナリを取得します。
  - `puppeteer`、拒否: そのスクリプトはブラウザーをダウンロードしますが、[ダブルチェックプローブ][double-check probe]は `CHROME_PATH` から Chrome を取得するか、オンデマンドでインストールします。
  - `@parcel/watcher`、拒否: `sass` のオプショナルな依存関係であり、`sass-embedded` がプリビルトコンパイラーを持たないプラットフォームでのみインストールするフォールバックです。
    そのスクリプトはリクエストされた場合にのみソースからビルドします。
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
[`module-template.yaml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/config/_default/module-template.yaml
[`netlify.toml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/netlify.toml
[`overrides`]: https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides
[`package.json`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json
[`scripts/supply-chain-audit.test.mjs`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/supply-chain-audit.test.mjs
[build cache]: https://docs.netlify.com/build/configure-builds/troubleshooting-tips/
[build-log check]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/check-build-log.sh
[ci-security]: ../ci-workflows/#security-model
[deliberate]: ../../design/supply-chain-security/#deliberate
[Dependabot security updates]: https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates
[deploy context]: https://docs.netlify.com/deploy/deploy-overview/#deploy-contexts
[Docsy upgrade guides]: https://www.docsy.dev/tags/hugo/
[Docsy]: https://www.docsy.dev/
[double-check probe]: ../link-checking/#double-check
[drift tracking]: /docs/contributing/localization/#track-changes
[includes a clone of the repository]: https://answers.netlify.com/t/what-does-clear-cache-and-deploy-site-do-specifically/9419/2
[install contracts]: #install-contracts
[local setup]: /docs/contributing/development/#local-setup
[netlify-deps]: https://docs.netlify.com/build/configure-builds/manage-dependencies/#npm
[Netlify]: https://www.netlify.com/
[Renovate]: https://docs.renovatebot.com/
[script policy]: ../../design/supply-chain-security/#scripts
[Supply-chain security]: ../../design/supply-chain-security/
<!-- prettier-ignore-end -->
