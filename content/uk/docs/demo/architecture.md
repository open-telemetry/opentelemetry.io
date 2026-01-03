---
title: Архітектура Demo
linkTitle: Архітектура
aliases: [current_architecture]
body_class: otel-mermaid-max-width
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
---

**OpenTelemetry Demo** складається з мікросервісів, написаних різними мовами програмування, які взаємодіють між собою через gRPC та HTTP; і генератора навантаження, який використовує [Locust](https://locust.io/) для імітації користувацького трафіку.

```mermaid
graph TD
subgraph Service Diagram
accounting(Бухгалтерія):::dotnet
ad(Реклама):::java
cache[(Кеш<br/>&#40Valkey&#41)]
cart(Кошик):::dotnet
checkout(Оформлення замовлення):::golang
currency(Валюта):::cpp
email(Електронна пошта):::ruby
flagd(Flagd):::golang
flagd-ui(Flagd-ui):::elixir
fraud-detection(Виявлення шахрайства):::kotlin
frontend(Фронтенд):::typescript
frontend-proxy(Фронтенд проксі <br/>&#40Envoy&#41):::cpp
image-provider(Постачальник зображень <br/>&#40nginx&#41):::cpp
llm(LLM):::python
load-generator([Генератор навантаження]):::python
payment(Платежі):::javascript
product-catalog(Каталог товарів):::golang
product-reviews(Відгуки<br/>про товари):::python
quote(Котирування):::php
recommendation(Рекомендації):::python
shipping(Доставка):::rust
queue[(черга<br/>&#40Kafka&#41)]:::java
react-native-app(Застосунок React Native):::typescript
postgresql[(Database<br/>&#40PostgreSQL&#41)]

accounting ---> postgresql

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
frontend -->|gRPC| product-reviews

frontend-proxy -->|gRPC| flagd
frontend-proxy -->|HTTP| frontend
frontend-proxy -->|HTTP| flagd-ui
frontend-proxy -->|HTTP| image-provider

llm -->|gRPC| flagd
llm ---> product-reviews

payment -->|gRPC| flagd

product-reviews -->|gRPC| flagd
product-reviews -->|gRPC| product-catalog
product-reviews -->|gRPC| llm
product-reviews ---> postgresql

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
classDef elixir fill:#b294bb,color:black;
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
graph LR
subgraph Service Legend
  dotnetsvc(.NET):::dotnet
  cppsvc(C++):::cpp
  elixirsvc(Elixir):::elixir
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
classDef elixir fill:#b294bb,color:black;
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

Перейдіть за цими посиланнями, щоб дізнатися про поточний стан [логів](/docs/demo/telemetry-features/log-coverage/), [метрик](/docs/demo/telemetry-features/metric-coverage/) та [трасування](/docs/demo/telemetry-features/trace-coverage/) інструментування демонстраційних застосунків.

Колектор налаштований в [otelcol-config.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config.yml), альтернативні експортери можна налаштувати тут.

```mermaid
graph TB
subgraph tdf[Потік Даних Телеметрії]
    subgraph subgraph_padding [ ]
        style subgraph_padding fill:none,stroke:none;
        %% padding to stop the titles clashing
        subgraph od[OpenTelemetry Demo]
        ms(Мікросервіс)
        end

        ms -.->|"OTLP<br/>gRPC"| oc-grpc
        ms -.->|"OTLP<br/>HTTP POST"| oc-http

        subgraph oc[OTel Collector]
            style oc fill:#97aef3,color:black;
            oc-grpc[/"OTLP Приймач<br/>слухає на<br/>grpc://localhost:4317"/]
            oc-http[/"OTLP Приймач<br/>слухає на <br/>localhost:4318<br/>"/]
            oc-proc(Процесори)
            oc-spanmetrics[/"Конектор метрик відрізків"/]
            oc-prom[/"OTLP HTTP Експортер"/]
            oc-otlp[/"OTLP Експортер"/]
            oc-opensearch[/"OpenSearch Експортер"/]

            oc-grpc --> oc-proc
            oc-http --> oc-proc

            oc-proc --> oc-prom
            oc-proc --> oc-otlp
            oc-proc --> oc-opensearch
            oc-proc --> oc-spanmetrics
            oc-spanmetrics --> oc-prom

        end

        oc-prom -->|"localhost:9090/api/v1/otlp"| pr-sc
        oc-otlp -->|gRPC| ja-col
        oc-opensearch -->|HTTP| os-http

        subgraph pr[Prometheus]
            style pr fill:#e75128,color:black;
            pr-sc[/"Prometheus OTLP Приймач"/]
            pr-tsdb[(Prometheus TSDB)]
            pr-http[/"Prometheus HTTP<br/>слухає на<br/>localhost:9090"/]

            pr-sc --> pr-tsdb
            pr-tsdb --> pr-http
        end

        pr-b{{"Оглядач<br/>Prometheus UI"}}
        pr-http ---->|"localhost:9090/graph"| pr-b

        subgraph ja[Jaeger]
            style ja fill:#60d0e4,color:black;
            ja-col[/"Jaeger Приймач<br/>слухає на<br/>grpc://jaeger:4317"/]
            ja-db[(Jaeger DB)]
            ja-http[/"Jaeger HTTP<br/>слухає на<br/>localhost:16686"/]

            ja-col --> ja-db
            ja-db --> ja-http
        end

        subgraph os[OpenSearch]
            style os fill:#005eb8,color:black;
            os-http[/"OpenSearch<br/>listening on<br/>localhost:9200"/]
            os-db[(OpenSearch Index)]

            os-http ---> os-db
        end

        subgraph gr[Grafana]
            style gr fill:#f8b91e,color:black;
            gr-srv["Сервер Grafana"]
            gr-http[/"Grafana HTTP<br/>слухає на<br/>localhost:3000"/]

            gr-srv --> gr-http
        end

        pr-http --> |"localhost:9090/api"| gr-srv
        ja-http --> |"localhost:16686/api"| gr-srv
        os-http --> |"localhost:9200/api"| gr-srv

        ja-b{{"Оглядач<br/>Jaeger UI"}}
        ja-http ---->|"localhost:16686/search"| ja-b

        gr-b{{"Оглядач<br/>Grafana UI"}}
        gr-http -->|"localhost:3000/dashboard"| gr-b
    end
end
```

Дивіться **Визначення Протокольних Буферів** у теці `/pb/`.
