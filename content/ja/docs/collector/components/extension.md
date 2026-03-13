---
title: エクステンション
description: OpenTelemetry Collectorで利用可能なエクステンションの一覧
weight: 350
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762 # patched
drifted_from_default: true
# prettier-ignore
cSpell:ignore: ackextension asapauthextension authextension awsproxy azureauthextension basicauthextension bearertokenauthextension cgroupruntimeextension clientauthextension datadogextension googleclientauthextension headerssetterextension healthcheckextension healthcheckv httpforwarderextension jaegerremotesampling memorylimiterextension oidcauthextension opampextension pprofextension remotetapextension sigv sleaderelector solarwindsapmsettingsextension sumologicextension zpagesextension
---

エクステンションは、ヘルスチェックやサービスディスカバリーなどの追加機能を提供します。
エクステンションの詳細な設定方法については、[Collectorの設定ドキュメント](/docs/collector/configuration/#extensions)を参照してください。

<!-- BEGIN GENERATED: extension-table SOURCE: scripts/collector-sync -->

| 名前                                                                                         | ディストリビューション[^1] | 安定性[^2]  |
| -------------------------------------------------------------------------------------------- | -------------------------- | ----------- |
| {{< component-link name="ackextension" type="extension" repo="contrib" >}}                   | contrib, K8s               | alpha       |
| {{< component-link name="asapauthextension" type="extension" repo="contrib" >}}              | contrib                    | beta        |
| {{< component-link name="awsproxy" type="extension" repo="contrib" >}}                       | contrib                    | beta        |
| {{< component-link name="azureauthextension" type="extension" repo="contrib" >}}             | contrib                    | alpha       |
| {{< component-link name="basicauthextension" type="extension" repo="contrib" >}}             | contrib, K8s               | beta        |
| {{< component-link name="bearertokenauthextension" type="extension" repo="contrib" >}}       | contrib, K8s               | beta        |
| {{< component-link name="cgroupruntimeextension" type="extension" repo="contrib" >}}         | contrib                    | alpha       |
| {{< component-link name="datadogextension" type="extension" repo="contrib" >}}               | contrib                    | alpha       |
| {{< component-link name="googleclientauthextension" type="extension" repo="contrib" >}}      | contrib                    | beta        |
| {{< component-link name="headerssetterextension" type="extension" repo="contrib" >}}         | contrib, K8s               | alpha       |
| {{< component-link name="healthcheckextension" type="extension" repo="contrib" >}}           | contrib, core, K8s         | alpha       |
| {{< component-link name="healthcheckv2extension" type="extension" repo="contrib" >}}         | contrib                    | development |
| {{< component-link name="httpforwarderextension" type="extension" repo="contrib" >}}         | contrib, K8s               | beta        |
| {{< component-link name="jaegerremotesampling" type="extension" repo="contrib" >}}           | contrib                    | alpha       |
| {{< component-link name="k8sleaderelector" type="extension" repo="contrib" >}}               | contrib, K8s               | alpha       |
| {{< component-link name="memorylimiterextension" type="extension" repo="core" >}}            | core                       | development |
| {{< component-link name="oauth2clientauthextension" type="extension" repo="contrib" >}}      | contrib, K8s               | beta        |
| {{< component-link name="oidcauthextension" type="extension" repo="contrib" >}}              | contrib, K8s               | beta        |
| {{< component-link name="opampextension" type="extension" repo="contrib" >}}                 | contrib, K8s               | alpha       |
| {{< component-link name="pprofextension" type="extension" repo="contrib" >}}                 | contrib, core, K8s         | beta        |
| {{< component-link name="remotetapextension" type="extension" repo="contrib" >}}             | contrib                    | development |
| {{< component-link name="sigv4authextension" type="extension" repo="contrib" >}}             | contrib                    | beta        |
| {{< component-link name="solarwindsapmsettingsextension" type="extension" repo="contrib" >}} | contrib                    | development |
| {{< component-link name="sumologicextension" type="extension" repo="contrib" >}}             | contrib                    | alpha       |
| {{< component-link name="zpagesextension" type="extension" repo="core" >}}                   | contrib, core, K8s         | beta        |

<!-- END GENERATED: extension-table SOURCE: scripts/collector-sync -->

## Encoding Extensions

<!-- BEGIN GENERATED: extension-encoding-table SOURCE: scripts/collector-sync -->

| Name                                                                                                                         | Distributions[^1] | Stability[^2] |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------- |
| {{< component-link name="avrologencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                    | contrib           | development   |
| {{< component-link name="awscloudwatchmetricstreamsencodingextension" type="extension" repo="contrib" subtype="encoding" >}} | contrib           | alpha         |
| {{< component-link name="awslogsencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                    | contrib           | alpha         |
| {{< component-link name="azureencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                      | contrib           | development   |
| {{< component-link name="googlecloudlogentryencodingextension" type="extension" repo="contrib" subtype="encoding" >}}        | contrib           | alpha         |
| {{< component-link name="jaegerencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                     | contrib           | alpha         |
| {{< component-link name="jsonlogencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                    | contrib           | alpha         |
| {{< component-link name="otlpencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                       | contrib           | beta          |
| {{< component-link name="skywalkingencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                 | contrib           | alpha         |
| {{< component-link name="textencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                       | contrib           | beta          |
| {{< component-link name="zipkinencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                     | contrib           | alpha         |

<!-- END GENERATED: extension-encoding-table SOURCE: scripts/collector-sync -->

## Observer Extensions

<!-- BEGIN GENERATED: extension-observer-table SOURCE: scripts/collector-sync -->

| Name                                                                                                 | Distributions[^1] | Stability[^2] |
| ---------------------------------------------------------------------------------------------------- | ----------------- | ------------- |
| {{< component-link name="cfgardenobserver" type="extension" repo="contrib" subtype="observer" >}}    | contrib           | alpha         |
| {{< component-link name="dockerobserver" type="extension" repo="contrib" subtype="observer" >}}      | contrib           | beta          |
| {{< component-link name="ecsobserver" type="extension" repo="contrib" subtype="observer" >}}         | contrib           | beta          |
| {{< component-link name="hostobserver" type="extension" repo="contrib" subtype="observer" >}}        | contrib, K8s      | beta          |
| {{< component-link name="k8sobserver" type="extension" repo="contrib" subtype="observer" >}}         | contrib, K8s      | alpha         |
| {{< component-link name="kafkatopicsobserver" type="extension" repo="contrib" subtype="observer" >}} | contrib           | alpha         |

<!-- END GENERATED: extension-observer-table SOURCE: scripts/collector-sync -->

## Storage Extensions

<!-- BEGIN GENERATED: extension-storage-table SOURCE: scripts/collector-sync -->

| Name                                                                                                  | Distributions[^1] | Stability[^2] |
| ----------------------------------------------------------------------------------------------------- | ----------------- | ------------- |
| {{< component-link name="dbstorage" type="extension" repo="contrib" subtype="storage" >}}             | contrib           | alpha         |
| {{< component-link name="filestorage" type="extension" repo="contrib" subtype="storage" >}}           | contrib, K8s      | beta          |
| {{< component-link name="redisstorageextension" type="extension" repo="contrib" subtype="storage" >}} | contrib           | alpha         |

<!-- END GENERATED: extension-storage-table SOURCE: scripts/collector-sync -->

<!-- BEGIN GENERATED: extension-footnotes-table SOURCE: scripts/collector-sync -->

[^1]:
    Shows which [distributions](/docs/collector/distributions/) (core, contrib,
    K8s, etc.) include this component.

[^2]:
    For details about component stability levels, see the
    [OpenTelemetry Collector component stability definitions](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: extension-footnotes-table SOURCE: scripts/collector-sync -->
