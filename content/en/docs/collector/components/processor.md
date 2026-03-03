---
title: Processors
description: List of available OpenTelemetry Collector processors
weight: 320
# prettier-ignore
cSpell:ignore: attributesprocessor batchprocessor coralogixprocessor cumulativetodeltaprocessor datadogsemanticsprocessor deltatocumulativeprocessor deltatorateprocessor dnslookupprocessor filterprocessor geoipprocessor groupbyattrsprocessor groupbytraceprocessor intervalprocessor isolationforestprocessor logdedupprocessor logstransformprocessor lookupprocessor memorylimiterprocessor metricsgenerationprocessor metricstarttimeprocessor metricstransformprocessor probabilisticsamplerprocessor redactionprocessor remotetapprocessor resourcedetectionprocessor resourceprocessor sattributesprocessor schemaprocessor spanprocessor sumologicprocessor tailsamplingprocessor transformprocessor unrollprocessor xprocessor
---

Processors transform, filter, and enrich telemetry data as it flows through the
pipeline. For more information on how to configure processors, see the
[Collector configuration documentation](/docs/collector/configuration/#processors).

<!-- BEGIN GENERATED: processor-table SOURCE: scripts/collector-sync -->

| Name                                                                                        | Distributions[^1]  | Traces[^2]  | Metrics[^2] | Logs[^2]    |
| ------------------------------------------------------------------------------------------- | ------------------ | ----------- | ----------- | ----------- |
| {{< component-link name="attributesprocessor" type="processor" repo="contrib" >}}           | contrib, core, K8s | beta        | beta        | beta        |
| {{< component-link name="batchprocessor" type="processor" repo="core" >}}                   | contrib, core, K8s | beta        | beta        | beta        |
| {{< component-link name="coralogixprocessor" type="processor" repo="contrib" >}}            | contrib            | alpha       | -           | -           |
| {{< component-link name="cumulativetodeltaprocessor" type="processor" repo="contrib" >}}    | contrib, K8s       | -           | beta        | -           |
| {{< component-link name="datadogsemanticsprocessor" type="processor" repo="contrib" >}}     | contrib            | deprecated  | -           | -           |
| {{< component-link name="deltatocumulativeprocessor" type="processor" repo="contrib" >}}    | contrib, K8s       | -           | alpha       | -           |
| {{< component-link name="deltatorateprocessor" type="processor" repo="contrib" >}}          | contrib, K8s       | -           | alpha       | -           |
| {{< component-link name="dnslookupprocessor" type="processor" repo="contrib" >}}            | contrib            | development | development | development |
| {{< component-link name="filterprocessor" type="processor" repo="contrib" >}}               | contrib, core, K8s | alpha       | alpha       | alpha       |
| {{< component-link name="geoipprocessor" type="processor" repo="contrib" >}}                | contrib            | alpha       | alpha       | alpha       |
| {{< component-link name="groupbyattrsprocessor" type="processor" repo="contrib" >}}         | contrib, K8s       | beta        | beta        | beta        |
| {{< component-link name="groupbytraceprocessor" type="processor" repo="contrib" >}}         | contrib, K8s       | beta        | -           | -           |
| {{< component-link name="intervalprocessor" type="processor" repo="contrib" >}}             | contrib, K8s       | -           | alpha       | -           |
| {{< component-link name="isolationforestprocessor" type="processor" repo="contrib" >}}      | contrib            | alpha       | alpha       | alpha       |
| {{< component-link name="k8sattributesprocessor" type="processor" repo="contrib" >}}        | contrib, K8s       | beta        | beta        | beta        |
| {{< component-link name="logdedupprocessor" type="processor" repo="contrib" >}}             | contrib, K8s       | -           | -           | alpha       |
| {{< component-link name="logstransformprocessor" type="processor" repo="contrib" >}}        | contrib            | -           | -           | development |
| {{< component-link name="lookupprocessor" type="processor" repo="contrib" >}}               | contrib            | -           | -           | development |
| {{< component-link name="memorylimiterprocessor" type="processor" repo="core" >}}           | contrib, core, K8s | beta        | beta        | beta        |
| {{< component-link name="metricsgenerationprocessor" type="processor" repo="contrib" >}}    | contrib            | -           | alpha       | -           |
| {{< component-link name="metricstarttimeprocessor" type="processor" repo="contrib" >}}      | contrib            | -           | beta        | -           |
| {{< component-link name="metricstransformprocessor" type="processor" repo="contrib" >}}     | contrib, K8s       | -           | beta        | -           |
| {{< component-link name="probabilisticsamplerprocessor" type="processor" repo="contrib" >}} | contrib, core, K8s | beta        | -           | alpha       |
| {{< component-link name="redactionprocessor" type="processor" repo="contrib" >}}            | contrib, K8s       | beta        | alpha       | alpha       |
| {{< component-link name="remotetapprocessor" type="processor" repo="contrib" >}}            | contrib, K8s       | alpha       | alpha       | alpha       |
| {{< component-link name="resourcedetectionprocessor" type="processor" repo="contrib" >}}    | contrib, K8s       | beta        | beta        | beta        |
| {{< component-link name="resourceprocessor" type="processor" repo="contrib" >}}             | contrib, core, K8s | beta        | beta        | beta        |
| {{< component-link name="schemaprocessor" type="processor" repo="contrib" >}}               | contrib            | development | development | development |
| {{< component-link name="spanprocessor" type="processor" repo="contrib" >}}                 | contrib, core      | alpha       | -           | -           |
| {{< component-link name="sumologicprocessor" type="processor" repo="contrib" >}}            | contrib            | beta        | beta        | beta        |
| {{< component-link name="tailsamplingprocessor" type="processor" repo="contrib" >}}         | contrib, K8s       | beta        | -           | -           |
| {{< component-link name="transformprocessor" type="processor" repo="contrib" >}}            | contrib, K8s       | beta        | beta        | beta        |
| {{< component-link name="unrollprocessor" type="processor" repo="contrib" >}}               | contrib            | -           | -           | alpha       |

[^1]:
    Shows which [distributions](/docs/collector/distributions/) (core, contrib,
    K8s, etc.) include this component.

[^2]:
    For details about component stability levels, see the
    [OpenTelemetry Collector component stability definitions](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: processor-table SOURCE: scripts/collector-sync -->
