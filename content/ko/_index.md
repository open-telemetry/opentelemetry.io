---
title: 오픈텔레메트리
description: 텔레메트리를 위한 개방형 표준
developer_note:
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
params:
  btn-lg: class="btn btn-lg btn-{1}" role="button"
  show_banner: true
default_lang_commit: b97d606fe6299329b8731687dc235963bf100799
---

{{% blocks/cover image_anchor="top" height="max td-below-navbar" %}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<!-- prettier-ignore -->
<div class="td-cta-buttons my-5">
  <a {{% _param btn-lg primary %}} href="docs/what-is-opentelemetry/">
    자세히 알아보기
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    데모 사용해 보기
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="오픈텔레메트리 문서 검색..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="오픈텔레메트리 개요" %}}

**오픈텔레메트리(OpenTelemetry)**는 클라우드 네이티브 소프트웨어를 위한 오픈소스
옵저버빌리티 프레임워크이다. 애플리케이션의 분산 트레이스와 메트릭을 수집하기
위해 API, 라이브러리, 에이전트, 컬렉터 서비스를 하나의 체계로 제공한다.

오픈텔레메트리는 OpenTracing과 OpenCensus 프로젝트의 다년간의 경험을 바탕으로,
커뮤니티의 검증된 아이디어와 모범 사례를 통합하여 만들어졌다.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="벤더 중립 계측"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

오픈텔레메트리 API와 SDK로 코드를 한 번만 계측하면 된다. 텔레메트리 데이터를
Jaeger, Prometheus, 상용 벤더, 자체 솔루션 등 어떤 옵저버빌리티 백엔드로든
내보낼 수 있다. 애플리케이션 코드를 수정하지 않고도 백엔드를 바꿀 수 있다.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="통합 옵저버빌리티 시그널"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

요청 경로 전체에 걸쳐 전달되는 공유 컨텍스트로 트레이스, 메트릭, 로그를 연관
짓는다. 모든 컴포넌트와 서비스에 걸친 애플리케이션 동작의 전체 그림을 파악할 수
있다.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="어디서든 실행"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

오픈텔레메트리는 100% 오픈소스이며 벤더 중립적이다. 온프레미스, 하이브리드, 멀티
클라우드 환경 어디에서든 lock-in 없이 유연하게 배포할 수 있다. 워크로드를 필요한
곳으로 자유롭게 옮길 수 있다.

{{% /homepage/main-feature %}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="옵저버빌리티 시그널" >}}
{{< homepage/signal name="트레이스" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
분산 트레이스 {{< /homepage/signal >}}
{{< homepage/signal name="메트릭" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
시간에 따른 측정값 {{< /homepage/signal >}}
{{< homepage/signal name="로그" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
타임스탬프가 붙은 기록 {{< /homepage/signal >}}
{{< homepage/signal name="배기지" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
컨텍스트 메타데이터 {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="오픈텔레메트리 기능" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="자동 계측" url="/docs/concepts/instrumentation/zero-code/" >}}
인기 프레임워크와 라이브러리를 코드 수정 없이 계측해 몇 분 만에 시작할 수 있다.
자동 계측 에이전트가 소스 코드를 건드리지 않고 트레이스, 메트릭, 로그를
수집한다. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="컬렉터 파이프라인" url="/docs/collector/" >}}
오픈텔레메트리 컬렉터로 텔레메트리 데이터를 처리·필터링·라우팅할 수 있다. 200개
이상의 컴포넌트를 갖춘 에이전트나 게이트웨이로 대규모 텔레메트리를 수신하고
처리한 뒤 내보낼 수 있다. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="컨텍스트 전파" url="/docs/concepts/context-propagation/" >}}
서비스 경계를 넘어 트레이스를 자동으로 연관 짓는다. 분산 컨텍스트가 요청 경로
전체를 따라 흐르며 로그, 메트릭, 트레이스를 하나의 뷰로 묶는다.
{{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="다중 언어 지원" url="/docs/languages/" >}}
Java, Kotlin, Python, Go, JavaScript, .NET, Ruby, PHP, Rust, C++, Swift, Erlang
등 12개 이상의 언어용 네이티브 SDK를 제공한다. 선호하는 언어로 오픈텔레메트리를
일급 수준으로 지원받을 수 있다. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="안정적이며 프로덕션 투입 가능" url="/status/" >}}
트레이싱과 메트릭 API는 모든 주요 언어에서 안정(stable) 등급이다. 수천 개 조직이
프로덕션에서 오픈텔레메트리를 운영하고 있다. CNCF와 주요 클라우드 프로바이더의
지원을 받는다. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="개방형 사양" url="/docs/specs/status/" >}}
API, SDK, 전송 프로토콜(OTLP)을 위한 개방형·벤더 중립적 사양 위에 구축되었다.
CNCF의 투명한 거버넌스가 장기적인 안정성과 커뮤니티 주도의 발전을 보장한다.
{{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="오픈텔레메트리 생태계" >}}
{{< homepage/stat type="languages" label="언어" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="컬렉터 컴포넌트" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="통합" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="벤더" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="업계 선도 기업의 선택"
    limit="10"
    ctaText="도입 사례 전체 보기"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**오픈텔레메트리는 [CNCF][]의 [졸업(Graduated)][graduated] 프로젝트이다**.<br>
OpenTracing과 OpenCensus 프로젝트의 통합을 통해 탄생했다.

[![CNCF 로고][cncf logo]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[graduated]: https://www.cncf.io/projects/

{{% /blocks/section %}}
