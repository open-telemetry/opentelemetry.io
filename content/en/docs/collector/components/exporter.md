---
title: Exporters
description: List of available OpenTelemetry Collector exporters
weight: 330
# prettier-ignore
cSpell:ignore: alertmanagerexporter alibabacloudlogserviceexporter awscloudwatchlogsexporter awsemfexporter awskinesisexporter awss awsxrayexporter azureblobexporter azuredataexplorerexporter azuremonitorexporter bmchelixexporter carbonexporter cassandraexporter clickhouseexporter coralogixexporter datadogexporter datasetexporter debugexporter dorisexporter elasticsearchexporter faroexporter fileexporter googlecloudexporter googlecloudpubsubexporter googlecloudstorageexporter googlemanagedprometheusexporter honeycombmarkerexporter influxdbexporter kafkaexporter loadbalancingexporter logicmonitorexporter logzioexporter mezmoexporter nopexporter opensearchexporter otelarrowexporter otlpexporter otlphttpexporter prometheusexporter prometheusremotewriteexporter pulsarexporter rabbitmqexporter sapmexporter sematextexporter sentryexporter signalfxexporter splunkhecexporter stefexporter sumologicexporter syslogexporter tencentcloudlogserviceexporter tinybirdexporter xexporter zipkinexporter
---

Exporters send telemetry data to observability backends and destinations. For
more information on how to configure exporters, see the
[Collector configuration documentation](/docs/collector/configuration/#exporters).

<!-- BEGIN GENERATED: exporter-table -->

| Name                                                                                                                                                    | Distributions[^1]        | Traces[^2]  | Metrics[^2]  | Logs[^2]    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------- | ------------ | ----------- |
| [alertmanagerexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/alertmanagerexporter)                       | contrib                  | development | -            | -           |
| [alibabacloudlogserviceexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/alibabacloudlogserviceexporter)   | contrib                  | beta        | beta         | beta        |
| [awscloudwatchlogsexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awscloudwatchlogsexporter)             | contrib                  | -           | -            | alpha       |
| [awsemfexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awsemfexporter)                                   | contrib                  | -           | beta         | -           |
| [awskinesisexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awskinesisexporter)                           | contrib                  | beta        | beta         | beta        |
| [awss3exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awss3exporter)                                     | contrib                  | alpha       | alpha        | alpha       |
| [awsxrayexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awsxrayexporter)                                 | contrib                  | beta        | -            | -           |
| [azureblobexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/azureblobexporter)                             | contrib                  | alpha       | alpha        | alpha       |
| [azuredataexplorerexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/azuredataexplorerexporter)             | contrib                  | beta        | beta         | beta        |
| [azuremonitorexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/azuremonitorexporter)                       | contrib                  | beta        | beta         | beta        |
| [bmchelixexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/bmchelixexporter)                               | contrib                  | -           | alpha        | -           |
| [carbonexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/carbonexporter) ⚠️                                | contrib                  | -           | unmaintained | -           |
| [cassandraexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/cassandraexporter)                             | contrib                  | alpha       | -            | alpha       |
| [clickhouseexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)                           | contrib                  | beta        | alpha        | beta        |
| [coralogixexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/coralogixexporter)                             | contrib                  | beta        | beta         | beta        |
| [datadogexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/datadogexporter)                                 | contrib                  | beta        | beta         | beta        |
| [datasetexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/datasetexporter)                                 | contrib                  | alpha       | -            | alpha       |
| [debugexporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/debugexporter)                                             | contrib, core, K8s       | alpha       | alpha        | alpha       |
| [dorisexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/dorisexporter)                                     | contrib                  | alpha       | alpha        | alpha       |
| [elasticsearchexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/elasticsearchexporter)                     | contrib                  | beta        | development  | beta        |
| [faroexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/faroexporter)                                       | contrib                  | alpha       | -            | alpha       |
| [fileexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/fileexporter)                                       | contrib, core, K8s       | alpha       | alpha        | alpha       |
| [googlecloudexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/googlecloudexporter)                         | contrib                  | beta        | beta         | beta        |
| [googlecloudpubsubexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/googlecloudpubsubexporter)             | contrib                  | beta        | beta         | beta        |
| [googlecloudstorageexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/googlecloudstorageexporter)           | contrib                  | -           | -            | alpha       |
| [googlemanagedprometheusexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/googlemanagedprometheusexporter) | contrib                  | -           | beta         | -           |
| [honeycombmarkerexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/honeycombmarkerexporter)                 | contrib                  | -           | -            | alpha       |
| [influxdbexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/influxdbexporter)                               | contrib                  | beta        | beta         | beta        |
| [kafkaexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/kafkaexporter)                                     | contrib, core            | beta        | beta         | beta        |
| [loadbalancingexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter)                     | contrib, K8s             | beta        | development  | beta        |
| [logicmonitorexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/logicmonitorexporter)                       | contrib                  | alpha       | -            | alpha       |
| [logzioexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/logzioexporter)                                   | contrib                  | beta        | -            | beta        |
| [mezmoexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/mezmoexporter)                                     | contrib                  | -           | -            | beta        |
| [nopexporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/nopexporter)                                                 | contrib, core, K8s       | beta        | beta         | beta        |
| [opensearchexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/opensearchexporter)                           | contrib                  | alpha       | -            | alpha       |
| [otelarrowexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/otelarrowexporter)                             | contrib, K8s             | beta        | beta         | beta        |
| [otlpexporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter)                                               | contrib, core, K8s, otlp | stable      | stable       | stable      |
| [otlphttpexporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlphttpexporter)                                       | contrib, core, K8s, otlp | stable      | stable       | stable      |
| [prometheusexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusexporter)                           | contrib, core            | -           | beta         | -           |
| [prometheusremotewriteexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusremotewriteexporter)     | contrib, core            | -           | beta         | -           |
| [pulsarexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/pulsarexporter)                                   | contrib                  | alpha       | alpha        | alpha       |
| [rabbitmqexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/rabbitmqexporter)                               | contrib                  | alpha       | alpha        | alpha       |
| [sapmexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sapmexporter)                                       | contrib                  | deprecated  | -            | -           |
| [sematextexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sematextexporter)                               | contrib                  | -           | development  | development |
| [sentryexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sentryexporter)                                   | contrib                  | beta        | -            | -           |
| [signalfxexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/signalfxexporter)                               | contrib                  | beta        | beta         | beta        |
| [splunkhecexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/splunkhecexporter)                             | contrib                  | beta        | beta         | beta        |
| [stefexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/stefexporter)                                       | contrib                  | -           | alpha        | -           |
| [sumologicexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sumologicexporter)                             | contrib                  | beta        | beta         | beta        |
| [syslogexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/syslogexporter)                                   | contrib                  | -           | -            | alpha       |
| [tencentcloudlogserviceexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/tencentcloudlogserviceexporter)   | contrib                  | -           | -            | beta        |
| [tinybirdexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/tinybirdexporter)                               | contrib                  | alpha       | alpha        | alpha       |
| [zipkinexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/zipkinexporter)                                   | contrib, core            | beta        | -            | -           |

⚠️ **Note:** Components marked with ⚠️ are unmaintained and have no active
codeowners. They may not receive regular updates or bug fixes.

[^1]:
    Shows which [distributions](/docs/collector/distributions/) (core, contrib,
    K8s, etc.) include this component.

[^2]:
    For details about component stability levels, see the
    [OpenTelemetry Collector component stability definitions](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: exporter-table -->
