---
title: Exporters
description: List of available OpenTelemetry Collector exporters
weight: 330
---

Exporters send telemetry data to observability backends and destinations.

The **Traces**, **Metrics**, and **Logs** columns show the stability level for each signal type.

| Name | Traces | Metrics | Logs |
|------|--------|---------|------|
| [alertmanagerexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/alertmanagerexporter) | development | - | - |
| [alibabacloudlogserviceexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/alibabacloudlogserviceexporter) | beta | beta | beta |
| [awscloudwatchlogsexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awscloudwatchlogsexporter) | - | - | alpha |
| [awsemfexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awsemfexporter) | - | beta | - |
| [awskinesisexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awskinesisexporter) | beta | beta | beta |
| [awss3exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awss3exporter) | alpha | alpha | alpha |
| [awsxrayexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/awsxrayexporter) | beta | - | - |
| [azureblobexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/azureblobexporter) | alpha | alpha | alpha |
| [azuredataexplorerexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/azuredataexplorerexporter) | beta | beta | beta |
| [azuremonitorexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/azuremonitorexporter) | beta | beta | beta |
| [bmchelixexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/bmchelixexporter) | - | alpha | - |
| [carbonexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/carbonexporter) | - | unmaintained | - |
| [cassandraexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/cassandraexporter) | alpha | - | alpha |
| [clickhouseexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) | beta | alpha | beta |
| [coralogixexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/coralogixexporter) | beta | beta | beta |
| [datadogexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/datadogexporter) | beta | beta | beta |
| [datasetexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/datasetexporter) | alpha | - | alpha |
| [dorisexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/dorisexporter) | alpha | alpha | alpha |
| [elasticsearchexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/elasticsearchexporter) | beta | development | beta |
| [faroexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/faroexporter) | alpha | - | alpha |
| [fileexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/fileexporter) | alpha | alpha | alpha |
| [googlecloudexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/googlecloudexporter) | beta | beta | beta |
| [googlecloudpubsubexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/googlecloudpubsubexporter) | beta | beta | beta |
| [googlecloudstorageexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/googlecloudstorageexporter) | - | - | development |
| [googlemanagedprometheusexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/googlemanagedprometheusexporter) | - | beta | - |
| [honeycombmarkerexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/honeycombmarkerexporter) | - | - | alpha |
| [influxdbexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/influxdbexporter) | beta | beta | beta |
| [kafkaexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/kafkaexporter) | beta | beta | beta |
| [loadbalancingexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter) | beta | development | beta |
| [logicmonitorexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/logicmonitorexporter) | alpha | - | alpha |
| [logzioexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/logzioexporter) | beta | - | beta |
| [mezmoexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/mezmoexporter) | - | - | beta |
| [opensearchexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/opensearchexporter) | alpha | - | alpha |
| [otelarrowexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/otelarrowexporter) | beta | beta | beta |
| [prometheusexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusexporter) | - | beta | - |
| [prometheusremotewriteexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusremotewriteexporter) | - | beta | - |
| [pulsarexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/pulsarexporter) | alpha | alpha | alpha |
| [rabbitmqexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/rabbitmqexporter) | alpha | alpha | alpha |
| [sapmexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sapmexporter) | deprecated | - | - |
| [sematextexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sematextexporter) | - | development | development |
| [sentryexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sentryexporter) | beta | - | - |
| [signalfxexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/signalfxexporter) | beta | beta | beta |
| [splunkhecexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/splunkhecexporter) | beta | beta | beta |
| [stefexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/stefexporter) | - | alpha | - |
| [sumologicexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sumologicexporter) | beta | beta | beta |
| [syslogexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/syslogexporter) | - | - | alpha |
| [tencentcloudlogserviceexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/tencentcloudlogserviceexporter) | - | - | beta |
| [tinybirdexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/tinybirdexporter) | alpha | alpha | alpha |
| [zipkinexporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/zipkinexporter) | beta | - | - |
