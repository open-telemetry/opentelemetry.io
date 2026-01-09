---
title: エクステンション
description: OpenTelemetry Collectorで利用可能なエクステンションの一覧
weight: 350
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
drifted_from_default: true
# prettier-ignore
cSpell:ignore: ackextension asapauthextension authextension awsproxy azureauthextension basicauthextension bearertokenauthextension cgroupruntimeextension clientauthextension datadogextension googleclientauthextension headerssetterextension healthcheckextension healthcheckv httpforwarderextension jaegerremotesampling memorylimiterextension oidcauthextension opampextension pprofextension remotetapextension sigv sleaderelector solarwindsapmsettingsextension sumologicextension zpagesextension
---

エクステンションは、ヘルスチェックやサービスディスカバリーなどの追加機能を提供します。
エクステンションの詳細な設定方法については、[Collectorの設定ドキュメント](/docs/collector/configuration/#extensions)を参照してください。

<!-- BEGIN GENERATED: extension-table -->

| 名前                                                                                                                                                   | ディストリビューション[^1] | 安定性[^2]  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ----------- |
| [ackextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/ackextension)                                     | contrib, K8s               | alpha       |
| [asapauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/asapauthextension)                           | contrib                    | beta        |
| [awsproxy](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/awsproxy)                                             | contrib                    | beta        |
| [azureauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/azureauthextension)                         | contrib                    | alpha       |
| [basicauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/basicauthextension)                         | contrib, K8s               | beta        |
| [bearertokenauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/bearertokenauthextension)             | contrib, K8s               | beta        |
| [cgroupruntimeextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/cgroupruntimeextension)                 | contrib                    | alpha       |
| [datadogextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/datadogextension)                             | contrib                    | alpha       |
| [googleclientauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/googleclientauthextension)           | contrib                    | beta        |
| [headerssetterextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/headerssetterextension)                 | contrib, K8s               | alpha       |
| [healthcheckextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/healthcheckextension)                     | contrib, core, K8s         | alpha       |
| [healthcheckv2extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/healthcheckv2extension)                 | contrib                    | development |
| [httpforwarderextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/httpforwarderextension)                 | contrib, K8s               | beta        |
| [jaegerremotesampling](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/jaegerremotesampling)                     | contrib                    | alpha       |
| [k8sleaderelector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/k8sleaderelector)                             | contrib, K8s               | alpha       |
| [memorylimiterextension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/memorylimiterextension)                         | contrib                    | development |
| [oauth2clientauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/oauth2clientauthextension)           | contrib, K8s               | beta        |
| [oidcauthextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/oidcauthextension)                           | contrib, K8s               | beta        |
| [opampextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/opampextension)                                 | contrib, K8s               | alpha       |
| [pprofextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/pprofextension)                                 | contrib, core, K8s         | beta        |
| [remotetapextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/remotetapextension)                         | contrib                    | development |
| [sigv4authextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/sigv4authextension)                         | contrib                    | beta        |
| [solarwindsapmsettingsextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/solarwindsapmsettingsextension) | contrib                    | development |
| [sumologicextension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/sumologicextension)                         | contrib                    | alpha       |
| [zpagesextension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/zpagesextension)                                       | contrib, core, K8s         | beta        |

⚠️ **注意:** ⚠️ マークが付いているコンポーネントはメンテナンスされておらず、アクティブなコードオーナーがいません。
それらのコンポーネントは定期的な更新やバグ修正を受け付けていない可能性があります。

[^1]: このコンポーネントが含まれている[ディストリビューション](/docs/collector/distributions/)（core、contrib、K8sなど）を示します。

[^2]: コンポーネントの安定性レベルの詳細については、[OpenTelemetry Collectorコンポーネントの安定性の定義](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md)を参照してください。

<!-- END GENERATED: extension-table -->
