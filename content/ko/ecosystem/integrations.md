---
title: 통합
description: 오픈텔레메트리를 직접 지원하는 라이브러리, 서비스 및 앱
aliases: [/integrations]
default_lang_commit: 42ef3b8c965480f4d58b173ed95fcb05fbc7d429
---

{{% include freeze-notice.md %}}

오픈텔레메트리(OpenTelemetry)의 목표는
[고품질의 이식 가능한 텔레메트리를 어디서나 사용할 수 있게 하여 효과적인 옵저버빌리티를 구현하는 것](/community/mission/)이다.
즉, 개발하는 소프트웨어에 옵저버빌리티(Observability)가 내장되어 있어야 한다.

[제로 코드 계측 솔루션](/docs/concepts/instrumentation/zero-code)과
[계측 라이브러리](/docs/specs/otel/overview/#instrumentation-libraries)를 통한
외부 계측은 애플리케이션을 관측할 수 있게 만드는 편리한 방법이다. 하지만
궁극적으로 모든 애플리케이션은 텔레메트리를 기본적으로 제공하도록 오픈텔레메트리
API와 SDK를 직접 통합하거나, 해당 소프트웨어의 생태계에 맞는 플러그인을 직접
제공해야 한다고 생각한다.

이 페이지에서는 계측 기능을 내장하거나 자체 플러그인을 제공하는 라이브러리,
서비스 및 앱의 일부를 소개한다.

## 라이브러리 {#libraries}

오픈텔레메트리를 사용한 라이브러리의 내장 계측은 라이브러리가 훅을 노출하고
문서화할 필요를 없애 사용자에게 더 나은 옵저버빌리티와 개발자 경험을 제공한다.
아래는 오픈텔레메트리 API를 사용하여 별도의 설정 없이 옵저버빌리티를 제공하는
라이브러리 목록이다.

{{% ecosystem/integrations-table "native libraries" %}}

## 애플리케이션 및 서비스 {#applications-and-services}

아래 목록은 텔레메트리를 기본적으로 제공하도록 오픈텔레메트리 API와 SDK를 직접
통합하거나, 자체 확장 생태계에 맞는 플러그인을 직접 제공하는 라이브러리, 서비스
및 앱의 일부를 보여준다.

목록에는 오픈소스 프로젝트(OSS)가 먼저 나오고 상용 프로젝트가 그 뒤에 나온다.
[CNCF](https://www.cncf.io/)에 속한 프로젝트는 이름 옆에 CNCF 로고가 표시된다.

{{% ecosystem/integrations-table "application integrations" %}}

## 통합 등록하기 {#how-to-add}

라이브러리, 서비스 또는 앱을 등록하려면
[레지스트리](/ecosystem/registry/adding)에 항목을 추가하는 [PR을
제출][submit a PR]한다. 항목에는 다음 내용을 포함해야 한다.

- 라이브러리, 서비스 또는 앱의 메인 페이지 링크
- 오픈텔레메트리를 사용하여 옵저버빌리티를 구현하는 방법을 설명하는 문서 링크

> [!NOTE]
>
> 라이브러리, 서비스 또는 앱에 오픈텔레메트리 외부 통합을 제공한다면
> [레지스트리 등록](/ecosystem/registry/adding)을 고려한다.
>
> 최종 사용자로서 옵저버빌리티를 위해 오픈텔레메트리를 도입하고, 오픈텔레메트리
> 관련 서비스를 제공하지 않는다면 [도입 사례](/ecosystem/adopters)를 참고한다.
>
> 오픈텔레메트리를 활용하여 최종 사용자에게 옵저버빌리티를 제공하는 솔루션을
> 제공한다면 [벤더](/ecosystem/vendors)를 참고한다.

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md "통합" %}}
