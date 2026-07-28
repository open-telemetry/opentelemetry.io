---
title: 各服务的链路覆盖范围
linkTitle: 链路覆盖范围
aliases: [trace_service_features, trace-features, ../trace-features]
default_lang_commit: 911b0a6b7752c125523a85fd2e58a49d1e459f34
drifted_from_default: true
---

| 服务            | 语言       | 插桩库 | 手动创建 Span | Span 数据增强 | RPC 上下文传播 | Span 链路 | Baggage | 资源检测 |
| --------------- | ---------- | ------ | ------------- | ------------- | -------------- | --------- | ------- | -------- |
| Accounting      | .NET       | ✅     | 🚧            | 🚧            | 🚧             | 🚧        | 🚧      | ✅       |
| Ad              | Java       | ✅     | ✅            | ✅            | 🔕             | 🔕        | 🔕      | 🚧       |
| Cart            | .NET       | ✅     | ✅            | ✅            | 🔕             | 🔕        | 🔕      | ✅       |
| Checkout        | Go         | ✅     | ✅            | ✅            | 🔕             | 🔕        | 🔕      | ✅       |
| Currency        | C++        | 🔕     | ✅            | ✅            | ✅             | 🔕        | 🔕      | 🚧       |
| Email           | Ruby       | ✅     | ✅            | ✅            | 🔕             | 🔕        | 🔕      | 🚧       |
| Flagd-ui        | TypeScript | ✅     | 🚧            | 🚧            | 🚧             | 🚧        | 🚧      | 🚧       |
| Fraud Detection | Kotlin     | ✅     | 🚧            | 🚧            | 🚧             | ✅        | 🚧      | 🚧       |
| Frontend        | TypeScript | ✅     | ✅            | ✅            | 🔕             | ✅        | ✅      | ✅       |
| Load Generator  | Python     | ✅     | 🚧            | 🚧            | 🚧             | 🚧        | 🚧      | 🚧       |
| Payment         | JavaScript | ✅     | ✅            | ✅            | 🔕             | 🔕        | ✅      | ✅       |
| Product Catalog | Go         | ✅     | 🔕            | ✅            | 🔕             | 🔕        | 🔕      | 🚧       |
| Product Reviews | Python     | ✅     | ✅            | ✅            | 🔕             | 🔕        | 🔕      | 🚧       |
| Quote Service   | PHP        | ✅     | ✅            | ✅            | 🔕             | 🔕        | 🔕      | 🚧       |
| Recommendation  | Python     | ✅     | ✅            | ✅            | 🔕             | 🔕        | 🔕      | 🚧       |
| Shipping        | Rust       | ✅     | ✅            | ✅            | ✅             | 🔕        | 🔕      | ✅       |

符号说明：

- 已完成：✅
- 不适用：🔕
- 尚未支持：🚧
