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

{{< collector-component-rows type="exporter" >}}
