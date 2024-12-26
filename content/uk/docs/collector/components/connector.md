---
title: Конектори
description: Список доступних конекторів OpenTelemetry Collector
weight: 340
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: countconnector datadogconnector exceptionsconnector failoverconnector forwardconnector grafanacloudconnector metricsaslogsconnector otlpjsonconnector roundrobinconnector routingconnector servicegraphconnector signaltometricsconnector slowsqlconnector spanmetricsconnector sumconnector
---

Конектори зʼєднують два конвеєри, виступаючи одночасно в ролі експортера та приймача. Докладнішу інформацію про налаштування конекторів див. у [документації з налаштування колектора](/docs/collector/configuration/#connectors).

<!-- BEGIN GENERATED: connector-table SOURCE: scripts/collector-sync -->

| Назва                                                                                  | Дистрибутив[^1]    |
| -------------------------------------------------------------------------------------- | ------------------ |
| {{< component-link name="countconnector" type="connector" repo="contrib" >}}           | contrib, K8s       |
| {{< component-link name="datadogconnector" type="connector" repo="contrib" >}}         | contrib            |
| {{< component-link name="exceptionsconnector" type="connector" repo="contrib" >}}      | contrib, K8s       |
| {{< component-link name="failoverconnector" type="connector" repo="contrib" >}}        | contrib, K8s       |
| {{< component-link name="forwardconnector" type="connector" repo="core" >}}            | contrib, core, K8s |
| {{< component-link name="grafanacloudconnector" type="connector" repo="contrib" >}}    | contrib            |
| {{< component-link name="metricsaslogsconnector" type="connector" repo="contrib" >}}   | contrib            |
| {{< component-link name="otlpjsonconnector" type="connector" repo="contrib" >}}        | contrib, K8s       |
| {{< component-link name="roundrobinconnector" type="connector" repo="contrib" >}}      | contrib, K8s       |
| {{< component-link name="routingconnector" type="connector" repo="contrib" >}}         | contrib, K8s       |
| {{< component-link name="servicegraphconnector" type="connector" repo="contrib" >}}    | contrib, K8s       |
| {{< component-link name="signaltometricsconnector" type="connector" repo="contrib" >}} | contrib            |
| {{< component-link name="slowsqlconnector" type="connector" repo="contrib" >}}         | contrib            |
| {{< component-link name="spanmetricsconnector" type="connector" repo="contrib" >}}     | contrib            |
| {{< component-link name="sumconnector" type="connector" repo="contrib" >}}             | contrib            |

[^1]: Показує, які [дистрибутиви](/docs/collector/distributions/) (core, contrib, K8s тощо) містять цей компонент.

<!-- END GENERATED: connector-table SOURCE: scripts/collector-sync -->
