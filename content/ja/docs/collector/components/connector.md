---
title: コネクター
description: OpenTelemetry Collectorで利用可能なコネクターの一覧
weight: 340
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762 # patched
drifted_from_default: true
# prettier-ignore
cSpell:ignore: countconnector datadogconnector exceptionsconnector failoverconnector forwardconnector grafanacloudconnector otlpjsonconnector roundrobinconnector routingconnector servicegraphconnector signaltometricsconnector slowsqlconnector spanmetricsconnector sumconnector
---

コネクターは、2つのパイプラインを接続し、エクスポーターとレシーバーの両方として機能します。
コネクターの詳細な設定方法については、[Collectorの設定ドキュメント](/docs/collector/configuration/#connectors)を参照してください。

<!-- BEGIN GENERATED: connector-table SOURCE: scripts/collector-sync -->

| 名前                                                                                   | ディストリビューション[^1] |
| -------------------------------------------------------------------------------------- | -------------------------- |
| {{< component-link name="countconnector" type="connector" repo="contrib" >}}           | contrib, K8s               |
| {{< component-link name="datadogconnector" type="connector" repo="contrib" >}}         | contrib                    |
| {{< component-link name="exceptionsconnector" type="connector" repo="contrib" >}}      | contrib, K8s               |
| {{< component-link name="failoverconnector" type="connector" repo="contrib" >}}        | contrib, K8s               |
| {{< component-link name="forwardconnector" type="connector" repo="core" >}}            | contrib, core, K8s         |
| {{< component-link name="grafanacloudconnector" type="connector" repo="contrib" >}}    | contrib                    |
| {{< component-link name="metricsaslogsconnector" type="connector" repo="contrib" >}}   | contrib                    |
| {{< component-link name="otlpjsonconnector" type="connector" repo="contrib" >}}        | contrib, K8s               |
| {{< component-link name="roundrobinconnector" type="connector" repo="contrib" >}}      | contrib, K8s               |
| {{< component-link name="routingconnector" type="connector" repo="contrib" >}}         | contrib, K8s               |
| {{< component-link name="servicegraphconnector" type="connector" repo="contrib" >}}    | contrib, K8s               |
| {{< component-link name="signaltometricsconnector" type="connector" repo="contrib" >}} | contrib                    |
| {{< component-link name="slowsqlconnector" type="connector" repo="contrib" >}}         | contrib                    |
| {{< component-link name="spanmetricsconnector" type="connector" repo="contrib" >}}     | contrib                    |
| {{< component-link name="sumconnector" type="connector" repo="contrib" >}}             | contrib                    |

[^1]: このコンポーネントが含まれている[ディストリビューション](/docs/collector/distributions/)（core、contrib、K8sなど）を示します。

<!-- END GENERATED: connector-table SOURCE: scripts/collector-sync -->
