---
title: ドキュメントスタイルガイド
description: OpenTelemetry のドキュメントを書く際の用語とスタイル。
linkTitle: スタイルガイド
weight: 20
default_lang_commit: 95bda8d21cad14972ff819441e52d161d67e3eac
drifted_from_default: true
params:
  alertExamples: |
    > [!TIP]
    >
    > 新しいコンテンツを書く場合、一般的には Docsy の [alert shortcode](https://www.docsy.dev/docs/content/shortcodes/#alert) ではなく、このブロック引用アラート構文を使用することを推奨します。

    > [!WARNING] :warning: 空行が必要です！
    >
    > このサイトは [Prettier] フォーマッタを使用しており、アラートのタグ/タイトルとアラートの本文を分離するために空行が必要です。
cSpell:ignore: postgre
---

公式のスタイルガイドはまだありませんが、現在の OpenTelemetry ドキュメントのスタイルは以下のスタイルガイドに触発されています。

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Kubernetes Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)

後述するセクションは、OpenTelemetry プロジェクト特有のガイドを含んでいます。

> [!NOTE]
>
> スタイルガイドの多くの要件されることは、自動化で強制されています。
> [pull request][] (PR) を提出する前に、ローカルで `npm run fix:all` を実行して、変更をコミットしてください。
>
> エラーまたは [failed PR checks](../pr-checks) に遭遇した場合、スタイルガイドを読んで特定の一般的な問題を修正するのにできることを学んでください。

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

## マークダウン {#markdown}

サイトのページは、[Goldmark][] マークダウン レンダラーでサポートされているマークダウン構文で書かれています。
サポートされているマークダウン拡張の完全なリストは、[Goldmark][] を参照してください。

また、次のマークダウン拡張を使用することもできます。

- [アラート](#alerts)
- [絵文字][Emojis]: 利用可能な絵文字の完全なリストは、Hugo ドキュメントの [絵文字][Emojis] を参照してください。

[Emojis]: https://gohugo.io/quick-reference/emojis/

### アラート {#alerts}

次の拡張構文を使用して、アラートを書くことができます。

- [GitHub-flavored Markdown][GFM] (GFM) [alerts][gfm-alerts]
- [Obsidian callout][] 構文を使用して、カスタム アラート タイトルを作成します。

それぞれの例は次のようになります。

```markdown
{{% _param alertExamples %}}
```

これは次のようにレンダリングされます。

{{% _param alertExamples %}}

詳細については、Docsy ドキュメントの [アラート][docsy-alerts] を参照してください。

[gfm-alerts]: https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide#alerts
[GFM]: https://github.github.com/gfm/
[Goldmark]: https://gohugo.io/configuration/markup/#goldmark
[docsy-alerts]: https://www.docsy.dev/docs/content/adding-content/#alerts
[Obsidian callout]: https://help.obsidian.md/callouts

### リンク参照 {#link-references}

Markdown [reference links][] を使用する場合は、_collapsed_ 形式 `[text][]` を _shortcut_ 形式 `[text]` よりも優先してください。
両方とも [CommonMark][] で有効ですが、_shortcut_ 形式はすべてのマークダウン ツールで認識されないことがあります。
特に、`[example]` と定義を忘れた場合、[markdownlint][] リンターは警告を出さず[^md052]、テキストがリンクではなくリテラル `[example]` としてレンダリングされることがあります。
_collapsed_ 形式 `[example][]` を使用すると、リンターは定義の欠落をすぐに検出します。

[^md052]:
    特に、組み込みの [MD052][] ルール (`reference-links-images`) は、デフォルトで _collapsed_ 形式と _full_ 形式のみをチェックします。
    `shortcut_syntax` オプションには、ショートカット参照を含めることができますが、実際にはうまく機能しません。

[MD052]: https://github.com/DavidAnson/markdownlint/blob/main/doc/md052.md

これは `no-shortcut-ref-link` カスタムルールによって強制されます。
`npm run fix:markdown` を実行して、ショートカット参照を自動的に変換してください。

[CommonMark]: https://spec.commonmark.org/0.31.2/#reference-link
[reference links]: https://spec.commonmark.org/0.31.2/#reference-link

### マークダウン チェック {#markdown-standards}

マークダウン ファイルの規約と一貫性を確保するために、[markdownlint][] によって定められたルールに従う必要があります。
すべてのルールの一覧は、[.markdownlint.yaml][] ファイルと [.markdownlint-cli2.yaml][] ファイルを確認してください。

同様に、Markdown [file format](#file-format) を適用し、ファイルの末尾スペースを削除します。
これは 2 つ以上のスペースを使用する [line break syntax][] を排除します。
かわりに `<br>` を使うか、再フォーマットしてください。

## スペルチェック {#spell-checking}

すべてのテキストが適切に表記されているかを確認するために、[CSpell](https://github.com/streetsidesoftware/cspell) を使用します。
OpenTelemetry ウェブサイト固有の単語一覧は、[`.cspell.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml) ファイルを確認してください。

`cspell` が「Unknown word」エラーを示した場合、単語を正しく記述したかどうかを確認してください。
正しい場合、ファイルの先頭にある `cSpell:ignore` セクションに単語を追加してください。
そのようなセクションがない場合は、Markdown ファイルの Front Matter に追加できます。

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

## ファイルのフォーマット {#file-format}

[Prettier][] を利用することで、ファイルのフォーマットを強制します。
実行するコマンドは次の通りです。

- `npm run fix:format` を実行して、すべてのファイルのフォーマットを適用します。
- `npm run fix:format:diff` を実行して、直近のコミット以降に変更されたファイルのフォーマットを適用します。
- `npm run fix:format:staged` を実行して、ステージングされたファイルのフォーマットを適用します。

## ファイル名 {#file-names}

すべてのファイル名は、[kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case) である必要があります。

## 検証問題の修正 {#fixing-validation-issues}

検証問題の修正方法については、[プルリクエストのチェック](../pr-checks) を参照してください。

[.markdownlint.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.yaml
[.markdownlint-cli2.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint-cli2.yaml
[line break syntax]: https://www.markdownguide.org/basic-syntax/#line-breaks
[markdownlint]: https://github.com/DavidAnson/markdownlint
[Prettier]: https://prettier.io
