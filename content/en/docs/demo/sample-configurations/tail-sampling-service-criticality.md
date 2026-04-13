---
title: Tail-Based Sampling with service.criticality
linkTitle: Tail Sampling
---

This example demonstrates how to use the
[`service.criticality`](/docs/specs/semconv/resource/service/#service) resource
attribute for intelligent tail-based sampling decisions in the OpenTelemetry
Collector.

The demo application assigns a `service.criticality` value to each service,
classifying them by operational importance:

| Criticality | Sampling Rate | Services                                                                                   |
| ----------- | ------------- | ------------------------------------------------------------------------------------------ |
| `critical`  | 100%          | payment, checkout, frontend, frontend-proxy                                                |
| `high`      | 50%           | cart, product-catalog, currency, shipping                                                  |
| `medium`    | 10%           | recommendation, ad, product-reviews, email                                                 |
| `low`       | 1%            | accounting, fraud-detection, image-provider, load-generator, quote, flagd, flagd-ui, Kafka |

## Collector Configuration

To enable tail-based sampling, add the following to your
`otelcol-config-extras.yml`:

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    expected_new_traces_per_sec: 1000
    policies:
      # Policy 1: Always sample critical services (100%)
      - name: critical-services-always-sample
        type: string_attribute
        string_attribute:
          key: service.criticality
          values:
            - critical
          enabled_regex_matching: false
          invert_match: false

      # Policy 2: Sample 50% of high-criticality services
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

      # Policy 3: Sample 10% of medium-criticality services
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

      # Policy 4: Sample 1% of low-criticality services
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

      # Policy 5: Always sample error traces regardless of criticality
      - name: errors-always-sample
        type: status_code
        status_code:
          status_codes:
            - ERROR

      # Policy 6: Always sample slow traces from critical/high services
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
      processors: [resourcedetection, memory_limiter, transform, tail_sampling]
      exporters: [otlp, debug, spanmetrics]
```

## How It Works

The tail-sampling processor evaluates completed traces against the configured
policies. A trace is sampled if **any** policy matches:

1. **Critical services** are always sampled to ensure full visibility into
   payment flows, checkout, and user-facing services.
2. **High-criticality services** are sampled at 50%, balancing observability
   with data volume.
3. **Medium and low-criticality services** are progressively sampled at lower
   rates to reduce noise from less critical paths.
4. **Errors are always captured** regardless of service criticality, ensuring no
   issues go unnoticed.
5. **Slow traces** (>5s) from critical and high-criticality services are always
   sampled to help identify performance bottlenecks.
