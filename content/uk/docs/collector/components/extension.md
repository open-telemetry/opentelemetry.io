---
title: Розширення
description: Список доступних розширень OpenTelemetry Collector
weight: 350
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: ackextension asapauthextension authextension avrologencodingextension awscloudwatchmetricstreamsencodingextension awslogsencodingextension awsproxy azureauthextension azureencodingextension basicauthextension bearertokenauthextension cfgardenobserver cgroupruntimeextension clientauthextension datadogextension dbstorage dockerobserver ecsobserver filestorage googleclientauthextension googlecloudlogentryencodingextension headerssetterextension healthcheckextension healthcheckv hostobserver httpforwarderextension jaegerencodingextension jaegerremotesampling jsonlogencodingextension k8sobserver kafkatopicsobserver memorylimiterextension oidcauthextension opampextension otlpencodingextension pprofextension redisstorageextension remotetapextension sigv skywalkingencodingextension sleaderelector solarwindsapmsettingsextension sumologicextension textencodingextension zipkinencodingextension zpagesextension
---

Розширення надають додаткові можливості, такі як перевірка стану та виявлення сервісів. Докладнішу інформацію про налаштування розширень див. у [документації з налаштування колектора](/docs/collector/configuration/#extensions).

## Розширення {#extensions}

<!-- BEGIN GENERATED: extension-table SOURCE: scripts/collector-sync -->

| Назва                                                                                        | Дистрибутив[^1]    | Стабільність[^2] |
| -------------------------------------------------------------------------------------------- | ------------------ | ---------------- |
| {{< component-link name="ackextension" type="extension" repo="contrib" >}}                   | contrib, K8s       | alpha            |
| {{< component-link name="asapauthextension" type="extension" repo="contrib" >}}              | contrib            | beta             |
| {{< component-link name="awsproxy" type="extension" repo="contrib" >}}                       | contrib            | beta             |
| {{< component-link name="azureauthextension" type="extension" repo="contrib" >}}             | contrib            | alpha            |
| {{< component-link name="basicauthextension" type="extension" repo="contrib" >}}             | contrib, K8s       | beta             |
| {{< component-link name="bearertokenauthextension" type="extension" repo="contrib" >}}       | contrib, K8s       | beta             |
| {{< component-link name="cgroupruntimeextension" type="extension" repo="contrib" >}}         | contrib            | alpha            |
| {{< component-link name="datadogextension" type="extension" repo="contrib" >}}               | contrib            | alpha            |
| {{< component-link name="googleclientauthextension" type="extension" repo="contrib" >}}      | contrib            | beta             |
| {{< component-link name="headerssetterextension" type="extension" repo="contrib" >}}         | contrib, K8s       | alpha            |
| {{< component-link name="healthcheckextension" type="extension" repo="contrib" >}}           | contrib, core, K8s | alpha            |
| {{< component-link name="healthcheckv2extension" type="extension" repo="contrib" >}}         | contrib            | development      |
| {{< component-link name="httpforwarderextension" type="extension" repo="contrib" >}}         | contrib, K8s       | beta             |
| {{< component-link name="jaegerremotesampling" type="extension" repo="contrib" >}}           | contrib            | alpha            |
| {{< component-link name="k8sleaderelector" type="extension" repo="contrib" >}}               | contrib, K8s       | alpha            |
| {{< component-link name="memorylimiterextension" type="extension" repo="core" >}}            | core               | development      |
| {{< component-link name="oauth2clientauthextension" type="extension" repo="contrib" >}}      | contrib, K8s       | beta             |
| {{< component-link name="oidcauthextension" type="extension" repo="contrib" >}}              | contrib, K8s       | beta             |
| {{< component-link name="opampextension" type="extension" repo="contrib" >}}                 | contrib, K8s       | alpha            |
| {{< component-link name="pprofextension" type="extension" repo="contrib" >}}                 | contrib, core, K8s | beta             |
| {{< component-link name="remotetapextension" type="extension" repo="contrib" >}}             | contrib            | development      |
| {{< component-link name="sigv4authextension" type="extension" repo="contrib" >}}             | contrib            | beta             |
| {{< component-link name="solarwindsapmsettingsextension" type="extension" repo="contrib" >}} | contrib            | development      |
| {{< component-link name="sumologicextension" type="extension" repo="contrib" >}}             | contrib            | alpha            |
| {{< component-link name="zpagesextension" type="extension" repo="core" >}}                   | contrib, core, K8s | beta             |

<!-- END GENERATED: extension-table SOURCE: scripts/collector-sync -->

## Розширення кодування {#encoding-extensions}

<!-- BEGIN GENERATED: extension-encoding-table SOURCE: scripts/collector-sync -->

| Назва                                                                                                                        | Дистрибутив[^1] | Стабільність[^2] |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| {{< component-link name="avrologencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                    | contrib         | development      |
| {{< component-link name="awscloudwatchmetricstreamsencodingextension" type="extension" repo="contrib" subtype="encoding" >}} | contrib         | alpha            |
| {{< component-link name="awslogsencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                    | contrib         | alpha            |
| {{< component-link name="azureencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                      | contrib         | development      |
| {{< component-link name="googlecloudlogentryencodingextension" type="extension" repo="contrib" subtype="encoding" >}}        | contrib         | alpha            |
| {{< component-link name="jaegerencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                     | contrib         | alpha            |
| {{< component-link name="jsonlogencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                    | contrib         | alpha            |
| {{< component-link name="otlpencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                       | contrib         | beta             |
| {{< component-link name="skywalkingencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                 | contrib         | alpha            |
| {{< component-link name="textencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                       | contrib         | beta             |
| {{< component-link name="zipkinencodingextension" type="extension" repo="contrib" subtype="encoding" >}}                     | contrib         | alpha            |

<!-- END GENERATED: extension-encoding-table SOURCE: scripts/collector-sync -->

## Розширення спостерігача {#observer-extensions}

<!-- BEGIN GENERATED: extension-observer-table SOURCE: scripts/collector-sync -->

| Назва                                                                                                | Дистрибутив[^1] | Стабільність[^2] |
| ---------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| {{< component-link name="cfgardenobserver" type="extension" repo="contrib" subtype="observer" >}}    | contrib         | alpha            |
| {{< component-link name="dockerobserver" type="extension" repo="contrib" subtype="observer" >}}      | contrib         | beta             |
| {{< component-link name="ecsobserver" type="extension" repo="contrib" subtype="observer" >}}         | contrib         | beta             |
| {{< component-link name="hostobserver" type="extension" repo="contrib" subtype="observer" >}}        | contrib, K8s    | beta             |
| {{< component-link name="k8sobserver" type="extension" repo="contrib" subtype="observer" >}}         | contrib, K8s    | alpha            |
| {{< component-link name="kafkatopicsobserver" type="extension" repo="contrib" subtype="observer" >}} | contrib         | alpha            |

<!-- END GENERATED: extension-observer-table SOURCE: scripts/collector-sync -->

## Розширення сховища {#storage-extensions}

<!-- BEGIN GENERATED: extension-storage-table SOURCE: scripts/collector-sync -->

| Назва                                                                                                 | Дистрибутив[^1] | Стабільність[^2] |
| ----------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| {{< component-link name="dbstorage" type="extension" repo="contrib" subtype="storage" >}}             | contrib         | alpha            |
| {{< component-link name="filestorage" type="extension" repo="contrib" subtype="storage" >}}           | contrib, K8s    | beta             |
| {{< component-link name="redisstorageextension" type="extension" repo="contrib" subtype="storage" >}} | contrib         | alpha            |

<!-- END GENERATED: extension-storage-table SOURCE: scripts/collector-sync -->

<!-- BEGIN GENERATED: extension-footnotes-table SOURCE: scripts/collector-sync -->

[^1]: Показує, які [дистрибутиви](/docs/collector/distributions/) (core, contrib, K8s тощо) містять цей компонент.

[^2]: Детальнішу інформацію про рівні стабільності компонентів див. у [Визначеннях стабільності компонентів OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: extension-footnotes-table SOURCE: scripts/collector-sync -->
