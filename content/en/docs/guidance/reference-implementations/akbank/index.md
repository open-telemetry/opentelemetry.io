---
title: 'Akbank: OpenTelemetry across an on-premises banking platform'
linkTitle: Akbank
# prettier-ignore
cSpell:ignore: Akbank Cenk sattributes spanmetrics Çil cilcenk Coremetry CoSRE cosretr KEDA Mimir OperatorHub Thanos WildFly
---

By [Cenk Çil](https://github.com/cilcenk) (Akbank) | October 20, 2026

Akbank is one of Turkey's largest private banks. Its digital channels — mobile
and internet banking, branch systems, lending and payments — run on thousands of
services across several on-premises OpenShift clusters in multiple regions. The
estate mixes Java applications on JBoss EAP / WildFly and Spring, .NET services,
and applications bought from third-party vendors whose code the bank cannot
change or rebuild.

Banking regulation shapes every observability decision: telemetry contains
customer and transaction context, so every component — collection, storage and
analysis — runs inside the bank's own network.

## Organizational structure

Akbank has around 2,000 developers. Observability is owned centrally by the SRE
team: it runs the OpenTelemetry Operator, the Collector tiers and Coremetry, and
owns the instrumentation defaults. Application teams get traces, metrics and
correlated logs without changing their code; vendor and .NET workloads are
onboarded with a pod annotation.

## Environment and scale

| Dimension                | Details                                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Infrastructure           | On-premises Red Hat OpenShift, tens of clusters across multiple regions                                                 |
| Languages instrumented   | Java (JBoss EAP / WildFly, Spring), .NET, third-party vendor applications                                               |
| Number of services       | Thousands                                                                                                               |
| Scale                    | Billions of spans per day, even after tail sampling                                                                     |
| Collector fleet          | Per cluster: a DaemonSet agent on every node, ~20 load-balancing and ~30 gateway pods                                   |
| Observability backend(s) | Grafana Tempo, Grafana Mimir, Prometheus, Thanos, Elastic APM, Elasticsearch (logs), Coremetry (Apache-2.0, ClickHouse) |

## Why OpenTelemetry

Before OpenTelemetry, telemetry at the bank was split across tools that did not
share identifiers: application logs in Elasticsearch, metrics in a separate
stack, and tracing in only a few teams. Incident calls often started with "which
system has the data?" rather than "what is broken?".

We wanted three things:

- One wire format for traces, metrics and logs, so that instrumentation in
  thousands of applications would not be tied to any one backend.
- Trace context everywhere, including in places a bank cannot change quickly —
  legacy application servers, vendor applications and Oracle application error
  tables.
- Components that can all run on-premises.

OpenTelemetry gave us the first two through zero-code instrumentation and OTLP,
and the third because every component runs inside our own clusters.

## OpenTelemetry components in use

### SDKs and instrumentation

Instrumentation is a combination of zero-code auto-instrumentation and manual
instrumentation:

- **Java:** the OpenTelemetry Java agent on JBoss EAP / WildFly and Spring
  applications, with no code changes in the first phase. HTTP servers and
  clients, JDBC, JMS and Kafka are covered by the agent's instrumentations.
- **.NET and vendor applications:** zero-code auto-instrumentation injected by
  the OpenTelemetry Operator through an `Instrumentation` resource and a pod
  annotation. This is what let us cover applications we cannot rebuild without
  asking every vendor for a code change.
- **Manual instrumentation:** where the business flow is invisible to
  auto-instrumentation — batch jobs, message consumers, internal steps of a long
  transaction — teams add spans and attributes with the OpenTelemetry API on top
  of the agent.
- **Resource attributes:** `service.name`, `service.namespace`,
  `service.version`, `deployment.environment.name` and the `k8s.*` attributes
  are set consistently, so every signal can be attributed to a team, a cluster
  and a release.
- **Log correlation:** the Java agent injects `trace_id` and `span_id` into the
  logging context, so every log line can be joined with its trace — even when
  the trace itself was not sampled.

### OpenTelemetry Collector

Every cluster runs three Collector roles:

1. **Agent** — a DaemonSet on every node. Applications send OTLP to a node-local
   endpoint. The agent does the work that is cheapest close to the source:
   - drops noise spans (health, readiness and liveness checks, actuator, metrics
     scrapes, Swagger, favicon) before they cross the network;
   - adds Kubernetes metadata with `k8sattributes` (pod, node, namespace,
     deployment, container image and tag) and copies two **team ownership pod
     labels** — the development team and the SRE team — onto every span, which
     is how every trace is attributed to a team;
   - deletes `process.command_line` / `process.command_args`, which can carry
     secrets;
   - extracts business codes (function code, channel code) from the Kafka
     message key into span attributes.
2. **Load-balancing tier** — a Deployment running the `loadbalancing` exporter
   with `routing_key: traceID` and the `k8s` resolver on the gateway's headless
   Service, so every span of a trace, whichever node and service produced it,
   reaches the same gateway pod.
3. **Gateway** — a Deployment that sees each trace complete. It derives span
   metrics, applies tail sampling per backend, drops high-cardinality attributes
   and exports.

Only traces need trace-aware routing, so metrics go from the agents straight to
the gateway tier. The agents also send the HTTP and RPC server metrics
(`http.server.request.*`, `rpc.server.*`) to Thanos, where KEDA reads them to
autoscale workloads on request rate. Logs do not pass through the Collectors:
they keep flowing to Elasticsearch through the existing log pipeline, and the
`trace_id` the Java agent puts into every log line is what joins them with
traces.

Applications only ever know their node-local endpoint, so sampling, processing
and export settings change in one place without touching thousands of
deployments.

### OpenTelemetry Operator

The Operator is installed with its Helm chart (OperatorHub is also an option on
OpenShift). It manages auto-instrumentation injection for .NET and vendor
workloads. The Collectors themselves are deployed with the OpenTelemetry
Collector Helm chart.

### Other components

**Coremetry** is the OpenTelemetry-native APM the bank built on top of this
pipeline and released under the Apache-2.0 license
([github.com/cosretr/coremetry](https://github.com/cosretr/coremetry)). It reads
OTLP data and relies on the semantic conventions directly — for example
`http.request.method`, `http.route` and `http.response.status_code` on spans and
the `http.server.request.duration` histogram — so the numbers on a trace and on
a metrics view agree. Its SRE assistant, CoSRE, runs on a local open-weight LLM,
so no telemetry leaves the bank.

## Architecture

```mermaid
graph LR
  subgraph Workloads
    J[Java services<br/>OTel Java agent]
    N[.NET and vendor apps<br/>Operator-injected]
  end
  subgraph Per node
    A[Agent Collector<br/>DaemonSet]
  end
  subgraph Per cluster
    LB[Load-balancing Collectors<br/>route by trace ID]
    G[Gateway Collectors<br/>span metrics +<br/>per-backend tail sampling]
  end
  J -->|OTLP| A
  N -->|OTLP| A
  A -->|traces| LB
  LB -->|traces| G
  A -->|metrics| G
  A -->|HTTP / RPC metrics| K[(Thanos<br/>KEDA autoscaling)]
  G -->|traces| T[(Grafana Tempo)]
  G -->|traces| EA[(Elastic APM)]
  G -->|traces + metrics| C[(Coremetry<br/>ClickHouse)]
  G -->|metrics| M[(Grafana Mimir /<br/>Prometheus)]
  J -.->|logs with trace_id<br/>existing log pipeline| E[(Elasticsearch<br/>logs)]
  N -.-> E
  T -.->|trace fallback| C
  E -.->|logs by trace_id| C
```

Each trace backend receives its own sampled stream (see below). When an engineer
follows a trace ID from a log line or an Oracle error row, Coremetry looks in
its own ClickHouse store first and falls back to Tempo, which keeps a fuller set
of traces.

### Deployment and lifecycle management

The SRE team deploys the OpenTelemetry Operator and all three Collector tiers
with Helm charts, rolled out to every OpenShift cluster through GitOps with Argo
CD. A sampling, processing or export change is a pull request to the GitOps
repository; Argo CD applies it cluster by cluster, and no application deployment
is touched. Collector and agent versions are upgraded monthly, through the same
GitOps flow: the new image tag is a pull request, and Argo CD rolls it out
cluster by cluster.

### Sampling and data governance

Sampling is tail-based and happens only at the gateway tier. Because the
load-balancing tier routes by trace ID, each keep-or-drop decision is made once
per complete trace, never per fragment.

Different backends need different shares of the data, so the gateway does not
sample once. Incoming traces enter a single pipeline that ends in a `forward`
connector; from there they fan out to one pipeline per backend, each with its
own `tail_sampling` processor:

- **Coremetry:** traces with an error are always kept, plus a 5% probabilistic
  share; one known noisy service is dropped.
- **Elastic APM:** errors plus 10%.
- **Grafana Tempo:** most services at 100%; the highest-volume mobile-path
  services at 10% plus all errors; a batch service family only when it writes
  (`db.operation = UPDATE`); non-error traces from a group of noisy external
  hosts are dropped.

**Span metrics before sampling.** The same `forward` connector also feeds
`spanmetrics` connectors, which compute request-rate, error and duration
histograms (`http.request.method`, `http.response.status_code`, `http.route`,
`server.address`) from **every** span, before any sampling decision. Dashboards
and alerts therefore stay accurate even though only a fraction of traces is
stored. Separate `spanmetrics` instances with their own dimensions serve teams
that need extra ones (for example `db.name` for one domain), using filter
processors to keep each one's input small.

**Cardinality and volume.** The gateway removes `service.instance.id`,
`messaging.kafka.message.offset` and `thread.id` before export, and a `routing`
connector sends metrics to the right metrics backend by `service.name`. Every
tier runs `memory_limiter` before `batch`.

Two things fill the gap left by unsampled traces:

- **Logs keyed by trace ID.** Log lines carry `trace_id` whether or not the
  trace was kept, so logs are looked up by trace ID first and span presence is
  treated as optional.
- **Oracle application error tables.** Many applications write business and
  technical errors into Oracle tables. Once the trace ID was added to those
  rows, an error code could be followed to the exact request, its spans and its
  logs.

## Configuration

### SDK configuration

A representative `Instrumentation` resource for the Operator-injected .NET and
vendor workloads (simplified, not the production manifest). Java services use
the OpenTelemetry Java agent with the same exporter endpoint and propagators.

```yaml
# Zero-code instrumentation for .NET and vendor workloads, injected by the Operator.
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: default
spec:
  exporter:
    endpoint: http://$(OTEL_NODE_IP):4318 # node-local agent Collector
  propagators: [tracecontext, baggage]
  resource:
    addK8sUIDAttributes: true
```

### Collector configuration

The excerpts below are trimmed from the production Helm values (OpenTelemetry
Collector Contrib 0.146.0). Endpoints and service names are replaced with
placeholders; receivers, `health_check`, self-telemetry and duplicate pipelines
are left out.

#### Agent (DaemonSet)

```yaml
mode: daemonset
config:
  processors:
    memory_limiter:
      { check_interval: 5s, limit_percentage: 80, spike_limit_percentage: 25 }
    filter/noise: # drop health / scrape noise at the node
      error_mode: ignore
      traces:
        span:
          - IsMatch(attributes["http.route"], ".*(health|actuator|metrics).*")
          - IsMatch(attributes["url.path"],
            ".*(actuator|metrics|prometheus|swagger|favicon).*")
    resource/delete: # command lines can carry secrets
      attributes:
        - { key: process.command_line, action: delete }
        - { key: process.command_args, action: delete }
    attributes/kafka_key: # business codes from the Kafka message key
      actions:
        - key: messaging.kafka.message.key
          pattern: ^(?P<function_code>[^|]+)
          action: extract
    k8sattributes:
      extract:
        metadata:
          [
            k8s.pod.name,
            k8s.node.name,
            k8s.namespace.name,
            k8s.deployment.name,
            container.image.name,
            container.image.tag,
          ]
        labels: # team ownership on every span
          - { tag_name: dev-team, key: dev-team, from: pod }
          - { tag_name: sre-team, key: sre-team, from: pod }
    batch: { send_batch_size: 4096, send_batch_max_size: 32768, timeout: 5s }
  exporters:
    otlphttp/lb: # traces → load-balancing tier
      endpoint: ${env:LB_COLLECTOR_ENDPOINT}
      sending_queue: { enabled: true, num_consumers: 10, queue_size: 500000 }
    otlphttp/gateway: # metrics → gateway directly
      endpoint: ${env:GATEWAY_COLLECTOR_ENDPOINT}
      sending_queue: { enabled: true, num_consumers: 10, queue_size: 500000 }
    otlphttp/keda: # HTTP/RPC server metrics for KEDA autoscaling
      metrics_endpoint: https://thanos-receive.example.internal/api/v1/otlp
  service:
    pipelines:
      traces:
        receivers: [otlp]
        processors:
          [
            memory_limiter,
            filter/noise,
            resource/delete,
            attributes/kafka_key,
            k8sattributes,
            batch,
          ]
        exporters: [otlphttp/lb]
      metrics:
        receivers: [otlp]
        processors: [memory_limiter, resource/delete, batch]
        exporters: [otlphttp/gateway]
```

#### Load-balancing tier (Deployment)

```yaml
mode: deployment
config:
  exporters:
    loadbalancing/traces:
      routing_key: traceID # all spans of a trace → same gateway pod
      protocol:
        otlp:
          tls: { insecure: true }
          timeout: 15s
          sending_queue: { enabled: true, num_consumers: 20, queue_size: 3000 }
          retry_on_failure:
            {
              enabled: true,
              initial_interval: 5s,
              max_interval: 30s,
              max_elapsed_time: 60s,
            }
      resolver:
        k8s:
          service: otel-gateway-collector-headless
          ports: [4317]
  processors:
    memory_limiter:
      { check_interval: 1s, limit_percentage: 85, spike_limit_percentage: 25 }
    batch: { send_batch_size: 2048, send_batch_max_size: 4096, timeout: 5s }
  service:
    pipelines:
      traces:
        receivers: [otlp]
        processors: [memory_limiter, batch]
        exporters: [loadbalancing/traces]
```

#### Gateway (Deployment)

```yaml
mode: deployment
config:
  connectors:
    forward/traces: {} # one input, fan-out to per-backend pipelines
    spanmetrics: # RED metrics from 100% of spans, before sampling
      histogram:
        explicit:
          { buckets: [5ms, 10ms, 50ms, 100ms, 250ms, 500ms, 1s, 2s, 5s, 10s] }
        unit: s
      dimensions:
        - { name: http.request.method, default: GET }
        - name: http.response.status_code
        - name: http.route
        - name: server.address
      exemplars: { enabled: true }
      metrics_flush_interval: 60s
      metrics_expiration: 15m
  processors:
    memory_limiter:
      { check_interval: 5s, limit_percentage: 80, spike_limit_percentage: 25 }
    resource/drop:
      { attributes: [{ key: service.instance.id, action: delete }] }
    attributes/drop:
      actions:
        - { key: messaging.kafka.message.offset, action: delete }
        - { key: thread.id, action: delete }
    tail_sampling/coremetry:
      decision_wait: 15s
      num_traces: 200000
      policies:
        - {
            name: errors,
            type: status_code,
            status_code: { status_codes: [ERROR] },
          }
        - {
            name: baseline,
            type: probabilistic,
            probabilistic: { sampling_percentage: 5 },
          }
    tail_sampling/tempo:
      decision_wait: 15s
      num_traces: 200000
      policies:
        - name: hot-path-10pct # highest-volume mobile-path services
          type: and
          and:
            and_sub_policy:
              - {
                  name: hot-path,
                  type: string_attribute,
                  string_attribute:
                    {
                      key: service.name,
                      values: ['mobile-.*'],
                      enabled_regex_matching: true,
                    },
                }
              - {
                  name: ten-pct,
                  type: probabilistic,
                  probabilistic: { sampling_percentage: 10 },
                }
        - name: hot-path-errors
          type: and
          and:
            and_sub_policy:
              - {
                  name: hot-path,
                  type: string_attribute,
                  string_attribute:
                    {
                      key: service.name,
                      values: ['mobile-.*'],
                      enabled_regex_matching: true,
                    },
                }
              - {
                  name: errors,
                  type: status_code,
                  status_code: { status_codes: [ERROR] },
                }
        - name: everything-else # all other services at 100%
          type: string_attribute
          string_attribute:
            {
              key: service.name,
              values: ['mobile-.*'],
              enabled_regex_matching: true,
              invert_match: true,
            }
    batch: { send_batch_size: 8192, send_batch_max_size: 16384, timeout: 10s }
  exporters:
    otlp/coremetry:
      endpoint: dns:///coremetry-ingest-headless.coremetry.svc.cluster.local:4317
      balancer_name: round_robin # client-side gRPC balancing across ingest pods
      tls: { insecure: true }
    otlp/tempo:
      endpoint: tempo-distributor.tempo.svc.cluster.local:4317
      sending_queue: { enabled: true, num_consumers: 10, queue_size: 500000 }
      tls: { insecure: true }
    otlphttp/mimir:
      metrics_endpoint: https://mimir.example.internal/otlp/v1/metrics
  service:
    pipelines:
      traces/in:
        receivers: [otlp]
        processors: [memory_limiter]
        exporters: [forward/traces]
      traces/coremetry:
        receivers: [forward/traces]
        processors:
          [tail_sampling/coremetry, resource/drop, attributes/drop, batch]
        exporters: [otlp/coremetry]
      traces/tempo:
        receivers: [forward/traces]
        processors: [tail_sampling/tempo, resource/drop, attributes/drop, batch]
        exporters: [otlp/tempo]
      traces/spanmetrics:
        receivers: [forward/traces]
        exporters: [spanmetrics]
      metrics/spanmetrics:
        receivers: [spanmetrics]
        processors: [memory_limiter, resource/drop, batch]
        exporters: [otlphttp/mimir, otlp/coremetry]
      metrics:
        receivers: [otlp]
        processors: [memory_limiter, resource/drop, batch]
        exporters: [otlphttp/mimir, otlp/coremetry]
```

## Lessons and pain points

- **Compute span metrics before sampling.** Once traces are sampled per backend,
  RED metrics derived after sampling would be wrong. Running `spanmetrics` on
  the unsampled stream behind a `forward` connector kept dashboards and alerts
  accurate.
- **One sampling policy does not fit every backend.** A `forward` connector with
  one pipeline per backend let each store keep the share it needs — full traces
  in Tempo, errors plus a small baseline elsewhere.
- **Tail sampling needs trace-aware load balancing.** Spans of one trace come
  from many services on many nodes. Without routing by trace ID they land on
  different gateway pods, and each pod decides on a fragment.
- **Sampling must be visible to engineers.** People need to know when a trace
  was not kept; logs and error tables keyed by trace ID fill the gap.
- **Semantic convention migrations move dashboards.** Moving from
  `http.server.duration` to `http.server.request.duration` changed metric names
  underneath existing views; we handled both during the migration.

## Advice for others

Based on Akbank's experience, a few lessons stand out:

- Start with zero-code instrumentation, and add manual spans only where the
  business flow is invisible (batch jobs, message consumers).
- Use the Operator for code you don't own: vendor and .NET applications joined
  the same traces as our own Java services without a code change on their side.
- Put a gateway between applications and backends, so every processing or export
  change happens in Collector configuration rather than in application
  deployments.
- Agree on resource attributes early; `service.name` conventions and
  `deployment.environment.name` saved more time than any dashboard.
- Drop noise (health checks, scrape endpoints) and secret-bearing attributes at
  the node agent, before they cost network, memory and storage.
- Put team ownership on every span from pod labels with `k8sattributes`; it
  makes per-team views possible without asking teams to change their code.
- Propagate trace context into every place an engineer looks — logs and error
  tables — not only into the tracing backend.

## What's next

- **Mobile observability.** Most customers reach the bank through the mobile
  app. We want a tap in the app and the backend trace it causes to be one
  end-to-end view.
- **Profiling.** We plan to adopt the OpenTelemetry profiling signal, so CPU and
  memory profiles carry the same resource attributes as traces and can be opened
  from a slow span.
