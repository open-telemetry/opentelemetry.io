---
title: 용어집
description:
  오픈텔레메트리(OpenTelemetry)에서 사용되는 텔레메트리 관련 용어의 정의와 표기
  규칙
weight: 200
default_lang_commit: 6524d48015ecb576ef4cb4540493b9c7be51e60f
---

이 용어집은 오픈텔레메트리(OpenTelemetry) 프로젝트에서 새롭게 정의된 용어와
[개념](/docs/concepts/)을 설명하고, 옵저버빌리티(observability) 분야에서
일반적으로 사용되는 용어가 오픈텔레메트리에서 어떤 의미로 사용되는지 명확히
설명한다.

또한 필요한 경우 철자 및 대소문자 표기에 대한 규칙도 함께 설명한다. 예를 들어
[오픈텔레메트리](#opentelemetry) 및 [OTel](#otel)을 참고한다.

## 용어 {#terms}

### 집계(Aggregation) {#aggregation}

프로그램 실행 중 특정 시간 구간 동안 발생한 여러 측정값을 결합하여, 해당
측정값에 대한 정확한 통계값 또는 추정 통계값을 생성하는 과정이다.
[메트릭](#metric) [데이터 소스](#data-source)에서 사용된다.

### API {#api}

애플리케이션 프로그래밍 인터페이스(Application Programming Interface)이다.
오픈텔레메트리 프로젝트에서는 각 [데이터 소스](#data-source)별로 텔레메트리
데이터가 생성되는 방식을 정의하는 데 사용된다.

### 애플리케이션 {#application}

최종 사용자(end user) 또는 다른 애플리케이션을 위해 설계된 하나 이상의
[서비스](#service)를 의미한다.

### APM {#apm}

애플리케이션 성능 모니터링(Application Performance Monitoring)은 소프트웨어
애플리케이션과 그 성능(속도, 신뢰성, 가용성 등)을 모니터링하여 문제를 탐지하고,
경고(alert)를 제공하며, 근본 원인(root cause)을 파악하기 위한 도구와 기능을
제공하는 것을 의미한다.

### 속성(Attribute) {#attribute}

[메타데이터](#metadata)에 대한 오픈텔레메트리 용어이다. 텔레메트리를 생성하는
엔터티에 키-값 형태의 정보를 추가한다. [시그널](#signal)과 [리소스](#resource)
전반에서 사용된다. [attribute 스펙][attribute]을 참고한다.

### 자동 계측(Instrumentation) {#automatic-instrumentation}

최종 사용자가 애플리케이션의 소스 코드를 수정하지 않고도 텔레메트리를 수집할 수
있는 방법을 의미한다. 구현 방식은 프로그래밍 언어에 따라 다르며, 예를 들어
바이트코드 주입(bytecode injection)이나 몽키 패칭(monkey patching)과 같은 기법이
사용된다.

### 배기지(Baggage) {#baggage}

이벤트와 서비스 간의 인과 관계(causal relationship)를 확립하는 데 도움이 되도록
[메타데이터](#metadata)를 전파(propagate)하기 위한 메커니즘이다. [baggage
스펙][baggage]을 참고한다.

### 카디널리티(Cardinality) {#cardinality}

주어진 [속성](#attribute) 또는 속성 집합이 가질 수 있는 고유한 값의 개수를
의미한다. 카디널리티가 높다는 것은 고유한 값이 많다는 의미이며, 이는 텔레메트리
백엔드의 성능 및 저장소 요구사항, 그리고 [메트릭](#metric) SDK가 사용하는
메모리에 영향을 줄 수 있다. 예를 들어, `user_id` 속성은 높은 카디널리티를 가지는
반면, `"200"`, `"404"`, `"500"`과 같은 값을 갖는 `status_code` 속성은 낮은
카디널리티를 가진다.

### 카디널리티 제한(Cardinality limit) {#cardinality-limit}

[메트릭](#metric) SDK가 단일 메트릭 스트림에 대해 추적하는 고유한 속성 조합의
개수를 제한하기 위한 설정 가능한 최댓값이며, 메모리 사용량을 제한하는 데
사용된다. 제한에 도달하면, 이후의 조합은 `otel.metric.overflow=true` 속성으로
식별되는 단일 오버플로우 데이터 포인트로 집계된다. [카디널리티
제한][cardinality limits]을 참고한다.

### 클라이언트 라이브러리 {#client-library}

[계측된 라이브러리](#instrumented-library)를 참고한다.

### 클라이언트 사이드 앱 {#client-side-app}

[애플리케이션](#application)의 구성 요소로, 사설 인프라(private infrastructure)
내부에서 실행되지 않으며 일반적으로 최종 사용자(end-user)가 직접 사용하는
애플리케이션을 의미한다. 클라이언트 측 애플리케이션의 예로는 브라우저
애플리케이션, 모바일 애플리케이션, 그리고 IoT 장치에서 실행되는 애플리케이션이
있다.

### 컬렉터(Collector) {#collector}

[오픈텔레메트리 컬렉터][OpenTelemetry Collector] 또는 줄여서 컬렉터는 텔레메트리
데이터를 수신(receive), 처리(process), 내보내기(export)하기 위한 벤더
중립적인(vendor-agnostic) 구현체이다. 에이전트(agent) 또는 게이트웨이(gateway)로
배포할 수 있는 단일 바이너리로 제공된다.

> **표기 규칙**: 영문에서 [오픈텔레메트리 컬렉터][OpenTelemetry Collector]를
> 지칭할 때는 항상 "Collector" 표기를 대문자로 표기한다. 형용사로 사용하는
> 경우에는 "Collector"만 사용한다. 예를 들어, "Collector configuration"과 같이
> 표기한다.

[OpenTelemetry Collector]: /docs/collector/

### Contrib {#contrib}

여러 [계측 라이브러리](#instrumentation-library)와 [컬렉터](#collector)는 핵심
기능(core capabilities) 집합을 제공하며, 벤더별 `Exporter`를 포함한 비핵심
기능(non-core capabilities)을 위한 별도의 contrib 저장소(repository)도 제공한다.

### 컨텍스트 전파 {#context-propagation}

모든 [데이터 소스](#data-source)가 [트랜잭션](#transaction)의 수명 주기 전반에
걸쳐 상태를 저장하고 데이터에 접근하기 위한 공통 컨텍스트 메커니즘을 공유할 수
있도록 한다. [컨텍스트 전파 스펙][context propagation]을 참고한다.

### DAG {#dag}

[방향성 비순환 그래프(Directed Acyclic Graph)][dag]

### 데이터 소스 {#data-source}

[시그널](#signal)을 참고한다.

### 차원(Dimension) {#dimension}

[메트릭](#metric)에서 사용되는 용어이다. [속성](#attribute)을 참고한다.

### 분산 트레이싱 {#distributed-tracing}

[애플리케이션](#application)을 구성하는 [서비스](#service)들이 처리하는 단일
[요청](#request)의 진행 과정을 추적하는 것을 [트레이스](#trace)라고 한다.
[분산 트레이스](#distributed-tracing)는 프로세스, 네트워크 및 보안 경계를
가로질러 추적된다. [분산 트레이싱][distributed tracing]을 참고한다.

### 배포판 {#distribution}

커스터마이징(customization)이 적용된 업스트림 오픈텔레메트리
저장소(repository)를 감싸는 래퍼(wrapper)이다. [배포판][Distributions]을
참고한다.

### 엔티티(Entity) {#entity}

물리적 또는 논리적 객체를 식별하고 설명하는 [속성](#attribute)의 집합이다.
엔티티는 일반적으로 텔레메트리와 연관된다. 예를 들어, CPU 엔터티는 물리적 CPU를
설명하며, 서비스 엔터티는 HTTP 또는 기타 서비스를 구성하는 프로세스의 논리적
그룹을 설명한다.

### 이벤트 {#event}

이벤트는 이벤트 이름과 잘 알려진 구조(well-known structure)를 갖는
[로그 레코드](#log-record)이다. 예를 들어, 오픈텔레메트리의 브라우저 이벤트는
특정 명명 규칙(naming convention)을 따르며 공통된 구조 내에 특정 데이터를
포함한다.

### 익스포터(Exporter) {#exporter}

텔레메트리 데이터를 소비자(consumer)에게 전송하는 기능을 제공한다. 익스포터는
푸시(push) 기반 또는 풀(pull) 기반일 수 있다.

### 필드 {#field}

[로그 레코드](#log-record)에서 사용하는 용어이다. [속성](#attribute) 및
[리소스](#resource)를 포함한 정의된 필드를 통해 [메타데이터](#metadata)를 추가할
수 있다. 심각도(severity) 및 Trace 정보와 같은 다른 필드도 `Metadata`로 간주될
수 있다. [필드 스펙][field]를 참고한다.

### gRPC {#grpc}

고성능 오픈 소스 범용 [RPC](#rpc) 프레임워크이다. [gRPC](https://grpc.io)를
참고한다.

### HTTP {#http}

[하이퍼텍스트 전송 프로토콜(Hypertext Transfer Protocol)][http]의 약자이다.

### 계측된 라이브러리 {#instrumented-library}

[트레이스](#trace), [메트릭](#metric), [로그](#log)와 같은 텔레메트리 시그널이
수집되는 대상 [라이브러리](#library)를 의미한다. [계측된
라이브러리][Instrumented library]를 참고한다.

### 계측 라이브러리 {#instrumentation-library}

특정 [계측 라이브러리](#instrumented-library)에 대한 계측(instrumentation)을
제공하는 [라이브러리](#library)를 의미한다. 해당 라이브러리에 오픈텔레메트리
계측 기능이 내장되어 있는 경우, [계측된 라이브러리](#instrumented-library)와
[계측 라이브러리](#instrumentation-library)는 동일한 [라이브러리](#library)일 수
있다. [라이브러리 명세][spec-instrumentation-lib]를 참고한다.

### JSON {#json}

[JavaScript Object Notation][json]의 약어이다.

### 레이블 {#label}

[메트릭](#metric)에서 사용하는 용어이다. [메타데이터](#metadata)를 참고한다.

### 언어 {#language}

프로그래밍 언어이다.

### 라이브러리 {#library}

인터페이스를 통해 호출되는, 언어별로 구현된 기능의 집합이다.

### 로그 {#log}

때로는 [로그 레코드](#log-record)의 집합을 의미하는 데 사용된다.

하지만 [로그](#log)가 단일 [로그 레코드](#log-record)를 의미하는 경우도 있으므로
모호할 수 있다. 의미가 모호할 수 있는 경우에는 `로그 레코드`와 같은 추가
수식어를 사용하는 것이 좋다. [로그][log]를 참고한다.

### 로그 레코드 {#log-record}

타임스탬프(timestamp)와 심각도(severity)를 포함하는 데이터 기록이다. 트레이스와
연관된 경우 [트레이스 ID](#trace) 및 [스팬 ID](#span)를 포함할 수도 있다. [로그
레코드][Log record]를 참고한다.

### 메타데이터 {#metadata}

텔레메트리를 생성하는 엔터티에 추가되는 키-값 쌍이다. 예를 들어 `foo="bar"`가
있다. 오픈텔레메트리에서는 이러한 쌍을 [속성](#attribute)이라고 부른다. 또한
[메트릭](#metric)에는 [차원](#dimension)과 [레이블](#label)이 있으며,
[로그](#log)에는 [필드](#field)가 있다.

### 메트릭 {#metric}

[메타데이터](#metadata)와 함께 시계열(time series) 형태로 데이터 포인트를
기록한다. 데이터 포인트는 원시 측정값(raw measurements)일 수도 있고, 미리 정의된
집계(predefined aggregation) 결과일 수도 있다. [메트릭][metric]을 참고한다.

### OC {#oc}

[OpenCensus](#opencensus)의 약자이다.

### 옵저버빌리티 백엔드 {#observability-backend}

텔레메트리 데이터를 수신(receive), 처리(process), 저장(store), 조회(query)하는
역할을 담당하는 옵저버빌리티 플랫폼의 구성 요소이다. 예시로는 [Jaeger][] 및
[Prometheus][]와 같은 오픈 소스 도구와 다양한 상용 제품이 있다. 오픈텔레메트리
자체는 옵저버빌리티 백엔드가 아니다.

### 옵저버빌리티 프론트엔드 {#observability-frontend}

텔레메트리 데이터를 시각화하고 분석하기 위한 사용자 인터페이스를 제공하는
옵저버빌리티 플랫폼의 구성 요소이다. 특히 상용 제품의 경우, 옵저버빌리티
백엔드의 일부로 제공되는 경우가 많다.

### OpAMP {#opamp}

[Open Agent Management Protocol](/docs/collector/management/#opamp)의 약자이다.

> **표기 규칙**: 설명이나 지침에서는 `OPAMP` 또는 `opamp`가 아닌 `OpAMP`로
> 표기한다.

### OpenCensus {#opencensus}

오픈텔레메트리의 전신(predecessor) 프로젝트이다. 자세한 내용은
[역사](/docs/what-is-opentelemetry/#history)를 참고한다.

### 오픈텔레메트리(OpenTelemetry) {#opentelemetry}

[OpenTracing](#opentracing)과 [OpenCensus](#opencensus) 프로젝트의
[통합][merger]을 통해 탄생한 오픈텔레메트리(OpenTelemetry)는 이 웹사이트의
주제이며, [API](#api), [SDK](#sdk), 그리고 도구들의 집합이다. 이를 사용하여
[계측](/docs/concepts/instrumentation/)을 수행하고, [메트릭](#metric),
[로그](#log), [트레이스](#trace)와 같은
[텔레메트리 데이터](/docs/concepts/signals/)를 생성(generate),
[수집(collect)](/docs/concepts/components/#collector) 및
[내보내기(export)](/docs/concepts/components/#exporters)할 수 있다.

> **표기 규칙**: OpenTelemetry는 항상 하이픈 없이 하나의 단어로 표기하며, 위와
> 같이 대문자와 소문자를 구분하여 표기해야 한다.

[merger]: /docs/what-is-opentelemetry/#history

### OpenTracing {#opentracing}

오픈텔레메트리의 전신(predecessor) 프로젝트이다. 자세한 내용은
[역사](/docs/what-is-opentelemetry/#history)를 참고한다.

### OT {#ot}

[OpenTracing](#opentracing)의 약자이다.

### OTel {#otel}

[OpenTelemetry](/docs/what-is-opentelemetry/)의 약자이다.

> **표기**: `OTEL`이 아닌 OTel로 표기한다.

### OTelCol {#otelcol}

[오픈텔레메트리 컬렉터](#collector)의 약자이다.

### OTEP {#otep}

[OpenTelemetry Enhancement Proposal][]의 약자이다.

> **표기 규칙**: 복수형으로 사용할 때는 "OTEPs"로 표기한다. 설명 문서에서는
> `OTep` 또는 `otep`와 같이 표기하지 않는다.

[OpenTelemetry Enhancement Proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP {#otlp}

[오픈텔레메트리 프로토콜](/docs/specs/otlp/)의 약자이다.

### 전파자(Propagators) {#propagators}

[스팬](#span)의 스팬 컨텍스트(span context) 및 [배기지](#baggage)와 같은 특정
텔레메트리 데이터 부분을 직렬화(serialize)하고 역직렬화(deserialize)하는 데
사용된다. [전파자][Propagators]를 참고한다.

### Proto {#proto}

언어에 독립적인 인터페이스 타입이다. [opentelemetry-proto][]를 참고한다.

### 리시버(Receiver) {#receiver}

텔레메트리 데이터를 수신하는 방법을 정의하기 위해
[컬렉터](/docs/collector/configuration/#receivers)에서 사용하는 용어이다.
리시버는 푸시(push) 기반 또는 풀(pull) 기반일 수 있다. [리시버][Receiver]를
참고한다.

### 요청 {#request}

[분산 트레이싱](#distributed-tracing)을 참고한다.

### 리소스 {#resource}

텔레메트리를 생성하는 물리적 또는 논리적 객체를 식별하거나 설명하는
[엔티티](#entity) 또는 [속성](#attribute)의 집합이다.

### REST {#rest}

[표현 상태 전송(Representational State Transfer)][rest]의 약자이다.

### RPC {#rpc}

[원격 프로시저 호출(Remote Procedure Call)][rpc]의 약자이다.

### 샘플링 {#sampling}

내보내는(export) 데이터의 양을 제어하기 위한 메커니즘이다. 가장 일반적으로
[트레이싱](#trace) [데이터 소스](#data-source)와 함께 사용된다.
[샘플링][Sampling]을 참고한다.

### SDK {#sdk}

소프트웨어 개발 키트(Software Development Kit)의 약자이다. 오픈텔레메트리
[API](#api)를 구현하는 텔레메트리 [라이브러리](#library)를 의미한다.

### 시맨틱 컨벤션 {#semantic-conventions}

벤더 중립적(vendor-agnostic)인 텔레메트리 데이터를 제공하기 위해
[메타데이터](#metadata)의 표준 이름과 값을 정의한다.

### 서비스 {#service}

[애플리케이션](#application)의 구성 요소이다. 일반적으로 고가용성(high
availability) 및 확장성(scalability)을 위해 하나의 [서비스](#service)에 대해
여러 인스턴스가 배포된다. 또한 [서비스](#service)는 여러 위치에 배포될 수 있다.

### 시그널 {#signal}

[트레이스](#trace), [메트릭](#metric), [로그](#log) 중 하나를 가리킨다.
[시그널][Signals]을 참고한다.

### 스팬(Span) {#span}

[트레이스](#trace) 내의 단일 작업(operation)을 나타낸다. [스팬][Span]을
참고한다.

### 스팬 링크 {#span-link}

스팬 링크는 인과 관계가 있는 스팬 간의 연결이다. 자세한 내용은
[스팬 간의 링크](/docs/specs/otel/overview#links-between-spans)와
[링크 지정](/docs/specs/otel/trace/api#specifying-links)을 참고한다.

### 명세 {#specification}

모든 구현체가 따라야 하는 언어 간 공통 요구사항과 기대사항을 설명한다.
[명세][Specification]을 참고한다.

### 상태 {#status}

작업의 결과를 나타낸다. 주로 오류 발생 여부를 나타내는 데 사용된다.
[상태][Status]를 참고한다.

### 태그 {#tag}

[메타데이터](#metadata)를 참고한다.

### 트레이스 {#trace}

[스팬](#span) 간의 엣지(edge)가 부모-자식 관계로 정의된 [스팬](#span)의
[DAG](#dag)이다. [트레이스][Traces]를 참고한다.

### 트레이서 {#tracer}

[스팬](#span)을 생성하는 역할을 담당한다. [트레이서][Tracer]를 참고한다.

### 트랜잭션 {#transaction}

[분산 트레이싱](#distributed-tracing)을 참고한다.

### zPages {#zpages}

외부 익스포터의 프로세스 내(in-process) 대안이다. 포함된 경우, 백그라운드에서
트레이스 및 메트릭 정보를 수집하고 집계하며, 이 데이터는 요청 시 웹 페이지를
통해 제공된다. [zPages][]를 참고한다.

[attribute]: /docs/specs/otel/common/#attributes
[baggage]: /docs/specs/otel/baggage/api/
[cardinality limits]: ../signals/metrics/#cardinality-limits
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: ../signals/traces/
[distributions]: ../distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[Jaeger]: https://www.jaegertracing.io/
[json]: https://en.wikipedia.org/wiki/JSON
[log record]: /docs/specs/otel/glossary#log-record
[log]: /docs/concepts/signals/logs/
[metric]: ../signals/metrics/
[opentelemetry-proto]: https://github.com/open-telemetry/opentelemetry-proto
[propagators]: /docs/specs/otel/context/api-propagators/
[Prometheus]: https://prometheus.io/
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: ../signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[specification]: ../components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[tracer]: /docs/specs/otel/trace/api#tracer
[traces]: /docs/specs/otel/overview#traces
[zpages]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md
