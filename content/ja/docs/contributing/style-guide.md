---
title: ドキュメントスタイルガイド
description: OpenTelemetry のドキュメントを書く際の用語とスタイル。
linkTitle: スタイルガイド
weight: 20
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
cSpell:ignore: open-telemetry postgre style-guide textlintrc
---

公式のスタイルガイドはまだありませんが、現在の OpenTelemetry ドキュメントのスタイルは以下のスタイルガイドに触発されています。

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Kubernetes Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)

後述するセクションは、OpenTelemetry プロジェクト特有のガイドを含んでいます。

{{% alert title="Note" %}}

スタイルガイドの多くの要件されることは、自動化で強制されています。
[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)(PR) を提出する前に、ローカルで `npm run fix:all` を実行して、変更をコミットしてください。

エラーまたは [failed PR checks](../pr-checks) に遭遇した場合、スタイルガイドを読んで特定の一般的な問題を修正するのにできることを学んでください。

{{% /alert %}}

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

## マークダウン規約 {#markdown-standards}

マークダウンファイルに規約と一貫性を確保するために、[markdownlint] によって定められたルールに従う必要があります。
すべてのルールの一覧は、[.markdownlint.yaml] ファイルを確認してください。

同様に、Markdown [file format](#file-format) を適用し、ファイルの末尾スペースを削除します。
これは 2 つ以上のスペースを仕様する [line break syntax] を排除します。
かわりに `<br>` を使うか、再フォーマットしてください。

## スペルチェック {#spell-checking}

すべてのテキストが適切に表記されているあ確認するために、[CSpell](https://github.com/streetsidesoftware/cspell) を使用します。
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

[Prettier] を利用することでファイルフォーマットを強制します。
`npm run fix:format` を実行して、フォーマットを適用してください。

## ファイル名 {#file-names}

すべてのファイル名は、[kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case) である必要があります。

## 検証問題の修正 {#fixing-validation-issues}

検証問題の修正方法については、[プルリクエストのチェック](../pr-checks) を参照してください。

[.markdownlint.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.yaml
[line break syntax]: https://www.markdownguide.org/basic-syntax/#line-breaks
[markdownlint]: https://github.com/DavidAnson/markdownlint
[Prettier]: https://prettier.io
