---
title: 新しいローカリゼーションのセットアップ
linkTitle: ローカリゼーションのセットアップ
description: >-
  OpenTelemetry ウェブサイトに新しい言語のローカリゼーションをオンボーディングするための、メンテナー向けステップバイステップガイド。
weight: 50
default_lang_commit: ab6ef133372515d3267cf99f06d4e5f8db0ef409
cSpell:ignore: workstreams
---

このガイドでは、OTel ウェブサイトのメンテナーが新しい言語のローカリゼーションをオンボーディングするために必要なすべての変更手順を説明します。
リポジトリレベルの変更と GitHub 組織レベルのセットアップの両方を扱います。

コントリビューター向けの情報（翻訳ガイダンス、差分の追跡、継続的なメンテナンス）については、[Site localization][] を参照してください。
リポジトリ側のステップをエージェントで実行するバージョンについては、[`setup-new-localization` skill][] を参照してください。

アクティブなローカリゼーションチームとそのリソースの正式なレジストリは [`projects/localization.md`][] にあります。

## 前提条件 {#prerequisites}

開始する前に、ロケールチームに以下を確認してください。

- [New localizations][] の手順に従って、[kickoff issue][] が作成されていること。
- [ISO 639-1][] 言語コード（`LANG_ID`）が合意されていること。
- メンターと初期コントリビューターの GitHub ハンドルが把握されていること。

このガイドの残りの部分では、`LANG_ID` のすべての出現箇所を実際の [ISO 639-1][] コード（たとえばポーランド語の場合は `pl`）に置き換えてください。

## ステップ 1 — Hugo の言語設定 {#hugo-config}

### ステップ 1a. 言語設定エントリ {#step-1a-language-config-entry}

`config/_default/hugo.yaml` の `languages:` キー配下に、新しい言語のエントリを追加します。

```yaml
LANG_ID:
  label: NativeName
  locale: LANG_ID-REGION # 任意。以下の注記を参照
  params:
    description: <新しい言語に翻訳されたサイトの説明>
```

`locale` フィールドは任意です。
たとえば RSS フィードで `en-US`、`pl-PL`、`zh-CN` のような地域言語タグを出力したい場合に使用します。
それ以外の場合は言語 ID がそのまま使用されます。
Google Translate は中国語に完全な `zh-CN` タグを必要としますが、他のほとんどの言語ではプライマリサブタグを使用します。

例として、ポーランド語のエントリは以下のようになります。

```yaml
pl:
  label: Polski
  locale: pl-PL
  params:
    description: Strona projektu OpenTelemetry
```

### ステップ 1b. 翻訳ファイル {#step-1b-translation-file}

`i18n` ディレクトリ内に、`LANG_ID.yaml`（たとえば `pl.yaml`）という名前の新しいファイルを作成します。
このファイルには、新しい言語の翻訳済み文字列がいくつか含まれます。
これらの文字列は、メインコンテンツの一部とは限らない UI 要素やその他のサイトコンポーネント、または複数のページで使用される要素に使われます。

## ステップ 2 — Hugo のコンテンツマウント {#hugo-mounts}

Hugo はコンテンツマウントを使用して、ロケール固有のコンテンツをルーティングし、まだ翻訳されていないセクションでは英語ページにフォールバックします。
[`config/_default/module-template.yaml`][] のトップレベルの `mounts:` セクション配下に `LANG_ID` 用のブロックを追加します（このテンプレートは `module.yaml` にレンダリングされます）。

### 基本セットアップ {#base-setup}

すべてのロケールには、少なくとも以下のマウントが必要です。
ロケール固有のコンテンツと、コアとなる英語セクションのフォールバックです。

```yaml
## LANG_ID
- source: content/LANG_ID # ロケール固有のページ
  target: content
  sites: &LANG_ID-matrix
    matrix: { languages: [LANG_ID] }
# フォールバックページ（翻訳がまだ存在しない場合に英語コンテンツを提供する）
- source: content/en/_includes
  target: content/_includes
  sites: *LANG_ID-matrix
- source: content/en/announcements
  target: content/announcements
  sites: *LANG_ID-matrix
- source: content/en/docs
  target: content/docs
  files: ['! specs/**'] # spec フラグメントを除外（フォールバックするには大きすぎる）
  sites: *LANG_ID-matrix
```

ローカリゼーションが成熟するにつれて、追加のセクション（`ecosystem` など）を追加できます。
たとえば、`pt` ブロックには `ecosystem` のフォールバックが含まれています。

```yaml
## pt
- source: content/pt
  target: content
  sites: &pt-matrix
    matrix: { languages: [pt] }
# フォールバックページ
- source: content/en/_includes
  target: content/_includes
  sites: *pt-matrix
- source: content/en/announcements
  target: content/announcements
  sites: *pt-matrix
- source: content/en/docs
  target: content/docs
  files: ['! specs/**']
  sites: *pt-matrix
- source: content/en/ecosystem
  target: content/ecosystem
  sites: *pt-matrix
```

新しいブロックは、`config/_default/module-template.yaml` 内の既存のロケールブロックの隣に、そのファイルで使用されている現在の並び順の規約に従って挿入してください。

## ステップ 3 — スペルチェック {#cspell}

### 3a. cspell 辞書の確認 {#3a-check-for-a-cspell-dictionary}

npm でその言語の既存の cspell 辞書を検索します。

```sh
npm search @cspell/dict
```

`@cspell/dict-LANG_ID` またはそれに最も近い地域バリアント（たとえばポーランド語の場合は `@cspell/dict-pl_pl`）に一致するパッケージを探してください。
利用可能な辞書の完全なリストは [cspell-dicts リポジトリ](https://github.com/streetsidesoftware/cspell-dicts#natural-language-dictionaries)でも確認できます。

### 3b. 辞書のインストール（利用可能な場合） {#3b-install-the-dictionary-if-available}

```sh
npm install --save-dev @cspell/dict-LANG_ID
```

これにより、パッケージが `package.json` に追加されます。
更新された `package.json` と `package-lock.json` をコミットしてください。

### 3c. カスタム単語リストの作成 {#3c-create-the-custom-word-list}

サイトローカルの技術用語用に空のファイルを作成します。

```sh
touch .cspell/LANG_ID-words.txt
```

空のファイルをコミットしてください。
コントリビューターが時間の経過とともに、ロケール固有の技術用語をここに追加していきます。

### 3d. `.cspell.yml` の更新 {#3d-update-cspellyml}

新しい言語のスペルチェックを有効にするために、[`.cspell.yml`][] に3つのエントリを追加します。

1. `import:` の配下に、ロケールの cspell 辞書をインポートします。

   ```yaml
   - '@cspell/dict-CSPELL_DICT_ID/cspell-ext.json'
   ```

2. `dictionaryDefinitions:` の配下に、カスタム単語リストを登録します。

   ```yaml
   - name: LANG_ID-words
     path: .cspell/LANG_ID-words.txt
   ```

3. `dictionaries:` の配下に、インポートした辞書とカスタム単語リストの両方を有効にします。

   ```yaml
   - CSPELL_DICT_ID # @cspell/dict-CSPELL_DICT_ID パッケージ
   - LANG_ID-words # .cspell/LANG_ID-words.txt リスト
   ```

各セクション内のエントリは、言語コードのアルファベット順に配置してください。

> [!NOTE]
>
> その言語の cspell 辞書パッケージが存在しない場合は、ステップ 3b と `import` および `dictionaries` のエントリをスキップしてください。
> カスタム単語リスト（ステップ 3c）の作成と `dictionaryDefinitions` への登録のみを行います。
>
> また、cspell が検証できないコンテンツをスペルチェックしようとしないように、[`.cspell.yml`][] の `ignorePaths` リストにロケールパスを追加してください。
>
> ```yaml
> ignorePaths:
>   - content/LANG_ID
> ```

## ステップ 4 — Prettier（条件付き） {#prettier}

Prettier がその言語をうまく扱えない場合（たとえば、右から左に書くスクリプトや非ラテン文字を使用する場合）、[`.prettierignore`][] に無視エントリを追加します。

```sh
content/LANG_ID/**
```

[`.prettierignore`][] の既存の無視エントリを確認し、類似のスクリプトを持つ他のロケールがすでに除外されているかどうかを確認し、同じパターンに従ってください。
このステップは任意であり、Prettier がその言語に対して不正なフォーマットを生成することが判明している場合にのみ行うべきです。

## ステップ 5 — GitHub リポジトリの自動化 {#gh-repo}

### コンポーネントラベルマップ {#component-label-map}

[`.github/component-label-map.yml`][] に、`content/LANG_ID/` 配下のファイルを変更する PR に `lang:LANG_ID` ラベルを付与するエントリを追加します。

```yaml
lang:LANG_ID:
  - changed-files:
      - any-glob-to-any-file:
          - content/LANG_ID/**
```

エントリはアルファベット順に配置してください。

### コードオーナー {#code-owners}

[`.github/CODEOWNERS`][] のロケールセクションは [`data/locale-teams.yaml`][] レジストリから生成されます。手動で編集しないでください。

1. レジストリにロケールをアルファベット順で追加し、メンターと初期コントリビューターを承認者として記載します。

   ```yaml
   LANG_ID:
     maintainers: []
     approvers: [GITHUB_HANDLE1, GITHUB_HANDLE2]
   ```

   メンテナーが不在のロケールは[未配置][unstaffed]です。そのロケールが昇格するまで、CODEOWNERS の行にはフォールバックオーナーとして `@open-telemetry/docs-approvers` も記載されます。

2. CODEOWNERS のロケールセクションを再生成します。

   ```sh
   npm run fix:codeowners
   ```

`content/LANG_ID/` を追加する PR に、両方の変更を含めてください。CI はレジストリとロケールディレクトリの一致を要求します。

[`.github/component-owners.yml`][] にはエントリを**追加しないでください**。2026年6月時点で、このファイルへの変更は不要になっています。

## ステップ 6 — GitHub 組織レベルのセットアップ {#gh-org}

これらのステップはリポジトリの外部で行われ、`open-telemetry` GitHub 組織へのメンテナーレベルのアクセスが必要です。
チームの作成とリポジトリへの権限付与は、プライベートリポジトリ [`open-telemetry/admin`][] に対するプルリクエストにまとめ、組織管理者がマージして適用します。

### 6a. チームの作成 {#gh-org-teams}

`teams.tf` で `docs-LANG_ID-approvers` と、その子チームとして `docs-LANG_ID-maintainers` を宣言します。
どちらも `privacy = "closed"` にしてください（シークレットチームはネストできず、コードオーナーとしても機能しません）。
チーム宣言の例については [admin#588][] を参照してください。

### 6b. 承認者チームに write アクセスを付与する {#gh-org-grant}

同じ PR 内で、`repo-opentelemetry-io.tf` の `approvers` リストに `github_team.docs-LANG_ID-approvers.id` を追加します。
[コードオーナー][code owner]のチームは、メンバーが他のチーム経由でどのようなアクセス権を持っていても、チーム自体が write アクセスを保持する必要があります。

### 6c. チームメンバーの追加 {#gh-org-members}

組織管理者が[チームメンバーを手動で追加します][admin#58]。
admin リポジトリではメンバーシップは管理されていません。

- **対象者**：
  - コミュニティの[メンバーシップガイドライン][membership guidelines]に基づき承認者に選出された組織メンバー（[承認者になるには][Becoming an Approver]）。
  - キックオフコントリビューターは通常、後から資格を得ます。それまでのレビューは [New localizations][] に記載されたとおりにカウントされ、キックオフイシューで昇格が追跡されます。
- **メンテナーチーム**：最初は空のままで構いません。その場合、ロケールは[メンテナー不在][unstaffed]になります。
- **権限委譲**：ロケールにメンテナーができたら、両方のチームにメンバーとして追加し、GitHub の[チームメンテナー][team maintainer]ロールを付与してください。
  これにより、メンバーシップを自分たちで管理できるようになります。
  このロールにはチームへの所属が必要なため、メンテナーチームでは実際のロケールメンテナーにのみ付与してください。

### 6d. アクセスの確認 {#gh-org-verify}

admin PR が適用されたらチームの権限付与を確認し、メンバーが追加されるたびに各メンバーのアクセスを確認します。

- `docs-LANG_ID-approvers` チームが、リポジトリのコラボレーターとチームの一覧に **Write** ロールで表示されていること。
  たとえば、GitHub CLI を使用する場合：

  ```sh
  gh api --paginate repos/open-telemetry/opentelemetry.io/teams \
    --jq '.[] | select(.slug == "docs-LANG_ID-approvers") | .permission'
  ```

  `push`（API での Write ロールの名称）が出力されることを確認してください。
  何も出力されない場合は、チームがリポジトリのアクセスリストに含まれていません（ステップ 6b の権限付与が不足しているか未適用、またはチームがまだ存在しない場合）。
  `pull` や `triage` の場合は、write 未満の権限付与です。

- すべてのチームメンバーが実際の GitHub チームに表示され、各メンバーがリポジトリへの write 以上のアクセスを持っていること。
  たとえば：

  ```sh
  gh api --paginate orgs/open-telemetry/teams/docs-LANG_ID-approvers/members --jq '.[].login'
  gh api repos/open-telemetry/opentelemetry.io/collaborators/GITHUB_HANDLE/permission --jq .permission
  ```

  各メンバーについて `write`、`maintain`、または `admin` が出力されることを確認してください（表示されるパーミッションは、すべてのソースを通じた実効パーミッションです）。

## ステップ 7 — Slack チャンネルとコミュニティ登録 {#slack}

1. [CNCF Slack ワークスペース][CNCF Slack workspace] で、`#otel-localization-LANG_ID`（たとえばポーランド語の場合は `#otel-localization-pl`）という名前でロケール用のチャンネルを作成します。
2. [OpenTelemetry Admin][] をチャンネルマネージャーとして追加します。
3. [`open-telemetry/community`][] に対して PR を作成し、`workstreams.yml` に `localization-LANG_ID` エントリを追加します。
   既存のロケールエントリをモデルにして、生成される `sigs.md` の [ローカリゼーションチーム][Localization Teams] にチームが表示されるようにしてください。
   手順については [SIG 情報の更新][Updating SIG information] を参照してください。

## ステップ 8 — プロジェクトの追跡 {#projects}

[`projects/localization.md`][] を新しいロケールの情報で更新します。

1. 言語コードのアルファベット順で、先頭のサポート対象言語リストに言語を追加します。

   ```markdown
   - [NativeName - EnglishName (LANG_ID)][LANG_ID]

   [LANG_ID]: https://opentelemetry.io/LANG_ID/
   ```

2. **Current language teams** の配下に、既存のエントリと同じ構造に従ってチームエントリを追加します。

   ```markdown
   **EnglishName**:

   - Website: <https://opentelemetry.io/LANG_ID/>
   - Slack channel:
     [`#otel-localization-LANG_ID`](https://cloud-native.slack.com/archives/XXXXXXXXXXX)
   - Maintainers: `@open-telemetry/docs-LANG_ID-maintainers`
   - Approvers: `@open-telemetry/docs-LANG_ID-approvers`
   ```

3. **Labels** セクションに `lang:LANG_ID` ラベルを追加します。

   ```markdown
   - [`lang:LANG_ID`][issues-lang-LANG_ID] - EnglishName localization
   ```

   対応するリンク定義も追加します。

   ```markdown
   [issues-lang-LANG_ID]: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3ALANG_ID
   ```

4. Slack チャンネルのリンク定義を追加します。

   ```markdown
   [otel-localization-LANG_ID]: https://cloud-native.slack.com/archives/CHANNEL_ID
   ```

## 検証 {#verification}

### セットアップチェックリスト {#setup-checklist}

このチェックリストを使用して、セットアップの完了を追跡してください。
ステップ 1〜5 と 8 はセットアップ PR に含まれます。
ステップ 6 と 7 はリポジトリ外で完了します。

- [ ] **ステップ 1** — `config/_default/hugo.yaml` に言語エントリを追加した
- [ ] **ステップ 2** — `config/_default/module-template.yaml` にコンテンツマウントを追加した
- [ ] **ステップ 3** — cSpell を設定した。
      辞書をインストールした（またはロケールを `ignorePaths` に追加した）、`.cspell/LANG_ID-words.txt` にカスタム単語リストを作成した、`.cspell.yml` を更新した
- [ ] **ステップ 4** — `.prettierignore` を更新した（スクリプトに該当する場合）
- [ ] **ステップ 5** — `.github/component-label-map.yml`（ラベルエントリ）と `data/locale-teams.yaml`（レジストリエントリ）を更新した。`.github/CODEOWNERS` を再生成した
- [ ] **ステップ 6** — チーム `open-telemetry/admin` PR をマージした。
      承認者チームが write アクセスを保持している。
      対象メンバーを追加し確認した
- [ ] **ステップ 7** — Slack チャンネル `#otel-localization-LANG_ID` を作成した。
      OpenTelemetry Admin をチャンネルマネージャーとして追加した。
      コミュニティの `sigs.md` にチームを登録した
- [ ] **ステップ 8** — `projects/localization.md` を言語エントリ、チームエントリ、ラベル、Slack チャンネルリンクで更新した

### 自動チェック {#automated-checks}

すべての PR がマージされた後、設定が正しいことを確認するために以下を実行します。

- **`npm run build`** — Hugo がエラーなしで新しい言語を認識することを確認します。
- **`npm run check:spelling`** — cspell の設定が有効であり、新しい辞書エントリによってエラーが発生していないことを確認します。
- **`npm run check:codeowners`** — CODEOWNERS のロケールセクションがレジストリと一致していることを確認します。
- **GitHub ラベルの自動化** — `content/LANG_ID/` 配下のファイルに触れるテスト PR を作成し、`lang:LANG_ID` ラベルが自動的に付与されることを確認します。

<!-- prettier-ignore-start -->
[`.cspell.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml
[`.github/CODEOWNERS`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/CODEOWNERS
[`.github/component-label-map.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-label-map.yml
[`.github/component-owners.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml
[`.prettierignore`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.prettierignore
[`config/_default/module-template.yaml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/config/_default/module-template.yaml
[`data/locale-teams.yaml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/data/locale-teams.yaml
[`open-telemetry/admin`]: https://github.com/open-telemetry/admin?link-check=no
[`open-telemetry/community`]: https://github.com/open-telemetry/community
[`projects/localization.md`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/projects/localization.md
[`setup-new-localization` skill]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/setup-new-localization/SKILL.md
[admin#58]: https://github.com/open-telemetry/admin/issues/58?link-check=no
[admin#588]: https://github.com/open-telemetry/admin/pull/588?link-check=no
[Becoming an Approver]: https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#becoming-an-approver
[CNCF Slack workspace]: https://cloud-native.slack.com
[code owner]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[ISO 639-1]: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
[kickoff issue]: /docs/contributing/localization/#kickoff
[Localization Teams]: https://github.com/open-telemetry/community/blob/main/sigs.md#localization-teams-part-of-sig-communications
[membership guidelines]: https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md
[New localizations]: /docs/contributing/localization/#new-localizations
[OpenTelemetry Admin]: https://cloud-native.slack.com/team/U07DR07KAEQ
[Site localization]: /docs/contributing/localization/
[team maintainer]: https://docs.github.com/en/organizations/organizing-members-into-teams/assigning-the-team-maintainer-role-to-a-team-member
[unstaffed]: /docs/contributing/localization/#locale-teams
[Updating SIG information]: https://github.com/open-telemetry/community/blob/main/CONTRIBUTING.md#updating-sig-information
<!-- prettier-ignore-end -->
