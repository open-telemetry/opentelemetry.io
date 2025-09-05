---
title: 部署
description: 部署 OpenTelemetry Collector 可使用的模式
weight: 3
default_lang_commit: 82dc25ce2cc1c6b3b2bde68b5d25bd58e5ac49b3
---

OpenTelemetry Collector 由单一的可执行文件组成，你可以根据不同的用途以不同的方式使用。
本节介绍了部署模式、各模式的使用场景以及优缺点，并提供了适用于跨环境和多后端部署的 Collector
配置最佳实践。有关部署安全方面的注意事项，请参阅 [Collector 托管最佳实践][security]。

## 资源 {#resources}

- KubeCon NA 2021 关于 [OpenTelemetry Collector 部署模式][y-patterns] 的演讲
- 与演讲配套的[部署模式][gh-patterns]

[security]: /docs/security/hosting-best-practices/
[gh-patterns]: https://github.com/jpkrohling/opentelemetry-collector-deployment-patterns/
[y-patterns]: https://www.youtube.com/watch?v=WhRrwSHDBFs
