---
title: Proxy Frontend (Envoy)
linkTitle: Proxy Frontend
aliases: [frontendproxy]
cSpell:ignore: upstreams
---

O proxy frontend é usado como um proxy reverso para interfaces web voltadas ao usuário
como o frontend, Jaeger, Grafana, gerador de carga e serviço de feature flag.

[Código fonte da configuração do proxy frontend](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/frontend-proxy/)

## Habilitando OpenTelemetry

**NOTA: Apenas requisições não sintéticas irão acionar o rastreamento do envoy.**

Para habilitar o Envoy a produzir spans sempre que receber uma requisição, a
seguinte configuração é necessária:

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

Onde `OTEL_COLLECTOR_HOST` e `OTEL_COLLECTOR_PORT` são passados via variáveis de
ambiente.
