---
title: 견적 서비스
linkTitle: 견적
aliases: [quoteservice]
default_lang_commit: 98a528997da383a8e152021f920ce510572b1b87
cSpell:ignore: getquote
---

이 서비스는 배송할 상품 수를 기준으로 배송비를 계산하는 역할을 한다. 배송
서비스는 HTTP를 통해 견적 서비스를 호출한다.

견적 서비스는 Slim 프레임워크와 의존성 주입을 관리하는 php-di를 사용하여
구현되어 있다.

다른 프레임워크를 사용하면 PHP 계측 방식이 달라질 수 있다.

[견적 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/quote/)

## 트레이스 {#traces}

### 트레이싱 초기화하기 {#initializing-tracing}

이 데모에서는 컴포저(Composer) 자동 로딩의 일부로 이루어지는 SDK 자동 로딩
과정에서 오픈텔레메트리(OpenTelemetry) SDK를 자동으로 생성한다.

환경 변수를 `OTEL_PHP_AUTOLOAD_ENABLED=true`로 설정하면 이 기능을 활성화할 수
있다.

```php
require __DIR__ . '/../vendor/autoload.php';
```

`Tracer`를 생성하거나 가져오는 방법은 여러 가지가 있으며, 이 예제에서는 앞서 SDK
자동 로딩 과정에서 초기화한 전역 트레이서 프로바이더에서 가져온다.

```php
$tracer = Globals::tracerProvider()->getTracer('manual-instrumentation');
```

### 수동으로 스팬 생성하기 {#manually-creating-spans}

`Tracer`를 통해 스팬을 수동으로 생성할 수 있다. 기본적으로 이 스팬은 현재 실행
컨텍스트에서 활성화된 스팬의 자식이 된다.

```php
$span = Globals::tracerProvider()
    ->getTracer('manual-instrumentation')
    ->spanBuilder('calculate-quote')
    ->setSpanKind(SpanKind::KIND_INTERNAL)
    ->startSpan();
/* calculate quote */
$span->end();
```

### 스팬 속성 추가하기 {#add-span-attributes}

`OpenTelemetry\API\Trace\Span`을 사용하여 현재 스팬을 가져올 수 있다.

```php
$span = Span::getCurrent();
```

스팬에 속성을 추가하려면 스팬 객체의 `setAttribute`를 사용한다. `calculateQuote`
함수에서는 `childSpan`에 두 개의 속성을 추가한다.

```php
$childSpan->setAttribute('app.quote.items.count', $numberOfItems);
$childSpan->setAttribute('app.quote.cost.total', $quote);
```

### 스팬 이벤트 추가하기 {#add-span-events}

스팬 이벤트를 추가하려면 스팬 객체의 `addEvent`를 사용한다. `getquote`
라우트에서 스팬 이벤트를 추가한다. 일부 이벤트에는 추가 속성이 있고, 나머지에는
없다.

속성 없이 스팬 이벤트 추가하기:

```php
$span->addEvent('Received get quote request, processing it');
```

추가 속성과 함께 스팬 이벤트 추가하기:

```php
$span->addEvent('Quote processed, response sent back', [
    'app.quote.cost.total' => $payload
]);
```

## 메트릭 {#metrics}

이 데모에서는 배치 트레이스 프로세서와 로그 프로세서가 메트릭을 생성한다. 이
메트릭은 내보낸 스팬이나 로그의 수, 큐의 한도와 사용량 등 프로세서의 내부 상태를
나타낸다.

환경 변수 `OTEL_PHP_INTERNAL_METRICS_ENABLED`를 `true`로 설정하면 메트릭을
활성화할 수 있다.

생성된 견적 수를 세는 수동 메트릭도 생성하며, 여기에는 상품 수에 대한 속성이
포함된다.

전역으로 설정된 미터 프로바이더에서 카운터를 생성하고, 견적을 생성할 때마다
카운터 값을 증가시킨다.

```php
static $counter;
$counter ??= Globals::meterProvider()
    ->getMeter('quotes')
    ->createCounter('quotes', 'quotes', 'number of quotes calculated');
$counter->add(1, ['number_of_items' => $numberOfItems]);
```

메트릭은 누적되며, `OTEL_METRIC_EXPORT_INTERVAL`에 설정한 값에 따라 주기적으로
내보낸다.

## 로그 {#logs}

견적 서비스는 견적을 계산한 뒤 로그 메시지를 생성한다. 모노로그(Monolog) 로깅
패키지에는 모노로그 로그를 오픈텔레메트리 형식으로 변환하는
[로그 브리지](/docs/concepts/signals/logs/#log-appender--bridge)를 설정한다. 이
로거에 보낸 로그는 전역으로 설정된 오픈텔레메트리 로거를 통해 내보낸다.
