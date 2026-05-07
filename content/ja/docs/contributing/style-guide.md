---
title: ドキュメントスタイルガイド
description: OpenTelemetry のドキュメントを書く際の用語とスタイル。
linkTitle: スタイルガイド
weight: 20
default_lang_commit: bf34bfd07aed3a78b92169633a7b6f4ee278b075
params:
  alertExamples: |
    > [!TIP]
    >
    > 新しいコンテンツを書く場合、通常は Docsy の [alert shortcode](https://www.docsy.dev/docs/content/shortcodes/#alert) ではなく、この blockquote アラート構文を使用することを推奨します。

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
> [プルリクエスト][pull request] (PR) を提出する前に、ローカルマシンで `npm run fix:all` を実行して、変更をコミットしてください。
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

サイトのページは、[Goldmark][] マークダウンレンダラーでサポートされているマークダウン構文で書かれています。
サポートされているマークダウン拡張の完全なリストは、[Goldmark][] を参照してください。

また、次のマークダウン拡張を使用することもできます。

- [アラート](#alerts)
- [絵文字][Emojis]: 利用可能な絵文字の完全なリストは、Hugo ドキュメントの [絵文字][Emojis] を参照してください。

[Emojis]: https://gohugo.io/quick-reference/emojis/

### アラート {#alerts}

次の拡張構文を使用して、アラートを書くことができます。

- [GitHub-flavored Markdown][GFM] (GFM) [alerts][gfm-alerts]
- [Obsidian callout][] カスタムアラートタイトルの構文

それぞれの例は、次のようになります。

```markdown
{{% _param alertExamples %}}
```

これらは次のようにレンダリングされます。

{{% _param alertExamples %}}

blockquote アラート構文の詳細については、Docsy ドキュメントの [アラート][docsy-alerts] を参照してください。

[gfm-alerts]: https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide#alerts
[GFM]: https://github.github.com/gfm/
[Goldmark]: https://gohugo.io/configuration/markup/#goldmark
[docsy-alerts]: https://www.docsy.dev/docs/content/adding-content/#alerts
[Obsidian callout]: https://help.obsidian.md/callouts

### リンク参照 {#link-references}

Markdown [リンク参照][reference links] を使用する場合は、_collapsed_ 形式 `[text][]` を _shortcut_ 形式 `[text]` よりも優先してください。
どちらも有効な [CommonMark][] ですが、_shortcut_ 形式はすべてのマークダウンツールで一貫して認識されるわけではありません。
特に `[example]` と書いて定義を忘れた場合、[markdownlint][] リンターは [^md052] の警告を出しません。
テキストはリンクではなく、リテラルの `[example]` として暗黙的にレンダリングされます。
`[example][]` という _collapsed_ 形式を使用すると、リンターは欠落した定義をすぐに検出します。

[^md052]:
    具体的には、組み込みの [MD052][] ルール (`reference-links-images`) は、デフォルトで _collapsed_ 形式と _full_ 形式のみをチェックします。
    `shortcut_syntax` オプションには、ショートカット参照を含めることができますが、実際にはうまく機能しません。

[MD052]: https://github.com/DavidAnson/markdownlint/blob/main/doc/md052.md

これは `no-shortcut-ref-link` カスタムルールによって強制されます。
`npm run fix:markdown` を実行して、ショートカット参照を自動的に変換してください。

[CommonMark]: https://spec.commonmark.org/0.31.2/#reference-link
[reference links]: https://spec.commonmark.org/0.31.2/#reference-link

### マークダウンチェック {#markdown-standards}

マークダウンファイルの規約と一貫性を確保するために、[markdownlint][] によって定められたルールに従う必要があります。
すべてのルールの一覧は、[.markdownlint.yaml][] ファイルと [.markdownlint-cli2.yaml][] ファイルを確認してください。

ルールに正当な例外がある場合は、`markdownlint-disable` ディレクティブを使用して、そのルールの警告を抑制してください。
詳しくは [markdownlint のドキュメント](https://github.com/DavidAnson/markdownlint#configuration) を参照してください。

同様に、Markdown [file format](#file-format) を適用し、ファイルの末尾スペースを削除します。
これは 2 つ以上のスペースを使用する [line break syntax][] を排除します。
かわりに `<br>` を使うか、再フォーマットしてください。

## スペルチェック {#spell-checking}

すべてのテキストが適切に表記されているかを確認するために、[CSpell](https://github.com/streetsidesoftware/cspell) を使用します。
`cspell` により "Unknown word" と報告された場合は、単語を正しく記述したかどうかを確認してください。
単語が正しい場合、以下のうちいずれかにその単語を追加してください。

- ページのフロントマターにあるページローカルな `cSpell:ignore` リスト。詳細は以下を参照してください
- ロケール固有の単語一覧ファイル
- 全般的な [all-words.txt][] 単語一覧

[all-words.txt]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell/all-words.txt

### ページローカルな `cSpell:ignore` リスト {#page-local-cspellignore-list}

不明な単語が 1 ページ、もしくは数ページにしか出現しない場合は、ページのフロントマターにあるページローカルな `cSpell:ignore` リストに追加してください。

```markdown
---
title: PageTitle
cSpell:ignore: <word>
---
```

マークダウンではないファイルの場合は、そのファイルの状況に適したコメント行に `cSpell:ignore <word>` を追加してください。
たとえば、[レジストリ](/ecosystem/registry/) エントリー YAML ファイルでは、次のように記述します。

```yaml
# cSpell:ignore <word>
title: registryEntryTitle
```

### 単語一覧ファイル {#word-list-file}

複数ページに不明な単語がある場合や、それが専門用語である場合は、ロケール固有の単語一覧ファイルに追加してください。
単語一覧ファイルは [.cspell/][] ディレクトリにあります。

`opamp` のように、すべてのロケールにおいて単語が適切に表記されている場合は、[all-words.txt][] ファイルに追加してください。

[.cspell/]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell/

## ファイルのフォーマット {#file-format}

[Prettier][] を利用することで、ファイルのフォーマットを強制します。
実行するコマンドは次のとおりです。

- `npm run fix:format` を実行して、すべてのファイルをフォーマットします
- `npm run fix:format:diff` を実行して、最後のコミット以降に変更されたファイルのみをフォーマットします
- `npm run fix:format:staged` を実行して、次のコミットに向けてステージングされたファイルのみをフォーマットします

## ファイル名 {#file-names}

すべてのファイル名は、[kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case) である必要があります。

## 検証問題の修正 {#fixing-validation-issues}

検証問題の修正方法については、[プルリクエストのチェック](../pr-checks) を参照してください。

[.markdownlint.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.yaml
[.markdownlint-cli2.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint-cli2.yaml
[line break syntax]: https://www.markdownguide.org/basic-syntax/#line-breaks
[markdownlint]: https://github.com/DavidAnson/markdownlint
[Prettier]: https://prettier.io
