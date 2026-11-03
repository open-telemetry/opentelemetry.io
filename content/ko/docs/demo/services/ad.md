---
title: 광고 서비스
linkTitle: 광고
aliases: [adservice]
default_lang_commit: 1af9529134b418c716977d11d6e04644dfb55ac9
---

이 서비스는 컨텍스트 키를 기반으로 사용자에게 제공할 적절한 광고를 결정한다.
광고는 스토어에서 판매하는 상품을 대상으로 한다.

[광고 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/ad/)

## 자동 계측 {#auto-instrumentation}

이 서비스는 오픈텔레메트리(OpenTelemetry) Java 에이전트를 사용하여 gRPC와 같은
라이브러리를 자동으로 계측하고 오픈텔레메트리 SDK를 설정한다. 에이전트는
`-javaagent` 명령줄 인수를 사용하여 프로세스에 전달된다. 명령줄 인수는
`Dockerfile`의 `JAVA_TOOL_OPTIONS`를 통해 추가되며, 자동으로 생성된 Gradle 시작
스크립트에서 사용된다.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```

## 트레이스 {#traces}

### 자동 계측된 스팬에 속성 추가하기 {#add-attributes-to-auto-instrumented-spans}

자동 계측된 코드가 실행되는 동안 컨텍스트에서 현재 스팬을 가져올 수 있다.

```java
Span span = Span.current();
```

스팬에 속성을 추가하려면 스팬 객체의 `setAttribute`를 사용한다. `getAds`
함수에서는 스팬에 여러 속성을 추가한다.

```java
span.setAttribute("app.ads.contextKeys", req.getContextKeysList().toString());
span.setAttribute("app.ads.contextKeys.count", req.getContextKeysCount());
```

### 스팬 이벤트 추가하기 {#add-span-events}

스팬에 이벤트를 추가하려면 스팬 객체의 `addEvent`를 사용한다. `getAds`
함수에서는 예외를 포착하면 속성이 포함된 이벤트를 추가한다.

```java
span.addEvent("Error", Attributes.of(AttributeKey.stringKey("exception.message"), e.getMessage()));
```

### 스팬 상태 설정하기 {#setting-span-status}

작업 결과가 오류인 경우, 스팬 객체의 `setStatus`를 사용하여 스팬 상태를 그에
맞게 설정하는 것이 좋다. `getAds` 함수에서는 예외를 포착하면 스팬 상태를
설정한다.

```java
span.setStatus(StatusCode.ERROR);
```

### 새 스팬 생성하기 {#create-new-spans}

`Tracer.spanBuilder("spanName").startSpan()`을 사용하여 새 스팬을 생성하고
시작할 수 있다. 새로 생성한 스팬은 `Span.makeCurrent()`를 사용하여 컨텍스트에
설정하는 것이 좋다. `getRandomAds` 함수는 새 스팬을 생성하고 컨텍스트에 설정한
뒤 작업을 수행하고, 마지막으로 스팬을 종료한다.

```java
// 새 스팬을 수동으로 생성하고 시작한다
Tracer tracer = GlobalOpenTelemetry.getTracer("ad");
Span span = tracer.spanBuilder("getRandomAds").startSpan();

// 자식 스팬이 시작될 때 부모가 올바르게 설정되도록 스팬을 컨텍스트에 넣는다
try (Scope ignored = span.makeCurrent()) {

  Collection<Ad> allAds = adsMap.values();
  for (int i = 0; i < MAX_ADS_TO_SERVE; i++) {
    ads.add(Iterables.get(allAds, random.nextInt(allAds.size())));
  }
  span.setAttribute("app.ads.count", ads.size());

} finally {
  span.end();
}
```

## 메트릭 {#metrics}

### 메트릭 초기화하기 {#initializing-metrics}

스팬을 생성할 때와 마찬가지로, 메트릭을 생성하는 첫 단계는
`GlobalOpenTelemetry.getMeter("ad")`와 같이 `Meter` 인스턴스를 초기화하는
것이다. 그런 다음 `Meter` 인스턴스에서 제공하는 다양한 빌더 메서드를 사용하여
원하는 메트릭 인스트루먼트를 생성한다. 예를 들면 다음과 같다.

```java
meter
  .counterBuilder("app.ads.ad_requests")
  .setDescription("Counts ad requests by request and response type")
  .build();
```

### OTel을 사용하지 않는 커스텀 메트릭 연결하기(프로메테우스 클라이언트 라이브러리) {#bridging-non-otel-custom-metrics-prometheus-client-library}

광고 서비스는 오픈텔레메트리 SDK 대신
[프로메테우스(Prometheus) Java 클라이언트 라이브러리](https://github.com/prometheus/client_java)를
사용하여 소수의 커스텀 메트릭도 노출한다. 이 메트릭은 별도의 HTTP 엔드포인트
(`AD_PROMETHEUS_PORT`의 `/metrics`, 기본값 `9465`)에 노출되며, 오픈텔레메트리
컬렉터의
[`prometheus` 리시버](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver)가
수집하여 OTel SDK 메트릭과 동일한 파이프라인으로 전달한다.

```java
private static final Counter adsServedCounter =
    Counter.builder()
        .name("demo_ad_served_total")
        .help("Total number of ads served, labeled by category")
        .labelNames("category")
        .register();

HTTPServer prometheusServer =
    HTTPServer.builder().port(prometheusPort).buildAndStart();
```

> [!NOTE]
>
> 이는 **OTel 도입 과정에서 흔히 사용되는 패턴**을 보여주기 위해 의도적으로
> 포함한 것이다. 조직은 라이브러리, 서드파티 익스포터 또는 레거시 서비스에 이미
> 상당한 규모의 프로메테우스 계측을 갖추고 있는 경우가 많으며, 처음부터 모든
> 것을 다시 작성하지 않고도 해당 메트릭을 오픈텔레메트리 네이티브 파이프라인으로
> 수집하고자 한다. 컬렉터의 `prometheus` 리시버는 이를 가능하게 하는 연결 역할을
> 한다.

이를 연결하는 컬렉터 설정은 다음과 같다.

```yaml
receivers:
  prometheus/ad:
    config:
      scrape_configs:
        - job_name: ad
          scrape_interval: 10s
          static_configs:
            - targets: ['ad:${env:AD_PROMETHEUS_PORT}']
```

> [!TIP]
>
> **권장 사항**: 이를 _과도기적_ 패턴으로 취급한다. 새로운 커스텀 메트릭에는
> 오픈텔레메트리 SDK를 직접 사용한다. 기존 프로메테우스 클라이언트 메트릭은 관련
> 코드를 수정하면서 점진적으로 마이그레이션하거나, 이를 위한 별도의 리팩터링을
> 통해 마이그레이션한다.
>
> 오픈텔레메트리와 프로메테우스 텔레메트리를 혼용할 때 흔히 발생하는 문제는
> 다음과 같다.
>
> - **식별 정보 불일치**: 두 파이프라인의 `service.name`과
>   `service.instance.id`가 일치하지 않을 수 있다.
> - **서로 다른 개념 체계**: 프로메테우스와 OTel은 서로 다른 개념(레이블과 속성,
>   서로 다른 시맨틱 컨벤션)을 사용하며, API와 수집 파이프라인이 별개이고
>   데이터에 정보를 추가하는 규칙도 다를 수 있다.
> - **일관성 없는 코드**: 기존 메트릭에는 프로메테우스 클라이언트 호출을
>   사용하고 새로운 메트릭에는 OTel API 호출을 사용하면 코드베이스에 일관된 코딩
>   방식이 유지되지 않는다.

### 현재 생성되는 메트릭 {#current-metrics-produced}

아래의 모든 메트릭 이름은 프로메테우스/그라파나(Grafana)에서 `.` 문자가 `_`로
변환되어 표시된다는 점에 유의한다.

#### 커스텀 메트릭 {#custom-metrics}

현재 다음 커스텀 메트릭을 사용할 수 있다.

- `app.ads.ad_requests`(오픈텔레메트리 SDK): 광고 요청 수를 세는 카운터로,
  요청이 컨텍스트 키를 기반으로 타기팅되었는지 여부와 응답이 타기팅된 광고인지
  무작위 광고인지를 나타내는 차원을 포함한다.
- `demo_ad_served_total`(프로메테우스 클라이언트 라이브러리, 컬렉터가 수집):
  제공된 광고 수를 세는 카운터로, `category`(예: `telescopes`, `binoculars`,
  `random`)를 레이블로 사용한다. 위의
  [OTel을 사용하지 않는 커스텀 메트릭 연결하기](#bridging-non-otel-custom-metrics-prometheus-client-library)를
  참고한다.

#### 자동 계측된 메트릭 {#auto-instrumented-metrics}

애플리케이션에서 다음 자동 계측된 메트릭을 사용할 수 있다.

- [JVM 런타임 메트릭](/docs/specs/semconv/runtime/jvm-metrics/).
- [RPC 지연 시간 메트릭](/docs/specs/semconv/rpc/rpc-metrics/#rpc-server)

## 로그 {#logs}

광고 서비스는 OTel Java 에이전트가 자동으로 설정하는 Log4J를 사용한다.

로그 레코드에 트레이스 컨텍스트를 포함하여 로그와 트레이스를 연관 지을 수 있다.
