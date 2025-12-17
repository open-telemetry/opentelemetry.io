---
title: Collector 扩容
weight: 26
default_lang_commit: 5077159e85e205f0f7ba9a95f8a507b94c01a398
drifted_from_default: true
# prettier-ignore
cSpell:ignore: fluentd hostmetrics Linkerd loadbalancer loadbalancing statefulset
---

在使用 OpenTelemetry Collector 规划可观测性数据收集管道时，你应当考虑如何随着遥测数据收集量的增长来扩容这个管道。

以下各节将引导你完成规划阶段，讨论应当扩容哪些组件、如何判断是否需要扩容、以及如何执行扩容计划。

## 扩容什么 {#what-to-scale}

虽然 OpenTelemetry Collector 在一个可执行文件中处理所有类型的遥测信号，但实际上每种信号类型的扩容需求各不相同，
可能需要采用不同的扩容策略。首先，你需要分析你的工作负载，确定哪种信号类型的负载占比最大，以及 Collector
预计会接收到哪些格式的数据。例如，扩容抓取集群与扩容日志接收器的方式差别很大。你还需要思考负载的弹性：
每天是否在特定时间段有峰值，还是全天的负载都相似？收集这些信息后，你就能明确需要扩容的部分。

例如，假设你需要抓取数百个 Prometheus 端点，每分钟通过 Fluentd 实例接收 1 TB 的日志，同时还有来自新微服务的
OTLP 格式的应用指标和追踪信息。在这种情况下，你会需要一套能够分别扩容每种信号类型的架构：扩容 Prometheus
接收器需要协调各个抓取程序，以决定哪个抓取程序 负责哪些端点；相对地，无状态日志接收器可以按需水平扩容。
将用于处理指标和追踪数据的 OTLP 接收器部署在第三个 Collector 集群中，可以实现故障隔离并提高迭代速度，
而无需担心重启繁忙的管道。由于 OTLP 接收器支持接收所有类型的遥测数据，
我们可以将应用指标和追踪数据处理在同一个实例中，并在需要时进行水平扩容。

## 何时扩容 {#when-to-scale}

同样，我们应当深入了解工作负载，以决定何时扩容或收缩 Collector，但
Collector 本身输出的一些指标可以很好地提示你是否需要采取行动。

当使用 `memory_limiter` 处理器时，一个重要的提示信号是指标 `otelcol_processor_refused_spans`。
该处理器限制 Collector 的内存使用量。虽然 Collector 实际内存可能会稍微超过设定的最大值，但一旦超出限制，
新数据将被阻止进入管道，并通过该指标记录下来。其他遥测数据类型也有类似的指标。如果数据频繁被拒绝进入管道，
你可能需要扩容 Collector 集群。一旦节点的内存消耗显著低于设置的限制值，则可以考虑缩减。

另一个值得关注的指标组是导出器队列相关的指标：`otelcol_exporter_queue_capacity` 和 `otelcol_exporter_queue_size`。
Collector 会在内存中排队等待工作组件可用来发送数据。如果工作组件数不足，或后端处理速度慢，数据就会在队列中堆积。
一旦队列满了（`otelcol_exporter_queue_size` > `otelcol_exporter_queue_capacity`），
就会拒绝新数据（`otelcol_exporter_enqueue_failed_spans`）。增加更多的工作组件通常可以提升导出能力，
但这并不总是最佳策略（参见[何时不要扩容](#when-not-to-scale)）。一般建议是当队列达到容量的 60-70% 时考虑扩容，
当队列始终较小时可以考虑缩减，但需维持最小副本数，例如 3 个，以保证系统的弹性。

你还应熟悉所使用的组件，因为不同组件可能暴露不同的指标。例如，
[负载均衡导出器会记录导出操作的时延信息](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter#metrics)，
以直方图 `otelcol_loadbalancer_backend_latency` 的形式暴露。你可以据此判断各后端处理请求的时间是否相近：
若某个后端特别慢，可能是 Collector 之外的问题。

对于抓取类型的接收器，例如 Prometheus 接收器，一旦抓取所有目标所需的时间接近或超过抓取间隔，
就需要对抓取进行扩容或分片。此时，应增加更多抓取程序，通常是新的 Collector 实例。

### 何时不能扩容 {#when-not-to-scale}

判断扩容无益的场景与判断何时扩容同样重要。一个典型例子是当遥测数据库无法跟上数据写入速度时，增加
Collector 数量也无济于事，除非你同时扩容数据库。类似地，如果 Collector 与后端之间的网络带宽已饱和，
添加更多 Collector 反而会带来负面影响。

再次查看指标 `otelcol_exporter_queue_size` 和 `otelcol_exporter_queue_capacity` 是识别该问题的好方法。
如果队列大小始终接近容量，说明导出速度小于接收速度。你可以尝试增大队列容量，这虽然会增加内存消耗，
但可为后端留出喘息空间，避免丢失数据。但如果你不断增加队列容量而队列大小也按比例增长，这表明问题出在
Collector 之外。同样值得注意的是，增加工作组件在这种情况下也无济于事，反而会给已处于高负载的系统带来更大压力。

另一个后端出现问题的信号是指标 `otelcol_exporter_send_failed_spans` 的增长：
它表示数据导出操作永久失败。如果该现象持续出现，扩容 Collector 很可能只会加剧问题。

## 如何扩容 {#how-to-scale}

到目前为止，我们已经知道管道中哪些部分需要扩容。关于扩容，组件大致分为三类：无状态组件、抓取程序、有状态组件。

大多数 Collector 组件是无状态的。即使它们在内存中保存一些状态，对于扩容来说也并不重要。

抓取程序（如 Prometheus 接收器）配置为从外部获取遥测数据，然后将其放入处理管道。

某些组件如尾部采样处理器在内存中保留关键状态信息，因此不能轻易扩容。这类组件在扩容前需仔细考虑。

### 扩容无状态 Collector 与使用负载均衡器 {#scaling-stateless-collectors-and-using-load-balancers}

好消息是，大多数情况下扩容 Collector 都很简单，只需添加新的副本，并通过负载均衡器将流量分发即可。

负载均衡器在以下场景非常关键：

- 在多个无状态 Collector 实例之间分发流量，避免单个实例被压垮；
- 提高采集管道的可用性和容错能力。如果某个 Collector 实例失败，负载均衡器可将流量引导至其他健康实例；
- 按需对 Collector 层进行水平扩容。

在 Kubernetes 环境中，可利用服务网格（如 Istio 或 Linkerd）或云提供商提供的成熟负载均衡和限流方案。
这些系统通常在流量管理、弹性和可观测性方面具备更高级的能力。

若使用 gRPC（OTLP 常见）接收数据，需使用理解 gRPC 协议的 L7 负载均衡器。传统 L4 负载均衡器可能与某个
Collector 后端建立持久连接，破坏扩容效果，因为客户端始终连接同一个实例。在设计时也要考虑管道的可靠性。
例如，在 Kubernetes 中运行工作负载时，可通过 DaemonSet 在每个物理节点部署一个 Collector，
同时使用远程中央 Collector 对数据预处理后再发送到存储。当节点较少而 Pod 数较多时，
边车模式更合适，可在 Collector 层实现更好的 gRPC 负载均衡，无需 gRPC 专用负载均衡器。此外，
边车模式还能避免 DaemonSet Pod 故障导致该节点所有 Pod 的关键组件宕机。

边车模式是将一个额外容器注入到工作负载的 Pod 中。
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator/) 可自动完成此操作。
你需要创建一个 OpenTelemetry Collector CR，并在 PodSpec 或 Pod 上添加注解，告知 Operator 注入边车：

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
            endpoint: 0.0.0.0:4317
    processors:

    exporters:
      # Note: Prior to v0.86.0 use the `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [debug]
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

如果你不想使用 Operator，也可以手动添加边车，示例如下：

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

### 扩容抓取程序 {#scaling-the-scrapers}

某些接收器会主动从外部获取遥测数据，例如 Hostmetrics 和 Prometheus 接收器。获取主机指标通常无需扩容，
但若要抓取成千上万个端点的指标，就需要对 Prometheus 接收器进行扩容。但不能简单地复制配置增加实例，
否则所有 Collector 都会尝试抓取相同的端点，导致数据重复或乱序。

解决方案是对端点进行分片，使每个 Collector 实例负责不同的一组端点。

一种方法是为每个 Collector 配置不同的配置文件，使其只发现自己负责的端点。
例如，可以按命名空间或工作负载上的标签进行划分。

另一种方式是使用 [Target Allocator](/docs/platforms/kubernetes/operator/target-allocator/)，
这是 OpenTelemetry Operator 附带的一个组件，用于将 Prometheus 抓取目标在多个 Collector 间分配。使用方式如下：

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
      # Note: Prior to v0.86.0 use the `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          processors: []
          exporters: [debug]
```

协调后，Operator 会将 Collector 的配置转换为如下形式：

```yaml
exporters:
   # 注意：对于 v0.86.0 之前到版本，要使用 `logging` 而不是使用 `debug`
   debug: null
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
     metrics:
       exporters:
       - debug
       processors: []
       receivers:
       - prometheus
```

注意，Operator 添加了 `global` 设置和新的 `http_sd_configs`，这些配置指向由 Operator 自动部署的 Target Allocator 实例。
现在，只需修改 CR 的 “replicas” 字段即可扩容 Collector，Target Allocator 会自动根据每个 Pod 分配不同的抓取目标。

### 扩容有状态 Collector {#scaling-stateful-collectors}

某些组件在内存中保存数据，扩容时会导致行为变化。例如尾部采样处理器在内存中保留一段时间的 Span，直到链路完成后再决定是否采样。
如果 Collector 集群进行扩容，不同实例可能会接收到同一个链路的 Span，各自做出不同的采样决策，导致链路中缺失部分 Span，失真原始事务。

类似情况也可能出现在 span-to-metrics 处理器中，当多个 Collector 接收到来自同一服务的数据时，基于服务名的聚合可能不准确。

解决方案是引入一层 Collector，并使用负载均衡导出器将数据路由到处理尾部采样或 Span 到指标的后端 Collector。
负载均衡导出器会基于链路 ID 或服务名进行一致性哈希，确定哪个 Collector 接收某个链路的数据。
你可以配置负载均衡导出器使用 DNS A 记录（如 Kubernetes 无头服务）所代表的主机列表。当后端
Collector 部署副本数变化时，DNS 查询会返回更新后的主机列表。你也可以直接使用静态主机列表。
可以通过增加该 Collector 层的副本数实现扩容。注意，不同实例的 DNS 查询时间可能不同，
会导致短时间内的集群视图不一致。在高度弹性环境下，建议缩短查询间隔，减少差异持续时间。

以下是使用 Kubernetes `observability` 命名空间中 `otelcol` 服务作为后端信息来源的示例配置：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

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
