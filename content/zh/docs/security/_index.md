---
title: 安全性
cascade:
  collector_vers: 0.131.0
weight: 970
default_lang_commit: f35b3300574b428f94dfeeca970d93c5a6ddbf35
drifted_from_default: true
---

在本节中，你将了解 OpenTelemetry 项目如何披露漏洞以及对安全事件的响应，以及如何安全地收集和传输可观测性数据。

## 常见漏洞与暴露（CVE） {#common-vulnerabilities-and-exposures-cves}

有关所有代码仓库中的 CVE，请参阅[常见漏洞与暴露](cve/)。

## 事件响应 {#incident-response}

了解如何报告漏洞，或查看社区如何处理安全事件，
请参阅[社区事件响应指南](security-response/)。

## Collector 安全性 {#collector-security}

在设置 OpenTelemetry Collector 时，请考虑在托管基础设施和 Collector
配置中同时实施安全最佳实践。运行安全的 Collector 有助于：

- 保护不应但可能包含敏感信息（例如可识别个人身份的信息、特定应用程序数据或网络流量模式）的遥测数据。
- 防止数据被篡改，从而保证遥测数据的可靠性，并避免对安全事件响应造成干扰。
- 遵守数据隐私和安全法规。
- 防御拒绝服务（DoS）攻击。

参阅[托管最佳实践](hosting-best-practices/)，了解如何保护 Collector 的基础设施安全。

参阅[配置最佳实践](config-best-practices/)，了解如何安全地配置 Collector。

对于 Collector 组件开发者，
请参阅[安全最佳实践](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)。
