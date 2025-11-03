---
title: 应用要求
linkTitle: 应用
aliases: [application_requirements]
default_lang_commit: beee9035dba8128dc3b970aa73e8b2a8d17d16dc
---

在定义应用将产生哪些 OpenTelemetry (OTel) 信号，以及何时应添加对未来 SDK 的支持时，会产生以下要求：

1. 每种支持的语言中，只要其 Traces 或 Metrics SDK 已 GA（正式发布），就必须至少有 1 个服务示例。
   - 移动端支持（Swift）不是初始优先事项，不包含在上述要求中。

2. 应用进程必须与语言无关。
   - 在可用的情况下优先使用 gRPC，不可用时使用 HTTP。

3. 服务应设计为可替换的模块化组件。
   - 各个服务可以且应鼓励提供多种语言选项。

4. 架构必须允许可能集成平台通用组件，例如数据库、队列或对象存储。
   - 对特定组件类型没有要求，但通常应至少包含 1 个通用组件。

5. 必须提供一个负载生成器，用于模拟用户对演示的负载。
