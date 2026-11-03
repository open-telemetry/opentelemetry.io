---
title: 프론트엔드 프록시(엔보이, Envoy)
linkTitle: 프론트엔드 프록시
aliases: [frontendproxy]
default_lang_commit: 90cfef1d5f0f28c5b11c06a14dc0f7842c8dab2b
cSpell:ignore: upstreams
---

프론트엔드 프록시는 프론트엔드, 예거(Jaeger), 그라파나(Grafana), 부하 생성기,
피처 플래그 서비스와 같은 사용자 대상 웹 인터페이스의 리버스 프록시로 사용된다.

[프론트엔드 프록시 설정 소스](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/frontend-proxy/)

## 오픈텔레메트리 활성화하기 {#enabling-opentelemetry}

**참고: 합성 요청이 아닌 요청만 엔보이 트레이싱을 트리거한다.**

엔보이가 요청을 수신할 때마다 스팬을 생성하도록 하려면 다음 설정이 필요하다.

```yaml
static_resources:
  listeners:
    - address:
        socket_address:
          address: 0.0.0.0
          port_value: ${ENVOY_PORT}
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                '@type': type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                codec_type: AUTO
                stat_prefix: ingress_http
                tracing:
                  provider:
                    name: envoy.tracers.opentelemetry
                    typed_config:
                      '@type': type.googleapis.com/envoy.config.trace.v3.OpenTelemetryConfig
                      grpc_service:
                        envoy_grpc:
                          cluster_name: opentelemetry_collector
                        timeout: 0.250s
                      service_name: frontend-proxy

  clusters:
    - name: opentelemetry_collector
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      typed_extension_protocol_options:
        envoy.extensions.upstreams.http.v3.HttpProtocolOptions:
          '@type': type.googleapis.com/envoy.extensions.upstreams.http.v3.HttpProtocolOptions
          explicit_http_config:
            http2_protocol_options: {}
      load_assignment:
        cluster_name: opentelemetry_collector
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: ${OTEL_COLLECTOR_HOST}
                      port_value: ${OTEL_COLLECTOR_PORT}
```

여기서 `OTEL_COLLECTOR_HOST`와 `OTEL_COLLECTOR_PORT`는 환경 변수로 전달된다.
