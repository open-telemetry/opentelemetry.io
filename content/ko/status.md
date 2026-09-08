---
title: 상태
menu: { main: { weight: 30 } }
aliases: [/project-status, /releases]
description: 주요 오픈텔레메트리(OpenTelemetry) 구성 요소의 성숙도 수준
type: docs
body_class: td-no-left-sidebar
default_lang_commit: 1f83b9ffa3ecdd5e2b507379cc259e5678596c7f
---

오픈텔레메트리(OpenTelemetry)는 [여러 구성 요소](/docs/concepts/components/)로
이루어져 있으며, 그중 일부는 언어에 종속적이고 일부는 언어에 독립적이다.
[상태](/docs/specs/otel/versioning-and-stability/)를 확인할 때는 반드시 해당
구성 요소 페이지에서 올바른 상태를 찾아야 한다. 예를 들어,
명세(specification)에서의 시그널 상태는 특정 언어 SDK에서의 시그널 상태와 다를
수 있다.

## 언어 API 및 SDK {#language-apis--sdks}

[언어 API 또는 SDK](/docs/languages/)의 개발 상태, 또는 성숙도에 대해서는 다음
표를 참고한다.

{{% telemetry-support-table " " %}}

구현체별 명세 준수 여부에 대한 자세한 내용은
[명세 준수 매트릭스](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)를
참고한다.

## 컬렉터(Collector) {#collector}

컬렉터의 상태는 [혼합(mixed)](/docs/specs/otel/document-status/#mixed)이다. 이는
핵심 컬렉터 구성 요소들이 현재 서로 다른
[안정성 수준](https://github.com/open-telemetry/opentelemetry-collector#stability-levels)을
가지고 있기 때문이다.

**컬렉터 구성 요소**는 성숙도 수준이 서로 다르다. 각 구성 요소의 안정성은 해당
`README.md`에 문서화되어 있다. 사용 가능한 모든 컬렉터 구성 요소 목록은
[레지스트리](/ecosystem/registry/?language=collector)에서 확인할 수 있다.

## 쿠버네티스 오퍼레이터 {#kubernetes-operator}

오픈텔레메트리 오퍼레이터의 상태는
[혼합(mixed)](/docs/specs/otel/document-status/#mixed)이다. 이는 서로 다른
상태의 구성 요소를 배포하기 때문이다.

오퍼레이터 자체도 `v1alpha1` 및 `v1beta1` 상태의 구성 요소를 포함하는
[혼합(mixed)](/docs/specs/otel/document-status/#mixed) 상태이다.

## 명세 {#specifications}

[명세](/docs/specs/otel/)의 개발 상태, 또는 성숙도에 대해서는 다음을 참고한다:
[명세 상태 요약](/docs/specs/status/).
