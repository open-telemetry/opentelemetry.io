---
title: service.criticality를 사용한 테일 기반 샘플링
linkTitle: 테일 샘플링
default_lang_commit: 944f1dc350e95a68e89edc2407dea0085671dd4c
---

이 예제는 오픈텔레메트리(OpenTelemetry) 컬렉터에서
[`service.criticality`](/docs/specs/semconv/resource/service/#service) 리소스
속성을 활용하여 테일 기반 샘플링 여부를 결정하는 방법을 보여준다.

데모 애플리케이션은 각 서비스에 `service.criticality` 값을 할당하여 운영상
중요도에 따라 분류한다.

| 중요도     | 샘플링 비율 | 서비스                                                                                     |
| ---------- | ----------- | ------------------------------------------------------------------------------------------ |
| `critical` | 100%        | payment, checkout, frontend, frontend-proxy                                                |
| `high`     | 50%         | cart, product-catalog, currency, shipping                                                  |
| `medium`   | 10%         | recommendation, ad, email                                                                  |
| `low`      | 1%          | accounting, fraud-detection, image-provider, load-generator, quote, flagd, flagd-ui, Kafka |

## 컬렉터 설정 {#collector-configuration}

테일 기반 샘플링을 활성화하려면 `otelcol-config-extras.yml`에 다음 내용을
추가한다.

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    expected_new_traces_per_sec: 1000
    policies:
      # 정책 1: 핵심 서비스는 항상 샘플링한다(100%)
      - name: critical-services-always-sample
        type: string_attribute
        string_attribute:
          key: service.criticality
          values:
            - critical
          enabled_regex_matching: false
          invert_match: false

      # 정책 2: 중요도가 높은 서비스는 50% 비율로 샘플링한다
      - name: high-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-high-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - high
            - name: probabilistic-50
              type: probabilistic
              probabilistic:
                sampling_percentage: 50

      # 정책 3: 중요도가 중간인 서비스는 10% 비율로 샘플링한다
      - name: medium-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-medium-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - medium
            - name: probabilistic-10
              type: probabilistic
              probabilistic:
                sampling_percentage: 10

      # 정책 4: 중요도가 낮은 서비스는 1% 비율로 샘플링한다
      - name: low-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-low-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - low
            - name: probabilistic-1
              type: probabilistic
              probabilistic:
                sampling_percentage: 1

      # 정책 5: 중요도와 관계없이 오류 트레이스는 항상 샘플링한다
      - name: errors-always-sample
        type: status_code
        status_code:
          status_codes:
            - ERROR

      # 정책 6: 핵심 서비스와 중요도가 높은 서비스의 느린 트레이스는 항상 샘플링한다
      - name: slow-critical-traces
        type: and
        and:
          and_sub_policy:
            - name: is-critical-or-high
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - critical
                  - high
            - name: is-slow
              type: latency
              latency:
                threshold_ms: 5000

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors:
        [
          resourcedetection,
          memory_limiter,
          transform/sanitize_spans,
          tail_sampling,
        ]
      exporters: [otlp_grpc/jaeger, debug, span_metrics]
```

## 동작 방식 {#how-it-works}

테일 샘플링 프로세서는 설정된 정책을 기준으로 완료된 트레이스를 평가한다.
**하나라도** 일치하는 정책이 있으면 트레이스가 샘플링된다.

- **핵심 서비스**는 항상 샘플링하여 결제 흐름, 주문 처리, 사용자 대면 서비스에
  대한 완전한 가시성을 확보한다.
- **중요도가 높은 서비스**는 50% 비율로 샘플링하여 옵저버빌리티(Observability)와
  데이터 양 사이의 균형을 맞춘다.
- **중요도가 중간이거나 낮은 서비스**는 중요도가 낮을수록 더 낮은 비율로
  샘플링하여 덜 중요한 경로에서 발생하는 노이즈를 줄인다.
- 서비스 중요도와 관계없이 **오류는 항상 수집**하여 문제를 놓치지 않도록 한다.
- 핵심 서비스와 중요도가 높은 서비스의 **느린 트레이스**(>5s)는 항상 샘플링하여
  성능 병목을 파악하는 데 도움을 준다.
