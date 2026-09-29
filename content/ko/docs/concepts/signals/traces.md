---
title: 트레이스
weight: 1
description: 애플리케이션을 통과하는 요청의 경로
default_lang_commit: 6bf06ddb9fc057dd6e8092f26d988ffe7b1af5ed
cSpell:ignore: Guten
---

**트레이스**는 요청이 애플리케이션에 들어왔을 때 무슨 일이 일어나는지 전체
그림을 보여준다. 단일 데이터베이스를 쓰는 모놀리스이든, 정교한 서비스 메시든,
트레이스는 애플리케이션 안에서 요청이 거치는 전체 **경로**를 이해하는 데
필수적이다.

세 가지 작업 단위를 [스팬](#spans)으로 나누어 살펴본다.

> [!NOTE]
>
> 아래 JSON 예시는 특정 형식을 엄격히 따르지 않으며, 특히
> [OTLP/JSON](/docs/specs/otlp/#json-protobuf-encoding)은 이보다 훨씬 장황하다.

`hello` 스팬:

```json
{
  "name": "hello",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "some_route1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

이 스팬은 전체 작업의 시작과 끝을 나타내는 루트 스팬이다. 트레이스를 가리키는
`trace_id`는 있지만 `parent_id`는 없다. `parent_id`가 없으면 루트 스팬이다.

`hello-greetings` 스팬:

```json
{
  "name": "hello-greetings",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {
    "http.route": "some_route2"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    },
    {
      "name": "bye now!",
      "timestamp": "2022-04-29T18:52:58.114585Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

이 스팬은 인사하기 같은 특정 작업을 표현하며, 부모는 `hello` 스팬이다. 루트
스팬과 같은 `trace_id`를 쓰므로 같은 트레이스에 속한다. `parent_id`는 `hello`
스팬의 `span_id`와 같다.

`hello-salutations` 스팬:

```json
{
  "name": "hello-salutations",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "93564f51e1abe1c2"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {
    "http.route": "some_route3"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

이 스팬은 이 트레이스의 세 번째 작업이며, 앞 스팬과 마찬가지로 `hello` 스팬의
자식이다. 그래서 `hello-greetings` 스팬과 형제 관계다.

위 JSON 세 블록은 모두 같은 `trace_id`를 쓰고, `parent_id`로 계층을 표현한다.
이렇게 묶인 것이 하나의 트레이스다.

스팬마다 구조화된 로그처럼 보일 수 있다. 실제로 그렇게 이해해도 된다. 트레이스는
컨텍스트·상관 관계·계층이 이미 담긴 구조화 로그의 모음으로 볼 수 있다. 다만 이런
로그는 서로 다른 프로세스, 서비스, VM, 데이터 센터 등에서 모인다. 그래서
트레이싱은 어떤 시스템이든 처음부터 끝까지 흐름을 표현할 수 있다.

오픈텔레메트리(OpenTelemetry)에서 트레이싱이 어떻게 동작하는지 알아보려면,
코드를 계측(instrument)할 때 함께 쓰이는 구성 요소부터 짚어본다.

## 트레이서 프로바이더 {#tracer-provider}

트레이서 프로바이더(때로 `TracerProvider`라고 부름)는 `Tracer`를 만드는
팩토리(factory)이다. 대부분 애플리케이션에서는 트레이서 프로바이더를 한 번만
초기화하고, 애플리케이션과 같은 수명을 가진다. 초기화할 때 리소스와 익스포터
설정도 함께 한다. 오픈텔레메트리 트레이싱을 붙일 때 보통 가장 먼저 하는 일 중
하나다. 일부 언어 SDK는 전역 트레이서 프로바이더가 이미 준비되어 있다.

## 트레이서 {#tracer}

트레이서는 서비스 요청처럼 주어진 작업에서 무슨 일이 일어나는지 담은 스팬을
만든다. 트레이서는 트레이서 프로바이더에서 생성한다.

## 트레이스 익스포터 {#trace-exporters}

트레이스 익스포터는 트레이스를 소비자(consumer)로 보낸다. 소비자는 디버깅과
개발에 쓰는 표준 출력, 오픈텔레메트리 컬렉터, 또는 선택한 오픈소스·벤더 백엔드가
될 수 있다.

## 컨텍스트 전파 {#context-propagation}

컨텍스트 전파(context propagation)는 분산 트레이싱의 핵심이다. 컨텍스트 전파로
스팬이 어디서 만들어졌든 서로 연관시켜 하나의 트레이스로 맞출 수 있다. 자세한
내용은 [컨텍스트 전파](../../context-propagation) 개념 페이지를 참고한다.

## 스팬 {#spans}

**스팬**은 작업(operation) 또는 실행 단위다. 스팬은 트레이스를 이루는 기본
단위이다. 오픈텔레메트리 스팬에는 보통 다음 정보가 들어간다.

- 이름
- 부모 스팬 ID(루트 스팬은 비어 있음)
- 시작·종료 타임스탬프
- [스팬 컨텍스트](#span-context)
- [속성](#attributes)
- [스팬 이벤트](#span-events)
- [스팬 링크](#span-links)
- [스팬 상태](#span-status)

스팬 예시:

```json
{
  "name": "/v1/sys/health",
  "context": {
    "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
    "span_id": "086e83747d0e381e"
  },
  "parent_id": "",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
```

부모 스팬 ID가 있으면 스팬을 중첩할 수 있다. 자식 스팬은 하위 작업을 뜻하므로
애플리케이션에서 한 일을 더 정확히 표현할 수 있다.

### 스팬 컨텍스트 {#span-context}

스팬 컨텍스트(span context)는 스팬마다 붙는 불변(immutable) 객체로, 다음을
담는다.

- 스팬이 속한 트레이스를 나타내는 Trace ID
- 스팬의 Span ID
- 트레이스 정보를 담은 이진 인코딩인 Trace Flags
- 벤더별 트레이스 정보를 담을 수 있는 키-값 쌍 목록인 Trace State

스팬 컨텍스트는 [분산 컨텍스트](#context-propagation) 및 [배기지](../baggage)와
함께 직렬화·전파되는 스팬의 일부이다.

스팬 컨텍스트에 Trace ID가 있으므로 [스팬 링크](#span-links)를 만들 때 사용한다.

### 속성 {#attributes}

속성(attribute)은 스팬에 붙이는 키-값 메타데이터로, 추적 중인 작업에 대한 부가
정보를 담는다.

예를 들어 스팬이 eCommerce 시스템에서 사용자 장바구니에 항목을 추가하는 작업을
추적한다면, 사용자 ID, 추가할 항목 ID, 장바구니 ID를 담을 수 있다.

속성은 스팬을 만드는 중이나 만든 뒤에 추가할 수 있다. SDK 샘플링에 쓰려면 만들
때 넣는 편이 낫다. 나중에 값을 알게 되면 그 값으로 스팬을 갱신한다.

속성은 각 언어 SDK가 따르는 규칙이 있다.

- 키는 null이 아닌 문자열이어야 한다.
- 값은 null이 아닌 문자열, 불리언, 부동소수점, 정수, 또는 이들의 배열이어야
  한다.

또한 일반적인 작업에 흔히 쓰이는 메타데이터 이름 규칙인
[시맨틱 속성](/docs/specs/semconv/general/trace/)이 있다. 가능하면 시맨틱 속성
이름을 써서 시스템 간 메타데이터 종류를 표준화하는 것이 좋다.

### 스팬 이벤트 {#span-events}

스팬 이벤트(span event)는 스팬에 붙는 구조화된 로그 메시지(또는 주석)로 볼 수
있다. 보통 스팬이 진행되는 동안 의미 있는 한 순간을 표시할 때 쓴다.

웹 브라우저를 예로 들면 다음 두 가지를 구분할 수 있다.

1. 페이지 로드 추적
2. 페이지가 상호작용이 가능해지는 시점 표시

첫 번째는 시작과 끝이 있는 작업이므로 스팬으로 추적하기에 적합하다.

두 번째는 의미 있는 한 시점을 나타내므로 스팬 이벤트로 추적하기에 적합하다.

#### 스팬 이벤트와 속성 사용 기준 {#when-to-use-span-events-versus-span-attributes}

스팬 이벤트에도 속성이 있어서, 이벤트와 속성 중 무엇을 쓸지 헷갈릴 수 있다.
그때는 특정 시각이 의미 있는지 보면 된다.

예를 들어 스팬으로 작업을 추적하다가 작업이 끝났을 때, 결과 데이터를
텔레메트리에 더 넣고 싶다고 하자.

- 완료 시각이 중요하면 → 스팬 이벤트에 데이터를 붙인다.
- 시각은 중요하지 않으면 → 스팬 속성에 데이터를 붙인다.

### 스팬 링크 {#span-links}

링크는 스팬 하나를 다른 스팬 하나 이상과 묶어 인과 관계를 표현한다. 예를 들어
일부 작업을 트레이스로 추적하는 분산 시스템이 있다고 해 보자.

어떤 작업에 대한 응답으로 추가 작업이 큐에 들어가지만, 실행은 비동기일 수 있다.
이후 작업도 별도 트레이스로 추적할 수 있다.

후속 트레이스를 첫 트레이스와 연결하고 싶지만, 후속 작업이 언제 시작할지 모를
때가 있다. 이때 두 트레이스를 이어 주려면 스팬 링크를 쓴다.

첫 트레이스의 마지막 스팬을 두 번째 트레이스의 첫 스팬에 링크하면, 둘은 인과
관계로 연결된다.

링크는 필수는 아니지만, 서로 다른 트레이스의 스팬을 연관짓는 좋은 방법이다.

자세한 내용은 [스팬 링크](/docs/specs/otel/trace/api/#link)를 참고한다.

### 스팬 상태 {#span-status}

각 스팬에는 상태(status)가 있다. 가능한 값은 세 가지다.

- `Unset`
- `Error`
- `Ok`

기본값은 `Unset`이다. `Unset`이면 추적한 작업이 오류 없이 정상 완료했다는
뜻이다.

`Error`이면 추적한 작업에서 오류가 났다는 뜻이다. 예를 들어 요청을 처리하는
서버에서 HTTP 500이 발생한 경우다.

`Ok`이면 개발자가 스팬을 명시적으로 오류 없음으로 표시한 것이다. 직관과 달리,
오류 없이 끝났다고 해서 꼭 `Ok`를 넣을 필요는 없다. 그런 경우 `Unset`이면
충분하다. `Ok`는 개발자가 직접 정한 상태를 모호하지 않게 보여 주는 "최종
판정"이다. 스팬을 무조건 "성공"으로만 해석되길 원할 때 쓴다.

정리하면, `Unset`은 오류 없이 끝난 스팬이고, `Ok`는 개발자가 성공으로 표시한
스팬이다. 보통 `Ok`를 따로 설정할 필요는 없다.

### 스팬 종류(SpanKind) {#span-kind}

스팬을 만들 때 종류는 `Client`, `Server`, `Internal`, `Producer`, `Consumer` 중
하나다. 스팬 종류(span kind)는 트레이스를 어떻게 맞출지 트레이싱 백엔드에 힌트를
준다. 오픈텔레메트리 명세에 따르면, 서버 스팬의 부모는 보통 원격 클라이언트
스팬이고, 클라이언트 스팬의 자식은 보통 서버 스팬이다. 컨슈머 스팬의 부모는 항상
프로듀서이고, 프로듀서 스팬의 자식은 항상 컨슈머다. 지정하지 않으면 `Internal`로
본다.

자세한 내용은 [SpanKind](/docs/specs/otel/trace/api/#spankind)를 참고한다.

#### Client {#client}

클라이언트 스팬은 나가는 HTTP 요청이나 DB 호출처럼, 동기적으로 이뤄지는
아웃바운드 원격 호출을 뜻한다. 여기서 "동기(synchronous)"는 `async/await`와
무관하고, 나중 처리를 위해 큐에 넣지 않는다는 뜻이다.

#### Server {#server}

서버 스팬은 들어오는 HTTP 요청이나 원격 프로시저 호출처럼 동기적인 인바운드 원격
호출을 나타낸다.

#### Internal {#internal}

내부 스팬은 프로세스 경계를 넘지 않는 작업을 나타낸다. 함수 호출이나 Express
미들웨어를 계측할 때 내부 스팬을 주로 사용한다.

#### Producer {#producer}

프로듀서 스팬은 나중에 비동기로 처리될 작업을 만드는 경우를 나타낸다. 작업 큐에
넣는 원격 작업이거나, 이벤트 리스너가 처리하는 로컬 작업일 수 있다.

#### Consumer {#consumer}

컨슈머 스팬은 프로듀서가 만든 작업을 처리한다. 프로듀서 스팬이 끝난 뒤 한참
지나서 시작할 수도 있다.

## 명세 {#specification}

자세한 내용은 [트레이스 명세](/docs/specs/otel/overview/#tracing-signal)를
참고한다.
