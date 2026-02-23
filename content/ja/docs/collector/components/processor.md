---
title: プロセッサー
description: OpenTelemetry Collectorで利用可能なプロセッサーの一覧
weight: 320
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
drifted_from_default: true
# prettier-ignore
cSpell:ignore: attributesprocessor batchprocessor coralogixprocessor cumulativetodeltaprocessor datadogsemanticsprocessor deltatocumulativeprocessor deltatorateprocessor dnslookupprocessor filterprocessor geoipprocessor groupbyattrsprocessor groupbytraceprocessor intervalprocessor isolationforestprocessor logdedupprocessor logstransformprocessor memorylimiterprocessor metricsgenerationprocessor metricstarttimeprocessor metricstransformprocessor probabilisticsamplerprocessor redactionprocessor remotetapprocessor resourcedetectionprocessor resourceprocessor sattributesprocessor schemaprocessor spanprocessor sumologicprocessor tailsamplingprocessor transformprocessor unrollprocessor xprocessor
---

プロセッサーは、パイプラインを通過するテレメトリーデータを変換、フィルタリング、強化します。
プロセッサーの詳細な設定方法については、[Collectorの設定ドキュメント](/docs/collector/configuration/#processors)を参照してください。

<!-- BEGIN GENERATED: processor-table -->

| 名前                                                                                                                                                 | ディストリビューション[^1] | トレース[^2] | メトリクス[^2] | ログ[^2]    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------ | -------------- | ----------- |
| [attributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor)                     | contrib, core, K8s         | beta         | beta           | beta        |
| [batchprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor)                                       | contrib, core, K8s         | beta         | beta           | beta        |
| [coralogixprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/coralogixprocessor)                       | contrib                    | alpha        | -              | -           |
| [cumulativetodeltaprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/cumulativetodeltaprocessor)       | contrib, K8s               | -            | beta           | -           |
| [datadogsemanticsprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/datadogsemanticsprocessor)         | contrib                    | development  | -              | -           |
| [deltatocumulativeprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/deltatocumulativeprocessor)       | contrib, K8s               | -            | alpha          | -           |
| [deltatorateprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/deltatorateprocessor)                   | contrib, K8s               | -            | alpha          | -           |
| [dnslookupprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/dnslookupprocessor)                       | contrib                    | development  | development    | development |
| [filterprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)                             | contrib, core, K8s         | alpha        | alpha          | alpha       |
| [geoipprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/geoipprocessor)                               | contrib                    | alpha        | alpha          | alpha       |
| [groupbyattrsprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/groupbyattrsprocessor)                 | contrib, K8s               | beta         | beta           | beta        |
| [groupbytraceprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/groupbytraceprocessor)                 | contrib, K8s               | beta         | -              | -           |
| [intervalprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/intervalprocessor)                         | contrib, K8s               | -            | alpha          | -           |
| [isolationforestprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/isolationforestprocessor)           | contrib                    | alpha        | alpha          | alpha       |
| [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)               | contrib, K8s               | beta         | beta           | beta        |
| [logdedupprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/logdedupprocessor)                         | contrib, K8s               | -            | -              | alpha       |
| [logstransformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/logstransformprocessor)               | contrib                    | -            | -              | development |
| [memorylimiterprocessor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/memorylimiterprocessor)                       | contrib, core, K8s         | beta         | beta           | beta        |
| [metricsgenerationprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricsgenerationprocessor)       | contrib                    | -            | alpha          | -           |
| [metricstarttimeprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstarttimeprocessor)           | contrib                    | -            | beta           | -           |
| [metricstransformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)         | contrib, K8s               | -            | beta           | -           |
| [probabilisticsamplerprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/probabilisticsamplerprocessor) | contrib, core, K8s         | beta         | -              | alpha       |
| [redactionprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)                       | contrib, K8s               | beta         | alpha          | alpha       |
| [remotetapprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/remotetapprocessor)                       | contrib, K8s               | alpha        | alpha          | alpha       |
| [resourcedetectionprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)       | contrib, K8s               | beta         | beta           | beta        |
| [resourceprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourceprocessor)                         | contrib, core, K8s         | beta         | beta           | beta        |
| [schemaprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/schemaprocessor)                             | contrib                    | development  | development    | development |
| [spanprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/spanprocessor)                                 | contrib, core              | alpha        | -              | -           |
| [sumologicprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/sumologicprocessor)                       | contrib                    | beta         | beta           | beta        |
| [tailsamplingprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor)                 | contrib, K8s               | beta         | -              | -           |
| [transformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)                       | contrib, K8s               | beta         | beta           | beta        |
| [unrollprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/unrollprocessor)                             | contrib                    | -            | -              | alpha       |

⚠️ **注意:** ⚠️ マークが付いているコンポーネントはメンテナンスされておらず、アクティブなコードオーナーがいません。
それらのコンポーネントは定期的な更新やバグ修正を受け付けていない可能性があります。

[^1]: このコンポーネントが含まれている[ディストリビューション](/docs/collector/distributions/)（core、contrib、K8sなど）を示します。

[^2]: コンポーネントの安定性レベルの詳細については、[OpenTelemetry Collectorコンポーネントの安定性の定義](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md)を参照してください。

<!-- END GENERATED: processor-table -->
