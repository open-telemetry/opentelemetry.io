---
title: Demo Architecture
linkTitle: Architecture
aliases: [current_architecture]
body_class: otel-mermaid-max-width
---

**OpenTelemetry Demo** is composed of microservices written in different
programming languages that talk to each other over gRPC and HTTP; and a load
generator which uses [Locust](https://locust.io/) to fake user traffic.

```mermaid
graph TD
subgraph Service Diagram
accountingservice(Accounting Service):::dotnet
adservice(Ad Service):::java
cache[(Cache<br/>&#40Valkey&#41)]
cartservice(Cart Service):::dotnet
checkoutservice(Checkout Service):::golang
currencyservice(Currency Service):::cpp
emailservice(Email Service):::ruby
flagd(Flagd):::golang
flagdui(Flagd-ui):::typescript
frauddetectionservice(Fraud Detection Service):::kotlin
frontend(Frontend):::typescript
frontendproxy(Frontend Proxy <br/>&#40Envoy&#41):::cpp
imageprovider(Image Provider <br/>&#40nginx&#41):::cpp
loadgenerator([Load Generator]):::python
paymentservice(Payment Service):::javascript
productcatalogservice(Product Catalog Service):::golang
quoteservice(Quote Service):::php
recommendationservice(Recommendation Service):::python
shippingservice(Shipping Service):::rust
queue[(queue<br/>&#40Kafka&#41)]:::java
react-native-app(React Native App):::typescript

adservice ---->|gRPC| flagd

checkoutservice -->|gRPC| cartservice
checkoutservice --->|TCP| queue
cartservice --> cache
cartservice -->|gRPC| flagd

checkoutservice -->|gRPC| shippingservice
checkoutservice -->|gRPC| paymentservice
checkoutservice --->|HTTP| emailservice
checkoutservice -->|gRPC| currencyservice
checkoutservice -->|gRPC| productcatalogservice

frauddetectionservice -->|gRPC| flagd

frontend -->|gRPC| adservice
frontend -->|gRPC| cartservice
frontend -->|gRPC| checkoutservice
frontend ---->|gRPC| currencyservice
frontend ---->|gRPC| recommendationservice
frontend -->|gRPC| productcatalogservice

frontendproxy -->|gRPC| flagd
frontendproxy -->|HTTP| frontend
frontendproxy -->|HTTP| flagdui
frontendproxy -->|HTTP| imageprovider

Internet -->|HTTP| frontendproxy

loadgenerator -->|HTTP| frontendproxy

paymentservice -->|gRPC| flagd

queue -->|TCP| accountingservice
queue -->|TCP| frauddetectionservice

recommendationservice -->|gRPC| productcatalogservice
recommendationservice -->|gRPC| flagd

shippingservice -->|HTTP| quoteservice

react-native-app -->|HTTP| frontendproxy
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
subgraph Service Legend
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

Follow these links for the current state of
[metric](/docs/demo/telemetry-features/metric-coverage/) and
[trace](/docs/demo/telemetry-features/trace-coverage/) instrumentation of the
demo applications.

The collector is configured in
[otelcol-config.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config.yml),
alternative exporters can be configured here.

```mermaid
graph TB
subgraph tdf[Telemetry Data Flow]
    subgraph subgraph_padding [ ]
        style subgraph_padding fill:none,stroke:none;
        %% padding to stop the titles clashing
        subgraph od[OpenTelemetry Demo]
        ms(Microservice)
        end

        ms -.->|"OTLP<br/>gRPC"| oc-grpc
        ms -.->|"OTLP<br/>HTTP POST"| oc-http

        subgraph oc[OTel Collector]
            style oc fill:#97aef3,color:black;
            oc-grpc[/"OTLP Receiver<br/>listening on<br/>grpc://localhost:4317"/]
            oc-http[/"OTLP Receiver<br/>listening on <br/>localhost:4318<br/>"/]
            oc-proc(Processors)
            oc-prom[/"OTLP HTTP Exporter"/]
            oc-otlp[/"OTLP Exporter"/]

            oc-grpc --> oc-proc
            oc-http --> oc-proc

            oc-proc --> oc-prom
            oc-proc --> oc-otlp
        end

        oc-prom -->|"localhost:9090/api/v1/otlp"| pr-sc
        oc-otlp -->|gRPC| ja-col

        subgraph pr[Prometheus]
            style pr fill:#e75128,color:black;
            pr-sc[/"Prometheus OTLP Write Receiver"/]
            pr-tsdb[(Prometheus TSDB)]
            pr-http[/"Prometheus HTTP<br/>listening on<br/>localhost:9090"/]

            pr-sc --> pr-tsdb
            pr-tsdb --> pr-http
        end

        pr-b{{"Browser<br/>Prometheus UI"}}
        pr-http ---->|"localhost:9090/graph"| pr-b

        subgraph ja[Jaeger]
            style ja fill:#60d0e4,color:black;
            ja-col[/"Jaeger Collector<br/>listening on<br/>grpc://jaeger:4317"/]
            ja-db[(Jaeger DB)]
            ja-http[/"Jaeger HTTP<br/>listening on<br/>localhost:16686"/]

            ja-col --> ja-db
            ja-db --> ja-http
        end

        subgraph gr[Grafana]
            style gr fill:#f8b91e,color:black;
            gr-srv["Grafana Server"]
            gr-http[/"Grafana HTTP<br/>listening on<br/>localhost:3000"/]

            gr-srv --> gr-http
        end

        pr-http --> |"localhost:9090/api"| gr-srv
        ja-http --> |"localhost:16686/api"| gr-srv

        ja-b{{"Browser<br/>Jaeger UI"}}
        ja-http ---->|"localhost:16686/search"| ja-b

        gr-b{{"Browser<br/>Grafana UI"}}
        gr-http -->|"localhost:3000/dashboard"| gr-b
    end
end
```

Find the **Protocol Buffer Definitions** in the `/pb/` directory.
