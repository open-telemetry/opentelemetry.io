---
title: 자체 옵저버빌리티 대시보드
default_lang_commit: 4f50451b8d03165e25df580d9147560ce2af7105
---

오픈텔레메트리(OpenTelemetry) SDK는 실험 단계의
[`otel.sdk.*` 시맨틱 컨벤션](/docs/specs/semconv/otel/sdk-metrics/)을 사용하여
SDK의 동작을 나타내는 자체 내부 메트릭을 생성할 수 있다. 예를 들어, 서비스가
텔레메트리를 버리고 있는지, 내보내기에 얼마나 시간이 걸리는지, 프로세서 큐가
차고 있는지 등을 확인할 수 있다. 데모의 **Self-Observability** 대시보드는 스팬,
로그, 메트릭 파이프라인 전반에 걸쳐 이러한 메트릭을 시각화한다.

## SDK 자체 옵저버빌리티 활성화하기 {#enabling-sdk-self-observability}

SDK 자체 옵저버빌리티(Observability)는 아직 실험 단계이며, 사용하려면 서비스별
SDK 설정을 통해 명시적으로 활성화해야 한다. 데모에서는 `ad`, `fraud-detection`,
`kafka` 서비스에 이 기능이 활성화되어 있다. 대시보드는 `Service` 템플릿 변수를
기반으로 동작하므로, 이 기능을 활성화한 서비스가 추가되면 자동으로 표시된다.

## 대시보드 접속하기 {#accessing-the-dashboard}

데모가 실행되면 <http://localhost:8080/grafana/d/self-observability>에서
대시보드를 직접 열거나, 그라파나(Grafana) 대시보드 목록에서
"Self-Observability"를 선택한다.
