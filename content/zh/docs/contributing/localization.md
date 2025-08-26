---
title: 网站本地化
description: 创建和维护非英语本地化的网站页面。
linkTitle: 本地化
weight: 25
default_lang_commit: adf1731535b21711a7fba3cf46bd6bf4e7b923ee # patched
drifted_from_default: true
cSpell:ignore: shortcodes
---

OTel 网站使用 Hugo 的 [multilingual framework] 来支持页面的本地化。
英语是默认语言，而美式英语是默认的本地化语言形式。
随着其他语言的本地化的增加，您可以从顶部导航栏中的语言下拉菜单中看到这些语言。

## 翻译指南 {#translation-guidance}

当翻译英文网站页面时，我们建议您遵循本部分中提供的指南。

### 概要 {#summary}

#### ✅ 应做事项 {#do}

<div class="border-start border-success bg-success-subtle">

- **翻译**:
  - 页面内容, 包括:
    - Mermaid [diagram](#images) 文本字段
    - 代码片段内的注释（可选）
  - [前端元数据][front matter] 中的 `title`、`linkTitle` 和 `description` 的字段值
  - **所有页面**内容和前置元数据，除非另有说明。
- 保留原文的**内容**、**含义**以及**风格**。
- 如果您有任何疑问或问题，请通过以下方式**咨询**[维护人员][Maintainers]：
  - [Slack] 上的 `#otel-docs-localization` 或 `#otel-comms` 频道
  - [Discussion]、Issue 或者 PR 评论

[Discussion]: https://github.com/open-telemetry/opentelemetry.io/discussions?discussions_q=is%3Aopen+label%3Ai18n

</div>

#### ❌ 不应做事项 {#do-not}

<div class="border-start border-warning bg-warning-subtle">

- **翻译**:
  - 本仓库内资源的**文件或目录**名称
  - [标题 ID](#headings) 包含的[链接](#links) [^*]
  - 像这样的行内代码片段：`inline code example`
  - 标记为 `notranslate`（通常是CSS类）的Markdown元素，尤其是针对[标题heading IDs](#headings)
  - 除了[应做事项](#do)中列出的那些[前端元数据][front matter] 字段之外的其他字段。特别要注意的是，不要翻译 aliases（别名）字段。
    如有疑问，请向维护人员咨询。
  - 源代码
- 创建**图像的副本**，除非你要[对图像中的文本进行本地化处理](#images)。
- 新增新的和修改:
  - **内容** 与原来想表达的意思不相同
  - 展示**风格**，包括：**排版**、**布局**以及**设计**风格（例如排版样式、字母大小写以及间距等方面）。

[^*]: 关于一种可能的例外情况，请参阅[链接](#links)。

</div>

### 标题 ID {#headings}

为确保标题的锚点目标在各种本地化版本中保持一致，在翻译标题时：

- 如果标题有显式的 ID，那么请保留该标题的显式 ID。
  [标题 Heading ID 语法][Heading ID syntax]是使用类似 `{ #some-id }` 这样的语法，写在标题文本之后。
- 否则，需明确声明一个与原始英文标题的自动生成 ID 相对应的标题 ID。

[Heading ID syntax]: https://github.com/yuin/goldmark/blob/master/README.md#headings

### 链接 {#links}

请勿翻译链接引用。这同样适用于外部链接、网站页面的路径以及诸如[图片](#images)之类的局部资源路径。

唯一的例外是指向外部页面的链接 (像这样的链接
<https://en.wikipedia.org>) 即那些拥有针对你所在地区的特定版本的外部页面的链接。
通常情况下，这意味着要将 URL 中的 `en` 替换为你所在地区的语言代码。

{{% alert title="Note" %}}

OTel 网站的仓库中有一个自定义的 render-link 钩子，Hugo 会用它来转换指向文档页面的绝对链接路径。
像 `/docs/some-page` 这种形式的链接，在渲染链接时，会在路径开头加上页面的语言代码，从而使其特定于某个地区（本地化）。
例如，上述示例中的路径，如果是从中文页面进行渲染的话，就会变成 `/zh/docs/some-page` 。

{{% /alert %}}

### 链接定义标签 {#link-labels}

请**不要**翻译 Markdown
[链接定义](https://spec.commonmark.org/0.31.2/#link-reference-definitions)中的[标签](https://spec.commonmark.org/0.31.2/#link-label)。
应将标签重写为翻译后的链接文本。例如，考虑以下 Markdown 内容：

```markdown
[Hello], world! Welcome to the [OTel website][].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

以上 Markdown 将被翻译为法语：

```markdown
[Bonjour][hello], le monde! Bienvenue sur le [site OTel][OTel website].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

### 图片和图表 {#images}

除非你要对图像本身的文本进行本地化处理，否则**请勿**复制图像文件[^shared-images]。

务必对 [Mermaid][] 图表中的文本进行翻译。

[^shared-images]:
    Hugo 在渲染那些在网站不同本地化版本间共享的图像文件方面很智能。
    也就是说，Hugo 将会输出一个 单一的 图像文件，并在各个本地化版本中共享该文件。

[Mermaid]: https://mermaid.js.org

### Include 文件 {#includes}

你需要像翻译其他页面内容一样，对 `_includes` 目录下的页面片段进行翻译。

### 短代码 {#shortcodes}

{{% alert title="Note" %}}

截至 2025 年 2 月，我们正在将短代码迁移为[include 文件](#includes)，以此作为支持共享页面内容的一种方式。

{{% /alert %}}

一些基础短代码包含你可能需要进行本地化处理的英文文本
-- 尤其是那些包含在 [layouts/_shortcodes/docs] 中的短代码，这种情况更为明显。
如果你需要创建某个短代码的本地化版本，可将其放置在 `layouts/_shortcodes/xx` 目录下，
其中 `xx` 是你所在地区的语言代码。之后，使用与原始基础短代码相同的相对路径。

[layouts/_shortcodes/docs]: https://github.com/open-telemetry/opentelemetry.io/tree/main/layouts/_shortcodes/docs

## 跟踪本地化页面的差异 {#track-changes}

维护本地化页面的主要挑战之一，是识别对应的英文页面何时进行了更新。本节将解释我们是如何处理这个问题的。

### 前端元数据字段 `default_lang_commit` {#the-default_lang_commit-front-matter-field}

当编写一个本地化页面时，例如 `content/zh/<some-path>/page.md`，这个翻译版本是基于 `content/en/<some-path>/page.md`
对应英文页面在特定的[`main` 分支 commit][main] 版本。在这个代码仓库中，每个本地化页面都会在其前端元数据里
按以下方式标识出对应的英文页面的提交信息：

```markdown
---
title: Your localized page title
# ...
default_lang_commit: <most-recent-commit-hash-of-default-language-page>
---
```

上述前端元数据会位于 `content/zh/<some-path>/page.md` 文件中。
提交哈希值将与 `content/en/<some-path>/page.md` 文件在 main 分支上的最新提交相对应。

### 跟踪英文页面的变更情况 {#tracking-changes-to-english-pages}

随着英文页面的更新，你可以通过运行以下命令来跟踪那些需要更新的对应本地化页面：

```console
$ npm run check:i18n
1       1       content/en/docs/platforms/kubernetes/_index.md - content/zh/docs/platforms/kubernetes/_index.md
...
```

你可以通过提供如下路径的方式，将目标页面限制为一个或多个本地化版本:

```sh
npm run check:i18n -- content/zh
```

### 查看变更详情 {#viewing-change-details}

对于任何需要更新的本地化页面，你可以通过使用 `-d` 标志并提供本地化页面的路径，来查看对应英文页面的差异详情；
若省略路径，则会查看所有页面的差异详情。例如：

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

### 为新页面添加 `default_lang_commit` {#adding-default_lang_commit-to-new-pages}

在为你的本地化版本创建页面时，请记住在页面的前端元数据中添加 `default_lang_commit`，
并附上 main 分支上合适的提交哈希值。

如果你的页面翻译是基于 `main` 分支中哈希值为 `<hash>` 的英文页面，那么运行以下命令，
使用该提交哈希值 `<hash>` 自动将 `default_lang_commit` 添加到你的页面文件的前端元数据中。
如果你的页面现在与 `main` 分支的 `HEAD` 版本同步，你可以指定 `HEAD` 作为参数。例如：

```sh
npm run check:i18n -- -n -c 1ca30b4d content/ja
npm run check:i18n -- -n -c HEAD content/zh/docs/concepts
```

要列出缺少哈希键的本地化页面文件，请运行：

```sh
npm run check:i18n -- -n
```

### 更新现有页面的 `default_lang_commit` {#updating-default_lang_commit-for-existing-pages}

当你更新本地化页面以匹配对应英文页面所做的更改时，要确保同时更新 `default_lang_commit` 提交哈希值。

{{% alert title="Tip" %}}

如果你的本地化页面现在对应于 `main` 分支上 `HEAD` 位置的英文版本，那么请删除前端元数据中的提交哈希值，
然后运行上一节中给出的 **add** 命令，以自动刷新 `default_lang_commit` 字段的值。

{{% /alert %}}

如果你已批量更新了所有存在差异的本地化页面，你可以使用 `-c` 标志，后面跟上一个commit hash
或者'HEAD'（表示使用`main@HEAD`）来更新这些文件的提交哈希值。

```sh
npm run check:i18n -- -c <hash> <新文件的路径>
npm run check:i18n -- -c HEAD <新文件的路径>
```

{{% alert title="重要" %}}

当你使用 `HEAD` 作为哈希指定符时，脚本将使用你本地环境中 `main` 分支在 HEAD 位置的哈希值。
如果你希望 HEAD 对应于 GitHub 上的 `main` 分支，要确保你已经获取并拉取了 main 分支的最新内容。

{{% /alert %}}

### 不一致状态 {#drift-status}

运行 `npm run fix:i18n:status` 命令，为那些与默认版本有差异的目标本地化页面添加前端元数据字段 `drifted_from_default`。
该字段很快会用于在相对于其英文对应页面存在差异的页面顶部显示一个banner。

### 脚本帮助 {#script-help}

若要获取该脚本的更多详细信息，请运行 `npm run check:i18n -- -h`.

## 新的本地化内容 {#new-localizations}

要为 OpenTelemetry 网站开启一项新的本地化工作，你可以[创建一个issue](https://github.com/open-telemetry/opentelemetry.io/issues/)
来表明你参与贡献的意愿。同时，标记出所有愿意撰写和审核你想添加语言的翻译内容的人员。
你至少需要两名潜在贡献者，理想情况下是三名。此外，在你的议题中还需包含以下任务列表：

```markdown
- [ ] Contributors for the new language: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
- [ ] Localize site homepage to YOUR_LANGUAGE_NAME
- [ ] Create an issue label for `lang:LANG_ID`
- [ ] Create org-level group for `LANG_ID` approvers
- [ ] Update components owners for `content/LANG_ID`
- [ ] Set up spell checking, if a cSpell dictionary is available
```

注意:

- 对于想要添加的语言的 `LANG_ID`，请使用官方的 [ISO 639-1 编码](https://en.wikipedia.org/wiki/ISO_639-1)
- 请查找 [cSpell 词典](https://github.com/streetsidesoftware/cspell-dicts)，并确认以
  NPM 包形式提供的 [@cspell/dict-LANG_ID](https://www.npmjs.com/search?q=%40cspell%2Fdict)
  是否可用。如果没有适合您所指的方言或地区的词典，请选择最接近该地区的词典。有关设置方法的示例，请参考 [PR #5386] 。

当你创建了那个 Issue 并且聚集了所需数量的贡献者后，
维护人员会要求你创建一个包含[索引页面](https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md)
翻译内容的 PR。请确保维护人员能够编辑该PR，以便为该 PR 添加启动本地化项目所需的额外修改内容。

在你的第一个 PR 被合并后，维护人员会负责设置 Issue 标签、组织级别的群组以及组件负责人。

{{% alert title="重要" color="warning" %}}

即便你并非 OpenTelemetry 项目的现有贡献者，也能开启新的本地化工作。
不过，你不会被添加为[OpenTelemetry GitHub组织](https://github.com/open-telemetry/)的成员，
也无法成为你所负责本地化工作的审批组的成员。若要成为正式成员和审批人员，
你需要满足[成员准则](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md)中所列出的要求。

在启动本地化项目时，维护人员会像对待已有的审批人员那样对待你的审核意见。

{{% /alert %}}

## 英语语言维护者指南 {#english-language-maintainer-guidance}

### 当非英语页面的链接检查失败时 {#when-link-checking-fails-for-non-english-pages}

英语是 OpenTelemetry 网站的默认语言。在添加、编辑或重构英语文档之后，非英语页面的链接检查可能会失败。
如果出现这种情况，请执行以下操作：

<!-- markdownlint-disable blanks-around-fences -->

- 请不要修复这些链接。每个非英语页面都与对应的英语页面的特定提交相关联，
  该提交由 `default_lang_commit` 前端元数据键的 git 提交哈希值来标识。
- 通过将以下内容添加到页面的前端元数据中，来配置链接检查器以忽略非英语页面。
  如果有多个页面存在链接错误，则将其添加到最近的公共父级文件中：
  ```yaml
  htmltest:
    # TODO: remove the IgnoreDirs once broken links are fixed
    IgnoreDirs:
      - path-regex/to/non-en/directory/contain/files/to/ignore
      - path-2-etc
  ```
- 运行 `npm run check:links` 命令，并在你的 PR 中包含对 `.htmltest.yml` 配置文件所做的任何更新内容。

<!-- markdownlint-enable blanks-around-fences -->

[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[multilingual framework]: https://gohugo.io/content-management/multilingual/
[PR #5386]: https://github.com/open-telemetry/opentelemetry.io/pull/5386/files
[slack]: https://slack.cncf.io/
