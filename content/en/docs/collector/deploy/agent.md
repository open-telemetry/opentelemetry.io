---
title: Agent deployment pattern
linkTitle: Agent pattern
description: Send signals to Collectors and then export to backends
aliases: [/docs/collector/deployment/agent]
weight: 200
cSpell:ignore: prometheusremotewrite
---

In the agent deployment pattern, telemetry signals can come from

- Applications [instrumented][instrumentation] with an OpenTelemetry SDK using
  the [OpenTelemetry Protocol (OTLP)][otlp].
- Collectors using the OTLP exporter.

The signals are sent to a [Collector][collector] instance that runs alongside
the application or on the same host, such as a sidecar or DaemonSet.

Each client-side SDK or downstream Collector is configured with the address of a
Collector instance:

![Decentralized collector deployment concept](../../img/otel-agent-sdk.svg)

1. In the application, the SDK is configured to send OTLP data to a Collector.
1. The Collector is configured to send telemetry data to one or more backends.

## Example

In this example of the agent deployment pattern, begin by manually instrumenting
a [Java application to export metrics][instrument-java-metrics] using the
OpenTelemetry Java SDK, including the default `OTEL_METRICS_EXPORTER` value,
`otlp`. Next, configure the [OTLP exporter][otlp-exporter] with the address of
your Collector. For example:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

Next, configure the Collector running at `collector.example.com:4318` as
follows:

{{< tabpane text=true >}} {{% tab Traces %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending traces to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/jaeger: # Jaeger supports OTLP directly
    endpoint: https://jaeger.example.com:4317
    sending_queue:
      batch:

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Metrics %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending metrics to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  prometheusremotewrite: # the PRW exporter, to ingest metrics to backend
    endpoint: https://prw.example.com/v1/api/remote_write
    sending_queue:
      batch:

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      exporters: [prometheusremotewrite]
```

{{% /tab %}} {{% tab Logs %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending logs to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  file: # the File Exporter, to ingest logs to local file
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

To explore this pattern end to end, see the [Java][java-otlp-example] or
[Python][py-otlp-example] examples.

## Trade-offs

Here are the key pros and cons of using an agent collector:

Pros:

- Straightforward to get started
- Clear one-to-one mapping between application and Collector

Cons:

- Limited scalability for teams and infrastructure resources
- Inflexible for complex or evolving deployments

## Kubernetes DaemonSet

Running the OpenTelemetry Collector as a Kubernetes
[DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)
is one of the most common agent deployment patterns. A DaemonSet ensures one
Collector pod runs on each node, collecting telemetry from all workloads on that
node.

While this pattern is straightforward to set up, it introduces specific failure
modes that can lead to data loss or cascading failures during traffic spikes,
node pressure, or rolling updates. This section describes those failure modes
and provides recommendations for building a resilient DaemonSet deployment.

### How DaemonSet deployments fail

Because a single Collector serves every workload on the node, DaemonSets
concentrate more load than a sidecar and are subject to the same failure modes
as any Collector running under pressure. For generic guidance on memory
pressure, back-pressure, resource tuning, graceful shutdown, and monitoring, see
[Resiliency](/docs/collector/resiliency/). The subsections below cover the
failure modes that are specific to the DaemonSet pattern.

#### Node-scoped blast radius

Because a DaemonSet runs exactly one Collector per node, a single Collector
failure affects **all** workloads on that node. Unlike the sidecar pattern,
where a failure only impacts one application, a DaemonSet failure creates a
node-wide telemetry gap.

#### Noisy neighbors

A single application that suddenly emits a large volume of telemetry can consume
the Collector's resources on that node, starving other applications. The
Collector does not currently enforce fairness across clients of a receiver, so
one chatty producer can degrade telemetry collection for all others on the same
node. There is also no built-in per-client rate limiting; the Collector expects
an external load balancer to handle rate limiting when needed.

#### Rolling update gaps

During a rolling update of the DaemonSet, the old Collector pod terminates
before the new pod is ready. Any telemetry generated during this transition
window is lost unless applications buffer locally or retry.

### When to consider alternatives

A DaemonSet is not always the best choice. Consider these alternatives when:

- **Isolation is critical**: Use the
  [sidecar pattern](/docs/collector/scaling/#scaling-stateless-collectors-and-using-load-balancers)
  when you need per-application isolation, so that one application's telemetry
  spike cannot affect another.
- **Processing is heavy**: Offload processors like `tail_sampling` or
  `transform` to a [Gateway tier](/docs/collector/deploy/gateway/) and keep the
  DaemonSet Collector lightweight (receive + forward only).
- **High pod-to-node ratio**: When you have many small pods per node, a
  DaemonSet works well. When you have a few large pods, a sidecar avoids the
  blast radius problem.
- **gRPC load balancing**: DaemonSet Collectors behind a Kubernetes Service
  don't distribute gRPC connections evenly. Use a service mesh or sidecar
  pattern for balanced gRPC distribution.

See [Deployment patterns](/docs/collector/deploy/) for a comparison of all
available options.

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]:
  https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]:
  https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
