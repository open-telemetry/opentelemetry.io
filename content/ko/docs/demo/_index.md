---
title: 오픈텔레메트리 데모 문서
linkTitle: 데모
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: ffef14de849130bdf9ecd9d4912e75f5a8afdbfd
---

이 문서는 [오픈텔레메트리(OpenTelemetry) 데모](/ecosystem/demo/)를 설치하고
실행하는 방법과 오픈텔레메트리의 실제 동작을 확인할 수 있는 시나리오를 소개한다.

## 데모 실행하기 {#running-the-demo}

데모를 배포하고 실제 동작을 확인하려면 다음 문서부터 살펴본다.

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## 언어별 기능 참고 자료 {#language-feature-reference}

특정 언어에서 계측(instrumentation)이 어떻게 동작하는지 알아보려면 다음 문서부터
살펴본다.

| 언어       | 자동 계측                                                                                                                                  | 계측 라이브러리                                                                           | 수동 계측                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| .NET       | [회계 서비스](services/accounting/)                                                                                                        | [장바구니 서비스](services/cart/)                                                         | [장바구니 서비스](services/cart/)                                                         |
| C++        |                                                                                                                                            |                                                                                           | [통화 서비스](services/currency/)                                                         |
| Elixir     |                                                                                                                                            | [Flagd-UI 서비스](services/flagd-ui/)                                                     |                                                                                           |
| Go         |                                                                                                                                            | [주문 처리 서비스](services/checkout/), [상품 카탈로그 서비스](services/product-catalog/) | [주문 처리 서비스](services/checkout/), [상품 카탈로그 서비스](services/product-catalog/) |
| Java       | [광고 서비스](services/ad/)                                                                                                                |                                                                                           | [광고 서비스](services/ad/)                                                               |
| JavaScript | [결제 서비스](services/payment/)                                                                                                           |                                                                                           | [결제 서비스](services/payment/)                                                          |
| TypeScript |                                                                                                                                            | [프론트엔드](services/frontend/), [React Native 앱](services/react-native-app/)           | [프론트엔드](services/frontend/)                                                          |
| Kotlin     |                                                                                                                                            | [사기 탐지 서비스](services/fraud-detection/)                                             |                                                                                           |
| PHP        |                                                                                                                                            | [견적 서비스](services/quote/)                                                            | [견적 서비스](services/quote/)                                                            |
| Python     | [추천 서비스](services/recommendation/), [에이전트 서비스](services/agent/), [챗봇 서비스](services/chatbot/), [MCP 서비스](services/mcp/) |                                                                                           | [추천 서비스](services/recommendation/)                                                   |
| Ruby       |                                                                                                                                            | [이메일 서비스](services/email/)                                                          | [이메일 서비스](services/email/)                                                          |
| Rust       |                                                                                                                                            | [배송 서비스](services/shipping/)                                                         | [배송 서비스](services/shipping/)                                                         |

## 서비스 문서 {#service-documentation}

각 서비스에 오픈텔레메트리가 어떻게 배포되는지에 대한 자세한 내용은 다음
문서에서 확인할 수 있다.

- [회계 서비스](services/accounting/)
- [광고 서비스](services/ad/)
- [에이전트 서비스](services/agent/)
- [장바구니 서비스](services/cart/)
- [챗봇 서비스](services/chatbot/)
- [주문 처리 서비스](services/checkout/)
- [이메일 서비스](services/email/)
- [프론트엔드](services/frontend/)
- [부하 생성기](services/load-generator/)
- [MCP 서비스](services/mcp/)
- [결제 서비스](services/payment/)
- [상품 카탈로그 서비스](services/product-catalog/)
- [견적 서비스](services/quote/)
- [추천 서비스](services/recommendation/)
- [배송 서비스](services/shipping/)
- [이미지 제공 서비스](services/image-provider/)
- [React Native 앱](services/react-native-app/)

## 기능 플래그 시나리오 {#feature-flag-scenarios}

오픈텔레메트리로 어떻게 문제를 해결할 수 있는가?
[기능 플래그(feature flag)로 활성화하는 시나리오](feature-flags/)에서는 미리
구성된 문제 상황을 살펴보고, 해당 문제를 해결하기 위해 오픈텔레메트리 데이터를
어떻게 해석해야 하는지 보여준다.

## 참고 자료 {#reference}

요구 사항과 기능 지원 현황 등 프로젝트 관련 참고 문서이다.

- [아키텍처](architecture/)
- [개발](development/)
- [기능 플래그 참고 자료](feature-flags/)
- [메트릭 기능 지원 현황](telemetry-features/metric-coverage/)
- [요구 사항](./requirements/)
- [스크린샷](screenshots/)
- [서비스](services/)
- [스팬 속성 참고 자료](telemetry-features/manual-span-attributes/)
- [테스트](tests/)
- [트레이스 기능 지원 현황](telemetry-features/trace-coverage/)
