---
title: SIG 审批者与维护者的实践指南
linkTitle: SIG 实践
description: 了解审批者和维护者如何管理 Issue 和贡献内容。
weight: 999
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
cSpell:ignore: chalin Comms docsy
---

本页包含审批者与维护者使用的指南和一些通用实践。

## 加入流程 {#onboarding}

当贡献者希望承担更大责任的角色（如成为文档的审批者或维护者）时，
现有的审批者与维护者会负责引导他们完成入职流程：

- 他们将被添加到 `docs-approvers`（或 `docs-maintainers`）组中。
- 他们将被加入 Slack 的 `#otel-comms`、`#otel-maintainers` 以及其他团队的私有频道。
- 他们会被邀请订阅以下日历会议：
  - [SIG Comms 会议](https://groups.google.com/a/opentelemetry.io/g/calendar-comms)
  - [维护者会议](https://groups.google.com/a/opentelemetry.io/g/calendar-maintainer-meeting)
- 他们需要确认当前 SIG Comms 的会议时间是否适合自己；
  如果不适合，应与现有的审批者和维护者协商，找出对大家都合适的时间。
- 他们需要查看并熟悉为贡献者提供的各类资源：
  - [社区资源](https://github.com/open-telemetry/community/)，
    特别是关于[社区成员制度](https://github.com/open-telemetry/community/blob/main/community-membership.md)的文档以及
    [社交媒体指南](https://github.com/open-telemetry/community/blob/main/social-media-guide.md)。
  - [贡献指南](/docs/contributing)：他们需要审阅这些文档，并通过创建 Issue 或提交 PR 的方式提出改进建议。

其他值得阅读的重要资源包括：

- [Hugo 文档](https://gohugo.io/documentation/)
- [Docsy 文档](https://www.docsy.dev/docs/)
- [市场推广指南](/community/marketing-guidelines/)，其中包括
  Linux 基金的品牌指南与[商标使用指南](https://www.linuxfoundation.org/legal/trademark-usage)。
  这些指南在审查镜像仓库、集成内容、厂商、采用者或发行版时尤其重要。

## 协作原则 {#collaboration}

- 审批者和维护者的工作时间和环境各不相同，因此所有交流应默认为“异步”沟通。
  他们不应感到必须在非工作时间内做出回复。
- 如果审批者或维护者将在较长时间内（几天或一周以上）无法参与贡献，应在
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
  频道中说明，并更新 GitHub 的状态。
- 审批者和维护者应遵守
  [OTel 行为准则](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct)
  和[社区价值观](/community/mission/#community-values)。
  他们应对贡献者保持友好与支持。若出现冲突、误解或任何使审批者/维护者感到不适的情况，
  他们可以选择退出相关讨论、Issue 或 PR，并请求其他人接手。

## 代码审查 {#code-reviews}

### 通用原则 {#general}

- 如果 PR 分支 `落后于主分支（out-of-date with the base branch）`，不需要频繁更新，
  因为每次更新都会触发所有 CI 检查。通常只需在合并前更新即可。
- 非维护者提交的 PR 不应更新 git 子模块。虽然这种错误偶尔会发生，但应提醒作者不要担心，
  我们会在合并前处理好。不过今后请确保使用更新过的 fork 仓库进行开发。
- 如果贡献者在签署 CLA 或提交中误用了错误的邮箱地址，应请他们修复该问题或重新 rebase PR。
  最坏情况是关闭并重新打开 PR 来触发 CLA 检查。
- PR 作者应将 cspell 无法识别的词添加到每页的忽略列表中。只有审批者和维护者可将常用术语添加到全局忽略列表。

### 联合拥有的 PR {#co-owned-prs}

对于由 SIG 与文档组共同拥有的 PR（例如 collector、demo、某语言相关文档），
建议获得两个审批：一位文档审批者和一位 SIG 审批者。

- 文档审批者应为此类 PR 添加 `sig:<name>` 标签，并在 PR 中 @ 提及该 SIG 的 `-approvers` 组。
- 在文档审批者完成审查并同意合并后，可添加标签
  [`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing)，
  表示该 PR 需要由对应 SIG 进一步审查。
- 如果在一定宽限期内（通常为两周，紧急情况除外）未获得 SIG 审批，文档维护者可自行判断是否合并该 PR。

### 来自机器人的 PR {#prs-from-bots}

针对机器人创建的 PR，可以采用以下处理流程：

- 自动更新注册表中版本号的 PR 可直接修复、审批并合并。
- 自动更新 SDK、零代码接入方式或 collector 的 PR
  可审批合并，除非相关 SIG 明确表示应延迟合并。
- 自动更新规范（spec）的 PR 往往需要修改脚本才能通过 CI
  检查。此类 PR 通常由 [@chalin](https://github.com/chalin/) 处理。
  若无需脚本更改，仍可审批合并，除非对应 SIG 要求延迟。

### 翻译类 PR {#translation-prs}

涉及翻译更新的 PR 应获得两位审批者的批准：
一位文档审批者和一位翻译审批者。其处理流程与联合拥有的 PR 类似。

### 合并 PR {#merging-prs}

维护者可使用如下流程合并 PR：

- 确保 PR 获得所有必要的审批，且所有 CI 检查均通过。
- 如果分支落后，可通过 GitHub UI 执行 rebase 更新。
- 更新后 CI 会重新运行，等待其通过，或者使用如下脚本在后台完成合并：

  ```shell
  export PR=<PR 的 ID>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```
