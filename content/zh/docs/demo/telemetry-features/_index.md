---
title: 遥测特性
linkTitle: 遥测特性
aliases: [demo_features, features]
default_lang_commit: 911b0a6b7752c125523a85fd2e58a49d1e459f34
---

## OpenTelemetry

- **[OpenTelemetry 链路](/docs/concepts/signals/traces/)**：所有服务均使用 OpenTelemetry 提供的现成插桩库进行插桩。
- **[OpenTelemetry 指标](/docs/concepts/signals/metrics/)**：部分服务使用 OpenTelemetry
  提供的现成插桩库进行插桩。随着相关 SDK 的发布，将逐步覆盖更多服务。
- **[OpenTelemetry 日志](/docs/concepts/signals/logs/)**：部分服务使用 OpenTelemetry
  提供的现成插桩库进行了日志插桩。随着相关 SDK 的发布，将逐步覆盖更多服务。
- **[OpenTelemetry Collector](/docs/collector/)**：所有服务均已完成插桩，并通过 gRPC 将生成的链路和指标发送到
  OpenTelemetry Collector。接收到的链路数据会被导出到日志系统和 Jaeger；
  接收到的指标和示例会被导出到日志系统和 Prometheus。

## 可观测方案

- **[Grafana](https://grafana.com/)**：所有指标仪表盘均存储并展示在 Grafana 中。
- **[Jaeger](https://www.jaegertracing.io/)**：所有生成的链路数据都会发送到 Jaeger。
- **[OpenSearch](https://opensearch.org/)**：所有生成的日志都会发送到 Data Prepper。
  OpenSearch 用于集中管理来自各个服务的日志数据。
- **[Prometheus](https://prometheus.io/)**：所有生成的指标和示例都由 Prometheus 进行抓取。

## 运行环境

- **[Docker](https://docs.docker.com)**：这个样例分支可以通过 Docker 运行。
- **[Kubernetes](https://kubernetes.io/)**：应用被设计为运行在 Kubernetes
  上（既支持本地环境，也支持云环境），并通过 Helm Chart 进行部署。

## 通信协议

- **[gRPC](https://grpc.io/)**：微服务之间通过大量的 gRPC 调用进行通信。
- **[HTTP](https://www.rfc-editor.org/rfc/rfc9110.html)**：在 gRPC 不可用或支持不佳的场景下，微服务会使用 HTTP。

## 其他组件

- **[Envoy](https://www.envoyproxy.io/)**：Envoy 作为反向代理，用于面向用户的 Web
  界面，例如前端、负载生成器以及特性开关服务。
- **[Locust](https://locust.io)**：一个后台任务，使用合成负载生成器在网站上模拟真实的用户访问与使用模式。
- **[OpenFeature](https://openfeature.dev)**：一个特性开关 API 与 SDK，用于在应用中启用或禁用特性。
- **[flagd](https://flagd.dev)**：一个特性开关守护进程，用于在示例应用中管理特性开关。
- **[llm](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/llm/)**：
  一个模拟的大语言模型（LLM），遵循
  [OpenAI 的 Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create)
  格式，用于回答与产品相关的问题。
