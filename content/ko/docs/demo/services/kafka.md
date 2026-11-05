---
title: 카프카
default_lang_commit: 10fe33751d6b62406aa77cf2c21fbb6b08a4cc12
cSpell:ignore: Dotel
---

카프카(Kafka)는 주문 처리 서비스를 회계 및 사기 탐지 서비스와 연결하는 메시지 큐
서비스로 사용된다.

[카프카 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/kafka/)

## 설정 {#configuration}

| 변수          | 기본값   | 설명                                                                                         |
| ------------- | -------- | -------------------------------------------------------------------------------------------- |
| `KAFKA_TOPIC` | `orders` | 주문 처리 서비스가 주문 메시지를 발행하고, 회계 및 사기 탐지 서비스가 메시지를 소비하는 토픽 |

세 서비스 모두 같은 변수를 읽으므로, 개별 서비스가 아닌 `.env`(혹은
`.env.override`)에서 변경해야 하며, 그렇지 않으면 프로듀서와 컨슈머가 서로 다른
토픽을 사용하게 된다.

## 자동 계측 {#auto-instrumentation}

이 서비스는 오픈텔레메트리(OpenTelemetry) Java 에이전트와 내장된
[JMX 메트릭 인사이트 모듈](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics/javaagent)을
사용하여
[카프카 브로커 메트릭](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/kafka-broker.md)을
수집하고 OTLP를 통해 컬렉터로 전송한다.

에이전트는 `-javaagent` 명령줄 인수를 사용하여 프로세스에 전달된다. 명령줄
인수는 `Dockerfile`의 `KAFKA_OPTS`를 통해 추가된다.

```dockerfile
ENV KAFKA_OPTS="-javaagent:/tmp/opentelemetry-javaagent.jar -Dotel.jmx.target.system=kafka-broker"
```
