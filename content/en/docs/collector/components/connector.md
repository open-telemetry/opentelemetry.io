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

{{< collector-component-rows type="connector" >}}

<!-- END GENERATED: connector-table SOURCE: scripts/collector-sync -->
