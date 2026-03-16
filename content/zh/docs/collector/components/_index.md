---
title: 组件
description:
  OpenTelemetry Collector 组件 - receiver、processor、exporter、connector 和
  extension
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

OpenTelemetry Collector 由处理遥测数据的组件组成。每个组件在数据管道中都有特定的
角色。

## 组件类型

- **[Receivers](receiver/)** - 从各种来源和格式收集遥测数据
- **[Processors](processor/)** - 转换、过滤和丰富遥测数据
- **[Exporters](exporter/)** - 将遥测数据发送到可观测性后端
- **[Connectors](connector/)** - 连接两个管道，同时充当 exporter 和 receiver
- **[Extensions](extension/)** - 提供健康检查等附加功能
