---
title: Issue
description: 如何修复已有的 Issue，或报告 bug、安全风险或潜在改进项。
weight: 10
_issues: https://github.com/open-telemetry/opentelemetry.io/issues
_issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A
default_lang_commit: e04e8da1f4527d65c162af9a670eb3be8e7e7fb9
drifted_from_default: true
---

<style>
  /* 强制列表项紧凑显示 */
  li > p {
    margin-bottom: 0;
  }

  /* “首次贡献”提示的样式 */
  .alert--first-timer {
    margin: 0.5rem 0 !important;

    > blockquote {
      margin-top: 1rem;
      margin-bottom: 0;
      border-left-color: var(--bs-warning);
      background-color: var(--bs-danger-bg-subtle);
      > *:last-child {
        margin-bottom: 0;
      }
    }
  }
</style>

## 修复已有 Issue {#fixing-an-existing-issue}

改进 OTel 文档最好的方式之一，就是修复已有的 Issue。

1. 浏览 [Issue 列表]({{% param _issues %}})。

2. 选择你想要解决的 Issue，最好是可以在较短时间内完成的。<a name="first-issue"></a>
   {{% alert title="首次贡献？" color="primary alert--first-timer" %}}

   可以选择带有以下标签的 Issue：
   - [Good first issue](<{{% param _issue %}}%22good+first+issue%22>)
   - [Help wanted](<{{% param _issue %}}%3A%22help+wanted%22>)

   > **注意**：**我们不会**将 Issue 分配给尚未对
   > [OpenTelemetry 组织][org]有过贡献的用户，除非你是通过导师计划或新手引导流程加入的。
   >
   > [org]: https://github.com/open-telemetry

   {{% /alert %}}

3. 阅读该 Issue 的评论（如有）。

4. 在评论区向维护者确认该 Issue 是否仍需处理，并提出任何需要澄清的问题。

5. 在评论中说明你希望认领该 Issue。

6. 开始修复该 Issue。如有困难，及时告知维护者。

7. 准备好后，[通过 PR 提交你的更改](../pull-requests)。

## 报告 Issue {#reporting-an-issue}

如果你发现错误，或希望对已有内容提出改进建议，可以创建一个新的 Issue。

1. 点击任意文档页面上的 **Create documentation issue** 链接，
   会跳转到一个已预填内容的 GitHub Issue 页面。
2. 描述你发现的问题或改进建议，尽可能提供详细信息。
3. 点击 **Create** 提交。

提交后，请定期查看你的 Issue 状态，或开启 GitHub 通知。
维护者和审批者可能需要几天时间进行回复。在处理前，审阅者或其他社区成员可能会提出进一步问题。

## 建议新增内容或功能 {#suggesting-new-content-or-features}

如果你有新的内容或功能的想法，但不确定应该放在哪里，也可以创建一个 Issue。同样也可用于报告 Bug 或安全漏洞。

1. 前往 [GitHub](https://github.com/open-telemetry/opentelemetry.io/issues/new/)，
   在 **Issues** 标签页中点击 **New issue**。

2. 选择与你的问题或建议最相关的 Issue 类型。

3. 填写模板内容。

4. 提交该 Issue。

### 如何编写高质量的 Issue {#how-to-file-greate-issues}

创建 Issue 时请注意以下几点：

- 提供清晰的问题描述。说明具体缺失、过时、有误或需要改进的内容。
- 说明该问题对用户的具体影响。
- 控制 Issue 的范围，使其成为一个合理的工作单元。对于范围较大的问题，
  应拆分为多个小 Issue。例如，“修复所有安全文档”太宽泛，而“补充‘限制网络访问’部分的细节”则具体且可执行。
- 搜索现有 Issue，避免重复提交。
- 如果该 Issue 与其他 Issue 或 PR 有关，请引用其完整链接，或使用带 `#` 的编号引用，例如：`由 #987654 引入`。
- 遵守[行为准则](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md)。
  尊重其他贡献者，例如，“文档太烂了”这种说法既无帮助也不礼貌。
