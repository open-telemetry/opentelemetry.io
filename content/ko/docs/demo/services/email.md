---
title: 이메일 서비스
linkTitle: 이메일
aliases: [emailservice]
default_lang_commit: b48363c14a5a607749d12ca9ffe6d79739a3d3cc
cSpell:ignore: sinatra
---

이 서비스는 주문이 접수되면 사용자에게 확인 이메일을 보낸다.

[이메일 서비스 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/email/)

## 트레이싱 초기화하기 {#initializing-tracing}

핵심 오픈텔레메트리(OpenTelemetry) SDK와 익스포터 Ruby gem뿐만 아니라, 자동 계측
라이브러리에 필요한 gem(예: Sinatra)도 `require`로 불러와야 한다.

```ruby
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/sinatra"
```

Ruby SDK는 오픈텔레메트리 표준 환경 변수를 사용하여 OTLP 내보내기, 리소스 속성,
서비스 이름을 자동으로 설정한다. 오픈텔레메트리 SDK를 초기화할 때 사용할 자동
계측 라이브러리(예: Sinatra)도 지정한다.

```ruby
OpenTelemetry::SDK.configure do |c|
  c.use "OpenTelemetry::Instrumentation::Sinatra"
end
```

## 트레이스 {#traces}

### 자동 계측된 스팬에 속성 추가하기 {#add-attributes-to-auto-instrumented-spans}

자동 계측된 코드가 실행되는 동안 컨텍스트에서 현재 스팬을 가져올 수 있다.

```ruby
current_span = OpenTelemetry::Trace.current_span
```

스팬에 여러 속성을 추가하려면 스팬 객체의 `add_attributes`를 사용한다.

```ruby
current_span.add_attributes({
  "app.order.id" => data.order.order_id,
})
```

단일 속성만 추가하려면 스팬 객체의 `set_attribute`를 사용한다.

```ruby
span.set_attribute("app.email.recipient", data.email)
```

### 새 스팬 생성하기 {#create-new-spans}

오픈텔레메트리 트레이서 객체의 `in_span`을 사용하여 새 스팬을 생성하고 활성
컨텍스트에 스팬을 넣을 수 있다. `do..end` 블록과 함께 사용하면 블록 실행이 끝날
때 스팬이 자동으로 종료된다.

```ruby
tracer = OpenTelemetry.tracer_provider.tracer('email')
tracer.in_span("send_email") do |span|
  # 스팬 컨텍스트 내에서 실행할 로직
end
```

## 메트릭 {#metrics}

### 메트릭 초기화하기 {#initializing-metrics}

오픈텔레메트리 메트릭 SDK와 OTLP 메트릭 익스포터는 `email_server.rb` 파일의
최상위 수준에서 초기화한다. 먼저 이들을 사용하기 위한 `require` 문이 필요하다.

```ruby
require "opentelemetry-metrics-sdk"
require "opentelemetry-exporter-otlp-metrics"
```

Ruby SDK는 오픈텔레메트리 표준 환경 변수를 사용하여 OTLP 내보내기, 리소스 속성,
서비스 이름을 자동으로 설정한다. 오픈텔레메트리 메트릭 SDK를 초기화할 때 미터
프로바이더와 메트릭 리더도 설정해야 한다.

```ruby
otlp_metric_exporter = OpenTelemetry::Exporter::OTLP::Metrics::MetricsExporter.new
OpenTelemetry.meter_provider.add_metric_reader(otlp_metric_exporter)
meter = OpenTelemetry.meter_provider.meter("email")
```

미터 프로바이더를 통해 미터에 접근할 수 있으며, 이를 사용하여 전역 메트릭 (예:
`counter`)을 생성할 수 있다.

```ruby
$confirmation_counter = meter.create_counter("app.confirmation.counter", unit: "1", description: "Counts the number of order confirmation emails sent")
```

### 커스텀 메트릭 {#custom-metrics}

현재 다음 커스텀 메트릭을 사용할 수 있다.

- `app.confirmation.counter`: 전송된 주문 확인 이메일 수의 누적값

## 로그 {#logs}

### 로그 초기화하기 {#initializing-logs}

오픈텔레메트리 로그 SDK와 OTLP 로그 익스포터는 `email_server.rb` 파일의 최상위
수준에서 초기화한다. 먼저 이들을 사용하기 위한 `require` 문이 필요하다.

```ruby
require "opentelemetry-logs-sdk"
require "opentelemetry-exporter-otlp-logs"
```

Ruby SDK는 오픈텔레메트리 표준 환경 변수를 사용하여 OTLP 내보내기, 리소스 속성,
서비스 이름을 자동으로 설정한다. 오픈텔레메트리 로그 SDK를 초기화할 때 전역
로거를 생성하려면 로거 프로바이더가 필요하다.

```ruby
$logger = OpenTelemetry.logger_provider.logger(name: "email")
```

### 구조화된 로그 생성하기 {#emitting-structured-logs}

로거의 `on_emit` 메서드를 사용하여 구조화된 로그를 작성할 수 있다.
`severity_text`(예: `INFO`, `ERROR`), 사람이 읽을 수 있는 `body`, 그리고 추후
로그를 조회할 때 도움이 될 수 있는 `app.email.recipient` 속성을 포함한다.

```ruby
$logger.on_emit(
  timestamp: Time.now,
  severity_text: "INFO",
  body: "Order confirmation email sent",
  attributes: { "app.email.recipient" => data.email }
)
```
