---
title: OpenTelemetry
description: 텔레메트리 오픈 표준
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
    데모 체험하기
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="OpenTelemetry 문서 검색..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="OpenTelemetry 개요" %}}

**OpenTelemetry**는 클라우드 네이티브 소프트웨어를 위한 오픈소스
옵저버빌리티 프레임워크입니다. 애플리케이션에서 분산 트레이스와 메트릭을 수집하기 위해
단일 API, 라이브러리, 에이전트, 컬렉터 서비스를 제공합니다.

OpenTelemetry는 OpenTracing과 OpenCensus 프로젝트의 오랜 경험을 토대로,
커뮤니티의 최선의 아이디어와 실천 방법을 결합하여 탄생했습니다.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="벤더 중립적 계측"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

OpenTelemetry API 및 SDK를 사용하여 코드를 한 번만 계측하세요. 텔레메트리 데이터는
Jaeger, Prometheus, 상용 벤더 또는 자체 솔루션과 같은 옵저버빌리티 백엔드로
내보낼 수 있습니다. 애플리케이션 코드를 변경하지 않고도 백엔드를 전환할 수 있습니다.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="통합 옵저버빌리티 시그널"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

요청 경로를 통해 흐르는 공유 컨텍스트를 사용하여 트레이스, 메트릭, 로그를
연결합니다. 모든 컴포넌트와 서비스에 걸쳐 애플리케이션의 동작을
포괄적으로 파악할 수 있습니다.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="어디서나 실행 가능"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

OpenTelemetry는 100% 오픈소스이며 벤더 중립적입니다. 온프레미스, 하이브리드 환경
또는 멀티 클라우드 환경 전반에서 완전한 유연성과 벤더 종속 없이 배포할 수 있습니다.
워크로드를 필요한 환경으로 자유롭게 이전할 수 있습니다.

{{% /homepage/main-feature %}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="옵저버빌리티 시그널" >}}
{{< homepage/signal name="트레이스" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
분산 트레이스 {{< /homepage/signal >}}
{{< homepage/signal name="메트릭" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
시간에 따른 측정값 {{< /homepage/signal >}}
{{< homepage/signal name="로그" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
타임스탬프 기록 {{< /homepage/signal >}}
{{< homepage/signal name="배기지" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
컨텍스트 메타데이터 {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="OpenTelemetry 기능" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="자동 계측" url="/docs/concepts/instrumentation/zero-code/" >}}
인기 있는 프레임워크와 라이브러리에 대한 제로 코드 계측으로 몇 분 안에 시작하세요.
자동 계측 에이전트가 소스 코드 수정 없이 트레이스, 메트릭, 로그를
캡처합니다. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="컬렉터 파이프라인" url="/docs/collector/" >}}
OpenTelemetry Collector로 텔레메트리 데이터를 처리, 필터링, 라우팅하세요.
200개 이상의 컴포넌트로 대규모 텔레메트리를 수신, 처리, 내보내기 위해
에이전트 또는 게이트웨이로 배포할 수 있습니다. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="컨텍스트 전파" url="/docs/concepts/context-propagation/" >}}
서비스 경계를 넘어 트레이스를 자동으로 상관관계 지으세요. 분산 컨텍스트가
전체 요청 경로를 통해 흘러 로그, 메트릭, 트레이스를 통합된 뷰로
연결합니다. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="다중 언어 지원" url="/docs/languages/" >}}
Java, Kotlin, Python, Go, JavaScript, .NET, Ruby, PHP, Rust, C++, Swift,
Erlang을 포함한 12개 이상의 언어에 대한 네이티브 SDK를 제공합니다.
선호하는 언어로 OpenTelemetry의 최고 수준 지원을 활용하세요. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="안정적이고 프로덕션 준비 완료" url="/status/" >}}
트레이싱과 메트릭 API는 모든 주요 언어에서 안정화되어 있습니다. 수천 개의
조직이 프로덕션에서 OpenTelemetry를 운영하고 있습니다. CNCF와 주요
클라우드 프로바이더가 지원합니다. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="개방형 사양" url="/docs/specs/status/" >}}
API, SDK, 와이어 프로토콜(OTLP)을 위한 개방형, 벤더 중립적 사양을 기반으로
구축되었습니다. CNCF 하에서의 투명한 거버넌스가 장기적인 안정성과
커뮤니티 주도 발전을 보장합니다. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="OpenTelemetry 생태계" >}}
{{< homepage/stat type="languages" label="언어" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="컬렉터 컴포넌트" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="통합" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="벤더" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="업계 리더들의 신뢰"
    limit="10"
    ctaText="OpenTelemetry 도입 조직 전체 보기"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry는 [CNCF][]의 [졸업(Graduated)][graduated] 프로젝트입니다**.<br>
OpenTracing과 OpenCensus 프로젝트의 합병으로 탄생했습니다.

[![CNCF 로고][cncf logo]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[graduated]: https://www.cncf.io/projects/

{{% /blocks/section %}}
