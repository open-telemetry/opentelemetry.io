---
title: 文档
menu: { main: { weight: 10 } }
htmltest:
  IgnoreDirs:
    # TODO drop next lines after https://github.com/open-telemetry/opentelemetry.io/issues/5555 is fixed for these pages:
    - ^zh/docs/concepts/signals/baggage/
    - ^zh/docs/zero-code/php/
default_lang_commit: 6e35a949
---

OpenTelemetry 也被称为 OTel，是一个供应商中立的、开源的[可观测性](concepts/observability-primer/#what-is-observability)框架，
可用于插桩、生成、采集和导出[链路](concepts/signals/traces/)、
[指标](concepts/signals/metrics/)和[日志](concepts/signals/logs/)等遥测数据。

OpenTelemetry 作为一个行业标准，得到了 [40 多个可观测供应商的支持](/ecosystem/vendors/)，
被许多[代码库、服务和应用](/ecosystem/integrations/)集成，被[众多最终用户](/ecosystem/adopters/)采用。

![OpenTelemetry 基准架构](/img/otel-diagram.svg)
