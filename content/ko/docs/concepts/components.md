---
title: 컴포넌트
description: 오픈텔레메트리를 구성하는 주요 컴포넌트
aliases: [data-collection]
weight: 20
default_lang_commit: 99a39c5e4e51daba968bfbb3eb078be4a14ad363
---

오픈텔레메트리(OpenTelemetry)는 현재 다음과 같은 주요 컴포넌트로 구성된다.

- [명세](#specification)
- [컬렉터](#collector)
- [언어별 API 및 SDK 구현체](#language-specific-api--sdk-implementations)
  - [계측 라이브러리](#instrumentation-libraries)
  - [익스포터](#exporters)
  - [제로 코드 계측](#zero-code-instrumentation)
  - [리소스 감지기](#resource-detectors)
  - [서비스 간 전파자](#cross-service-propagators)
  - [샘플러](#samplers)
- [쿠버네티스 오퍼레이터](#kubernetes-operator)
- [서비스형 함수 지원 구성 요소](#function-as-a-service-assets)

오픈텔레메트리를 사용하면 텔레메트리 데이터를 생성하고 내보내기 위해 필요한
벤더별 SDK와 도구를 대체할 수 있다.

## 명세 {#specification}

명세는 모든 구현체가 따라야 하는 언어 간 공통 요구 사항과 기대 사항을 설명한다.
용어 정의뿐 아니라 다음 사항도 정의한다.

- **API:** 트레이싱, 메트릭, 로깅 데이터를 생성하고 서로 연관 짓기 위한 데이터
  타입과 연산을 정의한다.
- **SDK:** 언어별 API 구현체의 요구 사항을 정의한다. 설정, 데이터 처리 및
  내보내기에 관한 개념도 정의한다.
- **데이터:** 오픈텔레메트리 프로토콜(OTLP)과 텔레메트리 백엔드가 지원할 수 있는
  벤더 중립적인 시맨틱 컨벤션(semantic conventions)을 정의한다.

자세한 내용은 [명세](/docs/specs/)를 참고한다.

## 컬렉터 {#collector}

오픈텔레메트리 컬렉터는 텔레메트리 데이터를 수신하고, 처리하고, 내보낼 수 있는
벤더 중립적인 프록시이다. 다양한 형식(예: OTLP, Jaeger, Prometheus 및 여러
상용·독점 도구)의 텔레메트리 데이터를 수신하고, 하나 이상의 백엔드로 전송하는
기능을 지원한다. 데이터를 내보내기 전에 처리하고 필터링하는 기능도 지원한다.

자세한 내용은 [컬렉터](/docs/collector/)를 참고한다.

## 언어별 API 및 SDK 구현체 {#language-specific-api--sdk-implementations}

오픈텔레메트리는 선택한 언어에서 오픈텔레메트리 API를 사용하여 텔레메트리
데이터를 생성하고, 원하는 백엔드로 내보낼 수 있는 언어별 SDK도 제공한다. 이러한
SDK를 통해 널리 사용되는 라이브러리와 프레임워크의 계측 라이브러리를 추가하고,
애플리케이션의 수동 계측과 연계할 수 있다.

자세한 내용은 [계측](/docs/concepts/instrumentation/)을 참고한다.

### 계측 라이브러리 {#instrumentation-libraries}

오픈텔레메트리는 지원하는 언어에서 널리 사용되는 라이브러리와 프레임워크로부터
관련 텔레메트리 데이터를 생성하는 다양한 컴포넌트를 지원한다. 예를 들어, HTTP
라이브러리의 수신 및 발신 HTTP 요청에 대한 데이터를 생성한다.

오픈텔레메트리가 지향하는 목표는 널리 사용되는 모든 라이브러리가 기본적으로 관측
가능한 상태로 만들어져, 별도의 의존성이 필요하지 않도록 하는 것이다.

자세한 내용은 [라이브러리 계측](/docs/concepts/instrumentation/libraries/)을
참고한다.

### 익스포터 {#exporters}

{{% docs/languages/exporters/intro %}}

### 제로 코드 계측 {#zero-code-instrumentation}

지원되는 경우, 오픈텔레메트리의 언어별 구현체는 소스 코드를 수정하지 않고
애플리케이션을 계측하는 방법을 제공한다. 기반 메커니즘은 언어마다 다르지만,
제로 코드 계측은 애플리케이션에 오픈텔레메트리 API와 SDK 기능을 추가한다. 또한
계측 라이브러리와 익스포터 의존성을 추가할 수도 있다.

자세한 내용은 [제로 코드 계측](/docs/concepts/instrumentation/zero-code/)을
참고한다.

### 리소스 감지기 {#resource-detectors}

[리소스](/docs/concepts/resources/)는 텔레메트리를 생성하는 엔티티를 리소스
속성으로 나타낸다. 예를 들어, 쿠버네티스의 컨테이너에서 실행되며 텔레메트리를
생성하는 프로세스에는 파드 이름과 네임스페이스가 있고, 디플로이먼트 이름도 있을
수 있다. 이러한 속성을 모두 리소스에 포함할 수 있다.

오픈텔레메트리의 언어별 구현체는 `OTEL_RESOURCE_ATTRIBUTES` 환경 변수를 통한
리소스 감지와 프로세스 런타임, 서비스, 호스트, 운영 체제 등 여러 일반적인
엔티티에 대한 리소스 감지 기능을 제공한다.

자세한 내용은 [리소스](/docs/concepts/resources/)를 참고한다.

### 서비스 간 전파자 {#cross-service-propagators}

전파는 서비스와 프로세스 사이에서 데이터를 전달하는 메커니즘이다. 전파는
트레이싱에만 국한되지 않지만, 프로세스와 네트워크 경계를 넘어 임의로 분산된
서비스 전반에서 트레이스가 시스템의 인과 관계 정보를 구성할 수 있도록 한다.

대부분의 사용 사례에서 컨텍스트 전파는 계측 라이브러리를 통해 이루어진다. 필요한
경우 전파자를 직접 사용하여 스팬의 컨텍스트와
[배기지](/docs/concepts/signals/baggage/)처럼 여러 서비스에 걸쳐 공유되는
관심사를 직렬화하고 역직렬화할 수 있다.

### 샘플러 {#samplers}

샘플링은 시스템에서 생성되는 트레이스의 양을 제한하는 과정이다. 오픈텔레메트리의
각 언어별 구현체는 여러 [헤드 샘플러](/docs/concepts/sampling/#head-sampling)를
제공한다.

자세한 내용은 [샘플링](/docs/concepts/sampling)을 참고한다.

## 쿠버네티스 오퍼레이터 {#kubernetes-operator}

오픈텔레메트리 오퍼레이터는 쿠버네티스 오퍼레이터의 구현체이다. 이 오퍼레이터는
오픈텔레메트리 컬렉터와 오픈텔레메트리를 사용한 워크로드의 자동 계측을 관리한다.

자세한 내용은 [쿠버네티스 오퍼레이터](/docs/platforms/kubernetes/operator/)를
참고한다.

## 서비스형 함수 지원 구성 요소 {#function-as-a-service-assets}

오픈텔레메트리는 여러 클라우드 벤더가 제공하는 서비스형 함수(Function as a
Service)를 모니터링하는 다양한 방법을 지원한다. 오픈텔레메트리 커뮤니티는 현재
애플리케이션을 자동으로 계측할 수 있는 사전 빌드된 Lambda 계층뿐 아니라,
애플리케이션을 수동 또는 자동으로 계측할 때 사용할 수 있는 독립형 컬렉터 Lambda
계층도 제공한다.

자세한 내용은 [서비스형 함수](/docs/platforms/faas/)를 참고한다.
