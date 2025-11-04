---
title: Processors
description: List of available OpenTelemetry Collector processors
weight: 320
# prettier-ignore
cSpell:ignore: attributesprocessor batchprocessor coralogixprocessor cumulativetodeltaprocessor datadogsemanticsprocessor deltatocumulativeprocessor deltatorateprocessor dnslookupprocessor filterprocessor geoipprocessor groupbyattrsprocessor groupbytraceprocessor intervalprocessor isolationforestprocessor logdedupprocessor logstransformprocessor memorylimiterprocessor metricsgenerationprocessor metricstarttimeprocessor metricstransformprocessor probabilisticsamplerprocessor redactionprocessor remotetapprocessor resourcedetectionprocessor resourceprocessor sattributesprocessor schemaprocessor spanprocessor sumologicprocessor tailsamplingprocessor transformprocessor unrollprocessor xprocessor
---

Processors transform, filter, and enrich telemetry data as it flows through the
pipeline. For more information on how to configure processors, see the
[Collector configuration documentation](/docs/collector/configuration/#processors).

<!-- BEGIN GENERATED: processor-table -->

| Name                                                                                                                                                 | Distributions[^1]  | Traces[^2]  | Metrics[^2] | Logs[^2]    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------- | ----------- | ----------- |
| [attributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor)                     | contrib, core, K8s | beta        | beta        | beta        |
| [batchprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor)                                       | contrib, core, K8s | beta        | beta        | beta        |
| [coralogixprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/coralogixprocessor)                       | contrib            | alpha       | -           | -           |
| [cumulativetodeltaprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/cumulativetodeltaprocessor)       | contrib, K8s       | -           | beta        | -           |
| [datadogsemanticsprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/datadogsemanticsprocessor)         | contrib            | development | -           | -           |
| [deltatocumulativeprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/deltatocumulativeprocessor)       | contrib, K8s       | -           | alpha       | -           |
| [deltatorateprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/deltatorateprocessor)                   | contrib, K8s       | -           | alpha       | -           |
| [dnslookupprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/dnslookupprocessor)                       | contrib            | development | development | development |
| [filterprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)                             | contrib, core, K8s | alpha       | alpha       | alpha       |
| [geoipprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/geoipprocessor)                               | contrib            | alpha       | alpha       | alpha       |
| [groupbyattrsprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/groupbyattrsprocessor)                 | contrib, K8s       | beta        | beta        | beta        |
| [groupbytraceprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/groupbytraceprocessor)                 | contrib, K8s       | beta        | -           | -           |
| [intervalprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/intervalprocessor)                         | contrib, K8s       | -           | alpha       | -           |
| [isolationforestprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/isolationforestprocessor)           | contrib            | alpha       | alpha       | alpha       |
| [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)               | contrib, K8s       | beta        | beta        | beta        |
| [logdedupprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/logdedupprocessor)                         | contrib, K8s       | -           | -           | alpha       |
| [logstransformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/logstransformprocessor)               | contrib            | -           | -           | development |
| [memorylimiterprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/memorylimiterprocessor)                       | contrib, core, K8s | beta        | beta        | beta        |
| [metricsgenerationprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricsgenerationprocessor)       | contrib            | -           | alpha       | -           |
| [metricstarttimeprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstarttimeprocessor)           | contrib            | -           | beta        | -           |
| [metricstransformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)         | contrib, K8s       | -           | beta        | -           |
| [probabilisticsamplerprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/probabilisticsamplerprocessor) | contrib, core, K8s | beta        | -           | alpha       |
| [redactionprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)                       | contrib, K8s       | beta        | alpha       | alpha       |
| [remotetapprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/remotetapprocessor)                       | contrib, K8s       | alpha       | alpha       | alpha       |
| [resourcedetectionprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)       | contrib, K8s       | beta        | beta        | beta        |
| [resourceprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourceprocessor)                         | contrib, core, K8s | beta        | beta        | beta        |
| [schemaprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/schemaprocessor)                             | contrib            | development | development | development |
| [spanprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/spanprocessor)                                 | contrib, core      | alpha       | -           | -           |
| [sumologicprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/sumologicprocessor)                       | contrib            | beta        | beta        | beta        |
| [tailsamplingprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor)                 | contrib, K8s       | beta        | -           | -           |
| [transformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)                       | contrib, K8s       | beta        | beta        | beta        |
| [unrollprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/unrollprocessor)                             | contrib            | -           | -           | alpha       |

⚠️ **Note:** Components marked with ⚠️ are unmaintained and have no active
codeowners. They may not receive regular updates or bug fixes.

[^1]:
    Shows which [distributions](/docs/collector/distributions/) (core, contrib,
    K8s, etc.) include this component.

[^2]:
    For details about component stability levels, see the
    [OpenTelemetry Collector component stability definitions](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: processor-table -->
