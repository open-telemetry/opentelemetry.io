---
title: 서드파티 배포판
linkTitle: 배포판
description: 서드파티가 유지 관리하는 오픈소스 오픈텔레메트리 배포판 목록
default_lang_commit: 42ef3b8c965480f4d58b173ed95fcb05fbc7d429
---

{{% include freeze-notice.md %}}

오픈텔레메트리(OpenTelemetry) [배포판][distributions]은 특정
옵저버빌리티(Observability) 백엔드에서 더 쉽게 배포하고 사용할 수 있도록
오픈텔레메트리 [컴포넌트][components]를 커스터마이징하는 방법이다.

서드파티는 누구나 백엔드, [벤더][vendor] 또는 최종 사용자에 맞게 오픈텔레메트리
구성 요소를 변경할 수 있다. 배포판 없이도 오픈텔레메트리 구성 요소를 사용할 수
있지만, 벤더에 특정 요구사항이 있는 일부 사례들은 배포판을 사용하면 더 편리한
경우도 있다.

아래 목록은 컬렉터 이외의 오픈텔레메트리 배포판과 각 배포판이 커스터마이징하는
구성 요소의 일부를 보여준다. [오픈텔레메트리 컬렉터](/docs/collector/) 배포판은
[컬렉터 배포판](/docs/collector/distributions/)을 참고한다.

{{% ecosystem/distributions-table filter="non-collector" %}}

## 배포판 등록하기 {#how-to-add}

배포판을 등록하려면 [배포판 목록][distributions list]에 항목을 추가하는 [PR을
제출][submit a PR]한다. 항목에는 다음 내용을 포함해야 한다.

- 배포판의 메인 페이지 링크
- 배포판 사용 방법을 설명하는 문서 링크
- 배포판에 포함된 컴포넌트 목록
- 질문이 있을 때 연락할 수 있는 GitHub 사용자 이름 또는 이메일 주소

> [!NOTE]
>
> - 라이브러리, 서비스 또는 앱에 오픈텔레메트리 외부 통합을 제공한다면
>   [레지스트리 등록](/ecosystem/registry/adding)을 고려한다.
> - 최종 사용자로서 옵저버빌리티를 위해 오픈텔레메트리를 도입하고,
>   오픈텔레메트리 관련 서비스를 제공하지 않는다면
>   [도입 사례](/ecosystem/adopters)를 참고한다.
> - 오픈텔레메트리를 활용하여 최종 사용자에게 옵저버빌리티를 제공하는 솔루션을
>   제공한다면 [벤더](/ecosystem/vendors)를 참고한다.

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md "배포판" %}}

[components]: /docs/concepts/components/
[distributions]: /docs/concepts/distributions/
[distributions list]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
[vendor]: ../vendors/
