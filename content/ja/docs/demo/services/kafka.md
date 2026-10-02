---
title: Kafka
default_lang_commit: 98f910ef53d1e7f45002e7303b2af4da15282b21
cSpell:ignore: Dotel
---

これはチェックアウトサービスと会計サービスおよび不正検知サービスを接続するためのメッセージキューサービスとして使用されます。

[Kafka サービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/kafka/)

## 設定 {#configuration}

| 変数          | デフォルト | 説明                                                                                                   |
| ------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| `KAFKA_TOPIC` | `orders`   | チェックアウトが注文メッセージを送信し、会計サービスと不正検知サービスがメッセージを受信するトピック。 |

3つのサービスはすべて同じ変数を参照するため、個々のサービスではなく `.env`（または `.env.override`）で変更してください。
そうしないと、プロデューサーとコンシューマーが異なるトピックを使用することになります。

## 自動計装 {#auto-instrumentation}

このサービスは、OpenTelemetry Java エージェントと組み込みの [JMX Metric Insight Module](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics/javaagent) を使用して、[Kafka ブローカーメトリクス](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/kafka-broker.md)をキャプチャし、OTLP 経由で Collector に送信します。

エージェントは `-javaagent` コマンドライン引数を使用してプロセスに渡されます。
コマンドライン引数は `Dockerfile` 内の `KAFKA_OPTS` を通じて追加されます。

```dockerfile
ENV KAFKA_OPTS="-javaagent:/tmp/opentelemetry-javaagent.jar -Dotel.jmx.target.system=kafka-broker"
```
