---
title: Розширення
description: Список доступних розширень OpenTelemetry Collector
weight: 350
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: ackextension asapauthextension authextension avrologencodingextension awscloudwatchmetricstreamsencodingextension awslogsencodingextension awsproxy azureauthextension azureencodingextension basicauthextension bearertokenauthextension cfgardenobserver cgroupruntimeextension clientauthextension datadogextension dbstorage dockerobserver ecsobserver endpointswatcher filestorage googleclientauthextension googlecloudlogentryencodingextension headerssetterextension healthcheckextension healthcheckv hostobserver httpforwarderextension jaegerencodingextension jaegerremotesampling jsonlogencodingextension k8sobserver kafkatopicsobserver memorylimiterextension oidcauthextension opampextension otlpencodingextension pprofextension redisstorageextension remotetapextension sigv skywalkingencodingextension sleaderelector solarwindsapmsettingsextension sumologicextension textencodingextension zipkinencodingextension zpagesextension
---

Розширення надають додаткові можливості, такі як перевірка стану та виявлення сервісів. Докладнішу інформацію про налаштування розширень див. у [документації з налаштування колектора](/docs/collector/configuration/#extensions).

## Розширення {#extensions}

<!-- BEGIN GENERATED: extension-table SOURCE: collector-watcher -->

| Назва                                                                                                                                                  | Дистрибутив[^1]    | Стабільність[^2] |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ---------------- |
| [ackextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/ackextension)                                     | contrib, K8s       | alpha            |
| [asapauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/asapauthextension)                           | contrib            | beta             |
| [awsproxy](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/awsproxy)                                             | contrib            | beta             |
| [azureauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/azureauthextension)                         | contrib            | alpha            |
| [basicauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/basicauthextension)                         | contrib, K8s       | beta             |
| [bearertokenauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/bearertokenauthextension)             | contrib, K8s       | beta             |
| [cgroupruntimeextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/cgroupruntimeextension)                 | contrib            | alpha            |
| [datadogextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/datadogextension)                             | contrib            | alpha            |
| [googleclientauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/googleclientauthextension)           | contrib            | beta             |
| [headerssetterextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/headerssetterextension)                 | contrib, K8s       | alpha            |
| [healthcheckextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/healthcheckextension)                     | contrib, core, K8s | alpha            |
| [healthcheckv2extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/healthcheckv2extension)                 | contrib            | development      |
| [httpforwarderextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/httpforwarderextension)                 | contrib, K8s       | beta             |
| [jaegerremotesampling](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/jaegerremotesampling)                     | contrib            | alpha            |
| [k8sleaderelector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/k8sleaderelector)                             | contrib, K8s       | alpha            |
| [memorylimiterextension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/memorylimiterextension)                         | contrib            | development      |
| [oauth2clientauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/oauth2clientauthextension)           | contrib, K8s       | beta             |
| [oidcauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/oidcauthextension)                           | contrib, K8s       | beta             |
| [opampextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/opampextension)                                 | contrib, K8s       | alpha            |
| [pprofextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/pprofextension)                                 | contrib, core, K8s | beta             |
| [remotetapextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/remotetapextension)                         | contrib            | development      |
| [sigv4authextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/sigv4authextension)                         | contrib            | beta             |
| [solarwindsapmsettingsextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/solarwindsapmsettingsextension) | contrib            | development      |
| [sumologicextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/sumologicextension)                         | contrib            | alpha            |
| [zpagesextension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/zpagesextension)                                       | contrib, core, K8s | beta             |

<!-- END GENERATED: extension-table SOURCE: collector-watcher -->

## Розширення кодування {#encoding-extensions}

<!-- BEGIN GENERATED: extension-encoding-table SOURCE: collector-watcher -->

| Назва                                                                                                                                                                                     | Дистрибутив[^1] | Стабільність[^2] |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| [avrologencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/avrologencodingextension)                                       | contrib         | development      |
| [awscloudwatchmetricstreamsencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/awscloudwatchmetricstreamsencodingextension) | contrib         | alpha            |
| [awslogsencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/awslogsencodingextension)                                       | contrib         | alpha            |
| [azureencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/azureencodingextension)                                           | contrib         | development      |
| [googlecloudlogentryencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/googlecloudlogentryencodingextension)               | contrib         | alpha            |
| [jaegerencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/jaegerencodingextension)                                         | contrib         | alpha            |
| [jsonlogencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/jsonlogencodingextension)                                       | contrib         | alpha            |
| [otlpencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/otlpencodingextension)                                             | contrib         | beta             |
| [skywalkingencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/skywalkingencodingextension)                                 | contrib         | alpha            |
| [textencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/textencodingextension)                                             | contrib         | beta             |
| [zipkinencodingextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/encoding/zipkinencodingextension)                                         | contrib         | alpha            |

<!-- END GENERATED: extension-encoding-table SOURCE: collector-watcher -->

## Розширення спостерігача {#observer-extensions}

<!-- BEGIN GENERATED: extension-observer-table SOURCE: collector-watcher -->

| Назва                                                                                                                                     | Дистрибутив[^1] | Стабільність[^2] |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| [cfgardenobserver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/cfgardenobserver)       | contrib         | alpha            |
| [dockerobserver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/dockerobserver)           | contrib         | beta             |
| [ecsobserver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/ecsobserver)                 | contrib         | beta             |
| [endpointswatcher](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/endpointswatcher)       | contrib         | N/A              |
| [hostobserver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/hostobserver)               | contrib, K8s    | beta             |
| [k8sobserver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/k8sobserver)                 | contrib, K8s    | alpha            |
| [kafkatopicsobserver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/kafkatopicsobserver) | contrib         | alpha            |

<!-- END GENERATED: extension-observer-table SOURCE: collector-watcher -->

## Розширення сховища {#storage-extensions}

<!-- BEGIN GENERATED: extension-storage-table SOURCE: collector-watcher -->

| Назва                                                                                                                                        | Дистрибутив[^1] | Стабільність[^2] |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| [dbstorage](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/storage/dbstorage)                         | contrib         | alpha            |
| [filestorage](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/storage/filestorage)                     | contrib, K8s    | beta             |
| [redisstorageextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/storage/redisstorageextension) | contrib         | alpha            |

<!-- END GENERATED: extension-storage-table SOURCE: collector-watcher -->

<!-- BEGIN GENERATED: extension-footnotes-table SOURCE: collector-watcher -->

[^1]: Показує, які [дистрибутиви](/docs/collector/distributions/) (core, contrib, K8s тощо) містять цей компонент.

[^2]: Детальнішу інформацію про рівні стабільності компонентів див. у [Визначеннях стабільності компонентів OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: extension-footnotes-table SOURCE: collector-watcher -->
