---
title: OpenTelemetry 演示文档
linkTitle: 演示
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 2
cSpell:ignore: OLJCESPC
---

<!--
---
title: OpenTelemetry Demo Documentation
linkTitle: Demo
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 2
cSpell:ignore: OLJCESPC
---
-->

<!--
Welcome to the [OpenTelemetry Demo](/ecosystem/demo/) documentation, which
covers how to install and run the demo, and some scenarios you can use to view
OpenTelemetry in action.
-->
欢迎使用 [OpenTelemetry 演示](/ecosystem/demo/)文档，
此文档介绍了如何安装和运行演示，以及一些可用来查看 OpenTelemetry 实际运行情况的场景。

<!--
## Running the Demo

Want to deploy the demo and see it in action? Start here.
-->
## 运行演示

想要部署演示并查看其实际效果吗？从这里开始：

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

<!--
## Language Feature Reference

Want to understand how a particular language's instrumentation works? Start
here.
-->
## 语言特性参考

想要了解特定编程语言的工具是如何工作的？从这里开始：

<!--
| Language   | Automatic Instrumentation                          | Instrumentation Libraries                                                                                                                | Manual Instrumentation                                                                       |
| ---------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| .NET       |                                                    | [Cart Service](services/cart/)                                                                                                           | [Cart Service](services/cart/)                                                               |
| C++        |                                                    |                                                                                                                                          | [Currency Service](services/currency/)                                                       |
| Go         |                                                    | [Accounting Service](services/accounting/), [Checkout Service](services/checkout/), [Product Catalog Service](services/product-catalog/) | [Checkout Service](services/checkout/), [Product Catalog Service](services/product-catalog/) |
| Java       | [Ad Service](services/ad/)                         |                                                                                                                                          | [Ad Service](services/ad/)                                                                   |
| JavaScript |                                                    | [Frontend](services/frontend/)                                                                                                           | [Frontend](services/frontend/), [Payment Service](services/payment/)                         |
| Kotlin     |                                                    | [Fraud Detection Service](services/fraud-detection/)                                                                                     |                                                                                              |
| PHP        |                                                    | [Quote Service](services/quote/)                                                                                                         | [Quote Service](services/quote/)                                                             |
| Python     | [Recommendation Service](services/recommendation/) |                                                                                                                                          | [Recommendation Service](services/recommendation/)                                           |
| Ruby       |                                                    | [Email Service](services/email/)                                                                                                         | [Email Service](services/email/)                                                             |
| Rust       |                                                    | [Shipping Service](services/shipping/)                                                                                                   | [Shipping Service](services/shipping/)                                                       |
-->
| 语言        | 自动插桩            | 插桩库                 | 手动插桩                              |
| ---------- | ------------------- | -------------------- | ------------------------------------ |
| .NET       |                                                    | [购物车服务](services/cart/)                                                                                                              | [购物车服务](services/cart/)                                                                    |
| C++        |                                                    |                                                                                                                                          | [货币服务](services/currency/)                                                                |
| Go         |                                                    | [会计服务](services/accounting/)、[结账服务](services/checkout/)、[产品目录服务](services/product-catalog/)                                    | [结账服务](services/checkout/)、 [产品目录服务](services/product-catalog/)                      |
| Java       | [广告服务](services/ad/)                            |                                                                                                                                           | [广告服务](services/ad/)                                                                   |
| JavaScript |                                                    | [前端](services/frontend/)                                                                                                                 | [前端](services/frontend/)、[支付服务](services/payment/)                         |
| Kotlin     |                                                    | [欺诈检测服务](services/fraud-detection/)                                                                                                   |                                                                                              |
| PHP        |                                                    | [报价服务](services/quote/)                                                                                                                | [报价服务](services/quote/)                                                             |
| Python     | [推荐服务](services/recommendation/)                |                                                                                                                                          | [推荐服务](services/recommendation/)                                           |
| Ruby       |                                                    | [电子邮件服务](services/email/)                                                                                                            | [电子邮件服务](services/email/)                                                             |
| Rust       |                                                    | [发货服务](services/shipping/)                                                                                                            | [发货服务](services/shipping/)                                                       |

<!--
## Service Documentation

Specific information about how OpenTelemetry is deployed in each service can be
found here:
-->
## 服务文档

有关如何在每个服务中部署 OpenTelemetry 的具体信息可以在此处找到：

<!--
- [Ad Service](services/ad/)
- [Cart Service](services/cart/)
- [Checkout Service](services/checkout/)
- [Email Service](services/email/)
- [Frontend](services/frontend/)
- [Load Generator](services/load-generator/)
- [Payment Service](services/payment/)
- [Product Catalog Service](services/product-catalog/)
- [Quote Service](services/quote/)
- [Recommendation Service](services/recommendation/)
- [Shipping Service](services/shipping/)
- [Image Provider Service](services/imageprovider/)
-->
- [广告服务](services/ad/)
- [购物车服务](services/cart/)
- [结账服务](services/checkout/)
- [电子邮箱服务](services/email/)
- [前端](services/frontend/)
- [负载生成器](services/load-generator/)
- [支付服务](services/payment/)
- [产品目录服务](services/product-catalog/)
- [报价服务](services/quote/)
- [推荐服务](services/recommendation/)
- [发货服务](services/shipping/)
- [图片提供商服务](services/imageprovider/)

<!--
## Scenarios

How can you solve problems with OpenTelemetry? These scenarios walk you through
some pre-configured problems and show you how to interpret OpenTelemetry data to
solve them.

We'll be adding more scenarios over time.

- Generate a [Product Catalog error](feature-flags) for `GetProduct` requests
  with product id: `OLJCESPC7Z` using the Feature Flag service
- Discover a memory leak and diagnose it using metrics and traces.
  [Read more](scenarios/recommendation-cache/)
-->
## 应用场景

如何使用 OpenTelemetry 解决问题？这些场景将引导你解决一些预先配置的问题，
并向你展示如何解释 OpenTelemetry 数据来解决这些问题。

随着时间的推移，我们将添加更多场景：

- 使用功能标志服务为产品 ID 为 `OLJCESPC7Z` 的 `GetProduct` 请求生成[产品目录错误](feature-flags)
- 发现内存泄漏并使用指标和追踪对其进行诊断，[阅读更多](scenarios/recommendation-cache/)

<!--
## Reference

Project reference documentation, like requirements and feature matrices.

- [Architecture](architecture/)
- [Development](development/)
- [Feature Flags Reference](feature-flags/)
- [Metric Feature Matrix](telemetry-features/metric-coverage/)
- [Requirements](./requirements/)
- [Screenshots](screenshots/)
- [Services](services/)
- [Span Attributes Reference](telemetry-features/manual-span-attributes/)
- [Tests](tests/)
- [Trace Feature Matrix](telemetry-features/trace-coverage/)
-->
## 参考

项目参考文档，例如需求和功能矩阵：

- [架构](architecture/)
- [开发](development/)
- [功能标志参考](feature-flags/)
- [指标功能矩阵](telemetry-features/metric-coverage/)
- [要求](./requirements/)
- [截图](screenshots/)
- [服务](services/)
- [Span 属性参考](telemetry-features/manual-span-attributes/)
- [测试](tests/)
- [Trace 功能矩阵](telemetry-features/trace-coverage/)
