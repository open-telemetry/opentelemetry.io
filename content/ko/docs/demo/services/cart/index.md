---
title: 장바구니 서비스
linkTitle: 장바구니
aliases: [cartservice]
default_lang_commit: ae417344d183999236c22834435e0dfeb109da29
---

이 서비스는 사용자가 장바구니에 담은 상품을 관리한다. 장바구니 데이터에 빠르게
접근하기 위해 발키(Valkey) 캐싱 서비스와 상호작용한다.

[장바구니 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/cart/)

> **참고** .NET용 오픈텔레메트리(OpenTelemetry)는 트레이스와 메트릭에 표준
> 오픈텔레메트리 API 대신 `System.Diagnostic.DiagnosticSource` 라이브러리를
> API로 사용한다. 로그에는 `Microsoft.Extensions.Logging.Abstractions`
> 라이브러리를 사용한다.

## 트레이스 {#traces}

### 트레이싱 초기화하기 {#initializing-tracing}

오픈텔레메트리는 .NET 의존성 주입 컨테이너에서 설정한다. `AddOpenTelemetry()`
빌더 메서드를 사용하여 원하는 계측 라이브러리를 설정하고, 익스포터를 추가하며,
기타 옵션을 설정한다. 익스포터와 리소스 속성은 환경 변수를 통해 설정한다.

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithTracing(tracerBuilder => tracerBuilder
        .AddSource("OpenTelemetry.Demo.Cart")
        .AddRedisInstrumentation(
            options => options.SetVerboseDatabaseStatements = true)
        .AddAspNetCoreInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());
```

### 자동 계측된 스팬에 속성 추가하기 {#add-attributes-to-auto-instrumented-spans}

자동 계측된 코드가 실행되는 동안 컨텍스트에서 현재 스팬(액티비티)을 가져올 수
있다.

```cs
var activity = Activity.Current;
```

액티비티 객체의 `SetTag`를 사용하여 스팬(액티비티)에 속성(.NET에서는 태그)을
추가한다. `services/CartService.cs`의 `AddItem` 함수에서는 자동 계측된 스팬에
여러 속성을 추가한다.

```cs
activity?.SetTag("app.user.id", request.UserId);
activity?.SetTag("app.product.quantity", request.Item.Quantity);
activity?.SetTag("app.product.id", request.Item.ProductId);
```

### 스팬 이벤트 추가하기 {#add-span-events}

액티비티 객체의 `AddEvent`를 사용하여 스팬(액티비티) 이벤트를 추가한다.
`services/CartService.cs`의 `GetCart` 함수에서는 스팬 이벤트를 추가한다.

```cs
activity?.AddEvent(new("Fetch cart"));
```

## 메트릭 {#metrics}

### 메트릭 초기화하기 {#initializing-metrics}

오픈텔레메트리 트레이스 설정과 마찬가지로, .NET 의존성 주입 컨테이너에서
`AddOpenTelemetry()`를 호출해야 한다. 이 빌더는 원하는 계측 라이브러리, 익스포터
등을 설정한다.

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithMetrics(meterBuilder => meterBuilder
        .AddMeter("OpenTelemetry.Demo.Cart")
        .AddProcessInstrumentation()
        .AddRuntimeInstrumentation()
        .AddAspNetCoreInstrumentation()
        .SetExemplarFilter(ExemplarFilterType.TraceBased)
        .AddOtlpExporter());
```

### 대표 샘플 {#exemplars}

장바구니 서비스에서는 트레이스 기반 대표 샘플 필터로
[대표 샘플(exemplar)](/docs/specs/otel/metrics/data-model/#exemplars)을
설정하며, 이를 통해 오픈텔레메트리 SDK가 메트릭에 대표 샘플을 첨부할 수 있다.

먼저 `CartActivitySource`, `Meter`, 두 개의 `Histograms`를 생성한다.
히스토그램은 장바구니 서비스의 중요한 두 메서드인 `AddItem`과 `GetCart`의 지연
시간을 추적한다.

사용자가 장바구니에 상품을 추가하거나 주문 처리 과정으로 넘어가기 전에
장바구니를 확인할 때 너무 오래 기다려서는 안 되므로, 이 두 메서드는 장바구니
서비스에서 매우 중요하다.

```cs
private static readonly ActivitySource CartActivitySource = new("OpenTelemetry.Demo.Cart");
private static readonly Meter CartMeter = new Meter("OpenTelemetry.Demo.Cart");
private static readonly Histogram<long> addItemHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.add_item.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 500000, 600000, 700000, 800000, 900000, 1000000, 1100000 ]
    });
private static readonly Histogram<long> getCartHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.get_cart.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 300000, 400000, 500000, 600000, 700000, 800000, 900000 ]
    });
```

기본값이 장바구니 서비스의 마이크로초 단위 결과에 맞지 않으므로, 커스텀 버킷
경계도 정의한다는 점에 유의한다.

변수를 정의한 뒤에는 다음과 같이 `StopWatch`로 각 메서드 실행의 지연 시간을
추적한다.

```cs
var stopwatch = Stopwatch.StartNew();

(method logic)

addItemHistogram.Record(stopwatch.ElapsedTicks);
```

이 모든 것을 연결하려면 트레이스 파이프라인에 생성한 소스를 추가해야 한다. (위
코드에 이미 포함되어 있지만, 참고할 수 있도록 여기에 다시 제시한다.)

```cs
.AddSource("OpenTelemetry.Demo.Cart")
```

그리고 메트릭 파이프라인에는 `Meter`와 `ExemplarFilter`를 추가한다.

```cs
.AddMeter("OpenTelemetry.Demo.Cart")
.SetExemplarFilter(ExemplarFilterType.TraceBased)
```

대표 샘플을 시각화하려면 그라파나(Grafana)의 <http://localhost:8080/grafana> >
Dashboards > Demo > Cart Service Exemplars로 이동한다.

대표 샘플은 95번째 백분위수 차트에서 특별한 "다이아몬드 모양의 점"으로, 히트맵
차트에서는 작은 사각형으로 표시된다. 대표 샘플을 선택하면 측정 타임스탬프, 원시
값, 기록 당시의 트레이스 컨텍스트를 포함한 데이터를 확인할 수 있다. `trace_id`를
통해 트레이싱 백엔드(여기서는 예거(Jaeger))로 이동할 수 있다.

![장바구니 서비스 대표 샘플](exemplars.png)

## 로그 {#logs}

로그는 .NET 의존성 주입 컨테이너의 `LoggingBuilder` 수준에서
`AddOpenTelemetry()`를 호출하여 설정한다. 이 빌더는 원하는 옵션, 익스포터 등을
설정한다.

```cs
builder.Logging
    .AddOpenTelemetry(options => options.AddOtlpExporter());
```
