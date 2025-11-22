---
title: Connectors
description: List of available OpenTelemetry Collector connectors
weight: 340
# prettier-ignore
cSpell:ignore: countconnector datadogconnector exceptionsconnector failoverconnector forwardconnector grafanacloudconnector otlpjsonconnector roundrobinconnector routingconnector servicegraphconnector signaltometricsconnector slowsqlconnector spanmetricsconnector sumconnector
---

Connectors connect two pipelines, acting as both exporter and receiver. For more
information on how to configure connectors, see the
[Collector configuration documentation](/docs/collector/configuration/#connectors).

<!-- BEGIN GENERATED: connector-table -->

| Name                                                                                                                                       | Distributions[^1]  |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| [countconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/countconnector)                     | contrib, K8s       |
| [datadogconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/datadogconnector)                 | contrib            |
| [exceptionsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/exceptionsconnector)           | contrib, K8s       |
| [failoverconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/failoverconnector)               | contrib, K8s       |
| [forwardconnector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/connector/forwardconnector)                         | contrib, core, K8s |
| [grafanacloudconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/grafanacloudconnector)       | contrib            |
| [otlpjsonconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/otlpjsonconnector)               | contrib, K8s       |
| [roundrobinconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/roundrobinconnector)           | contrib, K8s       |
| [routingconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/routingconnector)                 | contrib, K8s       |
| [servicegraphconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector)       | contrib, K8s       |
| [signaltometricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/signaltometricsconnector) | contrib            |
| [slowsqlconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/slowsqlconnector)                 | contrib            |
| [spanmetricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector)         | contrib            |
| [sumconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/sumconnector)                         | contrib            |

[^1]:
    Shows which [distributions](/docs/collector/distributions/) (core, contrib,
    K8s, etc.) include this component.

<!-- END GENERATED: connector-table -->
