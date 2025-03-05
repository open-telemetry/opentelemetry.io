---
title: サイトのローカリゼーション
description: 非英語ローカリゼーションのサイトページの作成と管理
linkTitle: ローカリゼーション
weight: 25
default_lang_commit: b7e40731390448f604897ded62cff8abd3505430
drifted_from_default: true
cSpell:ignore: shortcodes
---

OTel のウェブサイトは、ページのローカリゼーションをサポートするために、Hugo の [multilingual framework] をサポートしています。
デフォルトの言語は英語であり、米国英語がデフォルト（暗黙の）ローカリゼーションとして設定されています。
対応する言語の数は増えており、トップナビゲーションの言語ドロップダウンメニューから確認できます。

## 英語メンテナーガイド {#english-language-maintainer-guidance}

### 非英語ページのリンクチェックが失敗したとき {#when-link-checking-fails-for-non-english-pages}

英語は OpenTelemetry ウェブサイトのデフォルト言語です。
英語のドキュメントを追加、編集、再構成した後に、非英語ページのリンクチェックが失敗する可能性があります。
そのような場合は、以下を実行してください。

<!-- markdownlint-disable blanks-around-fences -->

- リンクを**修正しないでください**。それぞれの非英語ページは対応する英語のページの特定のコミット（フロントマターキーである `default_lang_commit` の Git コミットハッシュ）に関連づけられています。
- 以下のフロントマター、1 つの以上のページがリンクエラーが発生している場合は最も近い祖先のファイルに非英語ページを無視するようにリンクチェッカーを設定してください。
  ```yaml
  htmltest:
    # TODO: remove the IgnoreDirs once broken links are fixed
    IgnoreDirs:
      - path-regex/to/non-en/directory/contain/files/to/ignore
      - path-2-etc
  ```
- `npm run check:links` を実行して、設定ファイル `.htmltest.yml` への変更を PR に含めてください。

<!-- markdownlint-enable blanks-around-fences -->

## 翻訳ガイダンス {#translation-guidance}

ページの翻訳の際には、本セクションのガイドに従うことを推奨します。

### 見出しアンカー {#heading-anchors}

見出しを翻訳する際に、見出しアンカーのターゲットをローカリゼーション全体で統一するために、以下に従ってください。

- 見出しに明示的な ID がある場合は、それを保持する。[見出し ID の記法][Heading ID syntax] は `{ #some-id }` のように、見出しテキストの後に記述されます。
- そうでない場合は、元の英語の見出しに対して自動生成された ID に対応する明示的な ID を宣言する。

{{% alert title="Note" %}}

翻訳ページのすべての見出しに明示的な見出し ID を追加するか、リンクチェッカーで報告された既知のサイト内見出しターゲットにのみ追加するかは、ローカリゼーションの執筆者の裁量に委ねられます。
前者の方法は一貫性が保たれますが、作業量が増えます。
しかし、サイト外からローカリゼーションされたページのリンクをより適切にサポートでき、新しい見出しターゲットが追加された際に、過去の翻訳ページを修正する手間を減らすことができます。

{{% /alert %}}

[Heading ID syntax]: https://github.com/yuin/goldmark/blob/master/README.md#headings

### リンク {#links}

ローカルパスへ参照しているリンク（外部リンクではなく）は、そのパスのままにしてください。
これは、ウェブサイトのページへのリンクや、画像などのセクション内リソースへのリンクにも当てはまります。

{{% alert title="Note" %}}

OTel ウェブサイトリポジトリには、Hugo が使用する**絶対リンクのパスをドキュメントのページに変換する**カスタムレンダーリンクを持っています。
`/docs/some-page` のようなリンクは、リンクをレンダリングする際にページの言語コードがパスの先頭に追加され、ローカリゼーションされます。
たとえば、日本語ページからレンダリングされた際に、このサンプルのパスは `/ja/docs/some-page` になります。

{{% /alert %}}

### 画像 {#images}

Hugo は、サイトのローカリゼーション間で共有されるページ画像をレンダリングする際に、効率的な処理を行います。
つまり、生成されたサイトフォルダ内では、Hugo は **1 つの**画像ファイルを出力し、それを各ローカリゼーションで共有します。

したがって、一般的なルールとして、実際に画像を変更しない限り、ローカリゼーション用に画像のコピーを**作成しないでください**。

### ショートコード {#shortcodes}

一部の基本ショートコードには英語のテキストが含まれており、ローカリゼーションが必要になる場合があります。
特に、[layouts/shortcodes/docs] に含まれるものについては、その傾向が強いです。

ローカリゼーションしたショートコードを作成する必要がある場合は、`layouts/shortcodes/xx` に配置してください。ここで `xx` はローカリゼーション対象の言語コードを指します。
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

default_lang_commit: <commit-hash-of-main-for-default-language-page>
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

{{% alert title="Tip" %}}

ローカリゼーションページが `main` の `HEAD` にある英語版と対応するようになった場合、フロントマター内のコミットハッシュの値を消去し、前のセクションであった `add` コマンドを実行して、`default_lang_commit` フィールドの値を自動的に更新してください。

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

### スクリプトのヘルプ {#script-help}

スクリプトの詳細は、`npm run check:i18n -- -h` を実行してください。

## 新しいローカリゼーション {#new-localizations}

OpenTelemetry ウェブサイトの新しい言語のローカリゼーションを始めるには、コントリビュートの興味を共有するために[イシューを起票して](https://github.com/open-telemetry/opentelemetry.io/issues/)ください。
追加したい言語において翻訳の執筆とレビューをしたい他のメンバー全員をタグ付けしてください。
**最低でも 2 名の潜在的なコントリビューター**（理想的には 3 名）が必要です。
また、イシューに以下のタスクリストも含めてください。

```markdown
- [ ] Contributors for the new language: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
- [ ] Localize site homepage to YOUR_LANGUAGE_NAME
- [ ] Create an issue label for `lang:LANG_ID`
- [ ] Create org-level group for `LANG_ID` approvers
- [ ] Update components owners for `content/LANG_ID`
- [ ] Set up spell checking, if a cSpell dictionary is available
```

注意。

- 追加したい言語の `LANG_ID` には公式の [ISO 639-1 コード](https://ja.wikipedia.org/wiki/ISO_639-1) を使用してください。
- [cSpell 辞書](https://github.com/streetsidesoftware/cspell-dicts) を探し、NPM パッケージとして利用可能な [@cspell/dict-LANG_ID](https://www.npmjs.com/search?q=%40cspell%2Fdict) を確認してください。 もし指標する方言や地域に適した辞書がない場合は、最も近い地域のものを選んでください。 設定方法の例については、[PR #5386] を参照してください。

そのイシューを作成し、必要な人数のコントリビューターが集まったら、メンテナーが[インデックスページ](https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md)の翻訳を含むプルリクエストを作成するように依頼します。
PR にローカリゼーションプロジェクトを開始するのに必要な追加変更を加えるために、メンテナーが PR を編集できることを確認してください。

最初の PR がマージされると、メンテナーがイシューラベル、組織レベルのグループ、およびコンポーネント所有者の設定を行います。

{{% alert title="重要" color="warning" %}}

新しいローカリゼーションを始めるのに、OpenTelemetry プロジェクトの既存のコントリビューターである必要はありません。
しかし、[OpenTelemetry GitHub 組織](https://github.com/open-telemetry/) のメンバーまたはローカリゼーションの承認者グループに追加されることはありません。
確立されたメンバーまたは承認者になるには、[メンバーシップガイドライン](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md) に記載されている要件を満たす必要があります。

ローカリゼーションプロジェクトを始める時には、メンテナーはあなたのレビューをすでに承認者であるかのように扱います。

{{% /alert %}}

[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[multilingual framework]: https://gohugo.io/content-management/multilingual/
[PR #5386]: https://github.com/open-telemetry/opentelemetry.io/pull/5386/files
