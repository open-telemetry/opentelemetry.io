---
title: フロントエンドプロキシ（Envoy）
linkTitle: フロントエンドプロキシ
aliases: [frontendproxy]
default_lang_commit: 98f910ef53d1e7f45002e7303b2af4da15282b21
cSpell:ignore: upstreams
---

フロントエンドプロキシは、フロントエンド、Jaeger、Grafana、負荷生成ツール、フィーチャーフラグサービスなどのユーザー向け Web インターフェイスのリバースプロキシとして使用されます。

[フロントエンドプロキシの設定ソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/frontend-proxy/)

## OpenTelemetry の有効化 {#enabling-opentelemetry}

**NOTE: 非合成リクエストのみが Envoy のトレーシングをトリガーします。**

Envoy がリクエストを受信するたびにスパンを生成できるようにするには、以下の設定が必要です。

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

`OTEL_COLLECTOR_HOST` と `OTEL_COLLECTOR_PORT` は環境変数を通じて渡されます。
