---
title: 插桩范围
default_lang_commit: e9a74ead9ff9ee7c1df04241e916bdb606ba5e24
weight: 80
---

[插桩范围](/docs/specs/otel/common/instrumentation-scope/)代表应用代码中的一个逻辑单元。
所输出的遥测数据可关联到该逻辑单元。

开发者可以决定什么代表合理的插桩范围。
例如，他们可以选择模块、包或类作为插桩范围。
在库或框架的情况下，常用的方法是使用对库或框架唯一的标识符作为范围，例如库或框架的完全限定名称和版本。
如果库本身没有内置的 OpenTelemetry 插桩，而是使用插桩库，则使用插桩库的名称和版本作为插桩范围。

当从提供程序获取链路追踪器、指标计量器或日志记录器实例时，插桩范围由名称和版本对定义。
该实例创建的每个 Span、指标或日志记录都与提供的插桩范围关联。

在你的可观测性后端中，范围划分允许你按作用域对遥测数据进行多维度拆解分析。
例如，查看你的用户正在使用哪个版本的库以及该库版本的性能如何，或者将问题定位到应用程序的特定模块。

下图展示了一个具有多个插桩范围的链路。
不同的范围由不同的颜色表示：

- 顶部的 `/api/placeOrder` Span 由使用的 HTTP 框架生成。
- 绿色的 Span（`CheckoutService::placeOrder`、`prepareOrderItems` 和 `checkout`）是应用程序代码，按 `CheckoutService` 类分组。
- `CartService::getCart` 和 `ProductService::getProduct` 的 Span 也是应用程序代码，按 `CartService` 和 `ProductService` 类分组。
- 橙色（`Cache::find`）和浅蓝色（`DB::query`）的 Span 是库代码，按库名称和版本分组。

![此图展示了具有多个插桩范围的链路](spans-with-instrumentation-scope.svg)
