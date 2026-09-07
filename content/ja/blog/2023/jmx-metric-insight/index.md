---
title: OpenTelemetry Java エージェントで JMX メトリクスのインサイトを得る
linkTitle: JMX Metric Insight
date: 2023-01-17
author: '[Samudraneel Dasgupta](https://github.com/Samudraneel24) (Cisco)'
default_lang_commit: b294b8a5c77561eeaf2363176b72ad43bbdbec14
cSpell:ignore: -Dapplication -Dotel Dasgupta Samudraneel Singlestat
---

[JMX](https://www.oracle.com/technical-resources/articles/javase/jmx.html)（Java Management Extensions）は、Java ベースのアプリケーションを管理・監視する方法を提供する技術です。
JMX メトリクスからは、アプリケーションのパフォーマンスやリソース使用状況に関する詳細な情報を得ることができます。
このデータを活用して、アプリケーションの傾向や潜在的な問題を特定し、深刻な問題になる前に対処することができます。
問題が発生した場合でも、収集したメトリクスを使って診断し、最適なパフォーマンスを得るためにシステムを調整できます。

[JMX Metric Insight](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/61d1e53727bede6e5289fd996ea3c95ee89c4bb6/instrumentation/jmx-metrics?from_branch=main) モジュールが [OpenTelemetry Java エージェント](https://github.com/open-telemetry/opentelemetry-java-instrumentation)に追加されたことで、アプリケーションの監視のために JMX メトリクスを収集する専用のサービスを別途デプロイする必要がなくなりました。
エージェントは、計装対象のアプリケーション内で利用可能なローカルの [MBean](https://docs.oracle.com/javase/tutorial/jmx/mbeans/index.html) を通じて、アプリケーションサーバーが公開するメトリクスをネイティブに収集・エクスポートできるようになりました。
必要な MBean と対応するメトリクスは、YAML 設定ファイルを使って記述できます。
個別のメトリクス設定により、正確なメトリクスの選択と識別が可能です。
JMX Metric Insight には、以下のような一般的なアプリケーションサーバーやフレームワーク向けに厳選された JMX メトリクスセットを含む、いくつかの事前定義済み設定が付属しています。

- [ActiveMQ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/09671184832be2ca5a8356a5753a001a49a300b8/instrumentation/jmx-metrics/javaagent/activemq.md?from_branch=main)
- [Hadoop](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/3df64dabf914606bebb74dbf83fc45021b773368/instrumentation/jmx-metrics/javaagent/hadoop.md?from_branch=main)
- [Jetty](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/e4547d427d4ca69c4cee9912263ac988775b7771/instrumentation/jmx-metrics/javaagent/jetty.md?from_branch=main)
- [Kafka Broker](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/2bdddafdc49d17d8e5482f4f97b782afe85884d3/instrumentation/jmx-metrics/javaagent/kafka-broker.md?from_branch=main)
- [Tomcat](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/4ec198fbadeadd1dd53bd07ecd356239c577efd4/instrumentation/jmx-metrics/javaagent/tomcat.md?from_branch=main)
- [WildFly](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/39a68b068d88e6389824b5ae406c8f8c9e344b96/instrumentation/jmx-metrics/javaagent/wildfly.md?from_branch=main)

独自のメトリクス定義を1つ以上の YAML ファイルで提供することもできます。
詳細については、[YAML ファイルの構文ドキュメント](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/bc8deee72a88bc7cccb401adde14a422ca424dc4/instrumentation/jmx-metrics/javaagent?from_branch=main#configuration-files)を参照してください。

## Kafka Broker メトリクスを監視する {#observe-kafka-broker-metrics}

JMX Metric Insight モジュールを使用して事前定義済みのメトリクスセットをエクスポートし、Prometheus にエクスポートすることで、Kafka Broker の状態を監視してみましょう。

Kafka は macOS 上で Homebrew を使って以下の手順でインストールできます。

```shell
brew install kafka
```

Zookeeper を起動するには以下を実行します。

```shell
zookeeper-server-start /usr/local/etc/kafka/zookeeper.properties
```

### OpenTelemetry Java 計装エージェントのアタッチ {#attach-the-opentelemetry-java-instrumentation-agent}

Kafka Broker を起動する前に、`KAFKA_OPTS` 環境変数にオプションを指定して、OpenTelemetry Java 計装エージェントを Kafka Broker にアタッチします。
[エージェントの最新リリースをダウンロード](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases)できます。

```shell
export KAFKA_OPTS="-Dapplication.name=my-kafka-app
-Dotel.metrics.exporter=prometheus
-Dotel.exporter.prometheus.port=9464
-Dotel.service.name=my-kafka-broker
-Dotel.jmx.target.system=kafka-broker
-javaagent:/path/to/opentelemetry-javaagent.jar"
```

これで Kafka Broker を起動できます。

```shell
kafka-server-start /usr/local/etc/kafka/server.properties
```

Kafka Broker が起動して稼働しているはずです。
インストールをテストするために、トピックを作成し、Kafka コンソールプロデューサーとコンソールコンシューマーを使用できます。
Kafka トピックを作成します。

```shell
kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic my-test-topic
```

作成したトピックにメッセージを送信するために、Kafka コンソールプロデューサーを起動します。

```console
$ kafka-console-producer --broker-list localhost:9092 --topic test
>First message
>Second message
```

次に、トピックからメッセージを最初から消費する Kafka コンソールコンシューマーを起動します。

```console
$ kafka-console-consumer --bootstrap-server localhost:9092 --topic test --from-beginning
First message
Second message
```

コンシューマーが2つのメッセージを受信していることが確認できれば、Kafka のインストールが期待どおりに動作していることが検証できます。

### メトリクスを Prometheus にエクスポートする {#export-metrics-to-prometheus}

メトリクスは、サポートされているメトリクスエクスポーターのいずれかを使用して、任意のバックエンドにエクスポートできます。
エクスポーターとその設定オプションの完全なリストについては、[Properties: exporters](/docs/languages/java/configuration/#properties-exporters) を参照してください。

たとえば、OTLP エクスポーターを使用してメトリクスを OTel Collector にエクスポートし、いくつかの処理を行ってから、任意のバックエンドでメトリクスを利用できます。
この例では、簡単にするために、メトリクスを直接 Prometheus にエクスポートしています。

Prometheus をデータソースとして使用し、Grafana ダッシュボードでメトリクスを可視化します。
このデモでは、Prometheus を Docker 上にデプロイします。
以下の最小限の設定を含む `prometheus.yml` ファイルを作成します。

```yaml
global:
  scrape_interval: 10s
  evaluation_interval: 10s

scrape_configs:
  - job_name: my-kafka-broker
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
```

以下のコマンドを実行して、Docker 上に Prometheus をデプロイします。

```shell
docker run -d \
    -p 9090:9090 \
    -v path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

Prometheus コンテナが稼働しているはずです。
<http://localhost:9090> にアクセスして、Prometheus ダッシュボードを確認できます。
ここでは、Prometheus 上でメトリクス `kafka_request_count_total` を表示しています。

![Prometheus 上に表示された Kafka Broker メトリクスのサンプル](prometheus.png)

[Prometheus のインストールオプション](https://prometheus.io/docs/prometheus/latest/installation/)を参照してください。

### Grafana ダッシュボードでメトリクスを表示する {#view-the-metrics-on-a-grafana-dashboard}

次に、Prometheus メトリクスを Grafana ダッシュボードで可視化します。
まず、以下のコマンドで Grafana の Docker イメージを取得します。

```shell
docker run -d -p 3000:3000 grafana/grafana
```

<http://localhost:3000> にアクセスして、Grafana のホームページを確認できます。
Add Data Source をクリックして Prometheus を選択します。
HTTP URL を追加します。デフォルトは <http://localhost:9090> です。
その後、新しいダッシュボードを作成できます。可視化のオプションは Graph、Singlestat、Gauge、Table、Text など複数から選択できます。
新しいパネルを作成して、監視したいメトリクスを追加できます。
以下は6つのパネルで構成されたダッシュボードの例で、各パネルで1つのメトリクスを監視しています。
このダッシュボードで Kafka Broker の状態をリアルタイムに監視できます。

![6つの Kafka Broker メトリクスを表示する Grafana ダッシュボード](grafana.png)

## OTel デモアプリケーションにおける JMX Metric Insight {#jmx-metric-insight-in-the-otel-demo-application}

公式の [OpenTelemetry Astronomy shop デモアプリケーション](https://github.com/open-telemetry/opentelemetry-demo)も試すことができます。
チェックアウトサービスとアカウンティングサービスおよび不正検出サービスを接続する[メッセージキューサービス](https://github.com/open-telemetry/opentelemetry-demo/tree/65489fd5faaff8438832e41fa7b3577f37565022/src/kafka?from_branch=main)は、Kafka をベースにしており、JMX Metric Insight モジュールを利用して Kafka Broker メトリクスをすぐにエクスポートできます。
[ドキュメント](/docs/demo/services/kafka/)を参照してください。

![Prometheus ダッシュボードに表示された kafka_request_count メトリクス](kafka-request-count-dashboard.png)

![メトリクスエクスプローラーで表示された Kafka メトリクスのリスト](metrics-explorer.png)

## モジュールのさらなる機能 {#further-capabilities-of-the-module}

この例では、Kafka Broker 用の事前定義済みセットから一部のメトリクスのみを監視しました。
Kafka が公開するすべてのメトリクスがこのセットに含まれているわけではないため、事前定義済みセットに含まれていないメトリクスが必要でも心配ありません！
このモジュールでは、カスタムメトリクス定義の YAML ファイルを作成するオプションが提供されているため、MBean 属性として公開されている任意のメトリクスを監視できます。
YAML ファイルの構造を確認するために、[kafka-broker.yaml](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/aabd14fb6ea88a7122a5bfc10abbb3051e4abf54/instrumentation/jmx-metrics/javaagent/src/main/resources/jmx/rules/kafka-broker.yaml?from_branch=main) の一部を見てみましょう。

```yaml
---
rules:
  - bean: kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec
    mapping:
      Count:
        metric: kafka.message.count
        type: counter
        desc: The number of messages received by the broker
        unit: '{messages}'
```

各ファイルは複数のルールで構成できます。
各ルールは、オブジェクト名によって1つ以上の MBean のセットを識別できます。
この例では `kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec` が一意の MBean を識別しています。
この MBean の属性 `Count` に注目しており、`mapping` の下で指定されています。
報告されるメトリクスの名前は `kafka.message.count` で、計装タイプは `counter` で、メトリクスが単調増加する合計であることを示しています。
単位は `{messages}` です。
メトリクスの説明も提供しています。
この YAML セグメントはシンプルですが、より多くの設定オプションを試すには、[ドキュメント](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/68cf3c4a399e32b3932239e35927cce2c3db3a22/instrumentation/jmx-metrics/javaagent/README.md?from_branch=main)を参照して、モジュールのすべての機能を理解し試してみてください。

最後に、事前定義済みメトリクスセットに含めるべき重要なメトリクスがあると感じたり、モジュールの改善に関するアイデアがある場合は、[リポジトリ](https://github.com/open-telemetry/opentelemetry-java-instrumentation)に自由にコントリビューションしてください。
