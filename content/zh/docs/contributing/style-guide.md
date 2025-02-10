---
title: 文档风格指南
description: 编写 OpenTelemetry 文档时的术语和风格指南。
linkTitle: 风格指南
weight: 20
default_lang_commit: 2394fa1f1c693e547093e46e83a6819d3c26e9d5
cSpell:ignore: open-telemetry postgre style-guide textlintrc
---

OpenTelemetry 还没有官方的风格指南，当前版本的 OpenTelemetry 文档风格受到以下风格指南的启发：

- [Google 开发者文档风格指南](https://developers.google.com/style)
- [Kubernetes 风格指南](https://kubernetes.io/docs/contribute/style/style-guide/)

以下部分包含针对 OpenTelemetry 项目的特定指导。

{{% alert title="说明" color="primary" %}}

我们的风格指南中许多要求都可以通过命令来自动化执行：
在发起[拉取请求](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)(PR) 之前，你可以在本地机器上运行 `npm run fix:all` 命令并提交更改。

如果你遇到错误或 [PR 检查失败](/docs/contributing/pr-checks)，请阅读以下关于我们的风格指南的内容以及了解你可以采取哪些措施来解决某些常见问题。

{{% /alert %}}

## OpenTelemetry.io 单词列表 {#opentelemetryio-word-list}

请在整个网站上统一使用以下 OpenTelemetry 特定术语和词语列表。

<!-- prettier-ignore-start -->

| 术语 | 用法 |
| ---- | ----- |
| OpenTelemetry | OpenTelemetry 应始终大写。请勿使用 Open-Telemetry。|
| OTel | OTel 是 OpenTelemetry 的公认缩写形式。请勿使用 OTEL。|
| Collector | 当引用 OpenTelemetry Collector 时，请始终将 Collector 大写。在句子开头请使用 `The Collector` 或 `The Opentelemetry Collector`， 在句中或句尾则使用 `the Collector` 或 `the OpenTelemetry Collector`。如果您要将 Collector 用作形容词（例如， `Collector 配置` ），请只使用 `Collector`。|
| OTEP | OpenTelemetry 增强提案（OpenTelemetry Enhancement Proposal）。复数形式请写作 `OTEPs` 。请不要写成 `OTep` 或 `otep`。|
| OpAMP | 开放代理管理协议（Open Agent Management Protocol）。请勿在描述或说明中写成 `OPAMP` 或 `opamp`。|
<!-- prettier-ignore-end -->

确保正确书写专有名词（例如其他 CNCF 项目或第三方工具）并使用原始大写字母。例如，
书写 `PostgreSQL` 而不是 `postgre`。有关完整列表，请查看
[`.textlintrc.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.textlintrc.yml) 文件。

另请参阅 [词汇表](/docs/concepts/glossary/) 以获取 OpenTelemetry术语及其定义的列表。

运行 `npm run check:text` 命令以验证所有术语和单词是否书写正确。

运行 `npm run check:text -- --fix` 命令以修复书写不正确的术语和单词。

## Markdown 标准 {#markdown-standards}

为了增强 Markdown 文件的标准性和一致性，所有文件都应遵循
[markdownlint](https://github.com/DavidAnson/markdownlint)
确定的相关规则。有关完整列表，请查看
[`.markdownlint.json`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.json)
文件。

运行 `npm run check:markdown` 命令以验证所有文件是否遵循标准。

运行 `npm run fix:markdown` 命令以修复与 Markdown 相关的格式问题。

## 拼写检查 {#spell-checking}

使用 [CSpell](https://github.com/streetsidesoftware/cspell) 确保所有文本拼写正确。
有关 OpenTelemetry 网站特定单词的列表，请参阅
[`.cspell.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml) 文件。

运行 `npm run check:spelling` 命令以验证所有单词拼写是否正确。如果 `cspell` 指示
`Unknown word` 错误，请验证您是否正确编写了该单词。如果正确，请将此单词添加到文件顶部的
`cSpell:ignore` 部分。如果不存在这样的部分，您可以将其添加到 Markdown 文件的元数据中：

```markdown
---
title: PageTitle
cSpell:ignore: <word>
---
```

对于任何其他文件，请在适合文件上下文的注释行中添加 `cSpell:ignore <word>`。
对于 [registry](/ecosystem/registry/) 条目 YAML 文件，它可能看起来像这样：

```yaml
# cSpell:ignore <word>
title: registryEntryTitle
```

网站工具通过移除重复单词、删除全局单词列表中的单词以及对单词进行排序来规范特定于页面的词典（即
`cSpell:ignore` 单词列表）。要规范特定于页面的词典，请运行 `npm run fix:dict`。

## 文件格式 {#file-format}

为了执行关于文件结构的特定标准，所有文件都应使用 [prettier](https://prettier.io)
进行格式化。在提交 PR 之前运行 `npm run fix:format`，或者在提交 PR 之后运行它并推送额外的提交。

## 文件名 {#file-names}

所有文件名都应采用[短横线命名](https://en.wikipedia.org/wiki/Letter_case#Kebab_case)。
运行 `npm run fix:filenames` 以自动重命名文件。
