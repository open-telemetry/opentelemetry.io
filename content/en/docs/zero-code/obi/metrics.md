---
title: OBI exported metrics
linkTitle: Exported metrics
description:
  Learn about the application, runtime, and network metrics OBI can export.
weight: 21
cSpell:ignore: gogc replicaset statefulset
---

The following table describes the exported metrics in both OpenTelemetry and
Prometheus format.

| Family      | Name (OTel)                           | Name (Prometheus)                             | Type      | Unit    | Description                                                                                                           |
| ----------- | ------------------------------------- | --------------------------------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| Application | `http.client.request.duration`        | `http_client_request_duration_seconds`        | Histogram | seconds | Duration of HTTP service calls from the client side                                                                   |
| Application | `http.client.request.body.size`       | `http_client_request_body_size_bytes`         | Histogram | bytes   | Size of the HTTP request body as sent by the client                                                                   |
| Application | `http.client.response.body.size`      | `http_client_response_body_size_bytes`        | Histogram | bytes   | Size of the HTTP response body as sent by the client                                                                  |
| Application | `http.server.request.duration`        | `http_server_request_duration_seconds`        | Histogram | seconds | Duration of HTTP service calls from the server side                                                                   |
| Application | `http.server.request.body.size`       | `http_server_request_body_size_bytes`         | Histogram | bytes   | Size of the HTTP request body as received at the server side                                                          |
| Application | `http.server.response.body.size`      | `http_server_response_body_size_bytes`        | Histogram | bytes   | Size of the HTTP response body as received at the server side                                                         |
| Application | `rpc.client.call.duration`            | `rpc_client_call_duration_seconds`            | Histogram | seconds | Duration of RPC service calls from the client side                                                                    |
| Application | `rpc.server.call.duration`            | `rpc_server_call_duration_seconds`            | Histogram | seconds | Duration of RPC service calls from the server side                                                                    |
| Application | `db.client.operation.duration`        | `db_client_operation_duration_seconds`        | Histogram | seconds | Duration of database client operations (Experimental)                                                                 |
| Application | `messaging.client.operation.duration` | `messaging_client_operation_duration_seconds` | Histogram | seconds | Duration of messaging client operations across supported systems such as Kafka, MQTT, NATS, and AMQP (Experimental)   |
| Application | `messaging.process.duration`          | `messaging_process_duration_seconds`          | Histogram | seconds | Duration of messaging process operations across supported systems such as Kafka, MQTT, NATS, and AMQP (Experimental)  |
| Application | `gen_ai.client.operation.duration`    | `gen_ai_client_operation_duration_seconds`    | Histogram | seconds | Duration of GenAI client operations (Experimental)                                                                    |
| Application | `gen_ai.client.token.usage`           | `gen_ai_client_token_usage`                   | Histogram | 1       | Number of GenAI input/output tokens consumed, labeled by token type (Experimental)                                    |
| Go runtime  | `go.memory.limit`                     | `go_memory_limit_bytes`                       | Gauge     | bytes   | Runtime memory limit configured for an instrumented Go service                                                        |
| Go runtime  | `go.memory.gc.cycles`                 | `go_memory_gc_cycles_total`                   | Counter   | cycles  | Completed Go garbage-collection cycles                                                                                |
| Go runtime  | `go.processor.limit`                  | `go_processor_limit`                          | Gauge     | threads | Current `GOMAXPROCS` value                                                                                            |
| Go runtime  | `go.config.gogc`                      | `go_config_gogc_percent`                      | Gauge     | percent | Current `GOGC` heap target percentage                                                                                 |
| JVM runtime | `jvm.memory.used`                     | `jvm_memory_used_bytes`                       | Gauge     | bytes   | Current JVM memory used, labeled by memory type and pool                                                              |
| JVM runtime | `jvm.memory.committed`                | `jvm_memory_committed_bytes`                  | Gauge     | bytes   | Current JVM memory committed, labeled by memory type and pool                                                         |
| JVM runtime | `jvm.memory.limit`                    | `jvm_memory_limit_bytes`                      | Gauge     | bytes   | Current JVM memory limit, labeled by memory type and pool                                                             |
| JVM runtime | `jvm.memory.used_after_last_gc`       | `jvm_memory_used_after_last_gc_bytes`         | Gauge     | bytes   | JVM memory used after the last garbage collection                                                                     |
| JVM runtime | `obi.jvm.heap.used`                   | `obi_jvm_heap_used_bytes`                     | Gauge     | bytes   | HotSpot heap used before or after garbage collection                                                                  |
| Network     | `obi.network.flow.bytes`              | `obi_network_flow_bytes_total`                | Counter   | bytes   | Bytes submitted from a source network endpoint to a destination network endpoint                                      |
| Network     | `obi.network.flow.packets`            | `obi_network_flow_packets_total`              | Counter   | packets | Packets observed from a source network endpoint to a destination network endpoint                                     |
| Network     | `obi.network.inter.zone.bytes`        | `obi_network_inter_zone_bytes_total`          | Counter   | bytes   | Bytes flowing between cloud availability zones in your cluster (Experimental, currently only available in Kubernetes) |
| Network     | `obi.stat.tcp.rtt`                    | `obi_stat_tcp_rtt_seconds`                    | Histogram | seconds | TCP round-trip time (RTT) latency observed between network endpoints (StatsO11y)                                      |
| Network     | `obi.stat.tcp.failed.connections`     | `obi_stat_tcp_failed_connections_total`       | Counter   | 1       | Failed TCP connection attempts between endpoints, labeled by failure reason (StatsO11y)                               |
| Network     | `obi.stat.tcp.retransmits`            | `obi_stat_tcp_retransmits_total`              | Counter   | 1       | TCP retransmissions observed per connection (StatsO11y)                                                               |
| Network     | `obi.stat.tcp.io`                     | `obi_stat_tcp_io_bytes_total`                 | Counter   | bytes   | Bytes transferred at the socket layer per TCP connection and I/O direction (StatsO11y)                                |

> [!NOTE]
>
> v0.10.0 adopts the OpenTelemetry semantic convention names
> `rpc.client.call.duration` and `rpc.server.call.duration`. The corresponding
> Prometheus metric names now include `_call_` as shown in the table.

OBI can also export
[Span metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector)
and
[Service graph metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector),
which you can enable via the [features](../configure/options/) configuration
option.

## Attributes of OBI metrics

For the sake of brevity, the metrics and attributes in this list use the OTel
`dot.notation`. When using the Prometheus exporter, the metrics use
`underscore_notation`.

In order to configure which attributes to show or which attributes to hide,
check the `attributes`->`select` section in the
[configuration documentation](../configure/options/).

| Metrics                               | Name                                                        | Default                                           |
| ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| Application (all)                     | `http.request.method`                                       | shown                                             |
| Application (all)                     | `http.response.status_code`                                 | shown                                             |
| Application (all)                     | `http.route`                                                | shown if `routes` configuration section exists    |
| Application (all)                     | `k8s.daemonset.name`                                        | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.deployment.name`                                       | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.namespace.name`                                        | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.node.name`                                             | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.owner.name`                                            | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.pod.name`                                              | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.container.name`                                        | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.pod.start_time`                                        | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.pod.uid`                                               | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.replicaset.name`                                       | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.statefulset.name`                                      | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `k8s.cluster.name`                                          | shown if Kubernetes metadata is enabled           |
| Application (all)                     | `container.id`                                              | shown if Docker metadata is enabled               |
| Application (all)                     | `container.name`                                            | shown if Docker metadata is enabled               |
| Application (all)                     | `cloud.provider`                                            | shown if cloud metadata is enabled                |
| Application (all)                     | `cloud.platform`                                            | shown if cloud metadata is enabled                |
| Application (all)                     | `cloud.region`                                              | shown if cloud metadata is enabled                |
| Application (all)                     | `cloud.account.id`                                          | shown if cloud metadata is enabled                |
| Application (all)                     | `cloud.availability_zone`                                   | shown if cloud metadata is enabled                |
| Application (all)                     | `cloud.resource_id`                                         | shown if cloud metadata is enabled (Azure only)   |
| Application (all)                     | `host.id`                                                   | shown if cloud metadata is enabled                |
| Application (all)                     | `host.type`                                                 | shown if cloud metadata is enabled                |
| Application (all)                     | `host.image.id`                                             | shown if cloud metadata is enabled (AWS only)     |
| Application (all)                     | `gcp.gce.instance.name`                                     | shown if cloud metadata is enabled (GCP only)     |
| Application (all)                     | `gcp.gce.instance.hostname`                                 | shown if cloud metadata is enabled (GCP only)     |
| Application (all)                     | `service.name`                                              | shown                                             |
| Application (all)                     | `service.namespace`                                         | shown                                             |
| Application (all)                     | `target.instance`                                           | shown                                             |
| Application (all)                     | `url.path`                                                  | hidden                                            |
| Application (client)                  | `server.address`                                            | hidden                                            |
| Application (client)                  | `server.port`                                               | hidden                                            |
| Application `rpc.*`                   | `rpc.response.status_code`                                  | shown                                             |
| Application `rpc.*`                   | `rpc.method`                                                | shown                                             |
| Application `rpc.*`                   | `rpc.system.name`                                           | shown                                             |
| Application (server)                  | `client.address`                                            | hidden                                            |
| `obi.network.flow.bytes`              | `obi.ip`                                                    | hidden                                            |
| `db.client.operation.duration`        | `db.operation.name`                                         | shown                                             |
| `db.client.operation.duration`        | `db.collection.name`                                        | hidden                                            |
| `messaging.client.operation.duration` | `messaging.system`                                          | shown                                             |
| `messaging.client.operation.duration` | `messaging.destination.name`                                | shown                                             |
| `messaging.process.duration`          | `messaging.system`                                          | shown                                             |
| `messaging.process.duration`          | `messaging.destination.name`                                | shown                                             |
| `obi.network.flow.bytes`              | `client.port`                                               | hidden                                            |
| `obi.network.flow.bytes`              | `direction`                                                 | hidden                                            |
| `obi.network.flow.bytes`              | `dst.address`                                               | hidden                                            |
| `obi.network.flow.bytes`              | `dst.cidr`                                                  | shown if the `cidrs` configuration section exists |
| `obi.network.flow.bytes`              | `dst.name`                                                  | hidden                                            |
| `obi.network.flow.bytes`              | `dst.port`                                                  | hidden                                            |
| `obi.network.flow.bytes`              | `dst.zone` (only Kubernetes)                                | hidden                                            |
| `obi.network.flow.bytes`              | `iface`                                                     | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.cluster.name`                                          | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`              | `k8s.dst.name`                                              | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.dst.namespace`                                         | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`              | `k8s.dst.node.ip`                                           | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.dst.node.name`                                         | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.dst.owner.type`                                        | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.dst.type`                                              | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.dst.owner.name`                                        | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`              | `k8s.src.name`                                              | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.src.namespace`                                         | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`              | `k8s.src.node.ip`                                           | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.src.owner.name`                                        | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`              | `k8s.src.owner.type`                                        | hidden                                            |
| `obi.network.flow.bytes`              | `k8s.src.type`                                              | hidden                                            |
| `obi.network.flow.bytes`              | `server.port`                                               | hidden                                            |
| `obi.network.flow.bytes`              | `src.address`                                               | hidden                                            |
| `obi.network.flow.bytes`              | `src.cidr`                                                  | shown if the `cidrs` configuration section exists |
| `obi.network.flow.bytes`              | `src.name`                                                  | hidden                                            |
| `obi.network.flow.bytes`              | `src.port`                                                  | hidden                                            |
| `obi.network.flow.bytes`              | `src.zone` (only Kubernetes)                                | hidden                                            |
| `obi.network.flow.bytes`              | `transport`                                                 | hidden                                            |
| `obi.network.flow.bytes`              | `network.type`                                              | hidden                                            |
| `obi.network.flow.bytes`              | `network.protocol.name`                                     | hidden                                            |
| `obi.network.flow.bytes`              | `src.country`                                               | shown if the `geoip` configuration section exists |
| `obi.network.flow.bytes`              | `src.asn`                                                   | shown if the `geoip` configuration section exists |
| `obi.network.flow.bytes`              | `dst.country`                                               | shown if the `geoip` configuration section exists |
| `obi.network.flow.bytes`              | `dst.asn`                                                   | shown if the `geoip` configuration section exists |
| `obi.stat.tcp.rtt`                    | `obi.ip`                                                    | hidden                                            |
| `obi.stat.tcp.rtt`                    | `src.address`                                               | hidden                                            |
| `obi.stat.tcp.rtt`                    | `dst.address`                                               | hidden                                            |
| `obi.stat.tcp.rtt`                    | `src.port`                                                  | hidden                                            |
| `obi.stat.tcp.rtt`                    | `dst.port`                                                  | hidden                                            |
| `obi.stat.tcp.rtt`                    | `src.name`                                                  | hidden                                            |
| `obi.stat.tcp.rtt`                    | `dst.name`                                                  | hidden                                            |
| `obi.stat.tcp.rtt`                    | `src.zone`                                                  | hidden                                            |
| `obi.stat.tcp.rtt`                    | `dst.zone`                                                  | hidden                                            |
| `obi.stat.tcp.rtt`                    | `network.tcp.handshake.role`                                | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `obi.ip`                                                    | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `src.address`                                               | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `dst.address`                                               | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `src.port`                                                  | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `dst.port`                                                  | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `src.name`                                                  | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `dst.name`                                                  | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `src.zone`                                                  | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `dst.zone`                                                  | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `reason`                                                    | hidden                                            |
| `obi.stat.tcp.failed.connections`     | `network.tcp.handshake.role`                                | hidden                                            |
| `obi.stat.tcp.retransmits`            | Source/destination address, port, name, and zone attributes | hidden                                            |
| `obi.stat.tcp.io`                     | Source/destination address, port, name, and zone attributes | hidden                                            |
| `obi.stat.tcp.io`                     | `network.io.direction`                                      | shown                                             |
| Traces (HTTP)                         | `url.query`                                                 | shown when a query string exists                  |
| Traces (GraphQL)                      | `graphql.document`                                          | hidden                                            |
| Traces (SQL, Redis)                   | `db.query.text`                                             | hidden                                            |

> [!NOTE]
>
> The `obi.network.inter.zone.bytes` metric supports the same set of attributes
> as `obi.network.flow.bytes`, but all of them are hidden by default, except
> `k8s.cluster.name`, `src.zone` and `dst.zone`.
>
> The `obi.network.flow.packets` metric supports the same attributes and
> defaults as `obi.network.flow.bytes`. JVM memory metrics include
> `jvm.memory.type` and `jvm.memory.pool.name`; `obi.jvm.heap.used` includes
> `jvm.gc.phase`.

## Internal metrics

OBI can be
[configured to report internal metrics](../configure/internal-metrics-reporter/)
in Prometheus Format.

| Name                                    | Type       | Description                                                                              |
| --------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `obi_ebpf_tracer_flushes`               | Histogram  | Length of the groups of traces flushed from the eBPF tracer to the next pipeline stage   |
| `obi_metric_exports_total`              | Counter    | Length of the metric batches submitted to the remote OTel collector                      |
| `obi_metric_export_errors_total`        | CounterVec | Error count on each failed OTel metric export, by error type                             |
| `obi_trace_exports_total`               | Counter    | Length of the trace batches submitted to the remote OTel collector                       |
| `obi_trace_export_errors_total`         | CounterVec | Error count on each failed OTel trace export, by error type                              |
| `obi_prometheus_http_requests_total`    | CounterVec | Number of requests towards the Prometheus Scrape endpoint, faceted by HTTP port and path |
| `obi_bpf_network_ignored_packets_total` | Counter    | Number of network packets dropped by OBI network filters before flow accounting          |
| `obi_instrumented_processes`            | GaugeVec   | Instrumented processes by OBI, with process name                                         |
| `obi_internal_build_info`               | GaugeVec   | Version information of the OBI binary, including the build time and commit hash          |
| `obi_avoided_services`                  | GaugeVec   | Services for which OBI suppressed telemetry after detecting OpenTelemetry SDK export     |
