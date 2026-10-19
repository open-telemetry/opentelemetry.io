---
title: OpenTelemetry eBPF Instrumentation
linkTitle: OBI
description:
  Learn how to use OpenTelemetry eBPF Instrumentation for automatic
  instrumentation.
weight: 3
cascade:
  OTEL_RESOURCE_ATTRIBUTES_APPLICATION: obi
  OTEL_RESOURCE_ATTRIBUTES_NAMESPACE: obi
  OTEL_RESOURCE_ATTRIBUTES_POD: obi
cSpell:ignore: Aerospike Ollama Qwen rerank SunRPC
---

OpenTelemetry libraries provide telemetry collection for popular programming
languages and frameworks. However, getting started with distributed tracing can
be complex. In some compiled languages like Go or Rust, you must manually add
tracepoints to the code.

OpenTelemetry eBPF Instrumentation (OBI) is an auto-instrumentation tool to
easily get started with Application Observability. OBI uses eBPF to
automatically inspect application executables and the OS networking layer, and
capture trace spans, Rate Errors Duration (RED) metrics, runtime metrics, and
application and network relationships for supported Linux workloads. All data
capture occurs without any modifications to application code or configuration.

OBI offers the following features:

- **Wide language support**: Java (JDK 8+), .NET, Go, Python, Ruby, Node.js, C,
  C++, and Rust
- **Lightweight**: No code changes required, no libraries to install, no
  restarts needed
- **Efficient instrumentation**: Traces and metrics are captured by eBPF probes
  with minimal overhead
- **Distributed tracing**: Distributed trace spans are captured and reported to
  a collector
- **Log enrichment**: Enrich JSON and plain-text logs with trace context for
  correlation
- **Kubernetes-native**: Provides configuration-free auto-instrumentation for
  Kubernetes applications
- **Visibility into encrypted communications**: Capture transactions over
  TLS/SSL without decryption
- **Context propagation**: Propagate trace context across services automatically
- **Protocol support (client and server)**: HTTP/S, HTTP/2, gRPC, Kafka, NATS,
  MQTT, Memcached, SunRPC (including NFS), and JSON-RPC
- **Protocol support (client only)**: AMQP 1.0 and DNS queries
- **Database instrumentation (client and server)**: PostgreSQL (including the
  pgx driver), MySQL, MSSQL, and Redis
- **Database instrumentation (client only)**: MongoDB, Couchbase (N1QL/SQL++ and
  KV protocol), Aerospike, Elasticsearch, and OpenSearch
- **HTTP payload instrumentation**: Server-side GraphQL and client-side
  Elasticsearch, OpenSearch, and AWS S3, SQS, and SNS, plus MCP over JSON-RPC on
  both clients and servers
- **GenAI instrumentation**: Trace and metrics for OpenAI, OpenAI-compatible
  gateways, Ollama, Anthropic Claude, Google AI Studio (Gemini), AWS Bedrock,
  Qwen (DashScope), MCP over JSON-RPC, embedding and rerank APIs, and vector
  retrieval systems
- **Runtime metrics**: Collect Go, JVM, .NET, Node.js, and Python runtime
  metrics without SDK changes
- **GPU instrumentation**: Capture supported CUDA runtime operations on Linux
- **Span and service graph metrics**: Export application span metrics and
  service-to-service relationships
- **Low cardinality metrics**: Prometheus-compatible metrics with low
  cardinality for cost reduction
- **Network observability**: Capture network flows between services with byte
  and packet counters, TCP RTT, retransmit, connection, and socket I/O metrics
- **Enhanced service discovery**: Improved service name lookup with DNS
  resolution
- **Collector integration**: Run OBI as an OpenTelemetry Collector receiver
  component

## Recent highlights (v0.15.2)

OBI v0.15.2 supersedes the unpublished v0.15.0 and v0.15.1 releases. It includes
the intended v0.15.0 changes, a BPF verifier correction, and a release artifact
build correction. Install v0.15.2 when upgrading from v0.14.0.

- **Go manual spans**: Captures spans through the Auto SDK embedded in the Go
  Trace API, without requiring the separate Auto SDK module
- **.NET instrumentation**: Expands route harvesting and adds CPU and
  last-collection heap-size metrics
- **Endpoint names**: Adds opt-in AWS Route53 hosted-zone name resolution
- **Config v2**: Selects metric families explicitly and applies protocol metric
  switches to span metrics and service graphs
- **Collector integration**: Publishes the receiver as a separate Go module
  while preserving its import path
- **Correctness fixes**: Prevents HTTP/2 context injection into misclassified
  sockets, separates colliding metric-label tuples, corrects duplicate
  `target.info` counts, and fixes OTLP/HTTP JSON trace encoding

Review the [v0.15.2 upgrade notes](#upgrade-notes-for-v0152) and
[release notes](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.15.2)
for changes that affect dashboards, metric cardinality, and trace processing.

If you want to explore the upstream examples, see the
[NGINX walkthrough](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.15.2/examples/nginx)
and the
[Apache walkthrough](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v0.15.2/examples/apache).

## Upgrade notes for v0.15.2

- Build Collector distributions with the `go.opentelemetry.io/obi/collector`
  module at `v0.15.2`. The root module no longer contains the receiver package.
  See [Collector receiver setup](configure/collector-receiver/) for the updated
  module replacements and component versions. Go embedders must also replace the
  removed `PrometheusConfig.Registry` field with a Prometheus HTTP port
  configuration.
- Config v2 protocol `enabled.metrics: false` now also suppresses that
  protocol's span metrics and service graphs. Traces remain independently
  configurable. Review the migration report when Config v1 instrumentation lists
  and derived metric coverage differ. See
  [metric feature selection](configure/config-v2/#metric-feature-selection).
- HTTP client `server.address` values omit the Host header's port; `server.port`
  and `url.full` retain it. Kubernetes Service hosts with ports now resolve to
  the service and namespace, which can change service graph names.
- gRPC span names and `rpc.method` values omit the leading slash. Invalid or
  unread paths use span name `grpc` and method `_OTHER`; `rpc.method_original`
  preserves a captured raw path. ONC RPC uses `{program}/{procedure}` methods
  only when a CALL was captured and reports response status only with a REPLY.
- GenAI, database, GraphQL, AWS S3/SQS, and ONC RPC span names change to follow
  semantic conventions. For example, Anthropic `message` becomes `chat`, GraphQL
  server names omit `GraphQL`, and S3/SQS names use `S3.`/`SQS.` prefixes.
  Update span-name filters and span-metric queries.
- Database duration metrics include `db.collection.name` by default. RPC client
  duration adds `server.port`, and failed RPC server duration adds `error.type`.
  Messaging client duration adds `messaging.operation.type`; client and process
  durations include subscription names when present. These defaults can split
  metric series. See [metric attributes](metrics/#attributes-of-obi-metrics).
- MQTT SUBSCRIBE telemetry uses `messaging.destination.subscription.name`
  instead of destination name and omits the filter from span names. Shared
  subscriptions also report `messaging.consumer.group.name`. AWS SNS spans no
  longer include `rpc.system.name` or `rpc.method`.
- GraphQL, MCP, and JSON-RPC server spans no longer carry HTTP method, status,
  route, URL, body-size, user-agent, or OBI response-observation attributes.
  Captured HTTP headers are limited to plain HTTP and GraphQL spans. OTLP GenAI
  metrics omit missing request models, and AMQP metrics omit empty destinations.
- The telemetry schema advances to `0.15.2`, retaining earlier transformations.
  The telemetry registry uses Weaver `definition/2`; span reference IDs no
  longer have a `span.` prefix, so update links to old catalog anchors.

When upgrading from a release older than v0.14.0, also review the earlier
changes below. The release notes describe additional protocol-specific naming
and attribute changes.

## Upgrade notes for v0.14.0

- HTTP duration and body-size metrics now include `error.type` by default on
  failed requests. Their Prometheus series gain an `error_type` label, with an
  empty value on successful requests. Review dashboards and alert queries that
  depend on the old series.
- The OTLP span metrics no longer copy `host.id` to each data point. The value
  remains a resource attribute and in `target_info`; OBI's Prometheus exporter
  is unchanged. Consumers that flatten OTLP resources into Prometheus labels
  should check their `host_id` queries.
- `service.peer.name`, `http.request.body.size`, `http.response.body.size`, and
  `obi.http.response.observed` are now opt-in span attributes. Select them with
  [`attributes.select.traces.include`](configure/metrics-traces-attributes/)
  when needed; service graph processors may need `service.peer.name`.
- The pinned `traces_ctx_v1` map is no longer populated by default. External
  trace-profile correlation and the Go channel handoff fallback can be restored
  with
  [`ebpf.populate_trace_context: true`](configure/metrics-traces-attributes/).
- Target declarations still take precedence over resource metadata. Resolved
  target metadata now takes precedence over the agent's own
  `OTEL_RESOURCE_ATTRIBUTES`, with values merged per key.
- Elastic Cloud client spans and database-operation metrics now include
  `db.namespace` from `X-Found-Handling-Cluster`. Existing metric series may
  split by cluster. AWS SQS spans no longer include `aws.extended_request_id`.

## How OBI works

The following diagram shows the high-level OBI architecture and where eBPF
instrumentation fits into the telemetry pipeline.

![OBI eBPF architecture](./ebpf-arch.svg)

## Compatibility

OBI supports Linux environments that meet the following requirements:

| Requirement      | Supported                                                             |
| :--------------- | :-------------------------------------------------------------------- |
| CPU architecture | `amd64`, `arm64`                                                      |
| Linux kernel     | `5.8+`, or RHEL-family Linux `4.18+` with the required eBPF backports |
| Kernel features  | BTF                                                                   |
| Privileges       | Root, or the Linux capabilities required by the enabled OBI features  |

OBI publishes the following supported release artifacts:

| Artifact                                            | Supported platforms          |
| :-------------------------------------------------- | :--------------------------- |
| `obi` binary archive                                | Linux `amd64`, Linux `arm64` |
| `otel/ebpf-instrument` container image              | Linux `amd64`, Linux `arm64` |
| `otel/opentelemetry-ebpf-k8s-cache` container image | Linux `amd64`, Linux `arm64` |

OBI can be deployed on standalone Linux hosts, in containers, and on Kubernetes
when the environment meets the requirements above.

OBI does not support non-Linux operating systems, Linux architectures other than
`amd64` and `arm64`, Linux environments without BTF, or kernel versions earlier
than Linux `5.8` outside the documented RHEL-family `4.18+` exception.

Feature-specific support details are documented in these guides:

- [Distributed traces](distributed-traces/): context propagation support,
  runtime-specific requirements, and distributed tracing limitations
- [Trace context association](context-propagation/): parent-child association
  support for asynchronous and threaded request handling
- [Export data](configure/export-data/): protocol, database, messaging, GenAI,
  GPU, and Go library instrumentation support

## Limitations

OBI provides application and protocol observability without code changes, but it
does not replace language-level instrumentation in every scenario. Use language
agents or manual instrumentation when you need custom spans,
application-specific attributes, business events, or other in-process telemetry
that eBPF-based instrumentation cannot derive automatically.

OBI can automatically capture network and protocol activity, but it cannot
always recover application-specific details that are not visible from eBPF
observation points.

Some features also have additional caveats or narrower support than the core
platform requirements. For details, refer to the feature-specific documentation
for [distributed traces](distributed-traces/) and
[exported instrumentation](configure/export-data/).

For a comprehensive list of capabilities required by OBI, refer to
[Security, permissions and capabilities](security/).

## Get started with OBI

- Follow the [setup](setup/) documentation to get started with OBI either with
  Docker or Kubernetes.
- Learn about [trace-log correlation](./trace-log-correlation/) to connect
  traces with application logs and enrich JSON logs with trace context.
- Discover how to run
  [OBI as a Collector receiver](./configure/collector-receiver/) for centralized
  telemetry processing.

## Troubleshooting

- See the [troubleshooting](./troubleshooting) guide for help with common
  issues.
