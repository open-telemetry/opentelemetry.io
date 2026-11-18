---
title: 계측
aliases:
  - manual
  - manual_instrumentation
weight: 30
description: 오픈텔레메트리 Go의 수동 계측
default_lang_commit: 2f13cbbb387800d2197d547fc78ee3fa5065d6aa
cSpell:ignore: fatalf logr logrus otlplog otlploghttp sdktrace sighup
---

{{% include instrumentation-intro.md %}}

## 설정 {#setup}

## 트레이스 {#traces}

### 트레이서 가져오기 {#getting-a-tracer}

스팬을 생성하려면 먼저 트레이서를 가져오거나 초기화해야 한다.

필요한 패키지가 설치되어 있는지 확인한다.

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/trace \
  go.opentelemetry.io/otel/sdk \
```

그런 다음 익스포터, 리소스, 트레이서 프로바이더, 마지막으로 트레이서를
초기화한다.

```go
package app

import (
	"context"
	"fmt"
	"log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.43.0"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer

func newExporter(ctx context.Context)  /* (someExporter.Exporter, error) */ {
	// 선호하는 익스포터: 콘솔, 예거(Jaeger), Zipkin, OTLP 등.
}

func newTracerProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// 기본 SDK 리소스와 필수 서비스 이름이 설정되어 있는지 확인한다.
	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("ExampleService"),
		),
	)

	if err != nil {
		panic(err)
	}

	return sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(r),
	)
}

func main() {
	ctx := context.Background()

	exp, err := newExporter(ctx)
	if err != nil {
		log.Fatalf("failed to initialize exporter: %v", err)
	}

	// 배치 스팬 프로세서와 지정된 익스포터로 새 트레이서 프로바이더를 생성한다.
	tp := newTracerProvider(exp)

	// 누수가 발생하지 않도록 종료를 적절히 처리한다.
	defer func() { _ = tp.Shutdown(ctx) }()

	otel.SetTracerProvider(tp)

	// 마지막으로 이 패키지에서 사용할 수 있는 트레이서를 설정한다.
	tracer = tp.Tracer("example.io/package/name")
}
```

이제 `tracer`에 접근하여 코드를 수동으로 계측할 수 있다.

> [!WARNING]
>
> [OBI](/docs/zero-code/obi)처럼 eBPF 기반의
> [Go 제로코드 계측](/docs/zero-code/go)과 함께 수동 스팬을 추가한다면, 전역
> 트레이서 프로바이더를 설정하지 않는다. 자세한 내용은
> [Auto SDK](/docs/zero-code/go/autosdk) 문서를 참고한다.

### 스팬 생성 {#creating-spans}

스팬은 트레이서가 생성한다. 트레이서를 초기화하지 않았다면 먼저 초기화해야 한다.

트레이서로 스팬을 생성하려면 `context.Context` 인스턴스에 대한 참조도 필요하다.
일반적으로 요청 객체 등에서 가져오며, 이미 [계측
라이브러리][instrumentation library]의 부모 스팬이 포함되어 있을 수 있다.

```go
func httpHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "hello-span")
	defer span.End()

	// hello-span으로 추적할 작업을 수행한다.
}
```

Go에서는 활성 스팬을 저장하는 데 `context` 패키지를 사용한다. 스팬을 시작하면
생성된 스팬뿐 아니라 해당 스팬을 포함하도록 수정된 컨텍스트에 대한 참조도
얻는다.

스팬은 완료되면 불변 상태가 되어 더 이상 수정할 수 없다.

### 현재 스팬 가져오기 {#get-the-current-span}

현재 스팬을 가져오려면 참조하고 있는 `context.Context`에서 스팬을 꺼내야 한다.

```go
// 이 컨텍스트에는 추출하려는 활성 스팬이 포함되어 있어야 한다.
ctx := context.TODO()
span := trace.SpanFromContext(ctx)

// 현재 스팬으로 작업을 수행하고, 스팬을 끝내려면 필요에 따라 `span.End()`를 호출한다.
```

이는 특정 시점에 현재 스팬에 정보를 추가하고 싶을 때 유용할 수 있다.

### 중첩 스팬 생성 {#create-nested-spans}

중첩된 작업의 수행 내용을 추적하기 위해 중첩 스팬을 생성할 수 있다.

현재 참조하고 있는 `context.Context`에 이미 스팬이 포함되어 있다면, 새 스팬을
생성할 때 중첩 스팬이 된다. 예를 들면 다음과 같다.

```go
func parentFunction(ctx context.Context) {
	ctx, parentSpan := tracer.Start(ctx, "parent")
	defer parentSpan.End()

	// 자식 함수를 호출하고 그 안에서 중첩 스팬을 시작한다.
	childFunction(ctx)

	// 추가 작업을 수행한다. 이 함수가 끝나면 parentSpan이 완료된다.
}

func childFunction(ctx context.Context) {
	// `childFunction()`을 추적할 스팬을 생성한다. 부모가 `parentSpan`인 중첩 스팬이다.
	ctx, childSpan := tracer.Start(ctx, "child")
	defer childSpan.End()

	// 여기에서 작업을 수행한다. 이 함수가 반환되면 childSpan이 완료된다.
}
```

스팬은 완료되면 불변 상태가 되어 더 이상 수정할 수 없다.

### 스팬 속성 {#span-attributes}

속성은 스팬에 메타데이터로 적용하는 키와 값이며, 트레이스를 집계하고 필터링하고
그룹화하는 데 유용하다. 속성은 스팬을 생성할 때나 스팬이 완료되기 전 수명 주기의
어느 시점에나 추가할 수 있다.

```go
// 생성 시 속성을 설정한다...
ctx, span = tracer.Start(ctx, "attributesAtCreation", trace.WithAttributes(attribute.String("hello", "world")))
// ... 그리고 생성 후에도 속성을 설정한다.
span.SetAttributes(attribute.Bool("isTrue", true), attribute.String("stringAttr", "hi!"))
```

속성 키를 미리 계산해 둘 수도 있다.

```go
var myKey = attribute.Key("myCoolAttribute")
span.SetAttributes(myKey.String("a value"))
```

#### 시맨틱 속성 {#semantic-attributes}

시맨틱 속성은 HTTP 메서드, 상태 코드, 사용자 에이전트 등의 공통 개념에 대해 여러
언어, 프레임워크, 런타임에서 공유할 속성 키 집합을 제공하기 위해 [오픈텔레메트리
명세][OpenTelemetry Specification]에서 정의한 속성이다. 이러한 속성은
`go.opentelemetry.io/otel/semconv/v1.43.0` 패키지에서 사용할 수 있다.

자세한 내용은 [트레이스 시맨틱 컨벤션][Trace semantic conventions]을 참고한다.

### 이벤트 {#events}

이벤트는 스팬의 수명 주기 중 "어떤 일이 발생했음"을 나타내는, 사람이 읽을 수
있는 스팬 메시지다. 뮤텍스로 보호되는 리소스에 배타적으로 접근해야 하는 함수를
예로 들 수 있다. 리소스에 접근하려고 시도할 때와 뮤텍스를 획득했을 때, 두 시점에
이벤트를 생성할 수 있다.

```go
span.AddEvent("Acquiring lock")
mutex.Lock()
span.AddEvent("Got lock, doing work...")
// 작업을 수행한다.
span.AddEvent("Unlocking")
mutex.Unlock()
```

이벤트의 유용한 특징은 타임스탬프가 스팬 시작 시점으로부터의 오프셋으로
표시된다는 점이다. 이를 통해 이벤트 사이에 얼마나 시간이 지났는지 쉽게 알 수
있다.

이벤트에도 자체 속성을 지정할 수 있다.

```go
span.AddEvent("Cancelled wait due to external signal", trace.WithAttributes(attribute.Int("pid", 4328), attribute.String("signal", "SIGHUP")))
```

### 스팬 상태 설정 {#set-span-status}

{{% include "span-status-preamble.md" %}}

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operationThatCouldFail()
if err != nil {
	span.SetStatus(codes.Error, "operationThatCouldFail failed")
}
```

### 오류 기록 {#record-errors}

작업이 실패했고 그 작업에서 발생한 오류를 수집하고 싶다면, 해당 오류를 기록할 수
있다.

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operationThatCouldFail()
if err != nil {
	span.SetStatus(codes.Error, "operationThatCouldFail failed")
	span.RecordError(err)
}
```

실패한 작업을 추적하는 스팬을 오류 스팬으로 간주하고 싶지 않은 경우가 아니라면,
`RecordError`를 사용할 때 스팬 상태도 `Error`로 설정하는 것을 강력히 권장한다.
`RecordError` 함수는 호출될 때 스팬 상태를 자동으로 설정하지 **않는다**.

### 전파자와 컨텍스트 {#propagators-and-context}

트레이스는 하나의 프로세스를 넘어 확장될 수 있다. 이를 위해 트레이스의 식별자를
원격 프로세스로 보내는 메커니즘인 _컨텍스트 전파_ 가 필요하다.

네트워크를 통해 트레이스 컨텍스트를 전파하려면 오픈텔레메트리 API에 전파자를
등록해야 한다.

```go
import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/propagation"
)
...
otel.SetTextMapPropagator(propagation.TraceContext{})
```

> 오픈텔레메트리는 W3C TraceContext 표준을 지원하지 않는 기존 트레이싱
> 시스템(`go.opentelemetry.io/contrib/propagators/b3`)과의 호환성을 위해 B3 헤더
> 형식도 지원한다.

컨텍스트 전파를 구성한 후에는 자동 계측을 사용하여 컨텍스트 직렬화를 실제로
관리하는 내부 작업을 처리하는 것이 일반적이다.

## 메트릭 {#metrics}

[메트릭](/docs/concepts/signals/metrics)을 생성하려면 `Meter`를 생성할 수 있도록
초기화된 `MeterProvider`가 필요하다. 미터를 사용하면 다양한 종류의 메트릭을
생성하는 데 사용할 인스트루먼트(instrument)를 만들 수 있다. 오픈텔레메트리 Go는
현재 다음 인스트루먼트를 지원한다.

- Counter: 음수가 아닌 증가량을 지원하는 동기 인스트루먼트
- Asynchronous Counter: 음수가 아닌 증가량을 지원하는 비동기 인스트루먼트
- Histogram: 히스토그램, 요약, 백분위수처럼 통계적으로 의미 있는 임의의 값을
  지원하는 동기 인스트루먼트
- Synchronous Gauge: 실내 온도처럼 합산할 수 없는 값을 지원하는 동기
  인스트루먼트
- Asynchronous Gauge: 실내 온도처럼 합산할 수 없는 값을 지원하는 비동기
  인스트루먼트
- UpDownCounter: 활성 요청 수처럼 증가와 감소를 지원하는 동기 인스트루먼트
- Asynchronous UpDownCounter: 증가와 감소를 지원하는 비동기 인스트루먼트

동기 및 비동기 인스트루먼트와 사용 사례에 가장 적합한 종류에 대한 자세한 내용은
[보충 가이드라인](/docs/specs/otel/metrics/supplementary-guidelines/)을
참고한다.

계측 라이브러리나 수동 작업으로 `MeterProvider`를 생성하지 않으면,
오픈텔레메트리 메트릭 API는 아무 동작도 하지 않는 구현체를 사용하므로 데이터를
생성하지 못한다.

다음에서 더 자세한 패키지 문서를 확인할 수 있다.

- 메트릭 API: [`go.opentelemetry.io/otel/metric`][]
- 메트릭 SDK: [`go.opentelemetry.io/otel/sdk/metric`][]

### 메트릭 초기화 {#initialize-metrics}

> [!NB] 라이브러리를 계측하는 경우 **이 단계를 건너뛴다**.

앱에서 [메트릭](/docs/concepts/signals/metrics/)을 활성화하려면
[`Meter`](/docs/concepts/signals/metrics/#meter)를 생성할 수 있도록 초기화된
[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider)가 필요하다.

`MeterProvider`를 생성하지 않으면 오픈텔레메트리 메트릭 API는 아무 동작도 하지
않는 구현체를 사용하므로 데이터를 생성하지 못한다. 따라서 다음 패키지를 사용하는
SDK 초기화 코드를 포함하도록 소스 코드를 수정해야 한다.

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/metric`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`][]

필요한 Go 모듈이 설치되어 있는지 확인한다.

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/stdout/stdoutmetric \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/metric
```

그런 다음 리소스, 메트릭 익스포터, 메트릭 프로바이더를 초기화한다.

```go
package main

import (
	"context"
	"log"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.43.0"
)

func main() {
	// 리소스를 생성한다.
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// 미터 프로바이더를 생성한다.
	// 계측한 코드가 MeterProvider 인스턴스를 받는다면
	// 이 인스턴스를 직접 전달할 수 있다.
	meterProvider, err := newMeterProvider(res)
	if err != nil {
		panic(err)
	}

	// 누수가 발생하지 않도록 종료를 적절히 처리한다.
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()

	// otel.Meter로 사용하고 otel.GetMeterProvider로 접근할 수 있도록
	// 전역 미터 프로바이더로 등록한다.
	// 대부분의 계측 라이브러리는 기본적으로 전역 미터 프로바이더를 사용한다.
	// 전역 미터 프로바이더를 설정하지 않으면 아무 동작도 하지 않는 구현체가
	// 사용되므로 데이터를 생성하지 못한다.
	otel.SetMeterProvider(meterProvider)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(
    resource.Default(),
		resource.NewWithAttributes(
      semconv.SchemaURL,
			semconv.ServiceName("my-service"),
			semconv.ServiceVersion("0.1.0"),
		),
  )
}

func newMeterProvider(res *resource.Resource) (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New()
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(metric.NewPeriodicReader(metricExporter,
			// 기본값은 1분이다. 시연을 위해 3초로 설정한다.
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
```

`MeterProvider`를 구성했으므로 이제 `Meter`를 가져올 수 있다.

### 미터 가져오기 {#acquiring-a-meter}

애플리케이션에서 수동으로 계측한 코드가 있는 어느 곳에서든
[`otel.Meter`](https://pkg.go.dev/go.opentelemetry.io/otel#Meter)를 호출하여
미터를 가져올 수 있다. 예를 들면 다음과 같다.

```go
import "go.opentelemetry.io/otel"

var meter = otel.Meter("example.io/package/name")
```

### 동기 및 비동기 인스트루먼트 {#synchronous-and-asynchronous-instruments}

오픈텔레메트리 인스트루먼트는 동기 또는 비동기(observable) 방식이다.

동기 인스트루먼트는 호출될 때 측정한다. 측정은 다른 함수 호출과 마찬가지로
프로그램 실행 중의 또 다른 호출로 수행된다. 이러한 측정값을 집계한 결과는 구성된
익스포터가 주기적으로 내보낸다. 측정과 값의 내보내기가 분리되어 있으므로 한 번의
내보내기 주기에 집계된 측정값이 없을 수도 있고 여러 개 있을 수도 있다.

반면 비동기 인스트루먼트는 SDK의 요청에 따라 측정값을 제공한다. SDK가 내보내기를
수행하면 인스트루먼트를 생성할 때 제공한 콜백이 호출된다. 이 콜백은 SDK에
측정값을 제공하며, 해당 값은 즉시 내보내진다. 비동기 인스트루먼트의 모든 측정은
내보내기 주기마다 한 번 수행된다.

비동기 인스트루먼트는 다음과 같은 여러 상황에서 유용하다.

- 카운터 갱신에 계산 비용이 많이 들고, 현재 실행 중인 스레드가 측정을 기다리지
  않도록 하고 싶은 경우
- 프로그램 실행과 무관한 빈도로 관측해야 하는 경우(즉, 요청 수명 주기에 묶으면
  정확하게 측정할 수 없는 경우)
- 측정값의 타임스탬프를 알 수 없는 경우

이러한 경우에는 후처리에서 일련의 델타를 집계하는 방식(동기 예시)보다 누적값을
직접 관측하는 편이 더 나을 때가 많다.

### 동기 인스트루먼트의 성능 최적화 {#performance-optimization-for-synchronous-instruments}

동기 인스트루먼트에서는 속성이나 값을 계산하는 데 비용이 많이 드는 작업을
수행하기 전에 `Enabled` 메서드로 인스트루먼트가 활성화되어 있는지 확인할 수
있다.

```go
if apiCounter.Enabled(ctx) {
    // 속성이나 값을 계산한다.
    apiCounter.Add(ctx, 1, metric.WithAttributes(attributes...))
}
```

이를 통해 MeterProvider가 구성되지 않았거나 뷰(view)가 메트릭을 버리도록 구성된
경우, 계측으로 인한 성능 비용이 발생하지 않도록 할 수 있다.

### 카운터 사용 {#using-counters}

카운터는 음수가 아니면서 증가하는 값을 측정하는 데 사용할 수 있다.

예를 들어 다음과 같이 HTTP 핸들러의 호출 횟수를 보고할 수 있다.

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	apiCounter, err := meter.Int64Counter(
		"api.counter",
		metric.WithDescription("Number of API calls."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if apiCounter.Enabled(r.Context()) {
			apiCounter.Add(r.Context(), 1)
		}

		// API 호출에서 작업을 수행한다.
	})
}
```

### 업다운 카운터 사용 {#using-updown-counters}

업다운 카운터는 증가와 감소가 가능하므로, 증가하거나 감소하는 누적값을 관측할 수
있다.

예를 들어 다음과 같이 컬렉션의 항목 수를 보고할 수 있다.

```go
import (
	"context"

	"go.opentelemetry.io/otel/metric"
)

var itemsCounter metric.Int64UpDownCounter

func init() {
	var err error
	itemsCounter, err = meter.Int64UpDownCounter(
		"items.counter",
		metric.WithDescription("Number of items."),
		metric.WithUnit("{item}"),
	)
	if err != nil {
		panic(err)
	}
}

func addItem() {
	// 컬렉션에 항목을 추가하는 코드

	ctx := context.Background()
	if itemsCounter.Enabled(ctx) {
		itemsCounter.Add(ctx, 1)
	}
}

func removeItem() {
	// 컬렉션에서 항목을 제거하는 코드

	ctx := context.Background()
	if itemsCounter.Enabled(ctx) {
		itemsCounter.Add(ctx, -1)
	}
}
```

### 게이지 사용 {#using-gauges}

게이지는 변화가 발생할 때 합산할 수 없는 값을 측정하는 데 사용한다.

예를 들어 다음과 같이 CPU 팬의 현재 속도를 보고할 수 있다.

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

var (
  fanSpeedSubscription chan int64
  speedGauge metric.Int64Gauge
)

func init() {
	var err error
	speedGauge, err = meter.Int64Gauge(
		"cpu.fan.speed",
		metric.WithDescription("Speed of CPU fan"),
		metric.WithUnit("RPM"),
	)
	if err != nil {
		panic(err)
	}

	getCPUFanSpeed := func() int64 {
		// 시연을 위해 임의의 팬 속도를 생성한다.
		// 실제 애플리케이션에서는 실제 팬 속도를 가져오도록 이 부분을 대체한다.
		return int64(1500 + rand.Intn(1000))
	}

	fanSpeedSubscription = make(chan int64, 1)
	go func() {
		defer close(fanSpeedSubscription)

		for idx := 0; idx < 5; idx++ {
			// 동기 게이지는 측정 주기가 외부 변화와
			// 동기화되어 있을 때 사용한다.
			time.Sleep(time.Duration(rand.Intn(3)) * time.Second)
			fanSpeed := getCPUFanSpeed()
			fanSpeedSubscription <- fanSpeed
		}
	}()
}

func recordFanSpeed() {
	ctx := context.Background()
	for fanSpeed := range fanSpeedSubscription {
		if speedGauge.Enabled(ctx) {
			speedGauge.Record(ctx, fanSpeed)
		}
	}
}
```

### 히스토그램 사용 {#using-histograms}

히스토그램은 시간에 따른 값의 분포를 측정하는 데 사용한다.

예를 들어 다음과 같이 HTTP 핸들러의 응답 시간 분포를 보고할 수 있다.

```go
import (
	"net/http"
	"time"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	histogram, err := meter.Float64Histogram(
		"task.duration",
		metric.WithDescription("The duration of task execution."),
		metric.WithUnit("s"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// API 호출에서 작업을 수행한다.

		duration := time.Since(start)
		if histogram.Enabled(r.Context()) {
			histogram.Record(r.Context(), duration.Seconds())
		}
	})
}
```

### 관측 가능한 비동기 카운터 사용 {#using-observable-async-counters}

관측 가능한 카운터는 합산할 수 있고, 음수가 아니며, 단조 증가하는 값을 측정하는
데 사용할 수 있다.

예를 들어 다음과 같이 애플리케이션 시작 이후 경과 시간을 보고할 수 있다.

```go
import (
	"context"
	"time"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	start := time.Now()
	if _, err := meter.Float64ObservableCounter(
		"uptime",
		metric.WithDescription("The duration since the application started."),
		metric.WithUnit("s"),
		metric.WithFloat64Callback(func(_ context.Context, o metric.Float64Observer) error {
			o.Observe(float64(time.Since(start).Seconds()))
			return nil
		}),
	); err != nil {
		panic(err)
	}
}
```

### 관측 가능한 비동기 업다운 카운터 사용 {#using-observable-async-updown-counters}

관측 가능한 업다운 카운터는 증가와 감소가 가능하므로, 합산할 수 있고 음수가
아니며 단조 증가하지 않는 누적값을 측정할 수 있다.

예를 들어 다음과 같이 데이터베이스 메트릭을 보고할 수 있다.

```go
import (
	"context"
	"database/sql"

	"go.opentelemetry.io/otel/metric"
)

// registerDBMetrics는 전달받은 db의 비동기 메트릭을 등록한다.
// 전달받은 db를 닫기 전에 반드시 metric.Registration의 등록을 해제한다.
func registerDBMetrics(db *sql.DB, meter metric.Meter, poolName string) (metric.Registration, error) {
	max, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.max",
		metric.WithDescription("The maximum number of open connections allowed."),
		metric.WithUnit("{connection}"),
	)
	if err != nil {
		return nil, err
	}

	waitTime, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.wait_time",
		metric.WithDescription("The time it took to obtain an open connection from the pool."),
		metric.WithUnit("ms"),
	)
	if err != nil {
		return nil, err
	}

	reg, err := meter.RegisterCallback(
		func(_ context.Context, o metric.Observer) error {
			stats := db.Stats()
			o.ObserveInt64(max, int64(stats.MaxOpenConnections))
			o.ObserveInt64(waitTime, int64(stats.WaitDuration))
			return nil
		},
		max,
		waitTime,
	)
	if err != nil {
		return nil, err
	}
	return reg, nil
}
```

### 관측 가능한 비동기 게이지 사용 {#using-observable-async-gauges}

관측 가능한 게이지는 합산할 수 없는 값을 측정하는 데 사용해야 한다.

예를 들어 다음과 같이 애플리케이션에서 사용하는 힙 객체의 메모리 사용량을 보고할
수 있다.

```go
import (
	"context"
	"runtime"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	if _, err := meter.Int64ObservableGauge(
		"memory.heap",
		metric.WithDescription(
			"Memory usage of the allocated heap objects.",
		),
		metric.WithUnit("By"),
		metric.WithInt64Callback(func(_ context.Context, o metric.Int64Observer) error {
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			o.Observe(int64(m.HeapAlloc))
			return nil
		}),
	); err != nil {
		panic(err)
	}
}
```

### 속성 추가 {#adding-attributes}

[`WithAttributeSet`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributeSet)
또는
[`WithAttributes`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributes)
옵션을 사용하여 속성을 추가할 수 있다.

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
	semconv "go.opentelemetry.io/otel/semconv/v1.43.0"
)

func init() {
	apiCounter, err := meter.Int64UpDownCounter(
		"api.finished.counter",
		metric.WithDescription("Number of finished API calls."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// API 호출에서 작업을 수행하고 응답 HTTP 상태 코드를 설정한다.

		apiCounter.Add(r.Context(), 1,
			metric.WithAttributes(semconv.HTTPResponseStatusCode(statusCode)))
	})
}
```

### 뷰 등록 {#registering-views}

뷰는 SDK 사용자가 SDK에서 출력하는 메트릭을 유연하게 사용자 정의할 수 있도록
한다. 처리하거나 무시할 메트릭 인스트루먼트를 지정할 수 있다. 집계 방식과
메트릭에 보고할 속성도 사용자 정의할 수 있다.

모든 인스트루먼트에는 원래의 이름, 설명, 속성을 유지하고 인스트루먼트 유형에
따른 기본 집계를 사용하는 기본 뷰가 있다. 등록된 뷰가 인스트루먼트와 일치하면
기본 뷰가 등록된 뷰로 대체된다. 인스트루먼트와 일치하는 추가 등록 뷰는 누적
적용되므로, 해당 인스트루먼트에 대해 여러 메트릭이 내보내진다.

[`NewView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#NewView)
함수로 뷰를 생성하고
[`WithView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#WithView)
옵션으로 등록할 수 있다.

예를 들어 다음과 같이 `http` 계측 라이브러리의 `v0.34.0` 버전에 있는 `latency`
인스트루먼트의 이름을 `request.latency`로 변경하는 뷰를 생성할 수 있다.

```go
view := metric.NewView(metric.Instrument{
	Name: "latency",
	Scope: instrumentation.Scope{
		Name:    "http",
		Version: "0.34.0",
	},
}, metric.Stream{Name: "request.latency"})

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

예를 들어 다음과 같이 `http` 계측 라이브러리의 `latency` 인스트루먼트를 지수
히스토그램으로 보고하도록 하는 뷰를 생성할 수 있다.

```go
view := metric.NewView(
	metric.Instrument{
		Name:  "latency",
		Scope: instrumentation.Scope{Name: "http"},
	},
	metric.Stream{
		Aggregation: metric.AggregationBase2ExponentialHistogram{
			MaxSize:  160,
			MaxScale: 20,
		},
	},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

SDK는 메트릭을 내보내기 전에 메트릭과 속성을 필터링한다. 예를 들어 뷰를 사용하여
카디널리티가 높은 메트릭의 메모리 사용량을 줄이거나 민감한 데이터가 포함될 수
있는 속성을 제거할 수 있다.

다음과 같이 `http` 계측 라이브러리의 `latency` 인스트루먼트를 버리는 뷰를
생성한다.

```go
view := metric.NewView(
  metric.Instrument{
    Name:  "latency",
    Scope: instrumentation.Scope{Name: "http"},
  },
  metric.Stream{Aggregation: metric.AggregationDrop{}},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

다음과 같이 `http` 계측 라이브러리의 `latency` 인스트루먼트가 기록하는
`http.request.method` 속성을 제거하는 뷰를 생성한다.

```go
view := metric.NewView(
  metric.Instrument{
    Name:  "latency",
    Scope: instrumentation.Scope{Name: "http"},
  },
  metric.Stream{AttributeFilter: attribute.NewDenyKeysFilter("http.request.method")},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

조건의 `Name` 필드는 와일드카드 패턴 매칭을 지원한다. `*` 와일드카드는 0개
이상의 문자와 일치하고, `?`는 정확히 하나의 문자와 일치한다. 예를 들어 `*`
패턴은 모든 인스트루먼트 이름과 일치한다.

다음 예제는 이름의 접미사가 `.ms`인 모든 인스트루먼트의 단위를 밀리초로 설정하는
뷰를 생성하는 방법을 보여 준다.

```go
view := metric.NewView(
  metric.Instrument{Name: "*.ms"},
  metric.Stream{Unit: "ms"},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

`NewView` 함수는 뷰를 간편하게 생성하는 방법을 제공한다. `NewView`가 필요한
기능을 제공하지 못한다면, 사용자 정의
[`View`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#View)를 직접
생성할 수 있다.

예를 들어 다음과 같이 정규 표현식 매칭을 사용하여 모든 데이터 스트림 이름에 사용
단위를 접미사로 붙이는 뷰를 생성할 수 있다.

```go
re := regexp.MustCompile(`[._](ms|byte)$`)
var view metric.View = func(i metric.Instrument) (metric.Stream, bool) {
	// 사용자 정의 View 함수에서는 이름, 설명, 단위를
	// 명시적으로 복사해야 한다.
	s := metric.Stream{Name: i.Name, Description: i.Description, Unit: i.Unit}
	// 단위 접미사는 정의되어 있지 않지만 차원이 있는 단위가 정의되어 있는
	// 인스트루먼트는 이름에 단위 접미사를 붙인다.
	if re.MatchString(i.Name) {
		return s, false
	}
	switch i.Unit {
	case "ms":
		s.Name += ".ms"
	case "By":
		s.Name += ".byte"
	default:
		return s, false
	}
	return s, true
}

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

## 로그 {#logs}

로그는 **사용자용 오픈텔레메트리 로그 API가 없다** 는 점에서 메트릭 및
트레이스와 다르다. 대신 널리 사용되는 기존 로그 패키지(slog, logrus, zap, logr
등)의 로그를 오픈텔레메트리 생태계로 연결하는 도구가 있다. 이러한 설계 결정의
근거는 [로깅 명세](/docs/specs/otel/logs/)를 참고한다.

아래에서 설명하는 두 가지 일반적인 워크플로는 각각 서로 다른 애플리케이션 요구
사항에 맞춰져 있다.

### 컬렉터로 직접 전송 {#direct-to-collector}

**상태**: [실험적](/docs/specs/otel/document-status/)

컬렉터로 직접 전송하는 워크플로에서는 네트워크 프로토콜(예: OTLP)을 사용하여
애플리케이션에서 컬렉터로 로그를 직접 내보낸다. 이 워크플로는 추가 로그 전달
컴포넌트가 필요하지 않아 설정이 간단하며, 애플리케이션에서 [로그 데이터
모델][log data model]을 따르는 구조화된 로그를 쉽게 내보낼 수 있다. 그러나
애플리케이션에서 로그를 큐에 넣고 네트워크 위치로 내보내는 데 필요한 오버헤드가
모든 애플리케이션에 적합한 것은 아닐 수 있다.

이 워크플로를 사용하려면 다음과 같이 한다.

- 로그 레코드를 원하는 대상([컬렉터][opentelemetry collector] 등)으로 내보내도록
  오픈텔레메트리 [로그 SDK](#logs-sdk)를 구성한다.
- 적절한 [로그 브리지(log bridge)](#log-bridge)를 사용한다.

#### 로그 SDK {#logs-sdk}

로그 SDK는 [컬렉터로 직접 전송](#direct-to-collector)하는 워크플로를 사용할 때
로그를 처리하는 방식을 결정한다. [로그 전달](#via-file-or-stdout) 워크플로를
사용할 때는 로그 SDK가 필요하지 않다.

일반적인 로그 SDK 구성에서는 OTLP 익스포터와 함께 배치 로그 레코드 프로세서를
설치한다.

앱에서 [로그](/docs/concepts/signals/logs/)를 활성화하려면
[로그 브리지](#log-bridge)를 사용할 수 있도록 초기화된
[`LoggerProvider`](/docs/concepts/signals/logs/#logger-provider)가 필요하다.

`LoggerProvider`를 생성하지 않으면 오픈텔레메트리 로그 API는 아무 동작도 하지
않는 구현체를 사용하므로 데이터를 생성하지 못한다. 따라서 다음 패키지를 사용하는
SDK 초기화 코드를 포함하도록 소스 코드를 수정해야 한다.

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/log`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`][]

필요한 Go 모듈이 설치되어 있는지 확인한다.

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/log
```

`LoggerProvider`를 초기화한다.

```go
package main

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.43.0"
)

func main() {
	ctx := context.Background()

	// 리소스를 생성한다.
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// 로거 프로바이더를 생성한다.
	// 브리지를 생성할 때 이 인스턴스를 직접 전달할 수 있다.
	loggerProvider, err := newLoggerProvider(ctx, res)
	if err != nil {
		panic(err)
	}

	// 누수가 발생하지 않도록 종료를 적절히 처리한다.
	defer func() {
		if err := loggerProvider.Shutdown(ctx); err != nil {
			fmt.Println(err)
		}
	}()

	// log.LoggerProvider로 접근할 수 있도록 전역 로거 프로바이더로 등록한다.
	// 대부분의 로그 브리지는 기본적으로 전역 로거 프로바이더를 사용한다.
	// 전역 로거 프로바이더를 설정하지 않으면 아무 동작도 하지 않는 구현체가
	// 사용되므로 데이터를 생성하지 못한다.
	otel.SetLoggerProvider(loggerProvider)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(
    resource.Default(),
		resource.NewWithAttributes(
      semconv.SchemaURL,
			semconv.ServiceName("my-service"),
			semconv.ServiceVersion("0.1.0"),
		),
  )
}

func newLoggerProvider(ctx context.Context, res *resource.Resource) (*log.LoggerProvider, error) {
	exporter, err := otlploghttp.New(ctx)
	if err != nil {
		return nil, err
	}
	processor := log.NewBatchProcessor(exporter)
	provider := log.NewLoggerProvider(
		log.WithResource(res),
		log.WithProcessor(processor),
	)
	return provider, nil
}
```

`LoggerProvider`를 구성했으므로 이제 이를 사용하여 [로그 브리지](#log-bridge)를
설정할 수 있다.

#### 로그 브리지 {#log-bridge}

로그 브리지는 [로그 브리지 API][logs bridge API]를 사용하여 기존 로그 패키지의
로그를 오픈텔레메트리 [로그 SDK](#logs-sdk)로 연결하는 컴포넌트다.

사용 가능한 로그 브리지의 전체 목록은
[오픈텔레메트리 레지스트리](/ecosystem/registry/?language=go&component=log-bridge)에서
확인할 수 있다.

각 로그 브리지 패키지 문서에는 사용 예제가 있어야 한다.

### 파일 또는 stdout을 통한 전송 {#via-file-or-stdout}

파일 또는 stdout 워크플로에서는 로그를 파일이나 표준 출력에 기록한다. 다른
컴포넌트(예: FluentBit)가 로그를 읽거나 새로 추가되는 내용을 추적하고, 더
구조화된 형식으로 파싱하여 컬렉터 등의 대상으로 전달하는 역할을 한다.
애플리케이션 요구 사항상 [컬렉터로 직접 전송](#direct-to-collector)할 때
발생하는 추가 오버헤드를 허용할 수 없는 경우에는 이 워크플로가 더 적합할 수
있다. 그러나 다운스트림에서 필요한 모든 로그 필드를 로그에 인코딩해야 하며,
로그를 읽는 컴포넌트가 데이터를 [로그 데이터 모델][log data model]로 파싱해야
한다. 로그 전달 컴포넌트의 설치 및 구성은 이 문서의 범위를 벗어난다.

## 다음 단계 {#next-steps}

하나 이상의 텔레메트리 백엔드로
[텔레메트리 데이터를 내보내려면](/docs/languages/go/exporters) 적절한 익스포터도
구성해야 한다.

[opentelemetry specification]: /docs/specs/otel/
[trace semantic conventions]: /docs/specs/semconv/general/trace/
[instrumentation library]: ../libraries/
[opentelemetry collector]:
  https://github.com/open-telemetry/opentelemetry-collector
[logs bridge API]: /docs/specs/otel/logs/api/
[log data model]: /docs/specs/otel/logs/data-model
[`go.opentelemetry.io/otel`]: https://pkg.go.dev/go.opentelemetry.io/otel
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric
[`go.opentelemetry.io/otel/metric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/metric
[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp
[`go.opentelemetry.io/otel/sdk/log`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/sdk/log
[`go.opentelemetry.io/otel/sdk/metric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric
[`go.opentelemetry.io/otel/sdk/resource`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/sdk/resource
