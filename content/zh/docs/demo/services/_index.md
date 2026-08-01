---
title: 服务列表
aliases: [service_table, service-table]
default_lang_commit: 6588437286e916c2eb44a721161ce46c21f1706b
drifted_from_default: true
---

要查看请求流程，参阅[服务架构图](../architecture/)。

| 服务名称                              | 编程语言      | 描述                                                                               |
| ------------------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| [accounting](accounting/)             | .NET          | 处理传入订单并计算所有订单的总金额（模拟服务）。                                   |
| [ad](ad/)                             | Java          | 根据给定的上下文关键词提供文字广告。                                               |
| [cart](cart/)                         | .NET          | 将用户购物车中的商品存储在 Valkey 中，并可检索这些商品。                           |
| [checkout](checkout/)                 | Go            | 获取用户购物车信息，准备订单，并协调付款、发货以及发送邮件通知的流程。             |
| [currency](currency/)                 | C++           | 将一种货币金额转换为另一种货币。使用从欧洲央行获取的实时汇率，是请求量最高的服务。 |
| [email](email/)                       | Ruby          | 向用户发送订单确认邮件（模拟服务）。                                               |
| [fraud-detection](fraud-detection/)   | Kotlin        | 分析传入订单并检测欺诈行为（模拟服务）。                                           |
| [frontend](frontend/)                 | TypeScript    | 提供一个 HTTP 服务器以服务网站页面。无需注册/登录，并会为所有用户自动生成会话 ID。 |
| [load-generator](load-generator/)     | Python/Locust | 持续向前端发送请求，模拟真实用户的购物流程。                                       |
| [payment](payment/)                   | JavaScript    | 使用提供的信用卡信息（模拟服务）扣款并返回交易 ID。                                |
| [product-catalog](product-catalog/)   | Go            | 从 JSON 文件中提供商品列表，并支持搜索商品及获取单个商品信息。                     |
| [quote](quote/)                       | PHP           | 根据需要配送的商品数量计算运费。                                                   |
| [recommendation](recommendation/)     | Python        | 根据购物车中的商品推荐其他商品。                                                   |
| [shipping](shipping/)                 | Rust          | 根据购物车内容估算运费，并将商品发往指定地址（模拟服务）。                         |
| [react-native-app](react-native-app/) | TypeScript    | 使用 React Native 构建的移动应用，为购物服务提供用户界面。                         |
