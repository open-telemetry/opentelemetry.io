---
title: プロセッサー
description: OpenTelemetry Collectorで利用可能なプロセッサーの一覧
weight: 320
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762 # patched
drifted_from_default: true
# prettier-ignore
cSpell:ignore: attributesprocessor batchprocessor coralogixprocessor cumulativetodeltaprocessor datadogsemanticsprocessor deltatocumulativeprocessor deltatorateprocessor dnslookupprocessor filterprocessor geoipprocessor groupbyattrsprocessor groupbytraceprocessor intervalprocessor isolationforestprocessor logdedupprocessor logstransformprocessor memorylimiterprocessor metricsgenerationprocessor metricstarttimeprocessor metricstransformprocessor probabilisticsamplerprocessor redactionprocessor remotetapprocessor resourcedetectionprocessor resourceprocessor sattributesprocessor schemaprocessor spanprocessor sumologicprocessor tailsamplingprocessor transformprocessor unrollprocessor xprocessor
---

プロセッサーは、パイプラインを通過するテレメトリーデータを変換、フィルタリング、強化します。
プロセッサーの詳細な設定方法については、[Collectorの設定ドキュメント](/docs/collector/configuration/#processors)を参照してください。

<!-- BEGIN GENERATED: processor-table SOURCE: scripts/collector-sync -->

| 名前                                                                                        | ディストリビューション[^1] | トレース[^2] | メトリクス[^2] | ログ[^2]    |
| ------------------------------------------------------------------------------------------- | -------------------------- | ------------ | -------------- | ----------- |
| {{< component-link name="attributesprocessor" type="processor" repo="contrib" >}}           | contrib, core, K8s         | beta         | beta           | beta        |
| {{< component-link name="batchprocessor" type="processor" repo="core" >}}                   | contrib, core, K8s         | beta         | beta           | beta        |
| {{< component-link name="coralogixprocessor" type="processor" repo="contrib" >}}            | contrib                    | alpha        | -              | -           |
| {{< component-link name="cumulativetodeltaprocessor" type="processor" repo="contrib" >}}    | contrib, K8s               | -            | beta           | -           |
| {{< component-link name="datadogsemanticsprocessor" type="processor" repo="contrib" >}}     | contrib                    | deprecated   | -              | -           |
| {{< component-link name="deltatocumulativeprocessor" type="processor" repo="contrib" >}}    | contrib, K8s               | -            | alpha          | -           |
| {{< component-link name="deltatorateprocessor" type="processor" repo="contrib" >}}          | contrib, K8s               | -            | alpha          | -           |
| {{< component-link name="dnslookupprocessor" type="processor" repo="contrib" >}}            | contrib                    | development  | development    | development |
| {{< component-link name="filterprocessor" type="processor" repo="contrib" >}}               | contrib, core, K8s         | alpha        | alpha          | alpha       |
| {{< component-link name="geoipprocessor" type="processor" repo="contrib" >}}                | contrib                    | alpha        | alpha          | alpha       |
| {{< component-link name="groupbyattrsprocessor" type="processor" repo="contrib" >}}         | contrib, K8s               | beta         | beta           | beta        |
| {{< component-link name="groupbytraceprocessor" type="processor" repo="contrib" >}}         | contrib, K8s               | beta         | -              | -           |
| {{< component-link name="intervalprocessor" type="processor" repo="contrib" >}}             | contrib, K8s               | -            | alpha          | -           |
| {{< component-link name="isolationforestprocessor" type="processor" repo="contrib" >}}      | contrib                    | alpha        | alpha          | alpha       |
| {{< component-link name="k8sattributesprocessor" type="processor" repo="contrib" >}}        | contrib, K8s               | beta         | beta           | beta        |
| {{< component-link name="logdedupprocessor" type="processor" repo="contrib" >}}             | contrib, K8s               | -            | -              | alpha       |
| {{< component-link name="logstransformprocessor" type="processor" repo="contrib" >}}        | contrib                    | -            | -              | development |
| {{< component-link name="lookupprocessor" type="processor" repo="contrib" >}}               | contrib                    | -            | -              | development |
| {{< component-link name="memorylimiterprocessor" type="processor" repo="core" >}}           | contrib, core, K8s         | beta         | beta           | beta        |
| {{< component-link name="metricsgenerationprocessor" type="processor" repo="contrib" >}}    | contrib                    | -            | alpha          | -           |
| {{< component-link name="metricstarttimeprocessor" type="processor" repo="contrib" >}}      | contrib                    | -            | beta           | -           |
| {{< component-link name="metricstransformprocessor" type="processor" repo="contrib" >}}     | contrib, K8s               | -            | beta           | -           |
| {{< component-link name="probabilisticsamplerprocessor" type="processor" repo="contrib" >}} | contrib, core, K8s         | beta         | -              | alpha       |
| {{< component-link name="redactionprocessor" type="processor" repo="contrib" >}}            | contrib, K8s               | beta         | alpha          | alpha       |
| {{< component-link name="remotetapprocessor" type="processor" repo="contrib" >}}            | contrib, K8s               | alpha        | alpha          | alpha       |
| {{< component-link name="resourcedetectionprocessor" type="processor" repo="contrib" >}}    | contrib, K8s               | beta         | beta           | beta        |
| {{< component-link name="resourceprocessor" type="processor" repo="contrib" >}}             | contrib, core, K8s         | beta         | beta           | beta        |
| {{< component-link name="schemaprocessor" type="processor" repo="contrib" >}}               | contrib                    | development  | development    | development |
| {{< component-link name="spanprocessor" type="processor" repo="contrib" >}}                 | contrib, core              | alpha        | -              | -           |
| {{< component-link name="sumologicprocessor" type="processor" repo="contrib" >}}            | contrib                    | beta         | beta           | beta        |
| {{< component-link name="tailsamplingprocessor" type="processor" repo="contrib" >}}         | contrib, K8s               | beta         | -              | -           |
| {{< component-link name="transformprocessor" type="processor" repo="contrib" >}}            | contrib, K8s               | beta         | beta           | beta        |
| {{< component-link name="unrollprocessor" type="processor" repo="contrib" >}}               | contrib                    | -            | -              | alpha       |

[^1]: このコンポーネントが含まれている[ディストリビューション](/docs/collector/distributions/)（core、contrib、K8sなど）を示します。

[^2]: コンポーネントの安定性レベルの詳細については、[OpenTelemetry Collectorコンポーネントの安定性の定義](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md)を参照してください。

<!-- END GENERATED: processor-table SOURCE: scripts/collector-sync -->
