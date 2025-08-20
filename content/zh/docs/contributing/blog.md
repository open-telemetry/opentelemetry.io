---
title: 博客
description: 了解如何提交博客文章。
weight: 30
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
drifted_from_default: true
---

[OpenTelemetry 博客](/blog/)用于发布新特性、社区报告以及对 OpenTelemetry
社区（包括终端用户和开发者）有意义的任何新闻。所有人都可以撰写博客文章，请阅读下文了解相关要求。

## 文档还是博客文章？ {#documentation-or-blog-post}

在撰写博客文章前，请先思考你的内容是否也适合作为文档的一部分。如果答案是“是”，请通过创建一个 Issue 或拉取请求（PR）来提交你的内容，以将其添加到官方文档中。

请注意，OpenTelemetry 网站的维护者和审批者的重点是改进项目文档，因此博客文章的审查优先级会相对较低。

## 提交博客文章前的准备工作 {#before-submitting-a-blog-post}

博客文章不应具有商业性质，且应为原创内容，适用于整个 OpenTelemetry 社区。
博客文章应遵循[社交媒体指南](https://github.com/open-telemetry/community/blob/main/social-media-guide.md)中的政策。

请确认你的内容在 OpenTelemetry 社区中具有广泛适用性。合适的内容包括：

- OpenTelemetry 新特性
- OpenTelemetry 项目更新
- 特别兴趣小组（SIG）的更新
- 教程和演示
- OpenTelemetry 集成介绍

不合适的内容包括：

- 推销某个厂商的产品

如果你的博客文章属于上述合适内容，
请[创建一个 Issue](https://github.com/open-telemetry/opentelemetry.io/issues/new?title=New%20Blog%20Post:%20%3Ctitle%3E)，并包含以下信息：

- 博客文章标题
- 简短描述和文章大纲
- 如适用，请列出文中使用的技术。请确保这些技术均为开源，并优先使用 CNCF 项目而非
  CNCF 之外的项目（例如使用 Jaeger 进行链路追踪可视化，使用 Prometheus 进行指标可视化）
- 与文章相关的 [SIG](https://github.com/open-telemetry/community/) 名称
- 来自该 SIG 的一位赞助人（维护者或审批者）姓名，他/她将协助审查 PR。理想情况下，该赞助人应来自不同公司。

SIG Communication 的维护者会验证你的博客文章是否满足所有接受条件。如果你在最初的
Issue 中没有指定 SIG/赞助人，他们也会引导你找到合适的 SIG 联系以获得支持。
拥有赞助人不是强制性的，但能提高文章被更快审查和批准的机会。

如果 Issue 中的信息完整，维护者将确认你可以提交博客文章。

## 提交博客文章 {#submit-a-blog-post}

你可以通过 fork 本仓库并在本地撰写文章，或使用 GitHub UI 提交文章。无论采用哪种方式，
都请遵循[博客文章模板](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)中的说明。

### Fork 仓库并在本地撰写 {#fork-and-write-locally}

在完成本地 Fork 设置后，你可以使用模板创建博客文章。按以下步骤操作：

1. 在仓库根目录运行以下命令：

   ```sh
   npx hugo new content/en/blog/2024/short-name-for-post.md
   ```

   如果文章包含图片或其他资源，请运行以下命令：

   ```sh
   npx hugo new content/en/blog/2024/short-name-for-post/index.md
   ```

2. 编辑上一步所创建路径下的 Markdown 文件。该文件基于
   [archetypes](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/)
   中的博客文章模板初始化。

3. 将资源（如图片或其他文件）放入你创建的文件夹中。

4. 当文章准备就绪后，通过 PR 提交。

### 使用 GitHub UI {#use-the-github-ui}

如果你不想在本地 Fork 仓库，也可以通过 GitHub UI 添加文章。请按以下步骤操作：

1. 打开[博客文章模板](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)，
   点击右上角的 **Copy raw content** 复制原始内容。

2. 选择[创建新文件](https://github.com/open-telemetry/opentelemetry.io/new/main)。

3. 将第一步中复制的内容粘贴到新文件中。

4. 为你的文件命名，例如：
   `content/en/blog/2022/short-name-for-your-blog-post/index.md`

5. 在 GitHub 上编辑 Markdown 文件。

6. 当文章准备就绪，点击 **Propose changes** 并按照指引提交。

## 发布时间安排 {#publication-timelines}

OpenTelemetry 博客没有固定的发布时间安排，这意味着：

- 你的文章将在获得要求的所有审批后发布。
- 如果有需要，发布可以延期，但维护者无法保证在某个特定时间前完成发布。
- 某些博客文章（如重大公告）将具有更高优先级，可能会在你的文章之前发布。
