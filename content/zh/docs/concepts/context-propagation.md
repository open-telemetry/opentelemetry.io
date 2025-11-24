---
title: 上下文传播
weight: 10
description: 了解实现分布式追踪的概念。
default_lang_commit: 7bb7dbb6
drifted_from_default: true
---

通过上下文传播，无论[信号](/docs/concepts/signals)在何处生成，信号彼此之间都可以相互关联。
尽管上下文传播的作用不仅限于链路追踪，
但上下文传播允许[链路](/docs/concepts/signals/traces)跨进程和网络边界任意分布的服务来构建相关系统的关联信息。

要理解上下文传播，你需要理解两个独立的概念：上下文和传播。

## 上下文 {#context}

**上下文（Context）**这个对象包含了发送和接收服务或[执行单元](/docs/specs/otel/glossary/#execution-unit)的信息，
用于将一个信号与另一个信号关联起来。

当 Service A 调用 Service B 时，会在上下文中包含一个链路 ID和一个 Span ID。
Service B 使用这些值创建属于同一个链路的新 Span，并将 Service A 的 Span 设置为其父。
这使得可以在跨服务边界的情况下追踪请求的完整流转过程。

## 传播 {#propagation}

**传播（Propagation）**是上下文在服务和进程之间移动的机制。
它序列化或反序列化上下文对象并提供要从一个服务传播到另一个服务的相关信息。

传播通常由插桩库进行处理，对用户是透明的。如果你需要手动传播上下文，你可以使用
[Propagators API](/docs/specs/otel/context/api-propagators/)。

OpenTelemetry 维护着几个官方传播器。默认传播器使用
[W3C 追踪上下文](https://www.w3.org/TR/trace-context/)规范指定的标头。

## 规范 {#specification}

要了解有关上下文传播的更多信息，请参阅[上下文规范](/docs/specs/otel/context/)。
