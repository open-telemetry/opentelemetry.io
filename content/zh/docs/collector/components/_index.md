---
title: 组件
description: OpenTelemetry Collector 组件：接收器、处理器、导出器、连接器和扩展功能
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

OpenTelemetry Collector 由负责处理遥测数据的多个组件构成。
每种组件在数据管道中都承担特定角色。

## 组件类型 {#component-types}

- **[接收器](receiver/)** - 从多种来源和格式收集遥测数据
- **[处理器](processor/)** - 转换、过滤并增强遥测数据
- **[导出器](exporter/)** - 将遥测数据发送到可观测性后端
- **[连接器](connector/)** - 连接两个管道，同时充当导出器和接收器
- **[扩展功能](extension/)** - 提供额外能力，例如健康检查
