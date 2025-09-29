---
title: 演示架构
linkTitle: 架构
aliases: [current_architecture]
body_class: otel-mermaid-max-width
default_lang_commit: d7a38b0eb268f62d48aee2fb77f544eb987f6f6e
drifted_from_default: true
---

**OpenTelemetry 演示内容**由使用不同编程语言编写的微服务组成，
这些服务通过 gRPC 和 HTTP 相互通信；此外还包括一个使用
[Locust](https://locust.io/) 模拟用户流量的负载生成器。

```mermaid
graph TD
subgraph 服务图
accounting(会计服务):::dotnet
ad(广告服务):::java
cache[(缓存<br/>&#40Valkey&#41)]
cart(购物车服务):::dotnet
checkout(结账服务):::golang
currency(货币服务):::cpp
email(电子邮件服务):::ruby
flagd(Flagd 服务):::golang
flagd-ui(Flagd UI 界面):::typescript
fraud-detection(欺诈检测服务):::kotlin
frontend(前端服务):::typescript
frontend-proxy(前端代理<br/>&#40Envoy&#41):::cpp
image-provider(图像提供服务<br/>&#40nginx&#41):::cpp
load-generator([负载生成器]):::python
payment(支付服务):::javascript
product-catalog(产品目录服务):::golang
quote(报价服务):::php
recommendation(推荐服务):::python
shipping(配送服务):::rust
queue[(队列<br/>&#40Kafka&#41)]:::java
react-native-app(React Native 应用):::typescript

ad ---->|gRPC| flagd

checkout -->|gRPC| currency
checkout -->|gRPC| cart
checkout -->|TCP| queue

cart --> cache
cart -->|gRPC| flagd

checkout -->|gRPC| payment
checkout --->|HTTP| email
checkout -->|gRPC| product-catalog
checkout -->|HTTP| shipping

fraud-detection -->|gRPC| flagd

frontend -->|gRPC| ad
frontend -->|gRPC| currency
frontend -->|gRPC| cart
frontend -->|gRPC| checkout
frontend -->|HTTP| shipping
frontend ---->|gRPC| recommendation
frontend -->|gRPC| product-catalog

frontend-proxy -->|gRPC| flagd
frontend-proxy -->|HTTP| frontend
frontend-proxy -->|HTTP| flagd-ui
frontend-proxy -->|HTTP| image-provider

payment -->|gRPC| flagd

queue -->|TCP| accounting
queue -->|TCP| fraud-detection

recommendation -->|gRPC| flagd
recommendation -->|gRPC| product-catalog

shipping -->|HTTP| quote

Internet -->|HTTP| frontend-proxy
load-generator -->|HTTP| frontend-proxy
react-native-app -->|HTTP| frontend-proxy
end

classDef dotnet fill:#178600,color:white;
classDef cpp fill:#f34b7d,color:white;
classDef golang fill:#00add8,color:black;
classDef java fill:#b07219,color:white;
classDef javascript fill:#f1e05a,color:black;
classDef kotlin fill:#560ba1,color:white;
classDef php fill:#4f5d95,color:white;
classDef python fill:#3572A5,color:white;
classDef ruby fill:#701516,color:white;
classDef rust fill:#dea584,color:black;
classDef typescript fill:#e98516,color:black;
```

```mermaid
graph TD
subgraph 服务图例
  dotnetsvc(.NET):::dotnet
  cppsvc(C++):::cpp
  golangsvc(Go):::golang
  javasvc(Java):::java
  javascriptsvc(JavaScript):::javascript
  kotlinsvc(Kotlin):::kotlin
  phpsvc(PHP):::php
  pythonsvc(Python):::python
  rubysvc(Ruby):::ruby
  rustsvc(Rust):::rust
  typescriptsvc(TypeScript):::typescript
end

classDef dotnet fill:#178600,color:white;
classDef cpp fill:#f34b7d,color:white;
classDef golang fill:#00add8,color:black;
classDef java fill:#b07219,color:white;
classDef javascript fill:#f1e05a,color:black;
classDef kotlin fill:#560ba1,color:white;
classDef php fill:#4f5d95,color:white;
classDef python fill:#3572A5,color:white;
classDef ruby fill:#701516,color:white;
classDef rust fill:#dea584,color:black;
classDef typescript fill:#e98516,color:black;
```

点击以下链接可查看演示应用中目前的[指标](/docs/demo/telemetry-features/metric-coverage/)和[链路](/docs/demo/telemetry-features/trace-coverage/)监控覆盖情况。

Collector 的配置文件位于
[otelcol-config.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config.yml)，
也可以在此配置不同的导出器（Exporter）。

```mermaid
graph TB
subgraph tdf[遥测数据流]
    subgraph subgraph_padding [ ]
        style subgraph_padding fill:none,stroke:none;
        %% 为了避免标题重叠进行填充
        subgraph od[OpenTelemetry 演示]
        ms(微服务)
        end

        ms -.->|"OTLP<br/>gRPC"| oc-grpc
        ms -.->|"OTLP<br/>HTTP POST"| oc-http

        subgraph oc[OTel Collector（收集器）]
            style oc fill:#97aef3,color:black;
            oc-grpc[/"OTLP 接收器<br/>监听地址<br/>grpc://localhost:4317"/]
            oc-http[/"OTLP 接收器<br/>监听地址<br/>localhost:4318<br/>"/]
            oc-proc(处理器)
            oc-prom[/"OTLP HTTP 导出器"/]
            oc-otlp[/"OTLP 导出器"/]

            oc-grpc --> oc-proc
            oc-http --> oc-proc

            oc-proc --> oc-prom
            oc-proc --> oc-otlp
        end

        oc-prom -->|"localhost:9090/api/v1/otlp"| pr-sc
        oc-otlp -->|gRPC| ja-col

        subgraph pr[Prometheus（指标系统）]
            style pr fill:#e75128,color:black;
            pr-sc[/"Prometheus OTLP<br/>写入接收器"/]
            pr-tsdb[(Prometheus 时序数据库)]
            pr-http[/"Prometheus HTTP<br/>监听地址<br/>localhost:9090"/]

            pr-sc --> pr-tsdb
            pr-tsdb --> pr-http
        end

        pr-b{{"浏览器<br/>Prometheus UI"}}
        pr-http ---->|"localhost:9090/graph"| pr-b

        subgraph ja[Jaeger（追踪系统）]
            style ja fill:#60d0e4,color:black;
            ja-col[/"Jaeger Collector<br/>监听地址<br/>grpc://jaeger:4317"/]
            ja-db[(Jaeger 数据库)]
            ja-http[/"Jaeger HTTP<br/>监听地址<br/>localhost:16686"/]

            ja-col --> ja-db
            ja-db --> ja-http
        end

        subgraph gr[Grafana（可视化）]
            style gr fill:#f8b91e,color:black;
            gr-srv["Grafana 服务器"]
            gr-http[/"Grafana HTTP<br/>监听地址<br/>localhost:3000"/]

            gr-srv --> gr-http
        end

        pr-http --> |"localhost:9090/api"| gr-srv
        ja-http --> |"localhost:16686/api"| gr-srv

        ja-b{{"浏览器<br/>Jaeger UI"}}
        ja-http ---->|"localhost:16686/search"| ja-b

        gr-b{{"浏览器<br/>Grafana UI"}}
        gr-http -->|"localhost:3000/dashboard"| gr-b
    end
end
```

你可以在 `/pb/` 目录中找到**协议缓冲定义** 。
