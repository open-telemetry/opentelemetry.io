---
title: 오픈텔레메트리란 무엇인가?
description:
  오픈텔레메트리(OpenTelemetry)가 무엇이고 무엇이 아닌지에 대한 간략한 설명.
aliases: [/about, /docs/concepts/what-is-opentelemetry, /otel]
weight: 150
default_lang_commit: ee9a3aeb6501bb788a03571f08be856dfdedc4d5
cSpell:ignore: youtube
---

오픈텔레메트리(OpenTelemetry)는 다음과 같다.

- [트레이스][traces], [메트릭][metrics], [로그][logs]와 같은 [텔레메트리
  데이터][telemetry data]의
  - [생성][instr]
  - 내보내기
  - [수집](../concepts/components/#collector)

  을 지원하도록 설계된 **[옵저버빌리티(observability)][observability]
  프레임워크이자 툴킷**이다.

- **오픈소스**이며 **벤더 및 툴 중립적**이다. 즉 [Jaeger][]나 [Prometheus][]와
  같은 오픈소스 도구를 포함한 다양한 옵저버빌리티 백엔드는 물론 상용 제품과도
  함께 사용할 수 있다. 오픈텔레메트리는 그 자체로 옵저버빌리티 백엔드는
  **아니다**.

오픈텔레메트리의 주요 목표 중 하나는 사용 중인 프로그래밍 언어, 인프라, 런타임
환경에 관계없이 애플리케이션과 시스템을 쉽게 계측할 수 있도록 하는 것이다.

텔레메트리 데이터의 백엔드(저장)와 프론트엔드(시각화)는 의도적으로 다른 도구의
몫으로 남겨두었다.

<div class="td-max-width-on-larger-screens">
{{< youtube iEEIabOha8U >}}
</div>

이 시리즈의 추가 영상과 관련 자료는 [다음 단계는?](#what-next)를 참고한다.

## 옵저버빌리티란 무엇인가? {#what-is-observability}

[옵저버빌리티][observability]란 시스템의 출력을 관찰함으로써 그 내부 상태를
이해할 수 있는 능력이다.

소프트웨어에서는 일반적으로 트레이스, 메트릭, 로그와 같은 텔레메트리 데이터를
분석함으로써 이를 달성한다.

시스템을 관찰 가능하게 만들려면 [계측][instr]해야 한다. 즉 코드가
[트레이스][traces], [메트릭][metrics], [로그][logs]를 내보내야 한다. 계측된
데이터는 이후 옵저버빌리티 백엔드로 전송되어야 한다.

## 왜 오픈텔레메트리인가? {#why-opentelemetry}

클라우드 컴퓨팅과 마이크로서비스 아키텍처가 부상하고 비즈니스 요구사항이 점점
복잡해지면서, 소프트웨어와 인프라의 [옵저버빌리티][observability]에 대한
필요성은 그 어느 때보다 커지고 있다.

오픈텔레메트리는 다음 두 가지 핵심 원칙을 따르면서 옵저버빌리티에 대한 필요를
충족한다.

1. 직접 생성한 데이터의 소유권은 사용자에게 있다. 벤더 종속(lock-in)이 없다.
2. 단 하나의 API와 컨벤션 집합만 익히면 된다.

이 두 원칙이 결합되어 팀과 조직은 오늘날의 현대적인 컴퓨팅 환경에서 필요한
유연성을 확보할 수 있다.

더 알아보고 싶다면 오픈텔레메트리의 [미션, 비전, 가치](/community/mission/)를
참고한다.

## 오픈텔레메트리 주요 구성 요소 {#main-opentelemetry-components}

오픈텔레메트리는 다음과 같은 주요 구성 요소로 이루어진다.

- 모든 구성 요소를 위한 [명세](/docs/specs/otel)
- 텔레메트리 데이터의 형태를 정의하는 표준 [프로토콜](/docs/specs/otlp/)
- 공통 텔레메트리 데이터 유형에 대한 표준 명명 체계를 정의하는
  [시맨틱 컨벤션](/docs/specs/semconv/)
- 텔레메트리 데이터를 생성하는 방법을 정의하는 API
- 명세, API, 텔레메트리 데이터 내보내기를 구현하는 [언어별 SDK](../languages)
- 일반적인 라이브러리와 프레임워크에 대한 계측을 구현하는
  [라이브러리 생태계](/ecosystem/registry)
- 코드 변경 없이 텔레메트리 데이터를 생성하는 자동 계측 컴포넌트
- 텔레메트리 데이터를 수신, 처리, 내보내는 프록시인
  [오픈텔레메트리 컬렉터](../collector)
- [쿠버네티스용 오픈텔레메트리 오퍼레이터](../platforms/kubernetes/operator/),
  [오픈텔레메트리 Helm 차트](../platforms/kubernetes/helm/),
  [FaaS용 커뮤니티 자산](../platforms/faas/) 등 다양한 기타 도구

오픈텔레메트리는 기본적으로 옵저버빌리티를 제공하기 위해 오픈텔레메트리를 통합한
다양한 [라이브러리, 서비스 및 애플리케이션](/ecosystem/integrations/)에서
사용되고 있다.

오픈텔레메트리는 수많은 [벤더](/ecosystem/vendors/)에 지원되고 있으며, 이들 중
다수는 오픈텔레메트리에 대한 상용 지원을 제공하고 프로젝트에 직접 기여하고 있다.

## 확장성 {#extensibility}

오픈텔레메트리는 확장 가능하도록 설계되었다. 확장할 수 있는 방법의 예로는 다음이
있다.

- 사용자 지정 소스의 텔레메트리 데이터를 지원하기 위해 오픈텔레메트리 컬렉터에
  리시버를 추가하는 것
- SDK에 사용자 지정 계측 라이브러리를 로드하는 것
- 특정 사용 사례에 맞춘 SDK 또는 컬렉터의 [배포판](../concepts/distributions/)을
  만드는 것
- 아직 오픈텔레메트리 프로토콜(OTLP)을 지원하지 않는 사용자 지정 백엔드를 위한
  새 익스포터(Exporter)를 만드는 것
- 비표준 컨텍스트 전파 형식을 위한 사용자 지정 전파자(Propagators)를 만드는 것

대부분의 사용자는 오픈텔레메트리를 확장할 필요가 없겠지만, 이 프로젝트는 거의
모든 수준에서 확장이 가능하도록 설계되었다.

## 역사 {#history}

오픈텔레메트리는 [클라우드 네이티브 컴퓨팅
파운데이션][Cloud Native Computing Foundation](CNCF) 프로젝트로, 이전에 존재하던
두 프로젝트인 [OpenTracing](https://opentracing.io)과
[OpenCensus](https://opencensus.io)의 [통합][merger]으로 탄생했다. 이 두
프로젝트는 모두 코드를 계측하고 텔레메트리 데이터를 옵저버빌리티 백엔드로
전송하는 표준이 없다는 동일한 문제를 해결하기 위해 만들어졌다. 두 프로젝트 모두
이 문제를 독자적으로 완전히 해결하지 못했기 때문에, 서로의 강점을 결합하고
하나의 통합된 솔루션을 제공하기 위해 병합하여 오픈텔레메트리를 이루었다.

현재 OpenTracing이나 OpenCensus를 사용하고 있다면,
[마이그레이션 가이드](../compatibility/migration/)에서 오픈텔레메트리로 전환하는
방법을 확인할 수 있다.

[merger]:
  https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## 다음 단계는? {#what-next}

- [시작하기](../getting-started/) &mdash; 바로 시작해보자!
- [오픈텔레메트리 개념](../concepts/)에 대해 알아본다.
- [OTel for beginners][OTel for beginners] 또는 다른 [재생목록][playlists]에서
  [영상을 시청한다][Watch videos].
- **무료 강의** [오픈텔레메트리로 시작하기](/training/#courses)를 포함해
  [교육 과정](/training)에 등록한다.

[Cloud Native Computing Foundation]: https://www.cncf.io
[instr]: ../concepts/instrumentation
[Jaeger]: https://www.jaegertracing.io/
[logs]: ../concepts/signals/logs/
[metrics]: ../concepts/signals/metrics/
[observability]: ../concepts/observability-primer/#what-is-observability
[OTel for beginners]:
  https://www.youtube.com/playlist?list=PLVYDBkQ1TdyyWjeWJSjXYUaJFVhplRtvN
[playlists]: https://www.youtube.com/@otel-official/playlists
[Prometheus]: https://prometheus.io/
[telemetry data]: ../concepts/signals/
[traces]: ../concepts/signals/traces/
[Watch videos]: https://www.youtube.com/@otel-official
