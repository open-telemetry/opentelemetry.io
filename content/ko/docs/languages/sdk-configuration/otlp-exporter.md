---
title: OTLP 익스포터 구성
linkTitle: OTLP 익스포터
weight: 20
aliases: [otlp-exporter-configuration]
default_lang_commit: ca99c1f23ef7e02acee3389ee766af6dbedb8e64
cSpell:ignore: lowmemory
---

{{% include "env-var-note.md" %}}

## 엔드포인트 구성 {#endpoint-configuration}

다음 환경 변수를 사용하면 트레이스, 메트릭, 프로파일, 로그를 위한 OTLP/gRPC 또는
OTLP/HTTP 엔드포인트를 구성할 수 있다.

### `OTEL_EXPORTER_OTLP_ENDPOINT`

모든 시그널 유형에 사용할 기본 엔드포인트 URL이며, 선택적으로 포트 번호를 지정할
수 있다. 여러 시그널을 같은 엔드포인트로 보내면서 하나의 환경 변수로
엔드포인트를 제어하려는 경우에 유용하다.

**기본값:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318"`

**예시:**

- gRPC: `export OTEL_EXPORTER_OTLP_ENDPOINT="https://my-api-endpoint:443"`
- HTTP: `export OTEL_EXPORTER_OTLP_ENDPOINT="http://my-api-endpoint/"`

OTLP/HTTP에서는 이 환경 변수를 설정하면 SDK의 익스포터가 시그널별 URL을
구성한다. 즉, 트레이스, 메트릭, 로그를 보내는 경우 위 예시로부터 다음 URL이
구성된다.

- 트레이스: `"http://my-api-endpoint/v1/traces"`
- 메트릭: `"http://my-api-endpoint/v1/metrics"`
- 로그: `"http://my-api-endpoint/v1/logs"`

OTLP/gRPC에서 엔드포인트 값은 gRPC 대상이다. gRPC 엔드포인트 값에 `/v1/traces`,
`/v1/metrics`, `/v1/logs`와 같은 OTLP/HTTP 시그널 경로를 덧붙이지 않는다. gRPC
익스포터는 구성된 대상에 연결한 후 각 시그널에 해당하는 OTLP protobuf 서비스
메서드를 사용한다.

### `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

트레이스 데이터 전용 엔드포인트 URL이며, 선택적으로 포트 번호를 지정할 수 있다.
OTLP/HTTP를 사용할 때는 일반적으로 `v1/traces`로 끝난다.

**기본값:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/traces"`

**예시:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://my-api-endpoint/v1/traces"`

### `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`

메트릭 데이터 전용 엔드포인트 URL이며, 선택적으로 포트 번호를 지정할 수 있다.
OTLP/HTTP를 사용할 때는 일반적으로 `v1/metrics`로 끝난다.

**기본값:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/metrics"`

**예시:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="http://my-api-endpoint/v1/metrics"`

### `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`

로그 데이터 전용 엔드포인트 URL이며, 선택적으로 포트 번호를 지정할 수 있다.
OTLP/HTTP를 사용할 때는 일반적으로 `v1/logs`로 끝난다.

**기본값:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/logs"`

**예시:**

- gRPC: `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="http://my-api-endpoint/v1/logs"`

### `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT`

프로파일 데이터 전용 엔드포인트 URL이며, 선택적으로 포트 번호를 지정할 수 있다.
OTLP/HTTP를 사용할 때는 일반적으로 `v1/profiles`로 끝난다.

**기본값:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/profiles"`

**예시:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT="http://my-api-endpoint/v1/profiles"`

## 헤더 구성 {#header-configuration}

다음 환경 변수를 사용하면 외부로 보내는 gRPC 또는 HTTP 요청에 추가할 헤더를
키-값 쌍의 목록으로 구성할 수 있다.

헤더는 `key1=value1,key2=value2`와 같이
[W3C Baggage](https://www.w3.org/TR/baggage/#header-content)와 일치하는 형식으로
표현된다. 세미콜론으로 구분하는
[메타데이터](https://www.w3.org/TR/baggage/#property)는 지원하지 않는다. 자세한
내용은 프로토콜 사양의
[환경 변수로 헤더 지정하기](/docs/specs/otel/protocol/exporter/#specifying-headers-via-environment-variables)를
참고한다.

### `OTEL_EXPORTER_OTLP_HEADERS`

외부로 보내는 모든 데이터(트레이스, 메트릭, 로그)에 적용할 헤더 목록이다.

**기본값:** 해당 없음

**예시:**
`export OTEL_EXPORTER_OTLP_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_TRACES_HEADERS`

외부로 보내는 모든 트레이스에 적용할 헤더 목록이다.

**기본값:** 해당 없음

**예시:**
`export OTEL_EXPORTER_OTLP_TRACES_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_METRICS_HEADERS`

외부로 보내는 모든 메트릭에 적용할 헤더 목록이다.

**기본값:** 해당 없음

**예시:**
`export OTEL_EXPORTER_OTLP_METRICS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_LOGS_HEADERS`

외부로 보내는 모든 로그에 적용할 헤더 목록이다.

**기본값:** 해당 없음

**예시:**
`export OTEL_EXPORTER_OTLP_LOGS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_PROFILES_HEADERS`

외부로 보내는 모든 프로파일에 적용할 헤더 목록이다.

**기본값:** 없음

**예시:**
`export OTEL_EXPORTER_OTLP_PROFILES_HEADERS="api-key=key,other-config-value=value"`

## 타임아웃 구성 {#timeout-configuration}

다음 환경 변수는 OTLP 익스포터가 다음 데이터 배치를 전송하기 전에 기다리는 최대
시간을 밀리초 단위로 구성한다.

### `OTEL_EXPORTER_OTLP_TIMEOUT`

외부로 보내는 모든 데이터(트레이스, 메트릭, 로그)의 타임아웃 값이며, 단위는
밀리초다.

**기본값:** `10000` (10초)

**예시:** `export OTEL_EXPORTER_OTLP_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`

외부로 보내는 모든 트레이스의 타임아웃 값이며, 단위는 밀리초다.

**기본값:** 10000 (10초)

**예시:** `export OTEL_EXPORTER_OTLP_TRACES_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`

외부로 보내는 모든 메트릭의 타임아웃 값이며, 단위는 밀리초다.

**기본값:** 10000 (10초)

**예시:** `export OTEL_EXPORTER_OTLP_METRICS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`

외부로 보내는 모든 로그의 타임아웃 값이며, 단위는 밀리초다.

**기본값:** 10000 (10초)

**예시:** `export OTEL_EXPORTER_OTLP_LOGS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT`

외부로 보내는 모든 프로파일의 타임아웃 값이며, 단위는 밀리초다.

**기본값:** 10000 (10초)

**예시:** `export OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT=500`

## 프로토콜 구성 {#protocol-configuration}

다음 환경 변수는 OTLP 익스포터가 사용하는 OTLP 전송 프로토콜을 구성한다.

### `OTEL_EXPORTER_OTLP_PROTOCOL`

모든 텔레메트리 데이터에 사용할 OTLP 전송 프로토콜을 지정한다.

**기본값:** SDK에 따라 다르지만, 일반적으로 `http/protobuf` 또는 `grpc`다.

**예시:** `export OTEL_EXPORTER_OTLP_PROTOCOL=grpc`

유효한 값은 다음과 같다.

- `grpc`: OTLP/gRPC를 사용한다.
- `http/protobuf`: OTLP/HTTP + protobuf를 사용한다.
- `http/json`: OTLP/HTTP + JSON을 사용한다.

### `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`

트레이스 데이터에 사용할 OTLP 전송 프로토콜을 지정한다.

**기본값:** SDK에 따라 다르지만, 일반적으로 `http/protobuf` 또는 `grpc`다.

**예시:** `export OTEL_EXPORTER_OTLP_TRACES_PROTOCOL=grpc`

유효한 값은 다음과 같다.

- `grpc`: OTLP/gRPC를 사용한다.
- `http/protobuf`: OTLP/HTTP + protobuf를 사용한다.
- `http/json`: OTLP/HTTP + JSON을 사용한다.

### `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`

메트릭 데이터에 사용할 OTLP 전송 프로토콜을 지정한다.

**기본값:** SDK에 따라 다르지만, 일반적으로 `http/protobuf` 또는 `grpc`다.

**예시:** `export OTEL_EXPORTER_OTLP_METRICS_PROTOCOL=grpc`

유효한 값은 다음과 같다.

- `grpc`: OTLP/gRPC를 사용한다.
- `http/protobuf`: OTLP/HTTP + protobuf를 사용한다.
- `http/json`: OTLP/HTTP + JSON을 사용한다.

### `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`

로그 데이터에 사용할 OTLP 전송 프로토콜을 지정한다.

**기본값:** SDK에 따라 다르지만, 일반적으로 `http/protobuf` 또는 `grpc`다.

**예시:** `export OTEL_EXPORTER_OTLP_LOGS_PROTOCOL=grpc`

유효한 값은 다음과 같다.

- `grpc`: OTLP/gRPC를 사용한다.
- `http/protobuf`: OTLP/HTTP + protobuf를 사용한다.
- `http/json`: OTLP/HTTP + JSON을 사용한다.

### `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL`

프로파일 데이터에 사용할 OTLP 전송 프로토콜을 지정한다.

**기본값:** SDK에 따라 다르지만, 일반적으로 `http/protobuf` 또는 `grpc`다.

**예시:** `export OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL=grpc`

유효한 값은 다음과 같다.

- `grpc`: OTLP/gRPC를 사용한다.
- `http/protobuf`: OTLP/HTTP + protobuf를 사용한다.
- `http/json`: OTLP/HTTP + JSON을 사용한다.

## 메트릭 전용 구성 {#metrics-specific-configuration}

다음 환경 변수는 메트릭 전용 익스포터 옵션을 구성한다.

### `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE`

인스트루먼트(instrument) 종류에 따라 익스포터가 선호하는 집계 시간성(aggregation
temporality)을 구성한다.

**기본값:** `cumulative`

**예시:** `export OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE=delta`

유효한 값은 다음과 같다.

- `cumulative`: 모든 인스트루먼트 종류에 누적 집계 시간성을 사용한다.
- `delta`: Counter, Asynchronous Counter, Histogram에는 델타 집계 시간성을
  사용하고, UpDownCounter와 Asynchronous UpDownCounter에는 누적 집계 시간성을
  사용한다.
- `lowmemory`: Synchronous Counter와 Histogram에는 델타 집계 시간성을 사용하고,
  나머지에는 누적 집계 시간성을 사용한다.

### `OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION`

Histogram 인스트루먼트 종류에 대한 익스포터의 기본 집계를 구성한다.

**기본값:** `explicit_bucket_histogram`

**예시:**
`export OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION=base2_exponential_bucket_histogram`

유효한 값은 다음과 같다.

- `explicit_bucket_histogram`: 명시적 버킷 히스토그램 집계를 사용한다.
- `base2_exponential_bucket_histogram`: 밑이 2인 지수 버킷 히스토그램 집계를
  사용한다.
