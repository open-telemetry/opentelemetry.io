---
title: Extensions
description: List of available OpenTelemetry Collector extensions
weight: 350
# prettier-ignore
cSpell:ignore: ackextension asapauthextension authextension awsproxy azureauthextension basicauthextension bearertokenauthextension cgroupruntimeextension clientauthextension datadogextension googleclientauthextension headerssetterextension healthcheckextension healthcheckv httpforwarderextension jaegerremotesampling memorylimiterextension oidcauthextension opampextension pprofextension remotetapextension sigv sleaderelector solarwindsapmsettingsextension sumologicextension zpagesextension
---

Extensions provide additional capabilities like health checks and service
discovery. For more information on how to configure extensions, see the
[Collector configuration documentation](/docs/collector/configuration/#extensions).

<!-- BEGIN GENERATED: extension-table -->

| Name                                                                                                                                                   | Distributions[^1]  | Stability[^2] |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------------- |
| [ackextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/ackextension)                                     | contrib, K8s       | alpha         |
| [asapauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/asapauthextension)                           | contrib            | beta          |
| [awsproxy](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/awsproxy)                                             | contrib            | beta          |
| [azureauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/azureauthextension)                         | contrib            | alpha         |
| [basicauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/basicauthextension)                         | contrib, K8s       | beta          |
| [bearertokenauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/bearertokenauthextension)             | contrib, K8s       | beta          |
| [cgroupruntimeextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/cgroupruntimeextension)                 | contrib            | alpha         |
| [datadogextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/datadogextension)                             | contrib            | alpha         |
| [googleclientauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/googleclientauthextension)           | contrib            | beta          |
| [headerssetterextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/headerssetterextension)                 | contrib, K8s       | alpha         |
| [healthcheckextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/healthcheckextension)                     | contrib, core, K8s | alpha         |
| [healthcheckv2extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/healthcheckv2extension)                 | contrib            | development   |
| [httpforwarderextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/httpforwarderextension)                 | contrib, K8s       | beta          |
| [jaegerremotesampling](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/jaegerremotesampling)                     | contrib            | alpha         |
| [k8sleaderelector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/k8sleaderelector)                             | contrib, K8s       | alpha         |
| [memorylimiterextension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/memorylimiterextension)                         | contrib            | development   |
| [oauth2clientauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/oauth2clientauthextension)           | contrib, K8s       | beta          |
| [oidcauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/oidcauthextension)                           | contrib, K8s       | beta          |
| [opampextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/opampextension)                                 | contrib, K8s       | alpha         |
| [pprofextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/pprofextension)                                 | contrib, core, K8s | beta          |
| [remotetapextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/remotetapextension)                         | contrib            | development   |
| [sigv4authextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/sigv4authextension)                         | contrib            | beta          |
| [solarwindsapmsettingsextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/solarwindsapmsettingsextension) | contrib            | development   |
| [sumologicextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/sumologicextension)                         | contrib            | alpha         |
| [zpagesextension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/zpagesextension)                                       | contrib, core, K8s | beta          |

⚠️ **Note:** Components marked with ⚠️ are unmaintained and have no active
codeowners. They may not receive regular updates or bug fixes.

[^1]:
    Shows which [distributions](/docs/collector/distributions/) (core, contrib,
    K8s, etc.) include this component.

[^2]:
    For details about component stability levels, see the
    [OpenTelemetry Collector component stability definitions](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: extension-table -->
