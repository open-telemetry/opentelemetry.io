---
title: Конектори
description: Список доступних конекторів OpenTelemetry Collector
weight: 340
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: countconnector datadogconnector exceptionsconnector failoverconnector forwardconnector grafanacloudconnector metricsaslogsconnector otlpjsonconnector roundrobinconnector routingconnector servicegraphconnector signaltometricsconnector slowsqlconnector spanmetricsconnector sumconnector
---

Конектори зʼєднують два конвеєри, виступаючи одночасно в ролі експортера та приймача. Докладнішу інформацію про налаштування конекторів див. у [документації з налаштування колектора](/docs/collector/configuration/#connectors).

<!-- BEGIN GENERATED: connector-table SOURCE: collector-watcher -->

| Назва                                                                                                                                      | Дистрибутив[^1]    |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| [countconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/countconnector)                     | contrib, K8s       |
| [datadogconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/datadogconnector)                 | contrib            |
| [exceptionsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/exceptionsconnector)           | contrib, K8s       |
| [failoverconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/failoverconnector)               | contrib, K8s       |
| [forwardconnector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/connector/forwardconnector)                         | contrib, core, K8s |
| [grafanacloudconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/grafanacloudconnector)       | contrib            |
| [metricsaslogsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/metricsaslogsconnector)     | contrib            |
| [otlpjsonconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/otlpjsonconnector)               | contrib, K8s       |
| [roundrobinconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/roundrobinconnector)           | contrib, K8s       |
| [routingconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/routingconnector)                 | contrib, K8s       |
| [servicegraphconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector)       | contrib, K8s       |
| [signaltometricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/signaltometricsconnector) | contrib            |
| [slowsqlconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/slowsqlconnector)                 | contrib            |
| [spanmetricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector)         | contrib            |
| [sumconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/sumconnector)                         | contrib            |

[^1]: Показує, які [дистрибутиви](/docs/collector/distributions/) (core, contrib, K8s тощо) містять цей компонент.

<!-- END GENERATED: connector-table SOURCE: collector-watcher -->
