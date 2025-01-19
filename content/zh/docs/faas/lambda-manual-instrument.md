---
title: Lambda 手动插桩
weight: 11
description: 使用 OpenTelemetry 手动插桩 Lambda
default_lang_commit: 06837fe15457a584f6a9e09579be0f0400593d57
---

对于在 Lambda 自动插桩文档中未涵盖的语言，社区尚未提供独立的插桩器。

用户需要遵循其选定语言的通用插桩指导，并添加 Collector Lambda 层来提交数据。

### 添加 OTel Collector Lambda 层的 ARN

参见 [Collector Lambda 层指导](../lambda-collector/)将层添加到你的应用程序并配置
Collector。我们建议首先添加此层。

### 使用 OTel 插桩 Lambda

查看[语言插桩指导](/docs/languages/)，了解如何手动插桩你的应用程序。

### 发布你的 Lambda

发布新的 Lambda 版本以部署新更改和插桩器。
