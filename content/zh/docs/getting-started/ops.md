---
title: 运维人员入门
linkTitle: Ops
default_lang_commit: e771c886739c4847b332b74f24b09d2769aab875
---

如果你符合以下条件，那么这个[入门指南](..)就是为你准备的：

- 你在生产环境中运行一组应用程序。
- 你的目标是从这些应用程序中获取可观测性数据（telemetry），而无需修改它们的代码。
- 你想从多个服务中收集链路、指标和日志，并将它们发送到你的可观测性后端。

OpenTelemetry 可以帮到你！为了实现在不修改应用程序代码的情况下获取观测数据的目标，我们建议你学习以下内容：

- [什么是 OpenTelemetry？](../../what-is-opentelemetry/)
- [如何在不修改代码的情况下为应用程序添加观测性？](../../concepts/instrumentation/zero-code/)
- [如何设置 Collector？](../../collector/)
- [如何使用 OpenTelemetry Operator 在 Kubernetes 中实现自动化？](../../platforms/kubernetes/operator/)

如果你想要实际体验这些功能，我们的[官方演示库提供了一套完整的应用](/ecosystem/demo/)，非常适合实践学习。
