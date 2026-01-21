---
title: コネクター
description: OpenTelemetry Collectorで利用可能なコネクターの一覧
weight: 340
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
drifted_from_default: true
# prettier-ignore
cSpell:ignore: countconnector datadogconnector exceptionsconnector failoverconnector forwardconnector grafanacloudconnector otlpjsonconnector roundrobinconnector routingconnector servicegraphconnector signaltometricsconnector slowsqlconnector spanmetricsconnector sumconnector
---

コネクターは、2つのパイプラインを接続し、エクスポーターとレシーバーの両方として機能します。
コネクターの詳細な設定方法については、[Collectorの設定ドキュメント](/docs/collector/configuration/#connectors)を参照してください。

<!-- BEGIN GENERATED: connector-table -->

| 名前                                                                                                                                       | ディストリビューション[^1] |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| [countconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/countconnector)                     | contrib, K8s               |
| [datadogconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/datadogconnector)                 | contrib                    |
| [exceptionsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/exceptionsconnector)           | contrib, K8s               |
| [failoverconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/failoverconnector)               | contrib, K8s               |
| [forwardconnector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/connector/forwardconnector)                         | contrib, core, K8s         |
| [grafanacloudconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/grafanacloudconnector)       | contrib                    |
| [otlpjsonconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/otlpjsonconnector)               | contrib, K8s               |
| [roundrobinconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/roundrobinconnector)           | contrib, K8s               |
| [routingconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/routingconnector)                 | contrib, K8s               |
| [servicegraphconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector)       | contrib, K8s               |
| [signaltometricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/signaltometricsconnector) | contrib                    |
| [slowsqlconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/slowsqlconnector)                 | contrib                    |
| [spanmetricsconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector)         | contrib                    |
| [sumconnector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/sumconnector)                         | contrib                    |

[^1]: このコンポーネントが含まれている[ディストリビューション](/docs/collector/distributions/)（core、contrib、K8sなど）を示します。

<!-- END GENERATED: connector-table -->
