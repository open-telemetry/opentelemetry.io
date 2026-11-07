---
title: 일반 SDK 구성
linkTitle: 일반
weight: 10
aliases: [general-sdk-configuration]
default_lang_commit: c8d0756f3ab9fa8c66d715dd21f4f5a370cf8d57
cSpell:ignore: ottrace
---

{{% include "env-var-note.md" %}}

## `OTEL_SERVICE_NAME`

[`service.name`](/docs/specs/semconv/resource/#service) 리소스 속성의 값을
지정한다.

**기본값:** `unknown_service`

`OTEL_RESOURCE_ATTRIBUTES`에도 `service.name`이 지정되어 있다면,
`OTEL_SERVICE_NAME`을 우선한다.

**예시:**

```sh
export OTEL_SERVICE_NAME="your-service-name"
```

## `OTEL_RESOURCE_ATTRIBUTES`

리소스 속성으로 사용할 키-값 쌍이다.

**기본값:** 비어 있음

**예시:**

```sh
export OTEL_RESOURCE_ATTRIBUTES="key1=value1,key2=value2"
```

**참고 자료:**

- [리소스 SDK](/docs/specs/otel/resource/sdk#specifying-resource-information-via-an-environment-variable)
- 공통 리소스 유형의 시맨틱 컨벤션은
  [리소스 시맨틱 컨벤션](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value)을
  참고한다.

## `OTEL_TRACES_SAMPLER`

SDK에서 트레이스를 샘플링할 때 사용하는 샘플러를 지정한다.

**기본값:** `parentbased_always_on`

**예시:**

```sh
export OTEL_TRACES_SAMPLER="traceidratio"
```

`OTEL_TRACES_SAMPLER`에 사용할 수 있는 값은 다음과 같다.

- `always_on`: `AlwaysOnSampler`
- `always_off`: `AlwaysOffSampler`
- `traceidratio`: `TraceIdRatioBased`
- `parentbased_always_on`: `ParentBased(root=AlwaysOnSampler)`
- `parentbased_always_off`: `ParentBased(root=AlwaysOffSampler)`
- `parentbased_traceidratio`: `ParentBased(root=TraceIdRatioBased)`
- `parentbased_jaeger_remote`: `ParentBased(root=JaegerRemoteSampler)`
- `jaeger_remote`: `JaegerRemoteSampler`
- `xray`: [AWS X-Ray 중앙 집중식 샘플링][AWS X-Ray Centralized Sampling]
  (_서드파티_)

[AWS X-Ray Centralized Sampling]:
  https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html

## `OTEL_TRACES_SAMPLER_ARG`

해당하는 경우, `OTEL_TRACES_SAMPLER`로 정의한 샘플러에 전달할 인수를 지정한다.
지정한 값은 `OTEL_TRACES_SAMPLER`가 설정된 경우에만 사용된다. 각 샘플러 유형은
기대하는 입력값이 있다면 이를 자체적으로 정의한다. 유효하지 않거나 인식할 수
없는 입력은 오류로 로그에 기록된다.

**기본값:** 비어 있음

**예시:**

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.5"
```

`OTEL_TRACES_SAMPLER`의 값에 따라 `OTEL_TRACES_SAMPLER_ARG`를 다음과 같이 지정할
수 있다.

- `traceidratio`와 `parentbased_traceidratio` 샘플러: [0..1] 범위의 숫자로
  나타낸 샘플링 확률이다. 예를 들어 "0.25"를 사용할 수 있다. 설정하지 않으면
  기본값은 1.0이다.
- `jaeger_remote`와 `parentbased_jaeger_remote`: 값은 쉼표로 구분한 목록이다.
  - 예시:
    `endpoint=http://localhost:14250,pollingIntervalMs=5000,initialSamplingRate=0.25`
  - `endpoint`: 서비스의 샘플링 전략을 제공하는 gRPC 서버의 엔드포인트이며,
    `scheme://host:port` 형식이다
    ([sampling.proto](https://github.com/jaegertracing/jaeger-idl/blob/main/proto/api_v2/sampling.proto)).
  - `pollingIntervalMs`: 샘플러가 백엔드에서 샘플링 전략의 업데이트를 확인하는
    폴링 주기를 밀리초 단위로 나타낸다.
  - `initialSamplingRate`: [0..1] 범위의 값으로, 샘플링 전략을 가져오기 위해
    백엔드에 연결할 수 없을 때 샘플링 확률로 사용된다. 샘플링 전략을 가져오는 데
    성공하면 새로운 업데이트를 가져올 때까지 원격 전략을 사용하므로, 이 값은 더
    이상 영향을 미치지 않는다.

## `OTEL_PROPAGATORS`

사용할 전파자를 쉼표로 구분한 목록으로 지정한다.

**기본값:** `tracecontext,baggage`

**예시:**

`export OTEL_PROPAGATORS="b3"`

`OTEL_PROPAGATORS`에 사용할 수 있는 값은 다음과 같다.

- `tracecontext`: [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- `baggage`: [W3C Baggage](https://www.w3.org/TR/baggage/)
- `b3`: [B3 Single](/docs/specs/otel/context/api-propagators#configuration)
- `b3multi`: [B3 Multi](/docs/specs/otel/context/api-propagators#configuration)
- `jaeger`: [Jaeger](https://www.jaegertracing.io/sdk-migration/)
- `xray`:
  [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-tracingheader)
  (_서드파티_)
- `ottrace`: [OT Trace](https://github.com/opentracing?q=basic&type=&language=)
  (_서드파티_)
- `none`: 자동으로 구성되는 전파자가 없다.

## `OTEL_TRACES_EXPORTER`

트레이스에 사용할 익스포터를 지정한다. 구현체에 따라 쉼표로 구분한 목록을 사용할
수도 있다.

**기본값:** `otlp`

**예시:**

`export OTEL_TRACES_EXPORTER="jaeger"`

사용할 수 있는 값은 다음과 같다.

- `otlp`: [OTLP][]
- `jaeger`: Jaeger 데이터 모델로 내보낸다.
- `zipkin`: [Zipkin](https://zipkin.io/zipkin-api/)
- `console`: [표준 출력](/docs/specs/otel/trace/sdk_exporters/stdout/)
- `none`: 자동으로 구성되는 트레이스 익스포터가 없다.

## `OTEL_METRICS_EXPORTER`

메트릭에 사용할 익스포터를 지정한다. 구현체에 따라 쉼표로 구분한 목록을 사용할
수도 있다.

**기본값:** `otlp`

**예시:**

`export OTEL_METRICS_EXPORTER="prometheus"`

`OTEL_METRICS_EXPORTER`에 사용할 수 있는 값은 다음과 같다.

- `otlp`: [OTLP][]
- `prometheus`:
  [Prometheus](https://github.com/prometheus/docs/blob/main/docs/instrumenting/exposition_formats.md)
- `console`: [표준 출력](/docs/specs/otel/metrics/sdk_exporters/stdout/)
- `none`: 자동으로 구성되는 메트릭 익스포터가 없다.

## `OTEL_LOGS_EXPORTER`

로그에 사용할 익스포터를 지정한다. 구현체에 따라 쉼표로 구분한 목록을 사용할
수도 있다.

**기본값:** `otlp`

**예시:**

`export OTEL_LOGS_EXPORTER="otlp"`

`OTEL_LOGS_EXPORTER`에 사용할 수 있는 값은 다음과 같다.

- `otlp`: [OTLP][]
- `console`: [표준 출력](/docs/specs/otel/logs/sdk_exporters/stdout/)
- `none`: 자동으로 구성되는 로그 익스포터가 없다.

[otlp]: /docs/specs/otlp/
