---
title: 配置
weight: 20
description: 了解如何配置 Collector 以满足你的需求
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8 # patched
drifted_from_default: true
# prettier-ignore
cSpell:ignore: cfssl cfssljson configtls fluentforward gencert genkey hostmetrics initca oidc pprof prodevent prometheusremotewrite spanevents unredacted upsert zpages
---

<!-- markdownlint-disable link-fragments -->

你可以配置 OpenTelemetry Collector 以满足你的可观测性需求。在学习 Collector 配置方法之前，请熟悉以下内容：

- [数据收集概念][dcc]，了解适用于 OpenTelemetry Collector 的相关仓库。
- [面向最终用户的安全指南](/docs/security/config-best-practices/)
- [面向组件开发者的安全指南](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)

## 位置 {#location}

默认情况下，Collector 配置文件位于 `/etc/<otel-directory>/config.yaml`，其中 `<otel-directory>` 可以是 `otelcol`、`otelcol-contrib` 或其他值，具体取决于你使用的 Collector 版本或发行版。

你可以使用 `--config` 选项提供一个或多个配置文件。例如：

```shell
otelcol --config=customconfig.yaml
```

`--config` 标志接受文件路径或格式为 `"<scheme>:<opaque_data>"` 的配置 URI。目前，OpenTelemetry Collector 支持以下 `scheme` 提供者：

- **file** - 从文件读取配置。例如 `file:path/to/config.yaml`。
- **env** - 从环境变量读取配置。例如 `env:MY_CONFIG_IN_AN_ENVVAR`。
- **yaml** - 从 YAML 字符串读取配置，使用 `::` 分隔子路径。例如 `yaml:exporters::debug::verbosity: detailed`。
<!-- prettier-ignore-start -->
- **http** - 从 HTTP URI 读取配置。例如 `http://www.example.com`。
- **https** - 从 HTTPS URI 读取配置。例如 `https://www.example.com`。
<!-- prettier-ignore-end -->

你还可以使用不同路径的多个文件来提供多个配置。每个文件可以是完整配置或部分配置，文件之间可以相互引用组件。如果文件的合并不构成完整配置，用户会收到错误，因为所需组件不会默认添加。按以下方式在命令行传递多个文件路径：

```shell
otelcol --config=file:/path/to/first/file --config=file:/path/to/second/file
```

你还可以使用环境变量、HTTP URI 或 YAML 路径提供配置。例如：

```shell
otelcol --config=env:MY_CONFIG_IN_AN_ENVVAR --config=https://server/config.yaml
otelcol --config="yaml:exporters::debug::verbosity: normal"
```

> [!TIP]
>
> 在 YAML 路径中引用嵌套键时，请确保使用双冒号（`::`）来避免与包含点（`.`）的名称空间混淆。例如：
> `receivers::docker_stats::metrics::container.cpu.utilization::enabled: false`。

要验证配置文件，请使用 `validate` 命令。例如：

```shell
otelcol validate --config=customconfig.yaml
```

## 配置结构 {#basics}

任何 Collector 配置文件的结构都由四类访问遥测数据的管道组件组成：

- [接收器](#receivers)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Receivers.svg">
- [处理器](#processors)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Processors.svg">
- [导出器](#exporters)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Exporters.svg">
- [连接器](#connectors)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Load_Balancer.svg">

配置每个管道组件后，必须使用配置文件 [service](#service) 部分中的管道来启用它。

除了管道组件，你还可以配置[扩展功能](#extensions)，这些扩展功能提供可添加到 Collector 的功能，例如诊断工具。扩展功能不需要直接访问遥测数据，而是通过 [service](#service) 部分启用。

<a id="endpoint-0.0.0.0-warning"></a> 以下是包含接收器、处理器、导出器和三个扩展功能的 Collector 配置示例：

> [!WARNING]
>
> 虽然通常最好将端点绑定到 `localhost`（当所有客户端都是本地客户端时），但为方便起见，我们的示例配置使用"未指定"地址 `0.0.0.0`。Collector 当前默认为 `0.0.0.0`，但不久的将来默认值将更改为 `localhost`。有关这些端点配置值选择的详细信息，请参阅[防止拒绝服务攻击][Safeguards against denial of service attacks]。

[Safeguards against denial of service attacks]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_grpc]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
```

请注意，接收器、处理器、导出器和管道通过遵循 `type[/name]` 格式的组件标识符来定义，例如 `otlp` 或 `otlp/2`。只要标识符是唯一的，你就可以多次定义给定类型的组件。例如：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  otlp/2:
    protocols:
      grpc:
        endpoint: 0.0.0.0:55690

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:
  otlp_grpc/2:
    endpoint: otelcol2:4317
    sending_queue:
      batch:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_grpc]
    traces/2:
      receivers: [otlp/2]
      exporters: [otlp_grpc/2]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
```

配置还可以包含其他文件，使 Collector 将它们合并为 YAML 配置的单个内存表示：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters: ${file:exporters.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

`exporters.yaml` 文件如下：

```yaml
otlp_grpc:
  endpoint: otelcol.observability.svc.cluster.local:443
```

最终的内存结果如下：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  otlp_grpc:
    endpoint: otelcol.observability.svc.cluster.local:443

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

## 接收器 <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Receivers.svg"> {#receivers}

接收器从一个或多个来源收集遥测数据。它们可以是拉取型或推送型，并且可以支持一个或多个[数据源](/docs/concepts/signals/)。

接收器在 `receivers` 部分配置。许多接收器带有默认设置，因此只需指定接收器的名称即可配置它。如果你需要配置某个接收器或想更改默认配置，可以在此部分进行。你指定的任何设置都会覆盖默认值（如果有）。

> 配置接收器不会启用它。接收器通过添加到 [service](#service) 部分中相应的管道来启用。

Collector 需要一个或多个接收器。以下示例展示同一配置文件中包含的各种接收器：

```yaml
receivers:
  # 数据源：日志
  fluentforward:
    endpoint: 0.0.0.0:8006

  # 数据源：指标
  hostmetrics:
    scrapers:
      cpu:
      disk:
      filesystem:
      load:
      memory:
      network:
      process:
      processes:
      paging:

  # 数据源：链路
  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      thrift_binary:
      thrift_compact:
      thrift_http:

  # 数据源：链路、指标、日志
  kafka:
    protocol_version: 2.0.0

  # 数据源：链路、指标
  opencensus:

  # 数据源：链路、指标、日志
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: cert.pem
          key_file: cert-key.pem
      http:
        endpoint: 0.0.0.0:4318

  # 数据源：指标
  prometheus:
    config:
      scrape_configs:
        - job_name: otel-collector
          scrape_interval: 5s
          static_configs:
            - targets: [localhost:8888]

  # 数据源：链路
  zipkin:
```

> 有关接收器配置的详细信息，请参阅[接收器 README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md)。

## 处理器 <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Processors.svg"> {#processors}

处理器在将接收器收集的数据发送到导出器之前对其进行处理或转换。数据处理根据为每个处理器定义的规则或设置进行，可能包括过滤、丢弃、重命名或重新计算遥测等操作。管道中处理器的顺序决定了 Collector 应用到信号的處理操作顺序。

处理器是可选的，但有些是[推荐的](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。

你可以使用 Collector 配置文件中的 `processors` 部分来配置处理器。你指定的任何设置都会覆盖默认值（如果有）。

> 配置处理器不会启用它。处理器通过添加到 [service](#service) 部分中相应的管道来启用。

以下示例展示同一配置文件中包含的多个默认处理器。你可以通过组合 [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor) 和 [opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor) 的列表来找到处理器的完整列表。

```yaml
processors:
  # 数据源：链路
  attributes:
    actions:
      - key: environment
        value: production
        action: insert
      - key: db.statement
        action: delete
      - key: email
        action: hash

  # 数据源：指标、链路、日志
  filter:
    error_mode: ignore
    traces:
      span:
        - 'attributes["container.name"] == "app_container_1"'
        - 'resource.attributes["host.name"] == "localhost"'
        - 'name == "app_3"'
      spanevent:
        - 'attributes["grpc"] == true'
        - 'IsMatch(name, ".*grpc.*")'
    metrics:
      metric:
        - 'name == "my.metric" and resource.attributes["my_label"] == "abc123"'
        - 'type == METRIC_DATA_TYPE_HISTOGRAM'
      datapoint:
        - 'metric.type == METRIC_DATA_TYPE_SUMMARY'
        - 'resource.attributes["service.name"] == "my_service_name"'
    logs:
      log_record:
        - 'IsMatch(body, ".*password.*")'
        - 'severity_number < SEVERITY_NUMBER_WARN'

  # 数据源：链路、指标、日志
  memory_limiter:
    check_interval: 5s
    limit_mib: 4000
    spike_limit_mib: 500

  # 数据源：链路
  resource:
    attributes:
      - key: cloud.zone
        value: zone-1
        action: upsert
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
      - key: redundant-attribute
        action: delete

  # 数据源：链路
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 15

  # 数据源：链路
  span:
    name:
      to_attributes:
        rules:
          - ^\/api\/v1\/document\/(?P<documentId>.*)\/update$
      from_attributes: [db.svc, operation]
      separator: '::'
```

> 有关处理器配置的详细信息，请参阅[处理器 README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md)。

## 导出器 <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Exporters.svg"> {#exporters}

导出器将数据发送到一个或多个后端或目标。导出器可以是拉取型或推送型，并且可以支持一个或多个[数据源](/docs/concepts/signals/)。

`exporters` 部分中的每个键都定义了一个导出器实例。键遵循 `type/name` 格式，其中 `type` 指定导出器类型（例如 `otlp`、`kafka`、`prometheus`），`name`（可选）可以附加以为同一类型的多个实例提供唯一名称。

大多数导出器需要至少指定目标以及安全设置（如身份验证令牌或 TLS 证书）的配置。你指定的任何设置都会覆盖默认值（如果有）。

> 配置导出器不会启用它。导出器通过添加到 [service](#service) 部分中相应的管道来启用。

Collector 需要一个或多个导出器。以下示例展示同一配置文件中包含的各种导出器：

```yaml
exporters:
  # 数据源：链路、指标、日志
  file:
    path: ./filename.json

  # 数据源：链路
  otlp_grpc/jaeger:
    endpoint: jaeger-server:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # 数据源：链路、指标、日志
  kafka:
    protocol_version: 2.0.0

  # 数据源：链路、指标、日志
  # 注意：在 v0.86.0 之前，使用 `logging` 而不是 `debug`
  debug:
    verbosity: detailed

  # 数据源：链路、指标
  opencensus:
    endpoint: otelcol2:55678

  # 数据源：链路、指标、日志
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # 数据源：链路、指标
  otlp_http:
    endpoint: https://otlp.example.com:4318

  # 数据源：指标
  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: default

  # 数据源：指标
  prometheusremotewrite:
    endpoint: http://prometheus.example.com:9411/api/prom/push
    # 使用官方 Prometheus（通过 Docker 运行）
    # 端点：'http://prometheus:9090/api/v1/write' 时，添加：
    # tls:
    #   insecure: true

  # 数据源：链路
  zipkin:
    endpoint: http://zipkin.example.com:9411/api/v2/spans
```

请注意，某些导出器需要 x.509 证书才能建立安全连接，如[证书配置](#setting-up-certificates)中所述。

> 有关导出器配置的更多信息，请参阅[导出器 README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md)。

## 连接器 <img width="32" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Load_Balancer.svg"> {#connectors}

连接器连接两个管道，同时扮演导出器和接收器的角色。连接器在一个管道的末端作为导出器消费数据，并在另一个管道的始端作为接收器发出数据。消费的数据和发出的数据可以是相同类型，也可以是不同数据类型。你可以使用连接器来汇总、复制或路由消费的数据。

你可以使用 Collector 配置文件中的 `connectors` 部分配置一个或多个连接器。默认情况下，不配置任何连接器。每种类型的连接器被设计为使用一对或多对数据类型，并且只能用于相应地连接管道。

> 配置连接器不会启用它。连接器通过 [service](#service) 部分中的管道启用。

以下示例展示 `count` 连接器及其在 `pipelines` 部分中的配置方式。请注意，该连接器充当链路的导出器和指标的消费接收器，连接了两条管道：

```yaml
receivers:
  foo:

exporters:
  bar:

connectors:
  count:
    spanevents:
      my.prod.event.count:
        description: The number of span events from my prod environment.
        conditions:
          - 'attributes["env"] == "prod"'
          - 'name == "prodevent"'

service:
  pipelines:
    traces:
      receivers: [foo]
      exporters: [count]
    metrics:
      receivers: [count]
      exporters: [bar]
```

> 有关连接器配置的详细信息，请参阅[连接器 README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)。

## 扩展功能 {#extensions}

扩展功能是可选组件，用于扩展 Collector 的功能，以执行与处理遥测数据不直接相关的任务。例如，你可以添加 Collector 健康监控、服务发现或数据转发等扩展功能。

你可以通过 Collector 配置文件中的 `extensions` 部分配置扩展功能。大多数扩展功能都带有默认设置，因此你只需指定扩展功能的名称即可配置它。你指定的任何设置都会覆盖默认值（如果有）。

> 配置扩展功能不会启用它。扩展功能在 [service](#service) 部分中启用。

默认情况下，不配置任何扩展功能。以下示例展示在同一文件中配置的多个扩展功能：

```yaml
extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679
```

> 有关扩展功能配置的详细信息，请参阅[扩展功能 README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md)。

## 服务部分 {#service}

`service` 部分用于配置基于在接收器、处理器、导出器和扩展功能部分中找到的配置在 Collector 中启用的组件。如果某个组件被配置了，但未在 `service` 部分中定义，则不会启用该组件。

服务部分由三个子部分组成：

- 扩展功能
- 管道
- 遥测

### 扩展功能 {#service-extensions}

`extensions` 子部分由要启用的扩展功能列表组成。例如：

```yaml
service:
  extensions: [health_check, pprof, zpages]
```

### 管道

`pipelines` 子部分是配置管道的地方，管道可以是以下类型：

- `traces` 收集和处理链路数据。
- `metrics` 收集和处理指标数据。
- `logs` 收集和处理日志数据。

管道由一组接收器、处理器和导出器组成。在将接收器、处理器或导出器包含在管道之前，请确保在相应的部分中定义其配置。

你可以在多个管道中使用相同的接收器、处理器或导出器。当处理器在多个管道中被引用时，每个管道都会获得该处理器的一个单独实例。

以下是管道配置的示例。请注意，处理器的顺序决定了数据的处理顺序：

```yaml
service:
  pipelines:
    metrics:
      receivers: [opencensus, prometheus]
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [memory_limiter]
      exporters: [opencensus, zipkin]
```

与组件一样，使用 `type[/name]` 语法为给定类型创建其他管道。以下是扩展先前配置的示例：

```yaml
service:
  pipelines:
    # ...
    traces:
      # ...
    traces/2:
      receivers: [opencensus]
      exporters: [zipkin]
```

### 遥测

`telemetry` 配置部分是为你设置 Collector 本身的可观测性的地方。它由两个子部分组成：`logs` 和 `metrics`。要了解如何配置这些信号，请参阅[在 Collector 中激活内部遥测](/docs/collector/internal-telemetry#activate-internal-telemetry-in-the-collector)。

## 其他信息 {#other-information}

### 环境变量 {#environment-variables}

Collector 配置中支持环境变量的使用和展开。例如，要使用存储在 `DB_KEY` 和 `OPERATION` 环境变量中的值，可以编写以下内容：

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY}
        action: ${env:OPERATION}
```

你可以使用 bash 语法将默认值传递给环境变量：`${env:DB_KEY:-some-default-var}`

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY:-mydefault}
        action: ${env:OPERATION:-}
```

使用 `$$` 表示字面量 `$`。例如，表示 `$DataVisualization` 如下所示：

```yaml
exporters:
  prometheus:
    endpoint: prometheus:8889
    namespace: $$DataVisualization
```

### 代理支持

使用 [`net/http`](https://pkg.go.dev/net/http) 包的导出器会遵循以下代理环境变量：

- `HTTP_PROXY`：HTTP 代理的地址
- `HTTPS_PROXY`：HTTPS 代理的地址
- `NO_PROXY`：不得使用代理的地址

如果在 Collector 启动时设置了这些变量，导出器无论使用何种协议都会按这些环境变量定义的方式代理流量或绕过代理。

### 身份验证

大多数暴露 HTTP 或 gRPC 端口的接收器可以使用 Collector 的身份验证机制进行保护。类似地，使用 HTTP 或 gRPC 客户端的大多数导出器可以向传出请求添加身份验证。

Collector 中的身份验证机制使用扩展机制，允许将自定义身份验证器插入到 Collector 发行版中。每个身份验证扩展功能有两种可能的用法：

- 作为导出器的客户端身份验证器，向传出请求添加身份验证数据。
- 作为接收器的服务器身份验证器，对传入连接进行身份验证。

有关已知身份验证器的列表，请参阅[注册表](/ecosystem/registry/?s=authenticator&component=extension)。如果你有兴趣开发自定义身份验证器，请参阅[构建身份验证器扩展功能](/docs/collector/extend/custom-component/extension/authenticator)。

要向 Collector 中的接收器添加服务器身份验证器，请按照以下步骤操作：

1. 在 `.extensions` 下添加身份验证器扩展功能及其配置。
2. 在 `.services.extensions` 下添加对身份验证器的引用，以便 Collector 加载它。
3. 在 `.receivers.<your-receiver>.<http-or-grpc-config>.auth` 下添加对身份验证器的引用。

以下示例在接收器端使用 OIDC 身份验证器，因此适合从充当代理的 OpenTelemetry Collector 接收数据的远程 Collector：

```yaml
extensions:
  oidc:
    issuer_url: http://localhost:8080/auth/realms/opentelemetry
    audience: collector

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:

exporters:
  # 注意：在 v0.86.0 之前，使用 `logging` 而不是 `debug`。
  debug:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters:
        - debug
```

在代理端，以下示例使 OTLP 导出器获取 OIDC 令牌，并将其添加到对远程 Collector 的每个 RPC 中：

```yaml
extensions:
  oauth2client:
    client_id: agent
    client_secret: some-secret
    token_url: http://localhost:8080/auth/realms/opentelemetry/protocol/openid-connect/token

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:

exporters:
  otlp_grpc/auth:
    endpoint: remote-collector:4317
    auth:
      authenticator: oauth2client

service:
  extensions:
    - oauth2client
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - otlp_grpc/auth
```

### 证书配置 {#setting-up-certificates}

在生产环境中，使用 TLS 证书进行安全通信或使用 mTLS 进行双向身份验证。按照以下步骤生成自签名证书作为此示例。生产使用时，你可能需要使用当前的证书配置流程来获取证书。

安装 [`cfssl`](https://github.com/cloudflare/cfssl) 并创建以下 `csr.json` 文件：

```json
{
  "hosts": ["localhost", "127.0.0.1"],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "O": "OpenTelemetry Example"
    }
  ]
}
```

然后运行以下命令：

```sh
cfssl genkey -initca csr.json | cfssljson -bare ca
cfssl gencert -ca ca.pem -ca-key ca-key.pem csr.json | cfssljson -bare cert
```

这将创建两个证书：

- `ca.pem` 中的"OpenTelemetry Example"证书颁发机构（CA），以及其关联的密钥 `ca-key.pem`
- `cert.pem` 中的客户端证书，由 OpenTelemetry Example CA 签名，并附带其关联的密钥 `cert-key.pem`

#### 在 Collector 中使用证书

获得证书后，配置 Collector 使用它们。

##### 接收器的 TLS 配置（服务器端）

在接收器上配置 TLS 以加密传入连接。使用 `cert_file` 和 `key_file` 指定服务器证书：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
      http:
        endpoint: 0.0.0.0:4318
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
```

##### 导出器的 TLS 配置（客户端）

在导出器上配置 TLS 以加密传出连接。使用 `ca_file` 验证服务器的证书：

```yaml
exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
```

如果你还需要向服务器提供客户端证书：

```yaml
exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/cert.pem
      key_file: /path/to/cert-key.pem
```

##### mTLS 配置（双向 TLS）

对于 mTLS，接收器和导出器都会验证彼此的证书。在接收器上，添加 `client_ca_file` 以验证客户端证书：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/server-cert.pem
          key_file: /path/to/server-key.pem
          client_ca_file: /path/to/ca.pem
```

在导出器上，提供用于验证服务器的 CA 和客户端证书：

```yaml
exporters:
  otlp_grpc:
    endpoint: remote-collector:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/client-cert.pem
      key_file: /path/to/client-key.pem
```

##### 常见 TLS 设置

TLS 配置有以下可用设置：

| 设置                   | 描述                                 |
| ---------------------- | ------------------------------------ |
| `ca_file`              | 用于验证对等方证书的 CA 证书路径     |
| `cert_file`            | TLS 证书路径                         |
| `key_file`             | TLS 私钥路径                         |
| `client_ca_file`       | 用于验证客户端证书的 CA 证书路径     |
| `insecure`             | 禁用 TLS 验证（生产环境不推荐）      |
| `insecure_skip_verify` | 跳过服务器证书验证（不推荐）         |
| `min_version`          | 最低 TLS 版本（例如 `1.2` 或 `1.3`） |
| `max_version`          | 最高 TLS 版本                        |
| `reload_interval`      | 证书重新加载的间隔时间               |

<!-- prettier-ignore-start -->
<!-- markdownlint-disable MD034 -->
> 有关 TLS 配置选项的更多详细信息，请参阅
> [configtls 文档](https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/config/configtls/README.md)。
<!-- markdownlint-enable MD034 -->
<!-- prettier-ignore-end -->

[dcc]: /docs/concepts/components/#collector

## 覆盖设置

你可以使用 `--set` 选项覆盖 Collector 设置。你使用此方法定义的设置在所有 `--config` 源被解析和合并后合并到最终配置中。

以下示例展示如何覆盖嵌套部分内的设置：

### 简单属性

`--set` 选项始终接受一个键/值对，使用方式为：
`--set key=value`。其 YAML 等价形式为：

```yaml
key: value
```

### 复杂嵌套键

使用两个冒号（`::`）作为键分隔符来引用嵌套的映射值。例如，`--set outer::inner=value` 会被转换为：

```yaml
outer:
  inner: value
```

### 多个值

要设置多个值，请指定多个 --set 标志，因此 `--set a=b --set c=d` 会变成：

```yaml
a: b
c: d
```

### 数组值

可以通过将值包装在 `[]` 中来表示数组。例如，`--set "key=[a, b, c]"` 会被转换为：

```yaml
key:
  - a
  - b
  - c
```

如果你需要表示更复杂的数据结构，强烈建议使用 YAML。

> [!CAUTION]
>
> `--set` 选项有以下限制：
>
> 1. 不支持设置包含点（`.`）的键。
> 2. 不支持设置包含等号（`=`）的键。
> 3. 配置键分隔符在属性值部分中是"::"。例如 `--set "name={a::b: c}"` 等价于 `--set name::a::b=c`。

## 嵌入其他配置提供者

一个配置提供者可以引用其他配置提供者，如下所示：

```yaml
receivers:
  otlp:
    protocols:
      grpc:

exporters: ${file:otlp-exporter.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

## 如何检查发行版中可用的组件

使用子命令 build-info。以下是一个示例：

```bash
otelcol components
```

示例输出：

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.143.0
receivers:
  - otlp
processors:
  - memory_limiter
exporters:
  - otlp_grpc
  - otlp_http
  - debug
extensions:
  - zpages
```

## 如何检查最终配置

> [!CAUTION]
>
> 此命令是实验性功能。其行为可能会更改，恕不另行通知。

使用默认模式（`--mode=redacted`）和 `--feature-gates=otelcol.printInitialConfig` 的 `print-config`：

```bash
otelcol print-config --config=file:examples/local/otel-config.yaml
```

请注意，默认情况下，配置仅在有效时打印，敏感信息会被编辑。要打印可能无效的配置，请使用 `--validate=false`。

### 如何查看敏感字段

使用 `--mode=unredacted` 和 `--feature-gates=otelcol.printInitialConfig` 的 `print-config`：

```bash
otelcol print-config --mode=unredacted --config=file:examples/local/otel-config.yaml
```

### 如何以 JSON 格式打印最终配置

> [!CAUTION]
>
> 此命令是实验性功能。其行为可能会更改，恕不另行通知。

使用 `--format=json` 和 `--feature-gates=otelcol.printInitialConfig` 的 `print-config`。请注意，JSON 格式被认为是不稳定的。

```bash
otelcol print-config --format=json --config=file:examples/local/otel-config.yaml
```
