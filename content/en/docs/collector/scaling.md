---
title: Scaling the Collector
weight: 26
# prettier-ignore
cSpell:ignore: fluentd hostmetrics loadbalancer loadbalancing sharded statefulset
---

When planning your observability pipeline with the OpenTelemetry Collector, you
should consider ways to scale the pipeline as your telemetry collection
increases.

The following sections will guide you through the planning phase discussing
which components to scale, how to determine when it’s time to scale up, and how
to execute the plan.

## What to Scale

While the OpenTelemetry Collector handles all telemetry signal types in a single
binary, the reality is that each type may have different scaling needs and might
require different scaling strategies. Start by looking at your workload to
determine which signal type is expected to have the biggest share of the load
and which formats are expected to be received by the Collector. For instance,
scaling a scraping cluster differs significantly from scaling log receivers.
Think also about how elastic the workload is: do you have peaks at specific
times of the day, or is the load similar across all 24 hours? Once you gather
that information, you will understand what needs to be scaled.

For example, suppose you have hundreds of Prometheus endpoints to be scraped, a
terabyte of logs coming from fluentd instances every minute, and some
application metrics and traces arriving in OTLP format from your newest
microservices. In that scenario, you’ll want an architecture that can scale each
signal individually: scaling the Prometheus receivers requires coordination
among the scrapers to decide which scraper goes to which endpoint. In contrast,
we can horizontally scale the stateless log receivers on demand. Having the OTLP
receiver for metrics and traces in a third cluster of Collectors would allow us
to isolate failures and iterate faster without fear of restarting a busy
pipeline. Given that the OTLP receiver enables the ingestion of all telemetry
types, we can keep the application metrics and traces on the same instance,
scaling them horizontally when needed.

## When to Scale

Once again, we should understand our workload to decide when it’s time to scale
up or down, but a few metrics emitted by the Collector can give you good hints
on when to take action.

One helpful hint the Collector can give you when the memory_limiter processor is
part of the pipeline is the metric `otelcol_processor_refused_spans` . This
processor allows you to restrict the amount of memory the Collector can use.
While the Collector may consume a bit more than the maximum amount configured in
this processor, new data will eventually be blocked from passing through the
pipeline by the memory_limiter, which will record the fact in this metric. The
same metric exists for all other telemetry data types. If data is being refused
from entering the pipeline too often, you’ll probably want to scale up your
Collector cluster. You can scale down once the memory consumption across the
nodes is significantly lower than the limit set in this processor.

Another set of metrics to keep in sight are the ones related to the queue sizes
for exporters: `otelcol_exporter_queue_capacity` and
`otelcol_exporter_queue_size`. The Collector will queue data in memory while
waiting for a worker to become available to send the data. If there aren’t
enough workers or the backend is too slow, data starts piling up in the queue.
Once the queue has hit its capacity (`otelcol_exporter_queue_size` >
`otelcol_exporter_queue_capacity`) it rejects data
(`otelcol_exporter_enqueue_failed_spans`). Adding more workers will often make
the Collector export more data, which might not necessarily be what you want
(see [When NOT to scale](#when-not-to-scale)).

It’s also worth getting familiar with the components that you intend to use, as
different components might produce other metrics. For instance, the
[load-balancing exporter will record timing information about the export operations](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter#metrics),
exposing this as part of the histogram `otelcol_loadbalancer_backend_latency`.
You can extract this information to determine whether all backends are taking a
similar amount of time to process requests: single backends being slow might
indicate problems external to the Collector.

For receivers doing scraping, such as the Prometheus receiver, the scraping
should be scaled, or sharded, once the time it takes to finish scraping all
targets often becomes critically close to the scrape interval. When that
happens, it’s time to add more scrapers, usually new instances of the Collector.

### When NOT to scale

Perhaps as important as knowing when to scale is to understand which signs
indicate that a scaling operation won’t bring any benefits. One example is when
a telemetry database can’t keep up with the load: adding Collectors to the
cluster won’t help without scaling up the database. Similarly, when the network
connection between the Collector and the backend is saturated, adding more
Collectors might cause a harmful side effect.

Again, one way to catch this situation is by looking at the metrics
`otelcol_exporter_queue_size` and `otelcol_exporter_queue_capacity`. If you keep
having the queue size close to the queue capacity, it’s a sign that exporting
data is slower than receiving data. You can try to increase the queue size,
which will cause the Collector to consume more memory, but it will also give
some room for the backend to breathe without permanently dropping telemetry
data. But if you keep increasing the queue capacity and the queue size keeps
rising at the same proportion, it’s indicative that you might want to look
outside of the Collector. It’s also important to note that adding more workers
here would not be helpful: you’ll only be putting more pressure on a system
already suffering from a high load.

Another sign that the backend might be having problems is an increase in the
`otelcol_exporter_send_failed_spans` metric: this indicates that sending data to
the backend failed permanently. Scaling up the Collector will likely only worsen
the situation when this is consistently happening.

## How to Scale

At this point, we know which parts of our pipeline needs scaling. Regarding
scaling, we have three types of components: stateless, scrapers, and stateful.

Most Collector components are stateless. Even if they hold some state in memory,
it isn’t relevant for scaling purposes.

Scrapers, like the Prometheus receiver, are configured to obtain telemetry data
from external locations. The receiver will then scrape target by target, putting
data into the pipeline.

Components like the tail sampling processor cannot be easily scaled, as they
keep some relevant state in memory for their business. Those components require
some careful consideration before being scaled up.

### Scaling Stateless Collectors

The good news is that most of the time, scaling the Collector is easy, as it’s
just a matter of adding new replicas and using an off-the-shelf load balancer.
When gRPC is used to receive the data, we recommend using a load-balancer that
understands gRPC. Otherwise, clients will always hit the same backing Collector.

You should still consider splitting your collection pipeline with reliability in
mind. For instance, when your workloads run on Kubernetes, you might want to use
DaemonSets to have a Collector on the same physical node as your workloads and a
remote central Collector responsible for pre-processing the data before sending
the data to the storage. When the number of nodes is low and the number of pods
is high, Sidecars might make more sense, as you’ll get a better load balancing
for the gRPC connections among Collector layers without needing a gRPC-specific
load balancer. Using a Sidecar also makes sense to avoid bringing down a crucial
component for all pods in a node when one DaemonSet pod fails.

The sidecar pattern consists in adding a container into the workload pod. The
[OpenTelemetry Operator](/docs/kubernetes/operator/) can automatically add that
for you. To accomplish that, you’ll need an OpenTelemetry Collector CR and
you’ll need to annotate your PodSpec or Pod telling the operator to inject a
sidecar:

```yaml
---
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: sidecar-for-my-workload
spec:
  mode: sidecar
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
    processors:

    exporters:
      logging:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [logging]
---
apiVersion: v1
kind: Pod
metadata:
  name: my-microservice
  annotations:
    sidecar.opentelemetry.io/inject: 'true'
spec:
  containers:
    - name: my-microservice
      image: my-org/my-microservice:v0.0.0
      ports:
        - containerPort: 8080
          protocol: TCP
```

In case you prefer to bypass the operator and add a sidecar manually, here’s an
example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-microservice
spec:
  containers:
    - name: my-microservice
      image: my-org/my-microservice:v0.0.0
      ports:
        - containerPort: 8080
          protocol: TCP
    - name: sidecar
      image: ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:0.69.0
      ports:
        - containerPort: 8888
          name: metrics
          protocol: TCP
        - containerPort: 4317
          name: otlp-grpc
          protocol: TCP
      args:
        - --config=/conf/collector.yaml
      volumeMounts:
        - mountPath: /conf
          name: sidecar-conf
  volumes:
    - name: sidecar-conf
      configMap:
        name: sidecar-for-my-workload
        items:
          - key: collector.yaml
            path: collector.yaml
```

### Scaling the Scrapers

Some receivers are actively obtaining telemetry data to place in the pipeline,
like the hostmetrics and prometheus receivers. While getting host metrics isn’t
something we’d typically scale up, we might need to split the job of scraping
thousands of endpoints for the Prometheus receiver. And we can’t simply add more
instances with the same configuration, as each Collector would try to scrape the
same endpoints as every other Collector in the cluster, causing even more
problems, like out-of-order samples.

The solution is to shard the endpoints by Collector instances so that if we add
another replica of the Collector, each one will act on a different set of
endpoints.

One way of doing that is by having one configuration file for each Collector so
that each Collector would discover only the relevant endpoints for that
Collector. For instance, each Collector could be responsible for one Kubernetes
namespace or specific labels on the workloads.

Another way of scaling the Prometheus receiver is to use the
[Target Allocator](/docs/kubernetes/operator/target-allocator/): it’s an extra
binary that can be deployed as part of the OpenTelemetry Operator and will split
the share of Prometheus jobs for a given configuration across the cluster of
Collectors using a consistent hashing algorithm. You can use a Custom Resource
(CR) like the following to make use of the Target Allocator:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: collector-with-ta
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
  config: |
    receivers:
      prometheus:
        config:
          scrape_configs:
          - job_name: 'otel-collector'
            scrape_interval: 10s
            static_configs:
            - targets: [ '0.0.0.0:8888' ]

    exporters:
      logging:

    service:
      pipelines:
        traces:
          receivers: [prometheus]
          processors: []
          exporters: [logging]
```

After the reconciliation, the OpenTelemetry Operator will convert the
Collector’s configuration into the following:

```yaml
exporters:
   logging: null
 receivers:
   prometheus:
     config:
       global:
         scrape_interval: 1m
         scrape_timeout: 10s
         evaluation_interval: 1m
       scrape_configs:
       - job_name: otel-collector
         honor_timestamps: true
         scrape_interval: 10s
         scrape_timeout: 10s
         metrics_path: /metrics
         scheme: http
         follow_redirects: true
         http_sd_configs:
         - follow_redirects: false
           url: http://collector-with-ta-targetallocator:80/jobs/otel-collector/targets?collector_id=$POD_NAME
 service:
   pipelines:
     traces:
       exporters:
       - logging
       processors: []
       receivers:
       - prometheus
```

Note how the Operator added a `global` section and a `new http_sd_configs` to
the `otel-collector` scrape config, pointing to a Target Allocator instance it
provisioned. Now, to scale the collectors, change the “replicas” attribute of
the CR and the Target Allocator will distribute the load accordingly by
providing a custom `http_sd_config` per collector instance (pod).

### Scaling Stateful Collectors

Certain components might hold data in memory, yielding different results when
scaled up. It is the case for the tail-sampling processor, which holds spans in
memory for a given period, evaluating the sampling decision only when the trace
is considered complete. Scaling a Collector cluster by adding more replicas
means that different collectors will receive spans for a given trace, causing
each collector to evaluate whether that trace should be sampled, potentially
coming to different answers. This behavior results in traces missing spans,
misrepresenting what happened in that transaction.

A similar situation happens when using the span-to-metrics processor to generate
service metrics. When different collectors receive data related to the same
service, aggregations based on the service name will be inaccurate.

To overcome this, you can deploy a layer of Collectors containing the
load-balancing exporter in front of your Collectors doing the tail-sampling or
the span-to-metrics processing. The load-balancing exporter will hash the trace
ID or the service name consistently and determine which collector backend should
receive spans for that trace. You can configure the load-balancing exporter to
use the list of hosts behind a given DNS A entry, such as a Kubernetes headless
service. When the deployment backing that service is scaled up or down, the
load-balancing exporter will eventually see the updated list of hosts.
Alternatively, you can specify a list of static hosts to be used by the
load-balancing exporter. You can scale up the layer of Collectors configured
with the load-balancing exporter by increasing the number of replicas. Note that
each Collector will potentially run the DNS query at different times, causing a
difference in the cluster view for a few moments. We recommend lowering the
interval value so that the cluster view is different only for a short period in
highly-elastic environments.

Here’s an example configuration using a DNS A record (Kubernetes service otelcol
on the observability namespace) as the input for the backend information:

```yaml
receivers:
  otlp:
    protocols:
      grpc:

processors:

exporters:
  loadbalancing:
    protocol:
      otlp:
    resolver:
      dns:
        hostname: otelcol.observability.svc.cluster.local

service:
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - loadbalancing
```
