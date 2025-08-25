---
title: জালিয়াতি সনাক্তকরণ সার্ভিস
linkTitle: জালিয়াতি সনাক্তকরণ
aliases: [frauddetectionservice]
default_lang_commit: 90cfef1d5f0f28c5b11c06a14dc0f7842c8dab2b
---

এই সার্ভিসটি ইনকামিং অর্ডারগুলো বিশ্লেষণ করে এবং সন্দেহজনক গ্রাহকদের শনাক্ত করে। তবে এটি কেবল একটি মকড সংস্করণ, এবং প্রাপ্ত অর্ডারগুলো শুধু প্রিন্ট করে দেখানো হয়।

[জালিয়াতি সনাক্তকরণ সার্ভিস সোর্স](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/fraud-detection/)

## স্বয়ংক্রিয় ইন্সট্রুমেন্টেশন (#auto-instrumentation)

এই সার্ভিসটি OpenTelemetry Java এজেন্টের উপর নির্ভরশীল, যা Kafka-এর মতো লাইব্রেরিগুলোকে স্বয়ংক্রিয়ভাবে ইন্সট্রুমেন্ট করে এবং OpenTelemetry SDK কনফিগার করে। এজেন্টটি `-javaagent` কমান্ড লাইন আর্গুমেন্ট ব্যবহার করে প্রসেসে যুক্ত করা হয়। কমান্ড লাইন আর্গুমেন্টগুলো `Dockerfile`-এ `JAVA_TOOL_OPTIONS` এর মাধ্যমে যোগ করা হয় এবং স্বয়ংক্রিয়ভাবে তৈরি হওয়া Gradle স্টার্টআপ স্ক্রিপ্টে ব্যবহৃত হয়।

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```
