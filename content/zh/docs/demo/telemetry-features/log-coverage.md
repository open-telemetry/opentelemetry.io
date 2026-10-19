---
title: 各服务的日志覆盖情况
linkTitle: 日志覆盖
aliases: [log_service_features, logging-features, ../logging-features]
default_lang_commit: 911b0a6b7752c125523a85fd2e58a49d1e459f34
drifted_from_default: true
---

| 服务            | 语言       | OTLP 日志 |
| --------------- | ---------- | --------- |
| Accounting      | .NET       | ✅        |
| Ad              | Java       | ✅        |
| Cart            | .NET       | ✅        |
| Checkout        | Go         | 🚧        |
| Currency        | C++        | ✅        |
| Email           | Ruby       | 🚧        |
| Flagd           | Go         | 🚧        |
| Flagd-ui        | TypeScript | 🚧        |
| Fraud Detection | Kotlin     | ✅        |
| Frontend        | TypeScript | 🚧        |
| Frontend Proxy  | Envoy      | ✅        |
| Image Provider  | NGINX      | 🚧        |
| Load Generator  | Python     | ✅        |
| Payment         | JavaScript | 🚧        |
| Product Catalog | Go         | 🚧        |
| Product Reviews | Python     | ✅        |
| Quote           | PHP        | ✅        |
| Recommendation  | Python     | ✅        |
| Shipping        | Rust       | ✅        |

符号说明：

- 已完成：✅
- 不适用：🔕
- 尚未支持：🚧
