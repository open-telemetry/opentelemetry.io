---
title: 언어별 API 및 SDK
description:
  오픈텔레메트리 코드 계측은 널리 사용되는 여러 프로그래밍 언어에서 지원된다
weight: 250
aliases: [/docs/instrumentation]
redirects:
  - { from: 'net/*', to: 'dotnet/:splat' }
default_lang_commit: fab3cadf92a42a3635e85160272153c5f2139a9e
---

오픈텔레메트리(OpenTelemetry) 코드 [계측][instrumentation]은 아래
[상태 및 릴리스](#status-and-releases) 표에 나열된 언어에서 지원된다.
[다른 언어](/docs/languages/other)의 비공식 구현체도 사용할 수 있다. 이러한
구현체는 [레지스트리](/ecosystem/registry/)에서 찾을 수 있다.

Go, .NET, PHP, Python, Java, JavaScript에서는
[제로 코드 솔루션](/docs/zero-code)을 사용하여 코드를 변경하지 않고
애플리케이션에 계측을 추가할 수 있다.

쿠버네티스를 사용하고 있다면 [쿠버네티스용 오픈텔레메트리 오퍼레이터][otel-op]를
사용하여 애플리케이션에 [이러한 제로 코드 솔루션을 주입][zero-code]할 수 있다.

## 상태 및 릴리스 {#status-and-releases}

오픈텔레메트리의 주요 기능 구성 요소에 대한 현재
[상태](/docs/specs/otel/versioning-and-stability/)는 다음과 같다.

> [!WARNING]
>
> API/SDK의 상태와 관계없이, 계측이 [시맨틱 컨벤션 명세][semconv-spec]에서
> [실험적][Experimental]으로 표시된 [시맨틱 컨벤션][semconv]에 의존하는 경우,
> 데이터 흐름에 **호환성을 깨뜨리는 변경** 이 발생할 수 있다.
>
> [semconv]: /docs/concepts/semantic-conventions/
> [Experimental]: /docs/specs/otel/document-status/
> [semconv-spec]: /docs/specs/semconv/

{{% telemetry-support-table " " %}}

## API 참조 문서 {#api-references}

특정 언어로 오픈텔레메트리 API와 SDK를 구현하는 특별 관심 그룹(SIG)은 개발자를
위한 API 참조 문서도 공개한다. 다음 참조 문서를 이용할 수 있다.

{{% apidocs %}}

> [!NOTE]
>
> 위 목록의 별칭은 [`/api`](/api)이다.

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
