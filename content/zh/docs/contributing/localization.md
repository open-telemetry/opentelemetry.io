---
title: 网站本地化
description: 创建和维护非英语本地化的网站页面。
linkTitle: 本地化
weight: 25
default_lang_commit: adf1731535b21711a7fba3cf46bd6bf4e7b923ee # patched
drifted_from_default: true
cSpell:ignore: Dowair shortcodes
---

OTel 网站使用 Hugo 的 [multilingual framework][] 来支持页面的本地化。
英语是默认语言，而美式英语是默认的本地化语言形式。
随着其他语言的本地化的增加，你可以从顶部导航栏中的语言下拉菜单中看到这些语言。

## 翻译指南 {#translation-guidance}

当翻译英文网站页面时，我们建议你遵循本部分中提供的指南。

### 概要 {#summary}

#### ✅ 应做事项 {#do}

<div class="border-start border-success bg-success-subtle">

- **翻译**:
  - 页面内容, 包括:
    - Mermaid [diagram](#images) 文本字段
    - 代码片段内的注释（可选）
  - [前端元数据][front matter] 中的 `title`、`linkTitle` 和 `description` 的字段值
  - **所有页面**内容和前置元数据，除非另有说明
- 保留原文的**内容**、**含义**以及**风格**
- **渐进式**提交[小的 PR](#small-prs)
- 如果你有任何疑问或问题，请通过以下方式**咨询**[维护人员][Maintainers]：
  - [Slack][] 上的 `#otel-docs-localization` 或 `#otel-comms` 频道
  - [Discussion][]、Issue 或者 PR 评论

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
-- 尤其是那些包含在 [layouts/_shortcodes/docs][] 中的短代码，这种情况更为明显。
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

## 新增本地化语言 {#new-localizations}

对在 OTel 网站上新增一个本地化语言感兴趣？请联系维护者表达你的兴趣，例如通过 GitHub 讨论或
Slack 的 `#otel-docs-localization` 频道。本节将解释如果新增一个本地化语言所需的步骤。

{{% alert title="注意" %}}

你不必是 OpenTelemetry 项目的现有贡献者即可启动新的本地化语言。然而，
在满足[成员指南](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md)
中关于成为正式成员和 Approver 的要求之前，你还不能被添加为
[OpenTelemetry GitHub 组织](https://github.com/open-telemetry/)的成员，或成为本地化项目的 Approver 组成员。

在你获得 Approver 资格之前，你可以通过添加 “LGTM”（Looks Good To Me）评论来表示你对某个本地化
PR 的认可。在此启动阶段，维护者会将你的评论视为正式审批。

{{% /alert %}}

### 1. 组建本地化团队 {#team}

新增一个本地化语言的核心是建立一个积极且互助的社区。要为 OpenTelemetry 网站启动一个新的本地化语言，你需要：

1. 一位熟悉目标语言的 **本地化导师**，例如 [CNCF 术语表](https://glossary.cncf.io/)或
   [Kubernetes 网站](https://github.com/kubernetes/website)的[活跃 Approver](https://github.com/cncf/glossary/blob/main/CODEOWNERS)。
2. 至少两位潜在的贡献者。

### 2. 启动本地化：创建一个 Issue {#kickoff}

当你的[本地化团队](#team)已经建立或正在组建时，创建一个包含以下任务列表的 Issue：

1. 查找你要添加的语言的官方 [ISO 639-1 语言代码](https://en.wikipedia.org/wiki/ISO_639-1)。
   我们将在本节的其余部分中将此语言代码称为 `LANG_ID`。
   如果你对使用哪个标签（尤其是子区域）有疑问，请咨询维护者。

2. 确定[导师和潜在贡献者](#team) 的 GitHub 用户名。

3. 创建一个 [新 Issue](https://github.com/open-telemetry/opentelemetry.io/issues/new)，
   并在提交的 Issue 评论中包含以下任务列表：

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
   - [ ] Localize site homepage (only) to YOUR_LANGUAGE_NAME and submit a PR.
         For details, see
         [Localize the homepage](https://opentelemetry.io/docs/contributing/localization/#homepage).
   - [ ] OTel maintainers:
     - [ ] Update Hugo config for `LANG_ID`
     - [ ] Configure cSpell and other tooling support
     - [ ] Create an issue label for `lang:LANG_ID`
     - [ ] Create org-level group for `LANG_ID` approvers
     - [ ] Update components owners for `content/LANG_ID`
   - [ ] Create an issue to track the localization of the **glossary**. Add the
         issue number here. For details, see
         [Localize the glossary](https://opentelemetry.io/docs/contributing/localization/#glossary).
   ```

### 3. 本地化首页 {#homepage}

[提交一个 PR](../pull-requests/)，在文件 `content/LANG_ID/_index.md`
中添加网站[首页](https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md)的翻译，
且**不要包含其他内容**。请确保维护者有权编辑你的 PR，因为他们需要添加一些额外更改以新增本地化语言。

在你的第一个 PR 合并后，维护者将设置 Issue 标签、组织群组和组件所有者。

### 4. 本地化术语表 {#glossary}

第二个需要本地化的页面是[术语表](/docs/concepts/glossary/)。
这是面向本地化读者的一个**关键**页面，因为它定义了可观测性及 OpenTelemetry 中的核心术语。
尤其当你的语言中不存在这些术语时，这一点尤为重要。

参考 Ali Dowair 在 Write the Docs 2024 上的演讲主题[翻译艺术：如何本地化技术内容](https://www.writethedocs.org/conf/atlantic/2024/speakers/#speaker-ali-dowair-what-s-in-a-word-lessons-from-localizing-kubernetes-documentation-to-arabic-ali-dowair)及其[演讲视频](https://youtu.be/HY3LZOQqdig)。

### 5. 按小步推进本地化其他页面 {#rest}

在术语体系确立后，你可以开始本地化网站的其他页面。<a id="small-prs"></a>

{{% alert title="请提交小型 PR" color="primary" %}}

本地化团队应**以小步迭代的方式**提交工作。也就是说，保持 [PRs][] 简洁，最好只包含一个或几个小文件。
小型 PR 更易于审查，因此通常能更快合并。

{{% /alert %}}

### OTel 维护者清单

#### Hugo

为 `LANG_ID` 更新 Hugo 配置。为 `LANG_ID` 添加合适条目：

- `config/_default/hugo.yaml` 中的 `languages`
- `config/_default/module-template.yaml` 中的 `module.mounts`
  至少应添加一个针对 `content` 的 `source`-`target` 项。
  仅当该语言内容足够多时，再考虑为 `en` 添加回退页面条目。

#### 拼写检查

查找是否存在作为 NPM 包发布的 [cSpell 字典][cSpell dictionaries][@cspell/dict-LANG_ID][]。
如果没有适合你方言或地区的字典，请选择最接近的地区版本。

如果完全没有可用字典，可以跳过本节。否则：

- 将该 NPM 包添加为开发依赖，例如：
  `npm install --save-dev @cspell/dict-bn`
- 创建 `.cspell/LANG_ID-words.txt` 文件，作为 `LANG_ID` 的站点本地词典。
- 在 `.cspell.yml` 中添加以下条目：
  - `import`
  - `dictionaryDefinitions`
  - `dictionaries`：这里应添加两个条目，一个为 `LANG_ID`，另一个为 `LANG_ID-words.txt`

[cSpell dictionaries]: https://github.com/streetsidesoftware/cspell-dicts
[@cspell/dict-LANG_ID]: https://www.npmjs.com/search?q=%40cspell%2Fdict

#### 其他工具支持

- **Prettier 支持**：如果 Prettier 对 `LANG_ID` 支持不佳，请在 `.prettierignore` 中添加忽略规则。

## Approver 与维护者指南 {#approver-and-maintainer-guidance}

### 含语义变更的 PR 不应跨语言提交 {#prs-should-not-span-locales}

Approver 应确保对文档页面进行**语义变更**的 [PRs][] 不跨多个语言版本。
语义变更是指影响页面**内容含义**的修改。我们的文档[本地化流程](.)确保每种语言的
Approver 会在适当的时候审查英文修改，以确定是否适用于其本地化版本，并决定如何整合。

如有需要，Approver 将通过各自语言的 PR 进行修改。

### 纯编辑性修改可跨语言提交 {#patch-locale-links}

**纯编辑性修改**是指不影响内容含义的更新，可跨语言进行。这类修改包括：

- **链接维护**：修复因页面移动或删除而导致的链接路径错误；
- **资源更新**：更新已移动的外部资源链接；
- **定向内容添加**：在不便更新整个文件时，为已偏移的文件添加特定新定义或段落。

#### 链接修复与资源更新 {#link-fixes-and-resource-updates}

例如，当英文文档页面移动或删除时，可能导致其他语言版本的链接检查失败。
此时，请在每个受影响页面中进行以下更新：

- 更新到新页面路径的链接引用；
- 在 front matter 中的 `default_lang_commit` 行末添加注释 `# patched`；
- 不做其他修改；
- 重新运行 `npm run check:links` 并确保无链接错误。

当一个**外部链接**指向的资源（例如 GitHub 文件）被**移动**但语义**未改变**时，可考虑：

- 从 refcache 中移除失效链接；
- 按前述方式更新所有语言版本的链接。

#### 向已偏移文件中添加定向内容 {#targeted-content-additions}

当需要向与英文版本不完全同步的本地化文件中添加新内容时，可选择**定向更新**，而无需更新整个文件。
例如，当英文术语表新增 “cardinality” 词条时，你可以仅在本地化版本中添加该定义。

操作流程示例：

- 仅将 “cardinality” 定义块添加至本地化术语表文件；
- 在 front matter 中的 `default_lang_commit` 行末添加 `# patched`；
- 保留其他内容不变；
- 在 PR 描述中明确说明：
  - 添加的具体内容（例如 “cardinality” 定义）；
  - 文件中仍存在未同步内容；
  - 定向更新的理由（例如“为本地读者提供关键新术语，无需同步整个文件”）。

这种方式可实现对本地化内容的渐进改进，同时保持对同步状态的可见性。

[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[multilingual framework]: https://gohugo.io/content-management/multilingual/
[PRs]: ../pull-requests/
[slack]: https://slack.cncf.io/
