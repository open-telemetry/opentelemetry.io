---
title: サイトのローカリゼーション
description: 非英語ローカリゼーションのサイトページの作成と管理
linkTitle: ローカリゼーション
weight: 25
default_lang_commit: 548e5e29f574fddc3ca683989a458e9a6800242f
cSpell:ignore: shortcodes
---

OTel のウェブサイトは、ページのローカリゼーションをサポートするために、Hugo の [multilingual framework] をサポートしています。
デフォルトの言語は英語であり、米国英語がデフォルト（暗黙の）ローカリゼーションとして設定されています。
対応する言語の数は増えており、トップナビゲーションの言語ドロップダウンメニューから確認できます。

## 翻訳のガイド {#translation-guidance}

ウェブサイトのページを英語から翻訳する場合は、この節のガイダンスにしたがうことをおすすめします。

### 要約

#### ✅ すべきこと {#do}

<div class="border-start border-success bg-success-subtle">

- **翻訳**
  - 以下を含むページの内容
    - Mermaid [diagram](#images)のテキストフィールド
    - コードスニペット内のコメント（オプション）
  - [フロントマター][front matter] 内の `title`、 `linkTitle`、 `description` のフィールド値
  - 特別な指示がない場合、ページ内の **すべての** コンテンツとフロントマターの内容
- 原文の _内容_、 _意味_、 _スタイル_ を **変更しないこと**
- もしなにか疑問等があれば、以下の方法で [メンテナー][maintainers] に **質問すること**
  - [Slack] の `#otel-docs-localization` か `#otel-comms` の各チャンネル
  - [Discussion]やイシュー、あるいはPRコメント

[Discussion]: https://github.com/open-telemetry/opentelemetry.io/discussions?discussions_q=is%3Aopen+label%3Ai18n

</div>

#### ❌ すべきでないこと {#do-not}

<div class="border-start border-warning bg-warning-subtle">

- **翻訳**
  - このレポジトリ内のリソースの **ファイルやディレクトリ** の名前
  - [見出しID](#headings) を含む [リンク](#links) [^*]
  - Markdown の[リンク定義ラベル](#link-labels)
  - `inline code-spans` のようなインラインコードスパン
  - `notranslate`（CSSクラスとして）でマークされたMarkdown の要素、特に[見出し](#headings)に対して
  - [すべきこと](#do) で指示されていない [フロントマター][front matter] のフィールド。特に、`aliases` は翻訳しないこと。よくわからない場合はメンテナーに質問すること。
  - ソースコード
- [画像内のテキストを翻訳する](#images) 場合以外で **画像ファイルのコピー** をすること。
- 新規に追加したり変更すること
  - 原文で意図した意味と異なる **内容**
  - 表示の **スタイル**。たとえば _フォーマット_、_レイアウト_、_デザイン_ スタイル（タイポグラフィ、文字の大文字小文字、空白など）。

[^*]: ありえる例外に関しては [リンク](#links) を参照のこと。

</div>

### 見出しID {#headings}

見出しを翻訳する際に、見出しアンカーのターゲットをローカリゼーション全体で統一するために、以下に従ってください。

- 見出しに明示的な ID がある場合は、それを保持する。[見出し ID の記法][Heading ID syntax] は `{ #some-id }` のように、見出しテキストの後に記述されます。
- そうでない場合は、元の英語の見出しに対して自動生成された ID に対応する明示的な ID を宣言する。

[Heading ID syntax]: https://github.com/yuin/goldmark/blob/master/README.md#headings

### リンク {#links}

リンク参照を **翻訳しないで** ください。
これは外部リンク、ウェブサイトのページへのパス、[画像](#images)のようなセクションローカルのリソースにも当てはまります。

唯一の例外は、外部ページ（<https://en.wikipedia.org>など）へのリンクで、あなたのロケール固有のバージョンがある場合です。
多くの場合、これはURLの`en`をあなたのロケールの言語コードに置き換えることを意味します。

{{% alert title="Note" %}}

OTelウェブサイトのリポジトリには、Hugoがドキュメントページを参照する絶対リンクパスを変換するために使用するカスタムの render-link フックがあります。
**`/docs/some-page` 形式のリンク** は、リンクをレンダリングするときに、パスの先頭にページの言語コードを付けることで、 **ロケール固有になります** 。
たとえば、先ほどのサンプルのパスは、日本語のページからレンダリングされた場合には `/ja/docs/some-page` となります。

{{% /alert %}}

### リンク定義ラベル {#link-labels}

Markdown の[リンク定義][link definitions]の[ラベル][labels]は**翻訳しないでください**。
かわりに、翻訳されたリンクテキストとしてラベルを書き直してください。たとえば、次の Markdown を考えてみます。

```markdown
[Hello], world! Welcome to the [OTel website][].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

これをフランス語に翻訳すると次のようになります。

```markdown
[Bonjour][hello], le monde! Bienvenue sur le [site OTel][OTel website].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

[labels]: https://spec.commonmark.org/0.31.2/#link-label
[link definitions]: https://spec.commonmark.org/0.31.2/#link-reference-definitions

### 画像とダイアグラム {#images}

画像そのもの[^shared-images]のテキストをローカライズしない限り、画像ファイルのコピーを **作成しない** でください。

[Mermaid][] ダイアグラム内のテキストは **翻訳して** ください。

[^shared-images]:
    Hugoは、サイトのローカライゼーション間で共有される画像ファイルをレンダリングする方法についてスマートです。
    つまり、Hugoは _単一の_ 画像ファイルを出力し、それをロケール間で共有します。

[Mermaid]: https://mermaid.js.org

### インクルードファイル {#includes}

`_includes` ディレクトリの下にあるページフラグメントは、他のページコンテンツと同じように **翻訳して** ください。

### ショートコード {#shortcodes}

{{% alert title="Note" %}}

2025年2月現在、私たちは共有ページのコンテンツをサポートする手段として、ショートコードから[インクルードファイル](#includes)への移行を進めています。

{{% /alert %}}

一部の基本ショートコードには英語のテキストが含まれており、ローカリゼーションが必要になる場合があります。
特に、[layouts/shortcodes/docs] に含まれるものについては、その傾向が強いです。

ローカリゼーションしたショートコードを作成する必要がある場合は、`layouts/shortcodes/xx` に配置してください。
ここで `xx` はローカリゼーション対象の言語コードを指します。
その際、元の基本ショートコードと同じ相対パスを使用してください。

[layouts/shortcodes/docs]: https://github.com/open-telemetry/opentelemetry.io/tree/main/layouts/shortcodes/docs

## ローカリゼーションページの乖離を追跡する {#track-changes}

ローカリゼーションページを維持する上で主な課題の 1 つは、対応する英語のページが更新されたタイミングを特定することです。
本セクションでは、どのように対処するのかを説明します。

### `default_lang_commit` フロントマターフィールド {#the-default_lang_commit-front-matter-field}

`content/zh/<some-path>/page.md` のようなローカリゼーションページが書かれた際に、この翻訳は `content/en/<some-path>/page.md` にある対応する英語版のページの特定の [`main` ブランチのコミット][main] に基づいています。
このリポジトリでは、それぞれのローカリゼーションページが対応する英語ページのコミットを以下のようにローカリゼーションページのフロントマターで識別します。

```markdown
---
title: Your localized page title
...

default_lang_commit: <デフォルト言語の最新コミットハッシュ値>
```

上述のフロントマターは `content/zh/<some-path>/page.md` です。
このコミットは、`main` における `content/en/<some-path>/page.md` の最新コミットに対応します。

### 英語ページの変更を追跡する {#tracking-changes-to-english-pages}

英語ページの更新が作成されると、以下のコマンドを実行することで、対応するローカリゼーションページの更新が必要か追跡ができます。

```console
$ npm run check:i18n
1       1       content/en/docs/platforms/kubernetes/_index.md - content/zh/docs/platforms/kubernetes/_index.md
...
```

以下のようにパスを追加することで、1 つまたはそれ以上のローカライゼーションするページに対象を絞れます。

```sh
npm run check:i18n -- content/zh
```

### 変更の詳細をみる {#viewing-change-details}

更新が必要なローカリゼーションページについて、`-d` フラグとローカリゼーションページへのパスを追加して差分を見るか、パスを省略して対応するページのすべての差分を見ることができます。
たとえば、以下のようになります。

```console
$ npm run check:i18n -- -d content/zh/docs/platforms/kubernetes
diff --git a/content/en/docs/platforms/kubernetes/_index.md b/content/en/docs/platforms/kubernetes/_index.md
index 3592df5d..c7980653 100644
--- a/content/en/docs/platforms/kubernetes/_index.md
+++ b/content/en/docs/platforms/kubernetes/_index.md
@@ -1,7 +1,7 @@
 ---
 title: OpenTelemetry with Kubernetes
 linkTitle: Kubernetes
-weight: 11
+weight: 350
 description: Using OpenTelemetry with Kubernetes
 ---
```

### `default_lang_commit` を新しいページに追加する {#adding-default_lang_commit-to-new-pages}

ローカリゼーションのページを作成する際は、`default_lang_commit` をページのフロントマターに追加し、`main` ブランチの適切なコミットハッシュを指定することを忘れないでください。

翻訳ページが`main` における `<hash>` 時点の英語ページに基づいている場合、以下のコマンドを実行すると、`default_lang_commit` をコミット `<hash>` の値で自動的にページのフロントマターに追加できます。
ページが `main` の `HEAD` に同期している場合、引数として `Head` を指定できます。
たとえば、以下のように実行します。

```sh
npm run check:i18n -- -n -c 1ca30b4d content/ja
npm run check:i18n -- -n -c HEAD content/zh/docs/concepts
```

ハッシュキーを欠落しているローカリゼーションしたページのファイル一覧にするには、次を実行してください。

```sh
npm run check:i18n -- -n
```

### 既存のページの `default_lang_commit` を更新する {#updating-default_lang_commit-for-existing-pages}

対応する英語のページに変更に合わせてローカリゼーションページを更新する際、`default_lang_commit` のコミットハッシュも忘れずに確認してください。

{{% alert title="ヒント" %}}

ローカリゼーションページが `main` の `HEAD` にある英語版と対応するようになった場合、フロントマター内のコミットハッシュの値を消去し、前のセクションであった **add** コマンドを実行して、`default_lang_commit` フィールドの値を自動的に更新してください。

{{% /alert %}}

乖離したローカリゼーションページをまとめて更新した場合、`-c` フラグに続いてコミットハッシュまたは 'HEAD' を指定することで、それらのファイルのコミットハッシュを `main@HEAD` に更新できます。

```sh
npm run check:i18n -- -c <hash> <PATH-TO-YOUR-NEW-FILES>
npm run check:i18n -- -c HEAD <PATH-TO-YOUR-NEW-FILES>
```

{{% alert title="重要" %}}

`HEAD` をハッシュ指定子として使用すると、スクリプトは**ローカル環境**における `main` の HEAD のハッシュを使用します。
`main` を GitHub 上の HEAD に対応したい場合、必ず `main` のフェッチとプルをしてください。

{{% /alert %}}

### 乖離の状況 {#drift-status}

`npm run fix:i18n:status` を実行して、ローカライズ対象ページが原文から乖離した場合にフロントマターフィールド `drifted_from_default` を追加します。
このフィールドは近いうちに、英語版のページと比較してドリフトしたページの上部にバナーを表示するために使われるようになります。

### スクリプトのヘルプ {#script-help}

スクリプトの詳細は、`npm run check:i18n -- -h` を実行してください。

## 新しいローカリゼーション {#new-localizations}

### 新しいローカリゼーションチーム {#new-localization-team}

OpenTelemetry ウェブサイトの新しい言語のローカリゼーションを始めるには、以下が必要です。

1. あなたの言語に精通した**ローカリゼーションメンター**。たとえば、[CNCF Glossary][]の[アクティブな承認者][active approver]や[Kubernetes ウェブサイト][Kubernetes website]などです。
2. 少なくとも2名の潜在的なコントリビューター。

[active approver]: https://github.com/cncf/glossary/blob/main/CODEOWNERS
[CNCF Glossary]: https://glossary.cncf.io/
[Kubernetes website]: https://github.com/kubernetes/website

準備ができたら、以下を実施してください。

1. コントリビュートの興味を共有するために[新しいイシュー][new issue]を作成してください。

2. メンターと潜在的なコントリビューターのGitHubハンドルを追加してください。

3. 追加したい言語の公式[ISO 639-1 コード][ISO 639-1 code]を調べてください。このセクションの残りの部分では、この言語コードを`LANG_ID`と呼びます。

4. イシューの冒頭コメントに以下のタスクリストを追加してください。

   ```markdown
   - [ ] Language info:
     - ISO 639-1 language code: `LANG_ID`
     - Language name: ADD_NAME_HERE
   - [ ] Locale team info:
     - [ ] Locale mentor: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
     - [ ] Contributors: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
   - [ ] Read through
         [Localization](https://opentelemetry.io/docs/contributing/localization/)
         and all other pages in the Contributing section
   - [ ] Localize site homepage to YOUR_LANGUAGE_NAME
   - [ ] OTel maintainers:
     - [ ] Update `hugo.yaml`
     - [ ] Configure cSpell and other tooling support
     - [ ] Create an issue label for `lang:LANG_ID`
     - [ ] Create org-level group for `LANG_ID` approvers
     - [ ] Update components owners for `content/LANG_ID`
   ```

5. ウェブサイトの[ホームページ][homepage]の翻訳を含む[プルリクエストを送信](../pull-requests/)してください。翻訳するのは`content/LANG_ID/_index.md`ファイルだけにしてください。メンテナーがPRを編集するために必要な権限があることを確認してください。彼らはローカリゼーションプロジェクトを開始するために必要な追加変更をPRに加えます。

[ISO 639-1 code]: https://en.wikipedia.org/wiki/ISO_639-1
[homepage]: https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md

最初のPRがマージされた後、メンテナーはイシューラベル、組織レベルのグループ、およびコンポーネント所有者を設定します。

{{% alert title="Note" %}}

新しいローカリゼーションを始めるのに、OpenTelemetry プロジェクトの既存のコントリビューターである必要はありません。
しかし、[OpenTelemetry GitHub 組織](https://github.com/open-telemetry/)のメンバーまたはローカリゼーションの承認者グループのメンバーとして追加されることはありません。
確立されたメンバーおよび承認者になるための要件を満たす必要があります。これは[メンバーシップガイドライン](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md)に概説されています。
ローカリゼーションプロジェクトを開始する際、メンテナーはあなたがすでに承認者であるかのようにあなたのレビューを扱います。

{{% /alert %}}

### OTelメンテナーチェックリスト {#otel-maintainer-checklist}

#### Hugo {#hugo}

`hugo.yaml`を更新します。`LANG_ID`の適切なエントリを以下に追加します。

- `languages`
- `module.mounts`。最低限、`content`用の単一の`source`-`target`エントリを追加します。ロケールに十分なコンテンツがある場合にのみ、`en`フォールバックページのエントリの追加を検討してください。

#### スペルチェック {#spelling}

NPMパッケージ[@cspell/dict-LANG_ID][]として利用可能な[cSpell辞書][cSpell dictionaries]を探します。
方言や地域に辞書がない場合は、最も近い地域のものを選んでください。

辞書が利用できない場合は、このサブセクションの残りをスキップします。
それ以外の場合は以下を実施してください。

- 開発依存関係としてNPMパッケージを追加します。例：`npm install --save-dev @cspell/dict-bn`
- `.cspell/LANG_ID-words.txt`を作成して、`LANG_ID`用のサイトローカル辞書単語を保存します。
- `.cspell.yml`に以下のエントリを追加します。
  - `import`
  - `dictionaryDefinitions`
  - `dictionaries`：ここに2つのエントリを追加します。1つは`LANG_ID`、もう1つは`LANG_ID-words.txt`です

[cSpell dictionaries]: https://github.com/streetsidesoftware/cspell-dicts
[@cspell/dict-LANG_ID]: https://www.npmjs.com/search?q=%40cspell%2Fdict

#### その他のツールサポート {#other-tooling-support}

- Prettierサポート：`LANG_ID`がPrettierで十分にサポートされていない場合は、`.prettierignore`に無視ルールを追加します

## 英語メンテナーガイド {#english-language-maintainer-guidance}

### ロケールをまたぐドキュメント変更のPRを避ける {#prs-should-not-span-locales}

コントリビューターは、ロケールをまたぐドキュメント変更のPRを提出することを避けるべきです。
唯一の例外は次のセクションで説明されています。

### 非英語ページのリンクチェックが失敗したとき {#patch-locale-links}

英語のドキュメントへの変更により、非英語のロケールでリンクチェックの失敗が発生することがあります。
これはドキュメントページが移動または削除された場合に発生します。

このような状況では、リンクチェックに失敗するパスを持つ各非英語ページに対して以下の更新を行います。

- 新しいページパスへのリンク参照を更新します。
- `default_lang_commit`フロントマター行の末尾に`# patched`というYAMLコメントを追加します。
- ファイルに他の変更を加えないでください。
- `npm run check:links`を再実行して、リンクの失敗が残っていないことを確認します。

[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[multilingual framework]: https://gohugo.io/content-management/multilingual/
[new issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[slack]: https://slack.cncf.io/
