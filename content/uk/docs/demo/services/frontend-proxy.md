---
title: Проксі-сервер фронтенда (Envoy)
linkTitle: Проксі-сервер фронтенда
aliases: [frontendproxy]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: upstreams
---

Проксі-сервер фронтенда використовується як зворотний проксі для вебінтерфейсів, що орієнтовані на користувача, таких як фронтенд, Jaeger, Grafana, генератор навантаження та сервіс прапорців функцій.

[Код налаштування Frontend proxy](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/frontend-proxy/)

## Увімкнення OpenTelemetry {#enabling-opentelemetry}

**ПРИМІТКА: Тільки не синтетичні запити будуть викликати трасування envoy.**

Щоб увімкнути Envoy для створення відрізків при отриманні запиту, необхідно виконати наступну конфігурацію:

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

Де `OTEL_COLLECTOR_HOST` та `OTEL_COLLECTOR_PORT` передаються через змінні середовища.
