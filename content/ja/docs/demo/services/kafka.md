---
title: Kafka
default_lang_commit: 119208cc7b365e78d78be27a7c2d507650c73f7d
cSpell:ignore: Dotel
---

これはチェックアウトサービスと会計サービスおよび不正検知サービスを接続するためのメッセージキューサービスとして使用されます。

[Kafka サービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/kafka/)

## 自動計装 {#auto-instrumentation}

このサービスは、OpenTelemetry Java エージェントと組み込みの [JMX Metric Insight Module](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics/javaagent) を使用して、[Kafka ブローカーメトリクス](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/javaagent/kafka-broker.md)をキャプチャし、OTLP 経由で Collector に送信します。

エージェントは `-javaagent` コマンドライン引数を使用してプロセスに渡されます。
コマンドライン引数は `Dockerfile` 内の `KAFKA_OPTS` を通じて追加されます。

```dockerfile
ENV KAFKA_OPTS="-javaagent:/tmp/opentelemetry-javaagent.jar -Dotel.jmx.target.system=kafka-broker"
```
