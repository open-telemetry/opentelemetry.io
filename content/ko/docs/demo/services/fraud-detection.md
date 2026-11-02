---
title: 사기 탐지 서비스
linkTitle: 사기 탐지
aliases: [frauddetectionservice]
default_lang_commit: 90cfef1d5f0f28c5b11c06a14dc0f7842c8dab2b
---

이 서비스는 들어오는 주문을 분석하고 악의적인 고객을 탐지한다. 이 기능은 모의
구현되어 있으며, 수신한 주문은 출력된다.

[사기 탐지 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/fraud-detection/)

## 자동 계측 {#auto-instrumentation}

이 서비스는 오픈텔레메트리(OpenTelemetry) Java 에이전트를 사용하여
카프카(Kafka)와 같은 라이브러리를 자동으로 계측하고 오픈텔레메트리 SDK를
설정한다. 에이전트는 `-javaagent` 명령줄 인수를 사용하여 프로세스에 전달된다.
명령줄 인수는 `Dockerfile`의 `JAVA_TOOL_OPTIONS`를 통해 추가되며, 자동으로
생성된 Gradle 시작 스크립트에서 사용된다.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```
