---
title: 추천 서비스
linkTitle: 추천
aliases: [recommendationservice]
default_lang_commit: 02a20a6d2d0d94867d910d1753daf8b644baa6b1
---

이 서비스는 사용자가 탐색 중인 기존 상품 ID를 기반으로 사용자에게 추천할 상품
목록을 가져오는 역할을 한다.

[추천 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/)

## 계측 {#instrumentation}

이 서비스는 통신에 Spring gRPC를 사용하는 스프링 부트 4(Spring Boot 4)
애플리케이션이다. Java 에이전트의 대안을 보여주기 위해
[오픈텔레메트리(OpenTelemetry) 스프링 부트 스타터](/docs/zero-code/java/spring-boot-starter/)를
사용하며, 이 스타터는 오픈텔레메트리 SDK를 설정하고 `OpenTelemetry` 빈으로
사용할 수 있게 한다. 내보내기 엔드포인트, 리소스 속성, 서비스 이름은 표준
`OTEL_*` 환경 변수에서 가져온다.

스프링 부트 애플리케이션에서는 여전히 Java 에이전트가 기본 선택이며,
[광고 서비스](../ad/)에서도 이를 사용한다. 스타터 페이지에서는 어떤 경우에
스타터가 더 적합한지 설명한다.

```groovy
implementation platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:${opentelemetryInstrumentationVersion}")
implementation "io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter"
```

## 트레이스 {#traces}

### gRPC 스팬 {#grpc-spans}

스타터는 gRPC를 계측하지 않으므로, 이 서비스는
[gRPC 계측 라이브러리](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/grpc-1.6/library/README.md)를
추가하고 해당 인터셉터를 Spring gRPC 전역 인터셉터로 등록한다. 이를 통해
`ListRecommendations` 서버 스팬과 `ListProducts` 클라이언트 스팬을 생성하고,
상품 카탈로그 서비스로 트레이스 컨텍스트를 전파한다.

```java
@Bean
GrpcTelemetry grpcTelemetry(OpenTelemetry openTelemetry) {
  return GrpcTelemetry.create(openTelemetry);
}

@Bean
@GlobalServerInterceptor
ServerInterceptor grpcTelemetryServerInterceptor(GrpcTelemetry grpcTelemetry) {
  return grpcTelemetry.createServerInterceptor();
}

@Bean
@GlobalClientInterceptor
ClientInterceptor grpcTelemetryClientInterceptor(GrpcTelemetry grpcTelemetry) {
  return grpcTelemetry.createClientInterceptor();
}
```

### 현재 스팬에 속성 추가하기 {#add-attributes-to-the-current-span}

gRPC 핸들러 내에서 현재 스팬은 인터셉터가 생성한 서버 스팬이다.
`listRecommendations`에서 이 스팬에 속성을 추가한다.

```java
Span.current().setAttribute("demo.product.recommended.count", productIds.size());
```

### 새 스팬 생성하기 {#create-new-spans}

이 서비스는 `OpenTelemetry` 빈에서 `Tracer`를 가져온다. `getProductList`
메서드는 `spanBuilder`로 `get_product_list` 스팬을 생성하고, `makeCurrent`로
컨텍스트에 설정한 뒤, `finally` 블록에서 종료한다. 예외는 스팬에 기록되며 스팬의
상태를 오류로 설정한다. 추천 상품은 문자열 배열 속성인
`demo.product.filtered.list`에 기록한다.

```java
Tracer tracer = openTelemetry.getTracer("recommendation");

Span span = tracer.spanBuilder("get_product_list").startSpan();
try (Scope ignored = span.makeCurrent()) {
  ...
  span.setAttribute(FILTERED_LIST, recommended);
} catch (RuntimeException e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

## 메트릭 {#metrics}

### 메트릭 초기화하기 {#initializing-metrics}

이 서비스는 동일한 `OpenTelemetry` 빈에서 `Meter`를 가져와 카운터를 생성한다.

```java
LongCounter recommendations =
    openTelemetry
        .getMeter("recommendation")
        .counterBuilder("demo.recommendation.requests")
        .setDescription("Counts the total number of given recommendations")
        .setUnit("{recommendation}")
        .build();
```

각 요청에서 추천한 상품 수를 더한다.

```java
recommendations.add(productIds.size(), CATALOG_RECOMMENDATION);
```

### 현재 생성되는 메트릭 {#current-metrics-produced}

아래의 모든 메트릭 이름은 프로메테우스(Prometheus)/그라파나(Grafana)에서 `.`
문자가 `_`로 변환되어 표시된다는 점에 유의한다.

#### 커스텀 메트릭 {#custom-metrics}

- `demo.recommendation.requests`: 추천 상품 수를 세는 카운터로,
  `recommendation.type` 속성을 `catalog`로 설정한다.

#### 자동 계측된 메트릭 {#auto-instrumented-metrics}

- 스타터에서 제공하는
  [JVM 런타임 메트릭](/docs/specs/semconv/runtime/jvm-metrics/).
  `recommendationCacheFailure` 기능 플래그가 켜져 있을 때 메모리 증가를
  보여준다.
- gRPC 계측 라이브러리에서 제공하는
  [RPC 지연 시간 메트릭](/docs/specs/semconv/rpc/rpc-metrics/). 서버와
  클라이언트 호출 모두에 대한 메트릭이다.
- 서비스에서 `OTEL_EXPERIMENTAL_SDK_TELEMETRY_VERSION=latest`를 설정하므로
  제공되는
  [SDK 자체 옵저버빌리티 메트릭](/docs/specs/semconv/otel/sdk-metrics/).
  [자체 옵저버빌리티 대시보드](/docs/demo/self-observability-dashboard/)를
  참고한다.

## 로그 {#logs}

이 서비스는 스프링 부트의 기본값인 SLF4J와 로그백(Logback)을 통해 로그를
기록한다. 스타터가 오픈텔레메트리 로그백 어펜더를 직접 설치하므로, 서비스에
별도의 로깅 설정은 필요하지 않다. 로그 레코드는 활성 스팬의 트레이스 ID 및 스팬
ID와 함께 OTLP를 통해 내보낸다.

```java
logger.info("Receive ListRecommendations for product ids:{}", productIds);
```
