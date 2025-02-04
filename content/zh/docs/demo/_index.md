---
title: OpenTelemetry 演示文档
linkTitle: 演示
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: c2cd5b14
cSpell:ignore: OLJCESPC
---

欢迎使用 [OpenTelemetry 演示](/ecosystem/demo/)文档，
此文档介绍了如何安装和运行演示，以及一些可用来查看 OpenTelemetry 实际运行情况的场景。

## 运行演示

想要部署演示并查看其实际效果吗？从这里开始：

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## 语言特性参考

想要了解特定编程语言的工具是如何工作的？从这里开始：

| 语言       | 自动插桩                             | 插桩库                                                                                                      | 手动插桩                                                                   |
| ---------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| .NET       |                                      | [购物车服务](services/cart/)                                                                                | [购物车服务](services/cart/)                                               |
| C++        |                                      |                                                                                                             | [货币服务](services/currency/)                                             |
| Go         |                                      | [会计服务](services/accounting/)、[结账服务](services/checkout/)、[产品目录服务](services/product-catalog/) | [结账服务](services/checkout/)、 [产品目录服务](services/product-catalog/) |
| Java       | [广告服务](services/ad/)             |                                                                                                             | [广告服务](services/ad/)                                                   |
| JavaScript |                                      | [前端](services/frontend/)                                                                                  | [前端](services/frontend/)、[支付服务](services/payment/)                  |
| Kotlin     |                                      | [欺诈检测服务](services/fraud-detection/)                                                                   |                                                                            |
| PHP        |                                      | [报价服务](services/quote/)                                                                                 | [报价服务](services/quote/)                                                |
| Python     | [推荐服务](services/recommendation/) |                                                                                                             | [推荐服务](services/recommendation/)                                       |
| Ruby       |                                      | [电子邮件服务](services/email/)                                                                             | [电子邮件服务](services/email/)                                            |
| Rust       |                                      | [发货服务](services/shipping/)                                                                              | [发货服务](services/shipping/)                                             |

## 服务文档

有关如何在每个服务中部署 OpenTelemetry 的具体信息可以在此处找到：

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
- [图片提供商服务](services/image-provider/?i18n-patch)

## 应用场景

如何使用 OpenTelemetry 解决问题？这些场景将引导你解决一些预先配置的问题，
并向你展示如何解释 OpenTelemetry 数据来解决这些问题。

随着时间的推移，我们将添加更多场景：

- 使用功能标志服务为产品 ID 为 `OLJCESPC7Z` 的 `GetProduct` 请求生成[产品目录错误](feature-flags)
- 发现内存泄漏并使用指标和追踪对其进行诊断，[阅读更多](scenarios/recommendation-cache/)

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
