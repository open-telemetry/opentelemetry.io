---
title: ドキュメントスタイルガイド
description: OpenTelemetry のドキュメントを書く際の用語とスタイル。
linkTitle: スタイルガイド
weight: 20
default_lang_commit: dc2fb5771163265cb804a39b1dacc536b95bdb96
params:
  alertExamples: |
    > [!TIP]
    >
    > 新しいコンテンツを書く場合は、通常、Docsy の
    > [alert ショートコード](https://www.docsy.dev/docs/content/shortcodes/#alert) ではなく、
    > この blockquote alert 構文を使うことを推奨します。

    > [!WARNING] :warning: 空行が必要です！
    >
    > このサイトでは [Prettier] フォーマッターを使用しており、alert タグ/タイトルと
    > alert 本文の間に空行が必要です。
cSpell:ignore: postgre
---

公式のスタイルガイドはまだありませんが、現在の OpenTelemetry ドキュメントのスタイルは以下のスタイルガイドに触発されています。

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Kubernetes Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)

後述するセクションは、OpenTelemetry プロジェクト特有のガイドを含んでいます。

> [!NOTE]
>
> スタイルガイドの多くの要件は、自動化を実行することで強制できます。
> [プルリクエスト][pull request]（PR）を提出する前に、ローカルマシンで `npm run fix:all` を実行して、変更をコミットしてください。
>
> エラーまたは [failed PR checks](../pr-checks) に遭遇した場合は、スタイルガイドを読み、特定の一般的な問題を修正するためにできることを学んでください。

[pull request]: https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request

## OpenTelemetry.io ワードリスト {#opentelemetryio-word-list}

OpenTelemetry 特有の用語や単語の一覧であり、サイト全体で一貫して利用されるべきもの。

- [OpenTelemetry](/docs/concepts/glossary/#opentelemetry) と [OTel](/docs/concepts/glossary/#otel)
- [コレクター](/docs/concepts/glossary/#collector)
- [OTEP](/docs/concepts/glossary/#otep)
- [OpAMP](/docs/concepts/glossary/#opamp)

OpenTelemetry の用語と定義の完璧なリストには、[用語集](/docs/concepts/glossary/) を参照してください。

ほかの CNCF プロジェクトやサードパーティツールなどの固有名詞は、適切に表記し、元の大文字・小文字の区別を正しく維持してください。
たとえば、"postgre" のかわりに "PostgreSQL" と表記してください。
すべてのリストは、[`.textlintrc.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.textlintrc.yml) を確認してください。

## Markdown {#markdown}

サイトページは、[Goldmark][] Markdown レンダラーがサポートする Markdown 構文で書かれています。
サポートされている Markdown 拡張の完全な一覧は、[Goldmark][] を参照してください。

次の Markdown 拡張も使用できます。

- [アラート](#alerts)
- [絵文字][Emojis]: 利用可能な絵文字の完全な一覧は、Hugo ドキュメントの [Emojis][] を参照してください。

[Emojis]: https://gohugo.io/quick-reference/emojis/

### アラート {#alerts}

次の拡張構文を使用してアラートを書けます。

- [GitHub-flavored Markdown][GFM]（GFM）の [alerts][gfm-alerts]
- カスタムアラートタイトル用の [Obsidian callout][] 構文

それぞれの例を以下に示します。

```markdown
{{% _param alertExamples %}}
```

これは次のようにレンダリングされます。

{{% _param alertExamples %}}

blockquote alert 構文の詳細は、Docsy ドキュメントの [Alerts][docsy-alerts] を参照してください。

[gfm-alerts]: https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide#alerts
[GFM]: https://github.github.com/gfm/
[Goldmark]: https://gohugo.io/configuration/markup/#goldmark
[docsy-alerts]: https://www.docsy.dev/docs/content/adding-content/#alerts
[Obsidian callout]: https://help.obsidian.md/callouts

### リンク参照 {#link-references}

Markdown の [reference links][] を使用する場合は、_shortcut_ 形式の `[text]` よりも、_collapsed_ 形式の `[text][]` を推奨します。
どちらも有効な [CommonMark][] ですが、shortcut 形式はすべての Markdown ツールで一貫して認識されるわけではありません。
特に、`[example]` と書いて定義を書き忘れた場合、[markdownlint][] linter は警告しません[^md052]。
そのテキストはリンクではなく、リテラルの `[example]` として静かにレンダリングされます。
collapsed 形式の `[example][]` であれば、linter が定義の欠落を即座に検出します。

[^md052]:
    具体的には、組み込みの [MD052][] ルール（`reference-links-images`）は、デフォルトでは collapsed と full reference 形式だけをチェックします。
    `shortcut_syntax` オプションに shortcut reference を含めることはできますが、実際にはうまく機能しません。

[MD052]: https://github.com/DavidAnson/markdownlint/blob/main/doc/md052.md

これは `no-shortcut-ref-link` カスタムルールによって強制されています。
shortcut reference を自動的に変換するには、`npm run fix:markdown` を実行してください。

[CommonMark]: https://spec.commonmark.org/0.31.2/#reference-link
[reference links]: https://spec.commonmark.org/0.31.2/#reference-link

### Markdown チェック {#markdown-standards}

Markdown ファイルの標準と一貫性を強制するため、すべてのファイルは [markdownlint][] によって強制される特定のルールに従う必要があります。
すべてのルールの一覧は、[.markdownlint.yaml][] と [.markdownlint-cli2.yaml][] ファイルを確認してください。

ルールに対する正当な例外がある場合は、`markdownlint-disable` ディレクティブを使用してルールの警告を抑制してください。
詳細は [markdownlint documentation](https://github.com/DavidAnson/markdownlint#configuration) を参照してください。

同様に、Markdown [file format](#file-format) を適用し、ファイルの末尾スペースを削除します。
これは 2 つ以上のスペースを使用する [line break syntax][] を排除します。
かわりに `<br>` を使うか、再フォーマットしてください。

## スペルチェック {#spell-checking}

すべてのテキストが正しく表記されているか確認するために、[CSpell](https://github.com/streetsidesoftware/cspell) を使用します。

`cspell` が「Unknown word」を報告した場合は、単語を正しく記述したか確認してください。
正しい場合は、次のいずれかの場所に単語を追加します。

- ページのフロントマターにある、ページローカルの `cSpell:ignore` リスト。
  詳細は以下を参照してください。
- ロケール固有の単語リストファイル
- 汎用の [all-words.txt][] 単語リスト

[all-words.txt]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell/all-words.txt

### ページローカルの `cSpell:ignore` リスト {#page-local-cspellignore-list}

未知の単語が 1 つまたは少数のページにだけ現れる場合は、ページのフロントマターにあるページローカルの `cSpell:ignore` リストに追加します。

```markdown
---
title: PageTitle
cSpell:ignore: <word>
---
```

ほかのファイルの場合は、そのファイルの状況に適したコメント行に `cSpell:ignore <word>` を追加してください。
たとえば、[レジストリ](/ecosystem/registry/) エントリー YAML ファイルでは、次のように記述します。

```yaml
# cSpell:ignore <word>
title: registryEntryTitle
```

### 単語リストファイル {#word-list-files}

未知の単語が複数のページに現れる場合や技術用語である場合は、ロケール固有の単語リストファイルに追加します。
単語リストファイルは [.cspell/][] ディレクトリにあります。

`opamp` のように、すべてのロケールで正しいスペルの単語であれば、[all-words.txt][] ファイルに追加します。

[.cspell/]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell/

## ファイルのフォーマット {#file-format}

[Prettier][] を利用することでファイルフォーマットを強制します。
次を使用して実行します。

- `npm run fix:format`: すべてのファイルをフォーマットします
- `npm run fix:format:diff`: 直近のコミットから変更されたファイルだけをフォーマットします
- `npm run fix:format:staged`: 次のコミット用にステージされたファイルだけをフォーマットします

## ファイル名 {#file-names}

すべてのファイル名は、[kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case) である必要があります。

## 検証問題の修正 {#fixing-validation-issues}

検証問題の修正方法については、[プルリクエストのチェック](../pr-checks) を参照してください。

[.markdownlint.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.yaml
[.markdownlint-cli2.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint-cli2.yaml
[line break syntax]: https://www.markdownguide.org/basic-syntax/#line-breaks
[markdownlint]: https://github.com/DavidAnson/markdownlint
[Prettier]: https://prettier.io
