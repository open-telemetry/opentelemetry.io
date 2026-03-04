---
title: 功能标志
default_lang_commit: cb6352e01bcdbf8cc400aa663fa82d2835718e6e
aliases:
  - feature_flags
  - scenarios
  - services/feature-flag
  - services/featureflagservice
cSpell:ignore: L9ECAV7KIM loadgenerator OLJCESPC7Z
---

演示提供了几个功能标志，你可以使用它们来模拟不同的场景。
这些标志由 [`flagd`](https://flagd.dev) 管理，这是一个支持 [OpenFeature](https://openfeature.dev) 的简单功能标志服务。

在运行演示时，你可以通过位于 <http://localhost:8080/feature> 的用户界面更改标志值。
通过此用户界面更改的值将反映在 flagd 服务中。

通过用户界面更改功能标志有两种选择：

- **基本视图**：这是一款用户友好型视图，可针对每个功能标志选择并保存默认参数变体（对应原始配置文件中需修改的配置项）。
  目前基础视图不支持按比例定向。

- **高级视图**：这是一款可在浏览器中加载并编辑原始配置 JSON 文件的视图。
  该视图既保留了直接编辑原生 JSON 文件所具备的灵活度，同时还提供了 Schema 校验功能，
  确保 JSON 格式合法、配置参数取值准确无误。

## 已实现的功能标志 {#implemented-feature-flags}

| 功能标志                            | 服务            | 描述                                                                  |
| ----------------------------------- | --------------- | --------------------------------------------------------------------- |
| `adServiceFailure`                  | Ad              | 每 10 次调用 `GetAds` 生成一次错误                                    |
| `adServiceManualGc`                 | Ad              | 在广告服务中触发完整的手动垃圾回收                                    |
| `adServiceHighCpu`                  | Ad              | 在广告服务中触发高 CPU 负载。如果要演示 CPU 节流，请设置 CPU 资源限制 |
| `cartServiceFailure`                | Cart            | 调用 `EmptyCart` 时始终生成错误                                       |
| `emailMemoryLeak`                   | Email           | 在 `email` 服务中模拟内存泄漏。                                       |
| `llmInaccurateResponse`             | LLM             | 模拟 LLM 服务为产品 ID `L9ECAV7KIM` 返回不准确的产品评论摘要。        |
| `llmRateLimitError`                 | LLM             | 模拟 LLM 服务间歇性返回带 HTTP 状态码 429 的 RateLimitError。         |
| `productCatalogFailure`             | Product Catalog | 对产品 ID 为 `OLJCESPC7Z` 的 `GetProduct` 请求生成错误                |
| `recommendationServiceCacheFailure` | Recommendation  | 由于指数级增长的缓存而创建内存泄漏。1.4 倍增长，50% 的请求触发增长。  |
| `paymentServiceFailure`             | Payment         | 调用 `charge` 方法时生成错误。                                        |
| `paymentServiceUnreachable`         | Checkout        | 调用 PaymentService 时使用错误地址，使其看起来不可用。                |
| `loadgeneratorFloodHomepage`        | Load Generator  | 开始用大量请求淹没主页，可通过在状态上更改 flagd JSON 进行配置。      |
| `kafkaQueueProblems`                | Kafka           | 使 Kafka 队列过载，同时引入消费者端延迟导致滞后峰值。                 |
| `imageSlowLoad`                     | Frontend        | 利用 Envoy 故障注入，在前端加载产品图片时产生延迟。                   |

## 指导性调试场景 {#guided-debugging-scenario}

`recommendationServiceCacheFailure` 场景有一个[专门的演练文档](recommendation-cache/)。
可以帮助你了解如何使用 OpenTelemetry 调试内存泄漏。

## 功能标志架构 {#feature-flag-architecture}

有关 flagd 如何工作的更多信息，请参阅 [flagd 文档](https://flagd.dev)。
有关 OpenFeature 如何工作的更多信息以及 OpenFeature API 文档，请访问 [OpenFeature](https://openfeature.dev) 网站。
