---
title: 벤더
description: 오픈텔레메트리를 기본적으로 지원하는 벤더
aliases: [/vendors]
default_lang_commit: 42ef3b8c965480f4d58b173ed95fcb05fbc7d429
---

{{% include freeze-notice.md %}}

옵저버빌리티(Observability) 백엔드 및 파이프라인처럼 [OTLP](/docs/specs/otlp/)를
통해 오픈텔레메트리(OpenTelemetry) 데이터를 직접 수신하는 솔루션을 제공하는
조직의 일부를 정리한 목록이다.

일부 조직은 추가 기능을 제공하거나 사용 편의성을 높이기 위해 오픈텔레메트리
컴포넌트를 커스터마이징한 [배포판](/ecosystem/distributions/)을 제공한다.

오픈소스(OSS)는 [오픈소스](https://opensource.org/osd) 옵저버빌리티 제품을
제공하는 벤더를 가리킨다. 이러한 벤더도 고객을 위해 오픈소스 제품을 호스팅하는
SaaS 서비스처럼 소스가 공개되지 않은 다른 제품을 제공할 수 있다.

{{% ecosystem/vendor-table %}}

## 조직 등록하기 {#how-to-add}

조직을 등록하려면 [벤더 목록][vendors list]에 항목을 추가하는 [PR을
제출][submit a PR]한다. 항목에는 다음 내용을 포함해야 한다.

- 제품이나 서비스가 [OTLP](/docs/specs/otlp/)를 통해 오픈텔레메트리 데이터를
  직접 수신하는 방법을 자세히 설명하는 문서 링크
- 배포판을 제공하는 경우, 해당 배포판 링크
- 제품이나 서비스가 오픈소스인 경우, 이를 입증하는 링크. 오픈소스 배포판을
  제공한다는 사실만으로 제품이나 서비스를 "오픈소스"로 표시할 수는 없다.
- 질문이 있을 때 연락할 수 있는 GitHub 사용자 이름 또는 이메일 주소

이 목록은 오픈텔레메트리를 활용하여 [최종 사용자](/community/end-user/)에게
옵저버빌리티를 제공하는 조직을 대상으로 한다.

[최종 사용자 조직](https://www.cncf.io/enduser/)으로서 옵저버빌리티를 위해
오픈텔레메트리를 도입하고, 오픈텔레메트리 관련 서비스를 제공하지 않는다면
[도입 사례](/ecosystem/adopters/)를 참고한다.

오픈텔레메트리를 통해 관측할 수 있는 라이브러리, 서비스 또는 앱을 제공한다면
[통합](/ecosystem/integrations/)을 참고한다.

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md "벤더" %}}

[vendors list]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/vendors.yaml
