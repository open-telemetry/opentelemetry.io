---
title: 上下文传播
weight: 10
description: 了解实现分布式追踪的概念。
default_lang_commit: 7bb7dbb6
drifted_from_default: true
---

通过上下文传播，[信号](/docs/concepts/signals)可以相互关联，
无论它们是在何处生成的。
尽管它不仅限于链路追踪，但它允许 [trace](/docs/concepts/signals/traces)
跨进程和网络边界任意分布的服务构建相关系统的关联信息。

我们通过两个子概念来定义上下文传播：上下文和传播。

## 上下文

**上下文**是一个对象，它包含发送和接收服务
（或[执行单元](/docs/specs/otel/glossary/#execution-unit)）
用于将一个信号与另一个信号关联起来的信息。

例如，如果服务 A 调用服务 B，那么服务 A 中 ID 在上下文中的 span 将用作服务
B 中创建的下一个 span 的父 span。
上下文中的 trace ID 也将用于服务 B 中创建的下一个 span，
这表示该 span 与服务 A 中的 span 属于同一 trace 的一部分。

## 传播

**传播**是上下文在服务和进程之间移动的机制。
它序列化或反序列化上下文对象并提供要从一个服务传播到另一个服务的相关信息。
传播通常由检测库处理并且对用户是透明的，但如果你需要手动传播上下文，则可以使用传播 API。

OpenTelemetry 维护着几个官方传播器。
默认传播器使用 [W3C 追踪上下文](https://www.w3.org/TR/trace-context/)
规范指定的标头。

## 规范

要了解有关上下文传播的更多信息，请参阅[上下文规范](/docs/specs/otel/context/)。
