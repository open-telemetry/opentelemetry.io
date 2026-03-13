---
title: レシーバー
description: OpenTelemetry Collectorの利用可能なレシーバーの一覧
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762 # patched
drifted_from_default: true
weight: 310
# prettier-ignore
cSpell:ignore: activedirectorydsreceiver aerospikereceiver apachereceiver apachesparkreceiver awscloudwatchreceiver awscontainerinsightreceiver awsecscontainermetricsreceiver awsfirehosereceiver awslambdareceiver awss awsxrayreceiver azureblobreceiver azureeventhubreceiver azuremonitorreceiver carbonreceiver chronyreceiver ciscoosreceiver cloudflarereceiver cloudfoundryreceiver collectdreceiver couchdbreceiver datadogreceiver dockerstatsreceiver elasticsearchreceiver envoyalsreceiver expvarreceiver faroreceiver filelogreceiver filestatsreceiver flinkmetricsreceiver fluentforwardreceiver githubreceiver gitlabreceiver googlecloudmonitoringreceiver googlecloudpubsubpushreceiver googlecloudpubsubreceiver googlecloudspannerreceiver haproxyreceiver hostmetricsreceiver httpcheckreceiver huaweicloudcesreceiver icmpcheckreceiver iisreceiver influxdbreceiver jaegerreceiver jmxreceiver journaldreceiver kafkametricsreceiver kafkareceiver kubeletstatsreceiver libhoneyreceiver lokireceiver memcachedreceiver mongodbatlasreceiver mongodbreceiver mysqlreceiver namedpipereceiver netflowreceiver nginxreceiver nopreceiver nsxtreceiver ntpreceiver oracledbreceiver osqueryreceiver otelarrowreceiver otlpjsonfilereceiver otlpreceiver podmanreceiver postgresqlreceiver pprofreceiver prometheusreceiver prometheusremotewritereceiver pulsarreceiver purefareceiver purefbreceiver rabbitmqreceiver receivercreator redfishreceiver redisreceiver riakreceiver saphanareceiver sclusterreceiver seventsreceiver signalfxreceiver simpleprometheusreceiver skywalkingreceiver slogreceiver snmpreceiver snowflakereceiver sobjectsreceiver solacereceiver splunkenterprisereceiver splunkhecreceiver sqlqueryreceiver sqlserverreceiver sshcheckreceiver statsdreceiver stefreceiver syslogreceiver systemdreceiver tcpcheckreceiver tcplogreceiver tlscheckreceiver udplogreceiver vcenterreceiver wavefrontreceiver webhookeventreceiver windowseventlogreceiver windowsperfcountersreceiver windowsservicereceiver xreceiver yanggrpcreceiver zipkinreceiver zookeeperreceiver
---

レシーバーは、さまざまなソースとフォーマットからテレメトリーデータを収集します。
レシーバーの詳細な設定方法については、[コレクターの設定ドキュメント](/docs/collector/configuration/#receivers)を参照してください。

{{% include unmaintained-components-msg.md %}}

<!-- BEGIN GENERATED: receiver-table SOURCE: scripts/collector-sync -->

| 名前                                                                                                                                                  | ディストリビューション[^1] | トレース[^2] | メトリクス[^2] | ログ[^2]    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------ | -------------- | ----------- |
| {{< component-link name="activedirectorydsreceiver" type="receiver" repo="contrib" >}}      | contrib                  | -           | beta        | -            |
| {{< component-link name="aerospikereceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | alpha       | -            |
| {{< component-link name="apachereceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | beta        | -            |
| {{< component-link name="apachesparkreceiver" type="receiver" repo="contrib" >}}            | contrib                  | -           | alpha       | -            |
| {{< component-link name="awscloudwatchreceiver" type="receiver" repo="contrib" >}}          | contrib                  | -           | -           | alpha        |
| {{< component-link name="awscontainerinsightreceiver" type="receiver" repo="contrib" >}}    | contrib                  | -           | beta        | -            |
| {{< component-link name="awsecscontainermetricsreceiver" type="receiver" repo="contrib" >}} | contrib                  | -           | beta        | -            |
| {{< component-link name="awsfirehosereceiver" type="receiver" repo="contrib" >}}            | contrib                  | -           | alpha       | alpha        |
| {{< component-link name="awslambdareceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | development | development  |
| {{< component-link name="awss3receiver" type="receiver" repo="contrib" >}}                  | contrib                  | alpha       | alpha       | alpha        |
| {{< component-link name="awsxrayreceiver" type="receiver" repo="contrib" >}}                | contrib                  | beta        | -           | -            |
| {{< component-link name="azureblobreceiver" type="receiver" repo="contrib" >}}              | contrib                  | alpha       | -           | alpha        |
| {{< component-link name="azureeventhubreceiver" type="receiver" repo="contrib" >}}          | contrib                  | beta        | beta        | beta         |
| {{< component-link name="azuremonitorreceiver" type="receiver" repo="contrib" >}}           | contrib                  | -           | alpha       | -            |
| {{< component-link name="carbonreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | beta        | -            |
| {{< component-link name="chronyreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | beta        | -            |
| {{< component-link name="ciscoosreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | alpha       | -            |
| {{< component-link name="cloudflarereceiver" type="receiver" repo="contrib" >}}             | contrib                  | -           | -           | alpha        |
| {{< component-link name="cloudfoundryreceiver" type="receiver" repo="contrib" >}}           | contrib                  | -           | beta        | development  |
| {{< component-link name="collectdreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | beta        | -            |
| {{< component-link name="couchdbreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | beta        | -            |
| {{< component-link name="datadogreceiver" type="receiver" repo="contrib" >}}                | contrib                  | alpha       | alpha       | alpha        |
| {{< component-link name="dockerstatsreceiver" type="receiver" repo="contrib" >}}            | contrib                  | -           | alpha       | -            |
| {{< component-link name="elasticsearchreceiver" type="receiver" repo="contrib" >}}          | contrib                  | -           | beta        | -            |
| {{< component-link name="envoyalsreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | -           | alpha        |
| {{< component-link name="expvarreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | alpha       | -            |
| {{< component-link name="faroreceiver" type="receiver" repo="contrib" >}}                   | contrib                  | alpha       | -           | alpha        |
| {{< component-link name="filelogreceiver" type="receiver" repo="contrib" >}}                | contrib, K8s             | -           | -           | beta         |
| {{< component-link name="filestatsreceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | beta        | -            |
| {{< component-link name="flinkmetricsreceiver" type="receiver" repo="contrib" >}}           | contrib                  | -           | alpha       | -            |
| {{< component-link name="fluentforwardreceiver" type="receiver" repo="contrib" >}}          | contrib, K8s             | -           | -           | beta         |
| {{< component-link name="githubreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | development | alpha       | -            |
| {{< component-link name="gitlabreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | alpha       | -           | -            |
| {{< component-link name="googlecloudmonitoringreceiver" type="receiver" repo="contrib" >}}  | contrib                  | -           | alpha       | -            |
| {{< component-link name="googlecloudpubsubpushreceiver" type="receiver" repo="contrib" >}}  | contrib                  | -           | -           | development  |
| {{< component-link name="googlecloudpubsubreceiver" type="receiver" repo="contrib" >}}      | contrib                  | beta        | beta        | beta         |
| {{< component-link name="googlecloudspannerreceiver" type="receiver" repo="contrib" >}}     | contrib                  | -           | beta        | -            |
| {{< component-link name="haproxyreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | beta        | -            |
| {{< component-link name="hostmetricsreceiver" type="receiver" repo="contrib" >}}            | contrib, core, K8s       | -           | beta        | development  |
| {{< component-link name="httpcheckreceiver" type="receiver" repo="contrib" >}}              | contrib, K8s             | -           | alpha       | -            |
| {{< component-link name="huaweicloudcesreceiver" type="receiver" repo="contrib" >}}         | contrib                  | -           | alpha       | -            |
| {{< component-link name="icmpcheckreceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | development | -            |
| {{< component-link name="iisreceiver" type="receiver" repo="contrib" >}}                    | contrib                  | -           | beta        | -            |
| {{< component-link name="influxdbreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | beta        | -            |
| {{< component-link name="jaegerreceiver" type="receiver" repo="contrib" >}}                 | contrib, core, K8s       | beta        | -           | -            |
| {{< component-link name="jmxreceiver" type="receiver" repo="contrib" >}}                    | contrib                  | -           | deprecated  | -            |
| {{< component-link name="journaldreceiver" type="receiver" repo="contrib" >}}               | contrib, K8s             | -           | -           | alpha        |
| {{< component-link name="k8sclusterreceiver" type="receiver" repo="contrib" >}}             | contrib, K8s             | -           | beta        | development  |
| {{< component-link name="k8seventsreceiver" type="receiver" repo="contrib" >}}              | contrib, K8s             | -           | -           | alpha        |
| {{< component-link name="k8slogreceiver" type="receiver" repo="contrib" >}} ⚠️              | contrib                  | -           | -           | unmaintained |
| {{< component-link name="k8sobjectsreceiver" type="receiver" repo="contrib" >}}             | contrib, K8s             | -           | -           | beta         |
| {{< component-link name="kafkametricsreceiver" type="receiver" repo="contrib" >}}           | contrib                  | -           | beta        | -            |
| {{< component-link name="kafkareceiver" type="receiver" repo="contrib" >}}                  | contrib, core            | beta        | beta        | beta         |
| {{< component-link name="kubeletstatsreceiver" type="receiver" repo="contrib" >}}           | contrib, K8s             | -           | beta        | -            |
| {{< component-link name="libhoneyreceiver" type="receiver" repo="contrib" >}}               | contrib                  | alpha       | -           | alpha        |
| {{< component-link name="lokireceiver" type="receiver" repo="contrib" >}}                   | contrib                  | -           | -           | alpha        |
| {{< component-link name="macosunifiedloggingreceiver" type="receiver" repo="contrib" >}}    | contrib                  | -           | -           | alpha        |
| {{< component-link name="memcachedreceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | beta        | -            |
| {{< component-link name="mongodbatlasreceiver" type="receiver" repo="contrib" >}}           | contrib                  | -           | beta        | beta         |
| {{< component-link name="mongodbreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | beta        | -            |
| {{< component-link name="mysqlreceiver" type="receiver" repo="contrib" >}}                  | contrib                  | -           | beta        | development  |
| {{< component-link name="namedpipereceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | -           | alpha        |
| {{< component-link name="netflowreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | -           | alpha        |
| {{< component-link name="nginxreceiver" type="receiver" repo="contrib" >}}                  | contrib                  | -           | beta        | -            |
| {{< component-link name="nopreceiver" type="receiver" repo="core" >}}                       | contrib, core            | beta        | beta        | beta         |
| {{< component-link name="nsxtreceiver" type="receiver" repo="contrib" >}}                   | contrib                  | -           | alpha       | -            |
| {{< component-link name="ntpreceiver" type="receiver" repo="contrib" >}}                    | contrib                  | -           | beta        | -            |
| {{< component-link name="oracledbreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | alpha       | development  |
| {{< component-link name="osqueryreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | -           | development  |
| {{< component-link name="otelarrowreceiver" type="receiver" repo="contrib" >}}              | contrib, K8s             | beta        | beta        | beta         |
| {{< component-link name="otlpjsonfilereceiver" type="receiver" repo="contrib" >}}           | contrib                  | alpha       | alpha       | alpha        |
| {{< component-link name="otlpreceiver" type="receiver" repo="core" >}}                      | contrib, core, K8s, otlp | stable      | stable      | stable       |
| {{< component-link name="podmanreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | alpha       | -            |
| {{< component-link name="postgresqlreceiver" type="receiver" repo="contrib" >}}             | contrib                  | -           | beta        | development  |
| {{< component-link name="pprofreceiver" type="receiver" repo="contrib" >}}                  | contrib                  | -           | -           | -            |
| {{< component-link name="prometheusreceiver" type="receiver" repo="contrib" >}}             | contrib, core, K8s       | -           | beta        | -            |
| {{< component-link name="prometheusremotewritereceiver" type="receiver" repo="contrib" >}}  | contrib                  | -           | alpha       | -            |
| {{< component-link name="pulsarreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | alpha       | alpha       | alpha        |
| {{< component-link name="purefareceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | alpha       | -            |
| {{< component-link name="purefbreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | alpha       | -            |
| {{< component-link name="rabbitmqreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | beta        | -            |
| {{< component-link name="receivercreator" type="receiver" repo="contrib" >}}                | contrib, K8s             | alpha       | beta        | alpha        |
| {{< component-link name="redfishreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | development | -            |
| {{< component-link name="redisreceiver" type="receiver" repo="contrib" >}}                  | contrib                  | -           | beta        | -            |
| {{< component-link name="riakreceiver" type="receiver" repo="contrib" >}}                   | contrib                  | -           | beta        | -            |
| {{< component-link name="saphanareceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | alpha       | -            |
| {{< component-link name="signalfxreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | deprecated  | deprecated   |
| {{< component-link name="simpleprometheusreceiver" type="receiver" repo="contrib" >}}       | contrib                  | -           | beta        | -            |
| {{< component-link name="skywalkingreceiver" type="receiver" repo="contrib" >}}             | contrib                  | beta        | development | -            |
| {{< component-link name="snmpreceiver" type="receiver" repo="contrib" >}}                   | contrib                  | -           | alpha       | -            |
| {{< component-link name="snowflakereceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | alpha       | -            |
| {{< component-link name="solacereceiver" type="receiver" repo="contrib" >}}                 | contrib                  | beta        | -           | -            |
| {{< component-link name="splunkenterprisereceiver" type="receiver" repo="contrib" >}}       | contrib                  | -           | alpha       | -            |
| {{< component-link name="splunkhecreceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | beta        | beta         |
| {{< component-link name="sqlqueryreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | alpha       | development  |
| {{< component-link name="sqlserverreceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | beta        | development  |
| {{< component-link name="sshcheckreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | beta        | -            |
| {{< component-link name="statsdreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | beta        | -            |
| {{< component-link name="stefreceiver" type="receiver" repo="contrib" >}}                   | contrib                  | -           | alpha       | -            |
| {{< component-link name="syslogreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | -           | beta         |
| {{< component-link name="systemdreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | alpha       | -            |
| {{< component-link name="tcpcheckreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | alpha       | -            |
| {{< component-link name="tcplogreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | -           | alpha        |
| {{< component-link name="tlscheckreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | alpha       | -            |
| {{< component-link name="udplogreceiver" type="receiver" repo="contrib" >}}                 | contrib                  | -           | -           | alpha        |
| {{< component-link name="vcenterreceiver" type="receiver" repo="contrib" >}}                | contrib                  | -           | alpha       | -            |
| {{< component-link name="vcrreceiver" type="receiver" repo="contrib" >}}                    | contrib                  | development | development | development  |
| {{< component-link name="wavefrontreceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | deprecated  | -            |
| {{< component-link name="webhookeventreceiver" type="receiver" repo="contrib" >}}           | contrib                  | -           | -           | beta         |
| {{< component-link name="windowseventlogreceiver" type="receiver" repo="contrib" >}}        | contrib                  | -           | -           | alpha        |
| {{< component-link name="windowsperfcountersreceiver" type="receiver" repo="contrib" >}}    | contrib                  | -           | beta        | -            |
| {{< component-link name="windowsservicereceiver" type="receiver" repo="contrib" >}}         | contrib                  | -           | development | -            |
| {{< component-link name="yanggrpcreceiver" type="receiver" repo="contrib" >}}               | contrib                  | -           | alpha       | -            |
| {{< component-link name="zipkinreceiver" type="receiver" repo="contrib" >}}                 | contrib, core, K8s       | beta        | -           | -            |
| {{< component-link name="zookeeperreceiver" type="receiver" repo="contrib" >}}              | contrib                  | -           | alpha       | -            |

[^1]: このコンポーネントが含まれている[ディストリビューション](/docs/collector/distributions/)（core、contrib、K8sなど）を示します。

[^2]: コンポーネントの安定性レベルの詳細については、[OpenTelemetry Collectorコンポーネントの安定性の定義](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md)を参照してください。

<!-- END GENERATED: receiver-table SOURCE: scripts/collector-sync -->
