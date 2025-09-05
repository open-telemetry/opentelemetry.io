---
title: Kafka
default_lang_commit: e29d63624f9fd907db993e53867149dde75e8e42
cSpell:ignore: Dotel
---

এটি একটি মেসেজ কিউ সার্ভিস হিসেবে ব্যবহার করা হয়, যা চেকআউট সার্ভিসকে অ্যাকাউন্টিং এবং ফ্রড ডিটেকশন সার্ভিসের সাথে সংযুক্ত করে।

[Kafka সার্ভিস সোর্স](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/kafka/)

## স্বয়ংক্রিয় ইন্সট্রুমেন্টেশন {#auto-instrumentation}

এই সার্ভিসটি OpenTelemetry Java এজেন্ট এবং বিল্ট-ইন [JMX Metric Insight Module](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics/javaagent) এর উপর নির্ভর করে, যা [Kafka broker metrics](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/javaagent/kafka-broker.md) ক্যাপচার করে এবং OTLP এর মাধ্যমে কালেক্টরে পাঠায়।

এই এজেন্টটি প্রসেসে যোগ করা হয় `-javaagent` কমান্ড লাইন আর্গুমেন্ট ব্যবহার করে। কমান্ড লাইন আর্গুমেন্টগুলো `Dockerfile`-এর `KAFKA_OPTS` এর মাধ্যমে যুক্ত করা হয়।

```dockerfile
ENV KAFKA_OPTS="-javaagent:/tmp/opentelemetry-javaagent.jar -Dotel.jmx.target.system=kafka-broker"
```
