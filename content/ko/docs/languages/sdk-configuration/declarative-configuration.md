---
title: 선언적 구성
linkTitle: 선언적 구성
weight: 30
default_lang_commit: e3d2729f377c307e9e9517db7316d9ea12e1e879
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="content-modules/opentelemetry-configuration"?>

선언적 구성은 환경 변수 대신 YAML 파일을 사용한다.

이 방식은 다음과 같은 경우에 유용하다.

- 설정할 구성 옵션이 많다.
- 환경 변수로 제공되지 않는 구성 옵션을 사용하고 싶다.

> [!WARNING]
>
> 선언적 구성 스키마는 안정적이다. 아직 실험 단계인 부분에는 `/development`
> 접미사가 붙는다. 다양한 구현체의 선언적 구성 지원은 아직 실험 단계다.

## 지원 언어 {#supported-languages}

다음 오픈텔레메트리(OpenTelemetry) SDK는 선언적 구성을 지원한다.

- [Java](/docs/zero-code/java/agent/declarative-configuration/)

자세한 내용은
[준수 현황 표](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration)를
참고한다.

## 시작하기 {#getting-started}

1. 다음 구성 파일을 `otel-config.yaml`로 저장한다.
2. 환경 변수 `OTEL_CONFIG_FILE=/path/to/otel-config.yaml`을 설정한다.

권장 구성 파일은 다음과 같다.

<!-- prettier-ignore-start -->
<?code-excerpt "examples/otel-getting-started.yaml"?>
```yaml
# otel-getting-started.yaml은 OTLP를 통해 localhost로 내보내는 구성을 포함하여
# SDK를 구성하기 위한 좋은 출발점이다.
#
# 참고: 환경 변수 치환 문법(예: ${MY_ENV})을 제외하고, SDK는 구성 파일을 해석할 때
# 환경 변수를 무시한다. 여기에는 다음 문서에 정의된 모든 환경 변수도 포함된다.
# https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
#
# 필수 속성, 시맨틱, 기본 동작 등을 포함한 스키마 문서는 다음을 참고한다.
# https://opentelemetry.io/docs/specs/otel-config/types/

file_format: "1.2"

resource:
  # OTEL_RESOURCE_ATTRIBUTES 환경 변수에서 리소스 속성을 읽는다.
  # 이 방식은 오픈텔레메트리 오퍼레이터 및 다른 배포 방식과 잘 맞는다.
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development: # /development 속성은 일부 SDK에서 지원되지 않을 수 있다.
    detectors:
      - service: # "service.instance.id"와 OTEL_SERVICE_NAME 환경 변수의 "service.name"을 추가한다.
      - host:
      - process:
      - container:

propagator:
  composite:
    - tracecontext:
    - baggage:

# OTEL_EXPORTER_OTLP_ENDPOINT 환경 변수에서 백엔드 엔드포인트를 읽는다.
# 이 방식은 오픈텔레메트리 오퍼레이터 및 다른 배포 방식과 잘 맞는다.

tracer_provider:
  sampler:
    parent_based:
      root:
        always_on:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/traces

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/metrics

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/logs
```
<!-- prettier-ignore-end -->

## 환경 변수 {#environment-variables}

- 선언적 구성은 **환경 변수** 를 읽는 문법을 지원한다.
- 모든 환경 변수는 **구성 파일에 명시적으로 추가하지 않으면 무시된다**.

예를 들어 다음과 같이 설정하면,

```shell
OTEL_RESOURCE_ATTRIBUTES=service.version=1.1,deployment.environment.name=staging
```

다음 구성은 `service.version=1.1`과 `deployment.environment.name=staging`을 가진
리소스를 생성한다.

```yaml
resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
```

> [!WARNING]
>
> 모든 환경 변수는 구성 파일에 명시적으로 추가하지 않으면 무시된다.

## 마이그레이션 구성 {#migration-configuration}

기존 구성이 환경 변수에 의존한다면,
[마이그레이션 구성](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/otel-sdk-migration-config.yaml)을
선언적 구성으로 마이그레이션하기 위한 출발점으로 사용할 수 있다.

## 사용 가능한 구성 옵션 {#available-config-options}

전체 구성 옵션 목록은 [구성 예시][otel-sdk-config.yaml]에서 확인할 수 있다.

[otel-sdk-config.yaml]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/v1.0.0-rc.1/examples/kitchen-sink.yaml

## 시그널별 엔드포인트 {#endpoint-per-signal}

트레이스, 메트릭, 로그의 엔드포인트가 서로 다르다면, `otlp_http`를 사용할 때
다음 구성을 사용한다.

| OTLP HTTP 익스포터 | 엔드포인트 값                                                              |
| ------------------ | -------------------------------------------------------------------------- |
| 트레이스           | `${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}`   |
| 메트릭             | `${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}` |
| 로그               | `${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}`       |

## gRPC 익스포터 {#grpc-exporter}

`otlp_http` 대신 `otlp_grpc`를 사용하여 gRPC로 내보낼 수도 있다.

```yaml
otlp_grpc:
  endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4317}
```

## 리소스 속성 {#resource-attributes}

리소스 속성은 환경 변수로 설정하는 것을 권장한다.
[쿠버네티스용 오픈텔레메트리 오퍼레이터](/docs/platforms/kubernetes/operator/)처럼
환경 변수를 설정하는 도구와 잘 연동되기 때문이다.

하지만 구성 파일에서 리소스 속성을 직접 설정할 수도 있다.

```yaml
resource:
  attributes:
    - name: service.name
      value: shopping_cart
    - name: deployment.environment.name
      value: staging
```
