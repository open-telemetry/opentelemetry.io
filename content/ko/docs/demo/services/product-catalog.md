---
title: 상품 카탈로그 서비스
linkTitle: 상품 카탈로그
aliases: [productcatalogservice]
default_lang_commit: 6588437286e916c2eb44a721161ce46c21f1706b
# prettier-ignore
cSpell:ignore: fatalf otelcodes otelgrpc otlpmetricgrpc otlptracegrpc sdkmetric sdktrace sprintf
---

이 서비스는 상품 정보를 반환하는 역할을 한다. 모든 상품을 가져오거나 특정 상품을
검색하거나 개별 상품의 상세 정보를 반환하는 데 사용할 수 있다.

[상품 카탈로그 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/product-catalog/)

## 트레이스 {#traces}

### 트레이싱 초기화하기 {#initializing-tracing}

오픈텔레메트리(OpenTelemetry) SDK는 `main`에서 `initTracerProvider` 함수를
사용하여 초기화한다.

```go
func initTracerProvider() *sdktrace.TracerProvider {
    ctx := context.Background()

    exporter, err := otlptracegrpc.New(ctx)
    if err != nil {
        log.Fatalf("OTLP Trace gRPC Creation: %v", err)
    }
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(initResource()),
    )
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
    return tp
}
```

모든 스팬이 내보내지도록 서비스가 종료될 때 `TracerProvider.Shutdown()`을
호출해야 한다. 이 서비스는 main의 지연 실행 함수(deferred function)에서 이를
호출한다.

```go
tp := InitTracerProvider()
defer func() {
    if err := tp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Tracer Provider Shutdown: %v", err)
    }
}()
```

### gRPC 자동 계측 추가하기 {#adding-grpc-auto-instrumentation}

이 서비스는 gRPC 요청을 수신하며, main 함수에서 gRPC 서버를 생성할 때 해당
요청에 대한 계측을 설정한다.

```go
srv := grpc.NewServer(
    grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
```

이 서비스는 아웃바운드 gRPC 호출을 보내며, gRPC 클라이언트를 계측으로 감싸 모든
호출을 계측한다.

```go
func createClient(ctx context.Context, svcAddr string) (*grpc.ClientConn, error) {
    return grpc.DialContext(ctx, svcAddr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
    )
}
```

### 자동 계측된 스팬에 속성 추가하기 {#add-attributes-to-auto-instrumented-spans}

자동 계측된 코드가 실행되는 동안 컨텍스트에서 현재 스팬을 가져올 수 있다.

```go
span := trace.SpanFromContext(ctx)
```

스팬에 속성을 추가하려면 스팬 객체의 `SetAttributes`를 사용한다. `GetProduct`
함수에서는 상품 ID에 대한 속성을 스팬에 추가한다.

```go
span.SetAttributes(
    attribute.String("app.product.id", req.Id),
)
```

### 스팬 상태 설정하기 {#setting-span-status}

이 서비스는 피처 플래그(feature flag)에 따른 오류 상황을 감지하고 처리할 수
있다. 오류 상황에서는 스팬 객체의 `SetStatus`를 사용하여 스팬 상태를 그에 맞게
설정한다. `GetProduct` 함수에서 이를 확인할 수 있다.

```go
msg := fmt.Sprintf("Error: ProductCatalogService Fail Feature Flag Enabled")
span.SetStatus(otelcodes.Error, msg)
```

### 스팬 이벤트 추가하기 {#add-span-events}

스팬 이벤트를 추가하려면 스팬 객체의 `AddEvent`를 사용한다. `GetProduct`
함수에서는 오류 상황을 처리하거나 상품을 성공적으로 찾았을 때 스팬 이벤트를
추가한다.

```go
span.AddEvent(msg)
```

## 메트릭 {#metrics}

### 메트릭 초기화하기 {#initializing-metrics}

오픈텔레메트리 SDK는 `main`에서 `initMeterProvider` 함수를 사용하여 초기화한다.

```go
func initMeterProvider() *sdkmetric.MeterProvider {
    ctx := context.Background()

    exporter, err := otlpmetricgrpc.New(ctx)
    if err != nil {
        log.Fatalf("new otlp metric grpc exporter failed: %v", err)
    }

    mp := sdkmetric.NewMeterProvider(sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter)))
    global.SetMeterProvider(mp)
    return mp
}
```

모든 레코드가 내보내지도록 서비스가 종료될 때 `initMeterProvider.Shutdown()`을
호출해야 한다. 이 서비스는 main의 지연 실행 함수에서 이를 호출한다.

```go
mp := initMeterProvider()
defer func() {
    if err := mp.Shutdown(context.Background()); err != nil {
        log.Fatalf("Error shutting down meter provider: %v", err)
    }
}()
```

### Go 런타임 자동 계측 추가하기 {#adding-golang-runtime-auto-instrumentation}

Go 런타임은 main 함수에서 계측한다.

```go
err := runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second))
if err != nil {
    log.Fatal(err)
}
```

## 로그 {#logs}

두 가지 방법으로 오픈텔레메트리 컬렉터에 로그를 보낼 수 있다.

- 컬렉터로 직접 전송
- 파일 또는 `stdout`을 통해 전송

두 방법의 사용법은 [수동 계측](/docs/languages/go/instrumentation/) 문서의
[로그](/docs/languages/go/instrumentation/#logs) 섹션에서 확인할 수 있다.

상품 카탈로그 서비스는 컬렉터로 로그를 직접 보내며, 구조화된 로그를 출력하는
`slog` 로깅 패키지와 연결하는 로그 브리지(log bridge)를 사용하여 로그를
전송한다.

## LoggerProvider 초기화 {#loggerprovider-initialization}

오픈텔레메트리 SDK는 `main`에서 `initLoggerProvider` 함수를 사용하여 초기화한다.

```go
ctx := context.Background()

logExporter, err := otlploggrpc.New(ctx)
if err != nil {
	return nil
}

loggerProvider := sdklog.NewLoggerProvider(
	sdklog.WithProcessor(sdklog.NewBatchProcessor(logExporter)),
)
global.SetLoggerProvider(loggerProvider)

return loggerProvider
```

모든 로그가 내보내지도록 서비스가 종료될 때 `LoggerProvider.Shutdown()`을
호출한다. 이 서비스는 `main`의 지연 실행 함수에서 이를 호출한다.

```go
lp := initLoggerProvider()
defer func() {
	if err := lp.Shutdown(context.Background()); err != nil {
		logger.Error(fmt.Sprintf("Logger Provider Shutdown: %v", err))
	}
	logger.Info("Shutdown logger provider")
}()
```

### 로깅 기능 {#logging-functionality}

이 서비스는 gRPC 호출을 사용하여 컬렉터에 로그를 보낸다. 로그는 `slog` 패키지를
사용하여 구조화된 형식으로 출력된다.

먼저 로거를 초기화한다.

```go
logger   *slog.Logger
logger = otelslog.NewLogger("product-catalog")
```

로거에 보내기 전에 `fmt.Sprintf`를 사용하여 출력 형식을 지정한다는 점에
유의한다.

```go
logger.Info("Loading Product Catalog...")
logger.Info(fmt.Sprintf("Product Catalog reload interval: %d", interval))
logger.Error(fmt.Sprintf("Error shutting down meter provider: %v", err))
```

`slog`를 사용하면 출력에 추가 속성을 첨부할 수 있다는 장점이 있다. 다음 예제는
`product.name`과 `product.id` 속성을 첨부한다. 이를 통해 로그 출력의 일부로
이러한 속성을 확인하고 파싱할 수 있으며, 그라파나(Grafana)에서 별도의 열로 더
쉽게 확인할 수 있다.

```go
logger.LogAttrs(
	ctx,
	slog.LevelInfo, "Product Found",
	slog.String("app.product.name", found.Name),
	slog.String("app.product.id", req.Id),
)
```
