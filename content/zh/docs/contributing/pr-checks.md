---
title: PR 检查
description: 了解如何使你的 PR 成功通过所有检查
weight: 40
default_lang_commit: e04e8da1f4527d65c162af9a670eb3be8e7e7fb9
drifted_from_default: true
---

当你向 [opentelemetry.io 仓库](https://github.com/open-telemetry/opentelemetry.io)提交
[PR](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
时，会执行一组检查。PR 检查用于验证以下内容：

- 你是否签署了 [CLA](#easy-cla)
- 你的 PR 是否成功通过了 [Netlify 部署](#netlify-deployment)
- 你的更改是否符合我们的[风格指南](#checks)

{{% alert title="注意" %}}

如果有任一项 PR 检查失败，请首先尝试通过在本地运行 `npm run fix:all` 来修复内容问题。

你也可以在 PR 中添加评论 `/fix:all`。这会触发 OpenTelemetry Bot 代表你运行该命令并更新 PR。
请确保你在本地拉取这些更改。

如果问题仍然存在，请继续阅读下文，了解各个检查的作用以及如何从失败状态中恢复。

{{% /alert %}}

## `Easy CLA`

如果你尚未[签署 CLA](../prerequisites/#cla)，该检查会失败。

## Netlify 部署

如果 [Netlify](https://www.netlify.com/) 构建失败，请点击 **Details** 查看更多内容。

## GitHub PR 检查 {#checks}

为确保贡献符合我们的[风格指南](../style-guide/)，我们实现了一组检查，用于验证风格规则，如果发现问题，则会导致失败。

以下是当前检查项的说明以及你可以采取的修复措施：

### `TEXT linter`

该检查用于验证 [OpenTelemetry 专用术语在整个站点中的使用是否一致](../style-guide/#opentelemetryio-word-list)。

如果发现问题，会在 PR 的 `files changed` 视图中为你的文件添加注释。
修复这些问题即可通过该检查。你也可以在本地运行 `npm run check:text -- --fix`
修复大部分问题。然后再次运行 `npm run check:text`，手动修复剩余问题。

### `MARKDOWN linter`

该检查用于验证 [Markdown 文件的格式标准和一致性](../style-guide/#markdown-standards)。

如果发现问题，可运行 `npm run fix:format` 修复大部分问题。
对于更复杂的问题，运行 `npm run check:markdown` 并根据建议进行修改。

### `SPELLING check`

该检查用于验证[所有单词拼写是否正确](../style-guide/#spell-checking)。

### `CSPELL` check

该检查会验证你在 cSpell 忽略列表中的所有单词是否已规范化。

如果该检查失败，请在本地运行 `npm run fix:dict` 并将更改通过新的提交推送。

### `FILENAME check`

该检查用于验证所有[文件是否经过 Prettier 格式化](../style-guide/#file-format)。

如果该检查失败，请在本地运行 `npm run fix:format` 并将更改通过新的提交推送。

### `FILE FORMAT`

该检查用于验证所有[文件名是否为 kebab-case 命名格式](../style-guide/#file-names)。

如果该检查失败，请在本地运行 `npm run fix:filenames` 并将更改通过新的提交推送。

### `BUILD and CHECK LINKS`

该检查会构建网站并验证所有链接是否有效。

你可以在本地运行 `npm run check:links` 来检查链接。
该命令还会更新引用缓存。请将对 refcache 的更改作为新提交推送。

#### 修复 404 错误

你需要修复链接检查器报告为 **无效**（HTTP 状态为 **404**）的 URL。

#### 处理有效的外部链接

有时链接检查器在检查某些服务器时不会收到 200（成功）状态。这些服务器可能会返回
400 范围内除 404 以外的状态码，例如 401、403 或 406，这些都是常见情况。
像 LinkedIn 这些服务器会返回 999。

如果你已经手动验证某个外部链接是有效的，但检查器未能获得成功状态，你可以在 URL 后添加查询参数
`?no-link-check` 来让检查器忽略该链接。例如，
[https:/some-example.org?no-link-check](https:/some-example.org?no-link-check) 会被检查器忽略。

{{% alert title="维护者提示" %}}

维护者在运行链接检查器后，可以立即运行以下脚本，使用 Puppeteer 验证那些非成功状态的链接：

```sh
./scripts/double-check-refcache-400s.mjs -f --max-num-to-update 99
```

该脚本还会验证 URL 的片段部分，这是链接检查器无法处理的。

{{% /alert %}}

### `WARNINGS in build log?`

如果该检查失败，请查看 `BUILD and CHECK LINKS` 日志中的 `npm run log:check:links`
步骤，查找其他潜在问题。如果你不确定如何修复，请向维护者寻求帮助。
