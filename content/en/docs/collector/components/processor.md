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

{{< collector-component-rows type="processor" >}}
