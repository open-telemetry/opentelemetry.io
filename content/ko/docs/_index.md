---
title: 문서
linkTitle: 문서
menu: { main: { weight: 10 } }
aliases: [/docs/workshop/*]
default_lang_commit: 4fbdd4e54ac36d570cf3ac73b5dd3446f03d33ec
---

오픈텔레메트리(OpenTelemetry)는 OTel이라고도 불리며, 벤더 중립적인 오픈소스
[옵저버빌리티(observability)](concepts/observability-primer/#what-is-observability)
프레임워크이다. [트레이스](concepts/signals/traces/),
[메트릭](concepts/signals/metrics/), [로그](concepts/signals/logs/)와 같은
텔레메트리 데이터를 계측(instrument)하고 생성, 수집, 내보내기(export)하는 데
사용된다.

오픈텔레메트리는 업계 표준으로서
[90개 이상의 옵저버빌리티 벤더가 지원](/ecosystem/vendors/)하며, 여러
[라이브러리, 서비스, 애플리케이션에 통합](/ecosystem/integrations/)되어 있고,
[수많은 최종 사용자가 도입](/ecosystem/adopters/)하고 있다.

![오픈텔레메트리 참조 아키텍처](/img/otel-diagram.svg)
