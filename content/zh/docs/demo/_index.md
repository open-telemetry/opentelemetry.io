---
title: OpenTelemetry 演示文档
linkTitle: 演示
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: c2cd5b14 # patched
drifted_from_default: true
---

欢迎使用 [OpenTelemetry 演示](/ecosystem/demo/)文档，
此文档介绍了如何安装和运行演示，以及一些可用来查看 OpenTelemetry 实际运行情况的场景。

## 运行演示 {#running-the-demo}

想要部署演示并查看其实际效果吗？从这里开始：

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## 语言特性参考 {#language-feature-reference}

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

## 服务文档 {#service-documentation}

有关如何在每个服务中部署 OpenTelemetry 的具体信息可以在此处找到：

- [记账服务](services/accounting/)
- [广告服务](services/ad/)
- [购物车服务](services/cart/)
- [结算服务](services/checkout/)
- [电子邮件服务](services/email/)
- [前端服务](services/frontend/)
- [负载生成器](services/load-generator/)
- [支付服务](services/payment/)
- [产品目录服务](services/product-catalog/)
- [报价服务](services/quote/)
- [推荐服务](services/recommendation/)
- [物流服务](services/shipping/)
- [图像提供服务](services/image-provider/)
- [React 原生应用](services/react-native-app/)

## 应用场景 {#feature-flag-scenarios}

如何使用 OpenTelemetry 解决问题？这些场景将引导你解决一些预先配置的问题，
并向你展示如何解释 OpenTelemetry 数据来解决这些问题。

## 参考资料 {#reference}

项目的参考文档，包括需求和功能矩阵等内容：

- [架构](architecture/)
- [开发](development/)
- [特性开关参考](feature-flags/)
- [指标功能矩阵](telemetry-features/metric-coverage/)
- [需求说明](./requirements/)
- [截图](screenshots/)
- [服务](services/)
- [Span 属性参考](telemetry-features/manual-span-attributes/)
- [测试](tests/)
- [链路追踪功能矩阵](telemetry-features/trace-coverage/)
