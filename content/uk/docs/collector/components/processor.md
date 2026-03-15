---
title: Процесори
description: Список доступних процесорів  OpenTelemetry Collector
weight: 320
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: attributesprocessor batchprocessor coralogixprocessor cumulativetodeltaprocessor datadogsemanticsprocessor deltatocumulativeprocessor deltatorateprocessor dnslookupprocessor filterprocessor geoipprocessor groupbyattrsprocessor groupbytraceprocessor intervalprocessor isolationforestprocessor logdedupprocessor logstransformprocessor lookupprocessor memorylimiterprocessor metricsgenerationprocessor metricstarttimeprocessor metricstransformprocessor probabilisticsamplerprocessor redactionprocessor remotetapprocessor resourcedetectionprocessor resourceprocessor sattributesprocessor schemaprocessor spanprocessor sumologicprocessor tailsamplingprocessor transformprocessor unrollprocessor xprocessor
---

Процесори перетворюють, фільтрують та збагачують телеметричні дані під час їх проходження по конвеєру. Докладнішу інформацію про налаштування процесорів див. у [документації з налаштування колектора](/docs/collector/configuration/#processors).

<!-- BEGIN GENERATED: processor-table SOURCE: scripts/collector-sync -->

| Назва                                                                                       | Дистрибутив[^1]    | Трейси[^2]  | Метрики[^2] | Логи[^2]    |
| ------------------------------------------------------------------------------------------- | ------------------ | ----------- | ----------- | ----------- |
| {{< component-link name="attributesprocessor" type="processor" repo="contrib" >}}           | contrib, core, K8s | beta        | beta        | beta        |
| {{< component-link name="batchprocessor" type="processor" repo="core" >}}                   | contrib, core, K8s | beta        | beta        | beta        |
| {{< component-link name="coralogixprocessor" type="processor" repo="contrib" >}}            | contrib            | alpha       | -           | -           |
| {{< component-link name="cumulativetodeltaprocessor" type="processor" repo="contrib" >}}    | contrib, K8s       | -           | beta        | -           |
| {{< component-link name="datadogsemanticsprocessor" type="processor" repo="contrib" >}}     | contrib            | deprecated  | -           | -           |
| {{< component-link name="deltatocumulativeprocessor" type="processor" repo="contrib" >}}    | contrib, K8s       | -           | alpha       | -           |
| {{< component-link name="deltatorateprocessor" type="processor" repo="contrib" >}}          | contrib, K8s       | -           | alpha       | -           |
| {{< component-link name="dnslookupprocessor" type="processor" repo="contrib" >}}            | contrib            | development | development | development |
| {{< component-link name="filterprocessor" type="processor" repo="contrib" >}}               | contrib, core, K8s | alpha       | alpha       | alpha       |
| {{< component-link name="geoipprocessor" type="processor" repo="contrib" >}}                | contrib            | alpha       | alpha       | alpha       |
| {{< component-link name="groupbyattrsprocessor" type="processor" repo="contrib" >}}         | contrib, K8s       | beta        | beta        | beta        |
| {{< component-link name="groupbytraceprocessor" type="processor" repo="contrib" >}}         | contrib, K8s       | beta        | -           | -           |
| {{< component-link name="intervalprocessor" type="processor" repo="contrib" >}}             | contrib, K8s       | -           | alpha       | -           |
| {{< component-link name="isolationforestprocessor" type="processor" repo="contrib" >}}      | contrib            | alpha       | alpha       | alpha       |
| {{< component-link name="k8sattributesprocessor" type="processor" repo="contrib" >}}        | contrib, K8s       | beta        | beta        | beta        |
| {{< component-link name="logdedupprocessor" type="processor" repo="contrib" >}}             | contrib, K8s       | -           | -           | alpha       |
| {{< component-link name="logstransformprocessor" type="processor" repo="contrib" >}}        | contrib            | -           | -           | development |
| {{< component-link name="lookupprocessor" type="processor" repo="contrib" >}}               | contrib            | -           | -           | development |
| {{< component-link name="memorylimiterprocessor" type="processor" repo="core" >}}           | contrib, core, K8s | beta        | beta        | beta        |
| {{< component-link name="metricsgenerationprocessor" type="processor" repo="contrib" >}}    | contrib            | -           | alpha       | -           |
| {{< component-link name="metricstarttimeprocessor" type="processor" repo="contrib" >}}      | contrib            | -           | beta        | -           |
| {{< component-link name="metricstransformprocessor" type="processor" repo="contrib" >}}     | contrib, K8s       | -           | beta        | -           |
| {{< component-link name="probabilisticsamplerprocessor" type="processor" repo="contrib" >}} | contrib, core, K8s | beta        | -           | alpha       |
| {{< component-link name="redactionprocessor" type="processor" repo="contrib" >}}            | contrib, K8s       | beta        | alpha       | alpha       |
| {{< component-link name="remotetapprocessor" type="processor" repo="contrib" >}}            | contrib, K8s       | alpha       | alpha       | alpha       |
| {{< component-link name="resourcedetectionprocessor" type="processor" repo="contrib" >}}    | contrib, K8s       | beta        | beta        | beta        |
| {{< component-link name="resourceprocessor" type="processor" repo="contrib" >}}             | contrib, core, K8s | beta        | beta        | beta        |
| {{< component-link name="schemaprocessor" type="processor" repo="contrib" >}}               | contrib            | development | development | development |
| {{< component-link name="spanprocessor" type="processor" repo="contrib" >}}                 | contrib, core      | alpha       | -           | -           |
| {{< component-link name="sumologicprocessor" type="processor" repo="contrib" >}}            | contrib            | beta        | beta        | beta        |
| {{< component-link name="tailsamplingprocessor" type="processor" repo="contrib" >}}         | contrib, K8s       | beta        | -           | -           |
| {{< component-link name="transformprocessor" type="processor" repo="contrib" >}}            | contrib, K8s       | beta        | beta        | beta        |
| {{< component-link name="unrollprocessor" type="processor" repo="contrib" >}}               | contrib            | -           | -           | alpha       |

[^1]: Показує, які [дистрибутиви](/docs/collector/distributions/) (core, contrib, K8s тощо) містять цей компонент.

[^2]: Детальнішу інформацію про рівні стабільності компонентів див. у [Визначеннях стабільності компонентів OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md).

<!-- END GENERATED: processor-table SOURCE: scripts/collector-sync -->
