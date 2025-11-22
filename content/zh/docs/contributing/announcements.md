---
title: 公告
description: 为特别活动创建公告或横幅。
weight: 50
default_lang_commit: adc4264c2926e3d767b6a56affb19fb4ae3f2a22 # patched
drifted_from_default: true
---

公告是本地化目录中 `announcements` 部分下的一个**常规 Hugo 页面**。
这意味着我们可以利用 Hugo 内置功能来处理（未来或过期的）页面日期、国际化等功能，
这样可以根据构建日期自动显示或隐藏网站的横幅，确定横幅的排序，处理回退到英文横幅等情况。

> 目前，公告仅作为横幅使用。将来我们**可能**会支持更通用的公告形式。

## 创建公告 {#creating-an-announcement}

要添加一个新的公告，请在你的本地化目录下的 `announcements` 文件夹中使用以下命令创建一个 Markdown 文件：

```sh
hugo new --kind announcement content/YOUR-LOCALE/announcements/announcement-file-name.md
```

根据你想要的语言区域和文件名进行调整。将公告内容添加为页面的正文。

> 对于横幅来说，公告正文必须是简短的文字。

{{% alert title="关于本地化" %}}

如果你正在创建一个**特定语言区域的公告**，请确保使用与英文公告**相同的文件名**。

{{% /alert %}}

## 公告列表 {#announcement-list}

当构建日期位于公告的 `date` 和 `expiryDate` 字段之间时，所有提供的公告会出现在站点构建中。
如果这些字段缺失，则分别默认为 “now” 和 “forever”。

公告将按照 Hugo 的[常规页面](https://gohugo.io/methods/site/regularpages/)功能确定的标准页面顺序出现。
也就是说，`weight` 值最小（“最轻”的）公告会优先显示；
当多个公告的权重相同或未指定时，最新日期的公告将优先显示，依此类推。

因此，如果你希望将某条公告置顶，可以在 front matter 中将 `weight` 设为负数。

如果你发现仓库内容存在错误或问题，或者你希望请求某项增强功能，请[创建一个 Issue][new-issue]。

如果你发现了安全问题，请在创建 Issue
前阅读我们的[安全策略](https://github.com/open-telemetry/opentelemetry.io/security/policy)。

在报告新 Issue 之前，请先通过我们的
[Issue 列表](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)
确认该问题尚未被报告或已被修复。

在创建新的 Issue 时，标题要简短而有意义，并提供清晰的描述。
请尽可能提供相关信息，如有可能，还应附上测试用例。

[new-issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
