---
title: Exporters
description: List of available OpenTelemetry Collector exporters
weight: 330
# prettier-ignore
cSpell:ignore: alertmanagerexporter alibabacloudlogserviceexporter awscloudwatchlogsexporter awsemfexporter awskinesisexporter awss awsxrayexporter azureblobexporter azuredataexplorerexporter azuremonitorexporter bmchelixexporter cassandraexporter clickhouseexporter coralogixexporter datadogexporter datasetexporter debugexporter dorisexporter elasticsearchexporter faroexporter fileexporter googlecloudexporter googlecloudpubsubexporter googlecloudstorageexporter googlemanagedprometheusexporter honeycombmarkerexporter influxdbexporter kafkaexporter loadbalancingexporter logicmonitorexporter logzioexporter mezmoexporter nopexporter opensearchexporter otelarrowexporter otlpexporter otlphttpexporter prometheusexporter prometheusremotewriteexporter pulsarexporter rabbitmqexporter sapmexporter sematextexporter sentryexporter signalfxexporter splunkhecexporter stefexporter sumologicexporter syslogexporter tencentcloudlogserviceexporter tinybirdexporter xexporter zipkinexporter
---

Exporters send telemetry data to observability backends and destinations. For
more information on how to configure exporters, see the
[Collector configuration documentation](/docs/collector/configuration/#exporters).

{{% include unmaintained-components-msg.md %}}

<!-- BEGIN GENERATED: exporter-table SOURCE: scripts/collector-sync -->

| Name                                                                                           | Distributions[^1]        | Traces[^2]   | Metrics[^2]  | Logs[^2]     |
| ---------------------------------------------------------------------------------------------- | ------------------------ | ------------ | ------------ | ------------ |
| {{< component-link name="alertmanagerexporter" type="exporter" repo="contrib" >}}              | contrib                  | development  | -            | -            |
| {{< component-link name="alibabacloudlogserviceexporter" type="exporter" repo="contrib" >}} ⚠️ | contrib                  | unmaintained | unmaintained | unmaintained |
| {{< component-link name="awscloudwatchlogsexporter" type="exporter" repo="contrib" >}}         | contrib                  | -            | -            | alpha        |
| {{< component-link name="awsemfexporter" type="exporter" repo="contrib" >}}                    | contrib                  | -            | beta         | -            |
| {{< component-link name="awskinesisexporter" type="exporter" repo="contrib" >}}                | contrib                  | beta         | beta         | beta         |
| {{< component-link name="awss3exporter" type="exporter" repo="contrib" >}}                     | contrib                  | alpha        | alpha        | alpha        |
| {{< component-link name="awsxrayexporter" type="exporter" repo="contrib" >}}                   | contrib                  | beta         | -            | -            |
| {{< component-link name="azureblobexporter" type="exporter" repo="contrib" >}}                 | contrib                  | alpha        | alpha        | alpha        |
| {{< component-link name="azuredataexplorerexporter" type="exporter" repo="contrib" >}}         | contrib                  | beta         | beta         | beta         |
| {{< component-link name="azuremonitorexporter" type="exporter" repo="contrib" >}}              | contrib                  | beta         | beta         | beta         |
| {{< component-link name="bmchelixexporter" type="exporter" repo="contrib" >}}                  | contrib                  | -            | alpha        | -            |
| {{< component-link name="cassandraexporter" type="exporter" repo="contrib" >}}                 | contrib                  | alpha        | -            | alpha        |
| {{< component-link name="clickhouseexporter" type="exporter" repo="contrib" >}}                | contrib                  | beta         | alpha        | beta         |
| {{< component-link name="coralogixexporter" type="exporter" repo="contrib" >}}                 | contrib                  | beta         | beta         | beta         |
| {{< component-link name="datadogexporter" type="exporter" repo="contrib" >}}                   | contrib                  | beta         | beta         | beta         |
| {{< component-link name="datasetexporter" type="exporter" repo="contrib" >}}                   | contrib                  | alpha        | -            | alpha        |
| {{< component-link name="debugexporter" type="exporter" repo="core" >}}                        | contrib, core, K8s       | alpha        | alpha        | alpha        |
| {{< component-link name="dorisexporter" type="exporter" repo="contrib" >}}                     | contrib                  | alpha        | alpha        | alpha        |
| {{< component-link name="elasticsearchexporter" type="exporter" repo="contrib" >}}             | contrib                  | beta         | development  | beta         |
| {{< component-link name="faroexporter" type="exporter" repo="contrib" >}}                      | contrib                  | alpha        | -            | alpha        |
| {{< component-link name="fileexporter" type="exporter" repo="contrib" >}}                      | contrib, core, K8s       | alpha        | alpha        | alpha        |
| {{< component-link name="googlecloudexporter" type="exporter" repo="contrib" >}}               | contrib                  | beta         | beta         | beta         |
| {{< component-link name="googlecloudpubsubexporter" type="exporter" repo="contrib" >}}         | contrib                  | beta         | beta         | beta         |
| {{< component-link name="googlecloudstorageexporter" type="exporter" repo="contrib" >}}        | contrib                  | development  | -            | alpha        |
| {{< component-link name="googlemanagedprometheusexporter" type="exporter" repo="contrib" >}}   | contrib                  | -            | beta         | -            |
| {{< component-link name="honeycombmarkerexporter" type="exporter" repo="contrib" >}}           | contrib                  | -            | -            | alpha        |
| {{< component-link name="influxdbexporter" type="exporter" repo="contrib" >}}                  | contrib                  | beta         | beta         | beta         |
| {{< component-link name="kafkaexporter" type="exporter" repo="contrib" >}}                     | contrib, core            | beta         | beta         | beta         |
| {{< component-link name="loadbalancingexporter" type="exporter" repo="contrib" >}}             | contrib, K8s             | beta         | development  | beta         |
| {{< component-link name="logicmonitorexporter" type="exporter" repo="contrib" >}}              | contrib                  | alpha        | -            | alpha        |
| {{< component-link name="logzioexporter" type="exporter" repo="contrib" >}}                    | contrib                  | beta         | -            | beta         |
| {{< component-link name="mezmoexporter" type="exporter" repo="contrib" >}}                     | contrib                  | -            | -            | beta         |
| {{< component-link name="nopexporter" type="exporter" repo="core" >}}                          | contrib, core, K8s       | beta         | beta         | beta         |
| {{< component-link name="opensearchexporter" type="exporter" repo="contrib" >}}                | contrib                  | alpha        | -            | alpha        |
| {{< component-link name="otelarrowexporter" type="exporter" repo="contrib" >}}                 | contrib, K8s             | beta         | beta         | beta         |
| {{< component-link name="otlpexporter" type="exporter" repo="core" >}}                         | contrib, core, K8s, otlp | stable       | stable       | stable       |
| {{< component-link name="otlphttpexporter" type="exporter" repo="core" >}}                     | contrib, core, K8s, otlp | stable       | stable       | stable       |
| {{< component-link name="prometheusexporter" type="exporter" repo="contrib" >}}                | contrib, core            | -            | beta         | -            |
| {{< component-link name="prometheusremotewriteexporter" type="exporter" repo="contrib" >}}     | contrib, core            | -            | beta         | -            |
| {{< component-link name="pulsarexporter" type="exporter" repo="contrib" >}}                    | contrib                  | alpha        | alpha        | alpha        |
| {{< component-link name="rabbitmqexporter" type="exporter" repo="contrib" >}}                  | contrib                  | alpha        | alpha        | alpha        |
| {{< component-link name="sapmexporter" type="exporter" repo="contrib" >}}                      | contrib                  | deprecated   | -            | -            |
| {{< component-link name="sematextexporter" type="exporter" repo="contrib" >}}                  | contrib                  | -            | development  | development  |
| {{< component-link name="sentryexporter" type="exporter" repo="contrib" >}}                    | contrib                  | alpha        | -            | alpha        |
| {{< component-link name="signalfxexporter" type="exporter" repo="contrib" >}}                  | contrib                  | beta         | beta         | beta         |
| {{< component-link name="splunkhecexporter" type="exporter" repo="contrib" >}}                 | contrib                  | beta         | beta         | beta         |
| {{< component-link name="stefexporter" type="exporter" repo="contrib" >}}                      | contrib                  | -            | alpha        | -            |
| {{< component-link name="sumologicexporter" type="exporter" repo="contrib" >}}                 | contrib                  | beta         | beta         | beta         |
| {{< component-link name="syslogexporter" type="exporter" repo="contrib" >}}                    | contrib                  | -            | -            | alpha        |
| {{< component-link name="tencentcloudlogserviceexporter" type="exporter" repo="contrib" >}}    | contrib                  | -            | -            | beta         |
| {{< component-link name="tinybirdexporter" type="exporter" repo="contrib" >}}                  | contrib                  | alpha        | alpha        | alpha        |
| {{< component-link name="zipkinexporter" type="exporter" repo="contrib" >}}                    | contrib, core            | beta         | -            | -            |

[^1]:
    Shows which [distributions](/docs/collector/distributions/) (core, contrib,
    K8s, etc.) include this component.

[^2]:
    For details about component stability levels, see the
    [OpenTelemetry Collector component stability definitions](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: exporter-table SOURCE: scripts/collector-sync -->
