---
title: 시그널
description: 오픈텔레메트리가 지원하는 텔레메트리 범주 알아보기
aliases: [data-sources, otel-concepts]
weight: 11
default_lang_commit: 274bf95abd0cbad3ad9f95b4426f282466cdaade
---

오픈텔레메트리(OpenTelemetry)의 목적은 [시그널][signals]을 수집·처리· 내보내는
것이다. 시그널은 플랫폼에서 실행 중인 운영 체제와 애플리케이션의 내부 활동을
설명하는 시스템 출력(output)이다. 시그널은 특정 시점에 측정하고 싶은 값(온도,
메모리 사용량 등)일 수도 있고, 분산 시스템의 구성 요소를 통과하며 추적하고 싶은
이벤트일 수도 있다. 서로 다른 시그널을 묶어 같은 기술의 내부 동작을 여러
관점에서 살펴볼 수 있다.

오픈텔레메트리는 현재 다음을 지원한다.

- [트레이스](traces)
- [메트릭](metrics)
- [로그](logs)
- [배기지](baggage)

다음은 개발 중이거나 [제안][proposal] 단계에 있다.

- [이벤트][Events], [로그](logs)의 한 유형
- [프로파일](profiles)

[Events]: /docs/specs/otel/logs/data-model/#events
[proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[signals]: /docs/specs/otel/glossary/#signals
