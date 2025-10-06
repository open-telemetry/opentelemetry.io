---
title: Processors
description: List of available OpenTelemetry Collector processors
weight: 320
---

Processors transform, filter, and enrich telemetry data as it flows through the pipeline.

## Core Distribution

Components from the [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) core distribution.

The **Traces**, **Metrics**, and **Logs** columns show the stability level for each signal type.

| Name | Traces | Metrics | Logs |
|------|--------|---------|------|
| [batchprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) | beta | beta | beta |
| [memorylimiterprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/memorylimiterprocessor) | beta | beta | beta |
| [xprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/xprocessor) | - | - | - |

## Contrib Distribution

Components from the [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) distribution.

The **Traces**, **Metrics**, and **Logs** columns show the stability level for each signal type.

| Name | Traces | Metrics | Logs |
|------|--------|---------|------|
| [attributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor) | beta | beta | beta |
| [coralogixprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/coralogixprocessor) | alpha | - | - |
| [cumulativetodeltaprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/cumulativetodeltaprocessor) | - | beta | - |
| [datadogsemanticsprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/datadogsemanticsprocessor) | development | - | - |
| [deltatocumulativeprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/deltatocumulativeprocessor) | - | alpha | - |
| [deltatorateprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/deltatorateprocessor) | - | alpha | - |
| [dnslookupprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/dnslookupprocessor) | development | development | development |
| [filterprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor) | alpha | alpha | alpha |
| [geoipprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/geoipprocessor) | alpha | alpha | alpha |
| [groupbyattrsprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/groupbyattrsprocessor) | beta | beta | beta |
| [groupbytraceprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/groupbytraceprocessor) | beta | - | - |
| [intervalprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/intervalprocessor) | - | alpha | - |
| [isolationforestprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/isolationforestprocessor) | alpha | alpha | alpha |
| [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) | beta | beta | beta |
| [logdedupprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/logdedupprocessor) | - | - | alpha |
| [logstransformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/logstransformprocessor) | - | - | development |
| [metricsgenerationprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricsgenerationprocessor) | - | alpha | - |
| [metricstarttimeprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstarttimeprocessor) | - | alpha | - |
| [metricstransformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor) | - | beta | - |
| [probabilisticsamplerprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/probabilisticsamplerprocessor) | beta | - | alpha |
| [redactionprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor) | beta | alpha | alpha |
| [remotetapprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/remotetapprocessor) | alpha | alpha | alpha |
| [resourcedetectionprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor) | beta | beta | beta |
| [resourceprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourceprocessor) | beta | beta | beta |
| [schemaprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/schemaprocessor) | development | development | development |
| [spanprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/spanprocessor) | alpha | - | - |
| [sumologicprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/sumologicprocessor) | beta | beta | beta |
| [tailsamplingprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor) | beta | - | - |
| [transformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor) | beta | beta | beta |
| [unrollprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/unrollprocessor) | - | - | alpha |
