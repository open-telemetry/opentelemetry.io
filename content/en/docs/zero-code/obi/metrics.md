---
title: OBI exported metrics
linkTitle: Exported metrics
description: Learn about the HTTP/gRPC metrics OBI can export.
weight: 21
cSpell:ignore: replicaset statefulset
---

The following table describes the exported metrics in both OpenTelemetry and
Prometheus format.

| Family      | Name (OTel)                      | Name (Prometheus)                      | Type      | Unit    | Description                                                                                                           |
| ----------- | -------------------------------- | -------------------------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| Application | `http.client.request.duration`   | `http_client_request_duration_seconds` | Histogram | seconds | Duration of HTTP service calls from the client side                                                                   |
| Application | `http.client.request.body.size`  | `http_client_request_body_size_bytes`  | Histogram | bytes   | Size of the HTTP request body as sent by the client                                                                   |
| Application | `http.client.response.body.size` | `http_client_response_body_size_bytes` | Histogram | bytes   | Size of the HTTP response body as sent by the client                                                                  |
| Application | `http.server.request.duration`   | `http_server_request_duration_seconds` | Histogram | seconds | Duration of HTTP service calls from the server side                                                                   |
| Application | `http.server.request.body.size`  | `http_server_request_body_size_bytes`  | Histogram | bytes   | Size of the HTTP request body as received at the server side                                                          |
| Application | `http.server.response.body.size` | `http_server_response_body_size_bytes` | Histogram | bytes   | Size of the HTTP response body as received at the server side                                                         |
| Application | `rpc.client.duration`            | `rpc_client_duration_seconds`          | Histogram | seconds | Duration of gRPC service calls from the client side                                                                   |
| Application | `rpc.server.duration`            | `rpc_server_duration_seconds`          | Histogram | seconds | Duration of RPC service calls from the server side                                                                    |
| Application | `sql.client.duration`            | `sql_client_duration_seconds`          | Histogram | seconds | Duration of SQL client operations (Experimental)                                                                      |
| Application | `redis.client.duration`          | `redis_client_duration_seconds`        | Histogram | seconds | Duration of Redis client operations (Experimental)                                                                    |
| Application | `messaging.publish.duration`     | `messaging_publish_duration`           | Histogram | seconds | Duration of Messaging (Kafka) publish operations (Experimental)                                                       |
| Application | `messaging.process.duration`     | `messaging_process_duration`           | Histogram | seconds | Duration of Messaging (Kafka) process operations (Experimental)                                                       |
| Network     | `obi.network.flow.bytes`         | `obi_network_flow_bytes`               | Counter   | bytes   | Bytes submitted from a source network endpoint to a destination network endpoint                                      |
| Network     | `obi.network.inter.zone.bytes`   | `obi_network_inter_zone_bytes`         | Counter   | bytes   | Bytes flowing between cloud availability zones in your cluster (Experimental, currently only available in Kubernetes) |

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

| Metrics                        | Name                         | Default                                           |
| ------------------------------ | ---------------------------- | ------------------------------------------------- |
| Application (all)              | `http.request.method`        | shown                                             |
| Application (all)              | `http.response.status_code`  | shown                                             |
| Application (all)              | `http.route`                 | shown if `routes` configuration section exists    |
| Application (all)              | `k8s.daemonset.name`         | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.deployment.name`        | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.namespace.name`         | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.node.name`              | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.owner.name`             | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.pod.name`               | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.container.name`         | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.pod.start_time`         | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.pod.uid`                | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.replicaset.name`        | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.statefulset.name`       | shown if Kubernetes metadata is enabled           |
| Application (all)              | `k8s.cluster.name`           | shown if Kubernetes metadata is enabled           |
| Application (all)              | `service.name`               | shown                                             |
| Application (all)              | `service.namespace`          | shown                                             |
| Application (all)              | `target.instance`            | shown                                             |
| Application (all)              | `url.path`                   | hidden                                            |
| Application (client)           | `server.address`             | hidden                                            |
| Application (client)           | `server.port`                | hidden                                            |
| Application `rpc.*`            | `rpc.grpc.status_code`       | shown                                             |
| Application `rpc.*`            | `rpc.method`                 | shown                                             |
| Application `rpc.*`            | `rpc.system`                 | shown                                             |
| Application (server)           | `client.address`             | hidden                                            |
| `obi.network.flow.bytes`       | `obi.ip`                     | hidden                                            |
| `db.client.operation.duration` | `db.operation.name`          | shown                                             |
| `db.client.operation.duration` | `db.collection.name`         | hidden                                            |
| `messaging.publish.duration`   | `messaging.system`           | shown                                             |
| `messaging.publish.duration`   | `messaging.destination.name` | shown                                             |
| `messaging.process.duration`   | `messaging.system`           | shown                                             |
| `messaging.process.duration`   | `messaging.destination.name` | shown                                             |
| `obi.network.flow.bytes`       | `client.port`                | hidden                                            |
| `obi.network.flow.bytes`       | `direction`                  | hidden                                            |
| `obi.network.flow.bytes`       | `dst.address`                | hidden                                            |
| `obi.network.flow.bytes`       | `dst.cidr`                   | shown if the `cidrs` configuration section exists |
| `obi.network.flow.bytes`       | `dst.name`                   | hidden                                            |
| `obi.network.flow.bytes`       | `dst.port`                   | hidden                                            |
| `obi.network.flow.bytes`       | `dst.zone` (only Kubernetes) | hidden                                            |
| `obi.network.flow.bytes`       | `iface`                      | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.cluster.name`           | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`       | `k8s.dst.name`               | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.dst.namespace`          | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`       | `k8s.dst.node.ip`            | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.dst.node.name`          | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.dst.owner.type`         | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.dst.type`               | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.dst.owner.name`         | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`       | `k8s.src.name`               | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.src.namespace`          | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`       | `k8s.src.node.ip`            | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.src.owner.name`         | shown if Kubernetes is enabled                    |
| `obi.network.flow.bytes`       | `k8s.src.owner.type`         | hidden                                            |
| `obi.network.flow.bytes`       | `k8s.src.type`               | hidden                                            |
| `obi.network.flow.bytes`       | `server.port`                | hidden                                            |
| `obi.network.flow.bytes`       | `src.address`                | hidden                                            |
| `obi.network.flow.bytes`       | `src.cidr`                   | shown if the `cidrs` configuration section exists |
| `obi.network.flow.bytes`       | `src.name`                   | hidden                                            |
| `obi.network.flow.bytes`       | `src.port`                   | hidden                                            |
| `obi.network.flow.bytes`       | `src.zone` (only Kubernetes) | hidden                                            |
| `obi.network.flow.bytes`       | `transport`                  | hidden                                            |
| Traces (SQL, Redis)            | `db.query.text`              | hidden                                            |

{{< alert type="note" >}} The `obi.network.inter.zone.bytes` metric supports the
same set of attributes as `obi.network.flow.bytes`, but all of them are hidden
by default, except `k8s.cluster.name`, `src.zone` and `dst.zone`. {{< /alert >}}

## Internal metrics

OBI can be
[configured to report internal metrics](../configure/internal-metrics-reporter/)
in Prometheus Format.

| Name                                 | Type       | Description                                                                              |
| ------------------------------------ | ---------- | ---------------------------------------------------------------------------------------- |
| `obi_ebpf_tracer_flushes`            | Histogram  | Length of the groups of traces flushed from the eBPF tracer to the next pipeline stage   |
| `obi_metric_exports_total`           | Counter    | Length of the metric batches submitted to the remote OTel collector                      |
| `obi_metric_export_errors_total`     | CounterVec | Error count on each failed OTel metric export, by error type                             |
| `obi_trace_exports_total`            | Counter    | Length of the trace batches submitted to the remote OTel collector                       |
| `obi_trace_export_errors_total`      | CounterVec | Error count on each failed OTel trace export, by error type                              |
| `obi_prometheus_http_requests_total` | CounterVec | Number of requests towards the Prometheus Scrape endpoint, faceted by HTTP port and path |
| `obi_instrumented_processes`         | GaugeVec   | Instrumented processes by OBI, with process name                                         |
| `obi_internal_build_info`            | GaugeVec   | Version information of the OBI binary, including the build time and commit hash          |
