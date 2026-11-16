---
title: 부하 생성기
aliases: [loadgenerator]
default_lang_commit: 4309389695c38fee3cb6e68bf1186e4a99d5da4c
cSpell:ignore: gevent instrumentor loadgenerator locustfile urllib
---

부하 생성기는 Python 부하 테스트 프레임워크인 [Locust](https://locust.io)를
기반으로 한다. 기본적으로 프론트엔드의 여러 경로로 요청을 보내는 사용자를
시뮬레이션한다.

[부하 생성기 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

## 트레이스 {#traces}

### 트레이싱 초기화하기 {#initializing-tracing}

이 서비스는
[locustfile](https://docs.locust.io/en/stable/writing-a-locustfile.html)이므로,
오픈텔레메트리(OpenTelemetry) SDK는 임포트 문 뒤에서 초기화된다. 이 코드는
트레이서 프로바이더를 생성하고 사용할 스팬 프로세서를 설정한다. 내보내기
엔드포인트, 리소스 속성, 서비스 이름은
[오픈텔레메트리 환경 변수](/docs/specs/otel/configuration/sdk-environment-variables/)를
사용하여 자동으로 설정된다.

```python
tracer_provider = TracerProvider()
trace.set_tracer_provider(tracer_provider)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(insecure=True)))
```

### 계측 라이브러리 추가하기 {#adding-instrumentation-libraries}

계측 라이브러리를 추가하려면 Python 코드에서 각 라이브러리의
인스트루멘터(Instrumentor)를 임포트해야 한다. Locust는 `Requests`, `URLLib3`,
`Jinja2` 라이브러리를 사용하므로, 해당 라이브러리의 인스트루멘터를 임포트한다.

```python
from opentelemetry.instrumentation.jinja2 import Jinja2Instrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
```

Locust의 gevent 몽키 패칭 사용으로 인한 오류를 피하기 위해, 인스트루멘터는
`opentelemetry-instrument`를 통하지 않고 `instrument()`를 직접 호출하여
초기화한다.

```python
Jinja2Instrumentor().instrument()
RequestsInstrumentor().instrument()
URLLib3Instrumentor().instrument()
```

초기화가 끝나면 이 부하 생성기가 보내는 모든 Locust 요청은 `Requests`와
`URLLib3` 라이브러리 각각에 대한 스팬을 포함하는 자체 트레이스를 갖게 된다.

### 수동 스팬 {#manual-spans}

시뮬레이션된 각 사용자 동작(상품 탐색, 장바구니 보기, 주문 처리 등)에도
`tracer.start_as_current_span`으로 생성한 자체 수동 스팬이 부여된다.
`demo.product.id`, `demo.ad.category`, `demo.cart.items.count`와 같은 속성은
관련된 곳에 추가된다. 이러한 속성은
[텔레메트리 스키마](https://github.com/open-telemetry/opentelemetry-demo/blob/main/telemetry-schema/services/load_generator.yaml)에서
`service.load_generator`에 대해 선언되어 있다.

## 메트릭 {#metrics}

`MeterProvider`는 `PeriodicExportingMetricReader`와 OTLP 익스포터로 설정된다.
`SystemMetricsInstrumentor`는 이를 사용하여 부하 생성기 자체의 프로세스 수준
시스템 메트릭(CPU, 메모리 등)을 보고한다.

## 로그 {#logs}

`LoggerProvider`는 로그 레코드를 일괄 처리하여 OTLP로 내보낸다. 표준
라이브러리의 `logging` 모듈은 `LoggingHandler`를 통해 여기에 연결되며,
`LoggingInstrumentor`는 활성 트레이스와 스팬의 ID를 각 로그 레코드에 주입하므로,
locustfile 곳곳의 `logging.info(...)`와 같은 호출은 해당 스팬과 연관된 형태로
표시된다.

## 배기지(Baggage) {#baggage}

부하 생성기는 오픈텔레메트리 배기지를 사용하여 트레이스가 합성으로 생성되었음을
나타낸다. 이는 `on_start` 함수에서 배기지 항목을 포함하는 컨텍스트 객체를
생성하고, 시뮬레이션된 사용자가 실행하는 모든 작업에 해당 컨텍스트를 연결하는
방식으로 이루어진다.

```python
ctx = baggage.set_baggage("session.id", session_id)
ctx = baggage.set_baggage("synthetic_request", "true", context=ctx)
context.attach(ctx)
```

컨텍스트는 어떤 스팬의 `with` 블록에도 속하지 않는 곳에서 연결한다. 스팬의
컨텍스트 매니저 내부에서 연결하면 해당 스팬이 종료될 때 배기지도 분리되어,
사용자 세션의 나머지 구간에서는 조용히 배기지가 사라지게 된다.

배기지 자체는 텔레메트리에 표시를 남기지 않는다. 각 백엔드 서비스는 수신한
배기지에서 `synthetic_request` 항목을 읽어 자체 스팬과 로그 레코드에 속성으로
복사하며, 텔레메트리가 합성 흐름에서 비롯되었는지를 기록하는 것은 이 속성이다.
프론트엔드는 `demo.synthetic_request`를 설정하고, 주문 처리 및 결제 서비스는
`user_agent.synthetic.type`을 `test`로 설정한다. 이 표시가 텔레메트리 자체에
남으므로, 옵저버빌리티 백엔드의 모든 쿼리에서 부하 생성기 트래픽을 필터링하여
포함하거나 제외할 수 있다.
