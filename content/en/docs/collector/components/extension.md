---
title: Extensions
description: List of available OpenTelemetry Collector extensions
weight: 350
# prettier-ignore
cSpell:ignore: ackextension asapauthextension authextension avrologencodingextension awscloudwatchmetricstreamsencodingextension awslogsencodingextension awsproxy azureauthextension azureencodingextension basicauthextension bearertokenauthextension cfgardenobserver cgroupruntimeextension clientauthextension datadogextension dbstorage dockerobserver ecsobserver filestorage googleclientauthextension googlecloudlogentryencodingextension headerssetterextension healthcheckextension healthcheckv hostobserver httpforwarderextension jaegerencodingextension jaegerremotesampling jsonlogencodingextension k8sobserver kafkatopicsobserver memorylimiterextension oidcauthextension opampextension otlpencodingextension pprofextension redisstorageextension remotetapextension sigv skywalkingencodingextension sleaderelector solarwindsapmsettingsextension sumologicextension textencodingextension zipkinencodingextension zpagesextension
---

Extensions provide additional capabilities like health checks and service
discovery. For more information on how to configure extensions, see the
[Collector configuration documentation](/docs/collector/configuration/#extensions).

## Extensions

{{< collector-component-rows type="extension" renderFootnotes="false" >}}

## Encoding Extensions

{{< collector-component-rows type="extension" subtype="encoding" renderFootnotes="false" >}}

## Observer Extensions

{{< collector-component-rows type="extension" subtype="observer" renderFootnotes="false" >}}

## Storage Extensions

{{< collector-component-rows type="extension" subtype="storage" >}}
