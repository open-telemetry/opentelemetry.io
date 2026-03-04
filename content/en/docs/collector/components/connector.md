---
title: Connectors
description: List of available OpenTelemetry Collector connectors
weight: 340
# prettier-ignore
cSpell:ignore: countconnector datadogconnector exceptionsconnector failoverconnector forwardconnector grafanacloudconnector metricsaslogsconnector otlpjsonconnector roundrobinconnector routingconnector servicegraphconnector signaltometricsconnector slowsqlconnector spanmetricsconnector sumconnector
---

Connectors connect two pipelines, acting as both exporter and receiver. For more
information on how to configure connectors, see the
[Collector configuration documentation](/docs/collector/configuration/#connectors).

<!-- BEGIN GENERATED: connector-table SOURCE: scripts/collector-sync -->

| Name                                                                                   | Distributions[^1]  |
| -------------------------------------------------------------------------------------- | ------------------ |
| {{< component-link name="countconnector" type="connector" repo="contrib" >}}           | contrib, K8s       |
| {{< component-link name="datadogconnector" type="connector" repo="contrib" >}}         | contrib            |
| {{< component-link name="exceptionsconnector" type="connector" repo="contrib" >}}      | contrib, K8s       |
| {{< component-link name="failoverconnector" type="connector" repo="contrib" >}}        | contrib, K8s       |
| {{< component-link name="forwardconnector" type="connector" repo="core" >}}            | contrib, core, K8s |
| {{< component-link name="grafanacloudconnector" type="connector" repo="contrib" >}}    | contrib            |
| {{< component-link name="metricsaslogsconnector" type="connector" repo="contrib" >}}   | contrib            |
| {{< component-link name="otlpjsonconnector" type="connector" repo="contrib" >}}        | contrib, K8s       |
| {{< component-link name="roundrobinconnector" type="connector" repo="contrib" >}}      | contrib, K8s       |
| {{< component-link name="routingconnector" type="connector" repo="contrib" >}}         | contrib, K8s       |
| {{< component-link name="servicegraphconnector" type="connector" repo="contrib" >}}    | contrib, K8s       |
| {{< component-link name="signaltometricsconnector" type="connector" repo="contrib" >}} | contrib            |
| {{< component-link name="slowsqlconnector" type="connector" repo="contrib" >}}         | contrib            |
| {{< component-link name="spanmetricsconnector" type="connector" repo="contrib" >}}     | contrib            |
| {{< component-link name="sumconnector" type="connector" repo="contrib" >}}             | contrib            |

[^1]:
    Shows which [distributions](/docs/collector/distributions/) (core, contrib,
    K8s, etc.) include this component.

<!-- END GENERATED: connector-table SOURCE: scripts/collector-sync -->
