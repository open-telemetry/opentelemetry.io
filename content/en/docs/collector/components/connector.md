---
title: Connectors
description: List of available OpenTelemetry Collector connectors
weight: 340
# prettier-ignore
cSpell:ignore: countconnector datadogconnector exceptionsconnector failoverconnector forwardconnector grafanacloudconnector otlpjsonconnector roundrobinconnector routingconnector servicegraphconnector signaltometricsconnector spanmetricsconnector sumconnector
---

Connectors connect two pipelines, acting as both exporter and receiver. For more
information on how to configure connectors, see the
[Collector configuration documentation](/docs/collector/configuration/#connectors).

<!-- BEGIN GENERATED: connector-table -->

| Name                                                                                                                                       | Distributions[^1]  | Traces[^2] | Metrics[^2] | Logs[^2] |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ---------- | ----------- | -------- |
| [countconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/countconnector)                     | contrib, k8s       | -          | -           | -        |
| [datadogconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/datadogconnector)                 | contrib            | -          | -           | -        |
| [exceptionsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/exceptionsconnector)           | contrib, k8s       | -          | -           | -        |
| [failoverconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/failoverconnector)               | contrib, k8s       | -          | -           | -        |
| [forwardconnector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/connector/forwardconnector)                         | contrib, core, k8s | -          | -           | -        |
| [grafanacloudconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/grafanacloudconnector)       | contrib            | -          | -           | -        |
| [otlpjsonconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/otlpjsonconnector)               | contrib, k8s       | -          | -           | -        |
| [roundrobinconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/roundrobinconnector)           | contrib, k8s       | -          | -           | -        |
| [routingconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/routingconnector)                 | contrib, k8s       | -          | -           | -        |
| [servicegraphconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector)       | contrib, k8s       | -          | -           | -        |
| [signaltometricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/signaltometricsconnector) | contrib            | -          | -           | -        |
| [spanmetricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector)         | contrib            | -          | -           | -        |
| [sumconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/sumconnector)                         | contrib            | -          | -           | -        |

[^1]:
    Shows which distributions (core, contrib, k8s, etc.) include this component.

[^2]:
    For details about component stability levels, see the
    [OpenTelemetry Collector component stability definitions](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: connector-table -->
