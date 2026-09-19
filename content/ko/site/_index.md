---
title: 이 웹사이트에 대하여
linkTitle: 웹사이트 문서
description: 이 사이트의 구축, 유지 관리, 배포 방법.
# NOTE: aliases are not currently enabled for this section.
cascade:
  type: docs
  params:
    hide_feedback: true
default_lang_commit: 53f798ca0e698ca5270ac7c63f02e2083ba9f257
---

이 섹션은 사이트 유지 관리자와 기여자를 대상으로 한다.
오픈텔레메트리(OpenTelemetry) 웹사이트가 어떻게 구성되고, 빌드되고, 유지
관리되며, 배포되는지를 설명한다.

<span class="badge fs-6 py-2">
{{% _param FAS person-digging " pe-2" %}} 섹션 작성 중. {{%
_param FAS person-digging " ps-2" %}}
</span>

## 콘텐츠 (예정) {#content}

앞으로 다룰 잠정적인 콘텐츠 목차는 다음과 같다:

- **About** — 웹사이트 프로젝트에 대한 개요. 목적, 소유권, 전반적인 상태를
  포함한다.
- **Needs, requirements, and features** — 이해관계자의 요구사항과 관련 정보를
  기능 단위로 정리한 내용.
- [**Skills**](/site/skills/) — 사이트 유지보수 시 AI 에이전트와 기여자가
  사용하는 스킬.
- [**Design**](/site/design/) — 아키텍처 설계, 정보 아키텍처(IA), 레이아웃, UX
  선택, 테마 정책 등 설계 수준 산출물.
- [**Implementation**](/site/implementation/) — 코드 구조와 컨벤션, Hugo/Docsy
  템플릿, SCSS/JS 커스터마이징, 패치, 내부 심(shim).
- [**Build**](/site/build/) — 도구, 로컬 개발 환경 설정, CI/CD 워크플로, 배포
  환경, 자동화 세부 사항.
- **Deployment** — 오픈텔레메트리 웹사이트 전용 배포 메커니즘과 동작 방식.
- [**Testing**](/site/testing/) — 링크 검사, 접근성 표준, 테스트, 리뷰 관행,
  기타 품질 관련 프로세스.
- **Roadmap** — 마일스톤, 백로그, 우선순위, 기술 부채, 설계/구현 결정.

## 콘텐츠 추가 {#adding-content}

페이지는 짧게 유지하되 핵심 정보(High Signal) 중심으로 작성한다.

- 결정, 근거, 제약, 핵심 규칙을 기록한다.
- 긴 배경 설명보다 간결한 요약을 우선한다.
- 세부 사항은 여기서 반복하지 않고 이슈, 계획, 코드로 링크한다.
- 사이트가 어떻게, 왜 동작하는지를 설명하는 데 필요한 콘텐츠만 추가한다.

## 사이트 빌드 정보 {#site-build-information}

{{% td/site-build-info/netlify "opentelemetry" %}}
